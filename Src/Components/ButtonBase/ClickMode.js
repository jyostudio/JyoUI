import Enum from "@JyoUI/Common/Enum.js";

export default class ClickMode extends Enum {
    static #hover = new ClickMode(0, "Hover");

    static #press = new ClickMode(1, "Press");

    static #release = new ClickMode(2, "Release");

    /**
     * 悬停
     * @returns {ClickMode} 悬停
     */
    static get Hover() {
        return ClickMode.#hover;
    }

    /**
     * 按下
     * @returns {ClickMode} 按下
     */
    static get Press() {
        return ClickMode.#press;
    }

    /**
     * 释放
     * @returns {ClickMode} 释放
     */
    static get Release() {
        return ClickMode.#release;
    }
}