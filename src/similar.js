module.exports = {
	/**
	 * 判断两个对象或数组是否相似。算法是两个对象的json表示法是否相等
	 * 如果传入简单数据类型，则用相等运算符运算。如果传入其他复杂数据类型，则返回false。
	 * @example
	 * similar({a: 1, b: 2}, {b: 2, a: 1}) // ==> true;
	 * similar({a: 1}, {a: 1, b: 2}) // ==> false;
	 * similar({a: 1, b: null}, {a: 1}) // ==> false;
	 * similar({}, {}) // ==> true;
	 * similar([], []) // ==> true;
	 * similar([{a: 1}], [{a: 1}]) // ==> true;
	 * similar([], [undefined]) // ==> false;
	 * similar(1, '1') // ==> true;
	 * similar(/a/, /a/) // ==> false;
	 */
    similar: function similar(a, b) {
        var result = true,
        	a_len, b_len,
        	complexTypeReg = /object|array/,
			type = require('./core').type;

		function diffOf(a, b) {
			var len = 0,
				result = true;

			require('./core').each(a, function(val, key) {
				var val_type = type(val),
					bVal = b[key];

	        	val && len++;

	        	if (val_type !== type(bVal)) {
	                return result = false;
	        	} else if (complexTypeReg.test(val_type)) {
	        		return result = similar(val, bVal)
	        	} else if (bVal !== val) {
	                return result = false;
	            }
	        });

	        return result && len;
		}

		// 如果相等运算符结果是true，那么肯定是true
		// 否则看数据类型是否相同
        if (a == b) {
        	return true;
        }

        // 这个阶段已经开始只验证复杂的数据类型，如果数据类型不同肯定为false
        else if (type(a) !== type(b)) {
			result = false;
		}

		// 剩下就是相同的数据类型对比，只分析数组和对象。
        // @todo，嗯~~没有对function, ExpReg等类型做分析，
        // 主要因为代码量要求间，而业务场景几乎也没有这种需求
        else if (complexTypeReg.test(type(a))) {
	        result = a_len = diffOf(a, b);

	        if (result !== false) {
	        	result = b_len = diffOf(b, a);
	        	return (a_len == b_len) && (result === 0 ? true : !!result);
	        }
        }

        else {
        	result = false;
        }


        return result;
    }
}