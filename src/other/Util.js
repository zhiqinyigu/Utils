(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.Util = factory();
})(this, function() {
     /**
     * 合并对象内容到第一个对象
     * @method extend
     * @param  {Boolean}  [deep]    是否深复制
     * @param  {Object}   object1   第一个对象
     * @param  {Object}   objectN   第n个对象
     */
    function extend() {
        var arg = Array.prototype.slice.call(arguments),
            deep = arg.shift(),
            firstObj, currObj, key, src, copy;

        if (typeof deep === 'boolean') {
            firstObj = arg.shift();
        } else {
            firstObj = deep;
            deep = false;
        }

        while (currObj = arg.shift()) {
            for (key in currObj) {
                if (currObj.hasOwnProperty(key)) {
                    src = firstObj[key];
                    copy = currObj[key];

                    if (deep && typeof src === 'object' && typeof copy === 'object' && copy !== null) {
                        extend(deep, src, copy);
                    } else {
                        firstObj[key] = copy;
                    }
                }
            }
        }

        return firstObj;
    }

    /*
     * 类型判断
     */
    var class2type = {},
        toString = class2type.toString;

    // Populate the class2type map
    $.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function(i, name) {
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
        return typeof obj.length == 'number';
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


    /*
     * class 创建
     */
    var Base = function() {},
        emptyFun = function() {};

    Base.prototype = {
        init: emptyFun
    };

    /**
     * 类似Object.create，创建一个拥有指定原型对象。
     * 
     * @method create
     * @param  {Object}     proto  作为新创建对象的原型
     * @param  {Function}   c      作为新创建对象的原型的constructor
     */
    var create = Object.create ? function(proto, c) {
        var o = Object.create(proto);
        o.constructor = c;
        return o;
    } : function(proto, c) {
        function F() {}
        F.prototype = proto;

        var o = new F();
        o.constructor = c;

        return o;
    };

    function conthunktor(Constructor, args) {
        // var args = Array.prototype.slice.call(arguments, 1);
        return function() {

            var Temp = function() {}, // temporary constructor
                inst, ret; // other vars

            // Give the Temp constructor the Constructor's prototype
            Temp.prototype = Constructor.prototype;

            // Create a new instance
            inst = new Temp;

            // Call the original Constructor with the temp
            // instance as its context (i.e. its 'this' value)
            ret = Constructor.apply(inst, args);

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return Object(ret) === ret ? ret : inst;
        }
    }


    var _baseStatic = {
            extend: function() {
                var arg = Array.prototype.slice.call(arguments),
                    deep = type(arg[0]) === 'boolean' && arg.shift(),
                    proto = this.prototype,
                    // superProto = superClass.prototype,
                    src, currObj, key;

                function merge(key, currObjItem) {
                    var oldFun;
                    src = proto[key];

                    if (deep && isFunction(src) && isFunction(currObjItem)) {
                        oldFun = src;
                        proto[key] = function() {
                            oldFun.apply(this, arguments);
                            currObjItem.apply(this, arguments);
                        };
                    } else if (deep && isPlainObject(src) && isPlainObject(currObjItem)) {
                        extend(deep, src, currObjItem);
                    } else {
                        proto[key] = currObjItem;
                    }
                }

                while (currObj = arg.shift()) {
                    for (key in currObj) {
                        if (currObj.hasOwnProperty(key)) {
                            merge(key, currObj[key]);
                        }
                    }
                }
            }
        };

    function bootstrap() {
        this.init.apply(this, arguments);
    }

    /**
     * 创建一个类
     * @method createClass
     * @param  {Boolean}   deep         是否对原料对象使用深复制的方式扩展类，包括函数。
     * @param  {Object}    object       类原型的原料对象，默认是浅复制扩展。init方法为类的初始化方法。
     * @param  {Object}    superClass   规定父类。
     * @return {Function}  返回类的构造函数
     */
    function createClass(deep, object, superClass) {
        if (type(deep) !== 'boolean') {
            superClass = object;
            object = deep;
            deep = false;
        }

        if (superClass === undefined) {
            superClass = Base;
        }

        function klass() {
            if (!(this instanceof klass)) {
                // return new (klass.bind.apply(klass, arguments))();
                return conthunktor(klass, arguments)();
            }

            bootstrap.apply(this, arguments);
        }

        extend(klass, _baseStatic);

        klass.prototype = create(superClass.prototype, klass);
        klass.superClass = superClass; // create(superClass.prototype, superClass);
        klass.extend(deep, object);

        return klass;
    }

    return {
        createClass: createClass,
        extend: extend,
        create: create,
        type: type,
        likeArray: likeArray,
        isFunction: isFunction,
        isPlainObject: isPlainObject
    };
});
