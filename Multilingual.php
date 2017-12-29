<?php 
namespace CMH\Multilingual;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class Multilingual extends AbstractExternalModule
{
	function redcap_survey_page($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl(''), file_get_contents($this->getModulePath() . 'js/multilingual_survey.js')) . '</script>';
		echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
	}
	
	function redcap_survey_complete($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl(''), file_get_contents($this->getModulePath() . 'js/multilingual_survey_complete.js')) . '</script>';
	}
	
	function redcap_data_entry_form($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl(''), file_get_contents($this->getModulePath() . 'js/multilingual.js')) . '</script>';
		echo '<link rel="stylesheet" type="text/css" href="' . $this->getUrl('css/multilingual.css') . '">';
	}
	
	function redcap_every_page_top($project_id){
		if(strpos($_SERVER['REQUEST_URI'], 'online_designer.php') !== false && isset($_GET['page'])){
			echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
			echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl(''), file_get_contents($this->getModulePath() . 'js/multilingual_setup.js')) . '</script>';
		}
		elseif(strpos($_SERVER['REQUEST_URI'], 'DataExport/index.php') !== false){
			echo '<script type="text/javascript">' . str_replace('REDCAP_AJAX_URL', $this->getUrl(''), file_get_contents($this->getModulePath() . 'js/multilingual_export.js')) . '</script>';
		}
	}
}
?>