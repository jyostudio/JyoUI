import Base from "@JyoUI/Common/Base.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Platform from "@JyoUI/Common/Platform.js";
import themeManager from "@JyoUI/Common/ThemeManager.js";
import StringEx from "@JyoUI/Common/InternalExpand/StringEx.js";
let MenuFlyout;

// 文件缓存
const FILES_CACHE = new Map();

// 基础样式
let BasicStyle = null;

// 已注册组件列表
const REGISTERED_LIST = new Map();

const GetFileAndCache = MethodOverload().Add(
    [URL],
    /**
     * 获取文件并缓存
     * @param {URL} url URL对象
     * @returns {Promise<String>} 文件内容
     */
    function (url) {
        const href = url.href.split("#")[0];
        if (FILES_CACHE.has(href)) {
            return FILES_CACHE.get(href);
        }
        let promise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    reject();
                }
                FILES_CACHE.delete(href);
                const file = new File([await res.blob()], href);
                FILES_CACHE.set(href, file);
                resolve(file);
                // 5分钟后删除缓存
                setTimeout(() => {
                    FILES_CACHE.delete(href);
                }, 5 * 60 * 1000);
            } catch {
                reject();
            }
        });
        FILES_CACHE.set(href, promise);
        return promise;
    }
);

const ImportStyleWithProcess = MethodOverload().Add(
    [URL],
    /**
     * 导入样式并进行处理
     * @param {URL} url URL对象
     * @returns {Promise<CSSStyleSheet>} 以Promise形式返回的CSS样式表对象
     */
    async function (url) {
        let styleSheet = new CSSStyleSheet();
        async function getImport(url) {
            const res = await GetFileAndCache(url);
            let text = await res.text();
            text = text.replace(/\:\s?url\((.+?)\)/g, function (item) {
                const resourceUrl = item.match(/url\((.+?)\)/)[1];
                return `:url(${new URL(resourceUrl, url)})`;
            });
            const matches = text.matchAll(/@import\s+url\((.+?)\);/g);
            for (const match of matches) {
                const importUrl = new URL(match[1], url);
                text = text.replace(match[0], await getImport(importUrl));
            }
            return text;
        }
        styleSheet.replaceSync(themeManager.SupportToHDR(await getImport(url)));
        return styleSheet;
    }
);

export const Register = MethodOverload()
    .Add(
        [Function, String],
        /**
         * 注册组件
         * @param {Function} constructor 构造函数
         * @param {String} url 组件路径
         * @returns {Promise<void>} 返回注册结果
         */
        function (constructor, url) {
            return Register(constructor, url, { name: null, style: true, template: true });
        }
    )
    .Add(
        [Function, String, Object],
        /**
         * 注册组件
         * @param {Function} constructor 构造函数
         * @param {String} url 组件路径
         * @param {Object} importOptions 导入选项
         * @param {String} importOptions.name 组件名称
         * @param {Boolean|String} importOptions.style 导入组件样式
         * @param {Boolean|String} importOptions.template 导入组件模板
         * @returns {Promise<void>} 返回注册结果
         */
        async function (constructor, url, importOptions) {
            // 获取定义名称
            const name = importOptions.name ?? constructor.name;

            // 生成组件名称
            let componentName = "";
            if (importOptions.name) {
                componentName = `jyo-${importOptions.name}`;
            } else {
                componentName = `jyo${name.replace(/[A-Z]/g, function (item) {
                    return "-" + item.toLowerCase();
                })}`;
            }

            const TAG_NAME = componentName.toUpperCase();
            [constructor, constructor.prototype].forEach(item => {
                Object.defineProperty(item, "ComponentTagName", {
                    get() {
                        return TAG_NAME;
                    }
                });
            });

            if (REGISTERED_LIST.has(componentName)) {
                console.warn(`组件 ${componentName} 已注册，无需重复注册。`);
                return;
            }

            // 导入基础样式
            if (!BasicStyle) {
                BasicStyle = await ImportStyleWithProcess(new URL("./Basic.css", import.meta.url));
            }

            // 导入组件样式
            let styleSheet;
            if (importOptions?.style && (typeof importOptions.style === "boolean" || importOptions.style instanceof URL)) {
                const baseUrl = importOptions.style instanceof URL ? importOptions.style : new URL(`./${constructor.name}.css`, url);
                styleSheet = await ImportStyleWithProcess(baseUrl);
            } else if (typeof importOptions.style === "string") {
                styleSheet = new CSSStyleSheet();
                styleSheet.replaceSync(themeManager.SupportToHDR(importOptions.style));
            }
            // 导入组件模板
            let htmlTemplate = "";
            if (importOptions.template && (typeof importOptions.template === "boolean" || importOptions.template instanceof URL)) {
                const res = await GetFileAndCache(importOptions.template instanceof URL ? importOptions.template : new URL(`./${constructor.name}.html`, url));
                const text = await res.text();
                htmlTemplate += themeManager.CovertToP3(text);
            } else {
                htmlTemplate += themeManager.CovertToP3(importOptions.template || "");
            }
            // 添加到已注册组件列表
            REGISTERED_LIST.set(componentName, { url, htmlTemplate, styleSheet });
            // 向系统注册组件
            customElements.define(componentName, constructor);
        }
    );

