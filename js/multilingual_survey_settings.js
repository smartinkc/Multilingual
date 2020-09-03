var Multilingual = {}
Multilingual.ajax_url = 'REDCAP_AJAX_URL';
Multilingual.langVar = 'REDCAP_LANGUAGE_VARIABLE';
Multilingual.languages = {1: 'en', 2: 'es'};
Multilingual.collection_names = [
	"basic_settings",
	"download_response",
	"save_and_return_survey",
	"save_and_return_saved",
	"save_and_return_modals",
	"save_and_return_returned",
	"econsent",
	"field_level"
];

Multilingual.getSettings = function() {
	var data = {};
	data['todo'] = 3;
	data['project_id'] = pid;
	var json = encodeURIComponent(JSON.stringify(data));

	$.ajax({
		url: Multilingual.ajax_url,
		type: 'POST',
		data: 'data=' + json,
		success: function (r) {
			settings = r;
		},
		error: function(jqXHR, textStatus, errorThrown) {
		   console.log(textStatus, errorThrown);
		}
	});
}

Multilingual.getLanguages = function() {
	var data = {};
	data['todo'] = 2;
	data['project_id'] = Multilingual.getVariable('pid');
	data['field_name'] = Multilingual.langVar;
	var json = encodeURIComponent(JSON.stringify(data));
	
	$.ajax({
		url: Multilingual.ajax_url,
		type: 'POST',
		data: 'data=' + json,
		success: function (r) {
			Multilingual.languages = r;
			Multilingual.addSurveySettingsLanguageRow(Multilingual.languages);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	});
}

Multilingual.getVariable = function(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		   var pair = vars[i].split("=");
		   if(pair[0] == variable){return pair[1];}
	}
	return(false);
}

Multilingual.htmlDecode = function(input) {
	// from https://stackoverflow.com/questions/1248849/converting-sanitised-html-back-to-displayable-html
	var e = document.createElement('div');
	e.innerHTML = input;
	return e.childNodes[0].nodeValue;
}

//
Multilingual.onLanguageSelect = function() {
	var selectVal = $("select#ml-mod-language").val();
	if (selectVal == "") {
		this.disableTextSettings();
		this.selectedLanguage = null;
		this.loadSurveySettings();
	} else {
		this.enableTextSettings();
		var lang_index = Number($("select#ml-mod-language").val()) + 1;
		this.selectedLanguage = this.languages[lang_index];
		this.loadSurveySettings();
	}
}

Multilingual.addBasicSurveySection = function () {
	// prepare section tr template
	var blank_tr = $("<tr class='ml-basic-settings'>\
		<td valign='top' style='width:20px;'></td>\
		<td valign='top' style='width:290px;'></td>\
		<td valign='top' style='padding-left:15px;padding-bottom:5px;'></td>\
	</tr>")
	
	// Language Enable/Disable <tr>
	var tr1 = blank_tr.clone()
	$(tr1).find('td:nth-child(2)').append("<b>Hide language</b>")
	$(tr1).find('td:nth-child(3)').append("\
	<label style='display:block;'>Hide this language for this form:\
	<input type='checkbox' id='hide_lang'>\
	</label>\
	<br>\
	");
	
	// Survery Page Texts <tr>
	var tr2 = blank_tr.clone()
	$(tr2).find('td:nth-child(2)').append("<b>General Survey Text Translations</b>")
	$(tr2).find('td:nth-child(3)').append("\
	<span style='display:block;'>Text for the buttons used to navigate surveys:</span>\
	<div><input data-collection='basic_settings' data-setting='previous' class='ml-text-setting' value='Previous Page' style='width:80%'></div>\
	<div><input data-collection='basic_settings' data-setting='next' class='ml-text-setting' value='Next Page' style='width:80%'></div>\
	<div><input data-collection='basic_settings' data-setting='close' class='ml-text-setting' value='Close Survey' style='width:80%'></div>\
	<div><input data-collection='basic_settings' data-setting='submit' class='ml-text-setting' value='Submit' style='width:80%'></div>\
	<br>\
	<span style='display:block;'>Text that appears above [+] and [-] buttons which resize survey text:</span>\
	<div><input data-collection='basic_settings' data-setting='resize_font' class='ml-text-setting' value='Resize Font' style='width:80%'></div>\
	<br>\
	");
	
	// insert these table rows into DOM
	$("[name='instructions']").closest("tr").after(tr1).after(tr2);
}

