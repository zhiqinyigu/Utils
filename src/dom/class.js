var moduleCore = require('../core');

var exp = {};

moduleCore.each(['removeClass', 'addClass'], function(val, i) {
    var add = i % 2;
    exp[val] = function(node, className) {
        var cls = node.className || '',
            reg;

        moduleCore.each(className.split(' '), function(val, i) {
            reg = new RegExp('(^|\\s)' + val + '($|\\s)');
            if (add ? !reg.test(cls) : reg.test(cls)) {
                cls = (add ? (cls + ' ' + val) : cls.replace(reg, ' ')).trim();
            }
        });

        node.className = cls;
    }
});

module.exports = exp;
