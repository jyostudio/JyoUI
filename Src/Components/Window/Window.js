import Base from "@JyoUI/Common/Base.js";
import Enum from "@JyoUI/Common/Enum.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import themeManager from "@JyoUI/Common/ThemeManager.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";
import "@JyoUI/Components/Styles/Acrylic/Acrylic.js";
import "@JyoUI/Components/TitleBar/TitleBar.js";
import AssetsPath from "@JyoUI/Assets/Assets.js";

/**
 * 窗口状态枚举
 */
class WindowState extends Enum {
    static #normal = new WindowState(0, "normal");

    static #maximized = new WindowState(1, "maximized");

    static #minimized = new WindowState(2, "minimized");

    /**
     * 获取正常状态
     * @returns {WindowState} 正常状态
     */
    static get Normal() {
        return WindowState.#normal;
    }

    /**
     * 获取最大化状态
     * @returns {WindowState} 最大化状态
     */
    static get Maximized() {
        return WindowState.#maximized;
    }

    /**
     * 获取最小化状态
     * @returns {WindowState} 最小化状态
     */
    static get Minimized() {
        return WindowState.#minimized;
    }
}

/**
 * 窗口组件
 * @extends Basic
 * @class
 */
export default class Window extends Basic {
    /**
     * 窗口闪烁音频
     * @type {HTMLAudioElement}
     */
    static #blinkAudio = new Audio(new URL("./Audio/Windows Background.mp3", AssetsPath));

    /**
     * 已打开的窗口
     * @type {Array<Window>}
     */
    static #openWindows = [];

    /**
     * 焦点窗口
     * @type {Window?}
     */
    static #activeWindow = null;

    /**
     * 最后一次移动位置
     * @type {{X:number,Y:number}?}
     */
    static #movingLastLocation = null;

    /**
     * 尺寸调整函数
     * @type {Function?}
     */
    static #resizeFn = null;

    /**
     * 计数器（从1开始）
     * @type {Number}
     */
    static #counter = 1;

    /**
     * 窗口起始深度
     * @type {Number}
     */
    static #startZIndex = 1000000;

    /**
     * 获取窗口状态枚举
     * @returns {WindowState} 窗口状态枚举
     */
    static get WindowState() {
        return WindowState;
    }

    /**
     * 根ID
     */
    #rootId = Symbol();

    /**
     * 父级尺寸调整函数
     * @type {Function?}
     */
    #parentResizeFn = null;

    /**
     * 触发尺寸调整计时器
     */
    #onResizeTimer = null;

    /**
     * 省电模式改变函数
     * @type {Function?}
     */
    #reducedMotionChangeFn = null;

    /**
     * 窗口元素
     * @type {HTMLElement}
     */
    #windowEl = null;

    /**
     * 亚克力元素
     * @type {HTMLElement}
     */
    #acrylicEl = null;

    /**
     * 调整大小句柄框架元素
     * @type {HTMLElement}
     */
    #resizeHandleFrameEl = null;

    /**
     * 是否为子窗口
     * @type {Boolean}
     */
    #isSubWindow = false;

    /**
     * 窗口当前位置
     * @type {{X:number,Y:number,Width:number,Height:number}?}
     */
    #currentRect = { X: 0, Y: 0, Width: 0, Height: 0 };

