
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.23.2 */

    const file = "src/components/Header.svelte";

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let t0;
    	let span;
    	let t2;
    	let h3;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			t0 = text("stealthier ");
    			span = element("span");
    			span.textContent = "(beta)";
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "a vanlife community resource";
    			attr_dev(span, "id", "beta");
    			attr_dev(span, "class", "svelte-1kznwog");
    			add_location(span, file, 1, 19, 28);
    			attr_dev(h1, "class", "svelte-1kznwog");
    			add_location(h1, file, 1, 4, 13);
    			add_location(h3, file, 2, 4, 67);
    			attr_dev(header, "class", "svelte-1kznwog");
    			add_location(header, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(h1, span);
    			append_dev(header, t2);
    			append_dev(header, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    }
    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var tslib_es6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        __extends: __extends,
        get __assign () { return __assign; },
        __rest: __rest,
        __decorate: __decorate,
        __param: __param,
        __metadata: __metadata,
        __awaiter: __awaiter,
        __generator: __generator,
        __createBinding: __createBinding,
        __exportStar: __exportStar,
        __values: __values,
        __read: __read,
        __spread: __spread,
        __spreadArrays: __spreadArrays,
        __await: __await,
        __asyncGenerator: __asyncGenerator,
        __asyncDelegator: __asyncDelegator,
        __asyncValues: __asyncValues,
        __makeTemplateObject: __makeTemplateObject,
        __importStar: __importStar,
        __importDefault: __importDefault,
        __classPrivateFieldGet: __classPrivateFieldGet,
        __classPrivateFieldSet: __classPrivateFieldSet
    });

    var index_cjs = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, '__esModule', { value: true });



    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @fileoverview Firebase constants.  Some of these (@defines) can be overridden at compile-time.
     */
    var CONSTANTS = {
        /**
         * @define {boolean} Whether this is the client Node.js SDK.
         */
        NODE_CLIENT: false,
        /**
         * @define {boolean} Whether this is the Admin Node.js SDK.
         */
        NODE_ADMIN: false,
        /**
         * Firebase SDK Version
         */
        SDK_VERSION: '${JSCORE_VERSION}'
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Throws an error if the provided assertion is falsy
     */
    var assert = function (assertion, message) {
        if (!assertion) {
            throw assertionError(message);
        }
    };
    /**
     * Returns an Error object suitable for throwing.
     */
    var assertionError = function (message) {
        return new Error('Firebase Database (' +
            CONSTANTS.SDK_VERSION +
            ') INTERNAL ASSERT FAILED: ' +
            message);
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var stringToByteArray = function (str) {
        // TODO(user): Use native implementations if/when available
        var out = [];
        var p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if ((c & 0xfc00) === 0xd800 &&
                i + 1 < str.length &&
                (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };
    /**
     * Turns an array of numbers into the string given by the concatenation of the
     * characters to which the numbers correspond.
     * @param bytes Array of numbers representing characters.
     * @return Stringification of the array.
     */
    var byteArrayToString = function (bytes) {
        // TODO(user): Use native implementations if/when available
        var out = [];
        var pos = 0, c = 0;
        while (pos < bytes.length) {
            var c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            }
            else if (c1 > 191 && c1 < 224) {
                var c2 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            }
            else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                var c4 = bytes[pos++];
                var u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                    0x10000;
                out[c++] = String.fromCharCode(0xd800 + (u >> 10));
                out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
            }
            else {
                var c2 = bytes[pos++];
                var c3 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return out.join('');
    };
    // We define it as an object literal instead of a class because a class compiled down to es5 can't
    // be treeshaked. https://github.com/rollup/rollup/issues/1691
    // Static lookup maps, lazily populated by init_()
    var base64 = {
        /**
         * Maps bytes to characters.
         */
        byteToCharMap_: null,
        /**
         * Maps characters to bytes.
         */
        charToByteMap_: null,
        /**
         * Maps bytes to websafe characters.
         * @private
         */
        byteToCharMapWebSafe_: null,
        /**
         * Maps websafe characters to bytes.
         * @private
         */
        charToByteMapWebSafe_: null,
        /**
         * Our default alphabet, shared between
         * ENCODED_VALS and ENCODED_VALS_WEBSAFE
         */
        ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
        /**
         * Our default alphabet. Value 64 (=) is special; it means "nothing."
         */
        get ENCODED_VALS() {
            return this.ENCODED_VALS_BASE + '+/=';
        },
        /**
         * Our websafe alphabet.
         */
        get ENCODED_VALS_WEBSAFE() {
            return this.ENCODED_VALS_BASE + '-_.';
        },
        /**
         * Whether this browser supports the atob and btoa functions. This extension
         * started at Mozilla but is now implemented by many browsers. We use the
         * ASSUME_* variables to avoid pulling in the full useragent detection library
         * but still allowing the standard per-browser compilations.
         *
         */
        HAS_NATIVE_SUPPORT: typeof atob === 'function',
        /**
         * Base64-encode an array of bytes.
         *
         * @param input An array of bytes (numbers with
         *     value in [0, 255]) to encode.
         * @param webSafe Boolean indicating we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeByteArray: function (input, webSafe) {
            if (!Array.isArray(input)) {
                throw Error('encodeByteArray takes an array as a parameter');
            }
            this.init_();
            var byteToCharMap = webSafe
                ? this.byteToCharMapWebSafe_
                : this.byteToCharMap_;
            var output = [];
            for (var i = 0; i < input.length; i += 3) {
                var byte1 = input[i];
                var haveByte2 = i + 1 < input.length;
                var byte2 = haveByte2 ? input[i + 1] : 0;
                var haveByte3 = i + 2 < input.length;
                var byte3 = haveByte3 ? input[i + 2] : 0;
                var outByte1 = byte1 >> 2;
                var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
                var outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
                var outByte4 = byte3 & 0x3f;
                if (!haveByte3) {
                    outByte4 = 64;
                    if (!haveByte2) {
                        outByte3 = 64;
                    }
                }
                output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join('');
        },
        /**
         * Base64-encode a string.
         *
         * @param input A string to encode.
         * @param webSafe If true, we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeString: function (input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return btoa(input);
            }
            return this.encodeByteArray(stringToByteArray(input), webSafe);
        },
        /**
         * Base64-decode a string.
         *
         * @param input to decode.
         * @param webSafe True if we should use the
         *     alternative alphabet.
         * @return string representing the decoded value.
         */
        decodeString: function (input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return atob(input);
            }
            return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
        },
        /**
         * Base64-decode a string.
         *
         * In base-64 decoding, groups of four characters are converted into three
         * bytes.  If the encoder did not apply padding, the input length may not
         * be a multiple of 4.
         *
         * In this case, the last group will have fewer than 4 characters, and
         * padding will be inferred.  If the group has one or two characters, it decodes
         * to one byte.  If the group has three characters, it decodes to two bytes.
         *
         * @param input Input to decode.
         * @param webSafe True if we should use the web-safe alphabet.
         * @return bytes representing the decoded value.
         */
        decodeStringToByteArray: function (input, webSafe) {
            this.init_();
            var charToByteMap = webSafe
                ? this.charToByteMapWebSafe_
                : this.charToByteMap_;
            var output = [];
            for (var i = 0; i < input.length;) {
                var byte1 = charToByteMap[input.charAt(i++)];
                var haveByte2 = i < input.length;
                var byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
                ++i;
                var haveByte3 = i < input.length;
                var byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                var haveByte4 = i < input.length;
                var byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                    throw Error();
                }
                var outByte1 = (byte1 << 2) | (byte2 >> 4);
                output.push(outByte1);
                if (byte3 !== 64) {
                    var outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                    output.push(outByte2);
                    if (byte4 !== 64) {
                        var outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                        output.push(outByte3);
                    }
                }
            }
            return output;
        },
        /**
         * Lazy static initialization function. Called before
         * accessing any of the static map variables.
         * @private
         */
        init_: function () {
            if (!this.byteToCharMap_) {
                this.byteToCharMap_ = {};
                this.charToByteMap_ = {};
                this.byteToCharMapWebSafe_ = {};
                this.charToByteMapWebSafe_ = {};
                // We want quick mappings back and forth, so we precompute two maps.
                for (var i = 0; i < this.ENCODED_VALS.length; i++) {
                    this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                    this.charToByteMap_[this.byteToCharMap_[i]] = i;
                    this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                    this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                    // Be forgiving when decoding and correctly decode both encodings.
                    if (i >= this.ENCODED_VALS_BASE.length) {
                        this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                        this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                    }
                }
            }
        }
    };
    /**
     * URL-safe base64 encoding
     */
    var base64Encode = function (str) {
        var utf8Bytes = stringToByteArray(str);
        return base64.encodeByteArray(utf8Bytes, true);
    };
    /**
     * URL-safe base64 decoding
     *
     * NOTE: DO NOT use the global atob() function - it does NOT support the
     * base64Url variant encoding.
     *
     * @param str To be decoded
     * @return Decoded result, if possible
     */
    var base64Decode = function (str) {
        try {
            return base64.decodeString(str, true);
        }
        catch (e) {
            console.error('base64Decode failed: ', e);
        }
        return null;
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Do a deep-copy of basic JavaScript Objects or Arrays.
     */
    function deepCopy(value) {
        return deepExtend(undefined, value);
    }
    /**
     * Copy properties from source to target (recursively allows extension
     * of Objects and Arrays).  Scalar values in the target are over-written.
     * If target is undefined, an object of the appropriate type will be created
     * (and returned).
     *
     * We recursively copy all child properties of plain Objects in the source- so
     * that namespace- like dictionaries are merged.
     *
     * Note that the target can be a function, in which case the properties in
     * the source Object are copied onto it as static properties of the Function.
     */
    function deepExtend(target, source) {
        if (!(source instanceof Object)) {
            return source;
        }
        switch (source.constructor) {
            case Date:
                // Treat Dates like scalars; if the target date object had any child
                // properties - they will be lost!
                var dateValue = source;
                return new Date(dateValue.getTime());
            case Object:
                if (target === undefined) {
                    target = {};
                }
                break;
            case Array:
                // Always copy the array source and overwrite the target.
                target = [];
                break;
            default:
                // Not a plain Object - treat it as a scalar.
                return source;
        }
        for (var prop in source) {
            if (!source.hasOwnProperty(prop)) {
                continue;
            }
            target[prop] = deepExtend(target[prop], source[prop]);
        }
        return target;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var Deferred = /** @class */ (function () {
        function Deferred() {
            var _this = this;
            this.reject = function () { };
            this.resolve = function () { };
            this.promise = new Promise(function (resolve, reject) {
                _this.resolve = resolve;
                _this.reject = reject;
            });
        }
        /**
         * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
         * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
         * and returns a node-style callback which will resolve or reject the Deferred's promise.
         */
        Deferred.prototype.wrapCallback = function (callback) {
            var _this = this;
            return function (error, value) {
                if (error) {
                    _this.reject(error);
                }
                else {
                    _this.resolve(value);
                }
                if (typeof callback === 'function') {
                    // Attaching noop handler just in case developer wasn't expecting
                    // promises
                    _this.promise.catch(function () { });
                    // Some of our callbacks don't expect a value and our own tests
                    // assert that the parameter length is 1
                    if (callback.length === 1) {
                        callback(error);
                    }
                    else {
                        callback(error, value);
                    }
                }
            };
        };
        return Deferred;
    }());

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns navigator.userAgent string or '' if it's not defined.
     * @return user agent string
     */
    function getUA() {
        if (typeof navigator !== 'undefined' &&
            typeof navigator['userAgent'] === 'string') {
            return navigator['userAgent'];
        }
        else {
            return '';
        }
    }
    /**
     * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
     *
     * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
     * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
     * wait for a callback.
     */
    function isMobileCordova() {
        return (typeof window !== 'undefined' &&
            // @ts-ignore Setting up an broadly applicable index signature for Window
            // just to deal with this case would probably be a bad idea.
            !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
            /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
    }
    /**
     * Detect Node.js.
     *
     * @return true if Node.js environment is detected.
     */
    // Node detection logic from: https://github.com/iliakan/detect-node/
    function isNode() {
        try {
            return (Object.prototype.toString.call(commonjsGlobal.process) === '[object process]');
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Detect Browser Environment
     */
    function isBrowser() {
        return typeof self === 'object' && self.self === self;
    }
    function isBrowserExtension() {
        var runtime = typeof chrome === 'object'
            ? chrome.runtime
            : typeof browser === 'object'
                ? browser.runtime
                : undefined;
        return typeof runtime === 'object' && runtime.id !== undefined;
    }
    /**
     * Detect React Native.
     *
     * @return true if ReactNative environment is detected.
     */
    function isReactNative() {
        return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
    }
    /** Detects Electron apps. */
    function isElectron() {
        return getUA().indexOf('Electron/') >= 0;
    }
    /** Detects Internet Explorer. */
    function isIE() {
        var ua = getUA();
        return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
    }
    /** Detects Universal Windows Platform apps. */
    function isUWP() {
        return getUA().indexOf('MSAppHost/') >= 0;
    }
    /**
     * Detect whether the current SDK build is the Node version.
     *
     * @return true if it's the Node SDK build.
     */
    function isNodeSdk() {
        return CONSTANTS.NODE_CLIENT === true || CONSTANTS.NODE_ADMIN === true;
    }
    /** Returns true if we are running in Safari. */
    function isSafari() {
        return (!isNode() &&
            navigator.userAgent.includes('Safari') &&
            !navigator.userAgent.includes('Chrome'));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var ERROR_NAME = 'FirebaseError';
    // Based on code from:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
    var FirebaseError = /** @class */ (function (_super) {
        tslib_es6.__extends(FirebaseError, _super);
        function FirebaseError(code, message) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            _this.name = ERROR_NAME;
            // Fix For ES5
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(_this, FirebaseError.prototype);
            // Maintains proper stack trace for where our error was thrown.
            // Only available on V8.
            if (Error.captureStackTrace) {
                Error.captureStackTrace(_this, ErrorFactory.prototype.create);
            }
            return _this;
        }
        return FirebaseError;
    }(Error));
    var ErrorFactory = /** @class */ (function () {
        function ErrorFactory(service, serviceName, errors) {
            this.service = service;
            this.serviceName = serviceName;
            this.errors = errors;
        }
        ErrorFactory.prototype.create = function (code) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            var customData = data[0] || {};
            var fullCode = this.service + "/" + code;
            var template = this.errors[code];
            var message = template ? replaceTemplate(template, customData) : 'Error';
            // Service Name: Error message (service/code).
            var fullMessage = this.serviceName + ": " + message + " (" + fullCode + ").";
            var error = new FirebaseError(fullCode, fullMessage);
            // Keys with an underscore at the end of their name are not included in
            // error.data for some reason.
            // TODO: Replace with Object.entries when lib is updated to es2017.
            for (var _a = 0, _b = Object.keys(customData); _a < _b.length; _a++) {
                var key = _b[_a];
                if (key.slice(-1) !== '_') {
                    if (key in error) {
                        console.warn("Overwriting FirebaseError base field \"" + key + "\" can cause unexpected behavior.");
                    }
                    error[key] = customData[key];
                }
            }
            return error;
        };
        return ErrorFactory;
    }());
    function replaceTemplate(template, data) {
        return template.replace(PATTERN, function (_, key) {
            var value = data[key];
            return value != null ? value.toString() : "<" + key + "?>";
        });
    }
    var PATTERN = /\{\$([^}]+)}/g;

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Evaluates a JSON string into a javascript object.
     *
     * @param {string} str A string containing JSON.
     * @return {*} The javascript object representing the specified JSON.
     */
    function jsonEval(str) {
        return JSON.parse(str);
    }
    /**
     * Returns JSON representing a javascript object.
     * @param {*} data Javascript object to be stringified.
     * @return {string} The JSON contents of the object.
     */
    function stringify(data) {
        return JSON.stringify(data);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Decodes a Firebase auth. token into constituent parts.
     *
     * Notes:
     * - May return with invalid / incomplete claims if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    var decode = function (token) {
        var header = {}, claims = {}, data = {}, signature = '';
        try {
            var parts = token.split('.');
            header = jsonEval(base64Decode(parts[0]) || '');
            claims = jsonEval(base64Decode(parts[1]) || '');
            signature = parts[2];
            data = claims['d'] || {};
            delete claims['d'];
        }
        catch (e) { }
        return {
            header: header,
            claims: claims,
            data: data,
            signature: signature
        };
    };
    /**
     * Decodes a Firebase auth. token and checks the validity of its time-based claims. Will return true if the
     * token is within the time window authorized by the 'nbf' (not-before) and 'iat' (issued-at) claims.
     *
     * Notes:
     * - May return a false negative if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    var isValidTimestamp = function (token) {
        var claims = decode(token).claims;
        var now = Math.floor(new Date().getTime() / 1000);
        var validSince = 0, validUntil = 0;
        if (typeof claims === 'object') {
            if (claims.hasOwnProperty('nbf')) {
                validSince = claims['nbf'];
            }
            else if (claims.hasOwnProperty('iat')) {
                validSince = claims['iat'];
            }
            if (claims.hasOwnProperty('exp')) {
                validUntil = claims['exp'];
            }
            else {
                // token will expire after 24h by default
                validUntil = validSince + 86400;
            }
        }
        return (!!now &&
            !!validSince &&
            !!validUntil &&
            now >= validSince &&
            now <= validUntil);
    };
    /**
     * Decodes a Firebase auth. token and returns its issued at time if valid, null otherwise.
     *
     * Notes:
     * - May return null if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    var issuedAtTime = function (token) {
        var claims = decode(token).claims;
        if (typeof claims === 'object' && claims.hasOwnProperty('iat')) {
            return claims['iat'];
        }
        return null;
    };
    /**
     * Decodes a Firebase auth. token and checks the validity of its format. Expects a valid issued-at time.
     *
     * Notes:
     * - May return a false negative if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    var isValidFormat = function (token) {
        var decoded = decode(token), claims = decoded.claims;
        return !!claims && typeof claims === 'object' && claims.hasOwnProperty('iat');
    };
    /**
     * Attempts to peer into an auth token and determine if it's an admin auth token by looking at the claims portion.
     *
     * Notes:
     * - May return a false negative if there's no native base64 decoding support.
     * - Doesn't check if the token is actually valid.
     */
    var isAdmin = function (token) {
        var claims = decode(token).claims;
        return typeof claims === 'object' && claims['admin'] === true;
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function contains(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
    function safeGet(obj, key) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return obj[key];
        }
        else {
            return undefined;
        }
    }
    function isEmpty(obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    function map(obj, fn, contextObj) {
        var res = {};
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res[key] = fn.call(contextObj, obj[key], key, obj);
            }
        }
        return res;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
     * params object (e.g. {arg: 'val', arg2: 'val2'})
     * Note: You must prepend it with ? when adding it to a URL.
     */
    function querystring(querystringParams) {
        var params = [];
        var _loop_1 = function (key, value) {
            if (Array.isArray(value)) {
                value.forEach(function (arrayVal) {
                    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(arrayVal));
                });
            }
            else {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        };
        for (var _i = 0, _a = Object.entries(querystringParams); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            _loop_1(key, value);
        }
        return params.length ? '&' + params.join('&') : '';
    }
    /**
     * Decodes a querystring (e.g. ?arg=val&arg2=val2) into a params object
     * (e.g. {arg: 'val', arg2: 'val2'})
     */
    function querystringDecode(querystring) {
        var obj = {};
        var tokens = querystring.replace(/^\?/, '').split('&');
        tokens.forEach(function (token) {
            if (token) {
                var key = token.split('=');
                obj[key[0]] = key[1];
            }
        });
        return obj;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @fileoverview SHA-1 cryptographic hash.
     * Variable names follow the notation in FIPS PUB 180-3:
     * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
     *
     * Usage:
     *   var sha1 = new sha1();
     *   sha1.update(bytes);
     *   var hash = sha1.digest();
     *
     * Performance:
     *   Chrome 23:   ~400 Mbit/s
     *   Firefox 16:  ~250 Mbit/s
     *
     */
    /**
     * SHA-1 cryptographic hash constructor.
     *
     * The properties declared here are discussed in the above algorithm document.
     * @constructor
     * @final
     * @struct
     */
    var Sha1 = /** @class */ (function () {
        function Sha1() {
            /**
             * Holds the previous values of accumulated variables a-e in the compress_
             * function.
             * @private
             */
            this.chain_ = [];
            /**
             * A buffer holding the partially computed hash result.
             * @private
             */
            this.buf_ = [];
            /**
             * An array of 80 bytes, each a part of the message to be hashed.  Referred to
             * as the message schedule in the docs.
             * @private
             */
            this.W_ = [];
            /**
             * Contains data needed to pad messages less than 64 bytes.
             * @private
             */
            this.pad_ = [];
            /**
             * @private {number}
             */
            this.inbuf_ = 0;
            /**
             * @private {number}
             */
            this.total_ = 0;
            this.blockSize = 512 / 8;
            this.pad_[0] = 128;
            for (var i = 1; i < this.blockSize; ++i) {
                this.pad_[i] = 0;
            }
            this.reset();
        }
        Sha1.prototype.reset = function () {
            this.chain_[0] = 0x67452301;
            this.chain_[1] = 0xefcdab89;
            this.chain_[2] = 0x98badcfe;
            this.chain_[3] = 0x10325476;
            this.chain_[4] = 0xc3d2e1f0;
            this.inbuf_ = 0;
            this.total_ = 0;
        };
        /**
         * Internal compress helper function.
         * @param buf Block to compress.
         * @param offset Offset of the block in the buffer.
         * @private
         */
        Sha1.prototype.compress_ = function (buf, offset) {
            if (!offset) {
                offset = 0;
            }
            var W = this.W_;
            // get 16 big endian words
            if (typeof buf === 'string') {
                for (var i = 0; i < 16; i++) {
                    // TODO(user): [bug 8140122] Recent versions of Safari for Mac OS and iOS
                    // have a bug that turns the post-increment ++ operator into pre-increment
                    // during JIT compilation.  We have code that depends heavily on SHA-1 for
                    // correctness and which is affected by this bug, so I've removed all uses
                    // of post-increment ++ in which the result value is used.  We can revert
                    // this change once the Safari bug
                    // (https://bugs.webkit.org/show_bug.cgi?id=109036) has been fixed and
                    // most clients have been updated.
                    W[i] =
                        (buf.charCodeAt(offset) << 24) |
                            (buf.charCodeAt(offset + 1) << 16) |
                            (buf.charCodeAt(offset + 2) << 8) |
                            buf.charCodeAt(offset + 3);
                    offset += 4;
                }
            }
            else {
                for (var i = 0; i < 16; i++) {
                    W[i] =
                        (buf[offset] << 24) |
                            (buf[offset + 1] << 16) |
                            (buf[offset + 2] << 8) |
                            buf[offset + 3];
                    offset += 4;
                }
            }
            // expand to 80 words
            for (var i = 16; i < 80; i++) {
                var t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = ((t << 1) | (t >>> 31)) & 0xffffffff;
            }
            var a = this.chain_[0];
            var b = this.chain_[1];
            var c = this.chain_[2];
            var d = this.chain_[3];
            var e = this.chain_[4];
            var f, k;
            // TODO(user): Try to unroll this loop to speed up the computation.
            for (var i = 0; i < 80; i++) {
                if (i < 40) {
                    if (i < 20) {
                        f = d ^ (b & (c ^ d));
                        k = 0x5a827999;
                    }
                    else {
                        f = b ^ c ^ d;
                        k = 0x6ed9eba1;
                    }
                }
                else {
                    if (i < 60) {
                        f = (b & c) | (d & (b | c));
                        k = 0x8f1bbcdc;
                    }
                    else {
                        f = b ^ c ^ d;
                        k = 0xca62c1d6;
                    }
                }
                var t = (((a << 5) | (a >>> 27)) + f + e + k + W[i]) & 0xffffffff;
                e = d;
                d = c;
                c = ((b << 30) | (b >>> 2)) & 0xffffffff;
                b = a;
                a = t;
            }
            this.chain_[0] = (this.chain_[0] + a) & 0xffffffff;
            this.chain_[1] = (this.chain_[1] + b) & 0xffffffff;
            this.chain_[2] = (this.chain_[2] + c) & 0xffffffff;
            this.chain_[3] = (this.chain_[3] + d) & 0xffffffff;
            this.chain_[4] = (this.chain_[4] + e) & 0xffffffff;
        };
        Sha1.prototype.update = function (bytes, length) {
            // TODO(johnlenz): tighten the function signature and remove this check
            if (bytes == null) {
                return;
            }
            if (length === undefined) {
                length = bytes.length;
            }
            var lengthMinusBlock = length - this.blockSize;
            var n = 0;
            // Using local instead of member variables gives ~5% speedup on Firefox 16.
            var buf = this.buf_;
            var inbuf = this.inbuf_;
            // The outer while loop should execute at most twice.
            while (n < length) {
                // When we have no data in the block to top up, we can directly process the
                // input buffer (assuming it contains sufficient data). This gives ~25%
                // speedup on Chrome 23 and ~15% speedup on Firefox 16, but requires that
                // the data is provided in large chunks (or in multiples of 64 bytes).
                if (inbuf === 0) {
                    while (n <= lengthMinusBlock) {
                        this.compress_(bytes, n);
                        n += this.blockSize;
                    }
                }
                if (typeof bytes === 'string') {
                    while (n < length) {
                        buf[inbuf] = bytes.charCodeAt(n);
                        ++inbuf;
                        ++n;
                        if (inbuf === this.blockSize) {
                            this.compress_(buf);
                            inbuf = 0;
                            // Jump to the outer loop so we use the full-block optimization.
                            break;
                        }
                    }
                }
                else {
                    while (n < length) {
                        buf[inbuf] = bytes[n];
                        ++inbuf;
                        ++n;
                        if (inbuf === this.blockSize) {
                            this.compress_(buf);
                            inbuf = 0;
                            // Jump to the outer loop so we use the full-block optimization.
                            break;
                        }
                    }
                }
            }
            this.inbuf_ = inbuf;
            this.total_ += length;
        };
        /** @override */
        Sha1.prototype.digest = function () {
            var digest = [];
            var totalBits = this.total_ * 8;
            // Add pad 0x80 0x00*.
            if (this.inbuf_ < 56) {
                this.update(this.pad_, 56 - this.inbuf_);
            }
            else {
                this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
            }
            // Add # bits.
            for (var i = this.blockSize - 1; i >= 56; i--) {
                this.buf_[i] = totalBits & 255;
                totalBits /= 256; // Don't use bit-shifting here!
            }
            this.compress_(this.buf_);
            var n = 0;
            for (var i = 0; i < 5; i++) {
                for (var j = 24; j >= 0; j -= 8) {
                    digest[n] = (this.chain_[i] >> j) & 255;
                    ++n;
                }
            }
            return digest;
        };
        return Sha1;
    }());

    /**
     * Helper to make a Subscribe function (just like Promise helps make a
     * Thenable).
     *
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function createSubscribe(executor, onNoObservers) {
        var proxy = new ObserverProxy(executor, onNoObservers);
        return proxy.subscribe.bind(proxy);
    }
    /**
     * Implement fan-out for any number of Observers attached via a subscribe
     * function.
     */
    var ObserverProxy = /** @class */ (function () {
        /**
         * @param executor Function which can make calls to a single Observer
         *     as a proxy.
         * @param onNoObservers Callback when count of Observers goes to zero.
         */
        function ObserverProxy(executor, onNoObservers) {
            var _this = this;
            this.observers = [];
            this.unsubscribes = [];
            this.observerCount = 0;
            // Micro-task scheduling by calling task.then().
            this.task = Promise.resolve();
            this.finalized = false;
            this.onNoObservers = onNoObservers;
            // Call the executor asynchronously so subscribers that are called
            // synchronously after the creation of the subscribe function
            // can still receive the very first value generated in the executor.
            this.task
                .then(function () {
                executor(_this);
            })
                .catch(function (e) {
                _this.error(e);
            });
        }
        ObserverProxy.prototype.next = function (value) {
            this.forEachObserver(function (observer) {
                observer.next(value);
            });
        };
        ObserverProxy.prototype.error = function (error) {
            this.forEachObserver(function (observer) {
                observer.error(error);
            });
            this.close(error);
        };
        ObserverProxy.prototype.complete = function () {
            this.forEachObserver(function (observer) {
                observer.complete();
            });
            this.close();
        };
        /**
         * Subscribe function that can be used to add an Observer to the fan-out list.
         *
         * - We require that no event is sent to a subscriber sychronously to their
         *   call to subscribe().
         */
        ObserverProxy.prototype.subscribe = function (nextOrObserver, error, complete) {
            var _this = this;
            var observer;
            if (nextOrObserver === undefined &&
                error === undefined &&
                complete === undefined) {
                throw new Error('Missing Observer.');
            }
            // Assemble an Observer object when passed as callback functions.
            if (implementsAnyMethods(nextOrObserver, [
                'next',
                'error',
                'complete'
            ])) {
                observer = nextOrObserver;
            }
            else {
                observer = {
                    next: nextOrObserver,
                    error: error,
                    complete: complete
                };
            }
            if (observer.next === undefined) {
                observer.next = noop;
            }
            if (observer.error === undefined) {
                observer.error = noop;
            }
            if (observer.complete === undefined) {
                observer.complete = noop;
            }
            var unsub = this.unsubscribeOne.bind(this, this.observers.length);
            // Attempt to subscribe to a terminated Observable - we
            // just respond to the Observer with the final error or complete
            // event.
            if (this.finalized) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.task.then(function () {
                    try {
                        if (_this.finalError) {
                            observer.error(_this.finalError);
                        }
                        else {
                            observer.complete();
                        }
                    }
                    catch (e) {
                        // nothing
                    }
                    return;
                });
            }
            this.observers.push(observer);
            return unsub;
        };
        // Unsubscribe is synchronous - we guarantee that no events are sent to
        // any unsubscribed Observer.
        ObserverProxy.prototype.unsubscribeOne = function (i) {
            if (this.observers === undefined || this.observers[i] === undefined) {
                return;
            }
            delete this.observers[i];
            this.observerCount -= 1;
            if (this.observerCount === 0 && this.onNoObservers !== undefined) {
                this.onNoObservers(this);
            }
        };
        ObserverProxy.prototype.forEachObserver = function (fn) {
            if (this.finalized) {
                // Already closed by previous event....just eat the additional values.
                return;
            }
            // Since sendOne calls asynchronously - there is no chance that
            // this.observers will become undefined.
            for (var i = 0; i < this.observers.length; i++) {
                this.sendOne(i, fn);
            }
        };
        // Call the Observer via one of it's callback function. We are careful to
        // confirm that the observe has not been unsubscribed since this asynchronous
        // function had been queued.
        ObserverProxy.prototype.sendOne = function (i, fn) {
            var _this = this;
            // Execute the callback asynchronously
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(function () {
                if (_this.observers !== undefined && _this.observers[i] !== undefined) {
                    try {
                        fn(_this.observers[i]);
                    }
                    catch (e) {
                        // Ignore exceptions raised in Observers or missing methods of an
                        // Observer.
                        // Log error to console. b/31404806
                        if (typeof console !== 'undefined' && console.error) {
                            console.error(e);
                        }
                    }
                }
            });
        };
        ObserverProxy.prototype.close = function (err) {
            var _this = this;
            if (this.finalized) {
                return;
            }
            this.finalized = true;
            if (err !== undefined) {
                this.finalError = err;
            }
            // Proxy is no longer needed - garbage collect references
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(function () {
                _this.observers = undefined;
                _this.onNoObservers = undefined;
            });
        };
        return ObserverProxy;
    }());
    /** Turn synchronous function into one called asynchronously. */
    function async(fn, onError) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            Promise.resolve(true)
                .then(function () {
                fn.apply(void 0, args);
            })
                .catch(function (error) {
                if (onError) {
                    onError(error);
                }
            });
        };
    }
    /**
     * Return true if the object passed in implements any of the named methods.
     */
    function implementsAnyMethods(obj, methods) {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
            var method = methods_1[_i];
            if (method in obj && typeof obj[method] === 'function') {
                return true;
            }
        }
        return false;
    }
    function noop() {
        // do nothing
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Check to make sure the appropriate number of arguments are provided for a public function.
     * Throws an error if it fails.
     *
     * @param fnName The function name
     * @param minCount The minimum number of arguments to allow for the function call
     * @param maxCount The maximum number of argument to allow for the function call
     * @param argCount The actual number of arguments provided.
     */
    var validateArgCount = function (fnName, minCount, maxCount, argCount) {
        var argError;
        if (argCount < minCount) {
            argError = 'at least ' + minCount;
        }
        else if (argCount > maxCount) {
            argError = maxCount === 0 ? 'none' : 'no more than ' + maxCount;
        }
        if (argError) {
            var error = fnName +
                ' failed: Was called with ' +
                argCount +
                (argCount === 1 ? ' argument.' : ' arguments.') +
                ' Expects ' +
                argError +
                '.';
            throw new Error(error);
        }
    };
    /**
     * Generates a string to prefix an error message about failed argument validation
     *
     * @param fnName The function name
     * @param argumentNumber The index of the argument
     * @param optional Whether or not the argument is optional
     * @return The prefix to add to the error thrown for validation.
     */
    function errorPrefix(fnName, argumentNumber, optional) {
        var argName = '';
        switch (argumentNumber) {
            case 1:
                argName = optional ? 'first' : 'First';
                break;
            case 2:
                argName = optional ? 'second' : 'Second';
                break;
            case 3:
                argName = optional ? 'third' : 'Third';
                break;
            case 4:
                argName = optional ? 'fourth' : 'Fourth';
                break;
            default:
                throw new Error('errorPrefix called with argumentNumber > 4.  Need to update it?');
        }
        var error = fnName + ' failed: ';
        error += argName + ' argument ';
        return error;
    }
    /**
     * @param fnName
     * @param argumentNumber
     * @param namespace
     * @param optional
     */
    function validateNamespace(fnName, argumentNumber, namespace, optional) {
        if (optional && !namespace) {
            return;
        }
        if (typeof namespace !== 'string') {
            //TODO: I should do more validation here. We only allow certain chars in namespaces.
            throw new Error(errorPrefix(fnName, argumentNumber, optional) +
                'must be a valid firebase namespace.');
        }
    }
    function validateCallback(fnName, argumentNumber, callback, optional) {
        if (optional && !callback) {
            return;
        }
        if (typeof callback !== 'function') {
            throw new Error(errorPrefix(fnName, argumentNumber, optional) +
                'must be a valid function.');
        }
    }
    function validateContextObject(fnName, argumentNumber, context, optional) {
        if (optional && !context) {
            return;
        }
        if (typeof context !== 'object' || context === null) {
            throw new Error(errorPrefix(fnName, argumentNumber, optional) +
                'must be a valid context object.');
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Code originally came from goog.crypt.stringToUtf8ByteArray, but for some reason they
    // automatically replaced '\r\n' with '\n', and they didn't handle surrogate pairs,
    // so it's been modified.
    // Note that not all Unicode characters appear as single characters in JavaScript strings.
    // fromCharCode returns the UTF-16 encoding of a character - so some Unicode characters
    // use 2 characters in Javascript.  All 4-byte UTF-8 characters begin with a first
    // character in the range 0xD800 - 0xDBFF (the first character of a so-called surrogate
    // pair).
    // See http://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3
    /**
     * @param {string} str
     * @return {Array}
     */
    var stringToByteArray$1 = function (str) {
        var out = [];
        var p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            // Is this the lead surrogate in a surrogate pair?
            if (c >= 0xd800 && c <= 0xdbff) {
                var high = c - 0xd800; // the high 10 bits.
                i++;
                assert(i < str.length, 'Surrogate pair missing trail surrogate.');
                var low = str.charCodeAt(i) - 0xdc00; // the low 10 bits.
                c = 0x10000 + (high << 10) + low;
            }
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if (c < 65536) {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };
    /**
     * Calculate length without actually converting; useful for doing cheaper validation.
     * @param {string} str
     * @return {number}
     */
    var stringLength = function (str) {
        var p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 128) {
                p++;
            }
            else if (c < 2048) {
                p += 2;
            }
            else if (c >= 0xd800 && c <= 0xdbff) {
                // Lead surrogate of a surrogate pair.  The pair together will take 4 bytes to represent.
                p += 4;
                i++; // skip trail surrogate.
            }
            else {
                p += 3;
            }
        }
        return p;
    };

    exports.CONSTANTS = CONSTANTS;
    exports.Deferred = Deferred;
    exports.ErrorFactory = ErrorFactory;
    exports.FirebaseError = FirebaseError;
    exports.Sha1 = Sha1;
    exports.assert = assert;
    exports.assertionError = assertionError;
    exports.async = async;
    exports.base64 = base64;
    exports.base64Decode = base64Decode;
    exports.base64Encode = base64Encode;
    exports.contains = contains;
    exports.createSubscribe = createSubscribe;
    exports.decode = decode;
    exports.deepCopy = deepCopy;
    exports.deepExtend = deepExtend;
    exports.errorPrefix = errorPrefix;
    exports.getUA = getUA;
    exports.isAdmin = isAdmin;
    exports.isBrowser = isBrowser;
    exports.isBrowserExtension = isBrowserExtension;
    exports.isElectron = isElectron;
    exports.isEmpty = isEmpty;
    exports.isIE = isIE;
    exports.isMobileCordova = isMobileCordova;
    exports.isNode = isNode;
    exports.isNodeSdk = isNodeSdk;
    exports.isReactNative = isReactNative;
    exports.isSafari = isSafari;
    exports.isUWP = isUWP;
    exports.isValidFormat = isValidFormat;
    exports.isValidTimestamp = isValidTimestamp;
    exports.issuedAtTime = issuedAtTime;
    exports.jsonEval = jsonEval;
    exports.map = map;
    exports.querystring = querystring;
    exports.querystringDecode = querystringDecode;
    exports.safeGet = safeGet;
    exports.stringLength = stringLength;
    exports.stringToByteArray = stringToByteArray$1;
    exports.stringify = stringify;
    exports.validateArgCount = validateArgCount;
    exports.validateCallback = validateCallback;
    exports.validateContextObject = validateContextObject;
    exports.validateNamespace = validateNamespace;

    });

    unwrapExports(index_cjs);
    var index_cjs_1 = index_cjs.CONSTANTS;
    var index_cjs_2 = index_cjs.Deferred;
    var index_cjs_3 = index_cjs.ErrorFactory;
    var index_cjs_4 = index_cjs.FirebaseError;
    var index_cjs_5 = index_cjs.Sha1;
    var index_cjs_6 = index_cjs.assert;
    var index_cjs_7 = index_cjs.assertionError;
    var index_cjs_8 = index_cjs.async;
    var index_cjs_9 = index_cjs.base64;
    var index_cjs_10 = index_cjs.base64Decode;
    var index_cjs_11 = index_cjs.base64Encode;
    var index_cjs_12 = index_cjs.contains;
    var index_cjs_13 = index_cjs.createSubscribe;
    var index_cjs_14 = index_cjs.decode;
    var index_cjs_15 = index_cjs.deepCopy;
    var index_cjs_16 = index_cjs.deepExtend;
    var index_cjs_17 = index_cjs.errorPrefix;
    var index_cjs_18 = index_cjs.getUA;
    var index_cjs_19 = index_cjs.isAdmin;
    var index_cjs_20 = index_cjs.isBrowser;
    var index_cjs_21 = index_cjs.isBrowserExtension;
    var index_cjs_22 = index_cjs.isElectron;
    var index_cjs_23 = index_cjs.isEmpty;
    var index_cjs_24 = index_cjs.isIE;
    var index_cjs_25 = index_cjs.isMobileCordova;
    var index_cjs_26 = index_cjs.isNode;
    var index_cjs_27 = index_cjs.isNodeSdk;
    var index_cjs_28 = index_cjs.isReactNative;
    var index_cjs_29 = index_cjs.isSafari;
    var index_cjs_30 = index_cjs.isUWP;
    var index_cjs_31 = index_cjs.isValidFormat;
    var index_cjs_32 = index_cjs.isValidTimestamp;
    var index_cjs_33 = index_cjs.issuedAtTime;
    var index_cjs_34 = index_cjs.jsonEval;
    var index_cjs_35 = index_cjs.map;
    var index_cjs_36 = index_cjs.querystring;
    var index_cjs_37 = index_cjs.querystringDecode;
    var index_cjs_38 = index_cjs.safeGet;
    var index_cjs_39 = index_cjs.stringLength;
    var index_cjs_40 = index_cjs.stringToByteArray;
    var index_cjs_41 = index_cjs.stringify;
    var index_cjs_42 = index_cjs.validateArgCount;
    var index_cjs_43 = index_cjs.validateCallback;
    var index_cjs_44 = index_cjs.validateContextObject;
    var index_cjs_45 = index_cjs.validateNamespace;

    var index_cjs$1 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, '__esModule', { value: true });




    /**
     * Component for service name T, e.g. `auth`, `auth-internal`
     */
    var Component = /** @class */ (function () {
        /**
         *
         * @param name The public service name, e.g. app, auth, firestore, database
         * @param instanceFactory Service factory responsible for creating the public interface
         * @param type whether the service provided by the component is public or private
         */
        function Component(name, instanceFactory, type) {
            this.name = name;
            this.instanceFactory = instanceFactory;
            this.type = type;
            this.multipleInstances = false;
            /**
             * Properties to be added to the service namespace
             */
            this.serviceProps = {};
            this.instantiationMode = "LAZY" /* LAZY */;
        }
        Component.prototype.setInstantiationMode = function (mode) {
            this.instantiationMode = mode;
            return this;
        };
        Component.prototype.setMultipleInstances = function (multipleInstances) {
            this.multipleInstances = multipleInstances;
            return this;
        };
        Component.prototype.setServiceProps = function (props) {
            this.serviceProps = props;
            return this;
        };
        return Component;
    }());

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var DEFAULT_ENTRY_NAME = '[DEFAULT]';

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
     * NameServiceMapping[T] is an alias for the type of the instance
     */
    var Provider = /** @class */ (function () {
        function Provider(name, container) {
            this.name = name;
            this.container = container;
            this.component = null;
            this.instances = new Map();
            this.instancesDeferred = new Map();
        }
        /**
         * @param identifier A provider can provide mulitple instances of a service
         * if this.component.multipleInstances is true.
         */
        Provider.prototype.get = function (identifier) {
            if (identifier === void 0) { identifier = DEFAULT_ENTRY_NAME; }
            // if multipleInstances is not supported, use the default name
            var normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            if (!this.instancesDeferred.has(normalizedIdentifier)) {
                var deferred = new index_cjs.Deferred();
                this.instancesDeferred.set(normalizedIdentifier, deferred);
                // If the service instance is available, resolve the promise with it immediately
                try {
                    var instance = this.getOrInitializeService(normalizedIdentifier);
                    if (instance) {
                        deferred.resolve(instance);
                    }
                }
                catch (e) {
                    // when the instance factory throws an exception during get(), it should not cause
                    // a fatal error. We just return the unresolved promise in this case.
                }
            }
            return this.instancesDeferred.get(normalizedIdentifier).promise;
        };
        Provider.prototype.getImmediate = function (options) {
            var _a = tslib_es6.__assign({ identifier: DEFAULT_ENTRY_NAME, optional: false }, options), identifier = _a.identifier, optional = _a.optional;
            // if multipleInstances is not supported, use the default name
            var normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            try {
                var instance = this.getOrInitializeService(normalizedIdentifier);
                if (!instance) {
                    if (optional) {
                        return null;
                    }
                    throw Error("Service " + this.name + " is not available");
                }
                return instance;
            }
            catch (e) {
                if (optional) {
                    return null;
                }
                else {
                    throw e;
                }
            }
        };
        Provider.prototype.getComponent = function () {
            return this.component;
        };
        Provider.prototype.setComponent = function (component) {
            var e_1, _a;
            if (component.name !== this.name) {
                throw Error("Mismatching Component " + component.name + " for Provider " + this.name + ".");
            }
            if (this.component) {
                throw Error("Component for " + this.name + " has already been provided");
            }
            this.component = component;
            // if the service is eager, initialize the default instance
            if (isComponentEager(component)) {
                try {
                    this.getOrInitializeService(DEFAULT_ENTRY_NAME);
                }
                catch (e) {
                    // when the instance factory for an eager Component throws an exception during the eager
                    // initialization, it should not cause a fatal error.
                    // TODO: Investigate if we need to make it configurable, because some component may want to cause
                    // a fatal error in this case?
                }
            }
            try {
                // Create service instances for the pending promises and resolve them
                // NOTE: if this.multipleInstances is false, only the default instance will be created
                // and all promises with resolve with it regardless of the identifier.
                for (var _b = tslib_es6.__values(this.instancesDeferred.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_es6.__read(_c.value, 2), instanceIdentifier = _d[0], instanceDeferred = _d[1];
                    var normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                    try {
                        // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                        var instance = this.getOrInitializeService(normalizedIdentifier);
                        instanceDeferred.resolve(instance);
                    }
                    catch (e) {
                        // when the instance factory throws an exception, it should not cause
                        // a fatal error. We just leave the promise unresolved.
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        Provider.prototype.clearInstance = function (identifier) {
            if (identifier === void 0) { identifier = DEFAULT_ENTRY_NAME; }
            this.instancesDeferred.delete(identifier);
            this.instances.delete(identifier);
        };
        // app.delete() will call this method on every provider to delete the services
        // TODO: should we mark the provider as deleted?
        Provider.prototype.delete = function () {
            return tslib_es6.__awaiter(this, void 0, void 0, function () {
                var services;
                return tslib_es6.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            services = Array.from(this.instances.values());
                            return [4 /*yield*/, Promise.all(services
                                    .filter(function (service) { return 'INTERNAL' in service; })
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map(function (service) { return service.INTERNAL.delete(); }))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Provider.prototype.isComponentSet = function () {
            return this.component != null;
        };
        Provider.prototype.getOrInitializeService = function (identifier) {
            var instance = this.instances.get(identifier);
            if (!instance && this.component) {
                instance = this.component.instanceFactory(this.container, normalizeIdentifierForFactory(identifier));
                this.instances.set(identifier, instance);
            }
            return instance || null;
        };
        Provider.prototype.normalizeInstanceIdentifier = function (identifier) {
            if (this.component) {
                return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME;
            }
            else {
                return identifier; // assume multiple instances are supported before the component is provided.
            }
        };
        return Provider;
    }());
    // undefined should be passed to the service factory for the default instance
    function normalizeIdentifierForFactory(identifier) {
        return identifier === DEFAULT_ENTRY_NAME ? undefined : identifier;
    }
    function isComponentEager(component) {
        return component.instantiationMode === "EAGER" /* EAGER */;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
     */
    var ComponentContainer = /** @class */ (function () {
        function ComponentContainer(name) {
            this.name = name;
            this.providers = new Map();
        }
        /**
         *
         * @param component Component being added
         * @param overwrite When a component with the same name has already been registered,
         * if overwrite is true: overwrite the existing component with the new component and create a new
         * provider with the new component. It can be useful in tests where you want to use different mocks
         * for different tests.
         * if overwrite is false: throw an exception
         */
        ComponentContainer.prototype.addComponent = function (component) {
            var provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                throw new Error("Component " + component.name + " has already been registered with " + this.name);
            }
            provider.setComponent(component);
        };
        ComponentContainer.prototype.addOrOverwriteComponent = function (component) {
            var provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                // delete the existing provider from the container, so we can register the new component
                this.providers.delete(component.name);
            }
            this.addComponent(component);
        };
        /**
         * getProvider provides a type safe interface where it can only be called with a field name
         * present in NameServiceMapping interface.
         *
         * Firebase SDKs providing services should extend NameServiceMapping interface to register
         * themselves.
         */
        ComponentContainer.prototype.getProvider = function (name) {
            if (this.providers.has(name)) {
                return this.providers.get(name);
            }
            // create a Provider for a service that hasn't registered with Firebase
            var provider = new Provider(name, this);
            this.providers.set(name, provider);
            return provider;
        };
        ComponentContainer.prototype.getProviders = function () {
            return Array.from(this.providers.values());
        };
        return ComponentContainer;
    }());

    exports.Component = Component;
    exports.ComponentContainer = ComponentContainer;
    exports.Provider = Provider;

    });

    unwrapExports(index_cjs$1);
    var index_cjs_1$1 = index_cjs$1.Component;
    var index_cjs_2$1 = index_cjs$1.ComponentContainer;
    var index_cjs_3$1 = index_cjs$1.Provider;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __spreadArrays$1() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var _a;
    /**
     * A container for all of the Logger instances
     */
    var instances = [];
    /**
     * The JS SDK supports 5 log levels and also allows a user the ability to
     * silence the logs altogether.
     *
     * The order is a follows:
     * DEBUG < VERBOSE < INFO < WARN < ERROR
     *
     * All of the log types above the current log level will be captured (i.e. if
     * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
     * `VERBOSE` logs will not)
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
        LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
        LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
    })(LogLevel || (LogLevel = {}));
    var levelStringToEnum = {
        'debug': LogLevel.DEBUG,
        'verbose': LogLevel.VERBOSE,
        'info': LogLevel.INFO,
        'warn': LogLevel.WARN,
        'error': LogLevel.ERROR,
        'silent': LogLevel.SILENT
    };
    /**
     * The default log level
     */
    var defaultLogLevel = LogLevel.INFO;
    /**
     * By default, `console.debug` is not displayed in the developer console (in
     * chrome). To avoid forcing users to have to opt-in to these logs twice
     * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
     * logs to the `console.log` function.
     */
    var ConsoleMethod = (_a = {},
        _a[LogLevel.DEBUG] = 'log',
        _a[LogLevel.VERBOSE] = 'log',
        _a[LogLevel.INFO] = 'info',
        _a[LogLevel.WARN] = 'warn',
        _a[LogLevel.ERROR] = 'error',
        _a);
    /**
     * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
     * messages on to their corresponding console counterparts (if the log method
     * is supported by the current log level)
     */
    var defaultLogHandler = function (instance, logType) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (logType < instance.logLevel) {
            return;
        }
        var now = new Date().toISOString();
        var method = ConsoleMethod[logType];
        if (method) {
            console[method].apply(console, __spreadArrays$1(["[" + now + "]  " + instance.name + ":"], args));
        }
        else {
            throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
        }
    };
    var Logger = /** @class */ (function () {
        /**
         * Gives you an instance of a Logger to capture messages according to
         * Firebase's logging scheme.
         *
         * @param name The name that the logs will be associated with
         */
        function Logger(name) {
            this.name = name;
            /**
             * The log level of the given Logger instance.
             */
            this._logLevel = defaultLogLevel;
            /**
             * The main (internal) log handler for the Logger instance.
             * Can be set to a new function in internal package code but not by user.
             */
            this._logHandler = defaultLogHandler;
            /**
             * The optional, additional, user-defined log handler for the Logger instance.
             */
            this._userLogHandler = null;
            /**
             * Capture the current instance for later use
             */
            instances.push(this);
        }
        Object.defineProperty(Logger.prototype, "logLevel", {
            get: function () {
                return this._logLevel;
            },
            set: function (val) {
                if (!(val in LogLevel)) {
                    throw new TypeError("Invalid value \"" + val + "\" assigned to `logLevel`");
                }
                this._logLevel = val;
            },
            enumerable: true,
            configurable: true
        });
        // Workaround for setter/getter having to be the same type.
        Logger.prototype.setLogLevel = function (val) {
            this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
        };
        Object.defineProperty(Logger.prototype, "logHandler", {
            get: function () {
                return this._logHandler;
            },
            set: function (val) {
                if (typeof val !== 'function') {
                    throw new TypeError('Value assigned to `logHandler` must be a function');
                }
                this._logHandler = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Logger.prototype, "userLogHandler", {
            get: function () {
                return this._userLogHandler;
            },
            set: function (val) {
                this._userLogHandler = val;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * The functions below are all based on the `console` interface
         */
        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays$1([this, LogLevel.DEBUG], args));
            this._logHandler.apply(this, __spreadArrays$1([this, LogLevel.DEBUG], args));
        };
        Logger.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays$1([this, LogLevel.VERBOSE], args));
            this._logHandler.apply(this, __spreadArrays$1([this, LogLevel.VERBOSE], args));
        };
        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays$1([this, LogLevel.INFO], args));
            this._logHandler.apply(this, __spreadArrays$1([this, LogLevel.INFO], args));
        };
        Logger.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays$1([this, LogLevel.WARN], args));
            this._logHandler.apply(this, __spreadArrays$1([this, LogLevel.WARN], args));
        };
        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays$1([this, LogLevel.ERROR], args));
            this._logHandler.apply(this, __spreadArrays$1([this, LogLevel.ERROR], args));
        };
        return Logger;
    }());
    function setLogLevel(level) {
        instances.forEach(function (inst) {
            inst.setLogLevel(level);
        });
    }
    function setUserLogHandler(logCallback, options) {
        var _loop_1 = function (instance) {
            var customLogLevel = null;
            if (options && options.level) {
                customLogLevel = levelStringToEnum[options.level];
            }
            if (logCallback === null) {
                instance.userLogHandler = null;
            }
            else {
                instance.userLogHandler = function (instance, level) {
                    var args = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        args[_i - 2] = arguments[_i];
                    }
                    var message = args
                        .map(function (arg) {
                        if (arg == null) {
                            return null;
                        }
                        else if (typeof arg === 'string') {
                            return arg;
                        }
                        else if (typeof arg === 'number' || typeof arg === 'boolean') {
                            return arg.toString();
                        }
                        else if (arg instanceof Error) {
                            return arg.message;
                        }
                        else {
                            try {
                                return JSON.stringify(arg);
                            }
                            catch (ignored) {
                                return null;
                            }
                        }
                    })
                        .filter(function (arg) { return arg; })
                        .join(' ');
                    if (level >= (customLogLevel !== null && customLogLevel !== void 0 ? customLogLevel : instance.logLevel)) {
                        logCallback({
                            level: LogLevel[level].toLowerCase(),
                            message: message,
                            args: args,
                            type: instance.name
                        });
                    }
                };
            }
        };
        for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
            var instance = instances_1[_i];
            _loop_1(instance);
        }
    }

    var index_esm = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get LogLevel () { return LogLevel; },
        Logger: Logger,
        setLogLevel: setLogLevel,
        setUserLogHandler: setUserLogHandler
    });

    var index_cjs$2 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, '__esModule', { value: true });






    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var _a;
    var ERRORS = (_a = {},
        _a["no-app" /* NO_APP */] = "No Firebase App '{$appName}' has been created - " +
            'call Firebase App.initializeApp()',
        _a["bad-app-name" /* BAD_APP_NAME */] = "Illegal App name: '{$appName}",
        _a["duplicate-app" /* DUPLICATE_APP */] = "Firebase App named '{$appName}' already exists",
        _a["app-deleted" /* APP_DELETED */] = "Firebase App named '{$appName}' already deleted",
        _a["invalid-app-argument" /* INVALID_APP_ARGUMENT */] = 'firebase.{$appName}() takes either no argument or a ' +
            'Firebase App instance.',
        _a["invalid-log-argument" /* INVALID_LOG_ARGUMENT */] = 'First argument to `onLog` must be null or a function.',
        _a);
    var ERROR_FACTORY = new index_cjs.ErrorFactory('app', 'Firebase', ERRORS);

    var name$1 = "@firebase/app";
    var version = "0.6.6";

    var name$2 = "@firebase/analytics";

    var name$3 = "@firebase/auth";

    var name$4 = "@firebase/database";

    var name$5 = "@firebase/functions";

    var name$6 = "@firebase/installations";

    var name$7 = "@firebase/messaging";

    var name$8 = "@firebase/performance";

    var name$9 = "@firebase/remote-config";

    var name$a = "@firebase/storage";

    var name$b = "@firebase/firestore";

    var name$c = "firebase-wrapper";

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var _a$1;
    var DEFAULT_ENTRY_NAME = '[DEFAULT]';
    var PLATFORM_LOG_STRING = (_a$1 = {},
        _a$1[name$1] = 'fire-core',
        _a$1[name$2] = 'fire-analytics',
        _a$1[name$3] = 'fire-auth',
        _a$1[name$4] = 'fire-rtdb',
        _a$1[name$5] = 'fire-fn',
        _a$1[name$6] = 'fire-iid',
        _a$1[name$7] = 'fire-fcm',
        _a$1[name$8] = 'fire-perf',
        _a$1[name$9] = 'fire-rc',
        _a$1[name$a] = 'fire-gcs',
        _a$1[name$b] = 'fire-fst',
        _a$1['fire-js'] = 'fire-js',
        _a$1[name$c] = 'fire-js-all',
        _a$1);

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var logger = new index_esm.Logger('@firebase/app');

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Global context object for a collection of services using
     * a shared authentication state.
     */
    var FirebaseAppImpl = /** @class */ (function () {
        function FirebaseAppImpl(options, config, firebase_) {
            var e_1, _a;
            var _this = this;
            this.firebase_ = firebase_;
            this.isDeleted_ = false;
            this.name_ = config.name;
            this.automaticDataCollectionEnabled_ =
                config.automaticDataCollectionEnabled || false;
            this.options_ = index_cjs.deepCopy(options);
            this.container = new index_cjs$1.ComponentContainer(config.name);
            // add itself to container
            this._addComponent(new index_cjs$1.Component('app', function () { return _this; }, "PUBLIC" /* PUBLIC */));
            try {
                // populate ComponentContainer with existing components
                for (var _b = tslib_es6.__values(this.firebase_.INTERNAL.components.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var component$1 = _c.value;
                    this._addComponent(component$1);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        Object.defineProperty(FirebaseAppImpl.prototype, "automaticDataCollectionEnabled", {
            get: function () {
                this.checkDestroyed_();
                return this.automaticDataCollectionEnabled_;
            },
            set: function (val) {
                this.checkDestroyed_();
                this.automaticDataCollectionEnabled_ = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FirebaseAppImpl.prototype, "name", {
            get: function () {
                this.checkDestroyed_();
                return this.name_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FirebaseAppImpl.prototype, "options", {
            get: function () {
                this.checkDestroyed_();
                return this.options_;
            },
            enumerable: true,
            configurable: true
        });
        FirebaseAppImpl.prototype.delete = function () {
            var _this = this;
            return new Promise(function (resolve) {
                _this.checkDestroyed_();
                resolve();
            })
                .then(function () {
                _this.firebase_.INTERNAL.removeApp(_this.name_);
                return Promise.all(_this.container.getProviders().map(function (provider) { return provider.delete(); }));
            })
                .then(function () {
                _this.isDeleted_ = true;
            });
        };
        /**
         * Return a service instance associated with this app (creating it
         * on demand), identified by the passed instanceIdentifier.
         *
         * NOTE: Currently storage and functions are the only ones that are leveraging this
         * functionality. They invoke it by calling:
         *
         * ```javascript
         * firebase.app().storage('STORAGE BUCKET ID')
         * ```
         *
         * The service name is passed to this already
         * @internal
         */
        FirebaseAppImpl.prototype._getService = function (name, instanceIdentifier) {
            if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
            this.checkDestroyed_();
            // getImmediate will always succeed because _getService is only called for registered components.
            return this.container.getProvider(name).getImmediate({
                identifier: instanceIdentifier
            });
        };
        /**
         * Remove a service instance from the cache, so we will create a new instance for this service
         * when people try to get this service again.
         *
         * NOTE: currently only firestore is using this functionality to support firestore shutdown.
         *
         * @param name The service name
         * @param instanceIdentifier instance identifier in case multiple instances are allowed
         * @internal
         */
        FirebaseAppImpl.prototype._removeServiceInstance = function (name, instanceIdentifier) {
            if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.container.getProvider(name).clearInstance(instanceIdentifier);
        };
        /**
         * @param component the component being added to this app's container
         */
        FirebaseAppImpl.prototype._addComponent = function (component) {
            try {
                this.container.addComponent(component);
            }
            catch (e) {
                logger.debug("Component " + component.name + " failed to register with FirebaseApp " + this.name, e);
            }
        };
        FirebaseAppImpl.prototype._addOrOverwriteComponent = function (component) {
            this.container.addOrOverwriteComponent(component);
        };
        /**
         * This function will throw an Error if the App has already been deleted -
         * use before performing API actions on the App.
         */
        FirebaseAppImpl.prototype.checkDestroyed_ = function () {
            if (this.isDeleted_) {
                throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this.name_ });
            }
        };
        return FirebaseAppImpl;
    }());
    // Prevent dead-code elimination of these methods w/o invalid property
    // copying.
    (FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options) ||
        FirebaseAppImpl.prototype.delete ||
        console.log('dc');

    var version$1 = "7.15.2";

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Because auth can't share code with other components, we attach the utility functions
     * in an internal namespace to share code.
     * This function return a firebase namespace object without
     * any utility functions, so it can be shared between the regular firebaseNamespace and
     * the lite version.
     */
    function createFirebaseNamespaceCore(firebaseAppImpl) {
        var apps = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var components = new Map();
        // A namespace is a plain JavaScript Object.
        var namespace = {
            // Hack to prevent Babel from modifying the object returned
            // as the firebase namespace.
            // @ts-ignore
            __esModule: true,
            initializeApp: initializeApp,
            // @ts-ignore
            app: app,
            registerVersion: registerVersion,
            setLogLevel: index_esm.setLogLevel,
            onLog: onLog,
            // @ts-ignore
            apps: null,
            SDK_VERSION: version$1,
            INTERNAL: {
                registerComponent: registerComponent,
                removeApp: removeApp,
                components: components,
                useAsService: useAsService
            }
        };
        // Inject a circular default export to allow Babel users who were previously
        // using:
        //
        //   import firebase from 'firebase';
        //   which becomes: var firebase = require('firebase').default;
        //
        // instead of
        //
        //   import * as firebase from 'firebase';
        //   which becomes: var firebase = require('firebase');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        namespace['default'] = namespace;
        // firebase.apps is a read-only getter.
        Object.defineProperty(namespace, 'apps', {
            get: getApps
        });
        /**
         * Called by App.delete() - but before any services associated with the App
         * are deleted.
         */
        function removeApp(name) {
            delete apps[name];
        }
        /**
         * Get the App object for a given name (or DEFAULT).
         */
        function app(name) {
            name = name || DEFAULT_ENTRY_NAME;
            if (!index_cjs.contains(apps, name)) {
                throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
            }
            return apps[name];
        }
        // @ts-ignore
        app['App'] = firebaseAppImpl;
        function initializeApp(options, rawConfig) {
            if (rawConfig === void 0) { rawConfig = {}; }
            if (typeof rawConfig !== 'object' || rawConfig === null) {
                var name_1 = rawConfig;
                rawConfig = { name: name_1 };
            }
            var config = rawConfig;
            if (config.name === undefined) {
                config.name = DEFAULT_ENTRY_NAME;
            }
            var name = config.name;
            if (typeof name !== 'string' || !name) {
                throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                    appName: String(name)
                });
            }
            if (index_cjs.contains(apps, name)) {
                throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
            }
            var app = new firebaseAppImpl(options, config, namespace);
            apps[name] = app;
            return app;
        }
        /*
         * Return an array of all the non-deleted FirebaseApps.
         */
        function getApps() {
            // Make a copy so caller cannot mutate the apps list.
            return Object.keys(apps).map(function (name) { return apps[name]; });
        }
        function registerComponent(component) {
            var e_1, _a;
            var componentName = component.name;
            if (components.has(componentName)) {
                logger.debug("There were multiple attempts to register component " + componentName + ".");
                return component.type === "PUBLIC" /* PUBLIC */
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        namespace[componentName]
                    : null;
            }
            components.set(componentName, component);
            // create service namespace for public components
            if (component.type === "PUBLIC" /* PUBLIC */) {
                // The Service namespace is an accessor function ...
                var serviceNamespace = function (appArg) {
                    if (appArg === void 0) { appArg = app(); }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (typeof appArg[componentName] !== 'function') {
                        // Invalid argument.
                        // This happens in the following case: firebase.storage('gs:/')
                        throw ERROR_FACTORY.create("invalid-app-argument" /* INVALID_APP_ARGUMENT */, {
                            appName: componentName
                        });
                    }
                    // Forward service instance lookup to the FirebaseApp.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return appArg[componentName]();
                };
                // ... and a container for service-level properties.
                if (component.serviceProps !== undefined) {
                    index_cjs.deepExtend(serviceNamespace, component.serviceProps);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                namespace[componentName] = serviceNamespace;
                // Patch the FirebaseAppImpl prototype
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                firebaseAppImpl.prototype[componentName] =
                    // TODO: The eslint disable can be removed and the 'ignoreRestArgs'
                    // option added to the no-explicit-any rule when ESlint releases it.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var serviceFxn = this._getService.bind(this, componentName);
                        return serviceFxn.apply(this, component.multipleInstances ? args : []);
                    };
            }
            try {
                // add the component to existing app instances
                for (var _b = tslib_es6.__values(Object.keys(apps)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var appName = _c.value;
                    apps[appName]._addComponent(component);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return component.type === "PUBLIC" /* PUBLIC */
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    namespace[componentName]
                : null;
        }
        function registerVersion(libraryKeyOrName, version, variant) {
            var _a;
            // TODO: We can use this check to whitelist strings when/if we set up
            // a good whitelist system.
            var library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
            if (variant) {
                library += "-" + variant;
            }
            var libraryMismatch = library.match(/\s|\//);
            var versionMismatch = version.match(/\s|\//);
            if (libraryMismatch || versionMismatch) {
                var warning = [
                    "Unable to register library \"" + library + "\" with version \"" + version + "\":"
                ];
                if (libraryMismatch) {
                    warning.push("library name \"" + library + "\" contains illegal characters (whitespace or \"/\")");
                }
                if (libraryMismatch && versionMismatch) {
                    warning.push('and');
                }
                if (versionMismatch) {
                    warning.push("version name \"" + version + "\" contains illegal characters (whitespace or \"/\")");
                }
                logger.warn(warning.join(' '));
                return;
            }
            registerComponent(new index_cjs$1.Component(library + "-version", function () { return ({ library: library, version: version }); }, "VERSION" /* VERSION */));
        }
        function onLog(logCallback, options) {
            if (logCallback !== null && typeof logCallback !== 'function') {
                throw ERROR_FACTORY.create("invalid-log-argument" /* INVALID_LOG_ARGUMENT */, {
                    appName: name
                });
            }
            index_esm.setUserLogHandler(logCallback, options);
        }
        // Map the requested service to a registered service name
        // (used to map auth to serverAuth service when needed).
        function useAsService(app, name) {
            if (name === 'serverAuth') {
                return null;
            }
            var useService = name;
            return useService;
        }
        return namespace;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Return a firebase namespace object.
     *
     * In production, this will be called exactly once and the result
     * assigned to the 'firebase' global.  It may be called multiple times
     * in unit tests.
     */
    function createFirebaseNamespace() {
        var namespace = createFirebaseNamespaceCore(FirebaseAppImpl);
        namespace.INTERNAL = tslib_es6.__assign(tslib_es6.__assign({}, namespace.INTERNAL), { createFirebaseNamespace: createFirebaseNamespace,
            extendNamespace: extendNamespace,
            createSubscribe: index_cjs.createSubscribe,
            ErrorFactory: index_cjs.ErrorFactory,
            deepExtend: index_cjs.deepExtend });
        /**
         * Patch the top-level firebase namespace with additional properties.
         *
         * firebase.INTERNAL.extendNamespace()
         */
        function extendNamespace(props) {
            index_cjs.deepExtend(namespace, props);
        }
        return namespace;
    }
    var firebase = createFirebaseNamespace();

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var PlatformLoggerService = /** @class */ (function () {
        function PlatformLoggerService(container) {
            this.container = container;
        }
        // In initial implementation, this will be called by installations on
        // auth token refresh, and installations will send this string.
        PlatformLoggerService.prototype.getPlatformInfoString = function () {
            var providers = this.container.getProviders();
            // Loop through providers and get library/version pairs from any that are
            // version components.
            return providers
                .map(function (provider) {
                if (isVersionServiceProvider(provider)) {
                    var service = provider.getImmediate();
                    return service.library + "/" + service.version;
                }
                else {
                    return null;
                }
            })
                .filter(function (logString) { return logString; })
                .join(' ');
        };
        return PlatformLoggerService;
    }());
    /**
     *
     * @param provider check if this provider provides a VersionService
     *
     * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
     * provides VersionService. The provider is not necessarily a 'app-version'
     * provider.
     */
    function isVersionServiceProvider(provider) {
        var component = provider.getComponent();
        return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* VERSION */;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function registerCoreComponents(firebase, variant) {
        firebase.INTERNAL.registerComponent(new index_cjs$1.Component('platform-logger', function (container) { return new PlatformLoggerService(container); }, "PRIVATE" /* PRIVATE */));
        // Register `app` package.
        firebase.registerVersion(name$1, version, variant);
        // Register platform SDK identifier (no version).
        firebase.registerVersion('fire-js', '');
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Firebase Lite detection test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (index_cjs.isBrowser() && self.firebase !== undefined) {
        logger.warn("\n    Warning: Firebase is already defined in the global scope. Please make sure\n    Firebase library is only loaded once.\n  ");
        // eslint-disable-next-line
        var sdkVersion = self.firebase.SDK_VERSION;
        if (sdkVersion && sdkVersion.indexOf('LITE') >= 0) {
            logger.warn("\n    Warning: You are trying to load Firebase while using Firebase Performance standalone script.\n    You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.\n    ");
        }
    }
    var initializeApp = firebase.initializeApp;
    // TODO: This disable can be removed and the 'ignoreRestArgs' option added to
    // the no-explicit-any rule when ESlint releases it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firebase.initializeApp = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Environment check before initializing app
        // Do the check in initializeApp, so people have a chance to disable it by setting logLevel
        // in @firebase/logger
        if (index_cjs.isNode()) {
            logger.warn("\n      Warning: This is a browser-targeted Firebase bundle but it appears it is being\n      run in a Node environment.  If running in a Node environment, make sure you\n      are using the bundle specified by the \"main\" field in package.json.\n      \n      If you are using Webpack, you can specify \"main\" as the first item in\n      \"resolve.mainFields\":\n      https://webpack.js.org/configuration/resolve/#resolvemainfields\n      \n      If using Rollup, use the rollup-plugin-node-resolve plugin and specify \"main\"\n      as the first item in \"mainFields\", e.g. ['main', 'module'].\n      https://github.com/rollup/rollup-plugin-node-resolve\n      ");
        }
        return initializeApp.apply(undefined, args);
    };
    var firebase$1 = firebase;
    registerCoreComponents(firebase$1);

    exports.default = firebase$1;
    exports.firebase = firebase$1;

    });

    unwrapExports(index_cjs$2);
    var index_cjs_1$2 = index_cjs$2.firebase;

    function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

    var firebase = _interopDefault(index_cjs$2);

    var name$1 = "firebase";
    var version = "7.15.3";

    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    firebase.registerVersion(name$1, version, 'app');

    var index_cjs$3 = firebase;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __values$1(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var g, goog = goog || {}, k = commonjsGlobal$1 || self;
    function aa() { }
    function ba(a) {
        var b = typeof a;
        if ("object" == b)
            if (a) {
                if (a instanceof Array)
                    return "array";
                if (a instanceof Object)
                    return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c)
                    return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice"))
                    return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call"))
                    return "function";
            }
            else
                return "null";
        else if ("function" == b && "undefined" == typeof a.call)
            return "object";
        return b;
    }
    function da(a) { var b = ba(a); return "array" == b || "object" == b && "number" == typeof a.length; }
    function m(a) { var b = typeof a; return "object" == b && null != a || "function" == b; }
    function ea(a) { return Object.prototype.hasOwnProperty.call(a, fa) && a[fa] || (a[fa] = ++ha); }
    var fa = "closure_uid_" + (1E9 * Math.random() >>> 0), ha = 0;
    function ia(a, b, c) { return a.call.apply(a.bind, arguments); }
    function ja(a, b, c) { if (!a)
        throw Error(); if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function () { var e = Array.prototype.slice.call(arguments); Array.prototype.unshift.apply(e, d); return a.apply(b, e); };
    } return function () { return a.apply(b, arguments); }; }
    function n(a, b, c) { Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? n = ia : n = ja; return n.apply(null, arguments); }
    function ka(a, b) { var c = Array.prototype.slice.call(arguments, 1); return function () { var d = c.slice(); d.push.apply(d, arguments); return a.apply(this, d); }; }
    var q = Date.now || function () { return +new Date; };
    function r(a, b) { function c() { } c.prototype = b.prototype; a.M = b.prototype; a.prototype = new c; a.prototype.constructor = a; }
    function t() { this.j = this.j; this.i = this.i; }
    var la = 0;
    t.prototype.j = !1;
    t.prototype.da = function () { if (!this.j && (this.j = !0, this.C(), 0 != la)) {
        var a = ea(this);
    } };
    t.prototype.C = function () { if (this.i)
        for (; this.i.length;)
            this.i.shift()(); };
    var na = Array.prototype.indexOf ? function (a, b) { return Array.prototype.indexOf.call(a, b, void 0); } : function (a, b) { if ("string" === typeof a)
        return "string" !== typeof b || 1 != b.length ? -1 : a.indexOf(b, 0); for (var c = 0; c < a.length; c++)
        if (c in a && a[c] === b)
            return c; return -1; }, oa = Array.prototype.forEach ? function (a, b, c) { Array.prototype.forEach.call(a, b, c); } : function (a, b, c) { for (var d = a.length, e = "string" === typeof a ? a.split("") : a, f = 0; f < d; f++)
        f in e && b.call(c, e[f], f, a); };
    function pa(a) { a: {
        var b = qa;
        for (var c = a.length, d = "string" === typeof a ? a.split("") : a, e = 0; e < c; e++)
            if (e in d && b.call(void 0, d[e], e, a)) {
                b = e;
                break a;
            }
        b = -1;
    } return 0 > b ? null : "string" === typeof a ? a.charAt(b) : a[b]; }
    function ra(a) { return Array.prototype.concat.apply([], arguments); }
    function sa(a) { var b = a.length; if (0 < b) {
        for (var c = Array(b), d = 0; d < b; d++)
            c[d] = a[d];
        return c;
    } return []; }
    function wa(a) { return /^[\s\xa0]*$/.test(a); }
    var xa = String.prototype.trim ? function (a) { return a.trim(); } : function (a) { return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]; };
    function u(a, b) { return -1 != a.indexOf(b); }
    function ya(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
    var v;
    a: {
        var za = k.navigator;
        if (za) {
            var Aa = za.userAgent;
            if (Aa) {
                v = Aa;
                break a;
            }
        }
        v = "";
    }
    function Ba(a, b, c) { for (var d in a)
        b.call(c, a[d], d, a); }
    function Ca(a) { var b = {}; for (var c in a)
        b[c] = a[c]; return b; }
    var Da = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
    function Ea(a, b) { var c, d; for (var e = 1; e < arguments.length; e++) {
        d = arguments[e];
        for (c in d)
            a[c] = d[c];
        for (var f = 0; f < Da.length; f++)
            c = Da[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
    } }
    function Fa(a) { Fa[" "](a); return a; }
    Fa[" "] = aa;
    function Ga(a, b) { var c = Ha; return Object.prototype.hasOwnProperty.call(c, a) ? c[a] : c[a] = b(a); }
    var Ia = u(v, "Opera"), w = u(v, "Trident") || u(v, "MSIE"), Ja = u(v, "Edge"), Ka = Ja || w, La = u(v, "Gecko") && !(u(v.toLowerCase(), "webkit") && !u(v, "Edge")) && !(u(v, "Trident") || u(v, "MSIE")) && !u(v, "Edge"), Ma = u(v.toLowerCase(), "webkit") && !u(v, "Edge");
    function Na() { var a = k.document; return a ? a.documentMode : void 0; }
    var Oa;
    a: {
        var Pa = "", Qa = function () { var a = v; if (La)
            return /rv:([^\);]+)(\)|;)/.exec(a); if (Ja)
            return /Edge\/([\d\.]+)/.exec(a); if (w)
            return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a); if (Ma)
            return /WebKit\/(\S+)/.exec(a); if (Ia)
            return /(?:Version)[ \/]?(\S+)/.exec(a); }();
        Qa && (Pa = Qa ? Qa[1] : "");
        if (w) {
            var Ra = Na();
            if (null != Ra && Ra > parseFloat(Pa)) {
                Oa = String(Ra);
                break a;
            }
        }
        Oa = Pa;
    }
    var Ha = {};
    function Sa(a) { return Ga(a, function () { {
        var b = 0;
        var e = xa(String(Oa)).split("."), f = xa(String(a)).split("."), h = Math.max(e.length, f.length);
        for (var l = 0; 0 == b && l < h; l++) {
            var c = e[l] || "", d = f[l] || "";
            do {
                c = /(\d*)(\D*)(.*)/.exec(c) || ["", "", "", ""];
                d = /(\d*)(\D*)(.*)/.exec(d) || ["", "", "", ""];
                if (0 == c[0].length && 0 == d[0].length)
                    break;
                b = ya(0 == c[1].length ? 0 : parseInt(c[1], 10), 0 == d[1].length ? 0 : parseInt(d[1], 10)) || ya(0 == c[2].length, 0 == d[2].length) || ya(c[2], d[2]);
                c = c[3];
                d = d[3];
            } while (0 == b);
        }
    } return 0 <= b; }); }
    var Ta;
    if (k.document && w) {
        var Ua = Na();
        Ta = Ua ? Ua : parseInt(Oa, 10) || void 0;
    }
    else
        Ta = void 0;
    var Va = Ta;
    var Wa = !w || 9 <= Number(Va), Xa = w && !Sa("9"), Ya = function () { if (!k.addEventListener || !Object.defineProperty)
        return !1; var a = !1, b = Object.defineProperty({}, "passive", { get: function () { a = !0; } }); try {
        k.addEventListener("test", aa, b), k.removeEventListener("test", aa, b);
    }
    catch (c) { } return a; }();
    function x(a, b) { this.type = a; this.a = this.target = b; this.defaultPrevented = !1; }
    x.prototype.b = function () { this.defaultPrevented = !0; };
    function y(a, b) {
        x.call(this, a ? a.type : "");
        this.relatedTarget = this.a = this.target = null;
        this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
        this.key = "";
        this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
        this.pointerId = 0;
        this.pointerType = "";
        this.c = null;
        if (a) {
            var c = this.type = a.type, d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
            this.target = a.target || a.srcElement;
            this.a = b;
            if (b = a.relatedTarget) {
                if (La) {
                    a: {
                        try {
                            Fa(b.nodeName);
                            var e = !0;
                            break a;
                        }
                        catch (f) { }
                        e = !1;
                    }
                    e || (b = null);
                }
            }
            else
                "mouseover" ==
                    c ? b = a.fromElement : "mouseout" == c && (b = a.toElement);
            this.relatedTarget = b;
            d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX, this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX, this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0);
            this.button = a.button;
            this.key = a.key || "";
            this.ctrlKey = a.ctrlKey;
            this.altKey = a.altKey;
            this.shiftKey = a.shiftKey;
            this.metaKey =
                a.metaKey;
            this.pointerId = a.pointerId || 0;
            this.pointerType = "string" === typeof a.pointerType ? a.pointerType : Za[a.pointerType] || "";
            this.c = a;
            a.defaultPrevented && this.b();
        }
    }
    r(y, x);
    var Za = { 2: "touch", 3: "pen", 4: "mouse" };
    y.prototype.b = function () { y.M.b.call(this); var a = this.c; if (a.preventDefault)
        a.preventDefault();
    else if (a.returnValue = !1, Xa)
        try {
            if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode)
                a.keyCode = -1;
        }
        catch (b) { } };
    var A = "closure_listenable_" + (1E6 * Math.random() | 0), $a = 0;
    function ab(a, b, c, d, e) { this.listener = a; this.proxy = null; this.src = b; this.type = c; this.capture = !!d; this.aa = e; this.key = ++$a; this.V = this.X = !1; }
    function bb(a) { a.V = !0; a.listener = null; a.proxy = null; a.src = null; a.aa = null; }
    function cb(a) { this.src = a; this.a = {}; this.b = 0; }
    cb.prototype.add = function (a, b, c, d, e) { var f = a.toString(); a = this.a[f]; a || (a = this.a[f] = [], this.b++); var h = db(a, b, d, e); -1 < h ? (b = a[h], c || (b.X = !1)) : (b = new ab(b, this.src, f, !!d, e), b.X = c, a.push(b)); return b; };
    function eb(a, b) { var c = b.type; if (c in a.a) {
        var d = a.a[c], e = na(d, b), f;
        (f = 0 <= e) && Array.prototype.splice.call(d, e, 1);
        f && (bb(b), 0 == a.a[c].length && (delete a.a[c], a.b--));
    } }
    function db(a, b, c, d) { for (var e = 0; e < a.length; ++e) {
        var f = a[e];
        if (!f.V && f.listener == b && f.capture == !!c && f.aa == d)
            return e;
    } return -1; }
    var fb = "closure_lm_" + (1E6 * Math.random() | 0), gb = {};
    function ib(a, b, c, d, e) { if (d && d.once)
        return jb(a, b, c, d, e); if (Array.isArray(b)) {
        for (var f = 0; f < b.length; f++)
            ib(a, b[f], c, d, e);
        return null;
    } c = kb(c); return a && a[A] ? a.ra(b, c, m(d) ? !!d.capture : !!d, e) : lb(a, b, c, !1, d, e); }
    function lb(a, b, c, d, e, f) {
        if (!b)
            throw Error("Invalid event type");
        var h = m(e) ? !!e.capture : !!e;
        if (h && !Wa)
            return null;
        var l = mb(a);
        l || (a[fb] = l = new cb(a));
        c = l.add(b, c, d, h, f);
        if (c.proxy)
            return c;
        d = nb();
        c.proxy = d;
        d.src = a;
        d.listener = c;
        if (a.addEventListener)
            Ya || (e = h), void 0 === e && (e = !1), a.addEventListener(b.toString(), d, e);
        else if (a.attachEvent)
            a.attachEvent(ob(b.toString()), d);
        else if (a.addListener && a.removeListener)
            a.addListener(d);
        else
            throw Error("addEventListener and attachEvent are unavailable.");
        return c;
    }
    function nb() { var a = pb, b = Wa ? function (c) { return a.call(b.src, b.listener, c); } : function (c) { c = a.call(b.src, b.listener, c); if (!c)
        return c; }; return b; }
    function jb(a, b, c, d, e) { if (Array.isArray(b)) {
        for (var f = 0; f < b.length; f++)
            jb(a, b[f], c, d, e);
        return null;
    } c = kb(c); return a && a[A] ? a.sa(b, c, m(d) ? !!d.capture : !!d, e) : lb(a, b, c, !0, d, e); }
    function qb(a, b, c, d, e) { if (Array.isArray(b))
        for (var f = 0; f < b.length; f++)
            qb(a, b[f], c, d, e);
    else
        (d = m(d) ? !!d.capture : !!d, c = kb(c), a && a[A]) ? (a = a.c, b = String(b).toString(), b in a.a && (f = a.a[b], c = db(f, c, d, e), -1 < c && (bb(f[c]), Array.prototype.splice.call(f, c, 1), 0 == f.length && (delete a.a[b], a.b--)))) : a && (a = mb(a)) && (b = a.a[b.toString()], a = -1, b && (a = db(b, c, d, e)), (c = -1 < a ? b[a] : null) && rb(c)); }
    function rb(a) { if ("number" !== typeof a && a && !a.V) {
        var b = a.src;
        if (b && b[A])
            eb(b.c, a);
        else {
            var c = a.type, d = a.proxy;
            b.removeEventListener ? b.removeEventListener(c, d, a.capture) : b.detachEvent ? b.detachEvent(ob(c), d) : b.addListener && b.removeListener && b.removeListener(d);
            (c = mb(b)) ? (eb(c, a), 0 == c.b && (c.src = null, b[fb] = null)) : bb(a);
        }
    } }
    function ob(a) { return a in gb ? gb[a] : gb[a] = "on" + a; }
    function sb(a, b) { var c = a.listener, d = a.aa || a.src; a.X && rb(a); return c.call(d, b); }
    function pb(a, b) { if (a.V)
        return !0; if (!Wa) {
        if (!b)
            a: {
                b = ["window", "event"];
                for (var c = k, d = 0; d < b.length; d++)
                    if (c = c[b[d]], null == c) {
                        b = null;
                        break a;
                    }
                b = c;
            }
        b = new y(b, this);
        return sb(a, b);
    } return sb(a, new y(b, this)); }
    function mb(a) { a = a[fb]; return a instanceof cb ? a : null; }
    var tb = "__closure_events_fn_" + (1E9 * Math.random() >>> 0);
    function kb(a) { if ("function" == ba(a))
        return a; a[tb] || (a[tb] = function (b) { return a.handleEvent(b); }); return a[tb]; }
    function B() { t.call(this); this.c = new cb(this); this.J = this; this.A = null; }
    r(B, t);
    B.prototype[A] = !0;
    g = B.prototype;
    g.addEventListener = function (a, b, c, d) { ib(this, a, b, c, d); };
    g.removeEventListener = function (a, b, c, d) { qb(this, a, b, c, d); };
    g.dispatchEvent = function (a) { var b, c = this.A; if (c)
        for (b = []; c; c = c.A)
            b.push(c); c = this.J; var d = a.type || a; if ("string" === typeof a)
        a = new x(a, c);
    else if (a instanceof x)
        a.target = a.target || c;
    else {
        var e = a;
        a = new x(d, c);
        Ea(a, e);
    } e = !0; if (b)
        for (var f = b.length - 1; 0 <= f; f--) {
            var h = a.a = b[f];
            e = ub(h, d, !0, a) && e;
        } h = a.a = c; e = ub(h, d, !0, a) && e; e = ub(h, d, !1, a) && e; if (b)
        for (f = 0; f < b.length; f++)
            h = a.a = b[f], e = ub(h, d, !1, a) && e; return e; };
    g.C = function () { B.M.C.call(this); if (this.c) {
        var a = this.c, c;
        for (c in a.a) {
            for (var d = a.a[c], e = 0; e < d.length; e++)
                bb(d[e]);
            delete a.a[c];
            a.b--;
        }
    } this.A = null; };
    g.ra = function (a, b, c, d) { return this.c.add(String(a), b, !1, c, d); };
    g.sa = function (a, b, c, d) { return this.c.add(String(a), b, !0, c, d); };
    function ub(a, b, c, d) { b = a.c.a[String(b)]; if (!b)
        return !0; b = b.concat(); for (var e = !0, f = 0; f < b.length; ++f) {
        var h = b[f];
        if (h && !h.V && h.capture == c) {
            var l = h.listener, p = h.aa || h.src;
            h.X && eb(a.c, h);
            e = !1 !== l.call(p, d) && e;
        }
    } return e && !d.defaultPrevented; }
    var vb = k.JSON.stringify;
    function wb() { this.b = this.a = null; }
    var yb = new /** @class */ (function () {
        function class_1(a, b, c) {
            this.f = c;
            this.c = a;
            this.g = b;
            this.b = 0;
            this.a = null;
        }
        class_1.prototype.get = function () { var a; 0 < this.b ? (this.b--, a = this.a, this.a = a.next, a.next = null) : a = this.c(); return a; };
        return class_1;
    }())(function () { return new xb; }, function (a) { a.reset(); }, 100);
    wb.prototype.add = function (a, b) { var c = yb.get(); c.set(a, b); this.b ? this.b.next = c : this.a = c; this.b = c; };
    function zb() { var a = Ab, b = null; a.a && (b = a.a, a.a = a.a.next, a.a || (a.b = null), b.next = null); return b; }
    function xb() { this.next = this.b = this.a = null; }
    xb.prototype.set = function (a, b) { this.a = a; this.b = b; this.next = null; };
    xb.prototype.reset = function () { this.next = this.b = this.a = null; };
    function Bb(a) { k.setTimeout(function () { throw a; }, 0); }
    function Cb(a, b) { Db || Eb(); Fb || (Db(), Fb = !0); Ab.add(a, b); }
    var Db;
    function Eb() { var a = k.Promise.resolve(void 0); Db = function () { a.then(Gb); }; }
    var Fb = !1, Ab = new wb;
    function Gb() { for (var a; a = zb();) {
        try {
            a.a.call(a.b);
        }
        catch (c) {
            Bb(c);
        }
        var b = yb;
        b.g(a);
        b.b < b.f && (b.b++, a.next = b.a, b.a = a);
    } Fb = !1; }
    function Hb(a, b) { B.call(this); this.b = a || 1; this.a = b || k; this.f = n(this.Ua, this); this.g = q(); }
    r(Hb, B);
    g = Hb.prototype;
    g.Z = !1;
    g.L = null;
    g.Ua = function () { if (this.Z) {
        var a = q() - this.g;
        0 < a && a < .8 * this.b ? this.L = this.a.setTimeout(this.f, this.b - a) : (this.L && (this.a.clearTimeout(this.L), this.L = null), this.dispatchEvent("tick"), this.Z && (Ib(this), this.start()));
    } };
    g.start = function () { this.Z = !0; this.L || (this.L = this.a.setTimeout(this.f, this.b), this.g = q()); };
    function Ib(a) { a.Z = !1; a.L && (a.a.clearTimeout(a.L), a.L = null); }
    g.C = function () { Hb.M.C.call(this); Ib(this); delete this.a; };
    function Jb(a, b, c) { if ("function" == ba(a))
        c && (a = n(a, c));
    else if (a && "function" == typeof a.handleEvent)
        a = n(a.handleEvent, a);
    else
        throw Error("Invalid listener argument"); return 2147483647 < Number(b) ? -1 : k.setTimeout(a, b || 0); }
    function Kb(a, b, c) { t.call(this); this.f = null != c ? n(a, c) : a; this.c = b; this.b = n(this.Pa, this); this.a = []; }
    r(Kb, t);
    g = Kb.prototype;
    g.ba = !1;
    g.T = null;
    g.Ia = function (a) { this.a = arguments; this.T ? this.ba = !0 : Lb(this); };
    g.C = function () { Kb.M.C.call(this); this.T && (k.clearTimeout(this.T), this.T = null, this.ba = !1, this.a = []); };
    g.Pa = function () { this.T = null; this.ba && (this.ba = !1, Lb(this)); };
    function Lb(a) { a.T = Jb(a.b, a.c); a.f.apply(null, a.a); }
    function C(a) { t.call(this); this.b = a; this.a = {}; }
    r(C, t);
    var Mb = [];
    function Nb(a, b, c, d) { Array.isArray(c) || (c && (Mb[0] = c.toString()), c = Mb); for (var e = 0; e < c.length; e++) {
        var f = ib(b, c[e], d || a.handleEvent, !1, a.b || a);
        if (!f)
            break;
        a.a[f.key] = f;
    } }
    function Ob(a) { Ba(a.a, function (b, c) { this.a.hasOwnProperty(c) && rb(b); }, a); a.a = {}; }
    C.prototype.C = function () { C.M.C.call(this); Ob(this); };
    C.prototype.handleEvent = function () { throw Error("EventHandler.handleEvent not implemented"); };
    function Pb() { }
    var Qb = null;
    function Rb() { return Qb = Qb || new B; }
    function Sb(a) { x.call(this, "serverreachability", a); }
    r(Sb, x);
    function E(a) { var b = Rb(); b.dispatchEvent(new Sb(b, a)); }
    function Tb(a) { x.call(this, "statevent", a); }
    r(Tb, x);
    function F(a) { var b = Rb(); b.dispatchEvent(new Tb(b, a)); }
    function Ub(a) { x.call(this, "timingevent", a); }
    r(Ub, x);
    function Vb(a, b) { if ("function" != ba(a))
        throw Error("Fn must not be null and must be a function"); return k.setTimeout(function () { a(); }, b); }
    var Wb = { NO_ERROR: 0, Va: 1, bb: 2, ab: 3, Ya: 4, $a: 5, cb: 6, za: 7, TIMEOUT: 8, gb: 9 };
    var Xb = { Xa: "complete", kb: "success", Aa: "error", za: "abort", ib: "ready", jb: "readystatechange", TIMEOUT: "timeout", eb: "incrementaldata", hb: "progress", Za: "downloadprogress", lb: "uploadprogress" };
    function Yb() { }
    Yb.prototype.a = null;
    function Zb(a) { var b; (b = a.a) || (b = a.a = {}); return b; }
    function $b() { }
    var G = { OPEN: "a", Wa: "b", Aa: "c", fb: "d" };
    function ac() { x.call(this, "d"); }
    r(ac, x);
    function bc() { x.call(this, "c"); }
    r(bc, x);
    var cc;
    function dc() { }
    r(dc, Yb);
    cc = new dc;
    function H(a, b, c) { this.g = a; this.W = b; this.U = c || 1; this.G = new C(this); this.N = ec; a = Ka ? 125 : void 0; this.O = new Hb(a); this.m = null; this.b = !1; this.j = this.A = this.f = this.B = this.s = this.P = this.h = null; this.i = []; this.a = null; this.w = 0; this.c = this.v = null; this.H = -1; this.l = !1; this.J = 0; this.D = null; this.o = this.R = this.F = !1; }
    var ec = 45E3, fc = {}, gc = {};
    g = H.prototype;
    g.setTimeout = function (a) { this.N = a; };
    function hc(a, b, c) { a.B = 1; a.f = ic(I(b)); a.j = c; a.F = !0; jc(a, null); }
    function jc(a, b) { a.s = q(); J(a); a.A = I(a.f); var c = a.A, d = a.U; Array.isArray(d) || (d = [String(d)]); kc(c.b, "t", d); a.w = 0; a.a = lc(a.g, a.g.w ? b : null); 0 < a.J && (a.D = new Kb(n(a.ya, a, a.a), a.J)); Nb(a.G, a.a, "readystatechange", a.Sa); b = a.m ? Ca(a.m) : {}; a.j ? (a.v || (a.v = "POST"), b["Content-Type"] = "application/x-www-form-urlencoded", a.a.$(a.A, a.v, a.j, b)) : (a.v = "GET", a.a.$(a.A, a.v, null, b)); E(1); }
    g.Sa = function (a) { a = a.target; var b = this.D; b && 3 == K(a) ? b.Ia() : this.ya(a); };
    g.ya = function (a) {
        try {
            if (a == this.a)
                a: {
                    var b = K(this.a), c = this.a.qa(), d = this.a.S();
                    if (!(3 > b || 3 == b && !Ka && !this.a.Y())) {
                        this.l || 4 != b || 7 == c || (8 == c || 0 >= d ? E(3) : E(2));
                        mc(this);
                        var e = this.a.S();
                        this.H = e;
                        var f = this.a.Y();
                        if (this.b = 200 == e) {
                            if (this.R && !this.o) {
                                b: {
                                    if (this.a) {
                                        var h, l = this.a;
                                        if ((h = l.a ? l.a.getResponseHeader("X-HTTP-Initial-Response") : null) && !wa(h)) {
                                            var p = h;
                                            break b;
                                        }
                                    }
                                    p = null;
                                }
                                if (p)
                                    this.o = !0, nc(this, p);
                                else {
                                    this.b = !1;
                                    this.c = 3;
                                    F(12);
                                    L(this);
                                    pc(this);
                                    break a;
                                }
                            }
                            this.F ? (qc(this, b, f), Ka && this.b && 3 == b && (Nb(this.G, this.O, "tick", this.Ra), this.O.start())) : nc(this, f);
                            4 == b && L(this);
                            this.b && !this.l && (4 == b ? rc(this.g, this) : (this.b = !1, J(this)));
                        }
                        else
                            400 == e && 0 < f.indexOf("Unknown SID") ? (this.c = 3, F(12)) : (this.c = 0, F(13)), L(this), pc(this);
                    }
                }
        }
        catch (D) { }
        finally { }
    };
    function qc(a, b, c) { for (var d = !0; !a.l && a.w < c.length;) {
        var e = tc(a, c);
        if (e == gc) {
            4 == b && (a.c = 4, F(14), d = !1);
            break;
        }
        else if (e == fc) {
            a.c = 4;
            F(15);
            d = !1;
            break;
        }
        else
            nc(a, e);
    } 4 == b && 0 == c.length && (a.c = 1, F(16), d = !1); a.b = a.b && d; d || (L(a), pc(a)); }
    g.Ra = function () { if (this.a) {
        var a = K(this.a), b = this.a.Y();
        this.w < b.length && (mc(this), qc(this, a, b), this.b && 4 != a && J(this));
    } };
    function tc(a, b) { var c = a.w, d = b.indexOf("\n", c); if (-1 == d)
        return gc; c = Number(b.substring(c, d)); if (isNaN(c))
        return fc; d += 1; if (d + c > b.length)
        return gc; b = b.substr(d, c); a.w = d + c; return b; }
    g.cancel = function () { this.l = !0; L(this); };
    function J(a) { a.P = q() + a.N; uc(a, a.N); }
    function uc(a, b) { if (null != a.h)
        throw Error("WatchDog timer not null"); a.h = Vb(n(a.Qa, a), b); }
    function mc(a) { a.h && (k.clearTimeout(a.h), a.h = null); }
    g.Qa = function () { this.h = null; var a = q(); 0 <= a - this.P ? (2 != this.B && (E(3), F(17)), L(this), this.c = 2, pc(this)) : uc(this, this.P - a); };
    function pc(a) { 0 == a.g.u || a.l || rc(a.g, a); }
    function L(a) { mc(a); var b = a.D; b && "function" == typeof b.da && b.da(); a.D = null; Ib(a.O); Ob(a.G); a.a && (b = a.a, a.a = null, b.abort(), b.da()); }
    function nc(a, b) {
        try {
            var c = a.g;
            if (0 != c.u && (c.a == a || vc(c.b, a)))
                if (c.A = a.H, !a.o && vc(c.b, a) && 3 == c.u) {
                    try {
                        var d = c.ja.a.parse(b);
                    }
                    catch (oc) {
                        d = null;
                    }
                    if (Array.isArray(d) && 3 == d.length) {
                        var e = d;
                        if (0 == e[0])
                            a: {
                                if (!c.i) {
                                    if (c.a)
                                        if (c.a.s + 3E3 < a.s)
                                            wc(c), c.a.cancel(), c.a = null;
                                        else
                                            break a;
                                    xc(c);
                                    F(18);
                                }
                            }
                        else
                            c.ia = e[1], 0 < c.ia - c.G && 37500 > e[2] && c.U && 0 == c.m && !c.l && (c.l = Vb(n(c.Na, c), 6E3));
                        if (1 >= yc(c.b) && c.O) {
                            try {
                                c.O();
                            }
                            catch (oc) { }
                            c.O = void 0;
                        }
                    }
                    else
                        M(c, 11);
                }
                else if ((a.o || c.a == a) && wc(c), !wa(b))
                    for (b = d = c.ja.a.parse(b), d = 0; d < b.length; d++)
                        if (e =
                            b[d], c.G = e[0], e = e[1], 2 == c.u)
                            if ("c" == e[0]) {
                                c.B = e[1];
                                c.R = e[2];
                                var f = e[3];
                                null != f && (c.oa = f);
                                var h = e[5];
                                null != h && "number" === typeof h && 0 < h && (c.D = 1.5 * h);
                                var l = c, p = a.a;
                                if (p) {
                                    var D = p.a ? p.a.getResponseHeader("X-Client-Wire-Protocol") : null;
                                    if (D) {
                                        var z = l.b;
                                        !z.a && (u(D, "spdy") || u(D, "quic") || u(D, "h2")) && (z.f = z.g, z.a = new Set, z.b && (zc(z, z.b), z.b = null));
                                    }
                                    if (l.s) {
                                        var ta = p.a ? p.a.getResponseHeader("X-HTTP-Session-Id") : null;
                                        ta && (l.ha = ta, N(l.v, l.s, ta));
                                    }
                                }
                                c.u = 3;
                                c.c && c.c.na();
                                l = c;
                                var ua = a;
                                l.ea = Ac(l, l.w ? l.R : null, l.P);
                                if (ua.o) {
                                    Bc(l.b, ua);
                                    var va = ua, sc = l.D;
                                    sc && va.setTimeout(sc);
                                    va.h && (mc(va), J(va));
                                    l.a = ua;
                                }
                                else
                                    Cc(l);
                                0 < c.f.length && Dc(c);
                            }
                            else
                                "stop" != e[0] && "close" != e[0] || M(c, 7);
                        else
                            3 == c.u && ("stop" == e[0] || "close" == e[0] ? "stop" == e[0] ? M(c, 7) : Ec(c) : "noop" != e[0] && c.c && c.c.ma(e), c.m = 0);
            E(4);
        }
        catch (oc) { }
    }
    function Fc(a) { if (a.I && "function" == typeof a.I)
        return a.I(); if ("string" === typeof a)
        return a.split(""); if (da(a)) {
        for (var b = [], c = a.length, d = 0; d < c; d++)
            b.push(a[d]);
        return b;
    } b = []; c = 0; for (d in a)
        b[c++] = a[d]; return a = b; }
    function Gc(a, b) { if (a.forEach && "function" == typeof a.forEach)
        a.forEach(b, void 0);
    else if (da(a) || "string" === typeof a)
        oa(a, b, void 0);
    else {
        if (a.K && "function" == typeof a.K)
            var c = a.K();
        else if (a.I && "function" == typeof a.I)
            c = void 0;
        else if (da(a) || "string" === typeof a) {
            c = [];
            for (var d = a.length, e = 0; e < d; e++)
                c.push(e);
        }
        else
            for (e in c = [], d = 0, a)
                c[d++] = e;
        d = Fc(a);
        e = d.length;
        for (var f = 0; f < e; f++)
            b.call(void 0, d[f], c && c[f], a);
    } }
    function O(a, b) { this.b = {}; this.a = []; this.c = 0; var c = arguments.length; if (1 < c) {
        if (c % 2)
            throw Error("Uneven number of arguments");
        for (var d = 0; d < c; d += 2)
            this.set(arguments[d], arguments[d + 1]);
    }
    else if (a)
        if (a instanceof O)
            for (c = a.K(), d = 0; d < c.length; d++)
                this.set(c[d], a.get(c[d]));
        else
            for (d in a)
                this.set(d, a[d]); }
    g = O.prototype;
    g.I = function () { Hc(this); for (var a = [], b = 0; b < this.a.length; b++)
        a.push(this.b[this.a[b]]); return a; };
    g.K = function () { Hc(this); return this.a.concat(); };
    function Hc(a) { if (a.c != a.a.length) {
        for (var b = 0, c = 0; b < a.a.length;) {
            var d = a.a[b];
            P(a.b, d) && (a.a[c++] = d);
            b++;
        }
        a.a.length = c;
    } if (a.c != a.a.length) {
        var e = {};
        for (c = b = 0; b < a.a.length;)
            d = a.a[b], P(e, d) || (a.a[c++] = d, e[d] = 1), b++;
        a.a.length = c;
    } }
    g.get = function (a, b) { return P(this.b, a) ? this.b[a] : b; };
    g.set = function (a, b) { P(this.b, a) || (this.c++, this.a.push(a)); this.b[a] = b; };
    g.forEach = function (a, b) { for (var c = this.K(), d = 0; d < c.length; d++) {
        var e = c[d], f = this.get(e);
        a.call(b, f, e, this);
    } };
    function P(a, b) { return Object.prototype.hasOwnProperty.call(a, b); }
    var Ic = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;
    function Jc(a, b) { if (a) {
        a = a.split("&");
        for (var c = 0; c < a.length; c++) {
            var d = a[c].indexOf("="), e = null;
            if (0 <= d) {
                var f = a[c].substring(0, d);
                e = a[c].substring(d + 1);
            }
            else
                f = a[c];
            b(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "");
        }
    } }
    function Q(a, b) { this.c = this.j = this.f = ""; this.h = null; this.i = this.g = ""; this.a = !1; if (a instanceof Q) {
        this.a = void 0 !== b ? b : a.a;
        Kc(this, a.f);
        this.j = a.j;
        Lc(this, a.c);
        Mc(this, a.h);
        this.g = a.g;
        b = a.b;
        var c = new R;
        c.c = b.c;
        b.a && (c.a = new O(b.a), c.b = b.b);
        Nc(this, c);
        this.i = a.i;
    }
    else
        a && (c = String(a).match(Ic)) ? (this.a = !!b, Kc(this, c[1] || "", !0), this.j = S(c[2] || ""), Lc(this, c[3] || "", !0), Mc(this, c[4]), this.g = S(c[5] || "", !0), Nc(this, c[6] || "", !0), this.i = S(c[7] || "")) : (this.a = !!b, this.b = new R(null, this.a)); }
    Q.prototype.toString = function () { var a = [], b = this.f; b && a.push(T(b, Oc, !0), ":"); var c = this.c; if (c || "file" == b)
        a.push("//"), (b = this.j) && a.push(T(b, Oc, !0), "@"), a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.h, null != c && a.push(":", String(c)); if (c = this.g)
        this.c && "/" != c.charAt(0) && a.push("/"), a.push(T(c, "/" == c.charAt(0) ? Pc : Qc, !0)); (c = this.b.toString()) && a.push("?", c); (c = this.i) && a.push("#", T(c, Rc)); return a.join(""); };
    function I(a) { return new Q(a); }
    function Kc(a, b, c) { a.f = c ? S(b, !0) : b; a.f && (a.f = a.f.replace(/:$/, "")); }
    function Lc(a, b, c) { a.c = c ? S(b, !0) : b; }
    function Mc(a, b) { if (b) {
        b = Number(b);
        if (isNaN(b) || 0 > b)
            throw Error("Bad port number " + b);
        a.h = b;
    }
    else
        a.h = null; }
    function Nc(a, b, c) { b instanceof R ? (a.b = b, Sc(a.b, a.a)) : (c || (b = T(b, Tc)), a.b = new R(b, a.a)); }
    function N(a, b, c) { a.b.set(b, c); }
    function ic(a) { N(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ q()).toString(36)); return a; }
    function Uc(a) { return a instanceof Q ? I(a) : new Q(a, void 0); }
    function Vc(a, b, c, d) { var e = new Q(null, void 0); a && Kc(e, a); b && Lc(e, b); c && Mc(e, c); d && (e.g = d); return e; }
    function S(a, b) { return a ? b ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : ""; }
    function T(a, b, c) { return "string" === typeof a ? (a = encodeURI(a).replace(b, Wc), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null; }
    function Wc(a) { a = a.charCodeAt(0); return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16); }
    var Oc = /[#\/\?@]/g, Qc = /[#\?:]/g, Pc = /[#\?]/g, Tc = /[#\?@]/g, Rc = /#/g;
    function R(a, b) { this.b = this.a = null; this.c = a || null; this.f = !!b; }
    function U(a) { a.a || (a.a = new O, a.b = 0, a.c && Jc(a.c, function (b, c) { a.add(decodeURIComponent(b.replace(/\+/g, " ")), c); })); }
    g = R.prototype;
    g.add = function (a, b) { U(this); this.c = null; a = V(this, a); var c = this.a.get(a); c || this.a.set(a, c = []); c.push(b); this.b += 1; return this; };
    function Xc(a, b) { U(a); b = V(a, b); P(a.a.b, b) && (a.c = null, a.b -= a.a.get(b).length, a = a.a, P(a.b, b) && (delete a.b[b], a.c--, a.a.length > 2 * a.c && Hc(a))); }
    function Yc(a, b) { U(a); b = V(a, b); return P(a.a.b, b); }
    g.forEach = function (a, b) { U(this); this.a.forEach(function (c, d) { oa(c, function (e) { a.call(b, e, d, this); }, this); }, this); };
    g.K = function () { U(this); for (var a = this.a.I(), b = this.a.K(), c = [], d = 0; d < b.length; d++)
        for (var e = a[d], f = 0; f < e.length; f++)
            c.push(b[d]); return c; };
    g.I = function (a) { U(this); var b = []; if ("string" === typeof a)
        Yc(this, a) && (b = ra(b, this.a.get(V(this, a))));
    else {
        a = this.a.I();
        for (var c = 0; c < a.length; c++)
            b = ra(b, a[c]);
    } return b; };
    g.set = function (a, b) { U(this); this.c = null; a = V(this, a); Yc(this, a) && (this.b -= this.a.get(a).length); this.a.set(a, [b]); this.b += 1; return this; };
    g.get = function (a, b) { if (!a)
        return b; a = this.I(a); return 0 < a.length ? String(a[0]) : b; };
    function kc(a, b, c) { Xc(a, b); 0 < c.length && (a.c = null, a.a.set(V(a, b), sa(c)), a.b += c.length); }
    g.toString = function () { if (this.c)
        return this.c; if (!this.a)
        return ""; for (var a = [], b = this.a.K(), c = 0; c < b.length; c++) {
        var d = b[c], e = encodeURIComponent(String(d));
        d = this.I(d);
        for (var f = 0; f < d.length; f++) {
            var h = e;
            "" !== d[f] && (h += "=" + encodeURIComponent(String(d[f])));
            a.push(h);
        }
    } return this.c = a.join("&"); };
    function V(a, b) { b = String(b); a.f && (b = b.toLowerCase()); return b; }
    function Sc(a, b) { b && !a.f && (U(a), a.c = null, a.a.forEach(function (c, d) { var e = d.toLowerCase(); d != e && (Xc(this, d), kc(this, e, c)); }, a)); a.f = b; }
    function Zc(a, b) { this.b = a; this.a = b; }
    function $c(a) { this.g = a || ad; k.PerformanceNavigationTiming ? (a = k.performance.getEntriesByType("navigation"), a = 0 < a.length && ("hq" == a[0].nextHopProtocol || "h2" == a[0].nextHopProtocol)) : a = !!(k.ca && k.ca.ua && k.ca.ua() && k.ca.ua().mb); this.f = a ? this.g : 1; this.a = null; 1 < this.f && (this.a = new Set); this.b = null; this.c = []; }
    var ad = 10;
    function bd(a) { return a.b ? !0 : a.a ? a.a.size >= a.f : !1; }
    function yc(a) { return a.b ? 1 : a.a ? a.a.size : 0; }
    function vc(a, b) { return a.b ? a.b == b : a.a ? a.a.has(b) : !1; }
    function zc(a, b) { a.a ? a.a.add(b) : a.b = b; }
    function Bc(a, b) { a.b && a.b == b ? a.b = null : a.a && a.a.has(b) && a.a.delete(b); }
    $c.prototype.cancel = function () {
        var e_1, _a;
        this.c = cd(this);
        if (this.b)
            this.b.cancel(), this.b = null;
        else if (this.a && 0 !== this.a.size) {
            try {
                for (var _b = __values$1(this.a.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var a = _c.value;
                    a.cancel();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.a.clear();
        }
    };
    function cd(a) {
        var e_2, _a;
        if (null != a.b)
            return a.c.concat(a.b.i);
        if (null != a.a && 0 !== a.a.size) {
            var b = a.c;
            try {
                for (var _b = __values$1(a.a.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var c = _c.value;
                    b = b.concat(c.i);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return b;
        }
        return sa(a.c);
    }
    function dd() { }
    dd.prototype.stringify = function (a) { return k.JSON.stringify(a, void 0); };
    dd.prototype.parse = function (a) { return k.JSON.parse(a, void 0); };
    function ed() { this.a = new dd; }
    function fd(a, b, c) { var d = c || ""; try {
        Gc(a, function (e, f) { var h = e; m(e) && (h = vb(e)); b.push(d + f + "=" + encodeURIComponent(h)); });
    }
    catch (e) {
        throw b.push(d + "type=" + encodeURIComponent("_badmap")), e;
    } }
    function gd(a, b) { var c = new Pb; if (k.Image) {
        var d = new Image;
        d.onload = ka(hd, c, d, "TestLoadImage: loaded", !0, b);
        d.onerror = ka(hd, c, d, "TestLoadImage: error", !1, b);
        d.onabort = ka(hd, c, d, "TestLoadImage: abort", !1, b);
        d.ontimeout = ka(hd, c, d, "TestLoadImage: timeout", !1, b);
        k.setTimeout(function () { if (d.ontimeout)
            d.ontimeout(); }, 1E4);
        d.src = a;
    }
    else
        b(!1); }
    function hd(a, b, c, d, e) { try {
        b.onload = null, b.onerror = null, b.onabort = null, b.ontimeout = null, e(d);
    }
    catch (f) { } }
    var id = k.JSON.parse;
    function W(a) { B.call(this); this.headers = new O; this.G = a || null; this.b = !1; this.s = this.a = null; this.D = ""; this.h = 0; this.f = ""; this.g = this.w = this.l = this.v = !1; this.o = 0; this.m = null; this.H = jd; this.B = this.F = !1; }
    r(W, B);
    var jd = "", kd = /^https?$/i, ld = ["POST", "PUT"];
    g = W.prototype;
    g.$ = function (a, b, c, d) {
        if (this.a)
            throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + a);
        b = b ? b.toUpperCase() : "GET";
        this.D = a;
        this.f = "";
        this.h = 0;
        this.v = !1;
        this.b = !0;
        this.a = new XMLHttpRequest;
        this.s = this.G ? Zb(this.G) : Zb(cc);
        this.a.onreadystatechange = n(this.va, this);
        try {
            this.w = !0, this.a.open(b, String(a), !0), this.w = !1;
        }
        catch (f) {
            md(this, f);
            return;
        }
        a = c || "";
        var e = new O(this.headers);
        d && Gc(d, function (f, h) { e.set(h, f); });
        d = pa(e.K());
        c = k.FormData && a instanceof k.FormData;
        !(0 <=
            na(ld, b)) || d || c || e.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        e.forEach(function (f, h) { this.a.setRequestHeader(h, f); }, this);
        this.H && (this.a.responseType = this.H);
        "withCredentials" in this.a && this.a.withCredentials !== this.F && (this.a.withCredentials = this.F);
        try {
            nd(this), 0 < this.o && ((this.B = od(this.a)) ? (this.a.timeout = this.o, this.a.ontimeout = n(this.ta, this)) : this.m = Jb(this.ta, this.o, this)), this.l = !0, this.a.send(a), this.l = !1;
        }
        catch (f) {
            md(this, f);
        }
    };
    function od(a) { return w && Sa(9) && "number" === typeof a.timeout && void 0 !== a.ontimeout; }
    function qa(a) { return "content-type" == a.toLowerCase(); }
    g.ta = function () { "undefined" != typeof goog && this.a && (this.f = "Timed out after " + this.o + "ms, aborting", this.h = 8, this.dispatchEvent("timeout"), this.abort(8)); };
    function md(a, b) { a.b = !1; a.a && (a.g = !0, a.a.abort(), a.g = !1); a.f = b; a.h = 5; pd(a); qd(a); }
    function pd(a) { a.v || (a.v = !0, a.dispatchEvent("complete"), a.dispatchEvent("error")); }
    g.abort = function (a) { this.a && this.b && (this.b = !1, this.g = !0, this.a.abort(), this.g = !1, this.h = a || 7, this.dispatchEvent("complete"), this.dispatchEvent("abort"), qd(this)); };
    g.C = function () { this.a && (this.b && (this.b = !1, this.g = !0, this.a.abort(), this.g = !1), qd(this, !0)); W.M.C.call(this); };
    g.va = function () { this.j || (this.w || this.l || this.g ? rd(this) : this.Oa()); };
    g.Oa = function () { rd(this); };
    function rd(a) {
        if (a.b && "undefined" != typeof goog && (!a.s[1] || 4 != K(a) || 2 != a.S()))
            if (a.l && 4 == K(a))
                Jb(a.va, 0, a);
            else if (a.dispatchEvent("readystatechange"), 4 == K(a)) {
                a.b = !1;
                try {
                    var b = a.S();
                    a: switch (b) {
                        case 200:
                        case 201:
                        case 202:
                        case 204:
                        case 206:
                        case 304:
                        case 1223:
                            var c = !0;
                            break a;
                        default: c = !1;
                    }
                    var d;
                    if (!(d = c)) {
                        var e;
                        if (e = 0 === b) {
                            var f = String(a.D).match(Ic)[1] || null;
                            if (!f && k.self && k.self.location) {
                                var h = k.self.location.protocol;
                                f = h.substr(0, h.length - 1);
                            }
                            e = !kd.test(f ? f.toLowerCase() : "");
                        }
                        d = e;
                    }
                    if (d)
                        a.dispatchEvent("complete"),
                            a.dispatchEvent("success");
                    else {
                        a.h = 6;
                        try {
                            var l = 2 < K(a) ? a.a.statusText : "";
                        }
                        catch (p) {
                            l = "";
                        }
                        a.f = l + " [" + a.S() + "]";
                        pd(a);
                    }
                }
                finally {
                    qd(a);
                }
            }
    }
    function qd(a, b) { if (a.a) {
        nd(a);
        var c = a.a, d = a.s[0] ? aa : null;
        a.a = null;
        a.s = null;
        b || a.dispatchEvent("ready");
        try {
            c.onreadystatechange = d;
        }
        catch (e) { }
    } }
    function nd(a) { a.a && a.B && (a.a.ontimeout = null); a.m && (k.clearTimeout(a.m), a.m = null); }
    function K(a) { return a.a ? a.a.readyState : 0; }
    g.S = function () { try {
        return 2 < K(this) ? this.a.status : -1;
    }
    catch (a) {
        return -1;
    } };
    g.Y = function () { try {
        return this.a ? this.a.responseText : "";
    }
    catch (a) {
        return "";
    } };
    g.Ja = function (a) { if (this.a) {
        var b = this.a.responseText;
        a && 0 == b.indexOf(a) && (b = b.substring(a.length));
        return id(b);
    } };
    g.qa = function () { return this.h; };
    g.Ma = function () { return "string" === typeof this.f ? this.f : String(this.f); };
    function sd(a) { var b = ""; Ba(a, function (c, d) { b += d; b += ":"; b += c; b += "\r\n"; }); return b; }
    function td(a, b, c) { a: {
        for (d in c) {
            var d = !1;
            break a;
        }
        d = !0;
    } d || (c = sd(c), "string" === typeof a ? (null != c && encodeURIComponent(String(c))) : N(a, b, c)); }
    function X(a, b, c) { return c && c.internalChannelParams ? c.internalChannelParams[a] || b : b; }
    function ud(a) {
        this.f = [];
        this.R = this.ea = this.v = this.P = this.a = this.ha = this.s = this.N = this.h = this.F = this.j = null;
        this.Fa = this.H = 0;
        this.Ca = X("failFast", !1, a);
        this.U = this.l = this.i = this.g = this.c = null;
        this.W = !0;
        this.A = this.ia = this.G = -1;
        this.J = this.m = this.o = 0;
        this.Ba = X("baseRetryDelayMs", 5E3, a);
        this.Ga = X("retryDelaySeedMs", 1E4, a);
        this.Da = X("forwardChannelMaxRetries", 2, a);
        this.ga = X("forwardChannelRequestTimeoutMs", 2E4, a);
        this.Ea = a && a.nb || void 0;
        this.D = void 0;
        this.w = a && a.supportsCrossDomainXhr || !1;
        this.B = "";
        this.b = new $c(a && a.concurrentRequestLimit);
        this.ja = new ed;
        this.fa = a && a.fastHandshake || !1;
        a && a.forceLongPolling && (this.W = !1);
        this.O = void 0;
    }
    g = ud.prototype;
    g.oa = 8;
    g.u = 1;
    function Ec(a) { vd(a); if (3 == a.u) {
        var b = a.H++, c = I(a.v);
        N(c, "SID", a.B);
        N(c, "RID", b);
        N(c, "TYPE", "terminate");
        wd(a, c);
        b = new H(a, b, void 0);
        b.B = 2;
        b.f = ic(I(c));
        c = !1;
        k.navigator && k.navigator.sendBeacon && (c = k.navigator.sendBeacon(b.f.toString(), ""));
        !c && k.Image && ((new Image).src = b.f, c = !0);
        c || (b.a = lc(b.g, null), b.a.$(b.f));
        b.s = q();
        J(b);
    } xd(a); }
    function vd(a) { a.a && (a.a.cancel(), a.a = null); a.i && (k.clearTimeout(a.i), a.i = null); wc(a); a.b.cancel(); a.g && ("number" === typeof a.g && k.clearTimeout(a.g), a.g = null); }
    function yd(a, b) { a.f.push(new Zc(a.Fa++, b)); 3 == a.u && Dc(a); }
    function Dc(a) { bd(a.b) || a.g || (a.g = !0, Cb(a.xa, a), a.o = 0); }
    function zd(a, b) { if (yc(a.b) >= a.b.f - (a.g ? 1 : 0))
        return !1; if (a.g)
        return a.f = b.i.concat(a.f), !0; if (1 == a.u || 2 == a.u || a.o >= (a.Ca ? 0 : a.Da))
        return !1; a.g = Vb(n(a.xa, a, b), Ad(a, a.o)); a.o++; return !0; }
    g.xa = function (a) {
        if (this.g)
            if (this.g = null, 1 == this.u) {
                if (!a) {
                    this.H = Math.floor(1E5 * Math.random());
                    a = this.H++;
                    var b = new H(this, a, void 0), c = this.j;
                    this.F && (c ? (c = Ca(c), Ea(c, this.F)) : c = this.F);
                    null === this.h && (b.m = c);
                    var d;
                    if (this.fa)
                        a: {
                            for (var e = d = 0; e < this.f.length; e++) {
                                b: {
                                    var f = this.f[e];
                                    if ("__data__" in f.a && (f = f.a.__data__, "string" === typeof f)) {
                                        f = f.length;
                                        break b;
                                    }
                                    f = void 0;
                                }
                                if (void 0 === f)
                                    break;
                                d += f;
                                if (4096 < d) {
                                    d = e;
                                    break a;
                                }
                                if (4096 === d || e === this.f.length - 1) {
                                    d = e + 1;
                                    break a;
                                }
                            }
                            d = 1E3;
                        }
                    else
                        d = 1E3;
                    d = Bd(this, b, d);
                    e = I(this.v);
                    N(e, "RID", a);
                    N(e, "CVER", 22);
                    this.s && N(e, "X-HTTP-Session-Id", this.s);
                    wd(this, e);
                    this.h && c && td(e, this.h, c);
                    zc(this.b, b);
                    this.fa ? (N(e, "$req", d), N(e, "SID", "null"), b.R = !0, hc(b, e, null)) : hc(b, e, d);
                    this.u = 2;
                }
            }
            else
                3 == this.u && (a ? Cd(this, a) : 0 == this.f.length || bd(this.b) || Cd(this));
    };
    function Cd(a, b) { var c; b ? c = b.W : c = a.H++; var d = I(a.v); N(d, "SID", a.B); N(d, "RID", c); N(d, "AID", a.G); wd(a, d); a.h && a.j && td(d, a.h, a.j); c = new H(a, c, a.o + 1); null === a.h && (c.m = a.j); b && (a.f = b.i.concat(a.f)); b = Bd(a, c, 1E3); c.setTimeout(Math.round(.5 * a.ga) + Math.round(.5 * a.ga * Math.random())); zc(a.b, c); hc(c, d, b); }
    function wd(a, b) { a.c && Gc({}, function (c, d) { N(b, d, c); }); }
    function Bd(a, b, c) { c = Math.min(a.f.length, c); var d = a.c ? n(a.c.Ha, a.c, a) : null; a: for (var e = a.f, f = -1;;) {
        var h = ["count=" + c];
        -1 == f ? 0 < c ? (f = e[0].b, h.push("ofs=" + f)) : f = 0 : h.push("ofs=" + f);
        for (var l = !0, p = 0; p < c; p++) {
            var D = e[p].b, z = e[p].a;
            D -= f;
            if (0 > D)
                f = Math.max(0, e[p].b - 100), l = !1;
            else
                try {
                    fd(z, h, "req" + D + "_");
                }
                catch (ta) {
                    d && d(z);
                }
        }
        if (l) {
            d = h.join("&");
            break a;
        }
    } a = a.f.splice(0, c); b.i = a; return d; }
    function Cc(a) { a.a || a.i || (a.J = 1, Cb(a.wa, a), a.m = 0); }
    function xc(a) { if (a.a || a.i || 3 <= a.m)
        return !1; a.J++; a.i = Vb(n(a.wa, a), Ad(a, a.m)); a.m++; return !0; }
    g.wa = function () { this.i = null; this.a = new H(this, "rpc", this.J); null === this.h && (this.a.m = this.j); this.a.J = 0; var a = I(this.ea); N(a, "RID", "rpc"); N(a, "SID", this.B); N(a, "CI", this.U ? "0" : "1"); N(a, "AID", this.G); wd(this, a); N(a, "TYPE", "xmlhttp"); this.h && this.j && td(a, this.h, this.j); this.D && this.a.setTimeout(this.D); var b = this.a, c = this.R; b.B = 1; b.f = ic(I(a)); b.j = null; b.F = !0; jc(b, c); };
    g.Na = function () { null != this.l && (this.l = null, this.a.cancel(), this.a = null, xc(this), F(19)); };
    function wc(a) { null != a.l && (k.clearTimeout(a.l), a.l = null); }
    function rc(a, b) { var c = null; if (a.a == b) {
        wc(a);
        a.a = null;
        var d = 2;
    }
    else if (vc(a.b, b))
        c = b.i, Bc(a.b, b), d = 1;
    else
        return; a.A = b.H; if (0 != a.u)
        if (b.b)
            if (1 == d) {
                c = b.j ? b.j.length : 0;
                b = q() - b.s;
                var e = a.o;
                d = Rb();
                d.dispatchEvent(new Ub(d, c, b, e));
                Dc(a);
            }
            else
                Cc(a);
        else if (e = b.c, 3 == e || 0 == e && 0 < a.A || !(1 == d && zd(a, b) || 2 == d && xc(a)))
            switch (c && 0 < c.length && (b = a.b, b.c = b.c.concat(c)), e) {
                case 1:
                    M(a, 5);
                    break;
                case 4:
                    M(a, 10);
                    break;
                case 3:
                    M(a, 6);
                    break;
                default: M(a, 2);
            } }
    function Ad(a, b) { var c = a.Ba + Math.floor(Math.random() * a.Ga); a.c || (c *= 2); return c * b; }
    function M(a, b) { if (2 == b) {
        var c = null;
        a.c && (c = null);
        var d = n(a.Ta, a);
        c || (c = new Q("//www.google.com/images/cleardot.gif"), k.location && "http" == k.location.protocol || Kc(c, "https"), ic(c));
        gd(c.toString(), d);
    }
    else
        F(2); a.u = 0; a.c && a.c.la(b); xd(a); vd(a); }
    g.Ta = function (a) { a ? F(2) : F(1); };
    function xd(a) { a.u = 0; a.A = -1; if (a.c) {
        if (0 != cd(a.b).length || 0 != a.f.length)
            a.b.c.length = 0, sa(a.f), a.f.length = 0;
        a.c.ka();
    } }
    function Ac(a, b, c) { var d = Uc(c); if ("" != d.c)
        b && Lc(d, b + "." + d.c), Mc(d, d.h);
    else {
        var e = k.location;
        d = Vc(e.protocol, b ? b + "." + e.hostname : e.hostname, +e.port, c);
    } a.N && Ba(a.N, function (f, h) { N(d, h, f); }); b = a.s; c = a.ha; b && c && N(d, b, c); N(d, "VER", a.oa); wd(a, d); return d; }
    function lc(a, b) { if (b && !a.w)
        throw Error("Can't create secondary domain capable XhrIo object."); b = new W(a.Ea); b.F = a.w; return b; }
    function Dd() { }
    g = Dd.prototype;
    g.na = function () { };
    g.ma = function () { };
    g.la = function () { };
    g.ka = function () { };
    g.Ha = function () { };
    function Ed() { if (w && !(10 <= Number(Va)))
        throw Error("Environmental error: no available transport."); }
    Ed.prototype.a = function (a, b) { return new Y(a, b); };
    function Y(a, b) {
        B.call(this);
        this.a = new ud(b);
        this.l = a;
        this.b = b && b.messageUrlParams || null;
        a = b && b.messageHeaders || null;
        b && b.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = { "X-Client-Protocol": "webchannel" });
        this.a.j = a;
        a = b && b.initMessageHeaders || null;
        b && b.messageContentType && (a ? a["X-WebChannel-Content-Type"] = b.messageContentType : a = { "X-WebChannel-Content-Type": b.messageContentType });
        b && b.pa && (a ? a["X-WebChannel-Client-Profile"] = b.pa : a = { "X-WebChannel-Client-Profile": b.pa });
        this.a.F =
            a;
        (a = b && b.httpHeadersOverwriteParam) && !wa(a) && (this.a.h = a);
        this.h = b && b.supportsCrossDomainXhr || !1;
        this.g = b && b.sendRawJson || !1;
        (b = b && b.httpSessionIdParam) && !wa(b) && (this.a.s = b, a = this.b, null !== a && b in a && (a = this.b, b in a && delete a[b]));
        this.f = new Z(this);
    }
    r(Y, B);
    g = Y.prototype;
    g.addEventListener = function (a, b, c, d) { Y.M.addEventListener.call(this, a, b, c, d); };
    g.removeEventListener = function (a, b, c, d) { Y.M.removeEventListener.call(this, a, b, c, d); };
    g.Ka = function () { this.a.c = this.f; this.h && (this.a.w = !0); var a = this.a, b = this.l, c = this.b || void 0; F(0); a.P = b; a.N = c || {}; a.U = a.W; a.v = Ac(a, null, a.P); Dc(a); };
    g.close = function () { Ec(this.a); };
    g.La = function (a) { if ("string" === typeof a) {
        var b = {};
        b.__data__ = a;
        yd(this.a, b);
    }
    else
        this.g ? (b = {}, b.__data__ = vb(a), yd(this.a, b)) : yd(this.a, a); };
    g.C = function () { this.a.c = null; delete this.f; Ec(this.a); delete this.a; Y.M.C.call(this); };
    function Fd(a) { ac.call(this); var b = a.__sm__; if (b) {
        a: {
            for (var c in b) {
                a = c;
                break a;
            }
            a = void 0;
        }
        (this.c = a) ? (a = this.c, this.data = null !== b && a in b ? b[a] : void 0) : this.data = b;
    }
    else
        this.data = a; }
    r(Fd, ac);
    function Gd() { bc.call(this); this.status = 1; }
    r(Gd, bc);
    function Z(a) { this.a = a; }
    r(Z, Dd);
    Z.prototype.na = function () { this.a.dispatchEvent("a"); };
    Z.prototype.ma = function (a) { this.a.dispatchEvent(new Fd(a)); };
    Z.prototype.la = function (a) { this.a.dispatchEvent(new Gd(a)); };
    Z.prototype.ka = function () { this.a.dispatchEvent("b"); }; /*

     Copyright 2017 Google Inc.

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
    */
    Ed.prototype.createWebChannel = Ed.prototype.a;
    Y.prototype.send = Y.prototype.La;
    Y.prototype.open = Y.prototype.Ka;
    Y.prototype.close = Y.prototype.close;
    Wb.NO_ERROR = 0;
    Wb.TIMEOUT = 8;
    Wb.HTTP_ERROR = 6;
    Xb.COMPLETE = "complete";
    $b.EventType = G;
    G.OPEN = "a";
    G.CLOSE = "b";
    G.ERROR = "c";
    G.MESSAGE = "d";
    B.prototype.listen = B.prototype.ra;
    W.prototype.listenOnce = W.prototype.sa;
    W.prototype.getLastError = W.prototype.Ma;
    W.prototype.getLastErrorCode = W.prototype.qa;
    W.prototype.getStatus = W.prototype.S;
    W.prototype.getResponseJson = W.prototype.Ja;
    W.prototype.getResponseText = W.prototype.Y;
    W.prototype.send = W.prototype.$;
    var esm = { createWebChannelTransport: function () { return new Ed; }, ErrorCode: Wb, EventType: Xb, WebChannel: $b, XhrIo: W };

    var index_cjs$4 = createCommonjsModule(function (module, exports) {

    Object.defineProperty(exports, "__esModule", {
        value: !0
    });

    var t, e = tslib_es6, n = (t = index_cjs$2) && "object" == typeof t && "default" in t ? t.default : t, r = index_esm, i = index_cjs, o = index_cjs$1, s = esm, u = n.SDK_VERSION, a = /** @class */ function() {
        function t(t) {
            this.uid = t;
        }
        return t.prototype.t = function() {
            return null != this.uid;
        }, 
        /**
         * Returns a key representing this user, suitable for inclusion in a
         * dictionary.
         */
        t.prototype.s = function() {
            return this.t() ? "uid:" + this.uid : "anonymous-user";
        }, t.prototype.isEqual = function(t) {
            return t.uid === this.uid;
        }, t;
    }();

    /** A user with a null UID. */ a.UNAUTHENTICATED = new a(null), 
    // TODO(mikelehen): Look into getting a proper uid-equivalent for
    // non-FirebaseAuth providers.
    a.i = new a("google-credentials-uid"), a.h = new a("first-party-uid");

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var c = {
        // Causes are copied from:
        // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
        /** Not an error; returned on success. */
        OK: "ok",
        /** The operation was cancelled (typically by the caller). */
        CANCELLED: "cancelled",
        /** Unknown error or an error from a different error domain. */
        UNKNOWN: "unknown",
        /**
         * Client specified an invalid argument. Note that this differs from
         * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
         * problematic regardless of the state of the system (e.g., a malformed file
         * name).
         */
        INVALID_ARGUMENT: "invalid-argument",
        /**
         * Deadline expired before operation could complete. For operations that
         * change the state of the system, this error may be returned even if the
         * operation has completed successfully. For example, a successful response
         * from a server could have been delayed long enough for the deadline to
         * expire.
         */
        DEADLINE_EXCEEDED: "deadline-exceeded",
        /** Some requested entity (e.g., file or directory) was not found. */
        NOT_FOUND: "not-found",
        /**
         * Some entity that we attempted to create (e.g., file or directory) already
         * exists.
         */
        ALREADY_EXISTS: "already-exists",
        /**
         * The caller does not have permission to execute the specified operation.
         * PERMISSION_DENIED must not be used for rejections caused by exhausting
         * some resource (use RESOURCE_EXHAUSTED instead for those errors).
         * PERMISSION_DENIED must not be used if the caller can not be identified
         * (use UNAUTHENTICATED instead for those errors).
         */
        PERMISSION_DENIED: "permission-denied",
        /**
         * The request does not have valid authentication credentials for the
         * operation.
         */
        UNAUTHENTICATED: "unauthenticated",
        /**
         * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
         * entire file system is out of space.
         */
        RESOURCE_EXHAUSTED: "resource-exhausted",
        /**
         * Operation was rejected because the system is not in a state required for
         * the operation's execution. For example, directory to be deleted may be
         * non-empty, an rmdir operation is applied to a non-directory, etc.
         *
         * A litmus test that may help a service implementor in deciding
         * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
         *  (a) Use UNAVAILABLE if the client can retry just the failing call.
         *  (b) Use ABORTED if the client should retry at a higher-level
         *      (e.g., restarting a read-modify-write sequence).
         *  (c) Use FAILED_PRECONDITION if the client should not retry until
         *      the system state has been explicitly fixed. E.g., if an "rmdir"
         *      fails because the directory is non-empty, FAILED_PRECONDITION
         *      should be returned since the client should not retry unless
         *      they have first fixed up the directory by deleting files from it.
         *  (d) Use FAILED_PRECONDITION if the client performs conditional
         *      REST Get/Update/Delete on a resource and the resource on the
         *      server does not match the condition. E.g., conflicting
         *      read-modify-write on the same resource.
         */
        FAILED_PRECONDITION: "failed-precondition",
        /**
         * The operation was aborted, typically due to a concurrency issue like
         * sequencer check failures, transaction aborts, etc.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        ABORTED: "aborted",
        /**
         * Operation was attempted past the valid range. E.g., seeking or reading
         * past end of file.
         *
         * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
         * if the system state changes. For example, a 32-bit file system will
         * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
         * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
         * an offset past the current file size.
         *
         * There is a fair bit of overlap between FAILED_PRECONDITION and
         * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
         * when it applies so that callers who are iterating through a space can
         * easily look for an OUT_OF_RANGE error to detect when they are done.
         */
        OUT_OF_RANGE: "out-of-range",
        /** Operation is not implemented or not supported/enabled in this service. */
        UNIMPLEMENTED: "unimplemented",
        /**
         * Internal errors. Means some invariants expected by underlying System has
         * been broken. If you see one of these errors, Something is very broken.
         */
        INTERNAL: "internal",
        /**
         * The service is currently unavailable. This is a most likely a transient
         * condition and may be corrected by retrying with a backoff.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        UNAVAILABLE: "unavailable",
        /** Unrecoverable data loss or corruption. */
        DATA_LOSS: "data-loss"
    }, h = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this, n) || this).code = e, r.message = n, r.name = "FirebaseError", 
            // HACK: We write a toString property directly because Error is not a real
            // class and so inheritance does not work correctly. We could alternatively
            // do the same "back-door inheritance" trick that FirebaseError does.
            r.toString = function() {
                return r.name + ": [code=" + r.code + "]: " + r.message;
            }, r;
        }
        return e.__extends(n, t), n;
    }(Error), f = function(t, e) {
        this.user = e, this.type = "OAuth", this.o = {}, 
        // Set the headers using Object Literal notation to avoid minification
        this.o.Authorization = "Bearer " + t;
    }, l = /** @class */ function() {
        function t() {
            /**
             * Stores the listener registered with setChangeListener()
             * This isn't actually necessary since the UID never changes, but we use this
             * to verify the listen contract is adhered to in tests.
             */
            this.u = null;
        }
        return t.prototype.getToken = function() {
            return Promise.resolve(null);
        }, t.prototype._ = function() {}, t.prototype.l = function(t) {
            this.u = t, 
            // Fire with initial user.
            t(a.UNAUTHENTICATED);
        }, t.prototype.T = function() {
            this.u = null;
        }, t;
    }(), p = /** @class */ function() {
        function t(t) {
            var e = this;
            /**
             * The auth token listener registered with FirebaseApp, retained here so we
             * can unregister it.
             */        this.I = null, 
            /** Tracks the current User. */
            this.currentUser = a.UNAUTHENTICATED, this.R = !1, 
            /**
                 * Counter used to detect if the token changed while a getToken request was
                 * outstanding.
                 */
            this.A = 0, 
            /** The listener registered with setChangeListener(). */
            this.u = null, this.forceRefresh = !1, this.I = function() {
                e.A++, e.currentUser = e.m(), e.R = !0, e.u && e.u(e.currentUser);
            }, this.A = 0, this.auth = t.getImmediate({
                optional: !0
            }), this.auth ? this.auth.addAuthTokenListener(this.I) : (
            // if auth is not available, invoke tokenListener once with null token
            this.I(null), t.get().then((function(t) {
                e.auth = t, e.I && 
                // tokenListener can be removed by removeChangeListener()
                e.auth.addAuthTokenListener(e.I);
            }), (function() {})));
        }
        return t.prototype.getToken = function() {
            var t = this, e = this.A, n = this.forceRefresh;
            // Take note of the current value of the tokenCounter so that this method
            // can fail (with an ABORTED error) if there is a token change while the
            // request is outstanding.
                    return this.forceRefresh = !1, this.auth ? this.auth.getToken(n).then((function(n) {
                // Cancel the request since the token changed while the request was
                // outstanding so the response is potentially for a previous user (which
                // user, we can't be sure).
                return t.A !== e ? (le("FirebaseCredentialsProvider", "getToken aborted due to token change."), 
                t.getToken()) : n ? (ve("string" == typeof n.accessToken), new f(n.accessToken, t.currentUser)) : null;
            })) : Promise.resolve(null);
        }, t.prototype._ = function() {
            this.forceRefresh = !0;
        }, t.prototype.l = function(t) {
            this.u = t, 
            // Fire the initial event
            this.R && t(this.currentUser);
        }, t.prototype.T = function() {
            this.auth && this.auth.removeAuthTokenListener(this.I), this.I = null, this.u = null;
        }, 
        // Auth.getUid() can return null even with a user logged in. It is because
        // getUid() is synchronous, but the auth code populating Uid is asynchronous.
        // This method should only be called in the AuthTokenListener callback
        // to guarantee to get the actual user.
        t.prototype.m = function() {
            var t = this.auth && this.auth.getUid();
            return ve(null === t || "string" == typeof t), new a(t);
        }, t;
    }(), d = /** @class */ function() {
        function t(t, e) {
            this.P = t, this.V = e, this.type = "FirstParty", this.user = a.h;
        }
        return Object.defineProperty(t.prototype, "o", {
            get: function() {
                var t = {
                    "X-Goog-AuthUser": this.V
                }, e = this.P.auth.g([]);
                return e && (t.Authorization = e), t;
            },
            enumerable: !0,
            configurable: !0
        }), t;
    }(), y = /** @class */ function() {
        function t(t, e) {
            this.P = t, this.V = e;
        }
        return t.prototype.getToken = function() {
            return Promise.resolve(new d(this.P, this.V));
        }, t.prototype.l = function(t) {
            // Fire with initial uid.
            t(a.h);
        }, t.prototype.T = function() {}, t.prototype._ = function() {}, t;
    }(), v = /** @class */ function() {
        function t(t, e) {
            if (this.seconds = t, this.nanoseconds = e, e < 0) throw new h(c.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (e >= 1e9) throw new h(c.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (t < -62135596800) throw new h(c.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
            // This will break in the year 10,000.
                    if (t >= 253402300800) throw new h(c.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
        }
        return t.now = function() {
            return t.fromMillis(Date.now());
        }, t.fromDate = function(e) {
            return t.fromMillis(e.getTime());
        }, t.fromMillis = function(e) {
            var n = Math.floor(e / 1e3);
            return new t(n, 1e6 * (e - 1e3 * n));
        }, t.prototype.toDate = function() {
            return new Date(this.toMillis());
        }, t.prototype.toMillis = function() {
            return 1e3 * this.seconds + this.nanoseconds / 1e6;
        }, t.prototype.p = function(t) {
            return this.seconds === t.seconds ? we(this.nanoseconds, t.nanoseconds) : we(this.seconds, t.seconds);
        }, t.prototype.isEqual = function(t) {
            return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
        }, t.prototype.toString = function() {
            return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
        }, t.prototype.valueOf = function() {
            // This method returns a string of the form <seconds>.<nanoseconds> where <seconds> is
            // translated to have a non-negative value and both <seconds> and <nanoseconds> are left-padded
            // with zeroes to be a consistent length. Strings with this format then have a lexiographical
            // ordering that matches the expected ordering. The <seconds> translation is done to avoid
            // having a leading negative sign (i.e. a leading '-' character) in its string representation,
            // which would affect its lexiographical ordering.
            var t = this.seconds - -62135596800;
            // Note: Up to 12 decimal digits are required to represent all valid 'seconds' values.
                    return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
        }, t;
    }(), g = /** @class */ function() {
        function t(t) {
            this.timestamp = t;
        }
        return t.v = function(e) {
            return new t(e);
        }, t.min = function() {
            return new t(new v(0, 0));
        }, t.prototype.S = function(t) {
            return this.timestamp.p(t.timestamp);
        }, t.prototype.isEqual = function(t) {
            return this.timestamp.isEqual(t.timestamp);
        }, 
        /** Returns a number representation of the version for use in spec tests. */ t.prototype.D = function() {
            // Convert to microseconds.
            return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
        }, t.prototype.toString = function() {
            return "SnapshotVersion(" + this.timestamp.toString() + ")";
        }, t.prototype.C = function() {
            return this.timestamp;
        }, t;
    }(), m = /** @class */ function() {
        function t(t, e, n) {
            void 0 === e ? e = 0 : e > t.length && ye(), void 0 === n ? n = t.length - e : n > t.length - e && ye(), 
            this.segments = t, this.offset = e, this.F = n;
        }
        return Object.defineProperty(t.prototype, "length", {
            get: function() {
                return this.F;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.isEqual = function(e) {
            return 0 === t.N(this, e);
        }, t.prototype.child = function(e) {
            var n = this.segments.slice(this.offset, this.limit());
            return e instanceof t ? e.forEach((function(t) {
                n.push(t);
            })) : n.push(e), this.k(n);
        }, 
        /** The index of one past the last segment of the path. */ t.prototype.limit = function() {
            return this.offset + this.length;
        }, t.prototype.M = function(t) {
            return t = void 0 === t ? 1 : t, this.k(this.segments, this.offset + t, this.length - t);
        }, t.prototype.$ = function() {
            return this.k(this.segments, this.offset, this.length - 1);
        }, t.prototype.O = function() {
            return this.segments[this.offset];
        }, t.prototype.L = function() {
            return this.get(this.length - 1);
        }, t.prototype.get = function(t) {
            return this.segments[this.offset + t];
        }, t.prototype.B = function() {
            return 0 === this.length;
        }, t.prototype.q = function(t) {
            if (t.length < this.length) return !1;
            for (var e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }, t.prototype.U = function(t) {
            if (this.length + 1 !== t.length) return !1;
            for (var e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }, t.prototype.forEach = function(t) {
            for (var e = this.offset, n = this.limit(); e < n; e++) t(this.segments[e]);
        }, t.prototype.W = function() {
            return this.segments.slice(this.offset, this.limit());
        }, t.N = function(t, e) {
            for (var n = Math.min(t.length, e.length), r = 0; r < n; r++) {
                var i = t.get(r), o = e.get(r);
                if (i < o) return -1;
                if (i > o) return 1;
            }
            return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
        }, t;
    }(), w = /** @class */ function(t) {
        function n() {
            return null !== t && t.apply(this, arguments) || this;
        }
        return e.__extends(n, t), n.prototype.k = function(t, e, r) {
            return new n(t, e, r);
        }, n.prototype.j = function() {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            return this.W().join("/");
        }, n.prototype.toString = function() {
            return this.j();
        }, 
        /**
         * Creates a resource path from the given slash-delimited string.
         */
        n.K = function(t) {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            if (t.indexOf("//") >= 0) throw new h(c.INVALID_ARGUMENT, "Invalid path (" + t + "). Paths must not contain // in them.");
            // We may still have an empty segment at the beginning or end if they had a
            // leading or trailing slash (which we allow).
                    return new n(t.split("/").filter((function(t) {
                return t.length > 0;
            })));
        }, n;
    }(m);

    /**
     * An error class used for Firestore-generated errors. Ideally we should be
     * using FirebaseError, but integrating with it is overly arduous at the moment,
     * so we define our own compatible error class (with a `name` of 'FirebaseError'
     * and compatible `code` and `message` fields.)
     */ w.G = new w([]);

    var E = /^[_a-zA-Z][_a-zA-Z0-9]*$/, _ = /** @class */ function(t) {
        function n() {
            return null !== t && t.apply(this, arguments) || this;
        }
        return e.__extends(n, t), n.prototype.k = function(t, e, r) {
            return new n(t, e, r);
        }, 
        /**
         * Returns true if the string could be used as a segment in a field path
         * without escaping.
         */
        n.H = function(t) {
            return E.test(t);
        }, n.prototype.j = function() {
            return this.W().map((function(t) {
                return t = t.replace("\\", "\\\\").replace("`", "\\`"), n.H(t) || (t = "`" + t + "`"), 
                t;
            })).join(".");
        }, n.prototype.toString = function() {
            return this.j();
        }, 
        /**
         * Returns true if this field references the key of a document.
         */
        n.prototype.Y = function() {
            return 1 === this.length && "__name__" === this.get(0);
        }, 
        /**
         * The field designating the key of a document.
         */
        n.J = function() {
            return new n([ "__name__" ]);
        }, 
        /**
         * Parses a field string from the given server-formatted string.
         *
         * - Splitting the empty string is not allowed (for now at least).
         * - Empty segments within the string (e.g. if there are two consecutive
         *   separators) are not allowed.
         *
         * TODO(b/37244157): we should make this more strict. Right now, it allows
         * non-identifier path components, even if they aren't escaped.
         */
        n.X = function(t) {
            for (var e = [], r = "", i = 0, o = function() {
                if (0 === r.length) throw new h(c.INVALID_ARGUMENT, "Invalid field path (" + t + "). Paths must not be empty, begin with '.', end with '.', or contain '..'");
                e.push(r), r = "";
            }, s = !1; i < t.length; ) {
                var u = t[i];
                if ("\\" === u) {
                    if (i + 1 === t.length) throw new h(c.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
                    var a = t[i + 1];
                    if ("\\" !== a && "." !== a && "`" !== a) throw new h(c.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
                    r += a, i += 2;
                } else "`" === u ? (s = !s, i++) : "." !== u || s ? (r += u, i++) : (o(), i++);
            }
            if (o(), s) throw new h(c.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
            return new n(e);
        }, n;
    }(m);

    /** A dot-separated path for navigating sub-objects within a document. */ _.G = new _([]);

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var b = /** @class */ function() {
        function t(t) {
            this.path = t;
        }
        return t.Z = function(e) {
            return new t(w.K(e).M(5));
        }, 
        /** Returns true if the document is in the specified collectionId. */ t.prototype.tt = function(t) {
            return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
        }, t.prototype.isEqual = function(t) {
            return null !== t && 0 === w.N(this.path, t.path);
        }, t.prototype.toString = function() {
            return this.path.toString();
        }, t.N = function(t, e) {
            return w.N(t.path, e.path);
        }, t.et = function(t) {
            return t.length % 2 == 0;
        }, 
        /**
         * Creates and returns a new document key with the given segments.
         *
         * @param segments The segments of the path to the document
         * @return A new instance of DocumentKey
         */
        t.st = function(e) {
            return new t(new w(e.slice()));
        }, t;
    }();

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function T(t) {
        var e = 0;
        for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
        return e;
    }

    function I(t, e) {
        for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
    }

    function N(t) {
        for (var e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
        return !0;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Immutable class that represents a "proto" byte string.
     *
     * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
     * sent on the wire. This class abstracts away this differentiation by holding
     * the proto byte string in a common class that must be converted into a string
     * before being sent as a proto.
     */ b.EMPTY = new b(new w([]));

    var A = /** @class */ function() {
        function t(t) {
            this.it = t;
        }
        return t.fromBase64String = function(e) {
            return new t(ce.nt().atob(e));
        }, t.fromUint8Array = function(e) {
            return new t(
            /**
     * Helper function to convert an Uint8array to a binary string.
     */
            function(t) {
                for (var e = "", n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
                return e;
            }(e));
        }, t.prototype.toBase64 = function() {
            return ce.nt().btoa(this.it);
        }, t.prototype.toUint8Array = function() {
            return function(t) {
                for (var e = new Uint8Array(t.length), n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
                return e;
            }(this.it);
        }, t.prototype.rt = function() {
            return 2 * this.it.length;
        }, t.prototype.S = function(t) {
            return we(this.it, t.it);
        }, t.prototype.isEqual = function(t) {
            return this.it === t.it;
        }, t;
    }();

    function x(t) {
        return null == t;
    }

    /** Returns whether the value represents -0. */ function D(t) {
        // Detect if the value is -0.0. Based on polyfill from
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        return -0 === t && 1 / t == -1 / 0;
    }

    /**
     * Returns whether a value is an integer and in the safe integer range
     * @param value The value to test for being an integer and in the safe range
     */ function S(t) {
        return "number" == typeof t && Number.isInteger(t) && !D(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a locally-applied ServerTimestamp.
     *
     * Server Timestamps are backed by MapValues that contain an internal field
     * `__type__` with a value of `server_timestamp`. The previous value and local
     * write time are stored in its `__previous_value__` and `__local_write_time__`
     * fields respectively.
     *
     * Notes:
     * - ServerTimestampValue instances are created as the result of applying a
     *   TransformMutation (see TransformMutation.applyTo()). They can only exist in
     *   the local view of a document. Therefore they do not need to be parsed or
     *   serialized.
     * - When evaluated locally (e.g. for snapshot.data()), they by default
     *   evaluate to `null`. This behavior can be configured by passing custom
     *   FieldValueOptions to value().
     * - With respect to other ServerTimestampValues, they sort by their
     *   localWriteTime.
     */ function R(t) {
        var e, n;
        return "server_timestamp" === (null === (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
    }

    /**
     * Creates a new ServerTimestamp proto value (using the internal format).
     */
    /**
     * Returns the local time at which this timestamp was first set.
     */ function k(t) {
        var e = j(t.mapValue.fields.__local_write_time__.timestampValue);
        return new v(e.seconds, e.nanos);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
    A.ht = new A("");

    var P = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

    /** Extracts the backend's type order for the provided value. */ function V(t) {
        return "nullValue" in t ? 0 /* NullValue */ : "booleanValue" in t ? 1 /* BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* NumberValue */ : "timestampValue" in t ? 3 /* TimestampValue */ : "stringValue" in t ? 5 /* StringValue */ : "bytesValue" in t ? 6 /* BlobValue */ : "referenceValue" in t ? 7 /* RefValue */ : "geoPointValue" in t ? 8 /* GeoPointValue */ : "arrayValue" in t ? 9 /* ArrayValue */ : "mapValue" in t ? R(t) ? 4 /* ServerTimestampValue */ : 10 /* ObjectValue */ : ye();
    }

    /** Tests `left` and `right` for equality based on the backend semantics. */ function L(t, e) {
        var n = V(t);
        if (n !== V(e)) return !1;
        switch (n) {
          case 0 /* NullValue */ :
            return !0;

          case 1 /* BooleanValue */ :
            return t.booleanValue === e.booleanValue;

          case 4 /* ServerTimestampValue */ :
            return k(t).isEqual(k(e));

          case 3 /* TimestampValue */ :
            return function(t, e) {
                if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
                // Use string equality for ISO 8601 timestamps
                return t.timestampValue === e.timestampValue;
                var n = j(t.timestampValue), r = j(e.timestampValue);
                return n.seconds === r.seconds && n.nanos === r.nanos;
            }(t, e);

          case 5 /* StringValue */ :
            return t.stringValue === e.stringValue;

          case 6 /* BlobValue */ :
            return function(t, e) {
                return F(t.bytesValue).isEqual(F(e.bytesValue));
            }(t, e);

          case 7 /* RefValue */ :
            return t.referenceValue === e.referenceValue;

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                return M(t.geoPointValue.latitude) === M(e.geoPointValue.latitude) && M(t.geoPointValue.longitude) === M(e.geoPointValue.longitude);
            }(t, e);

          case 2 /* NumberValue */ :
            return function(t, e) {
                if ("integerValue" in t && "integerValue" in e) return M(t.integerValue) === M(e.integerValue);
                if ("doubleValue" in t && "doubleValue" in e) {
                    var n = M(t.doubleValue), r = M(e.doubleValue);
                    return n === r ? D(n) === D(r) : isNaN(n) && isNaN(r);
                }
                return !1;
            }(t, e);

          case 9 /* ArrayValue */ :
            return Ee(t.arrayValue.values || [], e.arrayValue.values || [], L);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                var n = t.mapValue.fields || {}, r = e.mapValue.fields || {};
                if (T(n) !== T(r)) return !1;
                for (var i in n) if (n.hasOwnProperty(i) && (void 0 === r[i] || !L(n[i], r[i]))) return !1;
                return !0;
            }(t, e);

          default:
            return ye();
        }
    }

    function O(t, e) {
        return void 0 !== (t.values || []).find((function(t) {
            return L(t, e);
        }));
    }

    function U(t, e) {
        var n = V(t), r = V(e);
        if (n !== r) return we(n, r);
        switch (n) {
          case 0 /* NullValue */ :
            return 0;

          case 1 /* BooleanValue */ :
            return we(t.booleanValue, e.booleanValue);

          case 2 /* NumberValue */ :
            return function(t, e) {
                var n = M(t.integerValue || t.doubleValue), r = M(e.integerValue || e.doubleValue);
                return n < r ? -1 : n > r ? 1 : n === r ? 0 : 
                // one or both are NaN.
                isNaN(n) ? isNaN(r) ? 0 : -1 : 1;
            }(t, e);

          case 3 /* TimestampValue */ :
            return C(t.timestampValue, e.timestampValue);

          case 4 /* ServerTimestampValue */ :
            return C(k(t), k(e));

          case 5 /* StringValue */ :
            return we(t.stringValue, e.stringValue);

          case 6 /* BlobValue */ :
            return function(t, e) {
                var n = F(t), r = F(e);
                return n.S(r);
            }(t.bytesValue, e.bytesValue);

          case 7 /* RefValue */ :
            return function(t, e) {
                for (var n = t.split("/"), r = e.split("/"), i = 0; i < n.length && i < r.length; i++) {
                    var o = we(n[i], r[i]);
                    if (0 !== o) return o;
                }
                return we(n.length, r.length);
            }(t.referenceValue, e.referenceValue);

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                var n = we(M(t.latitude), M(e.latitude));
                return 0 !== n ? n : we(M(t.longitude), M(e.longitude));
            }(t.geoPointValue, e.geoPointValue);

          case 9 /* ArrayValue */ :
            return function(t, e) {
                for (var n = t.values || [], r = e.values || [], i = 0; i < n.length && i < r.length; ++i) {
                    var o = U(n[i], r[i]);
                    if (o) return o;
                }
                return we(n.length, r.length);
            }(t.arrayValue, e.arrayValue);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                var n = t.fields || {}, r = Object.keys(n), i = e.fields || {}, o = Object.keys(i);
                // Even though MapValues are likely sorted correctly based on their insertion
                // order (e.g. when received from the backend), local modifications can bring
                // elements out of order. We need to re-sort the elements to ensure that
                // canonical IDs are independent of insertion order.
                            r.sort(), o.sort();
                for (var s = 0; s < r.length && s < o.length; ++s) {
                    var u = we(r[s], o[s]);
                    if (0 !== u) return u;
                    var a = U(n[r[s]], i[o[s]]);
                    if (0 !== a) return a;
                }
                return we(r.length, o.length);
            }(t.mapValue, e.mapValue);

          default:
            throw ye();
        }
    }

    function C(t, e) {
        if ("string" == typeof t && "string" == typeof e && t.length === e.length) return we(t, e);
        var n = j(t), r = j(e), i = we(n.seconds, r.seconds);
        return 0 !== i ? i : we(n.nanos, r.nanos);
    }

    function q(t) {
        return function t(e) {
            return "nullValue" in e ? "null" : "booleanValue" in e ? "" + e.booleanValue : "integerValue" in e ? "" + e.integerValue : "doubleValue" in e ? "" + e.doubleValue : "timestampValue" in e ? function(t) {
                var e = j(t);
                return "time(" + e.seconds + "," + e.nanos + ")";
            }(e.timestampValue) : "stringValue" in e ? e.stringValue : "bytesValue" in e ? F(e.bytesValue).toBase64() : "referenceValue" in e ? (r = e.referenceValue, 
            b.Z(r).toString()) : "geoPointValue" in e ? "geo(" + (n = e.geoPointValue).latitude + "," + n.longitude + ")" : "arrayValue" in e ? function(e) {
                for (var n = "[", r = !0, i = 0, o = e.values || []; i < o.length; i++) {
                    var s = o[i];
                    r ? r = !1 : n += ",", n += t(s);
                }
                return n + "]";
            }(e.arrayValue) : "mapValue" in e ? function(e) {
                for (
                // Iteration order in JavaScript is not guaranteed. To ensure that we generate
                // matching canonical IDs for identical maps, we need to sort the keys.
                var n = "{", r = !0, i = 0, o = Object.keys(e.fields || {}).sort(); i < o.length; i++) {
                    var s = o[i];
                    r ? r = !1 : n += ",", n += s + ":" + t(e.fields[s]);
                }
                return n + "}";
            }(e.mapValue) : ye();
            var n, r;
        }(t);
    }

    function j(t) {
        // The json interface (for the browser) will return an iso timestamp string,
        // while the proto js library (for node) will return a
        // google.protobuf.Timestamp instance.
        if (ve(!!t), "string" == typeof t) {
            // The date string can have higher precision (nanos) than the Date class
            // (millis), so we do some custom parsing here.
            // Parse the nanos right out of the string.
            var e = 0, n = P.exec(t);
            if (ve(!!n), n[1]) {
                // Pad the fraction out to 9 digits (nanos).
                var r = n[1];
                r = (r + "000000000").substr(0, 9), e = Number(r);
            }
            // Parse the date to get the seconds.
                    var i = new Date(t);
            return {
                seconds: Math.floor(i.getTime() / 1e3),
                nanos: e
            };
        }
        return {
            seconds: M(t.seconds),
            nanos: M(t.nanos)
        };
    }

    /**
     * Converts the possible Proto types for numbers into a JavaScript number.
     * Returns 0 if the value is not numeric.
     */ function M(t) {
        // TODO(bjornick): Handle int64 greater than 53 bits.
        return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
    }

    /** Converts the possible Proto types for Blobs into a ByteString. */ function F(t) {
        return "string" == typeof t ? A.fromBase64String(t) : A.fromUint8Array(t);
    }

    /** Returns a reference value for the provided database and key. */ function B(t, e) {
        return {
            referenceValue: "projects/" + t.projectId + "/databases/" + t.database + "/documents/" + e.path.j()
        };
    }

    /** Returns true if `value` is an IntegerValue . */ function z(t) {
        return !!t && "integerValue" in t;
    }

    /** Returns true if `value` is a DoubleValue. */
    /** Returns true if `value` is an ArrayValue. */ function G(t) {
        return !!t && "arrayValue" in t;
    }

    /** Returns true if `value` is a NullValue. */ function W(t) {
        return !!t && "nullValue" in t;
    }

    /** Returns true if `value` is NaN. */ function Q(t) {
        return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
    }

    /** Returns true if `value` is a MapValue. */ function K(t) {
        return !!t && "mapValue" in t;
    }

    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Transforms a value into a server-generated timestamp. */ var Y = /** @class */ function() {
        function t() {}
        return t.prototype.ot = function(t, e) {
            return function(t, e) {
                var n = {
                    fields: {
                        __type__: {
                            stringValue: "server_timestamp"
                        },
                        __local_write_time__: {
                            timestampValue: {
                                seconds: t.seconds,
                                nanos: t.nanoseconds
                            }
                        }
                    }
                };
                return e && (n.fields.__previous_value__ = e), {
                    mapValue: n
                };
            }(e, t);
        }, t.prototype.at = function(t, e) {
            return e;
        }, t.prototype.ut = function(t) {
            return null;
            // Server timestamps are idempotent and don't require a base value.
            }, t.prototype.isEqual = function(e) {
            return e instanceof t;
        }, t;
    }();

    Y.instance = new Y;

    /** Transforms an array value via a union operation. */
    var J = /** @class */ function() {
        function t(t) {
            this.elements = t;
        }
        return t.prototype.ot = function(t, e) {
            return this.apply(t);
        }, t.prototype.at = function(t, e) {
            // The server just sends null as the transform result for array operations,
            // so we have to calculate a result the same as we do for local
            // applications.
            return this.apply(t);
        }, t.prototype.apply = function(t) {
            for (var e = $(t), n = function(t) {
                e.some((function(e) {
                    return L(e, t);
                })) || e.push(t);
            }, r = 0, i = this.elements; r < i.length; r++) {
                n(i[r]);
            }
            return {
                arrayValue: {
                    values: e
                }
            };
        }, t.prototype.ut = function(t) {
            return null;
            // Array transforms are idempotent and don't require a base value.
            }, t.prototype.isEqual = function(e) {
            return e instanceof t && Ee(this.elements, e.elements, L);
        }, t;
    }(), X = /** @class */ function() {
        function t(t) {
            this.elements = t;
        }
        return t.prototype.ot = function(t, e) {
            return this.apply(t);
        }, t.prototype.at = function(t, e) {
            // The server just sends null as the transform result for array operations,
            // so we have to calculate a result the same as we do for local
            // applications.
            return this.apply(t);
        }, t.prototype.apply = function(t) {
            for (var e = $(t), n = function(t) {
                e = e.filter((function(e) {
                    return !L(e, t);
                }));
            }, r = 0, i = this.elements; r < i.length; r++) {
                n(i[r]);
            }
            return {
                arrayValue: {
                    values: e
                }
            };
        }, t.prototype.ut = function(t) {
            return null;
            // Array transforms are idempotent and don't require a base value.
            }, t.prototype.isEqual = function(e) {
            return e instanceof t && Ee(this.elements, e.elements, L);
        }, t;
    }(), H = /** @class */ function() {
        function t(t, e) {
            this.serializer = t, this.ct = e;
        }
        return t.prototype.ot = function(t, e) {
            // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
            // precision and resolves overflows by reducing precision, we do not
            // manually cap overflows at 2^63.
            var n = this.ut(t), r = this.asNumber(n) + this.asNumber(this.ct);
            return z(n) && z(this.ct) ? this.serializer._t(r) : this.serializer.lt(r);
        }, t.prototype.at = function(t, e) {
            return e;
        }, 
        /**
         * Inspects the provided value, returning the provided value if it is already
         * a NumberValue, otherwise returning a coerced value of 0.
         */
        t.prototype.ut = function(t) {
            return z(e = t) || function(t) {
                return !!t && "doubleValue" in t;
            }(e) ? t : {
                integerValue: 0
            };
            var e;
        }, t.prototype.isEqual = function(e) {
            return e instanceof t && L(this.ct, e.ct);
        }, t.prototype.asNumber = function(t) {
            return M(t.integerValue || t.doubleValue);
        }, t;
    }();

    /** Transforms an array value via a remove operation. */ function $(t) {
        return G(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a set of fields that can be used to partially patch a document.
     * FieldMask is used in conjunction with ObjectValue.
     * Examples:
     *   foo - Overwrites foo entirely with the provided value. If foo is not
     *         present in the companion ObjectValue, the field is deleted.
     *   foo.bar - Overwrites only the field bar of the object foo.
     *             If foo is not an object, foo is replaced with an object
     *             containing foo
     */ var Z = /** @class */ function() {
        function t(t) {
            this.fields = t, 
            // TODO(dimond): validation of FieldMask
            // Sort the field mask to support `FieldMask.isEqual()` and assert below.
            t.sort(_.N)
            /**
         * Verifies that `fieldPath` is included by at least one field in this field
         * mask.
         *
         * This is an O(n) operation, where `n` is the size of the field mask.
         */;
        }
        return t.prototype.dt = function(t) {
            for (var e = 0, n = this.fields; e < n.length; e++) {
                if (n[e].q(t)) return !0;
            }
            return !1;
        }, t.prototype.isEqual = function(t) {
            return Ee(this.fields, t.fields, (function(t, e) {
                return t.isEqual(e);
            }));
        }, t;
    }(), tt = /** @class */ function() {
        function t(t, e) {
            this.field = t, this.transform = e;
        }
        return t.prototype.isEqual = function(t) {
            return this.field.isEqual(t.field) && this.transform.isEqual(t.transform);
        }, t;
    }(), et = function(
    /**
         * The version at which the mutation was committed:
         *
         * - For most operations, this is the updateTime in the WriteResult.
         * - For deletes, the commitTime of the WriteResponse (because deletes are
         *   not stored and have no updateTime).
         *
         * Note that these versions can be different: No-op writes will not change
         * the updateTime even though the commitTime advances.
         */
    t, 
    /**
         * The resulting fields returned from the backend after a
         * TransformMutation has been committed. Contains one FieldValue for each
         * FieldTransform that was in the mutation.
         *
         * Will be null if the mutation was not a TransformMutation.
         */
    e) {
        this.version = t, this.transformResults = e;
    }, nt = /** @class */ function() {
        function t(t, e) {
            this.updateTime = t, this.exists = e
            /** Creates a new empty Precondition. */;
        }
        return t.ft = function() {
            return new t;
        }, 
        /** Creates a new Precondition with an exists flag. */ t.exists = function(e) {
            return new t(void 0, e);
        }, 
        /** Creates a new Precondition based on a version a document exists at. */ t.updateTime = function(e) {
            return new t(e);
        }, Object.defineProperty(t.prototype, "Tt", {
            /** Returns whether this Precondition is empty. */ get: function() {
                return void 0 === this.updateTime && void 0 === this.exists;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /**
         * Returns true if the preconditions is valid for the given document
         * (or null if no document is available).
         */
        t.prototype.Et = function(t) {
            return void 0 !== this.updateTime ? t instanceof yt && t.version.isEqual(this.updateTime) : void 0 === this.exists || this.exists === t instanceof yt;
        }, t.prototype.isEqual = function(t) {
            return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
        }, t;
    }(), rt = /** @class */ function() {
        function t() {}
        return t.prototype.It = function(t) {}, 
        /**
         * Returns the version from the given document for use as the result of a
         * mutation. Mutations are defined to return the version of the base document
         * only if it is an existing document. Deleted and unknown documents have a
         * post-mutation version of SnapshotVersion.min().
         */
        t.wt = function(t) {
            return t instanceof yt ? t.version : g.min();
        }, t;
    }(), it = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this) || this).key = e, i.value = n, i.Rt = r, i.type = 0 /* Set */ , 
            i;
        }
        return e.__extends(n, t), n.prototype.at = function(t, e) {
            this.It(t);
            // Unlike applyToLocalView, if we're applying a mutation to a remote
            // document the server has accepted the mutation so the precondition must
            // have held.
            var n = e.version;
            return new yt(this.key, n, this.value, {
                hasCommittedMutations: !0
            });
        }, n.prototype.ot = function(t, e, n) {
            if (this.It(t), !this.Rt.Et(t)) return t;
            var r = rt.wt(t);
            return new yt(this.key, r, this.value, {
                At: !0
            });
        }, n.prototype.Pt = function(t) {
            return null;
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.key.isEqual(t.key) && this.value.isEqual(t.value) && this.Rt.isEqual(t.Rt);
        }, n;
    }(rt), ot = /** @class */ function(t) {
        function n(e, n, r, i) {
            var o = this;
            return (o = t.call(this) || this).key = e, o.data = n, o.Vt = r, o.Rt = i, o.type = 1 /* Patch */ , 
            o;
        }
        return e.__extends(n, t), n.prototype.at = function(t, e) {
            if (this.It(t), !this.Rt.Et(t)) 
            // Since the mutation was not rejected, we know that the  precondition
            // matched on the backend. We therefore must not have the expected version
            // of the document in our cache and return an UnknownDocument with the
            // known updateTime.
            return new gt(this.key, e.version);
            var n = this.gt(t);
            return new yt(this.key, e.version, n, {
                hasCommittedMutations: !0
            });
        }, n.prototype.ot = function(t, e, n) {
            if (this.It(t), !this.Rt.Et(t)) return t;
            var r = rt.wt(t), i = this.gt(t);
            return new yt(this.key, r, i, {
                At: !0
            });
        }, n.prototype.Pt = function(t) {
            return null;
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.key.isEqual(t.key) && this.Vt.isEqual(t.Vt) && this.Rt.isEqual(t.Rt);
        }, 
        /**
         * Patches the data of document if available or creates a new document. Note
         * that this does not check whether or not the precondition of this patch
         * holds.
         */
        n.prototype.gt = function(t) {
            var e;
            return e = t instanceof yt ? t.data() : ct.empty(), this.pt(e);
        }, n.prototype.pt = function(t) {
            var e = this, n = new ht(t);
            return this.Vt.fields.forEach((function(t) {
                if (!t.B()) {
                    var r = e.data.field(t);
                    null !== r ? n.set(t, r) : n.delete(t);
                }
            })), n.yt();
        }, n;
    }(rt), st = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).key = e, r.fieldTransforms = n, r.type = 2 /* Transform */ , 
            // NOTE: We set a precondition of exists: true as a safety-check, since we
            // always combine TransformMutations with a SetMutation or PatchMutation which
            // (if successful) should end up with an existing document.
            r.Rt = nt.exists(!0), r;
        }
        return e.__extends(n, t), n.prototype.at = function(t, e) {
            if (this.It(t), ve(null != e.transformResults), !this.Rt.Et(t)) 
            // Since the mutation was not rejected, we know that the  precondition
            // matched on the backend. We therefore must not have the expected version
            // of the document in our cache and return an UnknownDocument with the
            // known updateTime.
            return new gt(this.key, e.version);
            var n = this.bt(t), r = this.vt(t, e.transformResults), i = e.version, o = this.St(n.data(), r);
            return new yt(this.key, i, o, {
                hasCommittedMutations: !0
            });
        }, n.prototype.ot = function(t, e, n) {
            if (this.It(t), !this.Rt.Et(t)) return t;
            var r = this.bt(t), i = this.Dt(n, t, e), o = this.St(r.data(), i);
            return new yt(this.key, r.version, o, {
                At: !0
            });
        }, n.prototype.Pt = function(t) {
            for (var e = null, n = 0, r = this.fieldTransforms; n < r.length; n++) {
                var i = r[n], o = t instanceof yt ? t.field(i.field) : void 0, s = i.transform.ut(o || null);
                null != s && (e = null == e ? (new ht).set(i.field, s) : e.set(i.field, s));
            }
            return e ? e.yt() : null;
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.key.isEqual(t.key) && Ee(this.fieldTransforms, t.fieldTransforms, (function(t, e) {
                return t.isEqual(e);
            })) && this.Rt.isEqual(t.Rt);
        }, 
        /**
         * Asserts that the given MaybeDocument is actually a Document and verifies
         * that it matches the key for this mutation. Since we only support
         * transformations with precondition exists this method is guaranteed to be
         * safe.
         */
        n.prototype.bt = function(t) {
            return t;
        }, 
        /**
         * Creates a list of "transform results" (a transform result is a field value
         * representing the result of applying a transform) for use after a
         * TransformMutation has been acknowledged by the server.
         *
         * @param baseDoc The document prior to applying this mutation batch.
         * @param serverTransformResults The transform results received by the server.
         * @return The transform results list.
         */
        n.prototype.vt = function(t, e) {
            var n = [];
            ve(this.fieldTransforms.length === e.length);
            for (var r = 0; r < e.length; r++) {
                var i = this.fieldTransforms[r], o = i.transform, s = null;
                t instanceof yt && (s = t.field(i.field)), n.push(o.at(s, e[r]));
            }
            return n;
        }, 
        /**
         * Creates a list of "transform results" (a transform result is a field value
         * representing the result of applying a transform) for use when applying a
         * TransformMutation locally.
         *
         * @param localWriteTime The local time of the transform mutation (used to
         *     generate ServerTimestampValues).
         * @param maybeDoc The current state of the document after applying all
         *     previous mutations.
         * @param baseDoc The document prior to applying this mutation batch.
         * @return The transform results list.
         */
        n.prototype.Dt = function(t, e, n) {
            for (var r = [], i = 0, o = this.fieldTransforms; i < o.length; i++) {
                var s = o[i], u = s.transform, a = null;
                e instanceof yt && (a = e.field(s.field)), null === a && n instanceof yt && (
                // If the current document does not contain a value for the mutated
                // field, use the value that existed before applying this mutation
                // batch. This solves an edge case where a PatchMutation clears the
                // values in a nested map before the TransformMutation is applied.
                a = n.field(s.field)), r.push(u.ot(a, t));
            }
            return r;
        }, n.prototype.St = function(t, e) {
            for (var n = new ht(t), r = 0; r < this.fieldTransforms.length; r++) {
                var i = this.fieldTransforms[r].field;
                n.set(i, e[r]);
            }
            return n.yt();
        }, n;
    }(rt), ut = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).key = e, r.Rt = n, r.type = 3 /* Delete */ , r;
        }
        return e.__extends(n, t), n.prototype.at = function(t, e) {
            // Unlike applyToLocalView, if we're applying a mutation to a remote
            // document the server has accepted the mutation so the precondition must
            // have held.
            return this.It(t), new vt(this.key, e.version, {
                hasCommittedMutations: !0
            });
        }, n.prototype.ot = function(t, e, n) {
            return this.It(t), this.Rt.Et(t) ? new vt(this.key, g.min()) : t;
        }, n.prototype.Pt = function(t) {
            return null;
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.key.isEqual(t.key) && this.Rt.isEqual(t.Rt);
        }, n;
    }(rt), at = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).key = e, r.Rt = n, r.type = 4 /* Verify */ , r;
        }
        return e.__extends(n, t), n.prototype.at = function(t, e) {
            ye();
        }, n.prototype.ot = function(t, e, n) {
            ye();
        }, n.prototype.Pt = function(t) {
            ye();
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.key.isEqual(t.key) && this.Rt.isEqual(t.Rt);
        }, n;
    }(rt), ct = /** @class */ function() {
        function t(t) {
            this.proto = t;
        }
        return t.empty = function() {
            return new t({
                mapValue: {}
            });
        }, 
        /**
         * Returns the value at the given path or null.
         *
         * @param path the path to search
         * @return The value at the path or if there it doesn't exist.
         */
        t.prototype.field = function(t) {
            if (t.B()) return this.proto;
            for (var e = this.proto, n = 0; n < t.length - 1; ++n) {
                if (!e.mapValue.fields) return null;
                if (!K(e = e.mapValue.fields[t.get(n)])) return null;
            }
            return (e = (e.mapValue.fields || {})[t.L()]) || null;
        }, t.prototype.isEqual = function(t) {
            return L(this.proto, t.proto);
        }, t;
    }(), ht = /** @class */ function() {
        /**
         * @param baseObject The object to mutate.
         */
        function t(t) {
            void 0 === t && (t = ct.empty()), this.Ct = t, 
            /** A map that contains the accumulated changes in this builder. */
            this.Ft = new Map;
        }
        /**
         * Sets the field to the provided value.
         *
         * @param path The field path to set.
         * @param value The value to set.
         * @return The current Builder instance.
         */    return t.prototype.set = function(t, e) {
            return this.Nt(t, e), this;
        }, 
        /**
         * Removes the field at the specified path. If there is no field at the
         * specified path, nothing is changed.
         *
         * @param path The field path to remove.
         * @return The current Builder instance.
         */
        t.prototype.delete = function(t) {
            return this.Nt(t, null), this;
        }, 
        /**
         * Adds `value` to the overlay map at `path`. Creates nested map entries if
         * needed.
         */
        t.prototype.Nt = function(t, e) {
            for (var n = this.Ft, r = 0; r < t.length - 1; ++r) {
                var i = t.get(r), o = n.get(i);
                o instanceof Map ? 
                // Re-use a previously created map
                n = o : o && 10 /* ObjectValue */ === V(o) ? (
                // Convert the existing Protobuf MapValue into a map
                o = new Map(Object.entries(o.mapValue.fields || {})), n.set(i, o), n = o) : (
                // Create an empty map to represent the current nesting level
                o = new Map, n.set(i, o), n = o);
            }
            n.set(t.L(), e);
        }, 
        /** Returns an ObjectValue with all mutations applied. */ t.prototype.yt = function() {
            var t = this.kt(_.G, this.Ft);
            return null != t ? new ct(t) : this.Ct;
        }, 
        /**
         * Applies any overlays from `currentOverlays` that exist at `currentPath`
         * and returns the merged data at `currentPath` (or null if there were no
         * changes).
         *
         * @param currentPath The path at the current nesting level. Can be set to
         * FieldValue.EMPTY_PATH to represent the root.
         * @param currentOverlays The overlays at the current nesting level in the
         * same format as `overlayMap`.
         * @return The merged data at `currentPath` or null if no modifications
         * were applied.
         */
        t.prototype.kt = function(t, e) {
            var n = this, r = !1, i = this.Ct.field(t), o = K(i) ? // If there is already data at the current path, base our
            Object.assign({}, i.mapValue.fields) : {};
            return e.forEach((function(e, i) {
                if (e instanceof Map) {
                    var s = n.kt(t.child(i), e);
                    null != s && (o[i] = s, r = !0);
                } else null !== e ? (o[i] = e, r = !0) : o.hasOwnProperty(i) && (delete o[i], r = !0);
            })), r ? {
                mapValue: {
                    fields: o
                }
            } : null;
        }, t;
    }();

    /** A field path and the TransformOperation to perform upon it. */
    /**
     * Returns a FieldMask built from all fields in a MapValue.
     */
    function ft(t) {
        var e = [];
        return I(t.fields || {}, (function(t, n) {
            var r = new _([ t ]);
            if (K(n)) {
                var i = ft(n.mapValue).fields;
                if (0 === i.length) 
                // Preserve the empty map by adding it to the FieldMask.
                e.push(r); else 
                // For nested and non-empty ObjectValues, add the FieldPath of the
                // leaf nodes.
                for (var o = 0, s = i; o < s.length; o++) {
                    var u = s[o];
                    e.push(r.child(u));
                }
            } else 
            // For nested and non-empty ObjectValues, add the FieldPath of the leaf
            // nodes.
            e.push(r);
        })), new Z(e)
        /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /**
     * The result of a lookup for a given path may be an existing document or a
     * marker that this document does not exist at a given version.
     */;
    }

    var lt, pt, dt = function(t, e) {
        this.key = t, this.version = e;
    }, yt = /** @class */ function(t) {
        function n(e, n, r, i) {
            var o = this;
            return (o = t.call(this, e, n) || this).Mt = r, o.At = !!i.At, o.hasCommittedMutations = !!i.hasCommittedMutations, 
            o;
        }
        return e.__extends(n, t), n.prototype.field = function(t) {
            return this.Mt.field(t);
        }, n.prototype.data = function() {
            return this.Mt;
        }, n.prototype.xt = function() {
            return this.Mt.proto;
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.At === t.At && this.hasCommittedMutations === t.hasCommittedMutations && this.Mt.isEqual(t.Mt);
        }, n.prototype.toString = function() {
            return "Document(" + this.key + ", " + this.version + ", " + this.Mt.toString() + ", {hasLocalMutations: " + this.At + "}), {hasCommittedMutations: " + this.hasCommittedMutations + "})";
        }, Object.defineProperty(n.prototype, "hasPendingWrites", {
            get: function() {
                return this.At || this.hasCommittedMutations;
            },
            enumerable: !0,
            configurable: !0
        }), n;
    }(dt), vt = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this, e, n) || this).hasCommittedMutations = !(!r || !r.hasCommittedMutations), 
            i;
        }
        return e.__extends(n, t), n.prototype.toString = function() {
            return "NoDocument(" + this.key + ", " + this.version + ")";
        }, Object.defineProperty(n.prototype, "hasPendingWrites", {
            get: function() {
                return this.hasCommittedMutations;
            },
            enumerable: !0,
            configurable: !0
        }), n.prototype.isEqual = function(t) {
            return t instanceof n && t.hasCommittedMutations === this.hasCommittedMutations && t.version.isEqual(this.version) && t.key.isEqual(this.key);
        }, n;
    }(dt), gt = /** @class */ function(t) {
        function n() {
            return null !== t && t.apply(this, arguments) || this;
        }
        return e.__extends(n, t), n.prototype.toString = function() {
            return "UnknownDocument(" + this.key + ", " + this.version + ")";
        }, Object.defineProperty(n.prototype, "hasPendingWrites", {
            get: function() {
                return !0;
            },
            enumerable: !0,
            configurable: !0
        }), n.prototype.isEqual = function(t) {
            return t instanceof n && t.version.isEqual(this.version) && t.key.isEqual(this.key);
        }, n;
    }(dt), mt = /** @class */ function() {
        /**
         * Initializes a Target with a path and optional additional query constraints.
         * Path must currently be empty if this is a collection group query.
         *
         * NOTE: you should always construct `Target` from `Query.toTarget` instead of
         * using this constructor, because `Query` provides an implicit `orderBy`
         * property.
         */
        function t(t, e, n, r, i, o, s) {
            void 0 === e && (e = null), void 0 === n && (n = []), void 0 === r && (r = []), 
            void 0 === i && (i = null), void 0 === o && (o = null), void 0 === s && (s = null), 
            this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = r, this.limit = i, 
            this.startAt = o, this.endAt = s, this.$t = null;
        }
        return t.prototype.canonicalId = function() {
            if (null === this.$t) {
                var t = this.path.j();
                null !== this.collectionGroup && (t += "|cg:" + this.collectionGroup), t += "|f:", 
                t += this.filters.map((function(t) {
                    return t.canonicalId();
                })).join(","), t += "|ob:", t += this.orderBy.map((function(t) {
                    return t.canonicalId();
                })).join(","), x(this.limit) || (t += "|l:", t += this.limit), this.startAt && (t += "|lb:", 
                t += this.startAt.canonicalId()), this.endAt && (t += "|ub:", t += this.endAt.canonicalId()), 
                this.$t = t;
            }
            return this.$t;
        }, t.prototype.toString = function() {
            var t = this.path.j();
            return null !== this.collectionGroup && (t += " collectionGroup=" + this.collectionGroup), 
            this.filters.length > 0 && (t += ", filters: [" + this.filters.join(", ") + "]"), 
            x(this.limit) || (t += ", limit: " + this.limit), this.orderBy.length > 0 && (t += ", orderBy: [" + this.orderBy.join(", ") + "]"), 
            this.startAt && (t += ", startAt: " + this.startAt.canonicalId()), this.endAt && (t += ", endAt: " + this.endAt.canonicalId()), 
            "Target(" + t + ")";
        }, t.prototype.isEqual = function(t) {
            if (this.limit !== t.limit) return !1;
            if (this.orderBy.length !== t.orderBy.length) return !1;
            for (var e = 0; e < this.orderBy.length; e++) if (!this.orderBy[e].isEqual(t.orderBy[e])) return !1;
            if (this.filters.length !== t.filters.length) return !1;
            for (var n = 0; n < this.filters.length; n++) if (!this.filters[n].isEqual(t.filters[n])) return !1;
            return this.collectionGroup === t.collectionGroup && !!this.path.isEqual(t.path) && !!(null !== this.startAt ? this.startAt.isEqual(t.startAt) : null === t.startAt) && (null !== this.endAt ? this.endAt.isEqual(t.endAt) : null === t.endAt);
        }, t.prototype.Ot = function() {
            return b.et(this.path) && null === this.collectionGroup && 0 === this.filters.length;
        }, t;
    }(), wt = /** @class */ function() {
        /**
         * Initializes a Query with a path and optional additional query constraints.
         * Path must currently be empty if this is a collection group query.
         */
        function t(t, e, n, r, i, o /* First */ , s, u) {
            void 0 === e && (e = null), void 0 === n && (n = []), void 0 === r && (r = []), 
            void 0 === i && (i = null), void 0 === o && (o = "F"), void 0 === s && (s = null), 
            void 0 === u && (u = null), this.path = t, this.collectionGroup = e, this.Lt = n, 
            this.filters = r, this.limit = i, this.Bt = o, this.startAt = s, this.endAt = u, 
            this.qt = null, 
            // The corresponding `Target` of this `Query` instance.
            this.Ut = null, this.startAt && this.Qt(this.startAt), this.endAt && this.Qt(this.endAt);
        }
        // TODO(firestorelite): Refactor this class so that methods that are not used
        // in the Lite client become tree-shakeable.
            return t.Wt = function(e) {
            return new t(e);
        }, Object.defineProperty(t.prototype, "orderBy", {
            get: function() {
                if (null === this.qt) {
                    this.qt = [];
                    var t = this.jt(), e = this.Kt();
                    if (null !== t && null === e) 
                    // In order to implicitly add key ordering, we must also add the
                    // inequality filter field for it to be a valid query.
                    // Note that the default inequality field and key ordering is ascending.
                    t.Y() || this.qt.push(new xt(t)), this.qt.push(new xt(_.J(), "asc" /* ASCENDING */)); else {
                        for (var n = !1, r = 0, i = this.Lt; r < i.length; r++) {
                            var o = i[r];
                            this.qt.push(o), o.field.Y() && (n = !0);
                        }
                        if (!n) {
                            // The order of the implicit key ordering always matches the last
                            // explicit order by
                            var s = this.Lt.length > 0 ? this.Lt[this.Lt.length - 1].dir : "asc" /* ASCENDING */;
                            this.qt.push(new xt(_.J(), s));
                        }
                    }
                }
                return this.qt;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.Gt = function(e) {
            var n = this.filters.concat([ e ]);
            return new t(this.path, this.collectionGroup, this.Lt.slice(), n, this.limit, this.Bt, this.startAt, this.endAt);
        }, t.prototype.zt = function(e) {
            // TODO(dimond): validate that orderBy does not list the same key twice.
            var n = this.Lt.concat([ e ]);
            return new t(this.path, this.collectionGroup, n, this.filters.slice(), this.limit, this.Bt, this.startAt, this.endAt);
        }, t.prototype.Ht = function(e) {
            return new t(this.path, this.collectionGroup, this.Lt.slice(), this.filters.slice(), e, "F" /* First */ , this.startAt, this.endAt);
        }, t.prototype.Yt = function(e) {
            return new t(this.path, this.collectionGroup, this.Lt.slice(), this.filters.slice(), e, "L" /* Last */ , this.startAt, this.endAt);
        }, t.prototype.Jt = function(e) {
            return new t(this.path, this.collectionGroup, this.Lt.slice(), this.filters.slice(), this.limit, this.Bt, e, this.endAt);
        }, t.prototype.Xt = function(e) {
            return new t(this.path, this.collectionGroup, this.Lt.slice(), this.filters.slice(), this.limit, this.Bt, this.startAt, e);
        }, 
        /**
         * Helper to convert a collection group query into a collection query at a
         * specific path. This is used when executing collection group queries, since
         * we have to split the query into a set of collection queries at multiple
         * paths.
         */
        t.prototype.Zt = function(e) {
            return new t(e, 
            /*collectionGroup=*/ null, this.Lt.slice(), this.filters.slice(), this.limit, this.Bt, this.startAt, this.endAt);
        }, 
        /**
         * Returns true if this query does not specify any query constraints that
         * could remove results.
         */
        t.prototype.te = function() {
            return 0 === this.filters.length && null === this.limit && null == this.startAt && null == this.endAt && (0 === this.Lt.length || 1 === this.Lt.length && this.Lt[0].field.Y());
        }, 
        // TODO(b/29183165): This is used to get a unique string from a query to, for
        // example, use as a dictionary key, but the implementation is subject to
        // collisions. Make it collision-free.
        t.prototype.canonicalId = function() {
            return this.ee().canonicalId() + "|lt:" + this.Bt;
        }, t.prototype.toString = function() {
            return "Query(target=" + this.ee().toString() + "; limitType=" + this.Bt + ")";
        }, t.prototype.isEqual = function(t) {
            return this.ee().isEqual(t.ee()) && this.Bt === t.Bt;
        }, t.prototype.se = function(t, e) {
            for (var n = !1, r = 0, i = this.orderBy; r < i.length; r++) {
                var o = i[r], s = o.compare(t, e);
                if (0 !== s) return s;
                n = n || o.field.Y();
            }
            return 0;
        }, t.prototype.matches = function(t) {
            return this.ie(t) && this.ne(t) && this.re(t) && this.he(t);
        }, t.prototype.oe = function() {
            return !x(this.limit) && "F" /* First */ === this.Bt;
        }, t.prototype.ae = function() {
            return !x(this.limit) && "L" /* Last */ === this.Bt;
        }, t.prototype.Kt = function() {
            return this.Lt.length > 0 ? this.Lt[0].field : null;
        }, t.prototype.jt = function() {
            for (var t = 0, e = this.filters; t < e.length; t++) {
                var n = e[t];
                if (n instanceof Et && n.ue()) return n.field;
            }
            return null;
        }, 
        // Checks if any of the provided Operators are included in the query and
        // returns the first one that is, or null if none are.
        t.prototype.ce = function(t) {
            for (var e = 0, n = this.filters; e < n.length; e++) {
                var r = n[e];
                if (r instanceof Et && t.indexOf(r.op) >= 0) return r.op;
            }
            return null;
        }, t.prototype.Ot = function() {
            return this.ee().Ot();
        }, t.prototype._e = function() {
            return null !== this.collectionGroup;
        }, 
        /**
         * Converts this `Query` instance to it's corresponding `Target`
         * representation.
         */
        t.prototype.ee = function() {
            if (!this.Ut) if ("F" /* First */ === this.Bt) this.Ut = new mt(this.path, this.collectionGroup, this.orderBy, this.filters, this.limit, this.startAt, this.endAt); else {
                for (
                // Flip the orderBy directions since we want the last results
                var t = [], e = 0, n = this.orderBy; e < n.length; e++) {
                    var r = n[e], i = "desc" /* DESCENDING */ === r.dir ? "asc" /* ASCENDING */ : "desc" /* DESCENDING */;
                    t.push(new xt(r.field, i));
                }
                // We need to swap the cursors to match the now-flipped query ordering.
                            var o = this.endAt ? new At(this.endAt.position, !this.endAt.before) : null, s = this.startAt ? new At(this.startAt.position, !this.startAt.before) : null;
                // Now return as a LimitType.First query.
                            this.Ut = new mt(this.path, this.collectionGroup, t, this.filters, this.limit, o, s);
            }
            return this.Ut;
        }, t.prototype.ie = function(t) {
            var e = t.key.path;
            return null !== this.collectionGroup ? t.key.tt(this.collectionGroup) && this.path.q(e) : b.et(this.path) ? this.path.isEqual(e) : this.path.U(e);
        }, 
        /**
         * A document must have a value for every ordering clause in order to show up
         * in the results.
         */
        t.prototype.ne = function(t) {
            for (var e = 0, n = this.Lt; e < n.length; e++) {
                var r = n[e];
                // order by key always matches
                            if (!r.field.Y() && null === t.field(r.field)) return !1;
            }
            return !0;
        }, t.prototype.re = function(t) {
            for (var e = 0, n = this.filters; e < n.length; e++) {
                if (!n[e].matches(t)) return !1;
            }
            return !0;
        }, 
        /**
         * Makes sure a document is within the bounds, if provided.
         */
        t.prototype.he = function(t) {
            return !(this.startAt && !this.startAt.le(this.orderBy, t) || this.endAt && this.endAt.le(this.orderBy, t));
        }, t.prototype.Qt = function(t) {}, t;
    }(), Et = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this) || this).field = e, i.op = n, i.value = r, i;
        }
        /**
         * Creates a filter based on the provided arguments.
         */    return e.__extends(n, t), n.create = function(t, e, r) {
            if (t.Y()) return "in" /* IN */ === e ? new bt(t, r) : new _t(t, e, r);
            if (W(r)) {
                if ("==" /* EQUAL */ !== e) throw new h(c.INVALID_ARGUMENT, "Invalid query. Null supports only equality comparisons.");
                return new n(t, e, r);
            }
            if (Q(r)) {
                if ("==" /* EQUAL */ !== e) throw new h(c.INVALID_ARGUMENT, "Invalid query. NaN supports only equality comparisons.");
                return new n(t, e, r);
            }
            return "array-contains" /* ARRAY_CONTAINS */ === e ? new Tt(t, r) : "in" /* IN */ === e ? new It(t, r) : "array-contains-any" /* ARRAY_CONTAINS_ANY */ === e ? new Nt(t, r) : new n(t, e, r);
        }, n.prototype.matches = function(t) {
            var e = t.field(this.field);
            // Only compare types with matching backend order (such as double and int).
                    return null !== e && V(this.value) === V(e) && this.de(U(e, this.value));
        }, n.prototype.de = function(t) {
            switch (this.op) {
              case "<" /* LESS_THAN */ :
                return t < 0;

              case "<=" /* LESS_THAN_OR_EQUAL */ :
                return t <= 0;

              case "==" /* EQUAL */ :
                return 0 === t;

              case ">" /* GREATER_THAN */ :
                return t > 0;

              case ">=" /* GREATER_THAN_OR_EQUAL */ :
                return t >= 0;

              default:
                return ye();
            }
        }, n.prototype.ue = function() {
            return [ "<" /* LESS_THAN */ , "<=" /* LESS_THAN_OR_EQUAL */ , ">" /* GREATER_THAN */ , ">=" /* GREATER_THAN_OR_EQUAL */ ].indexOf(this.op) >= 0;
        }, n.prototype.canonicalId = function() {
            // TODO(b/29183165): Technically, this won't be unique if two values have
            // the same description, such as the int 3 and the string "3". So we should
            // add the types in here somehow, too.
            return this.field.j() + this.op.toString() + q(this.value);
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this.op === t.op && this.field.isEqual(t.field) && L(this.value, t.value);
        }, n.prototype.toString = function() {
            return this.field.j() + " " + this.op + " " + q(this.value);
        }, n;
    }((function() {})), _t = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this, e, n, r) || this).key = b.Z(r.referenceValue), i;
        }
        return e.__extends(n, t), n.prototype.matches = function(t) {
            var e = b.N(t.key, this.key);
            return this.de(e);
        }, n;
    }(Et), bt = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this, e, "in" /* IN */ , n) || this).keys = (n.arrayValue.values || []).map((function(t) {
                return b.Z(t.referenceValue);
            })), r;
        }
        return e.__extends(n, t), n.prototype.matches = function(t) {
            return this.keys.some((function(e) {
                return e.isEqual(t.key);
            }));
        }, n;
    }(Et), Tt = /** @class */ function(t) {
        function n(e, n) {
            return t.call(this, e, "array-contains" /* ARRAY_CONTAINS */ , n) || this;
        }
        return e.__extends(n, t), n.prototype.matches = function(t) {
            var e = t.field(this.field);
            return G(e) && O(e.arrayValue, this.value);
        }, n;
    }(Et), It = /** @class */ function(t) {
        function n(e, n) {
            return t.call(this, e, "in" /* IN */ , n) || this;
        }
        return e.__extends(n, t), n.prototype.matches = function(t) {
            var e = t.field(this.field);
            return null !== e && O(this.value.arrayValue, e);
        }, n;
    }(Et), Nt = /** @class */ function(t) {
        function n(e, n) {
            return t.call(this, e, "array-contains-any" /* ARRAY_CONTAINS_ANY */ , n) || this;
        }
        return e.__extends(n, t), n.prototype.matches = function(t) {
            var e = this, n = t.field(this.field);
            return !(!G(n) || !n.arrayValue.values) && n.arrayValue.values.some((function(t) {
                return O(e.value.arrayValue, t);
            }));
        }, n;
    }(Et), At = /** @class */ function() {
        function t(t, e) {
            this.position = t, this.before = e;
        }
        return t.prototype.canonicalId = function() {
            // TODO(b/29183165): Make this collision robust.
            return (this.before ? "b" : "a") + ":" + this.position.map((function(t) {
                return q(t);
            })).join(",");
        }, 
        /**
         * Returns true if a document sorts before a bound using the provided sort
         * order.
         */
        t.prototype.le = function(t, e) {
            for (var n = 0, r = 0; r < this.position.length; r++) {
                var i = t[r], o = this.position[r];
                if (n = i.field.Y() ? b.N(b.Z(o.referenceValue), e.key) : U(o, e.field(i.field)), 
                "desc" /* DESCENDING */ === i.dir && (n *= -1), 0 !== n) break;
            }
            return this.before ? n <= 0 : n < 0;
        }, t.prototype.isEqual = function(t) {
            if (null === t) return !1;
            if (this.before !== t.before || this.position.length !== t.position.length) return !1;
            for (var e = 0; e < this.position.length; e++) if (!L(this.position[e], t.position[e])) return !1;
            return !0;
        }, t;
    }(), xt = /** @class */ function() {
        function t(t, e) {
            this.field = t, void 0 === e && (e = "asc" /* ASCENDING */), this.dir = e, this.fe = t.Y();
        }
        return t.prototype.compare = function(t, e) {
            var n = this.fe ? b.N(t.key, e.key) : function(t, e, n) {
                var r = e.field(t), i = n.field(t);
                return null !== r && null !== i ? U(r, i) : ye();
            }(this.field, t, e);
            switch (this.dir) {
              case "asc" /* ASCENDING */ :
                return n;

              case "desc" /* DESCENDING */ :
                return -1 * n;

              default:
                return ye();
            }
        }, t.prototype.canonicalId = function() {
            // TODO(b/29183165): Make this collision robust.
            return this.field.j() + this.dir.toString();
        }, t.prototype.toString = function() {
            return this.field.j() + " (" + this.dir + ")";
        }, t.prototype.isEqual = function(t) {
            return this.dir === t.dir && this.field.isEqual(t.field);
        }, t;
    }(), Dt = /** @class */ function() {
        function t(
        /** The target being listened to. */
        t, 
        /**
         * The target ID to which the target corresponds; Assigned by the
         * LocalStore for user listens and by the SyncEngine for limbo watches.
         */
        e, 
        /** The purpose of the target. */
        n, 
        /**
         * The sequence number of the last transaction during which this target data
         * was modified.
         */
        r, 
        /** The latest snapshot version seen for this target. */
        i
        /**
         * The maximum snapshot version at which the associated view
         * contained no limbo documents.
         */ , o
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */ , s) {
            void 0 === i && (i = g.min()), void 0 === o && (o = g.min()), void 0 === s && (s = A.ht), 
            this.target = t, this.targetId = e, this.Te = n, this.sequenceNumber = r, this.Ee = i, 
            this.lastLimboFreeSnapshotVersion = o, this.resumeToken = s;
        }
        /** Creates a new target data instance with an updated sequence number. */    return t.prototype.Ie = function(e) {
            return new t(this.target, this.targetId, this.Te, e, this.Ee, this.lastLimboFreeSnapshotVersion, this.resumeToken);
        }, 
        /**
         * Creates a new target data instance with an updated resume token and
         * snapshot version.
         */
        t.prototype.we = function(e, n) {
            return new t(this.target, this.targetId, this.Te, this.sequenceNumber, n, this.lastLimboFreeSnapshotVersion, e);
        }, 
        /**
         * Creates a new target data instance with an updated last limbo free
         * snapshot version number.
         */
        t.prototype.Re = function(e) {
            return new t(this.target, this.targetId, this.Te, this.sequenceNumber, this.Ee, e, this.resumeToken);
        }, t;
    }(), St = 
    // TODO(b/33078163): just use simplest form of existence filter for now
    function(t) {
        this.count = t;
    };

    /**
     * Represents a document in Firestore with a key, version, data and whether the
     * data has local mutations applied to it.
     */
    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a non-write operation.
     *
     * See isPermanentWriteError for classifying write errors.
     */
    function Rt(t) {
        switch (t) {
          case c.OK:
            return ye();

          case c.CANCELLED:
          case c.UNKNOWN:
          case c.DEADLINE_EXCEEDED:
          case c.RESOURCE_EXHAUSTED:
          case c.INTERNAL:
          case c.UNAVAILABLE:
     // Unauthenticated means something went wrong with our token and we need
            // to retry with new credentials which will happen automatically.
                  case c.UNAUTHENTICATED:
            return !1;

          case c.INVALID_ARGUMENT:
          case c.NOT_FOUND:
          case c.ALREADY_EXISTS:
          case c.PERMISSION_DENIED:
          case c.FAILED_PRECONDITION:
     // Aborted might be retried in some scenarios, but that is dependant on
            // the context and should handled individually by the calling code.
            // See https://cloud.google.com/apis/design/errors.
                  case c.ABORTED:
          case c.OUT_OF_RANGE:
          case c.UNIMPLEMENTED:
          case c.DATA_LOSS:
            return !0;

          default:
            return ye();
        }
    }

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a write operation.
     *
     * Write operations must be handled specially because as of b/119437764, ABORTED
     * errors on the write stream should be retried too (even though ABORTED errors
     * are not generally retryable).
     *
     * Note that during the initial handshake on the write stream an ABORTED error
     * signals that we should discard our stream token (i.e. it is permanent). This
     * means a handshake error should be classified with isPermanentError, above.
     */
    /**
     * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
     * are not the same as HTTP status codes.
     *
     * @returns The Code equivalent to the given GRPC status code. Fails if there
     *     is no match.
     */ function kt(t) {
        if (void 0 === t) 
        // This shouldn't normally happen, but in certain error cases (like trying
        // to send invalid proto messages) we may get an error with no GRPC code.
        return pe("GRPC error has no .code"), c.UNKNOWN;
        switch (t) {
          case lt.OK:
            return c.OK;

          case lt.CANCELLED:
            return c.CANCELLED;

          case lt.UNKNOWN:
            return c.UNKNOWN;

          case lt.DEADLINE_EXCEEDED:
            return c.DEADLINE_EXCEEDED;

          case lt.RESOURCE_EXHAUSTED:
            return c.RESOURCE_EXHAUSTED;

          case lt.INTERNAL:
            return c.INTERNAL;

          case lt.UNAVAILABLE:
            return c.UNAVAILABLE;

          case lt.UNAUTHENTICATED:
            return c.UNAUTHENTICATED;

          case lt.INVALID_ARGUMENT:
            return c.INVALID_ARGUMENT;

          case lt.NOT_FOUND:
            return c.NOT_FOUND;

          case lt.ALREADY_EXISTS:
            return c.ALREADY_EXISTS;

          case lt.PERMISSION_DENIED:
            return c.PERMISSION_DENIED;

          case lt.FAILED_PRECONDITION:
            return c.FAILED_PRECONDITION;

          case lt.ABORTED:
            return c.ABORTED;

          case lt.OUT_OF_RANGE:
            return c.OUT_OF_RANGE;

          case lt.UNIMPLEMENTED:
            return c.UNIMPLEMENTED;

          case lt.DATA_LOSS:
            return c.DATA_LOSS;

          default:
            return ye();
        }
    }

    /**
     * Converts an HTTP response's error status to the equivalent error code.
     *
     * @param status An HTTP error response status ("FAILED_PRECONDITION",
     * "UNKNOWN", etc.)
     * @returns The equivalent Code. Non-matching responses are mapped to
     *     Code.UNKNOWN.
     */ (pt = lt || (lt = {}))[pt.OK = 0] = "OK", pt[pt.CANCELLED = 1] = "CANCELLED", 
    pt[pt.UNKNOWN = 2] = "UNKNOWN", pt[pt.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
    pt[pt.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", pt[pt.NOT_FOUND = 5] = "NOT_FOUND", 
    pt[pt.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", pt[pt.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
    pt[pt.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", pt[pt.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
    pt[pt.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", pt[pt.ABORTED = 10] = "ABORTED", 
    pt[pt.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", pt[pt.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
    pt[pt.INTERNAL = 13] = "INTERNAL", pt[pt.UNAVAILABLE = 14] = "UNAVAILABLE", pt[pt.DATA_LOSS = 15] = "DATA_LOSS";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // An immutable sorted map implementation, based on a Left-leaning Red-Black
    // tree.
    var Pt = /** @class */ function() {
        function t(t, e) {
            this.N = t, this.root = e || Lt.EMPTY;
        }
        // Returns a copy of the map, with the specified key/value added or replaced.
            return t.prototype.Ae = function(e, n) {
            return new t(this.N, this.root.Ae(e, n, this.N).me(null, null, Lt.Pe, null, null));
        }, 
        // Returns a copy of the map, with the specified key removed.
        t.prototype.remove = function(e) {
            return new t(this.N, this.root.remove(e, this.N).me(null, null, Lt.Pe, null, null));
        }, 
        // Returns the value of the node with the given key, or null.
        t.prototype.get = function(t) {
            for (var e = this.root; !e.B(); ) {
                var n = this.N(t, e.key);
                if (0 === n) return e.value;
                n < 0 ? e = e.left : n > 0 && (e = e.right);
            }
            return null;
        }, 
        // Returns the index of the element in this sorted map, or -1 if it doesn't
        // exist.
        t.prototype.indexOf = function(t) {
            for (
            // Number of nodes that were pruned when descending right
            var e = 0, n = this.root; !n.B(); ) {
                var r = this.N(t, n.key);
                if (0 === r) return e + n.left.size;
                r < 0 ? n = n.left : (
                // Count all nodes left of the node plus the node itself
                e += n.left.size + 1, n = n.right);
            }
            // Node not found
                    return -1;
        }, t.prototype.B = function() {
            return this.root.B();
        }, Object.defineProperty(t.prototype, "size", {
            // Returns the total number of nodes in the map.
            get: function() {
                return this.root.size;
            },
            enumerable: !0,
            configurable: !0
        }), 
        // Returns the minimum key in the map.
        t.prototype.Ve = function() {
            return this.root.Ve();
        }, 
        // Returns the maximum key in the map.
        t.prototype.ge = function() {
            return this.root.ge();
        }, 
        // Traverses the map in key order and calls the specified action function
        // for each key/value pair. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        t.prototype.pe = function(t) {
            return this.root.pe(t);
        }, t.prototype.forEach = function(t) {
            this.pe((function(e, n) {
                return t(e, n), !1;
            }));
        }, t.prototype.toString = function() {
            var t = [];
            return this.pe((function(e, n) {
                return t.push(e + ":" + n), !1;
            })), "{" + t.join(", ") + "}";
        }, 
        // Traverses the map in reverse key order and calls the specified action
        // function for each key/value pair. If action returns true, traversal is
        // aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        t.prototype.ye = function(t) {
            return this.root.ye(t);
        }, 
        // Returns an iterator over the SortedMap.
        t.prototype.be = function() {
            return new Vt(this.root, null, this.N, !1);
        }, t.prototype.ve = function(t) {
            return new Vt(this.root, t, this.N, !1);
        }, t.prototype.Se = function() {
            return new Vt(this.root, null, this.N, !0);
        }, t.prototype.De = function(t) {
            return new Vt(this.root, t, this.N, !0);
        }, t;
    }(), Vt = /** @class */ function() {
        function t(t, e, n, r) {
            this.Ce = r, this.Fe = [];
            for (var i = 1; !t.B(); ) if (i = e ? n(t.key, e) : 1, 
            // flip the comparison if we're going in reverse
            r && (i *= -1), i < 0) 
            // This node is less than our start key. ignore it
            t = this.Ce ? t.left : t.right; else {
                if (0 === i) {
                    // This node is exactly equal to our start key. Push it on the stack,
                    // but stop iterating;
                    this.Fe.push(t);
                    break;
                }
                // This node is greater than our start key, add it to the stack and move
                // to the next one
                            this.Fe.push(t), t = this.Ce ? t.right : t.left;
            }
        }
        return t.prototype.Ne = function() {
            var t = this.Fe.pop(), e = {
                key: t.key,
                value: t.value
            };
            if (this.Ce) for (t = t.left; !t.B(); ) this.Fe.push(t), t = t.right; else for (t = t.right; !t.B(); ) this.Fe.push(t), 
            t = t.left;
            return e;
        }, t.prototype.ke = function() {
            return this.Fe.length > 0;
        }, t.prototype.Me = function() {
            if (0 === this.Fe.length) return null;
            var t = this.Fe[this.Fe.length - 1];
            return {
                key: t.key,
                value: t.value
            };
        }, t;
    }(), Lt = /** @class */ function() {
        function t(e, n, r, i, o) {
            this.key = e, this.value = n, this.color = null != r ? r : t.RED, this.left = null != i ? i : t.EMPTY, 
            this.right = null != o ? o : t.EMPTY, this.size = this.left.size + 1 + this.right.size;
        }
        // Returns a copy of the current node, optionally replacing pieces of it.
            return t.prototype.me = function(e, n, r, i, o) {
            return new t(null != e ? e : this.key, null != n ? n : this.value, null != r ? r : this.color, null != i ? i : this.left, null != o ? o : this.right);
        }, t.prototype.B = function() {
            return !1;
        }, 
        // Traverses the tree in key order and calls the specified action function
        // for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        t.prototype.pe = function(t) {
            return this.left.pe(t) || t(this.key, this.value) || this.right.pe(t);
        }, 
        // Traverses the tree in reverse key order and calls the specified action
        // function for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        t.prototype.ye = function(t) {
            return this.right.ye(t) || t(this.key, this.value) || this.left.ye(t);
        }, 
        // Returns the minimum node in the tree.
        t.prototype.min = function() {
            return this.left.B() ? this : this.left.min();
        }, 
        // Returns the maximum key in the tree.
        t.prototype.Ve = function() {
            return this.min().key;
        }, 
        // Returns the maximum key in the tree.
        t.prototype.ge = function() {
            return this.right.B() ? this.key : this.right.ge();
        }, 
        // Returns new tree, with the key/value added.
        t.prototype.Ae = function(t, e, n) {
            var r = this, i = n(t, r.key);
            return (r = i < 0 ? r.me(null, null, null, r.left.Ae(t, e, n), null) : 0 === i ? r.me(null, e, null, null, null) : r.me(null, null, null, null, r.right.Ae(t, e, n))).xe();
        }, t.prototype.$e = function() {
            if (this.left.B()) return t.EMPTY;
            var e = this;
            return e.left.Oe() || e.left.left.Oe() || (e = e.Le()), (e = e.me(null, null, null, e.left.$e(), null)).xe();
        }, 
        // Returns new tree, with the specified item removed.
        t.prototype.remove = function(e, n) {
            var r, i = this;
            if (n(e, i.key) < 0) i.left.B() || i.left.Oe() || i.left.left.Oe() || (i = i.Le()), 
            i = i.me(null, null, null, i.left.remove(e, n), null); else {
                if (i.left.Oe() && (i = i.Be()), i.right.B() || i.right.Oe() || i.right.left.Oe() || (i = i.qe()), 
                0 === n(e, i.key)) {
                    if (i.right.B()) return t.EMPTY;
                    r = i.right.min(), i = i.me(r.key, r.value, null, null, i.right.$e());
                }
                i = i.me(null, null, null, null, i.right.remove(e, n));
            }
            return i.xe();
        }, t.prototype.Oe = function() {
            return this.color;
        }, 
        // Returns new tree after performing any needed rotations.
        t.prototype.xe = function() {
            var t = this;
            return t.right.Oe() && !t.left.Oe() && (t = t.Ue()), t.left.Oe() && t.left.left.Oe() && (t = t.Be()), 
            t.left.Oe() && t.right.Oe() && (t = t.Qe()), t;
        }, t.prototype.Le = function() {
            var t = this.Qe();
            return t.right.left.Oe() && (t = (t = (t = t.me(null, null, null, null, t.right.Be())).Ue()).Qe()), 
            t;
        }, t.prototype.qe = function() {
            var t = this.Qe();
            return t.left.left.Oe() && (t = (t = t.Be()).Qe()), t;
        }, t.prototype.Ue = function() {
            var e = this.me(null, null, t.RED, null, this.right.left);
            return this.right.me(null, null, this.color, e, null);
        }, t.prototype.Be = function() {
            var e = this.me(null, null, t.RED, this.left.right, null);
            return this.left.me(null, null, this.color, null, e);
        }, t.prototype.Qe = function() {
            var t = this.left.me(null, null, !this.left.color, null, null), e = this.right.me(null, null, !this.right.color, null, null);
            return this.me(null, null, !this.color, t, e);
        }, 
        // For testing.
        t.prototype.We = function() {
            var t = this.je();
            return Math.pow(2, t) <= this.size + 1;
        }, 
        // In a balanced RB tree, the black-depth (number of black nodes) from root to
        // leaves is equal on both sides.  This function verifies that or asserts.
        t.prototype.je = function() {
            if (this.Oe() && this.left.Oe()) throw ye();
            if (this.right.Oe()) throw ye();
            var t = this.left.je();
            if (t !== this.right.je()) throw ye();
            return t + (this.Oe() ? 0 : 1);
        }, t;
    }();

    // end SortedMap
    // An iterator over an LLRBNode.
    // end LLRBNode
    // Empty node is shared between all LLRB trees.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Lt.EMPTY = null, Lt.RED = !0, Lt.Pe = !1, 
    // end LLRBEmptyNode
    Lt.EMPTY = new (/** @class */ function() {
        function t() {
            this.size = 0;
        }
        return Object.defineProperty(t.prototype, "key", {
            get: function() {
                throw ye();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "value", {
            get: function() {
                throw ye();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "color", {
            get: function() {
                throw ye();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "left", {
            get: function() {
                throw ye();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "right", {
            get: function() {
                throw ye();
            },
            enumerable: !0,
            configurable: !0
        }), 
        // Returns a copy of the current node.
        t.prototype.me = function(t, e, n, r, i) {
            return this;
        }, 
        // Returns a copy of the tree, with the specified key/value added.
        t.prototype.Ae = function(t, e, n) {
            return new Lt(t, e);
        }, 
        // Returns a copy of the tree, with the specified key removed.
        t.prototype.remove = function(t, e) {
            return this;
        }, t.prototype.B = function() {
            return !0;
        }, t.prototype.pe = function(t) {
            return !1;
        }, t.prototype.ye = function(t) {
            return !1;
        }, t.prototype.Ve = function() {
            return null;
        }, t.prototype.ge = function() {
            return null;
        }, t.prototype.Oe = function() {
            return !1;
        }, 
        // For testing.
        t.prototype.We = function() {
            return !0;
        }, t.prototype.je = function() {
            return 0;
        }, t;
    }());

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * SortedSet is an immutable (copy-on-write) collection that holds elements
     * in order specified by the provided comparator.
     *
     * NOTE: if provided comparator returns 0 for two elements, we consider them to
     * be equal!
     */
    var Ot = /** @class */ function() {
        function t(t) {
            this.N = t, this.data = new Pt(this.N);
        }
        return t.prototype.has = function(t) {
            return null !== this.data.get(t);
        }, t.prototype.first = function() {
            return this.data.Ve();
        }, t.prototype.last = function() {
            return this.data.ge();
        }, Object.defineProperty(t.prototype, "size", {
            get: function() {
                return this.data.size;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.indexOf = function(t) {
            return this.data.indexOf(t);
        }, 
        /** Iterates elements in order defined by "comparator" */ t.prototype.forEach = function(t) {
            this.data.pe((function(e, n) {
                return t(e), !1;
            }));
        }, 
        /** Iterates over `elem`s such that: range[0] <= elem < range[1]. */ t.prototype.Ke = function(t, e) {
            for (var n = this.data.ve(t[0]); n.ke(); ) {
                var r = n.Ne();
                if (this.N(r.key, t[1]) >= 0) return;
                e(r.key);
            }
        }, 
        /**
         * Iterates over `elem`s such that: start <= elem until false is returned.
         */
        t.prototype.Ge = function(t, e) {
            var n;
            for (n = void 0 !== e ? this.data.ve(e) : this.data.be(); n.ke(); ) if (!t(n.Ne().key)) return;
        }, 
        /** Finds the least element greater than or equal to `elem`. */ t.prototype.ze = function(t) {
            var e = this.data.ve(t);
            return e.ke() ? e.Ne().key : null;
        }, t.prototype.be = function() {
            return new Ut(this.data.be());
        }, t.prototype.ve = function(t) {
            return new Ut(this.data.ve(t));
        }, 
        /** Inserts or updates an element */ t.prototype.add = function(t) {
            return this.me(this.data.remove(t).Ae(t, !0));
        }, 
        /** Deletes an element */ t.prototype.delete = function(t) {
            return this.has(t) ? this.me(this.data.remove(t)) : this;
        }, t.prototype.B = function() {
            return this.data.B();
        }, t.prototype.He = function(t) {
            var e = this;
            // Make sure `result` always refers to the larger one of the two sets.
                    return e.size < t.size && (e = t, t = this), t.forEach((function(t) {
                e = e.add(t);
            })), e;
        }, t.prototype.isEqual = function(e) {
            if (!(e instanceof t)) return !1;
            if (this.size !== e.size) return !1;
            for (var n = this.data.be(), r = e.data.be(); n.ke(); ) {
                var i = n.Ne().key, o = r.Ne().key;
                if (0 !== this.N(i, o)) return !1;
            }
            return !0;
        }, t.prototype.W = function() {
            var t = [];
            return this.forEach((function(e) {
                t.push(e);
            })), t;
        }, t.prototype.toString = function() {
            var t = [];
            return this.forEach((function(e) {
                return t.push(e);
            })), "SortedSet(" + t.toString() + ")";
        }, t.prototype.me = function(e) {
            var n = new t(this.N);
            return n.data = e, n;
        }, t;
    }(), Ut = /** @class */ function() {
        function t(t) {
            this.Ye = t;
        }
        return t.prototype.Ne = function() {
            return this.Ye.Ne().key;
        }, t.prototype.ke = function() {
            return this.Ye.ke();
        }, t;
    }(), Ct = new Pt(b.N);

    function qt() {
        return Ct;
    }

    function jt() {
        return qt();
    }

    var Mt = new Pt(b.N);

    function Ft() {
        return Mt;
    }

    var Bt = new Pt(b.N), zt = new Ot(b.N);

    function Gt() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        for (var n = zt, r = 0, i = t; r < i.length; r++) {
            var o = i[r];
            n = n.add(o);
        }
        return n;
    }

    var Wt = new Ot(we);

    function Qt() {
        return Wt;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentSet is an immutable (copy-on-write) collection that holds documents
     * in order specified by the provided comparator. We always add a document key
     * comparator on top of what is provided to guarantee document equality based on
     * the key.
     */ var Kt = /** @class */ function() {
        /** The default ordering is by key if the comparator is omitted */
        function t(t) {
            // We are adding document key comparator to the end as it's the only
            // guaranteed unique property of a document.
            this.N = t ? function(e, n) {
                return t(e, n) || b.N(e.key, n.key);
            } : function(t, e) {
                return b.N(t.key, e.key);
            }, this.Je = Ft(), this.Xe = new Pt(this.N)
            /**
         * Returns an empty copy of the existing DocumentSet, using the same
         * comparator.
         */;
        }
        return t.Ze = function(e) {
            return new t(e.N);
        }, t.prototype.has = function(t) {
            return null != this.Je.get(t);
        }, t.prototype.get = function(t) {
            return this.Je.get(t);
        }, t.prototype.first = function() {
            return this.Xe.Ve();
        }, t.prototype.last = function() {
            return this.Xe.ge();
        }, t.prototype.B = function() {
            return this.Xe.B();
        }, 
        /**
         * Returns the index of the provided key in the document set, or -1 if the
         * document key is not present in the set;
         */
        t.prototype.indexOf = function(t) {
            var e = this.Je.get(t);
            return e ? this.Xe.indexOf(e) : -1;
        }, Object.defineProperty(t.prototype, "size", {
            get: function() {
                return this.Xe.size;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /** Iterates documents in order defined by "comparator" */ t.prototype.forEach = function(t) {
            this.Xe.pe((function(e, n) {
                return t(e), !1;
            }));
        }, 
        /** Inserts or updates a document with the same key */ t.prototype.add = function(t) {
            // First remove the element if we have it.
            var e = this.delete(t.key);
            return e.me(e.Je.Ae(t.key, t), e.Xe.Ae(t, null));
        }, 
        /** Deletes a document with a given key */ t.prototype.delete = function(t) {
            var e = this.get(t);
            return e ? this.me(this.Je.remove(t), this.Xe.remove(e)) : this;
        }, t.prototype.isEqual = function(e) {
            if (!(e instanceof t)) return !1;
            if (this.size !== e.size) return !1;
            for (var n = this.Xe.be(), r = e.Xe.be(); n.ke(); ) {
                var i = n.Ne().key, o = r.Ne().key;
                if (!i.isEqual(o)) return !1;
            }
            return !0;
        }, t.prototype.toString = function() {
            var t = [];
            return this.forEach((function(e) {
                t.push(e.toString());
            })), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
        }, t.prototype.me = function(e, n) {
            var r = new t;
            return r.N = this.N, r.Je = e, r.Xe = n, r;
        }, t;
    }(), Yt = /** @class */ function() {
        function t() {
            this.ts = new Pt(b.N);
        }
        return t.prototype.track = function(t) {
            var e = t.doc.key, n = this.ts.get(e);
            n ? 
            // Merge the new change with the existing change.
            0 /* Added */ !== t.type && 3 /* Metadata */ === n.type ? this.ts = this.ts.Ae(e, t) : 3 /* Metadata */ === t.type && 1 /* Removed */ !== n.type ? this.ts = this.ts.Ae(e, {
                type: n.type,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 2 /* Modified */ === n.type ? this.ts = this.ts.Ae(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 0 /* Added */ === n.type ? this.ts = this.ts.Ae(e, {
                type: 0 /* Added */ ,
                doc: t.doc
            }) : 1 /* Removed */ === t.type && 0 /* Added */ === n.type ? this.ts = this.ts.remove(e) : 1 /* Removed */ === t.type && 2 /* Modified */ === n.type ? this.ts = this.ts.Ae(e, {
                type: 1 /* Removed */ ,
                doc: n.doc
            }) : 0 /* Added */ === t.type && 1 /* Removed */ === n.type ? this.ts = this.ts.Ae(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 
            // This includes these cases, which don't make sense:
            // Added->Added
            // Removed->Removed
            // Modified->Added
            // Removed->Modified
            // Metadata->Added
            // Removed->Metadata
            ye() : this.ts = this.ts.Ae(e, t);
        }, t.prototype.es = function() {
            var t = [];
            return this.ts.pe((function(e, n) {
                t.push(n);
            })), t;
        }, t;
    }(), Jt = /** @class */ function() {
        function t(t, e, n, r, i, o, s, u) {
            this.query = t, this.docs = e, this.ss = n, this.docChanges = r, this.ns = i, this.fromCache = o, 
            this.rs = s, this.hs = u
            /** Returns a view snapshot as if all documents in the snapshot were added. */;
        }
        return t.os = function(e, n, r, i) {
            var o = [];
            return n.forEach((function(t) {
                o.push({
                    type: 0 /* Added */ ,
                    doc: t
                });
            })), new t(e, n, Kt.Ze(n), o, r, i, 
            /* syncStateChanged= */ !0, 
            /* excludesMetadataChanges= */ !1);
        }, Object.defineProperty(t.prototype, "hasPendingWrites", {
            get: function() {
                return !this.ns.B();
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.isEqual = function(t) {
            if (!(this.fromCache === t.fromCache && this.rs === t.rs && this.ns.isEqual(t.ns) && this.query.isEqual(t.query) && this.docs.isEqual(t.docs) && this.ss.isEqual(t.ss))) return !1;
            var e = this.docChanges, n = t.docChanges;
            if (e.length !== n.length) return !1;
            for (var r = 0; r < e.length; r++) if (e[r].type !== n[r].type || !e[r].doc.isEqual(n[r].doc)) return !1;
            return !0;
        }, t;
    }(), Xt = /** @class */ function() {
        function t(
        /**
         * The snapshot version this event brings us up to, or MIN if not set.
         */
        t, 
        /**
         * A map from target to changes to the target. See TargetChange.
         */
        e, 
        /**
         * A set of targets that is known to be inconsistent. Listens for these
         * targets should be re-established without resume tokens.
         */
        n, 
        /**
         * A set of which documents have changed or been deleted, along with the
         * doc's new values (if not deleted).
         */
        r, 
        /**
         * A set of which document updates are due only to limbo resolution targets.
         */
        i) {
            this.Ee = t, this.as = e, this.us = n, this.cs = r, this._s = i;
        }
        /**
         * HACK: Views require RemoteEvents in order to determine whether the view is
         * CURRENT, but secondary tabs don't receive remote events. So this method is
         * used to create a synthesized RemoteEvent that can be used to apply a
         * CURRENT status change to a View, for queries executed in a different tab.
         */
        // PORTING NOTE: Multi-tab only
            return t.ls = function(e, n) {
            var r = new Map;
            return r.set(e, Ht.ds(e, n)), new t(g.min(), r, Qt(), qt(), Gt());
        }, t;
    }(), Ht = /** @class */ function() {
        function t(
        /**
         * An opaque, server-assigned token that allows watching a query to be resumed
         * after disconnecting without retransmitting all the data that matches the
         * query. The resume token essentially identifies a point in time from which
         * the server should resume sending results.
         */
        t, 
        /**
         * The "current" (synced) status of this target. Note that "current"
         * has special meaning in the RPC protocol that implies that a target is
         * both up-to-date and consistent with the rest of the watch stream.
         */
        e, 
        /**
         * The set of documents that were newly assigned to this target as part of
         * this remote event.
         */
        n, 
        /**
         * The set of documents that were already assigned to this target but received
         * an update during this remote event.
         */
        r, 
        /**
         * The set of documents that were removed from this target as part of this
         * remote event.
         */
        i) {
            this.resumeToken = t, this.fs = e, this.Ts = n, this.Es = r, this.Is = i
            /**
         * This method is used to create a synthesized TargetChanges that can be used to
         * apply a CURRENT status change to a View (for queries executed in a different
         * tab) or for new queries (to raise snapshots with correct CURRENT status).
         */;
        }
        return t.ds = function(e, n) {
            return new t(A.ht, n, Gt(), Gt(), Gt());
        }, t;
    }(), $t = function(
    /** The new document applies to all of these targets. */
    t, 
    /** The new document is removed from all of these targets. */
    e, 
    /** The key of the document for this change. */
    n, 
    /**
         * The new document or NoDocument if it was deleted. Is null if the
         * document went out of view without the server sending a new document.
         */
    r) {
        this.ws = t, this.removedTargetIds = e, this.key = n, this.Rs = r;
    }, Zt = function(t, e) {
        this.targetId = t, this.As = e;
    }, te = function(
    /** What kind of change occurred to the watch target. */
    t, 
    /** The target IDs that were added/removed/set. */
    e, 
    /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */
    n
    /** An RPC error indicating why the watch failed. */ , r) {
        void 0 === n && (n = A.ht), void 0 === r && (r = null), this.state = t, this.targetIds = e, 
        this.resumeToken = n, this.cause = r;
    }, ee = /** @class */ function() {
        function t() {
            /**
             * The number of pending responses (adds or removes) that we are waiting on.
             * We only consider targets active that have no pending responses.
             */
            this.ms = 0, 
            /**
                 * Keeps track of the document changes since the last raised snapshot.
                 *
                 * These changes are continuously updated as we receive document updates and
                 * always reflect the current set of changes against the last issued snapshot.
                 */
            this.Ps = ie(), 
            /** See public getters for explanations of these fields. */
            this.Vs = A.ht, this.gs = !1, 
            /**
                 * Whether this target state should be included in the next snapshot. We
                 * initialize to true so that newly-added targets are included in the next
                 * RemoteEvent.
                 */
            this.ps = !0;
        }
        return Object.defineProperty(t.prototype, "fs", {
            /**
             * Whether this target has been marked 'current'.
             *
             * 'Current' has special meaning in the RPC protocol: It implies that the
             * Watch backend has sent us all changes up to the point at which the target
             * was added and that the target is consistent with the rest of the watch
             * stream.
             */
            get: function() {
                return this.gs;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "resumeToken", {
            /** The last resume token sent to us for this target. */ get: function() {
                return this.Vs;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "ys", {
            /** Whether this target has pending target adds or target removes. */ get: function() {
                return 0 !== this.ms;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "bs", {
            /** Whether we have modified any state that should trigger a snapshot. */ get: function() {
                return this.ps;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /**
         * Applies the resume token to the TargetChange, but only when it has a new
         * value. Empty resumeTokens are discarded.
         */
        t.prototype.vs = function(t) {
            t.rt() > 0 && (this.ps = !0, this.Vs = t);
        }, 
        /**
         * Creates a target change from the current set of changes.
         *
         * To reset the document changes after raising this snapshot, call
         * `clearPendingChanges()`.
         */
        t.prototype.Ss = function() {
            var t = Gt(), e = Gt(), n = Gt();
            return this.Ps.forEach((function(r, i) {
                switch (i) {
                  case 0 /* Added */ :
                    t = t.add(r);
                    break;

                  case 2 /* Modified */ :
                    e = e.add(r);
                    break;

                  case 1 /* Removed */ :
                    n = n.add(r);
                    break;

                  default:
                    ye();
                }
            })), new Ht(this.Vs, this.gs, t, e, n);
        }, 
        /**
         * Resets the document changes and sets `hasPendingChanges` to false.
         */
        t.prototype.Ds = function() {
            this.ps = !1, this.Ps = ie();
        }, t.prototype.Cs = function(t, e) {
            this.ps = !0, this.Ps = this.Ps.Ae(t, e);
        }, t.prototype.Fs = function(t) {
            this.ps = !0, this.Ps = this.Ps.remove(t);
        }, t.prototype.Ns = function() {
            this.ms += 1;
        }, t.prototype.ks = function() {
            this.ms -= 1;
        }, t.prototype.Ms = function() {
            this.ps = !0, this.gs = !0;
        }, t;
    }(), ne = /** @class */ function() {
        function t(t) {
            this.xs = t, 
            /** The internal state of all tracked targets. */
            this.$s = new Map, 
            /** Keeps track of the documents to update since the last raised snapshot. */
            this.Os = qt(), 
            /** A mapping of document keys to their set of target IDs. */
            this.Ls = re(), 
            /**
                 * A list of targets with existence filter mismatches. These targets are
                 * known to be inconsistent and their listens needs to be re-established by
                 * RemoteStore.
                 */
            this.Bs = new Ot(we)
            /**
         * Processes and adds the DocumentWatchChange to the current set of changes.
         */;
        }
        return t.prototype.qs = function(t) {
            for (var e = 0, n = t.ws; e < n.length; e++) {
                var r = n[e];
                t.Rs instanceof yt ? this.Us(r, t.Rs) : t.Rs instanceof vt && this.Qs(r, t.key, t.Rs);
            }
            for (var i = 0, o = t.removedTargetIds; i < o.length; i++) {
                var s = o[i];
                this.Qs(s, t.key, t.Rs);
            }
        }, 
        /** Processes and adds the WatchTargetChange to the current set of changes. */ t.prototype.Ws = function(t) {
            var e = this;
            this.js(t, (function(n) {
                var r = e.Ks(n);
                switch (t.state) {
                  case 0 /* NoChange */ :
                    e.Gs(n) && r.vs(t.resumeToken);
                    break;

                  case 1 /* Added */ :
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    r.ks(), r.ys || 
                    // We have a freshly added target, so we need to reset any state
                    // that we had previously. This can happen e.g. when remove and add
                    // back a target for existence filter mismatches.
                    r.Ds(), r.vs(t.resumeToken);
                    break;

                  case 2 /* Removed */ :
                    // We need to keep track of removed targets to we can post-filter and
                    // remove any target changes.
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    r.ks(), r.ys || e.removeTarget(n);
                    break;

                  case 3 /* Current */ :
                    e.Gs(n) && (r.Ms(), r.vs(t.resumeToken));
                    break;

                  case 4 /* Reset */ :
                    e.Gs(n) && (
                    // Reset the target and synthesizes removes for all existing
                    // documents. The backend will re-add any documents that still
                    // match the target before it sends the next global snapshot.
                    e.zs(n), r.vs(t.resumeToken));
                    break;

                  default:
                    ye();
                }
            }));
        }, 
        /**
         * Iterates over all targetIds that the watch change applies to: either the
         * targetIds explicitly listed in the change or the targetIds of all currently
         * active targets.
         */
        t.prototype.js = function(t, e) {
            var n = this;
            t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.$s.forEach((function(t, r) {
                n.Gs(r) && e(r);
            }));
        }, 
        /**
         * Handles existence filters and synthesizes deletes for filter mismatches.
         * Targets that are invalidated by filter mismatches are added to
         * `pendingTargetResets`.
         */
        t.prototype.Hs = function(t) {
            var e = t.targetId, n = t.As.count, r = this.Ys(e);
            if (r) {
                var i = r.target;
                if (i.Ot()) if (0 === n) {
                    // The existence filter told us the document does not exist. We deduce
                    // that this document does not exist and apply a deleted document to
                    // our updates. Without applying this deleted document there might be
                    // another query that will raise this document as part of a snapshot
                    // until it is resolved, essentially exposing inconsistency between
                    // queries.
                    var o = new b(i.path);
                    this.Qs(e, o, new vt(o, g.min()));
                } else ve(1 === n); else this.Js(e) !== n && (
                // Existence filter mismatch: We reset the mapping and raise a new
                // snapshot with `isFromCache:true`.
                this.zs(e), this.Bs = this.Bs.add(e));
            }
        }, 
        /**
         * Converts the currently accumulated state into a remote event at the
         * provided snapshot version. Resets the accumulated changes before returning.
         */
        t.prototype.Xs = function(t) {
            var e = this, n = new Map;
            this.$s.forEach((function(r, i) {
                var o = e.Ys(i);
                if (o) {
                    if (r.fs && o.target.Ot()) {
                        // Document queries for document that don't exist can produce an empty
                        // result set. To update our local cache, we synthesize a document
                        // delete if we have not previously received the document. This
                        // resolves the limbo state of the document, removing it from
                        // limboDocumentRefs.
                        // TODO(dimond): Ideally we would have an explicit lookup target
                        // instead resulting in an explicit delete message and we could
                        // remove this special logic.
                        var s = new b(o.target.path);
                        null !== e.Os.get(s) || e.Zs(i, s) || e.Qs(i, s, new vt(s, t));
                    }
                    r.bs && (n.set(i, r.Ss()), r.Ds());
                }
            }));
            var r = Gt();
            // We extract the set of limbo-only document updates as the GC logic
            // special-cases documents that do not appear in the target cache.
            // TODO(gsoltis): Expand on this comment once GC is available in the JS
            // client.
                    this.Ls.forEach((function(t, n) {
                var i = !0;
                n.Ge((function(t) {
                    var n = e.Ys(t);
                    return !n || 2 /* LimboResolution */ === n.Te || (i = !1, !1);
                })), i && (r = r.add(t));
            }));
            var i = new Xt(t, n, this.Bs, this.Os, r);
            return this.Os = qt(), this.Ls = re(), this.Bs = new Ot(we), i;
        }, 
        /**
         * Adds the provided document to the internal list of document updates and
         * its document key to the given target's mapping.
         */
        // Visible for testing.
        t.prototype.Us = function(t, e) {
            if (this.Gs(t)) {
                var n = this.Zs(t, e.key) ? 2 /* Modified */ : 0 /* Added */;
                this.Ks(t).Cs(e.key, n), this.Os = this.Os.Ae(e.key, e), this.Ls = this.Ls.Ae(e.key, this.ti(e.key).add(t));
            }
        }, 
        /**
         * Removes the provided document from the target mapping. If the
         * document no longer matches the target, but the document's state is still
         * known (e.g. we know that the document was deleted or we received the change
         * that caused the filter mismatch), the new document can be provided
         * to update the remote document cache.
         */
        // Visible for testing.
        t.prototype.Qs = function(t, e, n) {
            if (this.Gs(t)) {
                var r = this.Ks(t);
                this.Zs(t, e) ? r.Cs(e, 1 /* Removed */) : 
                // The document may have entered and left the target before we raised a
                // snapshot, so we can just ignore the change.
                r.Fs(e), this.Ls = this.Ls.Ae(e, this.ti(e).delete(t)), n && (this.Os = this.Os.Ae(e, n));
            }
        }, t.prototype.removeTarget = function(t) {
            this.$s.delete(t);
        }, 
        /**
         * Returns the current count of documents in the target. This includes both
         * the number of documents that the LocalStore considers to be part of the
         * target as well as any accumulated changes.
         */
        t.prototype.Js = function(t) {
            var e = this.Ks(t).Ss();
            return this.xs.ei(t).size + e.Ts.size - e.Is.size;
        }, 
        /**
         * Increment the number of acks needed from watch before we can consider the
         * server to be 'in-sync' with the client's active targets.
         */
        t.prototype.Ns = function(t) {
            this.Ks(t).Ns();
        }, t.prototype.Ks = function(t) {
            var e = this.$s.get(t);
            return e || (e = new ee, this.$s.set(t, e)), e;
        }, t.prototype.ti = function(t) {
            var e = this.Ls.get(t);
            return e || (e = new Ot(we), this.Ls = this.Ls.Ae(t, e)), e;
        }, 
        /**
         * Verifies that the user is still interested in this target (by calling
         * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
         * from watch.
         */
        t.prototype.Gs = function(t) {
            var e = null !== this.Ys(t);
            return e || le("WatchChangeAggregator", "Detected inactive target", t), e;
        }, 
        /**
         * Returns the TargetData for an active target (i.e. a target that the user
         * is still interested in that has no outstanding target change requests).
         */
        t.prototype.Ys = function(t) {
            var e = this.$s.get(t);
            return e && e.ys ? null : this.xs.si(t);
        }, 
        /**
         * Resets the state of a Watch target to its initial state (e.g. sets
         * 'current' to false, clears the resume token and removes its target mapping
         * from all documents).
         */
        t.prototype.zs = function(t) {
            var e = this;
            this.$s.set(t, new ee), this.xs.ei(t).forEach((function(n) {
                e.Qs(t, n, /*updatedDocument=*/ null);
            }));
        }, 
        /**
         * Returns whether the LocalStore considers the document to be part of the
         * specified target.
         */
        t.prototype.Zs = function(t, e) {
            return this.xs.ei(t).has(e);
        }, t;
    }();

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
     * duplicate events for the same doc.
     */ function re() {
        return new Pt(b.N);
    }

    function ie() {
        return new Pt(b.N);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ var oe = {
        asc: "ASCENDING",
        desc: "DESCENDING"
    }, se = {
        "<": "LESS_THAN",
        "<=": "LESS_THAN_OR_EQUAL",
        ">": "GREATER_THAN",
        ">=": "GREATER_THAN_OR_EQUAL",
        "==": "EQUAL",
        "array-contains": "ARRAY_CONTAINS",
        in: "IN",
        "array-contains-any": "ARRAY_CONTAINS_ANY"
    }, ue = /** @class */ function() {
        function t(t, e) {
            this.ii = t, this.options = e;
        }
        return t.prototype.ni = function(t) {
            var e = void 0 === t.code ? c.UNKNOWN : kt(t.code);
            return new h(e, t.message || "");
        }, 
        /**
         * Returns a value for a number (or null) that's appropriate to put into
         * a google.protobuf.Int32Value proto.
         * DO NOT USE THIS FOR ANYTHING ELSE.
         * This method cheats. It's typed as returning "number" because that's what
         * our generated proto interfaces say Int32Value must be. But GRPC actually
         * expects a { value: <number> } struct.
         */
        t.prototype.ri = function(t) {
            return this.options.hi || x(t) ? t : {
                value: t
            };
        }, 
        /**
         * Returns a number (or null) from a google.protobuf.Int32Value proto.
         */
        t.prototype.oi = function(t) {
            var e;
            return x(e = "object" == typeof t ? t.value : t) ? null : e;
        }, 
        /**
         * Returns an IntegerValue for `value`.
         */
        t.prototype._t = function(t) {
            return {
                integerValue: "" + t
            };
        }, 
        /**
         * Returns an DoubleValue for `value` that is encoded based the serializer's
         * `useProto3Json` setting.
         */
        t.prototype.lt = function(t) {
            if (this.options.hi) {
                if (isNaN(t)) return {
                    doubleValue: "NaN"
                };
                if (t === 1 / 0) return {
                    doubleValue: "Infinity"
                };
                if (t === -1 / 0) return {
                    doubleValue: "-Infinity"
                };
            }
            return {
                doubleValue: D(t) ? "-0" : t
            };
        }, 
        /**
         * Returns a value for a number that's appropriate to put into a proto.
         * The return value is an IntegerValue if it can safely represent the value,
         * otherwise a DoubleValue is returned.
         */
        t.prototype.ai = function(t) {
            return S(t) ? this._t(t) : this.lt(t);
        }, 
        /**
         * Returns a value for a Date that's appropriate to put into a proto.
         */
        t.prototype.C = function(t) {
            return this.options.hi ? new Date(1e3 * t.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "") + "." + ("000000000" + t.nanoseconds).slice(-9) + "Z" : {
                seconds: "" + t.seconds,
                nanos: t.nanoseconds
            };
        }, t.prototype.v = function(t) {
            var e = j(t);
            return new v(e.seconds, e.nanos);
        }, 
        /**
         * Returns a value for bytes that's appropriate to put in a proto.
         *
         * Visible for testing.
         */
        t.prototype.ui = function(t) {
            return this.options.hi ? t.toBase64() : t.toUint8Array();
        }, 
        /**
         * Returns a ByteString based on the proto string value.
         */
        t.prototype.ci = function(t) {
            return this.options.hi ? (ve(void 0 === t || "string" == typeof t), A.fromBase64String(t || "")) : (ve(void 0 === t || t instanceof Uint8Array), 
            A.fromUint8Array(t || new Uint8Array));
        }, t.prototype.toVersion = function(t) {
            return this.C(t.C());
        }, t.prototype.fromVersion = function(t) {
            return ve(!!t), g.v(this.v(t));
        }, t.prototype._i = function(t, e) {
            return this.li(e || this.ii).child("documents").child(t).j();
        }, t.prototype.di = function(t) {
            var e = w.K(t);
            return ve(ae(e)), e;
        }, t.prototype.fi = function(t) {
            return this._i(t.path);
        }, t.prototype.Z = function(t) {
            var e = this.di(t);
            return ve(e.get(1) === this.ii.projectId), ve(!e.get(3) && !this.ii.database || e.get(3) === this.ii.database), 
            new b(this.Ti(e));
        }, t.prototype.Ei = function(t) {
            return this._i(t);
        }, t.prototype.Ii = function(t) {
            var e = this.di(t);
            // In v1beta1 queries for collections at the root did not have a trailing
            // "/documents". In v1 all resource paths contain "/documents". Preserve the
            // ability to read the v1beta1 form for compatibility with queries persisted
            // in the local target cache.
                    return 4 === e.length ? w.G : this.Ti(e);
        }, Object.defineProperty(t.prototype, "wi", {
            get: function() {
                return new w([ "projects", this.ii.projectId, "databases", this.ii.database ]).j();
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.li = function(t) {
            return new w([ "projects", t.projectId, "databases", t.database ]);
        }, t.prototype.Ti = function(t) {
            return ve(t.length > 4 && "documents" === t.get(4)), t.M(5);
        }, 
        /** Creates an api.Document from key and fields (but no create/update time) */ t.prototype.Ri = function(t, e) {
            return {
                name: this.fi(t),
                fields: e.proto.mapValue.fields
            };
        }, t.prototype.Ai = function(t) {
            return {
                name: this.fi(t.key),
                fields: t.xt().mapValue.fields,
                updateTime: this.C(t.version.C())
            };
        }, t.prototype.mi = function(t, e) {
            var n = this.Z(t.name), r = this.fromVersion(t.updateTime), i = new ct({
                mapValue: {
                    fields: t.fields
                }
            });
            return new yt(n, r, i, {
                hasCommittedMutations: !!e
            });
        }, t.prototype.Pi = function(t) {
            ve(!!t.found), t.found.name, t.found.updateTime;
            var e = this.Z(t.found.name), n = this.fromVersion(t.found.updateTime), r = new ct({
                mapValue: {
                    fields: t.found.fields
                }
            });
            return new yt(e, n, r, {});
        }, t.prototype.Vi = function(t) {
            ve(!!t.missing), ve(!!t.readTime);
            var e = this.Z(t.missing), n = this.fromVersion(t.readTime);
            return new vt(e, n);
        }, t.prototype.gi = function(t) {
            return "found" in t ? this.Pi(t) : "missing" in t ? this.Vi(t) : ye();
        }, t.prototype.pi = function(t) {
            var e;
            if ("targetChange" in t) {
                t.targetChange;
                // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
                // if unset
                var n = this.yi(t.targetChange.targetChangeType || "NO_CHANGE"), r = t.targetChange.targetIds || [], i = this.ci(t.targetChange.resumeToken), o = t.targetChange.cause, s = o && this.ni(o);
                e = new te(n, r, i, s || null);
            } else if ("documentChange" in t) {
                t.documentChange;
                var u = t.documentChange;
                u.document, u.document.name, u.document.updateTime;
                var a = this.Z(u.document.name), c = this.fromVersion(u.document.updateTime), h = new ct({
                    mapValue: {
                        fields: u.document.fields
                    }
                }), f = new yt(a, c, h, {}), l = u.targetIds || [], p = u.removedTargetIds || [];
                e = new $t(l, p, f.key, f);
            } else if ("documentDelete" in t) {
                t.documentDelete;
                var d = t.documentDelete;
                d.document;
                var y = this.Z(d.document), v = d.readTime ? this.fromVersion(d.readTime) : g.min(), m = new vt(y, v), w = d.removedTargetIds || [];
                e = new $t([], w, m.key, m);
            } else if ("documentRemove" in t) {
                t.documentRemove;
                var E = t.documentRemove;
                E.document;
                var _ = this.Z(E.document), b = E.removedTargetIds || [];
                e = new $t([], b, _, null);
            } else {
                if (!("filter" in t)) return ye();
                t.filter;
                var T = t.filter;
                T.targetId;
                var I = T.count || 0, N = new St(I), A = T.targetId;
                e = new Zt(A, N);
            }
            return e;
        }, t.prototype.yi = function(t) {
            return "NO_CHANGE" === t ? 0 /* NoChange */ : "ADD" === t ? 1 /* Added */ : "REMOVE" === t ? 2 /* Removed */ : "CURRENT" === t ? 3 /* Current */ : "RESET" === t ? 4 /* Reset */ : ye();
        }, t.prototype.bi = function(t) {
            // We have only reached a consistent snapshot for the entire stream if there
            // is a read_time set and it applies to all targets (i.e. the list of
            // targets is empty). The backend is guaranteed to send such responses.
            if (!("targetChange" in t)) return g.min();
            var e = t.targetChange;
            return e.targetIds && e.targetIds.length ? g.min() : e.readTime ? this.fromVersion(e.readTime) : g.min();
        }, t.prototype.vi = function(t) {
            var e, n = this;
            if (t instanceof it) e = {
                update: this.Ri(t.key, t.value)
            }; else if (t instanceof ut) e = {
                delete: this.fi(t.key)
            }; else if (t instanceof ot) e = {
                update: this.Ri(t.key, t.data),
                updateMask: this.Si(t.Vt)
            }; else if (t instanceof st) e = {
                transform: {
                    document: this.fi(t.key),
                    fieldTransforms: t.fieldTransforms.map((function(t) {
                        return n.Di(t);
                    }))
                }
            }; else {
                if (!(t instanceof at)) return ye();
                e = {
                    verify: this.fi(t.key)
                };
            }
            return t.Rt.Tt || (e.currentDocument = this.Ci(t.Rt)), e;
        }, t.prototype.Fi = function(t) {
            var e = this, n = t.currentDocument ? this.Ni(t.currentDocument) : nt.ft();
            if (t.update) {
                t.update.name;
                var r = this.Z(t.update.name), i = new ct({
                    mapValue: {
                        fields: t.update.fields
                    }
                });
                if (t.updateMask) {
                    var o = this.ki(t.updateMask);
                    return new ot(r, i, o, n);
                }
                return new it(r, i, n);
            }
            if (t.delete) {
                var s = this.Z(t.delete);
                return new ut(s, n);
            }
            if (t.transform) {
                var u = this.Z(t.transform.document), a = t.transform.fieldTransforms.map((function(t) {
                    return e.Mi(t);
                }));
                return ve(!0 === n.exists), new st(u, a);
            }
            if (t.verify) {
                var c = this.Z(t.verify);
                return new at(c, n);
            }
            return ye();
        }, t.prototype.Ci = function(t) {
            return void 0 !== t.updateTime ? {
                updateTime: this.toVersion(t.updateTime)
            } : void 0 !== t.exists ? {
                exists: t.exists
            } : ye();
        }, t.prototype.Ni = function(t) {
            return void 0 !== t.updateTime ? nt.updateTime(this.fromVersion(t.updateTime)) : void 0 !== t.exists ? nt.exists(t.exists) : nt.ft();
        }, t.prototype.xi = function(t, e) {
            // NOTE: Deletes don't have an updateTime.
            var n = t.updateTime ? this.fromVersion(t.updateTime) : this.fromVersion(e);
            n.isEqual(g.min()) && (
            // The Firestore Emulator currently returns an update time of 0 for
            // deletes of non-existing documents (rather than null). This breaks the
            // test "get deleted doc while offline with source=cache" as NoDocuments
            // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
            // TODO(#2149): Remove this when Emulator is fixed
            n = this.fromVersion(e));
            var r = null;
            return t.transformResults && t.transformResults.length > 0 && (r = t.transformResults), 
            new et(n, r);
        }, t.prototype.$i = function(t, e) {
            var n = this;
            return t && t.length > 0 ? (ve(void 0 !== e), t.map((function(t) {
                return n.xi(t, e);
            }))) : [];
        }, t.prototype.Di = function(t) {
            var e = t.transform;
            if (e instanceof Y) return {
                fieldPath: t.field.j(),
                setToServerValue: "REQUEST_TIME"
            };
            if (e instanceof J) return {
                fieldPath: t.field.j(),
                appendMissingElements: {
                    values: e.elements
                }
            };
            if (e instanceof X) return {
                fieldPath: t.field.j(),
                removeAllFromArray: {
                    values: e.elements
                }
            };
            if (e instanceof H) return {
                fieldPath: t.field.j(),
                increment: e.ct
            };
            throw ye();
        }, t.prototype.Mi = function(t) {
            var e = null;
            if ("setToServerValue" in t) ve("REQUEST_TIME" === t.setToServerValue), e = Y.instance; else if ("appendMissingElements" in t) {
                var n = t.appendMissingElements.values || [];
                e = new J(n);
            } else if ("removeAllFromArray" in t) {
                var r = t.removeAllFromArray.values || [];
                e = new X(r);
            } else "increment" in t ? e = new H(this, t.increment) : ye();
            var i = _.X(t.fieldPath);
            return new tt(i, e);
        }, t.prototype.Oi = function(t) {
            return {
                documents: [ this.Ei(t.path) ]
            };
        }, t.prototype.Li = function(t) {
            ve(1 === t.documents.length);
            var e = t.documents[0];
            return wt.Wt(this.Ii(e)).ee();
        }, t.prototype.Bi = function(t) {
            // Dissect the path into parent, collectionId, and optional key filter.
            var e = {
                structuredQuery: {}
            }, n = t.path;
            null !== t.collectionGroup ? (e.parent = this.Ei(n), e.structuredQuery.from = [ {
                collectionId: t.collectionGroup,
                allDescendants: !0
            } ]) : (e.parent = this.Ei(n.$()), e.structuredQuery.from = [ {
                collectionId: n.L()
            } ]);
            var r = this.qi(t.filters);
            r && (e.structuredQuery.where = r);
            var i = this.Ui(t.orderBy);
            i && (e.structuredQuery.orderBy = i);
            var o = this.ri(t.limit);
            return null !== o && (e.structuredQuery.limit = o), t.startAt && (e.structuredQuery.startAt = this.Qi(t.startAt)), 
            t.endAt && (e.structuredQuery.endAt = this.Qi(t.endAt)), e;
        }, t.prototype.Wi = function(t) {
            var e = this.Ii(t.parent), n = t.structuredQuery, r = n.from ? n.from.length : 0, i = null;
            if (r > 0) {
                ve(1 === r);
                var o = n.from[0];
                o.allDescendants ? i = o.collectionId : e = e.child(o.collectionId);
            }
            var s = [];
            n.where && (s = this.ji(n.where));
            var u = [];
            n.orderBy && (u = this.Ki(n.orderBy));
            var a = null;
            n.limit && (a = this.oi(n.limit));
            var c = null;
            n.startAt && (c = this.Gi(n.startAt));
            var h = null;
            return n.endAt && (h = this.Gi(n.endAt)), new wt(e, i, u, s, a, "F" /* First */ , c, h).ee();
        }, t.prototype.zi = function(t) {
            var e = this.Hi(t.Te);
            return null == e ? null : {
                "goog-listen-tags": e
            };
        }, t.prototype.Hi = function(t) {
            switch (t) {
              case 0 /* Listen */ :
                return null;

              case 1 /* ExistenceFilterMismatch */ :
                return "existence-filter-mismatch";

              case 2 /* LimboResolution */ :
                return "limbo-document";

              default:
                return ye();
            }
        }, t.prototype.ee = function(t) {
            var e, n = t.target;
            return (e = n.Ot() ? {
                documents: this.Oi(n)
            } : {
                query: this.Bi(n)
            }).targetId = t.targetId, t.resumeToken.rt() > 0 && (e.resumeToken = this.ui(t.resumeToken)), 
            e;
        }, t.prototype.qi = function(t) {
            var e = this;
            if (0 !== t.length) {
                var n = t.map((function(t) {
                    return t instanceof Et ? e.Yi(t) : ye();
                }));
                return 1 === n.length ? n[0] : {
                    compositeFilter: {
                        op: "AND",
                        filters: n
                    }
                };
            }
        }, t.prototype.ji = function(t) {
            var e = this;
            return t ? void 0 !== t.unaryFilter ? [ this.Ji(t) ] : void 0 !== t.fieldFilter ? [ this.Xi(t) ] : void 0 !== t.compositeFilter ? t.compositeFilter.filters.map((function(t) {
                return e.ji(t);
            })).reduce((function(t, e) {
                return t.concat(e);
            })) : ye() : [];
        }, t.prototype.Ui = function(t) {
            var e = this;
            if (0 !== t.length) return t.map((function(t) {
                return e.Zi(t);
            }));
        }, t.prototype.Ki = function(t) {
            var e = this;
            return t.map((function(t) {
                return e.tn(t);
            }));
        }, t.prototype.Qi = function(t) {
            return {
                before: t.before,
                values: t.position
            };
        }, t.prototype.Gi = function(t) {
            var e = !!t.before, n = t.values || [];
            return new At(n, e);
        }, 
        // visible for testing
        t.prototype.en = function(t) {
            return oe[t];
        }, 
        // visible for testing
        t.prototype.sn = function(t) {
            switch (t) {
              case "ASCENDING":
                return "asc" /* ASCENDING */;

              case "DESCENDING":
                return "desc" /* DESCENDING */;

              default:
                return;
            }
        }, 
        // visible for testing
        t.prototype.nn = function(t) {
            return se[t];
        }, t.prototype.rn = function(t) {
            switch (t) {
              case "EQUAL":
                return "==" /* EQUAL */;

              case "GREATER_THAN":
                return ">" /* GREATER_THAN */;

              case "GREATER_THAN_OR_EQUAL":
                return ">=" /* GREATER_THAN_OR_EQUAL */;

              case "LESS_THAN":
                return "<" /* LESS_THAN */;

              case "LESS_THAN_OR_EQUAL":
                return "<=" /* LESS_THAN_OR_EQUAL */;

              case "ARRAY_CONTAINS":
                return "array-contains" /* ARRAY_CONTAINS */;

              case "IN":
                return "in" /* IN */;

              case "ARRAY_CONTAINS_ANY":
                return "array-contains-any" /* ARRAY_CONTAINS_ANY */;

              case "OPERATOR_UNSPECIFIED":
              default:
                return ye();
            }
        }, t.prototype.hn = function(t) {
            return {
                fieldPath: t.j()
            };
        }, t.prototype.on = function(t) {
            return _.X(t.fieldPath);
        }, 
        // visible for testing
        t.prototype.Zi = function(t) {
            return {
                field: this.hn(t.field),
                direction: this.en(t.dir)
            };
        }, t.prototype.tn = function(t) {
            return new xt(this.on(t.field), this.sn(t.direction));
        }, t.prototype.Xi = function(t) {
            return Et.create(this.on(t.fieldFilter.field), this.rn(t.fieldFilter.op), t.fieldFilter.value);
        }, 
        // visible for testing
        t.prototype.Yi = function(t) {
            if ("==" /* EQUAL */ === t.op) {
                if (Q(t.value)) return {
                    unaryFilter: {
                        field: this.hn(t.field),
                        op: "IS_NAN"
                    }
                };
                if (W(t.value)) return {
                    unaryFilter: {
                        field: this.hn(t.field),
                        op: "IS_NULL"
                    }
                };
            }
            return {
                fieldFilter: {
                    field: this.hn(t.field),
                    op: this.nn(t.op),
                    value: t.value
                }
            };
        }, t.prototype.Ji = function(t) {
            switch (t.unaryFilter.op) {
              case "IS_NAN":
                var e = this.on(t.unaryFilter.field);
                return Et.create(e, "==" /* EQUAL */ , {
                    doubleValue: NaN
                });

              case "IS_NULL":
                var n = this.on(t.unaryFilter.field);
                return Et.create(n, "==" /* EQUAL */ , {
                    nullValue: "NULL_VALUE"
                });

              case "OPERATOR_UNSPECIFIED":
              default:
                return ye();
            }
        }, t.prototype.Si = function(t) {
            var e = [];
            return t.fields.forEach((function(t) {
                return e.push(t.j());
            })), {
                fieldPaths: e
            };
        }, t.prototype.ki = function(t) {
            var e = t.fieldPaths || [];
            return new Z(e.map((function(t) {
                return _.X(t);
            })));
        }, t;
    }();

    /**
     * Generates JsonObject values for the Datastore API suitable for sending to
     * either GRPC stub methods or via the JSON/HTTP REST API.
     * TODO(klimt): We can remove the databaseId argument if we keep the full
     * resource name in documents.
     */ function ae(t) {
        // Resource names have at least 4 components (project ID, database ID)
        return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides singleton helpers where setup code can inject a platform at runtime.
     * setPlatform needs to be set before Firestore is used and must be set exactly
     * once.
     */ var ce = /** @class */ function() {
        function t() {}
        return t.an = function(e) {
            t.platform && ye(), t.platform = e;
        }, t.nt = function() {
            return t.platform || ye(), t.platform;
        }, t;
    }(), he = new r.Logger("@firebase/firestore");

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Helper methods are needed because variables can't be exported as read/write
    function fe() {
        return he.logLevel;
    }

    function le(t) {
        for (var n = [], i = 1; i < arguments.length; i++) n[i - 1] = arguments[i];
        if (he.logLevel <= r.LogLevel.DEBUG) {
            var o = n.map(de);
            he.debug.apply(he, e.__spreadArrays([ "Firestore (" + u + "): " + t ], o));
        }
    }

    function pe(t) {
        for (var n = [], i = 1; i < arguments.length; i++) n[i - 1] = arguments[i];
        if (he.logLevel <= r.LogLevel.ERROR) {
            var o = n.map(de);
            he.error.apply(he, e.__spreadArrays([ "Firestore (" + u + "): " + t ], o));
        }
    }

    /**
     * Converts an additional log parameter to a string representation.
     */ function de(t) {
        if ("string" == typeof t) return t;
        var e = ce.nt();
        try {
            return e.un(t);
        } catch (e) {
            // Converting to JSON failed, just log the object directly
            return t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Unconditionally fails, throwing an Error with the given message.
     * Messages are stripped in production builds.
     *
     * Returns `never` and can be used in expressions:
     * @example
     * let futureVar = fail('not implemented yet');
     */ function ye(t) {
        void 0 === t && (t = "Unexpected state");
        // Log the failure in addition to throw an exception, just in case the
        // exception is swallowed.
            var e = "FIRESTORE (" + u + ") INTERNAL ASSERTION FAILED: " + t;
        // NOTE: We don't use FirestoreError here because these are internal failures
        // that cannot be handled by the user. (Also it would create a circular
        // dependency between the error and assert modules which doesn't work.)
            throw pe(e), new Error(e)
        /**
     * Fails if the given assertion condition is false, throwing an Error with the
     * given message if it did.
     *
     * Messages are stripped in production builds.
     */;
    }

    function ve(t, e) {
        t || ye();
    }

    /**
     * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
     * instance of `T` before casting.
     */ function ge(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        return t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ var me = /** @class */ function() {
        function t() {}
        return t.cn = function() {
            for (
            // Alphanumeric characters
            var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length, n = ""
            // The largest byte value that is a multiple of `char.length`.
            ; n.length < 20; ) for (var r = ce.nt()._n(40), i = 0; i < r.length; ++i) 
            // Only accept values that are [0, maxMultiple), this ensures they can
            // be evenly mapped to indices of `chars` via a modulo operation.
            n.length < 20 && r[i] < e && (n += t.charAt(r[i] % t.length));
            return n;
        }, t;
    }();

    function we(t, e) {
        return t < e ? -1 : t > e ? 1 : 0;
    }

    /** Helper to compare arrays using isEqual(). */ function Ee(t, e, n) {
        return t.length === e.length && t.every((function(t, r) {
            return n(t, e[r]);
        }));
    }

    /**
     * Returns the immediate lexicographically-following string. This is useful to
     * construct an inclusive range for indexeddb iterators.
     */ function _e(t) {
        // Return the input string, with an additional NUL byte appended.
        return t + "\0";
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ var be = 
    /**
         * Constructs a DatabaseInfo using the provided host, databaseId and
         * persistenceKey.
         *
         * @param databaseId The database to use.
         * @param persistenceKey A unique identifier for this Firestore's local
         * storage (used in conjunction with the databaseId).
         * @param host The Firestore backend host to connect to.
         * @param ssl Whether to use SSL when connecting.
         * @param forceLongPolling Whether to use the forceLongPolling option
         * when using WebChannel as the network transport.
         */
    function(t, e, n, r, i) {
        this.ii = t, this.persistenceKey = e, this.host = n, this.ssl = r, this.forceLongPolling = i;
    }, Te = /** @class */ function() {
        function t(t, e) {
            this.projectId = t, this.database = e || "(default)";
        }
        return Object.defineProperty(t.prototype, "ln", {
            get: function() {
                return "(default)" === this.database;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.isEqual = function(e) {
            return e instanceof t && e.projectId === this.projectId && e.database === this.database;
        }, t.prototype.S = function(t) {
            return we(this.projectId, t.projectId) || we(this.database, t.database);
        }, t;
    }(), Ie = /** @class */ function() {
        function t(t) {
            this.dn = t, 
            /**
                 * The inner map for a key -> value pair. Due to the possibility of
                 * collisions we keep a list of entries that we do a linear search through
                 * to find an actual match. Note that collisions should be rare, so we still
                 * expect near constant time lookups in practice.
                 */
            this.fn = {}
            /** Get a value for this key, or undefined if it does not exist. */;
        }
        return t.prototype.get = function(t) {
            var e = this.dn(t), n = this.fn[e];
            if (void 0 !== n) for (var r = 0, i = n; r < i.length; r++) {
                var o = i[r], s = o[0], u = o[1];
                if (s.isEqual(t)) return u;
            }
        }, t.prototype.has = function(t) {
            return void 0 !== this.get(t);
        }, 
        /** Put this key and value in the map. */ t.prototype.set = function(t, e) {
            var n = this.dn(t), r = this.fn[n];
            if (void 0 !== r) {
                for (var i = 0; i < r.length; i++) if (r[i][0].isEqual(t)) return void (r[i] = [ t, e ]);
                r.push([ t, e ]);
            } else this.fn[n] = [ [ t, e ] ];
        }, 
        /**
         * Remove this key from the map. Returns a boolean if anything was deleted.
         */
        t.prototype.delete = function(t) {
            var e = this.dn(t), n = this.fn[e];
            if (void 0 === n) return !1;
            for (var r = 0; r < n.length; r++) if (n[r][0].isEqual(t)) return 1 === n.length ? delete this.fn[e] : n.splice(r, 1), 
            !0;
            return !1;
        }, t.prototype.forEach = function(t) {
            I(this.fn, (function(e, n) {
                for (var r = 0, i = n; r < i.length; r++) {
                    var o = i[r], s = o[0], u = o[1];
                    t(s, u);
                }
            }));
        }, t.prototype.B = function() {
            return N(this.fn);
        }, t;
    }(), Ne = /** @class */ function() {
        /**
         * @param batchId The unique ID of this mutation batch.
         * @param localWriteTime The original write time of this mutation.
         * @param baseMutations Mutations that are used to populate the base
         * values when this mutation is applied locally. This can be used to locally
         * overwrite values that are persisted in the remote document cache. Base
         * mutations are never sent to the backend.
         * @param mutations The user-provided mutations in this mutation batch.
         * User-provided mutations are applied both locally and remotely on the
         * backend.
         */
        function t(t, e, n, r) {
            this.batchId = t, this.Tn = e, this.baseMutations = n, this.mutations = r
            /**
         * Applies all the mutations in this MutationBatch to the specified document
         * to create a new remote document
         *
         * @param docKey The key of the document to apply mutations to.
         * @param maybeDoc The document to apply mutations to.
         * @param batchResult The result of applying the MutationBatch to the
         * backend.
         */;
        }
        return t.prototype.at = function(t, e, n) {
            for (var r = n.En, i = 0; i < this.mutations.length; i++) {
                var o = this.mutations[i];
                if (o.key.isEqual(t)) {
                    var s = r[i];
                    e = o.at(e, s);
                }
            }
            return e;
        }, 
        /**
         * Computes the local view of a document given all the mutations in this
         * batch.
         *
         * @param docKey The key of the document to apply mutations to.
         * @param maybeDoc The document to apply mutations to.
         */
        t.prototype.ot = function(t, e) {
            // First, apply the base state. This allows us to apply non-idempotent
            // transform against a consistent set of values.
            for (var n = 0, r = this.baseMutations; n < r.length; n++) {
                var i = r[n];
                i.key.isEqual(t) && (e = i.ot(e, e, this.Tn));
            }
            // Second, apply all user-provided mutations.
            for (var o = e, s = 0, u = this.mutations; s < u.length; s++) {
                var a = u[s];
                a.key.isEqual(t) && (e = a.ot(e, o, this.Tn));
            }
            return e;
        }, 
        /**
         * Computes the local view for all provided documents given the mutations in
         * this batch.
         */
        t.prototype.In = function(t) {
            var e = this, n = t;
            // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
            // directly (as done in `applyToLocalView()`), we can reduce the complexity
            // to O(n).
                    return this.mutations.forEach((function(r) {
                var i = e.ot(r.key, t.get(r.key));
                i && (n = n.Ae(r.key, i));
            })), n;
        }, t.prototype.keys = function() {
            return this.mutations.reduce((function(t, e) {
                return t.add(e.key);
            }), Gt());
        }, t.prototype.isEqual = function(t) {
            return this.batchId === t.batchId && Ee(this.mutations, t.mutations, (function(t, e) {
                return t.isEqual(e);
            })) && Ee(this.baseMutations, t.baseMutations, (function(t, e) {
                return t.isEqual(e);
            }));
        }, t;
    }(), Ae = /** @class */ function() {
        function t(t, e, n, 
        /**
         * A pre-computed mapping from each mutated document to the resulting
         * version.
         */
        r) {
            this.batch = t, this.wn = e, this.En = n, this.Rn = r
            /**
         * Creates a new MutationBatchResult for the given batch and results. There
         * must be one result for each mutation in the batch. This static factory
         * caches a document=>version mapping (docVersions).
         */;
        }
        return t.from = function(e, n, r) {
            ve(e.mutations.length === r.length);
            for (var i = Bt, o = e.mutations, s = 0; s < o.length; s++) i = i.Ae(o[s].key, r[s].version);
            return new t(e, n, r, i);
        }, t;
    }(), xe = /** @class */ function() {
        function t(t) {
            var e = this;
            // NOTE: next/catchCallback will always point to our own wrapper functions,
            // not the user's raw next() or catch() callbacks.
                    this.An = null, this.mn = null, 
            // When the operation resolves, we'll set result or error and mark isDone.
            this.result = void 0, this.error = void 0, this.Pn = !1, 
            // Set to true when .then() or .catch() are called and prevents additional
            // chaining.
            this.Vn = !1, t((function(t) {
                e.Pn = !0, e.result = t, e.An && 
                // value should be defined unless T is Void, but we can't express
                // that in the type system.
                e.An(t);
            }), (function(t) {
                e.Pn = !0, e.error = t, e.mn && e.mn(t);
            }));
        }
        return t.prototype.catch = function(t) {
            return this.next(void 0, t);
        }, t.prototype.next = function(e, n) {
            var r = this;
            return this.Vn && ye(), this.Vn = !0, this.Pn ? this.error ? this.gn(n, this.error) : this.pn(e, this.result) : new t((function(t, i) {
                r.An = function(n) {
                    r.pn(e, n).next(t, i);
                }, r.mn = function(e) {
                    r.gn(n, e).next(t, i);
                };
            }));
        }, t.prototype.yn = function() {
            var t = this;
            return new Promise((function(e, n) {
                t.next(e, n);
            }));
        }, t.prototype.bn = function(e) {
            try {
                var n = e();
                return n instanceof t ? n : t.resolve(n);
            } catch (e) {
                return t.reject(e);
            }
        }, t.prototype.pn = function(e, n) {
            return e ? this.bn((function() {
                return e(n);
            })) : t.resolve(n);
        }, t.prototype.gn = function(e, n) {
            return e ? this.bn((function() {
                return e(n);
            })) : t.reject(n);
        }, t.resolve = function(e) {
            return new t((function(t, n) {
                t(e);
            }));
        }, t.reject = function(e) {
            return new t((function(t, n) {
                n(e);
            }));
        }, t.vn = function(
        // Accept all Promise types in waitFor().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e) {
            return new t((function(t, n) {
                var r = 0, i = 0, o = !1;
                e.forEach((function(e) {
                    ++r, e.next((function() {
                        ++i, o && i === r && t();
                    }), (function(t) {
                        return n(t);
                    }));
                })), o = !0, i === r && t();
            }));
        }, 
        /**
         * Given an array of predicate functions that asynchronously evaluate to a
         * boolean, implements a short-circuiting `or` between the results. Predicates
         * will be evaluated until one of them returns `true`, then stop. The final
         * result will be whether any of them returned `true`.
         */
        t.Sn = function(e) {
            for (var n = t.resolve(!1), r = function(e) {
                n = n.next((function(n) {
                    return n ? t.resolve(n) : e();
                }));
            }, i = 0, o = e; i < o.length; i++) {
                r(o[i]);
            }
            return n;
        }, t.forEach = function(t, e) {
            var n = this, r = [];
            return t.forEach((function(t, i) {
                r.push(e.call(n, t, i));
            })), this.vn(r);
        }, t;
    }(), De = /** @class */ function() {
        function t() {
            // A mapping of document key to the new cache entry that should be written (or null if any
            // existing cache entry should be removed).
            this.Dn = new Ie((function(t) {
                return t.toString();
            })), this.Cn = !1;
        }
        return Object.defineProperty(t.prototype, "readTime", {
            get: function() {
                return this.Fn;
            },
            set: function(t) {
                this.Fn = t;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /**
         * Buffers a `RemoteDocumentCache.addEntry()` call.
         *
         * You can only modify documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */
        t.prototype.Nn = function(t, e) {
            this.kn(), this.readTime = e, this.Dn.set(t.key, t);
        }, 
        /**
         * Buffers a `RemoteDocumentCache.removeEntry()` call.
         *
         * You can only remove documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */
        t.prototype.Mn = function(t, e) {
            this.kn(), e && (this.readTime = e), this.Dn.set(t, null);
        }, 
        /**
         * Looks up an entry in the cache. The buffered changes will first be checked,
         * and if no buffered change applies, this will forward to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction The transaction in which to perform any persistence
         *     operations.
         * @param documentKey The key of the entry to look up.
         * @return The cached Document or NoDocument entry, or null if we have nothing
         * cached.
         */
        t.prototype.xn = function(t, e) {
            this.kn();
            var n = this.Dn.get(e);
            return void 0 !== n ? xe.resolve(n) : this.$n(t, e);
        }, 
        /**
         * Looks up several entries in the cache, forwarding to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction The transaction in which to perform any persistence
         *     operations.
         * @param documentKeys The keys of the entries to look up.
         * @return A map of cached `Document`s or `NoDocument`s, indexed by key. If an
         *     entry cannot be found, the corresponding key will be mapped to a null
         *     value.
         */
        t.prototype.getEntries = function(t, e) {
            return this.On(t, e);
        }, 
        /**
         * Applies buffered changes to the underlying RemoteDocumentCache, using
         * the provided transaction.
         */
        t.prototype.apply = function(t) {
            return this.kn(), this.Cn = !0, this.Ln(t);
        }, 
        /** Helper to assert this.changes is not null  */ t.prototype.kn = function() {}, 
        t;
    }(), Se = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.", Re = /** @class */ function() {
        function t() {
            this.Bn = [];
        }
        return t.prototype.qn = function(t) {
            this.Bn.push(t);
        }, t.prototype.Un = function() {
            this.Bn.forEach((function(t) {
                return t();
            }));
        }, t;
    }(), ke = /** @class */ function() {
        function t(t, e, n) {
            this.Qn = t, this.Wn = e, this.jn = n
            /**
         * Get the local view of the document identified by `key`.
         *
         * @return Local view of the document or null if we don't have any cached
         * state for it.
         */;
        }
        return t.prototype.Kn = function(t, e) {
            var n = this;
            return this.Wn.Gn(t, e).next((function(r) {
                return n.zn(t, e, r);
            }));
        }, 
        /** Internal version of `getDocument` that allows reusing batches. */ t.prototype.zn = function(t, e, n) {
            return this.Qn.xn(t, e).next((function(t) {
                for (var r = 0, i = n; r < i.length; r++) {
                    t = i[r].ot(e, t);
                }
                return t;
            }));
        }, 
        // Returns the view of the given `docs` as they would appear after applying
        // all mutations in the given `batches`.
        t.prototype.Hn = function(t, e, n) {
            var r = jt();
            return e.forEach((function(t, e) {
                for (var i = 0, o = n; i < o.length; i++) {
                    e = o[i].ot(t, e);
                }
                r = r.Ae(t, e);
            })), r;
        }, 
        /**
         * Gets the local view of the documents identified by `keys`.
         *
         * If we don't have cached state for a document in `keys`, a NoDocument will
         * be stored for that key in the resulting set.
         */
        t.prototype.Yn = function(t, e) {
            var n = this;
            return this.Qn.getEntries(t, e).next((function(e) {
                return n.Jn(t, e);
            }));
        }, 
        /**
         * Similar to `getDocuments`, but creates the local view from the given
         * `baseDocs` without retrieving documents from the local store.
         */
        t.prototype.Jn = function(t, e) {
            var n = this;
            return this.Wn.Xn(t, e).next((function(r) {
                var i = n.Hn(t, e, r), o = qt();
                return i.forEach((function(t, e) {
                    // TODO(http://b/32275378): Don't conflate missing / deleted.
                    e || (e = new vt(t, g.min())), o = o.Ae(t, e);
                })), o;
            }));
        }, 
        /**
         * Performs a query against the local view of all documents.
         *
         * @param transaction The persistence transaction.
         * @param query The query to match documents against.
         * @param sinceReadTime If not set to SnapshotVersion.min(), return only
         *     documents that have been read since this snapshot version (exclusive).
         */
        t.prototype.Zn = function(t, e, n) {
            return e.Ot() ? this.tr(t, e.path) : e._e() ? this.er(t, e, n) : this.sr(t, e, n);
        }, t.prototype.tr = function(t, e) {
            // Just do a simple document lookup.
            return this.Kn(t, new b(e)).next((function(t) {
                var e = Ft();
                return t instanceof yt && (e = e.Ae(t.key, t)), e;
            }));
        }, t.prototype.er = function(t, e, n) {
            var r = this, i = e.collectionGroup, o = Ft();
            return this.jn.ir(t, i).next((function(s) {
                return xe.forEach(s, (function(s) {
                    var u = e.Zt(s.child(i));
                    return r.sr(t, u, n).next((function(t) {
                        t.forEach((function(t, e) {
                            o = o.Ae(t, e);
                        }));
                    }));
                })).next((function() {
                    return o;
                }));
            }));
        }, t.prototype.sr = function(t, e, n) {
            var r, i, o = this;
            // Query the remote documents and overlay mutations.
                    return this.Qn.Zn(t, e, n).next((function(n) {
                return r = n, o.Wn.nr(t, e);
            })).next((function(e) {
                return i = e, o.rr(t, i, r).next((function(t) {
                    r = t;
                    for (var e = 0, n = i; e < n.length; e++) for (var o = n[e], s = 0, u = o.mutations; s < u.length; s++) {
                        var a = u[s], c = a.key, h = r.get(c), f = a.ot(h, h, o.Tn);
                        r = f instanceof yt ? r.Ae(c, f) : r.remove(c);
                    }
                }));
            })).next((function() {
                // Finally, filter out any documents that don't actually match
                // the query.
                return r.forEach((function(t, n) {
                    e.matches(n) || (r = r.remove(t));
                })), r;
            }));
        }, t.prototype.rr = function(t, e, n) {
            for (var r = Gt(), i = 0, o = e; i < o.length; i++) for (var s = 0, u = o[i].mutations; s < u.length; s++) {
                var a = u[s];
                a instanceof ot && null === n.get(a.key) && (r = r.add(a.key));
            }
            var c = n;
            return this.Qn.getEntries(t, r).next((function(t) {
                return t.forEach((function(t, e) {
                    null !== e && e instanceof yt && (c = c.Ae(t, e));
                })), c;
            }));
        }, t;
    }(), Pe = /** @class */ function() {
        function t(t, e, n, r) {
            this.targetId = t, this.fromCache = e, this.hr = n, this.or = r;
        }
        return t.ar = function(e, n) {
            for (var r = Gt(), i = Gt(), o = 0, s = n.docChanges; o < s.length; o++) {
                var u = s[o];
                switch (u.type) {
                  case 0 /* Added */ :
                    r = r.add(u.doc.key);
                    break;

                  case 1 /* Removed */ :
                    i = i.add(u.doc.key);
                    // do nothing
                            }
            }
            return new t(e, n.fromCache, r, i);
        }, t;
    }(), Ve = /** @class */ function() {
        function t(t, e) {
            var n = this;
            this.previousValue = t, e && (e.ur = function(t) {
                return n.cr(t);
            }, this._r = function(t) {
                return e.lr(t);
            });
        }
        return t.prototype.cr = function(t) {
            return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
        }, t.prototype.next = function() {
            var t = ++this.previousValue;
            return this._r && this._r(t), t;
        }, t;
    }();

    /** The default database name for a project. */
    /** Represents the database ID a Firestore client is associated with. */ Ve.dr = -1;

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var Le = function() {
        var t = this;
        this.promise = new Promise((function(e, n) {
            t.resolve = e, t.reject = n;
        }));
    }, Oe = /** @class */ function() {
        function t(
        /**
         * The AsyncQueue to run backoff operations on.
         */
        t, 
        /**
         * The ID to use when scheduling backoff operations on the AsyncQueue.
         */
        e, 
        /**
         * The initial delay (used as the base delay on the first retry attempt).
         * Note that jitter will still be applied, so the actual delay could be as
         * little as 0.5*initialDelayMs.
         */
        n
        /**
         * The multiplier to use to determine the extended base delay after each
         * attempt.
         */ , r
        /**
         * The maximum base delay after which no further backoff is performed.
         * Note that jitter will still be applied, so the actual delay could be as
         * much as 1.5*maxDelayMs.
         */ , i) {
            void 0 === n && (n = 1e3), void 0 === r && (r = 1.5), void 0 === i && (i = 6e4), 
            this.Tr = t, this.Er = e, this.Ir = n, this.wr = r, this.Rr = i, this.Ar = 0, this.mr = null, 
            /** The last backoff attempt, as epoch milliseconds. */
            this.Pr = Date.now(), this.reset();
        }
        /**
         * Resets the backoff delay.
         *
         * The very next backoffAndWait() will have no delay. If it is called again
         * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
         * subsequent ones will increase according to the backoffFactor.
         */    return t.prototype.reset = function() {
            this.Ar = 0;
        }, 
        /**
         * Resets the backoff delay to the maximum delay (e.g. for use after a
         * RESOURCE_EXHAUSTED error).
         */
        t.prototype.Vr = function() {
            this.Ar = this.Rr;
        }, 
        /**
         * Returns a promise that resolves after currentDelayMs, and increases the
         * delay for any subsequent attempts. If there was a pending backoff operation
         * already, it will be canceled.
         */
        t.prototype.gr = function(t) {
            var e = this;
            // Cancel any pending backoff operation.
                    this.cancel();
            // First schedule using the current base (which may be 0 and should be
            // honored as such).
            var n = Math.floor(this.Ar + this.pr()), r = Math.max(0, Date.now() - this.Pr), i = Math.max(0, n - r);
            // Guard against lastAttemptTime being in the future due to a clock change.
                    i > 0 && le("ExponentialBackoff", "Backing off for " + i + " ms (base delay: " + this.Ar + " ms, delay with jitter: " + n + " ms, last attempt: " + r + " ms ago)"), 
            this.mr = this.Tr.yr(this.Er, i, (function() {
                return e.Pr = Date.now(), t();
            })), 
            // Apply backoff factor to determine next delay and ensure it is within
            // bounds.
            this.Ar *= this.wr, this.Ar < this.Ir && (this.Ar = this.Ir), this.Ar > this.Rr && (this.Ar = this.Rr);
        }, t.prototype.br = function() {
            null !== this.mr && (this.mr.vr(), this.mr = null);
        }, t.prototype.cancel = function() {
            null !== this.mr && (this.mr.cancel(), this.mr = null);
        }, 
        /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */ t.prototype.pr = function() {
            return (Math.random() - .5) * this.Ar;
        }, t;
    }();

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A helper for running delayed tasks following an exponential backoff curve
     * between attempts.
     *
     * Each delay is made up of a "base" delay which follows the exponential
     * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
     * base delay. This prevents clients from accidentally synchronizing their
     * delays causing spikes of load to the backend.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Encodes a resource path into a IndexedDb-compatible string form.
     */
    function Ue(t) {
        for (var e = "", n = 0; n < t.length; n++) e.length > 0 && (e = qe(e)), e = Ce(t.get(n), e);
        return qe(e);
    }

    /** Encodes a single segment of a resource path into the given result */ function Ce(t, e) {
        for (var n = e, r = t.length, i = 0; i < r; i++) {
            var o = t.charAt(i);
            switch (o) {
              case "\0":
                n += "";
                break;

              case "":
                n += "";
                break;

              default:
                n += o;
            }
        }
        return n;
    }

    /** Encodes a path separator into the given result */ function qe(t) {
        return t + "";
    }

    /**
     * Decodes the given IndexedDb-compatible string form of a resource path into
     * a ResourcePath instance. Note that this method is not suitable for use with
     * decoding resource names from the server; those are One Platform format
     * strings.
     */ function je(t) {
        // Event the empty path must encode as a path of at least length 2. A path
        // with exactly 2 must be the empty path.
        var e = t.length;
        if (ve(e >= 2), 2 === e) return ve("" === t.charAt(0) && "" === t.charAt(1)), 
        w.G;
        // Escape characters cannot exist past the second-to-last position in the
        // source value.
            for (var n = e - 2, r = [], i = "", o = 0; o < e; ) {
            // The last two characters of a valid encoded path must be a separator, so
            // there must be an end to this segment.
            var s = t.indexOf("", o);
            switch ((s < 0 || s > n) && ye(), t.charAt(s + 1)) {
              case "":
                var u = t.substring(o, s), a = void 0;
                0 === i.length ? 
                // Avoid copying for the common case of a segment that excludes \0
                // and \001
                a = u : (a = i += u, i = ""), r.push(a);
                break;

              case "":
                i += t.substring(o, s), i += "\0";
                break;

              case "":
                // The escape character can be used in the output to encode itself.
                i += t.substring(o, s + 1);
                break;

              default:
                ye();
            }
            o = s + 2;
        }
        return new w(r);
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory implementation of IndexManager.
     */ var Me = /** @class */ function() {
        function t() {
            this.Sr = new Fe;
        }
        return t.prototype.Dr = function(t, e) {
            return this.Sr.add(e), xe.resolve();
        }, t.prototype.ir = function(t, e) {
            return xe.resolve(this.Sr.getEntries(e));
        }, t;
    }(), Fe = /** @class */ function() {
        function t() {
            this.index = {};
        }
        // Returns false if the entry already existed.
            return t.prototype.add = function(t) {
            var e = t.L(), n = t.$(), r = this.index[e] || new Ot(w.N), i = !r.has(n);
            return this.index[e] = r.add(n), i;
        }, t.prototype.has = function(t) {
            var e = t.L(), n = t.$(), r = this.index[e];
            return r && r.has(n);
        }, t.prototype.getEntries = function(t) {
            return (this.index[t] || new Ot(w.N)).W();
        }, t;
    }(), Be = /** @class */ function() {
        function t() {
            /**
             * An in-memory copy of the index entries we've already written since the SDK
             * launched. Used to avoid re-writing the same entry repeatedly.
             *
             * This is *NOT* a complete cache of what's in persistence and so can never be used to
             * satisfy reads.
             */
            this.Cr = new Fe;
        }
        /**
         * Adds a new entry to the collection parent index.
         *
         * Repeated calls for the same collectionPath should be avoided within a
         * transaction as IndexedDbIndexManager only caches writes once a transaction
         * has been committed.
         */    return t.prototype.Dr = function(t, e) {
            var n = this;
            if (!this.Cr.has(e)) {
                var r = e.L(), i = e.$();
                t.qn((function() {
                    // Add the collection to the in memory cache only if the transaction was
                    // successfully committed.
                    n.Cr.add(e);
                }));
                var o = {
                    collectionId: r,
                    parent: Ue(i)
                };
                return ze(t).put(o);
            }
            return xe.resolve();
        }, t.prototype.ir = function(t, e) {
            var n = [], r = IDBKeyRange.bound([ e, "" ], [ _e(e), "" ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            return ze(t).Fr(r).next((function(t) {
                for (var r = 0, i = t; r < i.length; r++) {
                    var o = i[r];
                    // This collectionId guard shouldn't be necessary (and isn't as long
                    // as we're running in a real browser), but there's a bug in
                    // indexeddbshim that breaks our range in our tests running in node:
                    // https://github.com/axemclion/IndexedDBShim/issues/334
                                    if (o.collectionId !== e) break;
                    n.push(je(o.parent));
                }
                return n;
            }));
        }, t;
    }();

    /**
     * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
     * Also used for in-memory caching by IndexedDbIndexManager and initial index population
     * in indexeddb_schema.ts
     */
    /**
     * Helper to get a typed SimpleDbStore for the collectionParents
     * document store.
     */
    function ze(t) {
        return rn.Nr(t, Sn.store);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ var Ge = /** @class */ function() {
        /**
         * @param {LocalSerializer} serializer The document serializer.
         * @param {IndexManager} indexManager The query indexes that need to be maintained.
         */
        function t(t, e) {
            this.serializer = t, this.jn = e
            /**
         * Adds the supplied entries to the cache.
         *
         * All calls of `addEntry` are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
         */;
        }
        return t.prototype.Nn = function(t, e, n) {
            return Qe(t).put(Ke(e), n);
        }, 
        /**
         * Removes a document from the cache.
         *
         * All calls of `removeEntry`  are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()` to ensure proper accounting of metadata.
         */
        t.prototype.Mn = function(t, e) {
            var n = Qe(t), r = Ke(e);
            return n.delete(r);
        }, 
        /**
         * Updates the current cache size.
         *
         * Callers to `addEntry()` and `removeEntry()` *must* call this afterwards to update the
         * cache's metadata.
         */
        t.prototype.updateMetadata = function(t, e) {
            var n = this;
            return this.getMetadata(t).next((function(r) {
                return r.byteSize += e, n.kr(t, r);
            }));
        }, t.prototype.xn = function(t, e) {
            var n = this;
            return Qe(t).get(Ke(e)).next((function(t) {
                return n.Mr(t);
            }));
        }, 
        /**
         * Looks up an entry in the cache.
         *
         * @param documentKey The key of the entry to look up.
         * @return The cached MaybeDocument entry and its size, or null if we have nothing cached.
         */
        t.prototype.xr = function(t, e) {
            var n = this;
            return Qe(t).get(Ke(e)).next((function(t) {
                var e = n.Mr(t);
                return e ? {
                    $r: e,
                    size: Ye(t)
                } : null;
            }));
        }, t.prototype.getEntries = function(t, e) {
            var n = this, r = jt();
            return this.Or(t, e, (function(t, e) {
                var i = n.Mr(e);
                r = r.Ae(t, i);
            })).next((function() {
                return r;
            }));
        }, 
        /**
         * Looks up several entries in the cache.
         *
         * @param documentKeys The set of keys entries to look up.
         * @return A map of MaybeDocuments indexed by key (if a document cannot be
         *     found, the key will be mapped to null) and a map of sizes indexed by
         *     key (zero if the key cannot be found).
         */
        t.prototype.Lr = function(t, e) {
            var n = this, r = jt(), i = new Pt(b.N);
            return this.Or(t, e, (function(t, e) {
                var o = n.Mr(e);
                o ? (r = r.Ae(t, o), i = i.Ae(t, Ye(e))) : (r = r.Ae(t, null), i = i.Ae(t, 0));
            })).next((function() {
                return {
                    Br: r,
                    qr: i
                };
            }));
        }, t.prototype.Or = function(t, e, n) {
            if (e.B()) return xe.resolve();
            var r = IDBKeyRange.bound(e.first().path.W(), e.last().path.W()), i = e.be(), o = i.Ne();
            return Qe(t).Ur({
                range: r
            }, (function(t, e, r) {
                // Go through keys not found in cache.
                for (var s = b.st(t); o && b.N(o, s) < 0; ) n(o, null), o = i.Ne();
                o && o.isEqual(s) && (
                // Key found in cache.
                n(o, e), o = i.ke() ? i.Ne() : null), 
                // Skip to the next key (if there is one).
                o ? r.Qr(o.path.W()) : r.done();
            })).next((function() {
                // The rest of the keys are not in the cache. One case where `iterate`
                // above won't go through them is when the cache is empty.
                for (;o; ) n(o, null), o = i.ke() ? i.Ne() : null;
            }));
        }, t.prototype.Zn = function(t, e, n) {
            var r = this, i = Ft(), o = e.path.length + 1, s = {};
            if (n.isEqual(g.min())) {
                // Documents are ordered by key, so we can use a prefix scan to narrow
                // down the documents we need to match the query against.
                var u = e.path.W();
                s.range = IDBKeyRange.lowerBound(u);
            } else {
                // Execute an index-free query and filter by read time. This is safe
                // since all document changes to queries that have a
                // lastLimboFreeSnapshotVersion (`sinceReadTime`) have a read time set.
                var a = e.path.W(), c = this.serializer.Wr(n);
                s.range = IDBKeyRange.lowerBound([ a, c ], 
                /* open= */ !0), s.index = In.collectionReadTimeIndex;
            }
            return Qe(t).Ur(s, (function(t, n, s) {
                // The query is actually returning any path that starts with the query
                // path prefix which may include documents in subcollections. For
                // example, a query on 'rooms' will return rooms/abc/messages/xyx but we
                // shouldn't match it. Fix this by discarding rows with document keys
                // more than one segment longer than the query path.
                if (t.length === o) {
                    var u = r.serializer.jr(n);
                    e.path.q(u.key.path) ? u instanceof yt && e.matches(u) && (i = i.Ae(u.key, u)) : s.done();
                }
            })).next((function() {
                return i;
            }));
        }, 
        /**
         * Returns the set of documents that have changed since the specified read
         * time.
         */
        // PORTING NOTE: This is only used for multi-tab synchronization.
        t.prototype.Kr = function(t, e) {
            var n = this, r = qt(), i = this.serializer.Wr(e), o = Qe(t), s = IDBKeyRange.lowerBound(i, !0);
            return o.Ur({
                index: In.readTimeIndex,
                range: s
            }, (function(t, e) {
                // Unlike `getEntry()` and others, `getNewDocumentChanges()` parses
                // the documents directly since we want to keep sentinel deletes.
                var o = n.serializer.jr(e);
                r = r.Ae(o.key, o), i = e.readTime;
            })).next((function() {
                return {
                    Gr: r,
                    readTime: n.serializer.zr(i)
                };
            }));
        }, 
        /**
         * Returns the read time of the most recently read document in the cache, or
         * SnapshotVersion.min() if not available.
         */
        // PORTING NOTE: This is only used for multi-tab synchronization.
        t.prototype.Hr = function(t) {
            var e = this, n = Qe(t), r = g.min();
            return n.Ur({
                index: In.readTimeIndex,
                reverse: !0
            }, (function(t, n, i) {
                n.readTime && (r = e.serializer.zr(n.readTime)), i.done();
            })).next((function() {
                return r;
            }));
        }, t.prototype.Yr = function(e) {
            return new t.Jr(this, !!e && e.Xr);
        }, t.prototype.Zr = function(t) {
            return this.getMetadata(t).next((function(t) {
                return t.byteSize;
            }));
        }, t.prototype.getMetadata = function(t) {
            return We(t).get(Nn.key).next((function(t) {
                return ve(!!t), t;
            }));
        }, t.prototype.kr = function(t, e) {
            return We(t).put(Nn.key, e);
        }, 
        /**
         * Decodes `remoteDoc` and returns the document (or null, if the document
         * corresponds to the format used for sentinel deletes).
         */
        t.prototype.Mr = function(t) {
            if (t) {
                var e = this.serializer.jr(t);
                return e instanceof vt && e.version.isEqual(g.min()) ? null : e;
            }
            return null;
        }, t;
    }();

    /**
     * Handles the details of adding and updating documents in the IndexedDbRemoteDocumentCache.
     *
     * Unlike the MemoryRemoteDocumentChangeBuffer, the IndexedDb implementation computes the size
     * delta for all submitted changes. This avoids having to re-read all documents from IndexedDb
     * when we apply the changes.
     */ function We(t) {
        return rn.Nr(t, Nn.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the remoteDocuments object store.
     */ function Qe(t) {
        return rn.Nr(t, In.store);
    }

    function Ke(t) {
        return t.path.W();
    }

    /**
     * Retrusn an approximate size for the given document.
     */ function Ye(t) {
        var e;
        if (t.document) e = t.document; else if (t.unknownDocument) e = t.unknownDocument; else {
            if (!t.noDocument) throw ye();
            e = t.noDocument;
        }
        return JSON.stringify(e).length;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Offset to ensure non-overlapping target ids. */ Ge.Jr = /** @class */ function(t) {
        /**
         * @param documentCache The IndexedDbRemoteDocumentCache to apply the changes to.
         * @param trackRemovals Whether to create sentinel deletes that can be tracked by
         * `getNewDocumentChanges()`.
         */
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).th = e, r.Xr = n, 
            // A map of document sizes prior to applying the changes in this buffer.
            r.eh = new Ie((function(t) {
                return t.toString();
            })), r;
        }
        return e.__extends(n, t), n.prototype.Ln = function(t) {
            var e = this, n = [], r = 0, i = new Ot((function(t, e) {
                return we(t.j(), e.j());
            }));
            return this.Dn.forEach((function(o, s) {
                var u = e.eh.get(o);
                if (s) {
                    var a = e.th.serializer.sh(s, e.readTime);
                    i = i.add(o.path.$());
                    var c = Ye(a);
                    r += c - u, n.push(e.th.Nn(t, o, a));
                } else if (r -= u, e.Xr) {
                    // In order to track removals, we store a "sentinel delete" in the
                    // RemoteDocumentCache. This entry is represented by a NoDocument
                    // with a version of 0 and ignored by `maybeDecodeDocument()` but
                    // preserved in `getNewDocumentChanges()`.
                    var h = e.th.serializer.sh(new vt(o, g.min()), e.readTime);
                    n.push(e.th.Nn(t, o, h));
                } else n.push(e.th.Mn(t, o));
            })), i.forEach((function(r) {
                n.push(e.th.jn.Dr(t, r));
            })), n.push(this.th.updateMetadata(t, r)), xe.vn(n);
        }, n.prototype.$n = function(t, e) {
            var n = this;
            // Record the size of everything we load from the cache so we can compute a delta later.
                    return this.th.xr(t, e).next((function(t) {
                return null === t ? (n.eh.set(e, 0), null) : (n.eh.set(e, t.size), t.$r);
            }));
        }, n.prototype.On = function(t, e) {
            var n = this;
            // Record the size of everything we load from the cache so we can compute
            // a delta later.
                    return this.th.Lr(t, e).next((function(t) {
                var e = t.Br;
                // Note: `getAllFromCache` returns two maps instead of a single map from
                // keys to `DocumentSizeEntry`s. This is to allow returning the
                // `NullableMaybeDocumentMap` directly, without a conversion.
                return t.qr.forEach((function(t, e) {
                    n.eh.set(t, e);
                })), e;
            }));
        }, n;
    }(De);

    /**
     * Generates monotonically increasing target IDs for sending targets to the
     * watch stream.
     *
     * The client constructs two generators, one for the target cache, and one for
     * for the sync engine (to generate limbo documents targets). These
     * generators produce non-overlapping IDs (by using even and odd IDs
     * respectively).
     *
     * By separating the target ID space, the query cache can generate target IDs
     * that persist across client restarts, while sync engine can independently
     * generate in-memory target IDs that are transient and can be reused after a
     * restart.
     */
    var Je = /** @class */ function() {
        function t(t) {
            this.ih = t;
        }
        return t.prototype.next = function() {
            return this.ih += 2, this.ih;
        }, t.nh = function() {
            // The target cache generator must return '2' in its first call to `next()`
            // as there is no differentiation in the protocol layer between an unset
            // number and the number '0'. If we were to sent a target with target ID
            // '0', the backend would consider it unset and replace it with its own ID.
            return new t(0);
        }, t.rh = function() {
            // Sync engine assigns target IDs for limbo document detection.
            return new t(-1);
        }, t;
    }(), Xe = /** @class */ function() {
        function t(t, e) {
            this.hh = t, this.serializer = e;
        }
        // PORTING NOTE: We don't cache global metadata for the target cache, since
        // some of it (in particular `highestTargetId`) can be modified by secondary
        // tabs. We could perhaps be more granular (and e.g. still cache
        // `lastRemoteSnapshotVersion` in memory) but for simplicity we currently go
        // to IndexedDb whenever we need to read metadata. We can revisit if it turns
        // out to have a meaningful performance impact.
            return t.prototype.oh = function(t) {
            var e = this;
            return this.ah(t).next((function(n) {
                var r = new Je(n.highestTargetId);
                return n.highestTargetId = r.next(), e.uh(t, n).next((function() {
                    return n.highestTargetId;
                }));
            }));
        }, t.prototype._h = function(t) {
            return this.ah(t).next((function(t) {
                return g.v(new v(t.lastRemoteSnapshotVersion.seconds, t.lastRemoteSnapshotVersion.nanoseconds));
            }));
        }, t.prototype.lh = function(t) {
            return this.ah(t).next((function(t) {
                return t.highestListenSequenceNumber;
            }));
        }, t.prototype.dh = function(t, e, n) {
            var r = this;
            return this.ah(t).next((function(i) {
                return i.highestListenSequenceNumber = e, n && (i.lastRemoteSnapshotVersion = n.C()), 
                e > i.highestListenSequenceNumber && (i.highestListenSequenceNumber = e), r.uh(t, i);
            }));
        }, t.prototype.fh = function(t, e) {
            var n = this;
            return this.Th(t, e).next((function() {
                return n.ah(t).next((function(r) {
                    return r.targetCount += 1, n.Eh(e, r), n.uh(t, r);
                }));
            }));
        }, t.prototype.Ih = function(t, e) {
            return this.Th(t, e);
        }, t.prototype.wh = function(t, e) {
            var n = this;
            return this.Rh(t, e.targetId).next((function() {
                return He(t).delete(e.targetId);
            })).next((function() {
                return n.ah(t);
            })).next((function(e) {
                return ve(e.targetCount > 0), e.targetCount -= 1, n.uh(t, e);
            }));
        }, 
        /**
         * Drops any targets with sequence number less than or equal to the upper bound, excepting those
         * present in `activeTargetIds`. Document associations for the removed targets are also removed.
         * Returns the number of targets removed.
         */
        t.prototype.Ah = function(t, e, n) {
            var r = this, i = 0, o = [];
            return He(t).Ur((function(s, u) {
                var a = r.serializer.mh(u);
                a.sequenceNumber <= e && null === n.get(a.targetId) && (i++, o.push(r.wh(t, a)));
            })).next((function() {
                return xe.vn(o);
            })).next((function() {
                return i;
            }));
        }, 
        /**
         * Call provided function with each `TargetData` that we have cached.
         */
        t.prototype.js = function(t, e) {
            var n = this;
            return He(t).Ur((function(t, r) {
                var i = n.serializer.mh(r);
                e(i);
            }));
        }, t.prototype.ah = function(t) {
            return $e(t).get(Dn.key).next((function(t) {
                return ve(null !== t), t;
            }));
        }, t.prototype.uh = function(t, e) {
            return $e(t).put(Dn.key, e);
        }, t.prototype.Th = function(t, e) {
            return He(t).put(this.serializer.Ph(e));
        }, 
        /**
         * In-place updates the provided metadata to account for values in the given
         * TargetData. Saving is done separately. Returns true if there were any
         * changes to the metadata.
         */
        t.prototype.Eh = function(t, e) {
            var n = !1;
            return t.targetId > e.highestTargetId && (e.highestTargetId = t.targetId, n = !0), 
            t.sequenceNumber > e.highestListenSequenceNumber && (e.highestListenSequenceNumber = t.sequenceNumber, 
            n = !0), n;
        }, t.prototype.Vh = function(t) {
            return this.ah(t).next((function(t) {
                return t.targetCount;
            }));
        }, t.prototype.gh = function(t, e) {
            var n = this, r = e.canonicalId(), i = IDBKeyRange.bound([ r, Number.NEGATIVE_INFINITY ], [ r, Number.POSITIVE_INFINITY ]), o = null;
            // Iterating by the canonicalId may yield more than one result because
            // canonicalId values are not required to be unique per target. This query
            // depends on the queryTargets index to be efficient.
                    return He(t).Ur({
                range: i,
                index: An.queryTargetsIndexName
            }, (function(t, r, i) {
                var s = n.serializer.mh(r);
                // After finding a potential match, check that the target is
                // actually equal to the requested target.
                            e.isEqual(s.target) && (o = s, i.done());
            })).next((function() {
                return o;
            }));
        }, t.prototype.ph = function(t, e, n) {
            var r = this, i = [], o = Ze(t);
            // PORTING NOTE: The reverse index (documentsTargets) is maintained by
            // IndexedDb.
                    return e.forEach((function(e) {
                var s = Ue(e.path);
                i.push(o.put(new xn(n, s))), i.push(r.hh.yh(t, n, e));
            })), xe.vn(i);
        }, t.prototype.bh = function(t, e, n) {
            var r = this, i = Ze(t);
            // PORTING NOTE: The reverse index (documentsTargets) is maintained by
            // IndexedDb.
                    return xe.forEach(e, (function(e) {
                var o = Ue(e.path);
                return xe.vn([ i.delete([ n, o ]), r.hh.vh(t, n, e) ]);
            }));
        }, t.prototype.Rh = function(t, e) {
            var n = Ze(t), r = IDBKeyRange.bound([ e ], [ e + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0);
            return n.delete(r);
        }, t.prototype.Sh = function(t, e) {
            var n = IDBKeyRange.bound([ e ], [ e + 1 ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0), r = Ze(t), i = Gt();
            return r.Ur({
                range: n,
                Dh: !0
            }, (function(t, e, n) {
                var r = je(t[1]), o = new b(r);
                i = i.add(o);
            })).next((function() {
                return i;
            }));
        }, t.prototype.Ch = function(t, e) {
            var n = Ue(e.path), r = IDBKeyRange.bound([ n ], [ _e(n) ], 
            /*lowerOpen=*/ !1, 
            /*upperOpen=*/ !0), i = 0;
            return Ze(t).Ur({
                index: xn.documentTargetsIndex,
                Dh: !0,
                range: r
            }, (function(t, e, n) {
                var r = t[0];
                // Having a sentinel row for a document does not count as containing that document;
                // For the target cache, containing the document means the document is part of some
                // target.
                            t[1];
                0 !== r && (i++, n.done());
            })).next((function() {
                return i > 0;
            }));
        }, 
        /**
         * Looks up a TargetData entry by target ID.
         *
         * @param targetId The target ID of the TargetData entry to look up.
         * @return The cached TargetData entry, or null if the cache has no entry for
         * the target.
         */
        // PORTING NOTE: Multi-tab only.
        t.prototype.si = function(t, e) {
            var n = this;
            return He(t).get(e).next((function(t) {
                return t ? n.serializer.mh(t) : null;
            }));
        }, t;
    }();

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Helper to get a typed SimpleDbStore for the queries object store.
     */
    function He(t) {
        return rn.Nr(t, An.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the target globals object store.
     */ function $e(t) {
        return rn.Nr(t, Dn.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the document target object store.
     */ function Ze(t) {
        return rn.Nr(t, xn.store);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Serializer for values stored in the LocalStore. */ var tn = /** @class */ function() {
        function t(t) {
            this.Fh = t;
        }
        /** Decodes a remote document from storage locally to a Document. */    return t.prototype.jr = function(t) {
            if (t.document) return this.Fh.mi(t.document, !!t.hasCommittedMutations);
            if (t.noDocument) {
                var e = b.st(t.noDocument.path), n = this.Nh(t.noDocument.readTime);
                return new vt(e, n, {
                    hasCommittedMutations: !!t.hasCommittedMutations
                });
            }
            if (t.unknownDocument) {
                var r = b.st(t.unknownDocument.path), i = this.Nh(t.unknownDocument.version);
                return new gt(r, i);
            }
            return ye();
        }, 
        /** Encodes a document for storage locally. */ t.prototype.sh = function(t, e) {
            var n = this.Wr(e), r = t.key.path.$().W();
            if (t instanceof yt) {
                var i = this.Fh.Ai(t), o = t.hasCommittedMutations;
                return new In(
                /* unknownDocument= */ null, 
                /* noDocument= */ null, i, o, n, r);
            }
            if (t instanceof vt) {
                var s = t.key.path.W(), u = this.kh(t.version), a = t.hasCommittedMutations;
                return new In(
                /* unknownDocument= */ null, new bn(s, u), 
                /* document= */ null, a, n, r);
            }
            if (t instanceof gt) {
                var c = t.key.path.W(), h = this.kh(t.version);
                return new In(new Tn(c, h), 
                /* noDocument= */ null, 
                /* document= */ null, 
                /* hasCommittedMutations= */ !0, n, r);
            }
            return ye();
        }, t.prototype.Wr = function(t) {
            var e = t.C();
            return [ e.seconds, e.nanoseconds ];
        }, t.prototype.zr = function(t) {
            var e = new v(t[0], t[1]);
            return g.v(e);
        }, t.prototype.kh = function(t) {
            var e = t.C();
            return new gn(e.seconds, e.nanoseconds);
        }, t.prototype.Nh = function(t) {
            var e = new v(t.seconds, t.nanoseconds);
            return g.v(e);
        }, 
        /** Encodes a batch of mutations into a DbMutationBatch for local storage. */ t.prototype.Mh = function(t, e) {
            var n = this, r = e.baseMutations.map((function(t) {
                return n.Fh.vi(t);
            })), i = e.mutations.map((function(t) {
                return n.Fh.vi(t);
            }));
            return new En(t, e.batchId, e.Tn.toMillis(), r, i);
        }, 
        /** Decodes a DbMutationBatch into a MutationBatch */ t.prototype.xh = function(t) {
            var e = this, n = (t.baseMutations || []).map((function(t) {
                return e.Fh.Fi(t);
            })), r = t.mutations.map((function(t) {
                return e.Fh.Fi(t);
            })), i = v.fromMillis(t.localWriteTimeMs);
            return new Ne(t.batchId, i, n, r);
        }, 
        /** Decodes a DbTarget into TargetData */ t.prototype.mh = function(t) {
            var e, n = this.Nh(t.readTime), r = void 0 !== t.lastLimboFreeSnapshotVersion ? this.Nh(t.lastLimboFreeSnapshotVersion) : g.min();
            return e = void 0 !== t.query.documents ? this.Fh.Li(t.query) : this.Fh.Wi(t.query), 
            new Dt(e, t.targetId, 0 /* Listen */ , t.lastListenSequenceNumber, n, r, A.fromBase64String(t.resumeToken));
        }, 
        /** Encodes TargetData into a DbTarget for storage locally. */ t.prototype.Ph = function(t) {
            var e, n = this.kh(t.Ee), r = this.kh(t.lastLimboFreeSnapshotVersion);
            e = t.target.Ot() ? this.Fh.Oi(t.target) : this.Fh.Bi(t.target);
            // We can't store the resumeToken as a ByteString in IndexedDb, so we
            // convert it to a base64 string for storage.
            var i = t.resumeToken.toBase64();
            // lastListenSequenceNumber is always 0 until we do real GC.
                    return new An(t.targetId, t.target.canonicalId(), n, i, t.sequenceNumber, r, e);
        }, t;
    }(), en = "Failed to obtain exclusive access to the persistence layer. To allow shared access, make sure to invoke `enablePersistence()` with `synchronizeTabs:true` in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.", nn = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).$h = e, r.Oh = n, r;
        }
        return e.__extends(n, t), n;
    }(Re), rn = /** @class */ function() {
        function t(
        /**
         * Whether to synchronize the in-memory state of multiple tabs and share
         * access to local persistence.
         */
        e, n, r, i, o, s, u, a, 
        /**
         * If set to true, forcefully obtains database access. Existing tabs will
         * no longer be able to access IndexedDB.
         */
        f) {
            if (this.allowTabSynchronization = e, this.persistenceKey = n, this.clientId = r, 
            this.Tr = s, this.Lh = a, this.Bh = f, this.qh = null, this.Uh = !1, this.isPrimary = !1, 
            this.networkEnabled = !0, 
            /** Our window.unload handler, if registered. */
            this.Qh = null, this.inForeground = !1, 
            /** Our 'visibilitychange' listener if registered. */
            this.Wh = null, 
            /** The client metadata refresh task. */
            this.jh = null, 
            /** The last time we garbage collected the client metadata object store. */
            this.Kh = Number.NEGATIVE_INFINITY, 
            /** A listener to notify on primary state changes. */
            this.Gh = function(t) {
                return Promise.resolve();
            }, !t.zh()) throw new h(c.UNIMPLEMENTED, "This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");
            this.hh = new un(this, o), this.Hh = n + t.Yh, this.serializer = new tn(u), this.document = i.document, 
            this.Jh = new Xe(this.hh, this.serializer), this.jn = new Be, this.Qn = new Ge(this.serializer, this.jn), 
            this.window = i.window, i.window && i.window.localStorage ? this.Xh = i.window.localStorage : (this.Xh = null, 
            !1 === f && pe("IndexedDbPersistence", "LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."));
        }
        return t.Nr = function(t, e) {
            if (t instanceof nn) return Vn.Nr(t.$h, e);
            throw ye();
        }, 
        /**
         * Attempt to start IndexedDb persistence.
         *
         * @return {Promise<void>} Whether persistence was enabled.
         */
        t.prototype.start = function() {
            var t = this;
            return Vn.Zh(this.Hh, yn, new vn(this.serializer)).then((function(e) {
                return t.to = e, t.eo();
            })).then((function() {
                if (!t.isPrimary && !t.allowTabSynchronization) 
                // Fail `start()` if `synchronizeTabs` is disabled and we cannot
                // obtain the primary lease.
                throw new h(c.FAILED_PRECONDITION, en);
                return t.so(), t.io(), t.no(), t.runTransaction("getHighestListenSequenceNumber", "readonly", (function(e) {
                    return t.Jh.lh(e);
                }));
            })).then((function(e) {
                t.qh = new Ve(e, t.Lh);
            })).then((function() {
                t.Uh = !0;
            })).catch((function(e) {
                return t.to && t.to.close(), Promise.reject(e);
            }));
        }, 
        /**
         * Registers a listener that gets called when the primary state of the
         * instance changes. Upon registering, this listener is invoked immediately
         * with the current primary state.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */
        t.prototype.ro = function(t) {
            var n = this;
            return this.Gh = function(r) {
                return e.__awaiter(n, void 0, void 0, (function() {
                    return e.__generator(this, (function(e) {
                        return this.ho ? [ 2 /*return*/ , t(r) ] : [ 2 /*return*/ ];
                    }));
                }));
            }, t(this.isPrimary);
        }, 
        /**
         * Registers a listener that gets called when the database receives a
         * version change event indicating that it has deleted.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */
        t.prototype.oo = function(t) {
            var n = this;
            this.to.ao((function(r) {
                return e.__awaiter(n, void 0, void 0, (function() {
                    return e.__generator(this, (function(e) {
                        switch (e.label) {
                          case 0:
                            return null === r.newVersion ? [ 4 /*yield*/ , t() ] : [ 3 /*break*/ , 2 ];

                          case 1:
                            e.sent(), e.label = 2;

                          case 2:
                            return [ 2 /*return*/ ];
                        }
                    }));
                }));
            }));
        }, 
        /**
         * Adjusts the current network state in the client's metadata, potentially
         * affecting the primary lease.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */
        t.prototype.uo = function(t) {
            var n = this;
            this.networkEnabled !== t && (this.networkEnabled = t, 
            // Schedule a primary lease refresh for immediate execution. The eventual
            // lease update will be propagated via `primaryStateListener`.
            this.Tr.co((function() {
                return e.__awaiter(n, void 0, void 0, (function() {
                    return e.__generator(this, (function(t) {
                        switch (t.label) {
                          case 0:
                            return this.ho ? [ 4 /*yield*/ , this.eo() ] : [ 3 /*break*/ , 2 ];

                          case 1:
                            t.sent(), t.label = 2;

                          case 2:
                            return [ 2 /*return*/ ];
                        }
                    }));
                }));
            })));
        }, 
        /**
         * Updates the client metadata in IndexedDb and attempts to either obtain or
         * extend the primary lease for the local client. Asynchronously notifies the
         * primary state listener if the client either newly obtained or released its
         * primary lease.
         */
        t.prototype.eo = function() {
            var t = this;
            return this.runTransaction("updateClientMetadataAndTryBecomePrimary", "readwrite", (function(e) {
                return sn(e).put(new kn(t.clientId, Date.now(), t.networkEnabled, t.inForeground)).next((function() {
                    if (t.isPrimary) return t._o(e).next((function(e) {
                        e || (t.isPrimary = !1, t.Tr.lo((function() {
                            return t.Gh(!1);
                        })));
                    }));
                })).next((function() {
                    return t.do(e);
                })).next((function(n) {
                    return t.isPrimary && !n ? t.fo(e).next((function() {
                        return !1;
                    })) : !!n && t.To(e).next((function() {
                        return !0;
                    }));
                }));
            })).catch((function(e) {
                if (Un(e)) 
                // Proceed with the existing state. Any subsequent access to
                // IndexedDB will verify the lease.
                return le("IndexedDbPersistence", "Failed to extend owner lease: ", e), t.isPrimary;
                if (!t.allowTabSynchronization) throw e;
                return le("IndexedDbPersistence", "Releasing owner lease after error during lease refresh", e), 
                /* isPrimary= */ !1;
            })).then((function(e) {
                t.isPrimary !== e && t.Tr.lo((function() {
                    return t.Gh(e);
                })), t.isPrimary = e;
            }));
        }, t.prototype._o = function(t) {
            var e = this;
            return on(t).get(mn.key).next((function(t) {
                return xe.resolve(e.Eo(t));
            }));
        }, t.prototype.Io = function(t) {
            return sn(t).delete(this.clientId);
        }, 
        /**
         * If the garbage collection threshold has passed, prunes the
         * RemoteDocumentChanges and the ClientMetadata store based on the last update
         * time of all clients.
         */
        t.prototype.wo = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o, s = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return !this.isPrimary || this.Ro(this.Kh, 18e5) ? [ 3 /*break*/ , 2 ] : (this.Kh = Date.now(), 
                        [ 4 /*yield*/ , this.runTransaction("maybeGarbageCollectMultiClientState", "readwrite-primary", (function(e) {
                            var n = t.Nr(e, kn.store);
                            return n.Fr().next((function(t) {
                                var e = s.Ao(t, 18e5), r = t.filter((function(t) {
                                    return -1 === e.indexOf(t);
                                }));
                                // Delete metadata for clients that are no longer considered active.
                                                            return xe.forEach(r, (function(t) {
                                    return n.delete(t.clientId);
                                })).next((function() {
                                    return r;
                                }));
                            }));
                        })).catch((function() {
                            return [];
                        })) ]);

                      case 1:
                        // Delete potential leftover entries that may continue to mark the
                        // inactive clients as zombied in LocalStorage.
                        // Ideally we'd delete the IndexedDb and LocalStorage zombie entries for
                        // the client atomically, but we can't. So we opt to delete the IndexedDb
                        // entries first to avoid potentially reviving a zombied client.
                        if (n = e.sent(), this.Xh) for (r = 0, i = n; r < i.length; r++) o = i[r], this.Xh.removeItem(this.mo(o.clientId));
                        e.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Schedules a recurring timer to update the client metadata and to either
         * extend or acquire the primary lease if the client is eligible.
         */
        t.prototype.no = function() {
            var t = this;
            this.jh = this.Tr.yr("client_metadata_refresh" /* ClientMetadataRefresh */ , 4e3, (function() {
                return t.eo().then((function() {
                    return t.wo();
                })).then((function() {
                    return t.no();
                }));
            }));
        }, 
        /** Checks whether `client` is the local client. */ t.prototype.Eo = function(t) {
            return !!t && t.ownerId === this.clientId;
        }, 
        /**
         * Evaluate the state of all active clients and determine whether the local
         * client is or can act as the holder of the primary lease. Returns whether
         * the client is eligible for the lease, but does not actually acquire it.
         * May return 'false' even if there is no active leaseholder and another
         * (foreground) client should become leaseholder instead.
         */
        t.prototype.do = function(t) {
            var e = this;
            return this.Bh ? xe.resolve(!0) : on(t).get(mn.key).next((function(n) {
                // A client is eligible for the primary lease if:
                // - its network is enabled and the client's tab is in the foreground.
                // - its network is enabled and no other client's tab is in the
                //   foreground.
                // - every clients network is disabled and the client's tab is in the
                //   foreground.
                // - every clients network is disabled and no other client's tab is in
                //   the foreground.
                // - the `forceOwningTab` setting was passed in.
                if (null !== n && e.Ro(n.leaseTimestampMs, 5e3) && !e.Po(n.ownerId)) {
                    if (e.Eo(n) && e.networkEnabled) return !0;
                    if (!e.Eo(n)) {
                        if (!n.allowTabSynchronization) 
                        // Fail the `canActAsPrimary` check if the current leaseholder has
                        // not opted into multi-tab synchronization. If this happens at
                        // client startup, we reject the Promise returned by
                        // `enablePersistence()` and the user can continue to use Firestore
                        // with in-memory persistence.
                        // If this fails during a lease refresh, we will instead block the
                        // AsyncQueue from executing further operations. Note that this is
                        // acceptable since mixing & matching different `synchronizeTabs`
                        // settings is not supported.
                        // TODO(b/114226234): Remove this check when `synchronizeTabs` can
                        // no longer be turned off.
                        throw new h(c.FAILED_PRECONDITION, en);
                        return !1;
                    }
                }
                return !(!e.networkEnabled || !e.inForeground) || sn(t).Fr().next((function(t) {
                    return void 0 === e.Ao(t, 5e3).find((function(t) {
                        if (e.clientId !== t.clientId) {
                            var n = !e.networkEnabled && t.networkEnabled, r = !e.inForeground && t.inForeground, i = e.networkEnabled === t.networkEnabled;
                            if (n || r && i) return !0;
                        }
                        return !1;
                    }));
                }));
            })).next((function(t) {
                return e.isPrimary !== t && le("IndexedDbPersistence", "Client " + (t ? "is" : "is not") + " eligible for a primary lease."), 
                t;
            }));
        }, t.prototype.Vo = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        // The shutdown() operations are idempotent and can be called even when
                        // start() aborted (e.g. because it couldn't acquire the persistence lease).
                        return this.Uh = !1, this.po(), this.jh && (this.jh.cancel(), this.jh = null), this.yo(), 
                        this.bo(), [ 4 /*yield*/ , this.runTransaction("shutdown", "readwrite", (function(e) {
                            return t.fo(e).next((function() {
                                return t.Io(e);
                            }));
                        })).catch((function(t) {
                            le("IndexedDbPersistence", "Proceeding with shutdown despite failure: ", t);
                        })) ];

                      case 1:
                        // The shutdown() operations are idempotent and can be called even when
                        // start() aborted (e.g. because it couldn't acquire the persistence lease).
                        return e.sent(), this.to.close(), 
                        // Remove the entry marking the client as zombied from LocalStorage since
                        // we successfully deleted its metadata from IndexedDb.
                        this.vo(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Returns clients that are not zombied and have an updateTime within the
         * provided threshold.
         */
        t.prototype.Ao = function(t, e) {
            var n = this;
            return t.filter((function(t) {
                return n.Ro(t.updateTimeMs, e) && !n.Po(t.clientId);
            }));
        }, 
        /**
         * Returns the IDs of the clients that are currently active. If multi-tab
         * is not supported, returns an array that only contains the local client's
         * ID.
         *
         * PORTING NOTE: This is only used for Web multi-tab.
         */
        t.prototype.So = function() {
            var t = this;
            return this.runTransaction("getActiveClients", "readonly", (function(e) {
                return sn(e).Fr().next((function(e) {
                    return t.Ao(e, 18e5).map((function(t) {
                        return t.clientId;
                    }));
                }));
            }));
        }, t.clearPersistence = function(n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return t.zh() ? (r = n + t.Yh, [ 4 /*yield*/ , Vn.delete(r) ]) : [ 2 /*return*/ , Promise.resolve() ];

                      case 1:
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, Object.defineProperty(t.prototype, "ho", {
            get: function() {
                return this.Uh;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.Do = function(t) {
            return cn.Co(t, this.serializer, this.jn, this.hh);
        }, t.prototype.Fo = function() {
            return this.Jh;
        }, t.prototype.No = function() {
            return this.Qn;
        }, t.prototype.ko = function() {
            return this.jn;
        }, t.prototype.runTransaction = function(t, e, n) {
            var r = this;
            le("IndexedDbPersistence", "Starting transaction:", t);
            var i, o = "readonly" === e ? "readonly" : "readwrite";
            // Do all transactions as readwrite against all object stores, since we
            // are the only reader/writer.
            return this.to.runTransaction(o, Pn, (function(o) {
                return i = new nn(o, r.qh ? r.qh.next() : Ve.dr), "readwrite-primary" === e ? r._o(i).next((function(t) {
                    return !!t || r.do(i);
                })).next((function(e) {
                    if (!e) throw pe("Failed to obtain primary lease for action '" + t + "'."), r.isPrimary = !1, 
                    r.Tr.lo((function() {
                        return r.Gh(!1);
                    })), new h(c.FAILED_PRECONDITION, Se);
                    return n(i);
                })).next((function(t) {
                    return r.To(i).next((function() {
                        return t;
                    }));
                })) : r.Mo(i).next((function() {
                    return n(i);
                }));
            })).then((function(t) {
                return i.Un(), t;
            }));
        }, 
        /**
         * Verifies that the current tab is the primary leaseholder or alternatively
         * that the leaseholder has opted into multi-tab synchronization.
         */
        // TODO(b/114226234): Remove this check when `synchronizeTabs` can no longer
        // be turned off.
        t.prototype.Mo = function(t) {
            var e = this;
            return on(t).get(mn.key).next((function(t) {
                if (null !== t && e.Ro(t.leaseTimestampMs, 5e3) && !e.Po(t.ownerId) && !e.Eo(t) && !(e.Bh || e.allowTabSynchronization && t.allowTabSynchronization)) throw new h(c.FAILED_PRECONDITION, en);
            }));
        }, 
        /**
         * Obtains or extends the new primary lease for the local client. This
         * method does not verify that the client is eligible for this lease.
         */
        t.prototype.To = function(t) {
            var e = new mn(this.clientId, this.allowTabSynchronization, Date.now());
            return on(t).put(mn.key, e);
        }, t.zh = function() {
            return Vn.zh();
        }, 
        /**
         * Generates a string used as a prefix when storing data in IndexedDB and
         * LocalStorage.
         */
        t.xo = function(t) {
            // Use two different prefix formats:
            //   * firestore / persistenceKey / projectID . databaseID / ...
            //   * firestore / persistenceKey / projectID / ...
            // projectIDs are DNS-compatible names and cannot contain dots
            // so there's no danger of collisions.
            var e = t.ii.projectId;
            return t.ii.ln || (e += "." + t.ii.database), "firestore/" + t.persistenceKey + "/" + e + "/";
        }, 
        /** Checks the primary lease and removes it if we are the current primary. */ t.prototype.fo = function(t) {
            var e = this, n = on(t);
            return n.get(mn.key).next((function(t) {
                return e.Eo(t) ? (le("IndexedDbPersistence", "Releasing primary lease."), n.delete(mn.key)) : xe.resolve();
            }));
        }, 
        /** Verifies that `updateTimeMs` is within `maxAgeMs`. */ t.prototype.Ro = function(t, e) {
            var n = Date.now();
            return !(t < n - e || t > n && (pe("Detected an update time that is in the future: " + t + " > " + n), 
            1));
        }, t.prototype.so = function() {
            var t = this;
            null !== this.document && "function" == typeof this.document.addEventListener && (this.Wh = function() {
                t.Tr.co((function() {
                    return t.inForeground = "visible" === t.document.visibilityState, t.eo();
                }));
            }, this.document.addEventListener("visibilitychange", this.Wh), this.inForeground = "visible" === this.document.visibilityState);
        }, t.prototype.yo = function() {
            this.Wh && (this.document.removeEventListener("visibilitychange", this.Wh), this.Wh = null);
        }, 
        /**
         * Attaches a window.unload handler that will synchronously write our
         * clientId to a "zombie client id" location in LocalStorage. This can be used
         * by tabs trying to acquire the primary lease to determine that the lease
         * is no longer valid even if the timestamp is recent. This is particularly
         * important for the refresh case (so the tab correctly re-acquires the
         * primary lease). LocalStorage is used for this rather than IndexedDb because
         * it is a synchronous API and so can be used reliably from  an unload
         * handler.
         */
        t.prototype.io = function() {
            var t, e = this;
            "function" == typeof (null === (t = this.window) || void 0 === t ? void 0 : t.addEventListener) && (this.Qh = function() {
                // Note: In theory, this should be scheduled on the AsyncQueue since it
                // accesses internal state. We execute this code directly during shutdown
                // to make sure it gets a chance to run.
                e.po(), e.Tr.co((function() {
                    return e.Vo();
                }));
            }, this.window.addEventListener("unload", this.Qh));
        }, t.prototype.bo = function() {
            this.Qh && (this.window.removeEventListener("unload", this.Qh), this.Qh = null);
        }, 
        /**
         * Returns whether a client is "zombied" based on its LocalStorage entry.
         * Clients become zombied when their tab closes without running all of the
         * cleanup logic in `shutdown()`.
         */
        t.prototype.Po = function(t) {
            var e;
            try {
                var n = null !== (null === (e = this.Xh) || void 0 === e ? void 0 : e.getItem(this.mo(t)));
                return le("IndexedDbPersistence", "Client '" + t + "' " + (n ? "is" : "is not") + " zombied in LocalStorage"), 
                n;
            } catch (t) {
                // Gracefully handle if LocalStorage isn't working.
                return pe("IndexedDbPersistence", "Failed to get zombied client id.", t), !1;
            }
        }, 
        /**
         * Record client as zombied (a client that had its tab closed). Zombied
         * clients are ignored during primary tab selection.
         */
        t.prototype.po = function() {
            if (this.Xh) try {
                this.Xh.setItem(this.mo(this.clientId), String(Date.now()));
            } catch (t) {
                // Gracefully handle if LocalStorage isn't available / working.
                pe("Failed to set zombie client id.", t);
            }
        }, 
        /** Removes the zombied client entry if it exists. */ t.prototype.vo = function() {
            if (this.Xh) try {
                this.Xh.removeItem(this.mo(this.clientId));
            } catch (t) {
                // Ignore
            }
        }, t.prototype.mo = function(t) {
            return "firestore_zombie_" + this.persistenceKey + "_" + t;
        }, t;
    }();

    /**
     * A helper function for figuring out what kind of query has been stored.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The name of the main (and currently only) IndexedDB database. this name is
     * appended to the prefix provided to the IndexedDbPersistence constructor.
     */
    /**
     * Helper to get a typed SimpleDbStore for the primary client object store.
     */
    function on(t) {
        return rn.Nr(t, mn.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the client metadata object store.
     */ function sn(t) {
        return rn.Nr(t, kn.store);
    }

    /** Provides LRU functionality for IndexedDB persistence. */ rn.Yh = "main";

    var un = /** @class */ function() {
        function t(t, e) {
            this.db = t, this.$o = new Xn(this, e);
        }
        return t.prototype.Oo = function(t) {
            var e = this.Lo(t);
            return this.db.Fo().Vh(t).next((function(t) {
                return e.next((function(e) {
                    return t + e;
                }));
            }));
        }, t.prototype.Lo = function(t) {
            var e = 0;
            return this.Bo(t, (function(t) {
                e++;
            })).next((function() {
                return e;
            }));
        }, t.prototype.js = function(t, e) {
            return this.db.Fo().js(t, e);
        }, t.prototype.Bo = function(t, e) {
            return this.qo(t, (function(t, n) {
                return e(n);
            }));
        }, t.prototype.yh = function(t, e, n) {
            return an(t, n);
        }, t.prototype.vh = function(t, e, n) {
            return an(t, n);
        }, t.prototype.Ah = function(t, e, n) {
            return this.db.Fo().Ah(t, e, n);
        }, t.prototype.Uo = function(t, e) {
            return an(t, e);
        }, 
        /**
         * Returns true if anything would prevent this document from being garbage
         * collected, given that the document in question is not present in any
         * targets and has a sequence number less than or equal to the upper bound for
         * the collection run.
         */
        t.prototype.Qo = function(t, e) {
            /** Returns true if any mutation queue contains the given document. */
            return function(t, e) {
                var n = !1;
                return dn(t).Wo((function(r) {
                    return hn(t, r, e).next((function(t) {
                        return t && (n = !0), xe.resolve(!t);
                    }));
                })).next((function() {
                    return n;
                }));
            }(t, e);
        }, t.prototype.jo = function(t, e) {
            var n = this, r = this.db.No().Yr(), i = [], o = 0;
            return this.qo(t, (function(s, u) {
                if (u <= e) {
                    var a = n.Qo(t, s).next((function(e) {
                        if (!e) 
                        // Our size accounting requires us to read all documents before
                        // removing them.
                        return o++, r.xn(t, s).next((function() {
                            return r.Mn(s), Ze(t).delete([ 0, Ue(s.path) ]);
                        }));
                    }));
                    i.push(a);
                }
            })).next((function() {
                return xe.vn(i);
            })).next((function() {
                return r.apply(t);
            })).next((function() {
                return o;
            }));
        }, t.prototype.removeTarget = function(t, e) {
            var n = e.Ie(t.Oh);
            return this.db.Fo().Ih(t, n);
        }, t.prototype.Ko = function(t, e) {
            return an(t, e);
        }, 
        /**
         * Call provided function for each document in the cache that is 'orphaned'. Orphaned
         * means not a part of any target, so the only entry in the target-document index for
         * that document will be the sentinel row (targetId 0), which will also have the sequence
         * number for the last time the document was accessed.
         */
        t.prototype.qo = function(t, e) {
            var n, r = Ze(t), i = Ve.dr;
            return r.Ur({
                index: xn.documentTargetsIndex
            }, (function(t, r) {
                var o = t[0], s = (t[1], r.path), u = r.sequenceNumber;
                0 === o ? (
                // if nextToReport is valid, report it, this is a new key so the
                // last one must not be a member of any targets.
                i !== Ve.dr && e(new b(je(n)), i), 
                // set nextToReport to be this sequence number. It's the next one we
                // might report, if we don't find any targets for this document.
                // Note that the sequence number must be defined when the targetId
                // is 0.
                i = u, n = s) : 
                // set nextToReport to be invalid, we know we don't need to report
                // this one since we found a target for it.
                i = Ve.dr;
            })).next((function() {
                // Since we report sequence numbers after getting to the next key, we
                // need to check if the last key we iterated over was an orphaned
                // document and report it.
                i !== Ve.dr && e(new b(je(n)), i);
            }));
        }, t.prototype.Go = function(t) {
            return this.db.No().Zr(t);
        }, t;
    }();

    function an(t, e) {
        return Ze(t).put(
        /**
     * @return A value suitable for writing a sentinel row in the target-document
     * store.
     */
        function(t, e) {
            return new xn(0, Ue(t.path), e);
        }(e, t.Oh));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** A mutation queue for a specific user, backed by IndexedDB. */ var cn = /** @class */ function() {
        function t(
        /**
         * The normalized userId (e.g. null UID => "" userId) used to store /
         * retrieve mutations.
         */
        t, e, n, r) {
            this.userId = t, this.serializer = e, this.jn = n, this.hh = r, 
            /**
                 * Caches the document keys for pending mutation batches. If the mutation
                 * has been removed from IndexedDb, the cached value may continue to
                 * be used to retrieve the batch's document keys. To remove a cached value
                 * locally, `removeCachedMutationKeys()` should be invoked either directly
                 * or through `removeMutationBatches()`.
                 *
                 * With multi-tab, when the primary client acknowledges or rejects a mutation,
                 * this cache is used by secondary clients to invalidate the local
                 * view of the documents that were previously affected by the mutation.
                 */
            // PORTING NOTE: Multi-tab only.
            this.zo = {}
            /**
         * Creates a new mutation queue for the given user.
         * @param user The user for which to create a mutation queue.
         * @param serializer The serializer to use when persisting to IndexedDb.
         */;
        }
        return t.Co = function(e, n, r, i) {
            // TODO(mcg): Figure out what constraints there are on userIDs
            // In particular, are there any reserved characters? are empty ids allowed?
            // For the moment store these together in the same mutations table assuming
            // that empty userIDs aren't allowed.
            return ve("" !== e.uid), new t(e.t() ? e.uid : "", n, r, i);
        }, t.prototype.Ho = function(t) {
            var e = !0, n = IDBKeyRange.bound([ this.userId, Number.NEGATIVE_INFINITY ], [ this.userId, Number.POSITIVE_INFINITY ]);
            return ln(t).Ur({
                index: En.userMutationsIndex,
                range: n
            }, (function(t, n, r) {
                e = !1, r.done();
            })).next((function() {
                return e;
            }));
        }, t.prototype.Yo = function(t, e, n, r) {
            var i = this, o = pn(t), s = ln(t);
            // The IndexedDb implementation in Chrome (and Firefox) does not handle
            // compound indices that include auto-generated keys correctly. To ensure
            // that the index entry is added correctly in all browsers, we perform two
            // writes: The first write is used to retrieve the next auto-generated Batch
            // ID, and the second write populates the index and stores the actual
            // mutation batch.
            // See: https://bugs.chromium.org/p/chromium/issues/detail?id=701972
            // We write an empty object to obtain key
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return s.add({}).next((function(u) {
                ve("number" == typeof u);
                for (var a = new Ne(u, e, n, r), c = i.serializer.Mh(i.userId, a), h = [], f = new Ot((function(t, e) {
                    return we(t.j(), e.j());
                })), l = 0, p = r; l < p.length; l++) {
                    var d = p[l], y = _n.key(i.userId, d.key.path, u);
                    f = f.add(d.key.path.$()), h.push(s.put(c)), h.push(o.put(y, _n.PLACEHOLDER));
                }
                return f.forEach((function(e) {
                    h.push(i.jn.Dr(t, e));
                })), t.qn((function() {
                    i.zo[u] = a.keys();
                })), xe.vn(h).next((function() {
                    return a;
                }));
            }));
        }, t.prototype.Jo = function(t, e) {
            var n = this;
            return ln(t).get(e).next((function(t) {
                return t ? (ve(t.userId === n.userId), n.serializer.xh(t)) : null;
            }));
        }, 
        /**
         * Returns the document keys for the mutation batch with the given batchId.
         * For primary clients, this method returns `null` after
         * `removeMutationBatches()` has been called. Secondary clients return a
         * cached result until `removeCachedMutationKeys()` is invoked.
         */
        // PORTING NOTE: Multi-tab only.
        t.prototype.Xo = function(t, e) {
            var n = this;
            return this.zo[e] ? xe.resolve(this.zo[e]) : this.Jo(t, e).next((function(t) {
                if (t) {
                    var r = t.keys();
                    return n.zo[e] = r, r;
                }
                return null;
            }));
        }, t.prototype.Zo = function(t, e) {
            var n = this, r = e + 1, i = IDBKeyRange.lowerBound([ this.userId, r ]), o = null;
            return ln(t).Ur({
                index: En.userMutationsIndex,
                range: i
            }, (function(t, e, i) {
                e.userId === n.userId && (ve(e.batchId >= r), o = n.serializer.xh(e)), i.done();
            })).next((function() {
                return o;
            }));
        }, t.prototype.ta = function(t) {
            var e = IDBKeyRange.upperBound([ this.userId, Number.POSITIVE_INFINITY ]), n = -1;
            return ln(t).Ur({
                index: En.userMutationsIndex,
                range: e,
                reverse: !0
            }, (function(t, e, r) {
                n = e.batchId, r.done();
            })).next((function() {
                return n;
            }));
        }, t.prototype.ea = function(t) {
            var e = this, n = IDBKeyRange.bound([ this.userId, -1 ], [ this.userId, Number.POSITIVE_INFINITY ]);
            return ln(t).Fr(En.userMutationsIndex, n).next((function(t) {
                return t.map((function(t) {
                    return e.serializer.xh(t);
                }));
            }));
        }, t.prototype.Gn = function(t, e) {
            var n = this, r = _n.prefixForPath(this.userId, e.path), i = IDBKeyRange.lowerBound(r), o = [];
            // Scan the document-mutation index starting with a prefix starting with
            // the given documentKey.
                    return pn(t).Ur({
                range: i
            }, (function(r, i, s) {
                var u = r[0], a = r[1], c = r[2], h = je(a);
                // Only consider rows matching exactly the specific key of
                // interest. Note that because we order by path first, and we
                // order terminators before path separators, we'll encounter all
                // the index rows for documentKey contiguously. In particular, all
                // the rows for documentKey will occur before any rows for
                // documents nested in a subcollection beneath documentKey so we
                // can stop as soon as we hit any such row.
                            if (u === n.userId && e.path.isEqual(h)) 
                // Look up the mutation batch in the store.
                return ln(t).get(c).next((function(t) {
                    if (!t) throw ye();
                    ve(t.userId === n.userId), o.push(n.serializer.xh(t));
                }));
                s.done();
            })).next((function() {
                return o;
            }));
        }, t.prototype.Xn = function(t, e) {
            var n = this, r = new Ot(we), i = [];
            return e.forEach((function(e) {
                var o = _n.prefixForPath(n.userId, e.path), s = IDBKeyRange.lowerBound(o), u = pn(t).Ur({
                    range: s
                }, (function(t, i, o) {
                    var s = t[0], u = t[1], a = t[2], c = je(u);
                    // Only consider rows matching exactly the specific key of
                    // interest. Note that because we order by path first, and we
                    // order terminators before path separators, we'll encounter all
                    // the index rows for documentKey contiguously. In particular, all
                    // the rows for documentKey will occur before any rows for
                    // documents nested in a subcollection beneath documentKey so we
                    // can stop as soon as we hit any such row.
                                    s === n.userId && e.path.isEqual(c) ? r = r.add(a) : o.done();
                }));
                i.push(u);
            })), xe.vn(i).next((function() {
                return n.sa(t, r);
            }));
        }, t.prototype.nr = function(t, e) {
            var n = this, r = e.path, i = r.length + 1, o = _n.prefixForPath(this.userId, r), s = IDBKeyRange.lowerBound(o), u = new Ot(we);
            return pn(t).Ur({
                range: s
            }, (function(t, e, o) {
                var s = t[0], a = t[1], c = t[2], h = je(a);
                s === n.userId && r.q(h) ? 
                // Rows with document keys more than one segment longer than the
                // query path can't be matches. For example, a query on 'rooms'
                // can't match the document /rooms/abc/messages/xyx.
                // TODO(mcg): we'll need a different scanner when we implement
                // ancestor queries.
                h.length === i && (u = u.add(c)) : o.done();
            })).next((function() {
                return n.sa(t, u);
            }));
        }, t.prototype.sa = function(t, e) {
            var n = this, r = [], i = [];
            // TODO(rockwood): Implement this using iterate.
            return e.forEach((function(e) {
                i.push(ln(t).get(e).next((function(t) {
                    if (null === t) throw ye();
                    ve(t.userId === n.userId), r.push(n.serializer.xh(t));
                })));
            })), xe.vn(i).next((function() {
                return r;
            }));
        }, t.prototype.ia = function(t, e) {
            var n = this;
            return fn(t.$h, this.userId, e).next((function(r) {
                return t.qn((function() {
                    n.na(e.batchId);
                })), xe.forEach(r, (function(e) {
                    return n.hh.Uo(t, e);
                }));
            }));
        }, 
        /**
         * Clears the cached keys for a mutation batch. This method should be
         * called by secondary clients after they process mutation updates.
         *
         * Note that this method does not have to be called from primary clients as
         * the corresponding cache entries are cleared when an acknowledged or
         * rejected batch is removed from the mutation queue.
         */
        // PORTING NOTE: Multi-tab only
        t.prototype.na = function(t) {
            delete this.zo[t];
        }, t.prototype.ra = function(t) {
            var e = this;
            return this.Ho(t).next((function(n) {
                if (!n) return xe.resolve();
                // Verify that there are no entries in the documentMutations index if
                // the queue is empty.
                            var r = IDBKeyRange.lowerBound(_n.prefixForUser(e.userId)), i = [];
                return pn(t).Ur({
                    range: r
                }, (function(t, n, r) {
                    if (t[0] === e.userId) {
                        var o = je(t[1]);
                        i.push(o);
                    } else r.done();
                })).next((function() {
                    ve(0 === i.length);
                }));
            }));
        }, t.prototype.Ch = function(t, e) {
            return hn(t, this.userId, e);
        }, 
        // PORTING NOTE: Multi-tab only (state is held in memory in other clients).
        /** Returns the mutation queue's metadata from IndexedDb. */
        t.prototype.ha = function(t) {
            var e = this;
            return dn(t).get(this.userId).next((function(t) {
                return t || new wn(e.userId, -1, 
                /*lastStreamToken=*/ "");
            }));
        }, t;
    }();

    /**
     * @return true if the mutation queue for the given user contains a pending
     *         mutation for the given key.
     */ function hn(t, e, n) {
        var r = _n.prefixForPath(e, n.path), i = r[1], o = IDBKeyRange.lowerBound(r), s = !1;
        return pn(t).Ur({
            range: o,
            Dh: !0
        }, (function(t, n, r) {
            var o = t[0], u = t[1];
            t[2];
            o === e && u === i && (s = !0), r.done();
        })).next((function() {
            return s;
        }));
    }

    function fn(t, e, n) {
        var r = t.store(En.store), i = t.store(_n.store), o = [], s = IDBKeyRange.only(n.batchId), u = 0, a = r.Ur({
            range: s
        }, (function(t, e, n) {
            return u++, n.delete();
        }));
        o.push(a.next((function() {
            ve(1 === u);
        })));
        for (var c = [], h = 0, f = n.mutations; h < f.length; h++) {
            var l = f[h], p = _n.key(e, l.key.path, n.batchId);
            o.push(i.delete(p)), c.push(l.key);
        }
        return xe.vn(o).next((function() {
            return c;
        }));
    }

    /**
     * Helper to get a typed SimpleDbStore for the mutations object store.
     */ function ln(t) {
        return rn.Nr(t, En.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the mutationQueues object store.
     */ function pn(t) {
        return rn.Nr(t, _n.store);
    }

    /**
     * Helper to get a typed SimpleDbStore for the mutationQueues object store.
     */ function dn(t) {
        return rn.Nr(t, wn.store);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Schema Version for the Web client:
     * 1.  Initial version including Mutation Queue, Query Cache, and Remote
     *     Document Cache
     * 2.  Used to ensure a targetGlobal object exists and add targetCount to it. No
     *     longer required because migration 3 unconditionally clears it.
     * 3.  Dropped and re-created Query Cache to deal with cache corruption related
     *     to limbo resolution. Addresses
     *     https://github.com/firebase/firebase-ios-sdk/issues/1548
     * 4.  Multi-Tab Support.
     * 5.  Removal of held write acks.
     * 6.  Create document global for tracking document cache size.
     * 7.  Ensure every cached document has a sentinel row with a sequence number.
     * 8.  Add collection-parent index for Collection Group queries.
     * 9.  Change RemoteDocumentChanges store to be keyed by readTime rather than
     *     an auto-incrementing ID. This is required for Index-Free queries.
     * 10. Rewrite the canonical IDs to the explicit Protobuf-based format.
     */ var yn = 10, vn = /** @class */ function() {
        function t(t) {
            this.serializer = t;
        }
        /**
         * Performs database creation and schema upgrades.
         *
         * Note that in production, this method is only ever used to upgrade the schema
         * to SCHEMA_VERSION. Different values of toVersion are only used for testing
         * and local feature development.
         */    return t.prototype.createOrUpgrade = function(t, e, n, r) {
            var i = this;
            ve(n < r && n >= 0 && r <= yn);
            var o = new Cn(e);
            n < 1 && r >= 1 && (function(t) {
                t.createObjectStore(mn.store);
            }(t), function(t) {
                t.createObjectStore(wn.store, {
                    keyPath: wn.keyPath
                }), t.createObjectStore(En.store, {
                    keyPath: En.keyPath,
                    autoIncrement: !0
                }).createIndex(En.userMutationsIndex, En.userMutationsKeyPath, {
                    unique: !0
                }), t.createObjectStore(_n.store);
            }(t), Rn(t), function(t) {
                t.createObjectStore(In.store);
            }(t));
            // Migration 2 to populate the targetGlobal object no longer needed since
            // migration 3 unconditionally clears it.
            var s = xe.resolve();
            return n < 3 && r >= 3 && (
            // Brand new clients don't need to drop and recreate--only clients that
            // potentially have corrupt data.
            0 !== n && (function(t) {
                t.deleteObjectStore(xn.store), t.deleteObjectStore(An.store), t.deleteObjectStore(Dn.store);
            }(t), Rn(t)), s = s.next((function() {
                /**
         * Creates the target global singleton row.
         *
         * @param {IDBTransaction} txn The version upgrade transaction for indexeddb
         */
                return function(t) {
                    var e = t.store(Dn.store), n = new Dn(
                    /*highestTargetId=*/ 0, 
                    /*lastListenSequenceNumber=*/ 0, g.min().C(), 
                    /*targetCount=*/ 0);
                    return e.put(Dn.key, n);
                }(o);
            }))), n < 4 && r >= 4 && (0 !== n && (
            // Schema version 3 uses auto-generated keys to generate globally unique
            // mutation batch IDs (this was previously ensured internally by the
            // client). To migrate to the new schema, we have to read all mutations
            // and write them back out. We preserve the existing batch IDs to guarantee
            // consistency with other object stores. Any further mutation batch IDs will
            // be auto-generated.
            s = s.next((function() {
                return function(t, e) {
                    return e.store(En.store).Fr().next((function(n) {
                        t.deleteObjectStore(En.store), t.createObjectStore(En.store, {
                            keyPath: En.keyPath,
                            autoIncrement: !0
                        }).createIndex(En.userMutationsIndex, En.userMutationsKeyPath, {
                            unique: !0
                        });
                        var r = e.store(En.store), i = n.map((function(t) {
                            return r.put(t);
                        }));
                        return xe.vn(i);
                    }));
                }(t, o);
            }))), s = s.next((function() {
                !function(t) {
                    t.createObjectStore(kn.store, {
                        keyPath: kn.keyPath
                    });
                }(t);
            }))), n < 5 && r >= 5 && (s = s.next((function() {
                return i.removeAcknowledgedMutations(o);
            }))), n < 6 && r >= 6 && (s = s.next((function() {
                return function(t) {
                    t.createObjectStore(Nn.store);
                }(t), i.addDocumentGlobal(o);
            }))), n < 7 && r >= 7 && (s = s.next((function() {
                return i.ensureSequenceNumbers(o);
            }))), n < 8 && r >= 8 && (s = s.next((function() {
                return i.createCollectionParentIndex(t, o);
            }))), n < 9 && r >= 9 && (s = s.next((function() {
                // Multi-Tab used to manage its own changelog, but this has been moved
                // to the DbRemoteDocument object store itself. Since the previous change
                // log only contained transient data, we can drop its object store.
                !function(t) {
                    t.objectStoreNames.contains("remoteDocumentChanges") && t.deleteObjectStore("remoteDocumentChanges");
                }(t), function(t) {
                    var e = t.objectStore(In.store);
                    e.createIndex(In.readTimeIndex, In.readTimeIndexPath, {
                        unique: !1
                    }), e.createIndex(In.collectionReadTimeIndex, In.collectionReadTimeIndexPath, {
                        unique: !1
                    });
                }(e);
            }))), n < 10 && r >= 10 && (s = s.next((function() {
                return i.rewriteCanonicalIds(o);
            }))), s;
        }, t.prototype.addDocumentGlobal = function(t) {
            var e = 0;
            return t.store(In.store).Ur((function(t, n) {
                e += Ye(n);
            })).next((function() {
                var n = new Nn(e);
                return t.store(Nn.store).put(Nn.key, n);
            }));
        }, t.prototype.removeAcknowledgedMutations = function(t) {
            var e = this, n = t.store(wn.store), r = t.store(En.store);
            return n.Fr().next((function(n) {
                return xe.forEach(n, (function(n) {
                    var i = IDBKeyRange.bound([ n.userId, -1 ], [ n.userId, n.lastAcknowledgedBatchId ]);
                    return r.Fr(En.userMutationsIndex, i).next((function(r) {
                        return xe.forEach(r, (function(r) {
                            ve(r.userId === n.userId);
                            var i = e.serializer.xh(r);
                            return fn(t, n.userId, i).next((function() {}));
                        }));
                    }));
                }));
            }));
        }, 
        /**
         * Ensures that every document in the remote document cache has a corresponding sentinel row
         * with a sequence number. Missing rows are given the most recently used sequence number.
         */
        t.prototype.ensureSequenceNumbers = function(t) {
            var e = t.store(xn.store), n = t.store(In.store);
            return t.store(Dn.store).get(Dn.key).next((function(t) {
                var r = [];
                return n.Ur((function(n, i) {
                    var o = new w(n), s = function(t) {
                        return [ 0, Ue(t) ];
                    }(o);
                    r.push(e.get(s).next((function(n) {
                        return n ? xe.resolve() : function(n) {
                            return e.put(new xn(0, Ue(n), t.highestListenSequenceNumber));
                        }(o);
                    })));
                })).next((function() {
                    return xe.vn(r);
                }));
            }));
        }, t.prototype.createCollectionParentIndex = function(t, e) {
            // Create the index.
            t.createObjectStore(Sn.store, {
                keyPath: Sn.keyPath
            });
            var n = e.store(Sn.store), r = new Fe, i = function(t) {
                if (r.add(t)) {
                    var e = t.L(), i = t.$();
                    return n.put({
                        collectionId: e,
                        parent: Ue(i)
                    });
                }
            };
            // Helper to add an index entry iff we haven't already written it.
            // Index existing remote documents.
                    return e.store(In.store).Ur({
                Dh: !0
            }, (function(t, e) {
                var n = new w(t);
                return i(n.$());
            })).next((function() {
                return e.store(_n.store).Ur({
                    Dh: !0
                }, (function(t, e) {
                    t[0];
                    var n = t[1], r = (t[2], je(n));
                    return i(r.$());
                }));
            }));
        }, t.prototype.rewriteCanonicalIds = function(t) {
            var e = this, n = t.store(An.store);
            return n.Ur((function(t, r) {
                var i = e.serializer.mh(r), o = e.serializer.Ph(i);
                return n.put(o);
            }));
        }, t;
    }(), gn = function(t, e) {
        this.seconds = t, this.nanoseconds = e;
    }, mn = function(t, 
    /** Whether to allow shared access from multiple tabs. */
    e, n) {
        this.ownerId = t, this.allowTabSynchronization = e, this.leaseTimestampMs = n;
    };

    /** Performs database creation and schema upgrades. */
    /**
     * Name of the IndexedDb object store.
     *
     * Note that the name 'owner' is chosen to ensure backwards compatibility with
     * older clients that only supported single locked access to the persistence
     * layer.
     */
    mn.store = "owner", 
    /**
         * The key string used for the single object that exists in the
         * DbPrimaryClient store.
         */
    mn.key = "owner";

    var wn = function(
    /**
         * The normalized user ID to which this queue belongs.
         */
    t, 
    /**
         * An identifier for the highest numbered batch that has been acknowledged
         * by the server. All MutationBatches in this queue with batchIds less
         * than or equal to this value are considered to have been acknowledged by
         * the server.
         *
         * NOTE: this is deprecated and no longer used by the code.
         */
    e, 
    /**
         * A stream token that was previously sent by the server.
         *
         * See StreamingWriteRequest in datastore.proto for more details about
         * usage.
         *
         * After sending this token, earlier tokens may not be used anymore so
         * only a single stream token is retained.
         *
         * NOTE: this is deprecated and no longer used by the code.
         */
    n) {
        this.userId = t, this.lastAcknowledgedBatchId = e, this.lastStreamToken = n;
    };

    /** Name of the IndexedDb object store.  */ wn.store = "mutationQueues", 
    /** Keys are automatically assigned via the userId property. */
    wn.keyPath = "userId";

    /**
     * An object to be stored in the 'mutations' store in IndexedDb.
     *
     * Represents a batch of user-level mutations intended to be sent to the server
     * in a single write. Each user-level batch gets a separate DbMutationBatch
     * with a new batchId.
     */
    var En = function(
    /**
         * The normalized user ID to which this batch belongs.
         */
    t, 
    /**
         * An identifier for this batch, allocated using an auto-generated key.
         */
    e, 
    /**
         * The local write time of the batch, stored as milliseconds since the
         * epoch.
         */
    n, 
    /**
         * A list of "mutations" that represent a partial base state from when this
         * write batch was initially created. During local application of the write
         * batch, these baseMutations are applied prior to the real writes in order
         * to override certain document fields from the remote document cache. This
         * is necessary in the case of non-idempotent writes (e.g. `increment()`
         * transforms) to make sure that the local view of the modified documents
         * doesn't flicker if the remote document cache receives the result of the
         * non-idempotent write before the write is removed from the queue.
         *
         * These mutations are never sent to the backend.
         */
    r, 
    /**
         * A list of mutations to apply. All mutations will be applied atomically.
         *
         * Mutations are serialized via JsonProtoSerializer.toMutation().
         */
    i) {
        this.userId = t, this.batchId = e, this.localWriteTimeMs = n, this.baseMutations = r, 
        this.mutations = i;
    };

    /** Name of the IndexedDb object store.  */ En.store = "mutations", 
    /** Keys are automatically assigned via the userId, batchId properties. */
    En.keyPath = "batchId", 
    /** The index name for lookup of mutations by user. */
    En.userMutationsIndex = "userMutationsIndex", 
    /** The user mutations index is keyed by [userId, batchId] pairs. */
    En.userMutationsKeyPath = [ "userId", "batchId" ];

    var _n = /** @class */ function() {
        function t() {}
        /**
         * Creates a [userId] key for use in the DbDocumentMutations index to iterate
         * over all of a user's document mutations.
         */    return t.prefixForUser = function(t) {
            return [ t ];
        }, 
        /**
         * Creates a [userId, encodedPath] key for use in the DbDocumentMutations
         * index to iterate over all at document mutations for a given path or lower.
         */
        t.prefixForPath = function(t, e) {
            return [ t, Ue(e) ];
        }, 
        /**
         * Creates a full index key of [userId, encodedPath, batchId] for inserting
         * and deleting into the DbDocumentMutations index.
         */
        t.key = function(t, e, n) {
            return [ t, Ue(e), n ];
        }, t;
    }();

    _n.store = "documentMutations", 
    /**
         * Because we store all the useful information for this store in the key,
         * there is no useful information to store as the value. The raw (unencoded)
         * path cannot be stored because IndexedDb doesn't store prototype
         * information.
         */
    _n.PLACEHOLDER = new _n;

    var bn = function(t, e) {
        this.path = t, this.readTime = e;
    }, Tn = function(t, e) {
        this.path = t, this.version = e;
    }, In = 
    // TODO: We are currently storing full document keys almost three times
    // (once as part of the primary key, once - partly - as `parentPath` and once
    // inside the encoded documents). During our next migration, we should
    // rewrite the primary key as parentPath + document ID which would allow us
    // to drop one value.
    function(
    /**
         * Set to an instance of DbUnknownDocument if the data for a document is
         * not known, but it is known that a document exists at the specified
         * version (e.g. it had a successful update applied to it)
         */
    t, 
    /**
         * Set to an instance of a DbNoDocument if it is known that no document
         * exists.
         */
    e, 
    /**
         * Set to an instance of a Document if there's a cached version of the
         * document.
         */
    n, 
    /**
         * Documents that were written to the remote document store based on
         * a write acknowledgment are marked with `hasCommittedMutations`. These
         * documents are potentially inconsistent with the backend's copy and use
         * the write's commit version as their document version.
         */
    r, 
    /**
         * When the document was read from the backend. Undefined for data written
         * prior to schema version 9.
         */
    i, 
    /**
         * The path of the collection this document is part of. Undefined for data
         * written prior to schema version 9.
         */
    o) {
        this.unknownDocument = t, this.noDocument = e, this.document = n, this.hasCommittedMutations = r, 
        this.readTime = i, this.parentPath = o;
    };

    /**
     * Represents a document that is known to exist but whose data is unknown.
     * Stored in IndexedDb as part of a DbRemoteDocument object.
     */ In.store = "remoteDocuments", 
    /**
         * An index that provides access to all entries sorted by read time (which
         * corresponds to the last modification time of each row).
         *
         * This index is used to provide a changelog for Multi-Tab.
         */
    In.readTimeIndex = "readTimeIndex", In.readTimeIndexPath = "readTime", 
    /**
         * An index that provides access to documents in a collection sorted by read
         * time.
         *
         * This index is used to allow the RemoteDocumentCache to fetch newly changed
         * documents in a collection.
         */
    In.collectionReadTimeIndex = "collectionReadTimeIndex", In.collectionReadTimeIndexPath = [ "parentPath", "readTime" ];

    /**
     * Contains a single entry that has metadata about the remote document cache.
     */
    var Nn = 
    /**
         * @param byteSize Approximately the total size in bytes of all the documents in the document
         * cache.
         */
    function(t) {
        this.byteSize = t;
    };

    Nn.store = "remoteDocumentGlobal", Nn.key = "remoteDocumentGlobalKey";

    var An = function(
    /**
         * An auto-generated sequential numeric identifier for the query.
         *
         * Queries are stored using their canonicalId as the key, but these
         * canonicalIds can be quite long so we additionally assign a unique
         * queryId which can be used by referenced data structures (e.g.
         * indexes) to minimize the on-disk cost.
         */
    t, 
    /**
         * The canonical string representing this query. This is not unique.
         */
    e, 
    /**
         * The last readTime received from the Watch Service for this query.
         *
         * This is the same value as TargetChange.read_time in the protos.
         */
    n, 
    /**
         * An opaque, server-assigned token that allows watching a query to be
         * resumed after disconnecting without retransmitting all the data
         * that matches the query. The resume token essentially identifies a
         * point in time from which the server should resume sending results.
         *
         * This is related to the snapshotVersion in that the resumeToken
         * effectively also encodes that value, but the resumeToken is opaque
         * and sometimes encodes additional information.
         *
         * A consequence of this is that the resumeToken should be used when
         * asking the server to reason about where this client is in the watch
         * stream, but the client should use the snapshotVersion for its own
         * purposes.
         *
         * This is the same value as TargetChange.resume_token in the protos.
         */
    r, 
    /**
         * A sequence number representing the last time this query was
         * listened to, used for garbage collection purposes.
         *
         * Conventionally this would be a timestamp value, but device-local
         * clocks are unreliable and they must be able to create new listens
         * even while disconnected. Instead this should be a monotonically
         * increasing number that's incremented on each listen call.
         *
         * This is different from the queryId since the queryId is an
         * immutable identifier assigned to the Query on first use while
         * lastListenSequenceNumber is updated every time the query is
         * listened to.
         */
    i, 
    /**
         * Denotes the maximum snapshot version at which the associated query view
         * contained no limbo documents.  Undefined for data written prior to
         * schema version 9.
         */
    o, 
    /**
         * The query for this target.
         *
         * Because canonical ids are not unique we must store the actual query. We
         * use the proto to have an object we can persist without having to
         * duplicate translation logic to and from a `Query` object.
         */
    s) {
        this.targetId = t, this.canonicalId = e, this.readTime = n, this.resumeToken = r, 
        this.lastListenSequenceNumber = i, this.lastLimboFreeSnapshotVersion = o, this.query = s;
    };

    An.store = "targets", 
    /** Keys are automatically assigned via the targetId property. */
    An.keyPath = "targetId", 
    /** The name of the queryTargets index. */
    An.queryTargetsIndexName = "queryTargetsIndex", 
    /**
         * The index of all canonicalIds to the targets that they match. This is not
         * a unique mapping because canonicalId does not promise a unique name for all
         * possible queries, so we append the targetId to make the mapping unique.
         */
    An.queryTargetsKeyPath = [ "canonicalId", "targetId" ];

    /**
     * An object representing an association between a target and a document, or a
     * sentinel row marking the last sequence number at which a document was used.
     * Each document cached must have a corresponding sentinel row before lru
     * garbage collection is enabled.
     *
     * The target associations and sentinel rows are co-located so that orphaned
     * documents and their sequence numbers can be identified efficiently via a scan
     * of this store.
     */
    var xn = function(
    /**
         * The targetId identifying a target or 0 for a sentinel row.
         */
    t, 
    /**
         * The path to the document, as encoded in the key.
         */
    e, 
    /**
         * If this is a sentinel row, this should be the sequence number of the last
         * time the document specified by `path` was used. Otherwise, it should be
         * `undefined`.
         */
    n) {
        this.targetId = t, this.path = e, this.sequenceNumber = n;
    };

    /** Name of the IndexedDb object store.  */ xn.store = "targetDocuments", 
    /** Keys are automatically assigned via the targetId, path properties. */
    xn.keyPath = [ "targetId", "path" ], 
    /** The index name for the reverse index. */
    xn.documentTargetsIndex = "documentTargetsIndex", 
    /** We also need to create the reverse index for these properties. */
    xn.documentTargetsKeyPath = [ "path", "targetId" ];

    /**
     * A record of global state tracked across all Targets, tracked separately
     * to avoid the need for extra indexes.
     *
     * This should be kept in-sync with the proto used in the iOS client.
     */
    var Dn = function(
    /**
         * The highest numbered target id across all targets.
         *
         * See DbTarget.targetId.
         */
    t, 
    /**
         * The highest numbered lastListenSequenceNumber across all targets.
         *
         * See DbTarget.lastListenSequenceNumber.
         */
    e, 
    /**
         * A global snapshot version representing the last consistent snapshot we
         * received from the backend. This is monotonically increasing and any
         * snapshots received from the backend prior to this version (e.g. for
         * targets resumed with a resumeToken) should be suppressed (buffered)
         * until the backend has caught up to this snapshot version again. This
         * prevents our cache from ever going backwards in time.
         */
    n, 
    /**
         * The number of targets persisted.
         */
    r) {
        this.highestTargetId = t, this.highestListenSequenceNumber = e, this.lastRemoteSnapshotVersion = n, 
        this.targetCount = r;
    };

    /**
     * The key string used for the single object that exists in the
     * DbTargetGlobal store.
     */ Dn.key = "targetGlobalKey", Dn.store = "targetGlobal";

    /**
     * An object representing an association between a Collection id (e.g. 'messages')
     * to a parent path (e.g. '/chats/123') that contains it as a (sub)collection.
     * This is used to efficiently find all collections to query when performing
     * a Collection Group query.
     */
    var Sn = function(
    /**
         * The collectionId (e.g. 'messages')
         */
    t, 
    /**
         * The path to the parent (either a document location or an empty path for
         * a root-level collection).
         */
    e) {
        this.collectionId = t, this.parent = e;
    };

    /** Name of the IndexedDb object store. */ function Rn(t) {
        t.createObjectStore(xn.store, {
            keyPath: xn.keyPath
        }).createIndex(xn.documentTargetsIndex, xn.documentTargetsKeyPath, {
            unique: !0
        }), 
        // NOTE: This is unique only because the TargetId is the suffix.
        t.createObjectStore(An.store, {
            keyPath: An.keyPath
        }).createIndex(An.queryTargetsIndexName, An.queryTargetsKeyPath, {
            unique: !0
        }), t.createObjectStore(Dn.store);
    }

    Sn.store = "collectionParents", 
    /** Keys are automatically assigned via the collectionId, parent properties. */
    Sn.keyPath = [ "collectionId", "parent" ];

    var kn = function(
    // Note: Previous schema versions included a field
    // "lastProcessedDocumentChangeId". Don't use anymore.
    /** The auto-generated client id assigned at client startup. */
    t, 
    /** The last time this state was updated. */
    e, 
    /** Whether the client's network connection is enabled. */
    n, 
    /** Whether this client is running in a foreground tab. */
    r) {
        this.clientId = t, this.updateTimeMs = e, this.networkEnabled = n, this.inForeground = r;
    };

    /** Name of the IndexedDb object store. */ kn.store = "clientMetadata", 
    /** Keys are automatically assigned via the clientId properties. */
    kn.keyPath = "clientId";

    var Pn = e.__spreadArrays(e.__spreadArrays(e.__spreadArrays([ wn.store, En.store, _n.store, In.store, An.store, mn.store, Dn.store, xn.store ], [ kn.store ]), [ Nn.store ]), [ Sn.store ]), Vn = /** @class */ function() {
        function t(e) {
            this.db = e, 
            // NOTE: According to https://bugs.webkit.org/show_bug.cgi?id=197050, the
            // bug we're checking for should exist in iOS >= 12.2 and < 13, but for
            // whatever reason it's much harder to hit after 12.2 so we only proactively
            // log on 12.2.
            12.2 === t.oa(i.getUA()) && pe("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
        }
        /**
         * Opens the specified database, creating or upgrading it if necessary.
         *
         * Note that `version` must not be a downgrade. IndexedDB does not support downgrading the schema
         * version. We currently do not support any way to do versioning outside of IndexedDB's versioning
         * mechanism, as only version-upgrade transactions are allowed to do things like create
         * objectstores.
         */    return t.Zh = function(e, n, r) {
            return le("SimpleDb", "Opening database:", e), new xe((function(i, o) {
                // TODO(mikelehen): Investigate browser compatibility.
                // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
                // suggests IE9 and older WebKit browsers handle upgrade
                // differently. They expect setVersion, as described here:
                // https://developer.mozilla.org/en-US/docs/Web/API/IDBVersionChangeRequest/setVersion
                var s = indexedDB.open(e, n);
                s.onsuccess = function(e) {
                    var n = e.target.result;
                    i(new t(n));
                }, s.onblocked = function() {
                    o(new h(c.FAILED_PRECONDITION, "Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."));
                }, s.onerror = function(t) {
                    var e = t.target.error;
                    "VersionError" === e.name ? o(new h(c.FAILED_PRECONDITION, "A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")) : o(e);
                }, s.onupgradeneeded = function(t) {
                    le("SimpleDb", 'Database "' + e + '" requires upgrade from version:', t.oldVersion);
                    var n = t.target.result;
                    r.createOrUpgrade(n, s.transaction, t.oldVersion, yn).next((function() {
                        le("SimpleDb", "Database upgrade to version " + yn + " complete");
                    }));
                };
            })).yn();
        }, 
        /** Deletes the specified database. */ t.delete = function(t) {
            return le("SimpleDb", "Removing database:", t), jn(window.indexedDB.deleteDatabase(t)).yn();
        }, 
        /** Returns true if IndexedDB is available in the current environment. */ t.zh = function() {
            if ("undefined" == typeof indexedDB) return !1;
            if (t.aa()) return !0;
            // We extensively use indexed array values and compound keys,
            // which IE and Edge do not support. However, they still have indexedDB
            // defined on the window, so we need to check for them here and make sure
            // to return that persistence is not enabled for those browsers.
            // For tracking support of this feature, see here:
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/status/indexeddbarraysandmultientrysupport/
            // Check the UA string to find out the browser.
                    var e = i.getUA(), n = t.oa(e), r = 0 < n && n < 10, o = t.ua(e), s = 0 < o && o < 4.5;
            // IE 10
            // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
            // Edge
            // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML,
            // like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
            // iOS Safari: Disable for users running iOS version < 10.
                    return !(e.indexOf("MSIE ") > 0 || e.indexOf("Trident/") > 0 || e.indexOf("Edge/") > 0 || r || s);
        }, 
        /**
         * Returns true if the backing IndexedDB store is the Node IndexedDBShim
         * (see https://github.com/axemclion/IndexedDBShim).
         */
        t.aa = function() {
            var t;
            return "undefined" != typeof __PRIVATE_process && "YES" === (null === (t = __PRIVATE_process.__PRIVATE_env) || void 0 === t ? void 0 : t.ca);
        }, 
        /** Helper to get a typed SimpleDbStore from a transaction. */ t.Nr = function(t, e) {
            return t.store(e);
        }, 
        // visible for testing
        /** Parse User Agent to determine iOS version. Returns -1 if not found. */
        t.oa = function(t) {
            var e = t.match(/i(?:phone|pad|pod) os ([\d_]+)/i), n = e ? e[1].split("_").slice(0, 2).join(".") : "-1";
            return Number(n);
        }, 
        // visible for testing
        /** Parse User Agent to determine Android version. Returns -1 if not found. */
        t.ua = function(t) {
            var e = t.match(/Android ([\d.]+)/i), n = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
            return Number(n);
        }, t.prototype.ao = function(t) {
            this.db.onversionchange = function(e) {
                return t(e);
            };
        }, t.prototype.runTransaction = function(t, n, r) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var i, o, s, u, a;
                return e.__generator(this, (function(c) {
                    switch (c.label) {
                      case 0:
                        i = "readonly" === t, o = 0, s = function() {
                            var t, s, a, c, h;
                            return e.__generator(this, (function(e) {
                                switch (e.label) {
                                  case 0:
                                    ++o, t = Cn.open(u.db, i ? "readonly" : "readwrite", n), e.label = 1;

                                  case 1:
                                    // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
                                    // fire), but still return the original transactionFnResult back to the
                                    // caller.
                                    return e.trys.push([ 1, 3, , 4 ]), s = r(t).catch((function(e) {
                                        // Abort the transaction if there was an error.
                                        return t.abort(e), xe.reject(e);
                                    })).yn(), a = {}, s.catch((function() {})), [ 4 /*yield*/ , t._a ];

                                  case 2:
                                    return [ 2 /*return*/ , (a.value = (
                                    // Wait for the transaction to complete (i.e. IndexedDb's onsuccess event to
                                    // fire), but still return the original transactionFnResult back to the
                                    // caller.
                                    e.sent(), s), a) ];

                                  case 3:
                                    return c = e.sent(), h = "FirebaseError" !== c.name && o < 3, le("SimpleDb", "Transaction failed with error: %s. Retrying: %s.", c.message, h), 
                                    h ? [ 3 /*break*/ , 4 ] : [ 2 /*return*/ , {
                                        value: Promise.reject(c)
                                    } ];

                                  case 4:
                                    return [ 2 /*return*/ ];
                                }
                            }));
                        }, u = this, c.label = 1;

                      case 1:
                        return [ 5 /*yield**/ , s() ];

                      case 2:
                        if ("object" == typeof (a = c.sent())) return [ 2 /*return*/ , a.value ];
                        c.label = 3;

                      case 3:
                        return [ 3 /*break*/ , 1 ];

                      case 4:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.close = function() {
            this.db.close();
        }, t;
    }(), Ln = /** @class */ function() {
        function t(t) {
            this.la = t, this.da = !1, this.fa = null;
        }
        return Object.defineProperty(t.prototype, "Pn", {
            get: function() {
                return this.da;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "Ta", {
            get: function() {
                return this.fa;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "cursor", {
            set: function(t) {
                this.la = t;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /**
         * This function can be called to stop iteration at any point.
         */
        t.prototype.done = function() {
            this.da = !0;
        }, 
        /**
         * This function can be called to skip to that next key, which could be
         * an index or a primary key.
         */
        t.prototype.Qr = function(t) {
            this.fa = t;
        }, 
        /**
         * Delete the current cursor value from the object store.
         *
         * NOTE: You CANNOT do this with a keysOnly query.
         */
        t.prototype.delete = function() {
            return jn(this.la.delete());
        }, t;
    }(), On = /** @class */ function(t) {
        function n(e) {
            var n = this;
            return (n = t.call(this, c.UNAVAILABLE, "IndexedDB transaction failed: " + e) || this).name = "IndexedDbTransactionError", 
            n;
        }
        return e.__extends(n, t), n;
    }(h);

    // V2 is no longer usable (see comment at top of file)
    // Visible for testing
    /**
     * Provides a wrapper around IndexedDb with a simplified interface that uses
     * Promise-like return values to chain operations. Real promises cannot be used
     * since .then() continuations are executed asynchronously (e.g. via
     * .setImmediate), which would cause IndexedDB to end the transaction.
     * See PersistencePromise for more details.
     */
    /** Verifies whether `e` is an IndexedDbTransactionError. */ function Un(t) {
        // Use name equality, as instanceof checks on errors don't work with errors
        // that wrap other errors.
        return "IndexedDbTransactionError" === t.name;
    }

    /**
     * Wraps an IDBTransaction and exposes a store() method to get a handle to a
     * specific object store.
     */ var Cn = /** @class */ function() {
        function t(t) {
            var e = this;
            this.transaction = t, this.aborted = !1, 
            /**
                 * A promise that resolves with the result of the IndexedDb transaction.
                 */
            this.Ea = new Le, this.transaction.oncomplete = function() {
                e.Ea.resolve();
            }, this.transaction.onabort = function() {
                t.error ? e.Ea.reject(new On(t.error)) : e.Ea.resolve();
            }, this.transaction.onerror = function(t) {
                var n = Fn(t.target.error);
                e.Ea.reject(new On(n));
            };
        }
        return t.open = function(e, n, r) {
            return new t(e.transaction(r, n));
        }, Object.defineProperty(t.prototype, "_a", {
            get: function() {
                return this.Ea.promise;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.abort = function(t) {
            t && this.Ea.reject(t), this.aborted || (le("SimpleDb", "Aborting transaction:", t ? t.message : "Client-initiated abort"), 
            this.aborted = !0, this.transaction.abort());
        }, 
        /**
         * Returns a SimpleDbStore<KeyType, ValueType> for the specified store. All
         * operations performed on the SimpleDbStore happen within the context of this
         * transaction and it cannot be used anymore once the transaction is
         * completed.
         *
         * Note that we can't actually enforce that the KeyType and ValueType are
         * correct, but they allow type safety through the rest of the consuming code.
         */
        t.prototype.store = function(t) {
            var e = this.transaction.objectStore(t);
            return new qn(e);
        }, t;
    }(), qn = /** @class */ function() {
        function t(t) {
            this.store = t;
        }
        return t.prototype.put = function(t, e) {
            var n;
            return void 0 !== e ? (le("SimpleDb", "PUT", this.store.name, t, e), n = this.store.put(e, t)) : (le("SimpleDb", "PUT", this.store.name, "<auto-key>", t), 
            n = this.store.put(t)), jn(n);
        }, 
        /**
         * Adds a new value into an Object Store and returns the new key. Similar to
         * IndexedDb's `add()`, this method will fail on primary key collisions.
         *
         * @param value The object to write.
         * @return The key of the value to add.
         */
        t.prototype.add = function(t) {
            return le("SimpleDb", "ADD", this.store.name, t, t), jn(this.store.add(t));
        }, 
        /**
         * Gets the object with the specified key from the specified store, or null
         * if no object exists with the specified key.
         *
         * @key The key of the object to get.
         * @return The object with the specified key or null if no object exists.
         */
        t.prototype.get = function(t) {
            var e = this;
            // We're doing an unsafe cast to ValueType.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return jn(this.store.get(t)).next((function(n) {
                // Normalize nonexistence to null.
                return void 0 === n && (n = null), le("SimpleDb", "GET", e.store.name, t, n), n;
            }));
        }, t.prototype.delete = function(t) {
            return le("SimpleDb", "DELETE", this.store.name, t), jn(this.store.delete(t));
        }, 
        /**
         * If we ever need more of the count variants, we can add overloads. For now,
         * all we need is to count everything in a store.
         *
         * Returns the number of rows in the store.
         */
        t.prototype.count = function() {
            return le("SimpleDb", "COUNT", this.store.name), jn(this.store.count());
        }, t.prototype.Fr = function(t, e) {
            var n = this.cursor(this.options(t, e)), r = [];
            return this.Ia(n, (function(t, e) {
                r.push(e);
            })).next((function() {
                return r;
            }));
        }, t.prototype.wa = function(t, e) {
            le("SimpleDb", "DELETE ALL", this.store.name);
            var n = this.options(t, e);
            n.Dh = !1;
            var r = this.cursor(n);
            return this.Ia(r, (function(t, e, n) {
                return n.delete();
            }));
        }, t.prototype.Ur = function(t, e) {
            var n;
            e ? n = t : (n = {}, e = t);
            var r = this.cursor(n);
            return this.Ia(r, e);
        }, 
        /**
         * Iterates over a store, but waits for the given callback to complete for
         * each entry before iterating the next entry. This allows the callback to do
         * asynchronous work to determine if this iteration should continue.
         *
         * The provided callback should return `true` to continue iteration, and
         * `false` otherwise.
         */
        t.prototype.Wo = function(t) {
            var e = this.cursor({});
            return new xe((function(n, r) {
                e.onerror = function(t) {
                    var e = Fn(t.target.error);
                    r(e);
                }, e.onsuccess = function(e) {
                    var r = e.target.result;
                    r ? t(r.primaryKey, r.value).next((function(t) {
                        t ? r.continue() : n();
                    })) : n();
                };
            }));
        }, t.prototype.Ia = function(t, e) {
            var n = [];
            return new xe((function(r, i) {
                t.onerror = function(t) {
                    i(t.target.error);
                }, t.onsuccess = function(t) {
                    var i = t.target.result;
                    if (i) {
                        var o = new Ln(i), s = e(i.primaryKey, i.value, o);
                        if (s instanceof xe) {
                            var u = s.catch((function(t) {
                                return o.done(), xe.reject(t);
                            }));
                            n.push(u);
                        }
                        o.Pn ? r() : null === o.Ta ? i.continue() : i.continue(o.Ta);
                    } else r();
                };
            })).next((function() {
                return xe.vn(n);
            }));
        }, t.prototype.options = function(t, e) {
            var n = void 0;
            return void 0 !== t && ("string" == typeof t ? n = t : e = t), {
                index: n,
                range: e
            };
        }, t.prototype.cursor = function(t) {
            var e = "next";
            if (t.reverse && (e = "prev"), t.index) {
                var n = this.store.index(t.index);
                return t.Dh ? n.openKeyCursor(t.range, e) : n.openCursor(t.range, e);
            }
            return this.store.openCursor(t.range, e);
        }, t;
    }();

    /**
     * A wrapper around an IDBObjectStore providing an API that:
     *
     * 1) Has generic KeyType / ValueType parameters to provide strongly-typed
     * methods for acting against the object store.
     * 2) Deals with IndexedDB's onsuccess / onerror event callbacks, making every
     * method return a PersistencePromise instead.
     * 3) Provides a higher-level API to avoid needing to do excessive wrapping of
     * intermediate IndexedDB types (IDBCursorWithValue, etc.)
     */
    /**
     * Wraps an IDBRequest in a PersistencePromise, using the onsuccess / onerror
     * handlers to resolve / reject the PersistencePromise as appropriate.
     */
    function jn(t) {
        return new xe((function(e, n) {
            t.onsuccess = function(t) {
                var n = t.target.result;
                e(n);
            }, t.onerror = function(t) {
                var e = Fn(t.target.error);
                n(e);
            };
        }));
    }

    // Guard so we only report the error once.
    var Mn = !1;

    function Fn(t) {
        var e = Vn.oa(i.getUA());
        if (e >= 12.2 && e < 13) {
            var n = "An internal error was encountered in the Indexed Database server";
            if (t.message.indexOf(n) >= 0) {
                // Wrap error in a more descriptive one.
                var r = new h("internal", "IOS_INDEXEDDB_BUG1: IndexedDb has thrown '" + n + "'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.");
                return Mn || (Mn = !0, 
                // Throw a global exception outside of this promise chain, for the user to
                // potentially catch.
                setTimeout((function() {
                    throw r;
                }), 0)), r;
            }
        }
        return t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents an operation scheduled to be run in the future on an AsyncQueue.
     *
     * It is created via DelayedOperation.createAndSchedule().
     *
     * Supports cancellation (via cancel()) and early execution (via skipDelay()).
     *
     * Note: We implement `PromiseLike` instead of `Promise`, as the `Promise` type
     * in newer versions of TypeScript defines `finally`, which is not available in
     * IE.
     */ var Bn = /** @class */ function() {
        function t(t, e, n, r, i) {
            this.Ra = t, this.Er = e, this.Aa = n, this.op = r, this.ma = i, this.Pa = new Le, 
            this.then = this.Pa.promise.then.bind(this.Pa.promise), 
            // It's normal for the deferred promise to be canceled (due to cancellation)
            // and so we attach a dummy catch callback to avoid
            // 'UnhandledPromiseRejectionWarning' log spam.
            this.Pa.promise.catch((function(t) {}))
            /**
         * Creates and returns a DelayedOperation that has been scheduled to be
         * executed on the provided asyncQueue after the provided delayMs.
         *
         * @param asyncQueue The queue to schedule the operation on.
         * @param id A Timer ID identifying the type of operation this is.
         * @param delayMs The delay (ms) before the operation should be scheduled.
         * @param op The operation to run.
         * @param removalCallback A callback to be called synchronously once the
         *   operation is executed or canceled, notifying the AsyncQueue to remove it
         *   from its delayedOperations list.
         *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
         *   the DelayedOperation class public.
         */;
        }
        return t.Va = function(e, n, r, i, o) {
            var s = new t(e, n, Date.now() + r, i, o);
            return s.start(r), s;
        }, 
        /**
         * Starts the timer. This is called immediately after construction by
         * createAndSchedule().
         */
        t.prototype.start = function(t) {
            var e = this;
            this.ga = setTimeout((function() {
                return e.pa();
            }), t);
        }, 
        /**
         * Queues the operation to run immediately (if it hasn't already been run or
         * canceled).
         */
        t.prototype.vr = function() {
            return this.pa();
        }, 
        /**
         * Cancels the operation if it hasn't already been executed or canceled. The
         * promise will be rejected.
         *
         * As long as the operation has not yet been run, calling cancel() provides a
         * guarantee that the operation will not be run.
         */
        t.prototype.cancel = function(t) {
            null !== this.ga && (this.clearTimeout(), this.Pa.reject(new h(c.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
        }, t.prototype.pa = function() {
            var t = this;
            this.Ra.co((function() {
                return null !== t.ga ? (t.clearTimeout(), t.op().then((function(e) {
                    return t.Pa.resolve(e);
                }))) : Promise.resolve();
            }));
        }, t.prototype.clearTimeout = function() {
            null !== this.ga && (this.ma(this), clearTimeout(this.ga), this.ga = null);
        }, t;
    }(), zn = /** @class */ function() {
        function t() {
            var t = this;
            // The last promise in the queue.
                    this.ya = Promise.resolve(), 
            // The last retryable operation. Retryable operation are run in order and
            // retried with backoff.
            this.ba = Promise.resolve(), 
            // Is this AsyncQueue being shut down? Once it is set to true, it will not
            // be changed again.
            this.va = !1, 
            // Operations scheduled to be queued in the future. Operations are
            // automatically removed after they are run or canceled.
            this.Sa = [], 
            // visible for testing
            this.Da = null, 
            // Flag set while there's an outstanding AsyncQueue operation, used for
            // assertion sanity-checks.
            this.Ca = !1, 
            // List of TimerIds to fast-forward delays for.
            this.Fa = [], 
            // Backoff timer used to schedule retries for retryable operations
            this.Na = new Oe(this, "async_queue_retry" /* AsyncQueueRetry */), 
            // Visibility handler that triggers an immediate retry of all retryable
            // operations. Meant to speed up recovery when we regain file system access
            // after page comes into foreground.
            this.ka = function() {
                return t.Na.br();
            };
            var e = ce.nt().window;
            e && "function" == typeof e.addEventListener && e.addEventListener("visibilitychange", this.ka);
        }
        return Object.defineProperty(t.prototype, "Ma", {
            // Is this AsyncQueue being shut down? If true, this instance will not enqueue
            // any new operations, Promises from enqueue requests will not resolve.
            get: function() {
                return this.va;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /**
         * Adds a new operation to the queue without waiting for it to complete (i.e.
         * we ignore the Promise result).
         */
        t.prototype.co = function(t) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.enqueue(t);
        }, 
        /**
         * Regardless if the queue has initialized shutdown, adds a new operation to the
         * queue without waiting for it to complete (i.e. we ignore the Promise result).
         */
        t.prototype.xa = function(t) {
            this.$a(), 
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.Oa(t);
        }, 
        /**
         * Regardless if the queue has initialized shutdown, adds a new operation to the
         * queue.
         */
        t.prototype.La = function(t) {
            return this.$a(), this.Oa(t);
        }, 
        /**
         * Adds a new operation to the queue and initialize the shut down of this queue.
         * Returns a promise that will be resolved when the promise returned by the new
         * operation is (with its value).
         * Once this method is called, the only possible way to request running an operation
         * is through `enqueueAndForgetEvenAfterShutdown`.
         */
        t.prototype.Ba = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.$a(), this.va ? [ 3 /*break*/ , 2 ] : (this.va = !0, (n = ce.nt().window) && n.removeEventListener("visibilitychange", this.ka), 
                        [ 4 /*yield*/ , this.La(t) ]);

                      case 1:
                        e.sent(), e.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Adds a new operation to the queue. Returns a promise that will be resolved
         * when the promise returned by the new operation is (with its value).
         */
        t.prototype.enqueue = function(t) {
            return this.$a(), this.va ? new Promise((function(t) {})) : this.Oa(t);
        }, 
        /**
         * Enqueue a retryable operation.
         *
         * A retryable operation is rescheduled with backoff if it fails with a
         * IndexedDbTransactionError (the error type used by SimpleDb). All
         * retryable operations are executed in order and only run if all prior
         * operations were retried successfully.
         */
        t.prototype.lo = function(t) {
            var n = this;
            this.$a(), this.va || (this.ba = this.ba.then((function() {
                var r = new Le, i = function() {
                    return e.__awaiter(n, void 0, void 0, (function() {
                        var n;
                        return e.__generator(this, (function(e) {
                            switch (e.label) {
                              case 0:
                                return e.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , t() ];

                              case 1:
                                return e.sent(), r.resolve(), this.Na.reset(), [ 3 /*break*/ , 3 ];

                              case 2:
                                if (!Un(n = e.sent())) throw r.resolve(), n;
                                // Failure will be handled by AsyncQueue
                                                            return le("AsyncQueue", "Operation failed with retryable error: " + n), 
                                this.Na.gr(i), [ 3 /*break*/ , 3 ];

                              case 3:
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }));
                };
                return n.co(i), r.promise;
            })));
        }, t.prototype.Oa = function(t) {
            var e = this, n = this.ya.then((function() {
                return e.Ca = !0, t().catch((function(t) {
                    // Re-throw the error so that this.tail becomes a rejected Promise and
                    // all further attempts to chain (via .then) will just short-circuit
                    // and return the rejected Promise.
                    throw e.Da = t, e.Ca = !1, pe("INTERNAL UNHANDLED ERROR: ", 
                    /**
     * Chrome includes Error.message in Error.stack. Other browsers do not.
     * This returns expected output of message + stack when available.
     * @param error Error or FirestoreError
     */
                    function(t) {
                        var e = t.message || "";
                        return t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack), 
                        e;
                    }(t)), t;
                })).then((function(t) {
                    return e.Ca = !1, t;
                }));
            }));
            return this.ya = n, n;
        }, 
        /**
         * Schedules an operation to be queued on the AsyncQueue once the specified
         * `delayMs` has elapsed. The returned DelayedOperation can be used to cancel
         * or fast-forward the operation prior to its running.
         */
        t.prototype.yr = function(t, e, n) {
            var r = this;
            this.$a(), 
            // Fast-forward delays for timerIds that have been overriden.
            this.Fa.indexOf(t) > -1 && (e = 0);
            var i = Bn.Va(this, t, e, n, (function(t) {
                return r.qa(t);
            }));
            return this.Sa.push(i), i;
        }, t.prototype.$a = function() {
            this.Da && ye();
        }, 
        /**
         * Verifies there's an operation currently in-progress on the AsyncQueue.
         * Unfortunately we can't verify that the running code is in the promise chain
         * of that operation, so this isn't a foolproof check, but it should be enough
         * to catch some bugs.
         */
        t.prototype.Ua = function() {}, 
        /**
         * Waits until all currently queued tasks are finished executing. Delayed
         * operations are not run.
         */
        t.prototype.Qa = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return [ 4 /*yield*/ , t = this.ya ];

                      case 1:
                        e.sent(), e.label = 2;

                      case 2:
                        if (t !== this.ya) return [ 3 /*break*/ , 0 ];
                        e.label = 3;

                      case 3:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * For Tests: Determine if a delayed operation with a particular TimerId
         * exists.
         */
        t.prototype.Wa = function(t) {
            for (var e = 0, n = this.Sa; e < n.length; e++) {
                if (n[e].Er === t) return !0;
            }
            return !1;
        }, 
        /**
         * For Tests: Runs some or all delayed operations early.
         *
         * @param lastTimerId Delayed operations up to and including this TimerId will
         *  be drained. Pass TimerId.All to run all delayed operations.
         * @returns a Promise that resolves once all operations have been run.
         */
        t.prototype.ja = function(t) {
            var e = this;
            // Note that draining may generate more delayed ops, so we do that first.
                    return this.Qa().then((function() {
                // Run ops in the same order they'd run if they ran naturally.
                e.Sa.sort((function(t, e) {
                    return t.Aa - e.Aa;
                }));
                for (var n = 0, r = e.Sa; n < r.length; n++) {
                    var i = r[n];
                    if (i.vr(), "all" /* All */ !== t && i.Er === t) break;
                }
                return e.Qa();
            }));
        }, 
        /**
         * For Tests: Skip all subsequent delays for a timer id.
         */
        t.prototype.Ka = function(t) {
            this.Fa.push(t);
        }, 
        /** Called once a DelayedOperation is run or canceled. */ t.prototype.qa = function(t) {
            // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
            var e = this.Sa.indexOf(t);
            this.Sa.splice(e, 1);
        }, t;
    }();

    /**
     * Returns a FirestoreError that can be surfaced to the user if the provided
     * error is an IndexedDbTransactionError. Re-throws the error otherwise.
     */
    function Gn(t, e) {
        if (pe("AsyncQueue", e + ": " + t), Un(t)) return new h(c.UNAVAILABLE, e + ": " + t);
        throw t;
    }

    function Wn(t, e) {
        var n = t[0], r = t[1], i = e[0], o = e[1], s = we(n, i);
        return 0 === s ? we(r, o) : s;
    }

    /**
     * Used to calculate the nth sequence number. Keeps a rolling buffer of the
     * lowest n values passed to `addElement`, and finally reports the largest of
     * them in `maxValue`.
     */ var Qn = /** @class */ function() {
        function t(t) {
            this.Ga = t, this.buffer = new Ot(Wn), this.za = 0;
        }
        return t.prototype.Ha = function() {
            return ++this.za;
        }, t.prototype.Ya = function(t) {
            var e = [ t, this.Ha() ];
            if (this.buffer.size < this.Ga) this.buffer = this.buffer.add(e); else {
                var n = this.buffer.last();
                Wn(e, n) < 0 && (this.buffer = this.buffer.delete(n).add(e));
            }
        }, Object.defineProperty(t.prototype, "maxValue", {
            get: function() {
                // Guaranteed to be non-empty. If we decide we are not collecting any
                // sequence numbers, nthSequenceNumber below short-circuits. If we have
                // decided that we are collecting n sequence numbers, it's because n is some
                // percentage of the existing sequence numbers. That means we should never
                // be in a situation where we are collecting sequence numbers but don't
                // actually have any.
                return this.buffer.last()[0];
            },
            enumerable: !0,
            configurable: !0
        }), t;
    }(), Kn = {
        Ja: !1,
        Xa: 0,
        Za: 0,
        tu: 0
    }, Yn = /** @class */ function() {
        function t(
        // When we attempt to collect, we will only do so if the cache size is greater than this
        // threshold. Passing `COLLECTION_DISABLED` here will cause collection to always be skipped.
        t, 
        // The percentage of sequence numbers that we will attempt to collect
        e, 
        // A cap on the total number of sequence numbers that will be collected. This prevents
        // us from collecting a huge number of sequence numbers if the cache has grown very large.
        n) {
            this.eu = t, this.su = e, this.iu = n;
        }
        return t.nu = function(e) {
            return new t(e, t.ru, t.hu);
        }, t;
    }();

    Yn.ou = -1, Yn.au = 1048576, Yn.uu = 41943040, Yn.ru = 10, Yn.hu = 1e3, Yn.cu = new Yn(Yn.uu, Yn.ru, Yn.hu), 
    Yn.DISABLED = new Yn(Yn.ou, 0, 0);

    /**
     * This class is responsible for the scheduling of LRU garbage collection. It handles checking
     * whether or not GC is enabled, as well as which delay to use before the next run.
     */
    var Jn = /** @class */ function() {
        function t(t, e) {
            this.$o = t, this.Ra = e, this._u = !1, this.lu = null;
        }
        return t.prototype.start = function(t) {
            this.$o.du.eu !== Yn.ou && this.fu(t);
        }, t.prototype.stop = function() {
            this.lu && (this.lu.cancel(), this.lu = null);
        }, Object.defineProperty(t.prototype, "ho", {
            get: function() {
                return null !== this.lu;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.fu = function(t) {
            var n = this, r = this._u ? 3e5 : 6e4;
            le("LruGarbageCollector", "Garbage collection scheduled in " + r + "ms"), this.lu = this.Ra.yr("lru_garbage_collection" /* LruGarbageCollection */ , r, (function() {
                return e.__awaiter(n, void 0, void 0, (function() {
                    var n;
                    return e.__generator(this, (function(e) {
                        switch (e.label) {
                          case 0:
                            this.lu = null, this._u = !0, e.label = 1;

                          case 1:
                            return e.trys.push([ 1, 3, , 7 ]), [ 4 /*yield*/ , t.Tu(this.$o) ];

                          case 2:
                            return e.sent(), [ 3 /*break*/ , 7 ];

                          case 3:
                            return Un(n = e.sent()) ? (le("LruGarbageCollector", "Ignoring IndexedDB error during garbage collection: ", n), 
                            [ 3 /*break*/ , 6 ]) : [ 3 /*break*/ , 4 ];

                          case 4:
                            return [ 4 /*yield*/ , Zn(n) ];

                          case 5:
                            e.sent(), e.label = 6;

                          case 6:
                            return [ 3 /*break*/ , 7 ];

                          case 7:
                            return [ 4 /*yield*/ , this.fu(t) ];

                          case 8:
                            return e.sent(), [ 2 /*return*/ ];
                        }
                    }));
                }));
            }));
        }, t;
    }(), Xn = /** @class */ function() {
        function t(t, e) {
            this.Eu = t, this.du = e
            /** Given a percentile of target to collect, returns the number of targets to collect. */;
        }
        return t.prototype.Iu = function(t, e) {
            return this.Eu.Oo(t).next((function(t) {
                return Math.floor(e / 100 * t);
            }));
        }, 
        /** Returns the nth sequence number, counting in order from the smallest. */ t.prototype.wu = function(t, e) {
            var n = this;
            if (0 === e) return xe.resolve(Ve.dr);
            var r = new Qn(e);
            return this.Eu.js(t, (function(t) {
                return r.Ya(t.sequenceNumber);
            })).next((function() {
                return n.Eu.Bo(t, (function(t) {
                    return r.Ya(t);
                }));
            })).next((function() {
                return r.maxValue;
            }));
        }, 
        /**
         * Removes targets with a sequence number equal to or less than the given upper bound, and removes
         * document associations with those targets.
         */
        t.prototype.Ah = function(t, e, n) {
            return this.Eu.Ah(t, e, n);
        }, 
        /**
         * Removes documents that have a sequence number equal to or less than the upper bound and are not
         * otherwise pinned.
         */
        t.prototype.jo = function(t, e) {
            return this.Eu.jo(t, e);
        }, t.prototype.Ru = function(t, e) {
            var n = this;
            return this.du.eu === Yn.ou ? (le("LruGarbageCollector", "Garbage collection skipped; disabled"), 
            xe.resolve(Kn)) : this.Go(t).next((function(r) {
                return r < n.du.eu ? (le("LruGarbageCollector", "Garbage collection skipped; Cache size " + r + " is lower than threshold " + n.du.eu), 
                Kn) : n.Au(t, e);
            }));
        }, t.prototype.Go = function(t) {
            return this.Eu.Go(t);
        }, t.prototype.Au = function(t, e) {
            var n, i, o, s, u, a, c, h = this, f = Date.now();
            return this.Iu(t, this.du.su).next((function(e) {
                // Cap at the configured max
                return e > h.du.iu ? (le("LruGarbageCollector", "Capping sequence numbers to collect down to the maximum of " + h.du.iu + " from " + e), 
                i = h.du.iu) : i = e, s = Date.now(), h.wu(t, i);
            })).next((function(r) {
                return n = r, u = Date.now(), h.Ah(t, n, e);
            })).next((function(e) {
                return o = e, a = Date.now(), h.jo(t, n);
            })).next((function(t) {
                return c = Date.now(), fe() <= r.LogLevel.DEBUG && le("LruGarbageCollector", "LRU Garbage Collection\n\tCounted targets in " + (s - f) + "ms\n\tDetermined least recently used " + i + " in " + (u - s) + "ms\n\tRemoved " + o + " targets in " + (a - u) + "ms\n\tRemoved " + t + " documents in " + (c - a) + "ms\nTotal Duration: " + (c - f) + "ms"), 
                xe.resolve({
                    Ja: !0,
                    Xa: i,
                    Za: o,
                    tu: t
                });
            }));
        }, t;
    }(), Hn = /** @class */ function() {
        function t(
        /** Manages our in-memory or durable persistence. */
        t, e, n) {
            this.persistence = t, this.mu = e, 
            /**
                 * Maps a targetID to data about its target.
                 *
                 * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
                 * of `applyRemoteEvent()` idempotent.
                 */
            this.Pu = new Pt(we), 
            /** Maps a target to its targetID. */
            // TODO(wuandy): Evaluate if TargetId can be part of Target.
            this.Vu = new Ie((function(t) {
                return t.canonicalId();
            })), 
            /**
                 * The read time of the last entry processed by `getNewDocumentChanges()`.
                 *
                 * PORTING NOTE: This is only used for multi-tab synchronization.
                 */
            this.gu = g.min(), this.Wn = t.Do(n), this.pu = t.No(), this.Jh = t.Fo(), this.yu = new ke(this.pu, this.Wn, this.persistence.ko()), 
            this.mu.bu(this.yu)
            /** Starts the LocalStore. */;
        }
        return t.prototype.start = function() {
            return Promise.resolve();
        }, 
        /**
         * Tells the LocalStore that the currently authenticated user has changed.
         *
         * In response the local store switches the mutation queue to the new user and
         * returns any resulting document changes.
         */
        // PORTING NOTE: Android and iOS only return the documents affected by the
        // change.
        t.prototype.vu = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return n = this.Wn, r = this.yu, [ 4 /*yield*/ , this.persistence.runTransaction("Handle user change", "readonly", (function(e) {
                            // Swap out the mutation queue, grabbing the pending mutation batches
                            // before and after.
                            var i;
                            return o.Wn.ea(e).next((function(s) {
                                return i = s, n = o.persistence.Do(t), 
                                // Recreate our LocalDocumentsView using the new
                                // MutationQueue.
                                r = new ke(o.pu, n, o.persistence.ko()), n.ea(e);
                            })).next((function(t) {
                                for (var n = [], o = [], s = Gt(), u = 0, a = i
                                // Union the old/new changed keys.
                                ; u < a.length; u++) {
                                    var c = a[u];
                                    n.push(c.batchId);
                                    for (var h = 0, f = c.mutations; h < f.length; h++) {
                                        var l = f[h];
                                        s = s.add(l.key);
                                    }
                                }
                                for (var p = 0, d = t; p < d.length; p++) {
                                    var y = d[p];
                                    o.push(y.batchId);
                                    for (var v = 0, g = y.mutations; v < g.length; v++) {
                                        var m = g[v];
                                        s = s.add(m.key);
                                    }
                                }
                                // Return the set of all (potentially) changed documents and the list
                                // of mutation batch IDs that were affected by change.
                                                            return r.Yn(e, s).next((function(t) {
                                    return {
                                        Su: t,
                                        Du: n,
                                        Cu: o
                                    };
                                }));
                            }));
                        })) ];

                      case 1:
                        return i = e.sent(), [ 2 /*return*/ , (this.Wn = n, this.yu = r, this.mu.bu(this.yu), 
                        i) ];
                    }
                }));
            }));
        }, 
        /* Accept locally generated Mutations and commit them to storage. */ t.prototype.Fu = function(t) {
            var e, n = this, r = v.now(), i = t.reduce((function(t, e) {
                return t.add(e.key);
            }), Gt());
            return this.persistence.runTransaction("Locally write mutations", "readwrite", (function(o) {
                return n.yu.Yn(o, i).next((function(i) {
                    e = i;
                    for (
                    // For non-idempotent mutations (such as `FieldValue.increment()`),
                    // we record the base state in a separate patch mutation. This is
                    // later used to guarantee consistent values and prevents flicker
                    // even if the backend sends us an update that already includes our
                    // transform.
                    var s = [], u = 0, a = t; u < a.length; u++) {
                        var c = a[u], h = c.Pt(e.get(c.key));
                        null != h && 
                        // NOTE: The base state should only be applied if there's some
                        // existing document to override, so use a Precondition of
                        // exists=true
                        s.push(new ot(c.key, h, ft(h.proto.mapValue), nt.exists(!0)));
                    }
                    return n.Wn.Yo(o, r, s, t);
                }));
            })).then((function(t) {
                var n = t.In(e);
                return {
                    batchId: t.batchId,
                    Dn: n
                };
            }));
        }, 
        /**
         * Acknowledge the given batch.
         *
         * On the happy path when a batch is acknowledged, the local store will
         *
         *  + remove the batch from the mutation queue;
         *  + apply the changes to the remote document cache;
         *  + recalculate the latency compensated view implied by those changes (there
         *    may be mutations in the queue that affect the documents but haven't been
         *    acknowledged yet); and
         *  + give the changed documents back the sync engine
         *
         * @returns The resulting (modified) documents.
         */
        t.prototype.Nu = function(t) {
            var e = this;
            return this.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (function(n) {
                var r = t.batch.keys(), i = e.pu.Yr({
                    Xr: !0
                });
                return e.ku(n, t, i).next((function() {
                    return i.apply(n);
                })).next((function() {
                    return e.Wn.ra(n);
                })).next((function() {
                    return e.yu.Yn(n, r);
                }));
            }));
        }, 
        /**
         * Remove mutations from the MutationQueue for the specified batch;
         * LocalDocuments will be recalculated.
         *
         * @returns The resulting modified documents.
         */
        t.prototype.Mu = function(t) {
            var e = this;
            return this.persistence.runTransaction("Reject batch", "readwrite-primary", (function(n) {
                var r;
                return e.Wn.Jo(n, t).next((function(t) {
                    return ve(null !== t), r = t.keys(), e.Wn.ia(n, t);
                })).next((function() {
                    return e.Wn.ra(n);
                })).next((function() {
                    return e.yu.Yn(n, r);
                }));
            }));
        }, 
        /**
         * Returns the largest (latest) batch id in mutation queue that is pending server response.
         * Returns `BATCHID_UNKNOWN` if the queue is empty.
         */
        t.prototype.ta = function() {
            var t = this;
            return this.persistence.runTransaction("Get highest unacknowledged batch id", "readonly", (function(e) {
                return t.Wn.ta(e);
            }));
        }, 
        /**
         * Returns the last consistent snapshot processed (used by the RemoteStore to
         * determine whether to buffer incoming snapshots from the backend).
         */
        t.prototype._h = function() {
            var t = this;
            return this.persistence.runTransaction("Get last remote snapshot version", "readonly", (function(e) {
                return t.Jh._h(e);
            }));
        }, 
        /**
         * Update the "ground-state" (remote) documents. We assume that the remote
         * event reflects any write batches that have been acknowledged or rejected
         * (i.e. we do not re-apply local mutations to updates from this event).
         *
         * LocalDocuments are re-calculated if there are remaining mutations in the
         * queue.
         */
        t.prototype.xu = function(e) {
            var n = this, r = e.Ee, i = this.Pu;
            return this.persistence.runTransaction("Apply remote event", "readwrite-primary", (function(o) {
                var s = n.pu.Yr({
                    Xr: !0
                });
                // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                            i = n.Pu;
                var u = [];
                e.as.forEach((function(e, s) {
                    var a = i.get(s);
                    if (a) {
                        // Only update the remote keys if the target is still active. This
                        // ensures that we can persist the updated target data along with
                        // the updated assignment.
                        u.push(n.Jh.bh(o, e.Is, s).next((function() {
                            return n.Jh.ph(o, e.Ts, s);
                        })));
                        var c = e.resumeToken;
                        // Update the resume token if the change includes one.
                                            if (c.rt() > 0) {
                            var h = a.we(c, r).Ie(o.Oh);
                            i = i.Ae(s, h), 
                            // Update the target data if there are target changes (or if
                            // sufficient time has passed since the last update).
                            t.$u(a, h, e) && u.push(n.Jh.Ih(o, h));
                        }
                    }
                }));
                var a = qt(), c = Gt();
                // HACK: The only reason we allow a null snapshot version is so that we
                // can synthesize remote events when we get permission denied errors while
                // trying to resolve the state of a locally cached document that is in
                // limbo.
                            if (e.cs.forEach((function(t, e) {
                    c = c.add(t);
                })), 
                // Each loop iteration only affects its "own" doc, so it's safe to get all the remote
                // documents in advance in a single call.
                u.push(s.getEntries(o, c).next((function(t) {
                    e.cs.forEach((function(i, c) {
                        var h = t.get(i);
                        // Note: The order of the steps below is important, since we want
                        // to ensure that rejected limbo resolutions (which fabricate
                        // NoDocuments with SnapshotVersion.min()) never add documents to
                        // cache.
                                            c instanceof vt && c.version.isEqual(g.min()) ? (
                        // NoDocuments with SnapshotVersion.min() are used in manufactured
                        // events. We remove these documents from cache since we lost
                        // access.
                        s.Mn(i, r), a = a.Ae(i, c)) : null == h || c.version.S(h.version) > 0 || 0 === c.version.S(h.version) && h.hasPendingWrites ? (s.Nn(c, r), 
                        a = a.Ae(i, c)) : le("LocalStore", "Ignoring outdated watch update for ", i, ". Current version:", h.version, " Watch version:", c.version), 
                        e._s.has(i) && u.push(n.persistence.hh.Ko(o, i));
                    }));
                }))), !r.isEqual(g.min())) {
                    var h = n.Jh._h(o).next((function(t) {
                        return n.Jh.dh(o, o.Oh, r);
                    }));
                    u.push(h);
                }
                return xe.vn(u).next((function() {
                    return s.apply(o);
                })).next((function() {
                    return n.yu.Jn(o, a);
                }));
            })).then((function(t) {
                return n.Pu = i, t;
            }));
        }, 
        /**
         * Returns true if the newTargetData should be persisted during an update of
         * an active target. TargetData should always be persisted when a target is
         * being released and should not call this function.
         *
         * While the target is active, TargetData updates can be omitted when nothing
         * about the target has changed except metadata like the resume token or
         * snapshot version. Occasionally it's worth the extra write to prevent these
         * values from getting too stale after a crash, but this doesn't have to be
         * too frequent.
         */
        t.$u = function(t, e, n) {
            // Always persist target data if we don't already have a resume token.
            return ve(e.resumeToken.rt() > 0), 0 === t.resumeToken.rt() || (
            // Don't allow resume token changes to be buffered indefinitely. This
            // allows us to be reasonably up-to-date after a crash and avoids needing
            // to loop over all active queries on shutdown. Especially in the browser
            // we may not get time to do anything interesting while the current tab is
            // closing.
            e.Ee.D() - t.Ee.D() >= this.Ou || n.Ts.size + n.Es.size + n.Is.size > 0);
        }, 
        /**
         * Notify local store of the changed views to locally pin documents.
         */
        t.prototype.Lu = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o, s, u, a, c, h = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return e.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , this.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (function(e) {
                            return xe.forEach(t, (function(t) {
                                return xe.forEach(t.hr, (function(n) {
                                    return h.persistence.hh.yh(e, t.targetId, n);
                                })).next((function() {
                                    return xe.forEach(t.or, (function(n) {
                                        return h.persistence.hh.vh(e, t.targetId, n);
                                    }));
                                }));
                            }));
                        })) ];

                      case 1:
                        return e.sent(), [ 3 /*break*/ , 3 ];

                      case 2:
                        if (!Un(n = e.sent())) throw n;
                        // If `notifyLocalViewChanges` fails, we did not advance the sequence
                        // number for the documents that were included in this transaction.
                        // This might trigger them to be deleted earlier than they otherwise
                        // would have, but it should not invalidate the integrity of the data.
                                            return le("LocalStore", "Failed to update sequence numbers: " + n), 
                        [ 3 /*break*/ , 3 ];

                      case 3:
                        for (r = 0, i = t; r < i.length; r++) o = i[r], s = o.targetId, o.fromCache || (u = this.Pu.get(s), 
                        a = u.Ee, c = u.Re(a), 
                        // Advance the last limbo free snapshot version
                        this.Pu = this.Pu.Ae(s, c));
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Gets the mutation batch after the passed in batchId in the mutation queue
         * or null if empty.
         * @param afterBatchId If provided, the batch to search after.
         * @returns The next mutation or null if there wasn't one.
         */
        t.prototype.Bu = function(t) {
            var e = this;
            return this.persistence.runTransaction("Get next mutation batch", "readonly", (function(n) {
                return void 0 === t && (t = -1), e.Wn.Zo(n, t);
            }));
        }, 
        /**
         * Read the current value of a Document with a given key or null if not
         * found - used for testing.
         */
        t.prototype.qu = function(t) {
            var e = this;
            return this.persistence.runTransaction("read document", "readonly", (function(n) {
                return e.yu.Kn(n, t);
            }));
        }, 
        /**
         * Assigns the given target an internal ID so that its results can be pinned so
         * they don't get GC'd. A target must be allocated in the local store before
         * the store can be used to manage its view.
         *
         * Allocating an already allocated `Target` will return the existing `TargetData`
         * for that `Target`.
         */
        t.prototype.Uu = function(t) {
            var e = this;
            return this.persistence.runTransaction("Allocate target", "readwrite", (function(n) {
                var r;
                return e.Jh.gh(n, t).next((function(i) {
                    return i ? (
                    // This target has been listened to previously, so reuse the
                    // previous targetID.
                    // TODO(mcg): freshen last accessed date?
                    r = i, xe.resolve(r)) : e.Jh.oh(n).next((function(i) {
                        return r = new Dt(t, i, 0 /* Listen */ , n.Oh), e.Jh.fh(n, r).next((function() {
                            return r;
                        }));
                    }));
                }));
            })).then((function(n) {
                // If Multi-Tab is enabled, the existing target data may be newer than
                // the in-memory data
                var r = e.Pu.get(n.targetId);
                return (null === r || n.Ee.S(r.Ee) > 0) && (e.Pu = e.Pu.Ae(n.targetId, n), e.Vu.set(t, n.targetId)), 
                n;
            }));
        }, 
        /**
         * Returns the TargetData as seen by the LocalStore, including updates that may
         * have not yet been persisted to the TargetCache.
         */
        // Visible for testing.
        t.prototype.gh = function(t, e) {
            var n = this.Vu.get(e);
            return void 0 !== n ? xe.resolve(this.Pu.get(n)) : this.Jh.gh(t, e);
        }, 
        /**
         * Unpin all the documents associated with the given target. If
         * `keepPersistedTargetData` is set to false and Eager GC enabled, the method
         * directly removes the associated target data from the target cache.
         *
         * Releasing a non-existing `Target` is a no-op.
         */
        // PORTING NOTE: `keepPersistedTargetData` is multi-tab only.
        t.prototype.Qu = function(t, e) {
            var n = this, r = this.Pu.get(t), i = e ? "readwrite" : "readwrite-primary";
            return this.persistence.runTransaction("Release target", i, (function(t) {
                return e ? xe.resolve() : n.persistence.hh.removeTarget(t, r);
            })).then((function() {
                n.Pu = n.Pu.remove(t), n.Vu.delete(r.target);
            }));
        }, 
        /**
         * Runs the specified query against the local store and returns the results,
         * potentially taking advantage of query data from previous executions (such
         * as the set of remote keys).
         *
         * @param usePreviousResults Whether results from previous executions can
         * be used to optimize this query execution.
         */
        t.prototype.Wu = function(t, e) {
            var n = this, r = g.min(), i = Gt();
            return this.persistence.runTransaction("Execute query", "readonly", (function(o) {
                return n.gh(o, t.ee()).next((function(t) {
                    if (t) return r = t.lastLimboFreeSnapshotVersion, n.Jh.Sh(o, t.targetId).next((function(t) {
                        i = t;
                    }));
                })).next((function() {
                    return n.mu.Zn(o, t, e ? r : g.min(), e ? i : Gt());
                })).next((function(t) {
                    return {
                        documents: t,
                        ju: i
                    };
                }));
            }));
        }, t.prototype.ku = function(t, e, n) {
            var r = this, i = e.batch, o = i.keys(), s = xe.resolve();
            return o.forEach((function(r) {
                s = s.next((function() {
                    return n.xn(t, r);
                })).next((function(t) {
                    var o = t, s = e.Rn.get(r);
                    ve(null !== s), (!o || o.version.S(s) < 0) && ((o = i.at(r, o, e)) && 
                    // We use the commitVersion as the readTime rather than the
                    // document's updateTime since the updateTime is not advanced
                    // for updates that do not modify the underlying document.
                    n.Nn(o, e.wn));
                }));
            })), s.next((function() {
                return r.Wn.ia(t, i);
            }));
        }, t.prototype.Tu = function(t) {
            var e = this;
            return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (function(n) {
                return t.Ru(n, e.Pu);
            }));
        }, t;
    }();

    /** Implements the steps for LRU garbage collection. */
    /**
     * The maximum time to leave a resume token buffered without writing it out.
     * This value is arbitrary: it's long enough to avoid several writes
     * (possibly indefinitely if updates come more frequently than this) but
     * short enough that restarting after crashing will still have a pretty
     * recent resume token.
     */
    Hn.Ou = 3e8;

    /**
     * An implementation of LocalStore that provides additional functionality
     * for MultiTabSyncEngine.
     */
    // PORTING NOTE: Web only.
    var $n = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this, e, n, r) || this).persistence = e, i.Wn = e.Do(r), i.pu = e.No(), 
            i.Jh = e.Fo(), i;
        }
        /** Starts the LocalStore. */    return e.__extends(n, t), n.prototype.start = function() {
            return this.Ku();
        }, 
        /** Returns the local view of the documents affected by a mutation batch. */ n.prototype.Gu = function(t) {
            var e = this;
            return this.persistence.runTransaction("Lookup mutation documents", "readonly", (function(n) {
                return e.Wn.Xo(n, t).next((function(t) {
                    return t ? e.yu.Yn(n, t) : xe.resolve(null);
                }));
            }));
        }, n.prototype.zu = function(t) {
            this.Wn.na(t);
        }, n.prototype.uo = function(t) {
            this.persistence.uo(t);
        }, n.prototype.So = function() {
            return this.persistence.So();
        }, n.prototype.Hu = function(t) {
            var e = this, n = this.Pu.get(t);
            return n ? Promise.resolve(n.target) : this.persistence.runTransaction("Get target data", "readonly", (function(n) {
                return e.Jh.si(n, t).next((function(t) {
                    return t ? t.target : null;
                }));
            }));
        }, 
        /**
         * Returns the set of documents that have been updated since the last call.
         * If this is the first call, returns the set of changes since client
         * initialization. Further invocations will return document changes since
         * the point of rejection.
         */
        n.prototype.Kr = function() {
            var t = this;
            return this.persistence.runTransaction("Get new document changes", "readonly", (function(e) {
                return t.pu.Kr(e, t.gu);
            })).then((function(e) {
                var n = e.Gr, r = e.readTime;
                return t.gu = r, n;
            }));
        }, 
        /**
         * Reads the newest document change from persistence and forwards the internal
         * synchronization marker so that calls to `getNewDocumentChanges()`
         * only return changes that happened after client initialization.
         */
        n.prototype.Ku = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t, n = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return t = this, [ 4 /*yield*/ , this.persistence.runTransaction("Synchronize last document change read time", "readonly", (function(t) {
                            return n.pu.Hr(t);
                        })) ];

                      case 1:
                        return t.gu = e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, n;
    }(Hn);

    /**
     * Verifies the error thrown by a LocalStore operation. If a LocalStore
     * operation fails because the primary lease has been taken by another client,
     * we ignore the error (the persistence layer will immediately call
     * `applyPrimaryLease` to propagate the primary state change). All other errors
     * are re-thrown.
     *
     * @param err An error returned by a LocalStore operation.
     * @return A Promise that resolves after we recovered, or the original error.
     */ function Zn(t) {
        return e.__awaiter(this, void 0, void 0, (function() {
            return e.__generator(this, (function(e) {
                if (t.code !== c.FAILED_PRECONDITION || t.message !== Se) throw t;
                return le("LocalStore", "Unexpectedly lost primary lease"), [ 2 /*return*/ ];
            }));
        }));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A collection of references to a document from some kind of numbered entity
     * (either a target ID or batch ID). As references are added to or removed from
     * the set corresponding events are emitted to a registered garbage collector.
     *
     * Each reference is represented by a DocumentReference object. Each of them
     * contains enough information to uniquely identify the reference. They are all
     * stored primarily in a set sorted by key. A document is considered garbage if
     * there's no references in that set (this can be efficiently checked thanks to
     * sorting by key).
     *
     * ReferenceSet also keeps a secondary set that contains references sorted by
     * IDs. This one is used to efficiently implement removal of all references by
     * some target ID.
     */ var tr = /** @class */ function() {
        function t() {
            // A set of outstanding references to a document sorted by key.
            this.Yu = new Ot(er.Ju), 
            // A set of outstanding references to a document sorted by target id.
            this.Xu = new Ot(er.Zu)
            /** Returns true if the reference set contains no references. */;
        }
        return t.prototype.B = function() {
            return this.Yu.B();
        }, 
        /** Adds a reference to the given document key for the given ID. */ t.prototype.yh = function(t, e) {
            var n = new er(t, e);
            this.Yu = this.Yu.add(n), this.Xu = this.Xu.add(n);
        }, 
        /** Add references to the given document keys for the given ID. */ t.prototype.tc = function(t, e) {
            var n = this;
            t.forEach((function(t) {
                return n.yh(t, e);
            }));
        }, 
        /**
         * Removes a reference to the given document key for the given
         * ID.
         */
        t.prototype.vh = function(t, e) {
            this.ec(new er(t, e));
        }, t.prototype.sc = function(t, e) {
            var n = this;
            t.forEach((function(t) {
                return n.vh(t, e);
            }));
        }, 
        /**
         * Clears all references with a given ID. Calls removeRef() for each key
         * removed.
         */
        t.prototype.ic = function(t) {
            var e = this, n = b.EMPTY, r = new er(n, t), i = new er(n, t + 1), o = [];
            return this.Xu.Ke([ r, i ], (function(t) {
                e.ec(t), o.push(t.key);
            })), o;
        }, t.prototype.nc = function() {
            var t = this;
            this.Yu.forEach((function(e) {
                return t.ec(e);
            }));
        }, t.prototype.ec = function(t) {
            this.Yu = this.Yu.delete(t), this.Xu = this.Xu.delete(t);
        }, t.prototype.rc = function(t) {
            var e = b.EMPTY, n = new er(e, t), r = new er(e, t + 1), i = Gt();
            return this.Xu.Ke([ n, r ], (function(t) {
                i = i.add(t.key);
            })), i;
        }, t.prototype.Ch = function(t) {
            var e = new er(t, 0), n = this.Yu.ze(e);
            return null !== n && t.isEqual(n.key);
        }, t;
    }(), er = /** @class */ function() {
        function t(t, e) {
            this.key = t, this.hc = e
            /** Compare by key then by ID */;
        }
        return t.Ju = function(t, e) {
            return b.N(t.key, e.key) || we(t.hc, e.hc);
        }, 
        /** Compare by ID then by key */ t.Zu = function(t, e) {
            return we(t.hc, e.hc) || b.N(t.key, e.key);
        }, t;
    }();

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Validates that no arguments were passed in the invocation of functionName.
     *
     * Forward the magic "arguments" variable as second parameter on which the
     * parameter validation is performed:
     * validateNoArgs('myFunction', arguments);
     */
    function nr(t, e) {
        if (0 !== e.length) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() does not support arguments, but was called with " + Er(e.length, "argument") + ".");
    }

    /**
     * Validates the invocation of functionName has the exact number of arguments.
     *
     * Forward the magic "arguments" variable as second parameter on which the
     * parameter validation is performed:
     * validateExactNumberOfArgs('myFunction', arguments, 2);
     */ function rr(t, e, n) {
        if (e.length !== n) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires " + Er(n, "argument") + ", but was called with " + Er(e.length, "argument") + ".");
    }

    /**
     * Validates the invocation of functionName has at least the provided number of
     * arguments (but can have many more).
     *
     * Forward the magic "arguments" variable as second parameter on which the
     * parameter validation is performed:
     * validateAtLeastNumberOfArgs('myFunction', arguments, 2);
     */ function ir(t, e, n) {
        if (e.length < n) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires at least " + Er(n, "argument") + ", but was called with " + Er(e.length, "argument") + ".");
    }

    /**
     * Validates the invocation of functionName has number of arguments between
     * the values provided.
     *
     * Forward the magic "arguments" variable as second parameter on which the
     * parameter validation is performed:
     * validateBetweenNumberOfArgs('myFunction', arguments, 2, 3);
     */ function or(t, e, n, r) {
        if (e.length < n || e.length > r) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires between " + n + " and " + r + " arguments, but was called with " + Er(e.length, "argument") + ".");
    }

    /**
     * Validates the provided argument is an array and has as least the expected
     * number of elements.
     */
    /**
     * Validates the provided positional argument has the native JavaScript type
     * using typeof checks.
     */ function sr(t, e, n, r) {
        lr(t, e, wr(n) + " argument", r);
    }

    /**
     * Validates the provided argument has the native JavaScript type using
     * typeof checks or is undefined.
     */ function ur(t, e, n, r) {
        void 0 !== r && sr(t, e, n, r);
    }

    /**
     * Validates the provided named option has the native JavaScript type using
     * typeof checks.
     */ function ar(t, e, n, r) {
        lr(t, e, n + " option", r);
    }

    /**
     * Validates the provided named option has the native JavaScript type using
     * typeof checks or is undefined.
     */ function cr(t, e, n, r) {
        void 0 !== r && ar(t, e, n, r);
    }

    /**
     * Validates that the provided named option equals one of the expected values.
     */
    /**
     * Validates that the provided named option equals one of the expected values or
     * is undefined.
     */
    function hr(t, e, n, r, i) {
        void 0 !== r && function(t, e, n, r, i) {
            for (var o = [], s = 0, u = i; s < u.length; s++) {
                var a = u[s];
                if (a === r) return;
                o.push(dr(a));
            }
            var f = dr(r);
            throw new h(c.INVALID_ARGUMENT, "Invalid value " + f + " provided to function " + t + '() for option "' + n + '". Acceptable values: ' + o.join(", "));
        }(t, 0, n, r, i);
    }

    /**
     * Validates that the provided argument is a valid enum.
     *
     * @param functionName Function making the validation call.
     * @param enums Array containing all possible values for the enum.
     * @param position Position of the argument in `functionName`.
     * @param argument Argument to validate.
     * @return The value as T if the argument can be converted.
     */ function fr(t, e, n, r) {
        if (!e.some((function(t) {
            return t === r;
        }))) throw new h(c.INVALID_ARGUMENT, "Invalid value " + dr(r) + " provided to function " + t + "() for its " + wr(n) + " argument. Acceptable values: " + e.join(", "));
        return r;
    }

    /** Helper to validate the type of a provided input. */ function lr(t, e, n, r) {
        if (!("object" === e ? pr(r) : "non-empty string" === e ? "string" == typeof r && "" !== r : typeof r === e)) {
            var i = dr(r);
            throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires its " + n + " to be of type " + e + ", but it was: " + i);
        }
    }

    /**
     * Returns true if it's a non-null object without a custom prototype
     * (i.e. excludes Array, Date, etc.).
     */ function pr(t) {
        return "object" == typeof t && null !== t && (Object.getPrototypeOf(t) === Object.prototype || null === Object.getPrototypeOf(t));
    }

    /** Returns a string describing the type / value of the provided input. */ function dr(t) {
        if (void 0 === t) return "undefined";
        if (null === t) return "null";
        if ("string" == typeof t) return t.length > 20 && (t = t.substring(0, 20) + "..."), 
        JSON.stringify(t);
        if ("number" == typeof t || "boolean" == typeof t) return "" + t;
        if ("object" == typeof t) {
            if (t instanceof Array) return "an array";
            var e = 
            /** Hacky method to try to get the constructor name for an object. */
            function(t) {
                if (t.constructor) {
                    var e = /function\s+([^\s(]+)\s*\(/.exec(t.constructor.toString());
                    if (e && e.length > 1) return e[1];
                }
                return null;
            }(t);
            return e ? "a custom " + e + " object" : "an object";
        }
        return "function" == typeof t ? "a function" : ye();
    }

    function yr(t, e, n) {
        if (void 0 === n) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires a valid " + wr(e) + " argument, but it was undefined.");
    }

    /**
     * Validates the provided positional argument is an object, and its keys and
     * values match the expected keys and types provided in optionTypes.
     */ function vr(t, e, n) {
        I(e, (function(e, r) {
            if (n.indexOf(e) < 0) throw new h(c.INVALID_ARGUMENT, "Unknown option '" + e + "' passed to function " + t + "(). Available options: " + n.join(", "));
        }));
    }

    /**
     * Helper method to throw an error that the provided argument did not pass
     * an instanceof check.
     */ function gr(t, e, n, r) {
        var i = dr(r);
        return new h(c.INVALID_ARGUMENT, "Function " + t + "() requires its " + wr(n) + " argument to be a " + e + ", but it was: " + i);
    }

    function mr(t, e, n) {
        if (n <= 0) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires its " + wr(e) + " argument to be a positive number, but it was: " + n + ".");
    }

    /** Converts a number to its english word representation */ function wr(t) {
        switch (t) {
          case 1:
            return "first";

          case 2:
            return "second";

          case 3:
            return "third";

          default:
            return t + "th";
        }
    }

    /**
     * Formats the given word as plural conditionally given the preceding number.
     */ function Er(t, e) {
        return t + " " + e + (1 === t ? "" : "s");
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Helper function to assert Uint8Array is available at runtime. */ function _r() {
        if ("undefined" == typeof Uint8Array) throw new h(c.UNIMPLEMENTED, "Uint8Arrays are not available in this environment.");
    }

    /** Helper function to assert Base64 functions are available at runtime. */ function br() {
        if (!ce.nt().oc) throw new h(c.UNIMPLEMENTED, "Blobs are unavailable in Firestore in this environment.");
    }

    /**
     * Immutable class holding a blob (binary data).
     * This class is directly exposed in the public API.
     *
     * Note that while you can't hide the constructor in JavaScript code, we are
     * using the hack above to make sure no-one outside this module can call it.
     */ var Tr = /** @class */ function() {
        function t(t) {
            br(), this.ac = t;
        }
        return t.fromBase64String = function(e) {
            rr("Blob.fromBase64String", arguments, 1), sr("Blob.fromBase64String", "string", 1, e), 
            br();
            try {
                return new t(A.fromBase64String(e));
            } catch (e) {
                throw new h(c.INVALID_ARGUMENT, "Failed to construct Blob from Base64 string: " + e);
            }
        }, t.fromUint8Array = function(e) {
            if (rr("Blob.fromUint8Array", arguments, 1), _r(), !(e instanceof Uint8Array)) throw gr("Blob.fromUint8Array", "Uint8Array", 1, e);
            return new t(A.fromUint8Array(e));
        }, t.prototype.toBase64 = function() {
            return rr("Blob.toBase64", arguments, 0), br(), this.ac.toBase64();
        }, t.prototype.toUint8Array = function() {
            return rr("Blob.toUint8Array", arguments, 0), _r(), this.ac.toUint8Array();
        }, t.prototype.toString = function() {
            return "Blob(base64: " + this.toBase64() + ")";
        }, t.prototype.isEqual = function(t) {
            return this.ac.isEqual(t.ac);
        }, t;
    }(), Ir = function(t) {
        !function(t, e, n, r) {
            if (!(e instanceof Array) || e.length < 1) throw new h(c.INVALID_ARGUMENT, "Function FieldPath() requires its fieldNames argument to be an array with at least " + Er(1, "element") + ".");
        }(0, t);
        for (var e = 0; e < t.length; ++e) if (sr("FieldPath", "string", e, t[e]), 0 === t[e].length) throw new h(c.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
        this.uc = new _(t);
    }, Nr = /** @class */ function(t) {
        /**
         * Creates a FieldPath from the provided field names. If more than one field
         * name is provided, the path will point to a nested field in a document.
         *
         * @param fieldNames A list of field names.
         */
        function n() {
            for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
            return t.call(this, e) || this;
        }
        return e.__extends(n, t), n.documentId = function() {
            return n.cc;
        }, n.prototype.isEqual = function(t) {
            if (!(t instanceof n)) throw gr("isEqual", "FieldPath", 1, t);
            return this.uc.isEqual(t.uc);
        }, n;
    }(Ir);

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The objects that are a part of this API are exposed to third-parties as
    // compiled javascript so we want to flag our private members with a leading
    // underscore to discourage their use.
    /**
     * A field class base class that is shared by the lite, full and legacy SDK,
     * which supports shared code that deals with FieldPaths.
     */
    /**
     * Internal Note: The backend doesn't technically support querying by
     * document ID. Instead it queries by the entire document name (full path
     * included), but in the cases we currently support documentId(), the net
     * effect is the same.
     */
    Nr.cc = new Nr(_.J().j());

    /**
     * Matches any characters in a field path string that are reserved.
     */
    var Ar = new RegExp("[~\\*/\\[\\]]"), xr = function() {
        /** A pointer to the implementing class. */
        this._c = this;
    }, Dr = /** @class */ function(t) {
        function n(e) {
            var n = this;
            return (n = t.call(this) || this).lc = e, n;
        }
        return e.__extends(n, t), n.prototype.dc = function(t) {
            if (2 /* MergeSet */ !== t.fc) throw 1 /* Update */ === t.fc ? t.Tc(this.lc + "() can only appear at the top level of your update data") : t.Tc(this.lc + "() cannot be used with set() unless you pass {merge:true}");
            // No transform to add for a delete, but we need to add it to our
            // fieldMask so it gets deleted.
                    return t.Vt.push(t.path), null;
        }, n.prototype.isEqual = function(t) {
            return t instanceof n;
        }, n;
    }(xr), Sr = /** @class */ function(t) {
        function n(e) {
            var n = this;
            return (n = t.call(this) || this).lc = e, n;
        }
        return e.__extends(n, t), n.prototype.dc = function(t) {
            return new tt(t.path, Y.instance);
        }, n.prototype.isEqual = function(t) {
            return t instanceof n;
        }, n;
    }(xr), Rr = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).lc = e, r.Ec = n, r;
        }
        return e.__extends(n, t), n.prototype.dc = function(t) {
            // Although array transforms are used with writes, the actual elements
            // being uniomed or removed are not considered writes since they cannot
            // contain any FieldValue sentinels, etc.
            var e = new Fr({
                fc: 3 /* Argument */ ,
                methodName: this.lc,
                Ic: !0
            }, t.ii, t.serializer, t.ignoreUndefinedProperties), n = this.Ec.map((function(t) {
                return zr(t, e);
            })), r = new J(n);
            return new tt(t.path, r);
        }, n.prototype.isEqual = function(t) {
            // TODO(mrschmidt): Implement isEquals
            return this === t;
        }, n;
    }(xr), kr = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).lc = e, r.Ec = n, r;
        }
        return e.__extends(n, t), n.prototype.dc = function(t) {
            // Although array transforms are used with writes, the actual elements
            // being unioned or removed are not considered writes since they cannot
            // contain any FieldValue sentinels, etc.
            var e = new Fr({
                fc: 3 /* Argument */ ,
                methodName: this.lc,
                Ic: !0
            }, t.ii, t.serializer, t.ignoreUndefinedProperties), n = this.Ec.map((function(t) {
                return zr(t, e);
            })), r = new X(n);
            return new tt(t.path, r);
        }, n.prototype.isEqual = function(t) {
            // TODO(mrschmidt): Implement isEquals
            return this === t;
        }, n;
    }(xr), Pr = /** @class */ function(t) {
        function n(e, n) {
            var r = this;
            return (r = t.call(this) || this).lc = e, r.wc = n, r;
        }
        return e.__extends(n, t), n.prototype.dc = function(t) {
            var e = new Fr({
                fc: 3 /* Argument */ ,
                methodName: this.lc
            }, t.ii, t.serializer, t.ignoreUndefinedProperties), n = zr(this.wc, e), r = new H(t.serializer, n);
            return new tt(t.path, r);
        }, n.prototype.isEqual = function(t) {
            // TODO(mrschmidt): Implement isEquals
            return this === t;
        }, n;
    }(xr), Vr = /** @class */ function(t) {
        function n() {
            return null !== t && t.apply(this, arguments) || this;
        }
        return e.__extends(n, t), n.delete = function() {
            return nr("FieldValue.delete", arguments), new Lr(new Dr("FieldValue.delete"));
        }, n.serverTimestamp = function() {
            return nr("FieldValue.serverTimestamp", arguments), new Lr(new Sr("FieldValue.serverTimestamp"));
        }, n.arrayUnion = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            // NOTE: We don't actually parse the data until it's used in set() or
            // update() since we'd need the Firestore instance to do this.
                    return ir("FieldValue.arrayUnion", arguments, 1), new Lr(new Rr("FieldValue.arrayUnion", t));
        }, n.arrayRemove = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            // NOTE: We don't actually parse the data until it's used in set() or
            // update() since we'd need the Firestore instance to do this.
                    return ir("FieldValue.arrayRemove", arguments, 1), new Lr(new kr("FieldValue.arrayRemove", t));
        }, n.increment = function(t) {
            return sr("FieldValue.increment", "number", 1, t), rr("FieldValue.increment", arguments, 1), 
            new Lr(new Pr("FieldValue.increment", t));
        }, n;
    }(xr), Lr = /** @class */ function(t) {
        function n(e) {
            var n = this;
            return (n = t.call(this) || this)._c = e, n.lc = e.lc, n;
        }
        return e.__extends(n, t), n.prototype.dc = function(t) {
            return this._c.dc(t);
        }, n.prototype.isEqual = function(t) {
            return t instanceof n && this._c.isEqual(t._c);
        }, n;
    }(Vr), Or = /** @class */ function() {
        function t(t, e) {
            if (rr("GeoPoint", arguments, 2), sr("GeoPoint", "number", 1, t), sr("GeoPoint", "number", 2, e), 
            !isFinite(t) || t < -90 || t > 90) throw new h(c.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
            if (!isFinite(e) || e < -180 || e > 180) throw new h(c.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
            this.Rc = t, this.Ac = e;
        }
        return Object.defineProperty(t.prototype, "latitude", {
            /**
             * Returns the latitude of this geo point, a number between -90 and 90.
             */
            get: function() {
                return this.Rc;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "longitude", {
            /**
             * Returns the longitude of this geo point, a number between -180 and 180.
             */
            get: function() {
                return this.Ac;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.isEqual = function(t) {
            return this.Rc === t.Rc && this.Ac === t.Ac;
        }, 
        /**
         * Actually private to JS consumers of our API, so this function is prefixed
         * with an underscore.
         */
        t.prototype.p = function(t) {
            return we(this.Rc, t.Rc) || we(this.Ac, t.Ac);
        }, t;
    }(), Ur = /^__.*__$/, Cr = function(t, e, n) {
        this.mc = t, this.Pc = e, this.Vc = n;
    }, qr = /** @class */ function() {
        function t(t, e, n) {
            this.data = t, this.Vt = e, this.fieldTransforms = n;
        }
        return t.prototype.gc = function(t, e) {
            var n = [];
            return null !== this.Vt ? n.push(new ot(t, this.data, this.Vt, e)) : n.push(new it(t, this.data, e)), 
            this.fieldTransforms.length > 0 && n.push(new st(t, this.fieldTransforms)), n;
        }, t;
    }(), jr = /** @class */ function() {
        function t(t, e, n) {
            this.data = t, this.Vt = e, this.fieldTransforms = n;
        }
        return t.prototype.gc = function(t, e) {
            var n = [ new ot(t, this.data, this.Vt, e) ];
            return this.fieldTransforms.length > 0 && n.push(new st(t, this.fieldTransforms)), 
            n;
        }, t;
    }();

    /**
     * Parses a field path string into a FieldPath, treating dots as separators.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An opaque base class for FieldValue sentinel objects in our public API that
     * is shared between the full, lite and legacy SDK.
     */ function Mr(t) {
        switch (t) {
          case 0 /* Set */ :
     // fall through
                  case 2 /* MergeSet */ :
     // fall through
                  case 1 /* Update */ :
            return !0;

          case 3 /* Argument */ :
          case 4 /* ArrayArgument */ :
            return !1;

          default:
            throw ye();
        }
    }

    /** A "context" object passed around while parsing user data. */ var Fr = /** @class */ function() {
        /**
         * Initializes a ParseContext with the given source and path.
         *
         * @param settings The settings for the parser.
         * @param databaseId The database ID of the Firestore instance.
         * @param serializer The serializer to use to generate the Value proto.
         * @param ignoreUndefinedProperties Whether to ignore undefined properties
         * rather than throw.
         * @param fieldTransforms A mutable list of field transforms encountered while
         *     parsing the data.
         * @param fieldMask A mutable list of field paths encountered while parsing
         *     the data.
         *
         * TODO(b/34871131): We don't support array paths right now, so path can be
         * null to indicate the context represents any location within an array (in
         * which case certain features will not work and errors will be somewhat
         * compromised).
         */
        function t(t, e, n, r, i, o) {
            this.settings = t, this.ii = e, this.serializer = n, this.ignoreUndefinedProperties = r, 
            // Minor hack: If fieldTransforms is undefined, we assume this is an
            // external call and we need to validate the entire path.
            void 0 === i && this.pc(), this.fieldTransforms = i || [], this.Vt = o || [];
        }
        return Object.defineProperty(t.prototype, "path", {
            get: function() {
                return this.settings.path;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "fc", {
            get: function() {
                return this.settings.fc;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /** Returns a new context with the specified settings overwritten. */ t.prototype.yc = function(e) {
            return new t(Object.assign(Object.assign({}, this.settings), e), this.ii, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.Vt);
        }, t.prototype.bc = function(t) {
            var e, n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), r = this.yc({
                path: n,
                Ic: !1
            });
            return r.vc(t), r;
        }, t.prototype.Sc = function(t) {
            var e, n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), r = this.yc({
                path: n,
                Ic: !1
            });
            return r.pc(), r;
        }, t.prototype.Dc = function(t) {
            // TODO(b/34871131): We don't support array paths right now; so make path
            // undefined.
            return this.yc({
                path: void 0,
                Ic: !0
            });
        }, t.prototype.Tc = function(t) {
            var e = !this.path || this.path.B() ? "" : " (found in field " + this.path.toString() + ")";
            return new h(c.INVALID_ARGUMENT, "Function " + this.settings.methodName + "() called with invalid data. " + t + e);
        }, 
        /** Returns 'true' if 'fieldPath' was traversed when creating this context. */ t.prototype.contains = function(t) {
            return void 0 !== this.Vt.find((function(e) {
                return t.q(e);
            })) || void 0 !== this.fieldTransforms.find((function(e) {
                return t.q(e.field);
            }));
        }, t.prototype.pc = function() {
            // TODO(b/34871131): Remove null check once we have proper paths for fields
            // within arrays.
            if (this.path) for (var t = 0; t < this.path.length; t++) this.vc(this.path.get(t));
        }, t.prototype.vc = function(t) {
            if (0 === t.length) throw this.Tc("Document fields must not be empty");
            if (Mr(this.fc) && Ur.test(t)) throw this.Tc('Document fields cannot begin and end with "__"');
        }, t;
    }(), Br = /** @class */ function() {
        function t(t, e, n) {
            this.ii = t, this.ignoreUndefinedProperties = e, this.serializer = n || ce.nt().Cc(t)
            /** Parse document data from a set() call. */;
        }
        return t.prototype.Fc = function(t, e, n) {
            void 0 === n && (n = {});
            var r = this.Nc(n.merge || n.mergeFields ? 2 /* MergeSet */ : 0 /* Set */ , t);
            Qr("Data must be an object, but it was:", r, e);
            var i, o, s = Gr(e, r);
            if (n.merge) i = new Z(r.Vt), o = r.fieldTransforms; else if (n.mergeFields) {
                for (var u = [], a = 0, f = n.mergeFields; a < f.length; a++) {
                    var l = f[a], p = void 0;
                    if (l instanceof Ir) p = l.uc; else {
                        if ("string" != typeof l) throw ye();
                        p = Yr(t, l);
                    }
                    if (!r.contains(p)) throw new h(c.INVALID_ARGUMENT, "Field '" + p + "' is specified in your field mask but missing from your input data.");
                    Jr(u, p) || u.push(p);
                }
                i = new Z(u), o = r.fieldTransforms.filter((function(t) {
                    return i.dt(t.field);
                }));
            } else i = null, o = r.fieldTransforms;
            return new qr(new ct(s), i, o);
        }, 
        /** Parse update data from an update() call. */ t.prototype.kc = function(t, e) {
            var n = this.Nc(1 /* Update */ , t);
            Qr("Data must be an object, but it was:", n, e);
            var r = [], i = new ht;
            I(e, (function(e, o) {
                var s = Yr(t, e), u = n.Sc(s);
                if (o instanceof xr && o._c instanceof Dr) 
                // Add it to the field mask, but don't add anything to updateData.
                r.push(s); else {
                    var a = zr(o, u);
                    null != a && (r.push(s), i.set(s, a));
                }
            }));
            var o = new Z(r);
            return new jr(i.yt(), o, n.fieldTransforms);
        }, 
        /** Parse update data from a list of field/value arguments. */ t.prototype.Mc = function(t, e, n, r) {
            var i = this.Nc(1 /* Update */ , t), o = [ Kr(t, e) ], s = [ n ];
            if (r.length % 2 != 0) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() needs to be called with an even number of arguments that alternate between field names and values.");
            for (var u = 0; u < r.length; u += 2) o.push(Kr(t, r[u])), s.push(r[u + 1]);
            // We iterate in reverse order to pick the last value for a field if the
            // user specified the field multiple times.
            for (var a = [], f = new ht, l = o.length - 1; l >= 0; --l) if (!Jr(a, o[l])) {
                var p = o[l], d = s[l], y = i.Sc(p);
                if (d instanceof xr && d._c instanceof Dr) 
                // Add it to the field mask, but don't add anything to updateData.
                a.push(p); else {
                    var v = zr(d, y);
                    null != v && (a.push(p), f.set(p, v));
                }
            }
            var g = new Z(a);
            return new jr(f.yt(), g, i.fieldTransforms);
        }, 
        /** Creates a new top-level parse context. */ t.prototype.Nc = function(t, e) {
            return new Fr({
                fc: t,
                methodName: e,
                path: _.G,
                Ic: !1
            }, this.ii, this.serializer, this.ignoreUndefinedProperties);
        }, 
        /**
         * Parse a "query value" (e.g. value in a where filter or a value in a cursor
         * bound).
         *
         * @param allowArrays Whether the query value is an array that may directly
         * contain additional arrays (e.g. the operand of an `in` query).
         */
        t.prototype.xc = function(t, e, n) {
            return void 0 === n && (n = !1), zr(e, this.Nc(n ? 4 /* ArrayArgument */ : 3 /* Argument */ , t));
        }, t;
    }();

    /**
     * Helper for parsing raw user input (provided via the API) into internal model
     * classes.
     */
    /**
     * Parses user data to Protobuf Values.
     *
     * @param input Data to be parsed.
     * @param context A context object representing the current path being parsed,
     * the source of the data being parsed, etc.
     * @return The parsed value, or null if the value was a FieldValue sentinel
     * that should not be included in the resulting parsed data.
     */
    function zr(t, e) {
        if (Wr(t)) return Qr("Unsupported field value:", e, t), Gr(t, e);
        if (t instanceof xr) 
        // FieldValues usually parse into transforms (except FieldValue.delete())
        // in which case we do not want to include this field in our parsed data
        // (as doing so will overwrite the field directly prior to the transform
        // trying to transform it). So we don't add this location to
        // context.fieldMask and we return null as our parsing result.
        /**
         * "Parses" the provided FieldValueImpl, adding any necessary transforms to
         * context.fieldTransforms.
         */
        return function(t, e) {
            // Sentinels are only supported with writes, and not within arrays.
            if (!Mr(e.fc)) throw e.Tc(t.lc + "() can only be used with update() and set()");
            if (!e.path) throw e.Tc(t.lc + "() is not currently supported inside arrays");
            var n = t.dc(e);
            n && e.fieldTransforms.push(n);
        }(t, e), null;
        if (
        // If context.path is null we are inside an array and we don't support
        // field mask paths more granular than the top-level array.
        e.path && e.Vt.push(e.path), t instanceof Array) {
            // TODO(b/34871131): Include the path containing the array in the error
            // message.
            // In the case of IN queries, the parsed data is an array (representing
            // the set of values to be included for the IN query) that may directly
            // contain additional arrays (each representing an individual field
            // value), so we disable this validation.
            if (e.settings.Ic && 4 /* ArrayArgument */ !== e.fc) throw e.Tc("Nested arrays are not supported");
            return function(t, e) {
                for (var n = [], r = 0, i = 0, o = t; i < o.length; i++) {
                    var s = zr(o[i], e.Dc(r));
                    null == s && (
                    // Just include nulls in the array for fields being replaced with a
                    // sentinel.
                    s = {
                        nullValue: "NULL_VALUE"
                    }), n.push(s), r++;
                }
                return {
                    arrayValue: {
                        values: n
                    }
                };
            }(t, e);
        }
        return function(t, e) {
            if (null === t) return {
                nullValue: "NULL_VALUE"
            };
            if ("number" == typeof t) return e.serializer.ai(t);
            if ("boolean" == typeof t) return {
                booleanValue: t
            };
            if ("string" == typeof t) return {
                stringValue: t
            };
            if (t instanceof Date) {
                var n = v.fromDate(t);
                return {
                    timestampValue: e.serializer.C(n)
                };
            }
            if (t instanceof v) {
                // Firestore backend truncates precision down to microseconds. To ensure
                // offline mode works the same with regards to truncation, perform the
                // truncation immediately without waiting for the backend to do that.
                var r = new v(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
                return {
                    timestampValue: e.serializer.C(r)
                };
            }
            if (t instanceof Or) return {
                geoPointValue: {
                    latitude: t.latitude,
                    longitude: t.longitude
                }
            };
            if (t instanceof Tr) return {
                bytesValue: e.serializer.ui(t)
            };
            if (t instanceof Cr) {
                var i = e.ii, o = t.mc;
                if (!o.isEqual(i)) throw e.Tc("Document reference is for database " + o.projectId + "/" + o.database + " but should be for database " + i.projectId + "/" + i.database);
                return {
                    referenceValue: e.serializer._i(t.Pc.path, t.mc)
                };
            }
            if (void 0 === t && e.ignoreUndefinedProperties) return null;
            throw e.Tc("Unsupported field value: " + dr(t));
        }(t, e);
    }

    function Gr(t, e) {
        var n = {};
        return N(t) ? 
        // If we encounter an empty object, we explicitly add it to the update
        // mask to ensure that the server creates a map entry.
        e.path && e.path.length > 0 && e.Vt.push(e.path) : I(t, (function(t, r) {
            var i = zr(r, e.bc(t));
            null != i && (n[t] = i);
        })), {
            mapValue: {
                fields: n
            }
        };
    }

    function Wr(t) {
        return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof v || t instanceof Or || t instanceof Tr || t instanceof Cr || t instanceof xr);
    }

    function Qr(t, e, n) {
        if (!Wr(n) || !pr(n)) {
            var r = dr(n);
            throw "an object" === r ? e.Tc(t + " a custom object") : e.Tc(t + " " + r);
        }
    }

    /**
     * Helper that calls fromDotSeparatedString() but wraps any error thrown.
     */ function Kr(t, e) {
        if (e instanceof Ir) return e.uc;
        if ("string" == typeof e) return Yr(t, e);
        throw new h(c.INVALID_ARGUMENT, "Function " + t + "() called with invalid data. Field path arguments must be of type string or FieldPath.");
    }

    /**
     * Wraps fromDotSeparatedString with an error message about the method that
     * was thrown.
     * @param methodName The publicly visible method name
     * @param path The dot-separated string form of a field path which will be split
     * on dots.
     */ function Yr(t, n) {
        try {
            return function(t) {
                if (t.search(Ar) >= 0) throw new h(c.INVALID_ARGUMENT, "Invalid field path (" + t + "). Paths must not contain '~', '*', '/', '[', or ']'");
                try {
                    return new (Nr.bind.apply(Nr, e.__spreadArrays([ void 0 ], t.split("."))));
                } catch (e) {
                    throw new h(c.INVALID_ARGUMENT, "Invalid field path (" + t + "). Paths must not be empty, begin with '.', end with '.', or contain '..'");
                }
            }(n).uc;
        } catch (n) {
            var r = (i = n) instanceof Error ? i.message : i.toString();
            throw new h(c.INVALID_ARGUMENT, "Function " + t + "() called with invalid data. " + r);
        }
        /**
     * Extracts the message from a caught exception, which should be an Error object
     * though JS doesn't guarantee that.
     */    var i;
        /** Checks `haystack` if FieldPath `needle` is present. Runs in O(n). */}

    function Jr(t, e) {
        return t.some((function(t) {
            return t.isEqual(e);
        }));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A PersistentStream is an abstract base class that represents a streaming RPC
     * to the Firestore backend. It's built on top of the connections own support
     * for streaming RPCs, and adds several critical features for our clients:
     *
     *   - Exponential backoff on failure
     *   - Authentication via CredentialsProvider
     *   - Dispatching all callbacks into the shared worker queue
     *   - Closing idle streams after 60 seconds of inactivity
     *
     * Subclasses of PersistentStream implement serialization of models to and
     * from the JSON representation of the protocol buffers for a specific
     * streaming RPC.
     *
     * ## Starting and Stopping
     *
     * Streaming RPCs are stateful and need to be start()ed before messages can
     * be sent and received. The PersistentStream will call the onOpen() function
     * of the listener once the stream is ready to accept requests.
     *
     * Should a start() fail, PersistentStream will call the registered onClose()
     * listener with a FirestoreError indicating what went wrong.
     *
     * A PersistentStream can be started and stopped repeatedly.
     *
     * Generic types:
     *  SendType: The type of the outgoing message of the underlying
     *    connection stream
     *  ReceiveType: The type of the incoming message of the underlying
     *    connection stream
     *  ListenerType: The type of the listener that will be used for callbacks
     */ var Xr = /** @class */ function() {
        function t(t, e, n, r, i, o) {
            this.Tr = t, this.$c = n, this.Oc = r, this.Lc = i, this.listener = o, this.state = 0 /* Initial */ , 
            /**
                 * A close count that's incremented every time the stream is closed; used by
                 * getCloseGuardedDispatcher() to invalidate callbacks that happen after
                 * close.
                 */
            this.Bc = 0, this.qc = null, this.stream = null, this.Na = new Oe(t, e)
            /**
         * Returns true if start() has been called and no error has occurred. True
         * indicates the stream is open or in the process of opening (which
         * encompasses respecting backoff, getting auth tokens, and starting the
         * actual RPC). Use isOpen() to determine if the stream is open and ready for
         * outbound requests.
         */;
        }
        return t.prototype.Uc = function() {
            return 1 /* Starting */ === this.state || 2 /* Open */ === this.state || 4 /* Backoff */ === this.state;
        }, 
        /**
         * Returns true if the underlying RPC is open (the onOpen() listener has been
         * called) and the stream is ready for outbound requests.
         */
        t.prototype.Qc = function() {
            return 2 /* Open */ === this.state;
        }, 
        /**
         * Starts the RPC. Only allowed if isStarted() returns false. The stream is
         * not immediately ready for use: onOpen() will be invoked when the RPC is
         * ready for outbound requests, at which point isOpen() will return true.
         *
         * When start returns, isStarted() will return true.
         */
        t.prototype.start = function() {
            3 /* Error */ !== this.state ? this.auth() : this.Wc();
        }, 
        /**
         * Stops the RPC. This call is idempotent and allowed regardless of the
         * current isStarted() state.
         *
         * When stop returns, isStarted() and isOpen() will both return false.
         */
        t.prototype.stop = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return this.Uc() ? [ 4 /*yield*/ , this.close(0 /* Initial */) ] : [ 3 /*break*/ , 2 ];

                      case 1:
                        t.sent(), t.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * After an error the stream will usually back off on the next attempt to
         * start it. If the error warrants an immediate restart of the stream, the
         * sender can use this to indicate that the receiver should not back off.
         *
         * Each error will call the onClose() listener. That function can decide to
         * inhibit backoff if required.
         */
        t.prototype.jc = function() {
            this.state = 0 /* Initial */ , this.Na.reset();
        }, 
        /**
         * Marks this stream as idle. If no further actions are performed on the
         * stream for one minute, the stream will automatically close itself and
         * notify the stream's onClose() handler with Status.OK. The stream will then
         * be in a !isStarted() state, requiring the caller to start the stream again
         * before further use.
         *
         * Only streams that are in state 'Open' can be marked idle, as all other
         * states imply pending network operations.
         */
        t.prototype.Kc = function() {
            var t = this;
            // Starts the idle time if we are in state 'Open' and are not yet already
            // running a timer (in which case the previous idle timeout still applies).
                    this.Qc() && null === this.qc && (this.qc = this.Tr.yr(this.$c, 6e4, (function() {
                return t.Gc();
            })));
        }, 
        /** Sends a message to the underlying stream. */ t.prototype.zc = function(t) {
            this.Hc(), this.stream.send(t);
        }, 
        /** Called by the idle timer when the stream should close due to inactivity. */ t.prototype.Gc = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    return this.Qc() ? [ 2 /*return*/ , this.close(0 /* Initial */) ] : [ 2 /*return*/ ];
                }));
            }));
        }, 
        /** Marks the stream as active again. */ t.prototype.Hc = function() {
            this.qc && (this.qc.cancel(), this.qc = null);
        }, 
        /**
         * Closes the stream and cleans up as necessary:
         *
         * * closes the underlying GRPC stream;
         * * calls the onClose handler with the given 'error';
         * * sets internal stream state to 'finalState';
         * * adjusts the backoff timer based on the error
         *
         * A new stream can be opened by calling start().
         *
         * @param finalState the intended state of the stream after closing.
         * @param error the error the connection was closed with.
         */
        t.prototype.close = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        // Notify the listener that the stream closed.
                        // Cancel any outstanding timers (they're guaranteed not to execute).
                        return this.Hc(), this.Na.cancel(), 
                        // Invalidates any stream-related callbacks (e.g. from auth or the
                        // underlying stream), guaranteeing they won't execute.
                        this.Bc++, 3 /* Error */ !== t ? 
                        // If this is an intentional close ensure we don't delay our next connection attempt.
                        this.Na.reset() : n && n.code === c.RESOURCE_EXHAUSTED ? (
                        // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
                        pe(n.toString()), pe("Using maximum backoff delay to prevent overloading the backend."), 
                        this.Na.Vr()) : n && n.code === c.UNAUTHENTICATED && 
                        // "unauthenticated" error means the token was rejected. Try force refreshing it in case it
                        // just expired.
                        this.Lc._(), 
                        // Clean up the underlying stream because we are no longer interested in events.
                        null !== this.stream && (this.Yc(), this.stream.close(), this.stream = null), 
                        // This state must be assigned before calling onClose() to allow the callback to
                        // inhibit backoff or otherwise manipulate the state in its non-started state.
                        this.state = t, [ 4 /*yield*/ , this.listener.Jc(n) ];

                      case 1:
                        // Cancel any outstanding timers (they're guaranteed not to execute).
                        // Notify the listener that the stream closed.
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Can be overridden to perform additional cleanup before the stream is closed.
         * Calling super.tearDown() is not required.
         */
        t.prototype.Yc = function() {}, t.prototype.auth = function() {
            var t = this;
            this.state = 1 /* Starting */;
            var e = this.Xc(this.Bc), n = this.Bc;
            // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                    this.Lc.getToken().then((function(e) {
                // Stream can be stopped while waiting for authentication.
                // TODO(mikelehen): We really should just use dispatchIfNotClosed
                // and let this dispatch onto the queue, but that opened a spec test can
                // of worms that I don't want to deal with in this PR.
                t.Bc === n && 
                // Normally we'd have to schedule the callback on the AsyncQueue.
                // However, the following calls are safe to be called outside the
                // AsyncQueue since they don't chain asynchronous calls
                t.Zc(e);
            }), (function(n) {
                e((function() {
                    var e = new h(c.UNKNOWN, "Fetching auth token failed: " + n.message);
                    return t.t_(e);
                }));
            }));
        }, t.prototype.Zc = function(t) {
            var e = this, n = this.Xc(this.Bc);
            this.stream = this.e_(t), this.stream.s_((function() {
                n((function() {
                    return e.state = 2 /* Open */ , e.listener.s_();
                }));
            })), this.stream.Jc((function(t) {
                n((function() {
                    return e.t_(t);
                }));
            })), this.stream.onMessage((function(t) {
                n((function() {
                    return e.onMessage(t);
                }));
            }));
        }, t.prototype.Wc = function() {
            var t = this;
            this.state = 4 /* Backoff */ , this.Na.gr((function() {
                return e.__awaiter(t, void 0, void 0, (function() {
                    return e.__generator(this, (function(t) {
                        return this.state = 0 /* Initial */ , this.start(), [ 2 /*return*/ ];
                    }));
                }));
            }));
        }, 
        // Visible for tests
        t.prototype.t_ = function(t) {
            // In theory the stream could close cleanly, however, in our current model
            // we never expect this to happen because if we stop a stream ourselves,
            // this callback will never be called. To prevent cases where we retry
            // without a backoff accidentally, we set the stream to error in all cases.
            return le("PersistentStream", "close with error: " + t), this.stream = null, this.close(3 /* Error */ , t);
        }, 
        /**
         * Returns a "dispatcher" function that dispatches operations onto the
         * AsyncQueue but only runs them if closeCount remains unchanged. This allows
         * us to turn auth / stream callbacks into no-ops if the stream is closed /
         * re-opened, etc.
         */
        t.prototype.Xc = function(t) {
            var e = this;
            return function(n) {
                e.Tr.co((function() {
                    return e.Bc === t ? n() : (le("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
                    Promise.resolve());
                }));
            };
        }, t;
    }(), Hr = /** @class */ function(t) {
        function n(e, n, r, i, o) {
            var s = this;
            return (s = t.call(this, e, "listen_stream_connection_backoff" /* ListenStreamConnectionBackoff */ , "listen_stream_idle" /* ListenStreamIdle */ , n, r, o) || this).serializer = i, 
            s;
        }
        return e.__extends(n, t), n.prototype.e_ = function(t) {
            return this.Oc.i_("Listen", t);
        }, n.prototype.onMessage = function(t) {
            // A successful response means the stream is healthy
            this.Na.reset();
            var e = this.serializer.pi(t), n = this.serializer.bi(t);
            return this.listener.n_(e, n);
        }, 
        /**
         * Registers interest in the results of the given target. If the target
         * includes a resumeToken it will be included in the request. Results that
         * affect the target will be streamed back as WatchChange messages that
         * reference the targetId.
         */
        n.prototype.r_ = function(t) {
            var e = {};
            e.database = this.serializer.wi, e.addTarget = this.serializer.ee(t);
            var n = this.serializer.zi(t);
            n && (e.labels = n), this.zc(e);
        }, 
        /**
         * Unregisters interest in the results of the target associated with the
         * given targetId.
         */
        n.prototype.h_ = function(t) {
            var e = {};
            e.database = this.serializer.wi, e.removeTarget = t, this.zc(e);
        }, n;
    }(Xr), $r = /** @class */ function(t) {
        function n(e, n, r, i, o) {
            var s = this;
            return (s = t.call(this, e, "write_stream_connection_backoff" /* WriteStreamConnectionBackoff */ , "write_stream_idle" /* WriteStreamIdle */ , n, r, o) || this).serializer = i, 
            s.o_ = !1, 
            /**
                 * The last received stream token from the server, used to acknowledge which
                 * responses the client has processed. Stream tokens are opaque checkpoint
                 * markers whose only real value is their inclusion in the next request.
                 *
                 * PersistentWriteStream manages propagating this value from responses to the
                 * next request.
                 */
            s.lastStreamToken = A.ht, s;
        }
        return e.__extends(n, t), Object.defineProperty(n.prototype, "a_", {
            /**
             * Tracks whether or not a handshake has been successfully exchanged and
             * the stream is ready to accept mutations.
             */
            get: function() {
                return this.o_;
            },
            enumerable: !0,
            configurable: !0
        }), 
        // Override of PersistentStream.start
        n.prototype.start = function() {
            this.o_ = !1, this.lastStreamToken = A.ht, t.prototype.start.call(this);
        }, n.prototype.Yc = function() {
            this.o_ && this.u_([]);
        }, n.prototype.e_ = function(t) {
            return this.Oc.i_("Write", t);
        }, n.prototype.onMessage = function(t) {
            if (
            // Always capture the last stream token.
            ve(!!t.streamToken), this.lastStreamToken = this.serializer.ci(t.streamToken), this.o_) {
                // A successful first write response means the stream is healthy,
                // Note, that we could consider a successful handshake healthy, however,
                // the write itself might be causing an error we want to back off from.
                this.Na.reset();
                var e = this.serializer.$i(t.writeResults, t.commitTime), n = this.serializer.fromVersion(t.commitTime);
                return this.listener.c_(n, e);
            }
            // The first response is always the handshake response
                    return ve(!t.writeResults || 0 === t.writeResults.length), this.o_ = !0, 
            this.listener.__();
        }, 
        /**
         * Sends an initial streamToken to the server, performing the handshake
         * required to make the StreamingWrite RPC work. Subsequent
         * calls should wait until onHandshakeComplete was called.
         */
        n.prototype.l_ = function() {
            // TODO(dimond): Support stream resumption. We intentionally do not set the
            // stream token on the handshake, ignoring any stream token we might have.
            var t = {};
            t.database = this.serializer.wi, this.zc(t);
        }, 
        /** Sends a group of mutations to the Firestore backend to apply. */ n.prototype.u_ = function(t) {
            var e = this, n = {
                streamToken: this.serializer.ui(this.lastStreamToken),
                writes: t.map((function(t) {
                    return e.serializer.vi(t);
                }))
            };
            this.zc(n);
        }, n;
    }(Xr), Zr = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this) || this).Oc = e, i.credentials = n, i.serializer = r, i.f_ = !1, 
            i;
        }
        return e.__extends(n, t), n.prototype.T_ = function() {
            if (this.f_) throw new h(c.FAILED_PRECONDITION, "The client has already been terminated.");
        }, 
        /** Gets an auth token and invokes the provided RPC. */ n.prototype.E_ = function(t, e) {
            var n = this;
            return this.T_(), this.credentials.getToken().then((function(r) {
                return n.Oc.E_(t, e, r);
            })).catch((function(t) {
                throw t.code === c.UNAUTHENTICATED && n.credentials._(), t;
            }));
        }, 
        /** Gets an auth token and invokes the provided RPC with streamed results. */ n.prototype.I_ = function(t, e) {
            var n = this;
            return this.T_(), this.credentials.getToken().then((function(r) {
                return n.Oc.I_(t, e, r);
            })).catch((function(t) {
                throw t.code === c.UNAUTHENTICATED && n.credentials._(), t;
            }));
        }, n;
    }((function() {
        // Make sure that the structural type of `Datastore` is unique.
        // See https://github.com/microsoft/TypeScript/issues/5451
        this.d_ = void 0;
    })), ti = /** @class */ function() {
        function t(t) {
            this.w_ = t, 
            // The version of each document that was read during this transaction.
            this.R_ = new Map, this.mutations = [], this.A_ = !1, 
            /**
                 * A deferred usage error that occurred previously in this transaction that
                 * will cause the transaction to fail once it actually commits.
                 */
            this.m_ = null, 
            /**
                 * Set of documents that have been written in the transaction.
                 *
                 * When there's more than one write to the same key in a transaction, any
                 * writes after the first are handled differently.
                 */
            this.P_ = new Set;
        }
        return t.prototype.V_ = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r = this;
                return e.__generator(this, (function(i) {
                    switch (i.label) {
                      case 0:
                        if (this.g_(), this.mutations.length > 0) throw new h(c.INVALID_ARGUMENT, "Firestore transactions require all reads to be executed before all writes.");
                        return [ 4 /*yield*/ , function(t, n) {
                            return e.__awaiter(this, void 0, void 0, (function() {
                                var r, i, o, s, u;
                                return e.__generator(this, (function(e) {
                                    switch (e.label) {
                                      case 0:
                                        return r = ge(t), i = {
                                            database: r.serializer.wi,
                                            documents: n.map((function(t) {
                                                return r.serializer.fi(t);
                                            }))
                                        }, [ 4 /*yield*/ , r.I_("BatchGetDocuments", i) ];

                                      case 1:
                                        return o = e.sent(), s = new Map, o.forEach((function(t) {
                                            var e = r.serializer.gi(t);
                                            s.set(e.key.toString(), e);
                                        })), u = [], [ 2 /*return*/ , (n.forEach((function(t) {
                                            var e = s.get(t.toString());
                                            ve(!!e), u.push(e);
                                        })), u) ];
                                    }
                                }));
                            }));
                        }(this.w_, t) ];

                      case 1:
                        return [ 2 /*return*/ , ((n = i.sent()).forEach((function(t) {
                            t instanceof vt || t instanceof yt ? r.p_(t) : ye();
                        })), n) ];
                    }
                }));
            }));
        }, t.prototype.set = function(t, e) {
            this.write(e.gc(t, this.Rt(t))), this.P_.add(t);
        }, t.prototype.update = function(t, e) {
            try {
                this.write(e.gc(t, this.y_(t)));
            } catch (t) {
                this.m_ = t;
            }
            this.P_.add(t);
        }, t.prototype.delete = function(t) {
            this.write([ new ut(t, this.Rt(t)) ]), this.P_.add(t);
        }, t.prototype.commit = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t, n = this;
                return e.__generator(this, (function(r) {
                    switch (r.label) {
                      case 0:
                        if (this.g_(), this.m_) throw this.m_;
                        return t = this.R_, 
                        // For each mutation, note that the doc was written.
                        this.mutations.forEach((function(e) {
                            t.delete(e.key.toString());
                        })), 
                        // For each document that was read but not written to, we want to perform
                        // a `verify` operation.
                        t.forEach((function(t, e) {
                            var r = new b(w.K(e));
                            n.mutations.push(new at(r, n.Rt(r)));
                        })), [ 4 /*yield*/ , function(t, n) {
                            return e.__awaiter(this, void 0, void 0, (function() {
                                var r, i;
                                return e.__generator(this, (function(e) {
                                    switch (e.label) {
                                      case 0:
                                        return r = ge(t), i = {
                                            database: r.serializer.wi,
                                            writes: n.map((function(t) {
                                                return r.serializer.vi(t);
                                            }))
                                        }, [ 4 /*yield*/ , r.E_("Commit", i) ];

                                      case 1:
                                        return e.sent(), [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        }(this.w_, this.mutations) ];

                      case 1:
                        // For each mutation, note that the doc was written.
                        return r.sent(), this.A_ = !0, [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.p_ = function(t) {
            var e;
            if (t instanceof yt) e = t.version; else {
                if (!(t instanceof vt)) throw ye();
                // For deleted docs, we must use baseVersion 0 when we overwrite them.
                            e = g.min();
            }
            var n = this.R_.get(t.key.toString());
            if (n) {
                if (!e.isEqual(n)) 
                // This transaction will fail no matter what.
                throw new h(c.ABORTED, "Document version changed between two reads.");
            } else this.R_.set(t.key.toString(), e);
        }, 
        /**
         * Returns the version of this document when it was read in this transaction,
         * as a precondition, or no precondition if it was not read.
         */
        t.prototype.Rt = function(t) {
            var e = this.R_.get(t.toString());
            return !this.P_.has(t) && e ? nt.updateTime(e) : nt.ft();
        }, 
        /**
         * Returns the precondition for a document if the operation is an update.
         */
        t.prototype.y_ = function(t) {
            var e = this.R_.get(t.toString());
            // The first time a document is written, we want to take into account the
            // read time and existence
                    if (!this.P_.has(t) && e) {
                if (e.isEqual(g.min())) 
                // The document doesn't exist, so fail the transaction.
                // This has to be validated locally because you can't send a
                // precondition that a document does not exist without changing the
                // semantics of the backend write to be an insert. This is the reverse
                // of what we want, since we want to assert that the document doesn't
                // exist but then send the update and have it fail. Since we can't
                // express that to the backend, we have to validate locally.
                // Note: this can change once we can send separate verify writes in the
                // transaction.
                throw new h(c.INVALID_ARGUMENT, "Can't update a document that doesn't exist.");
                // Document exists, base precondition on document update time.
                            return nt.updateTime(e);
            }
            // Document was not read, so we just use the preconditions for a blind
            // update.
                    return nt.exists(!0);
        }, t.prototype.write = function(t) {
            this.g_(), this.mutations = this.mutations.concat(t);
        }, t.prototype.g_ = function() {}, t;
    }(), ei = /** @class */ function() {
        function t(t, e) {
            this.Ra = t, this.b_ = e, 
            /** The current OnlineState. */
            this.state = "Unknown" /* Unknown */ , 
            /**
                 * A count of consecutive failures to open the stream. If it reaches the
                 * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
                 * Offline.
                 */
            this.v_ = 0, 
            /**
                 * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
                 * transition from OnlineState.Unknown to OnlineState.Offline without waiting
                 * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
                 */
            this.S_ = null, 
            /**
                 * Whether the client should log a warning message if it fails to connect to
                 * the backend (initially true, cleared after a successful stream, or if we've
                 * logged the message already).
                 */
            this.D_ = !0
            /**
         * Called by RemoteStore when a watch stream is started (including on each
         * backoff attempt).
         *
         * If this is the first attempt, it sets the OnlineState to Unknown and starts
         * the onlineStateTimer.
         */;
        }
        return t.prototype.C_ = function() {
            var t = this;
            0 === this.v_ && (this.F_("Unknown" /* Unknown */), this.S_ = this.Ra.yr("online_state_timeout" /* OnlineStateTimeout */ , 1e4, (function() {
                return t.S_ = null, t.N_("Backend didn't respond within 10 seconds."), t.F_("Offline" /* Offline */), 
                Promise.resolve();
            })));
        }, 
        /**
         * Updates our OnlineState as appropriate after the watch stream reports a
         * failure. The first failure moves us to the 'Unknown' state. We then may
         * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
         * actually transition to the 'Offline' state.
         */
        t.prototype.k_ = function(t) {
            "Online" /* Online */ === this.state ? this.F_("Unknown" /* Unknown */) : (this.v_++, 
            this.v_ >= 1 && (this.M_(), this.N_("Connection failed 1 times. Most recent error: " + t.toString()), 
            this.F_("Offline" /* Offline */)));
        }, 
        /**
         * Explicitly sets the OnlineState to the specified state.
         *
         * Note that this resets our timers / failure counters, etc. used by our
         * Offline heuristics, so must not be used in place of
         * handleWatchStreamStart() and handleWatchStreamFailure().
         */
        t.prototype.set = function(t) {
            this.M_(), this.v_ = 0, "Online" /* Online */ === t && (
            // We've connected to watch at least once. Don't warn the developer
            // about being offline going forward.
            this.D_ = !1), this.F_(t);
        }, t.prototype.F_ = function(t) {
            t !== this.state && (this.state = t, this.b_(t));
        }, t.prototype.N_ = function(t) {
            var e = "Could not reach Cloud Firestore backend. " + t + "\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.";
            this.D_ ? (pe(e), this.D_ = !1) : le("OnlineStateTracker", e);
        }, t.prototype.M_ = function() {
            null !== this.S_ && (this.S_.cancel(), this.S_ = null);
        }, t;
    }(), ni = /** @class */ function() {
        function t(
        /**
         * The local store, used to fill the write pipeline with outbound mutations.
         */
        t, 
        /** The client-side proxy for interacting with the backend. */
        n, r, i, o) {
            var s = this;
            this.x_ = t, this.w_ = n, this.Ra = r, 
            /**
                 * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
                 * LocalStore via fillWritePipeline() and have or will send to the write
                 * stream.
                 *
                 * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
                 * restart the write stream. When the stream is established the writes in the
                 * pipeline will be sent in order.
                 *
                 * Writes remain in writePipeline until they are acknowledged by the backend
                 * and thus will automatically be re-sent if the stream is interrupted /
                 * restarted before they're acknowledged.
                 *
                 * Write responses from the backend are linked to their originating request
                 * purely based on order, and so we can just shift() writes from the front of
                 * the writePipeline as we receive responses.
                 */
            this.O_ = [], 
            /**
                 * A mapping of watched targets that the client cares about tracking and the
                 * user has explicitly called a 'listen' for this target.
                 *
                 * These targets may or may not have been sent to or acknowledged by the
                 * server. On re-establishing the listen stream, these targets should be sent
                 * to the server. The targets removed with unlistens are removed eagerly
                 * without waiting for confirmation from the listen stream.
                 */
            this.L_ = new Map, this.B_ = null, 
            /**
                 * Set to true by enableNetwork() and false by disableNetwork() and indicates
                 * the user-preferred network state.
                 */
            this.networkEnabled = !1, this.isPrimary = !1, 
            /**
                 * When set to `true`, the network was taken offline due to an IndexedDB
                 * failure. The state is flipped to `false` when access becomes available
                 * again.
                 */
            this.q_ = !1, this.U_ = o, this.U_.Q_((function(t) {
                r.co((function() {
                    return e.__awaiter(s, void 0, void 0, (function() {
                        return e.__generator(this, (function(t) {
                            switch (t.label) {
                              case 0:
                                return this.W_() ? (le("RemoteStore", "Restarting streams for network reachability change."), 
                                [ 4 /*yield*/ , this.j_() ]) : [ 3 /*break*/ , 2 ];

                              case 1:
                                t.sent(), t.label = 2;

                              case 2:
                                return [ 2 /*return*/ ];
                            }
                        }));
                    }));
                }));
            })), this.K_ = new ei(r, i), 
            // Create streams (but note they're not started yet).
            this.G_ = function(t, e, n) {
                var r = ge(t);
                return new Hr(e, r.Oc, r.credentials, r.serializer, n);
            }(this.w_, r, {
                s_: this.z_.bind(this),
                Jc: this.H_.bind(this),
                n_: this.Y_.bind(this)
            }), this.J_ = function(t, e, n) {
                var r = ge(t);
                return new $r(e, r.Oc, r.credentials, r.serializer, n);
            }(this.w_, r, {
                s_: this.X_.bind(this),
                Jc: this.Z_.bind(this),
                __: this.tl.bind(this),
                c_: this.c_.bind(this)
            });
        }
        /**
         * Starts up the remote store, creating streams, restoring state from
         * LocalStore, etc.
         */    return t.prototype.start = function() {
            return this.enableNetwork();
        }, 
        /** Re-enables the network. Idempotent. */ t.prototype.enableNetwork = function() {
            return this.networkEnabled = !0, this.el();
        }, t.prototype.el = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return this.W_() ? (this.sl() ? this.il() : this.K_.set("Unknown" /* Unknown */), 
                        [ 4 /*yield*/ , this.nl() ]) : [ 3 /*break*/ , 2 ];

                      case 1:
                        // This will start the write stream if necessary.
                        t.sent(), t.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Temporarily disables the network. The network can be re-enabled using
         * enableNetwork().
         */
        t.prototype.disableNetwork = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return this.networkEnabled = !1, [ 4 /*yield*/ , this.rl() ];

                      case 1:
                        return t.sent(), 
                        // Set the OnlineState to Offline so get()s return from cache, etc.
                        this.K_.set("Offline" /* Offline */), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.rl = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return [ 4 /*yield*/ , this.J_.stop() ];

                      case 1:
                        return t.sent(), [ 4 /*yield*/ , this.G_.stop() ];

                      case 2:
                        return t.sent(), this.O_.length > 0 && (le("RemoteStore", "Stopping write stream with " + this.O_.length + " pending writes"), 
                        this.O_ = []), this.hl(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.Vo = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return le("RemoteStore", "RemoteStore shutting down."), this.networkEnabled = !1, 
                        [ 4 /*yield*/ , this.rl() ];

                      case 1:
                        return t.sent(), this.U_.Vo(), 
                        // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
                        // triggering spurious listener events with cached data, etc.
                        this.K_.set("Unknown" /* Unknown */), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Starts new listen for the given target. Uses resume token if provided. It
         * is a no-op if the target of given `TargetData` is already being listened to.
         */
        t.prototype.listen = function(t) {
            this.L_.has(t.targetId) || (
            // Mark this as something the client is currently listening for.
            this.L_.set(t.targetId, t), this.sl() ? 
            // The listen will be sent in onWatchStreamOpen
            this.il() : this.G_.Qc() && this.ol(t));
        }, 
        /**
         * Removes the listen from server. It is a no-op if the given target id is
         * not being listened to.
         */
        t.prototype.al = function(t) {
            this.L_.delete(t), this.G_.Qc() && this.ul(t), 0 === this.L_.size && (this.G_.Qc() ? this.G_.Kc() : this.W_() && 
            // Revert to OnlineState.Unknown if the watch stream is not open and we
            // have no listeners, since without any listens to send we cannot
            // confirm if the stream is healthy and upgrade to OnlineState.Online.
            this.K_.set("Unknown" /* Unknown */));
        }, 
        /** {@link TargetMetadataProvider.getTargetDataForTarget} */ t.prototype.si = function(t) {
            return this.L_.get(t) || null;
        }, 
        /** {@link TargetMetadataProvider.getRemoteKeysForTarget} */ t.prototype.ei = function(t) {
            return this.cl.ei(t);
        }, 
        /**
         * We need to increment the the expected number of pending responses we're due
         * from watch so we wait for the ack to process any messages from this target.
         */
        t.prototype.ol = function(t) {
            this.B_.Ns(t.targetId), this.G_.r_(t);
        }, 
        /**
         * We need to increment the expected number of pending responses we're due
         * from watch so we wait for the removal on the server before we process any
         * messages from this target.
         */
        t.prototype.ul = function(t) {
            this.B_.Ns(t), this.G_.h_(t);
        }, t.prototype.il = function() {
            this.B_ = new ne(this), this.G_.start(), this.K_.C_();
        }, 
        /**
         * Returns whether the watch stream should be started because it's necessary
         * and has not yet been started.
         */
        t.prototype.sl = function() {
            return this.W_() && !this.G_.Uc() && this.L_.size > 0;
        }, t.prototype.W_ = function() {
            return !this.q_ && this.isPrimary && this.networkEnabled;
        }, t.prototype.hl = function() {
            this.B_ = null;
        }, t.prototype.z_ = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t = this;
                return e.__generator(this, (function(e) {
                    return this.L_.forEach((function(e, n) {
                        t.ol(e);
                    })), [ 2 /*return*/ ];
                }));
            }));
        }, t.prototype.H_ = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(e) {
                    return this.hl(), 
                    // If we still need the watch stream, retry the connection.
                    this.sl() ? (this.K_.k_(t), this.il()) : 
                    // No need to restart watch stream because there are no active targets.
                    // The online state is set to unknown because there is no active attempt
                    // at establishing a connection
                    this.K_.set("Unknown" /* Unknown */), [ 2 /*return*/ ];
                }));
            }));
        }, t.prototype.Y_ = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r, i, o;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        if (this.K_.set("Online" /* Online */), !(t instanceof te && 2 /* Removed */ === t.state && t.cause)) 
                        // Mark the client as online since we got a message from the server
                        return [ 3 /*break*/ , 6 ];
                        e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 3, , 5 ]), [ 4 /*yield*/ , this._l(t) ];

                      case 2:
                        return e.sent(), [ 3 /*break*/ , 5 ];

                      case 3:
                        return r = e.sent(), le("RemoteStore", "Failed to remove targets %s: %s ", t.targetIds.join(","), r), 
                        [ 4 /*yield*/ , this.ll(r) ];

                      case 4:
                        return e.sent(), [ 3 /*break*/ , 5 ];

                      case 5:
                        return [ 3 /*break*/ , 13 ];

                      case 6:
                        if (t instanceof $t ? this.B_.qs(t) : t instanceof Zt ? this.B_.Hs(t) : this.B_.Ws(t), 
                        n.isEqual(g.min())) return [ 3 /*break*/ , 13 ];
                        e.label = 7;

                      case 7:
                        return e.trys.push([ 7, 11, , 13 ]), [ 4 /*yield*/ , this.x_._h() ];

                      case 8:
                        return i = e.sent(), n.S(i) >= 0 ? [ 4 /*yield*/ , this.dl(n) ] : [ 3 /*break*/ , 10 ];

                        // We have received a target change with a global snapshot if the snapshot
                        // version is not equal to SnapshotVersion.min().
                                          case 9:
                        // We have received a target change with a global snapshot if the snapshot
                        // version is not equal to SnapshotVersion.min().
                        e.sent(), e.label = 10;

                      case 10:
                        return [ 3 /*break*/ , 13 ];

                      case 11:
                        return le("RemoteStore", "Failed to raise snapshot:", o = e.sent()), [ 4 /*yield*/ , this.ll(o) ];

                      case 12:
                        return e.sent(), [ 3 /*break*/ , 13 ];

                      case 13:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Recovery logic for IndexedDB errors that takes the network offline until
         * `op` succeeds. Retries are scheduled with backoff using
         * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
         * validated via a generic operation.
         *
         * The returned Promise is resolved once the network is disabled and before
         * any retry attempt.
         */
        t.prototype.ll = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r = this;
                return e.__generator(this, (function(i) {
                    switch (i.label) {
                      case 0:
                        if (!Un(t)) throw t;
                        // Disable network and raise offline snapshots
                        return this.q_ = !0, [ 4 /*yield*/ , this.rl() ];

                      case 1:
                        // Disable network and raise offline snapshots
                        return i.sent(), this.K_.set("Offline" /* Offline */), n || (
                        // Use a simple read operation to determine if IndexedDB recovered.
                        // Ideally, we would expose a health check directly on SimpleDb, but
                        // RemoteStore only has access to persistence through LocalStore.
                        n = function() {
                            return r.x_._h();
                        }), 
                        // Probe IndexedDB periodically and re-enable network
                        this.Ra.lo((function() {
                            return e.__awaiter(r, void 0, void 0, (function() {
                                return e.__generator(this, (function(t) {
                                    switch (t.label) {
                                      case 0:
                                        return le("RemoteStore", "Retrying IndexedDB access"), [ 4 /*yield*/ , n() ];

                                      case 1:
                                        return t.sent(), this.q_ = !1, [ 4 /*yield*/ , this.el() ];

                                      case 2:
                                        return t.sent(), [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        })), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Executes `op`. If `op` fails, takes the network offline until `op`
         * succeeds. Returns after the first attempt.
         */
        t.prototype.fl = function(t) {
            var e = this;
            return t().catch((function(n) {
                return e.ll(n, t);
            }));
        }, 
        /**
         * Takes a batch of changes from the Datastore, repackages them as a
         * RemoteEvent, and passes that on to the listener, which is typically the
         * SyncEngine.
         */
        t.prototype.dl = function(t) {
            var e = this, n = this.B_.Xs(t);
            // Update in-memory resume tokens. LocalStore will update the
            // persistent view of these when applying the completed RemoteEvent.
            // Finally raise remote event
            return n.as.forEach((function(n, r) {
                if (n.resumeToken.rt() > 0) {
                    var i = e.L_.get(r);
                    // A watched target might have been removed already.
                                    i && e.L_.set(r, i.we(n.resumeToken, t));
                }
            })), 
            // Re-establish listens for the targets that have been invalidated by
            // existence filter mismatches.
            n.us.forEach((function(t) {
                var n = e.L_.get(t);
                if (n) {
                    // Clear the resume token for the target, since we're in a known mismatch
                    // state.
                    e.L_.set(t, n.we(A.ht, n.Ee)), 
                    // Cause a hard reset by unwatching and rewatching immediately, but
                    // deliberately don't send a resume token so that we get a full update.
                    e.ul(t);
                    // Mark the target we send as being on behalf of an existence filter
                    // mismatch, but don't actually retain that in listenTargets. This ensures
                    // that we flag the first re-listen this way without impacting future
                    // listens of this target (that might happen e.g. on reconnect).
                    var r = new Dt(n.target, t, 1 /* ExistenceFilterMismatch */ , n.sequenceNumber);
                    e.ol(r);
                }
            })), this.cl.xu(n);
        }, 
        /** Handles an error on a target */ t.prototype._l = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        n = t.cause, r = 0, i = t.targetIds, e.label = 1;

                      case 1:
                        return r < i.length ? (o = i[r], this.L_.has(o) ? [ 4 /*yield*/ , this.cl.Tl(o, n) ] : [ 3 /*break*/ , 3 ]) : [ 3 /*break*/ , 5 ];

                      case 2:
                        e.sent(), this.L_.delete(o), this.B_.removeTarget(o), e.label = 3;

                      case 3:
                        e.label = 4;

                      case 4:
                        return r++, [ 3 /*break*/ , 1 ];

                      case 5:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Attempts to fill our write pipeline with writes from the LocalStore.
         *
         * Called internally to bootstrap or refill the write pipeline and by
         * SyncEngine whenever there are new mutations to process.
         *
         * Starts the write stream if necessary.
         */
        t.prototype.nl = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t, n, r;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        t = this.O_.length > 0 ? this.O_[this.O_.length - 1].batchId : -1, e.label = 1;

                      case 1:
                        if (!this.El()) return [ 3 /*break*/ , 7 ];
                        e.label = 2;

                      case 2:
                        return e.trys.push([ 2, 4, , 6 ]), [ 4 /*yield*/ , this.x_.Bu(t) ];

                      case 3:
                        return null === (n = e.sent()) ? (0 === this.O_.length && this.J_.Kc(), [ 3 /*break*/ , 7 ]) : (t = n.batchId, 
                        this.Il(n), [ 3 /*break*/ , 6 ]);

                      case 4:
                        return r = e.sent(), [ 4 /*yield*/ , this.ll(r) ];

                      case 5:
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 6:
                        return [ 3 /*break*/ , 1 ];

                      case 7:
                        return this.wl() && this.Rl(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Returns true if we can add to the write pipeline (i.e. the network is
         * enabled and the write pipeline is not full).
         */
        t.prototype.El = function() {
            return this.W_() && this.O_.length < 10;
        }, 
        // For testing
        t.prototype.Al = function() {
            return this.O_.length;
        }, 
        /**
         * Queues additional writes to be sent to the write stream, sending them
         * immediately if the write stream is established.
         */
        t.prototype.Il = function(t) {
            this.O_.push(t), this.J_.Qc() && this.J_.a_ && this.J_.u_(t.mutations);
        }, t.prototype.wl = function() {
            return this.W_() && !this.J_.Uc() && this.O_.length > 0;
        }, t.prototype.Rl = function() {
            this.J_.start();
        }, t.prototype.X_ = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    return this.J_.l_(), [ 2 /*return*/ ];
                }));
            }));
        }, t.prototype.tl = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t, n, r;
                return e.__generator(this, (function(e) {
                    // Send the write pipeline now that the stream is established.
                    for (t = 0, n = this.O_; t < n.length; t++) r = n[t], this.J_.u_(r.mutations);
                    return [ 2 /*return*/ ];
                }));
            }));
        }, t.prototype.c_ = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r, i, o = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return r = this.O_.shift(), i = Ae.from(r, t, n), [ 4 /*yield*/ , this.fl((function() {
                            return o.cl.ml(i);
                        })) ];

                      case 1:
                        // It's possible that with the completion of this mutation another
                        // slot has freed up.
                        return e.sent(), [ 4 /*yield*/ , this.nl() ];

                      case 2:
                        // It's possible that with the completion of this mutation another
                        // slot has freed up.
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.Z_ = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return t && this.J_.a_ ? [ 4 /*yield*/ , this.Pl(t) ] : [ 3 /*break*/ , 2 ];

                        // This error affects the actual write.
                                          case 1:
                        // This error affects the actual write.
                        e.sent(), e.label = 2;

                      case 2:
                        // If the write stream closed after the write handshake completes, a write
                        // operation failed and we fail the pending operation.
                        // The write stream might have been started by refilling the write
                        // pipeline for failed writes
                        return this.wl() && this.Rl(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.Pl = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return Rt(r = t.code) && r !== c.ABORTED ? (n = this.O_.shift(), 
                        // In this case it's also unlikely that the server itself is melting
                        // down -- this was just a bad request so inhibit backoff on the next
                        // restart.
                        this.J_.jc(), [ 4 /*yield*/ , this.fl((function() {
                            return i.cl.Vl(n.batchId, t);
                        })) ]) : [ 3 /*break*/ , 3 ];

                      case 1:
                        // It's possible that with the completion of this mutation
                        // another slot has freed up.
                        return e.sent(), [ 4 /*yield*/ , this.nl() ];

                      case 2:
                        // In this case it's also unlikely that the server itself is melting
                        // down -- this was just a bad request so inhibit backoff on the next
                        // restart.
                        // It's possible that with the completion of this mutation
                        // another slot has freed up.
                        e.sent(), e.label = 3;

                      case 3:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.gl = function() {
            return new ti(this.w_);
        }, t.prototype.j_ = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return this.networkEnabled = !1, [ 4 /*yield*/ , this.rl() ];

                      case 1:
                        return t.sent(), this.K_.set("Unknown" /* Unknown */), [ 4 /*yield*/ , this.enableNetwork() ];

                      case 2:
                        return t.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.pl = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(t) {
                    switch (t.label) {
                      case 0:
                        return this.W_() ? (
                        // Tear down and re-create our network streams. This will ensure we get a fresh auth token
                        // for the new user and re-fill the write pipeline with new mutations from the LocalStore
                        // (since mutations are per-user).
                        le("RemoteStore", "RemoteStore restarting streams for new credential"), [ 4 /*yield*/ , this.j_() ]) : [ 3 /*break*/ , 2 ];

                      case 1:
                        t.sent(), t.label = 2;

                      case 2:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Toggles the network state when the client gains or loses its primary lease.
         */
        t.prototype.yl = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.isPrimary = t, t && this.networkEnabled ? [ 4 /*yield*/ , this.enableNetwork() ] : [ 3 /*break*/ , 2 ];

                      case 1:
                        return e.sent(), [ 3 /*break*/ , 5 ];

                      case 2:
                        return (n = t) ? [ 3 /*break*/ , 4 ] : [ 4 /*yield*/ , this.rl() ];

                      case 3:
                        e.sent(), n = this.K_.set("Unknown" /* Unknown */), e.label = 4;

                      case 4:
                        e.label = 5;

                      case 5:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t;
    }();

    /**
     * A PersistentStream that implements the Listen RPC.
     *
     * Once the Listen stream has called the onOpen() listener, any number of
     * listen() and unlisten() calls can be made to control what changes will be
     * sent from the server for ListenResponses.
     */
    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The format of the LocalStorage key that stores the client state is:
    //     firestore_clients_<persistence_prefix>_<instance_key>
    /** Assembles the key for a client state in WebStorage */
    function ri(t, e) {
        return "firestore_clients_" + t + "_" + e;
    }

    // The format of the WebStorage key that stores the mutation state is:
    //     firestore_mutations_<persistence_prefix>_<batch_id>
    //     (for unauthenticated users)
    // or: firestore_mutations_<persistence_prefix>_<batch_id>_<user_uid>
    // 'user_uid' is last to avoid needing to escape '_' characters that it might
    // contain.
    /** Assembles the key for a mutation batch in WebStorage */ function ii(t, e, n) {
        var r = "firestore_mutations_" + t + "_" + n;
        return e.t() && (r += "_" + e.uid), r;
    }

    // The format of the WebStorage key that stores a query target's metadata is:
    //     firestore_targets_<persistence_prefix>_<target_id>
    /** Assembles the key for a query state in WebStorage */ function oi(t, e) {
        return "firestore_targets_" + t + "_" + e;
    }

    // The WebStorage prefix that stores the primary tab's online state. The
    // format of the key is:
    //     firestore_online_state_<persistence_prefix>
    /**
     * Holds the state of a mutation batch, including its user ID, batch ID and
     * whether the batch is 'pending', 'acknowledged' or 'rejected'.
     */
    // Visible for testing
    var si = /** @class */ function() {
        function t(t, e, n, r) {
            this.user = t, this.batchId = e, this.state = n, this.error = r
            /**
         * Parses a MutationMetadata from its JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */;
        }
        return t.bl = function(e, n, r) {
            var i = JSON.parse(r), o = "object" == typeof i && -1 !== [ "pending", "acknowledged", "rejected" ].indexOf(i.state) && (void 0 === i.error || "object" == typeof i.error), s = void 0;
            return o && i.error && ((o = "string" == typeof i.error.message && "string" == typeof i.error.code) && (s = new h(i.error.code, i.error.message))), 
            o ? new t(e, n, i.state, s) : (pe("SharedClientState", "Failed to parse mutation state for ID '" + n + "': " + r), 
            null);
        }, t.prototype.vl = function() {
            var t = {
                state: this.state,
                updateTimeMs: Date.now()
            };
            return this.error && (t.error = {
                code: this.error.code,
                message: this.error.message
            }), JSON.stringify(t);
        }, t;
    }(), ui = /** @class */ function() {
        function t(t, e, n) {
            this.targetId = t, this.state = e, this.error = n
            /**
         * Parses a QueryTargetMetadata from its JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */;
        }
        return t.bl = function(e, n) {
            var r = JSON.parse(n), i = "object" == typeof r && -1 !== [ "not-current", "current", "rejected" ].indexOf(r.state) && (void 0 === r.error || "object" == typeof r.error), o = void 0;
            return i && r.error && ((i = "string" == typeof r.error.message && "string" == typeof r.error.code) && (o = new h(r.error.code, r.error.message))), 
            i ? new t(e, r.state, o) : (pe("SharedClientState", "Failed to parse target state for ID '" + e + "': " + n), 
            null);
        }, t.prototype.vl = function() {
            var t = {
                state: this.state,
                updateTimeMs: Date.now()
            };
            return this.error && (t.error = {
                code: this.error.code,
                message: this.error.message
            }), JSON.stringify(t);
        }, t;
    }(), ai = /** @class */ function() {
        function t(t, e) {
            this.clientId = t, this.activeTargetIds = e
            /**
         * Parses a RemoteClientState from the JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */;
        }
        return t.bl = function(e, n) {
            for (var r = JSON.parse(n), i = "object" == typeof r && r.activeTargetIds instanceof Array, o = Qt(), s = 0; i && s < r.activeTargetIds.length; ++s) i = S(r.activeTargetIds[s]), 
            o = o.add(r.activeTargetIds[s]);
            return i ? new t(e, o) : (pe("SharedClientState", "Failed to parse client data for instance '" + e + "': " + n), 
            null);
        }, t;
    }(), ci = /** @class */ function() {
        function t(t, e) {
            this.clientId = t, this.onlineState = e
            /**
         * Parses a SharedOnlineState from its JSON representation in WebStorage.
         * Logs a warning and returns null if the format of the data is not valid.
         */;
        }
        return t.bl = function(e) {
            var n = JSON.parse(e);
            return "object" == typeof n && -1 !== [ "Unknown", "Online", "Offline" ].indexOf(n.onlineState) && "string" == typeof n.clientId ? new t(n.clientId, n.onlineState) : (pe("SharedClientState", "Failed to parse online state: " + e), 
            null);
        }, t;
    }(), hi = /** @class */ function() {
        function t() {
            this.activeTargetIds = Qt();
        }
        return t.prototype.Sl = function(t) {
            this.activeTargetIds = this.activeTargetIds.add(t);
        }, t.prototype.Dl = function(t) {
            this.activeTargetIds = this.activeTargetIds.delete(t);
        }, 
        /**
         * Converts this entry into a JSON-encoded format we can use for WebStorage.
         * Does not encode `clientId` as it is part of the key in WebStorage.
         */
        t.prototype.vl = function() {
            var t = {
                activeTargetIds: this.activeTargetIds.W(),
                updateTimeMs: Date.now()
            };
            return JSON.stringify(t);
        }, t;
    }(), fi = /** @class */ function() {
        function t(e, n, r, i, o) {
            if (this.Tr = e, this.platform = n, this.persistenceKey = r, this.Cl = i, this.cl = null, 
            this.b_ = null, this.ur = null, this.Fl = this.Nl.bind(this), this.kl = new Pt(we), 
            this.ho = !1, 
            /**
                 * Captures WebStorage events that occur before `start()` is called. These
                 * events are replayed once `WebStorageSharedClientState` is started.
                 */
            this.Ml = [], !t.zh(this.platform)) throw new h(c.UNIMPLEMENTED, "LocalStorage is not available on this platform.");
            // Escape the special characters mentioned here:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                    var s = r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            this.storage = this.platform.window.localStorage, this.currentUser = o, this.xl = ri(this.persistenceKey, this.Cl), 
            this.$l = 
            /** Assembles the key for the current sequence number. */
            function(t) {
                return "firestore_sequence_number_" + t;
            }(this.persistenceKey), this.kl = this.kl.Ae(this.Cl, new hi), this.Ol = new RegExp("^firestore_clients_" + s + "_([^_]*)$"), 
            this.Ll = new RegExp("^firestore_mutations_" + s + "_(\\d+)(?:_(.*))?$"), this.Bl = new RegExp("^firestore_targets_" + s + "_(\\d+)$"), 
            this.ql = 
            /** Assembles the key for the online state of the primary tab. */
            function(t) {
                return "firestore_online_state_" + t;
            }(this.persistenceKey), 
            // Rather than adding the storage observer during start(), we add the
            // storage observer during initialization. This ensures that we collect
            // events before other components populate their initial state (during their
            // respective start() calls). Otherwise, we might for example miss a
            // mutation that is added after LocalStore's start() processed the existing
            // mutations but before we observe WebStorage events.
            this.platform.window.addEventListener("storage", this.Fl);
        }
        /** Returns 'true' if WebStorage is available in the current environment. */    return t.zh = function(t) {
            return !(!t.window || null == t.window.localStorage);
        }, t.prototype.start = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t, n, r, i, o, s, u, a, c, h, f, l = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return [ 4 /*yield*/ , this.cl.So() ];

                      case 1:
                        for (t = e.sent(), n = 0, r = t; n < r.length; n++) (i = r[n]) !== this.Cl && (o = this.getItem(ri(this.persistenceKey, i))) && (s = ai.bl(i, o)) && (this.kl = this.kl.Ae(s.clientId, s));
                        for (this.Ul(), (u = this.storage.getItem(this.ql)) && (a = this.Ql(u)) && this.Wl(a), 
                        c = 0, h = this.Ml; c < h.length; c++) f = h[c], this.Nl(f);
                        return this.Ml = [], 
                        // Register a window unload hook to remove the client metadata entry from
                        // WebStorage even if `shutdown()` was not called.
                        this.platform.window.addEventListener("unload", (function() {
                            return l.Vo();
                        })), this.ho = !0, [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.lr = function(t) {
            this.setItem(this.$l, JSON.stringify(t));
        }, t.prototype.jl = function() {
            return this.Kl(this.kl);
        }, t.prototype.Gl = function(t) {
            var e = !1;
            return this.kl.forEach((function(n, r) {
                r.activeTargetIds.has(t) && (e = !0);
            })), e;
        }, t.prototype.zl = function(t) {
            this.Hl(t, "pending");
        }, t.prototype.Yl = function(t, e, n) {
            this.Hl(t, e, n), 
            // Once a final mutation result is observed by other clients, they no longer
            // access the mutation's metadata entry. Since WebStorage replays events
            // in order, it is safe to delete the entry right after updating it.
            this.Jl(t);
        }, t.prototype.Xl = function(t) {
            var e = "not-current";
            // Lookup an existing query state if the target ID was already registered
            // by another tab
                    if (this.Gl(t)) {
                var n = this.storage.getItem(oi(this.persistenceKey, t));
                if (n) {
                    var r = ui.bl(t, n);
                    r && (e = r.state);
                }
            }
            return this.Zl.Sl(t), this.Ul(), e;
        }, t.prototype.td = function(t) {
            this.Zl.Dl(t), this.Ul();
        }, t.prototype.ed = function(t) {
            return this.Zl.activeTargetIds.has(t);
        }, t.prototype.sd = function(t) {
            this.removeItem(oi(this.persistenceKey, t));
        }, t.prototype.nd = function(t, e, n) {
            this.rd(t, e, n);
        }, t.prototype.vu = function(t, e, n) {
            var r = this;
            e.forEach((function(t) {
                r.Jl(t);
            })), this.currentUser = t, n.forEach((function(t) {
                r.zl(t);
            }));
        }, t.prototype.hd = function(t) {
            this.od(t);
        }, t.prototype.Vo = function() {
            this.ho && (this.platform.window.removeEventListener("storage", this.Fl), this.removeItem(this.xl), 
            this.ho = !1);
        }, t.prototype.getItem = function(t) {
            var e = this.storage.getItem(t);
            return le("SharedClientState", "READ", t, e), e;
        }, t.prototype.setItem = function(t, e) {
            le("SharedClientState", "SET", t, e), this.storage.setItem(t, e);
        }, t.prototype.removeItem = function(t) {
            le("SharedClientState", "REMOVE", t), this.storage.removeItem(t);
        }, t.prototype.Nl = function(t) {
            var n = this;
            if (t.storageArea === this.storage) {
                if (le("SharedClientState", "EVENT", t.key, t.newValue), t.key === this.xl) return void pe("Received WebStorage notification for local change. Another client might have garbage-collected our state");
                this.Tr.lo((function() {
                    return e.__awaiter(n, void 0, void 0, (function() {
                        var n, r, i, o, s, u;
                        return e.__generator(this, (function(e) {
                            if (this.ho) {
                                if (null !== t.key) if (this.Ol.test(t.key)) {
                                    if (null == t.newValue) return n = this.ad(t.key), [ 2 /*return*/ , this.ud(n, null) ];
                                    if (r = this._d(t.key, t.newValue)) return [ 2 /*return*/ , this.ud(r.clientId, r) ];
                                } else if (this.Ll.test(t.key)) {
                                    if (null !== t.newValue && (i = this.ld(t.key, t.newValue))) return [ 2 /*return*/ , this.dd(i) ];
                                } else if (this.Bl.test(t.key)) {
                                    if (null !== t.newValue && (o = this.fd(t.key, t.newValue))) return [ 2 /*return*/ , this.Td(o) ];
                                } else if (t.key === this.ql) {
                                    if (null !== t.newValue && (s = this.Ql(t.newValue))) return [ 2 /*return*/ , this.Wl(s) ];
                                } else t.key === this.$l && (u = function(t) {
                                    var e = Ve.dr;
                                    if (null != t) try {
                                        var n = JSON.parse(t);
                                        ve("number" == typeof n), e = n;
                                    } catch (t) {
                                        pe("SharedClientState", "Failed to read sequence number from WebStorage", t);
                                    }
                                    return e;
                                }(t.newValue)) !== Ve.dr && this.ur(u);
                            } else this.Ml.push(t);
                            return [ 2 /*return*/ ];
                        }));
                    }));
                }));
            }
        }, Object.defineProperty(t.prototype, "Zl", {
            get: function() {
                return this.kl.get(this.Cl);
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.Ul = function() {
            this.setItem(this.xl, this.Zl.vl());
        }, t.prototype.Hl = function(t, e, n) {
            var r = new si(this.currentUser, t, e, n), i = ii(this.persistenceKey, this.currentUser, t);
            this.setItem(i, r.vl());
        }, t.prototype.Jl = function(t) {
            var e = ii(this.persistenceKey, this.currentUser, t);
            this.removeItem(e);
        }, t.prototype.od = function(t) {
            var e = {
                clientId: this.Cl,
                onlineState: t
            };
            this.storage.setItem(this.ql, JSON.stringify(e));
        }, t.prototype.rd = function(t, e, n) {
            var r = oi(this.persistenceKey, t), i = new ui(t, e, n);
            this.setItem(r, i.vl());
        }, 
        /**
         * Parses a client state key in WebStorage. Returns null if the key does not
         * match the expected key format.
         */
        t.prototype.ad = function(t) {
            var e = this.Ol.exec(t);
            return e ? e[1] : null;
        }, 
        /**
         * Parses a client state in WebStorage. Returns 'null' if the value could not
         * be parsed.
         */
        t.prototype._d = function(t, e) {
            var n = this.ad(t);
            return ai.bl(n, e);
        }, 
        /**
         * Parses a mutation batch state in WebStorage. Returns 'null' if the value
         * could not be parsed.
         */
        t.prototype.ld = function(t, e) {
            var n = this.Ll.exec(t), r = Number(n[1]), i = void 0 !== n[2] ? n[2] : null;
            return si.bl(new a(i), r, e);
        }, 
        /**
         * Parses a query target state from WebStorage. Returns 'null' if the value
         * could not be parsed.
         */
        t.prototype.fd = function(t, e) {
            var n = this.Bl.exec(t), r = Number(n[1]);
            return ui.bl(r, e);
        }, 
        /**
         * Parses an online state from WebStorage. Returns 'null' if the value
         * could not be parsed.
         */
        t.prototype.Ql = function(t) {
            return ci.bl(t);
        }, t.prototype.dd = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                return e.__generator(this, (function(e) {
                    return t.user.uid === this.currentUser.uid ? [ 2 /*return*/ , this.cl.Ed(t.batchId, t.state, t.error) ] : (le("SharedClientState", "Ignoring mutation for non-active user " + t.user.uid), 
                    [ 2 /*return*/ ]);
                }));
            }));
        }, t.prototype.Td = function(t) {
            return this.cl.Id(t.targetId, t.state, t.error);
        }, t.prototype.ud = function(t, e) {
            var n = this, r = e ? this.kl.Ae(t, e) : this.kl.remove(t), i = this.Kl(this.kl), o = this.Kl(r), s = [], u = [];
            return o.forEach((function(t) {
                i.has(t) || s.push(t);
            })), i.forEach((function(t) {
                o.has(t) || u.push(t);
            })), this.cl.wd(s, u).then((function() {
                n.kl = r;
            }));
        }, t.prototype.Wl = function(t) {
            // We check whether the client that wrote this online state is still active
            // by comparing its client ID to the list of clients kept active in
            // IndexedDb. If a client does not update their IndexedDb client state
            // within 5 seconds, it is considered inactive and we don't emit an online
            // state event.
            this.kl.get(t.clientId) && this.b_(t.onlineState);
        }, t.prototype.Kl = function(t) {
            var e = Qt();
            return t.forEach((function(t, n) {
                e = e.He(n.activeTargetIds);
            })), e;
        }, t;
    }(), li = /** @class */ function() {
        function t() {
            this.Rd = new hi, this.Ad = {}, this.cl = null, this.b_ = null, this.ur = null;
        }
        return t.prototype.zl = function(t) {
            // No op.
        }, t.prototype.Yl = function(t, e, n) {
            // No op.
        }, t.prototype.Xl = function(t) {
            return this.Rd.Sl(t), this.Ad[t] || "not-current";
        }, t.prototype.nd = function(t, e, n) {
            this.Ad[t] = e;
        }, t.prototype.td = function(t) {
            this.Rd.Dl(t);
        }, t.prototype.ed = function(t) {
            return this.Rd.activeTargetIds.has(t);
        }, t.prototype.sd = function(t) {
            delete this.Ad[t];
        }, t.prototype.jl = function() {
            return this.Rd.activeTargetIds;
        }, t.prototype.Gl = function(t) {
            return this.Rd.activeTargetIds.has(t);
        }, t.prototype.start = function() {
            return this.Rd = new hi, Promise.resolve();
        }, t.prototype.vu = function(t, e, n) {
            // No op.
        }, t.prototype.hd = function(t) {
            // No op.
        }, t.prototype.Vo = function() {}, t.prototype.lr = function(t) {}, t;
    }(), pi = function(t) {
        this.key = t;
    }, di = function(t) {
        this.key = t;
    }, yi = /** @class */ function() {
        function t(t, 
        /** Documents included in the remote target */
        e) {
            this.query = t, this.md = e, this.Pd = null, 
            /**
                 * A flag whether the view is current with the backend. A view is considered
                 * current after it has seen the current flag from the backend and did not
                 * lose consistency within the watch stream (e.g. because of an existence
                 * filter mismatch).
                 */
            this.fs = !1, 
            /** Documents in the view but not in the remote target */
            this.Vd = Gt(), 
            /** Document Keys that have local changes */
            this.ns = Gt(), this.gd = new Kt(t.se.bind(t));
        }
        return Object.defineProperty(t.prototype, "pd", {
            /**
             * The set of remote documents that the server has told us belongs to the target associated with
             * this view.
             */
            get: function() {
                return this.md;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /**
         * Iterates over a set of doc changes, applies the query limit, and computes
         * what the new results should be, what the changes were, and whether we may
         * need to go back to the local cache for more results. Does not make any
         * changes to the view.
         * @param docChanges The doc changes to apply to this view.
         * @param previousChanges If this is being called with a refill, then start
         *        with this set of docs and changes instead of the current view.
         * @return a new set of docs, changes, and refill flag.
         */
        t.prototype.yd = function(t, e) {
            var n = this, r = e ? e.bd : new Yt, i = e ? e.gd : this.gd, o = e ? e.ns : this.ns, s = i, u = !1, a = this.query.oe() && i.size === this.query.limit ? i.last() : null, c = this.query.ae() && i.size === this.query.limit ? i.first() : null;
            // Drop documents out to meet limit/limitToLast requirement.
            if (t.pe((function(t, e) {
                var h = i.get(t), f = e instanceof yt ? e : null;
                f && (f = n.query.matches(f) ? f : null);
                var l = !!h && n.ns.has(h.key), p = !!f && (f.At || 
                // We only consider committed mutations for documents that were
                // mutated during the lifetime of the view.
                n.ns.has(f.key) && f.hasCommittedMutations), d = !1;
                // Calculate change
                h && f ? h.data().isEqual(f.data()) ? l !== p && (r.track({
                    type: 3 /* Metadata */ ,
                    doc: f
                }), d = !0) : n.vd(h, f) || (r.track({
                    type: 2 /* Modified */ ,
                    doc: f
                }), d = !0, (a && n.query.se(f, a) > 0 || c && n.query.se(f, c) < 0) && (
                // This doc moved from inside the limit to outside the limit.
                // That means there may be some other doc in the local cache
                // that should be included instead.
                u = !0)) : !h && f ? (r.track({
                    type: 0 /* Added */ ,
                    doc: f
                }), d = !0) : h && !f && (r.track({
                    type: 1 /* Removed */ ,
                    doc: h
                }), d = !0, (a || c) && (
                // A doc was removed from a full limit query. We'll need to
                // requery from the local cache to see if we know about some other
                // doc that should be in the results.
                u = !0)), d && (f ? (s = s.add(f), o = p ? o.add(t) : o.delete(t)) : (s = s.delete(t), 
                o = o.delete(t)));
            })), this.query.oe() || this.query.ae()) for (;s.size > this.query.limit; ) {
                var h = this.query.oe() ? s.last() : s.first();
                s = s.delete(h.key), o = o.delete(h.key), r.track({
                    type: 1 /* Removed */ ,
                    doc: h
                });
            }
            return {
                gd: s,
                bd: r,
                Sd: u,
                ns: o
            };
        }, t.prototype.vd = function(t, e) {
            // We suppress the initial change event for documents that were modified as
            // part of a write acknowledgment (e.g. when the value of a server transform
            // is applied) as Watch will send us the same document again.
            // By suppressing the event, we only raise two user visible events (one with
            // `hasPendingWrites` and the final state of the document) instead of three
            // (one with `hasPendingWrites`, the modified document with
            // `hasPendingWrites` and the final state of the document).
            return t.At && e.hasCommittedMutations && !e.At;
        }, 
        /**
         * Updates the view with the given ViewDocumentChanges and optionally updates
         * limbo docs and sync state from the provided target change.
         * @param docChanges The set of changes to make to the view's docs.
         * @param updateLimboDocuments Whether to update limbo documents based on this
         *        change.
         * @param targetChange A target change to apply for computing limbo docs and
         *        sync state.
         * @return A new ViewChange with the given docs, changes, and sync state.
         */
        // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
        t.prototype.Ln = function(t, e, n) {
            var r = this, i = this.gd;
            this.gd = t.gd, this.ns = t.ns;
            // Sort changes based on type and query comparator
            var o = t.bd.es();
            o.sort((function(t, e) {
                return function(t, e) {
                    var n = function(t) {
                        switch (t) {
                          case 0 /* Added */ :
                            return 1;

                          case 2 /* Modified */ :
                          case 3 /* Metadata */ :
                            // A metadata change is converted to a modified change at the public
                            // api layer.  Since we sort by document key and then change type,
                            // metadata and modified changes must be sorted equivalently.
                            return 2;

                          case 1 /* Removed */ :
                            return 0;

                          default:
                            return ye();
                        }
                    };
                    return n(t) - n(e);
                }(t.type, e.type) || r.query.se(t.doc, e.doc);
            })), this.Dd(n);
            var s = e ? this.Cd() : [], u = 0 === this.Vd.size && this.fs ? 1 /* Synced */ : 0 /* Local */ , a = u !== this.Pd;
            return this.Pd = u, 0 !== o.length || a ? {
                snapshot: new Jt(this.query, t.gd, i, o, t.ns, 0 /* Local */ === u, a, 
                /* excludesMetadataChanges= */ !1),
                Fd: s
            } : {
                Fd: s
            };
            // no changes
            }, 
        /**
         * Applies an OnlineState change to the view, potentially generating a
         * ViewChange if the view's syncState changes as a result.
         */
        t.prototype.Nd = function(t) {
            return this.fs && "Offline" /* Offline */ === t ? (
            // If we're offline, set `current` to false and then call applyChanges()
            // to refresh our syncState and generate a ViewChange as appropriate. We
            // are guaranteed to get a new TargetChange that sets `current` back to
            // true once the client is back online.
            this.fs = !1, this.Ln({
                gd: this.gd,
                bd: new Yt,
                ns: this.ns,
                Sd: !1
            }, 
            /* updateLimboDocuments= */ !1)) : {
                Fd: []
            };
        }, 
        /**
         * Returns whether the doc for the given key should be in limbo.
         */
        t.prototype.kd = function(t) {
            // If the remote end says it's part of this query, it's not in limbo.
            return !this.md.has(t) && 
            // The local store doesn't think it's a result, so it shouldn't be in limbo.
            !!this.gd.has(t) && !this.gd.get(t).At;
        }, 
        /**
         * Updates syncedDocuments, current, and limbo docs based on the given change.
         * Returns the list of changes to which docs are in limbo.
         */
        t.prototype.Dd = function(t) {
            var e = this;
            t && (t.Ts.forEach((function(t) {
                return e.md = e.md.add(t);
            })), t.Es.forEach((function(t) {})), t.Is.forEach((function(t) {
                return e.md = e.md.delete(t);
            })), this.fs = t.fs);
        }, t.prototype.Cd = function() {
            var t = this;
            // We can only determine limbo documents when we're in-sync with the server.
                    if (!this.fs) return [];
            // TODO(klimt): Do this incrementally so that it's not quadratic when
            // updating many documents.
                    var e = this.Vd;
            this.Vd = Gt(), this.gd.forEach((function(e) {
                t.kd(e.key) && (t.Vd = t.Vd.add(e.key));
            }));
            // Diff the new limbo docs with the old limbo docs.
            var n = [];
            return e.forEach((function(e) {
                t.Vd.has(e) || n.push(new di(e));
            })), this.Vd.forEach((function(t) {
                e.has(t) || n.push(new pi(t));
            })), n;
        }, 
        /**
         * Update the in-memory state of the current view with the state read from
         * persistence.
         *
         * We update the query view whenever a client's primary status changes:
         * - When a client transitions from primary to secondary, it can miss
         *   LocalStorage updates and its query views may temporarily not be
         *   synchronized with the state on disk.
         * - For secondary to primary transitions, the client needs to update the list
         *   of `syncedDocuments` since secondary clients update their query views
         *   based purely on synthesized RemoteEvents.
         *
         * @param queryResult.documents - The documents that match the query according
         * to the LocalStore.
         * @param queryResult.remoteKeys - The keys of the documents that match the
         * query according to the backend.
         *
         * @return The ViewChange that resulted from this synchronization.
         */
        // PORTING NOTE: Multi-tab only.
        t.prototype.Md = function(t) {
            this.md = t.ju, this.Vd = Gt();
            var e = this.yd(t.documents);
            return this.Ln(e, /*updateLimboDocuments=*/ !0);
        }, 
        /**
         * Returns a view snapshot as if this query was just listened to. Contains
         * a document add for every existing document and the `fromCache` and
         * `hasPendingWrites` status of the already established view.
         */
        // PORTING NOTE: Multi-tab only.
        t.prototype.xd = function() {
            return Jt.os(this.query, this.gd, this.ns, 0 /* Local */ === this.Pd);
        }, t;
    }(), vi = /** @class */ function() {
        function t(t, e, n, r) {
            this.Ra = t, this.w_ = e, this.updateFunction = n, this.Pa = r, this.$d = 5, this.Na = new Oe(this.Ra, "transaction_retry" /* TransactionRetry */)
            /** Runs the transaction and sets the result on deferred. */;
        }
        return t.prototype.Od = function() {
            this.Ld();
        }, t.prototype.Ld = function() {
            var t = this;
            this.Na.gr((function() {
                return e.__awaiter(t, void 0, void 0, (function() {
                    var t, n, r = this;
                    return e.__generator(this, (function(e) {
                        return t = new ti(this.w_), (n = this.Bd(t)) && n.then((function(e) {
                            r.Ra.co((function() {
                                return t.commit().then((function() {
                                    r.Pa.resolve(e);
                                })).catch((function(t) {
                                    r.qd(t);
                                }));
                            }));
                        })).catch((function(t) {
                            r.qd(t);
                        })), [ 2 /*return*/ ];
                    }));
                }));
            }));
        }, t.prototype.Bd = function(t) {
            try {
                var e = this.updateFunction(t);
                return !x(e) && e.catch && e.then ? e : (this.Pa.reject(Error("Transaction callback must return a Promise")), 
                null);
            } catch (t) {
                // Do not retry errors thrown by user provided updateFunction.
                return this.Pa.reject(t), null;
            }
        }, t.prototype.qd = function(t) {
            var e = this;
            this.$d > 0 && this.Ud(t) ? (this.$d -= 1, this.Ra.co((function() {
                return e.Ld(), Promise.resolve();
            }))) : this.Pa.reject(t);
        }, t.prototype.Ud = function(t) {
            if ("FirebaseError" === t.name) {
                // In transactions, the backend will fail outdated reads with FAILED_PRECONDITION and
                // non-matching document versions with ABORTED. These errors should be retried.
                var e = t.code;
                return "aborted" === e || "failed-precondition" === e || !Rt(e);
            }
            return !1;
        }, t;
    }(), gi = function(
    /**
         * The query itself.
         */
    t, 
    /**
         * The target number created by the client that is used in the watch
         * stream to identify this query.
         */
    e, 
    /**
         * The view is responsible for computing the final merged truth of what
         * docs are in the query. It gets notified of local and remote changes,
         * and applies the query filters and limits to determine the most correct
         * possible results.
         */
    n) {
        this.query = t, this.targetId = e, this.view = n;
    }, mi = function(t) {
        this.key = t, 
        /**
                 * Set to true once we've received a document. This is used in
                 * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
                 * decide whether it needs to manufacture a delete event for the target once
                 * the target is CURRENT.
                 */
        this.Qd = !1;
    }, wi = /** @class */ function() {
        function t(t, e, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        r, i, o) {
            this.x_ = t, this.Wd = e, this.w_ = n, this.jd = r, this.currentUser = i, this.Kd = o, 
            this.Gd = null, this.zd = new Ie((function(t) {
                return t.canonicalId();
            })), this.Hd = new Map, 
            /**
                 * The keys of documents that are in limbo for which we haven't yet started a
                 * limbo resolution query.
                 */
            this.Yd = [], 
            /**
                 * Keeps track of the target ID for each document that is in limbo with an
                 * active target.
                 */
            this.Jd = new Pt(b.N), 
            /**
                 * Keeps track of the information about an active limbo resolution for each
                 * active target ID that was started for the purpose of limbo resolution.
                 */
            this.Xd = new Map, this.Zd = new tr, 
            /** Stores user completion handlers, indexed by User and BatchId. */
            this.tf = {}, 
            /** Stores user callbacks waiting for all pending writes to be acknowledged. */
            this.ef = new Map, this.sf = Je.rh(), this.onlineState = "Unknown" /* Unknown */;
        }
        return Object.defineProperty(t.prototype, "if", {
            get: function() {
                return !0;
            },
            enumerable: !0,
            configurable: !0
        }), 
        /** Subscribes to SyncEngine notifications. Has to be called exactly once. */ t.prototype.subscribe = function(t) {
            this.Gd = t;
        }, 
        /**
         * Initiates the new listen, resolves promise when listen enqueued to the
         * server. All the subsequent view snapshots or errors are sent to the
         * subscribed handlers. Returns the initial snapshot.
         */
        t.prototype.listen = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o, s;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.nf("listen()"), (i = this.zd.get(t)) ? (
                        // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
                        // already exists when EventManager calls us for the first time. This
                        // happens when the primary tab is already listening to this query on
                        // behalf of another tab and the user of the primary also starts listening
                        // to the query. EventManager will not have an assigned target ID in this
                        // case and calls `listen` to obtain this ID.
                        n = i.targetId, this.jd.Xl(n), r = i.view.xd(), [ 3 /*break*/ , 4 ]) : [ 3 /*break*/ , 1 ];

                      case 1:
                        return [ 4 /*yield*/ , this.x_.Uu(t.ee()) ];

                      case 2:
                        return o = e.sent(), s = this.jd.Xl(o.targetId), n = o.targetId, [ 4 /*yield*/ , this.rf(t, n, "current" === s) ];

                      case 3:
                        r = e.sent(), this.if && this.Wd.listen(o), e.label = 4;

                      case 4:
                        return [ 2 /*return*/ , r ];
                    }
                }));
            }));
        }, 
        /**
         * Registers a view for a previously unknown query and computes its initial
         * snapshot.
         */
        t.prototype.rf = function(t, n, r) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var i, o, s, u, a, c;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return [ 4 /*yield*/ , this.x_.Wu(t, 
                        /* usePreviousResults= */ !0) ];

                      case 1:
                        return i = e.sent(), o = new yi(t, i.ju), s = o.yd(i.documents), u = Ht.ds(n, r && "Offline" /* Offline */ !== this.onlineState), 
                        a = o.Ln(s, 
                        /* updateLimboDocuments= */ this.if, u), this.hf(n, a.Fd), c = new gi(t, n, o), 
                        [ 2 /*return*/ , (this.zd.set(t, c), this.Hd.has(n) ? this.Hd.get(n).push(t) : this.Hd.set(n, [ t ]), 
                        a.snapshot) ];
                    }
                }));
            }));
        }, 
        /** Stops listening to the query. */ t.prototype.al = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        // Only clean up the query view and target if this is the only query mapped
                        // to the target.
                        return this.nf("unlisten()"), n = this.zd.get(t), (r = this.Hd.get(n.targetId)).length > 1 ? [ 2 /*return*/ , (this.Hd.set(n.targetId, r.filter((function(e) {
                            return !e.isEqual(t);
                        }))), void this.zd.delete(t)) ] : this.if ? (
                        // We need to remove the local query target first to allow us to verify
                        // whether any other client is still interested in this target.
                        this.jd.td(n.targetId), this.jd.Gl(n.targetId) ? [ 3 /*break*/ , 2 ] : [ 4 /*yield*/ , this.x_.Qu(n.targetId, /*keepPersistedTargetData=*/ !1).then((function() {
                            i.jd.sd(n.targetId), i.Wd.al(n.targetId), i.af(n.targetId);
                        })).catch(Zn) ]) : [ 3 /*break*/ , 3 ];

                      case 1:
                        e.sent(), e.label = 2;

                      case 2:
                        return [ 3 /*break*/ , 5 ];

                      case 3:
                        return this.af(n.targetId), [ 4 /*yield*/ , this.x_.Qu(n.targetId, 
                        /*keepPersistedTargetData=*/ !0) ];

                      case 4:
                        e.sent(), e.label = 5;

                      case 5:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Initiates the write of local mutation batch which involves adding the
         * writes to the mutation queue, notifying the remote store about new
         * mutations and raising events for any changes this write caused.
         *
         * The promise returned by this call is resolved when the above steps
         * have completed, *not* when the write was acked by the backend. The
         * userCallback is resolved once the write was acked/rejected by the
         * backend (or failed locally for any other reason).
         */
        t.prototype.write = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r, i, o;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        this.nf("write()"), e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 5, , 6 ]), [ 4 /*yield*/ , this.x_.Fu(t) ];

                      case 2:
                        return r = e.sent(), this.jd.zl(r.batchId), this.uf(r.batchId, n), [ 4 /*yield*/ , this.cf(r.Dn) ];

                      case 3:
                        return e.sent(), [ 4 /*yield*/ , this.Wd.nl() ];

                      case 4:
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 5:
                        return i = e.sent(), o = Gn(i, "Failed to persist write"), n.reject(o), [ 3 /*break*/ , 6 ];

                      case 6:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Takes an updateFunction in which a set of reads and writes can be performed
         * atomically. In the updateFunction, the client can read and write values
         * using the supplied transaction object. After the updateFunction, all
         * changes will be committed. If a retryable error occurs (ex: some other
         * client has changed any of the data referenced), then the updateFunction
         * will be called again after a backoff. If the updateFunction still fails
         * after all retries, then the transaction will be rejected.
         *
         * The transaction object passed to the updateFunction contains methods for
         * accessing documents and collections. Unlike other datastore access, data
         * accessed with the transaction will not reflect local changes that have not
         * been committed. For this reason, it is required that all reads are
         * performed before any writes. Transactions must be performed while online.
         *
         * The Deferred input is resolved when the transaction is fully committed.
         */
        t.prototype.runTransaction = function(t, e, n) {
            new vi(t, this.w_, e, n).Od();
        }, t.prototype.xu = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        this.nf("applyRemoteEvent()"), e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 4, , 6 ]), [ 4 /*yield*/ , this.x_.xu(t) ];

                      case 2:
                        return n = e.sent(), 
                        // Update `receivedDocument` as appropriate for any limbo targets.
                        t.as.forEach((function(t, e) {
                            var n = r.Xd.get(e);
                            n && (
                            // Since this is a limbo resolution lookup, it's for a single document
                            // and it could be added, modified, or removed, but not a combination.
                            ve(t.Ts.size + t.Es.size + t.Is.size <= 1), t.Ts.size > 0 ? n.Qd = !0 : t.Es.size > 0 ? ve(n.Qd) : t.Is.size > 0 && (ve(n.Qd), 
                            n.Qd = !1));
                        })), [ 4 /*yield*/ , this.cf(n, t) ];

                      case 3:
                        // Update `receivedDocument` as appropriate for any limbo targets.
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 4:
                        return [ 4 /*yield*/ , Zn(e.sent()) ];

                      case 5:
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 6:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Applies an OnlineState change to the sync engine and notifies any views of
         * the change.
         */
        t.prototype.Nd = function(t, e) {
            this.nf("applyOnlineStateChange()");
            var n = [];
            this.zd.forEach((function(e, r) {
                var i = r.view.Nd(t);
                i.snapshot && n.push(i.snapshot);
            })), this.Gd._f(t), this.Gd.n_(n), this.onlineState = t;
        }, t.prototype.Tl = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r, i, o, s, u, a = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.nf("rejectListens()"), 
                        // PORTING NOTE: Multi-tab only.
                        this.jd.nd(t, "rejected", n), r = this.Xd.get(t), (i = r && r.key) ? (o = (o = new Pt(b.N)).Ae(i, new vt(i, g.min())), 
                        s = Gt().add(i), u = new Xt(g.min(), 
                        /* targetChanges= */ new Map, 
                        /* targetMismatches= */ new Ot(we), o, s), [ 4 /*yield*/ , this.xu(u) ]) : [ 3 /*break*/ , 2 ];

                      case 1:
                        return e.sent(), 
                        // Since this query failed, we won't want to manually unlisten to it.
                        // We only remove it from bookkeeping after we successfully applied the
                        // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
                        // this query when the RemoteStore restarts the Watch stream, which should
                        // re-trigger the target failure.
                        this.Jd = this.Jd.remove(i), this.Xd.delete(t), this.lf(), [ 3 /*break*/ , 4 ];

                      case 2:
                        return [ 4 /*yield*/ , this.x_.Qu(t, /* keepPersistedTargetData */ !1).then((function() {
                            return a.af(t, n);
                        })).catch(Zn) ];

                      case 3:
                        e.sent(), e.label = 4;

                      case 4:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.ml = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        this.nf("applySuccessfulWrite()"), n = t.batch.batchId, e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 4, , 6 ]), [ 4 /*yield*/ , this.x_.Nu(t) ];

                      case 2:
                        return r = e.sent(), 
                        // The local store may or may not be able to apply the write result and
                        // raise events immediately (depending on whether the watcher is caught
                        // up), so we raise user callbacks first so that they consistently happen
                        // before listen events.
                        this.df(n, /*error=*/ null), this.ff(n), this.jd.Yl(n, "acknowledged"), [ 4 /*yield*/ , this.cf(r) ];

                      case 3:
                        // The local store may or may not be able to apply the write result and
                        // raise events immediately (depending on whether the watcher is caught
                        // up), so we raise user callbacks first so that they consistently happen
                        // before listen events.
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 4:
                        return [ 4 /*yield*/ , Zn(e.sent()) ];

                      case 5:
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 6:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.Vl = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        this.nf("rejectFailedWrite()"), e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 4, , 6 ]), [ 4 /*yield*/ , this.x_.Mu(t) ];

                      case 2:
                        return r = e.sent(), 
                        // The local store may or may not be able to apply the write result and
                        // raise events immediately (depending on whether the watcher is caught up),
                        // so we raise user callbacks first so that they consistently happen before
                        // listen events.
                        this.df(t, n), this.ff(t), this.jd.Yl(t, "rejected", n), [ 4 /*yield*/ , this.cf(r) ];

                      case 3:
                        // The local store may or may not be able to apply the write result and
                        // raise events immediately (depending on whether the watcher is caught up),
                        // so we raise user callbacks first so that they consistently happen before
                        // listen events.
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 4:
                        return [ 4 /*yield*/ , Zn(e.sent()) ];

                      case 5:
                        return e.sent(), [ 3 /*break*/ , 6 ];

                      case 6:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Registers a user callback that resolves when all pending mutations at the moment of calling
         * are acknowledged .
         */
        t.prototype.Tf = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        this.Wd.W_() || le("SyncEngine", "The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled."), 
                        e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 3, , 4 ]), [ 4 /*yield*/ , this.x_.ta() ];

                      case 2:
                        return -1 === (n = e.sent()) ? [ 2 /*return*/ , void t.resolve() ] : ((r = this.ef.get(n) || []).push(t), 
                        this.ef.set(n, r), [ 3 /*break*/ , 4 ]);

                      case 3:
                        return i = e.sent(), o = Gn(i, "Initialization of waitForPendingWrites() operation failed"), 
                        t.reject(o), [ 3 /*break*/ , 4 ];

                      case 4:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Triggers the callbacks that are waiting for this batch id to get acknowledged by server,
         * if there are any.
         */
        t.prototype.ff = function(t) {
            (this.ef.get(t) || []).forEach((function(t) {
                t.resolve();
            })), this.ef.delete(t);
        }, 
        /** Reject all outstanding callbacks waiting for pending writes to complete. */ t.prototype.Ef = function(t) {
            this.ef.forEach((function(e) {
                e.forEach((function(e) {
                    e.reject(new h(c.CANCELLED, t));
                }));
            })), this.ef.clear();
        }, t.prototype.uf = function(t, e) {
            var n = this.tf[this.currentUser.s()];
            n || (n = new Pt(we)), n = n.Ae(t, e), this.tf[this.currentUser.s()] = n;
        }, 
        /**
         * Resolves or rejects the user callback for the given batch and then discards
         * it.
         */
        t.prototype.df = function(t, e) {
            var n = this.tf[this.currentUser.s()];
            // NOTE: Mutations restored from persistence won't have callbacks, so it's
            // okay for there to be no callback for this ID.
                    if (n) {
                var r = n.get(t);
                r && (e ? r.reject(e) : r.resolve(), n = n.remove(t)), this.tf[this.currentUser.s()] = n;
            }
        }, t.prototype.af = function(t, e) {
            var n = this;
            void 0 === e && (e = null), this.jd.td(t);
            for (var r = 0, i = this.Hd.get(t); r < i.length; r++) {
                var o = i[r];
                this.zd.delete(o), e && this.Gd.If(o, e);
            }
            this.Hd.delete(t), this.if && this.Zd.ic(t).forEach((function(t) {
                n.Zd.Ch(t) || 
                // We removed the last reference for this key
                n.wf(t);
            }));
        }, t.prototype.wf = function(t) {
            // It's possible that the target already got removed because the query failed. In that case,
            // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
            var e = this.Jd.get(t);
            null !== e && (this.Wd.al(e), this.Jd = this.Jd.remove(t), this.Xd.delete(e), this.lf());
        }, t.prototype.hf = function(t, e) {
            for (var n = 0, r = e; n < r.length; n++) {
                var i = r[n];
                i instanceof pi ? (this.Zd.yh(i.key, t), this.Rf(i)) : i instanceof di ? (le("SyncEngine", "Document no longer in limbo: " + i.key), 
                this.Zd.vh(i.key, t), this.Zd.Ch(i.key) || 
                // We removed the last reference for this key
                this.wf(i.key)) : ye();
            }
        }, t.prototype.Rf = function(t) {
            var e = t.key;
            this.Jd.get(e) || (le("SyncEngine", "New document in limbo: " + e), this.Yd.push(e), 
            this.lf());
        }, 
        /**
         * Starts listens for documents in limbo that are enqueued for resolution,
         * subject to a maximum number of concurrent resolutions.
         *
         * Without bounding the number of concurrent resolutions, the server can fail
         * with "resource exhausted" errors which can lead to pathological client
         * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
         */
        t.prototype.lf = function() {
            for (;this.Yd.length > 0 && this.Jd.size < this.Kd; ) {
                var t = this.Yd.shift(), e = this.sf.next();
                this.Xd.set(e, new mi(t)), this.Jd = this.Jd.Ae(t, e), this.Wd.listen(new Dt(wt.Wt(t.path).ee(), e, 2 /* LimboResolution */ , Ve.dr));
            }
        }, 
        // Visible for testing
        t.prototype.Af = function() {
            return this.Jd;
        }, 
        // Visible for testing
        t.prototype.mf = function() {
            return this.Yd;
        }, t.prototype.cf = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r, i, o, s = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return r = [], i = [], o = [], this.zd.forEach((function(e, u) {
                            o.push(Promise.resolve().then((function() {
                                var e = u.view.yd(t);
                                return e.Sd ? s.x_.Wu(u.query, /* usePreviousResults= */ !1).then((function(t) {
                                    var n = t.documents;
                                    return u.view.yd(n, e);
                                })) : e;
                                // The query has a limit and some docs were removed, so we need
                                // to re-run the query against the local store to make sure we
                                // didn't lose any good docs that had been past the limit.
                                                    })).then((function(t) {
                                var e = n && n.as.get(u.targetId), o = u.view.Ln(t, 
                                /* updateLimboDocuments= */ s.if, e);
                                if (s.hf(u.targetId, o.Fd), o.snapshot) {
                                    s.if && s.jd.nd(u.targetId, o.snapshot.fromCache ? "not-current" : "current"), r.push(o.snapshot);
                                    var a = Pe.ar(u.targetId, o.snapshot);
                                    i.push(a);
                                }
                            })));
                        })), [ 4 /*yield*/ , Promise.all(o) ];

                      case 1:
                        return e.sent(), this.Gd.n_(r), [ 4 /*yield*/ , this.x_.Lu(i) ];

                      case 2:
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.nf = function(t) {}, t.prototype.pl = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.currentUser.isEqual(t) ? [ 3 /*break*/ , 3 ] : [ 4 /*yield*/ , this.x_.vu(t) ];

                      case 1:
                        return n = e.sent(), this.currentUser = t, 
                        // Fails tasks waiting for pending writes requested by previous user.
                        this.Ef("'waitForPendingWrites' promise is rejected due to a user change."), 
                        // TODO(b/114226417): Consider calling this only in the primary tab.
                        this.jd.vu(t, n.Du, n.Cu), [ 4 /*yield*/ , this.cf(n.Su) ];

                      case 2:
                        e.sent(), e.label = 3;

                      case 3:
                        return [ 4 /*yield*/ , this.Wd.pl() ];

                      case 4:
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.enableNetwork = function() {
            return this.Wd.enableNetwork();
        }, t.prototype.disableNetwork = function() {
            return this.Wd.disableNetwork();
        }, t.prototype.ei = function(t) {
            var e = this.Xd.get(t);
            if (e && e.Qd) return Gt().add(e.key);
            var n = Gt(), r = this.Hd.get(t);
            if (!r) return n;
            for (var i = 0, o = r; i < o.length; i++) {
                var s = o[i], u = this.zd.get(s);
                n = n.He(u.view.pd);
            }
            return n;
        }, t;
    }(), Ei = /** @class */ function(t) {
        function n(e, n, r, i, o, s) {
            var u = this;
            return (u = t.call(this, e, n, r, i, o, s) || this).x_ = e, 
            // The primary state is set to `true` or `false` immediately after Firestore
            // startup. In the interim, a client should only be considered primary if
            // `isPrimary` is true.
            u.Pf = void 0, u;
        }
        return e.__extends(n, t), Object.defineProperty(n.prototype, "if", {
            get: function() {
                return !0 === this.Pf;
            },
            enumerable: !0,
            configurable: !0
        }), n.prototype.enableNetwork = function() {
            return this.x_.uo(!0), t.prototype.enableNetwork.call(this);
        }, n.prototype.disableNetwork = function() {
            return this.x_.uo(!1), t.prototype.disableNetwork.call(this);
        }, 
        /**
         * Reconcile the list of synced documents in an existing view with those
         * from persistence.
         */
        n.prototype.Vf = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return [ 4 /*yield*/ , this.x_.Wu(t.query, 
                        /* usePreviousResults= */ !0) ];

                      case 1:
                        return n = e.sent(), r = t.view.Md(n), [ 2 /*return*/ , (this.Pf && this.hf(t.targetId, r.Fd), 
                        r) ];
                    }
                }));
            }));
        }, n.prototype.Nd = function(e, n) {
            // If we are the primary client, the online state of all clients only
            // depends on the online state of the local RemoteStore.
            this.if && 0 /* RemoteStore */ === n && (t.prototype.Nd.call(this, e, n), this.jd.hd(e)), 
            // If we are the secondary client, we explicitly ignore the remote store's
            // online state (the local client may go offline, even though the primary
            // tab remains online) and only apply the primary tab's online state from
            // SharedClientState.
            this.if || 1 /* SharedClientState */ !== n || t.prototype.Nd.call(this, e, n);
        }, n.prototype.Ed = function(t, n, r) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var i;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.nf("applyBatchState()"), [ 4 /*yield*/ , this.x_.Gu(t) ];

                      case 1:
                        return null === (i = e.sent()) ? [ 3 /*break*/ , 6 ] : "pending" !== n ? [ 3 /*break*/ , 3 ] : [ 4 /*yield*/ , this.Wd.nl() ];

                      case 2:
                        // If we are the primary client, we need to send this write to the
                        // backend. Secondary clients will ignore these writes since their remote
                        // connection is disabled.
                        return e.sent(), [ 3 /*break*/ , 4 ];

                      case 3:
                        "acknowledged" === n || "rejected" === n ? (
                        // NOTE: Both these methods are no-ops for batches that originated from
                        // other clients.
                        this.df(t, r || null), this.x_.zu(t)) : ye(), e.label = 4;

                      case 4:
                        return [ 4 /*yield*/ , this.cf(i) ];

                      case 5:
                        return e.sent(), [ 3 /*break*/ , 7 ];

                      case 6:
                        // A throttled tab may not have seen the mutation before it was completed
                        // and removed from the mutation queue, in which case we won't have cached
                        // the affected documents. In this case we can safely ignore the update
                        // since that means we didn't apply the mutation locally at all (if we
                        // had, we would have cached the affected documents), and so we will just
                        // see any resulting document changes via normal remote document updates
                        // as applicable.
                        le("SyncEngine", "Cannot apply mutation batch with id: " + t), e.label = 7;

                      case 7:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, n.prototype.yl = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o, s, u, a, c = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return !0 !== t || !0 === this.Pf ? [ 3 /*break*/ , 3 ] : (n = this.jd.jl(), [ 4 /*yield*/ , this.gf(n.W(), 
                        /*transitionToPrimary=*/ !0) ]);

                      case 1:
                        return r = e.sent(), this.Pf = !0, [ 4 /*yield*/ , this.Wd.yl(!0) ];

                      case 2:
                        for (e.sent(), i = 0, o = r; i < o.length; i++) s = o[i], this.Wd.listen(s);
                        return [ 3 /*break*/ , 7 ];

                      case 3:
                        return !1 !== t || !1 === this.Pf ? [ 3 /*break*/ , 7 ] : (u = [], a = Promise.resolve(), 
                        this.Hd.forEach((function(t, e) {
                            c.jd.ed(e) ? u.push(e) : a = a.then((function() {
                                return c.af(e), c.x_.Qu(e, 
                                /*keepPersistedTargetData=*/ !0);
                            })), c.Wd.al(e);
                        })), [ 4 /*yield*/ , a ]);

                      case 4:
                        return e.sent(), [ 4 /*yield*/ , this.gf(u, 
                        /*transitionToPrimary=*/ !1) ];

                      case 5:
                        return e.sent(), this.pf(), this.Pf = !1, [ 4 /*yield*/ , this.Wd.yl(!1) ];

                      case 6:
                        e.sent(), e.label = 7;

                      case 7:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, n.prototype.pf = function() {
            var t = this;
            this.Xd.forEach((function(e, n) {
                t.Wd.al(n);
            })), this.Zd.nc(), this.Xd = new Map, this.Jd = new Pt(b.N);
        }, 
        /**
         * Reconcile the query views of the provided query targets with the state from
         * persistence. Raises snapshots for any changes that affect the local
         * client and returns the updated state of all target's query data.
         *
         * @param targets the list of targets with views that need to be recomputed
         * @param transitionToPrimary `true` iff the tab transitions from a secondary
         * tab to a primary tab
         */
        n.prototype.gf = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o, s, u, a, c, h, f, l, p, d;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        n = [], r = [], i = 0, o = t, e.label = 1;

                      case 1:
                        return i < o.length ? (s = o[i], u = void 0, (a = this.Hd.get(s)) && 0 !== a.length ? [ 4 /*yield*/ , this.x_.Uu(a[0].ee()) ] : [ 3 /*break*/ , 7 ]) : [ 3 /*break*/ , 13 ];

                      case 2:
                        // For queries that have a local View, we fetch their current state
                        // from LocalStore (as the resume token and the snapshot version
                        // might have changed) and reconcile their views with the persisted
                        // state (the list of syncedDocuments may have gotten out of sync).
                        u = e.sent(), c = 0, h = a, e.label = 3;

                      case 3:
                        return c < h.length ? (f = h[c], l = this.zd.get(f), [ 4 /*yield*/ , this.Vf(l) ]) : [ 3 /*break*/ , 6 ];

                      case 4:
                        (p = e.sent()).snapshot && r.push(p.snapshot), e.label = 5;

                      case 5:
                        return c++, [ 3 /*break*/ , 3 ];

                      case 6:
                        return [ 3 /*break*/ , 11 ];

                      case 7:
                        return [ 4 /*yield*/ , this.x_.Hu(s) ];

                      case 8:
                        return d = e.sent(), [ 4 /*yield*/ , this.x_.Uu(d) ];

                      case 9:
                        return u = e.sent(), [ 4 /*yield*/ , this.rf(this.yf(d), s, 
                        /*current=*/ !1) ];

                      case 10:
                        e.sent(), e.label = 11;

                      case 11:
                        n.push(u), e.label = 12;

                      case 12:
                        return i++, [ 3 /*break*/ , 1 ];

                      case 13:
                        return [ 2 /*return*/ , (this.Gd.n_(r), n) ];
                    }
                }));
            }));
        }, 
        /**
         * Creates a `Query` object from the specified `Target`. There is no way to
         * obtain the original `Query`, so we synthesize a `Query` from the `Target`
         * object.
         *
         * The synthesized result might be different from the original `Query`, but
         * since the synthesized `Query` should return the same results as the
         * original one (only the presentation of results might differ), the potential
         * difference will not cause issues.
         */
        n.prototype.yf = function(t) {
            return new wt(t.path, t.collectionGroup, t.orderBy, t.filters, t.limit, "F" /* First */ , t.startAt, t.endAt);
        }, n.prototype.So = function() {
            return this.x_.So();
        }, n.prototype.Id = function(t, n, r) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var i, o;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.Pf ? (
                        // If we receive a target state notification via WebStorage, we are
                        // either already secondary or another tab has taken the primary lease.
                        le("SyncEngine", "Ignoring unexpected query state notification."), [ 3 /*break*/ , 8 ]) : [ 3 /*break*/ , 1 ];

                      case 1:
                        if (!this.Hd.has(t)) return [ 3 /*break*/ , 8 ];
                        switch (n) {
                          case "current":
                          case "not-current":
                            return [ 3 /*break*/ , 2 ];

                          case "rejected":
                            return [ 3 /*break*/ , 5 ];
                        }
                        return [ 3 /*break*/ , 7 ];

                      case 2:
                        return [ 4 /*yield*/ , this.x_.Kr() ];

                      case 3:
                        return i = e.sent(), o = Xt.ls(t, "current" === n), [ 4 /*yield*/ , this.cf(i, o) ];

                      case 4:
                        return e.sent(), [ 3 /*break*/ , 8 ];

                      case 5:
                        return [ 4 /*yield*/ , this.x_.Qu(t, 
                        /* keepPersistedTargetData */ !0) ];

                      case 6:
                        return e.sent(), this.af(t, r), [ 3 /*break*/ , 8 ];

                      case 7:
                        ye(), e.label = 8;

                      case 8:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, n.prototype.wd = function(t, n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r, i, o, s, u, a, c, h, f, l, p = this;
                return e.__generator(this, (function(d) {
                    switch (d.label) {
                      case 0:
                        if (!this.Pf) return [ 3 /*break*/ , 10 ];
                        r = 0, i = t, d.label = 1;

                      case 1:
                        return r < i.length ? (o = i[r], this.Hd.has(o) ? (
                        // A target might have been added in a previous attempt
                        le("SyncEngine", "Adding an already active target " + o), [ 3 /*break*/ , 5 ]) : [ 4 /*yield*/ , this.x_.Hu(o) ]) : [ 3 /*break*/ , 6 ];

                      case 2:
                        return s = d.sent(), [ 4 /*yield*/ , this.x_.Uu(s) ];

                      case 3:
                        return u = d.sent(), [ 4 /*yield*/ , this.rf(this.yf(s), u.targetId, 
                        /*current=*/ !1) ];

                      case 4:
                        d.sent(), this.Wd.listen(u), d.label = 5;

                      case 5:
                        return r++, [ 3 /*break*/ , 1 ];

                      case 6:
                        a = function(t) {
                            return e.__generator(this, (function(e) {
                                switch (e.label) {
                                  case 0:
                                    return c.Hd.has(t) ? [ 4 /*yield*/ , c.x_.Qu(t, /* keepPersistedTargetData */ !1).then((function() {
                                        p.Wd.al(t), p.af(t);
                                    })).catch(Zn) ] : [ 3 /*break*/ , 2 ];

                                    // Release queries that are still active.
                                                                  case 1:
                                    // Release queries that are still active.
                                    e.sent(), e.label = 2;

                                  case 2:
                                    return [ 2 /*return*/ ];
                                }
                            }));
                        }, c = this, h = 0, f = n, d.label = 7;

                      case 7:
                        return h < f.length ? (l = f[h], [ 5 /*yield**/ , a(l) ]) : [ 3 /*break*/ , 10 ];

                      case 8:
                        d.sent(), d.label = 9;

                      case 9:
                        return h++, [ 3 /*break*/ , 7 ];

                      case 10:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, n;
    }(wi), _i = function() {
        this.bf = void 0, this.vf = [];
    }, bi = /** @class */ function() {
        function t(t) {
            this.cl = t, this.Sf = new Ie((function(t) {
                return t.canonicalId();
            })), this.onlineState = "Unknown" /* Unknown */ , this.Df = new Set, this.cl.subscribe(this);
        }
        return t.prototype.listen = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o, s, u;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        if (n = t.query, r = !1, (i = this.Sf.get(n)) || (r = !0, i = new _i), !r) return [ 3 /*break*/ , 4 ];
                        e.label = 1;

                      case 1:
                        return e.trys.push([ 1, 3, , 4 ]), o = i, [ 4 /*yield*/ , this.cl.listen(n) ];

                      case 2:
                        return o.bf = e.sent(), [ 3 /*break*/ , 4 ];

                      case 3:
                        return s = e.sent(), u = Gn(s, "Initialization of query '" + t.query + "' failed"), 
                        [ 2 /*return*/ , void t.onError(u) ];

                      case 4:
                        return this.Sf.set(n, i), i.vf.push(t), 
                        // Run global snapshot listeners if a consistent snapshot has been emitted.
                        t.Nd(this.onlineState), i.bf && t.Cf(i.bf) && this.Ff(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.al = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r, i, o;
                return e.__generator(this, (function(e) {
                    return n = t.query, r = !1, (i = this.Sf.get(n)) && (o = i.vf.indexOf(t)) >= 0 && (i.vf.splice(o, 1), 
                    r = 0 === i.vf.length), r ? [ 2 /*return*/ , (this.Sf.delete(n), this.cl.al(n)) ] : [ 2 /*return*/ ];
                }));
            }));
        }, t.prototype.n_ = function(t) {
            for (var e = !1, n = 0, r = t; n < r.length; n++) {
                var i = r[n], o = i.query, s = this.Sf.get(o);
                if (s) {
                    for (var u = 0, a = s.vf; u < a.length; u++) {
                        a[u].Cf(i) && (e = !0);
                    }
                    s.bf = i;
                }
            }
            e && this.Ff();
        }, t.prototype.If = function(t, e) {
            var n = this.Sf.get(t);
            if (n) for (var r = 0, i = n.vf; r < i.length; r++) {
                i[r].onError(e);
            }
            // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
            // after an error.
                    this.Sf.delete(t);
        }, t.prototype._f = function(t) {
            this.onlineState = t;
            var e = !1;
            this.Sf.forEach((function(n, r) {
                for (var i = 0, o = r.vf; i < o.length; i++) {
                    // Run global snapshot listeners if a consistent snapshot has been emitted.
                    o[i].Nd(t) && (e = !0);
                }
            })), e && this.Ff();
        }, t.prototype.Nf = function(t) {
            this.Df.add(t), 
            // Immediately fire an initial event, indicating all existing listeners
            // are in-sync.
            t.next();
        }, t.prototype.kf = function(t) {
            this.Df.delete(t);
        }, 
        // Call all global snapshot listeners that have been set.
        t.prototype.Ff = function() {
            this.Df.forEach((function(t) {
                t.next();
            }));
        }, t;
    }(), Ti = /** @class */ function() {
        function t(t, e, n) {
            this.query = t, this.Mf = e, 
            /**
                 * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
                 * observer. This flag is set to true once we've actually raised an event.
                 */
            this.xf = !1, this.$f = null, this.onlineState = "Unknown" /* Unknown */ , this.options = n || {}
            /**
         * Applies the new ViewSnapshot to this listener, raising a user-facing event
         * if applicable (depending on what changed, whether the user has opted into
         * metadata-only changes, etc.). Returns true if a user-facing event was
         * indeed raised.
         */;
        }
        return t.prototype.Cf = function(t) {
            if (!this.options.includeMetadataChanges) {
                for (
                // Remove the metadata only changes.
                var e = [], n = 0, r = t.docChanges; n < r.length; n++) {
                    var i = r[n];
                    3 /* Metadata */ !== i.type && e.push(i);
                }
                t = new Jt(t.query, t.docs, t.ss, e, t.ns, t.fromCache, t.rs, 
                /* excludesMetadataChanges= */ !0);
            }
            var o = !1;
            return this.xf ? this.Of(t) && (this.Mf.next(t), o = !0) : this.Lf(t, this.onlineState) && (this.Bf(t), 
            o = !0), this.$f = t, o;
        }, t.prototype.onError = function(t) {
            this.Mf.error(t);
        }, 
        /** Returns whether a snapshot was raised. */ t.prototype.Nd = function(t) {
            this.onlineState = t;
            var e = !1;
            return this.$f && !this.xf && this.Lf(this.$f, t) && (this.Bf(this.$f), e = !0), 
            e;
        }, t.prototype.Lf = function(t, e) {
            // Always raise the first event when we're synced
            if (!t.fromCache) return !0;
            // NOTE: We consider OnlineState.Unknown as online (it should become Offline
            // or Online if we wait long enough).
                    var n = "Offline" /* Offline */ !== e;
            // Don't raise the event if we're online, aren't synced yet (checked
            // above) and are waiting for a sync.
                    return !(this.options.qf && n || t.docs.B() && "Offline" /* Offline */ !== e);
            // Raise data from cache if we have any documents or we are offline
            }, t.prototype.Of = function(t) {
            // We don't need to handle includeDocumentMetadataChanges here because
            // the Metadata only changes have already been stripped out if needed.
            // At this point the only changes we will see are the ones we should
            // propagate.
            if (t.docChanges.length > 0) return !0;
            var e = this.$f && this.$f.hasPendingWrites !== t.hasPendingWrites;
            return !(!t.rs && !e) && !0 === this.options.includeMetadataChanges;
            // Generally we should have hit one of the cases above, but it's possible
            // to get here if there were only metadata docChanges and they got
            // stripped out.
            }, t.prototype.Bf = function(t) {
            t = Jt.os(t.query, t.docs, t.ns, t.fromCache), this.xf = !0, this.Mf.next(t);
        }, t;
    }(), Ii = /** @class */ function() {
        function t() {}
        return t.prototype.bu = function(t) {
            this.Uf = t;
        }, t.prototype.Zn = function(t, e, n, i) {
            var o = this;
            // Queries that match all documents don't benefit from using
            // IndexFreeQueries. It is more efficient to scan all documents in a
            // collection, rather than to perform individual lookups.
                    return e.te() || n.isEqual(g.min()) ? this.Qf(t, e) : this.Uf.Yn(t, i).next((function(s) {
                var u = o.Wf(e, s);
                return (e.oe() || e.ae()) && o.Sd(e.Bt, u, i, n) ? o.Qf(t, e) : (fe() <= r.LogLevel.DEBUG && le("IndexFreeQueryEngine", "Re-using previous result from %s to execute query: %s", n.toString(), e.toString()), 
                o.Uf.Zn(t, e, n).next((function(t) {
                    // We merge `previousResults` into `updateResults`, since
                    // `updateResults` is already a DocumentMap. If a document is
                    // contained in both lists, then its contents are the same.
                    return u.forEach((function(e) {
                        t = t.Ae(e.key, e);
                    })), t;
                })));
            }));
            // Queries that have never seen a snapshot without limbo free documents
            // should also be run as a full collection scan.
            }, 
        /** Applies the query filter and sorting to the provided documents.  */ t.prototype.Wf = function(t, e) {
            // Sort the documents and re-apply the query filter since previously
            // matching documents do not necessarily still match the query.
            var n = new Ot((function(e, n) {
                return t.se(e, n);
            }));
            return e.forEach((function(e, r) {
                r instanceof yt && t.matches(r) && (n = n.add(r));
            })), n;
        }, 
        /**
         * Determines if a limit query needs to be refilled from cache, making it
         * ineligible for index-free execution.
         *
         * @param sortedPreviousResults The documents that matched the query when it
         * was last synchronized, sorted by the query's comparator.
         * @param remoteKeys The document keys that matched the query at the last
         * snapshot.
         * @param limboFreeSnapshotVersion The version of the snapshot when the query
         * was last synchronized.
         */
        t.prototype.Sd = function(t, e, n, r) {
            // The query needs to be refilled if a previously matching document no
            // longer matches.
            if (n.size !== e.size) return !0;
            // Limit queries are not eligible for index-free query execution if there is
            // a potential that an older document from cache now sorts before a document
            // that was previously part of the limit. This, however, can only happen if
            // the document at the edge of the limit goes out of limit.
            // If a document that is not the limit boundary sorts differently,
            // the boundary of the limit itself did not change and documents from cache
            // will continue to be "rejected" by this boundary. Therefore, we can ignore
            // any modifications that don't affect the last document.
                    var i = "F" /* First */ === t ? e.last() : e.first();
            return !!i && (i.hasPendingWrites || i.version.S(r) > 0);
        }, t.prototype.Qf = function(t, e) {
            return fe() <= r.LogLevel.DEBUG && le("IndexFreeQueryEngine", "Using full collection scan to execute query:", e.toString()), 
            this.Uf.Zn(t, e, g.min());
        }, t;
    }(), Ni = /** @class */ function() {
        function t(t, e) {
            this.jn = t, this.hh = e, 
            /**
                 * The set of all mutations that have been sent but not yet been applied to
                 * the backend.
                 */
            this.Wn = [], 
            /** Next value to use when assigning sequential IDs to each mutation batch. */
            this.jf = 1, 
            /** An ordered mapping between documents and the mutations batch IDs. */
            this.Kf = new Ot(er.Ju);
        }
        return t.prototype.Ho = function(t) {
            return xe.resolve(0 === this.Wn.length);
        }, t.prototype.Yo = function(t, e, n, r) {
            var i = this.jf;
            this.jf++, this.Wn.length > 0 && this.Wn[this.Wn.length - 1];
            var o = new Ne(i, e, n, r);
            this.Wn.push(o);
            // Track references by document key and index collection parents.
            for (var s = 0, u = r; s < u.length; s++) {
                var a = u[s];
                this.Kf = this.Kf.add(new er(a.key, i)), this.jn.Dr(t, a.key.path.$());
            }
            return xe.resolve(o);
        }, t.prototype.Jo = function(t, e) {
            return xe.resolve(this.Gf(e));
        }, t.prototype.Zo = function(t, e) {
            var n = e + 1, r = this.zf(n), i = r < 0 ? 0 : r;
            // The requested batchId may still be out of range so normalize it to the
            // start of the queue.
                    return xe.resolve(this.Wn.length > i ? this.Wn[i] : null);
        }, t.prototype.ta = function() {
            return xe.resolve(0 === this.Wn.length ? -1 : this.jf - 1);
        }, t.prototype.ea = function(t) {
            return xe.resolve(this.Wn.slice());
        }, t.prototype.Gn = function(t, e) {
            var n = this, r = new er(e, 0), i = new er(e, Number.POSITIVE_INFINITY), o = [];
            return this.Kf.Ke([ r, i ], (function(t) {
                var e = n.Gf(t.hc);
                o.push(e);
            })), xe.resolve(o);
        }, t.prototype.Xn = function(t, e) {
            var n = this, r = new Ot(we);
            return e.forEach((function(t) {
                var e = new er(t, 0), i = new er(t, Number.POSITIVE_INFINITY);
                n.Kf.Ke([ e, i ], (function(t) {
                    r = r.add(t.hc);
                }));
            })), xe.resolve(this.Hf(r));
        }, t.prototype.nr = function(t, e) {
            // Use the query path as a prefix for testing if a document matches the
            // query.
            var n = e.path, r = n.length + 1, i = n;
            // Construct a document reference for actually scanning the index. Unlike
            // the prefix the document key in this reference must have an even number of
            // segments. The empty segment can be used a suffix of the query path
            // because it precedes all other segments in an ordered traversal.
                    b.et(i) || (i = i.child(""));
            var o = new er(new b(i), 0), s = new Ot(we);
            // Find unique batchIDs referenced by all documents potentially matching the
            // query.
                    return this.Kf.Ge((function(t) {
                var e = t.key.path;
                return !!n.q(e) && (
                // Rows with document keys more than one segment longer than the query
                // path can't be matches. For example, a query on 'rooms' can't match
                // the document /rooms/abc/messages/xyx.
                // TODO(mcg): we'll need a different scanner when we implement
                // ancestor queries.
                e.length === r && (s = s.add(t.hc)), !0);
            }), o), xe.resolve(this.Hf(s));
        }, t.prototype.Hf = function(t) {
            var e = this, n = [];
            // Construct an array of matching batches, sorted by batchID to ensure that
            // multiple mutations affecting the same document key are applied in order.
                    return t.forEach((function(t) {
                var r = e.Gf(t);
                null !== r && n.push(r);
            })), n;
        }, t.prototype.ia = function(t, e) {
            var n = this;
            ve(0 === this.Yf(e.batchId, "removed")), this.Wn.shift();
            var r = this.Kf;
            return xe.forEach(e.mutations, (function(i) {
                var o = new er(i.key, e.batchId);
                return r = r.delete(o), n.hh.Uo(t, i.key);
            })).next((function() {
                n.Kf = r;
            }));
        }, t.prototype.na = function(t) {
            // No-op since the memory mutation queue does not maintain a separate cache.
        }, t.prototype.Ch = function(t, e) {
            var n = new er(e, 0), r = this.Kf.ze(n);
            return xe.resolve(e.isEqual(r && r.key));
        }, t.prototype.ra = function(t) {
            return this.Wn.length, xe.resolve();
        }, 
        /**
         * Finds the index of the given batchId in the mutation queue and asserts that
         * the resulting index is within the bounds of the queue.
         *
         * @param batchId The batchId to search for
         * @param action A description of what the caller is doing, phrased in passive
         * form (e.g. "acknowledged" in a routine that acknowledges batches).
         */
        t.prototype.Yf = function(t, e) {
            return this.zf(t);
        }, 
        /**
         * Finds the index of the given batchId in the mutation queue. This operation
         * is O(1).
         *
         * @return The computed index of the batch with the given batchId, based on
         * the state of the queue. Note this index can be negative if the requested
         * batchId has already been remvoed from the queue or past the end of the
         * queue if the batchId is larger than the last added batch.
         */
        t.prototype.zf = function(t) {
            return 0 === this.Wn.length ? 0 : t - this.Wn[0].batchId;
            // Examine the front of the queue to figure out the difference between the
            // batchId and indexes in the array. Note that since the queue is ordered
            // by batchId, if the first batch has a larger batchId then the requested
            // batchId doesn't exist in the queue.
            }, 
        /**
         * A version of lookupMutationBatch that doesn't return a promise, this makes
         * other functions that uses this code easier to read and more efficent.
         */
        t.prototype.Gf = function(t) {
            var e = this.zf(t);
            return e < 0 || e >= this.Wn.length ? null : this.Wn[e];
        }, t;
    }(), Ai = /** @class */ function() {
        /**
         * @param sizer Used to assess the size of a document. For eager GC, this is expected to just
         * return 0 to avoid unnecessarily doing the work of calculating the size.
         */
        function t(t, e) {
            this.jn = t, this.Jf = e, 
            /** Underlying cache of documents and their read times. */
            this.docs = new Pt(b.N), 
            /** Size of all cached documents. */
            this.size = 0
            /**
         * Adds the supplied entry to the cache and updates the cache size as appropriate.
         *
         * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */;
        }
        return t.prototype.Nn = function(t, e, n) {
            var r = e.key, i = this.docs.get(r), o = i ? i.size : 0, s = this.Jf(e);
            return this.docs = this.docs.Ae(r, {
                $r: e,
                size: s,
                readTime: n
            }), this.size += s - o, this.jn.Dr(t, r.path.$());
        }, 
        /**
         * Removes the specified entry from the cache and updates the cache size as appropriate.
         *
         * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */
        t.prototype.Mn = function(t) {
            var e = this.docs.get(t);
            e && (this.docs = this.docs.remove(t), this.size -= e.size);
        }, t.prototype.xn = function(t, e) {
            var n = this.docs.get(e);
            return xe.resolve(n ? n.$r : null);
        }, t.prototype.getEntries = function(t, e) {
            var n = this, r = jt();
            return e.forEach((function(t) {
                var e = n.docs.get(t);
                r = r.Ae(t, e ? e.$r : null);
            })), xe.resolve(r);
        }, t.prototype.Zn = function(t, e, n) {
            for (var r = Ft(), i = new b(e.path.child("")), o = this.docs.ve(i)
            // Documents are ordered by key, so we can use a prefix scan to narrow down
            // the documents we need to match the query against.
            ; o.ke(); ) {
                var s = o.Ne(), u = s.key, a = s.value, c = a.$r, h = a.readTime;
                if (!e.path.q(u.path)) break;
                h.S(n) <= 0 || c instanceof yt && e.matches(c) && (r = r.Ae(c.key, c));
            }
            return xe.resolve(r);
        }, t.prototype.Xf = function(t, e) {
            return xe.forEach(this.docs, (function(t) {
                return e(t);
            }));
        }, t.prototype.Yr = function(e) {
            // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
            // a separate changelog and does not need special handling for removals.
            return new t.Jr(this);
        }, t.prototype.Zr = function(t) {
            return xe.resolve(this.size);
        }, t;
    }();

    /**
     * Holds the state of a query target, including its target ID and whether the
     * target is 'not-current', 'current' or 'rejected'.
     */
    // Visible for testing
    /**
     * Handles the details of adding and updating documents in the MemoryRemoteDocumentCache.
     */
    Ai.Jr = /** @class */ function(t) {
        function n(e) {
            var n = this;
            return (n = t.call(this) || this).th = e, n;
        }
        return e.__extends(n, t), n.prototype.Ln = function(t) {
            var e = this, n = [];
            return this.Dn.forEach((function(r, i) {
                i ? n.push(e.th.Nn(t, i, e.readTime)) : e.th.Mn(r);
            })), xe.vn(n);
        }, n.prototype.$n = function(t, e) {
            return this.th.xn(t, e);
        }, n.prototype.On = function(t, e) {
            return this.th.getEntries(t, e);
        }, n;
    }(De);

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var xi = /** @class */ function() {
        function t(t) {
            this.persistence = t, 
            /**
                 * Maps a target to the data about that target
                 */
            this.Zf = new Ie((function(t) {
                return t.canonicalId();
            })), 
            /** The last received snapshot version. */
            this.lastRemoteSnapshotVersion = g.min(), 
            /** The highest numbered target ID encountered. */
            this.highestTargetId = 0, 
            /** The highest sequence number encountered. */
            this.tT = 0, 
            /**
                 * A ordered bidirectional mapping between documents and the remote target
                 * IDs.
                 */
            this.eT = new tr, this.targetCount = 0, this.sT = Je.nh();
        }
        return t.prototype.js = function(t, e) {
            return this.Zf.forEach((function(t, n) {
                return e(n);
            })), xe.resolve();
        }, t.prototype._h = function(t) {
            return xe.resolve(this.lastRemoteSnapshotVersion);
        }, t.prototype.lh = function(t) {
            return xe.resolve(this.tT);
        }, t.prototype.oh = function(t) {
            return this.highestTargetId = this.sT.next(), xe.resolve(this.highestTargetId);
        }, t.prototype.dh = function(t, e, n) {
            return n && (this.lastRemoteSnapshotVersion = n), e > this.tT && (this.tT = e), 
            xe.resolve();
        }, t.prototype.Th = function(t) {
            this.Zf.set(t.target, t);
            var e = t.targetId;
            e > this.highestTargetId && (this.sT = new Je(e), this.highestTargetId = e), t.sequenceNumber > this.tT && (this.tT = t.sequenceNumber);
        }, t.prototype.fh = function(t, e) {
            return this.Th(e), this.targetCount += 1, xe.resolve();
        }, t.prototype.Ih = function(t, e) {
            return this.Th(e), xe.resolve();
        }, t.prototype.wh = function(t, e) {
            return this.Zf.delete(e.target), this.eT.ic(e.targetId), this.targetCount -= 1, 
            xe.resolve();
        }, t.prototype.Ah = function(t, e, n) {
            var r = this, i = 0, o = [];
            return this.Zf.forEach((function(s, u) {
                u.sequenceNumber <= e && null === n.get(u.targetId) && (r.Zf.delete(s), o.push(r.Rh(t, u.targetId)), 
                i++);
            })), xe.vn(o).next((function() {
                return i;
            }));
        }, t.prototype.Vh = function(t) {
            return xe.resolve(this.targetCount);
        }, t.prototype.gh = function(t, e) {
            var n = this.Zf.get(e) || null;
            return xe.resolve(n);
        }, t.prototype.ph = function(t, e, n) {
            return this.eT.tc(e, n), xe.resolve();
        }, t.prototype.bh = function(t, e, n) {
            this.eT.sc(e, n);
            var r = this.persistence.hh, i = [];
            return r && e.forEach((function(e) {
                i.push(r.Uo(t, e));
            })), xe.vn(i);
        }, t.prototype.Rh = function(t, e) {
            return this.eT.ic(e), xe.resolve();
        }, t.prototype.Sh = function(t, e) {
            var n = this.eT.rc(e);
            return xe.resolve(n);
        }, t.prototype.Ch = function(t, e) {
            return xe.resolve(this.eT.Ch(e));
        }, t;
    }(), Di = /** @class */ function() {
        /**
         * The constructor accepts a factory for creating a reference delegate. This
         * allows both the delegate and this instance to have strong references to
         * each other without having nullable fields that would then need to be
         * checked or asserted on every access.
         */
        function t(t) {
            var e = this;
            this.iT = {}, this.qh = new Ve(0), this.Uh = !1, this.Uh = !0, this.hh = t(this), 
            this.Jh = new xi(this), this.jn = new Me, this.Qn = new Ai(this.jn, (function(t) {
                return e.hh.nT(t);
            }));
        }
        return t.prototype.start = function() {
            return Promise.resolve();
        }, t.prototype.Vo = function() {
            // No durable state to ensure is closed on shutdown.
            return this.Uh = !1, Promise.resolve();
        }, Object.defineProperty(t.prototype, "ho", {
            get: function() {
                return this.Uh;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.oo = function() {
            // No op.
        }, t.prototype.ko = function() {
            return this.jn;
        }, t.prototype.Do = function(t) {
            var e = this.iT[t.s()];
            return e || (e = new Ni(this.jn, this.hh), this.iT[t.s()] = e), e;
        }, t.prototype.Fo = function() {
            return this.Jh;
        }, t.prototype.No = function() {
            return this.Qn;
        }, t.prototype.runTransaction = function(t, e, n) {
            var r = this;
            le("MemoryPersistence", "Starting transaction:", t);
            var i = new Si(this.qh.next());
            return this.hh.rT(), n(i).next((function(t) {
                return r.hh.hT(i).next((function() {
                    return t;
                }));
            })).yn().then((function(t) {
                return i.Un(), t;
            }));
        }, t.prototype.oT = function(t, e) {
            return xe.Sn(Object.values(this.iT).map((function(n) {
                return function() {
                    return n.Ch(t, e);
                };
            })));
        }, t;
    }(), Si = /** @class */ function(t) {
        function n(e) {
            var n = this;
            return (n = t.call(this) || this).Oh = e, n;
        }
        return e.__extends(n, t), n;
    }(Re), Ri = /** @class */ function() {
        function t(t) {
            this.persistence = t, 
            /** Tracks all documents that are active in Query views. */
            this.aT = new tr, 
            /** The list of documents that are potentially GCed after each transaction. */
            this.uT = null;
        }
        return t.cT = function(e) {
            return new t(e);
        }, Object.defineProperty(t.prototype, "_T", {
            get: function() {
                if (this.uT) return this.uT;
                throw ye();
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.yh = function(t, e, n) {
            return this.aT.yh(n, e), this._T.delete(n), xe.resolve();
        }, t.prototype.vh = function(t, e, n) {
            return this.aT.vh(n, e), this._T.add(n), xe.resolve();
        }, t.prototype.Uo = function(t, e) {
            return this._T.add(e), xe.resolve();
        }, t.prototype.removeTarget = function(t, e) {
            var n = this;
            this.aT.ic(e.targetId).forEach((function(t) {
                return n._T.add(t);
            }));
            var r = this.persistence.Fo();
            return r.Sh(t, e.targetId).next((function(t) {
                t.forEach((function(t) {
                    return n._T.add(t);
                }));
            })).next((function() {
                return r.wh(t, e);
            }));
        }, t.prototype.rT = function() {
            this.uT = new Set;
        }, t.prototype.hT = function(t) {
            var e = this, n = this.persistence.No().Yr();
            // Remove newly orphaned documents.
                    return xe.forEach(this._T, (function(r) {
                return e.lT(t, r).next((function(t) {
                    t || n.Mn(r);
                }));
            })).next((function() {
                return e.uT = null, n.apply(t);
            }));
        }, t.prototype.Ko = function(t, e) {
            var n = this;
            return this.lT(t, e).next((function(t) {
                t ? n._T.delete(e) : n._T.add(e);
            }));
        }, t.prototype.nT = function(t) {
            // For eager GC, we don't care about the document size, there are no size thresholds.
            return 0;
        }, t.prototype.lT = function(t, e) {
            var n = this;
            return xe.Sn([ function() {
                return xe.resolve(n.aT.Ch(e));
            }, function() {
                return n.persistence.Fo().Ch(t, e);
            }, function() {
                return n.persistence.oT(t, e);
            } ]);
        }, t;
    }(), ki = "You are using the memory-only build of Firestore. Persistence support is only available via the @firebase/firestore bundle or the firebase-firestore.js build.", Pi = /** @class */ function() {
        function t() {}
        return t.prototype.initialize = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n = this;
                return e.__generator(this, (function(e) {
                    switch (e.label) {
                      case 0:
                        return this.jd = this.dT(t), this.persistence = this.fT(t), [ 4 /*yield*/ , this.persistence.start() ];

                      case 1:
                        return e.sent(), this.TT = this.ET(t), this.x_ = this.IT(t), this.Wd = this.wT(t), 
                        this.cl = this.RT(t), this.AT = this.mT(t), this.jd.b_ = function(t) {
                            return n.cl.Nd(t, 1 /* SharedClientState */);
                        }, this.Wd.cl = this.cl, [ 4 /*yield*/ , this.x_.start() ];

                      case 2:
                        return e.sent(), [ 4 /*yield*/ , this.jd.start() ];

                      case 3:
                        return e.sent(), [ 4 /*yield*/ , this.Wd.start() ];

                      case 4:
                        return e.sent(), [ 4 /*yield*/ , this.Wd.yl(this.cl.if) ];

                      case 5:
                        return e.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, t.prototype.mT = function(t) {
            return new bi(this.cl);
        }, t.prototype.ET = function(t) {
            return null;
        }, t.prototype.IT = function(t) {
            return new Hn(this.persistence, new Ii, t.PT);
        }, t.prototype.fT = function(t) {
            if (t.gT.VT) throw new h(c.FAILED_PRECONDITION, ki);
            return new Di(Ri.cT);
        }, t.prototype.wT = function(t) {
            var e = this;
            return new ni(this.x_, t.w_, t.Ra, (function(t) {
                return e.cl.Nd(t, 0 /* RemoteStore */);
            }), t.platform.pT());
        }, t.prototype.dT = function(t) {
            return new li;
        }, t.prototype.RT = function(t) {
            return new wi(this.x_, this.Wd, t.w_, this.jd, t.PT, t.Kd);
        }, t.prototype.clearPersistence = function(t) {
            throw new h(c.FAILED_PRECONDITION, ki);
        }, t;
    }(), Vi = /** @class */ function(t) {
        function n() {
            return null !== t && t.apply(this, arguments) || this;
        }
        return e.__extends(n, t), n.prototype.initialize = function(n) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var r = this;
                return e.__generator(this, (function(i) {
                    switch (i.label) {
                      case 0:
                        return [ 4 /*yield*/ , t.prototype.initialize.call(this, n) ];

                      case 1:
                        // NOTE: This will immediately call the listener, so we make sure to
                        // set it after localStore / remoteStore are started.
                        return i.sent(), [ 4 /*yield*/ , this.persistence.ro((function(t) {
                            return e.__awaiter(r, void 0, void 0, (function() {
                                return e.__generator(this, (function(e) {
                                    switch (e.label) {
                                      case 0:
                                        return [ 4 /*yield*/ , this.cl.yl(t) ];

                                      case 1:
                                        return e.sent(), this.TT && (t && !this.TT.ho ? this.TT.start(this.x_) : t || this.TT.stop()), 
                                        [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        })) ];

                      case 2:
                        // NOTE: This will immediately call the listener, so we make sure to
                        // set it after localStore / remoteStore are started.
                        return i.sent(), [ 2 /*return*/ ];
                    }
                }));
            }));
        }, n.prototype.IT = function(t) {
            return new $n(this.persistence, new Ii, t.PT);
        }, n.prototype.RT = function(t) {
            var e = new Ei(this.x_, this.Wd, t.w_, this.jd, t.PT, t.Kd);
            return this.jd instanceof fi && (this.jd.cl = e), e;
        }, n.prototype.ET = function(t) {
            var e = this.persistence.hh.$o;
            return new Jn(e, t.Ra);
        }, n.prototype.fT = function(t) {
            var e = rn.xo(t.yT), n = t.platform.Cc(t.yT.ii);
            return new rn(t.gT.synchronizeTabs, e, t.clientId, t.platform, Yn.nu(t.gT.cacheSizeBytes), t.Ra, n, this.jd, t.gT.Bh);
        }, n.prototype.dT = function(t) {
            if (t.gT.VT && t.gT.synchronizeTabs) {
                if (!fi.zh(t.platform)) throw new h(c.UNIMPLEMENTED, "IndexedDB persistence is only available on platforms that support LocalStorage.");
                var e = rn.xo(t.yT);
                return new fi(t.Ra, t.platform, e, t.clientId, t.PT);
            }
            return new li;
        }, n.prototype.clearPersistence = function(t) {
            var e = rn.xo(t);
            return rn.clearPersistence(e);
        }, n;
    }(Pi), Li = /** @class */ function() {
        function t(t, e, n, 
        /**
         * Asynchronous queue responsible for all of our internal processing. When
         * we get incoming work from the user (via public API) or the network
         * (incoming GRPC messages), we should always schedule onto this queue.
         * This ensures all of our work is properly serialized (e.g. we don't
         * start processing a new operation while the previous one is waiting for
         * an async I/O to complete).
         */
        r) {
            this.platform = t, this.yT = e, this.credentials = n, this.Ra = r, this.clientId = me.cn()
            /**
         * Starts up the FirestoreClient, returning only whether or not enabling
         * persistence succeeded.
         *
         * The intent here is to "do the right thing" as far as users are concerned.
         * Namely, in cases where offline persistence is requested and possible,
         * enable it, but otherwise fall back to persistence disabled. For the most
         * part we expect this to succeed one way or the other so we don't expect our
         * users to actually wait on the firestore.enablePersistence Promise since
         * they generally won't care.
         *
         * Of course some users actually do care about whether or not persistence
         * was successfully enabled, so the Promise returned from this method
         * indicates this outcome.
         *
         * This presents a problem though: even before enablePersistence resolves or
         * rejects, users may have made calls to e.g. firestore.collection() which
         * means that the FirestoreClient in there will be available and will be
         * enqueuing actions on the async queue.
         *
         * Meanwhile any failure of an operation on the async queue causes it to
         * panic and reject any further work, on the premise that unhandled errors
         * are fatal.
         *
         * Consequently the fallback is handled internally here in start, and if the
         * fallback succeeds we signal success to the async queue even though the
         * start() itself signals failure.
         *
         * @param componentProvider Provider that returns all core components.
         * @param persistenceSettings Settings object to configure offline
         *     persistence.
         * @returns A deferred result indicating the user-visible result of enabling
         *     offline persistence. This method will reject this if IndexedDB fails to
         *     start for any reason. If usePersistence is false this is
         *     unconditionally resolved.
         */;
        }
        return t.prototype.start = function(t, e) {
            var n = this;
            this.T_();
            // We defer our initialization until we get the current user from
            // setChangeListener(). We block the async queue until we got the initial
            // user and the initialization is completed. This will prevent any scheduled
            // work from happening before initialization is completed.
            // If initializationDone resolved then the FirestoreClient is in a usable
            // state.
            var r = new Le, i = new Le, o = !1;
            // If usePersistence is true, certain classes of errors while starting are
            // recoverable but only by falling back to persistence disabled.
            // If there's an error in the first case but not in recovery we cannot
            // reject the promise blocking the async queue because this will cause the
            // async queue to panic.
                    // Return only the result of enabling persistence. Note that this does not
            // need to await the completion of initializationDone because the result of
            // this method should not reflect any other kind of failure to start.
            return this.credentials.l((function(s) {
                if (!o) return o = !0, le("FirestoreClient", "Initializing. user=", s.uid), n.bT(t, e, s, i).then(r.resolve, r.reject);
                n.Ra.lo((function() {
                    return n.pl(s);
                }));
            })), 
            // Block the async queue until initialization is done
            this.Ra.co((function() {
                return r.promise;
            })), i.promise;
        }, 
        /** Enables the network connection and requeues all pending operations. */ t.prototype.enableNetwork = function() {
            var t = this;
            return this.T_(), this.Ra.enqueue((function() {
                return t.cl.enableNetwork();
            }));
        }, 
        /**
         * Initializes persistent storage, attempting to use IndexedDB if
         * usePersistence is true or memory-only if false.
         *
         * If IndexedDB fails because it's already open in another tab or because the
         * platform can't possibly support our implementation then this method rejects
         * the persistenceResult and falls back on memory-only persistence.
         *
         * @param componentProvider The provider that provides all core componennts
         *     for IndexedDB or memory-backed persistence
         * @param persistenceSettings Settings object to configure offline persistence
         * @param user The initial user
         * @param persistenceResult A deferred result indicating the user-visible
         *     result of enabling offline persistence. This method will reject this if
         *     IndexedDB fails to start for any reason. If usePersistence is false
         *     this is unconditionally resolved.
         * @returns a Promise indicating whether or not initialization should
         *     continue, i.e. that one of the persistence implementations actually
         *     succeeded.
         */
        t.prototype.bT = function(t, n, r, i) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var o, s, u, a, c = this;
                return e.__generator(this, (function(h) {
                    switch (h.label) {
                      case 0:
                        return h.trys.push([ 0, 3, , 4 ]), [ 4 /*yield*/ , this.platform.vT(this.yT) ];

                      case 1:
                        return o = h.sent(), s = this.platform.Cc(this.yT.ii), u = function(t, e, n) {
                            return new Zr(t, e, n);
                        }(o, this.credentials, s), [ 4 /*yield*/ , t.initialize({
                            Ra: this.Ra,
                            yT: this.yT,
                            platform: this.platform,
                            w_: u,
                            clientId: this.clientId,
                            PT: r,
                            Kd: 100,
                            gT: n
                        }) ];

                      case 2:
                        return h.sent(), this.persistence = t.persistence, this.jd = t.jd, this.x_ = t.x_, 
                        this.Wd = t.Wd, this.cl = t.cl, this.TT = t.TT, this.ST = t.AT, 
                        // When a user calls clearPersistence() in one client, all other clients
                        // need to be terminated to allow the delete to succeed.
                        this.persistence.oo((function() {
                            return e.__awaiter(c, void 0, void 0, (function() {
                                return e.__generator(this, (function(t) {
                                    switch (t.label) {
                                      case 0:
                                        return [ 4 /*yield*/ , this.terminate() ];

                                      case 1:
                                        return t.sent(), [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        })), i.resolve(), [ 3 /*break*/ , 4 ];

                      case 3:
                        // An unknown failure on the first stage shuts everything down.
                        if (a = h.sent(), 
                        // Regardless of whether or not the retry succeeds, from an user
                        // perspective, offline persistence has failed.
                        i.reject(a), !this.DT(a)) throw a;
                        return [ 2 /*return*/ , (console.warn("Error enabling offline persistence. Falling back to persistence disabled: " + a), 
                        this.bT(new Pi, {
                            VT: !1
                        }, r, i)) ];

                      case 4:
                        return [ 2 /*return*/ ];
                    }
                }));
            }));
        }, 
        /**
         * Decides whether the provided error allows us to gracefully disable
         * persistence (as opposed to crashing the client).
         */
        t.prototype.DT = function(t) {
            return "FirebaseError" === t.name ? t.code === c.FAILED_PRECONDITION || t.code === c.UNIMPLEMENTED : !("undefined" != typeof DOMException && t instanceof DOMException) || 
            // When the browser is out of quota we could get either quota exceeded
            // or an aborted error depending on whether the error happened during
            // schema migration.
            22 === t.code || 20 === t.code || 
            // Firefox Private Browsing mode disables IndexedDb and returns
            // INVALID_STATE for any usage.
            11 === t.code;
        }, 
        /**
         * Checks that the client has not been terminated. Ensures that other methods on
         * this class cannot be called after the client is terminated.
         */
        t.prototype.T_ = function() {
            if (this.Ra.Ma) throw new h(c.FAILED_PRECONDITION, "The client has already been terminated.");
        }, t.prototype.pl = function(t) {
            return this.Ra.Ua(), le("FirestoreClient", "Credential Changed. Current user: " + t.uid), 
            this.cl.pl(t);
        }, 
        /** Disables the network connection. Pending operations will not complete. */ t.prototype.disableNetwork = function() {
            var t = this;
            return this.T_(), this.Ra.enqueue((function() {
                return t.cl.disableNetwork();
            }));
        }, t.prototype.terminate = function() {
            var t = this;
            return this.Ra.Ba((function() {
                return e.__awaiter(t, void 0, void 0, (function() {
                    return e.__generator(this, (function(t) {
                        switch (t.label) {
                          case 0:
                            // PORTING NOTE: LocalStore does not need an explicit shutdown on web.
                            return this.TT && this.TT.stop(), [ 4 /*yield*/ , this.Wd.Vo() ];

                          case 1:
                            return t.sent(), [ 4 /*yield*/ , this.jd.Vo() ];

                          case 2:
                            return t.sent(), [ 4 /*yield*/ , this.persistence.Vo() ];

                          case 3:
                            // PORTING NOTE: LocalStore does not need an explicit shutdown on web.
                            return t.sent(), 
                            // `removeChangeListener` must be called after shutting down the
                            // RemoteStore as it will prevent the RemoteStore from retrieving
                            // auth tokens.
                            this.credentials.T(), [ 2 /*return*/ ];
                        }
                    }));
                }));
            }));
        }, 
        /**
         * Returns a Promise that resolves when all writes that were pending at the time this
         * method was called received server acknowledgement. An acknowledgement can be either acceptance
         * or rejection.
         */
        t.prototype.waitForPendingWrites = function() {
            var t = this;
            this.T_();
            var e = new Le;
            return this.Ra.co((function() {
                return t.cl.Tf(e);
            })), e.promise;
        }, t.prototype.listen = function(t, e, n) {
            var r = this;
            this.T_();
            var i = new Ti(t, e, n);
            return this.Ra.co((function() {
                return r.ST.listen(i);
            })), i;
        }, t.prototype.al = function(t) {
            var e = this;
            // Checks for termination but does not raise error, allowing unlisten after
            // termination to be a no-op.
                    this.CT || this.Ra.co((function() {
                return e.ST.al(t);
            }));
        }, t.prototype.FT = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r = this;
                return e.__generator(this, (function(i) {
                    switch (i.label) {
                      case 0:
                        return this.T_(), n = new Le, [ 4 /*yield*/ , this.Ra.enqueue((function() {
                            return e.__awaiter(r, void 0, void 0, (function() {
                                var r, i, o;
                                return e.__generator(this, (function(e) {
                                    switch (e.label) {
                                      case 0:
                                        return e.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , this.x_.qu(t) ];

                                      case 1:
                                        return (r = e.sent()) instanceof yt ? n.resolve(r) : r instanceof vt ? n.resolve(null) : n.reject(new h(c.UNAVAILABLE, "Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)")), 
                                        [ 3 /*break*/ , 3 ];

                                      case 2:
                                        return i = e.sent(), o = Gn(i, "Failed to get document '" + t + " from cache"), 
                                        n.reject(o), [ 3 /*break*/ , 3 ];

                                      case 3:
                                        return [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        })) ];

                      case 1:
                        return [ 2 /*return*/ , (i.sent(), n.promise) ];
                    }
                }));
            }));
        }, t.prototype.NT = function(t) {
            return e.__awaiter(this, void 0, void 0, (function() {
                var n, r = this;
                return e.__generator(this, (function(i) {
                    switch (i.label) {
                      case 0:
                        return this.T_(), n = new Le, [ 4 /*yield*/ , this.Ra.enqueue((function() {
                            return e.__awaiter(r, void 0, void 0, (function() {
                                var r, i, o, s, u, a;
                                return e.__generator(this, (function(e) {
                                    switch (e.label) {
                                      case 0:
                                        return e.trys.push([ 0, 2, , 3 ]), [ 4 /*yield*/ , this.x_.Wu(t, 
                                        /* usePreviousResults= */ !0) ];

                                      case 1:
                                        return r = e.sent(), i = new yi(t, r.ju), o = i.yd(r.documents), s = i.Ln(o, 
                                        /* updateLimboDocuments= */ !1), n.resolve(s.snapshot), [ 3 /*break*/ , 3 ];

                                      case 2:
                                        return u = e.sent(), a = Gn(u, "Failed to execute query '" + t + " against cache"), 
                                        n.reject(a), [ 3 /*break*/ , 3 ];

                                      case 3:
                                        return [ 2 /*return*/ ];
                                    }
                                }));
                            }));
                        })) ];

                      case 1:
                        return [ 2 /*return*/ , (i.sent(), n.promise) ];
                    }
                }));
            }));
        }, t.prototype.write = function(t) {
            var e = this;
            this.T_();
            var n = new Le;
            return this.Ra.co((function() {
                return e.cl.write(t, n);
            })), n.promise;
        }, t.prototype.ii = function() {
            return this.yT.ii;
        }, t.prototype.Nf = function(t) {
            var e = this;
            this.T_(), this.Ra.co((function() {
                return e.ST.Nf(t), Promise.resolve();
            }));
        }, t.prototype.kf = function(t) {
            var e = this;
            // Checks for shutdown but does not raise error, allowing remove after
            // shutdown to be a no-op.
                    this.CT || this.Ra.co((function() {
                return e.ST.kf(t), Promise.resolve();
            }));
        }, Object.defineProperty(t.prototype, "CT", {
            get: function() {
                // Technically, the asyncQueue is still running, but only accepting operations
                // related to termination or supposed to be run after termination. It is effectively
                // terminated to the eyes of users.
                return this.Ra.Ma;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.transaction = function(t) {
            var e = this;
            this.T_();
            var n = new Le;
            return this.Ra.co((function() {
                return e.cl.runTransaction(e.Ra, t, n), Promise.resolve();
            })), n.promise;
        }, t;
    }(), Oi = /** @class */ function() {
        function t(t) {
            this.observer = t, 
            /**
                 * When set to true, will not raise future events. Necessary to deal with
                 * async detachment of listener.
                 */
            this.muted = !1;
        }
        return t.prototype.next = function(t) {
            this.kT(this.observer.next, t);
        }, t.prototype.error = function(t) {
            this.kT(this.observer.error, t);
        }, t.prototype.MT = function() {
            this.muted = !0;
        }, t.prototype.kT = function(t, e) {
            var n = this;
            this.muted || setTimeout((function() {
                n.muted || t(e);
            }), 0);
        }, t;
    }();

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A memory-backed instance of Persistence. Data is stored only in RAM and
     * not persisted across sessions.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function Ui(t) {
        /**
     * Returns true if obj is an object and contains at least one of the specified
     * methods.
     */
        return function(t, e) {
            if ("object" != typeof t || null === t) return !1;
            for (var n = t, r = 0, i = [ "next", "error", "complete" ]; r < i.length; r++) {
                var o = i[r];
                if (o in n && "function" == typeof n[o]) return !0;
            }
            return !1;
        }(t);
    }

    var Ci = /** @class */ function() {
        function t(t, e, n, r) {
            this.ii = t, this.timestampsInSnapshots = e, this.xT = n, this.$T = r;
        }
        return t.prototype.OT = function(t) {
            switch (V(t)) {
              case 0 /* NullValue */ :
                return null;

              case 1 /* BooleanValue */ :
                return t.booleanValue;

              case 2 /* NumberValue */ :
                return M(t.integerValue || t.doubleValue);

              case 3 /* TimestampValue */ :
                return this.LT(t.timestampValue);

              case 4 /* ServerTimestampValue */ :
                return this.BT(t);

              case 5 /* StringValue */ :
                return t.stringValue;

              case 6 /* BlobValue */ :
                return new Tr(F(t.bytesValue));

              case 7 /* RefValue */ :
                return this.qT(t.referenceValue);

              case 8 /* GeoPointValue */ :
                return this.UT(t.geoPointValue);

              case 9 /* ArrayValue */ :
                return this.QT(t.arrayValue);

              case 10 /* ObjectValue */ :
                return this.WT(t.mapValue);

              default:
                throw ye();
            }
        }, t.prototype.WT = function(t) {
            var e = this, n = {};
            return I(t.fields || {}, (function(t, r) {
                n[t] = e.OT(r);
            })), n;
        }, t.prototype.UT = function(t) {
            return new Or(M(t.latitude), M(t.longitude));
        }, t.prototype.QT = function(t) {
            var e = this;
            return (t.values || []).map((function(t) {
                return e.OT(t);
            }));
        }, t.prototype.BT = function(t) {
            switch (this.xT) {
              case "previous":
                var e = function t(e) {
                    var n = e.mapValue.fields.__previous_value__;
                    return R(n) ? t(n) : n;
                }(t);
                return null == e ? null : this.OT(e);

              case "estimate":
                return this.LT(k(t));

              default:
                return null;
            }
        }, t.prototype.LT = function(t) {
            var e = j(t), n = new v(e.seconds, e.nanos);
            return this.timestampsInSnapshots ? n : n.toDate();
        }, t.prototype.qT = function(t) {
            var e = w.K(t);
            ve(ae(e));
            var n = new Te(e.get(1), e.get(3)), r = new b(e.M(5));
            return n.isEqual(this.ii) || 
            // TODO(b/64130202): Somehow support foreign references.
            pe("Document " + r + " contains a document reference within a different database (" + n.projectId + "/" + n.database + ") which is not supported. It will be treated as a reference in the current database (" + this.ii.projectId + "/" + this.ii.database + ") instead."), 
            this.$T(r);
        }, t;
    }(), qi = Yn.ou, ji = /** @class */ function() {
        function t(t) {
            var e, n, r, i;
            if (void 0 === t.host) {
                if (void 0 !== t.ssl) throw new h(c.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
                this.host = "firestore.googleapis.com", this.ssl = !0;
            } else ar("settings", "non-empty string", "host", t.host), this.host = t.host, cr("settings", "boolean", "ssl", t.ssl), 
            this.ssl = null === (e = t.ssl) || void 0 === e || e;
            if (vr("settings", t, [ "host", "ssl", "credentials", "timestampsInSnapshots", "cacheSizeBytes", "experimentalForceLongPolling", "ignoreUndefinedProperties" ]), 
            cr("settings", "object", "credentials", t.credentials), this.credentials = t.credentials, 
            cr("settings", "boolean", "timestampsInSnapshots", t.timestampsInSnapshots), cr("settings", "boolean", "ignoreUndefinedProperties", t.ignoreUndefinedProperties), 
            // Nobody should set timestampsInSnapshots anymore, but the error depends on
            // whether they set it to true or false...
            !0 === t.timestampsInSnapshots ? pe("The setting 'timestampsInSnapshots: true' is no longer required and should be removed.") : !1 === t.timestampsInSnapshots && pe("Support for 'timestampsInSnapshots: false' will be removed soon. You must update your code to handle Timestamp objects."), 
            this.timestampsInSnapshots = null === (n = t.timestampsInSnapshots) || void 0 === n || n, 
            this.ignoreUndefinedProperties = null !== (r = t.ignoreUndefinedProperties) && void 0 !== r && r, 
            cr("settings", "number", "cacheSizeBytes", t.cacheSizeBytes), void 0 === t.cacheSizeBytes) this.cacheSizeBytes = Yn.uu; else {
                if (t.cacheSizeBytes !== qi && t.cacheSizeBytes < Yn.au) throw new h(c.INVALID_ARGUMENT, "cacheSizeBytes must be at least " + Yn.au);
                this.cacheSizeBytes = t.cacheSizeBytes;
            }
            cr("settings", "boolean", "experimentalForceLongPolling", t.experimentalForceLongPolling), 
            this.forceLongPolling = null !== (i = t.experimentalForceLongPolling) && void 0 !== i && i;
        }
        return t.prototype.isEqual = function(t) {
            return this.host === t.host && this.ssl === t.ssl && this.timestampsInSnapshots === t.timestampsInSnapshots && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.forceLongPolling === t.forceLongPolling && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties;
        }, t;
    }(), Mi = /** @class */ function() {
        // Note: We are using `MemoryComponentProvider` as a default
        // ComponentProvider to ensure backwards compatibility with the format
        // expected by the console build.
        function t(n, r, i) {
            var o = this;
            if (void 0 === i && (i = new Pi), this.jT = null, 
            // Public for use in tests.
            // TODO(mikelehen): Use modularized initialization instead.
            this.KT = new zn, this.INTERNAL = {
                delete: function() {
                    return e.__awaiter(o, void 0, void 0, (function() {
                        return e.__generator(this, (function(t) {
                            switch (t.label) {
                              case 0:
                                // The client must be initalized to ensure that all subsequent API usage
                                // throws an exception.
                                return this.GT(), [ 4 /*yield*/ , this.zT.terminate() ];

                              case 1:
                                // The client must be initalized to ensure that all subsequent API usage
                                // throws an exception.
                                return t.sent(), [ 2 /*return*/ ];
                            }
                        }));
                    }));
                }
            }, "object" == typeof n.options) {
                // This is very likely a Firebase app object
                // TODO(b/34177605): Can we somehow use instanceof?
                var s = n;
                this.jT = s, this.mc = t.HT(s), this.YT = s.name, this.JT = new p(r);
            } else {
                var u = n;
                if (!u.projectId) throw new h(c.INVALID_ARGUMENT, "Must provide projectId");
                this.mc = new Te(u.projectId, u.database), 
                // Use a default persistenceKey that lines up with FirebaseApp.
                this.YT = "[DEFAULT]", this.JT = new l;
            }
            this.XT = i, this.ZT = new ji({});
        }
        return Object.defineProperty(t.prototype, "tE", {
            get: function() {
                return this.eE || (
                // Lazy initialize UserDataReader once the settings are frozen
                this.eE = new Br(this.mc, this.ZT.ignoreUndefinedProperties)), this.eE;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.settings = function(t) {
            rr("Firestore.settings", arguments, 1), sr("Firestore.settings", "object", 1, t);
            var e = new ji(t);
            if (this.zT && !this.ZT.isEqual(e)) throw new h(c.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only call settings() before calling any other methods on a Firestore object.");
            this.ZT = e, void 0 !== e.credentials && (this.JT = function(t) {
                if (!t) return new l;
                switch (t.type) {
                  case "gapi":
                    var e = t.sE;
                    // Make sure this really is a Gapi client.
                                    return ve(!("object" != typeof e || null === e || !e.auth || !e.auth.getAuthHeaderValueForFirstParty)), 
                    new y(e, t.V || "0");

                  case "provider":
                    return t.sE;

                  default:
                    throw new h(c.INVALID_ARGUMENT, "makeCredentialsProvider failed due to invalid credential type");
                }
            }(e.credentials));
        }, t.prototype.enableNetwork = function() {
            return this.GT(), this.zT.enableNetwork();
        }, t.prototype.disableNetwork = function() {
            return this.GT(), this.zT.disableNetwork();
        }, t.prototype.enablePersistence = function(t) {
            var e, n;
            if (this.zT) throw new h(c.FAILED_PRECONDITION, "Firestore has already been started and persistence can no longer be enabled. You can only call enablePersistence() before calling any other methods on a Firestore object.");
            var r = !1, i = !1;
            if (t && (void 0 !== t.experimentalTabSynchronization && pe("The 'experimentalTabSynchronization' setting will be removed. Use 'synchronizeTabs' instead."), 
            r = null !== (n = null !== (e = t.synchronizeTabs) && void 0 !== e ? e : t.experimentalTabSynchronization) && void 0 !== n && n, 
            i = !!t.experimentalForceOwningTab && t.experimentalForceOwningTab, r && i)) throw new h(c.INVALID_ARGUMENT, "The 'experimentalForceOwningTab' setting cannot be used with 'synchronizeTabs'.");
            return this.iE(this.XT, {
                VT: !0,
                cacheSizeBytes: this.ZT.cacheSizeBytes,
                synchronizeTabs: r,
                Bh: i
            });
        }, t.prototype.clearPersistence = function() {
            return e.__awaiter(this, void 0, void 0, (function() {
                var t, n = this;
                return e.__generator(this, (function(r) {
                    if (void 0 !== this.zT && !this.zT.CT) throw new h(c.FAILED_PRECONDITION, "Persistence cannot be cleared after this Firestore instance is initialized.");
                    return t = new Le, [ 2 /*return*/ , (this.KT.xa((function() {
                        return e.__awaiter(n, void 0, void 0, (function() {
                            var n, r;
                            return e.__generator(this, (function(e) {
                                switch (e.label) {
                                  case 0:
                                    return e.trys.push([ 0, 2, , 3 ]), n = this.nE(), [ 4 /*yield*/ , this.XT.clearPersistence(n) ];

                                  case 1:
                                    return e.sent(), t.resolve(), [ 3 /*break*/ , 3 ];

                                  case 2:
                                    return r = e.sent(), t.reject(r), [ 3 /*break*/ , 3 ];

                                  case 3:
                                    return [ 2 /*return*/ ];
                                }
                            }));
                        }));
                    })), t.promise) ];
                }));
            }));
        }, t.prototype.terminate = function() {
            return this.app._removeServiceInstance("firestore"), this.INTERNAL.delete();
        }, Object.defineProperty(t.prototype, "rE", {
            get: function() {
                return this.GT(), this.zT.CT;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.waitForPendingWrites = function() {
            return this.GT(), this.zT.waitForPendingWrites();
        }, t.prototype.onSnapshotsInSync = function(t) {
            if (this.GT(), Ui(t)) return this.hE(t);
            sr("Firestore.onSnapshotsInSync", "function", 1, t);
            var e = {
                next: t
            };
            return this.hE(e);
        }, t.prototype.hE = function(t) {
            var e = this, n = new Oi({
                next: function() {
                    t.next && t.next();
                },
                error: function(t) {
                    throw ye();
                }
            });
            return this.zT.Nf(n), function() {
                n.MT(), e.zT.kf(n);
            };
        }, t.prototype.GT = function() {
            return this.zT || 
            // Kick off starting the client but don't actually wait for it.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.iE(new Pi, {
                VT: !1
            }), this.zT;
        }, t.prototype.nE = function() {
            return new be(this.mc, this.YT, this.ZT.host, this.ZT.ssl, this.ZT.forceLongPolling);
        }, t.prototype.iE = function(t, e) {
            var n = this.nE();
            return this.zT = new Li(ce.nt(), n, this.JT, this.KT), this.zT.start(t, e);
        }, t.HT = function(t) {
            if (e = t.options, !Object.prototype.hasOwnProperty.call(e, "projectId")) throw new h(c.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
            var e, n = t.options.projectId;
            /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
            /**
     * Helper function to prevent instantiation through the constructor.
     *
     * This method creates a new constructor that throws when it's invoked.
     * The prototype of that constructor is then set to the prototype of the hidden
     * "class" to expose all the prototype methods and allow for instanceof
     * checks.
     *
     * To also make all the static methods available, all properties of the
     * original constructor are copied to the new constructor.
     */        if (!n || "string" != typeof n) throw new h(c.INVALID_ARGUMENT, "projectId must be a string in FirebaseApp.options");
            return new Te(n);
        }, Object.defineProperty(t.prototype, "app", {
            get: function() {
                if (!this.jT) throw new h(c.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
                return this.jT;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.collection = function(t) {
            return rr("Firestore.collection", arguments, 1), sr("Firestore.collection", "non-empty string", 1, t), 
            this.GT(), new Ji(w.K(t), this, 
            /* converter= */ null);
        }, t.prototype.doc = function(t) {
            return rr("Firestore.doc", arguments, 1), sr("Firestore.doc", "non-empty string", 1, t), 
            this.GT(), zi.oE(w.K(t), this, 
            /* converter= */ null);
        }, t.prototype.collectionGroup = function(t) {
            if (rr("Firestore.collectionGroup", arguments, 1), sr("Firestore.collectionGroup", "non-empty string", 1, t), 
            t.indexOf("/") >= 0) throw new h(c.INVALID_ARGUMENT, "Invalid collection ID '" + t + "' passed to function Firestore.collectionGroup(). Collection IDs must not contain '/'.");
            return this.GT(), new Ki(new wt(w.G, t), this, 
            /* converter= */ null);
        }, t.prototype.runTransaction = function(t) {
            var e = this;
            return rr("Firestore.runTransaction", arguments, 1), sr("Firestore.runTransaction", "function", 1, t), 
            this.GT().transaction((function(n) {
                return t(new Fi(e, n));
            }));
        }, t.prototype.batch = function() {
            return this.GT(), new Bi(this);
        }, Object.defineProperty(t, "logLevel", {
            get: function() {
                switch (fe()) {
                  case r.LogLevel.DEBUG:
                    return "debug";

                  case r.LogLevel.ERROR:
                    return "error";

                  case r.LogLevel.SILENT:
                    return "silent";

                  case r.LogLevel.WARN:
                    return "warn";

                  case r.LogLevel.INFO:
                    return "info";

                  case r.LogLevel.VERBOSE:
                    return "verbose";

                  default:
                    // The default log level is error
                    return "error";
                }
            },
            enumerable: !0,
            configurable: !0
        }), t.setLogLevel = function(t) {
            var e;
            rr("Firestore.setLogLevel", arguments, 1), fr("setLogLevel", [ "debug", "error", "silent", "warn", "info", "verbose" ], 1, t), 
            e = t, he.setLogLevel(e);
        }, 
        // Note: this is not a property because the minifier can't work correctly with
        // the way TypeScript compiler outputs properties.
        t.prototype.aE = function() {
            return this.ZT.timestampsInSnapshots;
        }, t;
    }(), Fi = /** @class */ function() {
        function t(t, e) {
            this.uE = t, this.cE = e;
        }
        return t.prototype.get = function(t) {
            var e = this;
            rr("Transaction.get", arguments, 1);
            var n = Zi("Transaction.get", t, this.uE);
            return this.cE.V_([ n.Pc ]).then((function(t) {
                if (!t || 1 !== t.length) return ye();
                var r = t[0];
                if (r instanceof vt) return new Wi(e.uE, n.Pc, null, 
                /* fromCache= */ !1, 
                /* hasPendingWrites= */ !1, n.Vc);
                if (r instanceof yt) return new Wi(e.uE, n.Pc, r, 
                /* fromCache= */ !1, 
                /* hasPendingWrites= */ !1, n.Vc);
                throw ye();
            }));
        }, t.prototype.set = function(t, e, n) {
            or("Transaction.set", arguments, 2, 3);
            var r = Zi("Transaction.set", t, this.uE);
            n = Xi("Transaction.set", n);
            var i = eo(r.Vc, e, "Transaction.set"), o = i[0], s = i[1], u = this.uE.tE.Fc(s, o, n);
            return this.cE.set(r.Pc, u), this;
        }, t.prototype.update = function(t, e, n) {
            for (var r, i, o = [], s = 3; s < arguments.length; s++) o[s - 3] = arguments[s];
            return "string" == typeof e || e instanceof Nr ? (ir("Transaction.update", arguments, 3), 
            r = Zi("Transaction.update", t, this.uE), i = this.uE.tE.Mc("Transaction.update", e, n, o)) : (rr("Transaction.update", arguments, 2), 
            r = Zi("Transaction.update", t, this.uE), i = this.uE.tE.kc("Transaction.update", e)), 
            this.cE.update(r.Pc, i), this;
        }, t.prototype.delete = function(t) {
            rr("Transaction.delete", arguments, 1);
            var e = Zi("Transaction.delete", t, this.uE);
            return this.cE.delete(e.Pc), this;
        }, t;
    }(), Bi = /** @class */ function() {
        function t(t) {
            this.uE = t, this._E = [], this.lE = !1;
        }
        return t.prototype.set = function(t, e, n) {
            or("WriteBatch.set", arguments, 2, 3), this.dE();
            var r = Zi("WriteBatch.set", t, this.uE);
            n = Xi("WriteBatch.set", n);
            var i = eo(r.Vc, e, "WriteBatch.set"), o = i[0], s = i[1], u = this.uE.tE.Fc(s, o, n);
            return this._E = this._E.concat(u.gc(r.Pc, nt.ft())), this;
        }, t.prototype.update = function(t, e, n) {
            for (var r, i, o = [], s = 3; s < arguments.length; s++) o[s - 3] = arguments[s];
            return this.dE(), "string" == typeof e || e instanceof Nr ? (ir("WriteBatch.update", arguments, 3), 
            r = Zi("WriteBatch.update", t, this.uE), i = this.uE.tE.Mc("WriteBatch.update", e, n, o)) : (rr("WriteBatch.update", arguments, 2), 
            r = Zi("WriteBatch.update", t, this.uE), i = this.uE.tE.kc("WriteBatch.update", e)), 
            this._E = this._E.concat(i.gc(r.Pc, nt.exists(!0))), this;
        }, t.prototype.delete = function(t) {
            rr("WriteBatch.delete", arguments, 1), this.dE();
            var e = Zi("WriteBatch.delete", t, this.uE);
            return this._E = this._E.concat(new ut(e.Pc, nt.ft())), this;
        }, t.prototype.commit = function() {
            return this.dE(), this.lE = !0, this._E.length > 0 ? this.uE.GT().write(this._E) : Promise.resolve();
        }, t.prototype.dE = function() {
            if (this.lE) throw new h(c.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
        }, t;
    }(), zi = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this, n.mc, e, r) || this).Pc = e, i.firestore = n, i.Vc = r, 
            i.zT = i.firestore.GT(), i;
        }
        return e.__extends(n, t), n.oE = function(t, e, r) {
            if (t.length % 2 != 0) throw new h(c.INVALID_ARGUMENT, "Invalid document reference. Document references must have an even number of segments, but " + t.j() + " has " + t.length);
            return new n(new b(t), e, r);
        }, Object.defineProperty(n.prototype, "id", {
            get: function() {
                return this.Pc.path.L();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(n.prototype, "parent", {
            get: function() {
                return new Ji(this.Pc.path.$(), this.firestore, this.Vc);
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(n.prototype, "path", {
            get: function() {
                return this.Pc.path.j();
            },
            enumerable: !0,
            configurable: !0
        }), n.prototype.collection = function(t) {
            if (rr("DocumentReference.collection", arguments, 1), sr("DocumentReference.collection", "non-empty string", 1, t), 
            !t) throw new h(c.INVALID_ARGUMENT, "Must provide a non-empty collection name to collection()");
            var e = w.K(t);
            return new Ji(this.Pc.path.child(e), this.firestore, 
            /* converter= */ null);
        }, n.prototype.isEqual = function(t) {
            if (!(t instanceof n)) throw gr("isEqual", "DocumentReference", 1, t);
            return this.firestore === t.firestore && this.Pc.isEqual(t.Pc) && this.Vc === t.Vc;
        }, n.prototype.set = function(t, e) {
            or("DocumentReference.set", arguments, 1, 2), e = Xi("DocumentReference.set", e);
            var n = eo(this.Vc, t, "DocumentReference.set"), r = n[0], i = n[1], o = this.firestore.tE.Fc(i, r, e);
            return this.zT.write(o.gc(this.Pc, nt.ft()));
        }, n.prototype.update = function(t, e) {
            for (var n, r = [], i = 2; i < arguments.length; i++) r[i - 2] = arguments[i];
            return "string" == typeof t || t instanceof Nr ? (ir("DocumentReference.update", arguments, 2), 
            n = this.firestore.tE.Mc("DocumentReference.update", t, e, r)) : (rr("DocumentReference.update", arguments, 1), 
            n = this.firestore.tE.kc("DocumentReference.update", t)), this.zT.write(n.gc(this.Pc, nt.exists(!0)));
        }, n.prototype.delete = function() {
            return rr("DocumentReference.delete", arguments, 0), this.zT.write([ new ut(this.Pc, nt.ft()) ]);
        }, n.prototype.onSnapshot = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            or("DocumentReference.onSnapshot", arguments, 1, 4);
            var n, r = {
                includeMetadataChanges: !1
            }, i = 0;
            "object" != typeof t[i] || Ui(t[i]) || (vr("DocumentReference.onSnapshot", r = t[i], [ "includeMetadataChanges" ]), 
            cr("DocumentReference.onSnapshot", "boolean", "includeMetadataChanges", r.includeMetadataChanges), 
            i++);
            var o = {
                includeMetadataChanges: r.includeMetadataChanges
            };
            return Ui(t[i]) ? n = t[i] : (sr("DocumentReference.onSnapshot", "function", i, t[i]), 
            ur("DocumentReference.onSnapshot", "function", i + 1, t[i + 1]), ur("DocumentReference.onSnapshot", "function", i + 2, t[i + 2]), 
            n = {
                next: t[i],
                error: t[i + 1],
                complete: t[i + 2]
            }), this.fE(o, n);
        }, n.prototype.fE = function(t, e) {
            var n = this, r = function(t) {
                console.error("Uncaught Error in onSnapshot:", t);
            };
            e.error && (r = e.error.bind(e));
            var i = new Oi({
                next: function(t) {
                    if (e.next) {
                        var r = t.docs.get(n.Pc);
                        e.next(new Wi(n.firestore, n.Pc, r, t.fromCache, t.hasPendingWrites, n.Vc));
                    }
                },
                error: r
            }), o = this.zT.listen(wt.Wt(this.Pc.path), i, t);
            return function() {
                i.MT(), n.zT.al(o);
            };
        }, n.prototype.get = function(t) {
            var e = this;
            return or("DocumentReference.get", arguments, 0, 1), $i("DocumentReference.get", t), 
            new Promise((function(n, r) {
                t && "cache" === t.source ? e.firestore.GT().FT(e.Pc).then((function(t) {
                    n(new Wi(e.firestore, e.Pc, t, 
                    /*fromCache=*/ !0, t instanceof yt && t.At, e.Vc));
                }), r) : e.TE(n, r, t);
            }));
        }, n.prototype.TE = function(t, e, n) {
            var r = this.fE({
                includeMetadataChanges: !0,
                qf: !0
            }, {
                next: function(i) {
                    // Remove query first before passing event to user to avoid
                    // user actions affecting the now stale query.
                    r(), !i.exists && i.metadata.fromCache ? 
                    // TODO(dimond): If we're online and the document doesn't
                    // exist then we resolve with a doc.exists set to false. If
                    // we're offline however, we reject the Promise in this
                    // case. Two options: 1) Cache the negative response from
                    // the server so we can deliver that even when you're
                    // offline 2) Actually reject the Promise in the online case
                    // if the document doesn't exist.
                    e(new h(c.UNAVAILABLE, "Failed to get document because the client is offline.")) : i.exists && i.metadata.fromCache && n && "server" === n.source ? e(new h(c.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : t(i);
                },
                error: e
            });
        }, n.prototype.withConverter = function(t) {
            return new n(this.Pc, this.firestore, t);
        }, n;
    }(Cr), Gi = /** @class */ function() {
        function t(t, e) {
            this.hasPendingWrites = t, this.fromCache = e;
        }
        return t.prototype.isEqual = function(t) {
            return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
        }, t;
    }(), Wi = /** @class */ function() {
        function t(t, e, n, r, i, o) {
            this.uE = t, this.Pc = e, this.EE = n, this.IE = r, this.wE = i, this.Vc = o;
        }
        return t.prototype.data = function(t) {
            var e = this;
            if (or("DocumentSnapshot.data", arguments, 0, 1), t = Hi("DocumentSnapshot.data", t), 
            this.EE) {
                // We only want to use the converter and create a new DocumentSnapshot
                // if a converter has been provided.
                if (this.Vc) {
                    var n = new Qi(this.uE, this.Pc, this.EE, this.IE, this.wE, 
                    /* converter= */ null);
                    return this.Vc.fromFirestore(n, t);
                }
                return new Ci(this.uE.mc, this.uE.aE(), t.serverTimestamps || "none", (function(t) {
                    return new zi(t, e.uE, /* converter= */ null);
                })).OT(this.EE.xt());
            }
        }, t.prototype.get = function(t, e) {
            var n = this;
            if (or("DocumentSnapshot.get", arguments, 1, 2), e = Hi("DocumentSnapshot.get", e), 
            this.EE) {
                var r = this.EE.data().field(Kr("DocumentSnapshot.get", t));
                if (null !== r) return new Ci(this.uE.mc, this.uE.aE(), e.serverTimestamps || "none", (function(t) {
                    return new zi(t, n.uE, n.Vc);
                })).OT(r);
            }
        }, Object.defineProperty(t.prototype, "id", {
            get: function() {
                return this.Pc.path.L();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "ref", {
            get: function() {
                return new zi(this.Pc, this.uE, this.Vc);
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "exists", {
            get: function() {
                return null !== this.EE;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "metadata", {
            get: function() {
                return new Gi(this.wE, this.IE);
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.isEqual = function(e) {
            if (!(e instanceof t)) throw gr("isEqual", "DocumentSnapshot", 1, e);
            return this.uE === e.uE && this.IE === e.IE && this.Pc.isEqual(e.Pc) && (null === this.EE ? null === e.EE : this.EE.isEqual(e.EE)) && this.Vc === e.Vc;
        }, t;
    }(), Qi = /** @class */ function(t) {
        function n() {
            return null !== t && t.apply(this, arguments) || this;
        }
        return e.__extends(n, t), n.prototype.data = function(e) {
            return t.prototype.data.call(this, e);
        }, n;
    }(Wi), Ki = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            return (i = t.call(this, n.mc, n.tE, e) || this).RE = e, i.firestore = n, i.Vc = r, 
            i;
        }
        return e.__extends(n, t), n.prototype.where = function(t, e, r) {
            rr("Query.where", arguments, 3), yr("Query.where", 3, r);
            // Enumerated from the WhereFilterOp type in index.d.ts.
            var i = fr("Query.where", [ "<" /* LESS_THAN */ , "<=" /* LESS_THAN_OR_EQUAL */ , "==" /* EQUAL */ , ">=" /* GREATER_THAN_OR_EQUAL */ , ">" /* GREATER_THAN */ , "array-contains" /* ARRAY_CONTAINS */ , "in" /* IN */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ ], 2, e), o = Kr("Query.where", t), s = this.AE(o, i, r);
            return new n(this.RE.Gt(s), this.firestore, this.Vc);
        }, n.prototype.orderBy = function(t, e) {
            var r;
            if (or("Query.orderBy", arguments, 1, 2), ur("Query.orderBy", "non-empty string", 2, e), 
            void 0 === e || "asc" === e) r = "asc" /* ASCENDING */; else {
                if ("desc" !== e) throw new h(c.INVALID_ARGUMENT, "Function Query.orderBy() has unknown direction '" + e + "', expected 'asc' or 'desc'.");
                r = "desc" /* DESCENDING */;
            }
            var i = Kr("Query.orderBy", t), o = this.gE(i, r);
            return new n(this.RE.zt(o), this.firestore, this.Vc);
        }, n.prototype.limit = function(t) {
            return rr("Query.limit", arguments, 1), sr("Query.limit", "number", 1, t), mr("Query.limit", 1, t), 
            new n(this.RE.Ht(t), this.firestore, this.Vc);
        }, n.prototype.limitToLast = function(t) {
            return rr("Query.limitToLast", arguments, 1), sr("Query.limitToLast", "number", 1, t), 
            mr("Query.limitToLast", 1, t), new n(this.RE.Yt(t), this.firestore, this.Vc);
        }, n.prototype.startAt = function(t) {
            for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
            ir("Query.startAt", arguments, 1);
            var i = this.DE("Query.startAt", t, e, 
            /*before=*/ !0);
            return new n(this.RE.Jt(i), this.firestore, this.Vc);
        }, n.prototype.startAfter = function(t) {
            for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
            ir("Query.startAfter", arguments, 1);
            var i = this.DE("Query.startAfter", t, e, 
            /*before=*/ !1);
            return new n(this.RE.Jt(i), this.firestore, this.Vc);
        }, n.prototype.endBefore = function(t) {
            for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
            ir("Query.endBefore", arguments, 1);
            var i = this.DE("Query.endBefore", t, e, 
            /*before=*/ !0);
            return new n(this.RE.Xt(i), this.firestore, this.Vc);
        }, n.prototype.endAt = function(t) {
            for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
            ir("Query.endAt", arguments, 1);
            var i = this.DE("Query.endAt", t, e, 
            /*before=*/ !1);
            return new n(this.RE.Xt(i), this.firestore, this.Vc);
        }, n.prototype.isEqual = function(t) {
            if (!(t instanceof n)) throw gr("isEqual", "Query", 1, t);
            return this.firestore === t.firestore && this.RE.isEqual(t.RE) && this.Vc === t.Vc;
        }, n.prototype.withConverter = function(t) {
            return new n(this.RE, this.firestore, t);
        }, 
        /** Helper function to create a bound from a document or fields */ n.prototype.DE = function(t, n, r, i) {
            if (yr(t, 1, n), n instanceof Wi) return rr(t, e.__spreadArrays([ n ], r), 1), this.yE(t, n.EE, i);
            var o = [ n ].concat(r);
            return this.bE(t, o, i);
        }, n.prototype.onSnapshot = function() {
            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
            or("Query.onSnapshot", arguments, 1, 4);
            var n, r = {}, i = 0;
            return "object" != typeof t[i] || Ui(t[i]) || (vr("Query.onSnapshot", r = t[i], [ "includeMetadataChanges" ]), 
            cr("Query.onSnapshot", "boolean", "includeMetadataChanges", r.includeMetadataChanges), 
            i++), Ui(t[i]) ? n = t[i] : (sr("Query.onSnapshot", "function", i, t[i]), ur("Query.onSnapshot", "function", i + 1, t[i + 1]), 
            ur("Query.onSnapshot", "function", i + 2, t[i + 2]), n = {
                next: t[i],
                error: t[i + 1],
                complete: t[i + 2]
            }), this.vE(this.RE), this.fE(r, n);
        }, n.prototype.fE = function(t, e) {
            var n = this, r = function(t) {
                console.error("Uncaught Error in onSnapshot:", t);
            };
            e.error && (r = e.error.bind(e));
            var i = new Oi({
                next: function(t) {
                    e.next && e.next(new Yi(n.firestore, n.RE, t, n.Vc));
                },
                error: r
            }), o = this.firestore.GT(), s = o.listen(this.RE, i, t);
            return function() {
                i.MT(), o.al(s);
            };
        }, n.prototype.get = function(t) {
            var e = this;
            return or("Query.get", arguments, 0, 1), $i("Query.get", t), this.vE(this.RE), new Promise((function(n, r) {
                t && "cache" === t.source ? e.firestore.GT().NT(e.RE).then((function(t) {
                    n(new Yi(e.firestore, e.RE, t, e.Vc));
                }), r) : e.TE(n, r, t);
            }));
        }, n.prototype.TE = function(t, e, n) {
            var r = this.fE({
                includeMetadataChanges: !0,
                qf: !0
            }, {
                next: function(i) {
                    // Remove query first before passing event to user to avoid
                    // user actions affecting the now stale query.
                    r(), i.metadata.fromCache && n && "server" === n.source ? e(new h(c.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : t(i);
                },
                error: e
            });
        }, n;
    }(/** @class */ function() {
        function t(t, e, n) {
            this.mc = t, this.tE = e, this.RE = n;
        }
        return t.prototype.AE = function(t, e, n) {
            var r;
            if (t.Y()) {
                if ("array-contains" /* ARRAY_CONTAINS */ === e || "array-contains-any" /* ARRAY_CONTAINS_ANY */ === e) throw new h(c.INVALID_ARGUMENT, "Invalid Query. You can't perform '" + e + "' queries on FieldPath.documentId().");
                if ("in" /* IN */ === e) {
                    this.mE(n, e);
                    for (var i = [], o = 0, s = n; o < s.length; o++) {
                        var u = s[o];
                        i.push(this.PE(u));
                    }
                    r = {
                        arrayValue: {
                            values: i
                        }
                    };
                } else r = this.PE(n);
            } else "in" /* IN */ !== e && "array-contains-any" /* ARRAY_CONTAINS_ANY */ !== e || this.mE(n, e), 
            r = this.tE.xc("Query.where", n, 
            // We only allow nested arrays for IN queries.
            /** allowArrays = */ "in" /* IN */ === e);
            var a = Et.create(t, e, r);
            return this.VE(a), a;
        }, t.prototype.gE = function(t, e) {
            if (null !== this.RE.startAt) throw new h(c.INVALID_ARGUMENT, "Invalid query. You must not call Query.startAt() or Query.startAfter() before calling Query.orderBy().");
            if (null !== this.RE.endAt) throw new h(c.INVALID_ARGUMENT, "Invalid query. You must not call Query.endAt() or Query.endBefore() before calling Query.orderBy().");
            var n = new xt(t, e);
            return this.pE(n), n;
        }, 
        /**
         * Create a Bound from a query and a document.
         *
         * Note that the Bound will always include the key of the document
         * and so only the provided document will compare equal to the returned
         * position.
         *
         * Will throw if the document does not contain all fields of the order by
         * of the query or if any of the fields in the order by are an uncommitted
         * server timestamp.
         */
        t.prototype.yE = function(t, e, n) {
            if (!e) throw new h(c.NOT_FOUND, "Can't use a DocumentSnapshot that doesn't exist for " + t + "().");
            // Because people expect to continue/end a query at the exact document
            // provided, we need to use the implicit sort order rather than the explicit
            // sort order, because it's guaranteed to contain the document key. That way
            // the position becomes unambiguous and the query continues/ends exactly at
            // the provided document. Without the key (by using the explicit sort
            // orders), multiple documents could match the position, yielding duplicate
            // results.
            for (var r = [], i = 0, o = this.RE.orderBy; i < o.length; i++) {
                var s = o[i];
                if (s.field.Y()) r.push(B(this.mc, e.key)); else {
                    var u = e.field(s.field);
                    if (R(u)) throw new h(c.INVALID_ARGUMENT, 'Invalid query. You are trying to start or end a query using a document for which the field "' + s.field + '" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');
                    if (null === u) {
                        var a = s.field.j();
                        throw new h(c.INVALID_ARGUMENT, "Invalid query. You are trying to start or end a query using a document for which the field '" + a + "' (used as the orderBy) does not exist.");
                    }
                    r.push(u);
                }
            }
            return new At(r, n);
        }, 
        /**
         * Converts a list of field values to a Bound for the given query.
         */
        t.prototype.bE = function(t, e, n) {
            // Use explicit order by's because it has to match the query the user made
            var r = this.RE.Lt;
            if (e.length > r.length) throw new h(c.INVALID_ARGUMENT, "Too many arguments provided to " + t + "(). The number of arguments must be less than or equal to the number of Query.orderBy() clauses");
            for (var i = [], o = 0; o < e.length; o++) {
                var s = e[o];
                if (r[o].field.Y()) {
                    if ("string" != typeof s) throw new h(c.INVALID_ARGUMENT, "Invalid query. Expected a string for document ID in " + t + "(), but got a " + typeof s);
                    if (!this.RE._e() && -1 !== s.indexOf("/")) throw new h(c.INVALID_ARGUMENT, "Invalid query. When querying a collection and ordering by FieldPath.documentId(), the value passed to " + t + "() must be a plain document ID, but '" + s + "' contains a slash.");
                    var u = this.RE.path.child(w.K(s));
                    if (!b.et(u)) throw new h(c.INVALID_ARGUMENT, "Invalid query. When querying a collection group and ordering by FieldPath.documentId(), the value passed to " + t + "() must result in a valid document path, but '" + u + "' is not because it contains an odd number of segments.");
                    var a = new b(u);
                    i.push(B(this.mc, a));
                } else {
                    var f = this.tE.xc(t, s);
                    i.push(f);
                }
            }
            return new At(i, n);
        }, t.prototype.vE = function(t) {
            if (t.ae() && 0 === t.Lt.length) throw new h(c.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
        }, 
        /**
         * Parses the given documentIdValue into a ReferenceValue, throwing
         * appropriate errors if the value is anything other than a DocumentReference
         * or String, or if the string is malformed.
         */
        t.prototype.PE = function(t) {
            if ("string" == typeof t) {
                if ("" === t) throw new h(c.INVALID_ARGUMENT, "Invalid query. When querying with FieldPath.documentId(), you must provide a valid document ID, but it was an empty string.");
                if (!this.RE._e() && -1 !== t.indexOf("/")) throw new h(c.INVALID_ARGUMENT, "Invalid query. When querying a collection by FieldPath.documentId(), you must provide a plain document ID, but '" + t + "' contains a '/' character.");
                var e = this.RE.path.child(w.K(t));
                if (!b.et(e)) throw new h(c.INVALID_ARGUMENT, "Invalid query. When querying a collection group by FieldPath.documentId(), the value provided must result in a valid document path, but '" + e + "' is not because it has an odd number of segments (" + e.length + ").");
                return B(this.mc, new b(e));
            }
            if (t instanceof Cr) return B(this.mc, t.Pc);
            throw new h(c.INVALID_ARGUMENT, "Invalid query. When querying with FieldPath.documentId(), you must provide a valid string or a DocumentReference, but it was: " + dr(t) + ".");
        }, 
        /**
         * Validates that the value passed into a disjunctrive filter satisfies all
         * array requirements.
         */
        t.prototype.mE = function(t, e) {
            if (!Array.isArray(t) || 0 === t.length) throw new h(c.INVALID_ARGUMENT, "Invalid Query. A non-empty array is required for '" + e.toString() + "' filters.");
            if (t.length > 10) throw new h(c.INVALID_ARGUMENT, "Invalid Query. '" + e.toString() + "' filters support a maximum of 10 elements in the value array.");
            if (t.indexOf(null) >= 0) throw new h(c.INVALID_ARGUMENT, "Invalid Query. '" + e.toString() + "' filters cannot contain 'null' in the value array.");
            if (t.filter((function(t) {
                return Number.isNaN(t);
            })).length > 0) throw new h(c.INVALID_ARGUMENT, "Invalid Query. '" + e.toString() + "' filters cannot contain 'NaN' in the value array.");
        }, t.prototype.VE = function(t) {
            if (t instanceof Et) {
                var e = [ "array-contains" /* ARRAY_CONTAINS */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ ], n = [ "in" /* IN */ , "array-contains-any" /* ARRAY_CONTAINS_ANY */ ], r = e.indexOf(t.op) >= 0, i = n.indexOf(t.op) >= 0;
                if (t.ue()) {
                    var o = this.RE.jt();
                    if (null !== o && !o.isEqual(t.field)) throw new h(c.INVALID_ARGUMENT, "Invalid query. All where filters with an inequality (<, <=, >, or >=) must be on the same field. But you have inequality filters on '" + o.toString() + "' and '" + t.field.toString() + "'");
                    var s = this.RE.Kt();
                    null !== s && this.SE(t.field, s);
                } else if (i || r) {
                    // You can have at most 1 disjunctive filter and 1 array filter. Check if
                    // the new filter conflicts with an existing one.
                    var u = null;
                    if (i && (u = this.RE.ce(n)), null === u && r && (u = this.RE.ce(e)), null != u) 
                    // We special case when it's a duplicate op to give a slightly clearer error message.
                    throw u === t.op ? new h(c.INVALID_ARGUMENT, "Invalid query. You cannot use more than one '" + t.op.toString() + "' filter.") : new h(c.INVALID_ARGUMENT, "Invalid query. You cannot use '" + t.op.toString() + "' filters with '" + u.toString() + "' filters.");
                }
            }
        }, t.prototype.pE = function(t) {
            if (null === this.RE.Kt()) {
                // This is the first order by. It must match any inequality.
                var e = this.RE.jt();
                null !== e && this.SE(e, t.field);
            }
        }, t.prototype.SE = function(t, e) {
            if (!e.isEqual(t)) throw new h(c.INVALID_ARGUMENT, "Invalid query. You have a where filter with an inequality (<, <=, >, or >=) on field '" + t.toString() + "' and so you must also use '" + t.toString() + "' as your first Query.orderBy(), but your first Query.orderBy() is on field '" + e.toString() + "' instead.");
        }, t;
    }()), Yi = /** @class */ function() {
        function t(t, e, n, r) {
            this.uE = t, this.CE = e, this.FE = n, this.Vc = r, this.NE = null, this.kE = null, 
            this.metadata = new Gi(n.hasPendingWrites, n.fromCache);
        }
        return Object.defineProperty(t.prototype, "docs", {
            get: function() {
                var t = [];
                return this.forEach((function(e) {
                    return t.push(e);
                })), t;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "empty", {
            get: function() {
                return this.FE.docs.B();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "size", {
            get: function() {
                return this.FE.docs.size;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.forEach = function(t, e) {
            var n = this;
            or("QuerySnapshot.forEach", arguments, 1, 2), sr("QuerySnapshot.forEach", "function", 1, t), 
            this.FE.docs.forEach((function(r) {
                t.call(e, n.ME(r));
            }));
        }, Object.defineProperty(t.prototype, "query", {
            get: function() {
                return new Ki(this.CE, this.uE, this.Vc);
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.docChanges = function(t) {
            t && (vr("QuerySnapshot.docChanges", t, [ "includeMetadataChanges" ]), cr("QuerySnapshot.docChanges", "boolean", "includeMetadataChanges", t.includeMetadataChanges));
            var e = !(!t || !t.includeMetadataChanges);
            if (e && this.FE.hs) throw new h(c.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
            return this.NE && this.kE === e || (this.NE = 
            /**
         * Calculates the array of firestore.DocumentChange's for a given ViewSnapshot.
         *
         * Exported for testing.
         */
            function(t, e, n, r) {
                if (n.ss.B()) {
                    // Special case the first snapshot because index calculation is easy and
                    // fast
                    var i = 0;
                    return n.docChanges.map((function(e) {
                        var o = new Qi(t, e.doc.key, e.doc, n.fromCache, n.ns.has(e.doc.key), r);
                        return e.doc, {
                            type: "added",
                            doc: o,
                            oldIndex: -1,
                            newIndex: i++
                        };
                    }));
                }
                // A DocumentSet that is updated incrementally as changes are applied to use
                // to lookup the index of a document.
                var o = n.ss;
                return n.docChanges.filter((function(t) {
                    return e || 3 /* Metadata */ !== t.type;
                })).map((function(e) {
                    var i = new Qi(t, e.doc.key, e.doc, n.fromCache, n.ns.has(e.doc.key), r), s = -1, u = -1;
                    return 0 /* Added */ !== e.type && (s = o.indexOf(e.doc.key), o = o.delete(e.doc.key)), 
                    1 /* Removed */ !== e.type && (u = (o = o.add(e.doc)).indexOf(e.doc.key)), {
                        type: to(e.type),
                        doc: i,
                        oldIndex: s,
                        newIndex: u
                    };
                }));
            }(this.uE, e, this.FE, this.Vc), this.kE = e), this.NE;
        }, 
        /** Check the equality. The call can be very expensive. */ t.prototype.isEqual = function(e) {
            if (!(e instanceof t)) throw gr("isEqual", "QuerySnapshot", 1, e);
            return this.uE === e.uE && this.CE.isEqual(e.CE) && this.FE.isEqual(e.FE) && this.Vc === e.Vc;
        }, t.prototype.ME = function(t) {
            return new Qi(this.uE, t.key, t, this.metadata.fromCache, this.FE.ns.has(t.key), this.Vc);
        }, t;
    }(), Ji = /** @class */ function(t) {
        function n(e, n, r) {
            var i = this;
            if ((i = t.call(this, wt.Wt(e), n, r) || this).xE = e, e.length % 2 != 1) throw new h(c.INVALID_ARGUMENT, "Invalid collection reference. Collection references must have an odd number of segments, but " + e.j() + " has " + e.length);
            return i;
        }
        return e.__extends(n, t), Object.defineProperty(n.prototype, "id", {
            get: function() {
                return this.RE.path.L();
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(n.prototype, "parent", {
            get: function() {
                var t = this.RE.path.$();
                return t.B() ? null : new zi(new b(t), this.firestore, 
                /* converter= */ null);
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(n.prototype, "path", {
            get: function() {
                return this.RE.path.j();
            },
            enumerable: !0,
            configurable: !0
        }), n.prototype.doc = function(t) {
            or("CollectionReference.doc", arguments, 0, 1), 
            // We allow omission of 'pathString' but explicitly prohibit passing in both
            // 'undefined' and 'null'.
            0 === arguments.length && (t = me.cn()), sr("CollectionReference.doc", "non-empty string", 1, t);
            var e = w.K(t);
            return zi.oE(this.RE.path.child(e), this.firestore, this.Vc);
        }, n.prototype.add = function(t) {
            rr("CollectionReference.add", arguments, 1), sr("CollectionReference.add", "object", 1, this.Vc ? this.Vc.toFirestore(t) : t);
            var e = this.doc();
            return e.set(t).then((function() {
                return e;
            }));
        }, n.prototype.withConverter = function(t) {
            return new n(this.xE, this.firestore, t);
        }, n;
    }(Ki);

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // settings() defaults:
    function Xi(t, e) {
        if (void 0 === e) return {
            merge: !1
        };
        if (vr(t, e, [ "merge", "mergeFields" ]), cr(t, "boolean", "merge", e.merge), function(t, e, n, r, i) {
            void 0 !== r && function(t, e, n, r, i) {
                if (!(r instanceof Array)) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires its " + e + " option to be an array, but it was: " + dr(r));
                for (var o = 0; o < r.length; ++o) if (!i(r[o])) throw new h(c.INVALID_ARGUMENT, "Function " + t + "() requires all " + e + " elements to be " + n + ", but the value at index " + o + " was: " + dr(r[o]));
            }(t, e, n, r, i);
        }(t, "mergeFields", "a string or a FieldPath", e.mergeFields, (function(t) {
            return "string" == typeof t || t instanceof Nr;
        })), void 0 !== e.mergeFields && void 0 !== e.merge) throw new h(c.INVALID_ARGUMENT, "Invalid options passed to function " + t + '(): You cannot specify both "merge" and "mergeFields".');
        return e;
    }

    function Hi(t, e) {
        return void 0 === e ? {} : (vr(t, e, [ "serverTimestamps" ]), hr(t, 0, "serverTimestamps", e.serverTimestamps, [ "estimate", "previous", "none" ]), 
        e);
    }

    function $i(t, e) {
        ur(t, "object", 1, e), e && (vr(t, e, [ "source" ]), hr(t, 0, "source", e.source, [ "default", "server", "cache" ]));
    }

    function Zi(t, e, n) {
        if (e instanceof Cr) {
            if (e.firestore !== n) throw new h(c.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
            return e;
        }
        throw gr(t, "DocumentReference", 1, e);
    }

    function to(t) {
        switch (t) {
          case 0 /* Added */ :
            return "added";

          case 2 /* Modified */ :
          case 3 /* Metadata */ :
            return "modified";

          case 1 /* Removed */ :
            return "removed";

          default:
            return ye();
        }
    }

    /**
     * Converts custom model object of type T into DocumentData by applying the
     * converter if it exists.
     *
     * This function is used when converting user objects to DocumentData
     * because we want to provide the user with a more specific error message if
     * their set() or fails due to invalid data originating from a toFirestore()
     * call.
     */ function eo(t, e, n) {
        var r;
        return t ? (r = t.toFirestore(e), n = "toFirestore() in " + n) : r = e, [ r, n ];
    }

    function no(t, e) {
        function n() {
            var t = "This constructor is private.";
            throw e && (t += " ", t += e), new h(c.INVALID_ARGUMENT, t);
        }
        // Make sure instanceof checks work and all methods are exposed on the public
        // constructor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return n.prototype = t.prototype, 
        // Copy any static methods/members
        Object.assign(n, t), n;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Public instance that disallows construction at runtime. Note that this still
    // allows instanceof checks.
    var ro = no(Mi, "Use firebase.firestore() instead."), io = no(Fi, "Use firebase.firestore().runTransaction() instead."), oo = no(Bi, "Use firebase.firestore().batch() instead."), so = no(zi, "Use firebase.firestore().doc() instead."), uo = no(Wi), ao = no(Qi), co = no(Ki), ho = no(Yi), fo = no(Ji, "Use firebase.firestore().collection() instead."), lo = no(Vr, "Use FieldValue.<field>() instead."), po = no(Tr, "Use Blob.fromUint8Array() or Blob.fromBase64String() instead."), yo = {
        Firestore: ro,
        GeoPoint: Or,
        Timestamp: v,
        Blob: po,
        Transaction: io,
        WriteBatch: oo,
        DocumentReference: so,
        DocumentSnapshot: uo,
        Query: co,
        QueryDocumentSnapshot: ao,
        QuerySnapshot: ho,
        CollectionReference: fo,
        FieldPath: Nr,
        FieldValue: lo,
        setLogLevel: Mi.setLogLevel,
        CACHE_SIZE_UNLIMITED: qi
    }, vo = /** @class */ function() {
        function t() {}
        return t.prototype.Q_ = function(t) {
            // No-op.
        }, t.prototype.Vo = function() {
            // No-op.
        }, t;
    }(), go = /** @class */ function() {
        function t() {
            var t = this;
            this.$E = function() {
                return t.OE();
            }, this.LE = function() {
                return t.BE();
            }, this.qE = [], this.UE();
        }
        return t.prototype.Q_ = function(t) {
            this.qE.push(t);
        }, t.prototype.Vo = function() {
            window.removeEventListener("online", this.$E), window.removeEventListener("offline", this.LE);
        }, t.prototype.UE = function() {
            window.addEventListener("online", this.$E), window.addEventListener("offline", this.LE);
        }, t.prototype.OE = function() {
            le("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
            for (var t = 0, e = this.qE; t < e.length; t++) {
                (0, e[t])(0 /* AVAILABLE */);
            }
        }, t.prototype.BE = function() {
            le("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
            for (var t = 0, e = this.qE; t < e.length; t++) {
                (0, e[t])(1 /* UNAVAILABLE */);
            }
        }, 
        // TODO(chenbrian): Consider passing in window either into this component or
        // here for testing via FakeWindow.
        /** Checks that all used attributes of window are available. */
        t.zh = function() {
            return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
        }, t;
    }(), mo = /** @class */ function() {
        function t(t) {
            this.QE = t.QE, this.WE = t.WE;
        }
        return t.prototype.s_ = function(t) {
            this.jE = t;
        }, t.prototype.Jc = function(t) {
            this.KE = t;
        }, t.prototype.onMessage = function(t) {
            this.GE = t;
        }, t.prototype.close = function() {
            this.WE();
        }, t.prototype.send = function(t) {
            this.QE(t);
        }, t.prototype.zE = function() {
            this.jE();
        }, t.prototype.HE = function(t) {
            this.KE(t);
        }, t.prototype.YE = function(t) {
            this.GE(t);
        }, t;
    }(), wo = {
        BatchGetDocuments: "batchGet",
        Commit: "commit"
    }, Eo = "gl-js/ fire/" + u, _o = /** @class */ function() {
        function t(t) {
            this.ii = t.ii;
            var e = t.ssl ? "https" : "http";
            this.JE = e + "://" + t.host, this.forceLongPolling = t.forceLongPolling;
        }
        /**
         * Modifies the headers for a request, adding any authorization token if
         * present and any additional headers for the request.
         */    return t.prototype.XE = function(t, e) {
            if (e) for (var n in e.o) e.o.hasOwnProperty(n) && (t[n] = e.o[n]);
            t["X-Goog-Api-Client"] = Eo;
        }, t.prototype.E_ = function(t, e, n) {
            var r = this, i = this.ZE(t);
            return new Promise((function(o, u) {
                var a = new s.XhrIo;
                a.listenOnce(s.EventType.COMPLETE, (function() {
                    try {
                        switch (a.getLastErrorCode()) {
                          case s.ErrorCode.NO_ERROR:
                            var e = a.getResponseJson();
                            le("Connection", "XHR received:", JSON.stringify(e)), o(e);
                            break;

                          case s.ErrorCode.TIMEOUT:
                            le("Connection", 'RPC "' + t + '" timed out'), u(new h(c.DEADLINE_EXCEEDED, "Request time out"));
                            break;

                          case s.ErrorCode.HTTP_ERROR:
                            var n = a.getStatus();
                            if (le("Connection", 'RPC "' + t + '" failed with status:', n, "response text:", a.getResponseText()), 
                            n > 0) {
                                var r = a.getResponseJson().error;
                                if (r && r.status && r.message) {
                                    var i = function(t) {
                                        var e = t.toLowerCase().replace("_", "-");
                                        return Object.values(c).indexOf(e) >= 0 ? e : c.UNKNOWN;
                                    }(r.status);
                                    u(new h(i, r.message));
                                } else u(new h(c.UNKNOWN, "Server responded with status " + a.getStatus()));
                            } else 
                            // If we received an HTTP_ERROR but there's no status code,
                            // it's most probably a connection issue
                            le("Connection", 'RPC "' + t + '" failed'), u(new h(c.UNAVAILABLE, "Connection failed."));
                            break;

                          default:
                            ye();
                        }
                    } finally {
                        le("Connection", 'RPC "' + t + '" completed.');
                    }
                }));
                // The database field is already encoded in URL. Specifying it again in
                // the body is not necessary in production, and will cause duplicate field
                // errors in the Firestore Emulator. Let's remove it.
                var f = Object.assign({}, e);
                delete f.database;
                var l = JSON.stringify(f);
                le("Connection", "XHR sending: ", i + " " + l);
                // Content-Type: text/plain will avoid preflight requests which might
                // mess with CORS and redirects by proxies. If we add custom headers
                // we will need to change this code to potentially use the
                // $httpOverwrite parameter supported by ESF to avoid
                // triggering preflight requests.
                var p = {
                    "Content-Type": "text/plain"
                };
                r.XE(p, n), a.send(i, "POST", l, p, 15);
            }));
        }, t.prototype.I_ = function(t, e, n) {
            // The REST API automatically aggregates all of the streamed results, so we
            // can just use the normal invoke() method.
            return this.E_(t, e, n);
        }, t.prototype.i_ = function(t, n) {
            var o = [ this.JE, "/", "google.firestore.v1.Firestore", "/", t, "/channel" ], a = s.createWebChannelTransport(), f = {
                // Required for backend stickiness, routing behavior is based on this
                // parameter.
                httpSessionIdParam: "gsessionid",
                initMessageHeaders: {},
                messageUrlParams: {
                    // This param is used to improve routing and project isolation by the
                    // backend and must be included in every request.
                    database: "projects/" + this.ii.projectId + "/databases/" + this.ii.database
                },
                sendRawJson: !0,
                supportsCrossDomainXhr: !0,
                internalChannelParams: {
                    // Override the default timeout (randomized between 10-20 seconds) since
                    // a large write batch on a slow internet connection may take a long
                    // time to send to the backend. Rather than have WebChannel impose a
                    // tight timeout which could lead to infinite timeouts and retries, we
                    // set it very large (5-10 minutes) and rely on the browser's builtin
                    // timeouts to kick in if the request isn't working.
                    forwardChannelRequestTimeoutMs: 6e5
                },
                forceLongPolling: this.forceLongPolling
            };
            this.XE(f.initMessageHeaders, n), 
            // Sending the custom headers we just added to request.initMessageHeaders
            // (Authorization, etc.) will trigger the browser to make a CORS preflight
            // request because the XHR will no longer meet the criteria for a "simple"
            // CORS request:
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
            // Therefore to avoid the CORS preflight request (an extra network
            // roundtrip), we use the httpHeadersOverwriteParam option to specify that
            // the headers should instead be encoded into a special "$httpHeaders" query
            // parameter, which is recognized by the webchannel backend. This is
            // formally defined here:
            // https://github.com/google/closure-library/blob/b0e1815b13fb92a46d7c9b3c30de5d6a396a3245/closure/goog/net/rpc/httpcors.js#L32
            // TODO(b/145624756): There is a backend bug where $httpHeaders isn't respected if the request
            // doesn't have an Origin header. So we have to exclude a few browser environments that are
            // known to (sometimes) not include an Origin. See
            // https://github.com/firebase/firebase-js-sdk/issues/1491.
            i.isMobileCordova() || i.isReactNative() || i.isElectron() || i.isIE() || i.isUWP() || i.isBrowserExtension() || (f.httpHeadersOverwriteParam = "$httpHeaders");
            var l = o.join("");
            le("Connection", "Creating WebChannel: " + l + " " + f);
            var p = a.createWebChannel(l, f), d = !1, y = !1, v = new mo({
                QE: function(t) {
                    y ? le("Connection", "Not sending because WebChannel is closed:", t) : (d || (le("Connection", "Opening WebChannel transport."), 
                    p.open(), d = !0), le("Connection", "WebChannel sending:", t), p.send(t));
                },
                WE: function() {
                    return p.close();
                }
            }), g = function(t, e) {
                // TODO(dimond): closure typing seems broken because WebChannel does
                // not implement goog.events.Listenable
                p.listen(t, (function(t) {
                    try {
                        e(t);
                    } catch (t) {
                        setTimeout((function() {
                            throw t;
                        }), 0);
                    }
                }));
            };
            // WebChannel supports sending the first message with the handshake - saving
            // a network round trip. However, it will have to call send in the same
            // JS event loop as open. In order to enforce this, we delay actually
            // opening the WebChannel until send is called. Whether we have called
            // open is tracked with this variable.
                    // Closure events are guarded and exceptions are swallowed, so catch any
            // exception and rethrow using a setTimeout so they become visible again.
            // Note that eventually this function could go away if we are confident
            // enough the code is exception free.
            return g(s.WebChannel.EventType.OPEN, (function() {
                y || le("Connection", "WebChannel transport opened.");
            })), g(s.WebChannel.EventType.CLOSE, (function() {
                y || (y = !0, le("Connection", "WebChannel transport closed"), v.HE());
            })), g(s.WebChannel.EventType.ERROR, (function(t) {
                y || (y = !0, function(t) {
                    for (var n = [], i = 1; i < arguments.length; i++) n[i - 1] = arguments[i];
                    if (he.logLevel <= r.LogLevel.WARN) {
                        var o = n.map(de);
                        he.warn.apply(he, e.__spreadArrays([ "Firestore (" + u + "): " + t ], o));
                    }
                }("Connection", "WebChannel transport errored:", t), v.HE(new h(c.UNAVAILABLE, "The operation could not be completed")));
            })), g(s.WebChannel.EventType.MESSAGE, (function(t) {
                var e;
                if (!y) {
                    var n = t.data[0];
                    ve(!!n);
                    // TODO(b/35143891): There is a bug in One Platform that caused errors
                    // (and only errors) to be wrapped in an extra array. To be forward
                    // compatible with the bug we need to check either condition. The latter
                    // can be removed once the fix has been rolled out.
                    // Use any because msgData.error is not typed.
                    var r = n, i = r.error || (null === (e = r[0]) || void 0 === e ? void 0 : e.error);
                    if (i) {
                        le("Connection", "WebChannel received error:", i);
                        // error.status will be a string like 'OK' or 'NOT_FOUND'.
                        var o = i.status, s = function(t) {
                            // lookup by string
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            var e = lt[t];
                            if (void 0 !== e) return kt(e);
                        }(o), u = i.message;
                        void 0 === s && (s = c.INTERNAL, u = "Unknown error status: " + o + " with message " + i.message), 
                        // Mark closed so no further events are propagated
                        y = !0, v.HE(new h(s, u)), p.close();
                    } else le("Connection", "WebChannel received:", n), v.YE(n);
                }
            })), setTimeout((function() {
                // Technically we could/should wait for the WebChannel opened event,
                // but because we want to send the first message with the WebChannel
                // handshake we pretend the channel opened here (asynchronously), and
                // then delay the actual open until the first message is sent.
                v.zE();
            }), 0), v;
        }, 
        // visible for testing
        t.prototype.ZE = function(t) {
            var e = wo[t];
            return this.JE + "/v1/projects/" + this.ii.projectId + "/databases/" + this.ii.database + "/documents:" + e;
        }, t;
    }();

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Implements the Platform API for browsers and some browser-like environments
    // (including ReactNative, which has its own ReactNativePlatform that extends
    // from this class).
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Registers the main Firestore build with the components framework.
     * Persistence can be enabled via `firebase.firestore().enablePersistence()`.
     */
    function bo(t) {
        /**
     * Configures Firestore as part of the Firebase SDK by calling registerService.
     *
     * @param firebase The FirebaseNamespace to register Firestore with
     * @param firestoreFactory A factory function that returns a new Firestore
     *    instance.
     */
        !function(t, e) {
            t.INTERNAL.registerComponent(new o.Component("firestore", (function(t) {
                return function(t, e) {
                    return new Mi(t, e, new Vi);
                }(t.getProvider("app").getImmediate(), t.getProvider("auth-internal"));
            }), "PUBLIC" /* PUBLIC */).setServiceProps(Object.assign({}, yo)));
        }(t), t.registerVersion("@firebase/firestore", "1.15.3")
        /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /**
     * This code needs to run before Firestore is used. This can be achieved in
     * several ways:
     *   1) Through the JSCompiler compiling this code and then (automatically)
     *      executing it before exporting the Firestore symbols.
     *   2) Through importing this module first in a Firestore main module
     */;
    }

    ce.an(new (/** @class */ function() {
        function t() {
            this.oc = "undefined" != typeof atob;
        }
        return Object.defineProperty(t.prototype, "document", {
            get: function() {
                // `document` is not always available, e.g. in ReactNative and WebWorkers.
                // eslint-disable-next-line no-restricted-globals
                return "undefined" != typeof document ? document : null;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t.prototype, "window", {
            get: function() {
                // `window` is not always available, e.g. in ReactNative and WebWorkers.
                // eslint-disable-next-line no-restricted-globals
                return "undefined" != typeof window ? window : null;
            },
            enumerable: !0,
            configurable: !0
        }), t.prototype.vT = function(t) {
            return Promise.resolve(new _o(t));
        }, t.prototype.pT = function() {
            return go.zh() ? new go : new vo;
        }, t.prototype.Cc = function(t) {
            return new ue(t, {
                hi: !0
            });
        }, t.prototype.un = function(t) {
            return JSON.stringify(t);
        }, t.prototype.atob = function(t) {
            return atob(t);
        }, t.prototype.btoa = function(t) {
            return btoa(t);
        }, t.prototype._n = function(t) {
            // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
            var e = 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(t);
            if (e) e.getRandomValues(n); else 
            // Falls back to Math.random
            for (var r = 0; r < t; r++) n[r] = Math.floor(256 * Math.random());
            return n;
        }, t;
    }())), bo(n), exports.__PRIVATE_registerFirestore = bo;

    });

    unwrapExports(index_cjs$4);
    var index_cjs_1$3 = index_cjs$4.__PRIVATE_registerFirestore;

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCcIn3QuK0X1HBER4JCxGi15zC6OkhZZqI",
        authDomain: "stealthier-c583b.firebaseapp.com",
        databaseURL: "https://stealthier-c583b.firebaseio.com",
        projectId: "stealthier-c583b",
        storageBucket: "stealthier-c583b.appspot.com",
        messagingSenderId: "765436020541",
        appId: "1:765436020541:web:6956d6d500e3c31bab2754",
        measurementId: "G-1MWK3R3K37"
    };
    // Initialize Firebase
    index_cjs$3.initializeApp(firebaseConfig);

    const db$1 = index_cjs$3.firestore();

    /* src/components/Form.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/components/Form.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (78:8) {#each typeOptions as type}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*type*/ ctx[18] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*type*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file$1, 78, 12, 2260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(78:8) {#each typeOptions as type}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#each resourceOptions as resource}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*resource*/ ctx[15] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*resource*/ ctx[15];
    			option.value = option.__value;
    			add_location(option, file$1, 91, 12, 2771);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(91:8) {#each resourceOptions as resource}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let input0;
    	let t0;
    	let label;
    	let t2;
    	let div4;
    	let div0;
    	let h5;
    	let t4;
    	let form;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let input3;
    	let t7;
    	let input4;
    	let t8;
    	let select0;
    	let t9;
    	let div3;
    	let div2;
    	let h3;
    	let t11;
    	let div1;
    	let t12;
    	let span;
    	let t14;
    	let select1;
    	let t15;
    	let textarea;
    	let t16;
    	let input5;
    	let t17;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*typeOptions*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*resourceOptions*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			input0 = element("input");
    			t0 = space();
    			label = element("label");
    			label.textContent = "add new";
    			t2 = space();
    			div4 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "thank you for contributing to stealthier!";
    			t4 = space();
    			form = element("form");
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			input3 = element("input");
    			t7 = space();
    			input4 = element("input");
    			t8 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "resources";
    			t11 = space();
    			div1 = element("div");
    			t12 = text("i ");
    			span = element("span");
    			span.textContent = "command click for multiple";
    			t14 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			textarea = element("textarea");
    			t16 = space();
    			input5 = element("input");
    			t17 = space();
    			button = element("button");
    			button.textContent = "submit";
    			attr_dev(input0, "id", "collapsible");
    			attr_dev(input0, "class", "toggle svelte-xld66y");
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file$1, 64, 4, 1389);
    			attr_dev(label, "for", "collapsible");
    			attr_dev(label, "class", "toggle-label svelte-xld66y");
    			add_location(label, file$1, 65, 4, 1449);
    			attr_dev(h5, "id", "success");
    			set_style(h5, "color", "#5eb571");
    			set_style(h5, "font-style", "italic");
    			attr_dev(h5, "class", "svelte-xld66y");
    			add_location(h5, file$1, 69, 8, 1567);
    			add_location(div0, file$1, 68, 4, 1553);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "title");
    			attr_dev(input1, "placeholder", "Name");
    			input1.required = true;
    			add_location(input1, file$1, 72, 6, 1761);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "city");
    			attr_dev(input2, "placeholder", "City");
    			input2.required = true;
    			add_location(input2, file$1, 73, 6, 1853);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "state");
    			attr_dev(input3, "placeholder", "State");
    			input3.required = true;
    			add_location(input3, file$1, 74, 6, 1943);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "gmaps");
    			attr_dev(input4, "placeholder", "Google Maps Link");
    			input4.required = true;
    			add_location(input4, file$1, 75, 6, 2036);
    			attr_dev(select0, "name", "type");
    			attr_dev(select0, "id", "type-select");
    			select0.required = true;
    			if (/*values*/ ctx[1].type === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[9].call(select0));
    			add_location(select0, file$1, 76, 6, 2140);
    			add_location(h3, file$1, 85, 8, 2441);
    			attr_dev(span, "class", "tooltiptext svelte-xld66y");
    			add_location(span, file$1, 86, 32, 2492);
    			attr_dev(div1, "class", "tooltip svelte-xld66y");
    			add_location(div1, file$1, 86, 8, 2468);
    			attr_dev(div2, "class", "resources-header svelte-xld66y");
    			add_location(div2, file$1, 84, 6, 2402);
    			attr_dev(select1, "name", "resources");
    			attr_dev(select1, "id", "resources-select");
    			select1.multiple = true;
    			attr_dev(select1, "data-placeholder", "add resources");
    			select1.required = true;
    			if (/*values*/ ctx[1].resources === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[10].call(select1));
    			add_location(select1, file$1, 89, 6, 2585);
    			attr_dev(div3, "class", "resources-container");
    			add_location(div3, file$1, 83, 6, 2362);
    			attr_dev(textarea, "name", "desc");
    			attr_dev(textarea, "id", "desc-input");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "placeholder", "location description...");
    			add_location(textarea, file$1, 98, 6, 2901);
    			attr_dev(input5, "class", "hp svelte-xld66y");
    			attr_dev(input5, "autocomplete", "off");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "id", "name");
    			attr_dev(input5, "name", "name");
    			attr_dev(input5, "placeholder", "Your name here");
    			add_location(input5, file$1, 100, 8, 3068);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 102, 6, 3204);
    			attr_dev(form, "class", "content-inner svelte-xld66y");
    			add_location(form, file$1, 71, 4, 1688);
    			attr_dev(div4, "class", "collapsible-content svelte-xld66y");
    			add_location(div4, file$1, 67, 3, 1515);
    			attr_dev(div5, "id", "form-wrap");
    			attr_dev(div5, "class", "svelte-xld66y");
    			add_location(div5, file$1, 63, 0, 1364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, input0);
    			append_dev(div5, t0);
    			append_dev(div5, label);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, h5);
    			append_dev(div4, t4);
    			append_dev(div4, form);
    			append_dev(form, input1);
    			set_input_value(input1, /*values*/ ctx[1].title);
    			append_dev(form, t5);
    			append_dev(form, input2);
    			set_input_value(input2, /*values*/ ctx[1].city);
    			append_dev(form, t6);
    			append_dev(form, input3);
    			set_input_value(input3, /*values*/ ctx[1].state);
    			append_dev(form, t7);
    			append_dev(form, input4);
    			set_input_value(input4, /*values*/ ctx[1].gmaps);
    			append_dev(form, t8);
    			append_dev(form, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*values*/ ctx[1].type);
    			append_dev(form, t9);
    			append_dev(form, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div1, t12);
    			append_dev(div1, span);
    			append_dev(div3, t14);
    			append_dev(div3, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_options(select1, /*values*/ ctx[1].resources);
    			append_dev(form, t15);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*values*/ ctx[1].desc);
    			append_dev(form, t16);
    			append_dev(form, input5);
    			set_input_value(input5, /*honeyPot*/ ctx[0]);
    			append_dev(form, t17);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[7]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[8]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[9]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[10]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[12]),
    					listen_dev(form, "submit", prevent_default(/*newListing*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*values, typeOptions*/ 6 && input1.value !== /*values*/ ctx[1].title) {
    				set_input_value(input1, /*values*/ ctx[1].title);
    			}

    			if (dirty & /*values, typeOptions*/ 6 && input2.value !== /*values*/ ctx[1].city) {
    				set_input_value(input2, /*values*/ ctx[1].city);
    			}

    			if (dirty & /*values, typeOptions*/ 6 && input3.value !== /*values*/ ctx[1].state) {
    				set_input_value(input3, /*values*/ ctx[1].state);
    			}

    			if (dirty & /*values, typeOptions*/ 6 && input4.value !== /*values*/ ctx[1].gmaps) {
    				set_input_value(input4, /*values*/ ctx[1].gmaps);
    			}

    			if (dirty & /*typeOptions*/ 4) {
    				each_value_1 = /*typeOptions*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*values, typeOptions*/ 6) {
    				select_option(select0, /*values*/ ctx[1].type);
    			}

    			if (dirty & /*resourceOptions*/ 8) {
    				each_value = /*resourceOptions*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*values, typeOptions*/ 6) {
    				select_options(select1, /*values*/ ctx[1].resources);
    			}

    			if (dirty & /*values, typeOptions*/ 6) {
    				set_input_value(textarea, /*values*/ ctx[1].desc);
    			}

    			if (dirty & /*honeyPot*/ 1 && input5.value !== /*honeyPot*/ ctx[0]) {
    				set_input_value(input5, /*honeyPot*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let timestamp = new Date();
    	let honeyPot = "";

    	let values = {
    		title: "",
    		city: "",
    		state: "",
    		gmaps: "",
    		desc: "",
    		type: "Municipality",
    		resources: [],
    		timestamp: timestamp.getTime()
    	};

    	let typeOptions = ["Municipality", "State Park", "National Park / Forest"];

    	let resourceOptions = [
    		"Public Wifi",
    		"Overnight Parking",
    		"Day Parking",
    		"Laundromat",
    		"Public Shower",
    		"Public Restroom",
    		"Port-O-John",
    		"Views",
    		"Park",
    		"Coffee Spot",
    		"Other"
    	];

    	const reset = () => {
    		$$invalidate(1, values = {
    			title: "",
    			city: "",
    			state: "",
    			gmaps: "",
    			desc: "",
    			type: "Municipality",
    			resources: [],
    			timestamp: timestamp.getTime()
    		});
    	};

    	const newListing = () => {
    		if (honeyPot === "" && Object.values(values).every(x => x !== null || x !== "")) {
    			db$1.collection("listings").add(values);
    			document.getElementById("success").style.display = "block";
    		} else {
    			alert("please fill out all of the form fields!");
    		}

    		reset();
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Form", $$slots, []);

    	function input1_input_handler() {
    		values.title = this.value;
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function input2_input_handler() {
    		values.city = this.value;
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function input3_input_handler() {
    		values.state = this.value;
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function input4_input_handler() {
    		values.gmaps = this.value;
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function select0_change_handler() {
    		values.type = select_value(this);
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function select1_change_handler() {
    		values.resources = select_multiple_value(this);
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function textarea_input_handler() {
    		values.desc = this.value;
    		$$invalidate(1, values);
    		$$invalidate(2, typeOptions);
    	}

    	function input5_input_handler() {
    		honeyPot = this.value;
    		$$invalidate(0, honeyPot);
    	}

    	$$self.$capture_state = () => ({
    		db: db$1,
    		timestamp,
    		honeyPot,
    		values,
    		typeOptions,
    		resourceOptions,
    		reset,
    		newListing
    	});

    	$$self.$inject_state = $$props => {
    		if ("timestamp" in $$props) timestamp = $$props.timestamp;
    		if ("honeyPot" in $$props) $$invalidate(0, honeyPot = $$props.honeyPot);
    		if ("values" in $$props) $$invalidate(1, values = $$props.values);
    		if ("typeOptions" in $$props) $$invalidate(2, typeOptions = $$props.typeOptions);
    		if ("resourceOptions" in $$props) $$invalidate(3, resourceOptions = $$props.resourceOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		honeyPot,
    		values,
    		typeOptions,
    		resourceOptions,
    		newListing,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		textarea_input_handler,
    		input5_input_handler
    	];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Card.svelte generated by Svelte v3.23.2 */

    const file$2 = "src/components/Card.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (14:8) {#each $$props.data().resources as resource}
    function create_each_block$1(ctx) {
    	let div;
    	let t0_value = /*resource*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", div_class_value = "resource " + /*resource*/ ctx[3].replace(/\s+/g, "") + " svelte-ssg66v");
    			add_location(div, file$2, 14, 12, 503);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$$props*/ 2 && t0_value !== (t0_value = /*resource*/ ctx[3] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$$props*/ 2 && div_class_value !== (div_class_value = "resource " + /*resource*/ ctx[3].replace(/\s+/g, "") + " svelte-ssg66v")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(14:8) {#each $$props.data().resources as resource}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div4;
    	let div1;
    	let h2;
    	let t0_value = /*$$props*/ ctx[1].data().title + "";
    	let t0;
    	let t1;
    	let div0;
    	let strong;
    	let t2_value = /*$$props*/ ctx[1].data().city + "";
    	let t2;
    	let span;
    	let t3;
    	let t4_value = /*$$props*/ ctx[1].data().state + "";
    	let t4;
    	let t5;
    	let a;
    	let button0;
    	let a_href_value;
    	let t7;
    	let div2;
    	let t8;
    	let p;
    	let t9_value = /*$$props*/ ctx[1].data().desc + "";
    	let t9;
    	let t10;
    	let div3;
    	let button1;
    	let t12;
    	let h5;
    	let t13;
    	let t14_value = /*$$props*/ ctx[1].data().type + "";
    	let t14;
    	let mounted;
    	let dispose;
    	let each_value = /*$$props*/ ctx[1].data().resources;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			strong = element("strong");
    			t2 = text(t2_value);
    			span = element("span");
    			t3 = text(", ");
    			t4 = text(t4_value);
    			t5 = space();
    			a = element("a");
    			button0 = element("button");
    			button0.textContent = "directions";
    			t7 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			p = element("p");
    			t9 = text(t9_value);
    			t10 = space();
    			div3 = element("div");
    			button1 = element("button");
    			button1.textContent = "more...";
    			t12 = space();
    			h5 = element("h5");
    			t13 = text("Location Type: ");
    			t14 = text(t14_value);
    			add_location(h2, file$2, 6, 8, 100);
    			add_location(span, file$2, 8, 47, 222);
    			add_location(strong, file$2, 8, 16, 191);
    			add_location(button0, file$2, 9, 67, 338);
    			attr_dev(a, "href", a_href_value = /*$$props*/ ctx[1].data().gmaps);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 9, 16, 287);
    			attr_dev(div0, "class", "sub-title-cont svelte-ssg66v");
    			add_location(div0, file$2, 7, 12, 146);
    			attr_dev(div1, "class", "card-title svelte-ssg66v");
    			add_location(div1, file$2, 5, 4, 67);
    			attr_dev(div2, "class", "resources-cont svelte-ssg66v");
    			add_location(div2, file$2, 12, 4, 409);
    			attr_dev(p, "class", "desc svelte-ssg66v");
    			toggle_class(p, "active", /*active*/ ctx[0]);
    			add_location(p, file$2, 19, 4, 639);
    			add_location(button1, file$2, 21, 8, 747);
    			attr_dev(h5, "class", "location-type svelte-ssg66v");
    			add_location(h5, file$2, 22, 8, 816);
    			attr_dev(div3, "class", "read-more-cont svelte-ssg66v");
    			add_location(div3, file$2, 20, 4, 709);
    			attr_dev(div4, "class", "card svelte-ssg66v");
    			add_location(div4, file$2, 4, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, strong);
    			append_dev(strong, t2);
    			append_dev(strong, span);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(div0, t5);
    			append_dev(div0, a);
    			append_dev(a, button0);
    			append_dev(div4, t7);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div4, t8);
    			append_dev(div4, p);
    			append_dev(p, t9);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(div3, t12);
    			append_dev(div3, h5);
    			append_dev(h5, t13);
    			append_dev(h5, t14);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 2 && t0_value !== (t0_value = /*$$props*/ ctx[1].data().title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$$props*/ 2 && t2_value !== (t2_value = /*$$props*/ ctx[1].data().city + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$$props*/ 2 && t4_value !== (t4_value = /*$$props*/ ctx[1].data().state + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$$props*/ 2 && a_href_value !== (a_href_value = /*$$props*/ ctx[1].data().gmaps)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$$props*/ 2) {
    				each_value = /*$$props*/ ctx[1].data().resources;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$$props*/ 2 && t9_value !== (t9_value = /*$$props*/ ctx[1].data().desc + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*active*/ 1) {
    				toggle_class(p, "active", /*active*/ ctx[0]);
    			}

    			if (dirty & /*$$props*/ 2 && t14_value !== (t14_value = /*$$props*/ ctx[1].data().type + "")) set_data_dev(t14, t14_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let active = false;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);
    	const click_handler = () => $$invalidate(0, active = !active);

    	$$self.$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ active });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ("active" in $$props) $$invalidate(0, active = $$new_props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [active, $$props, click_handler];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/CardGrid.svelte generated by Svelte v3.23.2 */
    const file$3 = "src/components/CardGrid.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (13:1) {#each arr as listing}
    function create_each_block$2(ctx) {
    	let card;
    	let current;
    	const card_spread_levels = [/*listing*/ ctx[1]];
    	let card_props = {};

    	for (let i = 0; i < card_spread_levels.length; i += 1) {
    		card_props = assign(card_props, card_spread_levels[i]);
    	}

    	card = new Card({ props: card_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = (dirty & /*arr*/ 1)
    			? get_spread_update(card_spread_levels, [get_spread_object(/*listing*/ ctx[1])])
    			: {};

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(13:1) {#each arr as listing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	let each_value = /*arr*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "card-grid");
    			attr_dev(div, "class", "svelte-1f4w5bj");
    			add_location(div, file$3, 11, 0, 223);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*arr*/ 1) {
    				each_value = /*arr*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let arr = [];

    	db$1.collection("listings").orderBy("city", "asc").onSnapshot(snapData => {
    		$$invalidate(0, arr = snapData.docs);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardGrid> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardGrid", $$slots, []);
    	$$self.$capture_state = () => ({ db: db$1, Card, arr });

    	$$self.$inject_state = $$props => {
    		if ("arr" in $$props) $$invalidate(0, arr = $$props.arr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [arr];
    }

    class CardGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardGrid",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.23.2 */

    const file$4 = "src/components/Footer.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let span0;
    	let t0;
    	let a0;
    	let t2;
    	let span1;
    	let t4;
    	let hr;
    	let t5;
    	let span2;
    	let a1;
    	let img;
    	let img_src_value;
    	let t6;
    	let span3;
    	let t8;
    	let span4;
    	let t9;
    	let a2;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			span0 = element("span");
    			t0 = text("Copyright 2020 ");
    			a0 = element("a");
    			a0.textContent = "Jacob Stordahl";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "|";
    			t4 = space();
    			hr = element("hr");
    			t5 = space();
    			span2 = element("span");
    			a1 = element("a");
    			img = element("img");
    			t6 = space();
    			span3 = element("span");
    			span3.textContent = "|";
    			t8 = space();
    			span4 = element("span");
    			t9 = text("Contribute on ");
    			a2 = element("a");
    			a2.textContent = "Github";
    			attr_dev(a0, "href", "http://jacobstordahl.com/");
    			attr_dev(a0, "class", "svelte-1meq5d3");
    			add_location(a0, file$4, 2, 25, 35);
    			add_location(span0, file$4, 2, 4, 14);
    			attr_dev(span1, "class", "pipe svelte-1meq5d3");
    			add_location(span1, file$4, 3, 4, 102);
    			attr_dev(hr, "class", "svelte-1meq5d3");
    			add_location(hr, file$4, 4, 8, 140);
    			attr_dev(img, "height", "36");
    			set_style(img, "border", "0px");
    			set_style(img, "height", "36px");
    			if (img.src !== (img_src_value = "https://cdn.ko-fi.com/cdn/kofi5.png?v=2")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "border", "0");
    			attr_dev(img, "alt", "Buy Me a Coffee at ko-fi.com");
    			add_location(img, file$4, 5, 75, 220);
    			attr_dev(a1, "href", "https://ko-fi.com/W7W81PO93");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1meq5d3");
    			add_location(a1, file$4, 5, 21, 166);
    			attr_dev(span2, "id", "kofi");
    			attr_dev(span2, "class", "svelte-1meq5d3");
    			add_location(span2, file$4, 5, 4, 149);
    			attr_dev(span3, "class", "pipe svelte-1meq5d3");
    			add_location(span3, file$4, 6, 4, 381);
    			attr_dev(a2, "href", "https://github.com/stordahl/stealthier");
    			attr_dev(a2, "class", "svelte-1meq5d3");
    			add_location(a2, file$4, 7, 24, 436);
    			add_location(span4, file$4, 7, 4, 416);
    			attr_dev(footer, "class", "svelte-1meq5d3");
    			add_location(footer, file$4, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, span0);
    			append_dev(span0, t0);
    			append_dev(span0, a0);
    			append_dev(footer, t2);
    			append_dev(footer, span1);
    			append_dev(footer, t4);
    			append_dev(footer, hr);
    			append_dev(footer, t5);
    			append_dev(footer, span2);
    			append_dev(span2, a1);
    			append_dev(a1, img);
    			append_dev(footer, t6);
    			append_dev(footer, span3);
    			append_dev(footer, t8);
    			append_dev(footer, span4);
    			append_dev(span4, t9);
    			append_dev(span4, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.2 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let header;
    	let t0;
    	let form;
    	let t1;
    	let cardgrid;
    	let t2;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	form = new Form({ $$inline: true });
    	cardgrid = new CardGrid({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(form.$$.fragment);
    			t1 = space();
    			create_component(cardgrid.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-tmd0ca");
    			add_location(main, file$5, 7, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(form, main, null);
    			append_dev(main, t1);
    			mount_component(cardgrid, main, null);
    			append_dev(main, t2);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(form.$$.fragment, local);
    			transition_in(cardgrid.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(form.$$.fragment, local);
    			transition_out(cardgrid.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(form);
    			destroy_component(cardgrid);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Header, Form, CardGrid, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
