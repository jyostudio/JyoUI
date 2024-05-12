import EventHandle from "@JyoUI/Common/EventHandle.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";

/**
 * 标题栏组件
 * @extends Basic
 * @class
 */
export default class TitleBar extends Basic {
    /**
     * 图标
     * @type {String}
     */
    #icon = "";

    /**
     * 标题
     * @type {String}
     */
    #title = "";

    /**
     * 是否最大化
     * @type {Boolean}
     */
    #maximize = false;

    /**
     * 是否未激活
     * @type {Boolean}
     */
    #deactivate = true;

    /**
     * 是否启用最小化
     * @type {Boolean}
     */
    #enableMinimize = true;

    /**
     * 是否启用最大化
     * @type {Boolean}
     */
    #enableMaximize = true;

    /**
     * 是否启用关闭
     * @type {Boolean}
     */
    #enableClose = true;

    /**
     * 图标元素
     * @type {HTMLElement}
     */
    #iconEl = null;

    /**
     * 标题元素
     * @type {HTMLElement}
     */
    #titleEl = null;

    /**
     * 标题栏元素
     * @type {HTMLElement}
     */
    #titleBarEl = null;

    /**
     * 最小化按钮元素
     * @type {HTMLElement}
     */
    #btnMinEl = null;

    /**
     * 恢复按钮元素
     * @type {HTMLElement}
     */
    #btnRestoreEl = null;

    /**
     * 最大化按钮元素
     * @type {HTMLElement}
     */
    #btnMaxEl = null;

    /**
     * 关闭按钮元素
     * @type {HTMLElement}
     */
    #btnCloseEl = null;

    /**
     * 功能事件
     * @type {EventHandle}
     */
    #onFunction = new EventHandle(this.AbortController);

    /**
     * 获取功能事件
     * @returns {EventHandle} 功能事件
     */
    get OnFunction() {
        return this.#onFunction;
    }

    /**
     * 获取功能区宽度
     * @returns {Number} 功能区宽度
     */
    get FunctionAreaWidth() {
        return this.#titleBarEl?.querySelector?.(".functionFrame")?.offsetWidth || 0;
    }

