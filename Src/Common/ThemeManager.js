import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Enum from "@JyoUI/Common/Enum.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";

/**
 * 主题枚举
 * @enum {Theme}
 */
class Themes extends Enum {
    static #light = new Themes("Light");

    static #dark = new Themes("Dark");

    /**
     * 浅色主题
     * @type {Theme}
     * @static
     * @readonly
     */
    static get Light() {
        return this.#light;
    }

    /**
     * 深色主题
     * @type {Theme}
     * @static
     * @readonly
     */
    static get Dark() {
        return this.#dark;
    }
}

/**
 * 主题管理器
 * @class
 * @singleton
 */
class ThemeManager extends Base {
    /**
     * 获取主题枚举
     */
    get Themes() {
        return Themes;
    }

    // 样式表
    #styleSheet = new CSSStyleSheet();

    // 获取是否支持HDR色彩空间
    #supportHDR = false;

    // 获取是否支持P3色彩空间
    #supportP3 = false;

    // 主色
    #primaryColor = "#326CB6";

    // 强调色
    #accentColor = "#5F6FB0";

    // 是否启用透明度
    #enableAlpha = true;

    // 主题变更事件
    #changeEvent = new EventHandle();

    // 当前主题枚举
    #currentTheme = null;

    // 是否自动设置
    #isAutoSet = true;

    // 自动设置主题
    #autoTheme = Themes.Light;

    /**
     * 获取样式表
     * @returns {CSSStyleSheet} 样式表
     */
    get StyleSheet() {
        return this.#styleSheet;
    }

    /**
     * 获取是否支持HDR色彩空间
     * @returns {Boolean} 是否支持HDR色彩空间
     */
    get SupportHDR() {
        return this.#supportHDR;
    }

    /**
     * 获取是否支持P3色彩空间
     * @returns {Boolean} 是否支持P3色彩空间
     */
    get SupportP3() {
        return this.#supportP3;
    }

    /**
     * 获取当前主题枚举
     * @returns {Themes} 当前主题枚举
     */
    get CurrentTheme() {
        return this.#currentTheme;
    }

    /**
     * 获取当前主题枚举字符串
     * @returns {String} 当前主题枚举字符串
     */
    get CurrentThemeModeStr() {
        return this.#currentTheme.ToString();
    }

    /**
     * 获取主题变更事件
     * @returns {EventHandle} 主题变更事件
     */
    get ChangeEvent() {
        return this.#changeEvent;
    }

