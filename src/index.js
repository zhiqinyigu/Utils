var moduleCore = require('./core');

var exportList = [
    require('./assemble'),
    require('./class'),
    // require('./commonRequest'),
    require('./data'),
    require('./deconstruction'),
    require('./jsonSchema'),
    require('./parseExp'),
    require('./parseUrl'),
    require('./throttling'),
    // require('./submitAjaxForm'),
    require('./similar'),
    require('./spellUrl'),
    require('./count'),
    require('./uniq'),

    require('./dom')
];

exportList.unshift({}, moduleCore);

window.Utils = moduleCore.extend.apply(null, exportList);
module.exports = moduleCore.extend.apply(null, exportList);


/*(function() {
    var a = 'asdzx'.split('');

    // test each
    Util.each(a, function(val, i) {
        console.log(val, i);
    });

    // test map
    console.log(Util.map(a, function(latter) {
        return latter + '-';
    }));

    // test class
    console.log(Util.createClass(true, {
        init: function() {
            this.id = 123;
            this.name = 'cyc';
        },
        log: function() {
            console.log(this.id);
        }
    }, new Util.createClass({
        log: function() {
            console.log(this.name)
        },
        alert: function() {
            alert(this.id);
        }
    })));

    var data1 = {ssid: 'asd-123-qwe-456', token: 'SDJOIJNS564564GG', msg: 'fail'},
        data2 = {ucode: 3, msg: 'success'};

    // console.log(Util.assembleObject(data1, data2, 'msg', 'token'));
    console.log(Util.assembleParam(data1, data2, 'msg', 'token'));
})()*/
