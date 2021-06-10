<?php
// filter/sanitize
$pattern = "/[^\w \-]/";
$message = "user_selected_language";
$record_id = preg_replace($pattern, "", $_POST['record_id']);
$instrument = preg_replace($pattern, "", $_POST['instrument']);
$event_id = preg_replace($pattern, "", $_POST['event_id']);
$language_value = db_escape($_POST['language_value']);

// remove previously logged language values for this record-instrument combination
$module->removeLogs("message = ? AND record_id = ? AND instrument = ? AND event_id = ?", [$message, $record_id, $instrument, $event_id]);

// log to module event table
$module->log($message, [
	"record_id" => $record_id,
	"event_id" => $event_id,
	"instrument" => $instrument,
	"language_value" => $language_value
]);

// log to project event table
$timestamp = date("Y-m-d H:i:s");
$action_description = "User selected language '$language_value' in form '$instrument'";
$changes_made = "The Multilingual module can use this information to translate PDFs generated for this record.";
\REDCap::logEvent($action_description, $changes_made, null, $record_id, $event_id);
