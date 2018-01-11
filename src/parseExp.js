/**
 * 设置/计算上下文值
 */

module.exports = {
    /**
     * 设置/计算上下文值
     * @param  {}       context 上下文对象。
     * @param  {String} exp     字段表达式，以'.'和'[\d+]'分割成字段的访问堆栈
     * @param  {}       val     要设置的值，不传时为get。
     *
     * @example
     *  var data = {
     *      asd: {qwe: 123}
     *  };
     *  
     *  parseExp(data, 'asd.qwe', 789);
     */
    parseExp: function(context, exp, val) {
        var chain = exp.replace(/^\[(\d+)\]/, '$1').replace(/\[(\d+)\]/g, '.$1').split('.'),
            last_key;

        if (arguments.length === 3) {
            last_key = chain.pop();
        }

        for (var i = 0; i < chain.length; i++) {
            if (!context) return;
            context = context[chain[i]];
        }

        if (last_key) {
            context[last_key] = val;
        } else {
            return context; 
        }
    }
};