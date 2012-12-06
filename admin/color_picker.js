jQuery(document).ready(function($){

	function dwls_admin_color_change() {
		setTimeout(function() {
			var input = $(this),
			preview = $('#dwls_design_preview ul.search_results');
			$('#dwls_custom_styles').remove();
			var styles =
				['#dwls_design_preview ul.search_results li {',
				'  color: ' + $('#daves-wordpress-live-search_custom_fg').val() + ';',
				'  background-color: ' + $('#daves-wordpress-live-search_custom_bg').val() + ';',
				'}',
				'#dwls_design_preview .search_footer {',
				'  background-color: ' + $('#daves-wordpress-live-search_custom_footbg').val() + ';',
				'}',
				'#dwls_design_preview .search_footer a,',
				'#dwls_design_preview .search_footer a:visited {',
				'  color: ' + $('#daves-wordpress-live-search_custom_footfg').val() + ';',
				'}',
				'#dwls_design_preview ul.search_results li a, #dwls_design_preview ul.search_results li a:visited {',
				'  color: ' + $('#daves-wordpress-live-search_custom_title').val() + ';',
				'}',
				'#dwls_design_preview ul.search_results li:hover',
				'{',
				'  background-color: ' + $('#daves-wordpress-live-search_custom_hoverbg').val() + ';',
				'}',
				'#dwls_design_preview ul.search_results li',
				'{',
				'  border-bottom: 1px solid ' + $('#daves-wordpress-live-search_custom_divider').val() + ';',
				'}'];

			// Optional drop shadow
			if($('#daves-wordpress-live-search_custom_shadow:checked').length > 0) {
			styles.push(['#dwls_design_preview ul.search_results {',
							'-moz-box-shadow: 5px 5px 3px #222;',
							'-webkit-box-shadow: 5px 5px 3px #222;',
							'box-shadow: 5px 5px 3px #222;',
							'}'].join("\n"));
			}

			$('body').append('<style type="text/css" id="dwls_custom_styles">' + styles.join("\n") + '</style>');

		}, 0);
	}

	$('.dwls_color_picker, .dwls_design_toggle').change(dwls_admin_color_change);
    $('.dwls_color_picker').wpColorPicker({change: dwls_admin_color_change});
    dwls_admin_color_change();

    $('input[name="daves-wordpress-live-search_css"]').change(function() {
		if($(this).val() === 'custom') {
			$('#custom_colors').slideDown();
		}
		else {
			$('#custom_colors').slideUp();
		}
    });
    if($('input[name="daves-wordpress-live-search_css"]').filter('[value=custom]:checked').length > 0) {
		$('#custom_colors').show();
    }
});