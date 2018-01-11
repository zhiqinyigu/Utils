/**
 * @namespace 遮罩层单例
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        global.loadingMask = factory();
}(this, function() {
    $('head').append("<style>.js-loading-mask {position: absolute;background: url(./images/i_loading.gif) 50% 50% no-repeat;z-index: 887;box-shadow: 0 0 3px 1px #aaa;border-radius: 6px;background-color: rgba(255,255,255,.5);filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#80ffffff', EndColorStr='#80ffffff')}.loadMask-full{background-image: url(./images/loading-2.gif);}@media all and (min-width: 0) {.js-loading-mask {filter:none \\0}}</style>")

    var addLoadingMask = function(ele, hasMask, inset, duration) {
        var $ele = ele && $(ele),
            cssPosition = ele && $ele.css('position'),
            pos = hasMask ? (inset ? {left: 0,top: 0} : $ele.offset()) : {left: '50',top: '50'},
            w = hasMask ? (inset ? '100%' : $ele.outerWidth() + 'px') : '70px',
            h = hasMask ? (inset ? '100%' : $ele.outerHeight() + 'px') : '70px',
            style = 'left:' + pos.left + (hasMask ? 'px' : '%') + ';top:' + pos.top + (hasMask ? 'px' : '%') + ';height:' + h + ';width:' + w + ';margin-top:' + (hasMask ? 0 : '-35px') + ';margin-left:' + (hasMask ? 0 : '-35px') + (!ele ? ';position:fixed' : '') + (!hasMask ? ';background-color:#fff;' : ';box-shadow: none;');

        ele && $ele.css({
            position: cssPosition === 'static' ? 'relative' : cssPosition
        });

        return $('<div />', {
            'class': 'js-loading-mask' + (!hasMask ? '' : ' loadMask-full'),
            style: style
        }).css({
            opacity: 0
        }).appendTo(inset && ele || ele && !hasMask && ele || document.body).animate({
            opacity: 1
        }, duration);
    };

    var $mask;

    return {
        /**
         * 显示遮罩层
         * @param [ele]    { node | jquery | string }  要添加loading效果的元素
         * @param [hasMask]  { boolean }  添加一个覆盖元素的loading背景
         * @param [inset]    { boolean }  遮罩是否appendTo到元素，默认作为body最后一个子元素
         * @example
         *     addLoadingMask.show();
         *     addLoadingMask.show(fwObj.win.find('.user-card-tooltips'),1,1);
         */
        show: function(ele, hasMask, inset) {
            this.status = $mask || ($mask = addLoadingMask.apply(null, arguments));
            return this.status;
        },

        /**
         * 隐藏遮罩层
         * @param [callback]  { function }  隐藏后的回调
         * @param [duration]  { number }    过渡时间
         * @example
         *     addLoadingMask.hide();
         */
        hide: function(callback, duration) {
            $mask && $mask.fadeOut(duration !== undefined ? duration : 300, function() {
                this.parentNode.removeChild(this);
                callback && callback();
            });
            $mask = undefined;
            this.status = null;
        },

        /**
         * 遮罩层变为全屏
         * @example
         *     addLoadingMask.show();
         *     addLoadingMask.changeToFull();
         */
        changeToFull: function() {
            loadingMask.hide();
            loadingMask.show(null, 1, 1);
        },
        status: null
    };
}));
