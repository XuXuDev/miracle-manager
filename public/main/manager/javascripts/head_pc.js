(function() {
	'use strict';
	$('ul>li').forEach(function(item){
		if(item.children[0].getAttribute('href') === currentRouter){
			$(item).addClass('selected');
		}else{
			$(item).removeClass('selected');
		}
	});
})()