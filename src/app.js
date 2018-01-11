// 注意：因时间关系，ZeroClipboard、moment、moment-zh-cn、htmldiff、nprogress的模块定义部分代码被注释
// ZeroClipboard会检查有define，本项目用了requireJs，但是UEditor并没有。

/**
 * @todo 拆分代码。
 *
 * |   &nbsp;   |  view.tree  |   data.tree  |  data.chip |
 * | --------   | :----:      |  :----:      | :----:     |
 * | 常规数据   |  √          |    √         |   ╳       |
 * | 分享文件   |  ╳         |    ╳        |   √        |
 * | 收藏夹     |  √          |    ╳        |   √        |
 * | 搜索结果   |  ╳         |    ╳        |   √        |
 * 
 * 1、后台的数据不会为根树分配id，前端调用initData后会默认分配0作为tree的nid。备注：前端用tid+nid标识节点的唯一性。
 */

if (!window.console) {
    window.console = {
        log: function() {}
    };
}


/* 全局配置 */
var UEDITOR_HOME_URL = '/ueditor/dist/utf8-php/';
var GLOBAL_CONFIG = (function() {
    var protocol = location.protocol,
        hostname = location.hostname,
        // hostname = 'doc.joyport.com',
        rootDomain = /\w+\.\w+(?=$)/.exec(hostname)[0],
        origin = protocol + '//' + hostname,
        api = protocol + '//api.' + hostname;
        // api = protocol + '//api.' + 'doc.joyport.com';
        // origin = location.href.match(/^(\w)*(:\/\/)*(\w+\.){1,}\w+(?=(\/|$))/)[0],
        // api = 'http://api.' + origin.replace(/^\w*:\/\//, '');

    return {
        msg: {
            // not_error_msg: '未知错误'
            clipSuccess: '移动成功'
        },
        url: {
            origin: origin,
            rootDomain: rootDomain,
            api: api,
            hostname: hostname,
            auth: protocol + '//auth.' + rootDomain,
            md: protocol + '//md.' + hostname, // hostname,
            mind: protocol + '//graph.' + hostname
        },
        SERVER_CONFIG: {
            search_num: 30 // 搜索结果单次的量
        },
        tpl: {
            wikiIframe: "<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml' class='view'><head><style type='text/css'>.htmldiff-ins {background: #D0FFD0;text-decoration: none;}.htmldiff-del {background: #FFD7D7;}.view{padding:0;word-wrap:break-word;cursor:text;height:90%;zoom: 1;}.view:after {clear: both;}.view:after,.view:before {content: '';display: table;}body{margin:8px;font-family:sans-serif;font-size:16px;}p{margin:5px 0;}</style><link rel='stylesheet' type='text/css' href='" + origin + "/ueditor/dist/utf8-php/themes/iframe.css'/></head><body class='view' id='diff-view'>$1</body></html>",
            mdIframe: "<!DOCTYPE html><html xmlns='http://www.w3.org/1999/xhtml' class='view'><head><style type='text/css'>pre {font: normal 14px/1.6 'Microsoft YaHei';}.htmldiff-ins {background: #D0FFD0;text-decoration: none;}.htmldiff-del {background: #FFD7D7;}.view{padding:0;word-wrap:break-word;cursor:text;height:90%;zoom: 1;}.view:after {clear: both;}.view:after,.view:before {content: '';display: table;}body{margin:8px;font-family:'Microsoft YaHei',sans-serif;font-size:14px;}</style></head><body class='view'><pre id='diff-view'>$1</pre></body></html>"
        }
    };
})();

