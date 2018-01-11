/**
 * 用在ajax提交数据较多，将一个对象结构成平级。
 * 结构是form表单post提交的格式。
 * 
 * @example
 * var a = {a: [1,2,["a"]], b:{key: "b"}};
 * deconstruction(a);
 * // => {"a[0]":1, "a[1]":2, "b.key":"b", "a[2][0]":"a"}
 */


var coreAPI = require('./core'),
    type = coreAPI.type,
    likeArray = coreAPI.likeArray;

function deconstruction(data, _inDepth) {
    var hasUnknown = false;
    var key, val, iKey;

    if (!_inDepth) {
        data = coreAPI.extend(true, {}, data);
    }

    for (key in data) {
        val = data[key];

        if (type(val) === 'array' || (type(val) === 'object' && likeArray(val))) {
            for (var i = 0; i < val.length; i++) {
                data[key + '[' + i + ']'] = val[i];
            }

            delete data[key];
            hasUnknown = true;
        } else if (type(val) === 'object') {
            for (iKey in val) {
                // data[key + '[' + iKey + ']'] = val[iKey];
                data[key + '.' + iKey] = val[iKey];
            }

            delete data[key];
            hasUnknown = true;
        }
    }

    if (_inDepth) {
        return hasUnknown;
    } else {
        while (deconstruction(data, true)) {}

        return data;
    }
}

module.exports = {
    deconstruction: function(data, type) {
        var tmpObj = {};

        switch(type) {
            case 'raw':
                return JSON.stringify(data);
            case 'form-data': 
                coreAPI.each(data, function(value, key) {
                    tmpObj[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
                });

                return tmpObj;
            default:
                return deconstruction(data, type)
        }
    }
};