    static #_constructor = function (...params) {
        ThemeManager.#_constructor = MethodOverload().Add(
            [],
            /**
             * 主题管理器类构造函数
             * @constructor
             * @this {ThemeManager}
             * @returns {ThemeManager} 主题管理器类实例
             */
            function () {
                if (window.matchMedia("(dynamic-range: high)").matches) {
                    this.#supportHDR = true;
                }
                if (window.matchMedia("(color-gamut: p3)").matches) {
                    this.#supportP3 = true;
                }

                this.#InitAutoSet();
            }
        );

        return ThemeManager.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        super();

        Base.DefineProperties(this, {
            PrimaryColor: {
                /**
                 * 获取主色
                 * @this {ThemeManager}
                 * @returns {String} 主色
                 */
                get() {
                    return this.#primaryColor;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置主色
                     * @this {ThemeManager}
                     * @param {String} value 主色
                     */
                    function (value) {
                        this.#primaryColor = value;
                        this.#GenerateStyleSheet();
                    }
                )
            },
            AccentColor: {
                /**
                 * 获取强调色
                 * @this {ThemeManager}
                 * @returns {String} 强调色
                 */
                get() {
                    return this.#accentColor;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置强调色
                     * @this {ThemeManager}
                     * @param {String} value 强调色
                     */
                    function (value) {
                        this.#accentColor = value;
                        this.#GenerateStyleSheet();
                    }
                )
            },
            EnableAlpha: {
                /**
                 * 获取是否启用透明度
                 * @this {ThemeManager}
                 * @returns {Boolean} 是否启用透明度
                 */
                get() {
                    return this.#enableAlpha;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否启用透明度
                     * @this {ThemeManager}
                     * @param {Boolean} value 是否启用透明度
                     */
                    function (value) {
                        this.#enableAlpha = value;
                        this.#GenerateStyleSheet();
                    }
                )
            },
            IsAutoSet: {
                /**
                 * 获取是否自动设置
                 * @this {ThemeManager}
                 * @returns {Boolean} 是否自动设置
                 */
                get() {
                    return this.#isAutoSet;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否自动设置
                     * @this {ThemeManager}
                     * @param {Boolean} value 是否自动设置
                     */
                    function (value) {
                        if (!("matchMedia" in window)) {
                            value = false;
                        }
                        this.#isAutoSet = value;
                        if (value) {
                            this.ApplyTheme(this.#autoTheme);
                        }
                    }
                )
            }
        });

        return ThemeManager.#_constructor.call(this, ...params);
    }

    /**
     * 初始化自动设置
     */
    #InitAutoSet() {
        if (!("matchMedia" in window)) {
            this.ApplyTheme(Themes.Light);
            this.#isAutoSet = false;
            return;
        }

        const prefersColorScheme = window.matchMedia("(prefers-color-scheme: dark)");
        prefersColorScheme.addEventListener("change", e => {
            if (e.matches) {
                this.#autoTheme = Themes.Dark;
            } else {
                this.#autoTheme = Themes.Light;
            }
            this.ApplyTheme(this.#autoTheme);
        });
        this.ApplyTheme(prefersColorScheme.matches ? Themes.Dark : Themes.Light);
    }

    /**
     * 生成公共样式表
     */
    #GenerateCommonStyleSheet() {
        let cssText = `
        :host {
            --primary-color: ${this.#primaryColor};
            --accent-color: ${this.#accentColor};
        }`;
        return cssText;
    }

    /**
     * 生成样式表
     * @returns {String} 样式表文本
     */
    #GenerateStyleSheet() {
        return this.SupportToHDR(`[data-theme] { display: none !important; } [data-theme="${this.#currentTheme.ToString()}"] { display: block !important; }` + this.#GenerateCommonStyleSheet());
    }

    RGBAToP3(...params) {
        ThemeManager.prototype.RGBAToP3 = MethodOverload()
            .Add(
                [Number, Number, Number],
                /**
                 * RGB颜色转换到P3色彩空间
                 * @param {Number} r 红色
                 * @param {Number} g 绿色
                 * @param {Number} b 蓝色
                 * @returns {String} 转换后的颜色文本
                 */
                function (r, g, b) {
                    return this.RGBAToP3(r, g, b, 1);
                }
            )
            .Add(
                [Number, Number, Number, Number],
                /**
                 * RGB颜色转换到P3色彩空间
                 * @param {Number} r 红色
                 * @param {Number} g 绿色
                 * @param {Number} b 蓝色
                 * @param {Number} a 透明度
                 * @returns {String} 转换后的颜色文本
                 */
                function (r, g, b, a) {
                    let p3R = r / 255;
                    let p3G = g / 255;
                    let p3B = b / 255;
                    let p3A = a;
                    return `color(display-p3 ${p3R} ${p3G} ${p3B} / ${p3A})`;
                }
            );

        return ThemeManager.prototype.RGBAToP3.call(this, ...params);
    }

    CovertToP3(...params) {
        ThemeManager.prototype.CovertToP3 = MethodOverload().Add(
            [String],
            /**
             * 转换颜色到P3色彩空间
             * @param {String} colorText 颜色文本
             * @returns {String} 转换后的颜色文本
             */
            function (colorText) {
                if (!this.#supportP3) return colorText;
                colorText = colorText.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([.\d]+))?\s*\)/gi, (match, r, g, b, a) => {
                    return this.RGBAToP3(parseFloat(r), parseFloat(g), parseFloat(b), parseFloat(a ?? 1));
                });
                colorText = colorText.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})/gi, (match, color) => {
                    let r = 0;
                    let g = 0;
                    let b = 0;
                    let a = 1;
                    if (color.length === 3 || color.length === 4) {
                        r = parseInt(color[0] + color[0], 16);
                        g = parseInt(color[1] + color[1], 16);
                        b = parseInt(color[2] + color[2], 16);
                        if (color.length === 4) {
                            a = parseInt(color[3] + color[3], 16) / 255;
                        }
                    } else {
                        r = parseInt(color[0] + color[1], 16);
                        g = parseInt(color[2] + color[3], 16);
                        b = parseInt(color[4] + color[5], 16);
                        if (color.length === 8) {
                            a = parseInt(color[6] + color[7], 16) / 255;
                        }
                    }
                    return this.RGBAToP3(r, g, b, a);
                });
                return colorText;
            }
        );

        return ThemeManager.prototype.CovertToP3.call(this, ...params);
    }

    SupportToHDR(...params) {
        ThemeManager.prototype.SupportToHDR = MethodOverload().Add(
            [String],
            /**
             * 上升支持到HDR色彩空间
             * @param {String} styleText 原始样式文本
             * @returns {String} 上升支持到HDR色彩空间后的样式文本
             */
            function (styleText) {
                if (!this.#supportHDR || !this.#supportP3) return styleText;
                return this.CovertToP3(styleText);
            }
        );

        return ThemeManager.prototype.SupportToHDR.call(this, ...params);
    }

    GetThemeStyles(...params) {
        ThemeManager.prototype.GetThemeStyles = MethodOverload().Add(
            [],
            /**
             * 获取主题样式表对象
             * @this {ThemeManager}
             * @returns {String} 主题样式表对象
             */
            async function () {
                const theme = this.#currentTheme;
                if (!theme) {
                    return;
                }

                return {
                    styleText: this.#GenerateStyleSheet(),
                    mode: theme.ToString()
                };
            }
        );

        return ThemeManager.prototype.GetThemeStyles.call(this, ...params);
    }

    ApplyTheme(...params) {
        ThemeManager.prototype.ApplyTheme = MethodOverload()
            .Add(
                [],
                /**
                 * 应用主题
                 */
                function () {
                    return this.ApplyTheme(Themes.Dark);
                }
            )
            .Add(
                [Themes],
                /**
                 * 应用主题
                 * @param {Themes} theme 主题枚举
                 */
                async function (theme) {
                    this.#currentTheme = theme;
                    this.#styleSheet.replaceSync((await this.GetThemeStyles()).styleText);
                    this.#changeEvent.Dispatch(theme);
                }
            );

        return ThemeManager.prototype.ApplyTheme.call(this, ...params);
    }
}

// 单例主题管理器实例
const themeManager = new ThemeManager();

// 导出主题管理器
export default themeManager;
