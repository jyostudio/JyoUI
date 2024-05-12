import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";
import NavigationController from "@JyoUI/Common/NavigationController.js";

/**
 * 页面组件
 * @extends Basic
 * @class
 */
export default class Page extends Basic {
    // 页面参数
    #params = null;

    // 导航控制器
    #navigationController = null;

    /**
     * 设置页面参数
     * @param {Object} value 页面参数
     */
    set Params(value) {
        this.#params = value;
    }

    /**
     * 获取页面参数
     * @returns {Object} 页面参数
     */
    get Params() {
        return this.#params;
    }

    /**
     * 设置导航控制器
     * @param {NavigationController} value 导航控制器
     */
    set NavigationController(value) {
        this.#navigationController = value;
    }

    /**
     * 获取导航控制器
     * @returns {NavigationController} 导航控制器
     */
    get NavigationController() {
        return this.#navigationController;
    }

    /**
     * 页面组件构造函数
     * @constructor
     * @returns {Page} 页面组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();
    }

    /**
     * 当自定义元素首次被插入文档DOM时, 被调用
     */
    async Load() { }

    /**
     * 当自定义元素从文档DOM中删除时, 被调用
     */
    Unload() { }

    static {
        // 注册组件
        Register(this, import.meta.url, {
            template: `<div class="page"><slot></slot></div>`,
            style: true
        });
    }
}
