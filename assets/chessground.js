(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Chessground = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var m = require('mithril');
var ctrl = require('./ctrl');
var view = require('./view');
var api = require('./api');

// for usage outside of mithril
function init(element, config) {

  var controller = new ctrl(config);

  m.render(element, view(controller));

  return api(controller);
}

module.exports = init;
module.exports.controller = ctrl;
module.exports.view = view;
module.exports.fen = require('./fen');
module.exports.util = require('./util');
module.exports.configure = require('./configure');
module.exports.anim = require('./anim');
module.exports.board = require('./board');
module.exports.drag = require('./drag');

},{"./anim":4,"./api":5,"./board":6,"./configure":7,"./ctrl":8,"./drag":10,"./fen":12,"./util":16,"./view":17,"mithril":3}],2:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.2.0
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2014 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	/**
	 * Merge one or more objects 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	var Public = function(clone) {

		return merge(clone === true, false, arguments);

	}, publicName = 'merge';

	/**
	 * Merge two or more objects recursively 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	Public.recursive = function(clone) {

		return merge(clone === true, true, arguments);

	};

	/**
	 * Clone the input removing any reference
	 * @param mixed input
	 * @return mixed
	 */

	Public.clone = function(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = Public.clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = Public.clone(input[index]);

		}

		return output;

	};

	/**
	 * Merge two objects recursively
	 * @param mixed input
	 * @param mixed extend
	 * @return mixed
	 */

	function merge_recursive(base, extend) {

		if (typeOf(base) !== 'object')

			return extend;

		for (var key in extend) {

			if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {

				base[key] = merge_recursive(base[key], extend[key]);

			} else {

				base[key] = extend[key];

			}

		}

		return base;

	}

	/**
	 * Merge two or more objects
	 * @param bool clone
	 * @param bool recursive
	 * @param array argv
	 * @return object
	 */

	function merge(clone, recursive, argv) {

		var result = argv[0],
			size = argv.length;

		if (clone || typeOf(result) !== 'object')

			result = {};

		for (var index=0;index<size;++index) {

			var item = argv[index],

				type = typeOf(item);

			if (type !== 'object') continue;

			for (var key in item) {

				var sitem = clone ? Public.clone(item[key]) : item[key];

				if (recursive) {

					result[key] = merge_recursive(result[key], sitem);

				} else {

					result[key] = sitem;

				}

			}

		}

		return result;

	}

	/**
	 * Get type of variable
	 * @param mixed input
	 * @return string
	 *
	 * @see http://jsperf.com/typeofvar
	 */

	function typeOf(input) {

		return ({}).toString.call(input).slice(8, -1).toLowerCase();

	}

	if (isNode) {

		module.exports = Public;

	} else {

		window[publicName] = Public;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}],3:[function(require,module,exports){
var m = (function app(window, undefined) {
	"use strict";
  	var VERSION = "v0.2.1";
	function isFunction(object) {
		return typeof object === "function";
	}
	function isObject(object) {
		return type.call(object) === "[object Object]";
	}
	function isString(object) {
		return type.call(object) === "[object String]";
	}
	var isArray = Array.isArray || function (object) {
		return type.call(object) === "[object Array]";
	};
	var type = {}.toString;
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
	var voidElements = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;
	var noop = function () {};

	// caching commonly used variables
	var $document, $location, $requestAnimationFrame, $cancelAnimationFrame;

	// self invoking function needed because of the way mocks work
	function initialize(window) {
		$document = window.document;
		$location = window.location;
		$cancelAnimationFrame = window.cancelAnimationFrame || window.clearTimeout;
		$requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
	}

	initialize(window);

	m.version = function() {
		return VERSION;
	};

	/**
	 * @typedef {String} Tag
	 * A string that looks like -> div.classname#id[param=one][param2=two]
	 * Which describes a DOM node
	 */

	/**
	 *
	 * @param {Tag} The DOM node tag
	 * @param {Object=[]} optional key-value pairs to be mapped to DOM attrs
	 * @param {...mNode=[]} Zero or more Mithril child nodes. Can be an array, or splat (optional)
	 *
	 */
	function m(tag, pairs) {
		for (var args = [], i = 1; i < arguments.length; i++) {
			args[i - 1] = arguments[i];
		}
		if (isObject(tag)) return parameterize(tag, args);
		var hasAttrs = pairs != null && isObject(pairs) && !("tag" in pairs || "view" in pairs || "subtree" in pairs);
		var attrs = hasAttrs ? pairs : {};
		var classAttrName = "class" in attrs ? "class" : "className";
		var cell = {tag: "div", attrs: {}};
		var match, classes = [];
		if (!isString(tag)) throw new Error("selector in m(selector, attrs, children) should be a string");
		while ((match = parser.exec(tag)) != null) {
			if (match[1] === "" && match[2]) cell.tag = match[2];
			else if (match[1] === "#") cell.attrs.id = match[2];
			else if (match[1] === ".") classes.push(match[2]);
			else if (match[3][0] === "[") {
				var pair = attrParser.exec(match[3]);
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true);
			}
		}

		var children = hasAttrs ? args.slice(1) : args;
		if (children.length === 1 && isArray(children[0])) {
			cell.children = children[0];
		}
		else {
			cell.children = children;
		}

		for (var attrName in attrs) {
			if (attrs.hasOwnProperty(attrName)) {
				if (attrName === classAttrName && attrs[attrName] != null && attrs[attrName] !== "") {
					classes.push(attrs[attrName]);
					cell.attrs[attrName] = ""; //create key in correct iteration order
				}
				else cell.attrs[attrName] = attrs[attrName];
			}
		}
		if (classes.length) cell.attrs[classAttrName] = classes.join(" ");

		return cell;
	}
	function forEach(list, f) {
		for (var i = 0; i < list.length && !f(list[i], i++);) {}
	}
	function forKeys(list, f) {
		forEach(list, function (attrs, i) {
			return (attrs = attrs && attrs.attrs) && attrs.key != null && f(attrs, i);
		});
	}
	// This function was causing deopts in Chrome.
	// Well no longer
	function dataToString(data) {
		if (data == null || data.toString() == null) return "";
		return data;
	}
	// This function was causing deopts in Chrome.
	function injectTextNode(parentElement, first, index, data) {
		try {
			insertNode(parentElement, first, index);
			first.nodeValue = data;
		} catch (e) {} //IE erroneously throws error when appending an empty text node after a null
	}

	function flatten(list) {
		//recursively flatten array
		for (var i = 0; i < list.length; i++) {
			if (isArray(list[i])) {
				list = list.concat.apply([], list);
				//check current index again and flatten until there are no more nested arrays at that index
				i--;
			}
		}
		return list;
	}

	function insertNode(parentElement, node, index) {
		parentElement.insertBefore(node, parentElement.childNodes[index] || null);
	}

	var DELETION = 1, INSERTION = 2, MOVE = 3;

	function handleKeysDiffer(data, existing, cached, parentElement) {
		forKeys(data, function (key, i) {
			existing[key = key.key] = existing[key] ? {
				action: MOVE,
				index: i,
				from: existing[key].index,
				element: cached.nodes[existing[key].index] || $document.createElement("div")
			} : {action: INSERTION, index: i};
		});
		var actions = [];
		for (var prop in existing) actions.push(existing[prop]);
		var changes = actions.sort(sortChanges), newCached = new Array(cached.length);
		newCached.nodes = cached.nodes.slice();

		forEach(changes, function (change) {
			var index = change.index;
			if (change.action === DELETION) {
				clear(cached[index].nodes, cached[index]);
				newCached.splice(index, 1);
			}
			if (change.action === INSERTION) {
				var dummy = $document.createElement("div");
				dummy.key = data[index].attrs.key;
				insertNode(parentElement, dummy, index);
				newCached.splice(index, 0, {
					attrs: {key: data[index].attrs.key},
					nodes: [dummy]
				});
				newCached.nodes[index] = dummy;
			}

			if (change.action === MOVE) {
				var changeElement = change.element;
				var maybeChanged = parentElement.childNodes[index];
				if (maybeChanged !== changeElement && changeElement !== null) {
					parentElement.insertBefore(changeElement, maybeChanged || null);
				}
				newCached[index] = cached[change.from];
				newCached.nodes[index] = changeElement;
			}
		});

		return newCached;
	}

	function diffKeys(data, cached, existing, parentElement) {
		var keysDiffer = data.length !== cached.length;
		if (!keysDiffer) {
			forKeys(data, function (attrs, i) {
				var cachedCell = cached[i];
				return keysDiffer = cachedCell && cachedCell.attrs && cachedCell.attrs.key !== attrs.key;
			});
		}

		return keysDiffer ? handleKeysDiffer(data, existing, cached, parentElement) : cached;
	}

	function diffArray(data, cached, nodes) {
		//diff the array itself

		//update the list of DOM nodes by collecting the nodes from each item
		forEach(data, function (_, i) {
			if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes);
		})
		//remove items from the end of the array if the new array is shorter than the old one. if errors ever happen here, the issue is most likely
		//a bug in the construction of the `cached` data structure somewhere earlier in the program
		forEach(cached.nodes, function (node, i) {
			if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]]);
		})
		if (data.length < cached.length) cached.length = data.length;
		cached.nodes = nodes;
	}

	function buildArrayKeys(data) {
		var guid = 0;
		forKeys(data, function () {
			forEach(data, function (attrs) {
				if ((attrs = attrs && attrs.attrs) && attrs.key == null) attrs.key = "__mithril__" + guid++;
			})
			return 1;
		});
	}

	function maybeRecreateObject(data, cached, dataAttrKeys) {
		//if an element is different enough from the one in cache, recreate it
		if (data.tag !== cached.tag ||
				dataAttrKeys.sort().join() !== Object.keys(cached.attrs).sort().join() ||
				data.attrs.id !== cached.attrs.id ||
				data.attrs.key !== cached.attrs.key ||
				(m.redraw.strategy() === "all" && (!cached.configContext || cached.configContext.retain !== true)) ||
				(m.redraw.strategy() === "diff" && cached.configContext && cached.configContext.retain === false)) {
			if (cached.nodes.length) clear(cached.nodes);
			if (cached.configContext && isFunction(cached.configContext.onunload)) cached.configContext.onunload();
			if (cached.controllers) {
				forEach(cached.controllers, function (controller) {
					if (controller.unload) controller.onunload({preventDefault: noop});
				});
			}
		}
	}

	function getObjectNamespace(data, namespace) {
		return data.attrs.xmlns ? data.attrs.xmlns :
			data.tag === "svg" ? "http://www.w3.org/2000/svg" :
			data.tag === "math" ? "http://www.w3.org/1998/Math/MathML" :
			namespace;
	}

	function unloadCachedControllers(cached, views, controllers) {
		if (controllers.length) {
			cached.views = views;
			cached.controllers = controllers;
			forEach(controllers, function (controller) {
				if (controller.onunload && controller.onunload.$old) controller.onunload = controller.onunload.$old;
				if (pendingRequests && controller.onunload) {
					var onunload = controller.onunload;
					controller.onunload = noop;
					controller.onunload.$old = onunload;
				}
			});
		}
	}

	function scheduleConfigsToBeCalled(configs, data, node, isNew, cached) {
		//schedule configs to be called. They are called after `build`
		//finishes running
		if (isFunction(data.attrs.config)) {
			var context = cached.configContext = cached.configContext || {};

			//bind
			configs.push(function() {
				return data.attrs.config.call(data, node, !isNew, context, cached);
			});
		}
	}

	function buildUpdatedNode(cached, data, editable, hasKeys, namespace, views, configs, controllers) {
		var node = cached.nodes[0];
		if (hasKeys) setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
		cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs);
		cached.nodes.intact = true;

		if (controllers.length) {
			cached.views = views;
			cached.controllers = controllers;
		}

		return node;
	}

	function handleNonexistentNodes(data, parentElement, index) {
		var nodes;
		if (data.$trusted) {
			nodes = injectHTML(parentElement, index, data);
		}
		else {
			nodes = [$document.createTextNode(data)];
			if (!parentElement.nodeName.match(voidElements)) insertNode(parentElement, nodes[0], index);
		}

		var cached = typeof data === "string" || typeof data === "number" || typeof data === "boolean" ? new data.constructor(data) : data;
		cached.nodes = nodes;
		return cached;
	}

	function reattachNodes(data, cached, parentElement, editable, index, parentTag) {
		var nodes = cached.nodes;
		if (!editable || editable !== $document.activeElement) {
			if (data.$trusted) {
				clear(nodes, cached);
				nodes = injectHTML(parentElement, index, data);
			}
			//corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
			//we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
			else if (parentTag === "textarea") {
				parentElement.value = data;
			}
			else if (editable) {
				editable.innerHTML = data;
			}
			else {
				//was a trusted string
				if (nodes[0].nodeType === 1 || nodes.length > 1) {
					clear(cached.nodes, cached);
					nodes = [$document.createTextNode(data)];
				}
				injectTextNode(parentElement, nodes[0], index, data);
			}
		}
		cached = new data.constructor(data);
		cached.nodes = nodes;
		return cached;
	}

	function handleText(cached, data, index, parentElement, shouldReattach, editable, parentTag) {
		//handle text nodes
		return cached.nodes.length === 0 ? handleNonexistentNodes(data, parentElement, index) :
			cached.valueOf() !== data.valueOf() || shouldReattach === true ?
				reattachNodes(data, cached, parentElement, editable, index, parentTag) :
			(cached.nodes.intact = true, cached);
	}

	function getSubArrayCount(item) {
		if (item.$trusted) {
			//fix offset of next element if item was a trusted string w/ more than one html element
			//the first clause in the regexp matches elements
			//the second clause (after the pipe) matches text nodes
			var match = item.match(/<[^\/]|\>\s*[^<]/g);
			if (match != null) return match.length;
		}
		else if (isArray(item)) {
			return item.length;
		}
		return 1;
	}

	function buildArray(data, cached, parentElement, index, parentTag, shouldReattach, editable, namespace, configs) {
		data = flatten(data);
		var nodes = [], intact = cached.length === data.length, subArrayCount = 0;

		//keys algorithm: sort elements without recreating them if keys are present
		//1) create a map of all existing keys, and mark all for deletion
		//2) add new keys to map and mark them for addition
		//3) if key exists in new list, change action from deletion to a move
		//4) for each key, handle its corresponding action as marked in previous steps
		var existing = {}, shouldMaintainIdentities = false;
		forKeys(cached, function (attrs, i) {
			shouldMaintainIdentities = true;
			existing[cached[i].attrs.key] = {action: DELETION, index: i};
		});

		buildArrayKeys(data);
		if (shouldMaintainIdentities) cached = diffKeys(data, cached, existing, parentElement);
		//end key algorithm

		var cacheCount = 0;
		//faster explicitly written
		for (var i = 0, len = data.length; i < len; i++) {
			//diff each item in the array
			var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);

			if (item !== undefined) {
				intact = intact && item.nodes.intact;
				subArrayCount += getSubArrayCount(item);
				cached[cacheCount++] = item;
			}
		}

		if (!intact) diffArray(data, cached, nodes);
		return cached
	}

	function makeCache(data, cached, index, parentIndex, parentCache) {
		if (cached != null) {
			if (type.call(cached) === type.call(data)) return cached;

			if (parentCache && parentCache.nodes) {
				var offset = index - parentIndex, end = offset + (isArray(data) ? data : cached.nodes).length;
				clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end));
			} else if (cached.nodes) {
				clear(cached.nodes, cached);
			}
		}

		cached = new data.constructor();
		//if constructor creates a virtual dom element, use a blank object
		//as the base cached node instead of copying the virtual el (#277)
		if (cached.tag) cached = {};
		cached.nodes = [];
		return cached;
	}

	function constructNode(data, namespace) {
		return namespace === undefined ?
			data.attrs.is ? $document.createElement(data.tag, data.attrs.is) : $document.createElement(data.tag) :
			data.attrs.is ? $document.createElementNS(namespace, data.tag, data.attrs.is) : $document.createElementNS(namespace, data.tag);
	}

	function constructAttrs(data, node, namespace, hasKeys) {
		return hasKeys ? setAttributes(node, data.tag, data.attrs, {}, namespace) : data.attrs;
	}

	function constructChildren(data, node, cached, editable, namespace, configs) {
		return data.children != null && data.children.length > 0 ?
			build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs) :
			data.children;
	}

	function reconstructCached(data, attrs, children, node, namespace, views, controllers) {
		var cached = {tag: data.tag, attrs: attrs, children: children, nodes: [node]};
		unloadCachedControllers(cached, views, controllers);
		if (cached.children && !cached.children.nodes) cached.children.nodes = [];
		//edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
		if (data.tag === "select" && "value" in data.attrs) setAttributes(node, data.tag, {value: data.attrs.value}, {}, namespace);
		return cached
	}

	function getController(views, view, cachedControllers, controller) {
		var controllerIndex = m.redraw.strategy() === "diff" && views ? views.indexOf(view) : -1;
		return controllerIndex > -1 ? cachedControllers[controllerIndex] :
			typeof controller === "function" ? new controller() : {};
	}

	function updateLists(views, controllers, view, controller) {
		if (controller.onunload != null) unloaders.push({controller: controller, handler: controller.onunload});
		views.push(view);
		controllers.push(controller);
	}

	function checkView(data, view, cached, cachedControllers, controllers, views) {
		var controller = getController(cached.views, view, cachedControllers, data.controller);
		//Faster to coerce to number and check for NaN
		var key = +(data && data.attrs && data.attrs.key);
		data = pendingRequests === 0 || forcing || cachedControllers && cachedControllers.indexOf(controller) > -1 ? data.view(controller) : {tag: "placeholder"};
		if (data.subtree === "retain") return cached;
		if (key === key) (data.attrs = data.attrs || {}).key = key;
		updateLists(views, controllers, view, controller);
		return data;
	}

	function markViews(data, cached, views, controllers) {
		var cachedControllers = cached && cached.controllers;
		while (data.view != null) data = checkView(data, data.view.$original || data.view, cached, cachedControllers, controllers, views);
		return data;
	}

	function buildObject(data, cached, editable, parentElement, index, shouldReattach, namespace, configs) {
		var views = [], controllers = [];
		data = markViews(data, cached, views, controllers);
		if (!data.tag && controllers.length) throw new Error("Component template must return a virtual element, not an array, string, etc.");
		data.attrs = data.attrs || {};
		cached.attrs = cached.attrs || {};
		var dataAttrKeys = Object.keys(data.attrs);
		var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0);
		maybeRecreateObject(data, cached, dataAttrKeys);
		if (!isString(data.tag)) return;
		var isNew = cached.nodes.length === 0;
		namespace = getObjectNamespace(data, namespace);
		var node;
		if (isNew) {
			node = constructNode(data, namespace);
			//set attributes first, then create children
			var attrs = constructAttrs(data, node, namespace, hasKeys)
			var children = constructChildren(data, node, cached, editable, namespace, configs);
			cached = reconstructCached(data, attrs, children, node, namespace, views, controllers);
		}
		else {
			node = buildUpdatedNode(cached, data, editable, hasKeys, namespace, views, configs, controllers);
		}
		if (isNew || shouldReattach === true && node != null) insertNode(parentElement, node, index);
		//schedule configs to be called. They are called after `build`
		//finishes running
		scheduleConfigsToBeCalled(configs, data, node, isNew, cached);
		return cached
	}

	function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
		//`build` is a recursive function that manages creation/diffing/removal
		//of DOM elements based on comparison between `data` and `cached`
		//the diff algorithm can be summarized as this:
		//1 - compare `data` and `cached`
		//2 - if they are different, copy `data` to `cached` and update the DOM
		//    based on what the difference is
		//3 - recursively apply this algorithm for every array and for the
		//    children of every virtual element

		//the `cached` data structure is essentially the same as the previous
		//redraw's `data` data structure, with a few additions:
		//- `cached` always has a property called `nodes`, which is a list of
		//   DOM elements that correspond to the data represented by the
		//   respective virtual element
		//- in order to support attaching `nodes` as a property of `cached`,
		//   `cached` is *always* a non-primitive object, i.e. if the data was
		//   a string, then cached is a String instance. If data was `null` or
		//   `undefined`, cached is `new String("")`
		//- `cached also has a `configContext` property, which is the state
		//   storage object exposed by config(element, isInitialized, context)
		//- when `cached` is an Object, it represents a virtual element; when
		//   it's an Array, it represents a list of elements; when it's a
		//   String, Number or Boolean, it represents a text node

		//`parentElement` is a DOM element used for W3C DOM API calls
		//`parentTag` is only used for handling a corner case for textarea
		//values
		//`parentCache` is used to remove nodes in some multi-node cases
		//`parentIndex` and `index` are used to figure out the offset of nodes.
		//They're artifacts from before arrays started being flattened and are
		//likely refactorable
		//`data` and `cached` are, respectively, the new and old nodes being
		//diffed
		//`shouldReattach` is a flag indicating whether a parent node was
		//recreated (if so, and if this node is reused, then this node must
		//reattach itself to the new parent)
		//`editable` is a flag that indicates whether an ancestor is
		//contenteditable
		//`namespace` indicates the closest HTML namespace as it cascades down
		//from an ancestor
		//`configs` is a list of config functions to run after the topmost
		//`build` call finishes running

		//there's logic that relies on the assumption that null and undefined
		//data are equivalent to empty strings
		//- this prevents lifecycle surprises from procedural helpers that mix
		//  implicit and explicit return statements (e.g.
		//  function foo() {if (cond) return m("div")}
		//- it simplifies diffing code
		data = dataToString(data);
		if (data.subtree === "retain") return cached;
		cached = makeCache(data, cached, index, parentIndex, parentCache);
		return isArray(data) ? buildArray(data, cached, parentElement, index, parentTag, shouldReattach, editable, namespace, configs) :
			data != null && isObject(data) ? buildObject(data, cached, editable, parentElement, index, shouldReattach, namespace, configs) :
			!isFunction(data) ? handleText(cached, data, index, parentElement, shouldReattach, editable, parentTag) :
			cached;
	}
	function sortChanges(a, b) { return a.action - b.action || a.index - b.index; }
	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		for (var attrName in dataAttrs) {
			var dataAttr = dataAttrs[attrName];
			var cachedAttr = cachedAttrs[attrName];
			if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr)) {
				cachedAttrs[attrName] = dataAttr;
				//`config` isn't a real attributes, so ignore it
				if (attrName === "config" || attrName === "key") continue;
				//hook event handlers to the auto-redrawing system
				else if (isFunction(dataAttr) && attrName.slice(0, 2) === "on") {
				node[attrName] = autoredraw(dataAttr, node);
				}
				//handle `style: {...}`
				else if (attrName === "style" && dataAttr != null && isObject(dataAttr)) {
				for (var rule in dataAttr) {
						if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule];
				}
				for (var rule in cachedAttr) {
						if (!(rule in dataAttr)) node.style[rule] = "";
				}
				}
				//handle SVG
				else if (namespace != null) {
				if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr);
				else node.setAttribute(attrName === "className" ? "class" : attrName, dataAttr);
				}
				//handle cases that are properties (but ignore cases where we should use setAttribute instead)
				//- list and form are typically used as strings, but are DOM element references in js
				//- when using CSS selectors (e.g. `m("[style='']")`), style is used as a string, but it's an object in js
				else if (attrName in node && attrName !== "list" && attrName !== "style" && attrName !== "form" && attrName !== "type" && attrName !== "width" && attrName !== "height") {
				//#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
				if (tag !== "input" || node[attrName] !== dataAttr) node[attrName] = dataAttr;
				}
				else node.setAttribute(attrName, dataAttr);
			}
			//#348 dataAttr may not be a string, so use loose comparison (double equal) instead of strict (triple equal)
			else if (attrName === "value" && tag === "input" && node.value != dataAttr) {
				node.value = dataAttr;
			}
		}
		return cachedAttrs;
	}
	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				try { nodes[i].parentNode.removeChild(nodes[i]); }
				catch (e) {} //ignore if this fails due to order of events (see http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
				cached = [].concat(cached);
				if (cached[i]) unload(cached[i]);
			}
		}
		//release memory if nodes is an array. This check should fail if nodes is a NodeList (see loop above)
		if (nodes.length) nodes.length = 0;
	}
	function unload(cached) {
		if (cached.configContext && isFunction(cached.configContext.onunload)) {
			cached.configContext.onunload();
			cached.configContext.onunload = null;
		}
		if (cached.controllers) {
			forEach(cached.controllers, function (controller) {
				if (isFunction(controller.onunload)) controller.onunload({preventDefault: noop});
			});
		}
		if (cached.children) {
			if (isArray(cached.children)) forEach(cached.children, unload);
			else if (cached.children.tag) unload(cached.children);
		}
	}

	var insertAdjacentBeforeEnd = (function () {
		var rangeStrategy = function (parentElement, data) {
			parentElement.appendChild($document.createRange().createContextualFragment(data));
		};
		var insertAdjacentStrategy = function (parentElement, data) {
			parentElement.insertAdjacentHTML("beforeend", data);
		};

		try {
			$document.createRange().createContextualFragment('x');
			return rangeStrategy;
		} catch (e) {
			return insertAdjacentStrategy;
		}
	})();

	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index];
		if (nextSibling) {
			var isElement = nextSibling.nodeType !== 1;
			var placeholder = $document.createElement("span");
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling || null);
				placeholder.insertAdjacentHTML("beforebegin", data);
				parentElement.removeChild(placeholder);
			}
			else nextSibling.insertAdjacentHTML("beforebegin", data);
		}
		else insertAdjacentBeforeEnd(parentElement, data);

		var nodes = [];
		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index]);
			index++;
		}
		return nodes;
	}
	function autoredraw(callback, object) {
		return function(e) {
			e = e || event;
			m.redraw.strategy("diff");
			m.startComputation();
			try { return callback.call(object, e); }
			finally {
				endFirstComputation();
			}
		};
	}

	var html;
	var documentNode = {
		appendChild: function(node) {
			if (html === undefined) html = $document.createElement("html");
			if ($document.documentElement && $document.documentElement !== node) {
				$document.replaceChild(node, $document.documentElement);
			}
			else $document.appendChild(node);
			this.childNodes = $document.childNodes;
		},
		insertBefore: function(node) {
			this.appendChild(node);
		},
		childNodes: []
	};
	var nodeCache = [], cellCache = {};
	m.render = function(root, cell, forceRecreation) {
		var configs = [];
		if (!root) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.");
		var id = getCellCacheKey(root);
		var isDocumentRoot = root === $document;
		var node = isDocumentRoot || root === $document.documentElement ? documentNode : root;
		if (isDocumentRoot && cell.tag !== "html") cell = {tag: "html", attrs: {}, children: cell};
		if (cellCache[id] === undefined) clear(node.childNodes);
		if (forceRecreation === true) reset(root);
		cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs);
		forEach(configs, function (config) { config(); });
	};
	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element);
		return index < 0 ? nodeCache.push(element) - 1 : index;
	}

	m.trust = function(value) {
		value = new String(value);
		value.$trusted = true;
		return value;
	};

	function gettersetter(store) {
		var prop = function() {
			if (arguments.length) store = arguments[0];
			return store;
		};

		prop.toJSON = function() {
			return store;
		};

		return prop;
	}

	m.prop = function (store) {
		//note: using non-strict equality check here because we're checking if store is null OR undefined
		if ((store != null && isObject(store) || isFunction(store)) && isFunction(store.then)) {
			return propify(store);
		}

		return gettersetter(store);
	};

	var roots = [], components = [], controllers = [], lastRedrawId = null, lastRedrawCallTime = 0, computePreRedrawHook = null, computePostRedrawHook = null, topComponent, unloaders = [];
	var FRAME_BUDGET = 16; //60 frames per second = 1 call per 16 ms
	function parameterize(component, args) {
		var controller = function() {
			return (component.controller || noop).apply(this, args) || this;
		};
		if (component.controller) controller.prototype = component.controller.prototype;
		var view = function(ctrl) {
			var currentArgs = arguments.length > 1 ? args.concat([].slice.call(arguments, 1)) : args;
			return component.view.apply(component, currentArgs ? [ctrl].concat(currentArgs) : [ctrl]);
		};
		view.$original = component.view;
		var output = {controller: controller, view: view};
		if (args[0] && args[0].key != null) output.attrs = {key: args[0].key};
		return output;
	}
	m.component = function(component) {
		for (var args = [], i = 1; i < arguments.length; i++) args.push(arguments[i]);
		return parameterize(component, args);
	};
	m.mount = m.module = function(root, component) {
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
		var index = roots.indexOf(root);
		if (index < 0) index = roots.length;

		var isPrevented = false;
		var event = {preventDefault: function() {
			isPrevented = true;
			computePreRedrawHook = computePostRedrawHook = null;
		}};

		forEach(unloaders, function (unloader) {
			unloader.handler.call(unloader.controller, event);
			unloader.controller.onunload = null;
		});

		if (isPrevented) {
			forEach(unloaders, function (unloader) {
				unloader.controller.onunload = unloader.handler;
			});
		}
		else unloaders = [];

		if (controllers[index] && isFunction(controllers[index].onunload)) {
			controllers[index].onunload(event);
		}

		var isNullComponent = component === null;

		if (!isPrevented) {
			m.redraw.strategy("all");
			m.startComputation();
			roots[index] = root;
			var currentComponent = component ? (topComponent = component) : (topComponent = component = {controller: noop});
			var controller = new (component.controller || noop)();
			//controllers may call m.mount recursively (via m.route redirects, for example)
			//this conditional ensures only the last recursive m.mount call is applied
			if (currentComponent === topComponent) {
				controllers[index] = controller;
				components[index] = component;
			}
			endFirstComputation();
			if (isNullComponent) {
				removeRootElement(root, index);
			}
			return controllers[index];
		}
		if (isNullComponent) {
			removeRootElement(root, index);
		}
	};

	function removeRootElement(root, index) {
		roots.splice(index, 1);
		controllers.splice(index, 1);
		components.splice(index, 1);
		reset(root);
		nodeCache.splice(getCellCacheKey(root), 1);
	}

	var redrawing = false, forcing = false;
	m.redraw = function(force) {
		if (redrawing) return;
		redrawing = true;
		if (force) forcing = true;
		try {
			//lastRedrawId is a positive number if a second redraw is requested before the next animation frame
			//lastRedrawID is null if it's the first redraw and not an event handler
			if (lastRedrawId && !force) {
				//when setTimeout: only reschedule redraw if time between now and previous redraw is bigger than a frame, otherwise keep currently scheduled timeout
				//when rAF: always reschedule redraw
				if ($requestAnimationFrame === window.requestAnimationFrame || new Date - lastRedrawCallTime > FRAME_BUDGET) {
					if (lastRedrawId > 0) $cancelAnimationFrame(lastRedrawId);
					lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET);
				}
			}
			else {
				redraw();
				lastRedrawId = $requestAnimationFrame(function() { lastRedrawId = null; }, FRAME_BUDGET);
			}
		}
		finally {
			redrawing = forcing = false;
		}
	};
	m.redraw.strategy = m.prop();
	function redraw() {
		if (computePreRedrawHook) {
			computePreRedrawHook();
			computePreRedrawHook = null;
		}
		forEach(roots, function (root, i) {
			var component = components[i];
			if (controllers[i]) {
				var args = [controllers[i]];
				m.render(root, component.view ? component.view(controllers[i], args) : "");
			}
		});
		//after rendering within a routed context, we need to scroll back to the top, and fetch the document title for history.pushState
		if (computePostRedrawHook) {
			computePostRedrawHook();
			computePostRedrawHook = null;
		}
		lastRedrawId = null;
		lastRedrawCallTime = new Date;
		m.redraw.strategy("diff");
	}

	var pendingRequests = 0;
	m.startComputation = function() { pendingRequests++; };
	m.endComputation = function() {
		if (pendingRequests > 1) pendingRequests--;
		else {
			pendingRequests = 0;
			m.redraw();
		}
	}

	function endFirstComputation() {
		if (m.redraw.strategy() === "none") {
			pendingRequests--;
			m.redraw.strategy("diff");
		}
		else m.endComputation();
	}

	m.withAttr = function(prop, withAttrCallback, callbackThis) {
		return function(e) {
			e = e || event;
			var currentTarget = e.currentTarget || this;
			var _this = callbackThis || this;
			withAttrCallback.call(_this, prop in currentTarget ? currentTarget[prop] : currentTarget.getAttribute(prop));
		};
	};

	//routing
	var modes = {pathname: "", hash: "#", search: "?"};
	var redirect = noop, routeParams, currentRoute, isDefaultRoute = false;
	m.route = function(root, arg1, arg2, vdom) {
		//m.route()
		if (arguments.length === 0) return currentRoute;
		//m.route(el, defaultRoute, routes)
		else if (arguments.length === 3 && isString(arg1)) {
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source);
				if (!routeByValue(root, arg2, path)) {
					if (isDefaultRoute) throw new Error("Ensure the default route matches one of the routes defined in m.route");
					isDefaultRoute = true;
					m.route(arg1, true);
					isDefaultRoute = false;
				}
			};
			var listener = m.route.mode === "hash" ? "onhashchange" : "onpopstate";
			window[listener] = function() {
				var path = $location[m.route.mode];
				if (m.route.mode === "pathname") path += $location.search;
				if (currentRoute !== normalizeRoute(path)) redirect(path);
			};

			computePreRedrawHook = setScroll;
			window[listener]();
		}
		//config: m.route
		else if (root.addEventListener || root.attachEvent) {
			root.href = (m.route.mode !== 'pathname' ? $location.pathname : '') + modes[m.route.mode] + vdom.attrs.href;
			if (root.addEventListener) {
				root.removeEventListener("click", routeUnobtrusive);
				root.addEventListener("click", routeUnobtrusive);
			}
			else {
				root.detachEvent("onclick", routeUnobtrusive);
				root.attachEvent("onclick", routeUnobtrusive);
			}
		}
		//m.route(route, params, shouldReplaceHistoryEntry)
		else if (isString(root)) {
			var oldRoute = currentRoute;
			currentRoute = root;
			var args = arg1 || {};
			var queryIndex = currentRoute.indexOf("?");
			var params = queryIndex > -1 ? parseQueryString(currentRoute.slice(queryIndex + 1)) : {};
			for (var i in args) params[i] = args[i];
			var querystring = buildQueryString(params);
			var currentPath = queryIndex > -1 ? currentRoute.slice(0, queryIndex) : currentRoute;
			if (querystring) currentRoute = currentPath + (currentPath.indexOf("?") === -1 ? "?" : "&") + querystring;

			var shouldReplaceHistoryEntry = (arguments.length === 3 ? arg2 : arg1) === true || oldRoute === root;

			if (window.history.pushState) {
				computePreRedrawHook = setScroll;
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, $document.title, modes[m.route.mode] + currentRoute);
				};
				redirect(modes[m.route.mode] + currentRoute);
			}
			else {
				$location[m.route.mode] = currentRoute;
				redirect(modes[m.route.mode] + currentRoute);
			}
		}
	};
	m.route.param = function(key) {
		if (!routeParams) throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()");
		if( !key ){
			return routeParams;
		}
		return routeParams[key];
	};
	m.route.mode = "search";
	function normalizeRoute(route) {
		return route.slice(modes[m.route.mode].length);
	}
	function routeByValue(root, router, path) {
		routeParams = {};

		var queryStart = path.indexOf("?");
		if (queryStart !== -1) {
			routeParams = parseQueryString(path.substr(queryStart + 1, path.length));
			path = path.substr(0, queryStart);
		}

		// Get all routes and check if there's
		// an exact match for the current path
		var keys = Object.keys(router);
		var index = keys.indexOf(path);
		if(index !== -1){
			m.mount(root, router[keys [index]]);
			return true;
		}

		for (var route in router) {
			if (route === path) {
				m.mount(root, router[route]);
				return true;
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

			if (matcher.test(path)) {
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || [];
					var values = [].slice.call(arguments, 1, -2);
					forEach(keys, function (key, i) {
						routeParams[key.replace(/:|\./g, "")] = decodeURIComponent(values[i]);
					})
					m.mount(root, router[route]);
				});
				return true;
			}
		}
	}
	function routeUnobtrusive(e) {
		e = e || event;

		if (e.ctrlKey || e.metaKey || e.which === 2) return;

		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;

		var currentTarget = e.currentTarget || e.srcElement;
		var args = m.route.mode === "pathname" && currentTarget.search ? parseQueryString(currentTarget.search.slice(1)) : {};
		while (currentTarget && currentTarget.nodeName.toUpperCase() !== "A") currentTarget = currentTarget.parentNode;
		m.route(currentTarget[m.route.mode].slice(modes[m.route.mode].length), args);
	}
	function setScroll() {
		if (m.route.mode !== "hash" && $location.hash) $location.hash = $location.hash;
		else window.scrollTo(0, 0);
	}
	function buildQueryString(object, prefix) {
		var duplicates = {};
		var str = [];
		for (var prop in object) {
			var key = prefix ? prefix + "[" + prop + "]" : prop;
			var value = object[prop];

			if (value === null) {
				str.push(encodeURIComponent(key));
			} else if (isObject(value)) {
				str.push(buildQueryString(value, key));
			} else if (isArray(value)) {
				var keys = [];
				duplicates[key] = duplicates[key] || {};
				forEach(value, function (item) {
					if (!duplicates[key][item]) {
						duplicates[key][item] = true;
						keys.push(encodeURIComponent(key) + "=" + encodeURIComponent(item));
					}
				});
				str.push(keys.join("&"));
			} else if (value !== undefined) {
				str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
			}
		}
		return str.join("&");
	}
	function parseQueryString(str) {
		if (str === "" || str == null) return {};
		if (str.charAt(0) === "?") str = str.slice(1);

		var pairs = str.split("&"), params = {};
		forEach(pairs, function (string) {
			var pair = string.split("=");
			var key = decodeURIComponent(pair[0]);
			var value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
			if (params[key] != null) {
				if (!isArray(params[key])) params[key] = [params[key]];
				params[key].push(value);
			}
			else params[key] = value;
		});

		return params;
	}
	m.route.buildQueryString = buildQueryString;
	m.route.parseQueryString = parseQueryString;

	function reset(root) {
		var cacheKey = getCellCacheKey(root);
		clear(root.childNodes, cellCache[cacheKey]);
		cellCache[cacheKey] = undefined;
	}

	m.deferred = function () {
		var deferred = new Deferred();
		deferred.promise = propify(deferred.promise);
		return deferred;
	};
	function propify(promise, initialValue) {
		var prop = m.prop(initialValue);
		promise.then(prop);
		prop.then = function(resolve, reject) {
			return propify(promise.then(resolve, reject), initialValue);
		};
		prop["catch"] = prop.then.bind(null, null);
		prop["finally"] = function(callback) {
			var _callback = function() {return m.deferred().resolve(callback()).promise;};
			return prop.then(function(value) {
				return propify(_callback().then(function() {return value;}), initialValue);
			}, function(reason) {
				return propify(_callback().then(function() {throw new Error(reason);}), initialValue);
			});
		};
		return prop;
	}
	//Promiz.mithril.js | Zolmeister | MIT
	//a modified version of Promiz.js, which does not conform to Promises/A+ for two reasons:
	//1) `then` callbacks are called synchronously (because setTimeout is too slow, and the setImmediate polyfill is too big
	//2) throwing subclasses of Error cause the error to be bubbled up instead of triggering rejection (because the spec does not account for the important use case of default browser error handling, i.e. message w/ line number)
	function Deferred(successCallback, failureCallback) {
		var RESOLVING = 1, REJECTING = 2, RESOLVED = 3, REJECTED = 4;
		var self = this, state = 0, promiseValue = 0, next = [];

		self.promise = {};

		self.resolve = function(value) {
			if (!state) {
				promiseValue = value;
				state = RESOLVING;

				fire();
			}
			return this;
		};

		self.reject = function(value) {
			if (!state) {
				promiseValue = value;
				state = REJECTING;

				fire();
			}
			return this;
		};

		self.promise.then = function(successCallback, failureCallback) {
			var deferred = new Deferred(successCallback, failureCallback)
			if (state === RESOLVED) {
				deferred.resolve(promiseValue);
			}
			else if (state === REJECTED) {
				deferred.reject(promiseValue);
			}
			else {
				next.push(deferred);
			}
			return deferred.promise
		};

		function finish(type) {
			state = type || REJECTED;
			next.map(function(deferred) {
				state === RESOLVED ? deferred.resolve(promiseValue) : deferred.reject(promiseValue);
			});
		}

		function thennable(then, successCallback, failureCallback, notThennableCallback) {
			if (((promiseValue != null && isObject(promiseValue)) || isFunction(promiseValue)) && isFunction(then)) {
				try {
					// count protects against abuse calls from spec checker
					var count = 0;
					then.call(promiseValue, function(value) {
						if (count++) return;
						promiseValue = value;
						successCallback();
					}, function (value) {
						if (count++) return;
						promiseValue = value;
						failureCallback();
					});
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					failureCallback();
				}
			} else {
				notThennableCallback();
			}
		}

		function fire() {
			// check if it's a thenable
			var then;
			try {
				then = promiseValue && promiseValue.then;
			}
			catch (e) {
				m.deferred.onerror(e);
				promiseValue = e;
				state = REJECTING;
				return fire();
			}

			thennable(then, function() {
				state = RESOLVING;
				fire();
			}, function() {
				state = REJECTING;
				fire();
			}, function() {
				try {
					if (state === RESOLVING && isFunction(successCallback)) {
						promiseValue = successCallback(promiseValue);
					}
					else if (state === REJECTING && isFunction(failureCallback)) {
						promiseValue = failureCallback(promiseValue);
						state = RESOLVING;
					}
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					return finish();
				}

				if (promiseValue === self) {
					promiseValue = TypeError();
					finish();
				} else {
					thennable(then, function () {
						finish(RESOLVED);
					}, finish, function () {
						finish(state === RESOLVING && RESOLVED);
					});
				}
			});
		}
	}
	m.deferred.onerror = function(e) {
		if (type.call(e) === "[object Error]" && !e.constructor.toString().match(/ Error/)) {
			pendingRequests = 0;
			throw e;
		}
	};

	m.sync = function(args) {
		var method = "resolve";

		function synchronizer(pos, resolved) {
			return function(value) {
				results[pos] = value;
				if (!resolved) method = "reject";
				if (--outstanding === 0) {
					deferred.promise(results);
					deferred[method](results);
				}
				return value;
			};
		}

		var deferred = m.deferred();
		var outstanding = args.length;
		var results = new Array(outstanding);
		if (args.length > 0) {
			forEach(args, function (arg, i) {
				arg.then(synchronizer(i, true), synchronizer(i, false));
			});
		}
		else deferred.resolve([]);

		return deferred.promise;
	};
	function identity(value) { return value; }

	function ajax(options) {
		if (options.dataType && options.dataType.toLowerCase() === "jsonp") {
			var callbackKey = "mithril_callback_" + new Date().getTime() + "_" + (Math.round(Math.random() * 1e16)).toString(36)
			var script = $document.createElement("script");

			window[callbackKey] = function(resp) {
				script.parentNode.removeChild(script);
				options.onload({
					type: "load",
					target: {
						responseText: resp
					}
				});
				window[callbackKey] = undefined;
			};

			script.onerror = function() {
				script.parentNode.removeChild(script);

				options.onerror({
					type: "error",
					target: {
						status: 500,
						responseText: JSON.stringify({
							error: "Error making jsonp request"
						})
					}
				});
				window[callbackKey] = undefined;

				return false;
			}

			script.onload = function() {
				return false;
			};

			script.src = options.url
				+ (options.url.indexOf("?") > 0 ? "&" : "?")
				+ (options.callbackKey ? options.callbackKey : "callback")
				+ "=" + callbackKey
				+ "&" + buildQueryString(options.data || {});
			$document.body.appendChild(script);
		}
		else {
			var xhr = new window.XMLHttpRequest();
			xhr.open(options.method, options.url, true, options.user, options.password);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr});
					else options.onerror({type: "error", target: xhr});
				}
			};
			if (options.serialize === JSON.stringify && options.data && options.method !== "GET") {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			}
			if (options.deserialize === JSON.parse) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (isFunction(options.config)) {
				var maybeXhr = options.config(xhr, options);
				if (maybeXhr != null) xhr = maybeXhr;
			}

			var data = options.method === "GET" || !options.data ? "" : options.data;
			if (data && (!isString(data) && data.constructor !== window.FormData)) {
				throw new Error("Request data should be either be a string or FormData. Check the `serialize` option in `m.request`");
			}
			xhr.send(data);
			return xhr;
		}
	}

	function bindData(xhrOptions, data, serialize) {
		if (xhrOptions.method === "GET" && xhrOptions.dataType !== "jsonp") {
			var prefix = xhrOptions.url.indexOf("?") < 0 ? "?" : "&";
			var querystring = buildQueryString(data);
			xhrOptions.url = xhrOptions.url + (querystring ? prefix + querystring : "");
		}
		else xhrOptions.data = serialize(data);
		return xhrOptions;
	}

	function parameterizeUrl(url, data) {
		var tokens = url.match(/:[a-z]\w+/gi);
		if (tokens && data) {
			forEach(tokens, function (token) {
				var key = token.slice(1);
				url = url.replace(token, data[key]);
				delete data[key];
			});
		}
		return url;
	}

	m.request = function(xhrOptions) {
		if (xhrOptions.background !== true) m.startComputation();
		var deferred = new Deferred();
		var isJSONP = xhrOptions.dataType && xhrOptions.dataType.toLowerCase() === "jsonp"
		var serialize = xhrOptions.serialize = isJSONP ? identity : xhrOptions.serialize || JSON.stringify;
		var deserialize = xhrOptions.deserialize = isJSONP ? identity : xhrOptions.deserialize || JSON.parse;
		var extract = isJSONP ? function(jsonp) { return jsonp.responseText } : xhrOptions.extract || function(xhr) {
			if (xhr.responseText.length === 0 && deserialize === JSON.parse) {
				return null
			} else {
				return xhr.responseText
			}
		};
		xhrOptions.method = (xhrOptions.method || "GET").toUpperCase();
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data);
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize);
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event;
				var unwrap = (e.type === "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity;
				var response = unwrap(deserialize(extract(e.target, xhrOptions)), e.target);
				if (e.type === "load") {
					if (isArray(response) && xhrOptions.type) {
						forEach(response, function (res, i) {
							response[i] = new xhrOptions.type(res);
						});
					} else if (xhrOptions.type) {
						response = new xhrOptions.type(response);
					}
				}

				deferred[e.type === "load" ? "resolve" : "reject"](response);
			} catch (e) {
				m.deferred.onerror(e);
				deferred.reject(e);
			}

			if (xhrOptions.background !== true) m.endComputation()
		}

		ajax(xhrOptions);
		deferred.promise = propify(deferred.promise, xhrOptions.initialValue);
		return deferred.promise;
	};

	//testing API
	m.deps = function(mock) {
		initialize(window = mock || window);
		return window;
	};
	//for internal testing only, do not use `m.deps.factory`
	m.deps.factory = app;

	return m;
})(typeof window !== "undefined" ? window : {});

if (typeof module === "object" && module != null && module.exports) module.exports = m;
else if (typeof define === "function" && define.amd) define(function() { return m });

},{}],4:[function(require,module,exports){
var util = require('./util');

// https://gist.github.com/gre/1650294
var easing = {
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
};

function makePiece(k, piece, invert) {
  var key = invert ? util.invertKey(k) : k;
  return {
    key: key,
    pos: util.key2pos(key),
    role: piece.role,
    color: piece.color
  };
}

function samePiece(p1, p2) {
  return p1.role === p2.role && p1.color === p2.color;
}

function closer(piece, pieces) {
  return pieces.sort(function(p1, p2) {
    return util.distance(piece.pos, p1.pos) - util.distance(piece.pos, p2.pos);
  })[0];
}

function computePlan(prev, current) {
  var bounds = current.bounds(),
    width = bounds.width / 8,
    height = bounds.height / 8,
    anims = {},
    animedOrigs = [],
    fadings = [],
    missings = [],
    news = [],
    invert = prev.orientation !== current.orientation,
    prePieces = {},
    white = current.orientation === 'white';
  for (var pk in prev.pieces) {
    var piece = makePiece(pk, prev.pieces[pk], invert);
    prePieces[piece.key] = piece;
  }
  for (var i = 0; i < util.allKeys.length; i++) {
    var key = util.allKeys[i];
    if (key !== current.movable.dropped[1]) {
      var curP = current.pieces[key];
      var preP = prePieces[key];
      if (curP) {
        if (preP) {
          if (!samePiece(curP, preP)) {
            missings.push(preP);
            news.push(makePiece(key, curP, false));
          }
        } else
          news.push(makePiece(key, curP, false));
      } else if (preP)
        missings.push(preP);
    }
  }
  news.forEach(function(newP) {
    var preP = closer(newP, missings.filter(util.partial(samePiece, newP)));
    if (preP) {
      var orig = white ? preP.pos : newP.pos;
      var dest = white ? newP.pos : preP.pos;
      var vector = [(orig[0] - dest[0]) * width, (dest[1] - orig[1]) * height];
      anims[newP.key] = [vector, vector];
      animedOrigs.push(preP.key);
    }
  });
  missings.forEach(function(p) {
    if (p.key !== current.movable.dropped[0] && !util.containsX(animedOrigs, p.key)) {
      fadings.push({
        piece: {
          role: p.role,
          color: p.color
        },
        left: 12.5 * (white ? (p.pos[0] - 1) : (8 - p.pos[0])) + '%',
        bottom: 12.5 * (white ? (p.pos[1] - 1) : (8 - p.pos[1])) + '%',
        opacity: 1
      });
    }
  });

  return {
    anims: anims,
    fadings: fadings
  };
}

function roundBy(n, by) {
  return Math.round(n * by) / by;
}

function go(data) {
  if (!data.animation.current.start) return; // animation was canceled
  var rest = 1 - (new Date().getTime() - data.animation.current.start) / data.animation.current.duration;
  if (rest <= 0) {
    data.animation.current = {};
    data.render();
  } else {
    var ease = easing.easeInOutCubic(rest);
    for (var key in data.animation.current.anims) {
      var cfg = data.animation.current.anims[key];
      cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)];
    }
    for (var i in data.animation.current.fadings) {
      data.animation.current.fadings[i].opacity = roundBy(ease, 100);
    }
    data.render();
    util.requestAnimationFrame(function() {
      go(data);
    });
  }
}

function animate(transformation, data) {
  // clone data
  var prev = {
    orientation: data.orientation,
    pieces: {}
  };
  // clone pieces
  for (var key in data.pieces) {
    prev.pieces[key] = {
      role: data.pieces[key].role,
      color: data.pieces[key].color
    };
  }
  var result = transformation();
  var plan = computePlan(prev, data);
  if (Object.keys(plan.anims).length > 0 || plan.fadings.length > 0) {
    var alreadyRunning = data.animation.current.start;
    data.animation.current = {
      start: new Date().getTime(),
      duration: data.animation.duration,
      anims: plan.anims,
      fadings: plan.fadings
    };
    if (!alreadyRunning) go(data);
  } else {
    // don't animate, just render right away
    data.renderRAF();
  }
  return result;
}

// transformation is a function
// accepts board data and any number of arguments,
// and mutates the board.
module.exports = function(transformation, data, skip) {
  return function() {
    var transformationArgs = [data].concat(Array.prototype.slice.call(arguments, 0));
    if (!data.render) return transformation.apply(null, transformationArgs);
    else if (data.animation.enabled && !skip)
      return animate(util.partialApply(transformation, transformationArgs), data);
    else {
      var result = transformation.apply(null, transformationArgs);
      data.renderRAF();
      return result;
    }
  };
};

},{"./util":16}],5:[function(require,module,exports){
var board = require('./board');

module.exports = function(controller) {

  return {
    set: controller.set,
    toggleOrientation: controller.toggleOrientation,
    getOrientation: function () {
      return controller.data.orientation;
    },
    getPieces: function() {
      return controller.data.pieces;
    },
    getMaterialDiff: function() {
      return board.getMaterialDiff(controller.data);
    },
    getFen: controller.getFen,
    dump: function() {
      return controller.data;
    },
    move: controller.apiMove,
    setPieces: controller.setPieces,
    setCheck: controller.setCheck,
    playPremove: controller.playPremove,
    cancelPremove: controller.cancelPremove,
    cancelMove: controller.cancelMove,
    stop: controller.stop,
    explode: controller.explode,
    setAutoShapes: controller.setAutoShapes
  };
};

},{"./board":6}],6:[function(require,module,exports){
var util = require('./util');
var premove = require('./premove');
var anim = require('./anim');
var hold = require('./hold');

function callUserFunction(f) {
  setTimeout(f, 1);
}

function toggleOrientation(data) {
  data.orientation = util.opposite(data.orientation);
}

function reset(data) {
  data.lastMove = null;
  setSelected(data, null);
  unsetPremove(data);
}

function setPieces(data, pieces) {
  Object.keys(pieces).forEach(function(key) {
    if (pieces[key]) data.pieces[key] = pieces[key];
    else delete data.pieces[key];
  });
  data.movable.dropped = [];
}

function setCheck(data, color) {
  var checkColor = color || data.turnColor;
  Object.keys(data.pieces).forEach(function(key) {
    if (data.pieces[key].color === checkColor && data.pieces[key].role === 'king') data.check = key;
  });
}

function setPremove(data, orig, dest) {
  data.premovable.current = [orig, dest];
  callUserFunction(util.partial(data.premovable.events.set, orig, dest));
}

function unsetPremove(data) {
  if (data.premovable.current) {
    data.premovable.current = null;
    callUserFunction(data.premovable.events.unset);
  }
}

function tryAutoCastle(data, orig, dest) {
  if (!data.autoCastle) return;
  var king = data.pieces[dest];
  if (king.role !== 'king') return;
  var origPos = util.key2pos(orig);
  if (origPos[0] !== 5) return;
  if (origPos[1] !== 1 && origPos[1] !== 8) return;
  var destPos = util.key2pos(dest),
    oldRookPos, newRookPos, newKingPos;
  if (destPos[0] === 7 || destPos[0] === 8) {
    oldRookPos = util.pos2key([8, origPos[1]]);
    newRookPos = util.pos2key([6, origPos[1]]);
    newKingPos = util.pos2key([7, origPos[1]]);
  } else if (destPos[0] === 3 || destPos[0] === 1) {
    oldRookPos = util.pos2key([1, origPos[1]]);
    newRookPos = util.pos2key([4, origPos[1]]);
    newKingPos = util.pos2key([3, origPos[1]]);
  } else return;
  delete data.pieces[orig];
  delete data.pieces[dest];
  delete data.pieces[oldRookPos];
  data.pieces[newKingPos] = {
    role: 'king',
    color: king.color
  };
  data.pieces[newRookPos] = {
    role: 'rook',
    color: king.color
  };
}

function baseMove(data, orig, dest) {
  var success = anim(function() {
    if (orig === dest || !data.pieces[orig]) return false;
    var captured = (
      data.pieces[dest] &&
      data.pieces[dest].color !== data.pieces[orig].color
    ) ? data.pieces[dest] : null;
    callUserFunction(util.partial(data.events.move, orig, dest, captured));
    data.pieces[dest] = data.pieces[orig];
    delete data.pieces[orig];
    data.lastMove = [orig, dest];
    data.check = null;
    tryAutoCastle(data, orig, dest);
    callUserFunction(data.events.change);
    return true;
  }, data)();
  if (success) data.movable.dropped = [];
  return success;
}

function baseUserMove(data, orig, dest) {
  var result = baseMove(data, orig, dest);
  if (result) {
    data.movable.dests = {};
    data.turnColor = util.opposite(data.turnColor);
  }
  return result;
}

function apiMove(data, orig, dest) {
  return baseMove(data, orig, dest);
}

function userMove(data, orig, dest) {
  if (!dest) {
    hold.cancel();
    setSelected(data, null);
    if (data.movable.dropOff === 'trash') {
      delete data.pieces[orig];
      callUserFunction(data.events.change);
    }
  } else if (canMove(data, orig, dest)) {
    if (baseUserMove(data, orig, dest)) {
      var holdTime = hold.stop();
      setSelected(data, null);
      callUserFunction(util.partial(data.movable.events.after, orig, dest, {
        premove: false,
        holdTime: holdTime
      }));
      return true;
    }
  } else if (canPremove(data, orig, dest)) {
    setPremove(data, orig, dest);
    setSelected(data, null);
  } else if (isMovable(data, dest) || isPremovable(data, dest)) {
    setSelected(data, dest);
    hold.start();
  } else setSelected(data, null);
}

function selectSquare(data, key) {
  if (data.selected) {
    if (key) {
      if (data.selected !== key) {
        if (userMove(data, data.selected, key)) data.stats.dragged = false;
      } else hold.start();
    } else {
      setSelected(data, null);
      hold.cancel();
    }
  } else if (isMovable(data, key) || isPremovable(data, key)) {
    setSelected(data, key);
    hold.start();
  }
  if (key) callUserFunction(util.partial(data.events.select, key));
}

function setSelected(data, key) {
  data.selected = key;
  if (key && isPremovable(data, key))
    data.premovable.dests = premove(data.pieces, key, data.premovable.castle);
  else
    data.premovable.dests = null;
}

function isMovable(data, orig) {
  var piece = data.pieces[orig];
  return piece && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color &&
      data.turnColor === piece.color
    ));
}

function canMove(data, orig, dest) {
  return orig !== dest && isMovable(data, orig) && (
    data.movable.free || util.containsX(data.movable.dests[orig], dest)
  );
}

function isPremovable(data, orig) {
  var piece = data.pieces[orig];
  return piece && data.premovable.enabled &&
    data.movable.color === piece.color &&
    data.turnColor !== piece.color;
}

function canPremove(data, orig, dest) {
  return orig !== dest &&
    isPremovable(data, orig) &&
    util.containsX(premove(data.pieces, orig, data.premovable.castle), dest);
}

function isDraggable(data, orig) {
  var piece = data.pieces[orig];
  return piece && data.draggable.enabled && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color && (
        data.turnColor === piece.color || data.premovable.enabled
      )
    )
  );
}

function playPremove(data) {
  var move = data.premovable.current;
  if (!move) return;
  var orig = move[0],
    dest = move[1],
    success = false;
  if (canMove(data, orig, dest)) {
    if (baseUserMove(data, orig, dest)) {
      callUserFunction(util.partial(data.movable.events.after, orig, dest, {
        premove: true
      }));
      success = true;
    }
  }
  unsetPremove(data);
  return success;
}

function cancelMove(data) {
  unsetPremove(data);
  selectSquare(data, null);
}

function stop(data) {
  data.movable.color = null;
  data.movable.dests = {};
  cancelMove(data);
}

function getKeyAtDomPos(data, pos, bounds) {
  if (!bounds && !data.bounds) return;
  bounds = bounds || data.bounds(); // use provided value, or compute it
  var file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
  file = data.orientation === 'white' ? file : 9 - file;
  var rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
  rank = data.orientation === 'white' ? rank : 9 - rank;
  if (file > 0 && file < 9 && rank > 0 && rank < 9) return util.pos2key([file, rank]);
}

// {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
function getMaterialDiff(data) {
  var counts = {
    king: 0,
    queen: 0,
    rook: 0,
    bishop: 0,
    knight: 0,
    pawn: 0
  };
  for (var k in data.pieces) {
    var p = data.pieces[k];
    counts[p.role] += ((p.color === 'white') ? 1 : -1);
  }
  var diff = {
    white: {},
    black: {}
  };
  for (var role in counts) {
    var c = counts[role];
    if (c > 0) diff.white[role] = c;
    else if (c < 0) diff.black[role] = -c;
  }
  return diff;
}

module.exports = {
  reset: reset,
  toggleOrientation: toggleOrientation,
  setPieces: setPieces,
  setCheck: setCheck,
  selectSquare: selectSquare,
  setSelected: setSelected,
  isDraggable: isDraggable,
  canMove: canMove,
  userMove: userMove,
  apiMove: apiMove,
  playPremove: playPremove,
  unsetPremove: unsetPremove,
  cancelMove: cancelMove,
  stop: stop,
  getKeyAtDomPos: getKeyAtDomPos,
  getMaterialDiff: getMaterialDiff
};

},{"./anim":4,"./hold":13,"./premove":14,"./util":16}],7:[function(require,module,exports){
var merge = require('merge');
var board = require('./board');
var fen = require('./fen');

module.exports = function(data, config) {

  if (!config) return;

  // don't merge destinations. Just override.
  if (config.movable && config.movable.dests) delete data.movable.dests;

  merge.recursive(data, config);

  // if a fen was provided, replace the pieces
  if (data.fen) {
    data.pieces = fen.read(data.fen);
    data.check = config.check;
    data.drawable.shapes = [];
    delete data.fen;
  }

  if (data.check === true) board.setCheck(data);

  // forget about the last dropped piece
  data.movable.dropped = [];

  // fix move/premove dests
  if (data.selected) board.setSelected(data, data.selected);

  // no need for such short animations
  if (!data.animation.duration || data.animation.duration < 10)
    data.animation.enabled = false;
};

},{"./board":6,"./fen":12,"merge":2}],8:[function(require,module,exports){
var board = require('./board');
var data = require('./data');
var fen = require('./fen');
var configure = require('./configure');
var anim = require('./anim');
var drag = require('./drag');

module.exports = function(cfg) {

  this.data = data(cfg);

  this.vm = {
    exploding: false
  };

  this.getFen = function() {
    return fen.write(this.data.pieces);
  }.bind(this);

  this.set = anim(configure, this.data);

  this.toggleOrientation = anim(board.toggleOrientation, this.data);

  this.setPieces = anim(board.setPieces, this.data);

  this.selectSquare = anim(board.selectSquare, this.data, true);

  this.apiMove = anim(board.apiMove, this.data);

  this.playPremove = anim(board.playPremove, this.data);

  this.cancelPremove = anim(board.unsetPremove, this.data, true);

  this.setCheck = anim(board.setCheck, this.data, true);

  this.cancelMove = anim(function(data) {
    board.cancelMove(data);
    drag.cancel(data);
  }.bind(this), this.data, true);

  this.stop = anim(function(data) {
    board.stop(data);
    drag.cancel(data);
  }.bind(this), this.data, true);

  this.explode = function(keys) {
    if (!this.data.render) return;
    this.vm.exploding = keys;
    this.data.renderRAF();
    setTimeout(function() {
      this.vm.exploding = false;
      this.data.renderRAF();
    }.bind(this), 200);
  }.bind(this);

  this.setAutoShapes = function(shapes) {
    anim(function(data) {
      data.drawable.autoShapes = shapes;
    }, this.data, false)();
  }.bind(this);
};

},{"./anim":4,"./board":6,"./configure":7,"./data":9,"./drag":10,"./fen":12}],9:[function(require,module,exports){
var fen = require('./fen');
var configure = require('./configure');

module.exports = function(cfg) {
  var defaults = {
    pieces: fen.read(fen.initial),
    orientation: 'white', // board orientation. white | black
    turnColor: 'white', // turn to play. white | black
    check: null, // square currently in check "a2" | null
    lastMove: null, // squares part of the last move ["c3", "c4"] | null
    selected: null, // square currently selected "a1" | null
    coordinates: true, // include coords attributes
    render: null, // function that rerenders the board
    renderRAF: null, // function that rerenders the board using requestAnimationFrame
    element: null, // DOM element of the board, required for drag piece centering
    bounds: null, // function that calculates the board bounds
    autoCastle: false, // immediately complete the castle by moving the rook after king move
    viewOnly: false, // don't bind events: the user will never be able to move pieces around
    minimalDom: false, // don't use square elements. Optimization to use only with viewOnly
    disableContextMenu: false, // because who needs a context menu on a chessboard
    resizable: true, // listens to chessground.resize on document.body to clear bounds cache
    highlight: {
      lastMove: true, // add last-move class to squares
      check: true, // add check class to squares
      dragOver: true // add drag-over class to square when dragging over it
    },
    animation: {
      enabled: true,
      duration: 200,
      /*{ // current
       *  start: timestamp,
       *  duration: ms,
       *  anims: {
       *    a2: [
       *      [-30, 50], // animation goal
       *      [-20, 37]  // animation current status
       *    ], ...
       *  },
       *  fading: [
       *    {
       *      pos: [80, 120], // position relative to the board
       *      opacity: 0.34,
       *      role: 'rook',
       *      color: 'black'
       *    }
       *  }
       *}*/
      current: {}
    },
    movable: {
      free: true, // all moves are valid - board editor
      color: 'both', // color that can move. white | black | both | null
      dests: {}, // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]} | null
      dropOff: 'revert', // when a piece is dropped outside the board. "revert" | "trash"
      dropped: [], // last dropped [orig, dest], not to be animated
      showDests: true, // whether to add the move-dest class on squares
      events: {
        after: function(orig, dest, metadata) {} // called after the move has been played
      }
    },
    premovable: {
      enabled: true, // allow premoves for color that can not move
      showDests: true, // whether to add the premove-dest class on squares
      castle: true, // whether to allow king castle premoves
      dests: [], // premove destinations for the current selection
      current: null, // keys of the current saved premove ["e2" "e4"] | null
      events: {
        set: function(orig, dest) {}, // called after the premove has been set
        unset: function() {} // called after the premove has been unset
      }
    },
    draggable: {
      enabled: true, // allow moves & premoves to use drag'n drop
      distance: 3, // minimum distance to initiate a drag, in pixels
      autoDistance: true, // lets chessground set distance to zero when user drags pieces
      squareTarget: false, // display big square target intended for mobile
      centerPiece: true, // center the piece on cursor at drag start
      showGhost: true, // show ghost of piece being dragged
      /*{ // current
       *  orig: "a2", // orig key of dragging piece
       *  rel: [100, 170] // x, y of the piece at original position
       *  pos: [20, -12] // relative current position
       *  dec: [4, -8] // piece center decay
       *  over: "b3" // square being moused over
       *  bounds: current cached board bounds
       *  started: whether the drag has started, as per the distance setting
       *}*/
      current: {}
    },
    stats: {
      // was last piece dragged or clicked?
      // needs default to false for touch
      dragged: !('ontouchstart' in window)
    },
    events: {
      change: function() {}, // called after the situation changes on the board
      // called after a piece has been moved.
      // capturedPiece is null or like {color: 'white', 'role': 'queen'}
      move: function(orig, dest, capturedPiece) {},
      capture: function(key, piece) {}, // DEPRECATED called when a piece has been captured
      select: function(key) {} // called when a square is selected
    },
    drawable: {
      enabled: false, // allows SVG drawings
      // user shapes
      shapes: [
        // {brush: 'green', orig: 'e8'},
        // {brush: 'yellow', orig: 'c4', dest: 'f7'}
      ],
      // computer shapes
      autoShapes: [
        // {brush: 'paleBlue', orig: 'e8'},
        // {brush: 'paleRed', orig: 'c4', dest: 'f7'}
      ],
      /*{ // current
       *  orig: "a2", // orig key of drawing
       *  pos: [20, -12] // relative current position
       *  dest: "b3" // square being moused over
       *  bounds: // current cached board bounds
       *  brush: 'green' // brush name for shape
       *}*/
      current: {},
      brushes: {
        green: {
          key: 'g',
          color: '#15781B',
          opacity: 1,
          lineWidth: 10,
          circleMargin: 0
        },
        red: {
          key: 'r',
          color: '#882020',
          opacity: 1,
          lineWidth: 10,
          circleMargin: 1
        },
        blue: {
          key: 'b',
          color: '#003088',
          opacity: 1,
          lineWidth: 10,
          circleMargin: 2
        },
        yellow: {
          key: 'y',
          color: '#e68f00',
          opacity: 1,
          lineWidth: 10,
          circleMargin: 3
        },
        paleBlue: {
          key: 'pb',
          color: '#003088',
          opacity: 0.45,
          lineWidth: 15,
          circleMargin: 0
        },
        paleGreen: {
          key: 'pg',
          color: '#15781B',
          opacity: 0.55,
          lineWidth: 15,
          circleMargin: 0
        }
      }
    }
  };

  configure(defaults, cfg || {});

  return defaults;
};

},{"./configure":7,"./fen":12}],10:[function(require,module,exports){
var board = require('./board');
var util = require('./util');

var originTarget;

function hashPiece(piece) {
  return piece ? piece.color + piece.role : '';
}

function computeSquareBounds(data, bounds, key) {
  var pos = util.key2pos(key);
  if (data.orientation !== 'white') {
    pos[0] = 9 - pos[0];
    pos[1] = 9 - pos[1];
  }
  return {
    left: bounds.left + bounds.width * (pos[0] - 1) / 8,
    top: bounds.top + bounds.height * (8 - pos[1]) / 8,
    width: bounds.width / 8,
    height: bounds.height / 8
  };
}

function start(data, e) {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  originTarget = e.target;
  var previouslySelected = data.selected;
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPos(data, position, bounds);
  var hadPremove = !!data.premovable.current;
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (data.pieces[orig] && stillSelected && board.isDraggable(data, orig)) {
    var squareBounds = computeSquareBounds(data, bounds, orig);
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      piece: hashPiece(data.pieces[orig]),
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: data.draggable.centerPiece ? [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ] : [0, 0],
      bounds: bounds,
      started: data.draggable.autoDistance && data.stats.dragged
    };
  } else if (hadPremove) board.unsetPremove(data);
  processDrag(data);
}

function processDrag(data) {
  util.requestAnimationFrame(function() {
    var cur = data.draggable.current;
    if (cur.orig) {
      // cancel animations while dragging
      if (data.animation.current.start && data.animation.current.anims[cur.orig])
        data.animation.current = {};
      // if moving piece is gone, cancel
      if (hashPiece(data.pieces[cur.orig]) !== cur.piece) cancel(data);
      else {
        if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance)
          cur.started = true;
        if (cur.started) {
          cur.pos = [
            cur.epos[0] - cur.rel[0],
            cur.epos[1] - cur.rel[1]
          ];
          cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
        }
      }
    }
    data.render();
    if (cur.orig) processDrag(data);
  });
}

function move(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only

  if (data.draggable.current.orig)
    data.draggable.current.epos = util.eventPosition(e);
}

function end(data, e) {
  var draggable = data.draggable;
  var orig = draggable.current ? draggable.current.orig : null;
  if (!orig) return;
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e && e.type === "touchend" && originTarget !== e.target) return;
  board.unsetPremove(data);
  var dest = draggable.current.over;
  if (draggable.current.started) {
    if (orig !== dest) data.movable.dropped = [orig, dest];
    if (board.userMove(data, orig, dest)) data.stats.dragged = true;
  }
  if (orig === draggable.current.previouslySelected && (orig === dest || !dest))
    board.setSelected(data, null);
  draggable.current = {};
}

function cancel(data) {
  if (data.draggable.current.orig) {
    data.draggable.current = {};
    board.selectSquare(data, null);
  }
}

module.exports = {
  start: start,
  move: move,
  end: end,
  cancel: cancel,
  processDrag: processDrag // must be exposed for board editors
};

},{"./board":6,"./util":16}],11:[function(require,module,exports){
var board = require('./board');
var util = require('./util');

var brushes = ['green', 'red', 'blue', 'yellow'];

function hashPiece(piece) {
  return piece ? piece.color + ' ' + piece.role : '';
}

function start(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  board.cancelMove(data);
  var position = util.eventPosition(e);
  var bounds = data.bounds();
  var orig = board.getKeyAtDomPos(data, position, bounds);
  data.drawable.current = {
    orig: orig,
    epos: position,
    bounds: bounds,
    brush: brushes[(e.shiftKey & util.isRightButton(e)) + (e.altKey ? 2 : 0)]
  };
  processDraw(data);
}

function processDraw(data) {
  util.requestAnimationFrame(function() {
    var cur = data.drawable.current;
    if (cur.orig) {
      var dest = board.getKeyAtDomPos(data, cur.epos, cur.bounds);
      if (cur.orig === dest) cur.dest = undefined;
      else cur.dest = dest;
    }
    data.render();
    if (cur.orig) processDraw(data);
  });
}

function move(data, e) {
  if (data.drawable.current.orig)
    data.drawable.current.epos = util.eventPosition(e);
}

function end(data, e) {
  var drawable = data.drawable;
  var orig = drawable.current.orig;
  var dest = drawable.current.dest;
  if (orig && dest) addLine(drawable, orig, dest);
  else if (orig) addCircle(drawable, orig);
  drawable.current = {};
  data.render();
}

function cancel(data) {
  if (data.drawable.current.orig) data.drawable.current = {};
}

function clear(data, e) {
  if (e.button !== 0 || e.shiftKey) return; // only left click
  if (data.drawable.shapes.length) {
    data.drawable.shapes = [];
    data.render();
  }
}

function not(f) {
  return function(x) {
    return !f(x);
  };
}

function addCircle(drawable, key) {
  var brush = drawable.current.brush;
  var sameCircle = function(s) {
    return s.brush === brush && s.orig === key && !s.dest;
  };
  var exists = drawable.shapes.filter(sameCircle).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameCircle));
  else drawable.shapes.push({
    brush: brush,
    orig: key
  });
}

function addLine(drawable, orig, dest) {
  var brush = drawable.current.brush;
  var sameLine = function(s) {
    return s.orig && s.dest && (
      (s.orig === orig && s.dest === dest) ||
      (s.dest === orig && s.orig === dest)
    );
  };
  var exists = drawable.shapes.filter(sameLine).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameLine));
  else drawable.shapes.push({
    brush: brush,
    orig: orig,
    dest: dest
  });
}

module.exports = {
  start: start,
  move: move,
  end: end,
  cancel: cancel,
  clear: clear,
  processDraw: processDraw
};

},{"./board":6,"./util":16}],12:[function(require,module,exports){
var util = require('./util');

var initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

var roles = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king"
};

var letters = {
  pawn: "p",
  rook: "r",
  knight: "n",
  bishop: "b",
  queen: "q",
  king: "k"
};

function read(fen) {
  if (fen === 'start') fen = initial;
  var pieces = {};
  fen.replace(/ .+$/, '').split('/').forEach(function(row, y) {
    var x = 0;
    row.split('').forEach(function(v) {
      var nb = parseInt(v);
      if (nb) x += nb;
      else {
        x++;
        pieces[util.pos2key([x, 8 - y])] = {
          role: roles[v.toLowerCase()],
          color: v === v.toLowerCase() ? 'black' : 'white'
        };
      }
    });
  });

  return pieces;
}

function write(pieces) {
  return [8, 7, 6, 5, 4, 3, 2].reduce(
    function(str, nb) {
      return str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), nb);
    },
    util.invRanks.map(function(y) {
      return util.ranks.map(function(x) {
        var piece = pieces[util.pos2key([x, y])];
        if (piece) {
          var letter = letters[piece.role];
          return piece.color === 'white' ? letter.toUpperCase() : letter;
        } else return '1';
      }).join('');
    }).join('/'));
}

module.exports = {
  initial: initial,
  read: read,
  write: write
};

},{"./util":16}],13:[function(require,module,exports){
var startAt;

var start = function() {
  startAt = new Date();
};

var cancel = function() {
  startAt = null;
};

var stop = function() {
  if (!startAt) return 0;
  var time = new Date() - startAt;
  startAt = null;
  return time;
};

module.exports = {
  start: start,
  cancel: cancel,
  stop: stop
};

},{}],14:[function(require,module,exports){
var util = require('./util');

function diff(a, b) {
  return Math.abs(a - b);
}

function pawn(color, x1, y1, x2, y2) {
  return diff(x1, x2) < 2 && (
    color === 'white' ? (
      // allow 2 squares from 1 and 8, for horde
      y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)
    ) : (
      y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2)
    )
  );
}

function knight(x1, y1, x2, y2) {
  var xd = diff(x1, x2);
  var yd = diff(y1, y2);
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
}

function bishop(x1, y1, x2, y2) {
  return diff(x1, x2) === diff(y1, y2);
}

function rook(x1, y1, x2, y2) {
  return x1 === x2 || y1 === y2;
}

function queen(x1, y1, x2, y2) {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
}

function king(color, rookFiles, canCastle, x1, y1, x2, y2) {
  return (
    diff(x1, x2) < 2 && diff(y1, y2) < 2
  ) || (
    canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && (
      (x1 === 5 && (x2 === 3 || x2 === 7)) || util.containsX(rookFiles, x2)
    )
  );
}

function rookFilesOf(pieces, color) {
  return Object.keys(pieces).filter(function(key) {
    var piece = pieces[key];
    return piece && piece.color === color && piece.role === 'rook';
  }).map(function(key) {
    return util.key2pos(key)[0];
  });
}

function compute(pieces, key, canCastle) {
  var piece = pieces[key];
  var pos = util.key2pos(key);
  var mobility;
  switch (piece.role) {
    case 'pawn':
      mobility = pawn.bind(null, piece.color);
      break;
    case 'knight':
      mobility = knight;
      break;
    case 'bishop':
      mobility = bishop;
      break;
    case 'rook':
      mobility = rook;
      break;
    case 'queen':
      mobility = queen;
      break;
    case 'king':
      mobility = king.bind(null, piece.color, rookFilesOf(pieces, piece.color), canCastle);
      break;
  }
  return util.allPos.filter(function(pos2) {
    return (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]);
  }).map(util.pos2key);
}

module.exports = compute;

},{"./util":16}],15:[function(require,module,exports){
var m = require('mithril');
var key2pos = require('./util').key2pos;

function circleWidth(current, bounds) {
  return (current ? 2 : 4) / 512 * bounds.width;
}

function lineWidth(brush, current, bounds) {
  return (brush.lineWidth || 10) * (current ? 0.7 : 1) / 512 * bounds.width;
}

function opacity(brush, current) {
  return (brush.opacity || 1) * (current ? 0.6 : 1);
}

function arrowMargin(current, bounds) {
  return (current ? 12 : 24) / 512 * bounds.width;
}

function pos2px(pos, bounds) {
  var squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

function circle(brush, pos, current, bounds) {
  var o = pos2px(pos, bounds);
  var width = circleWidth(current, bounds);
  var radius = bounds.width / 16;
  return {
    tag: 'circle',
    attrs: {
      key: current ? 'current' : pos + brush.key,
      stroke: brush.color,
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(brush, current),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2 - brush.circleMargin * width * 1.5
    }
  };
}

function arrow(brush, orig, dest, current, bounds) {
  var m = arrowMargin(current, bounds);
  var a = pos2px(orig, bounds);
  var b = pos2px(dest, bounds);
  var dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx);
  var xo = Math.cos(angle) * m,
    yo = Math.sin(angle) * m;
  return {
    tag: 'line',
    attrs: {
      key: current ? 'current' : orig + dest + brush.key,
      stroke: brush.color,
      'stroke-width': lineWidth(brush, current, bounds),
      'stroke-linecap': 'round',
      'marker-end': 'url(#arrowhead-' + brush.key + ')',
      opacity: opacity(brush, current),
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    }
  };
}

function defs(brushes) {
  return {
    tag: 'defs',
    children: [
      brushes.map(function(brush) {
        return {
          key: brush.key,
          tag: 'marker',
          attrs: {
            id: 'arrowhead-' + brush.key,
            orient: 'auto',
            markerWidth: 4,
            markerHeight: 8,
            refX: 2.05,
            refY: 2.01
          },
          children: [{
            tag: 'path',
            attrs: {
              d: 'M0,0 V4 L3,2 Z',
              fill: brush.color
            }
          }]
        }
      })
    ]
  };
}

function orient(pos, color) {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function renderShape(orientation, current, brushes, bounds) {
  return function(shape) {
    if (shape.orig && shape.dest) return arrow(
      brushes[shape.brush],
      orient(key2pos(shape.orig), orientation),
      orient(key2pos(shape.dest), orientation),
      current, bounds);
    else if (shape.orig) return circle(
      brushes[shape.brush],
      orient(key2pos(shape.orig), orientation),
      current, bounds);
  };
}

module.exports = function(ctrl) {
  if (!ctrl.data.bounds) return;
  var bounds = ctrl.data.bounds();
  if (bounds.width !== bounds.height) return;
  var d = ctrl.data.drawable;
  var allShapes = d.shapes.concat(d.autoShapes);
  if (!allShapes.length && !d.current.orig) return;
  var usedBrushes = Object.keys(ctrl.data.drawable.brushes).filter(function(name) {
    return (d.current && d.current.dest && d.current.brush === name) || allShapes.filter(function(s) {
      return s.dest && s.brush === name;
    }).length;
  }).map(function(name) {
    return ctrl.data.drawable.brushes[name];
  });
  return {
    tag: 'svg',
    children: [
      defs(usedBrushes),
      allShapes.map(renderShape(ctrl.data.orientation, false, ctrl.data.drawable.brushes, bounds)),
      renderShape(ctrl.data.orientation, true, ctrl.data.drawable.brushes, bounds)(d.current)
    ]
  };
}

},{"./util":16,"mithril":3}],16:[function(require,module,exports){
var files = "abcdefgh".split('');
var ranks = [1, 2, 3, 4, 5, 6, 7, 8];
var invRanks = [8, 7, 6, 5, 4, 3, 2, 1];

function pos2key(pos) {
  return files[pos[0] - 1] + pos[1];
}

function key2pos(pos) {
  return [(files.indexOf(pos[0]) + 1), parseInt(pos[1])];
}

function invertKey(key) {
  return files[7 - files.indexOf(key[0])] + (9 - parseInt(key[1]));
}

var allPos = (function() {
  var ps = [];
  invRanks.forEach(function(y) {
    ranks.forEach(function(x) {
      ps.push([x, y]);
    });
  });
  return ps;
})();
var invPos = allPos.slice().reverse();
var allKeys = allPos.map(pos2key);

function classSet(classes) {
  var arr = [];
  for (var i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
}

function opposite(color) {
  return color === 'white' ? 'black' : 'white';
}

function contains2(xs, x) {
  return xs && (xs[0] === x || xs[1] === x);
}

function containsX(xs, x) {
  return xs && xs.indexOf(x) !== -1;
}

function distance(pos1, pos2) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

// this must be cached because of the access to document.body.style
var cachedTransformProp;

function computeTransformProp() {
  return 'transform' in document.body.style ?
    'transform' : 'webkitTransform' in document.body.style ?
    'webkitTransform' : 'mozTransform' in document.body.style ?
    'mozTransform' : 'oTransform' in document.body.style ?
    'oTransform' : 'msTransform';
}

function transformProp() {
  if (!cachedTransformProp) cachedTransformProp = computeTransformProp();
  return cachedTransformProp;
}

function translate(pos) {
  return 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
}

function eventPosition(e) {
  return e.touches ? [e.targetTouches[0].clientX, e.targetTouches[0].clientY] : [e.clientX, e.clientY];
}

function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

function partial() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
}

function isRightButton(e) {
  return e.buttons === 2 || e.button === 2;
}

function memo(f) {
  var v, ret = function() {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = function() {
    v = undefined;
  }
  return ret;
}

module.exports = {
  files: files,
  ranks: ranks,
  invRanks: invRanks,
  allPos: allPos,
  invPos: invPos,
  allKeys: allKeys,
  pos2key: pos2key,
  key2pos: key2pos,
  invertKey: invertKey,
  classSet: classSet,
  opposite: opposite,
  translate: translate,
  contains2: contains2,
  containsX: containsX,
  distance: distance,
  eventPosition: eventPosition,
  partialApply: partialApply,
  partial: partial,
  transformProp: transformProp,
  requestAnimationFrame: (window.requestAnimationFrame || window.setTimeout).bind(window),
  isRightButton: isRightButton,
  memo: memo
};

},{}],17:[function(require,module,exports){
var drag = require('./drag');
var draw = require('./draw');
var util = require('./util');
var svg = require('./svg');
var m = require('mithril');

function pieceClass(p) {
  return p.role + ' ' + p.color;
}

function renderPiece(ctrl, key, p) {
  var attrs = {
    style: {},
    class: pieceClass(p)
  };
  var draggable = ctrl.data.draggable.current;
  if (draggable.orig === key && draggable.started) {
    attrs.style[util.transformProp()] = util.translate([
      draggable.pos[0] + draggable.dec[0],
      draggable.pos[1] + draggable.dec[1]
    ]);
    attrs.class += ' dragging';
  } else if (ctrl.data.animation.current.anims) {
    var animation = ctrl.data.animation.current.anims[key];
    if (animation) attrs.style[util.transformProp()] = util.translate(animation[1]);
  }
  return {
    tag: 'piece',
    attrs: attrs
  };
}

function renderGhost(p) {
  return {
    tag: 'piece',
    attrs: {
      class: pieceClass(p) + ' ghost'
    }
  };
}

function renderSquare(ctrl, pos, asWhite) {
  var file = util.files[pos[0] - 1];
  var rank = pos[1];
  var key = file + rank;
  var piece = ctrl.data.pieces[key];
  var isDragOver = ctrl.data.highlight.dragOver && ctrl.data.draggable.current.over === key;
  var classes = util.classSet({
    'selected': ctrl.data.selected === key,
    'check': ctrl.data.highlight.check && ctrl.data.check === key,
    'last-move': ctrl.data.highlight.lastMove && util.contains2(ctrl.data.lastMove, key),
    'move-dest': (isDragOver || ctrl.data.movable.showDests) && util.containsX(ctrl.data.movable.dests[ctrl.data.selected], key),
    'premove-dest': (isDragOver || ctrl.data.premovable.showDests) && util.containsX(ctrl.data.premovable.dests, key),
    'current-premove': util.contains2(ctrl.data.premovable.current, key),
    'drag-over': isDragOver,
    'oc': !!piece,
    'exploding': ctrl.vm.exploding && ctrl.vm.exploding.indexOf(key) !== -1
  });
  var attrs = {
    style: {
      left: (asWhite ? pos[0] - 1 : 8 - pos[0]) * 12.5 + '%',
      bottom: (asWhite ? pos[1] - 1 : 8 - pos[1]) * 12.5 + '%'
    }
  };
  if (classes) attrs.class = classes;
  if (ctrl.data.coordinates) {
    if (pos[1] === (asWhite ? 1 : 8)) attrs['data-coord-x'] = file;
    if (pos[0] === (asWhite ? 8 : 1)) attrs['data-coord-y'] = rank;
  }
  var children = [];
  if (piece) {
    children.push(renderPiece(ctrl, key, piece));
    if (ctrl.data.draggable.current.orig === key && ctrl.data.draggable.showGhost) {
      children.push(renderGhost(piece));
    }
  }
  return {
    tag: 'square',
    attrs: attrs,
    children: children
  };
}

function renderSquareTarget(ctrl, cur) {
  var pos = util.key2pos(cur.over),
    x = ctrl.data.orientation === 'white' ? pos[0] : 9 - pos[0],
    y = ctrl.data.orientation === 'white' ? pos[1] : 9 - pos[1];
  return {
    tag: 'div',
    attrs: {
      id: 'cg-square-target',
      style: {
        width: cur.bounds.width / 4 + 'px',
        height: cur.bounds.height / 4 + 'px',
        left: (x - 1.5) * cur.bounds.width / 8 + 'px',
        top: (7.5 - y) * cur.bounds.height / 8 + 'px'
      }
    }
  };
}

function renderFading(cfg) {
  return {
    tag: 'square',
    attrs: {
      class: 'fading',
      style: {
        left: cfg.left,
        bottom: cfg.bottom,
        opacity: cfg.opacity
      }
    },
    children: [{
      tag: 'piece',
      attrs: {
        class: pieceClass(cfg.piece)
      }
    }]
  };
}

function renderMinimalDom(ctrl, asWhite) {
  var children = [];
  if (ctrl.data.lastMove) ctrl.data.lastMove.forEach(function(key) {
    var pos = util.key2pos(key);
    children.push({
      tag: 'square',
      attrs: {
        class: 'last-move',
        style: {
          left: (asWhite ? pos[0] - 1 : 8 - pos[0]) * 12.5 + '%',
          bottom: (asWhite ? pos[1] - 1 : 8 - pos[1]) * 12.5 + '%'
        }
      }
    });
  });
  var piecesKeys = Object.keys(ctrl.data.pieces);
  for (var i = 0, len = piecesKeys.length; i < len; i++) {
    var key = piecesKeys[i];
    var pos = util.key2pos(key);
    var attrs = {
      style: {
        left: (asWhite ? pos[0] - 1 : 8 - pos[0]) * 12.5 + '%',
        bottom: (asWhite ? pos[1] - 1 : 8 - pos[1]) * 12.5 + '%'
      },
      class: pieceClass(ctrl.data.pieces[key])
    };
    if (ctrl.data.animation.current.anims) {
      var animation = ctrl.data.animation.current.anims[key];
      if (animation) attrs.style[util.transformProp()] = util.translate(animation[1]);
    }
    children.push({
      tag: 'piece',
      attrs: attrs
    });
  }

  return children;
}

function renderContent(ctrl) {
  var asWhite = ctrl.data.orientation === 'white';
  if (ctrl.data.minimalDom) return renderMinimalDom(ctrl, asWhite);
  var positions = asWhite ? util.allPos : util.invPos;
  var children = [];
  for (var i = 0, len = positions.length; i < len; i++) {
    children.push(renderSquare(ctrl, positions[i], asWhite));
  }
  if (ctrl.data.draggable.current.over && ctrl.data.draggable.squareTarget)
    children.push(renderSquareTarget(ctrl, ctrl.data.draggable.current));
  if (ctrl.data.animation.current.fadings)
    ctrl.data.animation.current.fadings.forEach(function(p) {
      children.push(renderFading(p));
    });
  if (ctrl.data.drawable.enabled) children.push(svg(ctrl));
  return children;
}

function dragOrDraw(d, withDrag, withDraw) {
  return function(e) {
    if (util.isRightButton(e) && d.draggable.current.orig) {
      d.draggable.current = {}
      d.selected = null;
    }
    else if (d.drawable.enabled && (e.shiftKey || util.isRightButton(e))) withDraw(d, e);
    else if (!d.viewOnly) withDrag(d, e);
  };
}

function bindEvents(ctrl, el, context) {
  var d = ctrl.data;
  var onstart = dragOrDraw(d, drag.start, draw.start);
  var onmove = dragOrDraw(d, drag.move, draw.move);
  var onend = dragOrDraw(d, drag.end, draw.end);
  var drawClear = util.partial(draw.clear, d);
  var startEvents = ['touchstart', 'mousedown'];
  var moveEvents = ['touchmove', 'mousemove'];
  var endEvents = ['touchend', 'mouseup'];
  startEvents.forEach(function(ev) {
    el.addEventListener(ev, onstart);
  });
  moveEvents.forEach(function(ev) {
    document.addEventListener(ev, onmove);
  });
  endEvents.forEach(function(ev) {
    document.addEventListener(ev, onend);
  });
  el.addEventListener('mousedown', drawClear);
  context.onunload = function() {
    startEvents.forEach(function(ev) {
      el.removeEventListener(ev, onstart);
    });
    moveEvents.forEach(function(ev) {
      document.removeEventListener(ev, onmove);
    });
    endEvents.forEach(function(ev) {
      document.removeEventListener(ev, onend);
    });
    el.removeEventListener('mousedown', drawClear);
  };
}

function renderBoard(ctrl) {
  return {
    tag: 'div',
    attrs: {
      class: 'cg-board orientation-' + ctrl.data.orientation,
      config: function(el, isUpdate, context) {
        if (isUpdate) return;
        if (!ctrl.data.viewOnly || ctrl.data.drawable.enabled)
          bindEvents(ctrl, el, context);
        // this function only repaints the board itself.
        // it's called when dragging or animating pieces,
        // to prevent the full application embedding chessground
        // rendering on every animation frame
        ctrl.data.render = function() {
          m.render(el, renderContent(ctrl));
        };
        ctrl.data.renderRAF = function() {
          util.requestAnimationFrame(ctrl.data.render);
        };
        ctrl.data.bounds = util.memo(el.getBoundingClientRect.bind(el));
        ctrl.data.element = el;
        ctrl.data.render();
      }
    },
    children: []
  };
}

module.exports = function(ctrl) {
  return {
    tag: 'div',
    attrs: {
      config: function(el, isUpdate) {
        if (isUpdate) return;
        el.addEventListener('contextmenu', function(e) {
          if (ctrl.data.disableContextMenu || ctrl.data.drawable.enabled) {
            e.preventDefault();
            return false;
          }
        });
        if (ctrl.data.resizable)
          document.body.addEventListener('chessground.resize', function(e) {
            ctrl.data.bounds.clear();
            ctrl.data.render();
          }, false);
        ['onscroll', 'onresize'].forEach(function(n) {
          var prev = window[n];
          window[n] = function() {
            prev && prev();
            ctrl.data.bounds.clear();
          };
        });
      },
      class: [
        'cg-board-wrap',
        ctrl.data.viewOnly ? 'view-only' : 'manipulable',
        ctrl.data.minimalDom ? 'minimal-dom' : 'full-dom'
      ].join(' ')
    },
    children: [renderBoard(ctrl)]
  };
};

},{"./drag":10,"./draw":11,"./svg":15,"./util":16,"mithril":3}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9tZXJnZS9tZXJnZS5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCJzcmMvYW5pbS5qcyIsInNyYy9hcGkuanMiLCJzcmMvYm9hcmQuanMiLCJzcmMvY29uZmlndXJlLmpzIiwic3JjL2N0cmwuanMiLCJzcmMvZGF0YS5qcyIsInNyYy9kcmFnLmpzIiwic3JjL2RyYXcuanMiLCJzcmMvZmVuLmpzIiwic3JjL2hvbGQuanMiLCJzcmMvcHJlbW92ZS5qcyIsInNyYy9zdmcuanMiLCJzcmMvdXRpbC5qcyIsInNyYy92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1M0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG52YXIgY3RybCA9IHJlcXVpcmUoJy4vY3RybCcpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuL3ZpZXcnKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xuXG4vLyBmb3IgdXNhZ2Ugb3V0c2lkZSBvZiBtaXRocmlsXG5mdW5jdGlvbiBpbml0KGVsZW1lbnQsIGNvbmZpZykge1xuXG4gIHZhciBjb250cm9sbGVyID0gbmV3IGN0cmwoY29uZmlnKTtcblxuICBtLnJlbmRlcihlbGVtZW50LCB2aWV3KGNvbnRyb2xsZXIpKTtcblxuICByZXR1cm4gYXBpKGNvbnRyb2xsZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXQ7XG5tb2R1bGUuZXhwb3J0cy5jb250cm9sbGVyID0gY3RybDtcbm1vZHVsZS5leHBvcnRzLnZpZXcgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMuZmVuID0gcmVxdWlyZSgnLi9mZW4nKTtcbm1vZHVsZS5leHBvcnRzLnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbm1vZHVsZS5leHBvcnRzLmNvbmZpZ3VyZSA9IHJlcXVpcmUoJy4vY29uZmlndXJlJyk7XG5tb2R1bGUuZXhwb3J0cy5hbmltID0gcmVxdWlyZSgnLi9hbmltJyk7XG5tb2R1bGUuZXhwb3J0cy5ib2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQnKTtcbm1vZHVsZS5leHBvcnRzLmRyYWcgPSByZXF1aXJlKCcuL2RyYWcnKTtcbiIsIi8qIVxyXG4gKiBAbmFtZSBKYXZhU2NyaXB0L05vZGVKUyBNZXJnZSB2MS4yLjBcclxuICogQGF1dGhvciB5ZWlrb3NcclxuICogQHJlcG9zaXRvcnkgaHR0cHM6Ly9naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZVxyXG5cclxuICogQ29weXJpZ2h0IDIwMTQgeWVpa29zIC0gTUlUIGxpY2Vuc2VcclxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS95ZWlrb3MvanMubWVyZ2UvbWFzdGVyL0xJQ0VOU0VcclxuICovXHJcblxyXG47KGZ1bmN0aW9uKGlzTm9kZSkge1xyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZSBvbmUgb3IgbW9yZSBvYmplY3RzIFxyXG5cdCAqIEBwYXJhbSBib29sPyBjbG9uZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCwuLi4gYXJndW1lbnRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0dmFyIFB1YmxpYyA9IGZ1bmN0aW9uKGNsb25lKSB7XHJcblxyXG5cdFx0cmV0dXJuIG1lcmdlKGNsb25lID09PSB0cnVlLCBmYWxzZSwgYXJndW1lbnRzKTtcclxuXHJcblx0fSwgcHVibGljTmFtZSA9ICdtZXJnZSc7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHMgcmVjdXJzaXZlbHkgXHJcblx0ICogQHBhcmFtIGJvb2w/IGNsb25lXHJcblx0ICogQHBhcmFtIG1peGVkLC4uLiBhcmd1bWVudHNcclxuXHQgKiBAcmV0dXJuIG9iamVjdFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMucmVjdXJzaXZlID0gZnVuY3Rpb24oY2xvbmUpIHtcclxuXHJcblx0XHRyZXR1cm4gbWVyZ2UoY2xvbmUgPT09IHRydWUsIHRydWUsIGFyZ3VtZW50cyk7XHJcblxyXG5cdH07XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsb25lIHRoZSBpbnB1dCByZW1vdmluZyBhbnkgcmVmZXJlbmNlXHJcblx0ICogQHBhcmFtIG1peGVkIGlucHV0XHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRQdWJsaWMuY2xvbmUgPSBmdW5jdGlvbihpbnB1dCkge1xyXG5cclxuXHRcdHZhciBvdXRwdXQgPSBpbnB1dCxcclxuXHRcdFx0dHlwZSA9IHR5cGVPZihpbnB1dCksXHJcblx0XHRcdGluZGV4LCBzaXplO1xyXG5cclxuXHRcdGlmICh0eXBlID09PSAnYXJyYXknKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSBbXTtcclxuXHRcdFx0c2l6ZSA9IGlucHV0Lmxlbmd0aDtcclxuXHJcblx0XHRcdGZvciAoaW5kZXg9MDtpbmRleDxzaXplOysraW5kZXgpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9IGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XHJcblxyXG5cdFx0XHRvdXRwdXQgPSB7fTtcclxuXHJcblx0XHRcdGZvciAoaW5kZXggaW4gaW5wdXQpXHJcblxyXG5cdFx0XHRcdG91dHB1dFtpbmRleF0gPSBQdWJsaWMuY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2UgdHdvIG9iamVjdHMgcmVjdXJzaXZlbHlcclxuXHQgKiBAcGFyYW0gbWl4ZWQgaW5wdXRcclxuXHQgKiBAcGFyYW0gbWl4ZWQgZXh0ZW5kXHJcblx0ICogQHJldHVybiBtaXhlZFxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtZXJnZV9yZWN1cnNpdmUoYmFzZSwgZXh0ZW5kKSB7XHJcblxyXG5cdFx0aWYgKHR5cGVPZihiYXNlKSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXR1cm4gZXh0ZW5kO1xyXG5cclxuXHRcdGZvciAodmFyIGtleSBpbiBleHRlbmQpIHtcclxuXHJcblx0XHRcdGlmICh0eXBlT2YoYmFzZVtrZXldKSA9PT0gJ29iamVjdCcgJiYgdHlwZU9mKGV4dGVuZFtrZXldKSA9PT0gJ29iamVjdCcpIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gbWVyZ2VfcmVjdXJzaXZlKGJhc2Vba2V5XSwgZXh0ZW5kW2tleV0pO1xyXG5cclxuXHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0YmFzZVtrZXldID0gZXh0ZW5kW2tleV07XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBiYXNlO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlIHR3byBvciBtb3JlIG9iamVjdHNcclxuXHQgKiBAcGFyYW0gYm9vbCBjbG9uZVxyXG5cdCAqIEBwYXJhbSBib29sIHJlY3Vyc2l2ZVxyXG5cdCAqIEBwYXJhbSBhcnJheSBhcmd2XHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWVyZ2UoY2xvbmUsIHJlY3Vyc2l2ZSwgYXJndikge1xyXG5cclxuXHRcdHZhciByZXN1bHQgPSBhcmd2WzBdLFxyXG5cdFx0XHRzaXplID0gYXJndi5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKGNsb25lIHx8IHR5cGVPZihyZXN1bHQpICE9PSAnb2JqZWN0JylcclxuXHJcblx0XHRcdHJlc3VsdCA9IHt9O1xyXG5cclxuXHRcdGZvciAodmFyIGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KSB7XHJcblxyXG5cdFx0XHR2YXIgaXRlbSA9IGFyZ3ZbaW5kZXhdLFxyXG5cclxuXHRcdFx0XHR0eXBlID0gdHlwZU9mKGl0ZW0pO1xyXG5cclxuXHRcdFx0aWYgKHR5cGUgIT09ICdvYmplY3QnKSBjb250aW51ZTtcclxuXHJcblx0XHRcdGZvciAodmFyIGtleSBpbiBpdGVtKSB7XHJcblxyXG5cdFx0XHRcdHZhciBzaXRlbSA9IGNsb25lID8gUHVibGljLmNsb25lKGl0ZW1ba2V5XSkgOiBpdGVtW2tleV07XHJcblxyXG5cdFx0XHRcdGlmIChyZWN1cnNpdmUpIHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IG1lcmdlX3JlY3Vyc2l2ZShyZXN1bHRba2V5XSwgc2l0ZW0pO1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gc2l0ZW07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdHlwZSBvZiB2YXJpYWJsZVxyXG5cdCAqIEBwYXJhbSBtaXhlZCBpbnB1dFxyXG5cdCAqIEByZXR1cm4gc3RyaW5nXHJcblx0ICpcclxuXHQgKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL3R5cGVvZnZhclxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB0eXBlT2YoaW5wdXQpIHtcclxuXHJcblx0XHRyZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKGlucHV0KS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcclxuXHJcblx0fVxyXG5cclxuXHRpZiAoaXNOb2RlKSB7XHJcblxyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBQdWJsaWM7XHJcblxyXG5cdH0gZWxzZSB7XHJcblxyXG5cdFx0d2luZG93W3B1YmxpY05hbWVdID0gUHVibGljO1xyXG5cclxuXHR9XHJcblxyXG59KSh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyk7IiwidmFyIG0gPSAoZnVuY3Rpb24gYXBwKHdpbmRvdywgdW5kZWZpbmVkKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgXHR2YXIgVkVSU0lPTiA9IFwidjAuMi4xXCI7XHJcblx0ZnVuY3Rpb24gaXNGdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSBcImZ1bmN0aW9uXCI7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGlzT2JqZWN0KG9iamVjdCkge1xyXG5cdFx0cmV0dXJuIHR5cGUuY2FsbChvYmplY3QpID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBpc1N0cmluZyhvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIjtcclxuXHR9XHJcblx0dmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmplY3QpIHtcclxuXHRcdHJldHVybiB0eXBlLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xyXG5cdH07XHJcblx0dmFyIHR5cGUgPSB7fS50b1N0cmluZztcclxuXHR2YXIgcGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsuKz9cXF0pL2csIGF0dHJQYXJzZXIgPSAvXFxbKC4rPykoPzo9KFwifCd8KSguKj8pXFwyKT9cXF0vO1xyXG5cdHZhciB2b2lkRWxlbWVudHMgPSAvXihBUkVBfEJBU0V8QlJ8Q09MfENPTU1BTkR8RU1CRUR8SFJ8SU1HfElOUFVUfEtFWUdFTnxMSU5LfE1FVEF8UEFSQU18U09VUkNFfFRSQUNLfFdCUikkLztcclxuXHR2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xyXG5cclxuXHQvLyBjYWNoaW5nIGNvbW1vbmx5IHVzZWQgdmFyaWFibGVzXHJcblx0dmFyICRkb2N1bWVudCwgJGxvY2F0aW9uLCAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCAkY2FuY2VsQW5pbWF0aW9uRnJhbWU7XHJcblxyXG5cdC8vIHNlbGYgaW52b2tpbmcgZnVuY3Rpb24gbmVlZGVkIGJlY2F1c2Ugb2YgdGhlIHdheSBtb2NrcyB3b3JrXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSh3aW5kb3cpIHtcclxuXHRcdCRkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcclxuXHRcdCRsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcclxuXHRcdCRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuY2xlYXJUaW1lb3V0O1xyXG5cdFx0JHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LnNldFRpbWVvdXQ7XHJcblx0fVxyXG5cclxuXHRpbml0aWFsaXplKHdpbmRvdyk7XHJcblxyXG5cdG0udmVyc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIFZFUlNJT047XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogQHR5cGVkZWYge1N0cmluZ30gVGFnXHJcblx0ICogQSBzdHJpbmcgdGhhdCBsb29rcyBsaWtlIC0+IGRpdi5jbGFzc25hbWUjaWRbcGFyYW09b25lXVtwYXJhbTI9dHdvXVxyXG5cdCAqIFdoaWNoIGRlc2NyaWJlcyBhIERPTSBub2RlXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtUYWd9IFRoZSBET00gbm9kZSB0YWdcclxuXHQgKiBAcGFyYW0ge09iamVjdD1bXX0gb3B0aW9uYWwga2V5LXZhbHVlIHBhaXJzIHRvIGJlIG1hcHBlZCB0byBET00gYXR0cnNcclxuXHQgKiBAcGFyYW0gey4uLm1Ob2RlPVtdfSBaZXJvIG9yIG1vcmUgTWl0aHJpbCBjaGlsZCBub2Rlcy4gQ2FuIGJlIGFuIGFycmF5LCBvciBzcGxhdCAob3B0aW9uYWwpXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtKHRhZywgcGFpcnMpIHtcclxuXHRcdGZvciAodmFyIGFyZ3MgPSBbXSwgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0YXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XHJcblx0XHR9XHJcblx0XHRpZiAoaXNPYmplY3QodGFnKSkgcmV0dXJuIHBhcmFtZXRlcml6ZSh0YWcsIGFyZ3MpO1xyXG5cdFx0dmFyIGhhc0F0dHJzID0gcGFpcnMgIT0gbnVsbCAmJiBpc09iamVjdChwYWlycykgJiYgIShcInRhZ1wiIGluIHBhaXJzIHx8IFwidmlld1wiIGluIHBhaXJzIHx8IFwic3VidHJlZVwiIGluIHBhaXJzKTtcclxuXHRcdHZhciBhdHRycyA9IGhhc0F0dHJzID8gcGFpcnMgOiB7fTtcclxuXHRcdHZhciBjbGFzc0F0dHJOYW1lID0gXCJjbGFzc1wiIGluIGF0dHJzID8gXCJjbGFzc1wiIDogXCJjbGFzc05hbWVcIjtcclxuXHRcdHZhciBjZWxsID0ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9fTtcclxuXHRcdHZhciBtYXRjaCwgY2xhc3NlcyA9IFtdO1xyXG5cdFx0aWYgKCFpc1N0cmluZyh0YWcpKSB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RvciBpbiBtKHNlbGVjdG9yLCBhdHRycywgY2hpbGRyZW4pIHNob3VsZCBiZSBhIHN0cmluZ1wiKTtcclxuXHRcdHdoaWxlICgobWF0Y2ggPSBwYXJzZXIuZXhlYyh0YWcpKSAhPSBudWxsKSB7XHJcblx0XHRcdGlmIChtYXRjaFsxXSA9PT0gXCJcIiAmJiBtYXRjaFsyXSkgY2VsbC50YWcgPSBtYXRjaFsyXTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbMV0gPT09IFwiI1wiKSBjZWxsLmF0dHJzLmlkID0gbWF0Y2hbMl07XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09PSBcIi5cIikgY2xhc3Nlcy5wdXNoKG1hdGNoWzJdKTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09IFwiW1wiKSB7XHJcblx0XHRcdFx0dmFyIHBhaXIgPSBhdHRyUGFyc2VyLmV4ZWMobWF0Y2hbM10pO1xyXG5cdFx0XHRcdGNlbGwuYXR0cnNbcGFpclsxXV0gPSBwYWlyWzNdIHx8IChwYWlyWzJdID8gXCJcIiA6dHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY2hpbGRyZW4gPSBoYXNBdHRycyA/IGFyZ3Muc2xpY2UoMSkgOiBhcmdzO1xyXG5cdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBpc0FycmF5KGNoaWxkcmVuWzBdKSkge1xyXG5cdFx0XHRjZWxsLmNoaWxkcmVuID0gY2hpbGRyZW5bMF07XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y2VsbC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGF0dHJzKSB7XHJcblx0XHRcdGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkpIHtcclxuXHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IGNsYXNzQXR0ck5hbWUgJiYgYXR0cnNbYXR0ck5hbWVdICE9IG51bGwgJiYgYXR0cnNbYXR0ck5hbWVdICE9PSBcIlwiKSB7XHJcblx0XHRcdFx0XHRjbGFzc2VzLnB1c2goYXR0cnNbYXR0ck5hbWVdKTtcclxuXHRcdFx0XHRcdGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gXCJcIjsgLy9jcmVhdGUga2V5IGluIGNvcnJlY3QgaXRlcmF0aW9uIG9yZGVyXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgY2VsbC5hdHRyc1thdHRyTmFtZV0gPSBhdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChjbGFzc2VzLmxlbmd0aCkgY2VsbC5hdHRyc1tjbGFzc0F0dHJOYW1lXSA9IGNsYXNzZXMuam9pbihcIiBcIik7XHJcblxyXG5cdFx0cmV0dXJuIGNlbGw7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGZvckVhY2gobGlzdCwgZikge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aCAmJiAhZihsaXN0W2ldLCBpKyspOykge31cclxuXHR9XHJcblx0ZnVuY3Rpb24gZm9yS2V5cyhsaXN0LCBmKSB7XHJcblx0XHRmb3JFYWNoKGxpc3QsIGZ1bmN0aW9uIChhdHRycywgaSkge1xyXG5cdFx0XHRyZXR1cm4gKGF0dHJzID0gYXR0cnMgJiYgYXR0cnMuYXR0cnMpICYmIGF0dHJzLmtleSAhPSBudWxsICYmIGYoYXR0cnMsIGkpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdC8vIFRoaXMgZnVuY3Rpb24gd2FzIGNhdXNpbmcgZGVvcHRzIGluIENocm9tZS5cclxuXHQvLyBXZWxsIG5vIGxvbmdlclxyXG5cdGZ1bmN0aW9uIGRhdGFUb1N0cmluZyhkYXRhKSB7XHJcblx0XHRpZiAoZGF0YSA9PSBudWxsIHx8IGRhdGEudG9TdHJpbmcoKSA9PSBudWxsKSByZXR1cm4gXCJcIjtcclxuXHRcdHJldHVybiBkYXRhO1xyXG5cdH1cclxuXHQvLyBUaGlzIGZ1bmN0aW9uIHdhcyBjYXVzaW5nIGRlb3B0cyBpbiBDaHJvbWUuXHJcblx0ZnVuY3Rpb24gaW5qZWN0VGV4dE5vZGUocGFyZW50RWxlbWVudCwgZmlyc3QsIGluZGV4LCBkYXRhKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRpbnNlcnROb2RlKHBhcmVudEVsZW1lbnQsIGZpcnN0LCBpbmRleCk7XHJcblx0XHRcdGZpcnN0Lm5vZGVWYWx1ZSA9IGRhdGE7XHJcblx0XHR9IGNhdGNoIChlKSB7fSAvL0lFIGVycm9uZW91c2x5IHRocm93cyBlcnJvciB3aGVuIGFwcGVuZGluZyBhbiBlbXB0eSB0ZXh0IG5vZGUgYWZ0ZXIgYSBudWxsXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBmbGF0dGVuKGxpc3QpIHtcclxuXHRcdC8vcmVjdXJzaXZlbHkgZmxhdHRlbiBhcnJheVxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChpc0FycmF5KGxpc3RbaV0pKSB7XHJcblx0XHRcdFx0bGlzdCA9IGxpc3QuY29uY2F0LmFwcGx5KFtdLCBsaXN0KTtcclxuXHRcdFx0XHQvL2NoZWNrIGN1cnJlbnQgaW5kZXggYWdhaW4gYW5kIGZsYXR0ZW4gdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbmVzdGVkIGFycmF5cyBhdCB0aGF0IGluZGV4XHJcblx0XHRcdFx0aS0tO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbGlzdDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGluc2VydE5vZGUocGFyZW50RWxlbWVudCwgbm9kZSwgaW5kZXgpIHtcclxuXHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XHJcblx0fVxyXG5cclxuXHR2YXIgREVMRVRJT04gPSAxLCBJTlNFUlRJT04gPSAyLCBNT1ZFID0gMztcclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlS2V5c0RpZmZlcihkYXRhLCBleGlzdGluZywgY2FjaGVkLCBwYXJlbnRFbGVtZW50KSB7XHJcblx0XHRmb3JLZXlzKGRhdGEsIGZ1bmN0aW9uIChrZXksIGkpIHtcclxuXHRcdFx0ZXhpc3Rpbmdba2V5ID0ga2V5LmtleV0gPSBleGlzdGluZ1trZXldID8ge1xyXG5cdFx0XHRcdGFjdGlvbjogTU9WRSxcclxuXHRcdFx0XHRpbmRleDogaSxcclxuXHRcdFx0XHRmcm9tOiBleGlzdGluZ1trZXldLmluZGV4LFxyXG5cdFx0XHRcdGVsZW1lbnQ6IGNhY2hlZC5ub2Rlc1tleGlzdGluZ1trZXldLmluZGV4XSB8fCAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxyXG5cdFx0XHR9IDoge2FjdGlvbjogSU5TRVJUSU9OLCBpbmRleDogaX07XHJcblx0XHR9KTtcclxuXHRcdHZhciBhY3Rpb25zID0gW107XHJcblx0XHRmb3IgKHZhciBwcm9wIGluIGV4aXN0aW5nKSBhY3Rpb25zLnB1c2goZXhpc3RpbmdbcHJvcF0pO1xyXG5cdFx0dmFyIGNoYW5nZXMgPSBhY3Rpb25zLnNvcnQoc29ydENoYW5nZXMpLCBuZXdDYWNoZWQgPSBuZXcgQXJyYXkoY2FjaGVkLmxlbmd0aCk7XHJcblx0XHRuZXdDYWNoZWQubm9kZXMgPSBjYWNoZWQubm9kZXMuc2xpY2UoKTtcclxuXHJcblx0XHRmb3JFYWNoKGNoYW5nZXMsIGZ1bmN0aW9uIChjaGFuZ2UpIHtcclxuXHRcdFx0dmFyIGluZGV4ID0gY2hhbmdlLmluZGV4O1xyXG5cdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gREVMRVRJT04pIHtcclxuXHRcdFx0XHRjbGVhcihjYWNoZWRbaW5kZXhdLm5vZGVzLCBjYWNoZWRbaW5kZXhdKTtcclxuXHRcdFx0XHRuZXdDYWNoZWQuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gSU5TRVJUSU9OKSB7XHJcblx0XHRcdFx0dmFyIGR1bW15ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHRcdFx0ZHVtbXkua2V5ID0gZGF0YVtpbmRleF0uYXR0cnMua2V5O1xyXG5cdFx0XHRcdGluc2VydE5vZGUocGFyZW50RWxlbWVudCwgZHVtbXksIGluZGV4KTtcclxuXHRcdFx0XHRuZXdDYWNoZWQuc3BsaWNlKGluZGV4LCAwLCB7XHJcblx0XHRcdFx0XHRhdHRyczoge2tleTogZGF0YVtpbmRleF0uYXR0cnMua2V5fSxcclxuXHRcdFx0XHRcdG5vZGVzOiBbZHVtbXldXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0bmV3Q2FjaGVkLm5vZGVzW2luZGV4XSA9IGR1bW15O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gTU9WRSkge1xyXG5cdFx0XHRcdHZhciBjaGFuZ2VFbGVtZW50ID0gY2hhbmdlLmVsZW1lbnQ7XHJcblx0XHRcdFx0dmFyIG1heWJlQ2hhbmdlZCA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF07XHJcblx0XHRcdFx0aWYgKG1heWJlQ2hhbmdlZCAhPT0gY2hhbmdlRWxlbWVudCAmJiBjaGFuZ2VFbGVtZW50ICE9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjaGFuZ2VFbGVtZW50LCBtYXliZUNoYW5nZWQgfHwgbnVsbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG5ld0NhY2hlZFtpbmRleF0gPSBjYWNoZWRbY2hhbmdlLmZyb21dO1xyXG5cdFx0XHRcdG5ld0NhY2hlZC5ub2Rlc1tpbmRleF0gPSBjaGFuZ2VFbGVtZW50O1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gbmV3Q2FjaGVkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGlmZktleXMoZGF0YSwgY2FjaGVkLCBleGlzdGluZywgcGFyZW50RWxlbWVudCkge1xyXG5cdFx0dmFyIGtleXNEaWZmZXIgPSBkYXRhLmxlbmd0aCAhPT0gY2FjaGVkLmxlbmd0aDtcclxuXHRcdGlmICgha2V5c0RpZmZlcikge1xyXG5cdFx0XHRmb3JLZXlzKGRhdGEsIGZ1bmN0aW9uIChhdHRycywgaSkge1xyXG5cdFx0XHRcdHZhciBjYWNoZWRDZWxsID0gY2FjaGVkW2ldO1xyXG5cdFx0XHRcdHJldHVybiBrZXlzRGlmZmVyID0gY2FjaGVkQ2VsbCAmJiBjYWNoZWRDZWxsLmF0dHJzICYmIGNhY2hlZENlbGwuYXR0cnMua2V5ICE9PSBhdHRycy5rZXk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBrZXlzRGlmZmVyID8gaGFuZGxlS2V5c0RpZmZlcihkYXRhLCBleGlzdGluZywgY2FjaGVkLCBwYXJlbnRFbGVtZW50KSA6IGNhY2hlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRpZmZBcnJheShkYXRhLCBjYWNoZWQsIG5vZGVzKSB7XHJcblx0XHQvL2RpZmYgdGhlIGFycmF5IGl0c2VsZlxyXG5cclxuXHRcdC8vdXBkYXRlIHRoZSBsaXN0IG9mIERPTSBub2RlcyBieSBjb2xsZWN0aW5nIHRoZSBub2RlcyBmcm9tIGVhY2ggaXRlbVxyXG5cdFx0Zm9yRWFjaChkYXRhLCBmdW5jdGlvbiAoXywgaSkge1xyXG5cdFx0XHRpZiAoY2FjaGVkW2ldICE9IG51bGwpIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIGNhY2hlZFtpXS5ub2Rlcyk7XHJcblx0XHR9KVxyXG5cdFx0Ly9yZW1vdmUgaXRlbXMgZnJvbSB0aGUgZW5kIG9mIHRoZSBhcnJheSBpZiB0aGUgbmV3IGFycmF5IGlzIHNob3J0ZXIgdGhhbiB0aGUgb2xkIG9uZS4gaWYgZXJyb3JzIGV2ZXIgaGFwcGVuIGhlcmUsIHRoZSBpc3N1ZSBpcyBtb3N0IGxpa2VseVxyXG5cdFx0Ly9hIGJ1ZyBpbiB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBzb21ld2hlcmUgZWFybGllciBpbiB0aGUgcHJvZ3JhbVxyXG5cdFx0Zm9yRWFjaChjYWNoZWQubm9kZXMsIGZ1bmN0aW9uIChub2RlLCBpKSB7XHJcblx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUgIT0gbnVsbCAmJiBub2Rlcy5pbmRleE9mKG5vZGUpIDwgMCkgY2xlYXIoW25vZGVdLCBbY2FjaGVkW2ldXSk7XHJcblx0XHR9KVxyXG5cdFx0aWYgKGRhdGEubGVuZ3RoIDwgY2FjaGVkLmxlbmd0aCkgY2FjaGVkLmxlbmd0aCA9IGRhdGEubGVuZ3RoO1xyXG5cdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZEFycmF5S2V5cyhkYXRhKSB7XHJcblx0XHR2YXIgZ3VpZCA9IDA7XHJcblx0XHRmb3JLZXlzKGRhdGEsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Zm9yRWFjaChkYXRhLCBmdW5jdGlvbiAoYXR0cnMpIHtcclxuXHRcdFx0XHRpZiAoKGF0dHJzID0gYXR0cnMgJiYgYXR0cnMuYXR0cnMpICYmIGF0dHJzLmtleSA9PSBudWxsKSBhdHRycy5rZXkgPSBcIl9fbWl0aHJpbF9fXCIgKyBndWlkKys7XHJcblx0XHRcdH0pXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBtYXliZVJlY3JlYXRlT2JqZWN0KGRhdGEsIGNhY2hlZCwgZGF0YUF0dHJLZXlzKSB7XHJcblx0XHQvL2lmIGFuIGVsZW1lbnQgaXMgZGlmZmVyZW50IGVub3VnaCBmcm9tIHRoZSBvbmUgaW4gY2FjaGUsIHJlY3JlYXRlIGl0XHJcblx0XHRpZiAoZGF0YS50YWcgIT09IGNhY2hlZC50YWcgfHxcclxuXHRcdFx0XHRkYXRhQXR0cktleXMuc29ydCgpLmpvaW4oKSAhPT0gT2JqZWN0LmtleXMoY2FjaGVkLmF0dHJzKS5zb3J0KCkuam9pbigpIHx8XHJcblx0XHRcdFx0ZGF0YS5hdHRycy5pZCAhPT0gY2FjaGVkLmF0dHJzLmlkIHx8XHJcblx0XHRcdFx0ZGF0YS5hdHRycy5rZXkgIT09IGNhY2hlZC5hdHRycy5rZXkgfHxcclxuXHRcdFx0XHQobS5yZWRyYXcuc3RyYXRlZ3koKSA9PT0gXCJhbGxcIiAmJiAoIWNhY2hlZC5jb25maWdDb250ZXh0IHx8IGNhY2hlZC5jb25maWdDb250ZXh0LnJldGFpbiAhPT0gdHJ1ZSkpIHx8XHJcblx0XHRcdFx0KG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT09IFwiZGlmZlwiICYmIGNhY2hlZC5jb25maWdDb250ZXh0ICYmIGNhY2hlZC5jb25maWdDb250ZXh0LnJldGFpbiA9PT0gZmFsc2UpKSB7XHJcblx0XHRcdGlmIChjYWNoZWQubm9kZXMubGVuZ3RoKSBjbGVhcihjYWNoZWQubm9kZXMpO1xyXG5cdFx0XHRpZiAoY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgaXNGdW5jdGlvbihjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCkpIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKCk7XHJcblx0XHRcdGlmIChjYWNoZWQuY29udHJvbGxlcnMpIHtcclxuXHRcdFx0XHRmb3JFYWNoKGNhY2hlZC5jb250cm9sbGVycywgZnVuY3Rpb24gKGNvbnRyb2xsZXIpIHtcclxuXHRcdFx0XHRcdGlmIChjb250cm9sbGVyLnVubG9hZCkgY29udHJvbGxlci5vbnVubG9hZCh7cHJldmVudERlZmF1bHQ6IG5vb3B9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0T2JqZWN0TmFtZXNwYWNlKGRhdGEsIG5hbWVzcGFjZSkge1xyXG5cdFx0cmV0dXJuIGRhdGEuYXR0cnMueG1sbnMgPyBkYXRhLmF0dHJzLnhtbG5zIDpcclxuXHRcdFx0ZGF0YS50YWcgPT09IFwic3ZnXCIgPyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgOlxyXG5cdFx0XHRkYXRhLnRhZyA9PT0gXCJtYXRoXCIgPyBcImh0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUxcIiA6XHJcblx0XHRcdG5hbWVzcGFjZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHVubG9hZENhY2hlZENvbnRyb2xsZXJzKGNhY2hlZCwgdmlld3MsIGNvbnRyb2xsZXJzKSB7XHJcblx0XHRpZiAoY29udHJvbGxlcnMubGVuZ3RoKSB7XHJcblx0XHRcdGNhY2hlZC52aWV3cyA9IHZpZXdzO1xyXG5cdFx0XHRjYWNoZWQuY29udHJvbGxlcnMgPSBjb250cm9sbGVycztcclxuXHRcdFx0Zm9yRWFjaChjb250cm9sbGVycywgZnVuY3Rpb24gKGNvbnRyb2xsZXIpIHtcclxuXHRcdFx0XHRpZiAoY29udHJvbGxlci5vbnVubG9hZCAmJiBjb250cm9sbGVyLm9udW5sb2FkLiRvbGQpIGNvbnRyb2xsZXIub251bmxvYWQgPSBjb250cm9sbGVyLm9udW5sb2FkLiRvbGQ7XHJcblx0XHRcdFx0aWYgKHBlbmRpbmdSZXF1ZXN0cyAmJiBjb250cm9sbGVyLm9udW5sb2FkKSB7XHJcblx0XHRcdFx0XHR2YXIgb251bmxvYWQgPSBjb250cm9sbGVyLm9udW5sb2FkO1xyXG5cdFx0XHRcdFx0Y29udHJvbGxlci5vbnVubG9hZCA9IG5vb3A7XHJcblx0XHRcdFx0XHRjb250cm9sbGVyLm9udW5sb2FkLiRvbGQgPSBvbnVubG9hZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2NoZWR1bGVDb25maWdzVG9CZUNhbGxlZChjb25maWdzLCBkYXRhLCBub2RlLCBpc05ldywgY2FjaGVkKSB7XHJcblx0XHQvL3NjaGVkdWxlIGNvbmZpZ3MgdG8gYmUgY2FsbGVkLiBUaGV5IGFyZSBjYWxsZWQgYWZ0ZXIgYGJ1aWxkYFxyXG5cdFx0Ly9maW5pc2hlcyBydW5uaW5nXHJcblx0XHRpZiAoaXNGdW5jdGlvbihkYXRhLmF0dHJzLmNvbmZpZykpIHtcclxuXHRcdFx0dmFyIGNvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0IHx8IHt9O1xyXG5cclxuXHRcdFx0Ly9iaW5kXHJcblx0XHRcdGNvbmZpZ3MucHVzaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRyZXR1cm4gZGF0YS5hdHRycy5jb25maWcuY2FsbChkYXRhLCBub2RlLCAhaXNOZXcsIGNvbnRleHQsIGNhY2hlZCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYnVpbGRVcGRhdGVkTm9kZShjYWNoZWQsIGRhdGEsIGVkaXRhYmxlLCBoYXNLZXlzLCBuYW1lc3BhY2UsIHZpZXdzLCBjb25maWdzLCBjb250cm9sbGVycykge1xyXG5cdFx0dmFyIG5vZGUgPSBjYWNoZWQubm9kZXNbMF07XHJcblx0XHRpZiAoaGFzS2V5cykgc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywgY2FjaGVkLmF0dHJzLCBuYW1lc3BhY2UpO1xyXG5cdFx0Y2FjaGVkLmNoaWxkcmVuID0gYnVpbGQobm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIGZhbHNlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IG5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHRcdGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xyXG5cclxuXHRcdGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcclxuXHRcdFx0Y2FjaGVkLnZpZXdzID0gdmlld3M7XHJcblx0XHRcdGNhY2hlZC5jb250cm9sbGVycyA9IGNvbnRyb2xsZXJzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBub2RlO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlTm9uZXhpc3RlbnROb2RlcyhkYXRhLCBwYXJlbnRFbGVtZW50LCBpbmRleCkge1xyXG5cdFx0dmFyIG5vZGVzO1xyXG5cdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRub2RlcyA9IFskZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSldO1xyXG5cdFx0XHRpZiAoIXBhcmVudEVsZW1lbnQubm9kZU5hbWUubWF0Y2godm9pZEVsZW1lbnRzKSkgaW5zZXJ0Tm9kZShwYXJlbnRFbGVtZW50LCBub2Rlc1swXSwgaW5kZXgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjYWNoZWQgPSB0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgZGF0YSA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgZGF0YSA9PT0gXCJib29sZWFuXCIgPyBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKSA6IGRhdGE7XHJcblx0XHRjYWNoZWQubm9kZXMgPSBub2RlcztcclxuXHRcdHJldHVybiBjYWNoZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZWF0dGFjaE5vZGVzKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgZWRpdGFibGUsIGluZGV4LCBwYXJlbnRUYWcpIHtcclxuXHRcdHZhciBub2RlcyA9IGNhY2hlZC5ub2RlcztcclxuXHRcdGlmICghZWRpdGFibGUgfHwgZWRpdGFibGUgIT09ICRkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XHJcblx0XHRcdGlmIChkYXRhLiR0cnVzdGVkKSB7XHJcblx0XHRcdFx0Y2xlYXIobm9kZXMsIGNhY2hlZCk7XHJcblx0XHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL2Nvcm5lciBjYXNlOiByZXBsYWNpbmcgdGhlIG5vZGVWYWx1ZSBvZiBhIHRleHQgbm9kZSB0aGF0IGlzIGEgY2hpbGQgb2YgYSB0ZXh0YXJlYS9jb250ZW50ZWRpdGFibGUgZG9lc24ndCB3b3JrXHJcblx0XHRcdC8vd2UgbmVlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHByb3BlcnR5IG9mIHRoZSBwYXJlbnQgdGV4dGFyZWEgb3IgdGhlIGlubmVySFRNTCBvZiB0aGUgY29udGVudGVkaXRhYmxlIGVsZW1lbnQgaW5zdGVhZFxyXG5cdFx0XHRlbHNlIGlmIChwYXJlbnRUYWcgPT09IFwidGV4dGFyZWFcIikge1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQudmFsdWUgPSBkYXRhO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKGVkaXRhYmxlKSB7XHJcblx0XHRcdFx0ZWRpdGFibGUuaW5uZXJIVE1MID0gZGF0YTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHQvL3dhcyBhIHRydXN0ZWQgc3RyaW5nXHJcblx0XHRcdFx0aWYgKG5vZGVzWzBdLm5vZGVUeXBlID09PSAxIHx8IG5vZGVzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRcdGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcclxuXHRcdFx0XHRcdG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGluamVjdFRleHROb2RlKHBhcmVudEVsZW1lbnQsIG5vZGVzWzBdLCBpbmRleCwgZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpO1xyXG5cdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXM7XHJcblx0XHRyZXR1cm4gY2FjaGVkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlVGV4dChjYWNoZWQsIGRhdGEsIGluZGV4LCBwYXJlbnRFbGVtZW50LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIHBhcmVudFRhZykge1xyXG5cdFx0Ly9oYW5kbGUgdGV4dCBub2Rlc1xyXG5cdFx0cmV0dXJuIGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDAgPyBoYW5kbGVOb25leGlzdGVudE5vZGVzKGRhdGEsIHBhcmVudEVsZW1lbnQsIGluZGV4KSA6XHJcblx0XHRcdGNhY2hlZC52YWx1ZU9mKCkgIT09IGRhdGEudmFsdWVPZigpIHx8IHNob3VsZFJlYXR0YWNoID09PSB0cnVlID9cclxuXHRcdFx0XHRyZWF0dGFjaE5vZGVzKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgZWRpdGFibGUsIGluZGV4LCBwYXJlbnRUYWcpIDpcclxuXHRcdFx0KGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlLCBjYWNoZWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0U3ViQXJyYXlDb3VudChpdGVtKSB7XHJcblx0XHRpZiAoaXRlbS4kdHJ1c3RlZCkge1xyXG5cdFx0XHQvL2ZpeCBvZmZzZXQgb2YgbmV4dCBlbGVtZW50IGlmIGl0ZW0gd2FzIGEgdHJ1c3RlZCBzdHJpbmcgdy8gbW9yZSB0aGFuIG9uZSBodG1sIGVsZW1lbnRcclxuXHRcdFx0Ly90aGUgZmlyc3QgY2xhdXNlIGluIHRoZSByZWdleHAgbWF0Y2hlcyBlbGVtZW50c1xyXG5cdFx0XHQvL3RoZSBzZWNvbmQgY2xhdXNlIChhZnRlciB0aGUgcGlwZSkgbWF0Y2hlcyB0ZXh0IG5vZGVzXHJcblx0XHRcdHZhciBtYXRjaCA9IGl0ZW0ubWF0Y2goLzxbXlxcL118XFw+XFxzKltePF0vZyk7XHJcblx0XHRcdGlmIChtYXRjaCAhPSBudWxsKSByZXR1cm4gbWF0Y2gubGVuZ3RoO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAoaXNBcnJheShpdGVtKSkge1xyXG5cdFx0XHRyZXR1cm4gaXRlbS5sZW5ndGg7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gMTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJ1aWxkQXJyYXkoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBpbmRleCwgcGFyZW50VGFnLCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xyXG5cdFx0ZGF0YSA9IGZsYXR0ZW4oZGF0YSk7XHJcblx0XHR2YXIgbm9kZXMgPSBbXSwgaW50YWN0ID0gY2FjaGVkLmxlbmd0aCA9PT0gZGF0YS5sZW5ndGgsIHN1YkFycmF5Q291bnQgPSAwO1xyXG5cclxuXHRcdC8va2V5cyBhbGdvcml0aG06IHNvcnQgZWxlbWVudHMgd2l0aG91dCByZWNyZWF0aW5nIHRoZW0gaWYga2V5cyBhcmUgcHJlc2VudFxyXG5cdFx0Ly8xKSBjcmVhdGUgYSBtYXAgb2YgYWxsIGV4aXN0aW5nIGtleXMsIGFuZCBtYXJrIGFsbCBmb3IgZGVsZXRpb25cclxuXHRcdC8vMikgYWRkIG5ldyBrZXlzIHRvIG1hcCBhbmQgbWFyayB0aGVtIGZvciBhZGRpdGlvblxyXG5cdFx0Ly8zKSBpZiBrZXkgZXhpc3RzIGluIG5ldyBsaXN0LCBjaGFuZ2UgYWN0aW9uIGZyb20gZGVsZXRpb24gdG8gYSBtb3ZlXHJcblx0XHQvLzQpIGZvciBlYWNoIGtleSwgaGFuZGxlIGl0cyBjb3JyZXNwb25kaW5nIGFjdGlvbiBhcyBtYXJrZWQgaW4gcHJldmlvdXMgc3RlcHNcclxuXHRcdHZhciBleGlzdGluZyA9IHt9LCBzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSBmYWxzZTtcclxuXHRcdGZvcktleXMoY2FjaGVkLCBmdW5jdGlvbiAoYXR0cnMsIGkpIHtcclxuXHRcdFx0c2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gdHJ1ZTtcclxuXHRcdFx0ZXhpc3RpbmdbY2FjaGVkW2ldLmF0dHJzLmtleV0gPSB7YWN0aW9uOiBERUxFVElPTiwgaW5kZXg6IGl9O1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0YnVpbGRBcnJheUtleXMoZGF0YSk7XHJcblx0XHRpZiAoc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzKSBjYWNoZWQgPSBkaWZmS2V5cyhkYXRhLCBjYWNoZWQsIGV4aXN0aW5nLCBwYXJlbnRFbGVtZW50KTtcclxuXHRcdC8vZW5kIGtleSBhbGdvcml0aG1cclxuXHJcblx0XHR2YXIgY2FjaGVDb3VudCA9IDA7XHJcblx0XHQvL2Zhc3RlciBleHBsaWNpdGx5IHdyaXR0ZW5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdC8vZGlmZiBlYWNoIGl0ZW0gaW4gdGhlIGFycmF5XHJcblx0XHRcdHZhciBpdGVtID0gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBjYWNoZWQsIGluZGV4LCBkYXRhW2ldLCBjYWNoZWRbY2FjaGVDb3VudF0sIHNob3VsZFJlYXR0YWNoLCBpbmRleCArIHN1YkFycmF5Q291bnQgfHwgc3ViQXJyYXlDb3VudCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XHJcblxyXG5cdFx0XHRpZiAoaXRlbSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0aW50YWN0ID0gaW50YWN0ICYmIGl0ZW0ubm9kZXMuaW50YWN0O1xyXG5cdFx0XHRcdHN1YkFycmF5Q291bnQgKz0gZ2V0U3ViQXJyYXlDb3VudChpdGVtKTtcclxuXHRcdFx0XHRjYWNoZWRbY2FjaGVDb3VudCsrXSA9IGl0ZW07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIWludGFjdCkgZGlmZkFycmF5KGRhdGEsIGNhY2hlZCwgbm9kZXMpO1xyXG5cdFx0cmV0dXJuIGNhY2hlZFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbWFrZUNhY2hlKGRhdGEsIGNhY2hlZCwgaW5kZXgsIHBhcmVudEluZGV4LCBwYXJlbnRDYWNoZSkge1xyXG5cdFx0aWYgKGNhY2hlZCAhPSBudWxsKSB7XHJcblx0XHRcdGlmICh0eXBlLmNhbGwoY2FjaGVkKSA9PT0gdHlwZS5jYWxsKGRhdGEpKSByZXR1cm4gY2FjaGVkO1xyXG5cclxuXHRcdFx0aWYgKHBhcmVudENhY2hlICYmIHBhcmVudENhY2hlLm5vZGVzKSB7XHJcblx0XHRcdFx0dmFyIG9mZnNldCA9IGluZGV4IC0gcGFyZW50SW5kZXgsIGVuZCA9IG9mZnNldCArIChpc0FycmF5KGRhdGEpID8gZGF0YSA6IGNhY2hlZC5ub2RlcykubGVuZ3RoO1xyXG5cdFx0XHRcdGNsZWFyKHBhcmVudENhY2hlLm5vZGVzLnNsaWNlKG9mZnNldCwgZW5kKSwgcGFyZW50Q2FjaGUuc2xpY2Uob2Zmc2V0LCBlbmQpKTtcclxuXHRcdFx0fSBlbHNlIGlmIChjYWNoZWQubm9kZXMpIHtcclxuXHRcdFx0XHRjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcigpO1xyXG5cdFx0Ly9pZiBjb25zdHJ1Y3RvciBjcmVhdGVzIGEgdmlydHVhbCBkb20gZWxlbWVudCwgdXNlIGEgYmxhbmsgb2JqZWN0XHJcblx0XHQvL2FzIHRoZSBiYXNlIGNhY2hlZCBub2RlIGluc3RlYWQgb2YgY29weWluZyB0aGUgdmlydHVhbCBlbCAoIzI3NylcclxuXHRcdGlmIChjYWNoZWQudGFnKSBjYWNoZWQgPSB7fTtcclxuXHRcdGNhY2hlZC5ub2RlcyA9IFtdO1xyXG5cdFx0cmV0dXJuIGNhY2hlZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdE5vZGUoZGF0YSwgbmFtZXNwYWNlKSB7XHJcblx0XHRyZXR1cm4gbmFtZXNwYWNlID09PSB1bmRlZmluZWQgP1xyXG5cdFx0XHRkYXRhLmF0dHJzLmlzID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcpIDpcclxuXHRcdFx0ZGF0YS5hdHRycy5pcyA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZywgZGF0YS5hdHRycy5pcykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY29uc3RydWN0QXR0cnMoZGF0YSwgbm9kZSwgbmFtZXNwYWNlLCBoYXNLZXlzKSB7XHJcblx0XHRyZXR1cm4gaGFzS2V5cyA/IHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIHt9LCBuYW1lc3BhY2UpIDogZGF0YS5hdHRycztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdENoaWxkcmVuKGRhdGEsIG5vZGUsIGNhY2hlZCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xyXG5cdFx0cmV0dXJuIGRhdGEuY2hpbGRyZW4gIT0gbnVsbCAmJiBkYXRhLmNoaWxkcmVuLmxlbmd0aCA+IDAgP1xyXG5cdFx0XHRidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgdHJ1ZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBub2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykgOlxyXG5cdFx0XHRkYXRhLmNoaWxkcmVuO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVjb25zdHJ1Y3RDYWNoZWQoZGF0YSwgYXR0cnMsIGNoaWxkcmVuLCBub2RlLCBuYW1lc3BhY2UsIHZpZXdzLCBjb250cm9sbGVycykge1xyXG5cdFx0dmFyIGNhY2hlZCA9IHt0YWc6IGRhdGEudGFnLCBhdHRyczogYXR0cnMsIGNoaWxkcmVuOiBjaGlsZHJlbiwgbm9kZXM6IFtub2RlXX07XHJcblx0XHR1bmxvYWRDYWNoZWRDb250cm9sbGVycyhjYWNoZWQsIHZpZXdzLCBjb250cm9sbGVycyk7XHJcblx0XHRpZiAoY2FjaGVkLmNoaWxkcmVuICYmICFjYWNoZWQuY2hpbGRyZW4ubm9kZXMpIGNhY2hlZC5jaGlsZHJlbi5ub2RlcyA9IFtdO1xyXG5cdFx0Ly9lZGdlIGNhc2U6IHNldHRpbmcgdmFsdWUgb24gPHNlbGVjdD4gZG9lc24ndCB3b3JrIGJlZm9yZSBjaGlsZHJlbiBleGlzdCwgc28gc2V0IGl0IGFnYWluIGFmdGVyIGNoaWxkcmVuIGhhdmUgYmVlbiBjcmVhdGVkXHJcblx0XHRpZiAoZGF0YS50YWcgPT09IFwic2VsZWN0XCIgJiYgXCJ2YWx1ZVwiIGluIGRhdGEuYXR0cnMpIHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIHt2YWx1ZTogZGF0YS5hdHRycy52YWx1ZX0sIHt9LCBuYW1lc3BhY2UpO1xyXG5cdFx0cmV0dXJuIGNhY2hlZFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0Q29udHJvbGxlcih2aWV3cywgdmlldywgY2FjaGVkQ29udHJvbGxlcnMsIGNvbnRyb2xsZXIpIHtcclxuXHRcdHZhciBjb250cm9sbGVySW5kZXggPSBtLnJlZHJhdy5zdHJhdGVneSgpID09PSBcImRpZmZcIiAmJiB2aWV3cyA/IHZpZXdzLmluZGV4T2YodmlldykgOiAtMTtcclxuXHRcdHJldHVybiBjb250cm9sbGVySW5kZXggPiAtMSA/IGNhY2hlZENvbnRyb2xsZXJzW2NvbnRyb2xsZXJJbmRleF0gOlxyXG5cdFx0XHR0eXBlb2YgY29udHJvbGxlciA9PT0gXCJmdW5jdGlvblwiID8gbmV3IGNvbnRyb2xsZXIoKSA6IHt9O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdXBkYXRlTGlzdHModmlld3MsIGNvbnRyb2xsZXJzLCB2aWV3LCBjb250cm9sbGVyKSB7XHJcblx0XHRpZiAoY29udHJvbGxlci5vbnVubG9hZCAhPSBudWxsKSB1bmxvYWRlcnMucHVzaCh7Y29udHJvbGxlcjogY29udHJvbGxlciwgaGFuZGxlcjogY29udHJvbGxlci5vbnVubG9hZH0pO1xyXG5cdFx0dmlld3MucHVzaCh2aWV3KTtcclxuXHRcdGNvbnRyb2xsZXJzLnB1c2goY29udHJvbGxlcik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjaGVja1ZpZXcoZGF0YSwgdmlldywgY2FjaGVkLCBjYWNoZWRDb250cm9sbGVycywgY29udHJvbGxlcnMsIHZpZXdzKSB7XHJcblx0XHR2YXIgY29udHJvbGxlciA9IGdldENvbnRyb2xsZXIoY2FjaGVkLnZpZXdzLCB2aWV3LCBjYWNoZWRDb250cm9sbGVycywgZGF0YS5jb250cm9sbGVyKTtcclxuXHRcdC8vRmFzdGVyIHRvIGNvZXJjZSB0byBudW1iZXIgYW5kIGNoZWNrIGZvciBOYU5cclxuXHRcdHZhciBrZXkgPSArKGRhdGEgJiYgZGF0YS5hdHRycyAmJiBkYXRhLmF0dHJzLmtleSk7XHJcblx0XHRkYXRhID0gcGVuZGluZ1JlcXVlc3RzID09PSAwIHx8IGZvcmNpbmcgfHwgY2FjaGVkQ29udHJvbGxlcnMgJiYgY2FjaGVkQ29udHJvbGxlcnMuaW5kZXhPZihjb250cm9sbGVyKSA+IC0xID8gZGF0YS52aWV3KGNvbnRyb2xsZXIpIDoge3RhZzogXCJwbGFjZWhvbGRlclwifTtcclxuXHRcdGlmIChkYXRhLnN1YnRyZWUgPT09IFwicmV0YWluXCIpIHJldHVybiBjYWNoZWQ7XHJcblx0XHRpZiAoa2V5ID09PSBrZXkpIChkYXRhLmF0dHJzID0gZGF0YS5hdHRycyB8fCB7fSkua2V5ID0ga2V5O1xyXG5cdFx0dXBkYXRlTGlzdHModmlld3MsIGNvbnRyb2xsZXJzLCB2aWV3LCBjb250cm9sbGVyKTtcclxuXHRcdHJldHVybiBkYXRhO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gbWFya1ZpZXdzKGRhdGEsIGNhY2hlZCwgdmlld3MsIGNvbnRyb2xsZXJzKSB7XHJcblx0XHR2YXIgY2FjaGVkQ29udHJvbGxlcnMgPSBjYWNoZWQgJiYgY2FjaGVkLmNvbnRyb2xsZXJzO1xyXG5cdFx0d2hpbGUgKGRhdGEudmlldyAhPSBudWxsKSBkYXRhID0gY2hlY2tWaWV3KGRhdGEsIGRhdGEudmlldy4kb3JpZ2luYWwgfHwgZGF0YS52aWV3LCBjYWNoZWQsIGNhY2hlZENvbnRyb2xsZXJzLCBjb250cm9sbGVycywgdmlld3MpO1xyXG5cdFx0cmV0dXJuIGRhdGE7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZE9iamVjdChkYXRhLCBjYWNoZWQsIGVkaXRhYmxlLCBwYXJlbnRFbGVtZW50LCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIG5hbWVzcGFjZSwgY29uZmlncykge1xyXG5cdFx0dmFyIHZpZXdzID0gW10sIGNvbnRyb2xsZXJzID0gW107XHJcblx0XHRkYXRhID0gbWFya1ZpZXdzKGRhdGEsIGNhY2hlZCwgdmlld3MsIGNvbnRyb2xsZXJzKTtcclxuXHRcdGlmICghZGF0YS50YWcgJiYgY29udHJvbGxlcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnQgdGVtcGxhdGUgbXVzdCByZXR1cm4gYSB2aXJ0dWFsIGVsZW1lbnQsIG5vdCBhbiBhcnJheSwgc3RyaW5nLCBldGMuXCIpO1xyXG5cdFx0ZGF0YS5hdHRycyA9IGRhdGEuYXR0cnMgfHwge307XHJcblx0XHRjYWNoZWQuYXR0cnMgPSBjYWNoZWQuYXR0cnMgfHwge307XHJcblx0XHR2YXIgZGF0YUF0dHJLZXlzID0gT2JqZWN0LmtleXMoZGF0YS5hdHRycyk7XHJcblx0XHR2YXIgaGFzS2V5cyA9IGRhdGFBdHRyS2V5cy5sZW5ndGggPiAoXCJrZXlcIiBpbiBkYXRhLmF0dHJzID8gMSA6IDApO1xyXG5cdFx0bWF5YmVSZWNyZWF0ZU9iamVjdChkYXRhLCBjYWNoZWQsIGRhdGFBdHRyS2V5cyk7XHJcblx0XHRpZiAoIWlzU3RyaW5nKGRhdGEudGFnKSkgcmV0dXJuO1xyXG5cdFx0dmFyIGlzTmV3ID0gY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMDtcclxuXHRcdG5hbWVzcGFjZSA9IGdldE9iamVjdE5hbWVzcGFjZShkYXRhLCBuYW1lc3BhY2UpO1xyXG5cdFx0dmFyIG5vZGU7XHJcblx0XHRpZiAoaXNOZXcpIHtcclxuXHRcdFx0bm9kZSA9IGNvbnN0cnVjdE5vZGUoZGF0YSwgbmFtZXNwYWNlKTtcclxuXHRcdFx0Ly9zZXQgYXR0cmlidXRlcyBmaXJzdCwgdGhlbiBjcmVhdGUgY2hpbGRyZW5cclxuXHRcdFx0dmFyIGF0dHJzID0gY29uc3RydWN0QXR0cnMoZGF0YSwgbm9kZSwgbmFtZXNwYWNlLCBoYXNLZXlzKVxyXG5cdFx0XHR2YXIgY2hpbGRyZW4gPSBjb25zdHJ1Y3RDaGlsZHJlbihkYXRhLCBub2RlLCBjYWNoZWQsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xyXG5cdFx0XHRjYWNoZWQgPSByZWNvbnN0cnVjdENhY2hlZChkYXRhLCBhdHRycywgY2hpbGRyZW4sIG5vZGUsIG5hbWVzcGFjZSwgdmlld3MsIGNvbnRyb2xsZXJzKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRub2RlID0gYnVpbGRVcGRhdGVkTm9kZShjYWNoZWQsIGRhdGEsIGVkaXRhYmxlLCBoYXNLZXlzLCBuYW1lc3BhY2UsIHZpZXdzLCBjb25maWdzLCBjb250cm9sbGVycyk7XHJcblx0XHR9XHJcblx0XHRpZiAoaXNOZXcgfHwgc2hvdWxkUmVhdHRhY2ggPT09IHRydWUgJiYgbm9kZSAhPSBudWxsKSBpbnNlcnROb2RlKHBhcmVudEVsZW1lbnQsIG5vZGUsIGluZGV4KTtcclxuXHRcdC8vc2NoZWR1bGUgY29uZmlncyB0byBiZSBjYWxsZWQuIFRoZXkgYXJlIGNhbGxlZCBhZnRlciBgYnVpbGRgXHJcblx0XHQvL2ZpbmlzaGVzIHJ1bm5pbmdcclxuXHRcdHNjaGVkdWxlQ29uZmlnc1RvQmVDYWxsZWQoY29uZmlncywgZGF0YSwgbm9kZSwgaXNOZXcsIGNhY2hlZCk7XHJcblx0XHRyZXR1cm4gY2FjaGVkXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIHBhcmVudENhY2hlLCBwYXJlbnRJbmRleCwgZGF0YSwgY2FjaGVkLCBzaG91bGRSZWF0dGFjaCwgaW5kZXgsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcclxuXHRcdC8vYGJ1aWxkYCBpcyBhIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IG1hbmFnZXMgY3JlYXRpb24vZGlmZmluZy9yZW1vdmFsXHJcblx0XHQvL29mIERPTSBlbGVtZW50cyBiYXNlZCBvbiBjb21wYXJpc29uIGJldHdlZW4gYGRhdGFgIGFuZCBgY2FjaGVkYFxyXG5cdFx0Ly90aGUgZGlmZiBhbGdvcml0aG0gY2FuIGJlIHN1bW1hcml6ZWQgYXMgdGhpczpcclxuXHRcdC8vMSAtIGNvbXBhcmUgYGRhdGFgIGFuZCBgY2FjaGVkYFxyXG5cdFx0Ly8yIC0gaWYgdGhleSBhcmUgZGlmZmVyZW50LCBjb3B5IGBkYXRhYCB0byBgY2FjaGVkYCBhbmQgdXBkYXRlIHRoZSBET01cclxuXHRcdC8vICAgIGJhc2VkIG9uIHdoYXQgdGhlIGRpZmZlcmVuY2UgaXNcclxuXHRcdC8vMyAtIHJlY3Vyc2l2ZWx5IGFwcGx5IHRoaXMgYWxnb3JpdGhtIGZvciBldmVyeSBhcnJheSBhbmQgZm9yIHRoZVxyXG5cdFx0Ly8gICAgY2hpbGRyZW4gb2YgZXZlcnkgdmlydHVhbCBlbGVtZW50XHJcblxyXG5cdFx0Ly90aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzXHJcblx0XHQvL3JlZHJhdydzIGBkYXRhYCBkYXRhIHN0cnVjdHVyZSwgd2l0aCBhIGZldyBhZGRpdGlvbnM6XHJcblx0XHQvLy0gYGNhY2hlZGAgYWx3YXlzIGhhcyBhIHByb3BlcnR5IGNhbGxlZCBgbm9kZXNgLCB3aGljaCBpcyBhIGxpc3Qgb2ZcclxuXHRcdC8vICAgRE9NIGVsZW1lbnRzIHRoYXQgY29ycmVzcG9uZCB0byB0aGUgZGF0YSByZXByZXNlbnRlZCBieSB0aGVcclxuXHRcdC8vICAgcmVzcGVjdGl2ZSB2aXJ0dWFsIGVsZW1lbnRcclxuXHRcdC8vLSBpbiBvcmRlciB0byBzdXBwb3J0IGF0dGFjaGluZyBgbm9kZXNgIGFzIGEgcHJvcGVydHkgb2YgYGNhY2hlZGAsXHJcblx0XHQvLyAgIGBjYWNoZWRgIGlzICphbHdheXMqIGEgbm9uLXByaW1pdGl2ZSBvYmplY3QsIGkuZS4gaWYgdGhlIGRhdGEgd2FzXHJcblx0XHQvLyAgIGEgc3RyaW5nLCB0aGVuIGNhY2hlZCBpcyBhIFN0cmluZyBpbnN0YW5jZS4gSWYgZGF0YSB3YXMgYG51bGxgIG9yXHJcblx0XHQvLyAgIGB1bmRlZmluZWRgLCBjYWNoZWQgaXMgYG5ldyBTdHJpbmcoXCJcIilgXHJcblx0XHQvLy0gYGNhY2hlZCBhbHNvIGhhcyBhIGBjb25maWdDb250ZXh0YCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHN0YXRlXHJcblx0XHQvLyAgIHN0b3JhZ2Ugb2JqZWN0IGV4cG9zZWQgYnkgY29uZmlnKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpXHJcblx0XHQvLy0gd2hlbiBgY2FjaGVkYCBpcyBhbiBPYmplY3QsIGl0IHJlcHJlc2VudHMgYSB2aXJ0dWFsIGVsZW1lbnQ7IHdoZW5cclxuXHRcdC8vICAgaXQncyBhbiBBcnJheSwgaXQgcmVwcmVzZW50cyBhIGxpc3Qgb2YgZWxlbWVudHM7IHdoZW4gaXQncyBhXHJcblx0XHQvLyAgIFN0cmluZywgTnVtYmVyIG9yIEJvb2xlYW4sIGl0IHJlcHJlc2VudHMgYSB0ZXh0IG5vZGVcclxuXHJcblx0XHQvL2BwYXJlbnRFbGVtZW50YCBpcyBhIERPTSBlbGVtZW50IHVzZWQgZm9yIFczQyBET00gQVBJIGNhbGxzXHJcblx0XHQvL2BwYXJlbnRUYWdgIGlzIG9ubHkgdXNlZCBmb3IgaGFuZGxpbmcgYSBjb3JuZXIgY2FzZSBmb3IgdGV4dGFyZWFcclxuXHRcdC8vdmFsdWVzXHJcblx0XHQvL2BwYXJlbnRDYWNoZWAgaXMgdXNlZCB0byByZW1vdmUgbm9kZXMgaW4gc29tZSBtdWx0aS1ub2RlIGNhc2VzXHJcblx0XHQvL2BwYXJlbnRJbmRleGAgYW5kIGBpbmRleGAgYXJlIHVzZWQgdG8gZmlndXJlIG91dCB0aGUgb2Zmc2V0IG9mIG5vZGVzLlxyXG5cdFx0Ly9UaGV5J3JlIGFydGlmYWN0cyBmcm9tIGJlZm9yZSBhcnJheXMgc3RhcnRlZCBiZWluZyBmbGF0dGVuZWQgYW5kIGFyZVxyXG5cdFx0Ly9saWtlbHkgcmVmYWN0b3JhYmxlXHJcblx0XHQvL2BkYXRhYCBhbmQgYGNhY2hlZGAgYXJlLCByZXNwZWN0aXZlbHksIHRoZSBuZXcgYW5kIG9sZCBub2RlcyBiZWluZ1xyXG5cdFx0Ly9kaWZmZWRcclxuXHRcdC8vYHNob3VsZFJlYXR0YWNoYCBpcyBhIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIGEgcGFyZW50IG5vZGUgd2FzXHJcblx0XHQvL3JlY3JlYXRlZCAoaWYgc28sIGFuZCBpZiB0aGlzIG5vZGUgaXMgcmV1c2VkLCB0aGVuIHRoaXMgbm9kZSBtdXN0XHJcblx0XHQvL3JlYXR0YWNoIGl0c2VsZiB0byB0aGUgbmV3IHBhcmVudClcclxuXHRcdC8vYGVkaXRhYmxlYCBpcyBhIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBhbiBhbmNlc3RvciBpc1xyXG5cdFx0Ly9jb250ZW50ZWRpdGFibGVcclxuXHRcdC8vYG5hbWVzcGFjZWAgaW5kaWNhdGVzIHRoZSBjbG9zZXN0IEhUTUwgbmFtZXNwYWNlIGFzIGl0IGNhc2NhZGVzIGRvd25cclxuXHRcdC8vZnJvbSBhbiBhbmNlc3RvclxyXG5cdFx0Ly9gY29uZmlnc2AgaXMgYSBsaXN0IG9mIGNvbmZpZyBmdW5jdGlvbnMgdG8gcnVuIGFmdGVyIHRoZSB0b3Btb3N0XHJcblx0XHQvL2BidWlsZGAgY2FsbCBmaW5pc2hlcyBydW5uaW5nXHJcblxyXG5cdFx0Ly90aGVyZSdzIGxvZ2ljIHRoYXQgcmVsaWVzIG9uIHRoZSBhc3N1bXB0aW9uIHRoYXQgbnVsbCBhbmQgdW5kZWZpbmVkXHJcblx0XHQvL2RhdGEgYXJlIGVxdWl2YWxlbnQgdG8gZW1wdHkgc3RyaW5nc1xyXG5cdFx0Ly8tIHRoaXMgcHJldmVudHMgbGlmZWN5Y2xlIHN1cnByaXNlcyBmcm9tIHByb2NlZHVyYWwgaGVscGVycyB0aGF0IG1peFxyXG5cdFx0Ly8gIGltcGxpY2l0IGFuZCBleHBsaWNpdCByZXR1cm4gc3RhdGVtZW50cyAoZS5nLlxyXG5cdFx0Ly8gIGZ1bmN0aW9uIGZvbygpIHtpZiAoY29uZCkgcmV0dXJuIG0oXCJkaXZcIil9XHJcblx0XHQvLy0gaXQgc2ltcGxpZmllcyBkaWZmaW5nIGNvZGVcclxuXHRcdGRhdGEgPSBkYXRhVG9TdHJpbmcoZGF0YSk7XHJcblx0XHRpZiAoZGF0YS5zdWJ0cmVlID09PSBcInJldGFpblwiKSByZXR1cm4gY2FjaGVkO1xyXG5cdFx0Y2FjaGVkID0gbWFrZUNhY2hlKGRhdGEsIGNhY2hlZCwgaW5kZXgsIHBhcmVudEluZGV4LCBwYXJlbnRDYWNoZSk7XHJcblx0XHRyZXR1cm4gaXNBcnJheShkYXRhKSA/IGJ1aWxkQXJyYXkoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBpbmRleCwgcGFyZW50VGFnLCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykgOlxyXG5cdFx0XHRkYXRhICE9IG51bGwgJiYgaXNPYmplY3QoZGF0YSkgPyBidWlsZE9iamVjdChkYXRhLCBjYWNoZWQsIGVkaXRhYmxlLCBwYXJlbnRFbGVtZW50LCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIG5hbWVzcGFjZSwgY29uZmlncykgOlxyXG5cdFx0XHQhaXNGdW5jdGlvbihkYXRhKSA/IGhhbmRsZVRleHQoY2FjaGVkLCBkYXRhLCBpbmRleCwgcGFyZW50RWxlbWVudCwgc2hvdWxkUmVhdHRhY2gsIGVkaXRhYmxlLCBwYXJlbnRUYWcpIDpcclxuXHRcdFx0Y2FjaGVkO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBzb3J0Q2hhbmdlcyhhLCBiKSB7IHJldHVybiBhLmFjdGlvbiAtIGIuYWN0aW9uIHx8IGEuaW5kZXggLSBiLmluZGV4OyB9XHJcblx0ZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhub2RlLCB0YWcsIGRhdGFBdHRycywgY2FjaGVkQXR0cnMsIG5hbWVzcGFjZSkge1xyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gZGF0YUF0dHJzKSB7XHJcblx0XHRcdHZhciBkYXRhQXR0ciA9IGRhdGFBdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdHZhciBjYWNoZWRBdHRyID0gY2FjaGVkQXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHRpZiAoIShhdHRyTmFtZSBpbiBjYWNoZWRBdHRycykgfHwgKGNhY2hlZEF0dHIgIT09IGRhdGFBdHRyKSkge1xyXG5cdFx0XHRcdGNhY2hlZEF0dHJzW2F0dHJOYW1lXSA9IGRhdGFBdHRyO1xyXG5cdFx0XHRcdC8vYGNvbmZpZ2AgaXNuJ3QgYSByZWFsIGF0dHJpYnV0ZXMsIHNvIGlnbm9yZSBpdFxyXG5cdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJjb25maWdcIiB8fCBhdHRyTmFtZSA9PT0gXCJrZXlcIikgY29udGludWU7XHJcblx0XHRcdFx0Ly9ob29rIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBhdXRvLXJlZHJhd2luZyBzeXN0ZW1cclxuXHRcdFx0XHRlbHNlIGlmIChpc0Z1bmN0aW9uKGRhdGFBdHRyKSAmJiBhdHRyTmFtZS5zbGljZSgwLCAyKSA9PT0gXCJvblwiKSB7XHJcblx0XHRcdFx0bm9kZVthdHRyTmFtZV0gPSBhdXRvcmVkcmF3KGRhdGFBdHRyLCBub2RlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9oYW5kbGUgYHN0eWxlOiB7Li4ufWBcclxuXHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJzdHlsZVwiICYmIGRhdGFBdHRyICE9IG51bGwgJiYgaXNPYmplY3QoZGF0YUF0dHIpKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgcnVsZSBpbiBkYXRhQXR0cikge1xyXG5cdFx0XHRcdFx0XHRpZiAoY2FjaGVkQXR0ciA9PSBudWxsIHx8IGNhY2hlZEF0dHJbcnVsZV0gIT09IGRhdGFBdHRyW3J1bGVdKSBub2RlLnN0eWxlW3J1bGVdID0gZGF0YUF0dHJbcnVsZV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gY2FjaGVkQXR0cikge1xyXG5cdFx0XHRcdFx0XHRpZiAoIShydWxlIGluIGRhdGFBdHRyKSkgbm9kZS5zdHlsZVtydWxlXSA9IFwiXCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvL2hhbmRsZSBTVkdcclxuXHRcdFx0XHRlbHNlIGlmIChuYW1lc3BhY2UgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJocmVmXCIpIG5vZGUuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwiaHJlZlwiLCBkYXRhQXR0cik7XHJcblx0XHRcdFx0ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSA9PT0gXCJjbGFzc05hbWVcIiA/IFwiY2xhc3NcIiA6IGF0dHJOYW1lLCBkYXRhQXR0cik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vaGFuZGxlIGNhc2VzIHRoYXQgYXJlIHByb3BlcnRpZXMgKGJ1dCBpZ25vcmUgY2FzZXMgd2hlcmUgd2Ugc2hvdWxkIHVzZSBzZXRBdHRyaWJ1dGUgaW5zdGVhZClcclxuXHRcdFx0XHQvLy0gbGlzdCBhbmQgZm9ybSBhcmUgdHlwaWNhbGx5IHVzZWQgYXMgc3RyaW5ncywgYnV0IGFyZSBET00gZWxlbWVudCByZWZlcmVuY2VzIGluIGpzXHJcblx0XHRcdFx0Ly8tIHdoZW4gdXNpbmcgQ1NTIHNlbGVjdG9ycyAoZS5nLiBgbShcIltzdHlsZT0nJ11cIilgKSwgc3R5bGUgaXMgdXNlZCBhcyBhIHN0cmluZywgYnV0IGl0J3MgYW4gb2JqZWN0IGluIGpzXHJcblx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgaW4gbm9kZSAmJiBhdHRyTmFtZSAhPT0gXCJsaXN0XCIgJiYgYXR0ck5hbWUgIT09IFwic3R5bGVcIiAmJiBhdHRyTmFtZSAhPT0gXCJmb3JtXCIgJiYgYXR0ck5hbWUgIT09IFwidHlwZVwiICYmIGF0dHJOYW1lICE9PSBcIndpZHRoXCIgJiYgYXR0ck5hbWUgIT09IFwiaGVpZ2h0XCIpIHtcclxuXHRcdFx0XHQvLyMzNDggZG9uJ3Qgc2V0IHRoZSB2YWx1ZSBpZiBub3QgbmVlZGVkIG90aGVyd2lzZSBjdXJzb3IgcGxhY2VtZW50IGJyZWFrcyBpbiBDaHJvbWVcclxuXHRcdFx0XHRpZiAodGFnICE9PSBcImlucHV0XCIgfHwgbm9kZVthdHRyTmFtZV0gIT09IGRhdGFBdHRyKSBub2RlW2F0dHJOYW1lXSA9IGRhdGFBdHRyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhQXR0cik7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8jMzQ4IGRhdGFBdHRyIG1heSBub3QgYmUgYSBzdHJpbmcsIHNvIHVzZSBsb29zZSBjb21wYXJpc29uIChkb3VibGUgZXF1YWwpIGluc3RlYWQgb2Ygc3RyaWN0ICh0cmlwbGUgZXF1YWwpXHJcblx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInZhbHVlXCIgJiYgdGFnID09PSBcImlucHV0XCIgJiYgbm9kZS52YWx1ZSAhPSBkYXRhQXR0cikge1xyXG5cdFx0XHRcdG5vZGUudmFsdWUgPSBkYXRhQXR0cjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNhY2hlZEF0dHJzO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBjbGVhcihub2RlcywgY2FjaGVkKSB7XHJcblx0XHRmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuXHRcdFx0aWYgKG5vZGVzW2ldICYmIG5vZGVzW2ldLnBhcmVudE5vZGUpIHtcclxuXHRcdFx0XHR0cnkgeyBub2Rlc1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGVzW2ldKTsgfVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7fSAvL2lnbm9yZSBpZiB0aGlzIGZhaWxzIGR1ZSB0byBvcmRlciBvZiBldmVudHMgKHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIxOTI2MDgzL2ZhaWxlZC10by1leGVjdXRlLXJlbW92ZWNoaWxkLW9uLW5vZGUpXHJcblx0XHRcdFx0Y2FjaGVkID0gW10uY29uY2F0KGNhY2hlZCk7XHJcblx0XHRcdFx0aWYgKGNhY2hlZFtpXSkgdW5sb2FkKGNhY2hlZFtpXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vcmVsZWFzZSBtZW1vcnkgaWYgbm9kZXMgaXMgYW4gYXJyYXkuIFRoaXMgY2hlY2sgc2hvdWxkIGZhaWwgaWYgbm9kZXMgaXMgYSBOb2RlTGlzdCAoc2VlIGxvb3AgYWJvdmUpXHJcblx0XHRpZiAobm9kZXMubGVuZ3RoKSBub2Rlcy5sZW5ndGggPSAwO1xyXG5cdH1cclxuXHRmdW5jdGlvbiB1bmxvYWQoY2FjaGVkKSB7XHJcblx0XHRpZiAoY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgaXNGdW5jdGlvbihjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCkpIHtcclxuXHRcdFx0Y2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKTtcclxuXHRcdFx0Y2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGNhY2hlZC5jb250cm9sbGVycykge1xyXG5cdFx0XHRmb3JFYWNoKGNhY2hlZC5jb250cm9sbGVycywgZnVuY3Rpb24gKGNvbnRyb2xsZXIpIHtcclxuXHRcdFx0XHRpZiAoaXNGdW5jdGlvbihjb250cm9sbGVyLm9udW5sb2FkKSkgY29udHJvbGxlci5vbnVubG9hZCh7cHJldmVudERlZmF1bHQ6IG5vb3B9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoY2FjaGVkLmNoaWxkcmVuKSB7XHJcblx0XHRcdGlmIChpc0FycmF5KGNhY2hlZC5jaGlsZHJlbikpIGZvckVhY2goY2FjaGVkLmNoaWxkcmVuLCB1bmxvYWQpO1xyXG5cdFx0XHRlbHNlIGlmIChjYWNoZWQuY2hpbGRyZW4udGFnKSB1bmxvYWQoY2FjaGVkLmNoaWxkcmVuKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBpbnNlcnRBZGphY2VudEJlZm9yZUVuZCA9IChmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgcmFuZ2VTdHJhdGVneSA9IGZ1bmN0aW9uIChwYXJlbnRFbGVtZW50LCBkYXRhKSB7XHJcblx0XHRcdHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoJGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KGRhdGEpKTtcclxuXHRcdH07XHJcblx0XHR2YXIgaW5zZXJ0QWRqYWNlbnRTdHJhdGVneSA9IGZ1bmN0aW9uIChwYXJlbnRFbGVtZW50LCBkYXRhKSB7XHJcblx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGRhdGEpO1xyXG5cdFx0fTtcclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHQkZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoJ3gnKTtcclxuXHRcdFx0cmV0dXJuIHJhbmdlU3RyYXRlZ3k7XHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdHJldHVybiBpbnNlcnRBZGphY2VudFN0cmF0ZWd5O1xyXG5cdFx0fVxyXG5cdH0pKCk7XHJcblxyXG5cdGZ1bmN0aW9uIGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpIHtcclxuXHRcdHZhciBuZXh0U2libGluZyA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF07XHJcblx0XHRpZiAobmV4dFNpYmxpbmcpIHtcclxuXHRcdFx0dmFyIGlzRWxlbWVudCA9IG5leHRTaWJsaW5nLm5vZGVUeXBlICE9PSAxO1xyXG5cdFx0XHR2YXIgcGxhY2Vob2xkZXIgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcblx0XHRcdGlmIChpc0VsZW1lbnQpIHtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgbmV4dFNpYmxpbmcgfHwgbnVsbCk7XHJcblx0XHRcdFx0cGxhY2Vob2xkZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZGF0YSk7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwbGFjZWhvbGRlcik7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBuZXh0U2libGluZy5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaW5zZXJ0QWRqYWNlbnRCZWZvcmVFbmQocGFyZW50RWxlbWVudCwgZGF0YSk7XHJcblxyXG5cdFx0dmFyIG5vZGVzID0gW107XHJcblx0XHR3aGlsZSAocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSAhPT0gbmV4dFNpYmxpbmcpIHtcclxuXHRcdFx0bm9kZXMucHVzaChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdFx0aW5kZXgrKztcclxuXHRcdH1cclxuXHRcdHJldHVybiBub2RlcztcclxuXHR9XHJcblx0ZnVuY3Rpb24gYXV0b3JlZHJhdyhjYWxsYmFjaywgb2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpO1xyXG5cdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0dHJ5IHsgcmV0dXJuIGNhbGxiYWNrLmNhbGwob2JqZWN0LCBlKTsgfVxyXG5cdFx0XHRmaW5hbGx5IHtcclxuXHRcdFx0XHRlbmRGaXJzdENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHR2YXIgaHRtbDtcclxuXHR2YXIgZG9jdW1lbnROb2RlID0ge1xyXG5cdFx0YXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKG5vZGUpIHtcclxuXHRcdFx0aWYgKGh0bWwgPT09IHVuZGVmaW5lZCkgaHRtbCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHRtbFwiKTtcclxuXHRcdFx0aWYgKCRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAhPT0gbm9kZSkge1xyXG5cdFx0XHRcdCRkb2N1bWVudC5yZXBsYWNlQ2hpbGQobm9kZSwgJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSAkZG9jdW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcblx0XHRcdHRoaXMuY2hpbGROb2RlcyA9ICRkb2N1bWVudC5jaGlsZE5vZGVzO1xyXG5cdFx0fSxcclxuXHRcdGluc2VydEJlZm9yZTogZnVuY3Rpb24obm9kZSkge1xyXG5cdFx0XHR0aGlzLmFwcGVuZENoaWxkKG5vZGUpO1xyXG5cdFx0fSxcclxuXHRcdGNoaWxkTm9kZXM6IFtdXHJcblx0fTtcclxuXHR2YXIgbm9kZUNhY2hlID0gW10sIGNlbGxDYWNoZSA9IHt9O1xyXG5cdG0ucmVuZGVyID0gZnVuY3Rpb24ocm9vdCwgY2VsbCwgZm9yY2VSZWNyZWF0aW9uKSB7XHJcblx0XHR2YXIgY29uZmlncyA9IFtdO1xyXG5cdFx0aWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoXCJFbnN1cmUgdGhlIERPTSBlbGVtZW50IGJlaW5nIHBhc3NlZCB0byBtLnJvdXRlL20ubW91bnQvbS5yZW5kZXIgaXMgbm90IHVuZGVmaW5lZC5cIik7XHJcblx0XHR2YXIgaWQgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdCk7XHJcblx0XHR2YXIgaXNEb2N1bWVudFJvb3QgPSByb290ID09PSAkZG9jdW1lbnQ7XHJcblx0XHR2YXIgbm9kZSA9IGlzRG9jdW1lbnRSb290IHx8IHJvb3QgPT09ICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyBkb2N1bWVudE5vZGUgOiByb290O1xyXG5cdFx0aWYgKGlzRG9jdW1lbnRSb290ICYmIGNlbGwudGFnICE9PSBcImh0bWxcIikgY2VsbCA9IHt0YWc6IFwiaHRtbFwiLCBhdHRyczoge30sIGNoaWxkcmVuOiBjZWxsfTtcclxuXHRcdGlmIChjZWxsQ2FjaGVbaWRdID09PSB1bmRlZmluZWQpIGNsZWFyKG5vZGUuY2hpbGROb2Rlcyk7XHJcblx0XHRpZiAoZm9yY2VSZWNyZWF0aW9uID09PSB0cnVlKSByZXNldChyb290KTtcclxuXHRcdGNlbGxDYWNoZVtpZF0gPSBidWlsZChub2RlLCBudWxsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2VsbCwgY2VsbENhY2hlW2lkXSwgZmFsc2UsIDAsIG51bGwsIHVuZGVmaW5lZCwgY29uZmlncyk7XHJcblx0XHRmb3JFYWNoKGNvbmZpZ3MsIGZ1bmN0aW9uIChjb25maWcpIHsgY29uZmlnKCk7IH0pO1xyXG5cdH07XHJcblx0ZnVuY3Rpb24gZ2V0Q2VsbENhY2hlS2V5KGVsZW1lbnQpIHtcclxuXHRcdHZhciBpbmRleCA9IG5vZGVDYWNoZS5pbmRleE9mKGVsZW1lbnQpO1xyXG5cdFx0cmV0dXJuIGluZGV4IDwgMCA/IG5vZGVDYWNoZS5wdXNoKGVsZW1lbnQpIC0gMSA6IGluZGV4O1xyXG5cdH1cclxuXHJcblx0bS50cnVzdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHR2YWx1ZSA9IG5ldyBTdHJpbmcodmFsdWUpO1xyXG5cdFx0dmFsdWUuJHRydXN0ZWQgPSB0cnVlO1xyXG5cdFx0cmV0dXJuIHZhbHVlO1xyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIGdldHRlcnNldHRlcihzdG9yZSkge1xyXG5cdFx0dmFyIHByb3AgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHN0b3JlID0gYXJndW1lbnRzWzBdO1xyXG5cdFx0XHRyZXR1cm4gc3RvcmU7XHJcblx0XHR9O1xyXG5cclxuXHRcdHByb3AudG9KU09OID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzdG9yZTtcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIHByb3A7XHJcblx0fVxyXG5cclxuXHRtLnByb3AgPSBmdW5jdGlvbiAoc3RvcmUpIHtcclxuXHRcdC8vbm90ZTogdXNpbmcgbm9uLXN0cmljdCBlcXVhbGl0eSBjaGVjayBoZXJlIGJlY2F1c2Ugd2UncmUgY2hlY2tpbmcgaWYgc3RvcmUgaXMgbnVsbCBPUiB1bmRlZmluZWRcclxuXHRcdGlmICgoc3RvcmUgIT0gbnVsbCAmJiBpc09iamVjdChzdG9yZSkgfHwgaXNGdW5jdGlvbihzdG9yZSkpICYmIGlzRnVuY3Rpb24oc3RvcmUudGhlbikpIHtcclxuXHRcdFx0cmV0dXJuIHByb3BpZnkoc3RvcmUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBnZXR0ZXJzZXR0ZXIoc3RvcmUpO1xyXG5cdH07XHJcblxyXG5cdHZhciByb290cyA9IFtdLCBjb21wb25lbnRzID0gW10sIGNvbnRyb2xsZXJzID0gW10sIGxhc3RSZWRyYXdJZCA9IG51bGwsIGxhc3RSZWRyYXdDYWxsVGltZSA9IDAsIGNvbXB1dGVQcmVSZWRyYXdIb29rID0gbnVsbCwgY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbCwgdG9wQ29tcG9uZW50LCB1bmxvYWRlcnMgPSBbXTtcclxuXHR2YXIgRlJBTUVfQlVER0VUID0gMTY7IC8vNjAgZnJhbWVzIHBlciBzZWNvbmQgPSAxIGNhbGwgcGVyIDE2IG1zXHJcblx0ZnVuY3Rpb24gcGFyYW1ldGVyaXplKGNvbXBvbmVudCwgYXJncykge1xyXG5cdFx0dmFyIGNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIChjb21wb25lbnQuY29udHJvbGxlciB8fCBub29wKS5hcHBseSh0aGlzLCBhcmdzKSB8fCB0aGlzO1xyXG5cdFx0fTtcclxuXHRcdGlmIChjb21wb25lbnQuY29udHJvbGxlcikgY29udHJvbGxlci5wcm90b3R5cGUgPSBjb21wb25lbnQuY29udHJvbGxlci5wcm90b3R5cGU7XHJcblx0XHR2YXIgdmlldyA9IGZ1bmN0aW9uKGN0cmwpIHtcclxuXHRcdFx0dmFyIGN1cnJlbnRBcmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmdzLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpIDogYXJncztcclxuXHRcdFx0cmV0dXJuIGNvbXBvbmVudC52aWV3LmFwcGx5KGNvbXBvbmVudCwgY3VycmVudEFyZ3MgPyBbY3RybF0uY29uY2F0KGN1cnJlbnRBcmdzKSA6IFtjdHJsXSk7XHJcblx0XHR9O1xyXG5cdFx0dmlldy4kb3JpZ2luYWwgPSBjb21wb25lbnQudmlldztcclxuXHRcdHZhciBvdXRwdXQgPSB7Y29udHJvbGxlcjogY29udHJvbGxlciwgdmlldzogdmlld307XHJcblx0XHRpZiAoYXJnc1swXSAmJiBhcmdzWzBdLmtleSAhPSBudWxsKSBvdXRwdXQuYXR0cnMgPSB7a2V5OiBhcmdzWzBdLmtleX07XHJcblx0XHRyZXR1cm4gb3V0cHV0O1xyXG5cdH1cclxuXHRtLmNvbXBvbmVudCA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xyXG5cdFx0Zm9yICh2YXIgYXJncyA9IFtdLCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XHJcblx0XHRyZXR1cm4gcGFyYW1ldGVyaXplKGNvbXBvbmVudCwgYXJncyk7XHJcblx0fTtcclxuXHRtLm1vdW50ID0gbS5tb2R1bGUgPSBmdW5jdGlvbihyb290LCBjb21wb25lbnQpIHtcclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LlwiKTtcclxuXHRcdHZhciBpbmRleCA9IHJvb3RzLmluZGV4T2Yocm9vdCk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSBpbmRleCA9IHJvb3RzLmxlbmd0aDtcclxuXHJcblx0XHR2YXIgaXNQcmV2ZW50ZWQgPSBmYWxzZTtcclxuXHRcdHZhciBldmVudCA9IHtwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlzUHJldmVudGVkID0gdHJ1ZTtcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsO1xyXG5cdFx0fX07XHJcblxyXG5cdFx0Zm9yRWFjaCh1bmxvYWRlcnMsIGZ1bmN0aW9uICh1bmxvYWRlcikge1xyXG5cdFx0XHR1bmxvYWRlci5oYW5kbGVyLmNhbGwodW5sb2FkZXIuY29udHJvbGxlciwgZXZlbnQpO1xyXG5cdFx0XHR1bmxvYWRlci5jb250cm9sbGVyLm9udW5sb2FkID0gbnVsbDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmIChpc1ByZXZlbnRlZCkge1xyXG5cdFx0XHRmb3JFYWNoKHVubG9hZGVycywgZnVuY3Rpb24gKHVubG9hZGVyKSB7XHJcblx0XHRcdFx0dW5sb2FkZXIuY29udHJvbGxlci5vbnVubG9hZCA9IHVubG9hZGVyLmhhbmRsZXI7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB1bmxvYWRlcnMgPSBbXTtcclxuXHJcblx0XHRpZiAoY29udHJvbGxlcnNbaW5kZXhdICYmIGlzRnVuY3Rpb24oY29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkKSkge1xyXG5cdFx0XHRjb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQoZXZlbnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBpc051bGxDb21wb25lbnQgPSBjb21wb25lbnQgPT09IG51bGw7XHJcblxyXG5cdFx0aWYgKCFpc1ByZXZlbnRlZCkge1xyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImFsbFwiKTtcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHJvb3RzW2luZGV4XSA9IHJvb3Q7XHJcblx0XHRcdHZhciBjdXJyZW50Q29tcG9uZW50ID0gY29tcG9uZW50ID8gKHRvcENvbXBvbmVudCA9IGNvbXBvbmVudCkgOiAodG9wQ29tcG9uZW50ID0gY29tcG9uZW50ID0ge2NvbnRyb2xsZXI6IG5vb3B9KTtcclxuXHRcdFx0dmFyIGNvbnRyb2xsZXIgPSBuZXcgKGNvbXBvbmVudC5jb250cm9sbGVyIHx8IG5vb3ApKCk7XHJcblx0XHRcdC8vY29udHJvbGxlcnMgbWF5IGNhbGwgbS5tb3VudCByZWN1cnNpdmVseSAodmlhIG0ucm91dGUgcmVkaXJlY3RzLCBmb3IgZXhhbXBsZSlcclxuXHRcdFx0Ly90aGlzIGNvbmRpdGlvbmFsIGVuc3VyZXMgb25seSB0aGUgbGFzdCByZWN1cnNpdmUgbS5tb3VudCBjYWxsIGlzIGFwcGxpZWRcclxuXHRcdFx0aWYgKGN1cnJlbnRDb21wb25lbnQgPT09IHRvcENvbXBvbmVudCkge1xyXG5cdFx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XSA9IGNvbnRyb2xsZXI7XHJcblx0XHRcdFx0Y29tcG9uZW50c1tpbmRleF0gPSBjb21wb25lbnQ7XHJcblx0XHRcdH1cclxuXHRcdFx0ZW5kRmlyc3RDb21wdXRhdGlvbigpO1xyXG5cdFx0XHRpZiAoaXNOdWxsQ29tcG9uZW50KSB7XHJcblx0XHRcdFx0cmVtb3ZlUm9vdEVsZW1lbnQocm9vdCwgaW5kZXgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBjb250cm9sbGVyc1tpbmRleF07XHJcblx0XHR9XHJcblx0XHRpZiAoaXNOdWxsQ29tcG9uZW50KSB7XHJcblx0XHRcdHJlbW92ZVJvb3RFbGVtZW50KHJvb3QsIGluZGV4KTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiByZW1vdmVSb290RWxlbWVudChyb290LCBpbmRleCkge1xyXG5cdFx0cm9vdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdGNvbnRyb2xsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRjb21wb25lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRyZXNldChyb290KTtcclxuXHRcdG5vZGVDYWNoZS5zcGxpY2UoZ2V0Q2VsbENhY2hlS2V5KHJvb3QpLCAxKTtcclxuXHR9XHJcblxyXG5cdHZhciByZWRyYXdpbmcgPSBmYWxzZSwgZm9yY2luZyA9IGZhbHNlO1xyXG5cdG0ucmVkcmF3ID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuXHRcdGlmIChyZWRyYXdpbmcpIHJldHVybjtcclxuXHRcdHJlZHJhd2luZyA9IHRydWU7XHJcblx0XHRpZiAoZm9yY2UpIGZvcmNpbmcgPSB0cnVlO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Ly9sYXN0UmVkcmF3SWQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgaWYgYSBzZWNvbmQgcmVkcmF3IGlzIHJlcXVlc3RlZCBiZWZvcmUgdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lXHJcblx0XHRcdC8vbGFzdFJlZHJhd0lEIGlzIG51bGwgaWYgaXQncyB0aGUgZmlyc3QgcmVkcmF3IGFuZCBub3QgYW4gZXZlbnQgaGFuZGxlclxyXG5cdFx0XHRpZiAobGFzdFJlZHJhd0lkICYmICFmb3JjZSkge1xyXG5cdFx0XHRcdC8vd2hlbiBzZXRUaW1lb3V0OiBvbmx5IHJlc2NoZWR1bGUgcmVkcmF3IGlmIHRpbWUgYmV0d2VlbiBub3cgYW5kIHByZXZpb3VzIHJlZHJhdyBpcyBiaWdnZXIgdGhhbiBhIGZyYW1lLCBvdGhlcndpc2Uga2VlcCBjdXJyZW50bHkgc2NoZWR1bGVkIHRpbWVvdXRcclxuXHRcdFx0XHQvL3doZW4gckFGOiBhbHdheXMgcmVzY2hlZHVsZSByZWRyYXdcclxuXHRcdFx0XHRpZiAoJHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBuZXcgRGF0ZSAtIGxhc3RSZWRyYXdDYWxsVGltZSA+IEZSQU1FX0JVREdFVCkge1xyXG5cdFx0XHRcdFx0aWYgKGxhc3RSZWRyYXdJZCA+IDApICRjYW5jZWxBbmltYXRpb25GcmFtZShsYXN0UmVkcmF3SWQpO1xyXG5cdFx0XHRcdFx0bGFzdFJlZHJhd0lkID0gJHJlcXVlc3RBbmltYXRpb25GcmFtZShyZWRyYXcsIEZSQU1FX0JVREdFVCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHJlZHJhdygpO1xyXG5cdFx0XHRcdGxhc3RSZWRyYXdJZCA9ICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IGxhc3RSZWRyYXdJZCA9IG51bGw7IH0sIEZSQU1FX0JVREdFVCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGZpbmFsbHkge1xyXG5cdFx0XHRyZWRyYXdpbmcgPSBmb3JjaW5nID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fTtcclxuXHRtLnJlZHJhdy5zdHJhdGVneSA9IG0ucHJvcCgpO1xyXG5cdGZ1bmN0aW9uIHJlZHJhdygpIHtcclxuXHRcdGlmIChjb21wdXRlUHJlUmVkcmF3SG9vaykge1xyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vaygpO1xyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRmb3JFYWNoKHJvb3RzLCBmdW5jdGlvbiAocm9vdCwgaSkge1xyXG5cdFx0XHR2YXIgY29tcG9uZW50ID0gY29tcG9uZW50c1tpXTtcclxuXHRcdFx0aWYgKGNvbnRyb2xsZXJzW2ldKSB7XHJcblx0XHRcdFx0dmFyIGFyZ3MgPSBbY29udHJvbGxlcnNbaV1dO1xyXG5cdFx0XHRcdG0ucmVuZGVyKHJvb3QsIGNvbXBvbmVudC52aWV3ID8gY29tcG9uZW50LnZpZXcoY29udHJvbGxlcnNbaV0sIGFyZ3MpIDogXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0Ly9hZnRlciByZW5kZXJpbmcgd2l0aGluIGEgcm91dGVkIGNvbnRleHQsIHdlIG5lZWQgdG8gc2Nyb2xsIGJhY2sgdG8gdGhlIHRvcCwgYW5kIGZldGNoIHRoZSBkb2N1bWVudCB0aXRsZSBmb3IgaGlzdG9yeS5wdXNoU3RhdGVcclxuXHRcdGlmIChjb21wdXRlUG9zdFJlZHJhd0hvb2spIHtcclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rKCk7XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRsYXN0UmVkcmF3SWQgPSBudWxsO1xyXG5cdFx0bGFzdFJlZHJhd0NhbGxUaW1lID0gbmV3IERhdGU7XHJcblx0XHRtLnJlZHJhdy5zdHJhdGVneShcImRpZmZcIik7XHJcblx0fVxyXG5cclxuXHR2YXIgcGVuZGluZ1JlcXVlc3RzID0gMDtcclxuXHRtLnN0YXJ0Q29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHsgcGVuZGluZ1JlcXVlc3RzKys7IH07XHJcblx0bS5lbmRDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHBlbmRpbmdSZXF1ZXN0cyA+IDEpIHBlbmRpbmdSZXF1ZXN0cy0tO1xyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cyA9IDA7XHJcblx0XHRcdG0ucmVkcmF3KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBlbmRGaXJzdENvbXB1dGF0aW9uKCkge1xyXG5cdFx0aWYgKG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT09IFwibm9uZVwiKSB7XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cy0tO1xyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImRpZmZcIik7XHJcblx0XHR9XHJcblx0XHRlbHNlIG0uZW5kQ29tcHV0YXRpb24oKTtcclxuXHR9XHJcblxyXG5cdG0ud2l0aEF0dHIgPSBmdW5jdGlvbihwcm9wLCB3aXRoQXR0ckNhbGxiYWNrLCBjYWxsYmFja1RoaXMpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHR2YXIgY3VycmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCB0aGlzO1xyXG5cdFx0XHR2YXIgX3RoaXMgPSBjYWxsYmFja1RoaXMgfHwgdGhpcztcclxuXHRcdFx0d2l0aEF0dHJDYWxsYmFjay5jYWxsKF90aGlzLCBwcm9wIGluIGN1cnJlbnRUYXJnZXQgPyBjdXJyZW50VGFyZ2V0W3Byb3BdIDogY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUocHJvcCkpO1xyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvL3JvdXRpbmdcclxuXHR2YXIgbW9kZXMgPSB7cGF0aG5hbWU6IFwiXCIsIGhhc2g6IFwiI1wiLCBzZWFyY2g6IFwiP1wifTtcclxuXHR2YXIgcmVkaXJlY3QgPSBub29wLCByb3V0ZVBhcmFtcywgY3VycmVudFJvdXRlLCBpc0RlZmF1bHRSb3V0ZSA9IGZhbHNlO1xyXG5cdG0ucm91dGUgPSBmdW5jdGlvbihyb290LCBhcmcxLCBhcmcyLCB2ZG9tKSB7XHJcblx0XHQvL20ucm91dGUoKVxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50Um91dGU7XHJcblx0XHQvL20ucm91dGUoZWwsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKVxyXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJiBpc1N0cmluZyhhcmcxKSkge1xyXG5cdFx0XHRyZWRpcmVjdCA9IGZ1bmN0aW9uKHNvdXJjZSkge1xyXG5cdFx0XHRcdHZhciBwYXRoID0gY3VycmVudFJvdXRlID0gbm9ybWFsaXplUm91dGUoc291cmNlKTtcclxuXHRcdFx0XHRpZiAoIXJvdXRlQnlWYWx1ZShyb290LCBhcmcyLCBwYXRoKSkge1xyXG5cdFx0XHRcdFx0aWYgKGlzRGVmYXVsdFJvdXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnN1cmUgdGhlIGRlZmF1bHQgcm91dGUgbWF0Y2hlcyBvbmUgb2YgdGhlIHJvdXRlcyBkZWZpbmVkIGluIG0ucm91dGVcIik7XHJcblx0XHRcdFx0XHRpc0RlZmF1bHRSb3V0ZSA9IHRydWU7XHJcblx0XHRcdFx0XHRtLnJvdXRlKGFyZzEsIHRydWUpO1xyXG5cdFx0XHRcdFx0aXNEZWZhdWx0Um91dGUgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdHZhciBsaXN0ZW5lciA9IG0ucm91dGUubW9kZSA9PT0gXCJoYXNoXCIgPyBcIm9uaGFzaGNoYW5nZVwiIDogXCJvbnBvcHN0YXRlXCI7XHJcblx0XHRcdHdpbmRvd1tsaXN0ZW5lcl0gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgcGF0aCA9ICRsb2NhdGlvblttLnJvdXRlLm1vZGVdO1xyXG5cdFx0XHRcdGlmIChtLnJvdXRlLm1vZGUgPT09IFwicGF0aG5hbWVcIikgcGF0aCArPSAkbG9jYXRpb24uc2VhcmNoO1xyXG5cdFx0XHRcdGlmIChjdXJyZW50Um91dGUgIT09IG5vcm1hbGl6ZVJvdXRlKHBhdGgpKSByZWRpcmVjdChwYXRoKTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gc2V0U2Nyb2xsO1xyXG5cdFx0XHR3aW5kb3dbbGlzdGVuZXJdKCk7XHJcblx0XHR9XHJcblx0XHQvL2NvbmZpZzogbS5yb3V0ZVxyXG5cdFx0ZWxzZSBpZiAocm9vdC5hZGRFdmVudExpc3RlbmVyIHx8IHJvb3QuYXR0YWNoRXZlbnQpIHtcclxuXHRcdFx0cm9vdC5ocmVmID0gKG0ucm91dGUubW9kZSAhPT0gJ3BhdGhuYW1lJyA/ICRsb2NhdGlvbi5wYXRobmFtZSA6ICcnKSArIG1vZGVzW20ucm91dGUubW9kZV0gKyB2ZG9tLmF0dHJzLmhyZWY7XHJcblx0XHRcdGlmIChyb290LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0XHRyb290LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0XHRyb290LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRyb290LmRldGFjaEV2ZW50KFwib25jbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0XHRyb290LmF0dGFjaEV2ZW50KFwib25jbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9tLnJvdXRlKHJvdXRlLCBwYXJhbXMsIHNob3VsZFJlcGxhY2VIaXN0b3J5RW50cnkpXHJcblx0XHRlbHNlIGlmIChpc1N0cmluZyhyb290KSkge1xyXG5cdFx0XHR2YXIgb2xkUm91dGUgPSBjdXJyZW50Um91dGU7XHJcblx0XHRcdGN1cnJlbnRSb3V0ZSA9IHJvb3Q7XHJcblx0XHRcdHZhciBhcmdzID0gYXJnMSB8fCB7fTtcclxuXHRcdFx0dmFyIHF1ZXJ5SW5kZXggPSBjdXJyZW50Um91dGUuaW5kZXhPZihcIj9cIik7XHJcblx0XHRcdHZhciBwYXJhbXMgPSBxdWVyeUluZGV4ID4gLTEgPyBwYXJzZVF1ZXJ5U3RyaW5nKGN1cnJlbnRSb3V0ZS5zbGljZShxdWVyeUluZGV4ICsgMSkpIDoge307XHJcblx0XHRcdGZvciAodmFyIGkgaW4gYXJncykgcGFyYW1zW2ldID0gYXJnc1tpXTtcclxuXHRcdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhwYXJhbXMpO1xyXG5cdFx0XHR2YXIgY3VycmVudFBhdGggPSBxdWVyeUluZGV4ID4gLTEgPyBjdXJyZW50Um91dGUuc2xpY2UoMCwgcXVlcnlJbmRleCkgOiBjdXJyZW50Um91dGU7XHJcblx0XHRcdGlmIChxdWVyeXN0cmluZykgY3VycmVudFJvdXRlID0gY3VycmVudFBhdGggKyAoY3VycmVudFBhdGguaW5kZXhPZihcIj9cIikgPT09IC0xID8gXCI/XCIgOiBcIiZcIikgKyBxdWVyeXN0cmluZztcclxuXHJcblx0XHRcdHZhciBzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID0gKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgPyBhcmcyIDogYXJnMSkgPT09IHRydWUgfHwgb2xkUm91dGUgPT09IHJvb3Q7XHJcblxyXG5cdFx0XHRpZiAod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XHJcblx0XHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBzZXRTY3JvbGw7XHJcblx0XHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR3aW5kb3cuaGlzdG9yeVtzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID8gXCJyZXBsYWNlU3RhdGVcIiA6IFwicHVzaFN0YXRlXCJdKG51bGwsICRkb2N1bWVudC50aXRsZSwgbW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRyZWRpcmVjdChtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHQkbG9jYXRpb25bbS5yb3V0ZS5tb2RlXSA9IGN1cnJlbnRSb3V0ZTtcclxuXHRcdFx0XHRyZWRpcmVjdChtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcblx0bS5yb3V0ZS5wYXJhbSA9IGZ1bmN0aW9uKGtleSkge1xyXG5cdFx0aWYgKCFyb3V0ZVBhcmFtcykgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgY2FsbCBtLnJvdXRlKGVsZW1lbnQsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKSBiZWZvcmUgY2FsbGluZyBtLnJvdXRlLnBhcmFtKClcIik7XHJcblx0XHRpZiggIWtleSApe1xyXG5cdFx0XHRyZXR1cm4gcm91dGVQYXJhbXM7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcm91dGVQYXJhbXNba2V5XTtcclxuXHR9O1xyXG5cdG0ucm91dGUubW9kZSA9IFwic2VhcmNoXCI7XHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplUm91dGUocm91dGUpIHtcclxuXHRcdHJldHVybiByb3V0ZS5zbGljZShtb2Rlc1ttLnJvdXRlLm1vZGVdLmxlbmd0aCk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJvdXRlQnlWYWx1ZShyb290LCByb3V0ZXIsIHBhdGgpIHtcclxuXHRcdHJvdXRlUGFyYW1zID0ge307XHJcblxyXG5cdFx0dmFyIHF1ZXJ5U3RhcnQgPSBwYXRoLmluZGV4T2YoXCI/XCIpO1xyXG5cdFx0aWYgKHF1ZXJ5U3RhcnQgIT09IC0xKSB7XHJcblx0XHRcdHJvdXRlUGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhwYXRoLnN1YnN0cihxdWVyeVN0YXJ0ICsgMSwgcGF0aC5sZW5ndGgpKTtcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyKDAsIHF1ZXJ5U3RhcnQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCBhbGwgcm91dGVzIGFuZCBjaGVjayBpZiB0aGVyZSdzXHJcblx0XHQvLyBhbiBleGFjdCBtYXRjaCBmb3IgdGhlIGN1cnJlbnQgcGF0aFxyXG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb3V0ZXIpO1xyXG5cdFx0dmFyIGluZGV4ID0ga2V5cy5pbmRleE9mKHBhdGgpO1xyXG5cdFx0aWYoaW5kZXggIT09IC0xKXtcclxuXHRcdFx0bS5tb3VudChyb290LCByb3V0ZXJba2V5cyBbaW5kZXhdXSk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIHJvdXRlIGluIHJvdXRlcikge1xyXG5cdFx0XHRpZiAocm91dGUgPT09IHBhdGgpIHtcclxuXHRcdFx0XHRtLm1vdW50KHJvb3QsIHJvdXRlcltyb3V0ZV0pO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoXCJeXCIgKyByb3V0ZS5yZXBsYWNlKC86W15cXC9dKz9cXC57M30vZywgXCIoLio/KVwiKS5yZXBsYWNlKC86W15cXC9dKy9nLCBcIihbXlxcXFwvXSspXCIpICsgXCJcXC8/JFwiKTtcclxuXHJcblx0XHRcdGlmIChtYXRjaGVyLnRlc3QocGF0aCkpIHtcclxuXHRcdFx0XHRwYXRoLnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIga2V5cyA9IHJvdXRlLm1hdGNoKC86W15cXC9dKy9nKSB8fCBbXTtcclxuXHRcdFx0XHRcdHZhciB2YWx1ZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgLTIpO1xyXG5cdFx0XHRcdFx0Zm9yRWFjaChrZXlzLCBmdW5jdGlvbiAoa2V5LCBpKSB7XHJcblx0XHRcdFx0XHRcdHJvdXRlUGFyYW1zW2tleS5yZXBsYWNlKC86fFxcLi9nLCBcIlwiKV0gPSBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2ldKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRtLm1vdW50KHJvb3QsIHJvdXRlcltyb3V0ZV0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJvdXRlVW5vYnRydXNpdmUoZSkge1xyXG5cdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblxyXG5cdFx0aWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS53aGljaCA9PT0gMikgcmV0dXJuO1xyXG5cclxuXHRcdGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRlbHNlIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHJcblx0XHR2YXIgY3VycmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcblx0XHR2YXIgYXJncyA9IG0ucm91dGUubW9kZSA9PT0gXCJwYXRobmFtZVwiICYmIGN1cnJlbnRUYXJnZXQuc2VhcmNoID8gcGFyc2VRdWVyeVN0cmluZyhjdXJyZW50VGFyZ2V0LnNlYXJjaC5zbGljZSgxKSkgOiB7fTtcclxuXHRcdHdoaWxlIChjdXJyZW50VGFyZ2V0ICYmIGN1cnJlbnRUYXJnZXQubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJBXCIpIGN1cnJlbnRUYXJnZXQgPSBjdXJyZW50VGFyZ2V0LnBhcmVudE5vZGU7XHJcblx0XHRtLnJvdXRlKGN1cnJlbnRUYXJnZXRbbS5yb3V0ZS5tb2RlXS5zbGljZShtb2Rlc1ttLnJvdXRlLm1vZGVdLmxlbmd0aCksIGFyZ3MpO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBzZXRTY3JvbGwoKSB7XHJcblx0XHRpZiAobS5yb3V0ZS5tb2RlICE9PSBcImhhc2hcIiAmJiAkbG9jYXRpb24uaGFzaCkgJGxvY2F0aW9uLmhhc2ggPSAkbG9jYXRpb24uaGFzaDtcclxuXHRcdGVsc2Ugd2luZG93LnNjcm9sbFRvKDAsIDApO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBidWlsZFF1ZXJ5U3RyaW5nKG9iamVjdCwgcHJlZml4KSB7XHJcblx0XHR2YXIgZHVwbGljYXRlcyA9IHt9O1xyXG5cdFx0dmFyIHN0ciA9IFtdO1xyXG5cdFx0Zm9yICh2YXIgcHJvcCBpbiBvYmplY3QpIHtcclxuXHRcdFx0dmFyIGtleSA9IHByZWZpeCA/IHByZWZpeCArIFwiW1wiICsgcHJvcCArIFwiXVwiIDogcHJvcDtcclxuXHRcdFx0dmFyIHZhbHVlID0gb2JqZWN0W3Byb3BdO1xyXG5cclxuXHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XHJcblx0XHRcdFx0c3RyLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xyXG5cdFx0XHRcdHN0ci5wdXNoKGJ1aWxkUXVlcnlTdHJpbmcodmFsdWUsIGtleSkpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XHJcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcclxuXHRcdFx0XHRkdXBsaWNhdGVzW2tleV0gPSBkdXBsaWNhdGVzW2tleV0gfHwge307XHJcblx0XHRcdFx0Zm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24gKGl0ZW0pIHtcclxuXHRcdFx0XHRcdGlmICghZHVwbGljYXRlc1trZXldW2l0ZW1dKSB7XHJcblx0XHRcdFx0XHRcdGR1cGxpY2F0ZXNba2V5XVtpdGVtXSA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGtleXMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0pKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRzdHIucHVzaChrZXlzLmpvaW4oXCImXCIpKTtcclxuXHRcdFx0fSBlbHNlIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0c3RyLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gc3RyLmpvaW4oXCImXCIpO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBwYXJzZVF1ZXJ5U3RyaW5nKHN0cikge1xyXG5cdFx0aWYgKHN0ciA9PT0gXCJcIiB8fCBzdHIgPT0gbnVsbCkgcmV0dXJuIHt9O1xyXG5cdFx0aWYgKHN0ci5jaGFyQXQoMCkgPT09IFwiP1wiKSBzdHIgPSBzdHIuc2xpY2UoMSk7XHJcblxyXG5cdFx0dmFyIHBhaXJzID0gc3RyLnNwbGl0KFwiJlwiKSwgcGFyYW1zID0ge307XHJcblx0XHRmb3JFYWNoKHBhaXJzLCBmdW5jdGlvbiAoc3RyaW5nKSB7XHJcblx0XHRcdHZhciBwYWlyID0gc3RyaW5nLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0dmFyIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKTtcclxuXHRcdFx0dmFyIHZhbHVlID0gcGFpci5sZW5ndGggPT09IDIgPyBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSkgOiBudWxsO1xyXG5cdFx0XHRpZiAocGFyYW1zW2tleV0gIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmICghaXNBcnJheShwYXJhbXNba2V5XSkpIHBhcmFtc1trZXldID0gW3BhcmFtc1trZXldXTtcclxuXHRcdFx0XHRwYXJhbXNba2V5XS5wdXNoKHZhbHVlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHBhcmFtc1trZXldID0gdmFsdWU7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gcGFyYW1zO1xyXG5cdH1cclxuXHRtLnJvdXRlLmJ1aWxkUXVlcnlTdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nO1xyXG5cdG0ucm91dGUucGFyc2VRdWVyeVN0cmluZyA9IHBhcnNlUXVlcnlTdHJpbmc7XHJcblxyXG5cdGZ1bmN0aW9uIHJlc2V0KHJvb3QpIHtcclxuXHRcdHZhciBjYWNoZUtleSA9IGdldENlbGxDYWNoZUtleShyb290KTtcclxuXHRcdGNsZWFyKHJvb3QuY2hpbGROb2RlcywgY2VsbENhY2hlW2NhY2hlS2V5XSk7XHJcblx0XHRjZWxsQ2FjaGVbY2FjaGVLZXldID0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0bS5kZWZlcnJlZCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xyXG5cdFx0ZGVmZXJyZWQucHJvbWlzZSA9IHByb3BpZnkoZGVmZXJyZWQucHJvbWlzZSk7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQ7XHJcblx0fTtcclxuXHRmdW5jdGlvbiBwcm9waWZ5KHByb21pc2UsIGluaXRpYWxWYWx1ZSkge1xyXG5cdFx0dmFyIHByb3AgPSBtLnByb3AoaW5pdGlhbFZhbHVlKTtcclxuXHRcdHByb21pc2UudGhlbihwcm9wKTtcclxuXHRcdHByb3AudGhlbiA9IGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGlmeShwcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KSwgaW5pdGlhbFZhbHVlKTtcclxuXHRcdH07XHJcblx0XHRwcm9wW1wiY2F0Y2hcIl0gPSBwcm9wLnRoZW4uYmluZChudWxsLCBudWxsKTtcclxuXHRcdHByb3BbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHRcdFx0dmFyIF9jYWxsYmFjayA9IGZ1bmN0aW9uKCkge3JldHVybiBtLmRlZmVycmVkKCkucmVzb2x2ZShjYWxsYmFjaygpKS5wcm9taXNlO307XHJcblx0XHRcdHJldHVybiBwcm9wLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRyZXR1cm4gcHJvcGlmeShfY2FsbGJhY2soKS50aGVuKGZ1bmN0aW9uKCkge3JldHVybiB2YWx1ZTt9KSwgaW5pdGlhbFZhbHVlKTtcclxuXHRcdFx0fSwgZnVuY3Rpb24ocmVhc29uKSB7XHJcblx0XHRcdFx0cmV0dXJuIHByb3BpZnkoX2NhbGxiYWNrKCkudGhlbihmdW5jdGlvbigpIHt0aHJvdyBuZXcgRXJyb3IocmVhc29uKTt9KSwgaW5pdGlhbFZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIHByb3A7XHJcblx0fVxyXG5cdC8vUHJvbWl6Lm1pdGhyaWwuanMgfCBab2xtZWlzdGVyIHwgTUlUXHJcblx0Ly9hIG1vZGlmaWVkIHZlcnNpb24gb2YgUHJvbWl6LmpzLCB3aGljaCBkb2VzIG5vdCBjb25mb3JtIHRvIFByb21pc2VzL0ErIGZvciB0d28gcmVhc29uczpcclxuXHQvLzEpIGB0aGVuYCBjYWxsYmFja3MgYXJlIGNhbGxlZCBzeW5jaHJvbm91c2x5IChiZWNhdXNlIHNldFRpbWVvdXQgaXMgdG9vIHNsb3csIGFuZCB0aGUgc2V0SW1tZWRpYXRlIHBvbHlmaWxsIGlzIHRvbyBiaWdcclxuXHQvLzIpIHRocm93aW5nIHN1YmNsYXNzZXMgb2YgRXJyb3IgY2F1c2UgdGhlIGVycm9yIHRvIGJlIGJ1YmJsZWQgdXAgaW5zdGVhZCBvZiB0cmlnZ2VyaW5nIHJlamVjdGlvbiAoYmVjYXVzZSB0aGUgc3BlYyBkb2VzIG5vdCBhY2NvdW50IGZvciB0aGUgaW1wb3J0YW50IHVzZSBjYXNlIG9mIGRlZmF1bHQgYnJvd3NlciBlcnJvciBoYW5kbGluZywgaS5lLiBtZXNzYWdlIHcvIGxpbmUgbnVtYmVyKVxyXG5cdGZ1bmN0aW9uIERlZmVycmVkKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XHJcblx0XHR2YXIgUkVTT0xWSU5HID0gMSwgUkVKRUNUSU5HID0gMiwgUkVTT0xWRUQgPSAzLCBSRUpFQ1RFRCA9IDQ7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXMsIHN0YXRlID0gMCwgcHJvbWlzZVZhbHVlID0gMCwgbmV4dCA9IFtdO1xyXG5cclxuXHRcdHNlbGYucHJvbWlzZSA9IHt9O1xyXG5cclxuXHRcdHNlbGYucmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdGlmICghc3RhdGUpIHtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFU09MVklORztcclxuXHJcblx0XHRcdFx0ZmlyZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRzZWxmLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdGlmICghc3RhdGUpIHtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFSkVDVElORztcclxuXHJcblx0XHRcdFx0ZmlyZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fTtcclxuXHJcblx0XHRzZWxmLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaylcclxuXHRcdFx0aWYgKHN0YXRlID09PSBSRVNPTFZFRCkge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocHJvbWlzZVZhbHVlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChzdGF0ZSA9PT0gUkVKRUNURUQpIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QocHJvbWlzZVZhbHVlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRuZXh0LnB1c2goZGVmZXJyZWQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGZpbmlzaCh0eXBlKSB7XHJcblx0XHRcdHN0YXRlID0gdHlwZSB8fCBSRUpFQ1RFRDtcclxuXHRcdFx0bmV4dC5tYXAoZnVuY3Rpb24oZGVmZXJyZWQpIHtcclxuXHRcdFx0XHRzdGF0ZSA9PT0gUkVTT0xWRUQgPyBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VWYWx1ZSkgOiBkZWZlcnJlZC5yZWplY3QocHJvbWlzZVZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdGhlbm5hYmxlKHRoZW4sIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrLCBub3RUaGVubmFibGVDYWxsYmFjaykge1xyXG5cdFx0XHRpZiAoKChwcm9taXNlVmFsdWUgIT0gbnVsbCAmJiBpc09iamVjdChwcm9taXNlVmFsdWUpKSB8fCBpc0Z1bmN0aW9uKHByb21pc2VWYWx1ZSkpICYmIGlzRnVuY3Rpb24odGhlbikpIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Ly8gY291bnQgcHJvdGVjdHMgYWdhaW5zdCBhYnVzZSBjYWxscyBmcm9tIHNwZWMgY2hlY2tlclxyXG5cdFx0XHRcdFx0dmFyIGNvdW50ID0gMDtcclxuXHRcdFx0XHRcdHRoZW4uY2FsbChwcm9taXNlVmFsdWUsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb3VudCsrKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKTtcclxuXHRcdFx0XHRcdH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY291bnQrKykgcmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0ZmFpbHVyZUNhbGxiYWNrKCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0XHRmYWlsdXJlQ2FsbGJhY2soKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bm90VGhlbm5hYmxlQ2FsbGJhY2soKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGZpcmUoKSB7XHJcblx0XHRcdC8vIGNoZWNrIGlmIGl0J3MgYSB0aGVuYWJsZVxyXG5cdFx0XHR2YXIgdGhlbjtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHR0aGVuID0gcHJvbWlzZVZhbHVlICYmIHByb21pc2VWYWx1ZS50aGVuO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblx0XHRcdFx0cmV0dXJuIGZpcmUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhlbm5hYmxlKHRoZW4sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HO1xyXG5cdFx0XHRcdGZpcmUoKTtcclxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblx0XHRcdFx0ZmlyZSgpO1xyXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKHN0YXRlID09PSBSRVNPTFZJTkcgJiYgaXNGdW5jdGlvbihzdWNjZXNzQ2FsbGJhY2spKSB7XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHN1Y2Nlc3NDYWxsYmFjayhwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT09IFJFSkVDVElORyAmJiBpc0Z1bmN0aW9uKGZhaWx1cmVDYWxsYmFjaykpIHtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZmFpbHVyZUNhbGxiYWNrKHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRcdHJldHVybiBmaW5pc2goKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChwcm9taXNlVmFsdWUgPT09IHNlbGYpIHtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IFR5cGVFcnJvcigpO1xyXG5cdFx0XHRcdFx0ZmluaXNoKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRoZW5uYWJsZSh0aGVuLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGZpbmlzaChSRVNPTFZFRCk7XHJcblx0XHRcdFx0XHR9LCBmaW5pc2gsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKHN0YXRlID09PSBSRVNPTFZJTkcgJiYgUkVTT0xWRUQpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0bS5kZWZlcnJlZC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0aWYgKHR5cGUuY2FsbChlKSA9PT0gXCJbb2JqZWN0IEVycm9yXVwiICYmICFlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goLyBFcnJvci8pKSB7XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cyA9IDA7XHJcblx0XHRcdHRocm93IGU7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0bS5zeW5jID0gZnVuY3Rpb24oYXJncykge1xyXG5cdFx0dmFyIG1ldGhvZCA9IFwicmVzb2x2ZVwiO1xyXG5cclxuXHRcdGZ1bmN0aW9uIHN5bmNocm9uaXplcihwb3MsIHJlc29sdmVkKSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdHJlc3VsdHNbcG9zXSA9IHZhbHVlO1xyXG5cdFx0XHRcdGlmICghcmVzb2x2ZWQpIG1ldGhvZCA9IFwicmVqZWN0XCI7XHJcblx0XHRcdFx0aWYgKC0tb3V0c3RhbmRpbmcgPT09IDApIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnByb21pc2UocmVzdWx0cyk7XHJcblx0XHRcdFx0XHRkZWZlcnJlZFttZXRob2RdKHJlc3VsdHMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xyXG5cdFx0dmFyIG91dHN0YW5kaW5nID0gYXJncy5sZW5ndGg7XHJcblx0XHR2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShvdXRzdGFuZGluZyk7XHJcblx0XHRpZiAoYXJncy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvckVhY2goYXJncywgZnVuY3Rpb24gKGFyZywgaSkge1xyXG5cdFx0XHRcdGFyZy50aGVuKHN5bmNocm9uaXplcihpLCB0cnVlKSwgc3luY2hyb25pemVyKGksIGZhbHNlKSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBkZWZlcnJlZC5yZXNvbHZlKFtdKTtcclxuXHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxyXG5cclxuXHRmdW5jdGlvbiBhamF4KG9wdGlvbnMpIHtcclxuXHRcdGlmIChvcHRpb25zLmRhdGFUeXBlICYmIG9wdGlvbnMuZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29ucFwiKSB7XHJcblx0XHRcdHZhciBjYWxsYmFja0tleSA9IFwibWl0aHJpbF9jYWxsYmFja19cIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgXCJfXCIgKyAoTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikpLnRvU3RyaW5nKDM2KVxyXG5cdFx0XHR2YXIgc2NyaXB0ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XHJcblxyXG5cdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gZnVuY3Rpb24ocmVzcCkge1xyXG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcblx0XHRcdFx0b3B0aW9ucy5vbmxvYWQoe1xyXG5cdFx0XHRcdFx0dHlwZTogXCJsb2FkXCIsXHJcblx0XHRcdFx0XHR0YXJnZXQ6IHtcclxuXHRcdFx0XHRcdFx0cmVzcG9uc2VUZXh0OiByZXNwXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IHVuZGVmaW5lZDtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcclxuXHJcblx0XHRcdFx0b3B0aW9ucy5vbmVycm9yKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcclxuXHRcdFx0XHRcdHRhcmdldDoge1xyXG5cdFx0XHRcdFx0XHRzdGF0dXM6IDUwMCxcclxuXHRcdFx0XHRcdFx0cmVzcG9uc2VUZXh0OiBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0XHRcdFx0ZXJyb3I6IFwiRXJyb3IgbWFraW5nIGpzb25wIHJlcXVlc3RcIlxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5zcmMgPSBvcHRpb25zLnVybFxyXG5cdFx0XHRcdCsgKG9wdGlvbnMudXJsLmluZGV4T2YoXCI/XCIpID4gMCA/IFwiJlwiIDogXCI/XCIpXHJcblx0XHRcdFx0KyAob3B0aW9ucy5jYWxsYmFja0tleSA/IG9wdGlvbnMuY2FsbGJhY2tLZXkgOiBcImNhbGxiYWNrXCIpXHJcblx0XHRcdFx0KyBcIj1cIiArIGNhbGxiYWNrS2V5XHJcblx0XHRcdFx0KyBcIiZcIiArIGJ1aWxkUXVlcnlTdHJpbmcob3B0aW9ucy5kYXRhIHx8IHt9KTtcclxuXHRcdFx0JGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFx0XHR4aHIub3BlbihvcHRpb25zLm1ldGhvZCwgb3B0aW9ucy51cmwsIHRydWUsIG9wdGlvbnMudXNlciwgb3B0aW9ucy5wYXNzd29yZCk7XHJcblx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuXHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSBvcHRpb25zLm9ubG9hZCh7dHlwZTogXCJsb2FkXCIsIHRhcmdldDogeGhyfSk7XHJcblx0XHRcdFx0XHRlbHNlIG9wdGlvbnMub25lcnJvcih7dHlwZTogXCJlcnJvclwiLCB0YXJnZXQ6IHhocn0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKG9wdGlvbnMuc2VyaWFsaXplID09PSBKU09OLnN0cmluZ2lmeSAmJiBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5tZXRob2QgIT09IFwiR0VUXCIpIHtcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKG9wdGlvbnMuZGVzZXJpYWxpemUgPT09IEpTT04ucGFyc2UpIHtcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkFjY2VwdFwiLCBcImFwcGxpY2F0aW9uL2pzb24sIHRleHQvKlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNGdW5jdGlvbihvcHRpb25zLmNvbmZpZykpIHtcclxuXHRcdFx0XHR2YXIgbWF5YmVYaHIgPSBvcHRpb25zLmNvbmZpZyh4aHIsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdGlmIChtYXliZVhociAhPSBudWxsKSB4aHIgPSBtYXliZVhocjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGRhdGEgPSBvcHRpb25zLm1ldGhvZCA9PT0gXCJHRVRcIiB8fCAhb3B0aW9ucy5kYXRhID8gXCJcIiA6IG9wdGlvbnMuZGF0YTtcclxuXHRcdFx0aWYgKGRhdGEgJiYgKCFpc1N0cmluZyhkYXRhKSAmJiBkYXRhLmNvbnN0cnVjdG9yICE9PSB3aW5kb3cuRm9ybURhdGEpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUmVxdWVzdCBkYXRhIHNob3VsZCBiZSBlaXRoZXIgYmUgYSBzdHJpbmcgb3IgRm9ybURhdGEuIENoZWNrIHRoZSBgc2VyaWFsaXplYCBvcHRpb24gaW4gYG0ucmVxdWVzdGBcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0eGhyLnNlbmQoZGF0YSk7XHJcblx0XHRcdHJldHVybiB4aHI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBiaW5kRGF0YSh4aHJPcHRpb25zLCBkYXRhLCBzZXJpYWxpemUpIHtcclxuXHRcdGlmICh4aHJPcHRpb25zLm1ldGhvZCA9PT0gXCJHRVRcIiAmJiB4aHJPcHRpb25zLmRhdGFUeXBlICE9PSBcImpzb25wXCIpIHtcclxuXHRcdFx0dmFyIHByZWZpeCA9IHhock9wdGlvbnMudXJsLmluZGV4T2YoXCI/XCIpIDwgMCA/IFwiP1wiIDogXCImXCI7XHJcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcoZGF0YSk7XHJcblx0XHRcdHhock9wdGlvbnMudXJsID0geGhyT3B0aW9ucy51cmwgKyAocXVlcnlzdHJpbmcgPyBwcmVmaXggKyBxdWVyeXN0cmluZyA6IFwiXCIpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB4aHJPcHRpb25zLmRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XHJcblx0XHRyZXR1cm4geGhyT3B0aW9ucztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHBhcmFtZXRlcml6ZVVybCh1cmwsIGRhdGEpIHtcclxuXHRcdHZhciB0b2tlbnMgPSB1cmwubWF0Y2goLzpbYS16XVxcdysvZ2kpO1xyXG5cdFx0aWYgKHRva2VucyAmJiBkYXRhKSB7XHJcblx0XHRcdGZvckVhY2godG9rZW5zLCBmdW5jdGlvbiAodG9rZW4pIHtcclxuXHRcdFx0XHR2YXIga2V5ID0gdG9rZW4uc2xpY2UoMSk7XHJcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UodG9rZW4sIGRhdGFba2V5XSk7XHJcblx0XHRcdFx0ZGVsZXRlIGRhdGFba2V5XTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdXJsO1xyXG5cdH1cclxuXHJcblx0bS5yZXF1ZXN0ID0gZnVuY3Rpb24oeGhyT3B0aW9ucykge1xyXG5cdFx0aWYgKHhock9wdGlvbnMuYmFja2dyb3VuZCAhPT0gdHJ1ZSkgbS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcclxuXHRcdHZhciBpc0pTT05QID0geGhyT3B0aW9ucy5kYXRhVHlwZSAmJiB4aHJPcHRpb25zLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwianNvbnBcIlxyXG5cdFx0dmFyIHNlcmlhbGl6ZSA9IHhock9wdGlvbnMuc2VyaWFsaXplID0gaXNKU09OUCA/IGlkZW50aXR5IDogeGhyT3B0aW9ucy5zZXJpYWxpemUgfHwgSlNPTi5zdHJpbmdpZnk7XHJcblx0XHR2YXIgZGVzZXJpYWxpemUgPSB4aHJPcHRpb25zLmRlc2VyaWFsaXplID0gaXNKU09OUCA/IGlkZW50aXR5IDogeGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSB8fCBKU09OLnBhcnNlO1xyXG5cdFx0dmFyIGV4dHJhY3QgPSBpc0pTT05QID8gZnVuY3Rpb24oanNvbnApIHsgcmV0dXJuIGpzb25wLnJlc3BvbnNlVGV4dCB9IDogeGhyT3B0aW9ucy5leHRyYWN0IHx8IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRpZiAoeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGggPT09IDAgJiYgZGVzZXJpYWxpemUgPT09IEpTT04ucGFyc2UpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiB4aHIucmVzcG9uc2VUZXh0XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0XHR4aHJPcHRpb25zLm1ldGhvZCA9ICh4aHJPcHRpb25zLm1ldGhvZCB8fCBcIkdFVFwiKS50b1VwcGVyQ2FzZSgpO1xyXG5cdFx0eGhyT3B0aW9ucy51cmwgPSBwYXJhbWV0ZXJpemVVcmwoeGhyT3B0aW9ucy51cmwsIHhock9wdGlvbnMuZGF0YSk7XHJcblx0XHR4aHJPcHRpb25zID0gYmluZERhdGEoeGhyT3B0aW9ucywgeGhyT3B0aW9ucy5kYXRhLCBzZXJpYWxpemUpO1xyXG5cdFx0eGhyT3B0aW9ucy5vbmxvYWQgPSB4aHJPcHRpb25zLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdFx0dmFyIHVud3JhcCA9IChlLnR5cGUgPT09IFwibG9hZFwiID8geGhyT3B0aW9ucy51bndyYXBTdWNjZXNzIDogeGhyT3B0aW9ucy51bndyYXBFcnJvcikgfHwgaWRlbnRpdHk7XHJcblx0XHRcdFx0dmFyIHJlc3BvbnNlID0gdW53cmFwKGRlc2VyaWFsaXplKGV4dHJhY3QoZS50YXJnZXQsIHhock9wdGlvbnMpKSwgZS50YXJnZXQpO1xyXG5cdFx0XHRcdGlmIChlLnR5cGUgPT09IFwibG9hZFwiKSB7XHJcblx0XHRcdFx0XHRpZiAoaXNBcnJheShyZXNwb25zZSkgJiYgeGhyT3B0aW9ucy50eXBlKSB7XHJcblx0XHRcdFx0XHRcdGZvckVhY2gocmVzcG9uc2UsIGZ1bmN0aW9uIChyZXMsIGkpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXNwb25zZVtpXSA9IG5ldyB4aHJPcHRpb25zLnR5cGUocmVzKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHhock9wdGlvbnMudHlwZSkge1xyXG5cdFx0XHRcdFx0XHRyZXNwb25zZSA9IG5ldyB4aHJPcHRpb25zLnR5cGUocmVzcG9uc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZGVmZXJyZWRbZS50eXBlID09PSBcImxvYWRcIiA/IFwicmVzb2x2ZVwiIDogXCJyZWplY3RcIl0ocmVzcG9uc2UpO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHhock9wdGlvbnMuYmFja2dyb3VuZCAhPT0gdHJ1ZSkgbS5lbmRDb21wdXRhdGlvbigpXHJcblx0XHR9XHJcblxyXG5cdFx0YWpheCh4aHJPcHRpb25zKTtcclxuXHRcdGRlZmVycmVkLnByb21pc2UgPSBwcm9waWZ5KGRlZmVycmVkLnByb21pc2UsIHhock9wdGlvbnMuaW5pdGlhbFZhbHVlKTtcclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cdH07XHJcblxyXG5cdC8vdGVzdGluZyBBUElcclxuXHRtLmRlcHMgPSBmdW5jdGlvbihtb2NrKSB7XHJcblx0XHRpbml0aWFsaXplKHdpbmRvdyA9IG1vY2sgfHwgd2luZG93KTtcclxuXHRcdHJldHVybiB3aW5kb3c7XHJcblx0fTtcclxuXHQvL2ZvciBpbnRlcm5hbCB0ZXN0aW5nIG9ubHksIGRvIG5vdCB1c2UgYG0uZGVwcy5mYWN0b3J5YFxyXG5cdG0uZGVwcy5mYWN0b3J5ID0gYXBwO1xyXG5cclxuXHRyZXR1cm4gbTtcclxufSkodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZSAhPSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IG07XHJcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtIH0pO1xyXG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxudmFyIGVhc2luZyA9IHtcbiAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG4gIH0sXG59O1xuXG5mdW5jdGlvbiBtYWtlUGllY2UoaywgcGllY2UsIGludmVydCkge1xuICB2YXIga2V5ID0gaW52ZXJ0ID8gdXRpbC5pbnZlcnRLZXkoaykgOiBrO1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcm9sZTogcGllY2Uucm9sZSxcbiAgICBjb2xvcjogcGllY2UuY29sb3JcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2FtZVBpZWNlKHAxLCBwMikge1xuICByZXR1cm4gcDEucm9sZSA9PT0gcDIucm9sZSAmJiBwMS5jb2xvciA9PT0gcDIuY29sb3I7XG59XG5cbmZ1bmN0aW9uIGNsb3NlcihwaWVjZSwgcGllY2VzKSB7XG4gIHJldHVybiBwaWVjZXMuc29ydChmdW5jdGlvbihwMSwgcDIpIHtcbiAgICByZXR1cm4gdXRpbC5kaXN0YW5jZShwaWVjZS5wb3MsIHAxLnBvcykgLSB1dGlsLmRpc3RhbmNlKHBpZWNlLnBvcywgcDIucG9zKTtcbiAgfSlbMF07XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVQbGFuKHByZXYsIGN1cnJlbnQpIHtcbiAgdmFyIGJvdW5kcyA9IGN1cnJlbnQuYm91bmRzKCksXG4gICAgd2lkdGggPSBib3VuZHMud2lkdGggLyA4LFxuICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQgLyA4LFxuICAgIGFuaW1zID0ge30sXG4gICAgYW5pbWVkT3JpZ3MgPSBbXSxcbiAgICBmYWRpbmdzID0gW10sXG4gICAgbWlzc2luZ3MgPSBbXSxcbiAgICBuZXdzID0gW10sXG4gICAgaW52ZXJ0ID0gcHJldi5vcmllbnRhdGlvbiAhPT0gY3VycmVudC5vcmllbnRhdGlvbixcbiAgICBwcmVQaWVjZXMgPSB7fSxcbiAgICB3aGl0ZSA9IGN1cnJlbnQub3JpZW50YXRpb24gPT09ICd3aGl0ZSc7XG4gIGZvciAodmFyIHBrIGluIHByZXYucGllY2VzKSB7XG4gICAgdmFyIHBpZWNlID0gbWFrZVBpZWNlKHBrLCBwcmV2LnBpZWNlc1twa10sIGludmVydCk7XG4gICAgcHJlUGllY2VzW3BpZWNlLmtleV0gPSBwaWVjZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHV0aWwuYWxsS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSB1dGlsLmFsbEtleXNbaV07XG4gICAgaWYgKGtleSAhPT0gY3VycmVudC5tb3ZhYmxlLmRyb3BwZWRbMV0pIHtcbiAgICAgIHZhciBjdXJQID0gY3VycmVudC5waWVjZXNba2V5XTtcbiAgICAgIHZhciBwcmVQID0gcHJlUGllY2VzW2tleV07XG4gICAgICBpZiAoY3VyUCkge1xuICAgICAgICBpZiAocHJlUCkge1xuICAgICAgICAgIGlmICghc2FtZVBpZWNlKGN1clAsIHByZVApKSB7XG4gICAgICAgICAgICBtaXNzaW5ncy5wdXNoKHByZVApO1xuICAgICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clAsIGZhbHNlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2VcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCwgZmFsc2UpKTtcbiAgICAgIH0gZWxzZSBpZiAocHJlUClcbiAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICB9XG4gIH1cbiAgbmV3cy5mb3JFYWNoKGZ1bmN0aW9uKG5ld1ApIHtcbiAgICB2YXIgcHJlUCA9IGNsb3NlcihuZXdQLCBtaXNzaW5ncy5maWx0ZXIodXRpbC5wYXJ0aWFsKHNhbWVQaWVjZSwgbmV3UCkpKTtcbiAgICBpZiAocHJlUCkge1xuICAgICAgdmFyIG9yaWcgPSB3aGl0ZSA/IHByZVAucG9zIDogbmV3UC5wb3M7XG4gICAgICB2YXIgZGVzdCA9IHdoaXRlID8gbmV3UC5wb3MgOiBwcmVQLnBvcztcbiAgICAgIHZhciB2ZWN0b3IgPSBbKG9yaWdbMF0gLSBkZXN0WzBdKSAqIHdpZHRoLCAoZGVzdFsxXSAtIG9yaWdbMV0pICogaGVpZ2h0XTtcbiAgICAgIGFuaW1zW25ld1Aua2V5XSA9IFt2ZWN0b3IsIHZlY3Rvcl07XG4gICAgICBhbmltZWRPcmlncy5wdXNoKHByZVAua2V5KTtcbiAgICB9XG4gIH0pO1xuICBtaXNzaW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICBpZiAocC5rZXkgIT09IGN1cnJlbnQubW92YWJsZS5kcm9wcGVkWzBdICYmICF1dGlsLmNvbnRhaW5zWChhbmltZWRPcmlncywgcC5rZXkpKSB7XG4gICAgICBmYWRpbmdzLnB1c2goe1xuICAgICAgICBwaWVjZToge1xuICAgICAgICAgIHJvbGU6IHAucm9sZSxcbiAgICAgICAgICBjb2xvcjogcC5jb2xvclxuICAgICAgICB9LFxuICAgICAgICBsZWZ0OiAxMi41ICogKHdoaXRlID8gKHAucG9zWzBdIC0gMSkgOiAoOCAtIHAucG9zWzBdKSkgKyAnJScsXG4gICAgICAgIGJvdHRvbTogMTIuNSAqICh3aGl0ZSA/IChwLnBvc1sxXSAtIDEpIDogKDggLSBwLnBvc1sxXSkpICsgJyUnLFxuICAgICAgICBvcGFjaXR5OiAxXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3NcbiAgfTtcbn1cblxuZnVuY3Rpb24gcm91bmRCeShuLCBieSkge1xuICByZXR1cm4gTWF0aC5yb3VuZChuICogYnkpIC8gYnk7XG59XG5cbmZ1bmN0aW9uIGdvKGRhdGEpIHtcbiAgaWYgKCFkYXRhLmFuaW1hdGlvbi5jdXJyZW50LnN0YXJ0KSByZXR1cm47IC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWRcbiAgdmFyIHJlc3QgPSAxIC0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZGF0YS5hbmltYXRpb24uY3VycmVudC5zdGFydCkgLyBkYXRhLmFuaW1hdGlvbi5jdXJyZW50LmR1cmF0aW9uO1xuICBpZiAocmVzdCA8PSAwKSB7XG4gICAgZGF0YS5hbmltYXRpb24uY3VycmVudCA9IHt9O1xuICAgIGRhdGEucmVuZGVyKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGVhc2UgPSBlYXNpbmcuZWFzZUluT3V0Q3ViaWMocmVzdCk7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEuYW5pbWF0aW9uLmN1cnJlbnQuYW5pbXMpIHtcbiAgICAgIHZhciBjZmcgPSBkYXRhLmFuaW1hdGlvbi5jdXJyZW50LmFuaW1zW2tleV07XG4gICAgICBjZmdbMV0gPSBbcm91bmRCeShjZmdbMF1bMF0gKiBlYXNlLCAxMCksIHJvdW5kQnkoY2ZnWzBdWzFdICogZWFzZSwgMTApXTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSBpbiBkYXRhLmFuaW1hdGlvbi5jdXJyZW50LmZhZGluZ3MpIHtcbiAgICAgIGRhdGEuYW5pbWF0aW9uLmN1cnJlbnQuZmFkaW5nc1tpXS5vcGFjaXR5ID0gcm91bmRCeShlYXNlLCAxMDApO1xuICAgIH1cbiAgICBkYXRhLnJlbmRlcigpO1xuICAgIHV0aWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgZ28oZGF0YSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSh0cmFuc2Zvcm1hdGlvbiwgZGF0YSkge1xuICAvLyBjbG9uZSBkYXRhXG4gIHZhciBwcmV2ID0ge1xuICAgIG9yaWVudGF0aW9uOiBkYXRhLm9yaWVudGF0aW9uLFxuICAgIHBpZWNlczoge31cbiAgfTtcbiAgLy8gY2xvbmUgcGllY2VzXG4gIGZvciAodmFyIGtleSBpbiBkYXRhLnBpZWNlcykge1xuICAgIHByZXYucGllY2VzW2tleV0gPSB7XG4gICAgICByb2xlOiBkYXRhLnBpZWNlc1trZXldLnJvbGUsXG4gICAgICBjb2xvcjogZGF0YS5waWVjZXNba2V5XS5jb2xvclxuICAgIH07XG4gIH1cbiAgdmFyIHJlc3VsdCA9IHRyYW5zZm9ybWF0aW9uKCk7XG4gIHZhciBwbGFuID0gY29tcHV0ZVBsYW4ocHJldiwgZGF0YSk7XG4gIGlmIChPYmplY3Qua2V5cyhwbGFuLmFuaW1zKS5sZW5ndGggPiAwIHx8IHBsYW4uZmFkaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGFscmVhZHlSdW5uaW5nID0gZGF0YS5hbmltYXRpb24uY3VycmVudC5zdGFydDtcbiAgICBkYXRhLmFuaW1hdGlvbi5jdXJyZW50ID0ge1xuICAgICAgc3RhcnQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgZHVyYXRpb246IGRhdGEuYW5pbWF0aW9uLmR1cmF0aW9uLFxuICAgICAgYW5pbXM6IHBsYW4uYW5pbXMsXG4gICAgICBmYWRpbmdzOiBwbGFuLmZhZGluZ3NcbiAgICB9O1xuICAgIGlmICghYWxyZWFkeVJ1bm5pbmcpIGdvKGRhdGEpO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvbid0IGFuaW1hdGUsIGp1c3QgcmVuZGVyIHJpZ2h0IGF3YXlcbiAgICBkYXRhLnJlbmRlclJBRigpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIHRyYW5zZm9ybWF0aW9uIGlzIGEgZnVuY3Rpb25cbi8vIGFjY2VwdHMgYm9hcmQgZGF0YSBhbmQgYW55IG51bWJlciBvZiBhcmd1bWVudHMsXG4vLyBhbmQgbXV0YXRlcyB0aGUgYm9hcmQuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRyYW5zZm9ybWF0aW9uLCBkYXRhLCBza2lwKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJhbnNmb3JtYXRpb25BcmdzID0gW2RhdGFdLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKTtcbiAgICBpZiAoIWRhdGEucmVuZGVyKSByZXR1cm4gdHJhbnNmb3JtYXRpb24uYXBwbHkobnVsbCwgdHJhbnNmb3JtYXRpb25BcmdzKTtcbiAgICBlbHNlIGlmIChkYXRhLmFuaW1hdGlvbi5lbmFibGVkICYmICFza2lwKVxuICAgICAgcmV0dXJuIGFuaW1hdGUodXRpbC5wYXJ0aWFsQXBwbHkodHJhbnNmb3JtYXRpb24sIHRyYW5zZm9ybWF0aW9uQXJncyksIGRhdGEpO1xuICAgIGVsc2Uge1xuICAgICAgdmFyIHJlc3VsdCA9IHRyYW5zZm9ybWF0aW9uLmFwcGx5KG51bGwsIHRyYW5zZm9ybWF0aW9uQXJncyk7XG4gICAgICBkYXRhLnJlbmRlclJBRigpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIGJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcblxuICByZXR1cm4ge1xuICAgIHNldDogY29udHJvbGxlci5zZXQsXG4gICAgdG9nZ2xlT3JpZW50YXRpb246IGNvbnRyb2xsZXIudG9nZ2xlT3JpZW50YXRpb24sXG4gICAgZ2V0T3JpZW50YXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb250cm9sbGVyLmRhdGEub3JpZW50YXRpb247XG4gICAgfSxcbiAgICBnZXRQaWVjZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNvbnRyb2xsZXIuZGF0YS5waWVjZXM7XG4gICAgfSxcbiAgICBnZXRNYXRlcmlhbERpZmY6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGJvYXJkLmdldE1hdGVyaWFsRGlmZihjb250cm9sbGVyLmRhdGEpO1xuICAgIH0sXG4gICAgZ2V0RmVuOiBjb250cm9sbGVyLmdldEZlbixcbiAgICBkdW1wOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb250cm9sbGVyLmRhdGE7XG4gICAgfSxcbiAgICBtb3ZlOiBjb250cm9sbGVyLmFwaU1vdmUsXG4gICAgc2V0UGllY2VzOiBjb250cm9sbGVyLnNldFBpZWNlcyxcbiAgICBzZXRDaGVjazogY29udHJvbGxlci5zZXRDaGVjayxcbiAgICBwbGF5UHJlbW92ZTogY29udHJvbGxlci5wbGF5UHJlbW92ZSxcbiAgICBjYW5jZWxQcmVtb3ZlOiBjb250cm9sbGVyLmNhbmNlbFByZW1vdmUsXG4gICAgY2FuY2VsTW92ZTogY29udHJvbGxlci5jYW5jZWxNb3ZlLFxuICAgIHN0b3A6IGNvbnRyb2xsZXIuc3RvcCxcbiAgICBleHBsb2RlOiBjb250cm9sbGVyLmV4cGxvZGUsXG4gICAgc2V0QXV0b1NoYXBlczogY29udHJvbGxlci5zZXRBdXRvU2hhcGVzXG4gIH07XG59O1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBwcmVtb3ZlID0gcmVxdWlyZSgnLi9wcmVtb3ZlJyk7XG52YXIgYW5pbSA9IHJlcXVpcmUoJy4vYW5pbScpO1xudmFyIGhvbGQgPSByZXF1aXJlKCcuL2hvbGQnKTtcblxuZnVuY3Rpb24gY2FsbFVzZXJGdW5jdGlvbihmKSB7XG4gIHNldFRpbWVvdXQoZiwgMSk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKGRhdGEpIHtcbiAgZGF0YS5vcmllbnRhdGlvbiA9IHV0aWwub3Bwb3NpdGUoZGF0YS5vcmllbnRhdGlvbik7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KGRhdGEpIHtcbiAgZGF0YS5sYXN0TW92ZSA9IG51bGw7XG4gIHNldFNlbGVjdGVkKGRhdGEsIG51bGwpO1xuICB1bnNldFByZW1vdmUoZGF0YSk7XG59XG5cbmZ1bmN0aW9uIHNldFBpZWNlcyhkYXRhLCBwaWVjZXMpIHtcbiAgT2JqZWN0LmtleXMocGllY2VzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChwaWVjZXNba2V5XSkgZGF0YS5waWVjZXNba2V5XSA9IHBpZWNlc1trZXldO1xuICAgIGVsc2UgZGVsZXRlIGRhdGEucGllY2VzW2tleV07XG4gIH0pO1xuICBkYXRhLm1vdmFibGUuZHJvcHBlZCA9IFtdO1xufVxuXG5mdW5jdGlvbiBzZXRDaGVjayhkYXRhLCBjb2xvcikge1xuICB2YXIgY2hlY2tDb2xvciA9IGNvbG9yIHx8IGRhdGEudHVybkNvbG9yO1xuICBPYmplY3Qua2V5cyhkYXRhLnBpZWNlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoZGF0YS5waWVjZXNba2V5XS5jb2xvciA9PT0gY2hlY2tDb2xvciAmJiBkYXRhLnBpZWNlc1trZXldLnJvbGUgPT09ICdraW5nJykgZGF0YS5jaGVjayA9IGtleTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoZGF0YSwgb3JpZywgZGVzdCkge1xuICBkYXRhLnByZW1vdmFibGUuY3VycmVudCA9IFtvcmlnLCBkZXN0XTtcbiAgY2FsbFVzZXJGdW5jdGlvbih1dGlsLnBhcnRpYWwoZGF0YS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QpKTtcbn1cblxuZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKGRhdGEpIHtcbiAgaWYgKGRhdGEucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgZGF0YS5wcmVtb3ZhYmxlLmN1cnJlbnQgPSBudWxsO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oZGF0YS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJ5QXV0b0Nhc3RsZShkYXRhLCBvcmlnLCBkZXN0KSB7XG4gIGlmICghZGF0YS5hdXRvQ2FzdGxlKSByZXR1cm47XG4gIHZhciBraW5nID0gZGF0YS5waWVjZXNbZGVzdF07XG4gIGlmIChraW5nLnJvbGUgIT09ICdraW5nJykgcmV0dXJuO1xuICB2YXIgb3JpZ1BvcyA9IHV0aWwua2V5MnBvcyhvcmlnKTtcbiAgaWYgKG9yaWdQb3NbMF0gIT09IDUpIHJldHVybjtcbiAgaWYgKG9yaWdQb3NbMV0gIT09IDEgJiYgb3JpZ1Bvc1sxXSAhPT0gOCkgcmV0dXJuO1xuICB2YXIgZGVzdFBvcyA9IHV0aWwua2V5MnBvcyhkZXN0KSxcbiAgICBvbGRSb29rUG9zLCBuZXdSb29rUG9zLCBuZXdLaW5nUG9zO1xuICBpZiAoZGVzdFBvc1swXSA9PT0gNyB8fCBkZXN0UG9zWzBdID09PSA4KSB7XG4gICAgb2xkUm9va1BvcyA9IHV0aWwucG9zMmtleShbOCwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld1Jvb2tQb3MgPSB1dGlsLnBvczJrZXkoWzYsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gdXRpbC5wb3Mya2V5KFs3LCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSBpZiAoZGVzdFBvc1swXSA9PT0gMyB8fCBkZXN0UG9zWzBdID09PSAxKSB7XG4gICAgb2xkUm9va1BvcyA9IHV0aWwucG9zMmtleShbMSwgb3JpZ1Bvc1sxXV0pO1xuICAgIG5ld1Jvb2tQb3MgPSB1dGlsLnBvczJrZXkoWzQsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gdXRpbC5wb3Mya2V5KFszLCBvcmlnUG9zWzFdXSk7XG4gIH0gZWxzZSByZXR1cm47XG4gIGRlbGV0ZSBkYXRhLnBpZWNlc1tvcmlnXTtcbiAgZGVsZXRlIGRhdGEucGllY2VzW2Rlc3RdO1xuICBkZWxldGUgZGF0YS5waWVjZXNbb2xkUm9va1Bvc107XG4gIGRhdGEucGllY2VzW25ld0tpbmdQb3NdID0ge1xuICAgIHJvbGU6ICdraW5nJyxcbiAgICBjb2xvcjoga2luZy5jb2xvclxuICB9O1xuICBkYXRhLnBpZWNlc1tuZXdSb29rUG9zXSA9IHtcbiAgICByb2xlOiAncm9vaycsXG4gICAgY29sb3I6IGtpbmcuY29sb3JcbiAgfTtcbn1cblxuZnVuY3Rpb24gYmFzZU1vdmUoZGF0YSwgb3JpZywgZGVzdCkge1xuICB2YXIgc3VjY2VzcyA9IGFuaW0oZnVuY3Rpb24oKSB7XG4gICAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIWRhdGEucGllY2VzW29yaWddKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGNhcHR1cmVkID0gKFxuICAgICAgZGF0YS5waWVjZXNbZGVzdF0gJiZcbiAgICAgIGRhdGEucGllY2VzW2Rlc3RdLmNvbG9yICE9PSBkYXRhLnBpZWNlc1tvcmlnXS5jb2xvclxuICAgICkgPyBkYXRhLnBpZWNlc1tkZXN0XSA6IG51bGw7XG4gICAgY2FsbFVzZXJGdW5jdGlvbih1dGlsLnBhcnRpYWwoZGF0YS5ldmVudHMubW92ZSwgb3JpZywgZGVzdCwgY2FwdHVyZWQpKTtcbiAgICBkYXRhLnBpZWNlc1tkZXN0XSA9IGRhdGEucGllY2VzW29yaWddO1xuICAgIGRlbGV0ZSBkYXRhLnBpZWNlc1tvcmlnXTtcbiAgICBkYXRhLmxhc3RNb3ZlID0gW29yaWcsIGRlc3RdO1xuICAgIGRhdGEuY2hlY2sgPSBudWxsO1xuICAgIHRyeUF1dG9DYXN0bGUoZGF0YSwgb3JpZywgZGVzdCk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihkYXRhLmV2ZW50cy5jaGFuZ2UpO1xuICAgIHJldHVybiB0cnVlO1xuICB9LCBkYXRhKSgpO1xuICBpZiAoc3VjY2VzcykgZGF0YS5tb3ZhYmxlLmRyb3BwZWQgPSBbXTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmZ1bmN0aW9uIGJhc2VVc2VyTW92ZShkYXRhLCBvcmlnLCBkZXN0KSB7XG4gIHZhciByZXN1bHQgPSBiYXNlTW92ZShkYXRhLCBvcmlnLCBkZXN0KTtcbiAgaWYgKHJlc3VsdCkge1xuICAgIGRhdGEubW92YWJsZS5kZXN0cyA9IHt9O1xuICAgIGRhdGEudHVybkNvbG9yID0gdXRpbC5vcHBvc2l0ZShkYXRhLnR1cm5Db2xvcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gYXBpTW92ZShkYXRhLCBvcmlnLCBkZXN0KSB7XG4gIHJldHVybiBiYXNlTW92ZShkYXRhLCBvcmlnLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gdXNlck1vdmUoZGF0YSwgb3JpZywgZGVzdCkge1xuICBpZiAoIWRlc3QpIHtcbiAgICBob2xkLmNhbmNlbCgpO1xuICAgIHNldFNlbGVjdGVkKGRhdGEsIG51bGwpO1xuICAgIGlmIChkYXRhLm1vdmFibGUuZHJvcE9mZiA9PT0gJ3RyYXNoJykge1xuICAgICAgZGVsZXRlIGRhdGEucGllY2VzW29yaWddO1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihkYXRhLmV2ZW50cy5jaGFuZ2UpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjYW5Nb3ZlKGRhdGEsIG9yaWcsIGRlc3QpKSB7XG4gICAgaWYgKGJhc2VVc2VyTW92ZShkYXRhLCBvcmlnLCBkZXN0KSkge1xuICAgICAgdmFyIGhvbGRUaW1lID0gaG9sZC5zdG9wKCk7XG4gICAgICBzZXRTZWxlY3RlZChkYXRhLCBudWxsKTtcbiAgICAgIGNhbGxVc2VyRnVuY3Rpb24odXRpbC5wYXJ0aWFsKGRhdGEubW92YWJsZS5ldmVudHMuYWZ0ZXIsIG9yaWcsIGRlc3QsIHtcbiAgICAgICAgcHJlbW92ZTogZmFsc2UsXG4gICAgICAgIGhvbGRUaW1lOiBob2xkVGltZVxuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoZGF0YSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVtb3ZlKGRhdGEsIG9yaWcsIGRlc3QpO1xuICAgIHNldFNlbGVjdGVkKGRhdGEsIG51bGwpO1xuICB9IGVsc2UgaWYgKGlzTW92YWJsZShkYXRhLCBkZXN0KSB8fCBpc1ByZW1vdmFibGUoZGF0YSwgZGVzdCkpIHtcbiAgICBzZXRTZWxlY3RlZChkYXRhLCBkZXN0KTtcbiAgICBob2xkLnN0YXJ0KCk7XG4gIH0gZWxzZSBzZXRTZWxlY3RlZChkYXRhLCBudWxsKTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0U3F1YXJlKGRhdGEsIGtleSkge1xuICBpZiAoZGF0YS5zZWxlY3RlZCkge1xuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChkYXRhLnNlbGVjdGVkICE9PSBrZXkpIHtcbiAgICAgICAgaWYgKHVzZXJNb3ZlKGRhdGEsIGRhdGEuc2VsZWN0ZWQsIGtleSkpIGRhdGEuc3RhdHMuZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGhvbGQuc3RhcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U2VsZWN0ZWQoZGF0YSwgbnVsbCk7XG4gICAgICBob2xkLmNhbmNlbCgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc01vdmFibGUoZGF0YSwga2V5KSB8fCBpc1ByZW1vdmFibGUoZGF0YSwga2V5KSkge1xuICAgIHNldFNlbGVjdGVkKGRhdGEsIGtleSk7XG4gICAgaG9sZC5zdGFydCgpO1xuICB9XG4gIGlmIChrZXkpIGNhbGxVc2VyRnVuY3Rpb24odXRpbC5wYXJ0aWFsKGRhdGEuZXZlbnRzLnNlbGVjdCwga2V5KSk7XG59XG5cbmZ1bmN0aW9uIHNldFNlbGVjdGVkKGRhdGEsIGtleSkge1xuICBkYXRhLnNlbGVjdGVkID0ga2V5O1xuICBpZiAoa2V5ICYmIGlzUHJlbW92YWJsZShkYXRhLCBrZXkpKVxuICAgIGRhdGEucHJlbW92YWJsZS5kZXN0cyA9IHByZW1vdmUoZGF0YS5waWVjZXMsIGtleSwgZGF0YS5wcmVtb3ZhYmxlLmNhc3RsZSk7XG4gIGVsc2VcbiAgICBkYXRhLnByZW1vdmFibGUuZGVzdHMgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoZGF0YSwgb3JpZykge1xuICB2YXIgcGllY2UgPSBkYXRhLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIChcbiAgICBkYXRhLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBkYXRhLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgICBkYXRhLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3JcbiAgICApKTtcbn1cblxuZnVuY3Rpb24gY2FuTW92ZShkYXRhLCBvcmlnLCBkZXN0KSB7XG4gIHJldHVybiBvcmlnICE9PSBkZXN0ICYmIGlzTW92YWJsZShkYXRhLCBvcmlnKSAmJiAoXG4gICAgZGF0YS5tb3ZhYmxlLmZyZWUgfHwgdXRpbC5jb250YWluc1goZGF0YS5tb3ZhYmxlLmRlc3RzW29yaWddLCBkZXN0KVxuICApO1xufVxuXG5mdW5jdGlvbiBpc1ByZW1vdmFibGUoZGF0YSwgb3JpZykge1xuICB2YXIgcGllY2UgPSBkYXRhLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIGRhdGEucHJlbW92YWJsZS5lbmFibGVkICYmXG4gICAgZGF0YS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIGRhdGEudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcjtcbn1cblxuZnVuY3Rpb24gY2FuUHJlbW92ZShkYXRhLCBvcmlnLCBkZXN0KSB7XG4gIHJldHVybiBvcmlnICE9PSBkZXN0ICYmXG4gICAgaXNQcmVtb3ZhYmxlKGRhdGEsIG9yaWcpICYmXG4gICAgdXRpbC5jb250YWluc1gocHJlbW92ZShkYXRhLnBpZWNlcywgb3JpZywgZGF0YS5wcmVtb3ZhYmxlLmNhc3RsZSksIGRlc3QpO1xufVxuXG5mdW5jdGlvbiBpc0RyYWdnYWJsZShkYXRhLCBvcmlnKSB7XG4gIHZhciBwaWVjZSA9IGRhdGEucGllY2VzW29yaWddO1xuICByZXR1cm4gcGllY2UgJiYgZGF0YS5kcmFnZ2FibGUuZW5hYmxlZCAmJiAoXG4gICAgZGF0YS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgZGF0YS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJiAoXG4gICAgICAgIGRhdGEudHVybkNvbG9yID09PSBwaWVjZS5jb2xvciB8fCBkYXRhLnByZW1vdmFibGUuZW5hYmxlZFxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZnVuY3Rpb24gcGxheVByZW1vdmUoZGF0YSkge1xuICB2YXIgbW92ZSA9IGRhdGEucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybjtcbiAgdmFyIG9yaWcgPSBtb3ZlWzBdLFxuICAgIGRlc3QgPSBtb3ZlWzFdLFxuICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgaWYgKGNhbk1vdmUoZGF0YSwgb3JpZywgZGVzdCkpIHtcbiAgICBpZiAoYmFzZVVzZXJNb3ZlKGRhdGEsIG9yaWcsIGRlc3QpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHV0aWwucGFydGlhbChkYXRhLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCB7XG4gICAgICAgIHByZW1vdmU6IHRydWVcbiAgICAgIH0pKTtcbiAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuICB1bnNldFByZW1vdmUoZGF0YSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5mdW5jdGlvbiBjYW5jZWxNb3ZlKGRhdGEpIHtcbiAgdW5zZXRQcmVtb3ZlKGRhdGEpO1xuICBzZWxlY3RTcXVhcmUoZGF0YSwgbnVsbCk7XG59XG5cbmZ1bmN0aW9uIHN0b3AoZGF0YSkge1xuICBkYXRhLm1vdmFibGUuY29sb3IgPSBudWxsO1xuICBkYXRhLm1vdmFibGUuZGVzdHMgPSB7fTtcbiAgY2FuY2VsTW92ZShkYXRhKTtcbn1cblxuZnVuY3Rpb24gZ2V0S2V5QXREb21Qb3MoZGF0YSwgcG9zLCBib3VuZHMpIHtcbiAgaWYgKCFib3VuZHMgJiYgIWRhdGEuYm91bmRzKSByZXR1cm47XG4gIGJvdW5kcyA9IGJvdW5kcyB8fCBkYXRhLmJvdW5kcygpOyAvLyB1c2UgcHJvdmlkZWQgdmFsdWUsIG9yIGNvbXB1dGUgaXRcbiAgdmFyIGZpbGUgPSBNYXRoLmNlaWwoOCAqICgocG9zWzBdIC0gYm91bmRzLmxlZnQpIC8gYm91bmRzLndpZHRoKSk7XG4gIGZpbGUgPSBkYXRhLm9yaWVudGF0aW9uID09PSAnd2hpdGUnID8gZmlsZSA6IDkgLSBmaWxlO1xuICB2YXIgcmFuayA9IE1hdGguY2VpbCg4IC0gKDggKiAoKHBvc1sxXSAtIGJvdW5kcy50b3ApIC8gYm91bmRzLmhlaWdodCkpKTtcbiAgcmFuayA9IGRhdGEub3JpZW50YXRpb24gPT09ICd3aGl0ZScgPyByYW5rIDogOSAtIHJhbms7XG4gIGlmIChmaWxlID4gMCAmJiBmaWxlIDwgOSAmJiByYW5rID4gMCAmJiByYW5rIDwgOSkgcmV0dXJuIHV0aWwucG9zMmtleShbZmlsZSwgcmFua10pO1xufVxuXG4vLyB7d2hpdGU6IHtwYXduOiAzIHF1ZWVuOiAxfSwgYmxhY2s6IHtiaXNob3A6IDJ9fVxuZnVuY3Rpb24gZ2V0TWF0ZXJpYWxEaWZmKGRhdGEpIHtcbiAgdmFyIGNvdW50cyA9IHtcbiAgICBraW5nOiAwLFxuICAgIHF1ZWVuOiAwLFxuICAgIHJvb2s6IDAsXG4gICAgYmlzaG9wOiAwLFxuICAgIGtuaWdodDogMCxcbiAgICBwYXduOiAwXG4gIH07XG4gIGZvciAodmFyIGsgaW4gZGF0YS5waWVjZXMpIHtcbiAgICB2YXIgcCA9IGRhdGEucGllY2VzW2tdO1xuICAgIGNvdW50c1twLnJvbGVdICs9ICgocC5jb2xvciA9PT0gJ3doaXRlJykgPyAxIDogLTEpO1xuICB9XG4gIHZhciBkaWZmID0ge1xuICAgIHdoaXRlOiB7fSxcbiAgICBibGFjazoge31cbiAgfTtcbiAgZm9yICh2YXIgcm9sZSBpbiBjb3VudHMpIHtcbiAgICB2YXIgYyA9IGNvdW50c1tyb2xlXTtcbiAgICBpZiAoYyA+IDApIGRpZmYud2hpdGVbcm9sZV0gPSBjO1xuICAgIGVsc2UgaWYgKGMgPCAwKSBkaWZmLmJsYWNrW3JvbGVdID0gLWM7XG4gIH1cbiAgcmV0dXJuIGRpZmY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZXNldDogcmVzZXQsXG4gIHRvZ2dsZU9yaWVudGF0aW9uOiB0b2dnbGVPcmllbnRhdGlvbixcbiAgc2V0UGllY2VzOiBzZXRQaWVjZXMsXG4gIHNldENoZWNrOiBzZXRDaGVjayxcbiAgc2VsZWN0U3F1YXJlOiBzZWxlY3RTcXVhcmUsXG4gIHNldFNlbGVjdGVkOiBzZXRTZWxlY3RlZCxcbiAgaXNEcmFnZ2FibGU6IGlzRHJhZ2dhYmxlLFxuICBjYW5Nb3ZlOiBjYW5Nb3ZlLFxuICB1c2VyTW92ZTogdXNlck1vdmUsXG4gIGFwaU1vdmU6IGFwaU1vdmUsXG4gIHBsYXlQcmVtb3ZlOiBwbGF5UHJlbW92ZSxcbiAgdW5zZXRQcmVtb3ZlOiB1bnNldFByZW1vdmUsXG4gIGNhbmNlbE1vdmU6IGNhbmNlbE1vdmUsXG4gIHN0b3A6IHN0b3AsXG4gIGdldEtleUF0RG9tUG9zOiBnZXRLZXlBdERvbVBvcyxcbiAgZ2V0TWF0ZXJpYWxEaWZmOiBnZXRNYXRlcmlhbERpZmZcbn07XG4iLCJ2YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpO1xudmFyIGJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZCcpO1xudmFyIGZlbiA9IHJlcXVpcmUoJy4vZmVuJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGF0YSwgY29uZmlnKSB7XG5cbiAgaWYgKCFjb25maWcpIHJldHVybjtcblxuICAvLyBkb24ndCBtZXJnZSBkZXN0aW5hdGlvbnMuIEp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZSAmJiBjb25maWcubW92YWJsZS5kZXN0cykgZGVsZXRlIGRhdGEubW92YWJsZS5kZXN0cztcblxuICBtZXJnZS5yZWN1cnNpdmUoZGF0YSwgY29uZmlnKTtcblxuICAvLyBpZiBhIGZlbiB3YXMgcHJvdmlkZWQsIHJlcGxhY2UgdGhlIHBpZWNlc1xuICBpZiAoZGF0YS5mZW4pIHtcbiAgICBkYXRhLnBpZWNlcyA9IGZlbi5yZWFkKGRhdGEuZmVuKTtcbiAgICBkYXRhLmNoZWNrID0gY29uZmlnLmNoZWNrO1xuICAgIGRhdGEuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgZGVsZXRlIGRhdGEuZmVuO1xuICB9XG5cbiAgaWYgKGRhdGEuY2hlY2sgPT09IHRydWUpIGJvYXJkLnNldENoZWNrKGRhdGEpO1xuXG4gIC8vIGZvcmdldCBhYm91dCB0aGUgbGFzdCBkcm9wcGVkIHBpZWNlXG4gIGRhdGEubW92YWJsZS5kcm9wcGVkID0gW107XG5cbiAgLy8gZml4IG1vdmUvcHJlbW92ZSBkZXN0c1xuICBpZiAoZGF0YS5zZWxlY3RlZCkgYm9hcmQuc2V0U2VsZWN0ZWQoZGF0YSwgZGF0YS5zZWxlY3RlZCk7XG5cbiAgLy8gbm8gbmVlZCBmb3Igc3VjaCBzaG9ydCBhbmltYXRpb25zXG4gIGlmICghZGF0YS5hbmltYXRpb24uZHVyYXRpb24gfHwgZGF0YS5hbmltYXRpb24uZHVyYXRpb24gPCAxMClcbiAgICBkYXRhLmFuaW1hdGlvbi5lbmFibGVkID0gZmFsc2U7XG59O1xuIiwidmFyIGJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZCcpO1xudmFyIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKTtcbnZhciBmZW4gPSByZXF1aXJlKCcuL2ZlbicpO1xudmFyIGNvbmZpZ3VyZSA9IHJlcXVpcmUoJy4vY29uZmlndXJlJyk7XG52YXIgYW5pbSA9IHJlcXVpcmUoJy4vYW5pbScpO1xudmFyIGRyYWcgPSByZXF1aXJlKCcuL2RyYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjZmcpIHtcblxuICB0aGlzLmRhdGEgPSBkYXRhKGNmZyk7XG5cbiAgdGhpcy52bSA9IHtcbiAgICBleHBsb2Rpbmc6IGZhbHNlXG4gIH07XG5cbiAgdGhpcy5nZXRGZW4gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmVuLndyaXRlKHRoaXMuZGF0YS5waWVjZXMpO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdGhpcy5zZXQgPSBhbmltKGNvbmZpZ3VyZSwgdGhpcy5kYXRhKTtcblxuICB0aGlzLnRvZ2dsZU9yaWVudGF0aW9uID0gYW5pbShib2FyZC50b2dnbGVPcmllbnRhdGlvbiwgdGhpcy5kYXRhKTtcblxuICB0aGlzLnNldFBpZWNlcyA9IGFuaW0oYm9hcmQuc2V0UGllY2VzLCB0aGlzLmRhdGEpO1xuXG4gIHRoaXMuc2VsZWN0U3F1YXJlID0gYW5pbShib2FyZC5zZWxlY3RTcXVhcmUsIHRoaXMuZGF0YSwgdHJ1ZSk7XG5cbiAgdGhpcy5hcGlNb3ZlID0gYW5pbShib2FyZC5hcGlNb3ZlLCB0aGlzLmRhdGEpO1xuXG4gIHRoaXMucGxheVByZW1vdmUgPSBhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCB0aGlzLmRhdGEpO1xuXG4gIHRoaXMuY2FuY2VsUHJlbW92ZSA9IGFuaW0oYm9hcmQudW5zZXRQcmVtb3ZlLCB0aGlzLmRhdGEsIHRydWUpO1xuXG4gIHRoaXMuc2V0Q2hlY2sgPSBhbmltKGJvYXJkLnNldENoZWNrLCB0aGlzLmRhdGEsIHRydWUpO1xuXG4gIHRoaXMuY2FuY2VsTW92ZSA9IGFuaW0oZnVuY3Rpb24oZGF0YSkge1xuICAgIGJvYXJkLmNhbmNlbE1vdmUoZGF0YSk7XG4gICAgZHJhZy5jYW5jZWwoZGF0YSk7XG4gIH0uYmluZCh0aGlzKSwgdGhpcy5kYXRhLCB0cnVlKTtcblxuICB0aGlzLnN0b3AgPSBhbmltKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBib2FyZC5zdG9wKGRhdGEpO1xuICAgIGRyYWcuY2FuY2VsKGRhdGEpO1xuICB9LmJpbmQodGhpcyksIHRoaXMuZGF0YSwgdHJ1ZSk7XG5cbiAgdGhpcy5leHBsb2RlID0gZnVuY3Rpb24oa2V5cykge1xuICAgIGlmICghdGhpcy5kYXRhLnJlbmRlcikgcmV0dXJuO1xuICAgIHRoaXMudm0uZXhwbG9kaW5nID0ga2V5cztcbiAgICB0aGlzLmRhdGEucmVuZGVyUkFGKCk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudm0uZXhwbG9kaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEucmVuZGVyUkFGKCk7XG4gICAgfS5iaW5kKHRoaXMpLCAyMDApO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdGhpcy5zZXRBdXRvU2hhcGVzID0gZnVuY3Rpb24oc2hhcGVzKSB7XG4gICAgYW5pbShmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkYXRhLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXM7XG4gICAgfSwgdGhpcy5kYXRhLCBmYWxzZSkoKTtcbiAgfS5iaW5kKHRoaXMpO1xufTtcbiIsInZhciBmZW4gPSByZXF1aXJlKCcuL2ZlbicpO1xudmFyIGNvbmZpZ3VyZSA9IHJlcXVpcmUoJy4vY29uZmlndXJlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY2ZnKSB7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBwaWVjZXM6IGZlbi5yZWFkKGZlbi5pbml0aWFsKSxcbiAgICBvcmllbnRhdGlvbjogJ3doaXRlJywgLy8gYm9hcmQgb3JpZW50YXRpb24uIHdoaXRlIHwgYmxhY2tcbiAgICB0dXJuQ29sb3I6ICd3aGl0ZScsIC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICAgIGNoZWNrOiBudWxsLCAvLyBzcXVhcmUgY3VycmVudGx5IGluIGNoZWNrIFwiYTJcIiB8IG51bGxcbiAgICBsYXN0TW92ZTogbnVsbCwgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIiwgXCJjNFwiXSB8IG51bGxcbiAgICBzZWxlY3RlZDogbnVsbCwgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCIgfCBudWxsXG4gICAgY29vcmRpbmF0ZXM6IHRydWUsIC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgICByZW5kZXI6IG51bGwsIC8vIGZ1bmN0aW9uIHRoYXQgcmVyZW5kZXJzIHRoZSBib2FyZFxuICAgIHJlbmRlclJBRjogbnVsbCwgLy8gZnVuY3Rpb24gdGhhdCByZXJlbmRlcnMgdGhlIGJvYXJkIHVzaW5nIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgIGVsZW1lbnQ6IG51bGwsIC8vIERPTSBlbGVtZW50IG9mIHRoZSBib2FyZCwgcmVxdWlyZWQgZm9yIGRyYWcgcGllY2UgY2VudGVyaW5nXG4gICAgYm91bmRzOiBudWxsLCAvLyBmdW5jdGlvbiB0aGF0IGNhbGN1bGF0ZXMgdGhlIGJvYXJkIGJvdW5kc1xuICAgIGF1dG9DYXN0bGU6IGZhbHNlLCAvLyBpbW1lZGlhdGVseSBjb21wbGV0ZSB0aGUgY2FzdGxlIGJ5IG1vdmluZyB0aGUgcm9vayBhZnRlciBraW5nIG1vdmVcbiAgICB2aWV3T25seTogZmFsc2UsIC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gICAgbWluaW1hbERvbTogZmFsc2UsIC8vIGRvbid0IHVzZSBzcXVhcmUgZWxlbWVudHMuIE9wdGltaXphdGlvbiB0byB1c2Ugb25seSB3aXRoIHZpZXdPbmx5XG4gICAgZGlzYWJsZUNvbnRleHRNZW51OiBmYWxzZSwgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBjaGVzc2JvYXJkXG4gICAgcmVzaXphYmxlOiB0cnVlLCAvLyBsaXN0ZW5zIHRvIGNoZXNzZ3JvdW5kLnJlc2l6ZSBvbiBkb2N1bWVudC5ib2R5IHRvIGNsZWFyIGJvdW5kcyBjYWNoZVxuICAgIGhpZ2hsaWdodDoge1xuICAgICAgbGFzdE1vdmU6IHRydWUsIC8vIGFkZCBsYXN0LW1vdmUgY2xhc3MgdG8gc3F1YXJlc1xuICAgICAgY2hlY2s6IHRydWUsIC8vIGFkZCBjaGVjayBjbGFzcyB0byBzcXVhcmVzXG4gICAgICBkcmFnT3ZlcjogdHJ1ZSAvLyBhZGQgZHJhZy1vdmVyIGNsYXNzIHRvIHNxdWFyZSB3aGVuIGRyYWdnaW5nIG92ZXIgaXRcbiAgICB9LFxuICAgIGFuaW1hdGlvbjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiAyMDAsXG4gICAgICAvKnsgLy8gY3VycmVudFxuICAgICAgICogIHN0YXJ0OiB0aW1lc3RhbXAsXG4gICAgICAgKiAgZHVyYXRpb246IG1zLFxuICAgICAgICogIGFuaW1zOiB7XG4gICAgICAgKiAgICBhMjogW1xuICAgICAgICogICAgICBbLTMwLCA1MF0sIC8vIGFuaW1hdGlvbiBnb2FsXG4gICAgICAgKiAgICAgIFstMjAsIDM3XSAgLy8gYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG4gICAgICAgKiAgICBdLCAuLi5cbiAgICAgICAqICB9LFxuICAgICAgICogIGZhZGluZzogW1xuICAgICAgICogICAge1xuICAgICAgICogICAgICBwb3M6IFs4MCwgMTIwXSwgLy8gcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIGJvYXJkXG4gICAgICAgKiAgICAgIG9wYWNpdHk6IDAuMzQsXG4gICAgICAgKiAgICAgIHJvbGU6ICdyb29rJyxcbiAgICAgICAqICAgICAgY29sb3I6ICdibGFjaydcbiAgICAgICAqICAgIH1cbiAgICAgICAqICB9XG4gICAgICAgKn0qL1xuICAgICAgY3VycmVudDoge31cbiAgICB9LFxuICAgIG1vdmFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsIC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICAgIGNvbG9yOiAnYm90aCcsIC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUuIHdoaXRlIHwgYmxhY2sgfCBib3RoIHwgbnVsbFxuICAgICAgZGVzdHM6IHt9LCAvLyB2YWxpZCBtb3Zlcy4ge1wiYTJcIiBbXCJhM1wiIFwiYTRcIl0gXCJiMVwiIFtcImEzXCIgXCJjM1wiXX0gfCBudWxsXG4gICAgICBkcm9wT2ZmOiAncmV2ZXJ0JywgLy8gd2hlbiBhIHBpZWNlIGlzIGRyb3BwZWQgb3V0c2lkZSB0aGUgYm9hcmQuIFwicmV2ZXJ0XCIgfCBcInRyYXNoXCJcbiAgICAgIGRyb3BwZWQ6IFtdLCAvLyBsYXN0IGRyb3BwZWQgW29yaWcsIGRlc3RdLCBub3QgdG8gYmUgYW5pbWF0ZWRcbiAgICAgIHNob3dEZXN0czogdHJ1ZSwgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgICBldmVudHM6IHtcbiAgICAgICAgYWZ0ZXI6IGZ1bmN0aW9uKG9yaWcsIGRlc3QsIG1ldGFkYXRhKSB7fSAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgICB9XG4gICAgfSxcbiAgICBwcmVtb3ZhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICAgIHNob3dEZXN0czogdHJ1ZSwgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgICBjYXN0bGU6IHRydWUsIC8vIHdoZXRoZXIgdG8gYWxsb3cga2luZyBjYXN0bGUgcHJlbW92ZXNcbiAgICAgIGRlc3RzOiBbXSwgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAgY3VycmVudDogbnVsbCwgLy8ga2V5cyBvZiB0aGUgY3VycmVudCBzYXZlZCBwcmVtb3ZlIFtcImUyXCIgXCJlNFwiXSB8IG51bGxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uKG9yaWcsIGRlc3QpIHt9LCAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICAgIHVuc2V0OiBmdW5jdGlvbigpIHt9IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgICAgfVxuICAgIH0sXG4gICAgZHJhZ2dhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLCAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgICAgZGlzdGFuY2U6IDMsIC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnLCBpbiBwaXhlbHNcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSwgLy8gbGV0cyBjaGVzc2dyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgICBzcXVhcmVUYXJnZXQ6IGZhbHNlLCAvLyBkaXNwbGF5IGJpZyBzcXVhcmUgdGFyZ2V0IGludGVuZGVkIGZvciBtb2JpbGVcbiAgICAgIGNlbnRlclBpZWNlOiB0cnVlLCAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgICBzaG93R2hvc3Q6IHRydWUsIC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgICAgLyp7IC8vIGN1cnJlbnRcbiAgICAgICAqICBvcmlnOiBcImEyXCIsIC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gICAgICAgKiAgcmVsOiBbMTAwLCAxNzBdIC8vIHgsIHkgb2YgdGhlIHBpZWNlIGF0IG9yaWdpbmFsIHBvc2l0aW9uXG4gICAgICAgKiAgcG9zOiBbMjAsIC0xMl0gLy8gcmVsYXRpdmUgY3VycmVudCBwb3NpdGlvblxuICAgICAgICogIGRlYzogWzQsIC04XSAvLyBwaWVjZSBjZW50ZXIgZGVjYXlcbiAgICAgICAqICBvdmVyOiBcImIzXCIgLy8gc3F1YXJlIGJlaW5nIG1vdXNlZCBvdmVyXG4gICAgICAgKiAgYm91bmRzOiBjdXJyZW50IGNhY2hlZCBib2FyZCBib3VuZHNcbiAgICAgICAqICBzdGFydGVkOiB3aGV0aGVyIHRoZSBkcmFnIGhhcyBzdGFydGVkLCBhcyBwZXIgdGhlIGRpc3RhbmNlIHNldHRpbmdcbiAgICAgICAqfSovXG4gICAgICBjdXJyZW50OiB7fVxuICAgIH0sXG4gICAgc3RhdHM6IHtcbiAgICAgIC8vIHdhcyBsYXN0IHBpZWNlIGRyYWdnZWQgb3IgY2xpY2tlZD9cbiAgICAgIC8vIG5lZWRzIGRlZmF1bHQgdG8gZmFsc2UgZm9yIHRvdWNoXG4gICAgICBkcmFnZ2VkOiAhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdylcbiAgICB9LFxuICAgIGV2ZW50czoge1xuICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHt9LCAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgICAgLy8gY2FsbGVkIGFmdGVyIGEgcGllY2UgaGFzIGJlZW4gbW92ZWQuXG4gICAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIG51bGwgb3IgbGlrZSB7Y29sb3I6ICd3aGl0ZScsICdyb2xlJzogJ3F1ZWVuJ31cbiAgICAgIG1vdmU6IGZ1bmN0aW9uKG9yaWcsIGRlc3QsIGNhcHR1cmVkUGllY2UpIHt9LFxuICAgICAgY2FwdHVyZTogZnVuY3Rpb24oa2V5LCBwaWVjZSkge30sIC8vIERFUFJFQ0FURUQgY2FsbGVkIHdoZW4gYSBwaWVjZSBoYXMgYmVlbiBjYXB0dXJlZFxuICAgICAgc2VsZWN0OiBmdW5jdGlvbihrZXkpIHt9IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgfSxcbiAgICBkcmF3YWJsZToge1xuICAgICAgZW5hYmxlZDogZmFsc2UsIC8vIGFsbG93cyBTVkcgZHJhd2luZ3NcbiAgICAgIC8vIHVzZXIgc2hhcGVzXG4gICAgICBzaGFwZXM6IFtcbiAgICAgICAgLy8ge2JydXNoOiAnZ3JlZW4nLCBvcmlnOiAnZTgnfSxcbiAgICAgICAgLy8ge2JydXNoOiAneWVsbG93Jywgb3JpZzogJ2M0JywgZGVzdDogJ2Y3J31cbiAgICAgIF0sXG4gICAgICAvLyBjb21wdXRlciBzaGFwZXNcbiAgICAgIGF1dG9TaGFwZXM6IFtcbiAgICAgICAgLy8ge2JydXNoOiAncGFsZUJsdWUnLCBvcmlnOiAnZTgnfSxcbiAgICAgICAgLy8ge2JydXNoOiAncGFsZVJlZCcsIG9yaWc6ICdjNCcsIGRlc3Q6ICdmNyd9XG4gICAgICBdLFxuICAgICAgLyp7IC8vIGN1cnJlbnRcbiAgICAgICAqICBvcmlnOiBcImEyXCIsIC8vIG9yaWcga2V5IG9mIGRyYXdpbmdcbiAgICAgICAqICBwb3M6IFsyMCwgLTEyXSAvLyByZWxhdGl2ZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgKiAgZGVzdDogXCJiM1wiIC8vIHNxdWFyZSBiZWluZyBtb3VzZWQgb3ZlclxuICAgICAgICogIGJvdW5kczogLy8gY3VycmVudCBjYWNoZWQgYm9hcmQgYm91bmRzXG4gICAgICAgKiAgYnJ1c2g6ICdncmVlbicgLy8gYnJ1c2ggbmFtZSBmb3Igc2hhcGVcbiAgICAgICAqfSovXG4gICAgICBjdXJyZW50OiB7fSxcbiAgICAgIGJydXNoZXM6IHtcbiAgICAgICAgZ3JlZW46IHtcbiAgICAgICAgICBrZXk6ICdnJyxcbiAgICAgICAgICBjb2xvcjogJyMxNTc4MUInLFxuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgbGluZVdpZHRoOiAxMCxcbiAgICAgICAgICBjaXJjbGVNYXJnaW46IDBcbiAgICAgICAgfSxcbiAgICAgICAgcmVkOiB7XG4gICAgICAgICAga2V5OiAncicsXG4gICAgICAgICAgY29sb3I6ICcjODgyMDIwJyxcbiAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgIGxpbmVXaWR0aDogMTAsXG4gICAgICAgICAgY2lyY2xlTWFyZ2luOiAxXG4gICAgICAgIH0sXG4gICAgICAgIGJsdWU6IHtcbiAgICAgICAgICBrZXk6ICdiJyxcbiAgICAgICAgICBjb2xvcjogJyMwMDMwODgnLFxuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgbGluZVdpZHRoOiAxMCxcbiAgICAgICAgICBjaXJjbGVNYXJnaW46IDJcbiAgICAgICAgfSxcbiAgICAgICAgeWVsbG93OiB7XG4gICAgICAgICAga2V5OiAneScsXG4gICAgICAgICAgY29sb3I6ICcjZTY4ZjAwJyxcbiAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgIGxpbmVXaWR0aDogMTAsXG4gICAgICAgICAgY2lyY2xlTWFyZ2luOiAzXG4gICAgICAgIH0sXG4gICAgICAgIHBhbGVCbHVlOiB7XG4gICAgICAgICAga2V5OiAncGInLFxuICAgICAgICAgIGNvbG9yOiAnIzAwMzA4OCcsXG4gICAgICAgICAgb3BhY2l0eTogMC40NSxcbiAgICAgICAgICBsaW5lV2lkdGg6IDE1LFxuICAgICAgICAgIGNpcmNsZU1hcmdpbjogMFxuICAgICAgICB9LFxuICAgICAgICBwYWxlR3JlZW46IHtcbiAgICAgICAgICBrZXk6ICdwZycsXG4gICAgICAgICAgY29sb3I6ICcjMTU3ODFCJyxcbiAgICAgICAgICBvcGFjaXR5OiAwLjU1LFxuICAgICAgICAgIGxpbmVXaWR0aDogMTUsXG4gICAgICAgICAgY2lyY2xlTWFyZ2luOiAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uZmlndXJlKGRlZmF1bHRzLCBjZmcgfHwge30pO1xuXG4gIHJldHVybiBkZWZhdWx0cztcbn07XG4iLCJ2YXIgYm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgb3JpZ2luVGFyZ2V0O1xuXG5mdW5jdGlvbiBoYXNoUGllY2UocGllY2UpIHtcbiAgcmV0dXJuIHBpZWNlID8gcGllY2UuY29sb3IgKyBwaWVjZS5yb2xlIDogJyc7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTcXVhcmVCb3VuZHMoZGF0YSwgYm91bmRzLCBrZXkpIHtcbiAgdmFyIHBvcyA9IHV0aWwua2V5MnBvcyhrZXkpO1xuICBpZiAoZGF0YS5vcmllbnRhdGlvbiAhPT0gJ3doaXRlJykge1xuICAgIHBvc1swXSA9IDkgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gOSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoICogKHBvc1swXSAtIDEpIC8gOCxcbiAgICB0b3A6IGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0ICogKDggLSBwb3NbMV0pIC8gOCxcbiAgICB3aWR0aDogYm91bmRzLndpZHRoIC8gOCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLyA4XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0YXJ0KGRhdGEsIGUpIHtcbiAgaWYgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApIHJldHVybjsgLy8gb25seSB0b3VjaCBvciBsZWZ0IGNsaWNrXG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBvcmlnaW5UYXJnZXQgPSBlLnRhcmdldDtcbiAgdmFyIHByZXZpb3VzbHlTZWxlY3RlZCA9IGRhdGEuc2VsZWN0ZWQ7XG4gIHZhciBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgdmFyIGJvdW5kcyA9IGRhdGEuYm91bmRzKCk7XG4gIHZhciBvcmlnID0gYm9hcmQuZ2V0S2V5QXREb21Qb3MoZGF0YSwgcG9zaXRpb24sIGJvdW5kcyk7XG4gIHZhciBoYWRQcmVtb3ZlID0gISFkYXRhLnByZW1vdmFibGUuY3VycmVudDtcbiAgYm9hcmQuc2VsZWN0U3F1YXJlKGRhdGEsIG9yaWcpO1xuICB2YXIgc3RpbGxTZWxlY3RlZCA9IGRhdGEuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGlmIChkYXRhLnBpZWNlc1tvcmlnXSAmJiBzdGlsbFNlbGVjdGVkICYmIGJvYXJkLmlzRHJhZ2dhYmxlKGRhdGEsIG9yaWcpKSB7XG4gICAgdmFyIHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMoZGF0YSwgYm91bmRzLCBvcmlnKTtcbiAgICBkYXRhLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgcHJldmlvdXNseVNlbGVjdGVkOiBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICBvcmlnOiBvcmlnLFxuICAgICAgcGllY2U6IGhhc2hQaWVjZShkYXRhLnBpZWNlc1tvcmlnXSksXG4gICAgICByZWw6IHBvc2l0aW9uLFxuICAgICAgZXBvczogcG9zaXRpb24sXG4gICAgICBwb3M6IFswLCAwXSxcbiAgICAgIGRlYzogZGF0YS5kcmFnZ2FibGUuY2VudGVyUGllY2UgPyBbXG4gICAgICAgIHBvc2l0aW9uWzBdIC0gKHNxdWFyZUJvdW5kcy5sZWZ0ICsgc3F1YXJlQm91bmRzLndpZHRoIC8gMiksXG4gICAgICAgIHBvc2l0aW9uWzFdIC0gKHNxdWFyZUJvdW5kcy50b3AgKyBzcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMilcbiAgICAgIF0gOiBbMCwgMF0sXG4gICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgIHN0YXJ0ZWQ6IGRhdGEuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiBkYXRhLnN0YXRzLmRyYWdnZWRcbiAgICB9O1xuICB9IGVsc2UgaWYgKGhhZFByZW1vdmUpIGJvYXJkLnVuc2V0UHJlbW92ZShkYXRhKTtcbiAgcHJvY2Vzc0RyYWcoZGF0YSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEcmFnKGRhdGEpIHtcbiAgdXRpbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1ciA9IGRhdGEuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1ci5vcmlnKSB7XG4gICAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgICAgaWYgKGRhdGEuYW5pbWF0aW9uLmN1cnJlbnQuc3RhcnQgJiYgZGF0YS5hbmltYXRpb24uY3VycmVudC5hbmltc1tjdXIub3JpZ10pXG4gICAgICAgIGRhdGEuYW5pbWF0aW9uLmN1cnJlbnQgPSB7fTtcbiAgICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICAgIGlmIChoYXNoUGllY2UoZGF0YS5waWVjZXNbY3VyLm9yaWddKSAhPT0gY3VyLnBpZWNlKSBjYW5jZWwoZGF0YSk7XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFjdXIuc3RhcnRlZCAmJiB1dGlsLmRpc3RhbmNlKGN1ci5lcG9zLCBjdXIucmVsKSA+PSBkYXRhLmRyYWdnYWJsZS5kaXN0YW5jZSlcbiAgICAgICAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuICAgICAgICAgIGN1ci5wb3MgPSBbXG4gICAgICAgICAgICBjdXIuZXBvc1swXSAtIGN1ci5yZWxbMF0sXG4gICAgICAgICAgICBjdXIuZXBvc1sxXSAtIGN1ci5yZWxbMV1cbiAgICAgICAgICBdO1xuICAgICAgICAgIGN1ci5vdmVyID0gYm9hcmQuZ2V0S2V5QXREb21Qb3MoZGF0YSwgY3VyLmVwb3MsIGN1ci5ib3VuZHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGRhdGEucmVuZGVyKCk7XG4gICAgaWYgKGN1ci5vcmlnKSBwcm9jZXNzRHJhZyhkYXRhKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1vdmUoZGF0YSwgZSkge1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG5cbiAgaWYgKGRhdGEuZHJhZ2dhYmxlLmN1cnJlbnQub3JpZylcbiAgICBkYXRhLmRyYWdnYWJsZS5jdXJyZW50LmVwb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG59XG5cbmZ1bmN0aW9uIGVuZChkYXRhLCBlKSB7XG4gIHZhciBkcmFnZ2FibGUgPSBkYXRhLmRyYWdnYWJsZTtcbiAgdmFyIG9yaWcgPSBkcmFnZ2FibGUuY3VycmVudCA/IGRyYWdnYWJsZS5jdXJyZW50Lm9yaWcgOiBudWxsO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgLy8gaGFzIHRoZSBzYW1lIHRvdWNoIG9yaWdpblxuICBpZiAoZSAmJiBlLnR5cGUgPT09IFwidG91Y2hlbmRcIiAmJiBvcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0KSByZXR1cm47XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShkYXRhKTtcbiAgdmFyIGRlc3QgPSBkcmFnZ2FibGUuY3VycmVudC5vdmVyO1xuICBpZiAoZHJhZ2dhYmxlLmN1cnJlbnQuc3RhcnRlZCkge1xuICAgIGlmIChvcmlnICE9PSBkZXN0KSBkYXRhLm1vdmFibGUuZHJvcHBlZCA9IFtvcmlnLCBkZXN0XTtcbiAgICBpZiAoYm9hcmQudXNlck1vdmUoZGF0YSwgb3JpZywgZGVzdCkpIGRhdGEuc3RhdHMuZHJhZ2dlZCA9IHRydWU7XG4gIH1cbiAgaWYgKG9yaWcgPT09IGRyYWdnYWJsZS5jdXJyZW50LnByZXZpb3VzbHlTZWxlY3RlZCAmJiAob3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQuc2V0U2VsZWN0ZWQoZGF0YSwgbnVsbCk7XG4gIGRyYWdnYWJsZS5jdXJyZW50ID0ge307XG59XG5cbmZ1bmN0aW9uIGNhbmNlbChkYXRhKSB7XG4gIGlmIChkYXRhLmRyYWdnYWJsZS5jdXJyZW50Lm9yaWcpIHtcbiAgICBkYXRhLmRyYWdnYWJsZS5jdXJyZW50ID0ge307XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKGRhdGEsIG51bGwpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzdGFydDogc3RhcnQsXG4gIG1vdmU6IG1vdmUsXG4gIGVuZDogZW5kLFxuICBjYW5jZWw6IGNhbmNlbCxcbiAgcHJvY2Vzc0RyYWc6IHByb2Nlc3NEcmFnIC8vIG11c3QgYmUgZXhwb3NlZCBmb3IgYm9hcmQgZWRpdG9yc1xufTtcbiIsInZhciBib2FyZCA9IHJlcXVpcmUoJy4vYm9hcmQnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBicnVzaGVzID0gWydncmVlbicsICdyZWQnLCAnYmx1ZScsICd5ZWxsb3cnXTtcblxuZnVuY3Rpb24gaGFzaFBpZWNlKHBpZWNlKSB7XG4gIHJldHVybiBwaWVjZSA/IHBpZWNlLmNvbG9yICsgJyAnICsgcGllY2Uucm9sZSA6ICcnO1xufVxuXG5mdW5jdGlvbiBzdGFydChkYXRhLCBlKSB7XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBib2FyZC5jYW5jZWxNb3ZlKGRhdGEpO1xuICB2YXIgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gIHZhciBib3VuZHMgPSBkYXRhLmJvdW5kcygpO1xuICB2YXIgb3JpZyA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGRhdGEsIHBvc2l0aW9uLCBib3VuZHMpO1xuICBkYXRhLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzogb3JpZyxcbiAgICBlcG9zOiBwb3NpdGlvbixcbiAgICBib3VuZHM6IGJvdW5kcyxcbiAgICBicnVzaDogYnJ1c2hlc1soZS5zaGlmdEtleSAmIHV0aWwuaXNSaWdodEJ1dHRvbihlKSkgKyAoZS5hbHRLZXkgPyAyIDogMCldXG4gIH07XG4gIHByb2Nlc3NEcmF3KGRhdGEpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhdyhkYXRhKSB7XG4gIHV0aWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdXIgPSBkYXRhLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1ci5vcmlnKSB7XG4gICAgICB2YXIgZGVzdCA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGRhdGEsIGN1ci5lcG9zLCBjdXIuYm91bmRzKTtcbiAgICAgIGlmIChjdXIub3JpZyA9PT0gZGVzdCkgY3VyLmRlc3QgPSB1bmRlZmluZWQ7XG4gICAgICBlbHNlIGN1ci5kZXN0ID0gZGVzdDtcbiAgICB9XG4gICAgZGF0YS5yZW5kZXIoKTtcbiAgICBpZiAoY3VyLm9yaWcpIHByb2Nlc3NEcmF3KGRhdGEpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbW92ZShkYXRhLCBlKSB7XG4gIGlmIChkYXRhLmRyYXdhYmxlLmN1cnJlbnQub3JpZylcbiAgICBkYXRhLmRyYXdhYmxlLmN1cnJlbnQuZXBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbn1cblxuZnVuY3Rpb24gZW5kKGRhdGEsIGUpIHtcbiAgdmFyIGRyYXdhYmxlID0gZGF0YS5kcmF3YWJsZTtcbiAgdmFyIG9yaWcgPSBkcmF3YWJsZS5jdXJyZW50Lm9yaWc7XG4gIHZhciBkZXN0ID0gZHJhd2FibGUuY3VycmVudC5kZXN0O1xuICBpZiAob3JpZyAmJiBkZXN0KSBhZGRMaW5lKGRyYXdhYmxlLCBvcmlnLCBkZXN0KTtcbiAgZWxzZSBpZiAob3JpZykgYWRkQ2lyY2xlKGRyYXdhYmxlLCBvcmlnKTtcbiAgZHJhd2FibGUuY3VycmVudCA9IHt9O1xuICBkYXRhLnJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBjYW5jZWwoZGF0YSkge1xuICBpZiAoZGF0YS5kcmF3YWJsZS5jdXJyZW50Lm9yaWcpIGRhdGEuZHJhd2FibGUuY3VycmVudCA9IHt9O1xufVxuXG5mdW5jdGlvbiBjbGVhcihkYXRhLCBlKSB7XG4gIGlmIChlLmJ1dHRvbiAhPT0gMCB8fCBlLnNoaWZ0S2V5KSByZXR1cm47IC8vIG9ubHkgbGVmdCBjbGlja1xuICBpZiAoZGF0YS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoKSB7XG4gICAgZGF0YS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgICBkYXRhLnJlbmRlcigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vdChmKSB7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICFmKHgpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRDaXJjbGUoZHJhd2FibGUsIGtleSkge1xuICB2YXIgYnJ1c2ggPSBkcmF3YWJsZS5jdXJyZW50LmJydXNoO1xuICB2YXIgc2FtZUNpcmNsZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICByZXR1cm4gcy5icnVzaCA9PT0gYnJ1c2ggJiYgcy5vcmlnID09PSBrZXkgJiYgIXMuZGVzdDtcbiAgfTtcbiAgdmFyIGV4aXN0cyA9IGRyYXdhYmxlLnNoYXBlcy5maWx0ZXIoc2FtZUNpcmNsZSkubGVuZ3RoID4gMDtcbiAgaWYgKGV4aXN0cykgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihub3Qoc2FtZUNpcmNsZSkpO1xuICBlbHNlIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICBicnVzaDogYnJ1c2gsXG4gICAgb3JpZzoga2V5XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRMaW5lKGRyYXdhYmxlLCBvcmlnLCBkZXN0KSB7XG4gIHZhciBicnVzaCA9IGRyYXdhYmxlLmN1cnJlbnQuYnJ1c2g7XG4gIHZhciBzYW1lTGluZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICByZXR1cm4gcy5vcmlnICYmIHMuZGVzdCAmJiAoXG4gICAgICAocy5vcmlnID09PSBvcmlnICYmIHMuZGVzdCA9PT0gZGVzdCkgfHxcbiAgICAgIChzLmRlc3QgPT09IG9yaWcgJiYgcy5vcmlnID09PSBkZXN0KVxuICAgICk7XG4gIH07XG4gIHZhciBleGlzdHMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVMaW5lKS5sZW5ndGggPiAwO1xuICBpZiAoZXhpc3RzKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKG5vdChzYW1lTGluZSkpO1xuICBlbHNlIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICBicnVzaDogYnJ1c2gsXG4gICAgb3JpZzogb3JpZyxcbiAgICBkZXN0OiBkZXN0XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnQ6IHN0YXJ0LFxuICBtb3ZlOiBtb3ZlLFxuICBlbmQ6IGVuZCxcbiAgY2FuY2VsOiBjYW5jZWwsXG4gIGNsZWFyOiBjbGVhcixcbiAgcHJvY2Vzc0RyYXc6IHByb2Nlc3NEcmF3XG59O1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIGluaXRpYWwgPSAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUic7XG5cbnZhciByb2xlcyA9IHtcbiAgcDogXCJwYXduXCIsXG4gIHI6IFwicm9va1wiLFxuICBuOiBcImtuaWdodFwiLFxuICBiOiBcImJpc2hvcFwiLFxuICBxOiBcInF1ZWVuXCIsXG4gIGs6IFwia2luZ1wiXG59O1xuXG52YXIgbGV0dGVycyA9IHtcbiAgcGF3bjogXCJwXCIsXG4gIHJvb2s6IFwiclwiLFxuICBrbmlnaHQ6IFwiblwiLFxuICBiaXNob3A6IFwiYlwiLFxuICBxdWVlbjogXCJxXCIsXG4gIGtpbmc6IFwia1wiXG59O1xuXG5mdW5jdGlvbiByZWFkKGZlbikge1xuICBpZiAoZmVuID09PSAnc3RhcnQnKSBmZW4gPSBpbml0aWFsO1xuICB2YXIgcGllY2VzID0ge307XG4gIGZlbi5yZXBsYWNlKC8gLiskLywgJycpLnNwbGl0KCcvJykuZm9yRWFjaChmdW5jdGlvbihyb3csIHkpIHtcbiAgICB2YXIgeCA9IDA7XG4gICAgcm93LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciBuYiA9IHBhcnNlSW50KHYpO1xuICAgICAgaWYgKG5iKSB4ICs9IG5iO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHgrKztcbiAgICAgICAgcGllY2VzW3V0aWwucG9zMmtleShbeCwgOCAtIHldKV0gPSB7XG4gICAgICAgICAgcm9sZTogcm9sZXNbdi50b0xvd2VyQ2FzZSgpXSxcbiAgICAgICAgICBjb2xvcjogdiA9PT0gdi50b0xvd2VyQ2FzZSgpID8gJ2JsYWNrJyA6ICd3aGl0ZSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHBpZWNlcztcbn1cblxuZnVuY3Rpb24gd3JpdGUocGllY2VzKSB7XG4gIHJldHVybiBbOCwgNywgNiwgNSwgNCwgMywgMl0ucmVkdWNlKFxuICAgIGZ1bmN0aW9uKHN0ciwgbmIpIHtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKEFycmF5KG5iICsgMSkuam9pbignMScpLCAnZycpLCBuYik7XG4gICAgfSxcbiAgICB1dGlsLmludlJhbmtzLm1hcChmdW5jdGlvbih5KSB7XG4gICAgICByZXR1cm4gdXRpbC5yYW5rcy5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICB2YXIgcGllY2UgPSBwaWVjZXNbdXRpbC5wb3Mya2V5KFt4LCB5XSldO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICB2YXIgbGV0dGVyID0gbGV0dGVyc1twaWVjZS5yb2xlXTtcbiAgICAgICAgICByZXR1cm4gcGllY2UuY29sb3IgPT09ICd3aGl0ZScgPyBsZXR0ZXIudG9VcHBlckNhc2UoKSA6IGxldHRlcjtcbiAgICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9KS5qb2luKCcvJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdGlhbDogaW5pdGlhbCxcbiAgcmVhZDogcmVhZCxcbiAgd3JpdGU6IHdyaXRlXG59O1xuIiwidmFyIHN0YXJ0QXQ7XG5cbnZhciBzdGFydCA9IGZ1bmN0aW9uKCkge1xuICBzdGFydEF0ID0gbmV3IERhdGUoKTtcbn07XG5cbnZhciBjYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgc3RhcnRBdCA9IG51bGw7XG59O1xuXG52YXIgc3RvcCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXN0YXJ0QXQpIHJldHVybiAwO1xuICB2YXIgdGltZSA9IG5ldyBEYXRlKCkgLSBzdGFydEF0O1xuICBzdGFydEF0ID0gbnVsbDtcbiAgcmV0dXJuIHRpbWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnQ6IHN0YXJ0LFxuICBjYW5jZWw6IGNhbmNlbCxcbiAgc3RvcDogc3RvcFxufTtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIGRpZmYoYSwgYikge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpO1xufVxuXG5mdW5jdGlvbiBwYXduKGNvbG9yLCB4MSwgeTEsIHgyLCB5Mikge1xuICByZXR1cm4gZGlmZih4MSwgeDIpIDwgMiAmJiAoXG4gICAgY29sb3IgPT09ICd3aGl0ZScgPyAoXG4gICAgICAvLyBhbGxvdyAyIHNxdWFyZXMgZnJvbSAxIGFuZCA4LCBmb3IgaG9yZGVcbiAgICAgIHkyID09PSB5MSArIDEgfHwgKHkxIDw9IDIgJiYgeTIgPT09ICh5MSArIDIpICYmIHgxID09PSB4MilcbiAgICApIDogKFxuICAgICAgeTIgPT09IHkxIC0gMSB8fCAoeTEgPj0gNyAmJiB5MiA9PT0gKHkxIC0gMikgJiYgeDEgPT09IHgyKVxuICAgIClcbiAgKTtcbn1cblxuZnVuY3Rpb24ga25pZ2h0KHgxLCB5MSwgeDIsIHkyKSB7XG4gIHZhciB4ZCA9IGRpZmYoeDEsIHgyKTtcbiAgdmFyIHlkID0gZGlmZih5MSwgeTIpO1xuICByZXR1cm4gKHhkID09PSAxICYmIHlkID09PSAyKSB8fCAoeGQgPT09IDIgJiYgeWQgPT09IDEpO1xufVxuXG5mdW5jdGlvbiBiaXNob3AoeDEsIHkxLCB4MiwgeTIpIHtcbiAgcmV0dXJuIGRpZmYoeDEsIHgyKSA9PT0gZGlmZih5MSwgeTIpO1xufVxuXG5mdW5jdGlvbiByb29rKHgxLCB5MSwgeDIsIHkyKSB7XG4gIHJldHVybiB4MSA9PT0geDIgfHwgeTEgPT09IHkyO1xufVxuXG5mdW5jdGlvbiBxdWVlbih4MSwgeTEsIHgyLCB5Mikge1xuICByZXR1cm4gYmlzaG9wKHgxLCB5MSwgeDIsIHkyKSB8fCByb29rKHgxLCB5MSwgeDIsIHkyKTtcbn1cblxuZnVuY3Rpb24ga2luZyhjb2xvciwgcm9va0ZpbGVzLCBjYW5DYXN0bGUsIHgxLCB5MSwgeDIsIHkyKSB7XG4gIHJldHVybiAoXG4gICAgZGlmZih4MSwgeDIpIDwgMiAmJiBkaWZmKHkxLCB5MikgPCAyXG4gICkgfHwgKFxuICAgIGNhbkNhc3RsZSAmJiB5MSA9PT0geTIgJiYgeTEgPT09IChjb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4KSAmJiAoXG4gICAgICAoeDEgPT09IDUgJiYgKHgyID09PSAzIHx8IHgyID09PSA3KSkgfHwgdXRpbC5jb250YWluc1gocm9va0ZpbGVzLCB4MilcbiAgICApXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJvb2tGaWxlc09mKHBpZWNlcywgY29sb3IpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHBpZWNlcykuZmlsdGVyKGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBwaWVjZSA9IHBpZWNlc1trZXldO1xuICAgIHJldHVybiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gY29sb3IgJiYgcGllY2Uucm9sZSA9PT0gJ3Jvb2snO1xuICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHV0aWwua2V5MnBvcyhrZXkpWzBdO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZShwaWVjZXMsIGtleSwgY2FuQ2FzdGxlKSB7XG4gIHZhciBwaWVjZSA9IHBpZWNlc1trZXldO1xuICB2YXIgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIHZhciBtb2JpbGl0eTtcbiAgc3dpdGNoIChwaWVjZS5yb2xlKSB7XG4gICAgY2FzZSAncGF3bic6XG4gICAgICBtb2JpbGl0eSA9IHBhd24uYmluZChudWxsLCBwaWVjZS5jb2xvcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdrbmlnaHQnOlxuICAgICAgbW9iaWxpdHkgPSBrbmlnaHQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiaXNob3AnOlxuICAgICAgbW9iaWxpdHkgPSBiaXNob3A7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyb29rJzpcbiAgICAgIG1vYmlsaXR5ID0gcm9vaztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3F1ZWVuJzpcbiAgICAgIG1vYmlsaXR5ID0gcXVlZW47XG4gICAgICBicmVhaztcbiAgICBjYXNlICdraW5nJzpcbiAgICAgIG1vYmlsaXR5ID0ga2luZy5iaW5kKG51bGwsIHBpZWNlLmNvbG9yLCByb29rRmlsZXNPZihwaWVjZXMsIHBpZWNlLmNvbG9yKSwgY2FuQ2FzdGxlKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB1dGlsLmFsbFBvcy5maWx0ZXIoZnVuY3Rpb24ocG9zMikge1xuICAgIHJldHVybiAocG9zWzBdICE9PSBwb3MyWzBdIHx8IHBvc1sxXSAhPT0gcG9zMlsxXSkgJiYgbW9iaWxpdHkocG9zWzBdLCBwb3NbMV0sIHBvczJbMF0sIHBvczJbMV0pO1xuICB9KS5tYXAodXRpbC5wb3Mya2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21wdXRlO1xuIiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG52YXIga2V5MnBvcyA9IHJlcXVpcmUoJy4vdXRpbCcpLmtleTJwb3M7XG5cbmZ1bmN0aW9uIGNpcmNsZVdpZHRoKGN1cnJlbnQsIGJvdW5kcykge1xuICByZXR1cm4gKGN1cnJlbnQgPyAyIDogNCkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIGxpbmVXaWR0aChicnVzaCwgY3VycmVudCwgYm91bmRzKSB7XG4gIHJldHVybiAoYnJ1c2gubGluZVdpZHRoIHx8IDEwKSAqIChjdXJyZW50ID8gMC43IDogMSkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpIHtcbiAgcmV0dXJuIChicnVzaC5vcGFjaXR5IHx8IDEpICogKGN1cnJlbnQgPyAwLjYgOiAxKTtcbn1cblxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oY3VycmVudCwgYm91bmRzKSB7XG4gIHJldHVybiAoY3VycmVudCA/IDEyIDogMjQpIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBwb3MycHgocG9zLCBib3VuZHMpIHtcbiAgdmFyIHNxdWFyZVNpemUgPSBib3VuZHMud2lkdGggLyA4O1xuICByZXR1cm4gWyhwb3NbMF0gLSAwLjUpICogc3F1YXJlU2l6ZSwgKDguNSAtIHBvc1sxXSkgKiBzcXVhcmVTaXplXTtcbn1cblxuZnVuY3Rpb24gY2lyY2xlKGJydXNoLCBwb3MsIGN1cnJlbnQsIGJvdW5kcykge1xuICB2YXIgbyA9IHBvczJweChwb3MsIGJvdW5kcyk7XG4gIHZhciB3aWR0aCA9IGNpcmNsZVdpZHRoKGN1cnJlbnQsIGJvdW5kcyk7XG4gIHZhciByYWRpdXMgPSBib3VuZHMud2lkdGggLyAxNjtcbiAgcmV0dXJuIHtcbiAgICB0YWc6ICdjaXJjbGUnLFxuICAgIGF0dHJzOiB7XG4gICAgICBrZXk6IGN1cnJlbnQgPyAnY3VycmVudCcgOiBwb3MgKyBicnVzaC5rZXksXG4gICAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoLFxuICAgICAgZmlsbDogJ25vbmUnLFxuICAgICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgICBjeDogb1swXSxcbiAgICAgIGN5OiBvWzFdLFxuICAgICAgcjogcmFkaXVzIC0gd2lkdGggLyAyIC0gYnJ1c2guY2lyY2xlTWFyZ2luICogd2lkdGggKiAxLjVcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFycm93KGJydXNoLCBvcmlnLCBkZXN0LCBjdXJyZW50LCBib3VuZHMpIHtcbiAgdmFyIG0gPSBhcnJvd01hcmdpbihjdXJyZW50LCBib3VuZHMpO1xuICB2YXIgYSA9IHBvczJweChvcmlnLCBib3VuZHMpO1xuICB2YXIgYiA9IHBvczJweChkZXN0LCBib3VuZHMpO1xuICB2YXIgZHggPSBiWzBdIC0gYVswXSxcbiAgICBkeSA9IGJbMV0gLSBhWzFdLFxuICAgIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpO1xuICB2YXIgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtLFxuICAgIHlvID0gTWF0aC5zaW4oYW5nbGUpICogbTtcbiAgcmV0dXJuIHtcbiAgICB0YWc6ICdsaW5lJyxcbiAgICBhdHRyczoge1xuICAgICAga2V5OiBjdXJyZW50ID8gJ2N1cnJlbnQnIDogb3JpZyArIGRlc3QgKyBicnVzaC5rZXksXG4gICAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICAgJ3N0cm9rZS13aWR0aCc6IGxpbmVXaWR0aChicnVzaCwgY3VycmVudCwgYm91bmRzKSxcbiAgICAgICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcsXG4gICAgICAnbWFya2VyLWVuZCc6ICd1cmwoI2Fycm93aGVhZC0nICsgYnJ1c2gua2V5ICsgJyknLFxuICAgICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgICB4MTogYVswXSxcbiAgICAgIHkxOiBhWzFdLFxuICAgICAgeDI6IGJbMF0gLSB4byxcbiAgICAgIHkyOiBiWzFdIC0geW9cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlZnMoYnJ1c2hlcykge1xuICByZXR1cm4ge1xuICAgIHRhZzogJ2RlZnMnLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBicnVzaGVzLm1hcChmdW5jdGlvbihicnVzaCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGtleTogYnJ1c2gua2V5LFxuICAgICAgICAgIHRhZzogJ21hcmtlcicsXG4gICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaC5rZXksXG4gICAgICAgICAgICBvcmllbnQ6ICdhdXRvJyxcbiAgICAgICAgICAgIG1hcmtlcldpZHRoOiA0LFxuICAgICAgICAgICAgbWFya2VySGVpZ2h0OiA4LFxuICAgICAgICAgICAgcmVmWDogMi4wNSxcbiAgICAgICAgICAgIHJlZlk6IDIuMDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNoaWxkcmVuOiBbe1xuICAgICAgICAgICAgdGFnOiAncGF0aCcsXG4gICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgICAgICAgICAgICBmaWxsOiBicnVzaC5jb2xvclxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgXVxuICB9O1xufVxuXG5mdW5jdGlvbiBvcmllbnQocG9zLCBjb2xvcikge1xuICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBwb3MgOiBbOSAtIHBvc1swXSwgOSAtIHBvc1sxXV07XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNoYXBlKG9yaWVudGF0aW9uLCBjdXJyZW50LCBicnVzaGVzLCBib3VuZHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNoYXBlKSB7XG4gICAgaWYgKHNoYXBlLm9yaWcgJiYgc2hhcGUuZGVzdCkgcmV0dXJuIGFycm93KFxuICAgICAgYnJ1c2hlc1tzaGFwZS5icnVzaF0sXG4gICAgICBvcmllbnQoa2V5MnBvcyhzaGFwZS5vcmlnKSwgb3JpZW50YXRpb24pLFxuICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIG9yaWVudGF0aW9uKSxcbiAgICAgIGN1cnJlbnQsIGJvdW5kcyk7XG4gICAgZWxzZSBpZiAoc2hhcGUub3JpZykgcmV0dXJuIGNpcmNsZShcbiAgICAgIGJydXNoZXNbc2hhcGUuYnJ1c2hdLFxuICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIG9yaWVudGF0aW9uKSxcbiAgICAgIGN1cnJlbnQsIGJvdW5kcyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICBpZiAoIWN0cmwuZGF0YS5ib3VuZHMpIHJldHVybjtcbiAgdmFyIGJvdW5kcyA9IGN0cmwuZGF0YS5ib3VuZHMoKTtcbiAgaWYgKGJvdW5kcy53aWR0aCAhPT0gYm91bmRzLmhlaWdodCkgcmV0dXJuO1xuICB2YXIgZCA9IGN0cmwuZGF0YS5kcmF3YWJsZTtcbiAgdmFyIGFsbFNoYXBlcyA9IGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpO1xuICBpZiAoIWFsbFNoYXBlcy5sZW5ndGggJiYgIWQuY3VycmVudC5vcmlnKSByZXR1cm47XG4gIHZhciB1c2VkQnJ1c2hlcyA9IE9iamVjdC5rZXlzKGN0cmwuZGF0YS5kcmF3YWJsZS5icnVzaGVzKS5maWx0ZXIoZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiAoZC5jdXJyZW50ICYmIGQuY3VycmVudC5kZXN0ICYmIGQuY3VycmVudC5icnVzaCA9PT0gbmFtZSkgfHwgYWxsU2hhcGVzLmZpbHRlcihmdW5jdGlvbihzKSB7XG4gICAgICByZXR1cm4gcy5kZXN0ICYmIHMuYnJ1c2ggPT09IG5hbWU7XG4gICAgfSkubGVuZ3RoO1xuICB9KS5tYXAoZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBjdHJsLmRhdGEuZHJhd2FibGUuYnJ1c2hlc1tuYW1lXTtcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdGFnOiAnc3ZnJyxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgZGVmcyh1c2VkQnJ1c2hlcyksXG4gICAgICBhbGxTaGFwZXMubWFwKHJlbmRlclNoYXBlKGN0cmwuZGF0YS5vcmllbnRhdGlvbiwgZmFsc2UsIGN0cmwuZGF0YS5kcmF3YWJsZS5icnVzaGVzLCBib3VuZHMpKSxcbiAgICAgIHJlbmRlclNoYXBlKGN0cmwuZGF0YS5vcmllbnRhdGlvbiwgdHJ1ZSwgY3RybC5kYXRhLmRyYXdhYmxlLmJydXNoZXMsIGJvdW5kcykoZC5jdXJyZW50KVxuICAgIF1cbiAgfTtcbn1cbiIsInZhciBmaWxlcyA9IFwiYWJjZGVmZ2hcIi5zcGxpdCgnJyk7XG52YXIgcmFua3MgPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOF07XG52YXIgaW52UmFua3MgPSBbOCwgNywgNiwgNSwgNCwgMywgMiwgMV07XG5cbmZ1bmN0aW9uIHBvczJrZXkocG9zKSB7XG4gIHJldHVybiBmaWxlc1twb3NbMF0gLSAxXSArIHBvc1sxXTtcbn1cblxuZnVuY3Rpb24ga2V5MnBvcyhwb3MpIHtcbiAgcmV0dXJuIFsoZmlsZXMuaW5kZXhPZihwb3NbMF0pICsgMSksIHBhcnNlSW50KHBvc1sxXSldO1xufVxuXG5mdW5jdGlvbiBpbnZlcnRLZXkoa2V5KSB7XG4gIHJldHVybiBmaWxlc1s3IC0gZmlsZXMuaW5kZXhPZihrZXlbMF0pXSArICg5IC0gcGFyc2VJbnQoa2V5WzFdKSk7XG59XG5cbnZhciBhbGxQb3MgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBwcyA9IFtdO1xuICBpbnZSYW5rcy5mb3JFYWNoKGZ1bmN0aW9uKHkpIHtcbiAgICByYW5rcy5mb3JFYWNoKGZ1bmN0aW9uKHgpIHtcbiAgICAgIHBzLnB1c2goW3gsIHldKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBwcztcbn0pKCk7XG52YXIgaW52UG9zID0gYWxsUG9zLnNsaWNlKCkucmV2ZXJzZSgpO1xudmFyIGFsbEtleXMgPSBhbGxQb3MubWFwKHBvczJrZXkpO1xuXG5mdW5jdGlvbiBjbGFzc1NldChjbGFzc2VzKSB7XG4gIHZhciBhcnIgPSBbXTtcbiAgZm9yICh2YXIgaSBpbiBjbGFzc2VzKSB7XG4gICAgaWYgKGNsYXNzZXNbaV0pIGFyci5wdXNoKGkpO1xuICB9XG4gIHJldHVybiBhcnIuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiBvcHBvc2l0ZShjb2xvcikge1xuICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyAnYmxhY2snIDogJ3doaXRlJztcbn1cblxuZnVuY3Rpb24gY29udGFpbnMyKHhzLCB4KSB7XG4gIHJldHVybiB4cyAmJiAoeHNbMF0gPT09IHggfHwgeHNbMV0gPT09IHgpO1xufVxuXG5mdW5jdGlvbiBjb250YWluc1goeHMsIHgpIHtcbiAgcmV0dXJuIHhzICYmIHhzLmluZGV4T2YoeCkgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBkaXN0YW5jZShwb3MxLCBwb3MyKSB7XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocG9zMVswXSAtIHBvczJbMF0sIDIpICsgTWF0aC5wb3cocG9zMVsxXSAtIHBvczJbMV0sIDIpKTtcbn1cblxuLy8gdGhpcyBtdXN0IGJlIGNhY2hlZCBiZWNhdXNlIG9mIHRoZSBhY2Nlc3MgdG8gZG9jdW1lbnQuYm9keS5zdHlsZVxudmFyIGNhY2hlZFRyYW5zZm9ybVByb3A7XG5cbmZ1bmN0aW9uIGNvbXB1dGVUcmFuc2Zvcm1Qcm9wKCkge1xuICByZXR1cm4gJ3RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSA/XG4gICAgJ3RyYW5zZm9ybScgOiAnd2Via2l0VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID9cbiAgICAnd2Via2l0VHJhbnNmb3JtJyA6ICdtb3pUcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgP1xuICAgICdtb3pUcmFuc2Zvcm0nIDogJ29UcmFuc2Zvcm0nIGluIGRvY3VtZW50LmJvZHkuc3R5bGUgP1xuICAgICdvVHJhbnNmb3JtJyA6ICdtc1RyYW5zZm9ybSc7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVByb3AoKSB7XG4gIGlmICghY2FjaGVkVHJhbnNmb3JtUHJvcCkgY2FjaGVkVHJhbnNmb3JtUHJvcCA9IGNvbXB1dGVUcmFuc2Zvcm1Qcm9wKCk7XG4gIHJldHVybiBjYWNoZWRUcmFuc2Zvcm1Qcm9wO1xufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGUocG9zKSB7XG4gIHJldHVybiAndHJhbnNsYXRlKCcgKyBwb3NbMF0gKyAncHgsJyArIHBvc1sxXSArICdweCknO1xufVxuXG5mdW5jdGlvbiBldmVudFBvc2l0aW9uKGUpIHtcbiAgcmV0dXJuIGUudG91Y2hlcyA/IFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldIDogW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbn1cblxuZnVuY3Rpb24gcGFydGlhbEFwcGx5KGZuLCBhcmdzKSB7XG4gIHJldHVybiBmbi5iaW5kLmFwcGx5KGZuLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gcGFydGlhbCgpIHtcbiAgcmV0dXJuIHBhcnRpYWxBcHBseShhcmd1bWVudHNbMF0sIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xufVxuXG5mdW5jdGlvbiBpc1JpZ2h0QnV0dG9uKGUpIHtcbiAgcmV0dXJuIGUuYnV0dG9ucyA9PT0gMiB8fCBlLmJ1dHRvbiA9PT0gMjtcbn1cblxuZnVuY3Rpb24gbWVtbyhmKSB7XG4gIHZhciB2LCByZXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB2ID0gZigpO1xuICAgIHJldHVybiB2O1xuICB9O1xuICByZXQuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICB2ID0gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaWxlczogZmlsZXMsXG4gIHJhbmtzOiByYW5rcyxcbiAgaW52UmFua3M6IGludlJhbmtzLFxuICBhbGxQb3M6IGFsbFBvcyxcbiAgaW52UG9zOiBpbnZQb3MsXG4gIGFsbEtleXM6IGFsbEtleXMsXG4gIHBvczJrZXk6IHBvczJrZXksXG4gIGtleTJwb3M6IGtleTJwb3MsXG4gIGludmVydEtleTogaW52ZXJ0S2V5LFxuICBjbGFzc1NldDogY2xhc3NTZXQsXG4gIG9wcG9zaXRlOiBvcHBvc2l0ZSxcbiAgdHJhbnNsYXRlOiB0cmFuc2xhdGUsXG4gIGNvbnRhaW5zMjogY29udGFpbnMyLFxuICBjb250YWluc1g6IGNvbnRhaW5zWCxcbiAgZGlzdGFuY2U6IGRpc3RhbmNlLFxuICBldmVudFBvc2l0aW9uOiBldmVudFBvc2l0aW9uLFxuICBwYXJ0aWFsQXBwbHk6IHBhcnRpYWxBcHBseSxcbiAgcGFydGlhbDogcGFydGlhbCxcbiAgdHJhbnNmb3JtUHJvcDogdHJhbnNmb3JtUHJvcCxcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuc2V0VGltZW91dCkuYmluZCh3aW5kb3cpLFxuICBpc1JpZ2h0QnV0dG9uOiBpc1JpZ2h0QnV0dG9uLFxuICBtZW1vOiBtZW1vXG59O1xuIiwidmFyIGRyYWcgPSByZXF1aXJlKCcuL2RyYWcnKTtcbnZhciBkcmF3ID0gcmVxdWlyZSgnLi9kcmF3Jyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIHN2ZyA9IHJlcXVpcmUoJy4vc3ZnJyk7XG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxuZnVuY3Rpb24gcGllY2VDbGFzcyhwKSB7XG4gIHJldHVybiBwLnJvbGUgKyAnICcgKyBwLmNvbG9yO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQaWVjZShjdHJsLCBrZXksIHApIHtcbiAgdmFyIGF0dHJzID0ge1xuICAgIHN0eWxlOiB7fSxcbiAgICBjbGFzczogcGllY2VDbGFzcyhwKVxuICB9O1xuICB2YXIgZHJhZ2dhYmxlID0gY3RybC5kYXRhLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoZHJhZ2dhYmxlLm9yaWcgPT09IGtleSAmJiBkcmFnZ2FibGUuc3RhcnRlZCkge1xuICAgIGF0dHJzLnN0eWxlW3V0aWwudHJhbnNmb3JtUHJvcCgpXSA9IHV0aWwudHJhbnNsYXRlKFtcbiAgICAgIGRyYWdnYWJsZS5wb3NbMF0gKyBkcmFnZ2FibGUuZGVjWzBdLFxuICAgICAgZHJhZ2dhYmxlLnBvc1sxXSArIGRyYWdnYWJsZS5kZWNbMV1cbiAgICBdKTtcbiAgICBhdHRycy5jbGFzcyArPSAnIGRyYWdnaW5nJztcbiAgfSBlbHNlIGlmIChjdHJsLmRhdGEuYW5pbWF0aW9uLmN1cnJlbnQuYW5pbXMpIHtcbiAgICB2YXIgYW5pbWF0aW9uID0gY3RybC5kYXRhLmFuaW1hdGlvbi5jdXJyZW50LmFuaW1zW2tleV07XG4gICAgaWYgKGFuaW1hdGlvbikgYXR0cnMuc3R5bGVbdXRpbC50cmFuc2Zvcm1Qcm9wKCldID0gdXRpbC50cmFuc2xhdGUoYW5pbWF0aW9uWzFdKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHRhZzogJ3BpZWNlJyxcbiAgICBhdHRyczogYXR0cnNcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyR2hvc3QocCkge1xuICByZXR1cm4ge1xuICAgIHRhZzogJ3BpZWNlJyxcbiAgICBhdHRyczoge1xuICAgICAgY2xhc3M6IHBpZWNlQ2xhc3MocCkgKyAnIGdob3N0J1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyU3F1YXJlKGN0cmwsIHBvcywgYXNXaGl0ZSkge1xuICB2YXIgZmlsZSA9IHV0aWwuZmlsZXNbcG9zWzBdIC0gMV07XG4gIHZhciByYW5rID0gcG9zWzFdO1xuICB2YXIga2V5ID0gZmlsZSArIHJhbms7XG4gIHZhciBwaWVjZSA9IGN0cmwuZGF0YS5waWVjZXNba2V5XTtcbiAgdmFyIGlzRHJhZ092ZXIgPSBjdHJsLmRhdGEuaGlnaGxpZ2h0LmRyYWdPdmVyICYmIGN0cmwuZGF0YS5kcmFnZ2FibGUuY3VycmVudC5vdmVyID09PSBrZXk7XG4gIHZhciBjbGFzc2VzID0gdXRpbC5jbGFzc1NldCh7XG4gICAgJ3NlbGVjdGVkJzogY3RybC5kYXRhLnNlbGVjdGVkID09PSBrZXksXG4gICAgJ2NoZWNrJzogY3RybC5kYXRhLmhpZ2hsaWdodC5jaGVjayAmJiBjdHJsLmRhdGEuY2hlY2sgPT09IGtleSxcbiAgICAnbGFzdC1tb3ZlJzogY3RybC5kYXRhLmhpZ2hsaWdodC5sYXN0TW92ZSAmJiB1dGlsLmNvbnRhaW5zMihjdHJsLmRhdGEubGFzdE1vdmUsIGtleSksXG4gICAgJ21vdmUtZGVzdCc6IChpc0RyYWdPdmVyIHx8IGN0cmwuZGF0YS5tb3ZhYmxlLnNob3dEZXN0cykgJiYgdXRpbC5jb250YWluc1goY3RybC5kYXRhLm1vdmFibGUuZGVzdHNbY3RybC5kYXRhLnNlbGVjdGVkXSwga2V5KSxcbiAgICAncHJlbW92ZS1kZXN0JzogKGlzRHJhZ092ZXIgfHwgY3RybC5kYXRhLnByZW1vdmFibGUuc2hvd0Rlc3RzKSAmJiB1dGlsLmNvbnRhaW5zWChjdHJsLmRhdGEucHJlbW92YWJsZS5kZXN0cywga2V5KSxcbiAgICAnY3VycmVudC1wcmVtb3ZlJzogdXRpbC5jb250YWluczIoY3RybC5kYXRhLnByZW1vdmFibGUuY3VycmVudCwga2V5KSxcbiAgICAnZHJhZy1vdmVyJzogaXNEcmFnT3ZlcixcbiAgICAnb2MnOiAhIXBpZWNlLFxuICAgICdleHBsb2RpbmcnOiBjdHJsLnZtLmV4cGxvZGluZyAmJiBjdHJsLnZtLmV4cGxvZGluZy5pbmRleE9mKGtleSkgIT09IC0xXG4gIH0pO1xuICB2YXIgYXR0cnMgPSB7XG4gICAgc3R5bGU6IHtcbiAgICAgIGxlZnQ6IChhc1doaXRlID8gcG9zWzBdIC0gMSA6IDggLSBwb3NbMF0pICogMTIuNSArICclJyxcbiAgICAgIGJvdHRvbTogKGFzV2hpdGUgPyBwb3NbMV0gLSAxIDogOCAtIHBvc1sxXSkgKiAxMi41ICsgJyUnXG4gICAgfVxuICB9O1xuICBpZiAoY2xhc3NlcykgYXR0cnMuY2xhc3MgPSBjbGFzc2VzO1xuICBpZiAoY3RybC5kYXRhLmNvb3JkaW5hdGVzKSB7XG4gICAgaWYgKHBvc1sxXSA9PT0gKGFzV2hpdGUgPyAxIDogOCkpIGF0dHJzWydkYXRhLWNvb3JkLXgnXSA9IGZpbGU7XG4gICAgaWYgKHBvc1swXSA9PT0gKGFzV2hpdGUgPyA4IDogMSkpIGF0dHJzWydkYXRhLWNvb3JkLXknXSA9IHJhbms7XG4gIH1cbiAgdmFyIGNoaWxkcmVuID0gW107XG4gIGlmIChwaWVjZSkge1xuICAgIGNoaWxkcmVuLnB1c2gocmVuZGVyUGllY2UoY3RybCwga2V5LCBwaWVjZSkpO1xuICAgIGlmIChjdHJsLmRhdGEuZHJhZ2dhYmxlLmN1cnJlbnQub3JpZyA9PT0ga2V5ICYmIGN0cmwuZGF0YS5kcmFnZ2FibGUuc2hvd0dob3N0KSB7XG4gICAgICBjaGlsZHJlbi5wdXNoKHJlbmRlckdob3N0KHBpZWNlKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgdGFnOiAnc3F1YXJlJyxcbiAgICBhdHRyczogYXR0cnMsXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNxdWFyZVRhcmdldChjdHJsLCBjdXIpIHtcbiAgdmFyIHBvcyA9IHV0aWwua2V5MnBvcyhjdXIub3ZlciksXG4gICAgeCA9IGN0cmwuZGF0YS5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyA/IHBvc1swXSA6IDkgLSBwb3NbMF0sXG4gICAgeSA9IGN0cmwuZGF0YS5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyA/IHBvc1sxXSA6IDkgLSBwb3NbMV07XG4gIHJldHVybiB7XG4gICAgdGFnOiAnZGl2JyxcbiAgICBhdHRyczoge1xuICAgICAgaWQ6ICdjZy1zcXVhcmUtdGFyZ2V0JyxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIHdpZHRoOiBjdXIuYm91bmRzLndpZHRoIC8gNCArICdweCcsXG4gICAgICAgIGhlaWdodDogY3VyLmJvdW5kcy5oZWlnaHQgLyA0ICsgJ3B4JyxcbiAgICAgICAgbGVmdDogKHggLSAxLjUpICogY3VyLmJvdW5kcy53aWR0aCAvIDggKyAncHgnLFxuICAgICAgICB0b3A6ICg3LjUgLSB5KSAqIGN1ci5ib3VuZHMuaGVpZ2h0IC8gOCArICdweCdcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckZhZGluZyhjZmcpIHtcbiAgcmV0dXJuIHtcbiAgICB0YWc6ICdzcXVhcmUnLFxuICAgIGF0dHJzOiB7XG4gICAgICBjbGFzczogJ2ZhZGluZycsXG4gICAgICBzdHlsZToge1xuICAgICAgICBsZWZ0OiBjZmcubGVmdCxcbiAgICAgICAgYm90dG9tOiBjZmcuYm90dG9tLFxuICAgICAgICBvcGFjaXR5OiBjZmcub3BhY2l0eVxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IFt7XG4gICAgICB0YWc6ICdwaWVjZScsXG4gICAgICBhdHRyczoge1xuICAgICAgICBjbGFzczogcGllY2VDbGFzcyhjZmcucGllY2UpXG4gICAgICB9XG4gICAgfV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWluaW1hbERvbShjdHJsLCBhc1doaXRlKSB7XG4gIHZhciBjaGlsZHJlbiA9IFtdO1xuICBpZiAoY3RybC5kYXRhLmxhc3RNb3ZlKSBjdHJsLmRhdGEubGFzdE1vdmUuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gICAgY2hpbGRyZW4ucHVzaCh7XG4gICAgICB0YWc6ICdzcXVhcmUnLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgY2xhc3M6ICdsYXN0LW1vdmUnLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGxlZnQ6IChhc1doaXRlID8gcG9zWzBdIC0gMSA6IDggLSBwb3NbMF0pICogMTIuNSArICclJyxcbiAgICAgICAgICBib3R0b206IChhc1doaXRlID8gcG9zWzFdIC0gMSA6IDggLSBwb3NbMV0pICogMTIuNSArICclJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICB2YXIgcGllY2VzS2V5cyA9IE9iamVjdC5rZXlzKGN0cmwuZGF0YS5waWVjZXMpO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGllY2VzS2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBrZXkgPSBwaWVjZXNLZXlzW2ldO1xuICAgIHZhciBwb3MgPSB1dGlsLmtleTJwb3Moa2V5KTtcbiAgICB2YXIgYXR0cnMgPSB7XG4gICAgICBzdHlsZToge1xuICAgICAgICBsZWZ0OiAoYXNXaGl0ZSA/IHBvc1swXSAtIDEgOiA4IC0gcG9zWzBdKSAqIDEyLjUgKyAnJScsXG4gICAgICAgIGJvdHRvbTogKGFzV2hpdGUgPyBwb3NbMV0gLSAxIDogOCAtIHBvc1sxXSkgKiAxMi41ICsgJyUnXG4gICAgICB9LFxuICAgICAgY2xhc3M6IHBpZWNlQ2xhc3MoY3RybC5kYXRhLnBpZWNlc1trZXldKVxuICAgIH07XG4gICAgaWYgKGN0cmwuZGF0YS5hbmltYXRpb24uY3VycmVudC5hbmltcykge1xuICAgICAgdmFyIGFuaW1hdGlvbiA9IGN0cmwuZGF0YS5hbmltYXRpb24uY3VycmVudC5hbmltc1trZXldO1xuICAgICAgaWYgKGFuaW1hdGlvbikgYXR0cnMuc3R5bGVbdXRpbC50cmFuc2Zvcm1Qcm9wKCldID0gdXRpbC50cmFuc2xhdGUoYW5pbWF0aW9uWzFdKTtcbiAgICB9XG4gICAgY2hpbGRyZW4ucHVzaCh7XG4gICAgICB0YWc6ICdwaWVjZScsXG4gICAgICBhdHRyczogYXR0cnNcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZHJlbjtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29udGVudChjdHJsKSB7XG4gIHZhciBhc1doaXRlID0gY3RybC5kYXRhLm9yaWVudGF0aW9uID09PSAnd2hpdGUnO1xuICBpZiAoY3RybC5kYXRhLm1pbmltYWxEb20pIHJldHVybiByZW5kZXJNaW5pbWFsRG9tKGN0cmwsIGFzV2hpdGUpO1xuICB2YXIgcG9zaXRpb25zID0gYXNXaGl0ZSA/IHV0aWwuYWxsUG9zIDogdXRpbC5pbnZQb3M7XG4gIHZhciBjaGlsZHJlbiA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcG9zaXRpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY2hpbGRyZW4ucHVzaChyZW5kZXJTcXVhcmUoY3RybCwgcG9zaXRpb25zW2ldLCBhc1doaXRlKSk7XG4gIH1cbiAgaWYgKGN0cmwuZGF0YS5kcmFnZ2FibGUuY3VycmVudC5vdmVyICYmIGN0cmwuZGF0YS5kcmFnZ2FibGUuc3F1YXJlVGFyZ2V0KVxuICAgIGNoaWxkcmVuLnB1c2gocmVuZGVyU3F1YXJlVGFyZ2V0KGN0cmwsIGN0cmwuZGF0YS5kcmFnZ2FibGUuY3VycmVudCkpO1xuICBpZiAoY3RybC5kYXRhLmFuaW1hdGlvbi5jdXJyZW50LmZhZGluZ3MpXG4gICAgY3RybC5kYXRhLmFuaW1hdGlvbi5jdXJyZW50LmZhZGluZ3MuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICBjaGlsZHJlbi5wdXNoKHJlbmRlckZhZGluZyhwKSk7XG4gICAgfSk7XG4gIGlmIChjdHJsLmRhdGEuZHJhd2FibGUuZW5hYmxlZCkgY2hpbGRyZW4ucHVzaChzdmcoY3RybCkpO1xuICByZXR1cm4gY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIGRyYWdPckRyYXcoZCwgd2l0aERyYWcsIHdpdGhEcmF3KSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHV0aWwuaXNSaWdodEJ1dHRvbihlKSAmJiBkLmRyYWdnYWJsZS5jdXJyZW50Lm9yaWcpIHtcbiAgICAgIGQuZHJhZ2dhYmxlLmN1cnJlbnQgPSB7fVxuICAgICAgZC5zZWxlY3RlZCA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGQuZHJhd2FibGUuZW5hYmxlZCAmJiAoZS5zaGlmdEtleSB8fCB1dGlsLmlzUmlnaHRCdXR0b24oZSkpKSB3aXRoRHJhdyhkLCBlKTtcbiAgICBlbHNlIGlmICghZC52aWV3T25seSkgd2l0aERyYWcoZCwgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoY3RybCwgZWwsIGNvbnRleHQpIHtcbiAgdmFyIGQgPSBjdHJsLmRhdGE7XG4gIHZhciBvbnN0YXJ0ID0gZHJhZ09yRHJhdyhkLCBkcmFnLnN0YXJ0LCBkcmF3LnN0YXJ0KTtcbiAgdmFyIG9ubW92ZSA9IGRyYWdPckRyYXcoZCwgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpO1xuICB2YXIgb25lbmQgPSBkcmFnT3JEcmF3KGQsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG4gIHZhciBkcmF3Q2xlYXIgPSB1dGlsLnBhcnRpYWwoZHJhdy5jbGVhciwgZCk7XG4gIHZhciBzdGFydEV2ZW50cyA9IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXTtcbiAgdmFyIG1vdmVFdmVudHMgPSBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXTtcbiAgdmFyIGVuZEV2ZW50cyA9IFsndG91Y2hlbmQnLCAnbW91c2V1cCddO1xuICBzdGFydEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldiwgb25zdGFydCk7XG4gIH0pO1xuICBtb3ZlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2LCBvbm1vdmUpO1xuICB9KTtcbiAgZW5kRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2LCBvbmVuZCk7XG4gIH0pO1xuICBlbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBkcmF3Q2xlYXIpO1xuICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgc3RhcnRFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldiwgb25zdGFydCk7XG4gICAgfSk7XG4gICAgbW92ZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2LCBvbm1vdmUpO1xuICAgIH0pO1xuICAgIGVuZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2LCBvbmVuZCk7XG4gICAgfSk7XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZHJhd0NsZWFyKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQm9hcmQoY3RybCkge1xuICByZXR1cm4ge1xuICAgIHRhZzogJ2RpdicsXG4gICAgYXR0cnM6IHtcbiAgICAgIGNsYXNzOiAnY2ctYm9hcmQgb3JpZW50YXRpb24tJyArIGN0cmwuZGF0YS5vcmllbnRhdGlvbixcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGlzVXBkYXRlLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChpc1VwZGF0ZSkgcmV0dXJuO1xuICAgICAgICBpZiAoIWN0cmwuZGF0YS52aWV3T25seSB8fCBjdHJsLmRhdGEuZHJhd2FibGUuZW5hYmxlZClcbiAgICAgICAgICBiaW5kRXZlbnRzKGN0cmwsIGVsLCBjb250ZXh0KTtcbiAgICAgICAgLy8gdGhpcyBmdW5jdGlvbiBvbmx5IHJlcGFpbnRzIHRoZSBib2FyZCBpdHNlbGYuXG4gICAgICAgIC8vIGl0J3MgY2FsbGVkIHdoZW4gZHJhZ2dpbmcgb3IgYW5pbWF0aW5nIHBpZWNlcyxcbiAgICAgICAgLy8gdG8gcHJldmVudCB0aGUgZnVsbCBhcHBsaWNhdGlvbiBlbWJlZGRpbmcgY2hlc3Nncm91bmRcbiAgICAgICAgLy8gcmVuZGVyaW5nIG9uIGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZVxuICAgICAgICBjdHJsLmRhdGEucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbS5yZW5kZXIoZWwsIHJlbmRlckNvbnRlbnQoY3RybCkpO1xuICAgICAgICB9O1xuICAgICAgICBjdHJsLmRhdGEucmVuZGVyUkFGID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdXRpbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY3RybC5kYXRhLnJlbmRlcik7XG4gICAgICAgIH07XG4gICAgICAgIGN0cmwuZGF0YS5ib3VuZHMgPSB1dGlsLm1lbW8oZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0LmJpbmQoZWwpKTtcbiAgICAgICAgY3RybC5kYXRhLmVsZW1lbnQgPSBlbDtcbiAgICAgICAgY3RybC5kYXRhLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IFtdXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCkge1xuICByZXR1cm4ge1xuICAgIHRhZzogJ2RpdicsXG4gICAgYXR0cnM6IHtcbiAgICAgIGNvbmZpZzogZnVuY3Rpb24oZWwsIGlzVXBkYXRlKSB7XG4gICAgICAgIGlmIChpc1VwZGF0ZSkgcmV0dXJuO1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoY3RybC5kYXRhLmRpc2FibGVDb250ZXh0TWVudSB8fCBjdHJsLmRhdGEuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjdHJsLmRhdGEucmVzaXphYmxlKVxuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2hlc3Nncm91bmQucmVzaXplJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY3RybC5kYXRhLmJvdW5kcy5jbGVhcigpO1xuICAgICAgICAgICAgY3RybC5kYXRhLnJlbmRlcigpO1xuICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgWydvbnNjcm9sbCcsICdvbnJlc2l6ZSddLmZvckVhY2goZnVuY3Rpb24obikge1xuICAgICAgICAgIHZhciBwcmV2ID0gd2luZG93W25dO1xuICAgICAgICAgIHdpbmRvd1tuXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcHJldiAmJiBwcmV2KCk7XG4gICAgICAgICAgICBjdHJsLmRhdGEuYm91bmRzLmNsZWFyKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgY2xhc3M6IFtcbiAgICAgICAgJ2NnLWJvYXJkLXdyYXAnLFxuICAgICAgICBjdHJsLmRhdGEudmlld09ubHkgPyAndmlldy1vbmx5JyA6ICdtYW5pcHVsYWJsZScsXG4gICAgICAgIGN0cmwuZGF0YS5taW5pbWFsRG9tID8gJ21pbmltYWwtZG9tJyA6ICdmdWxsLWRvbSdcbiAgICAgIF0uam9pbignICcpXG4gICAgfSxcbiAgICBjaGlsZHJlbjogW3JlbmRlckJvYXJkKGN0cmwpXVxuICB9O1xufTtcbiJdfQ==
