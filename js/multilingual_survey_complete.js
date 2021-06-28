(function(){
	var pdf_url = 'REDCAP_PDF_URL';
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	
	var translations = {};
	var languages = {};
	var lang = getCookie('p1000Lang');
	var settings = {};
	getLanguages();
	
	$( document ).ready(function(){
		if(pdf_url.substring(0, 5) != 'false'){
			downloadPDF();
		}
	});
	
	function downloadPDF(){
		$('button').each(function(){
			if($(this).find('span').html() == 'Download'){
				$(this).attr('onclick', 'window.open("' + pdf_url + '&langIndex=' + lang + '");');
			}
		});
	}

	function getTranslations(){
		langReady = 0;
		var data = {};
		data['todo'] = 1;
		data['lang'] = languages[lang];
		data['project_id'] = getCookie('p1000pid');
		data['page'] = 'finish'
		
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
			
				if (r != null) {
					translations = r;
					var id;
					for(id in translations['surveytext']){
						if(translations['surveytext'] != undefined){
							if(translations['surveytext'][id] != null){
								$('#' + id).html(translations['surveytext'][id]);
							}
						}
					}
					setTimeout(function(){
						$('.ui-button-text:contains("Close survey")').html('&times;');//&#x274c;');
					}, 100);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
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
	
	function translate(){
		var lang = getCookie('p1000Lang');
		var curLang = 0;
		var id;
		for(id in settings['save-return-later-lang']){
			if(settings['save-return-later-lang'][id] == languages[lang]){
				curLang = id;
				break;
			}
		}
		
		var html = $('#return_code_completed_survey_div').html();
		if(html != undefined && html != '' && settings['save-return-page-complete-text'][curLang]){
			//text
			html = html.split('<div');
			html[0] = settings['save-return-page-complete-text'][curLang];
			
			//return code text
			var h = html[1].split('<span');
			html[1] = '>' + settings['save-return-page-popup-return-code'][curLang] + ': <span' + h[1];
			
			$('#return_code_completed_survey_div').html(html[0] + '<div' + html[1]);
		}
		
		setCookie('p1000Lang', 'en', -1);
		setCookie('p1000pid', '1', -1);
	}

	function getLanguages(){
		var data = {};
		data['todo'] = 2;
		data['project_id'] = getCookie('p1000pid');
		data['field_name'] = langVar;
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				getTranslations();
				getSettings();
			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
	}

	function setCookie(cname, cvalue, exdays) {	
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
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
				return c.substring(name.length,c.length);
			}
		}

		return "-1";
	}
})();