define([
    'angular',
    'NProgress',
    '../docsys/app/launcher',
    '../docsys/app/docSocket',
    '../docsys/app/template',
    'commonModule',
    'uiModule',
    'authModule',
    'groupModule',
    'widgetModule',
    'searchModule',
    'previewModule',
    'explorerModule',
    'historyModule',
    'logModule'
], function(angular, NProgress, launcher, docSocket, template, commonModule, uiModule, authModule, groupModule, widgetModule, searchModule, previewModule, explorerModule, historyModule, logModule) {

    // 进度条配置
    NProgress.configure({
        parent: '.exp-location',
        template: '<div class="bar" role="bar"><div class="peg"></div></div>',
        minimum: 0.3
    });

    angular.module('docSys', [
            'ui.router',
            commonModule.name,
            uiModule.name,
            authModule.name,
            groupModule.name,
            widgetModule.name,
            searchModule.name,
            previewModule.name,
            explorerModule.name,
            historyModule.name,
            logModule.name
        ])

        .config([
            '$provide',
            function($provide) {
                return $provide.decorator('$rootScope', [
                    '$delegate',
                    function($delegate) {
                        $delegate.safeApply = function(fn) {
                            var phase = $delegate.$$phase;
                            if (phase === "$apply" || phase === "$digest") {
                                if (fn && typeof fn === 'function') {
                                    fn();
                                }
                            } else {
                                $delegate.$apply(fn);
                            }
                        };
                        return $delegate;
                    }
                ]);
            }
        ])

        .factory('cEvent', function() {
            var handler = {},
                regEvent = /^([^.]*)\.?([^.]*)$/;

            function on(type, listener) {
                var match = type.match(regEvent),
                    type = match[1],
                    cls = match[2] || '.';

                if (!handler[type]) {
                    handler[type] = {};
                }

                if (!handler[type][cls]) {
                    handler[type][cls] = [];
                }
                handler[type][cls].push(listener);
            }

            function emit(type, para) {
                var match = type.match(regEvent),
                    type = match[1],
                    cls = match[2],
                    handlerObj = handler[type],
                    handlers, eventCls, e, i;

                if (handlerObj) {
                    e = {
                        type: type
                    };
                    if (cls) {
                        e.class = cls;
                    }
                    if (para) {
                        e.data = para;
                    }

                    for (eventCls in handlerObj) {
                        if (!cls || cls == eventCls) {
                            handlers = handlerObj[eventCls];
                            for (i = 0, len = handlers.length; i < len; i++) {
                                handlers[i](e);
                            }
                        }
                    }
                }
            }

            return {
                on: on,
                emit: emit
            };
        })
        .filter('to_trusted', ['$sce', function($sce) {
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]).filter('is_dir', ['explorerAPI', function(explorerAPI) {
            return function($ele) {
                return $ele && explorerAPI.tree.find($ele.scope().node).type == 'file';
            };
        }])
        .filter('getDownloadLink', function() {
            return function(node) {
                return node && node.path;
            };
        })
        .filter('path', ['explorerAPI', function(explorerAPI) {
            return function(id, type) {
                /*if (id) {
                    var breadcrumb = '<ol class="breadcrumb">',
                        path_arr = explorerAPI.tree.getPath(id, type),
                        curr_item = path_arr.length ? (path_arr.pop().data.name || '???') : '???';

                    curr_item = '<li class="active">' + curr_item + '</li></ol>';

                    path_arr = $.map(path_arr, function(node) {
                        return '<li><span>' + (node.data.name || '???') + '</span></li>';
                    });

                    return breadcrumb + path_arr.join('') + curr_item;
                } else {
                    return '<ol class="breadcrumb">&nbsp;</ol>';
                }*/

                type = type || 'dir';

                if (id) {
                    var pathArr = explorerAPI.tree.getPath(id, type);

                    pathArr = $.map(pathArr, function(node) {
                        return node.data.name;
                    });

                    return pathArr.join(' / ');
                }

            };
        }])
        .factory('uiTool', [function() {
            function requestContent(config, $parent, animate) {
                var isAbsUrl = config.url.search('://') !== -1,
                    isCross;

                if (isAbsUrl && config.url.match(/.*?[^\/:](?=\/)/)[0] !== location.href.match(/.*?[^\/:](?=\/)/)[0]) {
                    isCross = true;
                }

                $.ajax({
                    url: config.url,
                    type: config.type,
                    data: config.data,
                    dataType: config.dataType || (isCross ? 'jsonp' : 'json'),
                    success: function(json) {
                        var html,
                            $ele = $('<' + (config.tag || 'div') + ' class="gg-tab-box gg-tab-box-animate" style="position: absolute; display: none;" />')

                        if (config.success && (html = config.success(json, $ele))) {
                            $ele.html(html).appendTo($parent);
                            selectGGBox($parent.children().index($ele[0]), $parent, animate);
                        }
                    }
                });
            }


            var $prevQueue,
                changeTimer;

            function onCssEvent(ele, type, callback) {

                var $me = $(ele),
                    e = ' webkit$ o$ MS$';

                if (typeof type === 'function') {
                    callback = type;
                    type = 'transitionend';
                }

                type = (type.charAt(0).toUpperCase() + type.slice(1)).replace(/(?:end|start)$/, function(_) {
                    return _.charAt(0).toUpperCase() + _.slice(1);
                });

                var binding = type.toLowerCase() + e.replace(/\$/g, type);

                $me.on(binding, function(e) {
                    $me.off(binding);

                    if (typeof callback === "function") {
                        callback.call($me[0], e);
                    }
                });
            }


            function selectGGBox(n, $parent, animate) {
                var $act = $parent.children('.gg-tab-box-active').css({
                        'position': 'relative',
                        'display': 'block'
                    }),
                    $tar = $parent.children('.gg-tab-box').eq(n);

                if ($act[0] !== $tar[0] || !$act[0]) {
                    function hideEle(e) {
                        !$act.is('.gg-tab-box-active') && $act.css({
                            'display': 'none'
                        });
                    }
                    //代替transitionEnd事件
                    // setTimeout(function (){
                    // $act[0] && ($act[0].style.display = 'none');
                    // }, 400);

                    if (typeof n === 'object') {
                        var $ele;

                        if (n.element) {
                            $ele = $(n.element);

                            $ele.appendTo($parent);
                            selectGGBox($parent.children().index($ele[0]), $parent, animate);
                        } else if (n.html) {
                            $ele = $('<' + (n.tag || 'div') + ' class="gg-tab-box gg-tab-box-animate" style="position: absolute; display: none;" />')

                            n.callback && n.callback($ele);
                            $ele.html(n.html).appendTo($parent);
                            selectGGBox($parent.children().index($ele[0]), $parent, animate);
                        } else {
                            requestContent(n, $parent, animate);
                        }

                        return;
                    }


                    if (animate === false) {
                        $act.removeClass('gg-tab-box-animate');
                        $tar.removeClass('gg-tab-box-animate');
                        setTimeout(hideEle, 10);
                    } else {
                        $act.addClass('gg-tab-box-animate');
                        $tar.addClass('gg-tab-box-animate');
                        onCssEvent($act, hideEle);
                    }

                    $act.css('position', 'absolute').removeClass('gg-tab-box-active');
                    $tar.css({
                        position: 'relative',
                        display: 'block'
                    });


                    // 避免连续调用selectGGBox
                    if ($prevQueue) {
                        $prevQueue.css({
                            position: 'absolute',
                            display: 'none'
                        });
                    } else {
                        $prevQueue = $tar;
                    }

                    //在浏览器重绘前，当一个元素用display:none变为display:block时，然后改变有过渡效果的属性，并不会产生过渡效果。
                    changeTimer && clearTimeout(changeTimer);
                    changeTimer = setTimeout(function() {
                        $tar.addClass('gg-tab-box-active');
                        $prevQueue = undefined;
                    }, animate === false ? 0 : 30);
                }
            }

            function fillTpl(tpl, data) {
                var key;
                for (key in data) {
                    tpl = tpl.replace('<%=' + key + '%>', data[key]);
                }
                return tpl;
            }

            window.selectGGBox = selectGGBox;
            window.onCssEvent = onCssEvent;

            return {
                selectGGBox: selectGGBox,
                fillTpl: fillTpl
            };
        }])

    // 后缀配置
    .filter('filetype', function() {
        var sheet = {
                'jp-doc': 'word文档',
                'jp-xls': 'excel表格',
                'jp-ppt': 'PPT演讲稿',
                'jp-pdf': 'pdf文档',
                'jp-apk': '安卓安装包',
                'jp-zip': '压缩文件',
                'jp-txt': '文本文档',
                'jp-img': '图片',
                'jp-audio': '音频文件',
                'jp-vedio': '视频',
                'jp-wps': 'wps文档',
                'jp-dps': 'wps演讲稿',
                'jp-et': 'wps表格',
                'jp-psd': 'Photoshop位图文件',
                'jp-html': '静态网页',
                'jp-rp': 'axure原型',
                // 'jp-mm': '思维导图',
                'jp-vsd': 'visio文件',
                'jp-ipa': 'iOS安装包',
                'jp-exe': '危险文件',
                'jp-wiki': '普通文档',
                'jpz-md': 'Markdown',
                'jpz-mind': '思维导图',
                'jpz-flow': '流程图',
                'jpz-ui': '原型图',
                'jpz-uml': 'UML'
            },
            otherName = '未知文件';

        return function(name, type) {
            if (type === 'txt') {
                return sheet[name] && sheet[name] || otherName;
            }
        };
    })

    // 路由配置
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        var dirRepair = ['$match', function($match) {
            if (!$match.illegal) {
                return false;
            } else {
                return '/' + $match.type + '/' + $match.tid + '/' + $match.nid;
            }
        }];

        $urlRouterProvider.when('/{type:view}/{tid:\\d+}/{nid:\\d+}{illegal:.+}', dirRepair)
            .when('/view/{tid:0*}/{nid:0*}', '/').otherwise('/');

        $stateProvider.state('home', {
            url: '/'
        }).state('view', {
            url: '/view/{tid:.*}/{nid:.*}'
        }).state('history', {
            url: '/history/{tid:.*}/{nid:.*}'
        });


        /*$stateProvider.state('home', {
            url: '/?path&project_id'
        }).state('dir', {
            url: '/dir/{id:[^0][^/]*}?path&project_id'
        }).state('file', {
            url: '/file/{id:[^0][^/]*}?path&project_id'
        });*/

        /*$urlRouterProvider.when('/dir/{id}/{spilth:.*}', '/dir/{id}')
                  .when('/file/{id}/{spilth:.*}', '/dir/{id}')
                  .when('', '/').when('/dir/', '/').when('/file/', '/').otherwise('/');

        $stateProvider.state('home', {
            url: '/?path&project_id'
        }).state('dir', {
            url: '/dir/{id:[^/0][^/]*}?path&project_id'
        }).state('file', {
            url: '/file/{id:[^/0][^/]*}?path&project_id'
        });*/
    }])

    // 请求头配置
    .config(['$httpProvider', function($httpProvider) {

        // 头部配置
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript, */*; q=0.01';
        $httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';

        /**
         * 重写angular的param方法，使angular使用jquery一样的数据序列化方式  The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        /*var param = function(obj) {
            var query = '',
                name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };*/

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? $.param(data) : data;
        }];

        $httpProvider.interceptors.push('changeRequestUrl');
    }])

    // 将请求地址的域名指向http://api.doc.joyport.com
    .factory('changeRequestUrl', [function() {
        var regAPIUrl = /^\/(doc|dir|other|group)\//;

        return {
            request: function(requestData) {
                if (regAPIUrl.test(requestData.url)) {
                    requestData.url = GLOBAL_CONFIG.url.api + requestData.url;
                }

                return requestData;
            }
        };
    }])

    /**
     * 将id分割为tid和nid
     * @param {String} id               节点id
     * @param {String} [tidKey='tid']   输出数据tid的key
     * @param {String} [nidKey='nid']   输出数据nid的key
     * @return {Object}   输出数据
     */
    .factory('splitIntoTidAndNid', function() {
        return function(id, tidKey, nidKey) {
            var data, ids, tid, nid;

            data = typeof id === 'object' ? id : {};
            id = data.id || id;
            ids = id.split('_');
            tid = ids[0];
            nid = ids[1];

            if (data) {
                data[tidKey || 'tid'] = tid;
                data[nidKey || 'nid'] = nid;
            }

            return data;
        };
    })

    /**
     * 合并tid和nid为id
     * @param {String | Object}   tid    节点的tid，或者含有tid和nid的对象。
     * @param {String}            nid    节点的nid
     *
     *    mergeToID(tid, nid);
     *    mergeToID({tid: 2, nid: 23});
     *
     * @return {String}  节点的id
     */
    .factory('mergeToID', function() {
        return function(tid, nid) {
            if (typeof tid === 'object') {
                nid = tid.nid;
                tid = tid.tid;
            }

            return tid + '_' + nid;
        };
    })

    .service('docSocket', ['$q', 'commonRequest', docSocket])

    .service('launcher', ['$rootScope', '$http', '$state', '$q', '$timeout', 'explorerAPI', 'previewAPI', 'commonRequest', 'mergeToID', launcher])

    .run(['$templateCache', template])

    .directive('pathCrumbs', ['explorerAPI', function(explorerAPI) {
        var currItem = '<li class="active"><span>$</span></li></ol>';

        return {
            restrict: 'A',
            template: '<ol class="breadcrumb">&nbsp;</ol>',
            scope: {
                dir: '=',
                type: '@',
                init: '&'
            },
            link: function(scope, $ele, attrs) {
                var $ol = $ele.children(),
                    type = scope.type || 'dir';

                scope.$watch('dir', function(value, oldValue) {
                    var html, path, first;

                    if (value/* !== oldValue*/) {
                        path = explorerAPI.tree.getPath(value.id, type);

                        first = currItem.replace('$', path.pop().data.name);

                        html = $.map(path, function(dir) {
                            return '<li><a href="/view/' + dir.data.tid + '/' + dir.data.nid + '" title="' + (dir.data.origin_name || '') + '">' + (dir.data.name || '') + '</a></li>';
                        });

                        html.push(first);
                    } else {
                        html = '<li><a title=""></a></li>';
                    }
                    $ol.html(html);
                });

                // tooltips
                $ol.tooltips({
                    eles: 'a'
                });

                scope.init && scope.init();
            }
        };
    }]);
});
