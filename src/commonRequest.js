/**
 * 通用ajax请求，如果提供httpKey，会缓存请求，直到请求完成（成功或失败）
 * @param  {String}  url             请求地址
 * @param  {Object}  [params]          请求参数
 * @param  {Object}  [setting]         请求配置，覆盖原有配置。reconnect字段设置重连次数，默认为1
 * @param  {String}  [httpKey]         缓存id
 *
 * @example
 *     commonRequest(url, params, setting, httpKey);
 *     commonRequest(url, params, httpKey);
 *
 * @return 类Promise
 *
 * @update
 *     1、加入了前置拦截器，用于在请求发起前做些操作
 */

function runRequestInterceptor() {
    for (var i = 0; i < interceptors.length; i++) {
        interceptors[i].request && interceptors[i].request.apply(null, arguments);
    }
}

function runResponseInterceptor() {
    for (var i = 0; i < interceptors.length; i++) {
        interceptors[i].response && interceptors[i].response.apply(null, arguments);
    }
}


var interceptors,
    commonRequest = (function($http, $q) {
        var HTTP_ACTIVE = {};

        function commonRequest(url, params, setting, httpKey) {
            var xhr, reconnect, _params;

            // 参数修正
            if (typeof setting !== 'object') {
                httpKey = setting;
                setting = {};
            }

            reconnect = setting.reconnect || 1;
            delete setting.reconnect;

            _params = {
                url: url,
                data: params,
                dataType: 'json',
                timeout: 15000 // 设置15s为超时时间，jsonp无法注册fail，只能依赖超时时间了
            }

            function createXhr() {
                return $.ajax($.extend(_params, setting));
            }

            if (!httpKey || !HTTP_ACTIVE[httpKey]) {
                runRequestInterceptor(_params, setting);

                function preflight(json) {
                    runResponseInterceptor(json, _params);

                    if (commonRequest.checkResponse(json, params, url)) {
                        return $.Deferred().resolve(json);
                    } else {
                        return $.Deferred().reject(json || '');
                    }
                }

                function xheError(json) {
                    if (reconnect--) {
                        return createXhr().then(preflight, xheError);
                    } else {
                        return $.Deferred().reject(json);
                    }
                }

                xhr = createXhr().then(preflight, xheError).then(undefined, function(json) {
                    var msg,
                        defaultMsg = window.GLOBAL_CONFIG && window.GLOBAL_CONFIG.msg.not_error_msg;

                    msg = json.msg || json.message || defaultMsg;

                    if (!msg) {                        
                        /*if (json && json.statusText === 'error') {
                            msg = '网络通讯错误';
                        } else if (json === '') {
                            msg = '请求无响应实体';
                        } else if (json && typeof json !== undefined) {
                            msg = JSON.stringify(json);
                        } */

                        if (json === '') {
                            msg = '请求无响应实体';
                        } else if (json && json.statusText == 'timeout') {
                            msg = '请求超时';
                        } else if (json && json.statusText) {
                            msg = '网络通讯错误';
                        } else if (json && typeof json !== undefined) {
                            msg = JSON.stringify(json);
                        }

                        msg && (json.msg = msg);
                    }

                    return json;
                });


                if (httpKey && !HTTP_ACTIVE[httpKey]) {
                    HTTP_ACTIVE[httpKey] = xhr;

                    xhr.always(function() {
                        delete HTTP_ACTIVE[httpKey];
                    });
                }
            } else {
                xhr = HTTP_ACTIVE[httpKey];
            }

            return xhr;
        };

        function shortcutFnFactory(key, val) {
            return function(url, params, setting, httpKey) {
                // 参数修正
                if (typeof setting !== 'object') {
                    httpKey = setting;
                    setting = {};
                }

                setting[key] = val;

                return commonRequest(url, params, setting, httpKey);
            }
        }

        commonRequest.post = shortcutFnFactory('type', 'POST');
        commonRequest.jsonp = shortcutFnFactory('dataType', 'jsonp');

        return commonRequest;
    })();

// 检查响应内容是否表示成功。暂时不做异步支持
commonRequest.checkResponse = function(json) {
    return json && (+json.err === 0 || json.status.toLowerCase() === 'ok' || +json.status === 200)
}

interceptors = commonRequest.interceptors = [];

module.exports = {
    commonRequest: commonRequest
};