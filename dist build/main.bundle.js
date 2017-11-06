webpackJsonp([1],{

/***/ "../node_modules/hammerjs/hammer.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
        return Hammer;
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');


/***/ }),

/***/ "./src async recursive":
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = "./src async recursive";

/***/ }),

/***/ "./src/app/animations.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return slideInDownAnimation; });

// Component transition animations
var slideInDownAnimation = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_19" /* trigger */])('routeAnimation', [
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_20" /* state */])('*', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_21" /* style */])({
        opacity: 1,
    })),
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_22" /* transition */])(':enter', [
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_21" /* style */])({
            opacity: 0,
            transform: 'translateX(100%)'
        }),
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_23" /* animate */])('400ms cubic-bezier(.35,0,.25,1)')
    ]),
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_22" /* transition */])(':leave', [
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_23" /* animate */])('400ms cubic-bezier(.35,0,.25,1)', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_21" /* style */])({
            opacity: 0,
            transform: 'translateX(100%)'
        }))
    ])
]);
//# sourceMappingURL=animations.js.map

/***/ }),

/***/ "./src/app/app-routes.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__pages_blog_blog_component__ = __webpack_require__("./src/app/pages/blog/blog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__pages_blog_blog_detail_blog_detail_component__ = __webpack_require__("./src/app/pages/blog/blog-detail/blog-detail.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_not_found_not_found_component__ = __webpack_require__("./src/app/pages/not-found/not-found.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_slides_slides_component__ = __webpack_require__("./src/app/pages/slides/slides.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_compose_message_compose_message_component__ = __webpack_require__("./src/app/pages/compose-message/compose-message.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_switch_switch_component__ = __webpack_require__("./src/app/pages/switch/switch.component.ts");
/* unused harmony export BLOG_ROUTES */
/* unused harmony export routes */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppRoutingModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








var BLOG_ROUTES = [];
var routes = [
    { path: '', component: __WEBPACK_IMPORTED_MODULE_2__pages_blog_blog_component__["a" /* BlogComponent */], children: BLOG_ROUTES, data: { animation: { value: 'blog' } } },
    { path: 'detail', component: __WEBPACK_IMPORTED_MODULE_3__pages_blog_blog_detail_blog_detail_component__["a" /* BlogDetailComponent */], data: { animation: { value: 'slides' } } },
    { path: 'slides', component: __WEBPACK_IMPORTED_MODULE_5__pages_slides_slides_component__["a" /* SlidesComponent */], data: { animation: { value: 'slides' } } },
    { path: 'switch', component: __WEBPACK_IMPORTED_MODULE_7__pages_switch_switch_component__["a" /* SwitchComponent */] },
    { path: 'blogDetail', component: __WEBPACK_IMPORTED_MODULE_3__pages_blog_blog_detail_blog_detail_component__["a" /* BlogDetailComponent */], outlet: 'blogDetail' },
    { path: 'compose', component: __WEBPACK_IMPORTED_MODULE_6__pages_compose_message_compose_message_component__["a" /* ComposeMessageComponent */], outlet: 'popup' },
    { path: '**', component: __WEBPACK_IMPORTED_MODULE_4__pages_not_found_not_found_component__["a" /* NotFoundComponent */] },
];
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    return AppRoutingModule;
}());
AppRoutingModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* RouterModule */].forRoot(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* RouterModule */]]
    })
], AppRoutingModule);

//# sourceMappingURL=app-routes.js.map

/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div [@routerAnimations]=\"prepareRouteTransition(outlet)\">\n  <!-- <a [routerLink]=\"[{ outlets: { popup: ['compose'] } }]\">Contact</a> -->\n  <router-outlet #outlet=\"outlet\"></router-outlet>\n  <router-outlet name=\"popup\"></router-outlet>\n  <div class=\"blog-detail-wrap\">\n    <router-outlet name=\"blogDetail\"></router-outlet>\n  </div>\n</div>"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_hammerjs__ = __webpack_require__("../node_modules/hammerjs/hammer.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_hammerjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_hammerjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__routerAnimations__ = __webpack_require__("./src/app/routerAnimations.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



// export const routerAnimations: AnimationMetadata = trigger('routerAnimations', [
//       transition('blog => slides', [
//         query(':leave, :enter',
//           style({
//            position: 'absolute',
//            top: 0, 
//            left: 0, 
//            right: 0 , 
//            width:'100%', 
//            height:'100%',
//          })),
//         query(':enter', [
//             style({ 
//               transform: 'translateX(100%)'
//          })
//         ]),
//         group([
//           query(':leave', [
//             // 向左滑出
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
//             // 向右滑出
//             // animate('800ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(100%)' })),
//             // 淡出
//             // animate('800ms cubic-bezier(.35,0,.25,1)', style({ opacity:0 }))
//           ]),
//           query(':enter', [
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))
//           ])
//         ])
//       ]),
//       transition('slides => blog', [
//         query(':leave, :enter',
//           style({
//            position: 'absolute',
//            top: 0, 
//            left: 0, 
//            right: 0 , 
//            width:'100%', 
//            height:'100%',
//          })),
//         query(':enter', [
//             style({ 
//               transform: 'translateX(-100%)'
//          })
//         ]),
//         group([
//           query(':leave', [
//             // 向左滑出
//             // animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
//             // 向右滑出
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(100%)' })),
//             // 淡出
//             // animate('800ms cubic-bezier(.35,0,.25,1)', style({ opacity:0 }))
//           ]),
//           query(':enter', [
//             animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))
//           ])
//         ])
//       ])
//     ]);
var AppComponent = (function () {
    function AppComponent() {
        this.title = 'app';
    }
    AppComponent.prototype.prepareRouteTransition = function (outlet) {
        var animation = outlet.activatedRouteData['animation'] || {};
        return animation['value'] || null;
    };
    return AppComponent;
}());
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__("./src/app/app.component.html"),
        styles: [__webpack_require__("./src/app/app.component.css")],
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None,
        animations: [
            __WEBPACK_IMPORTED_MODULE_2__routerAnimations__["a" /* routerAnimations */]
        ]
    })
], AppComponent);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser_animations__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser/animations.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_toolbar__ = __webpack_require__("./src/app/components/toolbar/index.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_button__ = __webpack_require__("./src/app/components/button/index.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_icon__ = __webpack_require__("./src/app/components/icon/index.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__material_module__ = __webpack_require__("./src/app/material-module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__app_routes__ = __webpack_require__("./src/app/app-routes.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__providers_data__ = __webpack_require__("./src/app/providers/data.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__app_component__ = __webpack_require__("./src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__components_app_drawer_app_drawer_component__ = __webpack_require__("./src/app/components/app-drawer/app-drawer.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__pages_blog_blog_component__ = __webpack_require__("./src/app/pages/blog/blog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__pages_blog_blog_detail_blog_detail_component__ = __webpack_require__("./src/app/pages/blog/blog-detail/blog-detail.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__pages_not_found_not_found_component__ = __webpack_require__("./src/app/pages/not-found/not-found.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__pages_slides_slides_component__ = __webpack_require__("./src/app/pages/slides/slides.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__components_app_infinite_app_infinite_component__ = __webpack_require__("./src/app/components/app-infinite/app-infinite.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__components_app_refresher_app_refresher_component__ = __webpack_require__("./src/app/components/app-refresher/app-refresher.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__components_app_refresher_refresher__ = __webpack_require__("./src/app/components/app-refresher/refresher.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__pages_compose_message_compose_message_component__ = __webpack_require__("./src/app/pages/compose-message/compose-message.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__pages_switch_switch_component__ = __webpack_require__("./src/app/pages/switch/switch.component.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






















var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["b" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_11__app_component__["a" /* AppComponent */],
            __WEBPACK_IMPORTED_MODULE_12__components_app_drawer_app_drawer_component__["a" /* AppDrawerComponent */],
            __WEBPACK_IMPORTED_MODULE_13__pages_blog_blog_component__["a" /* BlogComponent */],
            __WEBPACK_IMPORTED_MODULE_14__pages_blog_blog_detail_blog_detail_component__["a" /* BlogDetailComponent */],
            __WEBPACK_IMPORTED_MODULE_15__pages_not_found_not_found_component__["a" /* NotFoundComponent */],
            __WEBPACK_IMPORTED_MODULE_16__pages_slides_slides_component__["a" /* SlidesComponent */],
            __WEBPACK_IMPORTED_MODULE_17__components_app_infinite_app_infinite_component__["a" /* AppInfiniteComponent */],
            __WEBPACK_IMPORTED_MODULE_18__components_app_refresher_app_refresher_component__["a" /* AppRefresherComponent */],
            __WEBPACK_IMPORTED_MODULE_19__components_app_refresher_refresher__["a" /* Refresher */],
            __WEBPACK_IMPORTED_MODULE_20__pages_compose_message_compose_message_component__["a" /* ComposeMessageComponent */],
            __WEBPACK_IMPORTED_MODULE_21__pages_switch_switch_component__["a" /* SwitchComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_forms__["a" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_5__components_toolbar__["a" /* MatToolbarModule */],
            __WEBPACK_IMPORTED_MODULE_6__components_button__["a" /* MatButtonModule */],
            __WEBPACK_IMPORTED_MODULE_7__components_icon__["a" /* MatIconModule */],
            __WEBPACK_IMPORTED_MODULE_8__material_module__["a" /* MaterialModule */],
            __WEBPACK_IMPORTED_MODULE_9__app_routes__["a" /* AppRoutingModule */]
        ],
        providers: [__WEBPACK_IMPORTED_MODULE_10__providers_data__["a" /* Data */]],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_11__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ "./src/app/components/app-drawer/app-drawer.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"drawer-container\">\n    <div class=\"drawer-backdrop\" (click)='close()'>\n    </div>\n    <div class=\"drawer\"\n    (slidestart) = \"_onSlideStart($event)\"\n    (slide)=\"_onSlide($event)\"\n    (slideend) =\"_onSlideEnd($event)\"\n    >\n        <ng-content></ng-content>\n    </div>\n</div>\n"

/***/ }),

/***/ "./src/app/components/app-drawer/app-drawer.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".drawer-backdrop {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  display: block;\n  z-index: 3;\n  visibility: hidden; }\n\n.drawer-backdrop {\n  transition-duration: .2s;\n  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);\n  transition-property: background-color; }\n\n.drawer {\n  top: 0;\n  bottom: 0;\n  position: absolute;\n  display: block;\n  z-index: 3;\n  width: 300px;\n  outline: 0;\n  overflow-y: auto;\n  background-color: white;\n  color: rgba(0, 0, 0, 0.87);\n  -webkit-transform: translate3d(-100%, 0, 0);\n          transform: translate3d(-100%, 0, 0);\n  transition: -webkit-transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);\n  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);\n  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), -webkit-transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }\n\n@media (max-width: 600px) {\n  .drawer {\n    width: 80vw; } }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/components/app-drawer/app-drawer.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppDrawerComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var AppDrawerComponent = (function () {
    function AppDrawerComponent(_elementRef) {
        this._elementRef = _elementRef;
        this.isShown = false;
        this.scheduledAnimationFrame = false;
    }
    AppDrawerComponent.prototype.ngOnInit = function () {
        this.drawer = this._elementRef.nativeElement.querySelector('.drawer');
        this.drawerBackDrop = this._elementRef.nativeElement.querySelector('.drawer-backdrop');
        this.slideInit();
    };
    AppDrawerComponent.prototype.close = function () {
        this.drawer.style.transform = "translate3d(-100%, 0, 0)";
        this.drawer.style.transition = 'transform 0.4s cubic-bezier(.25,.8,.25,1)';
        this.drawerBackDrop.style.visibility = "hidden";
        this.slideInit();
    };
    AppDrawerComponent.prototype.open = function () {
        this.drawer.style.transform = "translate3d(0, 0, 0)";
        this.drawer.style.transition = 'transform 0.4s cubic-bezier(.25,.8,.25,1)';
        this.drawer.style.opacity = '1';
        this.drawerBackDrop.style.visibility = "visible";
        this.drawerBackDrop.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    };
    AppDrawerComponent.prototype.slideInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.drawer.style.transform = "none";
            _this.drawer.style.opacity = '0';
            _this.drawer.style.transform = "translate3d(-98% , 0, 0)";
        }, 400);
    };
    AppDrawerComponent.prototype._onSlideStart = function (event) {
        this.transX = this.drawer.getBoundingClientRect().right;
        this.clientRect = this.drawer.getBoundingClientRect();
        this.drawer.style.transform = "translate3d(calc((-100% + " + this.transX + "px)), 0, 0)";
        this.drawer.style.transition = 'transform 0.1s easy';
        this.drawer.style.opacity = '1';
        this.drawerBackDrop.style.visibility = "visible";
    };
    AppDrawerComponent.prototype._onSlide = function (event) {
        var x = this.transX + event.deltaX;
        if (this.scheduledAnimationFrame)
            return;
        this.scheduledAnimationFrame = true;
        requestAnimationFrame(this.UpdatePage.bind(this, x));
    };
    AppDrawerComponent.prototype._onSlideEnd = function (event) {
        this.clientRect = this.drawer.getBoundingClientRect();
        this.drawer.style.transition = 'transform 0.4s cubic-bezier(.25,.8,.25,1)';
        if (this.clientRect.right >= this.clientRect.width / 2) {
            requestAnimationFrame(this.UpdatePage.bind(this, this.clientRect.width));
        }
        else {
            requestAnimationFrame(this.UpdatePage.bind(this, 0));
            this.slideInit();
        }
    };
    AppDrawerComponent.prototype.UpdatePage = function (x) {
        console.log('UpdatePage');
        this.scheduledAnimationFrame = false;
        if (x >= this.clientRect.width) {
            this.drawer.style.transform = "translate3d(0, 0, 0)";
            this.drawerBackDrop.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        }
        else {
            this.drawer.style.transform = "translate3d(calc((-100% + " + x + "px)), 0, 0)";
            this.drawerBackDrop.style.backgroundColor = "rgba(0, 0, 0, " + 0.6 * x / this.clientRect.width + ")";
        }
    };
    return AppDrawerComponent;
}());
AppDrawerComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-drawer',
        template: __webpack_require__("./src/app/components/app-drawer/app-drawer.component.html"),
        styles: [__webpack_require__("./src/app/components/app-drawer/app-drawer.component.scss")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _a || Object])
], AppDrawerComponent);

var _a;
//# sourceMappingURL=app-drawer.component.js.map

/***/ }),

/***/ "./src/app/components/app-infinite/app-infinite.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"infinite-scroll\" *ngIf=\" state=='loading' \">\n\n    <div class=\"infinite-loading\">\n      <div class=\"infinite-loading-spinner\">\n\n        <div class=\"spinner-crescent\">\n            <svg viewBox=\"0 0 64 64\">\n                <circle transform=\"translate(32,32)\" r=\"26\"></circle>\n            </svg>\n        </div>\n\n      </div>\n      <div class=\"infinite-loading-text\" *ngIf=\"loadingText\">\n          {{loadingText}}\n      </div>\n    </div>\n\n</div>"

/***/ }),

/***/ "./src/app/components/app-infinite/app-infinite.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".infinite-scroll {\n  display: block;\n  width: 100%; }\n\n.infinite-loading {\n  text-align: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  height: 100%;\n  min-height: 84px; }\n\n.spinner-crescent {\n  position: relative;\n  display: inline-block;\n  width: 28px;\n  height: 28px; }\n  .spinner-crescent svg {\n    -webkit-animation-duration: 750ms;\n            animation-duration: 750ms;\n    -webkit-animation: spinner-rotate 1s linear infinite;\n            animation: spinner-rotate 1s linear infinite;\n    stroke: #000; }\n  .spinner-crescent circle {\n    fill: transparent;\n    stroke-width: 4px;\n    stroke-dasharray: 128px;\n    stroke-dashoffset: 82px;\n    transition: background-color .2s linear; }\n\n@-webkit-keyframes spinner-rotate {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n@keyframes spinner-rotate {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n.infinite-loading-text {\n  color: rgba(0, 0, 0, 0.54); }\n\n.infinite-loading-spinner svg {\n  stroke: rgba(0, 0, 0, 0.54); }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/components/app-infinite/app-infinite.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppInfiniteComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var AppInfiniteComponent = (function () {
    function AppInfiniteComponent(_elementRef) {
        this._elementRef = _elementRef;
        this._lastCheck = 0;
        this._thr = '5%';
        this._thrPx = 0;
        this._thrPc = 0.05;
        this.state = STATE_ENABLED;
        this.clientHeight = null;
        this.infinite = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
    }
    Object.defineProperty(AppInfiniteComponent.prototype, "threshold", {
        /**
         * @input {string}
         */
        get: function () {
            return this._thr;
        },
        set: function (val) {
            this._thr = val;
            if (val.indexOf('%') > -1) {
                this._thrPx = 0;
                this._thrPc = (parseFloat(val) / 100);
            }
            else {
                this._thrPx = parseFloat(val);
                this._thrPc = 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppInfiniteComponent.prototype, "enabled", {
        /**
         * @input {boolean}
         */
        set: function (shouldEnable) {
            this.enable(shouldEnable);
        },
        enumerable: true,
        configurable: true
    });
    AppInfiniteComponent.prototype.ngOnInit = function () {
        this.clientHeight = this.getClientHeight();
    };
    AppInfiniteComponent.prototype.getClientHeight = function () {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    };
    AppInfiniteComponent.prototype.onWindowScroll = function (ev) {
        if (this.state === STATE_LOADING || this.state === STATE_DISABLED) {
            return 1;
        }
        if (this._lastCheck + 32 > ev.timeStamp) {
            return 2;
        }
        this._lastCheck = ev.timeStamp;
        // ******** DOM READ ****************
        var d = this._elementRef.nativeElement.getBoundingClientRect();
        var threshold = this._thrPc ? (this.clientHeight * this._thrPc) : this._thrPx;
        var distanceFromInfinite;
        distanceFromInfinite = d.top - this.clientHeight - threshold;
        if (distanceFromInfinite < 0) {
            if (this.state !== STATE_LOADING && this.state !== STATE_DISABLED) {
                this.state = STATE_LOADING;
                this.infinite.emit(this);
            }
            return 3;
        }
        return 5;
    };
    AppInfiniteComponent.prototype.onWindowResize = function (event) {
        this.clientHeight = this.getClientHeight();
    };
    /**
     * @param {boolean}
     */
    AppInfiniteComponent.prototype.enable = function (shouldEnable) {
        var _this = this;
        // 防止抖动 TODO 这种解决方案不好，应该另想方法
        setTimeout(function () {
            _this.state = (shouldEnable ? STATE_ENABLED : STATE_DISABLED);
        }, 200);
    };
    /**
    * @param {Promise<any>}
    */
    AppInfiniteComponent.prototype.waitFor = function (action) {
        var enable = this.complete.bind(this);
        action.then(enable, enable);
    };
    AppInfiniteComponent.prototype.complete = function () {
        var _this = this;
        if (this.state !== STATE_LOADING) {
            return;
        }
        this.state = STATE_DISABLED;
        // 防止抖动 TODO 这种解决方案不好，应该另想方法
        setTimeout(function () {
            _this.state = STATE_ENABLED;
        }, 100);
    };
    return AppInfiniteComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], AppInfiniteComponent.prototype, "threshold", null);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], AppInfiniteComponent.prototype, "enabled", null);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], AppInfiniteComponent.prototype, "loadingText", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Output */])(),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]) === "function" && _a || Object)
], AppInfiniteComponent.prototype, "infinite", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_2" /* HostListener */])("window:scroll", ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppInfiniteComponent.prototype, "onWindowScroll", null);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_2" /* HostListener */])("window:resize"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppInfiniteComponent.prototype, "onWindowResize", null);
AppInfiniteComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'infinite-scroll',
        template: __webpack_require__("./src/app/components/app-infinite/app-infinite.component.html"),
        styles: [__webpack_require__("./src/app/components/app-infinite/app-infinite.component.scss")]
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _b || Object])
], AppInfiniteComponent);

