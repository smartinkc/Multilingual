<?php
	namespace CMH\Multilingual;
	
	use ExternalModules\AbstractExternalModule;
	use ExternalModules\ExternalModules;

	$data = @$_POST['data'];
	if(isset($data) && $data != ''){
		$data = json_decode($data, true);
		if ($data['action'] == 'SAVE_SURVEY_SETTINGS' && $data['payload']) {
			carl_log("saving survey settings:\n" . print_r($data, true));
			$module->saveSurveySettings($data['payload']);
		} else if ($data['action'] == 'GET_SURVEY_SETTINGS') {
			$module->getSurveySettings($data);
		}

		switch($data['todo']){
			case 1:
				$module->getTranslations($data, $module->getProjectSettings());
				break;
			case 2:
				$module->getAnswers($data);
				break;
			case 3:
				$module->getSettings($data);
				break;
			case 4:
				$module->getSavedLang($data);
				break;
			default:
				exit;
		}
	}
	elseif($_GET['todo'] == 2){
		$module->exportData($_GET['pid'], $_GET['lang']);
	} 
	
	elseif ($iso_code = $_GET['translate_settings_iso_code']) {
		$response = new \stdClass();
		
		/* NEVER DO THE FOLLOWING -- UNSAFE AGAINST PATH TRAVERSAL ATTACKS */
		// $translations_filepath = $module->getModulePath() . "/def_translations/$iso_code.txt";
		
		/* getSafePath PREVENTS PATH TRAVERSAL ATTACKS */
		$translations_filepath = $module->getSafePath("/def_translations/$iso_code.txt");
		
		if (!file_exists($translations_filepath)) {
			$response->error = "Couldn't find translations for language with ISO code $iso_code";
		} else {
			$file_contents = file_get_contents($translations_filepath);
			$translations = [];
			$file_lines = preg_split('/\n|\r\n?/', $file_contents);
			foreach ($file_lines as $i => $line) {
				$translations[$i] = $line;
			}
			if (!empty($translations)) {
				$response->success = true;
				$response->translations = $translations;
			}
		}
		header('Content-Type: application/json; charset=UTF-8');
		exit(json_encode($response));
	}
	
	else{
		header("HTTP/1.0 404 Not Found");
	}
?>
