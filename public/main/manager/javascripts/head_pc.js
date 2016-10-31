(function() {
	'use strict';
	var currentRouter = location.pathname === "/" ? "/upload" : location.pathname;
	$('ul>li').forEach(function(item) {
		if(item.children[0].getAttribute('href') === currentRouter) {
			$(item).addClass('selected');
		} else {
			$(item).removeClass('selected');
		}
	});
})()