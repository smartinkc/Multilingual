<?php

// filter/sanitize
$pattern = "/[^\w \-]/";
$record_id = preg_replace($pattern, "", $_POST['record_id']);
$instrument = preg_replace($pattern, "", $_POST['instrument']);
$language_value = db_escape($_POST['language_value']);

// log
$module->log("user_selected_language", [
	"record_id" => $record_id,
	"instrument" => $instrument,
	"language_value" => $language_value
]);
