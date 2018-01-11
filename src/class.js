var moduleCore = require('./core');

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
                deep = moduleCore.type(arg[0]) === 'boolean' && arg.shift(),
                proto = this.prototype,
                // superProto = superClass.prototype,
                src, currObj, key;

            function merge(key, currObjItem) {
                var oldFun;
                src = proto[key];

                if (deep && moduleCore.isFunction(src) && moduleCore.isFunction(currObjItem)) {
                    oldFun = src;
                    proto[key] = function() {
                        oldFun.apply(this, arguments);
                        currObjItem.apply(this, arguments);
                    };
                } else if (deep && moduleCore.isPlainObject(src) && moduleCore.isPlainObject(currObjItem)) {
                    moduleCore.extend(deep, src, currObjItem);
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
    if (moduleCore.type(deep) !== 'boolean') {
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

    moduleCore.extend(klass, _baseStatic);

    klass.prototype = create(superClass.prototype, klass);
    klass.superClass = superClass; // create(superClass.prototype, superClass);
    klass.extend(deep, object);

    return klass;
}



module.exports = {
    createClass: createClass,
    create: create
}
