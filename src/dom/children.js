module.exports = {
    children: function(node) {
        var childs = node.childNodes,
            children = [];

        for (var i = childs.length - 1; i >= 0; i--) {
            if (childs[i].nodeType === 1) {
                children.unshift(childs[i]);
            }
        }

        return children;
    }
};