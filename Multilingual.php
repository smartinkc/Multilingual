<?php 
namespace CMH\Multilingual;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class Multilingual extends AbstractExternalModule
{
	function redcap_survey_page($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php",true), file_get_contents($this->getModulePath() . 'js/multilingual_survey.js')) . '</script>';
		echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
	}
	
	function redcap_survey_complete($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php",true), file_get_contents($this->getModulePath() . 'js/multilingual_survey_complete.js')) . '</script>';
	}
	
	function redcap_data_entry_form($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php",true), file_get_contents($this->getModulePath() . 'js/multilingual.js')) . '</script>';
		echo '<link rel="stylesheet" type="text/css" href="' . $this->getUrl('css/multilingual.css') . '">';
	}
	
	function redcap_every_page_top($project_id){
		if(strpos($_SERVER['REQUEST_URI'], 'online_designer.php') !== false && isset($_GET['page'])){
			echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
			echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php",true), file_get_contents($this->getModulePath() . 'js/multilingual_setup.js')) . '</script>';
		}
		elseif(strpos($_SERVER['REQUEST_URI'], 'DataExport/index.php') !== false){
			echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php",true), file_get_contents($this->getModulePath() . 'js/multilingual_export.js')) . '</script>';
		}
	}
	
	public function getAnswers($data){
		global $conn;
		
		$data['project_id'] = mysqli_real_escape_string($conn, $data['project_id']);
		$data['field_name'] = mysqli_real_escape_string($conn, $data['field_name']);
		
		if($data['matrix'] == 1){
			$query = "SELECT element_enum, element_type, element_validation_type FROM redcap_metadata
				WHERE project_id = " . $data['project_id'] . " 
				AND grid_name LIKE '" . $data['field_name'] . "'
				LIMIT 1";
		}
		else{
			$query = "SELECT element_enum, element_type, element_validation_type FROM redcap_metadata
				WHERE project_id = " . $data['project_id'] . " 
				AND field_name LIKE '" . $data['field_name'] . "'";
		}
		$result = mysqli_query($conn, $query);
		
		$row = mysqli_fetch_array($result);
			
		$tmp = explode(' \n ', $row['element_enum']);
		foreach($tmp AS $key => $value){
			$tmp2 = explode(',', $value);
			$response[trim($tmp2[0])] = trim($tmp2[1]);
		}
		
		if($row['element_type'] == 'text' && strpos($row['element_validation_type'], 'date') !== false){
			$response = null;
			$response['0'] = 'Answer';
		}
		elseif($row['element_type'] == 'file' && strpos($row['element_validation_type'], 'signature') !== false){
			$response = null;
			$response['0'] = 'Answer';
		}
		elseif($row['element_type'] == 'file' && $row['element_validation_type'] == null){
			$response = null;
			$response['0'] = 'Answer';
		}
		elseif($row['element_type'] == 'calc'){
			$response = null;
			$response[""] = "";
		}
		elseif($row['element_type'] == 'yesno'){
			$response = null;
			$response['0'] = "No";
			$response['1'] = "Yes";
		}
		elseif($row['element_type'] == 'truefalse'){
			$response = null;
			$response['0'] = "False";
			$response['1'] = "True";
		}
		
		header('Content-Type: application/json');
		echo json_encode($response);
	}
	
