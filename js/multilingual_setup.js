(function(){
	var ajax_url = 'REDCAP_AJAX_URL';
	var matrixCounter = 0;
	var languages = {1: 'en', 2: 'es'};
	var setup = 0;

	$( document ).ready(function(){
		getLanguages();
		showSetup();

		$('body').on('click', '.btn2', function(){
			$('#multilingual').remove();
		});
		
		$('body').on('click', '.noClose', function(event){
			event.stopPropagation();
		});
		
		$('body').on('click', '#multilingualSetup', function(){
			openCloseSetup();
		});
		
		$('body').on('click','img',function(){
			if($(this).attr('title') == 'Edit' || $(this).attr('title') == 'Edit Matrix'){
				$('#multilingual').remove();
				setTimeout(function(){
					getAnswers();
				}, 1500);
			}
		});
		
		$('body').on('change','.answers',function(){
			if($('#field_name').is(':visible')){
				updateActionTags();
			}
			else{
				updateActionTagsMatrix(matrixCounter);
			}
		});
		
		$('body').on('change','.questions',function(){
			if($('#field_name').is(':visible')){
				updateActionTags();
			}
			else{
				updateActionTagsMatrix(matrixCounter);
			}
		});
		
		$('body').on('change','.errors',function(){
			updateActionTags();
		});
		
		$('body').on('change','.otherActionTags',function(){
			updateActionTags();
		});
		
		$('body').on('change','.p1000_survey_text',function(){
			updateActionTags();
		});
	});

	function getLanguages(){
		var data = {};
		data['todo'] = 2;
		data['project_id'] = getVariable('pid');
		data['field_name'] = 'languages';
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				var count = 0;
				var id;
				for(id in languages){
					if(id != ''){
						count++;
					}
				}
				if(count == 0){
					openCloseSetup();
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
			}
		});
	}

	function getAnswers(){
		matrixCounter = 0;
		
		var data = {};
		data['todo'] = 2;
		data['project_id'] = getVariable('pid');
		data['field_name'] = ($('#field_name').is(':visible') ? $('#field_name').val() : $('#grid_name').val());
		if($('#field_name').is(':visible')){
			data['matrix'] = 0;
		}
		else{
			data['matrix'] = 1;
		}
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				if(data['matrix'] == 1){
					getTranslationsMatrix(r);
				}
				else{
					getTranslations(r);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
	}

	function getTranslations(r){
		//parse existing data
		var data = $('#div_parent_field_annotation textarea').val();
		var tags = data.split('\n');
		var id;
		var questions = {};
		var answers = {};
		var errors = {};
		var survey_text = {};
		var survey_translations = {"surveytitle":"Survey Title","surveyinstructions":"Survey Instructions","surveyacknowledgment":"Survey Response"}
		var others = '';
		for(id in tags){
			if(tags[id].indexOf('@p1000lang') > -1){
				questions = JSON.parse(tags[id].replace('@p1000lang','',tags[id]));
			}
			else if(tags[id].indexOf('@p1000answers') > -1){
				answers = JSON.parse(tags[id].replace('@p1000answers','',tags[id]));
			}
			else if(tags[id].indexOf('@p1000errors') > -1){
				errors = JSON.parse(tags[id].replace('@p1000errors','',tags[id]));
			}
			else if(tags[id].indexOf('@p1000surveytext') > -1){
				survey_text = JSON.parse(tags[id].replace('@p1000surveytext','',tags[id]));
			}
			else{
				others += tags[id] + '\n';
			}
		}
		
		//survey text
		if($('#field_name').val().indexOf('survey_text') > -1){
			var display = '<div id="multilingual"><p><b>Multilingual</b><p><span style="color:blue;">Survey Translations</span><table>';
			var id;
			for(id in languages){
				var id2;
				display += '<tr><td colspan=2>' + languages[id] + '</td></tr>';
				for(id2 in survey_translations){
					display += '<tr><td>' + survey_translations[id2] + ' </td><td> <input class="p1000_survey_text" type="text" style="color:black;" value="' + (survey_text[languages[id]] != undefined && survey_text[languages[id]][id2] != null ? survey_text[languages[id]][id2].replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '') + '" size=30 name="st' + id + '-' + id2 + '" id="st' + id + '-' + id2 + '">' + '</td></tr>';
				}
				display += '<tr><td colspan=2><hr></td></tr>';
			}
			display += '</table><p><span style="color:blue;">Other Action Tags</span><p><table>';
			display += '<tr><td><textarea rows=3 cols=40 class="otherActionTags">' + others + '</textarea></td></tr>';
			display += '</table></div>';
		}
		else{
			//display
			var display = '<div id="multilingual"><p><b>Multilingual</b><p><span style="color:blue;">Questions</span><table>';
			
			//questions
			var id;
			for(id in languages){
				display += '<tr><td>' + languages[id] + ' </td><td class="question"> <input class="questions" type="text" style="color:black;" value="' + (questions[languages[id]] != null ? questions[languages[id]].replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '') + '" size=30 name="q' + id + '" id="q' + id + '">' + '</td></tr>';
			}
			display += '</table>';
			
			//error messages
			display += '<p><span style="color:blue;">Error/Validation Messages</span><table>';
			var id;
			for(id in languages){
				display += '<tr><td>' + languages[id] + ' </td><td class="error"> <input class="errors" type="text" style="color:black;" value="' + (errors[languages[id]] != null ? errors[languages[id]].replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '') + '" size=30 name="e' + id + '" id="e' + id + '">' + '</td></tr>';
			}
			display += '</table>';
			
			//answers
			if(r[""] != ""){
				var id2;
				display += '<p><span style="color:blue;">Answers</span><p><table>';
				for(id in languages){
					for(id2 in r){
						display += '<tr><td>' + languages[id] + ': ' + id2 + ' </td><td> <input class="answers" type="text" style="color:black;" value="' + (answers[languages[id]]!= null && answers[languages[id]][id2] != null ? answers[languages[id]][id2] : '') + '" size=30 name="a' + id + '-' + id2 + '" id="a' + id + '-' + id2 + '">' + '</td></tr>';
					}
				}
			}
			display += '</table>';
			
			//other
			display += '<p><span style="color:blue;">Other Action Tags</span><p><table>';
			display += '<tr><td><textarea rows=3 cols=40 class="otherActionTags">' + others + '</textarea></td></tr>';
			display += '</table></div>';
		}

		$('#div_parent_field_annotation').append(display);
		
		if($('#dropdown_autocomplete').is(':checked')){
			$('#multilingual').html('<span style="color:red;">Auto-complete is not supported.</span>');
		}
	}

	function getTranslationsMatrix(r){
		var answers = {};
		var display = '<div id="multilingual"><p><b>Multilingual</b><p><span style="color:blue;">Questions</span><table>';
		var counter = 0;
		$('.addFieldMatrixRowFieldAnnotation').each(function(){
			if(counter > 0){
				var questions = {};
				
				var data = $(this).children().val();
				var tags = data.split('\n');
				
				for(id in tags){
					if(tags[id].indexOf('@p1000lang') > -1){
						questions = JSON.parse(tags[id].replace('@p1000lang','',tags[id]));
					}
					else if(tags[id].indexOf('@p1000answers') > -1){
						answers = JSON.parse(tags[id].replace('@p1000answers','',tags[id]));
					}
				}
				
				//questions
				var id;
				for(id in languages){
					display += '<tr><td>' + languages[id] + ' </td><td class="question"> <input class="questions questions' + counter + '" type="text" style="color:black;" value="' + (questions[languages[id]] != null ? questions[languages[id]].replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '') + '" size=40 name="mq' + id + '" id="mq' + id + '">' + '</td></tr>';
				}
				
				display += '<tr><td colspan=2>&nbsp;</td></tr>';
			}
			counter++;
		});
		matrixCounter = counter;
		display += '</table>';
		
		//answers
		var id;
		if(r[""] != ""){
			var id2;
			display += '<p><span style="color:blue;">Answers</span><p><table>';
			for(id in languages){
				for(id2 in r){
					display += '<tr><td>' + languages[id] + ': ' + id2 + ' </td><td> <input class="answers" type="text" style="color:black;" value="' + (answers[languages[id]]!= null && answers[languages[id]][id2] != null ? answers[languages[id]][id2] : '') + '" size=30 name="a' + id + '-' + id2 + '" id="a' + id + '-' + id2 + '">' + '</td></tr>';
				}
			}
		}
		
		//other
		
		display += '</table></div>';
		//old button
		//<br><a style="cursor:pointer;font-weight:bold;" onclick="updateActionTagsMatrix(' + (counter - 1) + ');">Update</a>

		$('#element_enum_matrix').parent().append(display);
		
	}

	function updateActionTags(){
		var q = {};
		var a = {};
		var e = {};
		var st = {};
		var others = '';
		var tmp;
		$('.questions').each(function(){
			tmp = $(this).attr('id').replace('q','');
			if($(this).val() != ''){
				q[languages[tmp]] = $(this).val();
			}
		});
		
		$('.errors').each(function(){
			tmp = $(this).attr('id').replace('e','');
			if($(this).val() != ''){
				e[languages[tmp]] = $(this).val();
			}
		});
		
		$('.answers').each(function(){
			tmp = $(this).attr('id').replace('a','');
			tmp = tmp.replace('-',':');
			tmp = tmp.split(':');
			
			if(!a[languages[tmp[0]]]){
				a[languages[tmp[0]]] = {};
			}
			if($(this).val() != ''){
				a[languages[tmp[0]]][tmp[1]] = $(this).val();
			}
		});
		
		$('.p1000_survey_text').each(function(){
			tmp = $(this).attr('id').replace('st','');
			tmp = tmp.split('-');

			if(!st[languages[tmp[0]]]){
				st[languages[tmp[0]]] = {};
			}
			if($(this).val() != ''){
				st[languages[tmp[0]]][tmp[1]] = $(this).val();
			}
		});
		
		others = $('.otherActionTags').val();
		
		var ques = '@p1000lang' + JSON.stringify(q);
		var answ = '@p1000answers' + JSON.stringify(a);
		var err = '@p1000errors' + JSON.stringify(e);
		var stext = '@p1000surveytext' + JSON.stringify(st);
		
		$('#div_parent_field_annotation').children(0).val(ques + '\n' + answ + '\n' + err + '\n' + stext + '\n' + others);
		$('#multilingual').css('background','#b4ecb4');
		//$('#multilingual').remove();
	}

	function updateActionTagsMatrix(counter){
		while(counter >= 1){
			var q = {};
			var a = {};
			var tmp;
			$('.questions' + counter).each(function(){
				tmp = $(this).attr('id').replace('mq','');
				if($(this).val() != ''){
					q[languages[tmp[0]]] = $(this).val();
				}
			});
			
			var ques = '@p1000lang' + JSON.stringify(q);
			
			$('.answers').each(function(){
				tmp = $(this).attr('id').replace('a','');
				tmp = tmp.replace('-',':');
				tmp = tmp.split(':');
				
				if(!a[languages[tmp[0]]]){
					a[languages[tmp[0]]] = {};
				}
				if($(this).val() != ''){
					a[languages[tmp[0]]][tmp[1]] = $(this).val();
				}
			});
			
			var answ = '@p1000answers' + JSON.stringify(a);
			
			//update
			count = 0;
			$('.addFieldMatrixRowFieldAnnotation').each(function(){
				if(count == counter){
					$(this).children().val(ques + '\n' + answ);
				}
				count++;
			});
			
			counter--;
		}
		$('#multilingual').css('background','#b4ecb4');
		//$('#multilingual').remove();
	}
	
	//setup functions
	function showSetup(){
		$('body').append('<div id="multilingualSetup">?</div>');
		$('#multilingualSetup').fadeIn();
	}
	
	function openCloseSetup(){
		if($('#multilingualSetup').css('height') == '50px'){
			$( "#multilingualSetup" ).html('');
			
			$( "#multilingualSetup" ).animate({
				"border-radius": "0px",
				"height": "50%",
				"width": "280px"
			}, 500, function() {
				$( "#multilingualSetup" ).css(
					{
						"font-size": "12px",
						"text-align": "left",
						"font-weight": "normal",
						"overflow-y": "scroll",
						"line-height": "0px"
					}
				);
				
				setTimeout(function(){
					$('#multilingualSetup').html(
						'<p><span style="font-weight:bold;color:#ADD8E6;">Getting Started</span><br>Add a variable called languages as a multiple choice field listing your languages as the choices.  Make sure you add the action tag @HIDDEN. Also, make sure your choice values for languages are numeric, starting with 1. Example:<br> 1, English<br> 2, Español</p>'
						+ '<p>Refresh the page and you\'re ready to start entering translations. Remember you have to add the field first and save, then go back and edit it to add translations.</p>'
						+ '<p><span style="font-weight:bold;color:#ADD8E6;">Title and Instructions</span><br>To add translations for the Survey Title and Instructions for <i>this</i> instrument, add a variable called <span style="color:yellow;" class="noClose"> survey_text_' + getVariable('page') + '  </span>.  Each instrument should have it\'s own field with a variable name of "survey_text_[form name]" (Replace [form name] with the name of each instrument). Make sure you add the action tag @HIDDEN.</p>'
						+ '<p><span style="font-weight:bold;color:#ADD8E6;">Completion Text</span><br>To add translations for Survey Completion Text, add a variable called survey_text_finish. Make sure you add the action tag @HIDDEN.</p>'
						+ '<p>If you have just one instrument, you can just add the survey_text_finish variable and add the Title, Instructions and Completion Text to it.</p>'
						+ '<p><span style="font-weight:bold;color:#ADD8E6;">Required Fields Text</span><br>To translate the <span style="color:red;">* must provide value</span> text, add this html to your translated question text:</p><span class="noClose"><p>   &lt;p&gt;&lt;span class=&quot;multilingual&quot; style=&quot;color:red;&quot;&gt;Your translation here&lt;/span&gt;&lt;/p&gt;   </span> </p>'
						+ '<p>For more information: <span class="noClose"><a style="color:#ADD8E6;" href="https://community.projectredcap.org/storage/attachments/3597-how-to-use-multilingual-hook.docx">click here</a></span></p>'
					);
				},1);
			});
			
			
		}
		else{
			$( "#multilingualSetup" ).html('');
			$( "#multilingualSetup" ).animate({
				"border-radius": "50px",
				"height": "50px",
				"width": "50px"
			}, 500, function() {
				$( "#multilingualSetup" ).css(
					{
						"font-size": "40px",
						"text-align": "center",
						"font-weight": "bold",
						"overflow": "hidden",
						"line-height": "25px"
					}
				);
				$('#multilingualSetup').html('?');
			});
		}
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
})();
