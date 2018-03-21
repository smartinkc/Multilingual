(function(){
	//load languages
	var ajax_url = 'REDCAP_AJAX_URL';
	var page = getVariable('page');
	var project_id = getVariable('pid');
	var languages = {1: 'en', 2: 'es'};
	var totalLanguages = 2;
	var settings = {};
	settings['empty'] = true;
	getSettings();
	getLanguages();
	var lang = 'en';
	var langReady = 0;
	var interval = null;
	var translations = {};
	var errorChecking = 0;

	//document ready change language
	$( document ).ready(function(){
		translateReady();
		//link to change
		$('#subheaderDiv2').append(' <div id="changeLang" style="display:none;">' + lang + '</div>');
		
		//click function
		$('body').on('click', '#changeLang', function(){
			if(langReady == 2){
				$('#changeLang').css('background','#505050');
				$('#changeLang').css('color','#CCCCCC');
				$('#changeLang').css('opacity','0.5');
				langReady = 0;
				var id;
				for(id in languages){
					if(languages[id] == lang){
						break;
					}
				}
				id++;
				if(id == (totalLanguages + 1)){
					id = 1;
				}
				getLanguage(languages[id]);
			}
		});
		
		//error messages
		$('body').on('blur', 'input', function(){
			if($(this).attr('type') != 'radio' && $(this).attr('type') != 'checkbox' && errorChecking != 1){
				errorChecking = 1;
				var id = $(this).parent().parent().attr('id').replace('-tr','');
				$('#redcapValidationErrorPopup').html('');
				setTimeout(function(){ 
					if(translations['errors'][id] && translations['errors'][id]['text'] != ''){
						$('#redcapValidationErrorPopup').html(translations['errors'][id]['text']);
					}
					else{
						$('#redcapValidationErrorPopup').html('<center><span style="color:red;font-size:50px;">&#x26D4;</span></center>');
					}
					
					$('#redcapValidationErrorPopup').next().children().children().children().html('&#x2714;');
						
					$('.ui-dialog-title').each(function(){
						if($(this).is(':visible')){
							$(this).children().html('<span style="font-size:20px;font-weight:bold;">&#x26a0;</span>');
						}
					});
					errorChecking = 0;
				}, 200);
			}
		});
	});
	
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
			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
	}

	//specific functions
	function translate(){
		if(langReady == 1 && !settings['empty']){
			clearInterval(interval);
			$('#changeLang').html(lang);
			$('#changeLang').show();
			
			if(lang.length > 2){
				$('#changeLang').css('width', (settings['button-width'] && settings['button-width']['value'] ? settings['button-width']['value'] : '100px'));
				$('#changeLang').css('padding-left','8px');
				$('#changeLang').css('padding-right','8px');
			}
			else{
				$('#changeLang').css('width', (settings['button-width'] && settings['button-width']['value'] ? settings['button-width']['value'] : '30px'));
				$('#changeLang').css('padding-left','');
				$('#changeLang').css('padding-right','');
			}
			$('#changeLang').css('background', (settings['background-color'] && settings['background-color']['value'] ? settings['background-color']['value'] : ''));
			$('#changeLang').css('color', (settings['font-color'] && settings['font-color']['value'] ? settings['font-color']['value'] : ''));
			$('#changeLang').css('opacity','1');
			
			//questions
			var id;
			for(id in translations['questions']){
				if(translations['questions'][id]['matrix'] != null){
					$('#' + id + '-tr').children().children().children().children().children().children().children().children().children().children('td:first').html(translations['questions'][id]['text']);
				}
				else if(translations['questions'][id]['type'] == 'descriptive'){
					var tmp = $('#' + id + '-tr').children('td:first').html().split(/<(.+)/);
					$('#' + id + '-tr').children('td:first').html(translations['questions'][id]['text'] + ' <' + tmp[1]);
				}
				else{
					$('#' + id + '-tr').children().children().children().children().children().children('td:first').html(translations['questions'][id]['text']);
				}
			}
			
			//answers
			for(id in translations['answers']){
				if(translations['answers'][id]['type'] == 'select'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('[name="' + id + '"] option').each(function(){
							if($(this).val() == id2){
								$(this).text(translations['answers'][id]['text'][id2]);
							}
						});
					}
				}
				else if(translations['answers'][id]['type'] == 'date'){
					$('#' + id + '-tr').children().last().children().eq(2).children().html(translations['answers'][id]['text'][0]);
				}
				else if(translations['answers'][id]['type'] == 'signature'){
					$('#' + id + '-tr').children().last().children().eq(3).children().eq(1).html(translations['answers'][id]['text'][0]);
				}
				else if(translations['answers'][id]['type'] == 'file'){
					$('#' + id + '-tr').children().last().children().eq(2).children().eq(1).html(translations['answers'][id]['text'][0]);
				}
				else if(translations['answers'][id]['matrix'] != null){
					var id2;
					var counter = 1;
					for(id2 in translations['answers'][id]['text']){
						//$('#' + translations['answers'][id]['matrix'] + '-mtxhdr-tr').children('td').eq(0).children().children().children().children('td').eq(counter).html(translations['answers'][id]['text'][id2]);
						$('#matrixheader-' + translations['answers'][id]['matrix'] + '-' + id2).html(translations['answers'][id]['text'][id2]);
						counter++;
					}
				}
				else if(translations['answers'][id]['type'] == 'radio' || translations['answers'][id]['type'] == 'yesno' || translations['answers'][id]['type'] == 'truefalse'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('[name="' + id + '___radio"]').each(function(){
							if($(this).val() == id2){
								//$(this).parent().contents().last().replaceWith(' ' + translations['answers'][id]['text'][id2]);
								$(this).parent().contents().last().html(' ' + translations['answers'][id]['text'][id2]);
							}
						});
					}
				}
				else if(translations['answers'][id]['type'] == 'checkbox'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('[name="__chk__' + id + '_RC_' + id2 + '"]').each(function(){
							//$(this).parent().contents().last().replaceWith(' ' + translations['answers'][id]['text'][id2]);
							$(this).parent().contents().last().html(' ' + translations['answers'][id]['text'][id2]);
						});
					}
				}
				else{
				
				}
			}
			langReady = 2;
			
			piping();
		}
	}
	
	function piping(){
		$('.piping_receiver').each(function(){
			var classes = $(this).attr('class').split(' ');
			var tmp;
			var tmp2;
			for(tmp in classes){
				if(classes[tmp].indexOf('piperec') > -1){
					tmp2 = classes[tmp].split('-');
					if($('[name="' + tmp2[2] + '"]').val() != ''){
						$(this).html($('[name="' + tmp2[2] + '"]').val());
					}
				}
			}
		});
	}

	function translateReady(){
		interval = setInterval(translate, 100);
	}

	function getLanguage(newLang){
		langReady = 0;
		if(newLang == null){
			lang = getCookie('p1000Lang');
			
			if(lang == "-1"){
				lang = languages[1];
				setCookie('p1000Lang', lang, 30);
			}
		}
		else{
			setCookie('p1000Lang', newLang, 30);
			lang = newLang;
			translateReady();
		}
		
		getTranslations();
	}

	function getTranslations(){
		langReady = 0;
		var data = {};
		data['todo'] = 1;
		data['lang'] = lang;
		data['project_id'] = (project_id ? project_id : pid);
		data['record_id'] = $('[name="' + table_pk + '"]').val();
		data['event_id'] = event_id;
		data['page'] = (page ? page : $('#surveytitle').html().replace(/ /g,'_').toLowerCase());
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				if(r == null){
					clearInterval(interval);
					$('#changeLang').remove();
					setCookie('p1000Lang', 'en', -1);
				}
				else{
					translations = r;
					langReady = 1;
				}
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
		data['field_name'] = 'languages';
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				totalLanguages = Object.keys(languages).length;
				getLanguage();
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

	function setCookie(cname, cvalue, exdays){
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}

	function getCookie(cname){
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