module.exports = {
    contains: document.documentElement.contains ?
        function(parent, node) {
            return parent !== node && parent.contains(node)
        } : function(parent, node) {
            while (node && (node = node.parentNode))
                if (node === parent) return true
            return false
        }
};
