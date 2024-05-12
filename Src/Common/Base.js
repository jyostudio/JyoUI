import "@JyoUI/Common/Polyfill.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";

/**
 * 支持类层次结构中的所有类，并为派生类提供低级别服务。
 * 这是所有类的最终基类；它是类型层次结构的根。
 * @class
 */
export default class Base {
    #isDisposed = false;

    /**
     * 对象是否已被释放
     * @type {Boolean}
     */
    get IsDisposed() {
        return this.#isDisposed;
    }

    /**
     * 获取当前类的全名
     * @type {String}
     */
    static get FullName() {
        return this.name;
    }

    /**
     * 获取当前类的名称
     * @type {String}
     */
    get [Symbol.toStringTag]() {
        if (this.IsDisposed) {
            throw new ReferenceError("ObjectDisposed_Generic");
        }

        return this.constructor.name;
    }

    Equals(...params) {
        Base.prototype.Equals = MethodOverload().Add(
            [Object],
            /**
             * 确定指定的对象是否等于当前对象。
             * @this {Base}
             * @param {Object} obj - 要与当前对象进行比较的对象。
             * @returns {Boolean} - 如果指定的对象等于当前对象，则为 true，否则为 false。
             */
            function (obj) {
                if (this.IsDisposed) {
                    throw new ReferenceError("ObjectDisposed_Generic");
                }

                return this === obj;
            }
        );

        return Base.prototype.Equals.call(this, ...params);
    }

    static DefineProperties(...params) {
        Base.DefineProperties = MethodOverload().Add(
            ["*", Object],
            /**
             * 在一个对象上定义新的属性或修改现有属性，并返回该对象。
             * @static
             * @param {Object} obj 在其上定义或修改属性的对象。
             * @param props 要定义其可枚举属性或修改的属性描述符的对象。
             * @returns {Object} 传递给函数的对象。
             */
            function (obj, props) {
                for (let k in props) {
                    let o = props[k];
                    o.configurable = o.configurable ?? true;
                    o.enumerable = o.enumerable ?? true;
                }
                return Object.defineProperties(obj, props);
            }
        );

        return Base.DefineProperties.call(this, ...params);
    }

    static Equals(...params) {
        Base.Equals = MethodOverload().Add(
            [Object, Object],
            /**
             * 确定指定的对象实例是否被视为相等。
             * @static
             * @param {Object} objA - 要比较的第一个对象。
             * @param {Object} objB - 要比较的第二个对象。
             * @returns {Boolean} - 如果对象被视为相等，则为 true，否则为 false。 如果 objA 和 objB 均为 null，此方法将返回 true。
             */
            function (objA, objB) {
                return objA.Equals(objB);
            }
        );

        return Base.Equals.call(this, ...params);
    }

    static ReferenceEquals() {
        Base.ReferenceEquals = MethodOverload().Add(
            [Object, Object],
            /**
             * 确定指定的 Core.Base 实例是否是相同的实例。
             * @static
             * @param {Object} objA - 要比较的第一个对象。
             * @param {Object} objB - 要比较的第二个对象。
             * @returns {Boolean} - true如果objA是相同的实例作为objB或如果两者均null; 否则为false。
             */
            function (objA, objB) {
                return "object" === typeof objA && "object" === typeof objB && objA === objB;
            }
        );

        return Base.ReferenceEquals.call(this, ...params);
    }

    /**
     * 释放对象
     * @returns {Boolean} - 如果成功释放对象，则为 true；否则为 false。
     */
    [Symbol.dispose]() {
        return this.Dispose();
    }

    /**
     * 释放对象
     * @returns {Boolean} - 如果成功释放对象，则为 true；否则为 false。
     */
    [Symbol.asyncDispose]() {
        return this.Dispose();
    }

    Dispose(...params) {
        Base.prototype.Dispose = MethodOverload().Add(
            [],
            /**
             * 销毁对象
             * @this {Base}
             */
            function () {
                this.#isDisposed = true;

                return true;
            }
        );

        return Base.prototype.Dispose.call(this, ...params);
    }

    ToString(...params) {
        Base.prototype.ToString = MethodOverload().Add(
            [],
            /**
             * 返回表示当前对象的字符串。
             * @this {Base}
             * @returns {String} - 表示当前对象的字符串。
             */
            function () {
                return this.constructor.name;
            }
        );

        return Base.prototype.ToString.call(this, ...params);
    }

    GetType(...params) {
        Base.prototype.GetType = MethodOverload().Add(
            [],
            /**
             * 获取当前实例的类型。
             * @this {Base}
             * @returns {Function} - 当前实例的类型。
             */
            function () {
                return this.constructor;
            }
        );

        return Base.prototype.GetType.call(this, ...params);
    }
}
