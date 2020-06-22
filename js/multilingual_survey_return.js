console.log('multilingual_survey_return.js');
(function(){
	//load languages
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	var instrument_name = 'REDCAP_INSTRUMENT_NAME';
	
	var project_id = getVariable('pid');
	//var languages = {1: 'en', 2: 'es', 3: 'fr'};
	var languages = {1: 'en', 2: 'es'};
	var totalLanguages = 2;
	var settings = {};
	var form_settings = null;
	settings['empty'] = true;
	var lang = 'en';
	var errorChecking = 0;
	var hasCode = 0;

	//document ready change language
	$( document ).ready(function(){
		getLanguages();
		
		// translate close button for all modals (except first modal which doesn't trigger this listener)
		$('body').on('dialogopen', '.simpleDialog', function() {
			if (form_settings != null) {
				$(this).closest("div[role='dialog']").find('.ui-dialog-buttonset button').html(form_settings.save_and_return_modals.close);
			}
		});
		
		//error messages (invalid input in text boxes)
		$('body').on('blur', 'input', function(){
			if(errorChecking != 1){
				errorChecking = 1;
				$('#redcapValidationErrorPopup').html('');
				setTimeout(function(){
					try {
						var t;
						for(t in settings['validation']['value']){
							if(settings['validation']['value'][t] == 'email'){
								break;
							}
						}
						
						var l;
						for(l in settings['lang']['value']){
							if(settings['lang']['value'][l] == languages[getCookie('p1000Lang')]){
								break;
							}						
						}
						
						if(settings['error']['value'][t] && settings['error']['value'][t][l]){
							$('#redcapValidationErrorPopup').html(settings['error']['value'][t][l]);
						}
						else{
							$('#redcapValidationErrorPopup').html('<center><span style="color:red;font-size:50px;">&#x26D4;</span></center>');
						}
						//make sure stop action has not been called
						if(!$('#stopActionPrompt').is(':visible')){
							// $('#redcapValidationErrorPopup').next().children().children().children().html('&#x2714;');
						}

						$('.ui-dialog-title').each(function(){
							if($(this).is(':visible')){
								$(this).children().html('<img alt="Page" src="APP_PATH_IMAGESexclamation_frame.png">');
							}
						});
					} catch(err) {
						console.log('translation error', err);
					}
					
					// apply instrument-specific settings
					var errorModal = $('#redcapValidationErrorPopup').closest("div[role='dialog']");
					if (errorModal.length && form_settings) {
						if (form_settings.save_and_return_modals) {
							// translate modal title
							if (form_settings.save_and_return_modals.error_title) {
								$(errorModal).find('.ui-dialog-title').html(form_settings.save_and_return_modals.error_title);
							}
							// body
							if (form_settings.save_and_return_modals.error_body) {
								$(errorModal).find('.ui-dialog-content').html(form_settings.save_and_return_modals.error_body);
							}
						}
					}
					
					errorChecking = 0;
				}, 200);
			}
		});
	});
	
	//functions
	function translate(){
		//get current language
		lang = getCookie('p1000Lang');
		try {
			var curLang = null;
			var id;
			for(id in settings['save-return-later-lang']['value']){
				if(settings['save-return-later-lang']['value'][id] == lang){
					curLang = id;
					break;
				}
			}
			
			if($('#return_instructions').length && curLang != null && settings['save-return-page-popup-title']['value'][curLang]){
				//popup 
				if($('#ui-id-1').is(':visible')){
					$('#ui-id-1').html(settings['save-return-page-popup-title']['value'][curLang]);
					$('#codePopupReminderText').html(settings['save-return-page-popup-body']['value'][curLang]);
					var html = $('#codePopupReminderTextCode').html();
					html = html.split('<span');
					$('#codePopupReminderTextCode').html('<b>' + settings['save-return-page-popup-return-code']['value'][curLang] + ':</b> <span' + html[1]);
					
					// translate modal button
					$('.ui-dialog-buttonpane').find('button').html('&#x2716;');
					
					hasCode = 1;
				}
			
				//return page-popup-body
				$('#return_instructions').find('h4').html('<b>' + settings['save-return-page-title']['value'][curLang]  + '</b>');
				
				if(hasCode == 1){
					html = $('#return_instructions').find('div').html().split('<div');
					html[0] = settings['save-return-page-instructions']['value'][curLang];
					
					html[1] = html[1].split(/<br>/g);
					html[1][1] = settings['save-return-page-return-code-instructions']['value'][curLang];
					
					html[1][2] = html[1][2].split('<span');
					html[1][2][0] = settings['save-return-page-popup-return-code']['value'][curLang];
					html[1][2] = html[1][2][0] + '<span' + html[1][2][1];
					
					html[1] = html[1][0] + '<br>' + html[1][1] + '<br>' + html[1][2] + '<br>' + html[1][3] + '<br>';
					
					$('#return_instructions').find('div').html(html[0] + '<div' + html[1] + '<div' + html[2] + '<div' + html[3] + '<div' + html[4]);
					$('#return_instructions').find('u').eq(0).html(settings['save-return-page-popup-return-code']['value'][curLang]);
					$('#return_instructions').find('u').eq(1).html(settings['save-return-page-survey-link-title']['value'][curLang]);
					
					html = $('#provideEmail').html().split('<br>');
					$('#provideEmail').html(settings['save-return-page-email-instructions']['value'][curLang] + '<br>' + html[1] + '<br>' + html[2] + '<br>' + html[3]);
					
					$('#sendLinkBtn').html(settings['save-return-page-email-button']['value'][curLang]);
					
					$('#return_continue_form').find('b').eq(0).html(settings['save-return-page-continue-title']['value'][curLang]);
					$('#return_continue_form').find('button').eq(0).html(settings['save-return-later-continue-button']['value'][curLang]);
					
					$('#return_instructions').find('span').eq(4).html('');
					$('#return_instructions').find('span').eq(1).html('');
					
					// translate footnotes 1-2
					$('#return_instructions').find('span').eq(1).html('');
					$('#return_instructions').find('span').eq(4).html('');
				}
				else{
					$('#return_instructions').find('div').eq(0).html(settings['save-return-page-instructions']['value'][curLang]);
					$('#return_instructions').find('div').eq(1).find('u').eq(0).html(settings['save-return-page-survey-link-title']['value'][curLang]);
					
					var html = $('#provideEmail').html().split('<br>');
					html[0] = settings['save-return-page-email-instructions']['value'][curLang];

					$('#provideEmail').html(html[0] + '<br>' + html[1] + '<br>' + html[2] + '<br>');
					$('#provideEmail').find('button').eq(0).html(settings['save-return-page-email-button']['value'][curLang]);
					
					$('#return_continue_form').find('b').eq(0).html(settings['save-return-page-continue-title']['value'][curLang]);
					$('#return_continue_form').find('button').eq(0).html(settings['save-return-later-continue-button']['value'][curLang]);
				}
			}
			else if($('#surveytitle').length && curLang != null && settings['save-return-page-survey-title']['value'][curLang]){
				//continue page if cookie still set
				$('#surveytitle').html(settings['save-return-page-survey-title']['value'][curLang]);
				$('#return_code_form_instructions').html(settings['save-return-page-continue-text']['value'][curLang]);
				$('#return_code_form').find('button').html(settings['save-return-later-continue-button']['value'][curLang]);
				
				//start over
				$('#start_over_form').find('p').html(settings['save-return-page-startover-text']['value'][curLang]);
				$('#start_over_form').find('input').val(settings['save-return-page-startover-button']['value'][curLang]);
			}
		} catch(err) {
			console.log('translation error: ' + err);
		}
		form_translate();
	}
	
	function form_translate() {
		if (form_settings == null)
			return;
		
		// translate first pop-up
		if ($("#ui-id-1").length) {
			$("#ui-id-1").html(form_settings.save_and_return_modals.intro_title);
			$("#codePopupReminderText").html(form_settings.save_and_return_modals.intro_body);
			var text = $("#codePopupReminderTextCode").html();
			$("#codePopupReminderTextCode").html(text.replace(/<b>.*<\/b>/, "<b>" + form_settings.save_and_return_saved.return_code + "</b>: "));
		}
		
		// translate survey title
		if ($("#surveytitle").length) {
			$("#surveytitle").html(form_settings.survey_settings.title);
		}
		
		// translate return code form
		if ($("#return_code_form_instructions").length) {
			$("#return_code_form_instructions").html(form_settings.save_and_return_returned.instructions);
		}
		
		if ($("#return_instructions").length) {
			// title
			$('#return_instructions h4 b').html(form_settings.save_and_return_saved.title);
			
			// instructions
			var html = $('#return_instructions div:eq(0)').html();
			html = html.replace(/(.*)<br>/, form_settings.save_and_return_saved.instructions1);
			$('#return_instructions div:eq(0)').html(html);
			
			// Return Code section
			$("#return_instructions div:eq(0) b u:eq(0)").html(form_settings.save_and_return_saved.return_code);
			$("#return-step1").html(form_settings.save_and_return_saved.req_note);
			html = $("#return_instructions div:eq(0) div:eq(0)").html();
			$("#return_instructions div:eq(0) div:eq(0)").html(html.replace("Return Code&nbsp;", form_settings.save_and_return_saved.return_code + "&nbsp;"));
			$('#return_instructions').find('span').eq(1).html(form_settings.save_and_return_saved.footnote1);
			
			// Survey link section
			$("#return_instructions div:eq(0) b u:eq(1)").html(form_settings.save_and_return_saved.heading1);
			$("#return-step2").html(form_settings.save_and_return_saved.instructions2);
			$("#sendLinkBtn").html(form_settings.save_and_return_saved.send_link);
			
			// footnotes
			$('#return_instructions').find('span').eq(4).html(form_settings.save_and_return_saved.footnote2);
		}
		
		if ($("#return_continue_form").length) {
			$("#return_continue_form b:eq(0)").html(form_settings.save_and_return_saved.instructions3);
			$("#return_continue_form button").html(form_settings.save_and_return_saved.continue);
		}
		
		// translate 'Enter email address' modal title/close button
		if ($("#sendLinkBtn").length) {
			var title = form_settings.save_and_return_modals.error_title;
			var body = form_settings.save_and_return_saved.email_input;
			var close = form_settings.save_and_return_modals.close;
			
			text = $("#sendLinkBtn").attr('onclick');
			// from base.js: function simpleDialog(content,title,id,width,onCloseJs,closeBtnTxt,okBtnJs,okBtnTxt) {
			
			simpleDialogCall = "simpleDialog('" + body + "','" + title + "',null,null,'document.getElementById(\"email\").focus();', '" + close + "');"
			$("#sendLinkBtn").attr('onclick', text.replace(/simpleDialog(.*);/, simpleDialogCall));
			
			// translate Email sent! modal title and body
			title = form_settings.save_and_return_modals.email_title || "Email sent";
			body = form_settings.save_and_return_modals.email_body || "The email was successfully sent to ";
			var arg_string = "'" + body + "', '" + title + "'";
			
			text = $("#sendLinkBtn").attr('onclick');
			text = text.replace(/'The email was successfully sent to', 'Email sent!'/, arg_string); 
			$("#sendLinkBtn").attr('onclick', text);
			
			// translate #email placeholder text
			if ($("#email").length) {
				var translation = form_settings.save_and_return_saved.email_input;
				$("#email").attr('value', translation);
				
				// update js on[x] events too
				text = $("#email").attr('onblur');
				var newOnBlur = text.replace(/Enter email address/g, translation);
				$("#email").attr('onblur', text.replace(/Enter email address/g, translation));
				
				text = $("#email").attr('onfocus');
				$("#email").attr('onfocus', text.replace(/Enter email address/g, translation));
				
				text = $("#email").attr('onclick');
				$("#email").attr('onclick', text.replace(/Enter email address/g, translation));
				
				// update #sendLinkBtn onclick
				text = $("#sendLinkBtn").attr('onclick');
				$("#sendLinkBtn").attr('onclick', text.replace(/'Enter email address'/g, "'" + translation + "'"));
			}
		}
		
		if ($('.ui-dialog-buttonpane').find('button').length) {
			$('.ui-dialog-buttonpane').find('button').html(form_settings.save_and_return_modals.close);
		}
		
		if ($('#return_code_form').length) {
			$('#return_code_form').find('button').html(form_settings.save_and_return_returned.submit_code);
		}
		
		errorDiv = $("div.red");
		if ($(errorDiv).length) {
			var errorTranslation = form_settings.save_and_return_returned.error
			var contents = $(errorDiv).html();
			$(errorDiv).html(contents.replace(/<b>.*<\/b>/, errorTranslation));
		}
		
		// translate start over section
		if ($("#start_over_form").length) {
			// start_over_instructions
			$("#start_over_form p").html(form_settings.save_and_return_returned.start_over_instructions);
			// start_over_button
			$("#start_over_form form input:eq(0)").val(form_settings.save_and_return_returned.start_over_button);
			// start_over_prompt
			var prompt_text = form_settings.save_and_return_returned.start_over_prompt;
			$("#start_over_form form input[type='submit']").attr('onclick', "return confirm('" + prompt_text + "');");
		}
	}
	
	function getSettings(){
		var data = {};
		data['todo'] = 3;
		data['project_id'] = pid;
		var json = encodeURIComponent(JSON.stringify(data));

		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				settings = r;
				
				// overwrite project-level settings with form-specific settings
				var sess_lang = getCookie('p1000Lang');
				if (settings.instruments) {
					settings.instruments = JSON.parse(settings.instruments.value)
					form_settings = settings.instruments[instrument_name]
					if (form_settings) {
						form_settings = form_settings[sess_lang];
					} else {
						form_settings = null;
					}
					
					// if (form_settings) {
						// var mapping = {
							// "save-return-page-title": {collection: 'save_and_return_saved', setting: 'title'},
							// "save-return-page-instructions": {collection: 'save_and_return_saved', setting: 'instructions1'},
							// "save-return-page-popup-return-code": {collection: 'save_and_return_saved', setting: 'return_code'},
							// "save-return-page-return-code-instructions": {collection: 'save_and_return_saved', setting: 'req_note'},
							// "save-return-page-survey-link-title": {collection: 'save_and_return_saved', setting: 'heading1'},
							// "save-return-page-email-instructions": {collection: 'save_and_return_saved', setting: 'instructions2'},
							// "save-return-page-email-button": {collection: 'save_and_return_saved', setting: 'send_link'},
							// "save-return-page-continue-title": {collection: 'save_and_return_saved', setting: 'instructions3'},
							// "save-return-later-continue-button": {collection: 'save_and_return_saved', setting: 'continue'},
							// "save-return-page-popup-title": {collection: 'save_and_return_modals', setting: 'intro_title'},
							// "save-return-page-survey-title": {collection: 'survey_settings', setting: 'title'},
							// "save-return-page-continue-text": {collection: 'save_and_return_returned', setting: 'instructions'},
							// "save-return-page-startover-text": {collection: 'save_and_return_returned', setting: 'start_over_instructions'},
							// "save-return-page-startover-button": {collection: 'save_and_return_returned', setting: 'start_over_button'}
						// };
						
						// for (let [name, entry] of Object.entries(mapping)) {
							// if (form_settings && form_settings[entry.collection] &&  form_settings[entry.collection][entry.setting]) {
								// settings[name]['value'] = [form_settings[entry.collection][entry.setting]]
								// console.log('saved setting ' + name + ':', form_settings[entry.collection][entry.setting])
							// }
						// }
					// } else {
						// form_settings = null;
					// }
				}
				
				translate();
			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
	}
	
	function getLanguages(){
		var data = {};
		data['todo'] = 2;
		data['project_id'] = pid;
		data['field_name'] = langVar;
		data['instrument'] = instrument_name;
		var json = encodeURIComponent(JSON.stringify(data));

		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				totalLanguages = Object.keys(languages).length;
				getSettings();
				
				//extend length of language cookie
				if(getCookie('p1000Lang') != '-1'){
					setCookie('p1000Lang', getCookie('p1000Lang'), 10);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
	}

	//generic functions
	function getVariable(variable){
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			   var pair = vars[i].split("=");
			   if(pair[0] == variable){return pair[1];}
		}
		return(false);
	}

	function setCookie(cname, cvalue, exdays) {
		var id;
		var key = '-1';
		for(id in languages){
			if(languages[id] == cvalue){
				key = id;
			}
		}

		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + key + "; " + expires;
	}

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return languages[c.substring(name.length,c.length)];
			}
		}

		return "-1";
	}

	function setNormalCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}

})();
