import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";

/**
 * 事件处理器
 * @extends Base
 * @class
 */
export default class EventHandle extends Base {
    // 事件列表
    #list = [];

    static #_constructor = function (...params) {
        EventHandle.#_constructor = MethodOverload()
            .Add([], function () { })
            .Add([AbortController],
                /**
                 * 构造函数
                 * @this {EventHandle}
                 * @param {AbortController} abortController 中止控制器
                 */
                function (abortController) {
                    abortController.signal.addEventListener("abort", () => {
                        this.Clear();
                    }, { once: true });
                });

        return EventHandle.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        super();

        return EventHandle.#_constructor.call(this, ...params);
    }

    Bind(...params) {
        EventHandle.prototype.Bind = MethodOverload()
            .Add(
                [Function, Object],
                /**
                 * 绑定事件
                 * @this {EventHandle}
                 * @param {Function} fn 绑定事件的函数
                 * @param {Object} options 绑定事件的选项
                 */
                function (fn, options) {
                    for (const option in options) {
                        fn[option] = options[option];
                    }
                    this.#list.push(fn);
                }
            )
            .Add(
                [Function],
                /**
                 * 绑定事件
                 * @this {EventHandle}
                 * @param {Function} fn 绑定事件的函数
                 */
                function (fn) {
                    return this.Bind(fn, {});
                }
            );

        return EventHandle.prototype.Bind.call(this, ...params);
    }

    Unbind(...params) {
        EventHandle.prototype.Unbind = MethodOverload().Add(
            [Function],
            /**
             * 解绑事件
             * @this {EventHandle}
             * @param {Function} fn 解绑事件的函数
             */
            function (fn) {
                let index = this.#list.indexOf(fn);
                if (index > -1) {
                    this.#list.splice(index, 1);
                }
            }
        );

        return EventHandle.prototype.Unbind.call(this, ...params);
    }

    Clear(...params) {
        EventHandle.prototype.Clear = MethodOverload().Add(
            [],
            /**
             * 清空事件
             * @this {EventHandle}
             */
            function () {
                this.#list = [];
            }
        );

        return EventHandle.prototype.Clear.call(this, ...params);
    }

    /**
     * 分发事件
     * @param  {...any} params 参数
     */
    async Dispatch(...params) {
        let result = [];
        for (let i = this.#list.length; i--;) {
            result.push(await this.#list[i]?.call(this, ...params));
            if (this.#list[i]?.once) {
                this.#list.splice(i, 1);
            }
        }
        return result;
    }

    Dispose(...params) {
        const superDispose = super.Dispose;
        EventHandle.prototype.Dispose = MethodOverload().Add(
            [],
            /**
             * 释放资源
             * @this {EventHandle}
             */
            function () {
                this.#list.length = 0;
                this.#list = null;
                superDispose.call(this);
            }
        );

        return EventHandle.prototype.Dispose.call(this, ...params);
    }

    [Symbol.dispose]() {
        this.Dispose();
    }

    [Symbol.asyncDispose]() {
        return this.Dispose();
    }
}
