import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import themeManager from "@JyoUI/Common/ThemeManager.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";

/**
 * 亚克力材质组件
 * @extends Basic
 * @class
 */
export default class Acrylic extends Basic {
    /**
     * 混色层元素
     * @type {HTMLElement}
     */
    #mixColorEl = null;

    /**
     * 回退元素
     * @type {HTMLElement}
     */
    #fallbackEl = null;

    /**
     * 色调层颜色
     * @type {String}
     */
    #tintColor = "rgba(0, 0, 0, 0)";

    /**
     * 色调层不透明度
     * @type {Number}
     */
    #tintOpacity = 0.15;

    /**
     * 回退颜色
     * @type {String}
     */
    #fallbackColor = "";

    /**
     * 是否只显示回退
     * @type {Boolean}
     */
    #justShowFallback = false;

    /**
     * 是否未激活
     * @type {Boolean}
     */
    #deactivate = true;

    /**
     * 是否自动
     * @type {Boolean}
     */
    #isAuto = true;

    /**
     * 省电模式改变函数
     * @type {Function?}
     */
    #reducedMotionChangeFn = null;

    static #_constructor = function (...params) {
        Acrylic.#_constructor = MethodOverload().Add(
            [],
            /**
             * 窗口组件构造函数
             * @constructor
             * @this {Acrylic}
             * @returns {Window} 窗口组件实例
             */
            function () {
                this.#reducedMotionChangeFn = (() => {
                    if (!this.#isAuto) return;
                    this.JustShowFallback = Basic.PowerSavingMode;
                    this.#isAuto = true;
                }).bind(this);
            }
        );

        return Acrylic.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            TintColor: {
                /**
                 * 获取色调层颜色
                 * @this {Acrylic}
                 * @returns {String} 色调层颜色
                 */
                get() {
                    return this.#tintColor;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置色调层颜色
                     * @this {Acrylic}
                     * @param {String} value 色调层颜色
                     */
                    function (value) {
                        this.#tintColor = value;
                        this.#mixColorEl.style.backgroundColor = themeManager.CovertToP3(this.#tintColor);
                    }
                )
            },
            TintOpacity: {
                /**
                 * 获取色调层不透明度
                 * @this {Acrylic}
                 * @returns {Number} 色调层不透明度
                 */
                get() {
                    return this.#tintOpacity;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置色调层不透明度
                     * @this {Acrylic}
                     * @param {Number} value 色调层不透明度
                     */
                    function (value) {
                        this.#tintOpacity = parseFloat(value);
                        this.#mixColorEl.style.opacity = this.#tintOpacity;
                    }
                )
            },
            FallbackColor: {
                /**
                 * 获取回退颜色
                 * @this {Acrylic}
                 * @returns {String} 回退颜色
                 */
                get() {
                    return this.#fallbackColor;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置回退颜色
                     * @this {Acrylic}
                     * @param {String} value 回退颜色
                     */
                    function (value) {
                        this.#fallbackColor = value;
                        this.#fallbackEl.style.backgroundColor = themeManager.CovertToP3(this.#fallbackColor);
                    }
                )
            },
            JustShowFallback: {
                /**
                 * 获取是否只显示回退
                 * @this {Acrylic}
                 * @returns {Boolean} 是否只显示回退
                 */
                get() {
                    return this.#justShowFallback;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否只显示回退
                     * @this {Acrylic}
                     * @param {Boolean} value 是否只显示回退
                     */
                    function (value) {
                        this.#justShowFallback = value;
                        const hasJustShowFallback = Basic.PowerSavingMode || !themeManager.EnableAlpha || this.#justShowFallback;
                        this.Root.querySelectorAll("*").forEach(el => {
                            if (el.classList.contains("fallback")) {
                                el.style.display = hasJustShowFallback ? "block" : "none";
                            } else {
                                el.style.display = hasJustShowFallback ? "none" : "block";
                            }
                        });
                        this.#isAuto = false;
                    }
                )
            },
            Deactivate: {
                /**
                 * 获取是否未激活
                 * @this {Acrylic}
                 * @returns {Boolean} 是否未激活
                 */
                get() {
                    return this.#deactivate;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否未激活
                     * @this {Acrylic}
                     * @param {Boolean} value 是否未激活
                     */
                    function (value) {
                        this.#deactivate = value;
                    }
                )
            }
        });

        return Acrylic.#_constructor.call(this, ...params);
    }

    /**
     * 组件被加载时调用
     */
    Load() {
        this.#mixColorEl = this.Root.querySelector(".mixColor");
        this.#fallbackEl = this.Root.querySelector(".fallback");

        Basic.OnPowerSavingModeChange.Bind(this.#reducedMotionChangeFn);
        this.#reducedMotionChangeFn();
    }

    /**
     * 组件被卸载时调用
     */
    Unload() {
        Basic.OnPowerSavingModeChange.Unbind(this.#reducedMotionChangeFn);
    }

    static {
        // 注册组件
        Register(this, import.meta.url);
    }
}
