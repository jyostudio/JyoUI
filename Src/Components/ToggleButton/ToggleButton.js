import EventHandle from "@JyoUI/Common/EventHandle.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import { Register } from "@JyoUI/Components/Basic/Basic.js";
import ButtonBase from "@JyoUI/Components/ButtonBase/ButtonBase.js";

/**
 * 切换按钮组件
 * @extends ButtonBase
 * @class
 */
export default class ToggleButton extends ButtonBase {
    /**
     * 文本元素
     * @type {HTMLElement}
     */
    #contentEl = null;

    /**
     * 指示该控件是否支持三种状态
     * @type {Boolean}
     */
    #isThreeState = false;

    /**
     * 指示该控件是否选中
     * @type {Boolean?}
     */
    #isChecked = false;

    /**
     * 选中时触发
     * @type {EventHandle}
     */
    #onChecked = new EventHandle(this.AbortController);

    /**
     * 当切换到不确定状态时触发
     * @type {EventHandle}
     */
    #onIndeterminate = new EventHandle(this.AbortController);

    /**
     * 在未选中时触发
     * @type {EventHandle}
     */
    #onUnchecked = new EventHandle(this.AbortController);

    /**
     * 获取选中时触发的事件
     * @returns {EventHandle} 返回选中时触发的事件
     */
    get OnChecked() {
        return this.#onChecked;
    }

    /**
     * 获取切换到不确定状态时触发的事件
     * @returns {EventHandle} 返回切换到不确定状态时触发的事件
     */
    get OnIndeterminate() {
        return this.#onIndeterminate;
    }

    /**
     * 获取未选中时触发的事件
     * @returns {EventHandle} 返回未选中时触发的事件
     */
    get OnUnchecked() {
        return this.#onUnchecked;
    }

    /**
     * 切换按钮组件构造函数
     * @constructor
     * @returns {ToggleButton} 切换按钮组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            IsThreeState: {
                /**
                 * 获取一个值，指示该控件是否支持三种状态
                 * @this {ToggleButton}
                 * @returns {Boolean} 返回一个值，指示该控件是否支持三种状态
                 */
                get() {
                    return this.#isThreeState;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置一个值，指示该控件是否支持三种状态
                     * @this {ToggleButton}
                     * @param {Boolean} value 一个值，指示该控件是否支持三种状态
                     */
                    function (value) {
                        this.#isThreeState = value;
                        if (!value) {
                            this.IsChecked = !!this.IsChecked;
                        }
                        this.Root.host.setAttribute("is-three-state", this.IsThreeState.toString());
                    }
                )
            },
            IsChecked: {
                /**
                 * 获取一个值，指示该控件是否选中
                 * @this {ToggleButton}
                 * @returns {Boolean?} 返回一个值，指示该控件是否选中
                 */
                get() {
                    return this.#isChecked;
                },
                set: MethodOverload().Add(
                    [[Boolean, null]],
                    /**
                     * 设置一个值，指示该控件是否选中
                     * @this {ToggleButton}
                     * @param {Boolean?} value 一个值，指示该控件是否选中
                     */
                    function (value) {
                        this.#isChecked = value;

                        if (this.#isChecked === null) {
                            this.#onIndeterminate.Dispatch(this, this.IsChecked);
                            this["onindeterminate"]?.(this, this.IsChecked);
                        } else if (this.#isChecked) {
                            this.#onChecked.Dispatch(this, this.IsChecked);
                            this["onchecked"]?.(this, this.IsChecked);
                        } else {
                            this.#onUnchecked.Dispatch(this, this.IsChecked);
                            this["onunchecked"]?.(this, this.IsChecked);
                        }

                        this.Root.host.setAttribute("is-checked", this.IsChecked === null ? "null" : this.IsChecked.toString());
                    }
                )
            },
            Content: {
                /**
                 * 获取一个值，指示该控件的文本内容
                 * @this {ToggleButton}
                 * @returns {String} 返回一个值，指示该控件的文本内容
                 */
                get() {
                    return this.#contentEl?.textContent || "";
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置一个值，指示该控件的文本内容
                     * @this {ToggleButton}
                     * @param {String} value 一个值，指示该控件的文本内容
                     */
                    function (value) {
                        this.#contentEl.textContent = value;
                    }
                )
            }
        });
    }

    /**
     * 组件加载时触发
     */
    async Load() {
        this.#contentEl = this.Root.querySelector(".content");
        this.Root.host.addEventListener("click", this.#Click.bind(this));
    }

    /**
     * 组件卸载时触发
     */
    async Unload() {
        this.Root.host.removeEventListener("click", this.#Click.bind(this));
    }

    #Click(...params) {
        ToggleButton.prototype.Click = MethodOverload().Add(
            [Event],
            /**
             * 单击切换按钮
             * @this {ToggleButton}
             * @param {Event} e 事件参数
             */
            function (e) {
                if (this.#isThreeState) {
                    if (this.IsChecked === null) {
                        this.IsChecked = false;
                    } else {
                        if (this.IsChecked === false) {
                            this.IsChecked = true;
                        } else {
                            this.IsChecked = null;
                        }
                    }
                } else {
                    this.IsChecked = !this.IsChecked;
                }
            }
        );

        return ToggleButton.prototype.Click.call(this, ...params);
    }

    static {
        // 注册组件
        Register(this, import.meta.url, {
            template: `<div class="content"></div>`,
            style: true
        });
    }
}
