(function(){
	var ajax_url = 'REDCAP_AJAX_URLgetData.php';
	var translations = {};
	var languages = {};
	var lang = getCookie('p1000Lang');
	getLanguages();

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
					$('.ui-button-text').html('&#x274c;');
				}, 100);
				setCookie('p1000Lang', 'en', -1);
				setCookie('p1000pid', '1', -1);

			},
			error: function(jqXHR, textStatus, errorThrown) {
			   console.log(textStatus, errorThrown);
			}
		});
	}

	function getLanguages(){
		var data = {};
		data['todo'] = 2;
		data['project_id'] = getCookie('p1000pid');
		data['field_name'] = 'languages';
		var json = encodeURIComponent(JSON.stringify(data));
		
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: 'data=' + json,
			success: function (r) {
				languages = r;
				getTranslations();
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