var STATE_ENABLED = 'enabled';
var STATE_DISABLED = 'disabled';
var STATE_LOADING = 'loading';
var _a, _b;
//# sourceMappingURL=app-infinite.component.js.map

/***/ }),

/***/ "./src/app/components/app-refresher/app-refresher.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"refresher-pulling\">\n  <div class=\"refresher-pulling-icon\">\n    <div class=\"refresher-arrow\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M128.4 160L96 192.3 256 352l160-159.7-32.4-32.3L256 287.3z\"/></svg>    </div>\n  </div>\n  <div class=\"refresher-pulling-text\" [innerHTML]=\"pullingText\" *ngIf=\"pullingText\"></div>\n</div>\n<div class=\"refresher-refreshing\">\n  <div class=\"refresher-refreshing-icon\">\n    <div class=\"spinner-crescent\">\n        <svg viewBox=\"0 0 64 64\">\n            <circle transform=\"translate(32,32)\" r=\"26\"></circle>\n        </svg>\n    </div>\n  </div>\n  <div class=\"refresher-refreshing-text\" [innerHTML]=\"refreshingText\" *ngIf=\"refreshingText\"></div>\n</div>"

/***/ }),

/***/ "./src/app/components/app-refresher/app-refresher.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "ion-refresher {\n  left: 0;\n  top: -60px;\n  position: absolute;\n  z-index: 0;\n  display: none;\n  width: 100%;\n  height: 60px; }\n  ion-refresher.refresher-active {\n    display: block; }\n\nion-refresher-content {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  height: 100%; }\n\n.refresher-pulling,\n.refresher-refreshing {\n  display: none;\n  width: 100%; }\n\n.refresher-pulling-icon,\n.refresher-refreshing-icon {\n  text-align: center;\n  -webkit-transform-origin: center;\n          transform-origin: center;\n  font-size: 30px;\n  color: rgba(0, 0, 0, 0.54);\n  transition: 200ms; }\n\n.refresher-pulling-text,\n.refresher-refreshing-text {\n  text-align: center;\n  font-size: 16px;\n  color: rgba(0, 0, 0, 0.54); }\n\n.refresher-refreshing .spinner-crescent circle {\n  stroke: rgba(0, 0, 0, 0.54); }\n\n.refresher-pulling .refresher-arrow {\n  fill: rgba(0, 0, 0, 0.54); }\n\nion-refresher-content[state=pulling] .refresher-pulling {\n  display: block; }\n\nion-refresher-content[state=ready] .refresher-pulling {\n  display: block; }\n\nion-refresher-content[state=ready] .refresher-pulling-icon {\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg); }\n\nion-refresher-content[state=refreshing] .refresher-refreshing {\n  display: block; }\n\nion-refresher-content[state=cancelling] .refresher-pulling {\n  display: block; }\n\nion-refresher-content[state=cancelling] .refresher-pulling-icon {\n  -webkit-transform: scale(0);\n          transform: scale(0); }\n\nion-refresher-content[state=completing] .refresher-refreshing {\n  display: block; }\n\nion-refresher-content[state=completing] .refresher-refreshing-icon {\n  -webkit-transform: scale(0);\n          transform: scale(0); }\n\n.refresher-arrow {\n  display: inline-block;\n  width: 28px;\n  height: 28px;\n  text-align: center; }\n\n.spinner-crescent {\n  position: relative;\n  display: inline-block;\n  width: 28px;\n  height: 28px; }\n  .spinner-crescent svg {\n    -webkit-animation-duration: 750ms;\n            animation-duration: 750ms;\n    -webkit-animation: spinner-rotate 1s linear infinite;\n            animation: spinner-rotate 1s linear infinite;\n    stroke: #000; }\n  .spinner-crescent circle {\n    fill: transparent;\n    stroke-width: 4px;\n    stroke-dasharray: 128px;\n    stroke-dashoffset: 82px;\n    transition: background-color .2s linear; }\n\n@-webkit-keyframes spinner-rotate {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n@keyframes spinner-rotate {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/components/app-refresher/app-refresher.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__refresher__ = __webpack_require__("./src/app/components/app-refresher/refresher.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppRefresherComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppRefresherComponent = (function () {
    function AppRefresherComponent(r) {
        this.r = r;
    }
    /**
     * @hidden
     */
    AppRefresherComponent.prototype.ngOnInit = function () {
    };
    return AppRefresherComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], AppRefresherComponent.prototype, "pullingIcon", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], AppRefresherComponent.prototype, "pullingText", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], AppRefresherComponent.prototype, "refreshingSpinner", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], AppRefresherComponent.prototype, "refreshingText", void 0);
AppRefresherComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'ion-refresher-content',
        template: __webpack_require__("./src/app/components/app-refresher/app-refresher.component.html"),
        styles: [__webpack_require__("./src/app/components/app-refresher/app-refresher.component.scss")],
        host: {
            '[attr.state]': 'r.state'
        },
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__refresher__["a" /* Refresher */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__refresher__["a" /* Refresher */]) === "function" && _a || Object])
], AppRefresherComponent);

var _a;
//# sourceMappingURL=app-refresher.component.js.map

/***/ }),

/***/ "./src/app/components/app-refresher/refresher.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Refresher; });
/* unused harmony export pointerCoord */
/* unused harmony export getCss */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var Refresher = (function () {
    function Refresher(_elementRef) {
        this._elementRef = _elementRef;
        this._appliedStyles = false;
        this._lastCheck = 0;
        this._top = '';
        this.state = STATE_INACTIVE;
        /**
         * The Y coordinate of where the user started to the pull down the content.
         */
        this.startY = null;
        /**
         * The current touch or mouse event's Y coordinate.
         */
        this.currentY = null;
        /**
         * The distance between the start of the pull and the current touch or
         * mouse event's Y coordinate.
         */
        this.deltaY = null;
        /**
         * A number representing how far down the user has pulled.
         * The number `0` represents the user hasn't pulled down at all. The
         * number `1`, and anything greater than `1`, represents that the user
         * has pulled far enough down that when they let go then the refresh will
         * happen. If they let go and the number is less than `1`, then the
         * refresh will not happen, and the content will return to it's original
         * position.
         */
        this.progress = 0;
        /**
         * @input {number} The min distance the user must pull down until the
         * refresher can go into the `refreshing` state. Default is `60`.
         */
        this.pullMin = 60;
        /**
         * @input {number} The maximum distance of the pull until the refresher
         * will automatically go into the `refreshing` state. By default, the pull
         * maximum will be the result of `pullMin + 60`.
         */
        this.pullMax = this.pullMin + 60;
        /**
         * @input {number} How many milliseconds it takes the refresher to to snap back to the `refreshing` state. Default is `280`.
         */
        this.snapbackDuration = 280;
        /**
         * @output {event} Emitted when the user lets go and has pulled down
         * far enough, which would be farther than the `pullMin`, then your refresh hander if
         * fired and the state is updated to `refreshing`. From within your refresh handler,
         * you must call the `complete()` method when your async operation has completed.
         */
        this.ionRefresh = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
        /**
         * @output {event} Emitted while the user is pulling down the content and exposing the refresher.
         */
        this.ionPull = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
        /**
         * @output {event} Emitted when the user begins to start pulling down.
         */
        this.ionStart = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]();
    }
    Refresher.prototype.ngOnInit = function () {
        document.addEventListener('touchstart', this._onStart.bind(this), false);
        document.addEventListener('touchmove', this._onMove.bind(this), false);
        document.addEventListener('touchend', this._onEnd.bind(this), false);
    };
    Refresher.prototype._onStart = function (ev) {
        // if multitouch then get out immediately
        if (ev.touches && ev.touches.length > 1) {
            return false;
        }
        if (this.state !== STATE_INACTIVE) {
            return false;
        }
        var scrollHostScrollTop = document.body.getBoundingClientRect().top;
        // if the scrollTop is greater than zero then it's
        // not possible to pull the content down yet
        if (scrollHostScrollTop < 0) {
            return false;
        }
        var coord = pointerCoord(ev);
        console.log('Pull-to-refresh, onStart', ev.type, 'y:', coord.y);
        // if (this._content.contentTop > 0) {
        //   let newTop = this._content.contentTop + 'px';
        //   if (this._top !== newTop) {
        //     this._top = newTop;
        //   }
        // }
        this.startY = this.currentY = coord.y;
        this.progress = 0;
        this.state = STATE_INACTIVE;
        return true;
    };
    Refresher.prototype._onMove = function (ev) {
        // if multitouch then get out immediately
        if (ev.touches && ev.touches.length > 1) {
            return 1;
        }
        // do nothing if it's actively refreshing
        // or it's in the process of closing
        // or this was never a startY
        if (this.startY === null || this.state === STATE_REFRESHING || this.state === STATE_CANCELLING || this.state === STATE_COMPLETING) {
            return 2;
        }
        // if we just updated stuff less than 16ms ago
        // then don't check again, just chillout plz
        var now = Date.now();
        if (this._lastCheck + 16 > now) {
            return 3;
        }
        // remember the last time we checked all this
        this._lastCheck = now;
        // get the current pointer coordinates
        var coord = pointerCoord(ev);
        this.currentY = coord.y;
        // it's now possible they could be pulling down the content
        // how far have they pulled so far?
        this.deltaY = (coord.y - this.startY);
        // don't bother if they're scrolling up
        // and have not already started dragging
        if (this.deltaY <= 0) {
            return 4;
        }
        if (this.state === STATE_INACTIVE) {
            // this refresh is not already actively pulling down
            // get the content's scrollTop
            var scrollHostScrollTop = document.body.getBoundingClientRect().top;
            // if the scrollTop is greater than zero then it's
            // not possible to pull the content down yet
            if (scrollHostScrollTop < 0) {
                this.progress = 0;
                this.startY = null;
                return 7;
            }
            // content scrolled all the way to the top, and dragging down
            this.state = STATE_PULLING;
        }
        // prevent native scroll events
        // ev.preventDefault();
        // the refresher is actively pulling at this point
        // move the scroll element within the content element
        this._setCss(this.deltaY, '0ms', true, '');
        if (!this.deltaY) {
            // don't continue if there's no delta yet
            this.progress = 0;
            return 8;
        }
        // so far so good, let's run this all back within zone now
        this._onMoveInZone();
    };
    Refresher.prototype._onMoveInZone = function () {
        // set pull progress
        this.progress = (this.deltaY / this.pullMin);
        // emit "start" if it hasn't started yet
        if (!this._didStart) {
            this._didStart = true;
            this.ionStart.emit(this);
        }
        // emit "pulling" on every move
        this.ionPull.emit(this);
        // do nothing if the delta is less than the pull threshold
        if (this.deltaY < this.pullMin) {
            // ensure it stays in the pulling state, cuz its not ready yet
            this.state = STATE_PULLING;
            return 2;
        }
        if (this.deltaY > this.pullMax) {
            // they pulled farther than the max, so kick off the refresh
            this._beginRefresh();
            return 3;
        }
        // pulled farther than the pull min!!
        // it is now in the `ready` state!!
        // if they let go then it'll refresh, kerpow!!
        this.state = STATE_READY;
        return 4;
    };
    Refresher.prototype._onEnd = function (ev) {
        if (this.state === STATE_READY) {
            this._beginRefresh();
        }
        else if (this.state === STATE_PULLING) {
            this.cancel();
        }
        // reset on any touchend/mouseup
        this.startY = null;
    };
    Refresher.prototype._beginRefresh = function () {
        // assumes we're already back in a zone
        // they pulled down far enough, so it's ready to refresh
        this.state = STATE_REFRESHING;
        // place the content in a hangout position while it thinks
        this._setCss(this.pullMin, (this.snapbackDuration + 'ms'), true, '');
        // emit "refresh" because it was pulled down far enough
        // and they let go to begin refreshing
        this.ionRefresh.emit(this);
    };
    Refresher.prototype.complete = function () {
        this._close(STATE_COMPLETING, '120ms');
    };
    /**
     * Changes the refresher's state from `refreshing` to `cancelling`.
     */
    Refresher.prototype.cancel = function () {
        this._close(STATE_CANCELLING, '');
    };
    Refresher.prototype._close = function (state, delay) {
        var timer;
        function close(ev) {
            // closing is done, return to inactive state
            if (ev) {
                clearTimeout(timer);
            }
            this.state = STATE_INACTIVE;
            this.progress = 0;
            this._didStart = this.startY = this.currentY = this.deltaY = null;
            this._setCss(0, '0ms', false, '');
        }
        // create fallback timer incase something goes wrong with transitionEnd event
        timer = setTimeout(close.bind(this), 600);
        // create transition end event on the content's scroll element
        // this._content.onScrollElementTransitionEnd(close.bind(this));
        // reset set the styles on the scroll element
        // set that the refresh is actively cancelling/completing
        this.state = state;
        this._setCss(0, '', true, delay);
        // if (this._pointerEvents) {
        //   this._pointerEvents.stop();
        // }
    };
    Refresher.prototype._setCss = function (y, duration, overflowVisible, delay) {
        this._appliedStyles = (y > 0);
        var Css = getCss(document.body);
        this.setScrollElementStyle(Css.transform, ((y > 0) ? 'translateY(' + y + 'px) translateZ(0px)' : 'translateZ(0px)'));
        this.setScrollElementStyle(Css.transitionDuration, duration);
        this.setScrollElementStyle(Css.transitionDelay, delay);
        this.setScrollElementStyle('overflow', (overflowVisible ? 'hidden' : ''));
    };
    /**
     * @hidden
     * DOM WRITE
     */
    Refresher.prototype.setScrollElementStyle = function (prop, val) {
        var scrollEle = document.body;
        if (scrollEle) {
            scrollEle.style[prop] = val;
        }
    };
    return Refresher;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Number)
], Refresher.prototype, "pullMin", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Number)
], Refresher.prototype, "pullMax", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Input */])(),
    __metadata("design:type", Number)
], Refresher.prototype, "snapbackDuration", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Output */])(),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]) === "function" && _a || Object)
], Refresher.prototype, "ionRefresh", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Output */])(),
    __metadata("design:type", typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]) === "function" && _b || Object)
], Refresher.prototype, "ionPull", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* Output */])(),
    __metadata("design:type", typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* EventEmitter */]) === "function" && _c || Object)
], Refresher.prototype, "ionStart", void 0);
Refresher = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'ion-refresher',
        host: {
            '[class.refresher-active]': 'state !== "inactive"',
            '[style.top]': '_top'
        }
    }),
    __metadata("design:paramtypes", [typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _d || Object])
], Refresher);

var STATE_INACTIVE = 'inactive';
var STATE_PULLING = 'pulling';
var STATE_READY = 'ready';
var STATE_REFRESHING = 'refreshing';
var STATE_CANCELLING = 'cancelling';
var STATE_COMPLETING = 'completing';
function pointerCoord(ev) {
    // get coordinates for either a mouse click
    // or a touch depending on the given event
    if (ev) {
        var changedTouches = ev.changedTouches;
        if (changedTouches && changedTouches.length > 0) {
            var touch = changedTouches[0];
            return { x: touch.clientX, y: touch.clientY };
        }
        var pageX = ev.pageX;
        if (pageX !== undefined) {
            return { x: pageX, y: ev.pageY };
        }
    }
    return { x: 0, y: 0 };
}
function getCss(docEle) {
    var css = {};
    // transform
    var i;
    var keys = ['webkitTransform', '-webkit-transform', 'webkit-transform', 'transform'];
    for (i = 0; i < keys.length; i++) {
        if (docEle.style[keys[i]] !== undefined) {
            css.transform = keys[i];
            break;
        }
    }
    // transition
    keys = ['webkitTransition', 'transition'];
    for (i = 0; i < keys.length; i++) {
        if (docEle.style[keys[i]] !== undefined) {
            css.transition = keys[i];
            break;
        }
    }
    // The only prefix we care about is webkit for transitions.
    var isWebkit = css.transition.indexOf('webkit') > -1;
    // transition duration
    css.transitionDuration = (isWebkit ? '-webkit-' : '') + 'transition-duration';
    // transition timing function
    css.transitionTimingFn = (isWebkit ? '-webkit-' : '') + 'transition-timing-function';
    // transition delay
    css.transitionDelay = (isWebkit ? '-webkit-' : '') + 'transition-delay';
    // To be sure transitionend works everywhere, include *both* the webkit and non-webkit events
    css.transitionEnd = (isWebkit ? 'webkitTransitionEnd ' : '') + 'transitionend';
    // transform origin
    css.transformOrigin = (isWebkit ? '-webkit-' : '') + 'transform-origin';
    // animation delay
    css.animationDelay = (isWebkit ? 'webkitAnimationDelay' : 'animationDelay');
    return css;
}
var _a, _b, _c, _d;
//# sourceMappingURL=refresher.js.map

/***/ }),

