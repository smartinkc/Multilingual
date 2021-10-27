<?php
	//currently js adds download links to a specific Data Entry Form as we test

	namespace CMH\Multilingual;
	
	use ExternalModules\AbstractExternalModule;
	use ExternalModules\ExternalModules;
	
	function getName($n) { 
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
		$randomString = ''; 
	  
		for ($i = 0; $i < $n; $i++) { 
			$index = rand(0, strlen($characters) - 1); 
			$randomString .= $characters[$index]; 
		} 
	  
		return $randomString; 
	} 
	
	//language choices
	$languages = $module->getLanguages(intval($_GET['pid']));
	$language = $languages[intval($_GET['langIndex'])];
	
	//encoding
	$encodingLanguage = $module->getProjectSetting('encoding-language', intval($_GET['pid']));
	$encoding = $module->getProjectSetting('encoding-type', intval($_GET['pid']));
	$languageTitles = $module->getProjectSetting('pdf-title', intval($_GET['pid']));
	
	$pdf_encoding = '';
	$pdf_title = '';
	foreach($encodingLanguage AS $key => $value){
		if($value == $language){
			$pdf_encoding = $encoding[$key];
			$pdf_title = $languageTitles[$key];
		}
	}
	
	//translations
	$vars = array('todo' => 1, 'lang' => $language, 'project_id' => intval($_GET['pid']), 'record_id' => $_GET['id'], 'page' => $_GET['form']);
	ob_start();
	$module->getTranslations($vars, $module->getProjectSettings());
	$translations = json_decode(ob_get_clean(), true);
	ob_end_clean();
	
	//get metadata
	$metadata = $module->getMetaData(intval(intval($_GET['pid'])), $_GET['form']);

	//replace labels and element_enum with translations
	foreach($metadata AS $key => $values){
		//remove PDF-HIDDEN
		if(strpos($values['misc'], '@PDF-HIDDEN') !== false || strpos($values['misc'], '@HIDDEN-PDF') !== false){
			unset($metadata[$key]);
			continue;
		}
		//remove record_id
		elseif($values['field_order'] == 1){
			unset($metadata[$key]);
			continue;
		}
		//remove _complete variables
		elseif(substr($values['field_name'], -9) == '_complete'){
			unset($metadata[$key]);
			continue;
		}
		
		if($translations['questions'][$values['field_name']]['text']){
			$metadata[$key]['element_label'] = strip_tags($translations['questions'][$values['field_name']]['text']);
		}
		
		if($translations['answers'][$values['field_name']]['text']){
			$element_enum = null;
			foreach($translations['answers'][$values['field_name']]['text'] AS $k => $v){
				$element_enum .= $k . ', ' . $v . ' \n ';
			}
			
			$metadata[$key]['element_enum'] = rtrim($element_enum, ' \n ');
		}
	}
	
	/* if(!empty($metadata[0]) && $_GET['form'] != ''){
		$metadata[1] = $metadata[0];
	}
	elseif(!$_GET['form']){
		$metadata[0] = $metadata[1];
	} */
	
	//generate unique name for files
	$random = getName(10);
	
	//save metadata to file
	file_put_contents(APP_PATH_DOCROOT."PDF".DS."$random.json", json_encode($metadata));
	
	//split up PDF/index.php file and add details
	$pdfFile = file_get_contents(APP_PATH_DOCROOT."PDF".DS."index.php");
	$pdfFile = explode('// Render the PDF', $pdfFile);

	$t = explode('// If a survey response, get record, event, form instance', $pdfFile[0]);
	$newFile = "<?php";
	$newFile .= $t[0];
	$newFile .= '$project_encoding = "' . $pdf_encoding . '";'. "\r\n";
	$newFile .= $t[1];
	$newFile .= '$app_title = "' . $pdf_title . '";' . "\r\n";
	$newFile .= '$metadata = json_decode(file_get_contents(\'' . APP_PATH_DOCROOT."PDF".DS."$random.json" . '\'), true);' . "\r\n";

	if($pdf_title == ''){$pdf_title = 'Multilingual';}
	if($_GET['display'] == 1){
		$newFile .= 'header("Content-type:application/pdf");'. "\r\n";
	}
	else{
		$newFile .= 'header("Content-type:application/pdf");'. "\r\n";
		$newFile .= 'header("Content-Disposition:attachment; filename=' . $pdf_title . '.pdf");' . "\r\n";
	}
	
	$newFile .= "// Render the PDF\r\n";
	$newFile .= $pdfFile[1] . "\r\n";
	$newFile .= "?>\r\n";
	
	//delete files
	$newFile .= "unlink('".APP_PATH_DOCROOT."PDF".DS."index_multilingual_$random.php"."');\r\n";
	$newFile .= "unlink('".APP_PATH_DOCROOT."PDF".DS."$random.json"."');\r\n";
	
	file_put_contents(APP_PATH_DOCROOT."PDF".DS."index_multilingual_$random.php", $newFile);
	chmod(775, APP_PATH_DOCROOT."PDF".DS."index_multilingual_$random.php");

	header('Location:' . APP_PATH_WEBROOT . "PDF" . DS . "index_multilingual_$random.php?pid=" . intval($_GET['pid']) . (isset($_GET['form']) ? "&page=" . $_GET['form'] : '') . "&id=" . $_GET['id'] . (isset($_GET['event_id']) ? "&event_id=" . $_GET['event_id'] : '') . (isset($_GET['instance']) && $_GET['instance'] > 1 ? "&instance=" . $_GET['instance'] : '')); 
?>