Multilingual.addDownloadResponsesSection = function () {
	// prepare section tr template
	var blank_tr = $("<tr class='ml-download-response-settings'>\
		<td valign='top' style='width:20px;'></td>\
		<td valign='top' style='width:290px;'></td>\
		<td valign='top' style='padding-left:15px;padding-bottom:5px;'></td>\
	</tr>")
	
	// Survery Page Texts <tr>
	var tr1 = blank_tr.clone()
	$(tr1).find('td:nth-child(2)').append("<b>Download PDF Response Text Translations</b>")
	$(tr1).find('td:nth-child(3)').append("\
	<span style='display:block;'>Provide text translations for the button and label prompting the user to download their survey response as PDF:</span>\
	<br>\
	<div><input data-collection='download_response' data-setting='button' class='ml-text-setting' value='Download' style='width:80%'></div>\
	<br>\
	<div><input data-collection='download_response' data-setting='label' class='ml-text-setting' value='Download your survey response (PDF):' style='width:80%'></div>\
	<br>\
	");
	
	// insert these table rows into DOM
	$("[name='end_of_survey_pdf_download']").closest("tr").after(tr1);
}

Multilingual.addSurveySettingsLanguageRow = function(languages) {
	// make language select element
	var langSelect = "<select id='ml-mod-language' name='ml-mod-language' class='x-form-text x-form-field' onchange='Multilingual.onLanguageSelect();'>"
	langSelect += "<option value=''></option>"
	Object.values(languages).forEach(function(value, index) {
		langSelect += "<option value='" + parseInt(index) + "'>" + value + "</option>"
	});
	langSelect += "</select>";
	
	var langLabel = "<label class='ml-mod' for='ml-mod-language'>Translation Language</label>"
	
	var emIcon = "<i class='fas fa-cube fs14' style='position:relative;top:1px;margin-right:1px;margin-left:1px;'></i>";
	
	var ssRow = "<tr><td colspan=3><div class='header' style='padding:7px 10px 5px;margin:-5px -7px 0px; background-color: #fb8;>'";
	ssRow += "<span>" + emIcon + " Multilingual Module - Select a translation language to change text settings</span>" + langLabel + langSelect
	ssRow += "</div></td></tr>";
	
	$("#survey_settings tbody tr:first").after(ssRow);
}

