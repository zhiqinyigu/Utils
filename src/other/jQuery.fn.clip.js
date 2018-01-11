/**
 * 图片裁剪。使图片缩放适应一个尺寸。实例：一张图片50*50需要在一个200*120的容器显示完全，图片将被放大且居中
 *
 *
 * @function external:"jQuery.fn".clip
 * @param w {Number} 宽度
 * @param h {Number} 高度
 * @param o {Object} 配置，可配置属性有：
 * @param o.onInit {Funtion} 改变尺寸前的操作，返回false则不改变尺寸
 * @param o.before {Funtion} 图片被初始化后（图片被初始化为不缩放的状态）的操作，返回false则不改变尺寸
 * @param o.isLink {Boolean} ie6/7会因为创建的元素触发hasLayout而覆盖a元素。isLink为true时，不创建新元素，直接在img父元素（一般为a）初始化。
 *
 * @author cyc
 * @example
 *     $('#img').clip(50,50);
 */
jQuery.fn.clip = (function($) {
    function q(w, h, o) {
        if (o.before && o.before.call(this) === false) {
            return
        };
        var s, sty = this.style;
        //尺寸初始化为默认
        this.removeAttribute('height');
        this.removeAttribute('width');
        sty.width = o.width || "auto";
        sty.height = o.height || "auto";
        if (o.onInit && o.onInit.call(this) === false) {
            return
        };

        //计算理想尺寸（确认能铺满区域）
        sty.width = w + 'px';
        if (this.clientHeight < h) {
            sty.width = o.width || "auto";
            sty.height = h + 'px';
        }

        //裁剪固定尺寸
        sty.left = (w - this.clientWidth) / 2 + "px";
        sty.top = (h - this.clientHeight) / 2 + "px";
    }
    return function(w, h, o) {
        return this.each(function() {
            var $img = $(this);
            o = o || {};
            //若是clip过的，就还原重新clip。（虽然不改暂时没发现什么影响，但看着这么多嵌套不爽）
            if ($img.parent().is('.jq-clip')) {
                $img.attr({
                    'style': $img.attr('data-old-style')
                }).unwrap();
            } else {
                $img.attr({
                    'data-old-style': $img.attr('style')
                });
            }

            if (!o.isLink) {
                $img.wrap("<span class='jq-clip'></span>");
            }
            $img.css({
                "position": "relative"
            })

            var baseStyle = "overflow:hidden;position:relative;display:inline-block;border-radius:" + $img.css("border-radius") + ";margin-right:" + $img.css("margin-right") + ";width:" + (w || 100) + "px;height:" + (h || 100) + "px;";
            this.parentNode.style.cssText = this.parentNode.style.cssText + baseStyle + ($img.css("float") !== "none" ? ";float:" + $img.css("float") : "");
            // $img.load(function (){q.call(this, w, h, o);});
            // q.call(this, w, h, o);
            var img = new Image();
            img.onload = function() {
                if (this.clientWidth === 0 && this.clientHeight === 0) {
                    setTimeout(function() {
                        q.call($img[0], w, h, o);
                    }, 100);
                    return
                }
                q.call($img[0], w, h, o);
            };
            img.src = this.src;
            img = null;
        });
    }
})(jQuery);


$('img.i-bg').clip($(window).width(), $(window).height());