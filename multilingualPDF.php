<?php
	//currently js adds download links to a specific Data Entry Form as we test

	namespace CMH\Multilingual;
	
	use ExternalModules\AbstractExternalModule;
	use ExternalModules\ExternalModules;
	
	define("NOAUTH", true);
	require APP_PATH_DOCROOT . '/Config/init_project.php';
	define("FPDF_FONTPATH",   APP_PATH_WEBTOOLS . "pdf" . DS . "font" . DS);
	define("_SYSTEM_TTFONTS", APP_PATH_WEBTOOLS . "pdf" . DS . "font" . DS);
	define("USE_UTF8", true);
	
	require APP_PATH_DOCROOT . 'PDF/functions.php';
	define("DEID_TEXT", "[*DATA REMOVED*]");
	
	//initialize
	$metadata = array();
	$acknowledgement = array();
	$app_title = 'TEST';
	$Data = array();
	$filename = 'test.pdf';
	
	//language choices
	$languages = $module->getLanguages($_GET['pid']);
	$language = $languages[$_GET['langIndex']];
	
	//encoding
	$encodingLanguage = $module->getProjectSetting('encoding-language', $_GET['pid']);
	$encoding = $module->getProjectSetting('encoding-type', $_GET['pid']);
	$languageTitles = $module->getProjectSetting('pdf-title', $_GET['pid']);
	
	$pdf_encoding = '';
	$pdf_title = '';
	foreach($encodingLanguage AS $key => $value){
		if($value == $language){
			$pdf_encoding = $encoding[$key];
			$pdf_title = $languageTitles[$key];
		}
	}
	
	//chinese
	if($pdf_encoding == 'chinese_utf8_traditional' || $pdf_encoding == 'chinese_utf8'){
		require_once APP_PATH_LIBRARIES . "PDF_Unicode.php";
	}
	//japanese
	elseif($pdf_encoding == 'japanese_sjis'){
		require_once APP_PATH_LIBRARIES . "MBFPDF.php";
	}
	else{
		require APP_PATH_LIBRARIES . 'tFPDF.php';
	}
	$GLOBALS['project_encoding'] = $pdf_encoding;
	
	//translations
	$vars = array('todo' => 1, 'lang' => $language, 'project_id' => $_GET['pid'], 'record_id' => $_GET['id'], 'page' => $_GET['form']);
	ob_start();
	$module->getTranslations($vars, $module->getProjectSettings());
	$translations = json_decode(ob_get_clean(), true);
	ob_end_clean();
	
	//get metadata
	$metadata = $module->getMetaData($_GET['pid'], $_GET['form']);

	//replace labels and element_enum with translations
	foreach($metadata AS $key => $values){
		//remove PDF-HIDDEN
		if(strpos($values['misc'], '@PDF-HIDDEN') !== false){
			unset($metadata[$key]);
			continue;
		}
		
		if($translations['questions'][$values['field_name']]['text']){
			$metadata[$key]['element_label'] = $translations['questions'][$values['field_name']]['text'];
		}
		
		if($translations['answers'][$values['field_name']]['text']){
			$element_enum = null;
			foreach($translations['answers'][$values['field_name']]['text'] AS $k => $v){
				$element_enum .= $k . ', ' . $v . ' \n ';
			}
			
			$metadata[$key]['element_enum'] = rtrim($element_enum, ' \n ');
		}
	}

	//get record data
	$Data = $module->getData($_GET['pid'], $_GET['id']);
	
	// Render the PDF
	header("Content-type:application/pdf");
	header("Content-Disposition:attachment; filename={$filename}");
	renderPDF($metadata, $acknowledgement, strip_tags($pdf_title), $Data, isset($_GET['compact']));
?>