Multilingual.addSaveAndReturnSection = function() {
	// add a section for Save and Return text translation settings in the Survey Settings page form table
	
	// add section header tr
	var emIcon = "<i class='fas fa-cube fs14' style='position:relative;top:1px;margin-right:1px;margin-left:1px;'></i>";
	var newRow = "<tr id='ml_save_and_return-tr'><td colspan=3><div class='header' style='padding:7px 10px 5px;margin:0 -7px 10px; background-color: #fb8;>'";
	newRow += "<span>" + emIcon + " Multilingual Module - Save & Return Later Text Translations</span></div></td></tr>"
	
	// prepare section tr template
	var blank_tr = $("<tr class='ml-snr-settings'>\
		<td valign='top' style='width:20px;'></td>\
		<td valign='top' style='width:290px;'></td>\
		<td valign='top' style='padding-left:15px;padding-bottom:5px;'></td>\
	</tr>")
	
	// Survery Page Texts <tr>
	var surveypage_tr = blank_tr.clone()
	$(surveypage_tr).find('td:nth-child(2)').append("<b>Survey Page Text</b>")
	$(surveypage_tr).find('td:nth-child(3)').append("<span style='display:block;'>'Save & Return Later' button text. This button appears below the survey's 'Submit' button:</span>\
	<div style='margin:1px 0px;'><input class='ml-text-setting' data-collection='save_and_return_survey' data-setting='button' value='Save & Return Later' style='width:60%'></div>\
	<span style='display:block; margin:4px 0px;'>The texts below appear in the top right corner of the survey page. The pop-up prompts the user to continue the survey where they left off:</span>\
	<div style='margin:2px 0px;'><input class='ml-text-setting' data-collection='save_and_return_survey' data-setting='popup_hint' value='Returning?' style='width:60%'></div>\
	<div style='margin:2px 0px;'><input class='ml-text-setting'  data-collection='save_and_return_survey' data-setting='popup_title' value='Begin where you left off.' style='width:60%'></div>\
	<textarea style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='save_and_return_survey' data-setting='popup_text'>If you have already completed part of the survey, you may continue where you left off. All you need is the return code given to you previously. Click the link below to begin entering your return code and continue the survey.</textarea>\
	<div style='margin:2px 0px;'><input class='ml-text-setting' data-collection='save_and_return_survey' data-setting='popup_button' value='Continue the survey' style='width:60%'</div>")
	
	// Response Saved Page Texts <tr>
	var saved_tr = blank_tr.clone()
	$(saved_tr).find('td:nth-child(2)').append("<b>Survey Responses Saved Page Text</b>")
	$(saved_tr).find('td:nth-child(3)').append("<span style='display:block;'>This page appears after a user decides to save their survey responses thus far and leave the survey.</span>\
	<br>\
	<div style='margin:2px 0px;'><input class='ml-text-setting' data-collection='save_and_return_saved' data-setting='title' value='Your survey responses were saved!' style='width:80%'> (page title)</div>\
	<span style='display:block;'>These page instructions appear below the title:</span>\
	<textarea style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='save_and_return_saved' data-setting='instructions1'>You have chosen to stop the survey for now and return at a later time to complete it. To return to this survey, you will need both the survey link and your return code. See the instructions below.</textarea>\
	<br>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='return_code' class='ml-text-setting' value='Return Code' style='width:60%'> (section heading)</div>\
	<textarea data-collection='save_and_return_saved' data-setting='req_note' style='width:98%;height:40px;font-size:12px;' class='tinyNoEditor ml-text-setting'>A return code is *required* in order to continue the survey where you left off. Please write down the value listed below.</textarea>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='footnote1' class='ml-text-setting' value='The return code will NOT be included in the email below.' style='width:80%'> (footnote)</div>\
	<br>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='heading1' class='ml-text-setting' value='Survey link for returning' style='width:60%'> (section heading)</div>\
	<textarea data-collection='save_and_return_saved' data-setting='instructions2' style='width:98%;height:80px;font-size:12px;' class='tinyNoEditor ml-text-setting'>You may bookmark this page to return to the survey, OR you can have the survey link emailed to you by providing your email address below. For security purposes, the return code will NOT be included in the email. If you do not receive the email soon afterward, please check your Junk Email folder.</textarea>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='email_input' class='ml-text-setting' value='Enter email address' style='width:60%'> (default input text)</div>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='send_link' class='ml-text-setting' value='Send Survey Link' style='width:60%'> (button to send email)</div>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='footnote2' class='ml-text-setting' value='Your email address will not be stored' style='width:80%'> (footnote)</div>\
	<br>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='instructions3' class='ml-text-setting' value='Or if you wish, you may continue with this survey again now.' style='width:80%'></div>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_saved' data-setting='continue' class='ml-text-setting' value='Continue Survey Now' style='width:60%'> (button to continue survey)</div>\
	")
	
	// Response saved page intro modal <tr>
	var saved_intro_modal_tr = blank_tr.clone()
	$(saved_intro_modal_tr).find('td:nth-child(2)').append("Responses Saved Page -- Instructions Modal")
	$(saved_intro_modal_tr).find('td:nth-child(3)').append("<span style='display:block;'>A modal appears immediately after the user saves their responses instructing them to copy and remember their Return Code:</span>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_modals' data-setting='intro_title' class='ml-text-setting' value='&apos;Return Code&apos; needed to return' style='width:80%'> (modal title)</div>\
	<textarea data-collection='save_and_return_modals' data-setting='intro_body' style='width:98%;height:80px;font-size:12px;' class='tinyNoEditor ml-text-setting'>Copy or write down the Return Code below. Without it, you will not be able to return and continue this survey. Once you have the code, click Close and follow the other instructions on this page.</textarea>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_modals' data-setting='close' class='ml-text-setting' value='Close' style='width:60%'> (button to close modal)</div>\
	")
	
	// Returning to Survey Page Email Modal <tr>
	var saved_email_modal_tr = blank_tr.clone()
	$(saved_email_modal_tr).find('td:nth-child(2)').append("Responses Saved Page -- 'Email Sent' Modal")
	$(saved_email_modal_tr).find('td:nth-child(3)').append("<span style='display:block;'>A modal appears after a user types their email addess and clicks the 'Send Survey Link' button. The modal has a title, message, adn close button whose texts you can specify below:</span>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_modals' data-setting='email_title' class='ml-text-setting' value='Email sent!' style='width:60%'> (modal title)</div>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_modals' data-setting='email_body' class='ml-text-setting' value='The email was successfully sent to ' style='width:60%'> ... sent to [user's email address]</div>\
	")
	
	// Returning to Survey Page error Modal <tr>
	var saved_error_modal_tr = blank_tr.clone()
	$(saved_error_modal_tr).find('td:nth-child(2)').append("Responses Saved Page -- Invalid Email Modal")
	$(saved_error_modal_tr).find('td:nth-child(3)').append("<span style='display:block;'>A modal appears if the user supplies an invalid email address:</span>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_modals' data-setting='error_title' class='ml-text-setting' value='Alert' style='width:60%'> (modal title)</div>\
	<textarea data-collection='save_and_return_modals' data-setting='error_body' style='width:98%;height:40px;font-size:12px;' class='tinyNoEditor ml-text-setting'>This field must be a valid email address (like joe@user.com). Please re-enter it now.</textarea>\
	")
	
	// Returning to Survey Page Texts <tr>
	var return_tr = blank_tr.clone()
	$(return_tr).find('td:nth-child(2)').append("<b>Return to Survey Page</b>")
	$(return_tr).find('td:nth-child(3)').append("<span style='display:block;'>When a user clicks the link in their email to return to the survey, they'll first see a landing page which requests that they enter their Return Code. Below are the instructions shown to the user:</span>\
	<textarea data-collection='save_and_return_returned' data-setting='instructions' style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting'>To continue the survey, please enter the RETURN CODE that was auto-generated for you when you left the survey. Please note that the return code is *not* case sensitive.</textarea>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_returned' data-setting='submit_code' class='ml-text-setting' value='Submit your Return Code' style='width:60%'> (button to submit return code)</div>\
	<span style='display:block;'>If the user supplies an invalid return code, the following error message is shown to them:</span>\
	<textarea data-collection='save_and_return_returned' data-setting='error' style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting'>The return code you entered was incorrect. Please try again.</textarea>\
	<span style='display:block;'>The return page also gives the user an option to erase their responses for this survey and start over:</span>\
	<textarea data-collection='save_and_return_returned' data-setting='start_over_instructions' style='width:98%;height:80px;font-size:12px;' class='tinyNoEditor ml-text-setting'>Alternatively, if you have forgotten your return code or simply wish to start the survey over from the beginning, you may delete all your existing survey responses and start over.</textarea>\
	<div style='margin:2px 0px;'><input data-collection='save_and_return_returned' data-setting='start_over_button' class='ml-text-setting' value='Start Over' style='width:60%'> (button to start over)</div>\
	<span style='display:block;'>When a user clicks the 'Start Over' button, a prompt appears with the following text:</span>\
	<textarea data-collection='save_and_return_returned' data-setting='start_over_prompt' style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting'>ERASE YOUR RESPONSES? Are you sure you wish to start the survey over from the beginning? Please note that doing so will erase ALL your responses already entered for this survey.</textarea>\
	")
	
	// Survey Complete <tr>
	var complete_tr = blank_tr.clone()
	$(complete_tr).find('td:nth-child(2)').append("<b>Upon Survey Completion</b>")
	$(complete_tr).find('td:nth-child(3)').append("<span style='display:block;'>Upon completing a survey, the user will be presented with the return code and a message letting them know they can return to the survey in the future if they wish:</span>\
	<textarea data-collection='save_and_return_saved' data-setting='survey_complete' style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting'>You may return to this survey in the future to modify your responses by navigating to the survey URL and entering the code below.</textarea>\
	")
	
	// insert these table rows into DOM
	$("#save_and_return-tr").next("tr").before(newRow, surveypage_tr, saved_tr, saved_intro_modal_tr, saved_email_modal_tr, saved_error_modal_tr, return_tr, complete_tr);
}

