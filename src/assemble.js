var moduleCore = require('./core');

/**
 * @description 根据所给的object组合成一个新的对象，排在后面的object属性优先级高。
 * @param {...object} 字符串会被跳过
 * @return object 返回一个新对象
 *
 *
 * # Example
 * ```js
 *     var data1 = {ssid: 'asd-123-qwe-456', token: 'SDJOIJNS564564GG', msg: 'fail'},
 *         data2 = {ucode: 3, msg: 'success'}
 *     $.assembleObject(data1, data2, 'msg', 'token');
 *     // {ucode: 3, msg: "success", ssid: "asd-123-qwe-456", token: "SDJOIJNS564564GG"}
 */
/*function assembleObject() {
    var para = {},
        key,
        arg = arguments,
        merge = arg[arg.length - 1] === true;

    for (var i = arg.length - 1; i >= (merge ? 1 : 0); i--) {
        if (moduleCore.type(arg[i]) !== 'string') {
            for (key in arg[i]) {
                para[key] === undefined && (para[key] = arg[i][key]);
            }
        }
    }

    if (merge) {
        for (key in para) {
            if (para[key] !== undefined) {
                arg[0][key] = para[key];
            }
        }

        return arg[0]
    }

    return para
}
*/

/**
 * @description 根据所给的object和key生成一个对象
 * @param {...(object|string)} object类型应该放在前面，key放后面
 * @return object 返回一个新对象
 *
 *
 * # Example
 * ```js
 *     var data1 = {ssid: 'asd-123-qwe-456', token: 'SDJOIJNS564564GG', msg: 'fail'},
 *         data2 = {ucode: 3, msg: 'success'}
 *     $.assembleParam(data1, data2, 'msg', 'token');
 *     //{msg: 'success', token: 'SDJOIJNS564564GG'};
 */

function assembleParam() {
    var para = {},
        arg = arguments,
        // total = assembleObject.apply(undefined, arg);
        n, total;

    moduleCore.each(arg, function(item, i) {
        if (moduleCore.type(item) == 'string') {
            n = i;
            return false;
        }
    });

    total = moduleCore.extend.apply(undefined, Array.prototype.slice.call(arg, 0, n));

    for (var i = arg.length - 1; i >= 0; i--) {
        if (moduleCore.type(arg[i]) == 'string') {
            para[arg[i]] = total[arg[i]];
        } else {
            break;
        }
    }

    return para
};



module.exports = {
    // assembleObject: assembleObject,
    assembleParam: assembleParam
}