/***/ "./src/app/components/button/button-module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material_core__ = __webpack_require__("./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__ = __webpack_require__("./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__button__ = __webpack_require__("./src/app/components/button/button.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatButtonModule; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var MatButtonModule = (function () {
    function MatButtonModule() {
    }
    return MatButtonModule;
}());
MatButtonModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_common__["e" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_material_core__["b" /* MatRippleModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_material_core__["c" /* MatCommonModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__["a" /* A11yModule */],
        ],
        exports: [
            __WEBPACK_IMPORTED_MODULE_4__button__["a" /* MatButton */],
            __WEBPACK_IMPORTED_MODULE_4__button__["b" /* MatAnchor */],
            __WEBPACK_IMPORTED_MODULE_4__button__["c" /* MatMiniFab */],
            __WEBPACK_IMPORTED_MODULE_4__button__["d" /* MatFab */],
            __WEBPACK_IMPORTED_MODULE_2__angular_material_core__["c" /* MatCommonModule */],
            __WEBPACK_IMPORTED_MODULE_4__button__["e" /* MatButtonCssMatStyler */],
            __WEBPACK_IMPORTED_MODULE_4__button__["f" /* MatRaisedButtonCssMatStyler */],
            __WEBPACK_IMPORTED_MODULE_4__button__["g" /* MatIconButtonCssMatStyler */],
        ],
        declarations: [
            __WEBPACK_IMPORTED_MODULE_4__button__["a" /* MatButton */],
            __WEBPACK_IMPORTED_MODULE_4__button__["b" /* MatAnchor */],
            __WEBPACK_IMPORTED_MODULE_4__button__["c" /* MatMiniFab */],
            __WEBPACK_IMPORTED_MODULE_4__button__["d" /* MatFab */],
            __WEBPACK_IMPORTED_MODULE_4__button__["e" /* MatButtonCssMatStyler */],
            __WEBPACK_IMPORTED_MODULE_4__button__["f" /* MatRaisedButtonCssMatStyler */],
            __WEBPACK_IMPORTED_MODULE_4__button__["g" /* MatIconButtonCssMatStyler */],
        ],
    })
], MatButtonModule);

//# sourceMappingURL=button-module.js.map

/***/ }),

/***/ "./src/app/components/button/button.html":
/***/ (function(module, exports) {

module.exports = "<span class=\"mat-button-wrapper\"><ng-content></ng-content></span>\n<div matRipple class=\"mat-button-ripple\"\n     [class.mat-button-ripple-round]=\"_isRoundButton || _isIconButton\"\n     [matRippleDisabled]=\"_isRippleDisabled()\"\n     [matRippleCentered]=\"_isIconButton\"\n     [matRippleTrigger]=\"_getHostElement()\"></div>\n<div class=\"mat-button-focus-overlay\"></div>\n"

/***/ }),

/***/ "./src/app/components/button/button.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "/* stylelint-disable material/no-prefixes */\n/* stylelint-enable */\n.mat-raised-button, .mat-fab, .mat-mini-fab, .mat-button, .mat-icon-button {\n  box-sizing: border-box;\n  position: relative;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  cursor: pointer;\n  outline: none;\n  border: none;\n  -webkit-tap-highlight-color: transparent;\n  display: inline-block;\n  white-space: nowrap;\n  text-decoration: none;\n  vertical-align: baseline;\n  text-align: center;\n  margin: 0;\n  min-width: 88px;\n  line-height: 36px;\n  padding: 0 16px;\n  border-radius: 2px; }\n  [disabled].mat-raised-button, [disabled].mat-fab, [disabled].mat-mini-fab, [disabled].mat-button, [disabled].mat-icon-button {\n    cursor: default; }\n  .cdk-keyboard-focused.mat-raised-button .mat-button-focus-overlay, .cdk-keyboard-focused.mat-fab .mat-button-focus-overlay, .cdk-keyboard-focused.mat-mini-fab .mat-button-focus-overlay, .cdk-keyboard-focused.mat-button .mat-button-focus-overlay, .cdk-keyboard-focused.mat-icon-button .mat-button-focus-overlay, .cdk-program-focused.mat-raised-button .mat-button-focus-overlay, .cdk-program-focused.mat-fab .mat-button-focus-overlay, .cdk-program-focused.mat-mini-fab .mat-button-focus-overlay, .cdk-program-focused.mat-button .mat-button-focus-overlay, .cdk-program-focused.mat-icon-button .mat-button-focus-overlay {\n    opacity: 1; }\n  .mat-raised-button::-moz-focus-inner, .mat-fab::-moz-focus-inner, .mat-mini-fab::-moz-focus-inner, .mat-button::-moz-focus-inner, .mat-icon-button::-moz-focus-inner {\n    border: 0; }\n\n.mat-raised-button, .mat-fab, .mat-mini-fab {\n  -webkit-transform: translate3d(0, 0, 0);\n          transform: translate3d(0, 0, 0);\n  transition: background 400ms cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1); }\n  .mat-raised-button:not([class*='mat-elevation-z']), .mat-fab:not([class*='mat-elevation-z']), .mat-mini-fab:not([class*='mat-elevation-z']) {\n    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12); }\n  .mat-raised-button:not([disabled]):active:not([class*='mat-elevation-z']), .mat-fab:not([disabled]):active:not([class*='mat-elevation-z']), .mat-mini-fab:not([disabled]):active:not([class*='mat-elevation-z']) {\n    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12); }\n  [disabled].mat-raised-button, [disabled].mat-fab, [disabled].mat-mini-fab {\n    box-shadow: none; }\n\n/**\n * Applies styles for users in high contrast mode. Note that this only applies\n * to Microsoft browsers. Chrome can be included by checking for the `html[hc]`\n * attribute, however Chrome handles high contrast differently.\n */\n.mat-button .mat-button-focus-overlay, .mat-icon-button .mat-button-focus-overlay {\n  transition: none;\n  opacity: 0; }\n\n.mat-button:hover .mat-button-focus-overlay {\n  opacity: 1; }\n\n.mat-fab {\n  min-width: 0;\n  border-radius: 50%;\n  width: 56px;\n  height: 56px;\n  padding: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0; }\n  .mat-fab:not([class*='mat-elevation-z']) {\n    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12); }\n  .mat-fab:not([disabled]):active:not([class*='mat-elevation-z']) {\n    box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12); }\n  .mat-fab .mat-button-wrapper {\n    padding: 16px 0;\n    display: inline-block;\n    line-height: 24px; }\n\n.mat-mini-fab {\n  min-width: 0;\n  border-radius: 50%;\n  width: 40px;\n  height: 40px;\n  padding: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0; }\n  .mat-mini-fab:not([class*='mat-elevation-z']) {\n    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12); }\n  .mat-mini-fab:not([disabled]):active:not([class*='mat-elevation-z']) {\n    box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12); }\n  .mat-mini-fab .mat-button-wrapper {\n    padding: 8px 0;\n    display: inline-block;\n    line-height: 24px; }\n\n.mat-icon-button {\n  padding: 0;\n  min-width: 0;\n  width: 40px;\n  height: 40px;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  line-height: 40px;\n  border-radius: 50%; }\n  .mat-icon-button i, .mat-icon-button .mat-icon {\n    line-height: 24px; }\n\n.mat-button, .mat-raised-button, .mat-icon-button {\n  color: currentColor; }\n  .mat-button .mat-button-wrapper > *, .mat-raised-button .mat-button-wrapper > *, .mat-icon-button .mat-button-wrapper > * {\n    vertical-align: middle; }\n\n.mat-button-ripple, .mat-button-focus-overlay {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  pointer-events: none; }\n\n.mat-button-focus-overlay {\n  background-color: rgba(0, 0, 0, 0.12);\n  border-radius: inherit;\n  opacity: 0;\n  transition: opacity 200ms cubic-bezier(0.35, 0, 0.25, 1), background-color 200ms cubic-bezier(0.35, 0, 0.25, 1); }\n  @media screen and (-ms-high-contrast: active) {\n    .mat-button-focus-overlay {\n      background-color: rgba(255, 255, 255, 0.5); } }\n\n.mat-button-ripple-round {\n  border-radius: 50%;\n  z-index: 1; }\n\n@media screen and (-ms-high-contrast: active) {\n  .mat-button, .mat-raised-button, .mat-icon-button, .mat-fab, .mat-mini-fab {\n    outline: solid 1px; } }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/components/button/button.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_cdk_platform__ = __webpack_require__("./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material_core__ = __webpack_require__("./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__ = __webpack_require__("./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return MatButtonCssMatStyler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return MatRaisedButtonCssMatStyler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return MatIconButtonCssMatStyler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return MatFab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return MatMiniFab; });
/* unused harmony export MatButtonBase */
/* unused harmony export _MatButtonMixinBase */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatButton; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return MatAnchor; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};




// TODO(kara): Convert attribute selectors to classes when attr maps become available
/** Default color palette for round buttons (mat-fab and mat-mini-fab) */
var DEFAULT_ROUND_BUTTON_COLOR = 'accent';
/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
var MatButtonCssMatStyler = (function () {
    function MatButtonCssMatStyler() {
    }
    return MatButtonCssMatStyler;
}());
MatButtonCssMatStyler = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'button[mat-button], a[mat-button]',
        host: { 'class': 'mat-button' }
    })
], MatButtonCssMatStyler);

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
var MatRaisedButtonCssMatStyler = (function () {
    function MatRaisedButtonCssMatStyler() {
    }
    return MatRaisedButtonCssMatStyler;
}());
MatRaisedButtonCssMatStyler = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'button[mat-raised-button], a[mat-raised-button]',
        host: { 'class': 'mat-raised-button' }
    })
], MatRaisedButtonCssMatStyler);

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
var MatIconButtonCssMatStyler = (function () {
    function MatIconButtonCssMatStyler() {
    }
    return MatIconButtonCssMatStyler;
}());
MatIconButtonCssMatStyler = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'button[mat-icon-button], a[mat-icon-button]',
        host: { 'class': 'mat-icon-button' }
    })
], MatIconButtonCssMatStyler);

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
var MatFab = (function () {
    function MatFab(button, anchor) {
        // Set the default color palette for the mat-fab components.
        (button || anchor).color = DEFAULT_ROUND_BUTTON_COLOR;
    }
    return MatFab;
}());
MatFab = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'button[mat-fab], a[mat-fab]',
        host: { 'class': 'mat-fab' }
    }),
    __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* Self */])()), __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Optional */])()), __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["f" /* Inject */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_15" /* forwardRef */])(function () { return MatButton; }))),
    __param(1, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* Self */])()), __param(1, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Optional */])()), __param(1, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["f" /* Inject */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_15" /* forwardRef */])(function () { return MatAnchor; }))),
    __metadata("design:paramtypes", [MatButton,
        MatAnchor])
], MatFab);

/**
 * Directive that targets mini-fab buttons and anchors. It's used to apply the `mat-` class
 * to all mini-fab buttons and also is responsible for setting the default color palette.
 * @docs-private
 */
var MatMiniFab = (function () {
    function MatMiniFab(button, anchor) {
        // Set the default color palette for the mat-mini-fab components.
        (button || anchor).color = DEFAULT_ROUND_BUTTON_COLOR;
    }
    return MatMiniFab;
}());
MatMiniFab = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'button[mat-mini-fab], a[mat-mini-fab]',
        host: { 'class': 'mat-mini-fab' }
    }),
    __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* Self */])()), __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Optional */])()), __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["f" /* Inject */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_15" /* forwardRef */])(function () { return MatButton; }))),
    __param(1, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* Self */])()), __param(1, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Optional */])()), __param(1, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["f" /* Inject */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_15" /* forwardRef */])(function () { return MatAnchor; }))),
    __metadata("design:paramtypes", [MatButton,
        MatAnchor])
], MatMiniFab);

// Boilerplate for applying mixins to MatButton.
/** @docs-private */
var MatButtonBase = (function () {
    function MatButtonBase(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
    }
    return MatButtonBase;
}());

var _MatButtonMixinBase = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_material_core__["e" /* mixinColor */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_material_core__["d" /* mixinDisabled */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_material_core__["f" /* mixinDisableRipple */])(MatButtonBase)));
/**
 * Material design button.
 */
var MatButton = (function (_super) {
    __extends(MatButton, _super);
    function MatButton(renderer, elementRef, _platform, _focusMonitor) {
        var _this = _super.call(this, renderer, elementRef) || this;
        _this._platform = _platform;
        _this._focusMonitor = _focusMonitor;
        /** Whether the button is round. */
        _this._isRoundButton = _this._hasAttributeWithPrefix('fab', 'mini-fab');
        /** Whether the button is icon button. */
        _this._isIconButton = _this._hasAttributeWithPrefix('icon-button');
        _this._focusMonitor.monitor(_this._elementRef.nativeElement, _this._renderer, true);
        return _this;
    }
    MatButton.prototype.ngOnDestroy = function () {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    };
    /** Focuses the button. */
    MatButton.prototype.focus = function () {
        this._getHostElement().focus();
    };
    MatButton.prototype._getHostElement = function () {
        return this._elementRef.nativeElement;
    };
    MatButton.prototype._isRippleDisabled = function () {
        return this.disableRipple || this.disabled;
    };
    /** Gets whether the button has one of the given attributes with a 'mat-' prefix. */
    MatButton.prototype._hasAttributeWithPrefix = function () {
        var _this = this;
        var unprefixedAttributeNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            unprefixedAttributeNames[_i] = arguments[_i];
        }
        // If not on the browser, say that there are none of the attributes present.
        // Since these only affect how the ripple displays (and ripples only happen on the client),
        // detecting these attributes isn't necessary when not on the browser.
        if (!this._platform.isBrowser) {
            return false;
        }
        return unprefixedAttributeNames.some(function (suffix) {
            return _this._getHostElement().hasAttribute('mat-' + suffix);
        });
    };
    return MatButton;
}(_MatButtonMixinBase));
MatButton = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],\n             button[mat-fab], button[mat-mini-fab]",
        exportAs: 'matButton',
        host: {
            '[disabled]': 'disabled || null',
        },
        template: __webpack_require__("./src/app/components/button/button.html"),
        styles: [__webpack_require__("./src/app/components/button/button.scss")],
        inputs: ['disabled', 'disableRipple', 'color'],
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None,
        preserveWhitespaces: false,
        changeDetection: __WEBPACK_IMPORTED_MODULE_0__angular_core__["_12" /* ChangeDetectionStrategy */].OnPush,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_cdk_platform__["b" /* Platform */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_cdk_platform__["b" /* Platform */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__["d" /* FocusMonitor */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__["d" /* FocusMonitor */]) === "function" && _d || Object])
], MatButton);

/**
 * Raised Material design button.
 */
var MatAnchor = (function (_super) {
    __extends(MatAnchor, _super);
    function MatAnchor(platform, focusMonitor, elementRef, renderer) {
        return _super.call(this, renderer, elementRef, platform, focusMonitor) || this;
    }
    MatAnchor.prototype._haltDisabledEvents = function (event) {
        // A disabled button shouldn't apply any actions
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    return MatAnchor;
}(MatButton));
MatAnchor = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: "a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab], a[mat-mini-fab]",
        exportAs: 'matButton, matAnchor',
        host: {
            '[attr.tabindex]': 'disabled ? -1 : 0',
            '[attr.disabled]': 'disabled || null',
            '[attr.aria-disabled]': 'disabled.toString()',
            '(click)': '_haltDisabledEvents($event)',
        },
        inputs: ['disabled', 'disableRipple', 'color'],
        template: __webpack_require__("./src/app/components/button/button.html"),
        styles: [__webpack_require__("./src/app/components/button/button.scss")],
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None,
        preserveWhitespaces: false,
        changeDetection: __WEBPACK_IMPORTED_MODULE_0__angular_core__["_12" /* ChangeDetectionStrategy */].OnPush,
    }),
    __metadata("design:paramtypes", [typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_1__angular_cdk_platform__["b" /* Platform */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_cdk_platform__["b" /* Platform */]) === "function" && _e || Object, typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__["d" /* FocusMonitor */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__["d" /* FocusMonitor */]) === "function" && _f || Object, typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _g || Object, typeof (_h = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */]) === "function" && _h || Object])
], MatAnchor);

var _a, _b, _c, _d, _e, _f, _g, _h;
//# sourceMappingURL=button.js.map

/***/ }),

/***/ "./src/app/components/button/index.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__public_api__ = __webpack_require__("./src/app/components/button/public-api.ts");
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__public_api__["a"]; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./src/app/components/button/public-api.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__button_module__ = __webpack_require__("./src/app/components/button/button-module.ts");
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__button_module__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__button__ = __webpack_require__("./src/app/components/button/button.ts");
/* unused harmony namespace reexport */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


//# sourceMappingURL=public-api.js.map

/***/ }),

/***/ "./src/app/components/icon/icon-module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material_core__ = __webpack_require__("./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icon__ = __webpack_require__("./src/app/components/icon/icon.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__icon_registry__ = __webpack_require__("./src/app/components/icon/icon-registry.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatIconModule; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var MatIconModule = (function () {
    function MatIconModule() {
    }
    return MatIconModule;
}());
MatIconModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_material_core__["c" /* MatCommonModule */]],
        exports: [__WEBPACK_IMPORTED_MODULE_2__icon__["a" /* MatIcon */], __WEBPACK_IMPORTED_MODULE_1__angular_material_core__["c" /* MatCommonModule */]],
        declarations: [__WEBPACK_IMPORTED_MODULE_2__icon__["a" /* MatIcon */]],
        providers: [__WEBPACK_IMPORTED_MODULE_3__icon_registry__["b" /* ICON_REGISTRY_PROVIDER */]],
    })
], MatIconModule);

//# sourceMappingURL=icon-module.js.map

/***/ }),

/***/ "./src/app/components/icon/icon-registry.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__ = __webpack_require__("./node_modules/@angular/cdk/esm5/rxjs.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_observable_forkJoin__ = __webpack_require__("./node_modules/rxjs/observable/forkJoin.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_observable_forkJoin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_observable_forkJoin__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of__ = __webpack_require__("./node_modules/rxjs/observable/of.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_observable_throw__ = __webpack_require__("./node_modules/rxjs/observable/throw.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_observable_throw___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rxjs_observable_throw__);
/* unused harmony export getMatIconNameNotFoundError */
/* unused harmony export getMatIconNoHttpProviderError */
/* unused harmony export getMatIconFailedToSanitizeError */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatIconRegistry; });
/* unused harmony export ICON_REGISTRY_PROVIDER_FACTORY */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ICON_REGISTRY_PROVIDER; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};








/**
 * Returns an exception to be thrown in the case when attempting to
 * load an icon with a name that cannot be found.
 * @docs-private
 */
function getMatIconNameNotFoundError(iconName) {
    return Error("Unable to find icon with the name \"" + iconName + "\"");
}
/**
 * Returns an exception to be thrown when the consumer attempts to use
 * `<mat-icon>` without including @angular/http.
 * @docs-private
 */