Multilingual.addEconsentSection = function() {
	// add a section for Save and Return text translation settings in the Survey Settings page form table
	
	// add section header tr
	var emIcon = "<i class='fas fa-cube fs14' style='position:relative;top:1px;margin-right:1px;margin-left:1px;'></i>";
	var newRow = "<tr id='ml_econsent-tr'><td colspan=3><div class='header' style='padding:7px 10px 5px;margin:0 -7px 10px; background-color: #fb8;>'";
	newRow += "<span>" + emIcon + " Multilingual Module - e-Consent Text Translations</span></div></td></tr>"
	
	// prepare section tr template
	var blank_tr = $("<tr class='ml-econsent-settings'>\
		<td valign='top' style='width:20px;'></td>\
		<td valign='top' style='width:290px;'></td>\
		<td valign='top' style='padding-left:15px;padding-bottom:5px;'></td>\
	</tr>")
	
	// Survery Page Texts <tr>
	var tr1 = blank_tr.clone()
	$(tr1).find('td:nth-child(2)').append("<b>e-Consent Page</b>")
	$(tr1).find('td:nth-child(3)').append("\
	<span style='display:block;'>The following text appears at the top of the survey page while the participant is reviewing their e-Consent PDF:</span>\
	<textarea style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='econsent' data-setting='top'>Displayed below is a read-only copy of your survey responses. Please review it and the options at the bottom.</textarea>\
	\
	<span style='display:block;'>The following text appears in a checkbox below their e-Consent PDF, asking the user to verify their survey answers:</span>\
	<textarea style='width:98%;height:80px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='econsent' data-setting='checkbox'>I certify that all the information in the document above is correct. I understand that clicking 'Submit' will electronically sign the form and that signing this form electronically is the equivalent of signing a physical document.</textarea>\
	\
	<span style='display:block;'>The following text appears to inform the participant that they can click the 'Previous Page' button to return to the survey and change their responses:</span>\
	<textarea style='width:98%;height:60px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='econsent' data-setting='bottom'>If any information above is not correct, you may click the 'Previous Page' button to go back and correct it.</textarea>\
	<br>\
	");
	
	// Signature Field(s) Erase Modal
	var tr2 = blank_tr.clone()
	$(tr2).addClass('ml-signature-settings')
	$(tr2).find('td:nth-child(2)').append("<b>Signature Field(s) Erase Modal</b>")
	$(tr2).find('td:nth-child(3)').append("\
	<span style='display:block;'>Text translation settings for 'Force signature field(s) to be erased...' e-Consent feature:</span>\
	<div style='margin:1px 0px;'><input class='ml-text-setting' data-collection='econsent' data-setting='erase_title' value='Erase your signature(s) in this survey?' style='width:80%'></div>\
	<textarea style='width:98%;height:80px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='econsent' data-setting='erase_text'>You have provided your signature on an earlier page in this survey. This may include typing your name, a PIN, and/or signing your signature. You are allowed to return to a previous page in the survey, but if you do so, please be advised that your signature(s) will be automatically removed, after which you will need to provide it again before you can complete the survey. You will also be able to modify any of your existing responses to the questions in this survey. If this is okay, you may proceed to an earlier page in the survey by clicking the button below.</textarea>\
	<div style='margin:1px 0px;'><input class='ml-text-setting' data-collection='econsent' data-setting='cancel_button' value='Erase my signature(s) and go to earlier page' style='width:60%'></div>\
	<div style='margin:1px 0px;'><input class='ml-text-setting' data-collection='econsent' data-setting='erase_button' value='Cancel' style='width:80%'></div>\
	<br>\
	")
	
	// insert these table rows into DOM
	$("input[name='pdf_auto_archive']").closest("tr").after(newRow, tr1, tr2);
}

