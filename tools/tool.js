'use strict';
var tool = {};

tool = {
	_getUrlScriptStr: function(url) {
		return "<script> var currentRouter = '" + url + "';</script>"
	}
}

module.exports = tool;