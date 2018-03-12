(function(){
	//load languages
	var ajax_url = 'REDCAP_AJAX_URL&NOAUTH';
	var project_id = getVariable('pid');
	//var languages = {1: 'en', 2: 'es', 3: 'fr'};
	var languages = {1: 'en', 2: 'es'};
	var totalLanguages = 2;
	getLanguages();
	var lang = 'en';
	var langReady = 0;
	var interval = null;
	var translations = {};

	//document ready change language
	$( document ).ready(function(){
		setNormalCookie('p1000pid', pid, .04);
		//listen for translations
		translateReady();
		
		//change out text for symbols
		symbols();
		
		//link to change
		$('#surveytitle').parent().append(' <div id="changeLang">' + lang + '</div>');
		
		//click function
		$('body').on('click', '.setLangButtons', function(){
			var tmp = $(this).attr('name');
			getLanguage(tmp);
		});
		
		$('body').on('click', '#changeLang', function(){
			if(langReady == 2){
				$('#changeLang').css('background','#505050');
				$('#changeLang').css('color','#CCCCCC');
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
		
		//signature and file upload dialogs
		$('body').on('click', '.fileuploadlink', function(){
			var id = $(this).parent().parent().parent().attr('id').replace('-tr','');
			
			setTimeout(function(){
				$('#field_name_popup').html('<b>' + translations['questions'][id]['text'] + '</b>');
				$('#signature-div-actions').children('button').html('&#x2714;');
				$('#f1_upload_form').children().first().html('');
				$('#f1_upload_form').children('input').val("✔");
				$('.ui-dialog-title').each(function(){
					if($(this).is(':visible')){
						$(this).html('<span style="font-size:25px;font-weight:bold;">+</span>');
					}
				});
				
				if(translations['answers'][id]['type'] == 'signature'){
					//signature error messages
					$('body').on('click', 'button', function a1(){	
						$('body').off('click', 'button', a1);
						setTimeout(function(){
							$('.ui-dialog-title').each(function(){
								if($(this).is(':visible') && $(this).html() == 'ERROR'){
									$(this).html('<span style="font-size:20px;font-weight:bold;">&#x26a0;</span>');
									if(translations['errors'][id]['text']){
										$(this).parent().next().html(translations['errors'][id]['text']);
									}
									$(this).parent().next().next().children().children().html("✔");
									return;
								}
							});			
						}, 10);
					});
				}
				else{
					//file upload error messages
					$('body').on('click', 'input[type="submit"]', function a2(){	
						$('body').off('click', 'input[type="submit"]', a2);
						setTimeout(function(){
							$('.ui-dialog-title').each(function(){
								if($(this).is(':visible') && $(this).html() == 'ERROR'){
									$(this).html('<span style="font-size:20px;font-weight:bold;">&#x26a0;</span>');
									if(translations['errors'][id]['text']){
										$(this).parent().next().html(translations['errors'][id]['text']);
									}
									$(this).parent().next().next().children().children().html("✔");
									return;
								}
							});
						}, 10);
					});
				}
			}, 500);
		});
		
		//error messages (invalid input in text boxes)
		$('body').on('blur', 'input', function(){
			if(!$('#file_upload').is(':visible') && $(this).attr('name') != 'submit-btn-saveprevpage'){
				var id = $(this).parent().parent().attr('id');
				if(id != undefined){
					id = id.replace('-tr','');
					$('#redcapValidationErrorPopup').html('');
					setTimeout(function(){ 
						if(translations['errors'][id] != undefined && translations['errors'][id]['text'] != ''){
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
						
					}, 200);
				}
			}
		});
		
		//startUp
		$('body').append('<div id="p1000Overlay" style="text-align:center;vertical-align:middle;display:none;z-index:10000;position:fixed;top:0px;bottom:0px;right:0px;left:0px;background-color:rgba(0, 0, 0, 0.7);"></div>');
		$('#p1000Overlay').append('<div id="p1000ChooseLang" style="display:none;position:absolute;top:30%;transform: translateY(-50%);left:50%;transform: translateX(-50%);"></div>');
		
		if(getCookie('p1000Lang') == "-1"){
			$('#p1000Overlay').fadeIn();
			$('#p1000ChooseLang').fadeIn();
		}
	});

	function translatePopup(){
		var tmp = $('#reqPopup').html();
		if(tmp != undefined){
			tmp = tmp.replace('Your data was successfully saved, but you did not provide a value for some fields that require a value.', '');
			tmp = tmp.replace('Please enter a value for the fields on this page that are listed below.<br><br>','');
			tmp = tmp.replace('Provide a value for...<br>', '');
			
			//replace text
			var id;
			for(id in translations['defaults']){
				if(tmp.indexOf(translations['defaults'][id]) > -1){
					if(translations['questions'][id] != undefined){
						tmp = tmp.replace(translations['defaults'][id], translations['questions'][id]['text']);
					}
				}
			}
			
			$('#reqPopup').html(tmp);
			setTimeout(function(){
				$('#ui-id-1').html('<span style="font-size:20px;font-weight:bold;">&#x26a0;</span>');
				$('#ui-id-2').html('<span style="font-size:20px;font-weight:bold;">&#x26a0;</span>');
				$('.ui-dialog-title').each(function(){
					if($(this).is(':visible')){
						$(this).html('<span style="font-size:20px;font-weight:bold;">&#x26a0;</span>');
					}
				});
				$('#reqPopup').next().children().children().html('&#x2714;');
			}, 300);
		}
	}

	//specific functions
	function symbols(){
		//reset
		$('.smalllink').each(function(){
		   $(this).html('&#x21ba;'); 
		});
		
		//submit
		$('[name="submit-btn-saverecord"]').children().html('&#x2714;');
		$('[name="submit-btn-saverecord"]').children().css('font-size','30px');
		
		//resize font
		$('#changeFont').children().eq(0).html('<span style="font-size:14px;">A</span> <span style="font-size:12px;">A</span> <span style="font-size:10px;">A</span>');
		
		//popup
		$('#redcapValidationErrorPopup').html('<center><span style="color:red;font-size:50px;">&#x26D4;</span></center>');
		
		//previous page
		$('.ui-button-text').each(function(){
			if($(this).html() == '&lt;&lt; Previous Page'){
				$(this).css('font-size','32px');
				$(this).html('&lt;&lt;');
			}
		});
	}

	function translate(){
		if(langReady == 1){
			clearInterval(interval);
			
			//add buttons to startUp
			if($('#p1000Overlay').is(':visible') && $('#p1000ChooseLang').html() == ''){
				var i;
				for(i in languages){
					$('#p1000ChooseLang').append('<p><div class="setLangButtons" id="changeLang1" name="' + languages[i] + '" style="display:none;float:left;width:100px;margin-top:20px;" onclick="$(\'#p1000Overlay\').fadeOut();$(\'#p1000ChooseLang\').fadeOut();">' + languages[i] + '</div></p>');
				}
				
				var timing = 300;
				$('.setLangButtons').each(function(){
					$(this).fadeIn(timing);
					timing += 100;
				});
			}
			
			//required fields popup
			translatePopup();
			
			$('#changeLang').html(lang);
			if(lang.length > 2){
				$('#changeLang').css('width','100px');
				$('#changeLang').css('padding-left','8px');
				$('#changeLang').css('padding-right','8px');
			}
			else{
				$('#changeLang').css('width','30px');
				$('#changeLang').css('padding-left','');
				$('#changeLang').css('padding-right','');
			}
			$('#changeLang').css('background','');
			$('#changeLang').css('color','');
			
			//remover required english label
			$('.requiredlabel').remove();
			$('.multilingual').remove();
			
			//questions
			var id;
			for(id in translations['questions']){
				if(translations['questions'][id]['matrix'] != null){
					$('#' + id + '-tr').children('td').eq(1).children('table').children().children().children('td:first').html(translations['questions'][id]['text']);
				}
				else{
					$('#label-' + id).html(translations['questions'][id]['text']);
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
					$('#' + id + '-tr').children().last().children().eq(1).children().html(translations['answers'][id]['text'][0]);
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
						//translations['answers'][id]['text'][id2]);
						//$('#' + translations['answers'][id]['matrix'] + '-mtxhdr-tr').children('td').eq(1).children().children().children().children('td').eq(counter).html(translations['answers'][id]['text'][id2]);
						$('#matrixheader-' + translations['answers'][id]['matrix'] + '-' + id2).html(translations['answers'][id]['text'][id2]);
						counter++;
					}
				}
				else if(translations['answers'][id]['type'] == 'radio' || translations['answers'][id]['type'] == 'yesno' || translations['answers'][id]['type'] == 'truefalse'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('[name="' + id + '___radio"]').each(function(){
							if($(this).val() == id2){
								$(this).parent().contents().last().replaceWith(' ' + translations['answers'][id]['text'][id2]);
							}
						});
					}
					//enhanced radio buttons
					for(id2 in translations['answers'][id]['text']){
						$('.ec').each(function(){
							var tmp = $(this).parent().attr('comps').split(',');
							if(tmp[0] == id && tmp[2] == id2){
								$(this).html(translations['answers'][id]['text'][id2]);
							}
						});
					}
				}
				else if(translations['answers'][id]['type'] == 'checkbox'){
					var id2;
					for(id2 in translations['answers'][id]['text']){
						$('[name="__chk__' + id + '_RC_' + id2 + '"]').each(function(){
							$(this).parent().contents().last().replaceWith(' ' + translations['answers'][id]['text'][id2]);
						});
					}
					//enhanced checkboxes
					for(id2 in translations['answers'][id]['text']){
						$('.ec').each(function(){
							var tmp = $(this).parent().attr('comps').split(',');
							if(tmp[0] == id && tmp[2] == id2){
								$(this).html(translations['answers'][id]['text'][id2]);
							}
						});
					}
				}
				else{
				
				}
			}
			
			//survey text (title, instructions, message)
			for(id in translations['surveytext']){
				if(translations['surveytext'] != undefined){
					if(translations['surveytext'][id] != null){
						$('#' + id).html(translations['surveytext'][id]);
					}
				}
			}
			
			//layout
			$('body').css('direction', translations['layout']);
			
			langReady = 2;
		}
	}

	function translateReady(){
		interval = setInterval(translate, 200);
	}

	function getLanguage(newLang){
		langReady = 0;
		if(newLang == null){
			lang = getCookie('p1000Lang');
			
			if(lang == "-1"){
				lang = languages[1];
				//setCookie('p1000Lang', lang, .04);
			}
		}
		else{
			setCookie('p1000Lang', newLang, .04);
			lang = newLang;
			translateReady();
		}
		
		//set languages variable to current language
		$('[name="languages"] option').each(function(){
			if($(this).text() == lang){
				$(this).prop('selected', true);
			}
		});
		
		getTranslations();
	}

	function getTranslations(){
		langReady = 0;
		var data = {};
		data['todo'] = 1;
		data['lang'] = lang;
		data['project_id'] = pid;
		data['record_id'] = $('#record_id').val();
		data['event_id'] = event_id;
		data['page'] = $('#surveytitle').html().replace(/ /g,'_').toLowerCase();
		
		//pull survey page name
		$('input').each(function(){
			if($(this).attr('name') && $(this).attr('name').indexOf('_complete') > -1){
				data['page'] = $(this).attr('name').replace('_complete','');
			}
		});
		
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
					
					//hide if no translations
					if(r['questions'] == null){
						$('#p1000Overlay').hide();
						$('#changeLang').remove();
						setCookie('p1000Lang', 'en', -1);
					}
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
