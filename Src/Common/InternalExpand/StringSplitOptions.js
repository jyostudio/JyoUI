import Enum from "@JyoUI/Common/Enum.js";

/**
 * 指定适用的 Overload:System.String.Split 方法重载包含还是省略返回值中的空子字符串。
 * @Enum
 */
export default class StringSplitOptions extends Enum {
    static #none = new StringSplitOptions(0, "None");

    static #removeEmptyEntries = new StringSplitOptions(1, "RemoveEmptyEntries");

    static #trimEntries = new StringSplitOptions(2, "TrimEntries");

    /**
     * 拆分字符串时使用默认选项。
     * @static
     * @readonly
     */
    static get None() {
        return StringSplitOptions.#none;
    }

    /**
     * 省略包含结果中空字符串的数组元素。
     * @static
     * @readonly
     */
    static get RemoveEmptyEntries() {
        return StringSplitOptions.#removeEmptyEntries;
    }

    /**
     * 剪裁结果中每个子字符串的空白字符。
     * 如果同时指定 RemoveEmptyEntries 和 TrimEntries，则还会从结果中删除仅由空白字符组成的子字符串。
     * @static
     * @readonly
     */
    static get TrimEntries() {
        return StringSplitOptions.#trimEntries;
    }
}
