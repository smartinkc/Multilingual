(function(){
	//load languages
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	
	var project_id = getVariable('pid');
	//var languages = {1: 'en', 2: 'es', 3: 'fr'};
	var languages = {1: 'en', 2: 'es'};
	var totalLanguages = 2;
	var settings = {};
	settings['empty'] = true;
	var lang = 'en';
	var errorChecking = 0;

	//document ready change language
	$( document ).ready(function(){
		getLanguages();
		
		//extend length of language cookie
		if(getCookie('p1000Lang') != '-1'){
			setCookie('p1000Lang', getCookie('p1000Lang'), 10);
		}
		
		//error messages (invalid input in text boxes)
		$('body').on('blur', 'input', function(){
			if(errorChecking != 1){
				errorChecking = 1;
				$('#redcapValidationErrorPopup').html('');
				setTimeout(function(){
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
						$('#redcapValidationErrorPopup').next().children().children().children().html('&#x2714;');
					}

					$('.ui-dialog-title').each(function(){
						if($(this).is(':visible')){
							$(this).children().html('<img alt="Page" src="APP_PATH_IMAGESexclamation_frame.png">');
						}
					});
					errorChecking = 0;
				}, 200);
			}
		});
	});
	
	//functions
	function translate(){
		//get current language
		lang = getCookie('p1000Lang');
		var curLang = 0;
		var id;
		for(id in settings['save-return-later-lang']['value']){
			if(settings['save-return-later-lang']['value'][id] == lang){
				curLang = id;
				break;
			}
		}
		
		if($('#return_instructions').length && curLang > 0 && settings['save-return-page-popup-title']['value'][curLang]){
			//popup 
			$('#ui-id-1').html(settings['save-return-page-popup-title']['value'][curLang]);
			$('#codePopupReminderText').html(settings['save-return-page-popup-body']['value'][curLang]);
			var html = $('#codePopupReminderTextCode').html();
			html = html.split('<span');
			$('#codePopupReminderTextCode').html('<b>' + settings['save-return-page-popup-return-code']['value'][curLang] + ':</b> <span' + html[1]);
			$('.ui-dialog-buttonpane').find('button').html('&#x2716;');
			
			//return page-popup-body
			$('#return_instructions').find('h4').html('<b>' + settings['save-return-page-title']['value'][curLang]  + '</b>');
			
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
		}
		else if($('#surveytitle').length && curLang > 0 && settings['save-return-page-survey-title']['value'][curLang]){
			//continue page if cookie still set
			$('#surveytitle').html(settings['save-return-page-survey-title']['value'][curLang]);
			$('#return_code_form_instructions').html(settings['save-return-page-continue-text']['value'][curLang]);
			$('#return_code_form').find('button').html(settings['save-return-later-continue-button']['value'][curLang]);
			
			//start over
			$('#start_over_form').find('p').html(settings['save-return-page-startover-text']['value'][curLang]);
			$('#start_over_form').find('input').val(settings['save-return-page-startover-button']['value'][curLang]);
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
		var json = encodeURIComponent(JSON.stringify(data));

		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				totalLanguages = Object.keys(languages).length;
				
				getSettings();
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
