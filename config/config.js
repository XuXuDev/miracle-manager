(function() {
	'use strict';
	var config = {
		_logPath: "../logs/manager/",
		_logFilePre: "manager",
		_uploadPath: "../uploads/",
		_route: {
			_notFound: "./public/main/common/tpl/lost.html",
			_common: {
				_headPc: "./public/main/manager/tpl/head_pc.html",
				_footerPc: "./public/main/manager/tpl/footer_pc.html"
			},
			_routeList: [{
				_name: "/",
				_path: "./public/main/manager/tpl/upload.html",
				_descirption: "主页面"
			}, {
				_name: "/upload",
				_path: "./public/main/manager/tpl/upload.html",
				_descirption: "上传页面"
			}, {
				_name: "/files",
				_path: "./public/main/manager/tpl/files.html",
				_descirption: "文件列表页面"
			}]
		},
		_responseCode: {
			_success: "000000",
			_normalError: "000001",
			_serverError: "000002"
		}
	};
	
	config._preLink = process.env.NODE_ENV === "production" ? "http://120.27.158.158:1314/own-oss-pre/" : "http://localhost:1314/own-oss-pre/"
	config._downloadLink = process.env.NODE_ENV === "production" ? "http://120.27.158.158:1314/own-oss-download/" : "http://localhost:1314/own-oss-download/"

	module.exports = config;
})();