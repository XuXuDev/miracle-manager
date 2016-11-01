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
var tools = require('../tools/tool.js');
var config = require('../config/config.js');

/**
 * 创建静态资源存放文件夹
 * 
 */
if(!fs.existsSync(config._uploadPath)) {
	logger.info("---静态资源存放文件夹不存在---");
	logger.info("---正在创建静态资源存放文件夹---");
	try {
		mkdirp.sync(config._uploadPath);
		logger.info("---创建静态资源存放文件夹成功---");
	} catch(e) {
		logger.info("---创建静态资源存放文件夹失败---\n", "---创建静态资源存放文件夹失败信息---\n", e, "\n---创建静态资源存放文件夹失败信息结束---");
	}

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
	});
});

/**
 * 页面路由统一注册
 * 
 */
_.each(config._route._routeList, function(routeInfo) {
	router.get(routeInfo._name, function(req, res, next) {
		logger.info("---进入", routeInfo._descirption, "---");
		res.status(200);
		var headHtml = fs.readFileSync(config._route._common._headPc).toString();
		var bodyHtml = fs.readFileSync(routeInfo._path).toString();
		var footerHtml = fs.readFileSync(config._route._common._footerPc).toString();
		var html = headHtml + bodyHtml + footerHtml;
		res.write(html);
		res.end();
	});
});

/**
 * 上传文件
 * 
 */
router.post("/uploadFile", upload.array('file', 12), function(req, res) {
	if(!fs.existsSync(config._uploadPath)) {
		logger.info("---静态资源存放文件夹不存在---");
		logger.info("---正在创建静态资源存放文件夹---");
		mkdirp.sync(config._uploadPath);
		logger.info("---创建静态资源存放文件夹成功---")
	}
	logger.info("---正在上传文件---");
	var data = {};
	data.code = config._responseCode._success;
	data.msg = "success";
	var len = req.files.length;
	logger.info(req.files)
	logger.info("---上传文件数量：" + len, "个---");
	_.each(req.files, function(file) {
		fs.writeFile(config._uploadPath + file.originalname, file.buffer, function(err) {
			len--;
			if(err) {
				data.msg = "";
				logger.info("---", file.originalname, "上传失败---");
				data.code = config._responseCode._normalError;
				data.msg += file.originalname + "upload fail;";
			} else {
				logger.info("---", file.originalname, "上传完成---");
			}
			if(len === 0) {
				logger.info("---全部文件上传完成---");
				res.status(200);
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
	if(!fs.existsSync(config._uploadPath)) {
		logger.info("---静态资源存放文件夹不存在---");
		logger.info("---正在创建静态资源存放文件夹---");
		mkdirp.sync(config._uploadPath);
		logger.info("---创建静态资源存放文件夹成功---")
	}
	logger.info("---请求文件列表---");
	logger.info("---pageNum：" + req.query.pageNum + "---");
	logger.info("---pageSize：" + req.query.pageSize + "---");
	var pageNum = req.query.pageNum || 1;
	var pageSize = req.query.pageSize || 12;
	pageNum >= 0 ? pageNum : 1;
	pageSize >= 0 ? pageSize : 12;
	var start = (pageNum - 1) * pageSize;
	var end = pageNum * pageSize - 1;
	var fileList = [];
	try {
		fileList = fs.readdirSync(config._uploadPath);
	} catch(e) {
		logger.error('---获取静态文件列表 --> 读取静态资源文件夹失败---\n');
		logger.error('---读取静态资源文件夹失败 错误信息开始---\n');
		logger.error(e);
		logger.error('\n---读取静态资源文件夹失败 错误信息结束---\n');
	}
	var data = {
		code: config._responseCode._success,
		msg: "success",
		list: []
	};
	for(var i = start; i <= end; i++) {
		if(i >= fileList.length) {
			break;
		}
		var fileObj = new Object();
		fileObj.name = fileList[i];
		fileObj.preLink = config._preLink + fileList[i];
		fileObj.downloadLink = config._downloadLink + fileList[i];
		try {
			var tempObj = fs.statSync(config._uploadPath + fileList[i]);
			fileObj.originalTime = new Date(tempObj.birthtime).getTime();
			fileObj.latestTime = new Date(tempObj.mtime).getTime();
			fileObj.size = (tempObj.size / 1024) > 1024 ? (tempObj.size / 1024 / 1024).toFixed(2) + "Mb" : (tempObj.size / 1024).toFixed(2) + "Kb";
		} catch(e) {
			logger.error('---获取 ', fileList[i], ' 文件信息失败---\n');
			logger.error('---获取 ', fileList[i], ' 文件信息失败 错误信息开始---\n');
			logger.error(e);
			logger.error('---获取 ', fileList[i], ' 文件信息失败 错误信息结束---\n');
			fileObj.originalTime = "未知";
			fileObj.latestTime = "未知";
			fileObj.size = "未知";
		}
		data.list.push(fileObj);
	}
	logger.info("---返回：" + JSON.stringify(data) + "---");
	res.status(200);
	res.write(JSON.stringify(data));
	res.end();
});

/**
 * 文件预览
 * 
 */
router.get('/own-oss-pre/:name', function(req, res) {
	var name = req.params.name;
	logger.info('---', name, '文件预览开始---');
	fs.readFile(config._uploadPath + name, function(err, data) {
		if(err) {
			res.status(404);
			logger.info("---进入404页面---");
			var str = fs.readFileSync(config._route._notFound).toString();
			res.write(str);
			res.end();
			logger.error('--- ', name, ' 文件预览读取出错', "---");
			logger.error('--- ', name, ' 错误信息---\n');
			logger.error(err);
			logger.error('--- ', name, ' 错误信息结束---\n');
		} else {
			res.status(200);
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
	fs.access(config._uploadPath + name, function(err, data) {
		if(err) {
			res.status(404);
			logger.info("---进入404页面---");
			var str = fs.readFileSync(config._route._notFound).toString();
			res.write(str);
			res.end();
			logger.error('--- ', name, ' 文件下载出错：', name, "---");
			logger.error('--- ', name, ' 错误信息---\n');
			logger.error(err);
			logger.error('--- ', name, ' 错误信息结束---\n');
		} else {
			res.status(200);
			res.attachment(config._uploadPath + name);
			res.end()
			logger.info('--- ', name, ' 文件下载成功返回---');
		}
	});
});

module.exports = router;