Multilingual.addFieldLevelSection = function() {
	// add a section for Save and Return text translation settings in the Survey Settings page form table
	
	// add section header tr
	var emIcon = "<i class='fas fa-cube fs14' style='position:relative;top:1px;margin-right:1px;margin-left:1px;'></i>";
	var newRow = "<tr id='ml_field_specific-tr'><td colspan=3><div class='header' style='padding:7px 10px 5px;margin:0 -7px 10px; background-color: #fb8;>'";
	newRow += "<span>" + emIcon + " Multilingual Module - Field Related Text Translations</span></div></td></tr>"
	
	// prepare section tr template
	var blank_tr = $("<tr class='ml-field-specific-settings'>\
		<td valign='top' style='width:20px;'></td>\
		<td valign='top' style='width:290px;'></td>\
		<td valign='top' style='padding-left:15px;padding-bottom:5px;'></td>\
	</tr>")
	
	// Survery Page Texts <tr>
	var tr1 = blank_tr.clone()
	$(tr1).find('td:nth-child(2)').append("<b>Field Related Text Translations</b>")
	$(tr1).find('td:nth-child(3)').append("\
	<span style='display:block;'>The 'reset' link appears next to many field types allowing a user to quickly and easily remove their answer for a given field:</span>\
	<div><input data-collection='field_level' data-setting='reset' class='ml-text-setting' value='reset' style='width:60%'></div>\
	<br>\
	<span style='display:block;'>The 'Expand' link below a textarea allows a survey participant to increase the size of the textarea input:</span>\
	<div><input data-collection='field_level' data-setting='expand' class='ml-text-setting' value='Expand' style='width:80%'></div>\
	<br>");
	
	// Signature Field <tr>
	var tr2 = blank_tr.clone()
	$(tr2).find('td:nth-child(2)').append("<b>Signature Field Type Translations</b>")
	$(tr2).find('td:nth-child(3)').append("\
	<span style='display:block;'>The following texts are associated with the 'Signature' field type:</span>\
	<div><input data-collection='field_level' data-setting='add_signature' class='ml-text-setting' value='Add signature' style='width:80%'> (link to open signature modal)</div>\
	<br>\
	<span style='display:block;'>The modal text instructing the user to provide a signature</span>\
	<textarea style='width:98%;height:40px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='field_level' data-setting='signature_prompt'>Signature (draw signature with mouse or finger)</textarea>\
	<div><input data-collection='field_level' data-setting='save_signature' class='ml-text-setting' value='Save signature' style='width:80%'> (button to save signature)</div>\
	<br>\
	");
	
	// File Upload Field <tr>
	var tr3 = blank_tr.clone()
	$(tr3).find('td:nth-child(2)').append("<b>File Upload Field Type Translations</b>")
	$(tr3).find('td:nth-child(3)').append("\
	<span style='display:block;'>The following texts are associated with the 'File Upload' field type:</span>\
	<div><input data-collection='field_level' data-setting='upload_file' class='ml-text-setting' value='Upload file' style='width:80%'> (link to open file upload modal)</div>\
	<br>\
	<span style='display:block;'>The following fields apply to the 'Upload file' modal:</span>\
	<br>\
	<span style='display:block;'>(modal instructions text)</span>\
	<div><input data-collection='field_level' data-setting='upload_prompt1' class='ml-text-setting' value='File Upload (for users to upload files)' style='width:80%'></div>\
	<div><input data-collection='field_level' data-setting='upload_prompt2' class='ml-text-setting' value='Select a file then click the &apos;Upload File&apos; button' style='width:80%'></div>\
	<span style='display:block;'>(note to user)</span>\
	<div><input data-collection='field_level' data-setting='max_size' class='ml-text-setting' value='Max file size: 128 MB' style='width:80%'></div>\
	<span style='display:block;'>(button to close modal and submit file)</span>\
	<div><input data-collection='field_level' data-setting='upload_button' class='ml-text-setting' value='Upload File' style='width:80%'></div>\
	<br>\
	");
	
	/*	unsupported settings -- choose file :fileinput text and label
	<span style='display:block;'>(button to open file dialog)</span>\
	<div><input data-collection='field_level' data-setting='choose_file' class='ml-text-setting' value='Choose File' style='width:80%'></div>\
	<span style='display:block;'>(shown when user hasn't uploaded a file)</span>\
	<div><input data-collection='field_level' data-setting='no_file' class='ml-text-setting' value='No file chosen' style='width:80%'></div>\
	*/
	
	// Missing value modal <tr>
	var tr4 = blank_tr.clone()
	$(tr4).find('td:nth-child(2)').append("<b>Missing Values Alert Modal</b>")
	$(tr4).find('td:nth-child(3)').append("\
	<span style='display:block;'>Missing values modal title:</span>\
	<div><input data-collection='field_level' data-setting='modal_title' class='ml-text-setting' value='NOTE: Some fields are required!' style='width:80%'></div>\
	<br>\
	<span style='display:block;'>Missing values modal instructions:</span>\
	<textarea style='width:98%;height:80px;font-size:12px;' class='tinyNoEditor ml-text-setting' data-collection='field_level' data-setting='instructions'>Your data was successfully saved, but you did not provide a value for some fields that require a value. Please enter a value for the fields on this page that are listed below.\
	Provide a value for...</textarea>\
	<br>\
	<span style='display:block;'>Missing values modal close button:</span>\
	<div><input data-collection='field_level' data-setting='modal_close' class='ml-text-setting' value='Okay' style='width:60%'></div>\
	<br>\
	")
	
	// insert these table rows into DOM
	$("input[name='pdf_auto_archive']").closest("tr").after(newRow, tr1, tr2, tr3, tr4);
}

