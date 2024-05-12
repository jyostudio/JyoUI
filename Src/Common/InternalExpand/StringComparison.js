import Enum from "@JyoUI/Common/Enum.js";

/**
 * 指定 System.String.Compare(System.String,System.String) 和 System.String.Equals(System.Object) 方法的某些重载要使用的区域、大小写和排序规则。
 * @enum
 */
export default class StringComparison extends Enum {
    static #currentCulture = new StringComparison(0, "CurrentCulture");

    static #currentCultureIgnoreCase = new StringComparison(1, "CurrentCultureIgnoreCase");

    static #invariantCulture = new StringComparison(2, "InvariantCulture");

    static #invariantCultureIgnoreCase = new StringComparison(3, "InvariantCultureIgnoreCase");

    static #ordinal = new StringComparison(4, "Ordinal");

    static #ordinalIgnoreCase = new StringComparison(5, "OrdinalIgnoreCase");

    /**
     * 使用区域敏感排序规则和当前区域比较字符串。
     * @static
     * @readonly
     */
    static get CurrentCulture() {
        return this.#currentCulture;
    }

    /**
     * 使用区域敏感排序规则、当前区域来比较字符串，同时忽略被比较字符串的大小写。
     * @static
     * @readonly
     */
    static get CurrentCultureIgnoreCase() {
        return this.#currentCultureIgnoreCase;
    }

    /**
     * 使用区域敏感排序规则和固定区域比较字符串。
     * @static
     * @readonly
     */
    static get InvariantCulture() {
        return this.#invariantCulture;
    }

    /**
     * 使用区域敏感排序规则、固定区域来比较字符串，同时忽略被比较字符串的大小写。
     * @static
     * @readonly
     */
    static get InvariantCultureIgnoreCase() {
        return this.#invariantCultureIgnoreCase;
    }

    /**
     * 使用序号排序规则比较字符串。
     * @static
     * @readonly
     */
    static get Ordinal() {
        return this.#ordinal;
    }

    /**
     * 使用序号排序规则并忽略被比较字符串的大小写，对字符串进行比较。
     * @static
     * @readonly
     */
    static get OrdinalIgnoreCase() {
        return this.#ordinalIgnoreCase;
    }
}