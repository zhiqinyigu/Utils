/*
 * Tween.js
 * t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。
 * you can visit 'http://easings.net/zh-cn' to get effect
 */
var Tween = {
    Linear: function(t, b, c, d) {
        return c * t / d + b;
    },
    Quart: {
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    },
    Cubic: {
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    }
};

/**
 * 创建一个动画流程
 * @param  {Number}   from            起始值
 * @param  {Number}   to              目标值
 * @param  {Number}   duration        过渡时长
 * @param  {Function} Progress        进度回调
 * @param  {Number}   Progress.val    进度值
 * @param  {Boolean}  Progress.isDone 是否已经结束
 * @return {Function} 停止动画
 */
function animate(from, to, duration, progress, easingFn) {
    var startTime = Date.now(),
        gap = to - from,
        timer;

    easingFn = easingFn || Tween.Linear;

    function start() {
        timer = setTimeout(function() {
            var now = Date.now();

            if (startTime + duration <= now) {
                progress(to, true);
            } else {
                start();
                progress(easingFn(now - startTime, from, gap, duration));
            }
        }, 16);
    }

    start();

    return function() {
        clearTimeout(timer);
    }
}

module.exports = {
    animate: animate
};