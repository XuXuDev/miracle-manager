(function() {
	'use strict';
	$('ul>li').on('click', function() {
		$('ul li').removeClass('selected');
		$(this).addClass('selected');
	});　
})()



