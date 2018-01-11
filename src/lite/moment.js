/**
 * 精简的moment实现
 * @class
 * @exports moment
 * @param {object} date Date对象
 * @example
 * ```javasript
 *     a = new moment(Date.now());
 *     console.log(a); //moment {date: Wed Oct 14 2015 16:34:35 GMT+0800 (中国标准时间)}
 *     a.format('hh:mm'); //"16:09"
 * ```
 */
var moment = (function() {
    'use strict';

    var key,
        sheet = {
            YYYY: {
                exp: function(date) {
                    return date.getFullYear();
                }
            },
            MM: {
                exp: function(date) {
                    return ('0' + (date.getMonth() + 1)).slice(-2);
                }
            },
            DD: {
                exp: function(date) {
                    return date.getDate();
                }
            },
            hh: {
                exp: function(date) {
                    return date.getHours();
                }
            },
            mm: {
                exp: function(date) {
                    return date.getMinutes();
                }
            },
            ss: {
                exp: function(date) {
                    return ('0' + date.getSeconds()).slice(-2);
                }
            }
        };

    /* jshint ignore:start */
    function moment(date) {
        var self = this;

        this.date = new Date(date);
    }
    /* jshint ignore:end */

    for (key in sheet) {
        if (sheet.hasOwnProperty(key)) {
            sheet[key].reg = new RegExp(key + '((?=\\[)|(?=[^\\]]+\\[)|(?=[^\\]]*$))', 'g');
        }
    }

    moment.prototype = {
        /**
         * 输出格式化的字符串表示
         * @param  {string} str 时间格式，可用字段`YYYY`, `MM`,  `DD`,  `hh`,  `mm`,  `ss`。
         *                      用`[]`里的内容不会被解析
         * @example
         * ```javasript
         *     new moment(Date.now()).format('hh:mm [mm]'); // "16:09 mm"
         * ```
         * @return {string}
         */
        format: function(str) {
            var date = this.date,
                key;

            for (key in sheet) {
                if (sheet.hasOwnProperty(key)) {
                    // str = str.replace(sheet[key].reg, eval(sheet[key].exp.replace(/\$\|/, 'date.')));
                    str = str.replace(sheet[key].reg, function() {
                        return sheet[key].exp(date);
                    });
                }
            }

            return str.replace(/\[([^\[\]]*)\]/g, function(_, $2) {
                return $2;
            });
        }
    };

    if (typeof define === 'function') {
        define('moment', function() {
            return moment;
        });
    }

    return moment;
})();


module.exports = {
    moment: moment
};