    /**
     * 窗口记录对象
     */
    #recordObj = {
        /**
         * 窗口原始位置
         * @type {{X:number,Y:number,Width:number,Height:number}?}
         */
        oldRect: null,
        /**
         * 给最小化用的窗口原始位置
         * @type {{X:number,Y:number,Width:number,Height:number}?}
         */
        oldToMinRect: null,
        /**
         * 给最小化用的窗口原始状态
         * @type {WindowState?}
         */
        oldToMinWindowState: null,
        /**
         * 给全屏用的窗口原始位置
         * @type {{X:number,Y:number,Width:number,Height:number}?}
         */
        oldRectForFullScreen: null,
        /**
         * @typedef {Object} WindowRecordState 窗口记录状态
         * @property { Boolean } hasHideTitleBar 是否隐藏标题栏
         * @property { Boolean } isResizable 是否可调整大小
         */
        /**
         * 窗口原始状态
         * @type {WindowRecordState?}
         */
        oldState: null,
        /**
         * 窗口原始不透明度
         * @type {Number?}
         */
        opacity: 1
    };

    /**
     * 窗口父级
     * @type {HTMLElement?}
     */
    #parent = null;

    /**
     * 是否可调整大小
     * @type {Boolean}
     */
    #isResizable = true;

    /**
     * 是否可移动
     * @type {Boolean}
     */
    #canMove = true;

    /**
     * 是否隐藏标题栏
     * @type {Boolean}
     */
    #hasHideTitleBar = false;

    /**
     * 最大尺寸
     * @type {{Width:number,Height:number}?}}
     */
    #maxSize = null;

    /**
     * 最小尺寸
     * @type {{Width:number,Height:number}?}
     */
    #minSize = null;

    /**
     * 不透明度
     * @type {Number}
     */
    #opacity = 1;

    /**
     * 窗口深度
     * @type {Number}
     */
    #zIndex = 0;

    /**
     * 移动时触发事件
     * @type {EventHandle}
     */
    #onMove = new EventHandle(this.AbortController);

    /**
     * 窗口关闭时触发事件
     * @type {EventHandle}
     */
    #onWindowClosing = new EventHandle(this.AbortController);

    /**
     * 窗口关闭后触发事件
     * @type {EventHandle}
     */
    #onWindowClosed = new EventHandle(this.AbortController);

    /**
     * 窗口大小调整模式循环时发生事件
     * @type {EventHandle}
     */
    #onResizeBegin = new EventHandle(this.AbortController);

    /**
     * 调整大小时触发事件
     * @type {EventHandle}
     */
    #onResize = new EventHandle(this.AbortController);

    /**
     * 窗口大小调整模式结束时发生事件
     * @type {EventHandle}
     */
    #onResizeEnd = new EventHandle(this.AbortController);

    /**
     * 窗口全屏状态改变时发生事件
     * @type {EventHandle}
     */
    #onFullscreenChange = new EventHandle(this.AbortController);

    /**
     * 窗口状态改变时发生事件
     * @type {EventHandle}
     */
    #onWindowStateChange = new EventHandle(this.AbortController);

    /**
     * 窗口状态
     * @type {WindowState}
     */
    #windowState = WindowState.Normal;

    /**
     * 最小化目标
     * @type {HTMLElement?}
     */
    #minimizeTarget = null;

    /**
     * 窗口是否不可激活
     * @type {Boolean}
     */
    #cantActive = false;

    /**
     * 获取窗口父级
     * @returns {HTMLElement} 窗口父级
     */
    get #RealParent() {
        return this.offsetParent ?? document.body;
    }

    /**
     * 获取焦点窗口
     * @returns {Window?} 焦点窗口
     */
    static get ActiveWindow() {
        return Window.#activeWindow;
    }

    /**
     * 获取当前窗口是否为焦点窗口
     * @returns {Boolean} 当前窗口是否为焦点窗口
     */
    get IsActive() {
        return this === Window.#activeWindow;
    }

    /**
     * 获取窗口是否为子窗口
     * @returns {Boolean} 窗口是否为子窗口
     */
    get IsSubWindow() {
        return this.#isSubWindow;
    }

    /**
     * 获取移动时触发事件
     * @returns {EventHandle} 事件
     */
    get OnMove() {
        return this.#onMove;
    }

    /**
     * 获取窗口关闭时触发事件
     * @returns {EventHandle} 窗口关闭时触发事件
     */
    get OnWindowClosing() {
        return this.#onWindowClosing;
    }

    /**
     * 获取窗口关闭后触发事件
     * @returns {EventHandle} 窗口关闭后触发事件
     */
    get OnWindowClosed() {
        return this.#onWindowClosed;
    }

    /**
     * 获取窗口调整大小开始时触发事件
     * @returns {EventHandle} 窗口调整大小开始时触发事件
     */
    get OnResizeBegin() {
        return this.#onResizeBegin;
    }

    /**
     * 获取调整大小时触发事件
     * @returns {EventHandle} 事件
     */
    get OnResize() {
        return this.#onResize;
    }

    /**
     * 获取窗口调整大小结束时触发事件
     * @returns {EventHandle} 窗口调整大小结束时触发事件
     */
    get OnResizeEnd() {
        return this.#onResizeEnd;
    }

    /**
     * 获取窗口全屏状态改变时触发事件
     * @returns {EventHandle} 窗口全屏状态改变时触发事件
     */
    get OnFullscreenChange() {
        return this.#onFullscreenChange;
    }

    /**
     * 获取窗口状态改变时触发事件
     * @returns {EventHandle} 窗口状态改变时触发事件
     */
    get OnWindowStateChange() {
        return this.#onWindowStateChange;
    }

    /**
     * 窗口状态
     * @returns {WindowState} 窗口状态
     */
    get WindowState() {
        return this.#windowState;
    }

    /**
     * 窗口是否全屏
     * @returns {Boolean} 窗口是否全屏
     */
    get IsFullScreen() {
        return document.fullscreenElement && this === Window.#activeWindow;
    }

    static #_constructor = function (...params) {
        Window.#_constructor = MethodOverload().Add(
            [],
            /**
             * 窗口组件构造函数
             * @constructor
             * @this {Window}
             * @returns {Window} 窗口组件实例
             */
            function () {
                this.#parentResizeFn = async () => {
                    await this.WaitLoad();
                    if (this.IsFullScreen) {
                        [this.Left, this.Top, this.Width, this.Height] = [0, 0, screen.width, screen.height];
                    } else if (this.WindowState === WindowState.Maximized) {
                        const realParent = await this.#GetRealParent();
                        [this.Left, this.Top, this.Width, this.Height] = [0, 0, realParent.clientWidth, realParent.clientHeight];
                    } else {
                        this.Left = this.Left;
                        this.Top = this.Top;
                    }
                };

                this.#reducedMotionChangeFn = (async () => {
                    await this.WaitLoad();
                    if (this.IsFullScreen) return;
                    this.#acrylicEl.JustShowFallback = Basic.PowerSavingMode;
                    this.Debouncing(this.Update);
                }).bind(this);
            }
        );

        return Window.#_constructor.call(this, ...params);
    };

    /**
     * 窗口组件构造函数
     * @constructor
     * @returns {Window} 窗口组件实例
     */
    constructor(...params) {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            Left: {
                /**
                 * 获取窗口距左侧距离
                 * @this {Window}
                 * @returns {Number} 窗口距左侧距离
                 */
                get() {
                    return this.#currentRect.X;
                },
                set: MethodOverload()
                    .Add(
                        [Number],
                        /**
                         * 设置窗口距左侧距离
                         * @this {Window}
                         * @param {Number} value 窗口距左侧距离
                         */
                        async function (value) {
                            const realParent = await this.#GetRealParent();
                            if (this.WindowState === WindowState.Normal && !this.IsFullScreen) {
                                if (value < -this.Width + 200) {
                                    value = -this.Width + 200;
                                } else if (value > realParent.clientWidth - 200) {
                                    value = realParent.clientWidth - 200;
                                }
                            }

                            this.#currentRect.X = value | 0;
                            this.Root.host.style.translate = `${value | 0}px ${this.#currentRect.Y}px`;
                        }
                    )
                    .Add(
                        [String],
                        /**
                         * 设置窗口距左侧距离
                         * @this {Window}
                         * @param {String} value 窗口距左侧距离
                         */
                        async function (value) {
                            const realParent = await this.#GetRealParent();
                            if (value === "center") {
                                this.Left = (realParent.clientWidth - this.Width) / 2;
                            } else {
                                this.Left = parseInt(value);
                            }
                        }
                    )
            },
            Top: {
                /**
                 * 获取窗口距顶部距离
                 * @this {Window}
                 * @returns {Number} 窗口距顶部距离
                 */
                get() {
                    return this.#currentRect.Y;
                },
                set: MethodOverload()
                    .Add(
                        [Number],
                        /**
                         * 设置窗口距顶部距离
                         * @this {Window}
                         * @param {Number} value 窗口距顶部距离
                         */
                        async function (value) {
                            const realParent = await this.#GetRealParent();
                            const titleHeight = this.HasHideTitleBar ? 0 : 32;
                            if (this.WindowState === WindowState.Normal && !this.IsFullScreen) {
                                if (value < 0) {
                                    value = 0;
                                } else if (value > realParent.clientHeight - titleHeight) {
                                    value = realParent.clientHeight - titleHeight;
                                }
                            }

                            this.#currentRect.Y = value | 0;
                            this.Root.host.style.translate = `${this.#currentRect.X}px ${value | 0}px`;
                        }
                    )
                    .Add(
                        [String],
                        /**
                         * 设置窗口距顶部距离
                         * @this {Window}
                         * @param {String} value 窗口距顶部距离
                         */
                        async function (value) {
                            const realParent = await this.#GetRealParent();
                            if (value === "center") {
                                this.Top = (realParent.clientHeight - this.Height) / 2;
                            } else {
                                this.Top = parseInt(value);
                            }
                        }
                    )
            },
            Location: {
                /**
                 * 获取窗口位置
                 * @this {Window}
                 * @returns {{X:number,Y:number}} 窗口位置
                 */
                get() {
                    return { X: this.Left, Y: this.Top };
                },
                set: MethodOverload()
                    .Add(
                        [String],
                        /**
                         * 设置窗口位置
                         * @this {Window}
                         * @param {String} value 窗口位置
                         */
                        function (value) {
                            try {
                                const json = new Function(`return ${value}`)();
                                this.Location = { X: json.X ?? json.x, Y: json.Y ?? json.y };
                            } catch {
                                if (value === "") {
                                    this.Location = { X: 0, Y: 0 };
                                } else if (value === "center") {
                                    this.Left = "center";
                                    this.Top = "center";
                                }
                            }
                        }
                    )
                    .Add(
                        [Object],
                        /**
                         * 设置窗口位置
                         * @this {Window}
                         * @param {{X:number,Y:number}} value 窗口位置
                         */
                        function (value) {
                            this.Left = value.X ?? value.x ?? 0;
                            this.Top = value.Y ?? value.y ?? 0;
                        }
                    )
            },
            Width: {
                /**
                 * 获取窗口宽度
                 * @this {Window}
                 * @returns {Number} 窗口宽度
                 */
                get() {
                    return this.#currentRect.Width;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置窗口宽度
                     * @this {Window}
                     * @param {Number} value 窗口宽度
                     */
                    function (value) {
                        if (this.WindowState === WindowState.Normal && !this.IsFullScreen) {
                            value = Math.min(Math.max(value, this.MinSize.Width), this.MaxSize.Width);
                        }

                        this.#currentRect.Width = value;
                        this.Root.host.style.width = `${value}px`;
                    }
                )
            },
            Height: {
                /**
                 * 获取窗口高度
                 * @this {Window}
                 * @returns {Number} 窗口高度
                 */
                get() {
                    return this.#currentRect.Height;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置窗口高度
                     * @this {Window}
                     * @param {Number} value 窗口高度
                     */
                    function (value) {
                        if (this.WindowState === WindowState.Normal && !this.IsFullScreen) {
                            value = Math.min(Math.max(value, this.MinSize.Height), this.MaxSize.Height);
                        }

                        this.#currentRect.Height = value;
                        this.Root.host.style.height = `${value}px`;
                    }
                )
            },
            Size: {
                /**
                 * 获取窗口尺寸
                 * @this {Window}
                 * @returns {{Width:number,Height:number}} 窗口尺寸
                 */
                get() {
                    return { Width: this.Width, Height: this.Height };
                },
                set: MethodOverload()
                    .Add(
                        [String],
                        /**
                         * 设置窗口尺寸
                         * @this {Window}
                         * @param {String} value 窗口尺寸
                         */
                        function (value) {
                            try {
                                const json = new Function(`return ${value}`)();
                                this.Size = { Width: json.Width ?? json.width, Height: json.Height ?? json.height };
                            } catch {
                                console.error("Window.Size: Invalid value.");
                            }
                        }
                    )
                    .Add(
                        [Object],
                        /**
                         * 设置窗口尺寸
                         * @this {Window}
                         * @param {{Width:number,Height:number}} value 窗口尺寸
                         */
                        function (value) {
                            this.Width = value.Width ?? value.width ?? 640;
                            this.Height = value.Height ?? value.height ?? 480;
                        }
                    )
            },
            IsResizable: {
                /**
                 * 获取是否可调整大小
                 * @this {Window}
                 * @returns {Boolean} 是否可调整大小
                 */
                get() {
                    return this.#isResizable;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否可调整大小
                     * @this {Window}
                     * @param {Boolean} value 是否可调整大小
                     */
                    function (value) {
                        this.#isResizable = value;
                        this.#resizeHandleFrameEl.style.display = value ? "block" : "none";
                    }
                )
            },
            CanMove: {
                /**
                 * 获取是否可移动
                 * @this {Window}
                 * @returns {Boolean} 是否可移动
                 */
                get() {
                    return this.#canMove;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否可移动
                     * @this {Window}
                     * @param {Boolean} value 是否可移动
                     */
                    function (value) {
                        this.#canMove = value;
                    }
                )
            },
            MaxSize: {
                /**
                 * 获取最大尺寸
                 * @this {Window}
                 * @returns {{Width:number,Height:number}} 最大尺寸
                 */
                get() {
                    return this.#maxSize;
                },
                set: MethodOverload()
                    .Add(
                        [String],
                        /**
                         * 设置最大尺寸
                         * @this {Window}
                         * @param {String} value 最大尺寸
                         */
                        function (value) {
                            try {
                                const json = new Function(`return ${value}`)();
                                this.MaxSize = { Width: json.Width ?? json.width, Height: json.Height ?? json.height };
                            } catch {
                                console.error("Window.MaxSize: Invalid value.");
                            }
                        }
                    )
                    .Add(
                        [Object],
                        /**
                         * 设置最大尺寸
                         * @this {Window}
                         * @param {{Width:number,Height:number}} value 最大尺寸
                         */
                        function (value) {
                            const width = value.Width ?? value.width ?? screen.width;
                            const height = value.Height ?? value.height ?? screen.height;
                            if (width < this.#minSize.Width || height < this.#minSize.Height) {
                                console.error("Window.MaxSize: Invalid value.");
                                return;
                            }
                            this.#maxSize = { Width: width, Height: height };
                            this.Width = Math.min(Math.max(this.Width, this.MinSize.Width), this.MaxSize.Width);
                            this.Height = Math.min(Math.max(this.Height, this.MinSize.Height), this.MaxSize.Height);
                        }
                    )
            },
            MinSize: {
                /**
                 * 获取最小尺寸
                 * @this {Window}
                 * @returns {{Width:number,Height:number}} 最小尺寸
                 */
                get() {
                    return this.#minSize;
                },
                set: MethodOverload()
                    .Add(
                        [String],
                        /**
                         * 设置最小尺寸
                         * @this {Window}
                         * @param {String} value 最小尺寸
                         */
                        function (value) {
                            try {
                                const json = new Function(`return ${value}`)();
                                this.MinSize = { Width: json.Width ?? json.width, Height: json.Height ?? json.height };
                            } catch {
                                console.error("Window.MinSize: Invalid value.");
                            }
                        }
                    )
                    .Add(
                        [Object],
                        /**
                         * 设置最小尺寸
                         * @this {Window}
                         * @param {{Width:number,Height:number}} value 最小尺寸
                         */
                        function (value) {
                            value.Width = value.Width ?? value.width ?? 300;
                            value.Height = value.Height ?? value.height ?? 150;
                            if (value.Width < 300) value.Width = 300;
                            if (value.Height < 150) value.Height = 150;
                            if (this.MaxSize.Width < value.Width || this.MaxSize.Height < value.Height) {
                                console.error("Window.MinSize: Invalid value.");
                                return;
                            }
                            this.#minSize = value;
                            this.Width = Math.min(Math.max(this.Width, this.MinSize.Width), this.MaxSize.Width);
                            this.Height = Math.min(Math.max(this.Height, this.MinSize.Height), this.MaxSize.Height);
                        }
                    )
            },
            HasHideTitleBar: {
                /**
                 * 获取是否隐藏标题栏
                 * @this {Window}
                 * @returns {Boolean} 是否隐藏标题栏
                 */
                get() {
                    return this.#hasHideTitleBar;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否隐藏标题栏
                     * @this {Window}
                     * @param {Boolean} value 是否隐藏标题栏
                     */
                    async function (value) {
                        this.#hasHideTitleBar = value;

                        await this.WaitLoad();
                        const titleBarEl = await this.GetTitleBar();
                        const contentEl = this.Root.querySelector(".content");
                        if (value) {
                            titleBarEl.style.display = "none";
                            contentEl.style.top = 0;
                            contentEl.style.height = "100%";
                        } else {
                            titleBarEl.style.display = "block";
                            let titleBarHeight = titleBarEl.offsetHeight;
                            contentEl.style.top = `${titleBarHeight}px`;
                            contentEl.style.height = `calc(100% - ${titleBarHeight}px)`;
                        }
                        this.Debouncing(this.Update);
                    }
                )
            },
            ZIndex: {
                /**
                 * 获取窗口深度
                 * @this {Window}
                 * @returns {Number} 窗口深度
                 */
                get() {
                    return this.#zIndex;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置窗口深度
                     * @this {Window}
                     * @param {Number} value 窗口深度
                     */
                    function (value) {
                        this.#zIndex = value;
                        this.Root.host.style.zIndex = Window.#startZIndex + this.ZIndex;
                    }
                )
            },
            Opacity: {
                /**
                 * 获取不透明度
                 * @this {Window}
                 * @returns {Number} 不透明度
                 */
                get() {
                    return this.#opacity;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置不透明度
                     * @this {Window}
                     * @param {Number} value 不透明度
                     */
                    function (value) {
                        this.#opacity = value;
                        this.Root.host.style.opacity = value;
                    }
                )
            },
            MinimizeTarget: {
                /**
                 * 获取最小化目标
                 * @this {Window}
                 * @returns {HTMLElement?} 最小化目标
                 */
                get() {
                    return this.#minimizeTarget ?? document.body;
                },
                set: MethodOverload()
                    .Add(
                        [String],
                        /**
                         * 设置最小化目标
                         * @this {Window}
                         * @param {String} value 最小化目标
                         */
                        function (value) {
                            const newTarget = document.querySelector(value);
                            if (!newTarget) {
                                console.error("Window.MinimizeTarget: Invalid value.");
                                return;
                            }
                            this.MinimizeTarget = newTarget;
                        }
                    )
                    .Add(
                        [HTMLElement],
                        /**
                         * 设置最小化目标
                         * @this {Window}
                         * @param {HTMLElement} el 最小化目标
                         */
                        function (el) {
                            this.#minimizeTarget = el;
                        }
                    )
            },
            CantActive: {
                /**
                 * 获取窗口是否不可激活
                 * @this {Window}
                 * @returns {Boolean} 窗口是否不可激活
                 */
                get() {
                    return this.#cantActive;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置窗口是否不可激活
                     * @this {Window}
                     * @param {Boolean} value 窗口是否不可激活
                     */
                    function (value) {
                        this.#cantActive = value;
                    }
                )
            },
            IsEnable: {
                /**
                 * 获取用户是否可以与控件交互
                 * @this {Basic}
                 * @returns {Boolean}
                 */
                get() {
                    return !this.Root.querySelector(".disabled");
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置用户是否可以与控件交互
                     * @this {Basic}
                     * @param {Boolean} value 用户是否可以与控件交互
                     */
                    function (value) {
                        if (value) {
                            this.Root.querySelector(".disabled")?.remove();
                        } else {
                            if (this.Root.querySelector(".disabled")) return;
                            let disabled = document.createElement("div");
                            disabled.classList.add("disabled");
                            this.Root.appendChild(disabled);
                        }
                    }
                )
            }
        });

        Base.DefineProperties(this, {
            Parent: {
                /**
                 * 获取父级
                 * @this {Window}
                 * @returns {Basic} 父级
                 */
                get() {
                    return this.#parent;
                },
                set: MethodOverload().Add(
                    [[HTMLElement, Basic, null]],
                    /**
                     * 设置父级
                     * @this {Window}
                     * @param {Basic} value 父级
                     */
                    function (value) {
                        this.#parent = value;
                        this.attributeChangedCallback?.("~", null, value);
                    }
                )
            }
        });

        return Window.#_constructor.call(this, ...params);
    }

    /**
     * 重排窗口
     */
    static #Resort() {
        Window.#openWindows.sort((a, b) => {
            let aZIndex = a.ZIndex;
            let bZIndex = b.ZIndex;
            if (a === Window.#activeWindow) return 1;
            if (b === Window.#activeWindow) return -1;
            if (aZIndex > bZIndex) return 1;
            if (aZIndex < bZIndex) return -1;
            return 0;
        });

        Window.#openWindows.forEach((win, index) => {
            win.ZIndex = index;
        });
    }

    /**
     * 获取真实父级
     * @returns {HTMLElement} 真实父级
     */
    async #GetRealParent() {
        await this.WaitLoad();
        let self = this.Root?.host ?? this;
        let result = null;
        /**
         * 窗口真实父级
         * 当被嵌套在其他组件中时，需要特殊处理
         */
        [
            ["JYO-DESKTOP", ".desktop"],
            [Window.ComponentTagName, ".content"]
        ].forEach(([tagName, selector]) => {
            if (self.Parent?.tagName === tagName) {
                result = self.Parent.Root?.querySelector?.(selector);
            }
        });
        return result ?? self.Parent ?? self.offsetParent ?? document.body;
    }

    /**
     * 初始化调整大小句柄
     */
    #InitResizeHandle() {
        ["left", "top", "right", "bottom", "leftTop", "rightTop", "leftBottom", "rightBottom"].forEach(name => {
            const resizeHandle = document.createElement("div");
            resizeHandle.classList.add("resizeHandle");
            resizeHandle.classList.add(name);
            resizeHandle[this.#rootId] = (x, y) => {
                const host = this.Root.host;
                const clientRect = host.getBoundingClientRect();
                const winOffsetWidth = host.offsetWidth;
                const winOffsetHeight = host.offsetHeight;

                let newLeft = this.Left;
                let newTop = this.Top;
                let newWidth = this.Width;
                let newHeight = this.Height;

                if (name === "left" || name === "leftTop" || name === "leftBottom") {
                    const ox = Math.floor(x - clientRect.left);
                    newLeft += ox;
                    newWidth -= ox;

                    if (newWidth < this.MinSize.Width) {
                        newWidth = this.MinSize.Width;
                        newLeft = this.Left + (this.Width - this.MinSize.Width);
                    }

                    if (newWidth > this.MaxSize.Width) {
                        newWidth = this.MaxSize.Width;
                        newLeft = this.Left + (this.Width - this.MaxSize.Width);
                    }

                    if (newLeft < 0) {
                        newWidth = this.Width;
                    }
                }

                if (name === "right" || name === "rightTop" || name === "rightBottom") {
                    newWidth = Math.floor(clientRect.width + x - clientRect.right);
                    if (newWidth < this.MinSize.Width) {
                        newWidth = this.MinSize.Width;
                    }

                    if (newWidth > this.MaxSize.Width) {
                        newWidth = this.MaxSize.Width;
                    }
                }

                if (name === "top" || name === "leftTop" || name === "rightTop") {
                    const oy = Math.floor(y - clientRect.top);
                    newTop += oy;
                    newHeight -= oy;
                    if (newHeight < this.MinSize.Height) {
                        newHeight = this.MinSize.Height;
                        newTop = this.Top + (this.Height - this.MinSize.Height);
                    }

                    if (newHeight > this.MaxSize.Height) {
                        newHeight = this.MaxSize.Height;
                        newTop = this.Top + (this.Height - this.MaxSize.Height);
                    }

                    if (newTop < 0) {
                        newHeight = this.Height;
                    }
                }

                if (name === "bottom" || name === "leftBottom" || name === "rightBottom") {
                    newHeight = Math.floor(clientRect.height + y - clientRect.bottom);
                    if (newHeight < this.MinSize.Height) {
                        newHeight = this.MinSize.Height;
                    }

                    if (newHeight > this.MaxSize.Height) {
                        newHeight = this.MaxSize.Height;
                    }
                }

                this.Left = newLeft;
                this.Top = newTop;
                this.Width = newWidth;
                this.Height = newHeight;

                if (host.offsetWidth !== winOffsetWidth || host.offsetHeight !== winOffsetHeight) {
                    this.Debouncing(this.Update);
                    cancelIdleCallback(this.#onResizeTimer);
                    this.#onResizeTimer = requestIdleCallback(() => {
                        this.OnResize.Dispatch(this);
                    });
                }
            };
            resizeHandle.addEventListener("pointerdown", async e => {
                const titleBarEl = await this.GetTitleBar();
                if (titleBarEl.IsMaximize || (e.buttons & 1) !== 1) return;
                this.Active();
                Window.#resizeFn = e.target[this.#rootId].bind(this);
                document.body.style.pointerEvents = "none";
                document.documentElement.style.cursor = document.defaultView.getComputedStyle(e.target).cursor;
                this.OnResizeBegin.Dispatch(this);
            });
            this.#resizeHandleFrameEl.appendChild(resizeHandle);
        });
    }

    /**
     * 执行一次动画
     */
    #OnceAnimation() {
        const host = this?.Root?.host;
        if (Basic.PowerSavingMode || !host) return;
        host.style.transition = "all 200ms cubic-bezier(0.2, 0.7, 0.6, 1)";
        setTimeout(() => {
            host.style.transition = "";
        }, 200);
    }

    /**
     * 记录旧的窗口状态
     */
    #RecordOldState() {
        this.#recordObj.oldState = {
            hasHideTitleBar: this.HasHideTitleBar,
            isResizeable: this.IsResizable
        };
    }

    /**
     * 组件被加载时调用
     */
    async Load() {
        this.#minSize = { Width: 200, Height: 32 };
        this.#maxSize = { Width: Math.max(screen.width, this.#minSize.Width), Height: Math.max(screen.height, this.#minSize.Height) };
        this.Size = { Width: 400, Height: 300 };
        const index = (Window.#counter - 1) % 9;
        Window.#counter++;
        this.Left = 33 + index * 26;
        this.Top = 26 + index * 26;
        Window.#openWindows.push(this);

        this.#windowEl = this.Root.querySelector(".window");
        this.#resizeHandleFrameEl = this.Root.querySelector(".resizeHandleFrame");
        this.#acrylicEl = await this.QueryComponent(".acrylic");
        this.#InitResizeHandle();

        const titleBarEl = await this.GetTitleBar();
        titleBarEl.Parent = this;
        titleBarEl.OnFunction.Bind((fn, ...params) => {
            this.Active(...params);
            this[fn].call(this, ...params);
        });

        window.addEventListener("resize", this.#parentResizeFn);
        Basic.OnPowerSavingModeChange.Bind(this.#reducedMotionChangeFn);
        this.#reducedMotionChangeFn();

        let realSelf = this.Root?.host ?? this;
        if (realSelf.Parent?.tagName === Window.ComponentTagName) {
            realSelf.Parent.OnResize.Bind(() => {
                this.#parentResizeFn();
            });
        }
    }

    /**
     * 更新组件
     */
    async Update() {
        await this.WaitLoad();

        this.Active();

        this.QueryComponent(".acrylic").then(el => {
            el.TintColor = themeManager.AccentColor;
        });

        this.UpdateAllSubComponent();
    }

    /**
     * 组件被卸载时调用
     */
    Unload() {
        Window.#openWindows.splice(Window.#openWindows.indexOf(this), 1);
        if (Window.#activeWindow === this) {
            if (Window.#openWindows.length) {
                Window.#openWindows[Window.#openWindows.length - 1].Active();
            } else {
                Window.#activeWindow = null;
            }
        }

        window.removeEventListener("resize", this.#parentResizeFn);
        Basic.OnPowerSavingModeChange.Unbind(this.#reducedMotionChangeFn);
    }

    Minimize(...params) {
        Window.prototype.Minimize = MethodOverload()
            .Add(
                [],
                /**
                 * 最小化窗口
                 * @this {Window}
                 */
                function () {
                    if (this.WindowState === WindowState.Minimized) return;
                    this.#recordObj.oldToMinWindowState = this.WindowState;
                    this.#windowState = WindowState.Minimized;

                    this.OnWindowStateChange.Dispatch(this, this.WindowState);

                    this.#RecordOldState();
                    this.#recordObj.oldToMinRect = { X: this.Left, Y: this.Top, Width: this.Width, Height: this.Height };
                    this.#recordObj.opacity = this.Opacity;

                    this.#OnceAnimation();
                    const targetRect = this.MinimizeTarget.getBoundingClientRect();
                    this.Left = targetRect.left + (targetRect.width - this.Width) / 2;
                    this.Top = targetRect.top + (targetRect.height - this.Height) / 2;
                    this.Root.host.style.scale = "0";
                    this.Opacity = 0;

                    setTimeout(() => {
                        this.ZIndex = -1;
                        this.Root.host.style.display = "none";
                        this.OnResize.Dispatch(this);
                        Window.#openWindows.unshift(this);
                        Window.#openWindows.pop();
                        const lastWin = Window.#openWindows[Window.#openWindows.length - 1];
                        this.Blur();
                        if (lastWin.style.display === "none") {
                            Window.#activeWindow = null;
                        } else {
                            lastWin.Active();
                        }
                    }, 200);
                }
            )
            .Add(
                [Event],
                /**
                 * 最小化窗口
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    this.Minimize();
                }
            );

        Window.prototype.Minimize.call(this, ...params);
    }

    Restore(...params) {
        Window.prototype.Restore = MethodOverload()
            .Add(
                [],
                /**
                 * 还原窗口
                 * @this {Window}
                 */
                async function () {
                    if (this.WindowState === WindowState.Normal) return;
                    const beforeWindowState = this.WindowState;
                    if (beforeWindowState === WindowState.Maximized) {
                        this.#windowEl.classList.remove("maximize");
                        (await this.GetTitleBar()).IsMaximize = false;
                        this.#windowState = WindowState.Normal;
                    } else if (beforeWindowState === WindowState.Minimized) {
                        this.#windowState = this.#recordObj.oldToMinWindowState;
                    }
                    this.OnWindowStateChange.Dispatch(this, this.WindowState);
                    this.Active();
                    this.Root.host.style.display = "block";
                    globalThis.requestIdleCallback(() => {
                        this.#OnceAnimation();
                        if (this.WindowState === WindowState.Maximized) {
                            this.#parentResizeFn();
                        } else {
                            const or = beforeWindowState === WindowState.Minimized ? this.#recordObj.oldToMinRect : this.#recordObj.oldRect;
                            [this.Left, this.Top, this.Width, this.Height] = [or.X, or.Y, or.Width, or.Height];
                        }
                        this.Opacity = this.#recordObj.opacity;
                        this.Root.host.style.scale = "1";
                        setTimeout(() => {
                            this.OnResize.Dispatch(this);
                            this.UpdateAllSubComponent?.();
                        }, 200);
                    });
                }
            )
            .Add(
                [Event],
                /**
                 * 还原窗口
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    this.Restore();
                }
            );

        Window.prototype.Restore.call(this, ...params);
    }

    Maximize(...params) {
        Window.prototype.Maximize = MethodOverload()
            .Add(
                [],
                /**
                 * 最大化窗口
                 * @this {Window}
                 */
                async function () {
                    if (this.WindowState === WindowState.Maximized) return;
                    const realParent = await this.#GetRealParent();
                    this.#recordObj.oldRect = { X: this.Left, Y: this.Top, Width: this.Width, Height: this.Height };
                    this.#windowEl.classList.add("maximize");
                    (await this.GetTitleBar()).IsMaximize = true;
                    this.#windowState = WindowState.Maximized;
                    this.OnWindowStateChange.Dispatch(this, this.WindowState);
                    this.#OnceAnimation();
                    [this.Left, this.Top, this.Width, this.Height] = [0, 0, realParent.clientWidth, realParent.clientHeight];
                    setTimeout(() => {
                        this.OnResize.Dispatch(this);
                        this.UpdateAllSubComponent?.();
                    }, 200);
                }
            )
            .Add(
                [Event],
                /**
                 * 最大化窗口
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    this.Maximize();
                }
            );

        Window.prototype.Maximize.call(this, ...params);
    }

    Close(...params) {
        Window.prototype.Close = MethodOverload()
            .Add(
                [],
                /**
                 * 关闭窗口
                 * @this {Window}
                 */
                async function () {
                    const host = this.Root.host;
                    if (!host) return;
                    let obj = { cancel: false };
                    await this.OnWindowClosing.Dispatch(this, obj);
                    if (obj.cancel) return;
                    this.#OnceAnimation();
                    host.style.transform = "scale(0.9)";
                    host.style.opacity = "0";
                    setTimeout(async () => {
                        await this.OnWindowClosed.Dispatch(this);
                        this.Root?.host?.remove();
                    }, 200);
                }
            )
            .Add(
                [Event],
                /**
                 * 关闭窗口
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    this.Close();
                }
            );

        Window.prototype.Close.call(this, ...params);
    }

    Active(...params) {
        const superActive = super.Active;
        Window.prototype.Active = MethodOverload()
            .Add(
                [],
                /**
                 * 窗口获取焦点
                 * @this {Window}
                 */
                async function () {
                    if (this.#cantActive) return;
                    const acrylicEl = await this.QueryComponent(".acrylic");
                    if (!Window.#activeWindow?.IsDisposed) {
                        Window.#activeWindow?.Blur();
                    }
                    Window.#activeWindow = this;
                    superActive.call(this, false);
                    this.#windowEl.querySelector(".windowInner").style.borderColor = themeManager.PrimaryColor;
                    acrylicEl.Deactivate = false;
                    (await this.GetTitleBar()).Deactivate = false;

                    Window.#Resort();
                }
            )
            .Add(
                [Event],
                /**
                 * 窗口获取焦点（由事件触发）
                 * @param {Event} e 事件
                 */
                function (e) {
                    if (this.#cantActive) return;
                    e.stopPropagation();
                    this.Active();
                }
            )
            .Other(superActive);

        Window.prototype.Active.call(this, ...params);
    }

    Blur(...params) {
        const superBlur = super.Blur;
        Window.prototype.Blur = MethodOverload()
            .Add(
                [],
                /**
                 * 窗口失去焦点
                 * @this {Window}
                 */
                async function () {
                    superBlur.call(this);
                    if (this !== Window.#activeWindow) return;
                    Window.#activeWindow = null;
                    this.#windowEl.querySelector(".windowInner").style.borderColor = "";
                    this.#acrylicEl.Deactivate = true;
                    (await this.GetTitleBar()).Deactivate = true;
                }
            )
            .Add(
                [Event],
                /**
                 * 窗口失去焦点（由事件触发）
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    return this.Blur();
                }
            )
            .Other(superBlur);

        Window.prototype.Blur.call(this, ...params);
    }

    Blink(...params) {
        let blinkTimer = null;
        Window.prototype.Blink = MethodOverload()
            .Add(
                [],
                /**
                 * 窗口闪烁
                 * @this {Window}
                 */
                async function () {
                    clearInterval(blinkTimer);
                    Window.#blinkAudio.currentTime = 0;
                    Window.#blinkAudio.play();
                    const acrylicEl = await this.QueryComponent(".acrylic");
                    this.Active();
                    const inner = this.#windowEl.querySelector(".windowInner");
                    inner.style.transition = "none";
                    let i = 0;
                    blinkTimer = setInterval(async () => {
                        if (i < (Window.#activeWindow === this ? 11 : 12)) {
                            if (i % 2 == 0) {
                                inner.style.borderColor = themeManager.PrimaryColor;
                                acrylicEl.Deactivate = false;
                                (await this.GetTitleBar()).Deactivate = false;
                            } else {
                                inner.style.borderColor = "";
                                acrylicEl.Deactivate = true;
                                (await this.GetTitleBar()).Deactivate = true;
                            }
                            i++;
                        } else {
                            clearInterval(blinkTimer);
                            inner.style.transition = "";
                        }
                    }, 50);
                }
            )
            .Add(
                [Event],
                /**
                 * 窗口闪烁（由事件触发）
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    return this.Blink();
                }
            );

        Window.prototype.Blink.call(this, ...params);
    }

    MoveBegin(...params) {
        Window.prototype.MoveBegin = MethodOverload().Add(
            [PointerEvent],
            /**
             * 窗口移动开始
             * @this {Window}
             * @param {PointerEvent} e 指针事件
             */
            async function (e) {
                if (!this.CanMove || (await this.GetTitleBar()).IsMaximize || (e.buttons & 1) !== 1) return;
                Window.#movingLastLocation = { X: e.clientX, Y: e.clientY };
            }
        );

        Window.prototype.MoveBegin.call(this, ...params);
    }

    FullScreen(...params) {
        Window.prototype.FullScreen = MethodOverload()
            .Add(
                [],
                /**
                 * 窗口进入全屏
                 * @this {Window}
                 */
                async function () {
                    if (this.IsFullScreen || document.fullscreenElement) return false;
                    this.Active();
                    this.#RecordOldState();
                    this.#recordObj.oldRectForFullScreen = { X: this.Left, Y: this.Top, Width: this.Width, Height: this.Height };
                    [this.Left, this.Top, this.Width, this.Height] = [0, 0, screen.width, screen.height];
                    (await this.GetTitleBar()).IsMaximize = true;
                    this.#windowEl.classList.add("maximize");
                    this.#windowEl.querySelector(".content").classList.add("fullScreen");
                    this.Root.querySelector(".windowInner").style.border = "none";
                    this.#acrylicEl.JustShowFallback = true;
                    this.HasHideTitleBar = true;
                    this.IsResizable = false;
                    try {
                        this.Root.host.requestFullscreen();
                    } catch {
                        globalThis.requestIdleCallback(() => {
                            this.ExitFullScreen();
                        });
                    }
                    this.OnFullscreenChange.Dispatch(this, true);
                    this.UpdateAllSubComponent?.();
                    return true;
                }
            )
            .Add(
                [Event],
                /**
                 * 窗口进入全屏（由事件触发）
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    return this.FullScreen();
                }
            );

        Window.prototype.FullScreen.call(this, ...params);
    }

    ExitFullScreen(...params) {
        Window.prototype.ExitFullScreen = MethodOverload()
            .Add(
                [],
                /**
                 * 窗口退出全屏
                 * @this {Window}
                 */
                async function () {
                    if (Window.#activeWindow !== this) return;
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    if (this.WindowState != WindowState.Maximized) {
                        this.#windowEl.classList.remove("maximize");
                        (await this.GetTitleBar()).IsMaximize = false;
                    }
                    const orffs = this.#recordObj.oldRectForFullScreen;
                    [this.Left, this.Top, this.Width, this.Height] = [orffs.X, orffs.Y, orffs.Width, orffs.Height];
                    this.Root.querySelector(".windowInner").style.border = "";
                    this.#windowEl.querySelector(".content").classList.remove("fullScreen");
                    this.#acrylicEl.JustShowFallback = Basic.PowerSavingMode;
                    this.HasHideTitleBar = this.#recordObj.oldState.hasHideTitleBar;
                    this.IsResizable = this.#recordObj.oldState.isResizeable;
                    this.OnFullscreenChange.Dispatch(this, false);
                    this.UpdateAllSubComponent?.();
                }
            )
            .Add(
                [Event],
                /**
                 * 窗口退出全屏（由事件触发）
                 * @this {Window}
                 * @param {Event} e 事件
                 */
                function (e) {
                    return this.ExitFullScreen();
                }
            );

        Window.prototype.ExitFullScreen.call(this, ...params);
    }

    /**
     * 获取标题栏
     * @returns {HTMLElement} 标题栏
     */
    GetTitleBar() {
        return new Promise(resolve => {
            this.QueryComponent(".titleBar").then(el => {
                resolve(el);
            });
        });
    }

    static {
        // 注册组件
        Register(this, import.meta.url);

        // 指针移动处理函数
        document.addEventListener(
            "pointermove",
            e => {
                const win = Window.#activeWindow;
                if (!win) return;

                const { clientWidth, clientHeight } = document.body;
                const { clientX, clientY } = e;
                if (clientX < 0 || clientY < 0 || clientX >= clientWidth || clientY >= clientHeight) return;

                /**
                 * 处理窗口移动
                 */
                if (Window.#movingLastLocation) {
                    document.body.style.pointerEvents = "none";
                    let newX = Math.floor(clientX - Window.#movingLastLocation.X);
                    let newY = Math.floor(clientY - Window.#movingLastLocation.Y);
                    Window.#movingLastLocation.X = Math.floor(clientX);
                    Window.#movingLastLocation.Y = Math.floor(clientY);
                    win.Left += newX;
                    win.Top += newY;
                    Window.#activeWindow?.OnMove.Dispatch(Window.#activeWindow);
                }

                /**
                 * 处理窗口尺寸改变
                 */
                if (Window.#resizeFn) {
                    Window.#resizeFn(clientX, clientY);
                    Window.#activeWindow?.UpdateAllSubComponent?.();
                }
            },
            { passive: true }
        );

        // 指针抬起处理函数
        let pointerup = (e => {
            Window.#movingLastLocation = null;
            if (Window.#resizeFn) {
                Window.#resizeFn = null;
                Window.#activeWindow.OnResizeEnd.Dispatch(Window.#activeWindow);
            }
            document.body.style.pointerEvents = "";
            document.documentElement.style.cursor = "";
        }).bind(this);

        // 窗口移动结束
        document.addEventListener("pointerup", pointerup, { passive: true });

        // 窗口移动取消
        document.addEventListener("pointercancel", pointerup, { passive: true });

        // 窗口全屏状态改变
        document.addEventListener(
            "fullscreenchange",
            function () {
                if (!document.fullscreenElement) {
                    Window.#activeWindow?.ExitFullScreen();
                }
            },
            { passive: true }
        );

        Object.defineProperties(Window, {
            StartZIndex: {
                /**
                 * 获取窗口起始深度
                 * @returns {Number} 窗口起始深度
                 */
                get() {
                    return Window.#startZIndex;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置窗口起始深度
                     * @param {Number} value 窗口起始深度
                     */
                    function (value) {
                        Window.#startZIndex = value;
                        Window.#Resort();
                    }
                )
            }
        });
    }
}
