var core = require('./core');

/*
 * 类型判断
 */
var class2type = {},
    toString = class2type.toString;

// Populate the class2type map
core.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function(name, i) {
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

module.exports = {
	type: type,
	likeArray: likeArray,
	isFunction: isFunction,
	isPlainObject: isPlainObject
}