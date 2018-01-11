var gId = 0;

function getGid() {
    return ++gId;
}


function Data() {
    this.dataSheet = {};
    this.gKey = 'lc' + Date.now() + getGid();
}

Data.prototype = {
    setData: function(node, key, val) {
        var data,
            dataKey,
            dataSheet = this.dataSheet;

        if (node) {
            if (!(dataKey = node[this.gKey])) {
                dataKey = node[this.gKey] = getGid();
            }

            if (!(data = dataSheet[dataKey])) {
                data = dataSheet[dataKey] = {};
            }

            data[key] = val;
        }
    },

    getData: function(node, key) {
        var data,
            dataKey;

        if (node && (dataKey = node[this.gKey]) && (data = this.dataSheet[dataKey])) {
            if (/string|number/.test(typeof key)) {
                return data[key];
            } else {
                return data;
            }
        } else if (key) {
            return;
        }

        return null;
    },

    removeData: function(node, key) {
        var data = this.getData(node);

        if (data) {
            if (/string|number/.test(typeof key)) {
                delete data[key];
            } else {
                delete this.dataSheet[node[this.gKey]];
                delete node[this.gKey];
            }
        }
    },

    data: function(node, key, val) {
        if (typeof val === 'undefined') {
            return this.getData(node, key);
        } else {
            this.setData(node, key, val)
        }
    }
}

var userData = new Data(),
    utilData = new Data();

function exportAPI(obj, method) {
    return function() {
        return obj[method].apply(obj, arguments);
    }
}

module.exports = {
	data: exportAPI(userData, 'data'),
    removeData: exportAPI(userData, 'removeData'),
    _data: exportAPI(utilData, 'data')
}