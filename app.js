var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var app = express();
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || 1314;
var config = require('./config/config.js');



/**
 * 判断是否存在日志配置文件夹，不存在则创建
 * 创建后加载日志模块
 *
 */
if(!fs.existsSync(config.LOGPATH)) {
	mkdirp.sync(config.LOGPATH);
	init();
} else {
	init();
}

function init() {
	var loggerModul = require('./log/log.js');
	global.logger = loggerModul.logger;
	logger.info("静态资源管理项目启动开始");
	logger.info("日志模块加载成功");
	logger.info('静态资源管理项目启动环境：' + process.env.NODE_ENV);
	logger.info('静态资源管理项目启动端口：' + process.env.PORT);
	if(process.env.NODE_ENV !== "production") {
		logger.info("启动开发坏境打印模式");
		loggerModul.use(app);
	} else {
		logger.info("启动正式坏境打印模式");
	}

	process.on('uncaughtException', function(err) {
		logger.error(err);
		logger.error(err.stack);
	})

	app.use(compression({
		filter: shouldCompress
	}))

	function shouldCompress(req, res) {
		if(req.headers['x-no-compression']) {
			return false
		}
		return compression.filter(req, res)
	}

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use('/', require('./routes/index'));

	logger.info('添加捕获404异常模块');
	//捕获404异常并且重定向到404错误
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
	logger.info('添加捕获404异常模块成功');
	logger.info('添加异常处理模块');
	app.use(logErrors);
	app.use(clientErrorHandler);
	app.use(errorHandler);
	logger.info('添加异常处理模块成功');

	function logErrors(err, req, res, next) {
		logger.error(req.url + '未找到');
		next(err);
	}

	function clientErrorHandler(err, req, res, next) {
		if(req.xhr) {
			logger.error(req.url + '接口请求异常');
			res.status(500).send({
				error: '服务器异常！'
			});
		} else {
			next(err);
		}
	}

	function errorHandler(err, req, res, next) {
		if(req.url.indexOf('.html') < 0 && req.url.indexOf('.') > -1) {
			logger.error(req.url + '--文件不存在');
			res.status(404);
			res.end();
		} else {
			logger.info('开始将' + req.url + '重定向到主页面');
			res.status(200);
			var str = fs.readFileSync("./public/main/manager/tpl/index.html").toString();
			res.write(str);
			res.end();
			logger.info(req.url + '重定向到主页面成功');
		}
	}

	module.exports = app;
	logger.info('静态资源管理项目启动完成');
}
