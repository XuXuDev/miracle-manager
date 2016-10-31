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
 * 创建静态资源存放文件夹
 * 
 */
if(!fs.existsSync("../uploads")) {
	logger.info("---静态资源存放文件夹不存在---");
	logger.info("---正在创建静态资源存放文件夹---");
	mkdirp.sync("../uploads");
	logger.info("---创建静态资源存放文件夹成功---")
}

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
 * 文件预览
 * 
 */
router.get('/own-oss-pre/:name', function(req, res) {
	var name = req.params.name;
	logger.info('---', name, '文件预览开始---');
	fs.readFile('../uploads/' + name, function(err, data) {
		if(err) {
			logger.error('--- ', name, ' 文件预览读取出错：', name, "---");
			logger.error('--- ', name, ' 错误信息---\n');
			logger.error(err);
			logger.error('--- ', name, ' 错误信息结束---\n');
		} else {
			res.write(data);
			res.end()
			logger.info('---', name, '文件预览成功返回---');
		}
	});
});

/**
 * 文件下载
 * 
 */
router.get('/own-oss-download/:name', function(req, res) {
	var name = req.params.name;
	logger.info('--- ', name, ' 文件下载开始---');
	fs.access('../uploads/' + name, function(err, data) {
		if(err) {
			logger.error('--- ', name, ' 文件下载出错：', name, "---");
			logger.error('--- ', name, ' 错误信息---\n');
			logger.error(err);
			logger.error('--- ', name, ' 错误信息结束---\n');
		} else {
			res.attachment('../uploads/' + name);
			res.end()
			logger.info('--- ', name, ' 文件下载成功返回---');
		}
	});
});

/**
 * 上传文件
 * 
 */
router.post("/uploadFile", upload.array('file', 12), function(req, res) {
	if(!fs.existsSync("../uploads")) {
		logger.info("---静态资源存放文件夹不存在---");
		logger.info("---正在创建静态资源存放文件夹---");
		mkdirp.sync("../uploads");
		logger.info("---创建静态资源存放文件夹成功---")
	}
	logger.info("---正在上传文件---");
	var data = {};
	data.code = "000000";
	data.msg = "success";
	var len = req.files.length;
	logger.info("---上传文件数量：" + len, "个---");
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
				logger.info("---全部文件上传完成---");
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
	if(!fs.existsSync("../uploads")) {
		logger.info("---静态资源存放文件夹不存在---");
		logger.info("---正在创建静态资源存放文件夹---");
		mkdirp.sync("../uploads");
		logger.info("---创建静态资源存放文件夹成功---")
	}
	logger.info("---请求文件列表---");
	logger.info("---pageNum：" + req.query.pageNum + "---");
	logger.info("---pageSize：" + req.query.pageSize + "---");
	var _pageNum = req.query.pageNum || 1;
	var _pageSize = req.query.pageSize || 12;
	var _start = (_pageNum - 1) * _pageSize;
	var _end = _pageNum * _pageSize - 1;
	var _fileList = [];
	try {
		_fileList = fs.readdirSync("../uploads");
	} catch(e) {
		logger.error('---获取静态文件列表 --> 读取静态资源文件夹失败---\n');
		logger.error('---读取静态资源文件夹失败 错误信息开始---\n');
		logger.error(e);
		logger.error('\n---读取静态资源文件夹失败 错误信息结束---\n');
	}
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
		_fileObj.preLink = "http://120.27.158.158:1314/own-oss-pre/" + _fileList[i];
		_fileObj.downloadLink = "http://120.27.158.158:1314/own-oss-download/" + _fileList[i];
		try {
			var tempObj = fs.statSync("../uploads/" + _fileList[i]);
			_fileObj.originalTime = new Date(tempObj.birthtime).getTime();
			_fileObj.latestTime = new Date(tempObj.mtime).getTime();
			_fileObj.size = (tempObj.size / 1024) > 1024 ? (tempObj.size / 1024 / 1024).toFixed(2) + "Mb" : (tempObj.size / 1024).toFixed(2) + "Kb";
		} catch(e) {
			logger.error('---获取 ', _fileList[i], ' 文件信息失败---\n');
			logger.error('---获取 ', _fileList[i], ' 文件信息失败 错误信息开始---\n');
			logger.error(e);
			logger.error('---获取 ', _fileList[i], ' 文件信息失败 错误信息结束---\n');
		}
		data.list.push(_fileObj);
	}
	logger.info("---返回：" + JSON.stringify(data) + "---");
	res.write(JSON.stringify(data));
	res.end();
})

module.exports = router;