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

_.each(['get', 'post'], function(type) {
	router[type]('*', function(req, res, next) {
		if(req.xhr) {
			res.write('200');
			res.end();
		} else {
			logger.info('路由请求：' + req.url);
			next();
		}
	})
})

router.get('/', function(req, res, next) {
	res.write('200');
	res.end();
});

router.get('/manager/:name', function(req, res) {
	var name = req.params.name,
		tplPath = './public/main/manager/manager_' + name + '.html';
	logger.info('进入静态文件管理路由->页面名称:-----', 'manager_' + name, '-----');
	var str = (fs.existsSync(tplPath) ? (fs.readFileSync(tplPath).toString()) : '');
	res.write(str);
	res.end();
});

module.exports = router;