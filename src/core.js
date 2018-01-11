 /**
 * 合并对象内容到第一个对象
 * @method extend
 * @param  {Boolean}  [deep]    是否深复制
 * @param  {Boolean}  [deepFn]    函数是否深复制
 * @param  {Object}   object1   第一个对象
 * @param  {Object}   objectN   第n个对象
 */
function extend() {
    var arg = Array.prototype.slice.call(arguments),
        deep = arg.shift(),
        deepFn = arg.shift(),
        firstObj, currObj, key, src, copy;

    if (typeof deep === 'boolean') {
        if (typeof deepFn === 'boolean') {
            firstObj = arg.shift();
        } else {
            firstObj = deepFn;
            deepFn = false;
        }
    } else {
        firstObj = deep;
        arg.unshift(deepFn);
        deep = deepFn = false;
    }

    while (currObj = arg.shift()) {
        for (key in currObj) {
            if (currObj.hasOwnProperty(key)) {
                src = firstObj[key];
                copy = currObj[key];

                if (deep && (type(copy) === 'object' || type(copy) === 'array') && copy) {
                    if (type(src) != type(copy)) {
                        extend(deep, deepFn, (firstObj[key] = (copy instanceof Array) ? [] : {}), copy);
                    } else {
                        extend(deep, deepFn, src, copy);
                    }
                } else if (typeof copy !== 'undefined') {
                    if (deepFn && typeof src === 'function' && typeof copy === 'function') {
                        firstObj[key] = (function(src, copy) {
                            return function() {
                                src.apply(this, arguments);
                                return copy.apply(this, arguments);
                            }
                        })(src, copy)
                    } else {
                        firstObj[key] = copy;
                    }
                }
            }
        }
    }

    return firstObj;
}

function each(arr, fn, eachAll) {
    var i;

    // 不严谨的判断是否数组
    if (typeof arr.length == 'number') {
        for (i = 0; i < arr.length; i++) {
            if (fn(arr[i], i, arr) === false) {
                break;
            }
        }
    } else if (arr && typeof arr === 'object') {
        for (i in arr) {
            if (eachAll || arr.hasOwnProperty(i)) {
                if (fn(arr[i], i, arr) === false) {
                    break;
                }
            }
        }
    }
}

function map(arr, fn) {
    var result = [],
        index = 0;

    each(arr, function (val, i) {
        result[index++] = fn(val, i, arr);
    });

    return result;
}

function filter(arr, fn) {
    var result = [];

    each(arr, function (val, i) {
        if (fn(val, i)) {
            result.push(val);
        }
    });

    return result;
}

function remove(arr, ele) {
    each(arr, function (val, i) {
        if (val === ele) {
            arr.splice(i, 1);
            return false;
        }
    });
}



/*
 * 类型判断
 */
var class2type = {},
    toString = class2type.toString;

// Populate the class2type map
each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (name, i) {
    class2type['[object ' + name + ']'] = name.toLowerCase()
});

/**
 * 获取传递过来的参数的数据类型
 * @param  {*} obj 需要检测的变量
 * @return {String}
 */
function type(obj) {
    return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object'
}

/**
 * 检测传递过来的参数是否是类数组
 * @param  {*} obj  需要检测的对象
 * @return {Boolean}
 */
function likeArray(obj) {
    return typeof obj == 'object' && typeof obj.length == 'number';
}

/**
 * 检测传递过来的参数是否是javascript函数对象
 * @param  {*}  fun 需要检测的对象
 * @return {Boolean}
 */
function isFunction(fun) {
    return type(fun) == 'function';
}

/**
 * 检测传递过来的参数是否是是一个纯对象（使用“{ }”或“new Object”创建。
 * @param  {*}  obj 需要检测的对象
 * @return {Boolean}
 */
function isPlainObject(obj) {
    return type(obj) == 'object'; // @todo 不严谨
}

function omit(obj, list) {
    var result = extend({}, obj);
    each(list, function (key) {
        delete result[key];
    });

    return result;
}

function pick(obj, list) {
    var result = {};
    each(list, function (key) {
        result[key] = obj[key];
    });

    return result;
}

function retry(fn) {
    var Promise = wx.Promise;
    return function tryIt(n) {
        return new Promise(function(resolve, reject) {
            fn().then(resolve, function(err) {
                if (n--) {
                    tryIt(n).then(resolve, reject);
                } else {
                    reject(err);
                }
            })
        });
    }
}

function scale(w, h, ref_w, ref_h) {
    var ratio = Math.max(ref_w / w, ref_h / h);

    return {
        width: Math.ceil(w * ratio),
        height: Math.ceil(h * ratio)
    }
}
function mixins() {
    return extend.apply(null, [true, true].concat(Array.prototype.slice.call(arguments)))
}



module.exports = {
    extend: extend,
    filter: filter,
    remove: remove,
    each: each,
    map: map,
    mixins: mixins,
    omit: omit,
    pick: pick,
    retry: retry,
    scale: scale,

    type: type,
    likeArray: likeArray,
    isFunction: isFunction,
    isPlainObject: isPlainObject
}