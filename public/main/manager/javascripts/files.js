(function() {
	var renderList = function() {
		wx.ajax('fileList', {
			data: {
				pageNum: 1,
				pageSize: 5
			},
			dataType: 'json',
			type: 'get',
			timeout: 3000,
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(data) {
				if(data.code === '000000') {
					var html = template('initList', data);
					document.getElementById('files').innerHTML = html;
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log(type);
			}
		});
	};
	renderList();
})();