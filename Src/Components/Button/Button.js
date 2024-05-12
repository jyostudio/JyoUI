import { Register } from "@JyoUI/Components/Basic/Basic.js";
import ButtonBase from "@JyoUI/Components/ButtonBase/ButtonBase.js";

/**
 * Button组件
 * @extends ButtonBase
 * @class
 */
export default class Button extends ButtonBase {
    /**
     * Button组件构造函数
     * @constructor
     * @returns {Button} Button组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();
    }

    /**
     * 组件加载时触发
     */
    async Load() { }

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
            template: "<slot></slot>",
            style: true
        });
    }
}
