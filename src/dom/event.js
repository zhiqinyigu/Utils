var moduleCore = require('../core');
var moduleData = require('../data');


var prefixSheet = {
    'transitionend': transitionPrefix,
    'transitionstart': transitionPrefix
};

function transitionPrefix(type) {
    var e = ' webkit$ o$ MS$';

    type = (type.charAt(0).toUpperCase() + type.slice(1)).replace(/(?:end|start)$/, function(latter) {
        return latter.charAt(0).toUpperCase() + latter.slice(1);
    });

    return type.toLowerCase() + e.replace(/\$/g, type);
}



function saveToSheet(node, type, handler) {
    var eventData = moduleData._data(node, 'event');

    if (!eventData) {
        moduleData._data(node, 'event', {});

        eventData = moduleData._data(node, 'event');
    }

    eventData[type] = eventData[type] || [];
    eventData[type].push(handler);
}

function createEventReg(eventStr) {
    var regText = moduleCore.map(eventStr.split(/\s+/), function(e) {
        if (/\w\.\w/.test(e)) {
            return '^' + e + '$';
        } else if (/^\./.test(e)) {
            return '\\w*' + e + '$';
        } else if (!(/\./.test(e))) {
            return '^' + e + '(\\.|$)';
        } else {
            throw 'You found one bug. Unknown Event Type is' + e;
        }
    }).join('|');

    if (regText) {
        return new RegExp(regText);
    }
}

function addPrefix(event) {
    var classReg = /\..*/;

    event = ' ' + event + ' ';

    moduleCore.each(prefixSheet, function(prefix, prefixType) {
        event = event.replace(new RegExp('(?:^|\\s)' + prefixType + '(?:\\.\\S*)?', 'g'), function(type) {
            var cls = classReg.exec(type);

            if (typeof prefix === 'function') {
                return prefix(type.replace(classReg, '').trim()).replace(/(\s|$)/g, cls ? cls[0] + '$1' : '$1');
            } else {
                return prefix.replace(/(\s|$)/g, cls ? cls[0] + '$1' : '$1');
            }
        });
    });

    return event.trim();
}

function on(node, event, handler, useCapture) {
    var events = addPrefix(event).split(/\s+/),
        classReg = /\..*$/;

    if (!handler || !event) {
        return;
    }
    // ie678 = !+"\v1" ;
    // onpropertychange event.propertyName.toLowerCase () == "value"
    moduleCore.each(events, function(type) {
        saveToSheet(node, type, handler);
        node.addEventListener(type.replace(classReg, ''), handler, useCapture);
    });
}

function off(node, event, handler) {
    var classReg = /\..*$/;

    function removeListener(key, listeners, eventData) {
        var type = key.replace(classReg, ''),
            listener;

        for (var i = listeners.length - 1; i >= 0; i--) {
            listener = listeners[i];

            if (!handler || handler === listener) {
                node.removeEventListener(type, listener);
                listeners.splice(i, 1);
            }
        }

        if (listeners.length === 0) {
            delete eventData[key];
        }
    }

    eachEventSheet(node, event, removeListener);
}


function eachEventSheet(node, event, iteratorFn) {
    var eventReg, eventData;

    if (!node || !(eventData = moduleData._data(node, 'event'))) {
        return;
    }

    if (event) {
        event = addPrefix(event);
        eventReg = createEventReg(event);
    }

    moduleCore.each(eventData, function(listeners, key) {
        if (!event || eventReg.test(key)) {
            iteratorFn(key, listeners, eventData);
        }
    });
}



/**
 * 触发一个DOM事件
 */
function dispatchDOMEvent(node, type) {
    var event; // The custom event that will be created

    if (typeof Event === 'function') {
        event = new Event(type);
    } else if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(type, true, true);
    } else {
        event = document.createEventObject();
        event.eventType = type;
    }

    event.eventName = type;

    if (document.createEvent) {
        node.dispatchEvent(event);
    } else {
        node.fireEvent("on" + event.eventType, event);
    }
}


module.exports = {
    on: on,
    off: off,
    trigger: dispatchDOMEvent,
    triggerHandler: function(node, event) {
        var data,
            listener,
            classReg = /\..*$/;

        eachEventSheet(node, event, function(key, listeners, eventData) {
            data = {type: key.replace(classReg, '')};

            for (var i = listeners.length - 1; i >= 0; i--) {
                listener = listeners[i];
                listener.call(node, data);
            }
        });
    }
}