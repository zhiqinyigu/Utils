(function (root, deps, exportName, factory) {
    if (typeof deps === 'string') {
        factory = exportName;
        exportName = deps;
        deps = [];
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    } else {
        root[exportName] = factory();
    }
}(this, [], 'cDialog', function () {
    var domAPI = Utils.dom,
        doc = document;

    domAPI.addHeadStyle('.hack-scroll,.hack-scroll body {overflow: hidden;}');

    var dialogPool = [],
        emptyFun = function() {},
        handleBtnSheet = {
            close: {html: '<button class="lc-dialog-top-close">&times;</button>', trigger: '.lc-dialog-top-close'}
        },
        tpl = '<div class="lc-dialog-wrap s-tabcell has-header has-footer" style="display:none"><div class="lc-dialog"><div class="lc-dialog-box"><div class="lc-dialog-title"><%=title%></div><div class="lc-dialog-body"><%=content%></div><div class="lc-dialog-footer s-tabcell"><%=footer%></div><div class="dialog-hd-handle"></div></div></div></div>';

    var defaults = {
        cache: false, // 傻逼ie打开iframe貌似有缓存
        behavior: 'del',
        closeBtn: true,
        backstage_init: false,
        backdrop: true,
        background: true,
        headerBar: true,
        footer: '',
        content: '',
        url: '',
        parent: document.body,
        button: {}, // {'.i-ok': {type: 'del', callback: clickFun}},
        handleBtn: [], // [{html: '<a>download</a>', callback: clickFun}]
        onclose: emptyFun,
        onready: emptyFun,
        title: '温馨提示'
    };


    function hidePrevBg() {
        for (var i = dialogPool.length - 1; i >= 0; i--) {
            if (dialogPool[i].setting.background) {
                domAPI.removeClass(dialogPool[i].$el, 'lc-dialog-bg');
                break;
            }
        }

        domAPI.addClass(doc.documentElement, 'hack-scroll');
    }

    function showPrevBg() {
        for (var i = dialogPool.length - 1; i >= 0; i--) {
            if (dialogPool[i].setting.background) {
                domAPI.addClass(dialogPool[i].$el, 'lc-dialog-bg');
                break;
            }
        }

        dialogPool.length == 0 && domAPI.removeClass(doc.documentElement, 'hack-scroll');
    }


    function createIfr(url, data) {
        return '<iframe src="' + Utils.spellUrl(url, data) + '" frameborder="0"></iframe>'
    }

    var dialog = Utils.createClass({
        init: function(setting) {
            this.setting = setting = Utils.extend({}, defaults, setting);

            var me = this,
                tempInput,
                boxBody,
                triggerArr = [],
                handleBtn,
                html = tpl.replace('<%=title%>', setting.title)
                          .replace('<%=content%>', setting.url ? createIfr(setting.url, setting.cache === false ? Utils.extend({}, setting.urlData || {}, {js_ver: new Date().getTime()}) : setting.urlData) : setting.content)
                          .replace('<%=footer%>', setting.footer);

            me.$el = domAPI.create(html);
            me.$body = boxBody = me.$el.getElementsByClassName('lc-dialog-body')[0]

            if (setting.el) {
                boxBody.appendChild(setting.el);
                setting.el.style.display = '';
            }

            if (setting.url) {
                domAPI.addClass(boxBody, 'has-iframe');

                // 前提：ie11下，模态框里有iframe，iframe里面的页面有input或textarea
                // bug：关掉模态框，再次打开同一个地址（即使url加?ver=Math.random()），iframe的input和textarea无法通过界面操作聚焦
                // @see：https://bugs.jquery.com/ticket/12319
                setTimeout(function() {
                    tempInput = domAPI.create('<input type="text" id="test" style="width: 0;height: 0;position: absolute;top: -999px;left: 0;">');
                    document.body.appendChild(tempInput);
                    tempInput.focus();
                    domAPI.remove(tempInput);
                }, 0);
            }

            if (!setting.footer) {
                domAPI.removeClass(me.$el, 'has-footer')
                domAPI.remove(me.$el.getElementsByClassName('lc-dialog-footer')[0]);
            }

            // 是否保留标题栏
            if(!setting.headerBar){
                domAPI.removeClass(me.$el, 'has-header')
                domAPI.remove(me.$el.getElementsByClassName('lc-dialog-title')[0]);
            }


            if (setting.closeBtn) {
                handleBtn = ['close'];
            }

            if (setting.handleBtn || handleBtn) {
                me._handleBtn = []; // dialog del时，移除按钮的事件绑定。

                if (setting.handleBtn && setting.handleBtn.length && handleBtn) {
                    handleBtn = handleBtn.concat(setting.handleBtn);
                }

                Utils.each(handleBtn || setting.handleBtn, function(btn) {
                    var $btn;

                    if (Utils.type(btn) === 'string') {
                        btn = handleBtnSheet[btn];
                        if (!btn) {
                            return;
                        }
                    }

                    $btn = domAPI.create(btn.html);

                    if (btn.callback) {
                        domAPI.on($btn, 'click', btn.callback);
                        me._handleBtn.push($btn);
                    } else if (btn.trigger) {
                        triggerArr.push(btn.trigger);
                    }

                    domAPI.append(me.$el.getElementsByClassName('dialog-hd-handle')[0], $btn);
                });
            }

            triggerArr = triggerArr.concat(Utils.map(setting.button, function(_, key) {
                return key;
            }));

            domAPI.appendTo(me.$el, setting.parent);
            !setting.backstage_init && me.show();
            setting.onready.call(me);

            // bind event handler
            domAPI.on(me.$el, 'click', function(e) {
                var $t = domAPI.getTrigger(e, triggerArr);

                if ($t) {
                    e.preventDefault();
                    var method = setting.button[$t[1]],
                        callback;

                    if (typeof method === 'object') {
                        callback = method.callback;
                        method = method.type;
                    }

                    if (!method || typeof method === 'string' && regSafeMethod.test(method)) {
                        if (method || domAPI.is($t[0], '.lc-dialog-top-close')) {
                            me[method === 'default' ? 'close' : setting.behavior](callback, $t[0]);
                        } else {
                            callback && callback.call($t[0], me);
                        }
                    } else if (Utils.isFunction(method)) {
                        method.call($t[0], me);
                    }

                    return;
                }


                if (e.target === this && me.setting.backdrop === true) {
                    me.close(undefined, e.target);
                }
            });
        },
        show: function(callback) {
            if (this.$el && this.$el.style.display === 'none') {
                // 添加背景
                if (this.setting.background) {
                    hidePrevBg();
                    domAPI.addClass(this.$el, 'lc-dialog-bg');
                }

                this.$el.style.display = 'block';
                dialogPool.push(this);

                callback && callback.call(this);
            }
        },
        hide: function(callback, target, isDel) {
            var me = this;

            // 如果dialog没有被销毁
            if (me.$el) {

                me.setting.onclose.call(me, {
                    type: isDel === true ? 'del' : 'hide',
                    target: target
                });

                if (isDel) {
                    domAPI.remove(me.$el);
                    Utils.each(me._handleBtn, domAPI.off);

                    me.$el = me._handleBtn = null;
                } else {
                    me.$el.style.display = 'none';
                }

                Utils.remove(dialogPool, me);
                showPrevBg();
                // hideMask();
                callback && callback.call(me);
            }
        },
        del: function(callback, target) {
            this.hide(callback, target, true);
        },
        close: function(callback, target) {
            this[this.setting.behavior](callback, target);
        },
        setTitle: function(html) {
            this.$el.getElementsByClassName('lc-dialog-title')[0].innerHTML = html;
        }
    });

    function cDialog(setting) {
        return new dialog(setting);
    }

    cDialog.defaultSetting = defaults;

    return cDialog;
}));
