<?php
namespace CMH\Multilingual;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;
use \Piping as Piping;
use REDCap;

class Multilingual extends AbstractExternalModule
{
	public $translate_answer_field_types = [
		"select",
		"radio",
		"checkbox",
		"yesno",
		"truefalse",
		"slider"
	];
	
	function redcap_survey_page($project_id, $record, $instrument, $event_id, $group_id, $survey_hash, $response_id, $repeat_instance){
		$api_endpoint = $this->getProjectSetting('use-api-endpoint', $project_id);
		
		// add multilingual_survey.js after making text replacements
		$redcap_survey_javascript = file_get_contents($this->getModulePath() . 'js/multilingual_survey.js');
		$redcap_survey_javascript = str_replace('REDCAP_PDF_URL', ($this->getProjectSetting('multilingual-econsent', $project_id) ? $this->getUrl("multilingualPDF.php", true, ($api_endpoint == true ? true : false)) : 'false') . '&id=' . $record . '&form=' . $instrument . '&event_id=' . $event_id . '&instance=' . $repeat_instance, $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('APP_PATH_IMAGES', APP_PATH_IMAGES, $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('REDCAP_INSTRUMENT_NAME', $instrument, $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('MULTILINGUAL_RECORD_ID', $record, $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true, ($api_endpoint == true ? true : false)), $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('MULTILINGUAL_LANGUAGE_SELECTED_URL', $this->getUrl('languageSelected.php'), $redcap_survey_javascript);
		$redcap_survey_javascript = str_replace('MULTILINGUAL_SURVEY_EVENT', $event_id, $redcap_survey_javascript);
		
		// see if pdf translation is configured or not -- set variable in multilingual_survey.js
		if ($this->getProjectSetting("translate_pdfs_instruments")) {
			$redcap_survey_javascript = str_replace('MULTILINGUAL_PDF_TRANSLATION_ENABLED', 'true', $redcap_survey_javascript);
		} else {
			$redcap_survey_javascript = str_replace('MULTILINGUAL_PDF_TRANSLATION_ENABLED', 'false', $redcap_survey_javascript);
		}
		
		echo "<script type='text/javascript'>$redcap_survey_javascript</script>"; 
		echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css', true, $api_endpoint == true) . '">';
	}

	function redcap_survey_complete($project_id, $record, $instrument, $event_id, $group_id, $survey_hash, $response_id, $repeat_instance){
		$api_endpoint = $this->getProjectSetting('use-api-endpoint', $project_id);
		// Update and add multilingual_survey_complete
		echo '<script type="text/javascript">' . str_replace('REDCAP_PDF_URL', ($this->getProjectSetting('multilingual-econsent', $project_id) ? $this->getUrl("multilingualPDF.php", true, ($api_endpoint == true ? true : false)) : 'false') . '&id=' . $record . '&form=' . $instrument . '&event_id=' . $event_id . '&instance=' . $repeat_instance , str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true, ($api_endpoint == true ? true : false)), file_get_contents($this->getModulePath() . 'js/multilingual_survey_complete.js')))) . '</script>';
	}

