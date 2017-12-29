<?php
	define("NOAUTH", false);
	ini_set('memory_limit','100M');
	set_time_limit(0);
	
	require_once '../../redcap_connect.php';

	$lang = mysqli_real_escape_string($conn, $_GET['id']);
	$pid = mysqli_real_escape_string($conn, $_GET['pid']);
	
	//language
	$query = "SELECT element_enum, element_type, element_validation_type FROM redcap_metadata
		WHERE project_id = " . $pid . " 
		AND field_name LIKE 'languages'";
	$result = mysqli_query($conn, $query);
	$row = mysqli_fetch_array($result);
		
	$tmp = explode(' \n ', $row['element_enum']);
	foreach($tmp AS $key => $value){
		$tmp2 = explode(',', $value);
		if($tmp2[0] == $lang){
			$response['language'] = trim($tmp2[1]);
			break;
		}
	}
	
	//translations
	$query = "SELECT field_name, element_type, misc, grid_name, element_validation_type, element_label FROM redcap_metadata 
		WHERE project_id = " . $pid . " AND field_name NOT LIKE 'survey_text%' ORDER BY field_order";
	$result = mysqli_query($conn, $query);

	while($row = mysqli_fetch_array($result)){
		$misc = explode(PHP_EOL, $row['misc']);

		foreach($misc AS $key => $value){
			//questions
			if(strpos($value, '@p1000lang') !== false){
				$value = str_replace('@p1000lang', '', $value);
				$value = json_decode($value, true);
				foreach($value AS $key2 => $trans){
					if($key2 == $response['language']){
						$response['questions'][$row['field_name']]['text'] = $trans;
						if(strpos($row['element_validation_type'], 'date') !== false){
							$response['questions'][$row['field_name']]['type'] = 'date';
						}
						else{
							$response['questions'][$row['field_name']]['type'] = $row['element_type'];
						}
						$response['questions'][$row['field_name']]['matrix'] = $row['grid_name'];
					}
				}
			}
			//answers
			elseif(strpos($value, '@p1000answers') !== false){
				$value = str_replace('@p1000answers', '', $value);
				$value = json_decode($value, true);
				foreach($value AS $key2 => $trans){
					if($key2 == $response['language']){
						$response['answers'][$row['field_name']]['text'] = $trans;
						if(strpos($row['element_validation_type'], 'date') !== false){
							$response['answers'][$row['field_name']]['type'] = 'date';
						}
						elseif(strpos($row['element_validation_type'], 'signature') !== false){
							$response['answers'][$row['field_name']]['type'] = 'signature';
						}
						else{
							$response['answers'][$row['field_name']]['type'] = $row['element_type'];
						}
						$response['answers'][$row['field_name']]['matrix'] = $row['grid_name'];
					}
				}
			}
		}
		
		//non translated fields
		if(!isset($response['questions'][$row['field_name']])){
			$response['questions'][$row['field_name']]['text'] = $row['element_label'];
			$response['questions'][$row['field_name']]['type'] = 'text';
		}
	}

	//header
	//$data = '"record_id",';
	foreach($response['questions'] AS $field_name => $values){
		if($values['type'] == 'checkbox'){
			foreach($response['answers'][$field_name]['text'] AS $key => $text){
				$data .= '"' . strip_tags($values['text']) . ': ' . $text . '",';
			}
		}
		else{
			$data .= '"' . strip_tags($values['text']) . '",';
		}
	}
	$data .= "\r\n";
	
	//data
	$query = "SELECT record, field_name, instance, value FROM redcap_data WHERE project_id = " . $pid . " ORDER BY record";
	$result = mysqli_query($conn, $query);
	
	while($row = mysqli_fetch_array($result)){
		if($response['questions'][$row['field_name']]['type'] == 'checkbox'){
			$myData[$row['record']][($row['instance'] == null ? 1 : $row['instance'])][$row['field_name'] . '___' . $row['value']] = 1;
		}
		else{
			$myData[$row['record']][($row['instance'] == null ? 1 : $row['instance'])][$row['field_name']] = $row['value'];
		}
	}

	//format
	foreach($myData AS $record => $values){
		foreach($values AS $instance => $vals){
			//$data .= '"' . $record . '",';
			foreach($response['questions'] AS $field_name => $vars){
				if($vars['type'] == 'checkbox'){
					foreach($response['answers'][$field_name]['text'] AS $key => $text){
						$data .= '"' . $myData[$record][$instance][$field_name . '___' . $key] . '",';
					}
				}
				elseif(in_array($response['answers'][$field_name]['type'], array('radio','select','yesno','truefalse'))){
					$data .= '"' . $response['answers'][$field_name]['text'][$myData[$record][$instance][$field_name]] . '",';
				}
				else{
					$data .= '"' . $myData[$record][$instance][$field_name] . '",';
				}
			}
			$data .= "\r\n";
		}
	}
	
	//export
	header("Content-type: text/csv");
	header("Content-Disposition: attachment; filename=\"" . REDCap::getProjectTitle() . " DATA (" . $response['language'] . ") " . date('Y-m-d Hi') . ".csv\"");
	header("Pragma: no-cache");
	header("Expires: 0");

	echo $data;
?>