    /**
     * 标题栏组件构造函数
     * @constructor
     * @returns {TitleBar} 标题栏组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            Icon: {
                /**
                 * 获取图标
                 * @this {TitleBar}
                 * @returns {String} 图标
                 */
                get() {
                    return this.#icon;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置图标
                     * @this {TitleBar}
                     * @param {String} value 图标
                     */
                    function (value) {
                        this.#icon = value;
                        if (value) {
                            this.#iconEl.src = value;
                            this.#iconEl.style.display = "inline-block";
                        } else {
                            this.#iconEl.style.display = "none";
                        }
                    }
                )
            },
            Title: {
                /**
                 * 获取标题
                 * @this {TitleBar}
                 * @returns {String} 标题
                 */
                get() {
                    return this.#title;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置标题
                     * @this {TitleBar}
                     * @param {String} value 标题
                     */
                    function (value) {
                        this.#title = value;
                        if (value) {
                            this.#titleEl.innerText = value;
                            this.#titleEl.style.display = "inline-block";
                        } else {
                            this.#titleEl.style.display = "none";
                        }
                    }
                )
            },
            IsMaximize: {
                /**
                 * 获取是否最大化
                 * @this {TitleBar}
                 * @returns {Boolean} 是否最大化
                 */
                get() {
                    return this.#maximize;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否最大化
                     * @this {TitleBar}
                     * @param {Boolean} value 是否最大化
                     */
                    function (value) {
                        this.#maximize = value;
                        this.Debouncing(this.Update);
                    }
                )
            },
            EnableMinimize: {
                /**
                 * 获取是否启用最小化
                 * @this {TitleBar}
                 * @returns {Boolean} 是否启用最小化
                 */
                get() {
                    return this.#enableMinimize;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否启用最小化
                     * @this {TitleBar}
                     * @param {Boolean} value 是否启用最小化
                     */
                    function (value) {
                        this.#enableMinimize = value;
                        this.#btnMinEl.style.display = value ? "inline-block" : "none";
                    }
                )
            },
            EnableMaximize: {
                /**
                 * 获取是否启用最大化
                 * @this {TitleBar}
                 * @returns {Boolean} 是否启用最大化
                 */
                get() {
                    return this.#enableMaximize;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否启用最大化
                     * @this {TitleBar}
                     * @param {Boolean} value 是否启用最大化
                     */
                    function (value) {
                        this.#enableMaximize = value;
                        this.Debouncing(this.Update);
                    }
                )
            },
            EnableClose: {
                /**
                 * 获取是否启用关闭
                 * @this {TitleBar}
                 * @returns {Boolean} 是否启用关闭
                 */
                get() {
                    return this.#enableClose;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否启用关闭
                     * @this {TitleBar}
                     * @param {Boolean} value 是否启用关闭
                     */
                    function (value) {
                        this.#enableClose = value;
                        this.#btnCloseEl.style.display = value ? "inline-block" : "none";
                    }
                )
            },
            Deactivate: {
                /**
                 * 获取是否未激活
                 * @this {TitleBar}
                 * @returns {Boolean} 是否未激活
                 */
                get() {
                    return this.#deactivate;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否未激活
                     * @this {TitleBar}
                     * @param {Boolean} value 是否未激活
                     */
                    function (value) {
                        this.#deactivate = value;
                        if (value) {
                            this.#titleBarEl.classList.add("deactivate");
                            this.Root.querySelectorAll("i").forEach(el => {
                                el.classList.add("active");
                                el.style.filter = "none";
                                el.style.opacity = "0.8";
                            });
                        } else {
                            this.#titleBarEl.classList.remove("deactivate");
                            this.Root.querySelectorAll("i").forEach(el => {
                                el.classList.remove("active");
                                el.style.filter = "invert(1)";
                                el.style.opacity = "1";
                            });
                        }
                    }
                )
            }
        });
    }

    /**
     * 组件加载时调用
     */
    Load() {
        this.#iconEl = this.Root.querySelector(".icon");
        this.#titleEl = this.Root.querySelector(".title");
        this.#titleBarEl = this.Root.querySelector(".titleBar");

        this.#btnMinEl = this.Root.querySelector(".btnMin");
        this.#btnRestoreEl = this.Root.querySelector(".btnRestore");
        this.#btnMaxEl = this.Root.querySelector(".btnMax");
        this.#btnCloseEl = this.Root.querySelector(".btnClose");
    }

    /**
     * 更新组件
     */
    async Update() {
        await this.WaitLoad();

        if (this.#enableMaximize) {
            if (this.#maximize) {
                this.#btnMaxEl.style.display = "none";
                this.#btnRestoreEl.style.display = "inline-block";
            } else {
                this.#btnMaxEl.style.display = "inline-block";
                this.#btnRestoreEl.style.display = "none";
            }
        } else {
            this.#btnMaxEl.style.display = "none";
            this.#btnRestoreEl.style.display = "none";
        }
    }

    ClickMin(...params) {
        TitleBar.prototype.ClickMin = MethodOverload().Add(
            [Event],
            /**
             * 点击最小化按钮
             * @this {TitleBar}
             * @param {Event} e 事件
             */
            function (e) {
                this.#onFunction.Dispatch("Minimize", e);
            }
        );

        return TitleBar.prototype.ClickMin.call(this, ...params);
    }

    ClickMaximizeOrRestore(...params) {
        TitleBar.prototype.ClickMaximizeOrRestore = MethodOverload().Add(
            [Event],
            /**
             * 点击最大化或者还原按钮
             * @this {TitleBar}
             * @param {Event} e 事件
             */
            function (e) {
                if (!this.#enableMaximize) return;
                if (this.#maximize) {
                    this.#onFunction.Dispatch("Restore", e);
                } else {
                    this.#onFunction.Dispatch("Maximize", e);
                }
            }
        );

        return TitleBar.prototype.ClickMaximizeOrRestore.call(this, ...params);
    }

    ClickClose(...params) {
        TitleBar.prototype.ClickClose = MethodOverload().Add(
            [Event],
            /**
             * 点击关闭按钮
             * @this {TitleBar}
             * @param {Event} e 事件
             */
            function (e) {
                this.#onFunction.Dispatch("Close", e);
            }
        );

        return TitleBar.prototype.ClickClose.call(this, ...params);
    }

    JustActiveParent(...params) {
        TitleBar.prototype.JustActiveParent = MethodOverload().Add(
            [Event],
            /**
             * 仅激活父级
             * @this {TitleBar}
             * @param {Event} e 事件
             */
            function (e) {
                this.Parent?.Active();
                this.Active(e);
            }
        );

        return TitleBar.prototype.JustActiveParent.call(this, ...params);
    }

    static {
        // 注册组件
        Register(this, import.meta.url);
    }
}
