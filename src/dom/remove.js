module.exports = {
    remove: function(el) {
        require('./event').off(el);

        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
};