	public function getTranslations($data){
		global $conn;
		$layout_set = 0;
		
		$data['project_id'] = mysqli_real_escape_string($conn, $data['project_id']);
		$data['page'] = mysqli_real_escape_string($conn, $data['page']);
		
		$query = "SELECT field_name, element_type, misc, grid_name, element_validation_type, element_label FROM redcap_metadata 
			WHERE project_id = " . $data['project_id'] . " 
				AND (form_name LIKE '" . $data['page'] . "' OR field_name LIKE 'survey_text_" . $data['page'] . "')";
		$result = mysqli_query($conn, $query);

		while($row = mysqli_fetch_array($result)){
			//default questions
			$response['defaults'][$row['field_name']] = strip_tags($row['element_label']);
			
			$misc = explode("\n", $row['misc']);
			$response['all'][$row['field_name']] = $misc;
			foreach($misc AS $key => $value){
				//questions
				if(strpos($value, '@p1000lang') !== false){
					$value = str_replace('@p1000lang', '', $value);
					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
							$response['questions'][$row['field_name']]['text'] = $trans;
							if(strpos($row['element_validation_type'], 'date') !== false){
								$response['questions'][$row['field_name']]['type'] = 'date';
							}
							else{
								$response['questions'][$row['field_name']]['type'] = $row['element_type'];
							}
							$response['questions'][$row['field_name']]['matrix'] = $row['grid_name'];
						
							//layout
							if($layout_set == 0){
								if(\CMH\Multilingual\Multilingual::is_arabic($trans) === true){
									$response['layout'] = 'rtl';
								}
								else{
									$response['layout'] = 'ltr';
								}
								$layout_set = 1;
							}
						}
					}
				}
				//answers
				elseif(strpos($value, '@p1000answers') !== false){
					$value = str_replace('@p1000answers', '', $value);
					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
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
				//errors
				elseif(strpos($value, '@p1000errors') !== false){
					$value = str_replace('@p1000errors', '', $value);
					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
							$response['errors'][$row['field_name']]['text'] = $trans;
							if(strpos($row['element_validation_type'], 'date') !== false){
								$response['errors'][$row['field_name']]['type'] = 'date';
							}
							else{
								$response['errors'][$row['field_name']]['type'] = $row['element_type'];
							}
							$response['errors'][$row['field_name']]['matrix'] = $row['grid_name'];
						}
					}
				}
				//survey tranlations
				elseif(strpos($value, '@p1000surveytext') !== false){
					$value = str_replace('@p1000surveytext', '', $value);
					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
							foreach($trans AS $survey_id => $survey_text){
								$response['surveytext'][$survey_id] = $survey_text;
							}
						}
					}
				}
			}
		}
		
		header('Content-Type: application/json');
		echo json_encode($response);
	}

	//copied from php.net
	public function uniord($u) {
		// i just copied this function fron the php.net comments, but it should work fine!
		$k = mb_convert_encoding($u, 'UCS-2LE', 'UTF-8');
		$k1 = ord(substr($k, 0, 1));
		$k2 = ord(substr($k, 1, 1));
		return $k2 * 256 + $k1;
	}
	//copied from stackoverflow
	public function is_arabic($str) {
		if(mb_detect_encoding($str) !== 'UTF-8') {
			$str = mb_convert_encoding($str,mb_detect_encoding($str),'UTF-8');
		}

		/*
		$str = str_split($str); <- this function is not mb safe, it splits by bytes, not characters. we cannot use it
		$str = preg_split('//u',$str); <- this function woulrd probably work fine but there was a bug reported in some php version so it pslits by bytes and not chars as well
		*/
		preg_match_all('/.|\n/u', $str, $matches);
		$chars = $matches[0];
		$arabic_count = 0;
		$latin_count = 0;
		$total_count = 0;
		foreach($chars as $char) {
			//$pos = ord($char); we cant use that, its not binary safe 
			$pos = \CMH\Multilingual\Multilingual::uniord($char);
			//echo $char ." --> ".$pos.PHP_EOL;

			if($pos >= 1536 && $pos <= 1791) {
				$arabic_count++;
			} else if($pos > 123 && $pos < 123) {
				$latin_count++;
			}
			$total_count++;
		}
		if(($arabic_count/$total_count) > 0.6) {
			// 60% arabic chars, its probably arabic
			return true;
		}
		return false;
	}
	
	public function exportData($pid, $lang){
		global $conn;
		
		ini_set('memory_limit','100M');
		set_time_limit(0);
		
		$lang = mysqli_real_escape_string($conn, $lang);
		$pid = mysqli_real_escape_string($conn, $pid);
		
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
		header("Content-Disposition: attachment; filename=\"Multilingual" . ''/*\REDCap::getProjectTitle($pid)*/ . " DATA (" . $response['language'] . ") " . date('Y-m-d Hi') . ".csv\"");
		header("Pragma: no-cache");
		header("Expires: 0");

		echo $data;
	}
}
?>