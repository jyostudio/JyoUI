import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import { Register } from "@JyoUI/Components/Basic/Basic.js";
import ToggleButton from "@JyoUI/Components/ToggleButton/ToggleButton.js";

/**
 * 复选框组件
 * @extends ToggleButton
 * @class
 */
export default class CheckBox extends ToggleButton {
    /**
     * 选择框元素
     * @type {HTMLElement?}
     */
    #checkboxEl = null;

    /**
     * 文本元素
     * @type {HTMLSpanElement?}
     */
    #textEl = null;

    /**
     * 复选框组件构造函数
     * @constructor
     * @returns {CheckBox} 复选框组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            Content: {
                /**
                 * 获取一个值，指示该控件的文本内容
                 * @this {CheckBox}
                 * @returns {String} 返回一个值，指示该控件的文本内容
                 */
                get() {
                    return this.#textEl.textContent;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置一个值，指示该控件的文本内容
                     * @this {CheckBox}
                     * @param {String} value 一个值，指示该控件的文本内容
                     */
                    function (value) {
                        this.#textEl.textContent = value;
                        this.Root.host.setAttribute("content", value);
                    }
                )
            }
        });
    }

    /**
     * 组件加载时触发
     */
    async Load() {
        await super.Load();
        this.#checkboxEl = this.Root.querySelector(".checkbox");
        this.#textEl = this.Root.querySelector(".text");

        this.OnChecked.Bind(this.#CheckStatus.bind(this));
        this.OnUnchecked.Bind(this.#CheckStatus.bind(this));
        this.OnIndeterminate.Bind(this.#CheckStatus.bind(this));
    }

    /**
     * 检查状态
     */
    #CheckStatus() {
        this.#checkboxEl.classList[this.IsChecked !== false ? "add" : "remove"]("selected");
        this.#checkboxEl.classList[this.IsChecked === null ? "add" : "remove"]("three");
    }

    static {
        // 注册组件
        Register(this, import.meta.url);
    }
}
