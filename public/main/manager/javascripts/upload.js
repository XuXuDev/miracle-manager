(function() {
	if('draggable' in document.createElement('span')) {　　　　
		var upload = document.getElementById('upload');　　　　
		upload.ondrop = function(event) {　　　　　　
			event.preventDefault();　　　　　　
			this.className = '';　　　　　　
			var files = event.dataTransfer.files;　　
			sendFile(files);　　　　　　　　
		};　　
	}
})()

function sendFile(files) {
	if(!files) {
		var files = document.getElementById('select').files;
	}
	var i = 0,
		length = files.length,
		formData = new FormData();
	for(i = 0; i < length; i++) {
		formData.append('file', files[i]);
	}
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'uploadFile', true);
	xhr.send(formData);
	xhr.onload = function(e) {
		var response = JSON.parse(this.response);
		if(response.code === '000000') {
			document.getElementsByTagName('h2')[0].innerHTML = '上传成功';
		} else {
			document.getElementsByTagName('h2')[0].innerHTML = '上传失败';
			document.getElementById('resultDetail').innerHTML = response.msg;
		}
	}
}