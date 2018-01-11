/**
 * 检验数据是否符合schema
 */
var type = require('./core').type;

function validateData(val, schemaKey) {
    var key;

    schemaKey = schemaKey.split('|');

    for (var i = schemaKey.length - 1; i >= 0; i--) {
        key = schemaKey[i];

        if (!jsonSchema[key]) {
            throw 'not found "' + key + '" in jsonSchema';
        } else if (jsonSchema[key](val)) {
            return true;
        }
    }

    return false;
}

function validateSchema(source, schema, onError, onPass, keyPath) {
    var i, _keyPath,
        dataType = type(source),
        schemaType = type(schema);

    keyPath = keyPath || 'root';

    if (schemaType === 'object') {
        if (dataType !== schemaType) return showError(schemaType);

        for (i in schema) {
            if (!source.hasOwnProperty(i)) {
                _keyPath = keyPath + '.' + i;
                showError('notFuond');
            } else {
                validateSchema(source[i], schema[i], onError, onPass, keyPath + '.' + i);
            }
        }
    } else if (schemaType === 'array') {
        if (dataType !== schemaType) return showError(schemaType);

        for (i = source.length - 1; i >= 0; i--) {
            validateSchema(source[i], schema[0], onError, onPass, keyPath + '[' + i + ']');
        }
    } else {
        if (validateData(source, schema)) {
            cb(schema);
        } else {
            return showError(schema);
        }
    }

    function cb(type) {
        return onPass && onPass(source, type, _keyPath || keyPath);
    }

    function showError(type) {
        return onError && onError(source, type, _keyPath || keyPath);
    }
}

var jsonSchema = {
    /**
     * 检验数据是否符合schema
     * @type             source     要检验的数据
     * @type             schema     数据大纲
     * @type {Function}  onError*   数据类型不吻合是的回调
     * @type {Function}  onError.value     检验失败的值
     * @type {Function}  onError.type      错误类型，除了内置的notFuond，其他可以自己在jsonSchema扩展
     * @type {Function}  onError.keyPath   字段的访问堆栈
     * @type {String}    keyPath*
     *
     * @example
     * var orderData = {
     *     businessType: 1,
     *
     *     arr: 2,
     *     sendUser: {
     *         units: '',
     *         contactPeople: '',
     *         contactPhone: '',
     *         region: 0,
     *         address: ['广州', '深圳', 2]
     *     }
     * };
     *
     * var orderDataSchema = {
     *     businessType: 'number',
     *
     *     arr: 'array',
     *     sendUser: {
     *         units: 'string',
     *         contactPeople: 'string',
     *         contactPhone: 'string',
     *         region: 'string',
     *         address: ['number'],
     *         remark: 'string'
     *     }
     * };
     *
     * Utils.jsonSchema.validate(orderData, orderDataSchema, function(val, type, path) {
     *     switch (type) {
     *         case 'number':
     *             Utils.parseExp(orderData, path.replace(/^root\./, ''), +val || 0);
     *             break;
     *         case 'notFuond':
     *             console.warn('缺少' + path)
     *             break;
     *         default: 
     *             console.warn(path + '期待的是' + type)
     *             break;
     *     }
     * });
     */
    validate: validateSchema,
    number: function(data) {return type(data) === 'number'},
    string: function(data) {return type(data) === 'string'},
    boolean: function(data) {return type(data) === 'boolean'},
    object: function(data) {return type(data) === 'object'},
    array: function(data) {return type(data) === 'array'}
}



module.exports = {
    jsonSchema: jsonSchema
};