function getMatIconNoHttpProviderError() {
    return Error('Could not find Http provider for use with Angular Material icons. ' +
        'Please include the HttpModule from @angular/http in your app imports.');
}
/**
 * Returns an exception to be thrown when a URL couldn't be sanitized.
 * @param url URL that was attempted to be sanitized.
 * @docs-private
 */
function getMatIconFailedToSanitizeError(url) {
    return Error("The URL provided to MatIconRegistry was not trusted as a resource URL " +
        ("via Angular's DomSanitizer. Attempted URL was \"" + url + "\"."));
}
/**
 * Configuration for an icon, including the URL and possibly the cached SVG element.
 * @docs-private
 */
var SvgIconConfig = (function () {
    function SvgIconConfig(url) {
        this.url = url;
        this.svgElement = null;
    }
    return SvgIconConfig;
}());
/**
 * Service to register and display icons used by the <mat-icon> component.
 * - Registers icon URLs by namespace and name.
 * - Registers icon set URLs by namespace.
 * - Registers aliases for CSS classes, for use with icon fonts.
 * - Loads icons from URLs and extracts individual icons from icon sets.
 */
var MatIconRegistry = (function () {
    function MatIconRegistry(_http, _sanitizer) {
        this._http = _http;
        this._sanitizer = _sanitizer;
        /**
         * URLs and cached SVG elements for individual icons. Keys are of the format "[namespace]:[icon]".
         */
        this._svgIconConfigs = new Map();
        /**
         * SvgIconConfig objects and cached SVG elements for icon sets, keyed by namespace.
         * Multiple icon sets can be registered under the same namespace.
         */
        this._iconSetConfigs = new Map();
        /** Cache for icons loaded by direct URLs. */
        this._cachedIconsByUrl = new Map();
        /** In-progress icon fetches. Used to coalesce multiple requests to the same URL. */
        this._inProgressUrlFetches = new Map();
        /** Map from font identifiers to their CSS class names. Used for icon fonts. */
        this._fontCssClassesByAlias = new Map();
        /**
         * The CSS class to apply when an <mat-icon> component has no icon name, url, or font specified.
         * The default 'material-icons' value assumes that the material icon font has been loaded as
         * described at http://google.github.io/material-design-icons/#icon-font-for-the-web
         */
        this._defaultFontSetClass = 'material-icons';
    }
    /**
     * Registers an icon by URL in the default namespace.
     * @param iconName Name under which the icon should be registered.
     * @param url
     */
    MatIconRegistry.prototype.addSvgIcon = function (iconName, url) {
        return this.addSvgIconInNamespace('', iconName, url);
    };
    /**
     * Registers an icon by URL in the specified namespace.
     * @param namespace Namespace in which the icon should be registered.
     * @param iconName Name under which the icon should be registered.
     * @param url
     */
    MatIconRegistry.prototype.addSvgIconInNamespace = function (namespace, iconName, url) {
        var key = iconKey(namespace, iconName);
        this._svgIconConfigs.set(key, new SvgIconConfig(url));
        return this;
    };
    /**
     * Registers an icon set by URL in the default namespace.
     * @param url
     */
    MatIconRegistry.prototype.addSvgIconSet = function (url) {
        return this.addSvgIconSetInNamespace('', url);
    };
    /**
     * Registers an icon set by URL in the specified namespace.
     * @param namespace Namespace in which to register the icon set.
     * @param url
     */
    MatIconRegistry.prototype.addSvgIconSetInNamespace = function (namespace, url) {
        var config = new SvgIconConfig(url);
        var configNamespace = this._iconSetConfigs.get(namespace);
        if (configNamespace) {
            configNamespace.push(config);
        }
        else {
            this._iconSetConfigs.set(namespace, [config]);
        }
        return this;
    };
    /**
     * Defines an alias for a CSS class name to be used for icon fonts. Creating an matIcon
     * component with the alias as the fontSet input will cause the class name to be applied
     * to the <mat-icon> element.
     *
     * @param alias Alias for the font.
     * @param className Class name override to be used instead of the alias.
     */
    MatIconRegistry.prototype.registerFontClassAlias = function (alias, className) {
        if (className === void 0) { className = alias; }
        this._fontCssClassesByAlias.set(alias, className);
        return this;
    };
    /**
     * Returns the CSS class name associated with the alias by a previous call to
     * registerFontClassAlias. If no CSS class has been associated, returns the alias unmodified.
     */
    MatIconRegistry.prototype.classNameForFontAlias = function (alias) {
        return this._fontCssClassesByAlias.get(alias) || alias;
    };
    /**
     * Sets the CSS class name to be used for icon fonts when an <mat-icon> component does not
     * have a fontSet input value, and is not loading an icon by name or URL.
     *
     * @param className
     */
    MatIconRegistry.prototype.setDefaultFontSetClass = function (className) {
        this._defaultFontSetClass = className;
        return this;
    };
    /**
     * Returns the CSS class name to be used for icon fonts when an <mat-icon> component does not
     * have a fontSet input value, and is not loading an icon by name or URL.
     */
    MatIconRegistry.prototype.getDefaultFontSetClass = function () {
        return this._defaultFontSetClass;
    };
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) from the given URL.
     * The response from the URL may be cached so this will not always cause an HTTP request, but
     * the produced element will always be a new copy of the originally fetched icon. (That is,
     * it will not contain any modifications made to elements previously returned).
     *
     * @param safeUrl URL from which to fetch the SVG icon.
     */
    MatIconRegistry.prototype.getSvgIconFromUrl = function (safeUrl) {
        var _this = this;
        var url = this._sanitizer.sanitize(__WEBPACK_IMPORTED_MODULE_1__angular_core__["t" /* SecurityContext */].RESOURCE_URL, safeUrl);
        if (!url) {
            throw getMatIconFailedToSanitizeError(safeUrl);
        }
        var cachedIcon = this._cachedIconsByUrl.get(url);
        if (cachedIcon) {
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of__["of"])(cloneSvg(cachedIcon));
        }
        return __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["a" /* RxChain */].from(this._loadSvgIconFromConfig(new SvgIconConfig(safeUrl)))
            .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["c" /* doOperator */], function (svg) { return _this._cachedIconsByUrl.set(url, svg); })
            .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["e" /* map */], function (svg) { return cloneSvg(svg); })
            .result();
    };
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) with the given name
     * and namespace. The icon must have been previously registered with addIcon or addIconSet;
     * if not, the Observable will throw an error.
     *
     * @param name Name of the icon to be retrieved.
     * @param namespace Namespace in which to look for the icon.
     */
    MatIconRegistry.prototype.getNamedSvgIcon = function (name, namespace) {
        if (namespace === void 0) { namespace = ''; }
        // Return (copy of) cached icon if possible.
        var key = iconKey(namespace, name);
        var config = this._svgIconConfigs.get(key);
        if (config) {
            return this._getSvgFromConfig(config);
        }
        // See if we have any icon sets registered for the namespace.
        var iconSetConfigs = this._iconSetConfigs.get(namespace);
        if (iconSetConfigs) {
            return this._getSvgFromIconSetConfigs(name, iconSetConfigs);
        }
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7_rxjs_observable_throw__["_throw"])(getMatIconNameNotFoundError(key));
    };
    /**
     * Returns the cached icon for a SvgIconConfig if available, or fetches it from its URL if not.
     */
    MatIconRegistry.prototype._getSvgFromConfig = function (config) {
        if (config.svgElement) {
            // We already have the SVG element for this icon, return a copy.
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of__["of"])(cloneSvg(config.svgElement));
        }
        else {
            // Fetch the icon from the config's URL, cache it, and return a copy.
            return __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["a" /* RxChain */].from(this._loadSvgIconFromConfig(config))
                .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["c" /* doOperator */], function (svg) { return config.svgElement = svg; })
                .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["e" /* map */], function (svg) { return cloneSvg(svg); })
                .result();
        }
    };
    /**
     * Attempts to find an icon with the specified name in any of the SVG icon sets.
     * First searches the available cached icons for a nested element with a matching name, and
     * if found copies the element to a new <svg> element. If not found, fetches all icon sets
     * that have not been cached, and searches again after all fetches are completed.
     * The returned Observable produces the SVG element if possible, and throws
     * an error if no icon with the specified name can be found.
     */
    MatIconRegistry.prototype._getSvgFromIconSetConfigs = function (name, iconSetConfigs) {
        var _this = this;
        // For all the icon set SVG elements we've fetched, see if any contain an icon with the
        // requested name.
        var namedIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);
        if (namedIcon) {
            // We could cache namedIcon in _svgIconConfigs, but since we have to make a copy every
            // time anyway, there's probably not much advantage compared to just always extracting
            // it from the icon set.
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of__["of"])(namedIcon);
        }
        // Not found in any cached icon sets. If there are icon sets with URLs that we haven't
        // fetched, fetch them now and look for iconName in the results.
        var iconSetFetchRequests = iconSetConfigs
            .filter(function (iconSetConfig) { return !iconSetConfig.svgElement; })
            .map(function (iconSetConfig) {
            return __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["a" /* RxChain */].from(_this._loadSvgIconSetFromConfig(iconSetConfig))
                .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["i" /* catchOperator */], function (err) {
                var url = _this._sanitizer.sanitize(__WEBPACK_IMPORTED_MODULE_1__angular_core__["t" /* SecurityContext */].RESOURCE_URL, iconSetConfig.url);
                // Swallow errors fetching individual URLs so the combined Observable won't
                // necessarily fail.
                console.log("Loading icon set URL: " + url + " failed: " + err);
                return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_rxjs_observable_of__["of"])(null);
            })
                .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["c" /* doOperator */], function (svg) {
                // Cache the SVG element.
                if (svg) {
                    iconSetConfig.svgElement = svg;
                }
            })
                .result();
        });
        // Fetch all the icon set URLs. When the requests complete, every IconSet should have a
        // cached SVG element (unless the request failed), and we can check again for the icon.
        return __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["e" /* map */].call(__WEBPACK_IMPORTED_MODULE_5_rxjs_observable_forkJoin__["forkJoin"].call(__WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["Observable"], iconSetFetchRequests), function () {
            var foundIcon = _this._extractIconWithNameFromAnySet(name, iconSetConfigs);
            if (!foundIcon) {
                throw getMatIconNameNotFoundError(name);
            }
            return foundIcon;
        });
    };
    /**
     * Searches the cached SVG elements for the given icon sets for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     */
    MatIconRegistry.prototype._extractIconWithNameFromAnySet = function (iconName, iconSetConfigs) {
        // Iterate backwards, so icon sets added later have precedence.
        for (var i = iconSetConfigs.length - 1; i >= 0; i--) {
            var config = iconSetConfigs[i];
            if (config.svgElement) {
                var foundIcon = this._extractSvgIconFromSet(config.svgElement, iconName);
                if (foundIcon) {
                    return foundIcon;
                }
            }
        }
        return null;
    };
    /**
     * Loads the content of the icon URL specified in the SvgIconConfig and creates an SVG element
     * from it.
     */
    MatIconRegistry.prototype._loadSvgIconFromConfig = function (config) {
        var _this = this;
        return __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["e" /* map */].call(this._fetchUrl(config.url), function (svgText) { return _this._createSvgElementForSingleIcon(svgText); });
    };
    /**
     * Loads the content of the icon set URL specified in the SvgIconConfig and creates an SVG element
     * from it.
     */
    MatIconRegistry.prototype._loadSvgIconSetFromConfig = function (config) {
        var _this = this;
        // TODO: Document that icons should only be loaded from trusted sources.
        return __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["e" /* map */].call(this._fetchUrl(config.url), function (svgText) { return _this._svgElementFromString(svgText); });
    };
    /**
     * Creates a DOM element from the given SVG string, and adds default attributes.
     */
    MatIconRegistry.prototype._createSvgElementForSingleIcon = function (responseText) {
        var svg = this._svgElementFromString(responseText);
        this._setSvgAttributes(svg);
        return svg;
    };
    /**
     * Searches the cached element of the given SvgIconConfig for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     */
    MatIconRegistry.prototype._extractSvgIconFromSet = function (iconSet, iconName) {
        var iconNode = iconSet.querySelector('#' + iconName);
        if (!iconNode) {
            return null;
        }
        // If the icon node is itself an <svg> node, clone and return it directly. If not, set it as
        // the content of a new <svg> node.
        if (iconNode.tagName.toLowerCase() === 'svg') {
            return this._setSvgAttributes(iconNode.cloneNode(true));
        }
        // If the node is a <symbol>, it won't be rendered so we have to convert it into <svg>. Note
        // that the same could be achieved by referring to it via <use href="#id">, however the <use>
        // tag is problematic on Firefox, because it needs to include the current page path.
        if (iconNode.nodeName.toLowerCase() === 'symbol') {
            return this._setSvgAttributes(this._toSvgElement(iconNode));
        }
        // createElement('SVG') doesn't work as expected; the DOM ends up with
        // the correct nodes, but the SVG content doesn't render. Instead we
        // have to create an empty SVG node using innerHTML and append its content.
        // Elements created using DOMParser.parseFromString have the same problem.
        // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
        var svg = this._svgElementFromString('<svg></svg>');
        // Clone the node so we don't remove it from the parent icon set element.
        svg.appendChild(iconNode.cloneNode(true));
        return this._setSvgAttributes(svg);
    };
    /**
     * Creates a DOM element from the given SVG string.
     */
    MatIconRegistry.prototype._svgElementFromString = function (str) {
        // TODO: Is there a better way than innerHTML? Renderer doesn't appear to have a method for
        // creating an element from an HTML string.
        var div = document.createElement('DIV');
        div.innerHTML = str;
        var svg = div.querySelector('svg');
        if (!svg) {
            throw Error('<svg> tag not found');
        }
        return svg;
    };
    /**
     * Converts an element into an SVG node by cloning all of its children.
     */
    MatIconRegistry.prototype._toSvgElement = function (element) {
        var svg = this._svgElementFromString('<svg></svg>');
        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].nodeType === Node.ELEMENT_NODE) {
                svg.appendChild(element.childNodes[i].cloneNode(true));
            }
        }
        return svg;
    };
    /**
     * Sets the default attributes for an SVG element to be used as an icon.
     */
    MatIconRegistry.prototype._setSvgAttributes = function (svg) {
        if (!svg.getAttribute('xmlns')) {
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        svg.setAttribute('fit', '');
        svg.setAttribute('height', '100%');
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.
        return svg;
    };
    /**
     * Returns an Observable which produces the string contents of the given URL. Results may be
     * cached, so future calls with the same URL may not cause another HTTP request.
     */
    MatIconRegistry.prototype._fetchUrl = function (safeUrl) {
        var _this = this;
        if (!this._http) {
            throw getMatIconNoHttpProviderError();
        }
        var url = this._sanitizer.sanitize(__WEBPACK_IMPORTED_MODULE_1__angular_core__["t" /* SecurityContext */].RESOURCE_URL, safeUrl);
        if (!url) {
            throw getMatIconFailedToSanitizeError(safeUrl);
        }
        // Store in-progress fetches to avoid sending a duplicate request for a URL when there is
        // already a request in progress for that URL. It's necessary to call share() on the
        // Observable returned by http.get() so that multiple subscribers don't cause multiple XHRs.
        var inProgressFetch = this._inProgressUrlFetches.get(url);
        if (inProgressFetch) {
            return inProgressFetch;
        }
        // TODO(jelbourn): for some reason, the `finally` operator "loses" the generic type on the
        // Observable. Figure out why and fix it.
        var req = __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["a" /* RxChain */].from(this._http.get(url))
            .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["e" /* map */], function (response) { return response.text(); })
            .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["j" /* finallyOperator */], function () { return _this._inProgressUrlFetches.delete(url); })
            .call(__WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["k" /* share */])
            .result();
        this._inProgressUrlFetches.set(url, req);
        return req;
    };
    return MatIconRegistry;
}());
MatIconRegistry = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["c" /* Injectable */])(),
    __param(0, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["o" /* Optional */])()),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["e" /* DomSanitizer */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["e" /* DomSanitizer */]) === "function" && _b || Object])
], MatIconRegistry);

/** @docs-private */
function ICON_REGISTRY_PROVIDER_FACTORY(parentRegistry, http, sanitizer) {
    return parentRegistry || new MatIconRegistry(http, sanitizer);
}
/** @docs-private */
var ICON_REGISTRY_PROVIDER = {
    // If there is already an MatIconRegistry available, use that. Otherwise, provide a new one.
    provide: MatIconRegistry,
    deps: [[new __WEBPACK_IMPORTED_MODULE_1__angular_core__["o" /* Optional */](), new __WEBPACK_IMPORTED_MODULE_1__angular_core__["E" /* SkipSelf */](), MatIconRegistry], [new __WEBPACK_IMPORTED_MODULE_1__angular_core__["o" /* Optional */](), __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */]], __WEBPACK_IMPORTED_MODULE_3__angular_platform_browser__["e" /* DomSanitizer */]],
    useFactory: ICON_REGISTRY_PROVIDER_FACTORY
};
/** Clones an SVGElement while preserving type information. */
function cloneSvg(svg) {
    return svg.cloneNode(true);
}
/** Returns the cache key to use for an icon namespace and name. */
function iconKey(namespace, name) {
    return namespace + ':' + name;
}
var _a, _b;
//# sourceMappingURL=icon-registry.js.map

/***/ }),

/***/ "./src/app/components/icon/icon.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".mat-icon {\n  background-repeat: no-repeat;\n  display: inline-block;\n  fill: currentColor;\n  height: 24px;\n  width: 24px; }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/components/icon/icon.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__ = __webpack_require__("./node_modules/@angular/cdk/esm5/rxjs.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material_core__ = __webpack_require__("./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__icon_registry__ = __webpack_require__("./src/app/components/icon/icon-registry.ts");
/* unused harmony export MatIconBase */
/* unused harmony export _MatIconMixinBase */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatIcon; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};




// Boilerplate for applying mixins to MatIcon.
/** @docs-private */
var MatIconBase = (function () {
    function MatIconBase(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
    }
    return MatIconBase;
}());

