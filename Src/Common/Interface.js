import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";

const table = new Map();

/**
 * 接口基类
 * @extends Base
 * @interface
 */
export default class Interface extends Base {
    constructor() {
        super();

        if (new.target === this.constructor) {
            throw new TypeError(`无法创建 ${this.constructor.name} 的实例，因为它是一个接口。`);
        }
    }

    static [Symbol.hasInstance](target) {
        if (table.has(this)) {
            return table.get(this).includes(target.constructor);
        }

        return false;
    }
}

export function RegisterSubType(...params) {
    Interface.RegisterSubType = MethodOverload().Add(
        [Function, Function],
        /**
         * 注册子类型
         * @param {Base} key 要绑定的父类
         * @param {Base} value 要绑定的子类
         */
        function (key, value) {
            if (table.has(key)) {
                table.get(key).push(value);
            } else {
                table.set(key, [value]);
            }
        }
    );

    return Interface.RegisterSubType.call(this, ...params);
}
