var type = require('./core'),
    dataAPI = require('./data'),
    count = require('./count').count;

function getUid(item) {
    var gid;

    if (!(gid = dataAPI.data(item, 'gid'))) {
        gid = count();
        dataAPI.data(item, 'gid', gid);
    }

    return gid;
}

function uniq(arr, opt_rv, opt_hashFn) {
    var returnArray = opt_rv || arr;
    var defaultHashFn = function(item) {
        // Prefix each type with a single character representing the type to
        // prevent conflicting keys (e.g. true and 'true').
        return type.isPlainObject(item) ? 'o' + getUid(item) :
            (typeof item).charAt(0) + item;
    };

    var hashFn = opt_hashFn ? function(item) {
        return opt_hashFn(item, defaultHashFn);
    } : defaultHashFn;

    var seen = {},
        cursorInsert = 0,
        cursorRead = 0;

    while (cursorRead < arr.length) {
        var current = arr[cursorRead++];
        var key = hashFn(current);
        if (!Object.prototype.hasOwnProperty.call(seen, key)) {
            seen[key] = true;
            returnArray[cursorInsert++] = current;
        }
    }

    returnArray.length = cursorInsert;

    return returnArray;
}

function uniqBy(arr, opt_rv) {
    var argIndex = /string|number/.test(typeof opt_rv) ? 1 : 2,
        args = Array.prototype.slice.call(arguments, argIndex),
        items = [];

    return uniq(arr, argIndex == 1 ? false : opt_rv, function(item, getHashFn) {
        var similarItem = items.filter(function(_item) {
            var result = true;

            for (var i = args.length - 1; i >= 0; i--) {
                if (item[args[i]] !== _item[args[i]]) {
                    result = false;
                    break;
                }
            }

            return result;
        });

        if (similarItem.length) {
            return getHashFn(similarItem[0]);
        } else {
            items.push(item);
            return getHashFn(item);
        }
    });
}

/*function uniqWith(arr, opt_rv, diff) {
    var items = [];

    if (typeof opt_rv === 'function') {
        diff = opt_rv;
        opt_rv = false;
    }

    return uniq(arr, opt_rv, function(item, getHashFn) {
        debugger;
        var similarItem = items.filter(function(_item) {
            return diff(item, _item);
        });

        if (similarItem.length) {
            return getHashFn(similarItem[0]);
        } else {
            items.push(item);
            return getHashFn(item);
        }
    });
}*/

module.exports = {
    uniq: uniq,
    uniqBy: uniqBy
}