var _MatIconMixinBase = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_material_core__["e" /* mixinColor */])(MatIconBase);
/**
 * Component to display an icon. It can be used in the following ways:
 *
 * - Specify the svgIcon input to load an SVG icon from a URL previously registered with the
 *   addSvgIcon, addSvgIconInNamespace, addSvgIconSet, or addSvgIconSetInNamespace methods of
 *   MatIconRegistry. If the svgIcon value contains a colon it is assumed to be in the format
 *   "[namespace]:[name]", if not the value will be the name of an icon in the default namespace.
 *   Examples:
 *     <mat-icon svgIcon="left-arrow"></mat-icon>
 *     <mat-icon svgIcon="animals:cat"></mat-icon>
 *
 * - Use a font ligature as an icon by putting the ligature text in the content of the <mat-icon>
 *   component. By default the Material icons font is used as described at
 *   http://google.github.io/material-design-icons/#icon-font-for-the-web. You can specify an
 *   alternate font by setting the fontSet input to either the CSS class to apply to use the
 *   desired font, or to an alias previously registered with MatIconRegistry.registerFontClassAlias.
 *   Examples:
 *     <mat-icon>home</mat-icon>
 *     <mat-icon fontSet="myfont">sun</mat-icon>
 *
 * - Specify a font glyph to be included via CSS rules by setting the fontSet input to specify the
 *   font, and the fontIcon input to specify the icon. Typically the fontIcon will specify a
 *   CSS class which causes the glyph to be displayed via a :before selector, as in
 *   https://fortawesome.github.io/Font-Awesome/examples/
 *   Example:
 *     <mat-icon fontSet="fa" fontIcon="alarm"></mat-icon>
 */
var MatIcon = (function (_super) {
    __extends(MatIcon, _super);
    function MatIcon(renderer, elementRef, _iconRegistry, ariaHidden) {
        var _this = _super.call(this, renderer, elementRef) || this;
        _this._iconRegistry = _iconRegistry;
        // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
        // the right thing to do for the majority of icon use-cases.
        if (!ariaHidden) {
            renderer.setAttribute(elementRef.nativeElement, 'aria-hidden', 'true');
        }
        return _this;
    }
    /**
     * Splits an svgIcon binding value into its icon set and icon name components.
     * Returns a 2-element array of [(icon set), (icon name)].
     * The separator for the two fields is ':'. If there is no separator, an empty
     * string is returned for the icon set and the entire value is returned for
     * the icon name. If the argument is falsy, returns an array of two empty strings.
     * Throws an error if the name contains two or more ':' separators.
     * Examples:
     *   'social:cake' -> ['social', 'cake']
     *   'penguin' -> ['', 'penguin']
     *   null -> ['', '']
     *   'a:b:c' -> (throws Error)
     */
    MatIcon.prototype._splitIconName = function (iconName) {
        if (!iconName) {
            return ['', ''];
        }
        var parts = iconName.split(':');
        switch (parts.length) {
            case 1: return ['', parts[0]]; // Use default namespace.
            case 2: return parts;
            default: throw Error("Invalid icon name: \"" + iconName + "\"");
        }
    };
    MatIcon.prototype.ngOnChanges = function (changes) {
        var _this = this;
        // Only update the inline SVG icon if the inputs changed, to avoid unnecessary DOM operations.
        if (changes.svgIcon) {
            if (this.svgIcon) {
                var _a = this._splitIconName(this.svgIcon), namespace = _a[0], iconName = _a[1];
                __WEBPACK_IMPORTED_MODULE_0__angular_cdk_rxjs__["f" /* first */].call(this._iconRegistry.getNamedSvgIcon(iconName, namespace)).subscribe(function (svg) { return _this._setSvgElement(svg); }, function (err) { return console.log("Error retrieving icon: " + err.message); });
            }
            else {
                this._clearSvgElement();
            }
        }
        if (this._usingFontIcon()) {
            this._updateFontIconClasses();
        }
    };
    MatIcon.prototype.ngOnInit = function () {
        // Update font classes because ngOnChanges won't be called if none of the inputs are present,
        // e.g. <mat-icon>arrow</mat-icon> In this case we need to add a CSS class for the default font.
        if (this._usingFontIcon()) {
            this._updateFontIconClasses();
        }
    };
    MatIcon.prototype._usingFontIcon = function () {
        return !this.svgIcon;
    };
    MatIcon.prototype._setSvgElement = function (svg) {
        this._clearSvgElement();
        this._renderer.appendChild(this._elementRef.nativeElement, svg);
    };
    MatIcon.prototype._clearSvgElement = function () {
        var layoutElement = this._elementRef.nativeElement;
        var childCount = layoutElement.childNodes.length;
        // Remove existing child nodes and add the new SVG element. Note that we can't
        // use innerHTML, because IE will throw if the element has a data binding.
        for (var i = 0; i < childCount; i++) {
            this._renderer.removeChild(layoutElement, layoutElement.childNodes[i]);
        }
    };
    MatIcon.prototype._updateFontIconClasses = function () {
        if (!this._usingFontIcon()) {
            return;
        }
        var elem = this._elementRef.nativeElement;
        var fontSetClass = this.fontSet ?
            this._iconRegistry.classNameForFontAlias(this.fontSet) :
            this._iconRegistry.getDefaultFontSetClass();
        if (fontSetClass != this._previousFontSetClass) {
            if (this._previousFontSetClass) {
                this._renderer.removeClass(elem, this._previousFontSetClass);
            }
            if (fontSetClass) {
                this._renderer.addClass(elem, fontSetClass);
            }
            this._previousFontSetClass = fontSetClass;
        }
        if (this.fontIcon != this._previousFontIconClass) {
            if (this._previousFontIconClass) {
                this._renderer.removeClass(elem, this._previousFontIconClass);
            }
            if (this.fontIcon) {
                this._renderer.addClass(elem, this.fontIcon);
            }
            this._previousFontIconClass = this.fontIcon;
        }
    };
    return MatIcon;
}(_MatIconMixinBase));
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], MatIcon.prototype, "svgIcon", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], MatIcon.prototype, "fontSet", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["O" /* Input */])(),
    __metadata("design:type", String)
], MatIcon.prototype, "fontIcon", void 0);
MatIcon = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["_11" /* Component */])({
        template: '<ng-content></ng-content>',
        selector: 'mat-icon',
        exportAs: 'matIcon',
        styles: [__webpack_require__("./src/app/components/icon/icon.scss")],
        inputs: ['color'],
        host: {
            'role': 'img',
            'class': 'mat-icon',
        },
        encapsulation: __WEBPACK_IMPORTED_MODULE_1__angular_core__["q" /* ViewEncapsulation */].None,
        preserveWhitespaces: false,
        changeDetection: __WEBPACK_IMPORTED_MODULE_1__angular_core__["_12" /* ChangeDetectionStrategy */].OnPush,
    }),
    __param(3, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["U" /* Attribute */])('aria-hidden')),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_core__["_1" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_core__["_1" /* Renderer2 */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* ElementRef */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__icon_registry__["a" /* MatIconRegistry */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__icon_registry__["a" /* MatIconRegistry */]) === "function" && _c || Object, String])
], MatIcon);

var _a, _b, _c;
//# sourceMappingURL=icon.js.map

/***/ }),

/***/ "./src/app/components/icon/index.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__public_api__ = __webpack_require__("./src/app/components/icon/public-api.ts");
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__public_api__["a"]; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./src/app/components/icon/public-api.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__icon_module__ = __webpack_require__("./src/app/components/icon/icon-module.ts");
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__icon_module__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon__ = __webpack_require__("./src/app/components/icon/icon.ts");
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icon_registry__ = __webpack_require__("./src/app/components/icon/icon-registry.ts");
/* unused harmony namespace reexport */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



//# sourceMappingURL=public-api.js.map

/***/ }),

/***/ "./src/app/components/toolbar/index.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__public_api__ = __webpack_require__("./src/app/components/toolbar/public-api.ts");
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__public_api__["a"]; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./src/app/components/toolbar/public-api.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__toolbar_module__ = __webpack_require__("./src/app/components/toolbar/toolbar-module.ts");
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__toolbar_module__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__toolbar__ = __webpack_require__("./src/app/components/toolbar/toolbar.ts");
/* unused harmony namespace reexport */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


//# sourceMappingURL=public-api.js.map

/***/ }),

/***/ "./src/app/components/toolbar/toolbar-module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material_core__ = __webpack_require__("./node_modules/@angular/material/esm5/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__toolbar__ = __webpack_require__("./src/app/components/toolbar/toolbar.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatToolbarModule; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var MatToolbarModule = (function () {
    function MatToolbarModule() {
    }
    return MatToolbarModule;
}());
MatToolbarModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_material_core__["c" /* MatCommonModule */]],
        exports: [__WEBPACK_IMPORTED_MODULE_2__toolbar__["a" /* MatToolbar */], __WEBPACK_IMPORTED_MODULE_2__toolbar__["b" /* MatToolbarRow */], __WEBPACK_IMPORTED_MODULE_1__angular_material_core__["c" /* MatCommonModule */]],
        declarations: [__WEBPACK_IMPORTED_MODULE_2__toolbar__["a" /* MatToolbar */], __WEBPACK_IMPORTED_MODULE_2__toolbar__["b" /* MatToolbarRow */]],
    })
], MatToolbarModule);

//# sourceMappingURL=toolbar-module.js.map

/***/ }),

/***/ "./src/app/components/toolbar/toolbar.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"mat-toolbar-layout\">\n  <mat-toolbar-row>\n    <ng-content></ng-content>\n  </mat-toolbar-row>\n  <ng-content select=\"mat-toolbar-row\"></ng-content>\n</div>\n"

/***/ }),

/***/ "./src/app/components/toolbar/toolbar.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".mat-toolbar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  box-sizing: border-box;\n  width: 100%;\n  padding: 0 16px;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column; }\n  .mat-toolbar .mat-toolbar-row {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    box-sizing: border-box;\n    width: 100%;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    white-space: nowrap; }\n\n.mat-toolbar {\n  min-height: 64px; }\n\n.mat-toolbar-row {\n  height: 64px; }\n\n@media (max-width: 600px) {\n  .mat-toolbar {\n    min-height: 56px; }\n  .mat-toolbar-row {\n    height: 56px; } }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/components/toolbar/toolbar.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material_core__ = __webpack_require__("./node_modules/@angular/material/esm5/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return MatToolbarRow; });
/* unused harmony export MatToolbarBase */
/* unused harmony export _MatToolbarMixinBase */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatToolbar; });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var MatToolbarRow = (function () {
    function MatToolbarRow() {
    }
    return MatToolbarRow;
}());
MatToolbarRow = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["J" /* Directive */])({
        selector: 'mat-toolbar-row',
        exportAs: 'matToolbarRow',
        host: { 'class': 'mat-toolbar-row' },
    })
], MatToolbarRow);

// Boilerplate for applying mixins to MatToolbar.
/** @docs-private */
var MatToolbarBase = (function () {
    function MatToolbarBase(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
    }
    return MatToolbarBase;
}());

var _MatToolbarMixinBase = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_material_core__["e" /* mixinColor */])(MatToolbarBase);
var MatToolbar = (function (_super) {
    __extends(MatToolbar, _super);
    function MatToolbar(renderer, elementRef) {
        return _super.call(this, renderer, elementRef) || this;
    }
    return MatToolbar;
}(_MatToolbarMixinBase));
MatToolbar = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'mat-toolbar',
        exportAs: 'matToolbar',
        template: __webpack_require__("./src/app/components/toolbar/toolbar.html"),
        styles: [__webpack_require__("./src/app/components/toolbar/toolbar.scss")],
        inputs: ['color'],
        host: {
            'class': 'mat-toolbar',
            'role': 'toolbar'
        },
        changeDetection: __WEBPACK_IMPORTED_MODULE_0__angular_core__["_12" /* ChangeDetectionStrategy */].OnPush,
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None,
        preserveWhitespaces: false,
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _b || Object])
], MatToolbar);

var _a, _b;
//# sourceMappingURL=toolbar.js.map

/***/ }),

/***/ "./src/app/material-module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_cdk_table__ = __webpack_require__("./node_modules/@angular/cdk/esm5/table.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__ = __webpack_require__("./node_modules/@angular/cdk/esm5/a11y.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_cdk_bidi__ = __webpack_require__("./node_modules/@angular/cdk/esm5/bidi.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_cdk_overlay__ = __webpack_require__("./node_modules/@angular/cdk/esm5/overlay.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_cdk_platform__ = __webpack_require__("./node_modules/@angular/cdk/esm5/platform.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__angular_cdk_observers__ = __webpack_require__("./node_modules/@angular/cdk/esm5/observers.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__angular_cdk_portal__ = __webpack_require__("./node_modules/@angular/cdk/esm5/portal.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MaterialModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




// import {CdkAccordionModule} from '@angular/cdk/accordion';






/**
 * NgModule that includes all Material modules that are required to serve the demo-app.
 */
var MaterialModule = (function () {
    function MaterialModule() {
    }
    return MaterialModule;
}());
MaterialModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        exports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["a" /* MatAutocompleteModule */],
            // MatButtonModule,
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["b" /* MatButtonToggleModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["c" /* MatCardModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["d" /* MatCheckboxModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["e" /* MatChipsModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["f" /* MatTableModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MatDatepickerModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["h" /* MatDialogModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["i" /* MatExpansionModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["j" /* MatFormFieldModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["k" /* MatGridListModule */],
            // MatIconModule,
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["l" /* MatInputModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["m" /* MatListModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["n" /* MatMenuModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["o" /* MatPaginatorModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["p" /* MatProgressBarModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["q" /* MatProgressSpinnerModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["r" /* MatRadioModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["s" /* MatRippleModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["t" /* MatSelectModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["u" /* MatSidenavModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["v" /* MatSlideToggleModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["w" /* MatSliderModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["x" /* MatSnackBarModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["y" /* MatSortModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["z" /* MatStepperModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["A" /* MatTabsModule */],
            // MatToolbarModule,
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["B" /* MatTooltipModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_material__["C" /* MatNativeDateModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_cdk_table__["a" /* CdkTableModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_cdk_a11y__["a" /* A11yModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_cdk_bidi__["a" /* BidiModule */],
            // CdkAccordionModule,
            __WEBPACK_IMPORTED_MODULE_7__angular_cdk_observers__["a" /* ObserversModule */],
            __WEBPACK_IMPORTED_MODULE_5__angular_cdk_overlay__["a" /* OverlayModule */],
            __WEBPACK_IMPORTED_MODULE_6__angular_cdk_platform__["a" /* PlatformModule */],
            __WEBPACK_IMPORTED_MODULE_8__angular_cdk_portal__["a" /* PortalModule */],
        ]
    })
], MaterialModule);

//# sourceMappingURL=material-module.js.map

/***/ }),

/***/ "./src/app/pages/blog/blog-detail/blog-detail.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"blog-detail\">\n\n  <!-- 头部 -->\n  <header class='m-header mat-primary' #header>\n    <!-- top 条 -->\n    <div #topBar>\n      <mat-toolbar color=\"primary\" >\n\n        <button mat-icon-button class=\"m-menu\" (click)=\"goBack()\">\n          <mat-icon>arrow_back</mat-icon>\n        </button>\n\n        <div class=\"m-toolbar\">\n            <!-- <button mat-button> theme</button> -->\n<!--             <button mat-icon-button (click)=\"share()\" title=\"Toggle fullscreen\">\n              <mat-icon>share</mat-icon>\n            </button> -->\n<!--             <button mat-icon-button [matMenuTriggerFor]=\"menu\" aria-label=\"Open basic menu\">\n              <mat-icon>more_vert</mat-icon>\n            </button>\n            <mat-menu #menu=\"matMenu\">\n              <button mat-menu-item *ngFor=\"let item of items\" (click)=\"select(item.text)\" [disabled]=\"item.disabled\">\n                {{ item.text }}\n              </button>\n            </mat-menu> -->\n        </div>\n      </mat-toolbar>\n    </div>\n    <!-- middle 条 -->\n    <div #middleBar class=\"middleBar\">\n      {{blogDetail.title}}\n    </div>\n    <!-- bottom 条 -->\n    <div #bottomBar class=\"bottomBar\">\n      {{blogDetail.abstract}}\n    </div>\n  </header>\n\n  <div class=\"m-spinner\" *ngIf=\"spinner\">\n    <div class=\"spinner-crescent\">\n        <svg viewBox=\"0 0 64 64\">\n            <circle transform=\"translate(32,32)\" r=\"26\"></circle>\n        </svg>\n    </div>\n  </div>\n\n  <!-- 内容 -->\n  <article #article class=\"m-article\">\n\n  </article>\n\n\n\n  <!-- 底部 -->\n  <footer>\n    <div class='m-footer mat-primary'>\n      <a *ngIf=\"pre\" class=\"m-footer-section-left\" (click)=\"toPrevious()\">\n        <div class=\"direction\">previous</div>\n        <mat-icon>arrow_back</mat-icon>\n        <span>{{pre.title}}</span>\n      </a>\n      \n      <a *ngIf=\"next\" class=\"m-footer-section-right\" (click)=\"toNext()\">\n        <div class=\"direction\">next</div>\n        <span>{{next.title}}</span>\n        <mat-icon>arrow_forward</mat-icon>\n      </a>\n    </div>\n  </footer>\n</div>"

/***/ }),

