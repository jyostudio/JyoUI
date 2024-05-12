import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import { Register } from "@JyoUI/Components/Basic/Basic.js";
import ButtonBase from "@JyoUI/Components/ButtonBase/ButtonBase.js";

/**
 * 超链接按钮组件
 * @extends ButtonBase
 * @class
 */
export default class HyperlinkButton extends ButtonBase {
    /**
     * 内容元素
     * @type {HTMLElement}
     */
    #contentEl = null;

    /**
     * 导航地址
     * @type {String}
     */
    #navigateUri = null;

    /**
     * 超链接按钮组件构造函数
     * @constructor
     * @returns {HyperlinkButton} 超链接按钮组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            Content: {
                /**
                 * 获取内容
                 * @this {HyperlinkButton}
                 * @returns {String} 内容 
                 */
                get() {
                    return this.#contentEl.textContent;
                },
                set: MethodOverload().Add([String],
                    /**
                     * 设置内容
                     * @this {HyperlinkButton}
                     * @param {String} value 内容
                     */
                    function (value) {
                        this.#contentEl.textContent = value;
                        this.Root.host.setAttribute("content", value);
                    })
            },
            NavigateUri: {
                /**
                 * 获取导航地址
                 * @this {HyperlinkButton}
                 * @returns {String} 导航地址
                 */
                get() {
                    return this.#navigateUri;
                },
                set: MethodOverload().Add([String],
                    /**
                     * 设置导航地址
                     * @this {HyperlinkButton}
                     * @param {String} value 导航地址
                     */
                    function (value) {
                        this.#navigateUri = value;
                        this.Root.host.setAttribute("navigate-uri", value);
                    })
            }
        });
    }

    /**
     * 组件加载时触发
     */
    async Load() {
        this.#contentEl = this.Root.querySelector(".content");
        this.Root.host.addEventListener("click", function () {
            if (this.#navigateUri) {
                window.open(this.#navigateUri, "_blank");
            }
        });
    }

    /**
     * 组件更新时触发
     */
    async Update() {
        await this.WaitLoad();
    }

    /**
     * 组件卸载时触发
     */
    Unload() { }

    static {
        // 注册组件
        Register(this, import.meta.url, {
            template: `<div class="content"></div>`,
            style: true
        });
    }
}