/**
 * 组件基类
 * @extends HTMLElement
 * @abstract
 * @class
 */
export default class Basic extends HTMLElement {
    /**
     * 组件列表
     * @type {WeakMap<Object,HTMLElement>}
     */
    static #components = new WeakMap();

    /**
     * 电池管理器
     * @type {BatteryManager}
     */
    static #batteryManager = null;

    /**
     * 是否省电模式
     * @type {Boolean}
     */
    static #powerSavingMode = false;

    /**
     * 省电模式改变事件
     * @type {EventHandle}
     */
    static #onPowerSavingModeChange = new EventHandle();

    // 唯一标识
    #id = { id: new Date().getTime().toString(36) + "-" + Math.random().toString(36).substr(2, 9) };

    /**
     * 附加数据
     * @type {any}
     */
    #tag = null;

    /**
     * DOM 观察者
     * @type {MutationObserver}
     */
    #observer = null;

    /**
     * 中止控制器
     * @type {AbortController}
     */
    #abortController = new AbortController();

    /**
     * 组件路径
     * @type {String}
     */
    #url = import.meta.url;

    /**
     * 阴影根
     * @type {ShadowRoot}
     */
    #shadowRoot = null;

    /**
     * 父级
     * @type {HTMLElement?}
     */
    #parent = null;

    /**
     * 强制父级
     * @type {HTMLElement?}
     */
    #forceParent = null;

    /**
     * 是否激活
     * @type {Boolean}
     */
    #isActive = false;

    /**
     * 用户是否可以与控件交互
     * @type {Boolean}
     */
    #isEnable = true;

    /**
     * 防抖表
     * @type {Map}
     */
    #debouncingTable = new Map();

    /**
     * 绑定的主题更改触发函数
     * @type {Function}
     */
    #bindOnThemeChange = null;

    /**
     * 绑定的省电模式更改触发函数
     * @type {Function}
     */
    #bindOnPowerSavingModeChange = null;

    /**
     * 是否为复制出来的组件
     * @type {Boolean}
     */
    #isCopyed = false;

    /**
     * 组件被激活时发生事件
     * @type {EventHandle}
     */
    #onActivated = new EventHandle(this.AbortController);

    /**
     * 组件被未激活时发生事件
     * @type {EventHandle}
     */
    #onDeactivated = new EventHandle(this.AbortController);

    /**
     * DOM 改变时触发事件
     * @type {EventHandle}
     */
    #onDOMChange = new EventHandle(this.AbortController);

    /**
     * 获取是否省电模式
     * @returns {Boolean}
     */
    static get PowerSavingMode() {
        return this.#powerSavingMode;
    }

    /**
     * 获取省电模式改变事件
     * @returns {EventHandle}
     */
    static get OnPowerSavingModeChange() {
        return this.#onPowerSavingModeChange;
    }

    /**
     * 获取阴影根
     * @returns {ShadowRoot} 阴影根
     */
    get Root() {
        return this.#shadowRoot;
    }

    /**
     * 获取是否激活
     * @returns {Boolean} 是否激活
     */
    get IsActive() {
        return this.#isActive;
    }

    /**
     * 获取组件被激活时发生事件
     * @returns {EventHandle} 事件
     */
    get OnActivated() {
        return this.#onActivated;
    }

    /**
     * 获取组件被未激活时发生事件
     * @returns {EventHandle} 事件
     */
    get OnDeactivated() {
        return this.#onDeactivated;
    }

    /**
     * 获取 DOM 改变时触发事件
     * @returns {EventHandle} 事件
     */
    get OnDOMChange() {
        return this.#onDOMChange;
    }

    /**
     * 获取组件路径
     * @returns {String} 组件路径
     */
    get URL() {
        return this.#url;
    }

