var is = require('./is').is;

function closest(node, rule) {
    var is_str = typeof rule == 'string',
        result = false,
        val;

    if (node) {
        if (is_str) {
            rule = [rule];
        }

        do {
            for (var i = 0; i < rule.length; i++) {
                val = rule[i];

                if (is(node, val)) {
                    result = is_str ? node : [node, val];
                    break;
                }
            }
        } while (!result && node && (node = node.parentNode));
    }

    return result;
}

module.exports = {
    closest: closest
};