Multilingual.addMustProvideValueSetting = function() {
	// prepare section tr template
	var blank_tr = $("<tr class='ml-must-provide-value-setting'>\
		<td valign='top' style='width:20px;'></td>\
		<td valign='top' style='width:290px;'></td>\
		<td valign='top' style='padding-left:15px;padding-bottom:5px;'></td>\
	</tr>")
	
	// Survery Page Texts <tr>
	var tr1 = blank_tr.clone()
	$(tr1).find('td:nth-child(2)').append("'Must Provide Value' Text Translation")
	$(tr1).find('td:nth-child(3)').append("\
	<span style='display:block;'>If enabled, this text appears below a field label to let a user know their input is required:</span>\
	<div><input data-collection='field_level' data-setting='text' class='ml-text-setting' value='* must provide a value' style='width:80%'></div>\
	<br>\
	");
	
	// insert these table rows into DOM
	$("[name='show_required_field_text']").closest("tr").after(tr1);
}

Multilingual.disableTextSettings = function() {
	$("input[name='title']").attr('disabled', true)
	$("input[name='title']").css('background-color', "#ccc")
	// $("textarea[name='response_limit_custom_text']").attr('disabled', true)
	Multilingual.instructions_mce.getBody().setAttribute('contenteditable', false)
	Multilingual.instructions_mce.getBody().style.backgroundColor = "#ccc"
	Multilingual.acknowledgement_mce.getBody().setAttribute('contenteditable', false)
	Multilingual.acknowledgement_mce.getBody().style.backgroundColor = "#ccc"
	
	// disable save and return later added settings
	$("textarea.ml-text-setting, input.ml-text-setting").attr('disabled', true)
}