    /**
     * 获取中止控制器
     * @returns {AbortController} 中止控制器
     */
    get AbortController() {
        return this.#abortController;
    }

    static #_constructor = function (...params) {
        Basic.#_constructor = MethodOverload().Add(
            [],
            /**
             * 组件基类构造函数
             * @constructor
             * @this {Basic}
             * @returns {Basic} 组件基类实例
             */
            function () {
                Basic.#components.set(this.Id, this);

                // 初始化 DOM 观察者
                this.#InitObserver();

                const { url, htmlTemplate, styleSheet } = REGISTERED_LIST.get(this.localName);

                // 获取组件路径
                this.#url = url;

                // 创建影子根
                this.#shadowRoot = this.attachShadow({ mode: "closed" });
                // 添加样式到影子根
                this.#shadowRoot.adoptedStyleSheets = [BasicStyle, themeManager.StyleSheet];
                if (styleSheet) {
                    this.#shadowRoot.adoptedStyleSheets.push(styleSheet);
                }
                // 添加组件模板内容到影子根
                this.#shadowRoot.innerHTML = htmlTemplate;
            }
        );

        return Basic.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        super();

        if (new.target === Basic) {
            throw new TypeError(`无法创建 Basic 的实例，因为它是一个抽象类。`);
        }

        Base.DefineProperties(this, {
            Id: {
                /**
                 * 获取 ID
                 * @this {Basic}
                 * @returns {Object} ID
                 */
                get() {
                    return this.#id;
                },
                set: MethodOverload().Add(
                    [Object],
                    /**
                     * 设置 ID
                     * @this {Basic}
                     * @param {Object} value ID
                     */
                    function (value) {
                        this.#id = value;
                    }
                )
            },
            Parent: {
                /**
                 * 获取父级
                 * @this {Basic}
                 * @returns {HTMLElement?} 父级
                 */
                get() {
                    return this.#forceParent || this.#parent;
                },
                set: MethodOverload().Add(
                    [[HTMLElement, null]],
                    /**
                     * 设置父级
                     * @this {Basic}
                     * @param {HTMLElement?} value 父级
                     */
                    function (value) {
                        if (!this.#forceParent) {
                            this.#parent = value;
                        } else {
                            this.#parent = this.#forceParent;
                        }
                        this.attributeChangedCallback?.("~", null, value);
                    }
                )
            },
            ForceParent: {
                /**
                 * 获取强制父级
                 * @this {Basic}
                 * @returns {HTMLElement?} 强制父级
                 */
                get() {
                    return this.#forceParent;
                },
                set: MethodOverload().Add(
                    [[HTMLElement, null]],
                    /**
                     * 设置强制父级
                     * @this {Basic}
                     * @param {HTMLElement?} value 强制父级
                     */
                    function (value) {
                        this.#forceParent = value;
                        this.Parent = value;
                    }
                )
            },
            IsCopyed: {
                /**
                 * 获取是否为复制出来的组件
                 * @this {Basic}
                 * @returns {Boolean}
                 */
                get() {
                    return this.#isCopyed;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否为复制出来的组件
                     * @this {Basic}
                     * @param {Boolean} value 是否为复制出来的组件
                     */
                    function (value) {
                        this.#isCopyed = value;
                    }
                )
            }
        });

        this.DefineProperties({
            Tag: {
                /**
                 * 获取附加数据
                 * @this {Basic}
                 * @returns {any} 附加数据
                 */
                get() {
                    return this.#tag;
                },
                set: MethodOverload().Add(
                    ["*"],
                    /**
                     * 设置附加数据
                     * @this {Basic}
                     * @param {any} value 附加数据
                     */
                    function (value) {
                        this.#tag = value;
                        Basic.SetPropertyValueById(this.Id, "Tag", value);
                    }
                )
            },
            IsEnable: {
                /**
                 * 获取用户是否可以与控件交互
                 * @this {Basic}
                 * @returns {Boolean}
                 */
                get() {
                    return this.#isEnable;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置用户是否可以与控件交互
                     * @this {Basic}
                     * @param {Boolean} value 用户是否可以与控件交互
                     */
                    function (value) {
                        this.#isEnable = value;
                        if (value) {
                            this.removeAttribute("disabled");
                        } else {
                            this.setAttribute("disabled", "");
                        }
                        this.Debouncing(this.Update);
                    }
                )
            }
        });

        return Basic.#_constructor.call(this, ...params);
    }

    /**
     * 初始化省电模式事件
     */
    static async #InitPowerSavingModeEvent() {
        const dispatchFn = (reducedMotion => {
            this.#powerSavingMode = reducedMotion;
            this.#onPowerSavingModeChange.Dispatch(this, this.#powerSavingMode);
        }).bind(this);

        // 集成低端 GPU、ARM CPU 性能太差，进入省电模式以提高性能
        const GPU = await Platform.GetGPUInfo();
        if (!["Apple"].includes(GPU.vendor) && (["Qualcomm", "Intel"].includes(GPU.vendor) || (await Platform.GetCPUArchitecture()).indexOf("ARM") >= 0)) {
            dispatchFn(true);
            return;
        }

        // 电池检查函数
        let checkBatteryFn = null;

        // 是否减少动画
        let isPrefersReducedMotion = false;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        prefersReducedMotion.addEventListener("change", e => {
            isPrefersReducedMotion = e.matches;
            dispatchFn(e.matches);

            // 如果不减少动画并且有电池管理器，则检查电池状态
            if (!isPrefersReducedMotion && checkBatteryFn) {
                checkBatteryFn();
            }
        });
        isPrefersReducedMotion = prefersReducedMotion.matches;
        dispatchFn(isPrefersReducedMotion);

        if (navigator.getBattery) {
            this.#batteryManager = await navigator.getBattery();
            checkBatteryFn = (() => {
                // 如果减少动画则不检查电池状态
                if (isPrefersReducedMotion) return;
                dispatchFn(!this.#batteryManager.charging && this.#batteryManager.level < 0.5);
            }).bind(this);
            this.#batteryManager.onchargingchange = checkBatteryFn;
            this.#batteryManager.onlevelchange = checkBatteryFn;
            checkBatteryFn();
        }
    }

    static GetAbsolutePath(...params) {
        Basic.GetAbsolutePath = MethodOverload().Add(
            [String, String],
            /**
             * 获取绝对路径
             * @this {Basic}
             * @param {String} base 基本路径
             * @param {String} relative 相对路径
             * @returns {String} 返回绝对路径
             */
            function (base, relative) {
                if (relative[0] === "/") return relative;
                if (/^http(s)?\:/i.test(relative)) return relative;

                const newPath = base.split("/");
                newPath.pop();

                const relativeArr = relative.split("/");

                for (let i = 0; i < relativeArr.length; i++) {
                    switch (relativeArr[i]) {
                        case "..":
                            newPath.pop();
                            relativeArr.shift();
                            i--;
                            break;
                        case ".":
                            relativeArr.shift();
                            i--;
                            break;
                    }
                }

                return newPath.concat(relativeArr).join("/");
            }
        );

        return Basic.GetAbsolutePath.call(this, ...params);
    }

    static SetPropertyValueById(...params) {
        Basic.SetPropertyValueById = MethodOverload().Add(
            [Object, String, "*"],
            /**
             * 设置属性值
             * @param {Object} id ID
             * @param {String} propertyName 属性名
             * @param {any} value 值
             */
            function (id, propertyName, value) {
                if (!Basic.#components.has(id)) return;
                const component = Basic.#components.get(id);
                Basic.#components.delete(id);
                component[propertyName] = value;
                Basic.#components.set(id, component);
            }
        );

        return Basic.SetPropertyValueById.call(this, ...params);
    }

    /**
     * 初始化 DOM 观察者
     */
    #InitObserver() {
        if (this.#observer) return;
        this.#observer = new MutationObserver(record => {
            record.forEach(async item => {
                if (item.type === "attributes") {
                    if (item.attributeName === "style") return;
                    if (item.attributeName.indexOf("data-on-") === 0) {
                        this.#BindAllElementEvents(item.target);
                    } else if (item.target === this) {
                        this.#ProcessObservedAttributes(item.attributeName, item.oldValue, item.target.getAttribute(item.attributeName));
                    }
                } else if (item.type === "childList") {
                    this.#BindAllElementEvents(item.target);
                    this.Root.querySelectorAll("jyo-menu-flyout").forEach(item => {
                        item.ForceParent = this;
                    });
                }
                this.OnDOMChange.Dispatch(this, item.target);

                let parent = this?.Parent || this?.parentElement;
                while (parent) {
                    parent?.OnDOMChange?.Dispatch(this, item.target);
                    parent = parent?.Parent || parent?.parentElement;
                }
            });

            this.#ThemeChange();
        });
    }

    /**
     * 省电模式改变事件
     */
    #PowerSavingModeChange() {
        this.#shadowRoot.host.dataset.powerSavingMode = Basic.#powerSavingMode;
    }

    /**
     * 主题切换事件
     */
    #ThemeChange() {
        this.#shadowRoot.host.dataset.themeMode = themeManager.CurrentThemeModeStr;

        // 查找当前主题对应的图片
        this.#shadowRoot.querySelectorAll(`img[data-theme="${themeManager.CurrentThemeModeStr}"]`).forEach(item => {
            if (!item.dataset.img) {
                return;
            }
            // 替换图片路径
            item.setAttribute("src", new URL("Images/" + item.dataset.img, this.#url));
            delete item.dataset.img;
        });
    }

    /**
     * 绑定所有元素事件
     * @param {HTMLElement} [root] 根元素
     */
    #BindAllElementEvents(root) {
        if (this.IsCopyed) return;
        (root || this.#shadowRoot).querySelectorAll("*").forEach(el => {
            this.BindAllEventsByElement(el);
        });
    }

    /**
     * 根据元素绑定所有事件
     * @param {HTMLElement} el 元素
     */
    BindAllEventsByElement(el) {
        el.BindedEvents = el.BindedEvents || {};
        const attrs = el.attributes;
        for (let i = attrs.length; i--;) {
            const attr = attrs[i];
            const matches = attr.name.match(/^data-on-(.+)$/);

            if (!matches) continue;

            let fn = this[attr.value];

            if (!fn) {
                let p = this;
                let isFindParent = false;
                while (true) {
                    const find = p?.[attr.value];
                    if (!find) {
                        if (p === window) break;
                        p = isFindParent ? p?.Parent : p?.parentElement;
                        if (!p) {
                            if (isFindParent) {
                                p = window;
                            } else {
                                isFindParent = true;
                                p = this.Parent;
                            }
                        }
                    } else {
                        fn = find;
                        break;
                    }
                }
            }

            const eventName = matches[1];

            if (typeof fn !== "function") {
                el.BindedEvents[eventName] = el[`on${eventName}`] = null;
                if (eventName === "mousewheel") {
                    el.BindedEvents[`onDOMMouseScroll`] = el[`onDOMMouseScroll`] = null;
                }
                continue;
            }

            el.BindedEvents[eventName] = el[`on${eventName}`] = e => {
                e.Target = el;
                fn.call(this, e);
            };
            if (eventName === "mousewheel") {
                el.BindedEvents[`onDOMMouseScroll`] = el[`onDOMMouseScroll`] = e => {
                    e.wheelDelta = -e.detail * 24;
                    e.Target = el;
                    // 调用事件处理函数
                    fn.call(this, e);
                };
            }
        }
    }

    /**
     * 检查父级
     */
    #CheckParent() {
        if (this.#forceParent) return;
        this.Parent = null;
        let parent = this.parentElement;
        while (parent) {
            if (parent?.tagName.indexOf("JYO-") === 0) {
                this.Parent = parent;
                this?.parentElement.addEventListener(
                    "load",
                    () => {
                        this.#CheckParent();
                    },
                    false
                );
                break;
            }
            parent = parent.parentElement;
        }
    }

    /**
     * 处理观察属性
     * @param {String} name 属性名
     * @param {String?} oldValue 旧属性值
     * @param {String?} newValue 新属性值
     * @this {Basic}
     */
    async #ProcessObservedAttributes(name, oldValue, newValue) {
        if (!this.HasLoaded) {
            await this.WaitLoad();
            this.#ProcessObservedAttributes(name, oldValue, newValue);
            return;
        }

        if (newValue === null) return;
        const oa = this.constructor?.ObservedAttributesTypes;
        if (!oa?.[name]) return;
        const propertyKey = new StringEx(name).ToPascalCase();
        if (!Object.getOwnPropertyDescriptor(this, propertyKey)) {
            throw new ReferenceError(`未找到属性: ${propertyKey}`);
        }
        let type = oa[name];
        if (Array.isArray(type)) {
            if (oa[name].includes(null) && ["null", ""].includes(newValue)) {
                this[propertyKey] = null;
                return;
            }

            type = type[0];
        }
        switch (type) {
            case String:
                this[propertyKey] = newValue?.toString() || "";
                break;
            case Number:
                this[propertyKey] = parseFloat(newValue);
                if (isNaN(this[propertyKey])) this[propertyKey] = 0;
                break;
            case Boolean:
                this[propertyKey] = ["on", "yes", "1", "true"].includes(newValue?.trim());
                break;
        }
    }

    /**
     * 当自定义元素首次被插入文档DOM时, 被调用
     * @returns {Promise<void>} 返回执行结果
     */
    async connectedCallback() {
        // 绑定省电模式改变触发函数
        this.#bindOnPowerSavingModeChange = this.#PowerSavingModeChange.bind(this);
        Basic.OnPowerSavingModeChange.Bind(this.#bindOnPowerSavingModeChange);
        // 手动触发一次省电模式改变
        this.#PowerSavingModeChange();

        // 绑定主题切换触发函数
        this.#bindOnThemeChange = this.#ThemeChange.bind(this);
        themeManager.ChangeEvent.Bind(this.#bindOnThemeChange);
        // 手动触发一次主题切换
        this.#ThemeChange();

        // 绑定 DOM 观察者
        this.#observer.observe(this.#shadowRoot, {
            attributeOldValue: true,
            attributes: true,
            childList: true,
            subtree: true
        });

        this.#CheckParent();

        globalThis.requestIdleCallback(async () => {
            Base.DefineProperties(this, {
                HasLoaded: {
                    get() {
                        return true;
                    }
                }
            });

            await this.Load?.();
            this.Update?.();

            // 绑定所有元素事件
            this.#BindAllElementEvents();

            /**
             * 处理初始属性值
             */
            const attrs = this.#shadowRoot.host.attributes;
            for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                this.#ProcessObservedAttributes(attr.name, null, attr.value);
            }

            // 使用 DOM 事件触发组件加载完成事件
            const loadEvent = new CustomEvent("load", { bubbles: false, composed: true });
            this.#shadowRoot.dispatchEvent(loadEvent);

            this.UpdateAllSubComponent();

            for (const key in this.constructor.ObservedAttributesTypes) {
                const propertyKey = new StringEx(key).ToPascalCase();
                if (typeof this[propertyKey] !== "undefined" && this[propertyKey] !== null) {
                    this[propertyKey] = this[propertyKey];
                }
            }

            this.Root.host.dataset.loaded = "true";
        });
    }

    /**
     * 当自定义元素从文档DOM中删除时, 被调用
     */
    async disconnectedCallback() {
        await this.WaitLoad();

        // 解绑主题切换触发函数
        themeManager.ChangeEvent.Unbind(this.#bindOnThemeChange);
        // 解绑省电模式改变触发函数
        Basic.OnPowerSavingModeChange.Unbind(this.#bindOnPowerSavingModeChange);

        // 解除 DOM 观察者
        this.#observer.disconnect();

        await this.Unload?.();

        this.#debouncingTable.clear();

        globalThis.requestIdleCallback(() => {
            this.#abortController.abort();
            this.#abortController = null;
        });
    }

    // #region 三个生命周期钩子
    Load() { }
    async Update() {
        await this.WaitLoad();
        this.UpdateAllSubComponent();
    }
    Unload() { }
    // #endregion

    Copy(...params) {
        const setPropertys = (oldEl, newEl) => {
            for (const key in oldEl) {
                if (/[A-Z]/.test(key[0])) {
                    switch (typeof oldEl[key]) {
                        case "function":
                        case "undefined":
                            break;
                        default:
                            try {
                                newEl[key] = oldEl[key] ?? null;
                            } catch { }
                            break;
                    }
                }
            }

            for (const key in oldEl.BindedEvents) {
                newEl[`on${key}`] = oldEl.BindedEvents[key] ?? null;
            }
        };

        Basic.prototype.Copy = MethodOverload().Add(
            [],
            /**
             * 复制组件
             * @this {Basic}
             * @returns {Basic} 复制的组件
             */
            function () {
                const clone = this.cloneNode(true);
                clone.IsCopyed = true;
                setPropertys(this, clone);
                const subEls = this.querySelectorAll("*");
                clone.querySelectorAll("*").forEach((item, i) => {
                    item.IsCopyed = true;
                    const subEl = subEls[i];
                    if (subEl) {
                        setPropertys(subEl, item);
                    }
                });
                return clone;
            }
        );

        return Basic.prototype.Copy.call(this, ...params);
    }

    GetAbsolutePath(...params) {
        Basic.prototype.GetAbsolutePath = MethodOverload()
            .Add(
                [String],
                /**
                 * 获取绝对路径
                 * @this {Basic}
                 * @param {String} path 路径
                 * @returns {String} 返回绝对路径
                 */
                function (path) {
                    return Basic.GetAbsolutePath(this.#url, path);
                }
            )
            .Add(
                [String, String],
                /**
                 * 获取绝对路径
                 * @this {Basic}
                 * @param {String} base 基本路径
                 * @param {String} relative 相对路径
                 * @returns {String} 返回绝对路径
                 */
                function (base, relative) {
                    return Basic.GetAbsolutePath(base, relative);
                }
            );

        return Basic.prototype.GetAbsolutePath.call(this, ...params);
    }

    WaitLoad(...params) {
        Basic.prototype.WaitLoad = MethodOverload().Add(
            [],
            /**
             * 等待组件加载完成
             * @this {Basic}
             * @returns {Promise<void>} 返回执行结果
             */
            function () {
                return new Promise(resolve => {
                    if (this.HasLoaded) {
                        resolve();
                    } else {
                        this.addEventListener(
                            "load",
                            () => {
                                globalThis.requestIdleCallback(() => {
                                    resolve();
                                });
                            },
                            { once: true }
                        );
                    }
                });
            }
        );

        return Basic.prototype.WaitLoad.call(this, ...params);
    }

    DefineProperties(...params) {
        Basic.prototype.DefineProperties = MethodOverload().Add(
            [Object],
            /**
             * 定义属性
             * @this {Basic}
             * @param {Object} properties 属性列表
             */
            function (properties) {
                let observedAttributes = [];
                let ObservedAttributesTypes = {};
                for (const key in properties) {
                    let propertyKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    if (propertyKey[0] === "-") {
                        propertyKey = propertyKey.substring(1);
                    }
                    observedAttributes.push(propertyKey);

                    let type = null;
                    for (let typeList of properties[key].set._types) {
                        if (typeList.length === 1) {
                            type = typeList[0];
                            break;
                        }
                    }
                    if (type) {
                        ObservedAttributesTypes[propertyKey] = type;
                    }
                }

                if (!this.constructor.ObservedAttributesTypes) {
                    Object.defineProperty(this.constructor, "ObservedAttributesTypes", {
                        get() {
                            return ObservedAttributesTypes;
                        }
                    });
                } else {
                    for (const key in ObservedAttributesTypes) {
                        this.constructor.ObservedAttributesTypes[key] = ObservedAttributesTypes[key];
                    }
                }
                Base.DefineProperties(this, properties);
            }
        );

        return Basic.prototype.DefineProperties.call(this, ...params);
    }

    Debouncing(...params) {
        Basic.prototype.Debouncing = MethodOverload()
            .Add(
                [Function],
                /**
                 * 防抖
                 * @this {Basic}
                 * @param {Function} func 触发函数
                 */
                function (func) {
                    this.Debouncing(func, [], 50);
                }
            )
            .Add(
                [Function, Number],
                /**
                 * 防抖
                 * @this {Basic}
                 * @param {Function} func 触发函数
                 * @param {Number} delay 延迟时间
                 */
                function (func, delay) {
                    this.Debouncing(func, [], delay);
                }
            )
            .Add(
                [Function, Array],
                /**
                 * 防抖
                 * @this {Basic}
                 * @param {Function} func 触发函数
                 * @param {Array} params 参数列表
                 */
                function (func, params) {
                    this.Debouncing(func, params, 50);
                }
            )
            .Add(
                [Function, Array, Number],
                /**
                 * 防抖
                 * @this {Basic}
                 * @param {Function} func 触发函数
                 * @param {Array} params 参数列表
                 * @param {Number} delay 延迟时间
                 */
                function (func, params, delay) {
                    if (this.#debouncingTable.has(func)) {
                        clearTimeout(this.#debouncingTable.get(func));
                    }
                    this.#debouncingTable.set(
                        func,
                        setTimeout(() => {
                            if (!this.#debouncingTable) return;
                            this.#debouncingTable.delete(func);
                            func.call(this, ...params);
                        }, delay)
                    );
                }
            )
            .Other(() => { });

        return Basic.prototype.Debouncing.call(this, ...params);
    }

    QueryComponent(...params) {
        Basic.prototype.QueryComponent = MethodOverload()
            .Add(
                [HTMLElement],
                /**
                 * 查询组件元素
                 * @this {Basic}
                 * @param {HTMLElement} ele 元素
                 * @returns {HTMLElement} 元素
                 */
                function (ele) {
                    return new Promise((resolve, reject) => {
                        if (!ele.HasLoaded) {
                            ele.addEventListener(
                                "load",
                                async () => {
                                    resolve(ele);
                                },
                                { once: true }
                            );
                        } else {
                            resolve(ele);
                        }
                    });
                }
            )
            .Add(
                [String],
                /**
                 * 查询组件元素
                 * @this {Basic}
                 * @param {String} selector 选择器
                 * @returns {HTMLElement} 元素
                 * @throws {ReferenceError} 未找到元素
                 */
                async function (selector) {
                    const ele = this.#shadowRoot.querySelector(selector);

                    if (!ele) {
                        return Promise.reject(new Error(`未找到元素: ${selector}`));
                    }

                    return this.QueryComponent(ele);
                }
            );

        return Basic.prototype.QueryComponent.call(this, ...params);
    }

    InstantiateTemplate(...params) {
        Basic.prototype.InstantiateTemplate = MethodOverload().Add(
            [String],
            /**
             * 实例化模板
             * @this {Basic}
             * @param {String} id 模板ID
             * @returns {HTMLElement} 模板实例
             */
            function (id) {
                const templateEle = this.#shadowRoot.getElementById(id);
                const content = templateEle.content;

                if (content.children.length !== 1) {
                    throw new SyntaxError(`模板元素必须且只能有一个根元素，模板ID：${id}`);
                }

                const node = content.children[0];
                const cloneNode = document.importNode(node, true);
                return cloneNode;
            }
        );

        return Basic.prototype.InstantiateTemplate.call(this, ...params);
    }

    Active(...params) {
        Basic.prototype.Active = MethodOverload()
            .Add(
                [],
                /**
                 * 使元素获得焦点
                 * @this {Basic}
                 */
                function () {
                    this.Active(true);
                }
            )
            .Add(
                [Event],
                /**
                 * 使元素获得焦点，但阻止事件冒泡
                 * @this {Basic}
                 * @param {Event} e 事件
                 */
                function (e) {
                    e.stopPropagation();
                    this.Active(true);
                }
            )
            .Add(
                [Boolean],
                /**
                 * 使元素获得焦点
                 * @this {Basic}
                 * @param {Boolean} findParent 是否查找父级
                 */
                async function (findParent) {
                    this.#isActive = true;
                    if (findParent) {
                        let el = this;
                        while (el) {
                            el = el.offsetParent;
                            if (el && el instanceof Basic) {
                                el?.Active?.();
                                break;
                            }
                        }
                    }
                    this.#onActivated.Dispatch(this);
                    MenuFlyout = MenuFlyout ?? (await import("@JyoUI/Components/MenuFlyout/MenuFlyout.js")).default;
                    MenuFlyout?.Hide?.();
                }
            );

        return Basic.prototype.Active.call(this, ...params);
    }

    Blur(...params) {
        Basic.prototype.Blur = MethodOverload()
            .Add(
                [],
                /**
                 * 使元素失去焦点
                 * @this {Basic}
                 */
                function () {
                    this.Blur(true);
                }
            )
            .Add(
                [Boolean],
                /**
                 * 使元素失去焦点
                 * @this {Basic}
                 * @param {Boolean} findParent 是否查找父级
                 */
                function (findParent) {
                    this.#isActive = false;
                    if (findParent) {
                        let el = this;
                        while (el) {
                            el = el.offsetParent;
                            if (el && el instanceof Basic) {
                                el?.Blur?.();
                                break;
                            }
                        }
                    }
                    this.#onDeactivated.Dispatch(this);
                }
            );

        return Basic.prototype.Blur.call(this, ...params);
    }

    Where(...params) {
        Basic.prototype.Where = MethodOverload().Add(
            [Function],
            /**
             * 筛选
             * @this {Basic}
             * @param {Function} predicate 谓词
             * @returns {Array} 返回筛选结果
             */
            function (predicate) {
                let result = Array.from(this.Root.querySelectorAll("*")).filter(predicate);
                this.Root.querySelectorAll("slot").forEach(item => {
                    result = result.concat(item.assignedElements().filter(predicate));
                    item.assignedElements().forEach(node => {
                        if (node instanceof Basic) {
                            result = result.concat(node.Where(predicate));
                        }
                    });
                });
                return result;
            }
        );

        return Basic.prototype.Where.call(this, ...params);
    }

    UpdateAllSubComponent(...params) {
        Basic.prototype.UpdateAllSubComponent = MethodOverload().Add(
            [],
            /**
             * 更新所有子组件
             * @this {Basic}
             */
            function () {
                this.#CheckParent();
                this.#BindAllElementEvents();
                Array.from(this.children).forEach(item => {
                    if (item instanceof Basic) {
                        item.#CheckParent();
                        item.Update?.();
                        item.#BindAllElementEvents();
                    }
                });
            }
        );

        return Basic.prototype.UpdateAllSubComponent.call(this, ...params);
    }

    static {
        globalThis.requestIdleCallback(() => Basic.#InitPowerSavingModeEvent());
    }
}