	function redcap_data_entry_form($project_id, $record, $instrument){
		echo '<script type="text/javascript">' . str_replace('APP_PATH_IMAGES', APP_PATH_IMAGES, str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true), file_get_contents($this->getModulePath() . 'js/multilingual.js')))) . '</script>';
		echo '<link rel="stylesheet" type="text/css" href="' . $this->getUrl('css/multilingual.css') . '">';
	}
	
	function redcap_pdf($project_id, $metadata, $data, $instrument, $record, $event_id, $instance) {
		// delay execution of this module to allow multi-consent-signature module to do it's thing
		if ($this->delayModuleExecution()) {
			return;
		}
		
		// get which languages were selected for which instruments by the user as they were taking surveys
		$user_langs = $this->getUserSelectedLanguages($record);
		
		if (empty($user_langs)) {
			// user never selected a lang, do no translations
			return array('metadata'=>$metadata, 'data'=>$data);
		}
		
		// log to project event table
		$action_description = "Translating Generated PDF";
		$changes_made = "The Multilingual module will translate field labels (for each instrument) based on language selections the user made in survey(s).";
		\REDCap::logEvent($action_description, $changes_made, null, $record_id, $event_id);
		
		// translate metadata using user selected languages
		global $Proj;
		$translated_metadata = $this->translatePDF($metadata, $user_langs);
		
		return array('metadata'=>$translated_metadata, 'data'=>$data);
	}

	function redcap_every_page_top($project_id){
		$api_endpoint = $this->getProjectSetting('use-api-endpoint', $project_id);
		$at_survey_settings = strpos($_SERVER['REQUEST_URI'], 'Surveys/edit_info.php') !== false || strpos($_SERVER['REQUEST_URI'], 'Surveys/create_survey.php') !== false;
		
		//$user_rights = REDCap::getUserRights();
		//echo json_encode($user_rights);
		
		if(strpos($_SERVER['REQUEST_URI'], 'online_designer.php') !== false && isset($_GET['page'])){
			echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
			echo '<script type="text/javascript">' . str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true), file_get_contents($this->getModulePath() . 'js/multilingual_setup.js'))) . '</script>';
		}
		elseif(strpos($_SERVER['REQUEST_URI'], 'DataExport/index.php') !== false){
			echo '<script type="text/javascript">' . str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true), file_get_contents($this->getModulePath() . 'js/multilingual_export.js'))) . '</script>';
		}
		elseif((isset($_GET['__return']) && $_GET['__return'] == 1) or (isset($_GET['s']) && !isset($_GET['__page__']))){
			$instrument = $_GET['page'];
			echo '<script type="text/javascript">' . 
			str_replace('APP_PATH_IMAGES', APP_PATH_IMAGES, 
			str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), 
			str_replace('REDCAP_INSTRUMENT_NAME', $instrument, 
			str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true, ($api_endpoint == true ? true : false)), 
			file_get_contents($this->getModulePath() . 'js/multilingual_survey_return.js'))))) . '</script>';
			
			echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css', true, ($api_endpoint == true ? true : false)) . '">';
		}
		elseif(strpos($_SERVER['REQUEST_URI'], 'DataEntry/index.php') !== false || strpos($_SERVER['REQUEST_URI'], 'DataEntry/record_home.php') !== false){
			echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
			echo '<script type="text/javascript">' . str_replace('PDF_URL', $this->getUrl("multilingualPDF.php", true), str_replace('APP_PATH_IMAGES', APP_PATH_IMAGES, str_replace('REDCAP_LANGUAGE_VARIABLE', $this->languageVariable($project_id), str_replace('REDCAP_AJAX_URL', $this->getUrl("index.php", true), file_get_contents($this->getModulePath() . 'js/multilingual_pdf.js'))))) . '</script>';
		}
		elseif($at_survey_settings && isset($_GET['page'])){
			$index_url = $this->getUrl("index.php", true, ($api_endpoint == true ? true : false));
			$language_var = $this->languageVariable($project_id);
			$stylesheet = '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/multilingual.css') . '">';
			$ml_survey_settings_js = '<script type="text/javascript">' . file_get_contents($this->getUrl('js/multilingual_survey_settings.js')) . '</script>';
			$ml_survey_settings_js = str_replace('REDCAP_AJAX_URL', $index_url, $ml_survey_settings_js);
			$ml_survey_settings_js = str_replace('REDCAP_LANGUAGE_VARIABLE', $language_var, $ml_survey_settings_js);
			
			echo $stylesheet;
			echo $ml_survey_settings_js;
		}
	}

	/**
	 * @param $projectId
	 * @return string
	 */
	private function getMetaDataTableName($projectId){
		global $conn;
		if($this->getProjectSetting('use-drafted-changes', $projectId)){
			$query = "select draft_mode from redcap_projects where project_id = " . mysqli_real_escape_string($conn, $data['project_id']);
			if($result = mysqli_query($conn, $query)){
				if($row = mysqli_fetch_array($result)){
					$draftMode = $row["draft_mode"];
					return "redcap_metadata".($draftMode == 1?"_temp":"");
				}else{
					error_log("Multilingual: no row to determine draft_mode");
				}
				mysqli_free_result($result);
			}else{
				error_log("Multilingual: no result to determine draft_mode");
			}
		}
		return "redcap_metadata";
	}
	
	public function languageVariable($project_id){
		$langVar = $this->getProjectSetting('languages_variable', $project_id);
		if($langVar == ''){
			$langVar = 'languages';
		}
		return $langVar;
	}
	
	public function getSurveySettings($data) {
		$instruments = $this->getProjectSetting('instruments');
		
		if (!empty($instruments)) {
			$instruments = json_decode($instruments);
			$name = htmlspecialchars($data['instrument']);
			$instrument = $instruments->$name;
		} else {
			$instruments = new \stdClass();
		}
		
		header('Content-Type: application/json');
		echo json_encode($instrument);
	}
	
	public function saveSurveySettings($all_data) {
		$instruments = $this->getProjectSetting('instruments');
		if (empty($instruments)) {
			$instruments = new \stdClass();
		} else {
			$instruments = json_decode($instruments);
		}
		
		foreach ($all_data as $data) {
			$instrument = htmlspecialchars($data['instrument']);
			$lang = htmlspecialchars($data['language']);
			if (empty($instruments->$instrument)) {
				$instruments->$instrument = new \stdClass();
			}
			if (empty($instruments->$instrument->$lang)) {
				$instruments->$instrument->$lang = new \stdClass();
			}
			foreach ($data['collections'] as $coll_name => $coll) {
				$instruments->$instrument->$lang->$coll_name = new \stdClass();
				
				// add each setting to collection after encoding HTML
				foreach ($coll as $sname => $setting) {
					$instruments->$instrument->$lang->$coll_name->$sname = htmlspecialchars($setting);
				}
			}
		}
		
		$this->setProjectSetting('instruments', json_encode($instruments));
	}

	public function getSettings($data){
		$response = $this->getProjectSettings($data['project_id']);
		
		foreach($response AS $key => $values){
			if($key == 'button-width'){
				if(substr($response[$key], -2) != 'px'){
					$response[$key] = '100px';
				}
				elseif(intval(str_replace('px', '', $response[$key])) < 1){
					$response[$key] = '100px';
				}
			}
			elseif($key == 'languages_variable' && $response[$key] == null){
				$response[$key] = 'languages';
			}
		}

		header('Content-Type: application/json');
		echo json_encode($response);
	}

	public function getAnswers($data){
		global $conn;

		$data['project_id'] = mysqli_real_escape_string($conn, $data['project_id']);
		$data['field_name'] = mysqli_real_escape_string($conn, $data['field_name']);

		$metaDataTableName = $this->getMetaDataTableName($data['project_id']);

		if($data['matrix'] == 1){
			$query = "SELECT element_enum, element_type, element_validation_type, element_validation_min, element_validation_max FROM $metaDataTableName
				WHERE project_id = " . intval($data['project_id']) . "
				AND grid_name LIKE '" . $data['field_name'] . "'
				LIMIT 1";
		}
		else{
			$query = "SELECT element_enum, element_type, element_validation_type FROM $metaDataTableName
				WHERE project_id = " . intval($data['project_id']) . "
				AND field_name LIKE '" . $data['field_name'] . "'";
		}
		$result = mysqli_query($conn, $query);

		$row = mysqli_fetch_array($result);

		if(strpos(' \n ', $row['element_enum']) !== false){
			$tmp = explode(' \n ', $row['element_enum']);
		}
		else{
			$tmp = explode('\n', $row['element_enum']);
		}

		foreach($tmp AS $key => $value){
			$tmp2 = explode(',', $value);
			$response[trim($tmp2[0])] = trim($tmp2[1]);
		}

		if($row['element_type'] == 'text' && (strpos($row['element_validation_type'], 'date') !== false || strpos($row['element_validation_type'], 'time') !== false)){
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
		elseif($row['element_type'] == 'slider'){
			$response = explode('|', array_keys($response)[0]);
			$response = array_map('trim',$response);
			if (count($response) == 3){$keys = array('0', '50', '100');}
			elseif(count($response) == 2){$keys = array('0', '100');}
			elseif(count($response) == 1){$keys = array('0');}
			else{$keys = array();}
			$response = array_combine($keys, $response);
		}

		header('Content-Type: application/json');
		echo json_encode($response);
	}

	public function getTranslations($data, $projectSettings){
		global $conn;
		$layout_set = 0;

		$data['project_id'] = mysqli_real_escape_string($conn, $data['project_id']);
		$data['page'] = mysqli_real_escape_string($conn, $data['page']);

		$metaDataTableName = $this->getMetaDataTableName($data['project_id']);

		$query = "SELECT field_name, element_type, misc, grid_name, element_validation_type, element_validation_min, element_validation_max, element_label FROM $metaDataTableName
			WHERE project_id = " . intval($data['project_id']) 
				. ($data['page'] !='' ? " AND (form_name LIKE '" . $data['page'] . "' OR field_name LIKE 'survey_text_" . $data['page'] . "')" : '');
		$result = mysqli_query($conn, $query);

		while($row = mysqli_fetch_array($result)){
			//default questions
			$response['defaults'][$row['field_name']] = strip_tags($row['element_label']. '<br>');
			
			//$misc = explode("@", $row['misc']);
			$misc = str_getcsv($row['misc'], '@');
			//$response['test'] = $misc;

			$response['all'][$row['field_name']] = $misc;
			foreach($misc AS $key => $value){
				//replace ___ with @
				$value = str_replace('___', '@', $value);
				
				//questions
				if(strpos($value, 'p1000lang') !== false){
					$value = trim(str_replace('p1000lang', '', $value));
					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
							$response['questions'][$row['field_name']]['text'] = Piping::replaceVariablesInLabel($trans, ($data['record_id'] ? $data['record_id'] : '0'), $data['event_id']);
							if(strpos($row['element_validation_type'], 'date') !== false){
								$response['questions'][$row['field_name']]['type'] = 'date';
							}
							elseif(strpos($row['element_validation_type'], 'time') !== false){
								$response['questions'][$row['field_name']]['type'] = 'time';
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
				elseif(strpos($value, 'p1000answers') !== false){
					$value = trim(str_replace('p1000answers', '', $value));

					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
							foreach($trans AS $key3 => $newTrans){
								if($row['element_type'] == 'select'){
									$trans[$key3] = strip_tags(Piping::replaceVariablesInLabel($newTrans, ($data['record_id'] ? $data['record_id'] : '0'), $data['event_id']), '<br>');
								}
								else{
									$trans[$key3] = Piping::replaceVariablesInLabel($newTrans, ($data['record_id'] ? $data['record_id'] : '0'), $data['event_id']);
								}
							}

							$response['answers'][$row['field_name']]['text'] = $trans;
							if(strpos($row['element_validation_type'], 'date') !== false){
								$response['answers'][$row['field_name']]['type'] = 'date';
							}
							elseif(strpos($row['element_validation_type'], 'time') !== false){
								$response['answers'][$row['field_name']]['type'] = 'time';
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
				elseif(strpos($value, 'p1000errors') !== false){
					$value = trim(str_replace('p1000errors', '', $value));
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
				//field notes
				elseif(strpos($value, 'p1000notes') !== false){
					$value = str_replace('p1000notes', '', $value);
					$value = json_decode($value, true);
					foreach($value AS $key2 => $trans){
						if($key2 == $data['lang']){
							$response['notes'][$row['field_name']]['text'] = Piping::replaceVariablesInLabel($trans, ($data['record_id'] ? $data['record_id'] : '0'), $data['event_id']);
						}
					}
				}
				//survey tranlations
				elseif(strpos($value, 'p1000surveytext') !== false){
					$value = trim(str_replace('p1000surveytext', '', $value));
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

			// if error message is not set
			if(!isset($response['errors'][$row['field_name']])){
				// if it is a text field with validation
				if($row['element_type'] == 'text' && !empty($row['element_validation_type'])){

					// Make array of error messages from project settings if not already made
					if (!isset($defaultError)){
						// make array of default error prompts
						$defaultError = array();
						$defaultError = array_fill_keys($projectSettings['validation'], NULL);

						foreach($projectSettings['validation'] AS $key => $valid_type){
							$defaultError[$valid_type] = array_combine($projectSettings['lang'][$key], $projectSettings['error'][$key]);
						}
					}

					// If the text field's validation matches with any defined default error messages, use the default error messages
					if (array_key_exists($row['element_validation_type'], $defaultError)){
						if (array_key_exists($data['lang'], $defaultError[$row['element_validation_type']])){

							// Check if the variable contains "[validation_range]", if so, pipe it with the actual range.
							if (strpos($defaultError[$row['element_validation_type']][$data['lang']], "[validation_range]") !== false){

								if (empty($row['element_validation_min']) && empty($row['element_validation_max'])){
									$validationRange = '';
								} else {
									$validationRange = '('.$row['element_validation_min'].' - '.$row['element_validation_max'].')';
								}

								$response['errors'][$row['field_name']]['text'] = str_replace("[validation_range]", $validationRange, $defaultError[$row['element_validation_type']][$data['lang']]);
							} else {
								$response['errors'][$row['field_name']]['text'] = $defaultError[$row['element_validation_type']][$data['lang']];
							}
						}
					}
				}
			}
		}
		
		// override
		$instruments = $this->getProjectSetting('instruments');
		if (!empty($instruments)) {
			$instruments = json_decode($instruments);
			$form_name = $data['page'];
			$this_lang = $data['lang'];
			$simple_settings = $instruments->$form_name->$this_lang;
			if (!empty($simple_settings)) {
				$general_settings = $simple_settings->survey_settings;
				if (!empty($general_settings)) {
					if (!empty($general_settings->title) || $general_settings->title == "")
						$response['surveytext']['surveytitle'] = html_entity_decode($general_settings->title);
					if (!empty($general_settings->instructions) || $general_settings->instructions == "")
						$response['surveytext']['surveyinstructions'] = html_entity_decode($general_settings->instructions);
					if (!empty($general_settings->acknowledgement) || $general_settings->acknowledgement == "")
						$response['surveytext']['surveyacknowledgment'] = html_entity_decode($general_settings->acknowledgement);
				}
			}
		}
		
		//update language field
		$response['exist'] = $this->updateLangVar($data);
		$response['table'] = $metaDataTableName;

		header('Content-Type: application/json');
		echo json_encode($response);
	}
	
	public function getRecordVar($data){
		global $conn;

		$data['project_id'] = mysqli_real_escape_string($conn, $data['project_id']);

		$metaDataTableName = $this->getMetaDataTableName($data['project_id']);
		
		$query = "SELECT field_name FROM $metaDataTableName where project_id = " . intval($data['project_id']) . " ORDER BY field_order LIMIT 1";
		$result = mysqli_query($conn, $query);
		$row = mysqli_fetch_array($result);
		
		return $row['field_name'];
	}
	
	public function getSavedLang($data){
		if($data['record_id'] != ''){
			$langVar = $this->getProjectSetting('languages_variable', $data['project_id']);
			$tmp = json_decode(REDCap::getData($data['project_id'], 'json', array($data['record_id']), array($langVar)),true);
			if(!empty($tmp)){
				header('Content-Type: application/json');
				echo json_encode($tmp[0][$langVar]);
			}
			else{
				return null;
			}
		}
		else{
			return null;
		}
		
	}
	
	public function updateLangVar($data){
		if($data['record_id'] != ''){
			$exist = json_decode(\REDCap::getData($data['project_id'], 'json', $data['record_id']), true);
			if(!empty($exist)){
				$recordVar = $this->getRecordVar($data);
				$langVar = $this->getProjectSetting('languages_variable', $data['project_id']);
				
				$t = array($recordVar => $data['record_id'], ($langVar != null ? $langVar : 'languages') => $data['lang_id'], 'redcap_event_name' => $this->getEventName($data['event_id']));
				$json_data = json_encode(array($t));
				$tmp = \REDCap::saveData($data['project_id'], 'json', $json_data, 'normal');

				return $tmp;
			}
		}
	}
	
	public function getEventName($event_id){
		global $conn;
		
		$query = "SELECT descrip, arm_id FROM redcap_events_metadata WHERE event_id = " . intval($event_id);
		$result = mysqli_query($conn, $query);
		$row = mysqli_fetch_array($result); 
		
		$event_name = strtolower(str_replace(" ", "_", $row['descrip']));
		
		$query = "SELECT arm_name FROM redcap_events_arms WHERE arm_id = " . intval($row['arm_id']);
		$result = mysqli_query($conn, $query);
		$row = mysqli_fetch_array($result); 
		
		$event_name .= '_' . strtolower(str_replace(" ", "_", $row['arm_name']));
		
		return $event_name;
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
	
	public function getLanguages($project_id){
		$langVar = $this->languageVariable($project_id);
		if(!$langVar){
			$langVar = 'languages';
		}
		
		$q = "SELECT element_enum FROM redcap_metadata WHERE project_id = " . intval($project_id) . " AND field_name = '" . $langVar . "'";
		$query = db_query($q);
		$row = db_fetch_assoc($query);
			
		$tmp = explode(' \n ', $row['element_enum']);
		foreach($tmp AS $key => $value){
			$tmp2 = explode(',', $value);
			$response[trim($tmp2[0])] = trim($tmp2[1]);
		}	
			
		return $response;
	}
	
	public function getData($project_id = NULL, $record = NULL){
		if($project_id == NULL || $record == NULL)
			return;
		
		$q = "SELECT record, event_id, field_name, `value` FROM redcap_data
			WHERE project_id = " . intval($project_id) . 
			" AND record = '" . $record . "'";
		$query = db_query($q);
	
		while($row = db_fetch_assoc($query)){
			$response[$row['record']][$row['event_id']][$row['field_name']] = $row['value'];
		}
		
		return $response;
	}
	
	public function getMetaData($project_id = NULL, $form = NULL){
		if($project_id == NULL)
			return;
		
		$q = "SELECT * FROM redcap_metadata
			WHERE project_id = " . intval($project_id) 
			. ($form ? " AND form_name = '" . $form . "'" : "") .
			" ORDER BY field_order";
		$query = db_query($q);
	
		while($row = db_fetch_assoc($query)){
			$response[] = $row;
		}
		
		return $response;
	}

	public function exportData($pid, $lang){
		global $conn;
		
		$langVar = $this->getProjectSetting('languages_variable', $pid);
		if($langVar == ''){
			$langVar = 'languages';
		}

		ini_set('memory_limit','100M');
		set_time_limit(0);

		$lang = mysqli_real_escape_string($conn, $lang);
		$pid = mysqli_real_escape_string($conn, $pid);

		$metaDataTableName = $this->getMetaDataTableName($pid);

		//language
		$query = "SELECT element_enum, element_type, element_validation_type FROM $metaDataTableName
			WHERE project_id = " . intval($pid) . "
			AND field_name LIKE '" . $langVar . "'";
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
		$query = "SELECT field_name, element_type, misc, grid_name, element_validation_type, element_label FROM $metaDataTableName
			WHERE project_id = " . intval($pid) . " AND field_name NOT LIKE 'survey_text%' ORDER BY field_order";
		$result = mysqli_query($conn, $query);

		while($row = mysqli_fetch_array($result)){
			$misc = explode('@', $row['misc']);
			
			foreach($misc AS $key => $value){
				//replace ___ with @
				$value = str_replace('___', '@', $value);
				
				//questions
				if(strpos($value, 'p1000lang') !== false){
					$value = trim(str_replace('p1000lang', '', $value));
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
				elseif(strpos($value, 'p1000answers') !== false){
					$value = trim(str_replace('p1000answers', '', $value));
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
	
	public function getUserSelectedLanguages($record) {
		$user_languages = [];
		
		$result = $this->queryLogs("SELECT timestamp, message, record_id, language_value, instrument, event_id
			WHERE message = ? AND record_id = ?", [
				"user_selected_language",
				$record
		]);
		
		while($row = db_fetch_assoc($result)) {
			$instrument = $row['instrument'];
			$language_value = $row['language_value'];
			$event_id = $row['event_id'];
			
			if (!empty($instrument) && !empty($language_value) && !empty($event_id)) {
				if (empty($user_languages[$event_id])) {
					$user_languages[$event_id] = [];
				}
				if (empty($user_languages[$event_id][$instrument])) {
					$user_languages[$event_id][$instrument] = $language_value;
				}
			}
		}
		
		return $user_languages;
	}
	
	public function translatePDF(&$metadata, $user_languages) {
		// translate survey instructions/titles
		global $Proj;
		$instruments = json_decode($this->getProjectSetting('instruments'));
		if ($instruments && !empty($instruments)) {
			foreach ($Proj->surveys as $id => &$survey) {
				// determine which language to use for this form
				$lang = '';
				$form_name = $survey['form_name'];
				foreach($user_languages as $event_id => $event) {
					if (!empty($event[$form_name])) {
						$lang = $event[$form_name];
						break;
					}
				}
				if ($lang == '') {
					continue;
				}
				
				if (!empty($instruments->$form_name->$lang->survey_settings->title)) {
					$survey['title'] = $instruments->$form_name->$lang->survey_settings->title;
				}
				if (!empty($instruments->$form_name->$lang->survey_settings->acknowledgement)) {
					$survey['instructions'] = $instruments->$form_name->$lang->survey_settings->acknowledgement;
				}
			}
		}
		
		// translate field question/answer labels
		foreach($metadata as &$field) {
			// see which instrument this field belongs to
			$parent_form = $field['form_name'];
			$field_name = $field['field_name'];
			
			// get question and answer translations for this field
			$translations = $this->getFieldTranslations($field);
			
			// determine which language to use for that field
			$lang = '';
			foreach($user_languages as $event_id => $event) {
				if (!empty($event[$parent_form])) {
					$lang = $event[$parent_form];
					break;
				}
			}
			if ($lang == '') {
				continue;
			}
			
			// determine the translated field label for this field/lang combo
			if ($translations['lang'] && $translations['lang'][$lang]) {
				$field['element_label'] = $translations['lang'][$lang];
			}
			
			// determine the translated answer labels for this field/lang combo
			if ($translations['answers'] && $translations['answers'][$lang]) {
				foreach($translations['answers'][$lang] as $raw => $translation) {
					$translations['answers'][$lang][$raw] = "$raw, $translation";
				}
				$field['element_enum'] = implode(" \\n ", $translations['answers'][$lang]);
			}
		}
		
		return $metadata;
	}
	
	public function getFieldTranslations($field_array) {
		// this function returns an array like:
		/*
		translations = [
			'lang' => [
				'English' => 'My Field Label',
				'Espanol' => 'Mi etiqueta de campo'
			],
			'answers' => [
				'English' => [
					'0' => 'Zero',
					'1' => 'One',
					'2' => 'Two'
				],
				'Espanol' => [
					'0' => 'Cero',
					'1' => 'Uno',
					'2' => 'Dos'
				],
			]
		]
		
		assuming $field_array passed has 'misc' field with relevant @p1000lang and @p1000answers information
		*/
		$translations = [];
		$field_misc = $field_array['misc'];
		
		// determine indexes for p1000lang and p1000answers
		$regex_capture_p1000 = "/p1000([^{]*)/m";
		preg_match_all($regex_capture_p1000, $field_misc, $indexes);
		$indexes = $indexes[1];
		
		// capture pieces of field['misc'] that are contained in balanced curly braces (inclusive)
		$regex_capture_balanced_braces = "/\{(?:[^}{]+|(?R))*+\}/m";
		preg_match_all($regex_capture_balanced_braces, $field_misc, $matches);
		if (gettype($matches) == 'array') {
			$matches = $matches[0];
			
			// decode lang json (if applicable)
			$lang_index = array_search('lang', $indexes, true);
			if ($lang_index !== false) {
				$translations['lang'] = json_decode($matches[$lang_index], true);
			}
			
			// decode answers json (if applicable)
			$answers_index = array_search('answers', $indexes, true);
			if ($answers_index !== false) {
				$translations['answers'] = json_decode($matches[$answers_index], true);
			}
		}
		
		return $translations;
	}
	
}
?>
