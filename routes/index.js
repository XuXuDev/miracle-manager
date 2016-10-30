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
	logger.info("---上传文件数量：" + len,"个---")
	_.each(req.files, function(file) {
		fs.writeFile("../uploads/" + file.originalname, file.buffer, function(err) {
			len--;
			if(err) {
				logger.info("---",file.originalname,"上传失败---");
				data.code = "000001";
				data.msg = file.originalname + "upload fail";
			} else {
				logger.info("---",file.originalname,"上传完成---");
			}
			if(len === 0) {
				logger.info("---全部文件上传完成---")
				res.write(JSON.stringify(data));
				res.end();
			}
		})
	})
});

module.exports = router;