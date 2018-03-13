<?php
	$data = @$_POST['data'];

	if(isset($data) && $data != ''){
		$data = json_decode($data, true);
		
		switch($data['todo']){
			case 1:
				\CMH\Multilingual\Multilingual::getTranslations($data);
				break;
			case 2:
				\CMH\Multilingual\Multilingual::getAnswers($data);
				break;
			case 3:
				$tmp = new \CMH\Multilingual\Multilingual();
				$tmp->getSettings($data);
				break;
			default:
				exit;
		}
	}
	elseif($_GET['todo'] == 2){
		\CMH\Multilingual\Multilingual::exportData($_GET['pid'], $_GET['lang']);
	}
	else{
		header("HTTP/1.0 404 Not Found");
	}
?>
