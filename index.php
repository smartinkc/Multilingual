<?php
	namespace CMH\Multilingual;
	
	use ExternalModules\AbstractExternalModule;
	use ExternalModules\ExternalModules;

	$data = @$_POST['data'];

	if(isset($data) && $data != ''){
		$data = json_decode($data, true);

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
			default:
				exit;
		}
	}
	elseif($_GET['todo'] == 2){
		$module->exportData($_GET['pid'], $_GET['lang']);
	} 

	else{
		header("HTTP/1.0 404 Not Found");
	}
?>
