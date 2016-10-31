(function() {
	document.getElementById('fileBtn').addEventListener('click', function() {
		document.getElementById('upload').style.display = 'none';
		renderList();
	}, false);
})()

function renderList() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'fileList', true);
	xhr.send(1, 5);
	xhr.onload = function(e) {
		var response = JSON.parse(this.response);
		if(response.code === '000000') {
			var html = template('initList', response);
			document.getElementById('files').innerHTML = html;
		}
	}
}