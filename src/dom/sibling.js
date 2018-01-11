var children = require('./children').children,
	moduleCore = require('../core');

module.exports = {
    next: function(node) {
        var nextNode = node.nextSibling;

        while(nextNode && nextNode.nodeType !== 1) {
            nextNode = nextNode.nextSibling;
        }

        return nextNode;
    },
    prev: function(node) {
        var nextNode = node.previousSibling;

        while(nextNode && nextNode.nodeType !== 1) {
            nextNode = nextNode.previousSibling;
        }

        return nextNode;
    },
    nextAll: function(node) {
		var _childrens = children(node.parentNode),
			start_ready = false,
			childrens = [];

		moduleCore.each(_childrens, function(el) {
			if (el == node) {
				start_ready = true;
			} else if (start_ready) {
				childrens.push(el);
			}
		});

		return childrens;
    },
    prevAll: function(node) {
		var _childrens = children(node.parentNode),
			childrens = [];

		moduleCore.each(_childrens, function(el) {
			if (el !== node) {
				childrens.push(el);
			} else {
				return false;
			}
		});

		return childrens;
    }
};
