var moduleCore = require('../core'),
    getChildren = require('./children').children;

var _containers = {
    '*': document.createElement('div')
};

function fragment(dom, name) {
    var container = _containers[name || '*'];

    container.innerHTML = dom;
    dom = getChildren(container);

    moduleCore.each(dom, function(el) {
        container.removeChild(el);
    })

    return dom.length <= 1 ? dom[0] : dom;
}

module.exports = {
    create: fragment
};
