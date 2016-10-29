/*!
 * =====================================================
 * wxCommon v1.0.0
 * =====================================================
 */
/**
 * 核心公共JS
 * @type _L1.wxCommon|Function
 */
var wx = (function(document, undefined) {
	var readyRE = /complete|loaded|interactive/;
	var idSelectorRE = /^#([\w-]+)$/;
	var classSelectorRE = /^\.([\w-]+)$/;
	var tagSelectorRE = /^[\w-]+$/;
	var translateRE = /translate(?:3d)?\((.+?)\)/;
	var translateMatrixRE = /matrix(3d)?\((.+?)\)/;

	var wxCommon = function(selector, context) {
		context = context || document;
		if(!selector)
			return wrap();
		if(typeof selector === 'object')
			return wrap([selector], null);
		if(typeof selector === 'function')
			return wxCommon.ready(selector);
		if(typeof selector === 'string') {
			try {
				selector = selector.trim();
				if(idSelectorRE.test(selector)) {
					var found = document.getElementById(RegExp.$1);
					return wrap(found ? [found] : []);
				}
				return wrap(wxCommon.qsa(selector, context), selector);
			} catch(e) {}
		}
		return wrap();
	};

	var wrap = function(dom, selector) {
		dom = dom || [];
		Object.setPrototypeOf(dom, wxCommon.fn);
		dom.selector = selector || '';
		return dom;
	};

	/**
	 * lazyload
	 */
	if('addEventListener' in document) {
		document.addEventListener('DOMContentLoaded', function() {
			try {
				FastClick.attach(document.body);
			} catch(e) {}
		}, false);
	}


	/**
	 * 监测设备
	 */
	wxCommon.browser = {
		versions: function() {
			var u = navigator.userAgent,
				app = navigator.appVersion;
			return { //移动终端浏览器版本信息 
				trident: u.indexOf('Trident') > -1, //IE内核 
				presto: u.indexOf('Presto') > -1, //opera内核 
				webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核 
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核 
				mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端 
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端 
				android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器 
				iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器 
				iPad: u.indexOf('iPad') > -1, //是否iPad 
				webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部 
				weiXin: u.toLowerCase().match(/MicroMessenger/i) == 'micromessenger', //判断是否是微信浏览器
				weiBo: u.indexOf('Weibo') > -1 //判断是否是微博浏览器
			};
		}(),
		language: (navigator.browserLanguage || navigator.language).toLowerCase()
	};

	wxCommon.uuid = 0;

	wxCommon.data = {};
	/**
	 * extend(simple)
	 * @param {type} target
	 * @param {type} source
	 * @param {type} deep
	 * @returns {unresolved}
	 */
	wxCommon.extend = function() { //from jquery2
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		if(typeof target === "boolean") {
			deep = target;

			target = arguments[i] || {};
			i++;
		}

		if(typeof target !== "object" && !wxCommon.isFunction(target)) {
			target = {};
		}

		if(i === length) {
			target = this;
			i--;
		}

		for(; i < length; i++) {
			if((options = arguments[i]) != null) {
				for(name in options) {
					src = target[name];
					copy = options[name];

					if(target === copy) {
						continue;
					}

					if(deep && copy && (wxCommon.isPlainObject(copy) || (copyIsArray = wxCommon.isArray(copy)))) {
						if(copyIsArray) {
							copyIsArray = false;
							clone = src && wxCommon.isArray(src) ? src : [];

						} else {
							clone = src && wxCommon.isPlainObject(src) ? src : {};
						}

						target[name] = wxCommon.extend(deep, clone, copy);

					} else if(copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		return target;
	};
	/**
	 * wx noop(function)
	 */
	wxCommon.noop = function() {};
	/**
	 * wx slice(array)
	 */
	wxCommon.slice = [].slice;
	/**
	 * wx filter(array)
	 */
	wxCommon.filter = [].filter;

	wxCommon.type = function(obj) {
		return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
	};
	/**
	 * wx isArray
	 */
	wxCommon.isArray = Array.isArray ||
		function(object) {
			return object instanceof Array;
		};
	/**
	 * wx isWindow(需考虑obj为undefined的情况)
	 */
	wxCommon.isWindow = function(obj) {
		return obj != null && obj === obj.window;
	};
	/**
	 * wx isObject
	 */
	wxCommon.isObject = function(obj) {
		return wxCommon.type(obj) === "object";
	};
	/**
	 * wx isPlainObject
	 */
	wxCommon.isPlainObject = function(obj) {
		return wxCommon.isObject(obj) && !wxCommon.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
	};
	/**
	 * wx isEmptyObject
	 * @param {Object} o
	 */
	wxCommon.isEmptyObject = function(o) {
		for(var p in o) {
			if(p !== undefined) {
				return false;
			}
		}
		return true;
	};
	/**
	 * wx isFunction
	 */
	wxCommon.isFunction = function(value) {
		return wxCommon.type(value) === "function";
	};
	/**
	 * wx querySelectorAll
	 * @param {type} selector
	 * @param {type} context
	 * @returns {Array}
	 */
	wxCommon.qsa = function(selector, context) {
		context = context || document;
		return wxCommon.slice.call(classSelectorRE.test(selector) ? context.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
	};
	/**
	 * ready(DOMContentLoaded)
	 * @param {type} callback
	 * @returns {_L6.wxCommon}
	 */
	wxCommon.ready = function(callback) {
		if(readyRE.test(document.readyState)) {
			callback(wxCommon);
		} else {
			document.addEventListener('DOMContentLoaded', function() {
				callback(wxCommon);
			}, false);
		}
		return this;
	};
	/**
	 * each
	 * @param {type} elements
	 * @param {type} callback
	 * @returns {_L8.wxCommon}
	 */
	wxCommon.each = function(elements, callback, hasOwnProperty) {
		if(!elements) {
			return this;
		}
		if(typeof elements.length === 'number') {
			[].every.call(elements, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
		} else {
			for(var key in elements) {
				if(hasOwnProperty) {
					if(elements.hasOwnProperty(key)) {
						if(callback.call(elements[key], key, elements[key]) === false) return elements;
					}
				} else {
					if(callback.call(elements[key], key, elements[key]) === false) return elements;
				}
			}
		}
		return this;
	};
	/**
	 * trigger event
	 * @param {type} element
	 * @param {type} eventType
	 * @param {type} eventData
	 * @returns {_L8.wxCommon}
	 */
	wxCommon.trigger = function(element, eventType, eventData) {
		element.dispatchEvent(new CustomEvent(eventType, {
			detail: eventData,
			bubbles: true,
			cancelable: true
		}));
		return this;
	};
	/**
	 * getStyles
	 * @param {type} element
	 * @param {type} property
	 * @returns {styles}
	 */
	wxCommon.getStyles = function(element, property) {
		var styles = element.ownerDocument.defaultView.getComputedStyle(element, null);
		if(property) {
			return styles.getPropertyValue(property) || styles[property];
		}
		return styles;
	};
	/**
	 * parseTranslate
	 * @param {type} translateString
	 * @param {type} position
	 * @returns {Object}
	 */
	wxCommon.parseTranslate = function(translateString, position) {
		var result = translateString.match(translateRE || '');
		if(!result || !result[1]) {
			result = ['', '0,0,0'];
		}
		result = result[1].split(",");
		result = {
			x: parseFloat(result[0]),
			y: parseFloat(result[1]),
			z: parseFloat(result[2])
		};
		if(position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};
	/**
	 * parseTranslateMatrix
	 * @param {type} translateString
	 * @param {type} position
	 * @returns {Object}
	 */
	wxCommon.parseTranslateMatrix = function(translateString, position) {
		var matrix = translateString.match(translateMatrixRE);
		var is3D = matrix && matrix[1];
		if(matrix) {
			matrix = matrix[2].split(",");
			if(is3D === "3d")
				matrix = matrix.slice(12, 15);
			else {
				matrix.push(0);
				matrix = matrix.slice(4, 7);
			}
		} else {
			matrix = [0, 0, 0];
		}
		var result = {
			x: parseFloat(matrix[0]),
			y: parseFloat(matrix[1]),
			z: parseFloat(matrix[2])
		};
		if(position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};
	wxCommon.hooks = {};
	wxCommon.addAction = function(type, hook) {
		var hooks = wxCommon.hooks[type];
		if(!hooks) {
			hooks = [];
		}
		hook.index = hook.index || 1000;
		hooks.push(hook);
		hooks.sort(function(a, b) {
			return a.index - b.index;
		});
		wxCommon.hooks[type] = hooks;
		return wxCommon.hooks[type];
	};
	wxCommon.doAction = function(type, callback) {
		if(wxCommon.isFunction(callback)) { //指定了callback
			wxCommon.each(wxCommon.hooks[type], callback);
		} else { //未指定callback，直接执行
			wxCommon.each(wxCommon.hooks[type], function(index, hook) {
				return !hook.handle();
			});
		}
	};
	/**
	 * setTimeout封装
	 * @param {Object} fn
	 * @param {Object} when
	 * @param {Object} context
	 * @param {Object} data
	 */
	wxCommon.later = function(fn, when, context, data) {
		when = when || 0;
		var m = fn;
		var d = data;
		var f;
		var r;

		if(typeof fn === 'string') {
			m = context[fn];
		}

		f = function() {
			m.apply(context, wxCommon.isArray(d) ? d : [d]);
		};

		r = setTimeout(f, when);

		return {
			id: r,
			cancel: function() {
				clearTimeout(r);
			}
		};
	};
	wxCommon.now = Date.now || function() {
		return +new Date();
	};
	var class2type = {};
	wxCommon.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function(i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});
	if(window.JSON) {
		wxCommon.parseJSON = JSON.parse;
	}
	/**
	 * wxCommon.fn
	 */
	wxCommon.fn = {
		each: function(callback) {
			[].every.call(this, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
			return this;
		}
	};

	/**
	 * 兼容 AMD 模块
	 **/
	if(typeof define === 'function' && define.amd) {
		define('wx', [], function() {
			return wxCommon;
		});
	}

	return wxCommon;
})(document);

/**
 * fixed CustomEvent
 */
(function() {
	if(typeof window.CustomEvent === 'undefined') {
		function CustomEvent(event, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			var evt = document.createEvent('Events');
			var bubbles = true;
			for(var name in params) {
				(name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
			}
			evt.initEvent(event, bubbles, true);
			return evt;
		};
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}
})();
/*
	A shim for non ES5 supporting browsers.
	Adds function bind to Function prototype, so that you can do partial application.
	Works even with the nasty thing, where the first word is the opposite of extranet, the second one is the profession of Columbus, and the version number is 9, flipped 180 degrees.
*/

Function.prototype.bind = Function.prototype.bind || function(to) {
	// Make an array of our arguments, starting from second argument
	var partial = Array.prototype.splice.call(arguments, 1),
		// We'll need the original function.
		fn = this;
	var bound = function() {
			// Join the already applied arguments to the now called ones (after converting to an array again).
			var args = partial.concat(Array.prototype.splice.call(arguments, 0));
			// If not being called as a constructor
			if(!(this instanceof bound)) {
				// return the result of the function called bound to target and partially applied.
				return fn.apply(to, args);
			}
			// If being called as a constructor, apply the function bound to self.
			fn.apply(this, args);
		}
		// Attach the prototype of the function to our newly created function.
	bound.prototype = fn.prototype;
	return bound;
};
/**
 * wx fixed classList
 * @param {type} document
 * @returns {undefined}
 */
(function(document) {
	if(!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {

		Object.defineProperty(HTMLElement.prototype, 'classList', {
			get: function() {
				var self = this;

				function update(fn) {
					return function(value) {
						var classes = self.className.split(/\s+/),
							index = classes.indexOf(value);

						fn(classes, index, value);
						self.className = classes.join(" ");
					};
				}

				var ret = {
					add: update(function(classes, index, value) {
						~index || classes.push(value);
					}),
					remove: update(function(classes, index) {
						~index && classes.splice(index, 1);
					}),
					toggle: update(function(classes, index, value) {
						~index ? classes.splice(index, 1) : classes.push(value);
					}),
					contains: function(value) {
						return !!~self.className.split(/\s+/).indexOf(value);
					},
					item: function(i) {
						return self.className.split(/\s+/)[i] || null;
					}
				};

				Object.defineProperty(ret, 'length', {
					get: function() {
						return self.className.split(/\s+/).length;
					}
				});

				return ret;
			}
		});
	}
})(document);

/**
 * wx ajax
 * @param {type} wxCommon
 * @returns {undefined}
 */
(function(wxCommon, window, undefined) {

	var jsonType = 'application/json';
	var htmlType = 'text/html';
	var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
	var scriptTypeRE = /^(?:text|application)\/javascript/i;
	var xmlTypeRE = /^(?:text|application)\/xml/i;
	var blankRE = /^\s*$/;

	wxCommon.ajaxSettings = {
		type: 'GET',
		beforeSend: wxCommon.noop,
		success: wxCommon.noop,
		error: wxCommon.noop,
		complete: wxCommon.noop,
		context: null,
		xhr: function(protocol) {
			return new window.XMLHttpRequest();
		},
		accepts: {
			script: 'text/javascript, application/javascript, application/x-javascript',
			json: jsonType,
			xml: 'application/xml, text/xml',
			html: htmlType,
			text: 'text/plain'
		},
		timeout: 0,
		processData: true,
		cache: true
	};
	var ajaxBeforeSend = function(xhr, settings) {
		var context = settings.context
		if(settings.beforeSend.call(context, xhr, settings) === false) {
			return false;
		}
	};
	var ajaxSuccess = function(data, xhr, settings) {
		settings.success.call(settings.context, data, 'success', xhr);
		ajaxComplete('success', xhr, settings);
	};
	// type: "timeout", "error", "abort", "parsererror"
	var ajaxError = function(error, type, xhr, settings) {
		settings.error.call(settings.context, xhr, type, error);
		ajaxComplete(type, xhr, settings);
	};
	// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
	var ajaxComplete = function(status, xhr, settings) {
		settings.complete.call(settings.context, xhr, status);
	};

	var serialize = function(params, obj, traditional, scope) {
		var type, array = wxCommon.isArray(obj),
			hash = wxCommon.isPlainObject(obj);
		wxCommon.each(obj, function(key, value) {
			type = wxCommon.type(value);
			if(scope) {
				key = traditional ? scope :
					scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
			}
			// handle data in serializeArray() format
			if(!scope && array) {
				params.add(value.name, value.value);
			}
			// recurse into nested objects
			else if(type === "array" || (!traditional && type === "object")) {
				serialize(params, value, traditional, key);
			} else {
				params.add(key, value);
			}
		});
	};
	var serializeData = function(options) {
		if(options.processData && options.data && typeof options.data !== "string") {
			options.data = wxCommon.param(options.data, options.traditional);
		}
		if(options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
			options.url = appendQuery(options.url, options.data);
			options.data = undefined;
		}
	};
	var appendQuery = function(url, query) {
		if(query === '') {
			return url;
		}
		return(url + '&' + query).replace(/[&?]{1,2}/, '?');
	};
	var mimeToDataType = function(mime) {
		if(mime) {
			mime = mime.split(';', 2)[0];
		}
		return mime && (mime === htmlType ? 'html' :
			mime === jsonType ? 'json' :
			scriptTypeRE.test(mime) ? 'script' :
			xmlTypeRE.test(mime) && 'xml') || 'text';
	};
	var parseArguments = function(url, data, success, dataType) {
		if(wxCommon.isFunction(data)) {
			dataType = success, success = data, data = undefined;
		}
		if(!wxCommon.isFunction(success)) {
			dataType = success, success = undefined;
		}
		return {
			url: url,
			data: data,
			success: success,
			dataType: dataType
		};
	};
	wxCommon.ajax = function(url, options) {
		if(typeof url === "object") {
			options = url;
			url = undefined;
		}
		var settings = options || {};
		settings.url = url || settings.url;
		for(var key in wxCommon.ajaxSettings) {
			if(settings[key] === undefined) {
				settings[key] = wxCommon.ajaxSettings[key];
			}
		}
		serializeData(settings);
		var dataType = settings.dataType;

		if(settings.cache === false || ((!options || options.cache !== true) && ('script' === dataType))) {
			settings.url = appendQuery(settings.url, '_=' + wxCommon.now());
		}
		var mime = settings.accepts[dataType];
		var headers = {};
		var setHeader = function(name, value) {
			headers[name.toLowerCase()] = [name, value];
		};
		var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
		var xhr = settings.xhr(settings);
		var nativeSetHeader = xhr.setRequestHeader;
		var abortTimeout;

		setHeader('X-Requested-With', 'XMLHttpRequest');
		setHeader('Accept', mime || '*/*');
		if(!!(mime = settings.mimeType || mime)) {
			if(mime.indexOf(',') > -1) {
				mime = mime.split(',', 2)[0];
			}
			xhr.overrideMimeType && xhr.overrideMimeType(mime);
		}
		if(settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')) {
			setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
		}
		if(settings.headers) {
			for(var name in settings.headers)
				setHeader(name, settings.headers[name]);
		}
		xhr.setRequestHeader = setHeader;

		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4) {
				xhr.onreadystatechange = wxCommon.noop;
				clearTimeout(abortTimeout);
				var result, error = false;
				var isLocal = protocol === 'file:';
				if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && isLocal && xhr.responseText)) {
					dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
					result = xhr.responseText;
					try {
						// http://perfectionkills.com/global-eval-what-are-the-options/
						if(dataType === 'script') {
							(1, eval)(result);
						} else if(dataType === 'xml') {
							result = xhr.responseXML;
						} else if(dataType === 'json') {
							result = blankRE.test(result) ? null : wxCommon.parseJSON(result);
						}
					} catch(e) {
						error = e;
					}

					if(error) {
						ajaxError(error, 'parsererror', xhr, settings);
					} else {
						ajaxSuccess(result, xhr, settings);
					}
				} else {
					var status = xhr.status ? 'error' : 'abort';
					var statusText = xhr.statusText || null;
					if(isLocal) {
						status = 'error';
						statusText = '404';
					}
					ajaxError(statusText, status, xhr, settings);
				}
			}
		};
		if(ajaxBeforeSend(xhr, settings) === false) {
			xhr.abort();
			ajaxError(null, 'abort', xhr, settings);
			return xhr;
		}

		if(settings.xhrFields) {
			for(var name in settings.xhrFields) {
				xhr[name] = settings.xhrFields[name];
			}
		}

		var async = 'async' in settings ? settings.async : true;

		xhr.open(settings.type.toUpperCase(), settings.url, async, settings.username, settings.password);

		for(var name in headers) {
			nativeSetHeader.apply(xhr, headers[name]);
		}
		if(settings.timeout > 0) {
			abortTimeout = setTimeout(function() {
				xhr.onreadystatechange = wxCommon.noop;
				xhr.abort();
				ajaxError(null, 'timeout', xhr, settings);
			}, settings.timeout);
		}
		xhr.send(settings.data ? settings.data : null);
		return xhr;
	};

	wxCommon.param = function(obj, traditional) {
		var params = [];
		params.add = function(k, v) {
			this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
		};
		serialize(params, obj, traditional);
		return params.join('&').replace(/%20/g, '+');
	};
	wxCommon.get = function( /* url, data, success, dataType */ ) {
		return wxCommon.ajax(parseArguments.apply(null, arguments));
	};

	wxCommon.post = function( /* url, data, success, dataType */ ) {
		var options = parseArguments.apply(null, arguments);
		options.type = 'POST';
		return wxCommon.ajax(options);
	};

	wxCommon.getJSON = function( /* url, data, success */ ) {
		var options = parseArguments.apply(null, arguments);
		options.dataType = 'json';
		return wxCommon.ajax(options);
	};

	wxCommon.fn.load = function(url, data, success) {
		if(!this.length)
			return this;
		var self = this,
			parts = url.split(/\s/),
			selector,
			options = parseArguments(url, data, success),
			callback = options.success;
		if(parts.length > 1)
			options.url = parts[0], selector = parts[1];
		options.success = function(response) {
			if(selector) {
				var div = document.createElement('div');
				div.innerHTML = response.replace(rscript, "");
				var selectorDiv = document.createElement('div');
				var childs = div.querySelectorAll(selector);
				if(childs && childs.length > 0) {
					for(var i = 0, len = childs.length; i < len; i++) {
						selectorDiv.appendChild(childs[i]);
					}
				}
				self[0].innerHTML = selectorDiv.innerHTML;
			} else {
				self[0].innerHTML = response;
			}
			callback && callback.apply(self, arguments);
		};
		wxCommon.ajax(options);
		return this;
	};

})(wx, window);

(function(wxCommon, window) {
	/**
	 * 解析页面参数
	 */
	wxCommon.parseQueryString = function(url) {
		var obj = {};
		var keyvalue = [];
		var key = "",
			value = "";
		if(url.indexOf("?") > 0 && url.indexOf('?') < url.length - 1) {
			var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
			for(var i in paraString) {
				keyvalue = paraString[i].split("=");
				key = keyvalue[0];
				value = keyvalue[1] === undefined ? '' : keyvalue[1];
				obj[key] = value;
			}
		}
		return obj;
	};

	/**
	 * alert Object
	 */
	wxCommon.allPrpos = function(obj) {
		var props = "";
		for(var p in obj) {
			if(typeof(obj[p]) == "function") {} else {
				props += p + "=" + obj[p] + ";  ";
			}
		}
		alert(props);
	}

	/**
	 * cookie写入
	 */
	wxCommon.setcookie = function(name, value) {
		var Days = 30;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
	}

	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
	Date.prototype.Format = function(fmt) { //author: meizz 
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

	/**
	 * 时间戳转换成日期
	 */
	wxCommon.getLocalTime = function(nS) {
		return new Date(nS).Format("yyyy-MM-dd hh:mm:ss");
	}
})(wx, window);


/**
 * wx confirm window
 * @param {type} wxCommon
 * @returns {undefined}
 */
(function(wxCommon, window, undefined) {
	wxCommon.closeTipWindow = function(options, callback) {
		if(document.getElementsByClassName('wx-mask')[0]) {
			document.body.removeChild(document.getElementsByClassName('wx-mask')[0]);
		}
	};
	wxCommon.tipWindow = function(options, callback) {
		var _tipWindow = document.getElementsByClassName('wx-mask')[0];
		console.log(_tipWindow)
		if(!_tipWindow && !wxCommon.isEmptyObject(options)) {
			var _isTitle = options.title != null && options.title.trim() !== "";
			var _isInfo = options.info != null && options.info.trim() !== "";
			var _isCancle = !wxCommon.isEmptyObject(options.cancle);
			var _isConfirm = !wxCommon.isEmptyObject(options.confirm);
			var _maskDiv = document.createElement("div");
			_maskDiv.className = "wx-mask"
			document.body.appendChild(_maskDiv);
			var htmlStr = "<div class='wx-mask'> <div class='wx-tip-window'> <div class='wx-tip-inner'>";
			// ontouchend='event.target.classList.contains(\'wx-mask\')&&wx.closeTipWindow();'
			if(_isTitle) {
				htmlStr += "<h4 class='wx-tip-title'>" + options.title + "</h4>";
			}
			if(_isInfo) {
				htmlStr += "<p class='wx-tip-info'>" + options.info + "</p></div>";
			} else {
				throw "options need info value";
			}
			htmlStr += "<div class='wx-tip-button'><table style='width: 100%;' cellspacing='0'><tbody><tr>";
			if(_isCancle) {
				options.cancle.btn = options.cancle.btn == null ? "" : options.cancle.btn;
				if(options.cancle.btn.trim() == "") {
					_isCancle = false;
					throw "options cancle.btn value format wrong";
				} else if(!wxCommon.isFunction(options.confirm.callback)) {
					_isCancle = false;
					throw "options cancle.callback value format wrong";
				} else {
					htmlStr += "<td class='wx-tip-cancle-border' id='_wxCancleBtn'><span class='wx-tip-cancle'>" + options.cancle.btn + "</span></td>";
				}
			}
			if(_isConfirm) {
				options.confirm.btn = options.confirm.btn == null ? "" : options.confirm.btn;
				if(options.confirm.btn.trim() == "") {
					_isConfirm = false;
					throw "options confirm.btn value format wrong";
				} else if(!wxCommon.isFunction(options.confirm.callback)) {
					_isConfirm = false;
					throw "options confirm.callback value format wrong";
				} else {
					htmlStr += "<td class='wx-tip-confirm-border' id='_wxConfirmBtn'><span class='wx-tip-confirm'>" + options.confirm.btn + "</span></td>";
				}
			} else {
				throw "options need confirm value";
			}
			htmlStr += "</tr></tbody></table></div>";
			htmlStr += "</div></div>";
			_maskDiv.innerHTML += htmlStr;
			_maskDiv.querySelector('.wx-mask').ontouchend=function(e){
				if(e.target.classList.contains('wx-mask')){
					wx.closeTipWindow();
				}

			}
			if(_isCancle) {
				document.getElementById('_wxCancleBtn').addEventListener('click', function() {
					options.cancle.callback();
				})
			}
			if(_isConfirm) {
				document.getElementById('_wxConfirmBtn').addEventListener('click', function() {
					options.confirm.callback();
				})
			}
		}
	}
})(wx, window);

/**
 * wx loading
 * @param {type} wxCommon
 * @returns {undefined}
 */
(function(wxCommon, window, undefined) {
	wxCommon.closeLoading = function() {
		if(document.getElementsByClassName('wx-mask-loading')[0]) {
			document.body.removeChild(document.getElementsByClassName('wx-mask-loading')[0]);
		}
	};
	wxCommon.loading = function() {
		var _loading = document.getElementsByClassName('wx-mask-loading')[0];
		if(!_loading) {
			var _maskDiv = document.createElement("div");
			_maskDiv.className = "wx-mask-loading";
			document.body.appendChild(_maskDiv);
			var htmlStr = "<div class='wx-loading-window' style='font-size:16px'>";
			htmlStr += "<div class='wx-loading-div'>";
			htmlStr += "<img class='wx-loading-hand' src='http://kkh-static.kongkonghu.com/web-mobile/loading_bg_hand.png'/>";
			htmlStr += "<img class='wx-loading-ears' src='http://kkh-static.kongkonghu.com/web-mobile/loading_bg_ears.png'/>";
			htmlStr += "</div>";
			htmlStr += "<span class='wx-loading-tip'>加载中...</span>";
			htmlStr += "</div>";
			_maskDiv.innerHTML += htmlStr;
		}
	}
})(wx, window);