/***/ "./src/app/pages/blog/blog-detail/blog-detail.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".mat-toolbar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  box-sizing: border-box;\n  width: 100%;\n  padding: 0 16px;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column; }\n  .mat-toolbar .mat-toolbar-row {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    box-sizing: border-box;\n    width: 100%;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    white-space: nowrap; }\n\n.mat-toolbar {\n  min-height: 64px; }\n\n.mat-toolbar-row {\n  height: 64px; }\n\n@media (max-width: 600px) {\n  .mat-toolbar {\n    min-height: 56px; }\n  .mat-toolbar-row {\n    height: 56px; } }\n\n:host {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 3;\n  background: white; }\n\n.blog-detail {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  z-index: 2;\n  background: white; }\n\n.m-header {\n  position: fixed;\n  z-index: 1;\n  width: 100%; }\n\n.middleBar {\n  margin: 0 16px 0 56px;\n  font: 500 20px/32px Roboto, \"Helvetica Neue\", sans-serif;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  -webkit-font-smoothing: antialiased; }\n\n.bottomBar {\n  padding: 0 16px;\n  font-family: 400 16px/24px 'Roboto', 'Noto', sans-serif;\n  -webkit-font-smoothing: antialiased; }\n\n.middleBar, .bottomBar {\n  height: 64px;\n  line-height: 64px;\n  display: block;\n  box-sizing: border-box;\n  width: 100%;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n\n.m-header {\n  height: calc(64px * 3); }\n\n.m-article {\n  margin-top: calc(64px * 3); }\n\n.m-article {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 16px;\n  max-width: 800px;\n  min-height: 100%;\n  margin-left: auto;\n  margin-right: auto;\n  margin-top: calc($mat-toolbar-height-desktop * 3); }\n\n.m-footer {\n  width: 100%;\n  height: 96px; }\n\n.m-footer-section-left {\n  font-size: 20px;\n  font-weight: 500;\n  line-height: 24px;\n  -webkit-font-smoothing: antialiased;\n  width: 50%;\n  height: 100%;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  padding: 24px 16px 16px;\n  cursor: pointer;\n  float: left; }\n  .m-footer-section-left:hover {\n    background-color: rgba(0, 0, 0, 0.12); }\n  .m-footer-section-left span {\n    max-width: calc(100% - 24px);\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis; }\n  .m-footer-section-left .direction {\n    padding-left: 24px; }\n\n.m-footer-section-right {\n  font-size: 20px;\n  font-weight: 500;\n  line-height: 24px;\n  -webkit-font-smoothing: antialiased;\n  width: 50%;\n  height: 100%;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  padding: 24px 16px 16px;\n  cursor: pointer;\n  float: right;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end; }\n  .m-footer-section-right:hover {\n    background-color: rgba(0, 0, 0, 0.12); }\n  .m-footer-section-right span {\n    max-width: calc(100% - 24px);\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis; }\n  .m-footer-section-right .direction {\n    text-align: right;\n    padding-right: 24px; }\n\n.direction {\n  width: 100%;\n  font-size: 15px;\n  color: rgba(255, 255, 255, 0.55); }\n\n@media (max-width: 600px) {\n  .middleBar, .bottomBar {\n    height: 56px;\n    line-height: 56px;\n    display: block;\n    box-sizing: border-box;\n    width: 100%;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center; }\n  .m-header {\n    height: calc(56px * 3); }\n  .m-article {\n    margin-top: calc(56px * 3); }\n  .m-footer-section-left:hover, .m-footer-section-right:hover {\n    background: none; }\n  .m-footer-section-left:active, .m-footer-section-right:active {\n    background-color: rgba(0, 0, 0, 0.12); } }\n\n.spinner-crescent {\n  position: relative;\n  display: inline-block;\n  width: 28px;\n  height: 28px; }\n  .spinner-crescent svg {\n    -webkit-animation-duration: 750ms;\n            animation-duration: 750ms;\n    -webkit-animation: spinner-rotate 1s linear infinite;\n            animation: spinner-rotate 1s linear infinite;\n    stroke: #000; }\n  .spinner-crescent circle {\n    fill: transparent;\n    stroke-width: 4px;\n    stroke-dasharray: 128px;\n    stroke-dashoffset: 82px;\n    transition: background-color .2s linear; }\n\n@-webkit-keyframes spinner-rotate {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n@keyframes spinner-rotate {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n.m-spinner {\n  position: absolute;\n  top: 35%;\n  width: 100%;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center; }\n  .m-spinner svg {\n    stroke: rgba(0, 0, 0, 0.54); }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/pages/blog/blog-detail/blog-detail.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_data__ = __webpack_require__("./src/app/providers/data.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__animations__ = __webpack_require__("./src/app/animations.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BlogDetailComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var BlogDetailComponent = (function () {
    function BlogDetailComponent(route, location, renderer, router, data) {
        this.route = route;
        this.location = location;
        this.renderer = renderer;
        this.router = router;
        this.data = data;
        this.routeAnimation = true;
        this.id = '';
        this.scheduledAnimationFrame = false;
        this.toolbarHeight = 64;
        this.blogDetail = {
            id: '',
            title: '',
            tag: '',
            abstract: '',
            body: ''
        };
        this.pre = null;
        this.next = null;
        this.touchEvent = {
            clientX: 0,
            clientY: 0,
            timeStamp: 0
        };
        this.spinner = true;
    }
    BlogDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route
            .queryParamMap
            .subscribe(function (params) {
            _this.id = params.get('id');
            _this.categoryId = params.get('categoryId');
            _this.getData();
        });
    };
    // 获取博客列表
    BlogDetailComponent.prototype.getData = function () {
        var _this = this;
        if (!this.id)
            return;
        var url = "article/" + this.id;
        if (this.categoryId != 0) {
            url = url + ("?categoryId=" + this.categoryId);
        }
        this.data.get(url)
            .subscribe(function (data) { _this.handleData(data); }, function (error) { _this.handleError(error); });
    };
    // 处理博客列表数据
    BlogDetailComponent.prototype.handleData = function (data) {
        this.spinner = false;
        this.blogDetail = data.results;
        this.article.nativeElement.innerHTML = this.blogDetail.body;
        this.pre = data.pre;
        this.next = data.next;
    };
    // 错误处理
    BlogDetailComponent.prototype.handleError = function (error) {
        this.spinner = false;
        console.log(error);
    };
    // 上一篇文章
    BlogDetailComponent.prototype.toPrevious = function () {
        if (!this.pre)
            return;
        this.id = this.pre.id;
        this.getData();
        window.scroll(0, 0);
    };
    // 下一篇文章
    BlogDetailComponent.prototype.toNext = function () {
        if (!this.next)
            return;
        this.id = this.next.id;
        this.getData();
        window.scroll(0, 0);
    };
    // 返回
    BlogDetailComponent.prototype.goBack = function () {
        this.router.navigate(['', { outlets: { blogDetail: null } }]);
        // this.location.back();
    };
    BlogDetailComponent.prototype.ngAfterViewInit = function () {
        this.toolbarHeight = this.middleBar.nativeElement.offsetHeight;
        document.addEventListener('touchstart', this._touchStart.bind(this), false);
        document.addEventListener('touchend', this._touchEnd.bind(this), false);
    };
    BlogDetailComponent.prototype._touchStart = function (ev) {
        this.touchEvent.clientX = ev.touches[0].clientX;
        this.touchEvent.clientY = ev.touches[0].clientY;
        this.touchEvent.timeStamp = ev.timeStamp;
    };
    BlogDetailComponent.prototype._touchEnd = function (ev) {
        var newEvent = {
            clientX: ev.changedTouches[0].clientX,
            clientY: ev.changedTouches[0].clientY,
            timeStamp: ev.timeStamp
        };
        var recognize = this.isSwipe(this.touchEvent, newEvent);
        if (recognize.swip) {
            console.log(recognize.direction);
            if (recognize.direction == 'left') {
                // this.toNext();
            }
            else {
                this.goBack();
                // this.toPrevious()
            }
        }
    };
    BlogDetailComponent.prototype.isSwipe = function (startEvent, endEvent) {
        var deltX = endEvent.clientX - startEvent.clientX;
        var deltY = endEvent.clientY - startEvent.clientY;
        var deltT = endEvent.timeStamp - startEvent.timeStamp;
        var recognize = {
            direction: deltX > 0 ? 'right' : 'left',
            swip: (Math.abs(deltX) > 100) && (Math.abs(deltY) < 20) && (deltT < 500)
        };
        return recognize;
    };
    BlogDetailComponent.prototype.onWindowScroll = function (ev) {
        var number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        console.log(number, window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
        if (number > this.toolbarHeight * 3)
            if (this.scheduledAnimationFrame)
                return;
        this.scheduledAnimationFrame = true;
        requestAnimationFrame(this.updatePage.bind(this, number));
    };
    BlogDetailComponent.prototype.onWindowResize = function (event) {
        this.toolbarHeight = this.middleBar.nativeElement.offsetHeight;
    };
    BlogDetailComponent.prototype.updatePage = function (number) {
        this.scheduledAnimationFrame = false;
        var headerHeight = this.toolbarHeight * 2;
        if (number > headerHeight) {
            number = headerHeight;
            this.middleBar.nativeElement.style.width = "50%";
        }
        else {
            this.middleBar.nativeElement.style.width = "100%";
        }
        this.renderer.setElementStyle(this.topBar.nativeElement, 'transform', 'translate3d(0px, 100px, 0px)');
        this.header.nativeElement.style.boxShadow = "0 2px 5px rgba(0,0,0," + .26 * number / headerHeight + ")";
        this.header.nativeElement.style.transform = "translate3d(0px, -" + number + "px, 0px)";
        this.topBar.nativeElement.style.transform = "translate3d(0px, " + number + "px, 0px)";
        this.middleBar.nativeElement.style.transform = "translate3d(0px, " + number / 2 + "px, 0px)";
        this.bottomBar.nativeElement.style.transform = "scale(" + (1 - number / headerHeight) + ") translateZ(0px)";
        this.bottomBar.nativeElement.style.opacity = "" + (1 - number / headerHeight);
    };
    return BlogDetailComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* HostBinding */])('@routeAnimation'),
    __metadata("design:type", Object)
], BlogDetailComponent.prototype, "routeAnimation", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])("header"),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _a || Object)
], BlogDetailComponent.prototype, "header", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])("topBar"),
    __metadata("design:type", typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _b || Object)
], BlogDetailComponent.prototype, "topBar", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])("middleBar"),
    __metadata("design:type", typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _c || Object)
], BlogDetailComponent.prototype, "middleBar", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])("bottomBar"),
    __metadata("design:type", typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _d || Object)
], BlogDetailComponent.prototype, "bottomBar", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])("article"),
    __metadata("design:type", typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _e || Object)
], BlogDetailComponent.prototype, "article", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_2" /* HostListener */])("window:scroll", ["$event"]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BlogDetailComponent.prototype, "onWindowScroll", null);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_2" /* HostListener */])("window:resize"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BlogDetailComponent.prototype, "onWindowResize", null);
BlogDetailComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-blog-detail',
        template: __webpack_require__("./src/app/pages/blog/blog-detail/blog-detail.component.html"),
        styles: [__webpack_require__("./src/app/pages/blog/blog-detail/blog-detail.component.scss")],
        // encapsulation: ViewEncapsulation.None,
        animations: [__WEBPACK_IMPORTED_MODULE_4__animations__["a" /* slideInDownAnimation */]]
    }),
    __metadata("design:paramtypes", [typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* ActivatedRoute */]) === "function" && _f || Object, typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_2__angular_common__["g" /* Location */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_common__["g" /* Location */]) === "function" && _g || Object, typeof (_h = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["N" /* Renderer */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["N" /* Renderer */]) === "function" && _h || Object, typeof (_j = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _j || Object, typeof (_k = typeof __WEBPACK_IMPORTED_MODULE_3__providers_data__["a" /* Data */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__providers_data__["a" /* Data */]) === "function" && _k || Object])
], BlogDetailComponent);

var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
//# sourceMappingURL=blog-detail.component.js.map

/***/ }),

/***/ "./src/app/pages/blog/blog.component.html":
/***/ (function(module, exports) {

module.exports = "<mat-sidenav-container class=\"m-root\" fullscreen >\n  <!-- 头部开始 -->\n  <mat-toolbar color=\"primary\" class='m-header'>\n    <!-- 侧滑按钮 -->\n    <button mat-icon-button class=\"m-menu\" (click)=\"start.open('mouse')\">\n      <mat-icon>menu</mat-icon>\n    </button>\n    <!-- 标题 -->\n    <h1>ShengYin</h1>\n    <!-- 工具按钮 -->\n    <div class=\"m-toolbar\">\n      <button mat-icon-button (click)=\"toggleFullscreen()\" title=\"Toggle fullscreen\">\n        <mat-icon>fullscreen</mat-icon>\n      </button>\n      <!-- 更多开始 -->\n      <button mat-icon-button [matMenuTriggerFor]=\"menu\" aria-label=\"Open basic menu\">\n        <mat-icon>more_vert</mat-icon>\n      </button>\n      <mat-menu #menu=\"matMenu\">\n        <button mat-menu-item (click)=\"refresh()\">刷新</button>\n        <a mat-menu-item href=\"mailto:shengyinliu@outlook.com\">Email</a>\n        <button mat-menu-item (click)=\"toggleTheme()\">{{dark ? '日间' : '夜间'}}主题</button>\n<!--         <button mat-menu-item (click)=\"root.dir = (root.dir == 'rtl' ? 'ltr' : 'rtl')\" title=\"Toggle between RTL and LTR\">\n          {{root.dir.toUpperCase()}}\n        </button> -->\n      </mat-menu>\n      <!-- 更多结束 -->\n    </div>\n\n  </mat-toolbar>\n  <!-- 头部结束 -->\n\n  <!-- 侧滑开始 -->\n  <!-- mode支持slide, push, over等模式-->\n  <mat-sidenav #start [mode]=\"'push'\">\n    <mat-card>\n      <!-- 侧边头部 -->\n      <mat-card-header>\n        <img mat-card-avatar src=\"../../../assets/avatar.jpeg\">\n      </mat-card-header>\n\n      <mat-card-content>\n      <pre>\n  <!-- 笑看嫣红染半山\n\n      逐风万里白云间\n\n      逍遥此生不为客\n\n      天地三才任平凡 -->\n      夜山秋雨滴空廊\n\n      灯照堂前树叶光\n\n      对坐读书终卷后\n\n      自披衣被扫僧房\n      </pre>\n      </mat-card-content>\n    </mat-card>\n    <!-- 分类开始 -->\n    <button mat-menu-item class=\"slide-button\" (click)=\"refresh();start.close()\">全部</button>\n    \n    <mat-expansion-panel *ngFor=\"let category of categories\" [hideToggle]=\"hideToggle\">\n      <mat-expansion-panel-header>{{category.name}}</mat-expansion-panel-header>\n      <mat-nav-list>\n        <a mat-list-item \n           (click)=\"getDataFromCategory(item);start.close()\" \n           *ngFor=\"let item of category.subCategorList\" >\n          {{item.name}}\n        </a>\n      </mat-nav-list>\n    </mat-expansion-panel>\n\n    <button mat-button tabindex=\"-1\" (click)=\"start.close()\">关闭</button>\n    <!-- 分类结束 -->\n  \n  </mat-sidenav>\n\n  <div  class=\"m-content\">\n\n\n    <div #root=\"dir\" dir=\"ltr\" class=\"m-content-list\">\n      <!-- 链接形式的路由导航 下面是两种形式 暂时不采用 -->\n      <!-- <mat-card *ngFor='let article of articles' [routerLink]=\"['detail', article.id]\"> -->\n      <!-- <a [routerLink]=\"[ '',{ outlets: { blogDetail: ['blogDetail'] } } ]\">blogDetail</a> -->\n      <mat-card *ngFor='let article of articles' (click)='toBlogDetail(article.id)'>\n        <mat-card-title>{{article.title}}</mat-card-title>\n        <mat-card-subtitle>{{article.created_at}}</mat-card-subtitle>\n        <mat-card-content>\n          <mat-chip-list>\n            <mat-chip *ngFor=\"let item of article.tag\">{{item}}</mat-chip>\n          </mat-chip-list>\n          <p>{{article.abstract}}</p>\n        </mat-card-content>\n        <mat-card-actions>\n          <button mat-button >MORE</button>\n        </mat-card-actions>\n        <!-- <mat-card-footer>\n        </mat-card-footer> -->\n      </mat-card>\n    </div>\n\n    <infinite-scroll #infinite loadingText=\"加载更多\" (infinite)=\"doInfinite($event)\"></infinite-scroll>\n \n    <div *ngIf='empty' class=\"empty-text\">没有更多内容</div>\n  </div>\n\n</mat-sidenav-container>"

/***/ }),

