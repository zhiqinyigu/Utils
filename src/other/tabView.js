/**
 * 将一块区域变为tabView，使其具有左右滑动的效果。这块区域一般为固定height，overflow:auto，position:absolute。
 *
 * @class tabView
 * @param {object} ele                 tabView容器
 * @param {object} config              配置。
 * @param {string} config.defaultId    默认ID。在初始化时，如果当前视图没有id，将被赋值这个ID。
 *
 * @author cyc
 */

(function() {
    function getEventName(type) {
        var e = ' webkit$ o$ MS$';

        type = (type.charAt(0).toUpperCase() + type.slice(1)).replace(/(?:end|start)$/, function(_) {
            return _.charAt(0).toUpperCase() + _.slice(1);
        });

        type += '.oneCssEvent';

        return type.toLowerCase() + e.replace(/\$/g, type);
    }

    window.offCssEvent = function offCssEvent(ele, type) {
        $(ele).off(getEventName(type));
    }

    window.onCssEvent = function onCssEvent(ele, type, callback) {
        var $me = $(ele);

        if (typeof type === 'function') {
            callback = type;
            type = 'transitionend';
        }

        type = getEventName(type);

        $me.on(type, function(e) {
            $me.off(type);

            if (typeof callback === "function") {
                callback.call($me[0], e);
            }
        });
    }

})();


var tabView = (function(Util) {
    var defaultConfig = {
        id: 'index'
    };

    $("<style>.tabView-pages{position:relative;width:100%;height:100%;overflow:hidden}.tabView-page{overflow:auto;box-sizing:border-box;position:absolute;left:0;top:0;width:100%;height:100%;transform:translate3d(0,0,0)}.tabView-page.cached{display:none}.page-on-left{opacity:.9;transform:translate3d(-20%,0,0)}.page-on-right{z-index:3;transform:translate3d(100%,0,0)}.page-on-center{z-index:2}.page-from-center-to-right:before,.page-from-right-to-center:before{position:absolute;right:100%;top:0;width:16px;height:100%;background:-webkit-linear-gradient(left,rgba(0,0,0,0) 0,rgba(0,0,0,0) 10%,rgba(0,0,0,.01) 50%,rgba(0,0,0,.2) 100%);background:linear-gradient(to right,rgba(0,0,0,0) 0,rgba(0,0,0,0) 10%,rgba(0,0,0,.01) 50%,rgba(0,0,0,.2) 100%);z-index:-1;content:''}.page-from-right-to-center{overflow:visible;animation:pageFromRightToCenter .4s forwards}.page-from-right-to-center:before{animation:pageFromRightToCenterShadow .4s forwards}.page-from-center-to-right{overflow:visible;animation:pageFromCenterToRight .4s forwards}.page-from-center-to-right:before{animation:pageFromCenterToRightShadow .4s forwards}@keyframes pageFromRightToCenter{from{transform:translate3d(100%,0,0)}to{transform:translate3d(0,0,0)}}@keyframes pageFromRightToCenterShadow{from{opacity:0}to{opacity:1}}@keyframes pageFromCenterToRight{from{transform:translate3d(0,0,0)}to{transform:translate3d(100%,0,0)}}@keyframes pageFromCenterToRightShadow{from{opacity:1}to{opacity:0}}.page-from-center-to-left{animation:pageFromCenterToLeft .4s forwards}.page-from-left-to-center{animation:pageFromLeftToCenter .4s forwards}@keyframes pageFromCenterToLeft{from{transform:translate3d(0,0,0)}to{opacity:.9;transform:translate3d(-20%,0,0)}}@keyframes pageFromLeftToCenter{from{transform:translate3d(-20%,0,0)}to{opacity:1;transform:translate3d(0,0,0)}}</style>").appendTo('head');

    function tabView(ele, config) {
        this.$view = $(ele);
        this.$active = this.$view.children().eq(0).addClass('tabView-page');
        this.config = $.extend({}, defaultConfig, config);

        if (!this.$active.attr('data-page')) {
            this.$active.attr('data-page', this.config.defaultId);
        }
    }

    tabView.prototype = {
        dirSheet: {
            left: 'right',
            right: 'left',
            top: 'bottom',
            bottom: 'top'
        },
        /**
         * 添加一个视图
         * @param {string} id  视图ID，切换时需要。
         * @param {object|string} ele
         */
        add: function(id, ele) {
            var $ele = $(ele);

            ($ele.length > 1 ? $('<div></div>').append($ele) : $ele).addClass('tabView-page cached').attr('data-page', id).appendTo(this.$view);
        },
        get: function(id) {
            var $ele = this.$view.find('[data-page="' + id + '"]');

            return $ele.length ? $ele : undefined;
        },
        /**
         * 切换到某视图
         * @param  {string} id  视图id
         * @param  {string} dir 方向，left或者right
         * @return {object} 返回一个类promise对象，切换完成后触发。
         */
        changeTo: function(id, dir) {
            dir = dir || 'right';

            var self = this,
                $prev = self.$active,
                changeDonePr = $.Deferred(),
                gid = 0,
                contrary = self.dirSheet[dir],
                enterAnima = ' page-from-{dir}-to-center'.replace('{dir}', dir),
                exitAnima = ' page-from-center-to-{dir}'.replace('{dir}', contrary),
                enterClass = ' page-on-' + dir,
                exitClass = ' page-on-' + contrary,
                centerClass = ' page-on-center';

            function promiseAll() {
                if (++gid === 2) {
                    self.$active.addClass(centerClass).removeClass(enterAnima + enterClass);
                    $prev.addClass(exitClass).removeClass(exitAnima + centerClass);
                    changeDonePr.resolve();
                }
            }


            // stop running
            var animateCssName = /page-from-\w+-to-center|page-on-\w+|page-from-center-to-\w+/g;
            self.$active = self.$view.find('[data-page="' + id + '"]');
            // 清空所用动画相关的class名和事件。
            $prev[0].className = $prev[0].className.replace(animateCssName, '');
            self.$active[0].className = self.$active[0].className.replace(animateCssName, '');
            offCssEvent($prev[0], 'animationend');
            offCssEvent(self.$active[0], 'animationend');

            // exit
            onCssEvent($prev.addClass(centerClass + exitAnima), 'animationend', promiseAll);

            // enter
            self.$active.addClass(enterClass).removeClass(exitClass + ' cached');
            self.$active[0].clientWidth;
            onCssEvent(self.$active.addClass(enterAnima), 'animationend', promiseAll);

            return changeDonePr.promise();
        },
        destroy: function() {
            this.$view = this.$active = null;
        }
    };

    return tabView;
})();



