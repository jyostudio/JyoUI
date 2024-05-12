import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic from "@JyoUI/Components/Basic/Basic.js";
import ClickMode from "./ClickMode.js";

/**
 * 按钮基类组件
 * @extends Basic
 * @class
 */
export default class ButtonBase extends Basic {
    /**
     * 单击事件发生的时间
     * @type {ClickMode}
     */
    #clickMode = ClickMode.Release;

    /**
     * 按下按钮时调用的命令
     * @type {String}
     */
    #command = null;

    /**
     * 设备指针是否位于此按钮控件上
     * @type {Boolean}
     */
    #isPointerOver = false;

    /**
     * ButtonBase 当前是否处于按下状态
     */
    #isPressed = false;

    /**
     * 获取设备指针是否位于此按钮控件上
     * @returns {Boolean} 设备指针是否位于此按钮控件上
     */
    get IsPointerOver() {
        return this.#isPointerOver;
    }

    /**
     * 获取 ButtonBase 当前是否处于按下状态
     * @returns {Boolean} ButtonBase 当前是否处于按下状态
     */
    get IsPressed() {
        return this.#isPressed;
    }

    /**
     * 按钮基类组件构造函数
     * @constructor
     * @returns {ButtonBase} 按钮基类组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        if (new.target === ButtonBase) {
            throw new TypeError(`无法创建 ButtonBase 的实例，因为它是一个抽象类。`);
        }

        const host = this.Root.host;

        this.DefineProperties({
            ClickMode: {
                /**
                 * 获取单击事件发生的时间
                 * @this {ButtonBase}
                 * @returns {ClickMode} 单击事件发生的时间
                 */
                get() {
                    return this.#clickMode;
                },
                set: MethodOverload().Add([[String, ClickMode]],
                    /**
                     * 设置单击事件发生的时间
                     * @this {ButtonBase}
                     * @param {ClickMode} value 单击事件发生的时间
                     */
                    function (value) {
                        if (typeof value === "string") {
                            value = ClickMode.GetEnumByValue(value);
                        }

                        this.#clickMode = value;
                        this.Command = this.#command;
                    })
            },
            Command: {
                /**
                 * 获取按下按钮时调用的命令
                 * @this {ButtonBase}
                 * @returns {String} 按下按钮时调用的命令
                 */
                get() {
                    return this.#command;
                },
                set: MethodOverload().Add([[String, null]],
                    /**
                     * 设置按下按钮时调用的命令
                     * @this {ButtonBase}
                     * @param {String} value 按下按钮时调用的命令
                     */
                    async function (value) {
                        this.#command = value;
                        host.removeAttribute("data-on-pointerdown");
                        host.removeAttribute("data-on-pointerup");
                        host.removeAttribute("data-on-pointerenter");
                        if (value) {
                            switch (this.#clickMode) {
                                case ClickMode.Hover:
                                    host.setAttribute("data-on-pointerenter", value);
                                    break;
                                case ClickMode.Press:
                                    host.setAttribute("data-on-pointerdown", value);
                                    break;
                                case ClickMode.Release:
                                    host.setAttribute("data-on-pointerup", value);
                                    break;
                            }
                        }
                        await this.WaitLoad();
                        this.BindAllEventsByElement(host);
                    })
            }
        });

        host.addEventListener("pointerdown", () => { this.#isPressed = true; });
        host.addEventListener("pointerup", () => { this.#isPressed = false; });

        host.addEventListener("pointerenter", () => { this.#isPointerOver = true; });
        host.addEventListener("pointerleave", () => { this.#isPointerOver = false; });
    }
}

export { ClickMode };
