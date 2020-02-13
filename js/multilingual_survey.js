(function(){
	//load languages
	var pdf_url = 'REDCAP_PDF_URL';
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	
	var project_id = getVariable('pid');
	//var languages = {1: 'en', 2: 'es', 3: 'fr'};
	var languages = {1: 'en', 2: 'es'};
	var totalLanguages = 2;
	var settings = {};
	settings['empty'] = true;
	loadSettings();
	var lang = 'en';
	var langReady = 0;
	var interval = null;
	var translations = {};
	var errorChecking = 0;
	var anyTranslated = false;

	//document ready change language
	$( document ).ready(function(){
		setNormalCookie('p1000pid', pid, .04);
		//listen for translations
		translateReady();

		//change out text for symbols
		symbols();

		//link to change
		$('#surveytitle').parent().append(' <div id="changeLang" style="display:none;">' + lang + '</div>');

		//click function
		$('body').on('click', '.setLangButtons', function(){
			var tmp = $(this).attr('name');
			getLanguage(tmp);
		});

		$('body').on('click', '#changeLang', function(){
			if(langReady == 2){
				$('#changeLang').css('background','#505050');
				$('#changeLang').css('color','#CCCCCC');
				$('#changeLang').css('opacity','0.5');
				
				//if show start screen is checked, show all languages when changing language
				if(settings['show-start-screen'] && settings['show-start-screen']['value'] == true){
					$('#p1000Overlay').show();
					$('#p1000ChooseLang').show();
					
					if($('#p1000ChooseLang').html() == ''){
						addLanguageButtons();
						if(settings['start-screen-width'] && settings['start-screen-width']['value']){
							$('#p1000ChooseLang').css('width', settings['start-screen-width']['value']);
						}
					}
				}
				else{
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
			if(!$('#file_upload').is(':visible') && $(this).attr('name') != 'submit-btn-saveprevpage' && errorChecking != 1){
				errorChecking = 1;
				var id = $(this).parents('tr[sq_id]').attr('id');
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
			}
		});

		//startUp
		$('body').append('<div id="p1000Overlay" style="text-align:center;vertical-align:middle;display:none;z-index:10000;position:fixed;top:0px;bottom:0px;right:0px;left:0px;background-color:rgba(0, 0, 0, 0.7);"></div>');
		$('#p1000Overlay').append('<div id="p1000ChooseLang" style="display:none;position:fixed;top:50%;left:50%;transform: translate(-50%, -50%);width:;"></div>');
	});
	
	function econsent_pdf(){
		var id = 0;
		for(id in languages){
			if(languages[id] == lang){
				break;
			}
		}
		
		//change iframe source
		$('iframe').each(function(){
			if($(this).attr('src').indexOf('compact=1') > -1){
				//console.log(pdf_url + '&langIndex=' + id + '&display=1');
				//$(this).attr('src', pdf_url + '&langIndex=' + id + '&display=1');
				$(this).src = pdf_url + '&langIndex=' + id + '&display=1';
				$(this).parent().attr('data', pdf_url + '&langIndex=' + id + '&display=1');
			}
		});
		
		//change econsent checkbox text
		if($('#econsent_confirm_checkbox_label').is(':visible')){
			for(id in settings['encoding-language']['value']){
				if(settings['encoding-language']['value'][id] == lang){
					break;
				}
			}
			
			if(settings['econsent-checkbox-text']['value'][id]){
				$('#econsent_confirm_checkbox_label').html('<input type="checkbox" id="econsent_confirm_checkbox"> ' + settings['econsent-checkbox-text']['value'][id]);
			}
		}
	}

	function loadSettings(){
		// Get Settings JSON
		var data = {};
		data['todo'] = 3;
		data['project_id'] = pid;
		var json = encodeURIComponent(JSON.stringify(data));

		// Get Languages JSON
		var data2 = {};
		data2['todo'] = 2;
		data2['project_id'] = pid;
		data2['field_name'] = langVar;
		var json2 = encodeURIComponent(JSON.stringify(data2));

		$.when(
			// Get Settings
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
			}),
			// Get Languages
			$.ajax({
				url: ajax_url,
				type: 'POST',
				data: 'data=' + json2,
				success: function (r) {
					languages = r;
					totalLanguages = Object.keys(languages).length;
					getLanguage();
				},
				error: function(jqXHR, textStatus, errorThrown) {
				   console.log(textStatus, errorThrown);
				}
			})
		).then(function() {
			// Now that settings and language calls are complete process survey control text
			stopText();
			controlText();
		});
	}

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

		//popup
		$('#redcapValidationErrorPopup').html('<center><span style="color:red;font-size:50px;">&#x26D4;</span></center>');

		//previous page
		$('.ui-button-text').each(function(){
			if($(this).html() == '&lt;&lt; Previous Page'){
				$(this).css('font-size','20px');
				$(this).html('&lt;&lt;');
			}
		});

		// slider instruction text
		$('.sldrmsg').each(function(){
			var horiz = $(this).parents('table.sldrparent').find('span[role="slider"]').attr('aria-orientation') == 'horizontal';
			$(this).html((horiz?'&#x2190;':'&#x2195;') + '<img alt="' + $(this).html() + '" src="APP_PATH_IMAGESpointer.png">' + (horiz?'&#x2192;':''));
		});
	}
	
	function stopText(){
		var id;
		var langKey = -1;
		if(settings['stop-text-lang']){
			for(id in settings['stop-text-lang']['value']){
				if(lang == settings['stop-text-lang']['value'][id]){
					langKey = id;
					break;
				}
			}
		}
		
		if(langKey > -1){
			//title
			$('#stopActionPrompt').attr('title', '<img alt="Page" src="APP_PATH_IMAGESexclamation_frame.png">');
			
			//body
			$('#stopActionPrompt').html(settings['stop-text-body']['value'][langKey]);
			
			//stop button
			stopAction1 = settings['stop-text-stop-button']['value'][langKey];
			
			//continue buttons
			stopAction2 = settings['stop-text-continue-button']['value'][langKey];
			stopAction3 = settings['stop-text-continue-button']['value'][langKey];
			
			//return
			$('#stopActionReturn').attr('title', '<img alt="Page" src="APP_PATH_IMAGESexclamation_frame.png">');
			$('#stopActionReturn').html(settings['stop-text-return-body']['value'][langKey]);
		}
		
		//save and return
		langKey = -1;
		if(settings['save-return-later-lang']){
			for(id in settings['save-return-later-lang']['value']){
				if(lang == settings['save-return-later-lang']['value'][id]){
					langKey = id;
					break;
				}
			}
		}
		
		if(langKey > -1){
			//save and return button
			$('[name="submit-btn-savereturnlater"]').html(settings['save-return-later-button']['value'][langKey]);
			
			//save and return corner
			$('#return_corner').html(settings['save-return-later-corner']['value'][langKey]);
			
			//save and return continue button
			var b = '';
			var t = '';
			try{
				t = $('#dpop').children().children().children(1).children().children().children().children().find('button')[0].innerHTML;
				b = $('#dpop').children().children().children(1).children().children().children().children().find('button')[0].outerHTML.replace(t, settings['save-return-later-continue-button']['value'][langKey]);
			}
			catch(e){
				//console.log(e.message);
			}
			
			//save and return popup text
			$('#dpop').children().children().children(1).children().children().children().children().html(settings['save-return-later-text']['value'][langKey] + '<br>' + b);
		}
	}

	function controlText(){
		// Define symbols
		var prevArrow = "<<";
		var nextArrow = ">>";
		var submitCheck = "&#x2714;";
		var resetSymbol = "&#x21ba;";
		var fontSizeSymbol = '<span style="font-size:150%;">A</span> <span style="font-size:125%;">A</span> <span style="font-size:100%;">A</span>';
		var pageSymbol = '<img alt="Page" src="APP_PATH_IMAGESblog_pencil.png">';

		// Survey Controls
		langKey = -1;
		if(settings['survey-control-lang']){
			for(id in settings['survey-control-lang']['value']){
				if(lang == settings['survey-control-lang']['value'][id]){
					langKey = id;
					break;
				}
			}
		}
		
		if($('[name="submit-btn-saverecord"]').text() == "Submit") {
			$('[name="submit-btn-saverecord"]').addClass('multilingual-final-submit');
		}

		if(langKey > -1){
			// Prev/Next/Submit buttons
			var showArrows = true;
			if($('[name="submit-btn-saverecord"]').hasClass('multilingual-final-submit')) {
				// Submit Button
				$('[name="submit-btn-saverecord"]').html((settings['survey-control-submit']['value'][langKey] ? settings['survey-control-submit']['value'][langKey] : submitCheck ));
			} else {
				// Next Button
				$('[name="submit-btn-saverecord"]').html((settings['survey-control-next']['value'][langKey] ? settings['survey-control-next']['value'][langKey]+(showArrows ? " "+nextArrow : "") : nextArrow ));
			}
			
			// Prev Button
			$('[name="submit-btn-saveprevpage"]').html((settings['survey-control-prev']['value'][langKey] ? (showArrows ? prevArrow+" " : "")+settings['survey-control-prev']['value'][langKey] : prevArrow ));


			var showSymbols = true;
			// Reset
			$('.smalllink').each(function(){
				$(this).html((showArrows ? "&#x21ba; " : "")+settings['survey-control-reset']['value'][langKey]);
			});

			//resize font
			$('#changeFont').children().eq(0).html((settings['survey-control-font-size']['value'][langKey] ? settings['survey-control-font-size']['value'][langKey] : fontSizeSymbol ));

			//page number
			if($('#surveypagenum').is(':visible')){
				if($('#surveypagenum').hasClass('multilingual-translated')) {
					var curPage = $('#surveypagenum .multilingual-cur-page').text();
					var maxPage = $('#surveypagenum .multilingual-max-page').text();
				} else {
					var tmp = $('#surveypagenum').html().split(' ');
					var curPage = tmp[1];
					var maxPage = tmp[3];
					$('#surveypagenum').addClass('multilingual-translated');
				}
				var surveyControlPageNumber = settings['survey-control-page-number']['value'][langKey];
				if(surveyControlPageNumber.includes("CURRENTPAGE") && surveyControlPageNumber.includes("MAXPAGE")) {
					surveyControlPageNumber = surveyControlPageNumber.replace("CURRENTPAGE", '<span class="multilingual-cur-page">'+curPage+'</span>').replace("MAXPAGE", '<span class="multilingual-max-page">'+maxPage+'</span>');
				} else if(surveyControlPageNumber.includes("CURRENTPAGE") ) {
					surveyControlPageNumber = surveyControlPageNumber.replace("CURRENTPAGE", '<span class="multilingual-cur-page">'+curPage+'</span>');
					surveyControlPageNumber += '<span class="multilingual-max-page" style="display: none;">'+maxPage+'</span>';
				} else {
					surveyControlPageNumber = pageSymbol+' <span class="multilingual-cur-page">' + curPage + '</span> / <span class="multilingual-max-page">' + maxPage + '</span>';
				}
				$('#surveypagenum').html(surveyControlPageNumber);
			}
		} else {
			// If there is no data for this language then use symbols

			//submit
			$('[name="submit-btn-saverecord"]').html(submitCheck);
			$('[name="submit-btn-saverecord"]').css('font-size','20px');
			
			//previous button
			$('[name="submit-btn-saveprevpage"]').html(prevArrow);
			$('[name="submit-btn-saveprevpage"]').css('font-size','20px');

			//reset
			$('.smalllink').each(function(){
				$(this).html(resetSymbol);
			});

			//resize font
			$('#changeFont').children().eq(0).html(fontSizeSymbol);

			//page number
			if($('#surveypagenum').is(':visible')){
				if($('#surveypagenum').hasClass('multilingual-translated')) {
					var curPage = $('#surveypagenum .multilingual-cur-page').text();
					var maxPage = $('#surveypagenum .multilingual-max-page').text();
				} else {
					var tmp = $('#surveypagenum').html().split(' ');
					var curPage = tmp[1];
					var maxPage = tmp[3];
					$('#surveypagenum').addClass('multilingual-translated');
				}
				$('#surveypagenum').html(pageSymbol+' <span class="multilingual-cur-page">' + curPage + '</span> / <span class="multilingual-max-page">' + maxPage + '</span>');
			}
		}
	}
	
	function addLanguageButtons(){
		var i;
		for(i in languages){
			//id="changeLang1"
			$('#p1000ChooseLang').append('<p><div class="setLangButtons" name="' + languages[i] + '" style="display:none;float:left;width:' + (settings['button-width'] && settings['button-width']['value'] ? settings['button-width']['value'] : '100px') + ';color:' + (settings['font-color'] && settings['font-color']['value'] ? settings['font-color']['value'] : '') + ';background:' + (settings['background-color'] && settings['background-color']['value'] ? settings['background-color']['value'] : '') + ';margin-top:20px;" onclick="$(\'#p1000Overlay\').fadeOut();$(\'#p1000ChooseLang\').fadeOut();">' + languages[i] + '</div></p>');
		}
		
		var timing = 300;
		$('.setLangButtons').each(function(){
			$(this).fadeIn(timing);
			timing += 150;
		});
	}

	function translate(){
		if(langReady == 1 && !settings['empty']){
			clearInterval(interval);
			$('#changeLang').show();

			//add buttons to startUp
			if($('#p1000Overlay').is(':visible') && $('#p1000ChooseLang').html() == ''){
				//set width of start up screen (expand when using many languages)
				if(settings['start-screen-width'] && settings['start-screen-width']['value']){
					$('#p1000ChooseLang').css('width', settings['start-screen-width']['value']);
				}
				
				addLanguageButtons();
				/* var i;
				for(i in languages){
					$('#p1000ChooseLang').append('<p><div class="setLangButtons" id="changeLang1" name="' + languages[i] + '" style="display:none;float:left;width:' + (settings['button-width'] && settings['button-width']['value'] ? settings['button-width']['value'] : '100px') + ';color:' + (settings['font-color'] && settings['font-color']['value'] ? settings['font-color']['value'] : '') + ';background:' + (settings['background-color'] && settings['background-color']['value'] ? settings['background-color']['value'] : '') + ';margin-top:20px;" onclick="$(\'#p1000Overlay\').fadeOut();$(\'#p1000ChooseLang\').fadeOut();">' + languages[i] + '</div></p>');
				}

				var timing = 300;
				$('.setLangButtons').each(function(){
					$(this).fadeIn(timing);
					timing += 150;
				}); */
			}

			//required fields popup
			translatePopup();

			$('#changeLang').html(lang);
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

			//remove required english label
			$('.requiredlabel').remove();
			$('.multilingual').remove();

			//questions
			var id;
			for(id in translations['questions']){
				if(translations['questions'][id]['matrix'] != null){
					//$('#' + id + '-tr').children('td').eq(1).children('table').children().children().children('td:first').html(translations['questions'][id]['text']);
					$('#label-' + id).html(translations['questions'][id]['text']);
				}
				else if(translations['questions'][id]['type'] == 'descriptive'){
					var tmp = $('#' + id + '-tr').children('td').eq(1).html();
					if(tmp != undefined){
						$('#' + id + '-tr').children('td').eq(1).html(translations['questions'][id]['text']);
						//tmp = tmp.split(/<(.+)/);
						//$('#' + id + '-tr').children('td').eq(1).html(translations['questions'][id]['text'] + ' <' + tmp[1]);
					}
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
							$(this).show();
							if($(this).val() == id2){
								$(this).text(translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation-survey']['value'] && $(this).val() !== '' && $(this).data('lang') !== lang) {
								$(this).hide();
							}
						});
					}
				}
				else if(translations['answers'][id]['type'] == 'date' || translations['answers'][id]['type'] == 'time'){
					//$('#' + id + '-tr').children().last().children().eq(2).children().html(translations['answers'][id]['text'][0]);
					//$('#' + id + '-tr').children().last().children().eq(1).children().html(translations['answers'][id]['text'][0]);
					$('#' + id + '-tr').find('button').html(translations['answers'][id]['text'][0]);
				}
				else if(translations['answers'][id]['type'] == 'signature'){
					$('#' + id + '-tr').children().last().children().eq(3).children().eq(1).html(translations['answers'][id]['text'][0]);
				}
				else if(translations['answers'][id]['type'] == 'file'){
					$('#' + id + '-tr').children().last().children().eq(2).children().eq(1).html(translations['answers'][id]['text'][0]);
				}
				else if(translations['answers'][id]['type'] == 'slider'){
					if (translations['answers'][id]['text'][0] != null) $('#sldrlaba-' + id).html(translations['answers'][id]['text'][0]);
					if (translations['answers'][id]['text'][50] != null) $('#sldrlabb-' + id).html(translations['answers'][id]['text'][50]);
					if (translations['answers'][id]['text'][100] != null) $('#sldrlabc-' + id).html(translations['answers'][id]['text'][100]);
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
							$(this).parent().contents().last().show();
							$(this).show();
							if($(this).val() == id2){
								$(this).parent().contents().last().html(' ' + translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation-survey']['value'] && $(this).data('lang') !== lang) {
								$(this).parent().contents().last().hide();
								$(this).hide();
							}
						});
					}
					//enhanced radio buttons
					for(id2 in translations['answers'][id]['text']){
						$('.ec').each(function(){
							var tmp = $(this).parent().attr('comps').split(',');
							$(this).show();
							if(tmp[0] == id && tmp[2] == id2) {
								$(this).html(' ' + translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation-survey']['value'] && $(this).data('lang') !== lang) {
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
							} else if(settings['hide-answers-without-translation-survey']['value'] && $(this).data('lang') !== lang) {
								$(this).hide();
							}
						});
					}
					//enhanced checkboxes
					for(id2 in translations['answers'][id]['text']){
						$('.ec').each(function(){
							var tmp = $(this).parent().attr('comps').split(',');
							$(this).show();
							if(tmp[0] == id && tmp[2] == id2) {
								$(this).html(translations['answers'][id]['text'][id2]);
								$(this).data('lang', lang);
							} else if(settings['hide-answers-without-translation-survey']['value'] && $(this).data('lang') !== lang) {
								$(this).hide();
							}
						});
					}
				}
				else{

				}
			}

			// field notes
			for(id in translations['notes']){
				$('#note-' + id).html(translations['notes'][id]['text']);
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
			if(translations['layout'] == 'rtl'){
				$('td').each(function(){
					$(this).attr('align', 'right');
				});

				$('p').each(function(){
					$(this).css('text-align','right');
				});

				$('#surveytitle').css('text-align','right');
				$('#surveyinstructions').css('text-align','right');
			}
			else{
				$('td').each(function(){
					$(this).removeAttr('align');
				});

				$('p').each(function(){
					$(this).css('text-align','');
				});

				$('#surveytitle').css('text-align','');
				$('#surveyinstructions').css('text-align','');
			}

			langReady = 2;

			piping();
			stopText();
			controlText();
			if(settings['languages_variable'] && settings['languages_variable']['value']){
				doBranching(settings['languages_variable']['value']);
			}
			else{
				doBranching('languages');
			}
			
			//econsent pdf
			if(pdf_url.substring(0, 5) != 'false'){
				econsent_pdf();
			}
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
		interval = setInterval(translate, 200);
	}

	function getLanguage(newLang){
		langReady = 0;
		if(newLang == null){
			lang = getCookie('p1000Lang');

			if(lang == "-1"){
				//lang = languages[Object.keys(languages)[0]];

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
		if(settings['languages_variable'] && settings['languages_variable']['value']){
			$('[name="' + settings['languages_variable']['value'] + '"] option').each(function(){
				if($(this).text() == lang){
					$(this).prop('selected', true);
				}
			});
		}

		getTranslations();
	}

	function getTranslations(){
		langReady = 0;
		var data = {};
		data['todo'] = 1;
		data['lang'] = lang;
		data['project_id'] = pid;
		data['record_id'] = $('[name="' + table_pk + '"]').val();
		data['event_id'] = event_id;
		data['page'] = $('#surveytitle').html().replace(/ /g,'_').toLowerCase();
		var t;
		for(t in languages){
			if(languages[t] == lang){
				data['lang_id'] = t;
				break;
			}
		}

		//pull survey page name
		var prevInput;
		$('input').each(function(){
			if($(this).attr('name') && $(this).attr('name').indexOf('_complete') > -1){
				prevInput = $(this).prev().attr('name');
				if(prevInput == '__response_hash__'){
					data['page'] = $(this).attr('name').replace('_complete','');
				}
			}
		});

		var json = encodeURIComponent(JSON.stringify(data));

		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				//hide if no translations
				if(!anyTranslated && (r == null || (r['questions'] == null && r['answers'] == null && r['notes'] == null))){
					clearInterval(interval);
					$('#changeLang').remove();
					setCookie('p1000Lang', 'en', -1);
				} else {
					// if language is not previously set in cookies, let user choose
					if(getCookie('p1000Lang') == "-1"){
						$('#p1000Overlay').fadeIn();
						$('#p1000ChooseLang').fadeIn();
					}
					translations = r;
					langReady = 1;
					anyTranslated = true;
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