Multilingual.enableTextSettings = function() {
	$("input[name='title']").attr('disabled', false)
	$("input[name='title']").css('background-color', "#fff")
	// $("textarea[name='response_limit_custom_text']").attr('disabled', false)
	Multilingual.instructions_mce.getBody().setAttribute('contenteditable', true);
	Multilingual.instructions_mce.getBody().style.backgroundColor = "#fff"
	Multilingual.acknowledgement_mce.getBody().setAttribute('contenteditable', true);
	Multilingual.acknowledgement_mce.getBody().style.backgroundColor = "#fff"
	
	// disable save and return later added settings
	$("textarea.ml-text-setting, input.ml-text-setting").attr('disabled', null)
	
	// enable hide_lang checkbox too
	$("#hide_lang").attr('disabled', false);
}

Multilingual.saveSurveySettings = function() {
	if (!this.selectedLanguage)		// only save module settings if translation language selected
		return false;
	
	var data = {}
	data.action = 'SAVE_SURVEY_SETTINGS'
	data.instrument = Multilingual.getVariable('page')
	data.language = this.selectedLanguage
	data.collections = {}
	
	// build survey_settings collection of settings
	var survey_settings = {}
	survey_settings.title = $("input[name=title]").val()
	survey_settings.instructions = Multilingual.instructions_mce.getContent()
	// survey_settings.response_limit = $("textarea[name=response_limit_custom_text]").val()
	survey_settings.acknowledgement = Multilingual.acknowledgement_mce.getContent()
	data.collections.survey_settings = survey_settings
	
	// add 'Save and Return Later' setting collections
	Multilingual.collection_names.forEach(function(coll_name, i) {
		data.collections[coll_name] = {}
		$(".ml-text-setting[data-collection='" + coll_name + "']").each(function(i, setting) {
			data.collections[coll_name][$(setting).attr('data-setting')] = $(setting).val()
		})
	})
	
	// remember hide option setting
	if ($("#hide_lang").is(':checked')) {
		data.collections.basic_settings.hide_lang = true;
	} else {
		data.collections.basic_settings.hide_lang = false;
	}
	
	var json = encodeURIComponent(JSON.stringify(data));
	
	$.ajax({
		url: Multilingual.ajax_url,
		type: 'POST',
		data: 'data=' + json,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	});
	
	// load default survey settings so REDCap doesn't overwrite them
	this.selectedLanguage = null;
	this.loadSurveySettings();
}