/***/ "./src/app/pages/blog/blog.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".m-header {\n  position: fixed;\n  z-index: 1;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.26); }\n\n.mat-sidenav {\n  min-width: 300px !important; }\n  .mat-sidenav .mat-button {\n    width: 100%;\n    position: relative;\n    bottom: 0;\n    margin: 24px 0; }\n\n.slide-button {\n  padding: 0 24px !important; }\n\n.m-content-list {\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  padding: 32px;\n  padding-bottom: 0;\n  margin-top: 48px;\n  max-width: 960px;\n  margin-left: auto;\n  margin-right: auto;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap; }\n  .m-content-list .mat-card {\n    box-sizing: border-box;\n    width: calc((100% - 16px)/2);\n    height: 100%;\n    margin-right: 16px;\n    margin-bottom: 16px;\n    cursor: pointer;\n    outline: none; }\n    .m-content-list .mat-card:nth-child(2n) {\n      margin-right: 0; }\n    .m-content-list .mat-card:hover {\n      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12); }\n\n.empty-text {\n  text-align: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  height: 100%;\n  min-height: 84px; }\n\n@media (max-width: 600px) {\n  .m-content-list .mat-card {\n    width: 100%;\n    margin-right: 0; } }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/pages/blog/blog.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__providers_data__ = __webpack_require__("./src/app/providers/data.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_app_infinite_app_infinite_component__ = __webpack_require__("./src/app/components/app-infinite/app-infinite.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BlogComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var BlogComponent = (function () {
    function BlogComponent(data, router, _element, _renderer) {
        this.data = data;
        this.router = router;
        this._element = _element;
        this._renderer = _renderer;
        this.dark = false;
        this.categories = [];
        this.categoryId = 0;
        this.articles = [];
        this.next_page = 1;
        this.empty = false;
        this.baseUrl = 'http://www.liushengyin.com/api/';
    }
    BlogComponent.prototype.ngOnInit = function () {
        this.getData();
        this.getCategories();
    };
    BlogComponent.prototype.ngAfterViewInit = function () {
        // 监听元素滚动事件，TODO 解决方案不是太好
        this._element.nativeElement.querySelector('.mat-drawer-content').onscroll = this.infinite.onWindowScroll.bind(this.infinite);
    };
    // 获取数据
    BlogComponent.prototype.getData = function () {
        // 构建URL路径
        var _this = this;
        var url = 'article';
        url = url + ("?page=" + this.next_page);
        if (this.categoryId) {
            url = url + ("&categoryId=" + this.categoryId);
        }
        this.data.get(url)
            .subscribe(function (data) { _this.handleData(data); }, function (error) { _this.handleError(error); });
    };
    // 处理数据
    BlogComponent.prototype.handleData = function (data) {
        this.infinite.complete();
        if (data.articles.data.length) {
            this.updateListState(data);
        }
        else {
            this.emptyState();
        }
    };
    // 错误处理
    BlogComponent.prototype.handleError = function (error) {
        console.log(error);
    };
    // 获取分类
    BlogComponent.prototype.getCategories = function () {
        var _this = this;
        var url = "category";
        this.data.get(url)
            .subscribe(function (data) {
            _this.categories = data.categorys;
        }, function (error) { _this.handleError(error); });
    };
    // 根据分类获取数据
    BlogComponent.prototype.getDataFromCategory = function (item) {
        if (item === void 0) { item = null; }
        // 初始化状态
        this.initeState();
        // 获取分类id
        this.categoryId = item ? item.id : 0;
        // 获取数据
        this.getData();
    };
    // 加载更多列表数据
    BlogComponent.prototype.doInfinite = function (infiniteScroll) {
        this.getData();
    };
    BlogComponent.prototype.doRefresh = function (refresher) {
        this.refresh();
        setTimeout(function () {
            refresher.complete();
        }, 1000);
    };
    // 刷新
    BlogComponent.prototype.refresh = function () {
        this.initeState();
        this.getData();
    };
    // 初始化参数状态
    BlogComponent.prototype.initeState = function () {
        this.categoryId = 0;
        this.next_page = 1;
        this.articles = [];
        this.empty = false;
        this.infinite.enable(true);
    };
    // 更新列表数据
    BlogComponent.prototype.updateListState = function (data) {
        this.next_page = data.articles.current_page + 1;
        var temArticles = data.articles.data;
        temArticles.forEach(function (item) {
            item.created_at = item.created_at.substring(0, 10);
            item.tag = item.tag.trim() == "" ? [] : item.tag.trim().split(" ");
        });
        this.articles = this.articles.length ? this.articles.concat(temArticles) : temArticles;
    };
    // 没有更多内容
    BlogComponent.prototype.emptyState = function () {
        this.infinite.enable(false);
        this.empty = true;
    };
    // 进入详情页面
    BlogComponent.prototype.toBlogDetail = function (id) {
        var navigationExtras = {
            queryParams: { 'id': id, 'categoryId': this.categoryId },
        };
        this.router.navigate(['', { outlets: { blogDetail: ['blogDetail'] } }], navigationExtras);
    };
    // 分享 https&chrome 才可以使用，覆盖率50%左右
    BlogComponent.prototype.share = function () {
        if (navigator.share) {
            navigator.share({
                title: 'Blog',
                text: 'Sheng Blog',
                url: 'https://www.liushengyin.com/',
            })
                .then(function () { return console.log('Successful share'); })
                .catch(function (error) { return console.log('Error sharing', error); });
        }
    };
    // 切换全屏状态
    BlogComponent.prototype.toggleFullscreen = function () {
        var elem = this._element.nativeElement.querySelector('.demo-root');
        if (!isDocumentInFullScreenMode()) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
            else if (elem.webkitRequestFullScreen) {
                elem.webkitRequestFullScreen();
            }
            else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            }
            else if (elem.msRequestFullScreen) {
                elem.msRequestFullScreen();
            }
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        // 判断当前是否是全屏状态
        function isDocumentInFullScreenMode() {
            return (document.fullscreenElement && document.fullscreenElement !== null) || (document.webkitIsFullScreen);
        }
    };
    // 更换颜色主题
    BlogComponent.prototype.toggleTheme = function () {
        var darkThemeClass = 'unicorn-dark-theme';
        this.dark = !this.dark;
        if (this.dark) {
            this._renderer.addClass(document.body, darkThemeClass);
        }
        else {
            this._renderer.removeClass(document.body, darkThemeClass);
        }
    };
    return BlogComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])(__WEBPACK_IMPORTED_MODULE_2__components_app_infinite_app_infinite_component__["a" /* AppInfiniteComponent */]),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__components_app_infinite_app_infinite_component__["a" /* AppInfiniteComponent */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__components_app_infinite_app_infinite_component__["a" /* AppInfiniteComponent */]) === "function" && _a || Object)
], BlogComponent.prototype, "infinite", void 0);
BlogComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-blog',
        template: __webpack_require__("./src/app/pages/blog/blog.component.html"),
        styles: [__webpack_require__("./src/app/pages/blog/blog.component.scss")],
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__providers_data__["a" /* Data */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__providers_data__["a" /* Data */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */]) === "function" && _e || Object])
], BlogComponent);

var _a, _b, _c, _d, _e;
//# sourceMappingURL=blog.component.js.map

/***/ }),

/***/ "./src/app/pages/compose-message/compose-message.component.html":
/***/ (function(module, exports) {

module.exports = "<h3>Contact Crisis Center</h3>\n<div *ngIf=\"details\">\n  {{ details }}\n</div>\n<div>\n  <div>\n    <label>Message: </label>\n  </div>\n  <div>\n    <textarea [(ngModel)]=\"message\" rows=\"10\" cols=\"35\" [disabled]=\"sending\"></textarea>\n  </div>\n</div>\n<p *ngIf=\"!sending\">\n  <button (click)=\"send()\">Send</button>\n  <button (click)=\"cancel()\">Cancel</button>\n</p>\n"

/***/ }),

/***/ "./src/app/pages/compose-message/compose-message.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ":host {\n  position: relative;\n  bottom: 10%; }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/pages/compose-message/compose-message.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__animations__ = __webpack_require__("./src/app/animations.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ComposeMessageComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var ComposeMessageComponent = (function () {
    function ComposeMessageComponent(router) {
        this.router = router;
        this.routeAnimation = true;
        this.display = 'block';
        this.position = 'absolute';
        this.sending = false;
    }
    ComposeMessageComponent.prototype.send = function () {
        var _this = this;
        this.sending = true;
        this.details = 'Sending Message...';
        setTimeout(function () {
            _this.sending = false;
            _this.closePopup();
        }, 1000);
    };
    ComposeMessageComponent.prototype.cancel = function () {
        this.closePopup();
    };
    ComposeMessageComponent.prototype.closePopup = function () {
        // Providing a `null` value to the named outlet
        // clears the contents of the named outlet
        this.router.navigate([{ outlets: { popup: null } }]);
    };
    return ComposeMessageComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* HostBinding */])('@routeAnimation'),
    __metadata("design:type", Object)
], ComposeMessageComponent.prototype, "routeAnimation", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* HostBinding */])('style.display'),
    __metadata("design:type", Object)
], ComposeMessageComponent.prototype, "display", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_3" /* HostBinding */])('style.position'),
    __metadata("design:type", Object)
], ComposeMessageComponent.prototype, "position", void 0);
ComposeMessageComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-compose-message',
        template: __webpack_require__("./src/app/pages/compose-message/compose-message.component.html"),
        styles: [__webpack_require__("./src/app/pages/compose-message/compose-message.component.scss")],
        animations: [__WEBPACK_IMPORTED_MODULE_2__animations__["a" /* slideInDownAnimation */]]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _a || Object])
], ComposeMessageComponent);

var _a;
//# sourceMappingURL=compose-message.component.js.map

/***/ }),

/***/ "./src/app/pages/not-found/not-found.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"container\">\n    <a href=\"/\" class=\"tab-logo\"></a>\n    <div class=\"content\">\n        <img src=\"../../../assets/404.png\">\n    </div>\n    <div class=\"not_found_bg\"></div>\n</div>"

/***/ }),

/***/ "./src/app/pages/not-found/not-found.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".container {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding-top: 36px;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap; }\n\n.content {\n  width: 100%;\n  text-align: center;\n  padding-top: 16px; }\n\n.tab-logo {\n  background: url(" + __webpack_require__("./src/assets/tablogo.png") + ");\n  background-position: 0 0;\n  height: 60px;\n  width: 180px;\n  display: inline-block;\n  overflow: hidden;\n  vertical-align: top;\n  font-size: 12px;\n  word-spacing: normal;\n  letter-spacing: normal; }\n\n.not_found_bg {\n  position: fixed;\n  bottom: 0;\n  height: 222px;\n  width: 100%;\n  background: url(" + __webpack_require__("./src/assets/404_bg.png") + "); }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/pages/not-found/not-found.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NotFoundComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var NotFoundComponent = (function () {
    function NotFoundComponent(location) {
        this.location = location;
    }
    NotFoundComponent.prototype.ngOnInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.location.back();
        }, 3000);
    };
    return NotFoundComponent;
}());
NotFoundComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-not-found',
        template: __webpack_require__("./src/app/pages/not-found/not-found.component.html"),
        styles: [__webpack_require__("./src/app/pages/not-found/not-found.component.scss")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_common__["g" /* Location */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_common__["g" /* Location */]) === "function" && _a || Object])
], NotFoundComponent);

var _a;
//# sourceMappingURL=not-found.component.js.map

/***/ }),

/***/ "./src/app/pages/slides/slides.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"page\">\n<!--             (pan)=\"panCount = panCount + 1\"\n            (longpress)=\"longpressCount = longpressCount + 1\"\n            (press)=\"pressCount = pressCount + 1\"\n            (slide)=\"_onSlide($event);slideCount = slideCount + 1\"\n            (slideend) =  \"_onSlideEnd($event)\"\n            (slidestart) = \"_onSlideStart($event)\"\n            (swipe)=\"onSwipe($event);swipeCount = swipeCount + 1;\" -->\n    <mat-toolbar color=\"primary\" >\n\n    <button mat-icon-button class=\"m-menu\" (click)=\"goBack()\">\n      <mat-icon>arrow_back</mat-icon>\n    </button>\n\n    <button mat-icon-button class=\"m-menu\" (click)=\"drawer.open()\">\n      <mat-icon>menu</mat-icon>\n    </button>\n\n    </mat-toolbar>\n<!--     <div class=\"demo-gestures\">\n           <p>Pan: {{panCount}}</p>\n           <p>Longpress: {{longpressCount}}</p>\n           <p>Press: {{pressCount}}</p>\n           <p>Swipe: {{swipeCount}}</p>\n           <p>Slide: {{slideCount}}</p>\n    </div>\n     -->\n  <div class=\"demo-content\">\n    <app-drawer #drawer></app-drawer>\n  <ion-refresher (ionRefresh)=\"doRefresh($event)\">\n    <ion-refresher-content pullingText=\"下拉刷新\">\n    </ion-refresher-content>\n  </ion-refresher>\n    <mat-list>\n      <h3 mat-subheader>Items</h3>\n      <mat-list-item *ngFor=\"let item of items\">\n        {{item}}\n      </mat-list-item>\n    </mat-list>\n  </div>\n  <infinite-scroll loadingText=\"加载更多\" (infinite)=\"doInfinite($event)\"></infinite-scroll>\n</div>\n"

/***/ }),

/***/ "./src/app/pages/slides/slides.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".page {\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  background-color: #fafafa; }\n\n.demo-gestures {\n  background: gray;\n  padding: 15px;\n  color: white; }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/pages/slides/slides.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SlidesComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SlidesComponent = (function () {
    function SlidesComponent(location, _renderer, _elementRef) {
        this.location = location;
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.state = 'inactive';
        this.InOut = true;
        this.flyInOut = 'in';
        this.panCount = 0;
        this.pressCount = 0;
        this.longpressCount = 0;
        this.swipeCount = 0;
        this.slideCount = 0;
        this.items = [];
    }
    SlidesComponent.prototype.ngOnInit = function () {
        for (var i = 0; i < 15; i++) {
            this.items.push(this.items.length);
        }
    };
    SlidesComponent.prototype.goBack = function () {
        this.location.back();
    };
    SlidesComponent.prototype.toogleState = function () {
        this.state = this.state == 'inactive' ? 'active' : 'inactive';
        this.InOut = !this.InOut;
    };
    // onSwipe(ev) {
    //   console.log(ev);
    //   if(ev.deltaX > 0 && Math.abs(ev.deltaY) < 16 && ev.target.className.indexOf("drawer") == -1){
    //     this.goBack();
    //   }
    // }
    SlidesComponent.prototype.doRefresh = function (refresher) {
        console.log('Begin async operation', refresher);
        setTimeout(function () {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    };
    SlidesComponent.prototype.doInfinite = function (infiniteScroll) {
        var _this = this;
        console.log('Begin async operation');
        setTimeout(function () {
            for (var i = 0; i < 10; i++) {
                _this.items.push(_this.items.length);
            }
            console.log('Async operation has ended');
            infiniteScroll.complete();
        }, 500);
    };
    return SlidesComponent;
}());
SlidesComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-slides',
        template: __webpack_require__("./src/app/pages/slides/slides.component.html"),
        styles: [__webpack_require__("./src/app/pages/slides/slides.component.scss")],
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["q" /* ViewEncapsulation */].None
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_common__["g" /* Location */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_common__["g" /* Location */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* Renderer2 */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _c || Object])
], SlidesComponent);

var _a, _b, _c;
//# sourceMappingURL=slides.component.js.map

/***/ }),

/***/ "./src/app/pages/switch/switch.component.html":
/***/ (function(module, exports) {

module.exports = "  <a [routerLink]=\"[ '',{ outlets: { popup: ['compose'] } } ]\">Contact</a>\n"

/***/ }),

/***/ "./src/app/pages/switch/switch.component.scss":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/pages/switch/switch.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SwitchComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var SwitchComponent = (function () {
    function SwitchComponent() {
    }
    SwitchComponent.prototype.ngOnInit = function () {
    };
    return SwitchComponent;
}());
SwitchComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_11" /* Component */])({
        selector: 'app-switch',
        template: __webpack_require__("./src/app/pages/switch/switch.component.html"),
        styles: [__webpack_require__("./src/app/pages/switch/switch.component.scss")]
    }),
    __metadata("design:paramtypes", [])
], SwitchComponent);

//# sourceMappingURL=switch.component.js.map

/***/ }),

/***/ "./src/app/providers/data.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__ = __webpack_require__("./node_modules/rxjs/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Data; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var Data = (function () {
    function Data(http) {
        this.http = http;
        this.user = '';
        this.companyName = '';
        this.userurl = "http://www.liushengyin.com/api/";
        this.userName = '';
        this.account = "";
        this.role = "";
        this.chainID = "";
        this.userPriv = {};
        this.test = this;
        this.entry = "";
    }
    Data.prototype.get = function (url) {
        if (typeof url === 'string' && url.indexOf('http') < 0) {
            url = this.userurl + url;
        }
        return this.http.get(url)
            .map(this.extractData)
            .catch(this.handleError);
    };
    Data.prototype.post = function (url, data) {
        if (typeof url === 'string' && url.indexOf('http') < 0) {
            url = this.userurl + url;
        }
        var body = this.param(data);
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Headers */]({ 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' });
        var options = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["c" /* RequestOptions */]({ headers: headers });
        return this.http.post(url, body, options)
            .map(this.extractResponse)
            .catch(this.handleError);
    };
    Data.prototype.blobPost = function (url, name, value, filename) {
        var _this = this;
        if (filename === void 0) { filename = 'blob'; }
        return new Promise(function (resolve) {
            var formData = new FormData();
            formData.append(name, value, filename);
            var oReq = new XMLHttpRequest();
            oReq.open("POST", _this.userurl + url);
            oReq.onload = function (oEvent) {
                console.log(oReq);
                resolve(oReq);
            };
            oReq.send(formData);
        });
    };
    Data.prototype.extractData = function (res) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        try {
            res = res.json();
        }
        catch (e) {
            if (res.hasOwnProperty('_body')) {
                //处理没有权限的情况
                if (res._body.indexOf('user-deny') > -1) {
                    throw new Error('您没有该权限！');
                }
            }
        }
        return res;
    };
    Data.prototype.extractResponse = function (res) {
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        try {
            res = res.json();
        }
        catch (e) {
            if (res.hasOwnProperty('_body')) {
                if (res._body.indexOf('user-deny') > -1) {
                    throw new Error('您没有该权限！');
                }
            }
        }
        return res;
    };
    Data.handleErr = function (message) {
        console.log(message);
    };
    Data.prototype.handleError = function (error) {
        // In a real world app, we might send the error to remote logging infrastructure
        var errMsg = error.message || 'networkError';
        console.error(errMsg); // log to console instead
        return __WEBPACK_IMPORTED_MODULE_3_rxjs_Observable__["Observable"].throw(errMsg);
    };
    Data.prototype.param = function (obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        //  console.log(query.length ? query.substr(0, query.length - 1) : query);
        return query.length ? query.substr(0, query.length - 1) : query;
    };
    //对于base64编码的URL，其length属性与图片存储大小的关系还需要研究，现在只是做一个参考
    //压缩函数
    Data.prototype.imgToBlob = function (imgURI) {
        var _this = this;
        return new Promise(function (resolve) {
            var img = new Image();
            img.src = imgURI;
            img.onload = function () {
                // let maxSize = 200 * 1024;
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext('2d');
                var tCanvas = document.createElement("canvas");
                var tctx = tCanvas.getContext("2d");
                // let initSize = img.src.length;
                var width = img.width;
                var height = img.height;
                //canvas的大小有限制,如果canvas的大小大于大概五百万像素（即宽高乘积）的时候，不仅图片画不出来，其他什么东西也都是画不出来的.所以是对图片的宽高进行适当压缩
                //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
                var ratio;
                if ((ratio = width * height / 4000000) > 1) {
                    ratio = Math.sqrt(ratio);
                    width /= ratio;
                    width = Math.ceil(width);
                    height /= ratio;
                    height = Math.ceil(height);
                }
                else {
                    ratio = 1;
                }
                canvas.width = width;
                canvas.height = height;
                //png转jpg时，需要铺白色底色
                // 铺底色
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                //canvas的瓦片，目前不了解，一般用于地图app拼画面，以后再研究
                //解决ios的限制：如果图片的大小超过两百万像素，图片也是无法绘制到canvas上的，用toDataURL获取图片数据的时候获取到的是空的图片数据
                //如果图片像素大于100万则使用瓦片绘制
                //理解瓦片绘制就是先把图片分割成块，分块绘制在canvas上，但是下面分块计算有一点不懂。（应该是按每块100万像素来分的）
                var count;
                if ((count = width * height / 1000000) > 1) {
                    count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
                    //计算每块瓦片的宽和高
                    var nw = ~~(width / count);
                    var nh = ~~(height / count);
                    tCanvas.width = nw;
                    tCanvas.height = nh;
                    for (var i = 0; i < count; i++) {
                        for (var j = 0; j < count; j++) {
                            tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                            ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                        }
                    }
                }
                else {
                    ctx.drawImage(img, 0, 0, width, height);
                }
                //canvas的toDataURL是只能压缩jpg的，当用户上传的图片是png的话，就需要转成jpg，后面的数字为压缩比
                //进行最小压缩
                var ndata = canvas.toDataURL('image/jpeg', 0.4);
                resolve(_this.dataURLtoBlob(ndata));
            };
        });
    };
    // dataURL转blob
    Data.prototype.dataURLtoBlob = function (dataurl) {
        console.log(dataurl.length);
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };
    //处理简单的json转array,去除空字段,将key和value同时存入数组
    Data.prototype.toArray = function (obj) {
        var array = [];
        for (var index in obj) {
            if (obj[index]) {
                var container = {};
                container.key = index;
                container.value = obj[index];
                array.push(container);
            }
        }
        return array;
    };
    //获取今天的日期
    Data.prototype.getToday = function () {
        var date = new Date();
        var month = Number(date.getMonth()) + 1;
        var today = date.getFullYear() + '-' + this.toZero(month) + '-' + this.toZero(date.getDate());
        return today;
    };
    Data.prototype.getTodayTime = function () {
        var date = new Date();
        var month = Number(date.getMonth()) + 1;
        var todayTime = date.getFullYear() + '-' + this.toZero(month) + '-' + this.toZero(date.getDate()) + " " + this.toZero(date.getHours()) + ":" + this.toZero(date.getMinutes())
            + ":" + this.toZero(date.getSeconds());
        return todayTime;
    };
    //处理日期
    Data.prototype.toZero = function (num) {
        if (num > 9) {
            return '' + num;
        }
        else {
            return '0' + num;
        }
    };
    //按时间进行排序
    Data.prototype.sortByDate = function (date1, date2) {
        date1 = date1.split(/[-\s:]/);
        date2 = date2.split(/[-\s:]/);
        return Date.UTC(date2[0], date2[1], date2[2], date2[3], date2[4], date2[5]) -
            Date.UTC(date1[0], date1[1], date1[2], date1[3], date1[4], date1[5]);
    };
    Data.prototype.toZeroThree = function (num) {
        if (num < 10) {
            return '00' + num;
        }
        else {
            if (num < 100) {
                return '0' + num;
            }
            else {
                return '' + num;
            }
        }
    };
    //随机获取默认的头像
    Data.prototype.getDefaultAvatar = function () {
        var avatars = ['assets/img/default/default_contact1.png', 'assets/img/default/default_contact2.png', 'assets/img/default/default_contact3.png', 'assets/img/default/default_contact4.png', 'assets/img/default/default_contact5.png'];
        return avatars[Math.round(Math.random() * 4)];
    };
    //联合json
    Data.prototype.extend = function (des, src, override) {
        if (src instanceof Array) {
            for (var i = 0, len = src.length; i < len; i++)
                this.extend(des, src[i], override);
        }
        for (var index in src) {
            if (override || !(index in des)) {
                des[index] = src[index];
            }
        }
        return des;
    };
    //将post数据进行转换
    Data.prototype.toJsonString = function (obj) {
        var array = [];
        var postData = {};
        for (var item in obj) {
            array.push({ 'name': item, 'value': obj[item] });
        }
        postData.jsonStr = JSON.stringify(array);
        return postData;
    };
    //ping服务器
    Data.prototype.ping = function () {
        // let url = "sys/misc-ping-.html";
        // setInterval(()=>{
        //     this.get(url).subscribe(
        //         data =>{},
        //         error =>{}
        //     );
        // },120000);//1000为1秒钟
    };
    Data.prototype.toDecimal2 = function (x) {
        // if (isNaN(parseFloat(x))) {
        //     return false;
        // }
        var f = Math.round(x * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    };
    Data.prototype.isEmptyObject = function (obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    };
    Data.prototype.linkParams = function (params) {
        var p = '';
        for (var index in params) {
            p += "-" + params[index];
        }
        return p + '.json';
    };
    //计算指定日期与今日相差的天数，传入参数以"year-month-day"的形式
    Data.prototype.calculateDaysToToday = function (dateString) {
        console.log(dateString);
        var thisday = new Date();
        var year = thisday.getFullYear(); //number格式
        var month = thisday.getMonth();
        var date = thisday.getDate();
        var dateArray = dateString.split('-');
        var nowTime = new Date(year, month, date);
        var startTime = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]));
        var dayToToday = Math.abs((Number(nowTime) - Number(startTime)) / (1000 * 60 * 60 * 24));
        return dayToToday;
    };
    //去除html字符
    Data.prototype.removeCharacter = function (data) {
        var reg = /<[^>]+>(.*?)<\/[^>]+>/g;
        return data.replace(reg, function ($0, $1) { return $1; });
    };
    return Data;
}());
Data = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === "function" && _a || Object])
], Data);

