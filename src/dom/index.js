var extend = require('../core').extend;

var exportList = [
    require('./addHeadStyle'),
    require('./children'),
    require('./class'),
    require('./closest'),
    require('./contains'),
    require('./create'),
    require('./event'),
    require('./getTrigger'),
    require('./is'),
    require('./operate'),
    require('./remove'),
    require('./sibling')
];

exportList.unshift({});
module.exports = {
    dom: extend.apply(null, exportList)
}