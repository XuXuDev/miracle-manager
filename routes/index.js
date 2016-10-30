/*!
 * author
 * Copyright(c) 2016 Wang Xu
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('underscore');
var art = require('art-template/node/template.js');
art.config('cache', false);
var multer = require('multer')
var upload = multer();
var mkdirp = require('mkdirp');

/**
 * 路由统一处理分发
 * 
 */
_.each(['get', 'post'], function(type) {
	router[type]('*', function(req, res, next) {
		if(req.xhr) {
			logger.info('ajax请求：' + req.url)
			next();
		} else {
			logger.info('路由请求：' + req.url);
			next();
		}
	})
})

/**
 * 主页面路由
 * 
 */
router.get('/', function(req, res, next) {
	logger.info("进入主页面")
	res.status(200);
	var str = fs.readFileSync("./public/main/manager/tpl/index.html").toString();
	res.write(str);
	res.end();
});

/**
 * 静态文件管理路由
 * 
 */
router.get('/manager/:name', function(req, res) {
	var name = req.params.name,
		tplPath = './public/main/manager/manager_' + name + '.html';
	logger.info('进入静态文件管理路由->页面名称:-----', 'manager_' + name, '-----');
	var str = (fs.existsSync(tplPath) ? (fs.readFileSync(tplPath).toString()) : '');
	res.write(str);
	res.end();
});

/**
 * 上传文件
 * 
 */
router.post("/uploadFile", upload.array('file', 12), function(req, res) {
	if(!fs.existsSync("../uploads")) {
		mkdirp.sync("../uploads");
	}
	logger.info("---正在上传文件---")
	var data = {};
	data.code = "000000";
	data.msg = "success";
	var len = req.files.length;
	logger.info("---上传文件数量：" + len, "个---")
	_.each(req.files, function(file) {
		fs.writeFile("../uploads/" + file.originalname, file.buffer, function(err) {
			len--;
			if(err) {
				data.msg = "";
				logger.info("---", file.originalname, "上传失败---");
				data.code = "000001";
				data.msg += file.originalname + "upload fail;";
			} else {
				logger.info("---", file.originalname, "上传完成---");
			}
			if(len === 0) {
				logger.info("---全部文件上传完成---")
				res.write(JSON.stringify(data));
				res.end();
			}
		})
	})
});

/**
 * 文件列表接口
 * 
 */
router.get("/fileList", function(req, res) {
	logger.info("---请求文件列表---")
	logger.info("---pageNum：" + req.query.pageNum + "---");
	logger.info("---pageSize：" + req.query.pageSize + "---");
	var _pageNum = req.query.pageNum || 1;
	var _pageSize = req.query.pageSize || 12;
	var _start = (_pageNum - 1) * _pageSize;
	var _end = _pageNum * _pageSize - 1;
	var _fileList = fs.readdirSync("../uploads");
	var data = {
		code: "000000",
		msg: "success",
		list: []
	};
	for(var i = _start; i <= _end; i++) {
		if(i >= _fileList.length) {
			break;
		}
		var _fileObj = new Object();
		_fileObj.name = _fileList[i];
		_fileObj.link = "http://120.27.158.158:5666/" + _fileList[i];
		var tempObj = fs.statSync("../uploads/" + _fileList[i]);
		_fileObj.originalTime = new Date(tempObj.birthtime).getTime();
		_fileObj.latestTime = new Date(tempObj.mtime).getTime();
		_fileObj.size = tempObj.size > 1024 ? (tempObj.size / 1024).toFixed(2) + "Mb" : tempObj.size + "Kb";
		data.list.push(_fileObj);
	}
	logger.info("---返回：" + JSON.stringify(data) + "---");
	res.write(JSON.stringify(data));
	res.end();
})

module.exports = router;