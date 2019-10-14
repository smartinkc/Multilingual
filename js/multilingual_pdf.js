(function(){
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	var imageDir = 'APP_PATH_IMAGES';
	var pdf_url = 'PDF_URL';
	
	var languages = {1: 'en', 2: 'es'};

	$( document ).ready(function(){
		getLanguages();
	});
	
	//listeners
	$('body').on('click', '.pdfLang', function(){
		var langIndex = $(this).attr('id').replace('lang','');
		var lang = $(this).html().replace(/(<([^>]+)>)/ig,"").trim();
		
		$('#pdfExportDropdownDiv').hide();
		
		window.location.href = pdf_url + '&id=' + getVariable('id') + '&form=' + getVariable('page') + '&langIndex=' + langIndex;
	});
	
	$('body').on('click', '.pdfLangFull', function(){
		var langIndex = $(this).attr('id').replace('lang','');
		var lang = $(this).html().replace(/(<([^>]+)>)/ig,"").trim();
		
		$('#recordActionDropdownDiv').hide();
		
		window.location.href = pdf_url + '&id=' + getVariable('id') + '&langIndex=' + langIndex;
	});
	
	//functions
	function appendOptions(){
		var id;
		var html = '';
		
		if(getVariable('page')){
			for(id in languages){
				html += '<li class="ui-menu-item">'
					+ '<a href="javascript:;" style="display:block;" onclick="" id="lang' + id + '" tabindex="-1" role="menuitem" class="ui-menu-item-wrapper pdfLang"><img src="' + imageDir + 'pdf.gif"> ' + languages[id] + '</a>'
					+ '</li>';
			}
			
			//data entry page
			$('#pdfExportDropdown').append(html);
		}
		else{
			for(id in languages){
				html += '<li class="ui-menu-item">'
					+ '<a href="javascript:;" style="display:block;" onclick="" id="lang' + id + '" tabindex="-1" role="menuitem" class="ui-menu-item-wrapper pdfLangFull"><img src="' + imageDir + 'pdf.gif"> ' + languages[id] + '</a>'
					+ '</li>';
			}
			//record home page
			$('#recordActionDropdown').append(html);
		}
	}

	function getLanguages(){
		var data = {};
		data['todo'] = 2;
		data['project_id'] = getVariable('pid');
		data['field_name'] = langVar;
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				appendOptions();
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
})();
