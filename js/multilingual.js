(function(){
	//load languages
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	
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
	var anyTranslated = false;
	var matrixProcessed = {};

	//document ready change language
	$( document ).ready(function(){
		translateReady();

		// slider instruction text
		$('.sldrmsg').each(function(){
			var horiz = $(this).parents('table.sldrparent').find('span[role="slider"]').attr('aria-orientation') == 'horizontal';
			$(this).html((horiz?'&#x2190;':'&#x2195;') + '<img alt="' + $(this).html() + '" src="APP_PATH_IMAGESpointer.png">' + (horiz?'&#x2192;':''));
		});

		//link to change language
		//$('#subheaderDiv2').append(' <div id="changeLang" style="display:none;">' + lang + '</div>');
		$('#dataEntryTopOptions').append(' <div id="changeLang" style="display:none;">' + lang + '</div>');

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
				var id = $(this).parents('tr[sq_id]').attr('id');
				if(id != undefined){
					errorChecking = 1;
					$('#redcapValidationErrorPopup').html('');
					setTimeout(function(){
						id = id.replace('-tr', '');
						if(translations['errors'] && translations['errors'][id] && translations['errors'][id]['text'] != ''){
							$('#redcapValidationErrorPopup').html(translations['errors'][id]['text']);
						}
						else{
							$('#redcapValidationErrorPopup').html('<center><span style="color:red;font-size:50px;">&#x26D4;</span></center>');
						}

						$('#redcapValidationErrorPopup').next().children().children().children().html('&#x2714;');

						$('.ui-dialog-title').each(function(){
							if($(this).is(':visible')){
								$(this).children().html('<img alt="Page" src="APP_PATH_IMAGESexclamation_frame.png">');
							}
						});
						errorChecking = 0;
					}, 200);
				}
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

	function addMustProvideValue(html, translation, tag)
	{
		if(settings['keep-must-provide-value']['value'])
		{
			// if html element not null.
			if(html.length <= 0)
				return translation;
			
			var requiredElement = html.find(tag);
			
			// if we found the must provide value tag then we need to copy it.
			if(requiredElement.length)
				translation += requiredElement.prop("outerHTML");
		}
		return translation;
	}

	//specific functions
	function translate(){
		if(langReady == 1 && !settings['empty']){
			clearInterval(interval);
			$('#changeLang').html(lang);
			$('#changeLang').show();

			if(lang.length > 2){
				$('#changeLang').css('width', (settings['button-width'] ? settings['button-width'] : '100px'));
				$('#changeLang').css('padding-left','8px');
				$('#changeLang').css('padding-right','8px');
			}
			else{
				$('#changeLang').css('width', (settings['button-width'] ? settings['button-width'] : '30px'));
				$('#changeLang').css('padding-left','');
				$('#changeLang').css('padding-right','');
			}
			$('#changeLang').css('background', (settings['background-color'] ? settings['background-color'] : ''));
			$('#changeLang').css('color', (settings['font-color'] ? settings['font-color'] : ''));
			$('#changeLang').css('opacity','1');

			//remove html
			$('.multilingual').remove();

			//questions
			var id;
			for(id in translations['questions']){
				if(translations['questions'][id]['matrix'] != null){
					if(!(translations['questions'][id]['matrix'] in matrixProcessed) && settings['hide-matrix-questions-without-translation']) {
						$('tr[mtxgrp="'+translations['questions'][id]['matrix']+'"].mtxfld').each(function(){
							var curMtxQuestionId = $(this).attr('id');
							curMtxQuestionId = curMtxQuestionId.replace('-tr', '');
							if(typeof translations['questions'][curMtxQuestionId] == 'undefined') {
								$(this).hide();
							} else {
								$(this).show();
							}
						});
						matrixProcessed[translations['questions'][id]['matrix']] = true;
					}
					var translation = addMustProvideValue($('#' + id + '-tr').children().children().children().children().children().children().children().children().children().children('td:first'), translations['questions'][id]['text'], ".requiredlabelmatrix");
					$('#' + id + '-tr').children().children().children().children().children().children().children().children().children().children('td:first').html(translation);
				}
				else if(translations['questions'][id]['type'] == 'descriptive'){
					//var tmp = $('#' + id + '-tr').children('td:first').html().split(/<(.+)/);
					//$('#' + id + '-tr').children('td:first').html(translations['questions'][id]['text'] + ' <' + tmp[1]);
					$('#' + id + '-tr').children('td:first').html(translations['questions'][id]['text']);
				}
				else{
					var translation = addMustProvideValue($('#' + id + '-tr').children().children().children().children().children().children('td:first'), translations['questions'][id]['text'], ".requiredlabel");
					$('#' + id + '-tr').children().children().children().children().children().children('td:first').html(translation);
				}
			}

			//answers
			for(id in translations['answers']){
				if(translations['answers'][id]['type'] == 'select'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('[name="' + id + '"] option').each(function(){
							$(this).show();
							if($(this).val() == id2){
								$(this).text(translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation'] && $(this).val() !== '' && $(this).data('lang') !== lang) {
								$(this).hide();
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
							$(this).parent().contents().last().show();
							$(this).show();
							if($(this).val() == id2){
								$(this).parent().contents().last().html(' ' + translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation'] && $(this).data('lang') !== lang) {
								$(this).parent().contents().last().hide();
								$(this).hide();
							}
						});
					}
				}
				else if(translations['answers'][id]['type'] == 'checkbox'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('#'+id+'-tr .choicevert').each(function(){
							$(this).show();
							if($(this).find('[name="__chk__' + id + '_RC_' + id2 + '"]').length) {
								$(this).contents().last().html(' ' + translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation'] && $(this).data('lang') !== lang) {
								$(this).hide();
							}
						});
					}
				}
				else if(translations['answers'][id]['type'] == 'slider'){
					if (translations['answers'][id]['text'][0] != null) $('#sldrlaba-' + id).html(translations['answers'][id]['text'][0]);
					if (translations['answers'][id]['text'][50] != null) $('#sldrlabb-' + id).html(translations['answers'][id]['text'][50]);
					if (translations['answers'][id]['text'][100] != null) $('#sldrlabc-' + id).html(translations['answers'][id]['text'][100]);
				}
				else{

				}
			}

			// field notes
			for(id in translations['notes']){
				$('#note-' + id).html(translations['notes'][id]['text']);
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
		
		var t;
		for(t in languages){
			if(languages[t] == lang){
				data['lang_id'] = t;
				break;
			}
		}
		
		var json = encodeURIComponent(JSON.stringify(data));

		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				if (!anyTranslated && (r == null || (r['questions'] == null && r['answers'] == null && r['notes'] == null))){
					clearInterval(interval);
					$('#changeLang').remove();
					setCookie('p1000Lang', 'en', -1);
				} else {
					translations = r;
					langReady = 1;
					anyTranslated = true;
					matrixProcessed = {};
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
		data['field_name'] = langVar;
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
