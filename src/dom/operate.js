var next = require('./sibling').next,
	_export = {};

['after', 'prepend', 'before', 'append'].forEach(function(val, i) {
    var inside = i % 2;

    _export[val] = function(ele, dom) {
        var parent = inside ? ele : ele.parentNode,
            target = null;

        switch (i) {
            case 0:
                target = next(ele);
                break;
            case 1:
                target = ele.firstChild;
                break;
            case 2:
                target = ele;
        }

        parent.insertBefore(dom, target);
    };

    _export[inside ? val + 'To' : 'insert' + val[0].toUpperCase() + val.slice(1)] = function(ele, ref) {
        _export[val](ref, ele);
    }
});


module.exports = _export;