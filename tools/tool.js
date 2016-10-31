'use strict';
var _result = {};

_result = {
	getUrlScriptStr: function(url){
		return "<script> var currentRouter = '" + url + "';</script>"
	}
}

module.exports = _result;