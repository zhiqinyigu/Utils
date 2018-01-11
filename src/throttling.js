/**
 * 限制一个函数的调用频率
 * @param {Function}       fn       被限流的函数
 * @param {Number|String}  limit    限制频率，单位为毫秒
 * @param {}  			   context  函数的上下文
 * @example
 *     $(window).on('resize', throttling(function() {cosnole.log(Date.now)}, 100));
 */
function throttling(fn, limit, context) {
    var prevDate = 0,
    	timer;

    return function() {
        var now = Date.now(),
        	gap = now - prevDate,
            me = this;

        timer && clearTimeout(timer);

        if (gap > limit) {
            prevDate = now;
            fn.apply(context || me, arguments);
        } else {
        	timer = setTimeout(function() {
	            fn.apply(context || me, arguments);
        	}, gap);
        }
    }
}

module.exports = {
    throttling: throttling
};