var _a;
//# sourceMappingURL=data.js.map

/***/ }),

/***/ "./src/app/routerAnimations.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_animations__ = __webpack_require__("./node_modules/@angular/animations/@angular/animations.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return routerAnimations; });

var routerAnimations = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["a" /* trigger */])('routerAnimations', [
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["d" /* transition */])('blog => slides', [
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':leave, :enter', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
        })),
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':enter', [
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({
                transform: 'translateX(100%)'
            })
        ]),
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["o" /* group */])([
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':leave', [
                // 向左滑出
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["e" /* animate */])('400ms cubic-bezier(.35,0,.25,1)', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({ transform: 'translateX(-100%)' })),
            ]),
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':enter', [
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["e" /* animate */])('400ms cubic-bezier(.35,0,.25,1)', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({ transform: 'translateX(0)' }))
            ])
        ])
    ]),
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["d" /* transition */])('slides => blog', [
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':leave, :enter', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
        })),
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':enter', [
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({
                transform: 'translateX(-100%)'
            })
        ]),
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["o" /* group */])([
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':leave', [
                // 向左滑出
                // animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
                // 向右滑出
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["e" /* animate */])('400ms cubic-bezier(.35,0,.25,1)', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({ transform: 'translateX(100%)' })),
            ]),
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["n" /* query */])(':enter', [
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["e" /* animate */])('400ms cubic-bezier(.35,0,.25,1)', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_animations__["c" /* style */])({ transform: 'translateX(0)' }))
            ])
        ])
    ])
]);
//# sourceMappingURL=routerAnimations.js.map

/***/ }),

/***/ "./src/assets/404_bg.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "404_bg.5b0c2e011fe5e1f248a8.png";

/***/ }),

/***/ "./src/assets/tablogo.png":
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAADlCAMAAADNwS1SAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABgUExURUxpcaCHWrKedrKfebSgd7Ofd7SgeLWhebOedrSgeLSgeLSgeLOedrSgeLSgeLOedrSgeLKedbSgeLOfdrSgeLOfd7Ofd7Ofd7SgeLOfd7SgeLSgeLSgeKGHWqGHWrSgePxVj28AAAAfdFJOUwD+Mf4eDb4GFrGjjij2gneZO9Jj4WxNWMdD2ujv0JkEgUDBAAAPTklEQVR42uxba5OrqhK1HN4qoqj4quL//8vLQ42gMSY5s++XoU7V2Zkksmi6V3cvSJL85iBDm9GxKN/93tCwcsBfzUwxhW9+B6aKs37WfrB3p8zf/xauWobI47VCwztoS9ZPOhj1s0+34tyeuDDfEneNWhkDjW6icYe6v7NSMMgMNfpsFM92urcTtSdv2OfIq+lGDkHVGeer/XbONc2E1jvQzzcKVEqWGaP1dAp2qnvKsuyZdwH3KXTyTm3+frm923wNEqVKiZ1h0OOlXStqBmp+ToCapY+slF0KXkZS5mZ9WAeiavkXMm/kV1/t9UgzOaxzDEWWJOnp+nd+VBzAjkhwWRE/Ib3jjMA+ZN5jKzT1L5l553LNSPv1odF9QVm8r0A7b1zHZGmilsnOSo8owN3TZ1hkc7WPC/OHH7q+dTk/1emCA7iI1tyC7m/srC4QVyn2c9R70NuSMdUUPCFju970wHR8AT3fAt1M7n9cKwt6T1MnG9XpoucbX9kljHvQa+gS+2I6DSlsWGoM/VZZ00OPaQ8aVie7lAJo9wYNgtjP5zHoM/bI9yspbUDtQS8cOyxBXp08gBsnIsft44shl+fBVFoOro6gQT4qg5MnYuqSZnZktAM91NWLkGpj0JkzM1uc/ozy0kILfEJ0YAU9PUj4hLMN6KQqMmmJUWjuIj8ATemLjJrKGLStNuQyIz1bMq4LdaAk51c470o2R9wkjjEFrDsVLm9RP+EedC4gI1fVDdJzDLo12+OZhZ+HIVb5+X7FOXUee5MSzkEbF3N8ARvdRqAhtP89G8qQ33SwdIbcjL18p1Trw4JFdVVOnrMXcHRgWSPBsy4qu1P1rdJKjo630hi0s1GWvlWngZX2qQT0VX7KXMKk8zwT6ya1boxpHxguZikdORjeAkfQVN0xMgABBaFeKLAEInsBOrUcx6VdHNKAmc+/Bg3VYlHLW+TgHuReHUsf2QXOusGP3PGiMnWgkTGvATxYwJMeXoGGaItrvOTfAHTkGDhXfGtfcJraonKpurc8zvdsTBfWvASttCkRUpb0BbDuPcFdQgJlUh4CUS7+t1QWMWiw7yhE7cqr1fhpVGn5R+SFLpO3QIO5XEjHVeQIJXvQteTwvPjI1r/HoIkz79Cy+oGuOmeJ5YsoiDy6psYL0FQtq/Xen6YB6Jb3R9AYNeJBtYfkIvo4PzwMaUuMCWVtV9kdaJYyrYYh6OtumK0eCEeGHyh2oJPsVWM7W9Awt/1PX+jzsVkS845sPlbk3lw1CYs43Ua9HBfyDHS1K31flLOR1Yk16/wErDZk6pwXnjVVctEacFR5aglBXqmWC7r2yX3QBESxbjolcgc0sZZlaDyY1qZekZmWa0hzAldjVTFxq/MG0fSdfDxb/BR0vlG9q1z+f+4R3LSHdVOctIc0K9WQ3xRJbEHt7IVBng6dLLlgqJ/080H2gRiXYbidrkCLw9MaylVFkvdGuzYL/CnKYm7qHpkqU2S8LNm+9pLH6SC7AB0Qrem8q3f1J28Zs5+Fg1EdW2TjWqZaelsY26UHRhg+K8dq1n6Gd6MOsXGP64+ZocF0pyh8I+ZVTXWIoFEo+3RFPn0o3Axt+GukKwuafVzTL9ENUx+rkN2hM938d6rBh6om0k+SntSNnw4+6y7vPZ/08Km6OX322H5rvM/qA7mmWX3LRXDF6ya/O7WN+2Ovd7fgb/Cz5bDV0uMrg6Yyo57U57t73ui7EtgZR2t0Mg/ZnAJcPtukdd+sNyZ+S9U1+qb7d/pjt4PcCXlHzazcoKb6qj41XtSwstvkl/5u3UE/kvn3oaiz2D7jppdWlxo1qaZHhjSNdz2/4ZjFx6TnM2EPDpvHHv+MaKvFQbkFXc2e0caUMHXYauVtci5euEmzLxKAOrgIfhja1VPRvKIKQDfzkkIpxWMYsylPsjPQePrO0AuuLcWsZQ3bpczIeVgbgJ79KYDnhFDzyLNEkCcFz1eGXpu2LojCmTyeP8VBxALQQSXTR42VoE8Kni8NvfAPCfxN7V7FNN2PQciuPQ3rm2NlDp8VPN8a+qGwWj6gQSdpQaNDq0OCs47lfMrUhf29dDH+B4a27lB7v8XlHGm62RH0pNUeQKELUXYpdIKmvBtD/Hvn8I2tazvMAqrQ36O2Ege6E8jbgyr0uoTX01cVb+IUBGcg0DhRYTgEehZ3H2N4aKO2VCMzNNfk9cZq+RXmYX60AeCkS3EndgFvZQFzmzXzQZX71nrc65nHJDpHLf37xYc/H+MduDZMQdshB6b17XgfkMuwSRYTYrNuAcz3YZw24LS3rb5x54fiPyGuzpGXJ7rP6jCymOuiN2gZdGdtuXWXXZ4yvXDsjfqNWwJnrTE9SCUoOznQAOKgAIm18e4BxMZhrEeA2W2A2IUAoUN0POUqhObjKBxWK/cZC0S0ohftEE1VlSZ1LDcNGrQ0jXLyB8QeM+4dWljsHB6AJDr7cO44fGxntd5dcQByxekUiyhHowdr8fUGFv4kkuoeO7a5yi/Vt7nQqzNoRxiki5AXfSZT/Kogd8vOvPCKmys7kiaa8f1hXXo8uBeIkdvrEYESEmoEhfQcM6d+/+oX9cL0Xf4mRXhlIkSO4uj7aWpkL7twXratVLYqBLQQYMHsWAzXV2nDOvScJt+N9lp5yJUYn+uQ1nW7JWAze5GBOPATDtaeSBgk12JIfn8QSc/k+XnfvRi3pgYxR50swqMD0AyPMxdbkM7/ArNjDEXDC0c/4emkmpZ7bOxQCIGSbTwt9eGSxi/bu9yOmgoay7tbiGKkdagZgXa7TGirAQGTfztybjJQzyt8SX9RFGKYQLxgHkWa/D8GTv7G3/gbf+Nv/I2/cU/6AZc1Pk5VKfrp8tyC1YL8C6i221lOO540gPZGpdju/UfdjZB52Ab+ZpVSVqn7QUAx13S1XvjbAph3quQCPZqJ2fY/Ye8LQvWm1fo3i5z+x/8WAMo0QQcBDE7z1j/YXzi0uuGnl/3Fpt7QEts2c/pNr6Clbb/tXX6e0OPPN/rlgkC9CMnrmUgkTeQ/21lJb3Wc7t69z0+HPXwB9kZv3SWUH5QRPjLlL9B6FX5RPLj+KcMWfYuD2Zp8BU2GXwIt86FXGSzAChqcBGK7qKxOSQco0sVkse1R6s7UDOjOnfBp+DugYW/AtmOTrKDLI10puoEu3RFxvT+IxLuL3aa9kQ6t1vpbbfXKPYDVaqjZT7ZYGoegcTsWYgNNJ12w51B8I9os958x/hUSEQb0PNnD5WwFHTfEBmU3bKCNkc/yBgSLd4yID7D7+Mz8LmgmWdaNaTGcgG6p/zlKtYF+9L25zx8Q2hNq1LhXdHIf676Rr++4R4USMBjuKHvmI7DM9y5qSI64+FpADy6Ty8w09o6L4UrkViwbFumy+/qI8Rp0afWjUthfLC2g2/05k/BBtoDGhvIEHVfhB3g9bWTcLK4mCWwWIvx10E5F8gD9nubweAZiQDN6uJ8ovXu4HbH3carVdzrtfjAoTa0yFv+9JIU2Py55H0UPHjr7e8MNbDEilrmLfsDRL9lIGM7+Gi4meaUk39+bjhWr/2Ls7r23cbm5uaueXlzM5HrESfWoU/TPVG/3LX8hK+5PEZYo6lYLMncGUnavamNSWHPaNc72HqO7hEH+rZYFtqozZ9J4avbSKZkvNaQ/yoTIsh+b2e9Dzbeq/X/tXNlyqzoQRBL7jjBmh///yyuxCHCSMvccSLnrqN/iPLhrPNKMWj0qj25MJ3qnSMfHvKXTgI//d1e67+BmeSy6heiH2lyO76Ze4qPHLpmuTv0bi6L7iCo/KTPTan6IZ3U06H+HutmPSjbTJu2NyY1pIUuE+UxC5bYIXffw/7fuSZHGuyGP52xesTdzUn4965G30mj95GtSF7Q+HqTOfKma8jDbmT7fulLvBtLzmneV2aDYW9rEbtY4p36wmavZLPeazXZV3V2++1mjLHpcFIZvd+PgpBklne+X8na1irTqPO5cfxKwRHcwzbp/O/EoAn3qiJpP7d+Tj916k9Squ2rzhiUZivZ/GgdK1xFv55DR2TnOyVRLtylnX42jJe9G5/+A8yOymy7io5/wuRy4wT5TT6wiOan5pdy7XLpmPM8W3VZ0Mee6DYJU7E5F6xp86ad9a9uj3zvAw0D2SdHaWClXkpN769W8fe1KjP3QyNrcyKLaoIs5cOunkzOrMJlPLa6a5JMOmeWu0gopPfH+xP9H+ahFXoui57/WXRqdKsXe5rOxsmJ51WRsZDcb3tPqub5oG8xHKhc5fa3wY3VGa3G7489hZcnmNonahnPbvrYPyUxpYoutWg58LluBObG3qpGfE5m/C2dY2DuLTHK5Wp17gmTcqd84mQ62lj3af/dV5mwh4PF9UvUmelBXRN/ivLhgPy3KX7kR0NDQ0NDQ+FcRDj0h/UCBKDsDWTDAePYcEeUhs6xMcO9RWAuuS0ta92QAyWfFWZwHCKEggR5++OOD0ZOdFkNJD0GakN3R1SFEk9bpgb4QKdlCLba80AAJdb+wzmCKy1zGqeNQ2YL0KCLFrmHqcVgbdG5NQ8NFYq2gWf8uawOQ9WBoaGhoaGhooCAMeBfxAEo1DQ5vSWNwtgVbqZqml3tJ7kOgvIt1e6+R/8J83j3kkt072nZloHfRTUFCzfcONnrCVfoJ6PbDVc7lXrR7EB1JdxCkm2N6VHgLMQBZiPSw5UUgqmmqHjbOHijFZS7jUjWVLQiHUU3Vw+4px2Ft0LSJuioNpXuYAyp5mvVvsq4MPNaVZ2hoaGhoaGjgwCnklX5iIXGm/WKeqHE4hyLKpes+exQHpISyAQ04Ftlsc+P1pAQhPRA1t5vDWK+GLbw1jNljIGoG8gkT6XwL7y5TPhwWWfNDLEkThLRRkDlBSgIT6ClBSD9Icx4QZ0l6RgJz/Ukn/2NRyFCjdB9UUF6oZoL2E2TvONi+CYKUNxyL4IBQE83X0CK0p8lr4UaYC+hfVx4FGBv5WrgBSPf9+080NDQ0NDQ0PhhOUTFWgenTDZvQIunTIspSn7YZw9GnOVuMByl7wOjTTPkeG4aiT8dMvSqWsxSEdLqFt2Y2COmAbfo0Q7HV5Ft4fQajT7M1PzLGcPRpNidIyVhswCBn7OH7DRRnSXoGkD4tQmwHRRHYON0HFZ3Hqk8L2hj6dMT8/Z7NEPRp71gEfQZgNTVfQ9sCtKcx818/+PyeqXpdeZR9/oDO18LN2MeTbr6MmPHHp3P+DxFLjUIHpyBmAAAAAElFTkSuQmCC"

/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map