Multilingual.getSurveySettings = function() {
	// remember default survey settings
	Multilingual.defaults = {}
	Multilingual.defaults.survey_settings = {}
	Multilingual.defaults.survey_settings.title = $("input[name=title]").val();
	Multilingual.defaults.survey_settings.instructions = Multilingual.instructions_mce.getContent();
	// Multilingual.defaults.survey_settings.response_limit = $("textarea[name=response_limit_custom_text]").val();
	Multilingual.defaults.survey_settings.acknowledgement = Multilingual.acknowledgement_mce.getContent();
	
	// store default 'Save and Return Later' settings as well
	Multilingual.collection_names.forEach(function(coll_name, i) {
		Multilingual.defaults[coll_name] = {}
		$(".ml-text-setting[data-collection='" + coll_name + "']").each(function(i, setting) {
			Multilingual.defaults[coll_name][$(setting).attr('data-setting')] = $(setting).val()
		})
	})
	
	var data = {
		action: 'GET_SURVEY_SETTINGS'
	}
	data.instrument = Multilingual.getVariable('page');
	var json = encodeURIComponent(JSON.stringify(data));
	
	$.ajax({
		url: Multilingual.ajax_url,
		type: 'POST',
		data: 'data=' + json,
		success: function(r) {
			if (r) {
				Multilingual.settings = r;
				for (let [lang, collections] of Object.entries(Multilingual.settings)) {
					// console.log('lang, collections', [lang, collections])
					for (let [coll_name, collection] of Object.entries(collections)) {
						// console.log('coll_name, collection', [coll_name, collection])
						for (let [setting, value] of Object.entries(collection)) {
							if (value)
								Multilingual.settings[lang][coll_name][setting] = Multilingual.htmlDecode(value)
							// console.log('setting, value', [setting, Multilingual.settings[lang][coll_name][setting]])
						}
					}
				}
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	});
}

Multilingual.loadSurveySettings = function() {
	var collections = this.defaults
	if (this.selectedLanguage && typeof(this.settings) !== 'undefined') {
		if (typeof(this.settings[this.selectedLanguage]) !== 'undefined') {
			collections = this.settings[this.selectedLanguage]
		}
	}
		
	
	// handles setting input values for settings that exist in every REDCap survey
	$("input[name='title']").val(collections.survey_settings.title)
	Multilingual.instructions_mce.setContent(collections.survey_settings.instructions);
	// $("textarea[name='response_limit_custom_text']").val(collections.survey_settings.response_limit)
	Multilingual.acknowledgement_mce.setContent(collections.survey_settings.acknowledgement);
	
	// handles all settings that are added by ML module itself
	$(".ml-text-setting[data-collection][data-setting]").each(function(i, setting) {
		var coll_name = $(this).attr('data-collection')
		var setting_name = $(this).attr('data-setting')
		if (collections[coll_name]) {
			if (typeof collections[coll_name][setting_name] === 'string') {
				$(this).val(collections[coll_name][setting_name]);
			}
		}
	})
	
	// update hide_lang checkbox
	$("#hide_lang").prop('checked', collections.basic_settings.hide_lang)
}

Multilingual.getSettings();

$( document ).ready(function() {
	Multilingual.getLanguages();
	Multilingual.instructions_mce = tinyMCE.get('mce_0');
	Multilingual.acknowledgement_mce = tinyMCE.get('mce_2');
	
	// disable text settings when both tinyMCE editors are init'ed
	Multilingual.instructions_mce.on('init', function(e) {
		Multilingual.instructionsEditorReady = true;
		if (Multilingual.acknowledgementEditorReady && Multilingual.instructionsEditorReady) {
			Multilingual.disableTextSettings();
			Multilingual.getSurveySettings();
		}
	})
	Multilingual.acknowledgement_mce.on('init', function(e) {
		Multilingual.acknowledgementEditorReady = true;
		if (Multilingual.acknowledgementEditorReady && Multilingual.instructionsEditorReady) {
			Multilingual.disableTextSettings();
			Multilingual.getSurveySettings();
		}
	})

	$("#surveySettingsSubmit").on('click', function() {
		Multilingual.saveSurveySettings();
	});
	
	Multilingual.addBasicSurveySection();
	Multilingual.addFieldLevelSection();
	Multilingual.addSaveAndReturnSection();
	Multilingual.addEconsentSection();
	Multilingual.addDownloadResponsesSection();
	Multilingual.addMustProvideValueSetting();
	
	// show save and return settings only when feature is enabled
	$("select[name='save_and_return']").on('change', function() {
		if ($(this).val() == '1') {
			$("#ml_save_and_return-tr").show(250)
			$("tr.ml-snr-settings").show(250)
		} else {
			$("#ml_save_and_return-tr").hide(250)
			$("tr.ml-snr-settings").hide(250)
		}
	})
	$("select[name='save_and_return']").trigger('change')
	
	// show e-Consent text settings only when feature is enabled
	$("input[name='pdf_auto_archive']").on('change', function() {
		if ($(this).val() == '2') {
			$("#ml_econsent-tr").show(250)
			$("tr.ml-econsent-settings").show(250)
		} else {
			$("#ml_econsent-tr").hide(250)
			$("tr.ml-econsent-settings").hide(250)
		}
	})
	$("input[name='pdf_auto_archive']").trigger('change')
	
	// show erase signature text settings only when feature is enabled
	$("body").on('change', "[name*='pdf_econsent_signature_field']", function() {
		// iterate over all present selects, if any set to an actual field, then show appropriate text translation settings
		$("tr.ml-signature-settings").hide(250);
		$("[name*='pdf_econsent_signature_field']").each(function(i, e) {
			if ($(this).val()) {
				$("tr.ml-signature-settings").show(250);
				return;
			}
		})
	})
	$("[name='pdf_econsent_signature_field1']").trigger('change')
	
	// show Download PDF text settings only when feature is enabled
	$("select[name='end_of_survey_pdf_download']").on('change', function() {
		// console.log('changed select, new val: ' + $(this).val());
		if ($(this).val() == '1') {
			$("tr.ml-download-response-settings").show(250)
		} else {
			$("tr.ml-download-response-settings").hide(250)
		}
	})
	$("select[name='end_of_survey_pdf_download']").trigger('change')
	
	// only show 'must provide value' translation option when feature enabled
	$("[name='show_required_field_text']").on('change', function() {
		// console.log('changed select, new val: ' + $(this).val());
		if ($(this).val() == '1') {
			$("tr.ml-must-provide-value-setting").show(250)
		} else {
			$("tr.ml-must-provide-value-setting").hide(250)
		}
	})
	$("[name='show_required_field_text']").trigger('change')
	
	$("#hide_lang").attr('disabled', true);
})

// add Espanol to all added survey text translation settings
// $(".ml-text-setting").each(function(i, e) {
	// var text = $(e).val();
    // $(e).val(text + " (Español)");
// })