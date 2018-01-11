(function() {
    function getSizeVal(val, refer) {
        var match = /(\d*)%$/.exec(val);

        if (match && match.length) {
            return refer ? Math.round(refer*match[1]/100) + 'px': val;
        } else {
            return val ? val + 'px' : '';
        }
    }

    function after(context, fn, cb) {
        return function() {
            fn.apply(context || this, arguments);
            cb.apply(context || this, arguments);
        }
    }

    function transformSetting(setting) {
        var footerHTML = [],
            button = {};

        if (setting.buttons) {        
            setting.buttons.forEach(function(item) {
                var id = Utils.count();

                footerHTML.push(createBtn(item.text, item.className, id));
                button['.js-cdialog-btn' + id] = item.method;
            });

            setting.button = button;
            setting.footer = footerHTML.join('');
        }

        return setting;
    }

    function createBtn(text, className, id) {
        return '<button type="button" class="button' + (className?' button-'+className:'') + ' button-rounded button-small js-cdialog-btn' + id + '">' + text + '</button>';
    }

    cDialog.confirm = function(title, content, onSure, onCancel) {
        var type = typeof content;
        if (type == 'function' || type == 'undefined') {
            onCancel = onSure;
            onSure = content;
            content = title;
            title = '温馨提示';
        }

        return $.Deferred(function(pr) {
            var body = cDialog({
                    title: title,
                    content: content,
                    closeBtn: false,
                    footer: '<button type="button" class="button button-primary button-rounded button-small js-ok">确定</button><button type="button" class="button button-caution button-rounded button-small js-cancel">取消</button>',
                    button: {
                        '.js-ok': function(dialog) {
                            onSure && onSure(dialog);
                            pr.resolve(dialog);
                        },
                        '.js-cancel': function(dialog) {
                            onCancel && onCancel(dialog);
                            dialog.del();
                            pr.reject(dialog);
                        }
                    }
                }).$body,
                parentStyle = body.parentNode.parentNode.style;

            body.style.minHeight = '100px';
            parentStyle.width = '400px';
            parentStyle.maxWidth = '90%';
        });
    }

    cDialog.open = function(setting) {
        if (setting.onclose) {
            setting.onclose = after(null, setting.onclose, function() {
                Utils.dom.on(window, 'resize', resizeHandler);
            });
        }

        var dialog = cDialog(transformSetting(Utils.extend({backdrop: false}, setting))),
            body = dialog.$body,
            box = body.parentNode.parentNode;

        setting.width && (box.style.width = getSizeVal(setting.width));
        setting.maxWidth && (box.style.maxWidth = getSizeVal(setting.maxWidth));

        if ((setting.maxHeight && setting.maxHeight.search('%') != -1) || (setting.height && setting.height.search('%') != -1)) {
            Utils.dom.on(window, 'resize', resizeHandler);
        }

        function resizeHandler() {
            var doc_height = document.documentElement.clientHeight;

            setting.width && (box.style.width = getSizeVal(setting.width, document.documentElement.clientWidth));
            setting.height && (body.style.height = getSizeVal(setting.height, doc_height));
            setting.maxHeight && (body.style.maxHeight = getSizeVal(setting.maxHeight, doc_height));
        }

        resizeHandler();

        return dialog;
    };
})()