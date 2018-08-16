(function(){
	var ajax_url = 'REDCAP_AJAX_URL';
	var langVar = 'REDCAP_LANGUAGE_VARIABLE';
	
	var languages = {1: 'en', 2: 'es'};
	
	$( document ).ready(function(){
		getLanguages();
		
		$('body').on('click', '.exportByLanguage', function(){
			$(this).css('background','#CCCCCC');
			exportData($(this).attr('id'));
		});
	});
	
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
				showButtons();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
			}
		});
	}

	function exportData(id){
		window.location.replace('REDCAP_AJAX_URL' + '&lang=' + id + '&todo=2');
	}

	function showButtons(){
		var id;
		var counter = 1;
		for(id in languages){
			$('#reprow_ALL').children().eq(3).append('<button class="exportByLanguage jqbuttonmed ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" style="width:96px;margin:5px;" id="' + id + '"><span class="ui-button-text" style="font-size:11px;"><img src="../Resources/images/go-down.png" style="vertical-align:middle;"> <span style="vertical-align:middle;">' + languages[id] + '</span></span></button>');
			counter++;
			if(counter == 4){
				$('#reprow_ALL').children().eq(3).append('<br>');
				counter = 1;
			}
		}
	}
	
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