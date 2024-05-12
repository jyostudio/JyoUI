import EventHandle from "@JyoUI/Common/EventHandle.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";

/**
 * 切换开关组件
 * @extends Basic
 * @class
 */
export default class ToggleSwitch extends Basic {
    /**
     * 头部文案元素
     * @type {HTMLElement}
     */
    #headerEl = null;

    /**
     * 切换开关元素
     * @type {HTMLElement}
     */
    #switchEl = null;

    /**
     * 文本元素
     * @type {HTMLElement}
     */
    #textEl = null;

    /**
     * 头部文案
     * @type {String}
     */
    #header = "";

    /**
     * 关闭状态内容
     * @type {String}
     */
    #offContent = "";

    /**
     * 开启状态内容
     * @type {String}
     */
    #onContent = "";

    /**
     * 是否开启
     * @type {Boolean}
     */
    #isOn = false;

    /**
     * 当切换开关时触发
     * @type {EventHandle}
     */
    #onToggled = new EventHandle(this.AbortController);

    /**
     * 获取当切换开关时触发
     * @returns {EventHandle} 当切换开关时触发
     */
    get OnToggled() {
        return this.#onToggled;
    }

    /**
     * 切换开关组件构造函数
     * @constructor
     * @returns {ToggleSwitch } 切换开关组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            Header: {
                /**
                 * 获取头部文案
                 * @this {ToggleSwitch}
                 * @returns {String} 头部文案
                 */
                get() {
                    return this.#header;
                },
                set: MethodOverload()
                    .Add([String],
                        /**
                         * 设置头部文案
                         * @this {ToggleSwitch}
                         * @param {String} value 头部文案
                         */
                        function (value) {
                            this.#header = value;
                            this.#headerEl.textContent = value;
                        })
            },
            OffContent: {
                /**
                 * 获取关闭状态内容
                 * @this {ToggleSwitch}
                 * @returns {String} 关闭状态内容
                 */
                get() {
                    return this.#offContent;
                },
                set: MethodOverload()
                    .Add([String],
                        /**
                         * 设置关闭状态内容
                         * @this {ToggleSwitch}
                         * @param {String} value 关闭状态内容
                         */
                        function (value) {
                            this.#offContent = value;
                            this.IsOn = this.IsOn;
                        })
            },
            OnContent: {
                /**
                 * 获取开启状态内容
                 * @this {ToggleSwitch}
                 * @returns {String} 开启状态内容
                 */
                get() {
                    return this.#onContent;
                },
                set: MethodOverload()
                    .Add([String],
                        /**
                         * 设置开启状态内容
                         * @this {ToggleSwitch}
                         * @param {String} value 开启状态内容
                         */
                        function (value) {
                            this.#onContent = value;
                            this.IsOn = this.IsOn;
                        })
            },
            IsOn: {
                /**
                 * 获取是否开启
                 * @this {ToggleSwitch}
                 * @returns {Boolean} 是否开启
                 */
                get() {
                    return this.#isOn;
                },
                set: MethodOverload()
                    .Add([Boolean],
                        /**
                         * 设置是否开启
                         * @this {ToggleSwitch}
                         * @param {Boolean} value 是否开启
                         */
                        function (value) {
                            this.#textEl.textContent = value ? this.#onContent : this.#offContent;
                            if (this.#isOn === value) return;
                            this.#isOn = value;
                            this.#switchEl[value ? "setAttribute" : "removeAttribute"]("checked", "");
                            this.#onToggled.Dispatch();
                        })
            }
        });
    }

    /**
     * 组件加载时触发
     */
    async Load() {
        this.#headerEl = this.Root.querySelector(".header");
        this.#switchEl = this.Root.querySelector(".switch");
        this.#textEl = this.Root.querySelector(".text");
        this.#switchEl.addEventListener("change", () => {
            this.IsOn = this.#switchEl.checked;
        }, { signal: this.AbortController.signal });
    }

    static {
        // 注册组件
        Register(this, import.meta.url);
    }
}
