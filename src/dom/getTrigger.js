var contains = require('./contains').contains,
    closest = require('./closest').closest,
    eventAPI = require('./event'),
    moduleData = require('../data');

// 获取一个包含事件触发源（e.target）的元素
function getTrigger(e, selector, parent) {
    var target = e.target,
        is_str = typeof selector == 'string',
        r = e.relatedTarget
        // ,isTarget = $t.is(selector)
        // ,$el = isTarget ? $t : $(closest($t, selector));
        ,
        info = closest(target, selector),
        el = is_str ? info : info && info[0];

    // 保证el在parent内
    if (parent && el && contains(el, parent)) {
        el = false;
    }

    return !el || (e.type !== "click" && (contains(el, r) || r === el && contains(el, target))) ? false : is_str ? el : info;
}


function live(node, event, selector, handler) {
    var eventData = moduleData._data(node, 'event'),
        list = moduleData._data(node, 'liveList');

    if (!list) {
        moduleData._data(node, 'liveList', list = []);
    }

    event += '._live_';
    list.push({key: selector, fn: handler})

    if (!eventData || !eventData[event]) {
        eventAPI.on(node, event, function(e) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (getTrigger(e, list[i].key)) {
                    list[i].fn(e);
                }
            }
        });
    }
}

function offLive(node, event, selector, handler) {
    var list = moduleData._data(node, 'liveList');

    if (list) {
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i].key === selector && (!handler || handler == list[i].fn)) {
                list.splice(i, 1)
            }
        }

        if (!list.length) {
            eventAPI.of(node, event + '._live_');
            delete moduleData._data(node).liveList;
        }
    }
}


module.exports = {
    getTrigger: getTrigger,
    live: live,
    offLive: offLive
};