/*
.view {
    overflow: hidden;
    box-sizing: border-box;
}

.tabView-pages {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.tabView-page {
    overflow: auto;
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transform: translate3d(0,0,0);
}

.tabView-page.cached {
    display: none;
}

.page-on-left {
    opacity: .9;
    transform: translate3d(-20%,0,0);
}

.page-on-right {
    z-index: 3;
    transform: translate3d(100%,0,0);
}

.page-on-center {
    z-index: 2;
}


/ .page-content {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
    height: 100%;
    position: relative;
    z-index: 1;
} /

.page-from-center-to-right:before,.page-from-right-to-center:before {
    position: absolute;
    right: 100%;
    top: 0;
    width: 16px;
    height: 100%;
    background: -webkit-linear-gradient(left,rgba(0,0,0,0) 0,rgba(0,0,0,0) 10%,rgba(0,0,0,.01) 50%,rgba(0,0,0,.2) 100%);
    background: linear-gradient(to right,rgba(0,0,0,0) 0,rgba(0,0,0,0) 10%,rgba(0,0,0,.01) 50%,rgba(0,0,0,.2) 100%);
    z-index: -1;
    content: '';
}

.page-from-right-to-center {
    overflow: visible;
    animation: pageFromRightToCenter .4s forwards;
}

.page-from-right-to-center:before {
    animation: pageFromRightToCenterShadow .4s forwards;
}

.page-from-center-to-right {
    overflow: visible;
    animation: pageFromCenterToRight .4s forwards;
}

.page-from-center-to-right:before {
    animation: pageFromCenterToRightShadow .4s forwards;
}

@keyframes pageFromRightToCenter {
    from {transform: translate3d(100%,0,0);}
    to {transform: translate3d(0,0,0);}
}

@keyframes pageFromRightToCenterShadow {
    from {opacity: 0;}
    to {opacity: 1;}
}

@keyframes pageFromCenterToRight {
    from {transform: translate3d(0,0,0);}
    to {transform: translate3d(100%,0,0);}
}

@keyframes pageFromCenterToRightShadow {
    from {opacity: 1;}
    to {opacity: 0;}
}

.page-from-center-to-left {
    animation: pageFromCenterToLeft .4s forwards
}

.page-from-left-to-center {
    animation: pageFromLeftToCenter .4s forwards
}

@keyframes pageFromCenterToLeft {
    from {
        transform: translate3d(0,0,0)
    }

    to {
        opacity: .9; transform: translate3d(-20%,0,0);
    }
}

@keyframes pageFromLeftToCenter {
    from {
        transform: translate3d(-20%,0,0);
    }

    to {
        opacity: 1; transform: translate3d(0,0,0);
    }
}*/