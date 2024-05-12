import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";
import Window from "@JyoUI/Components/Window/Window.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";
import Collection from "@JyoUI/Common/Collection.js";
import "@JyoUI/Components/MenuFlyout/MenuFlyout.js";
import "@JyoUI/Components/Page/Page.js";

/**
 * 选项卡视图组件
 * @extends Basic
 * @class
 */
export default class TabView extends Basic {
    /**
     * 窗口标题栏元素
     * @type {HTMLElement}
     */
    #windowTitleBarEl = null;

    /**
     * 选项卡视图元素
     * @type {HTMLElement}
     */
    #tabViewEl = null;

    /**
     * 选项卡视图头部元素
     * @type {HTMLElement}
     */
    #tabViewHeaderEl = null;

    /**
     * 选项卡视图项元素
     * @type {HTMLElement}
     */
    #tabItemsEl = null;

    /**
     * 左箭头按钮元素
     * @type {HTMLElement}
     */
    #btnArrowLeftEl = null;

    /**
     * 右箭头按钮元素
     * @type {HTMLElement}
     */
    #btnArrowRightEl = null;

    /**
     * 添加选项卡视图项按钮元素
     * @type {HTMLElement}
     */
    #btnAddEl = null;

    /**
     * 内容元素
     * @type {HTMLElement}
     */
    #contentEl = null;

    /**
     * 是否禁用添加选项卡视图项
     * @type {Boolean}
     */
    #disableAdd = false;

    /**
     * 选项卡视图项集合
     * @type {TabViewCollection}
     */
    #tabItems = new TabViewCollection();

    /**
     * 选项卡视图项元素集合
     * @type {HTMLElement[]}
     */
    #tabItemEls = [];

    /**
     * 选项卡视图项添加事件处理
     * @type {EventHandle}
     */
    #onAddTab = new EventHandle(this.AbortController);

    /**
     * 选项卡视图项关闭事件处理
     * @type {EventHandle}
     */
    #onTabClose = new EventHandle(this.AbortController);

    /**
     * 选项卡视图项已关闭事件处理
     * @type {EventHandle}
     */
    #onTabClosed = new EventHandle(this.AbortController);

    /**
     * 获取激活的选项卡视图项元素
     * @returns {HTMLElement | undefined} 选项卡视图项元素
     */
    get ActiveItem() {
        return this.#tabItemsEl.querySelector(".active");
    }

    /**
     * 获取选项卡视图项集合
     * @returns {TabViewCollection} 选项卡视图项集合
     */
    get TabItems() {
        return this.#tabItems;
    }

    /**
     * 获取选项卡视图项添加事件处理
     * @returns {EventHandle} 选项卡视图项添加事件处理
     */
    get OnAddTab() {
        return this.#onAddTab;
    }

    /**
     * 获取选项卡视图项关闭事件处理
     * @returns {EventHandle} 选项卡视图项关闭事件处理
     */
    get OnTabClose() {
        return this.#onTabClose;
    }

    /**
     * 获取选项卡视图项已关闭事件处理
     * @returns {EventHandle} 选项卡视图项已关闭事件处理
     */
    get OnTabClosed() {
        return this.#onTabClosed;
    }

    /**
     * 选项卡视图组件构造函数
     * @constructor
     * @returns {TabView} 选项卡视图组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            DisableAdd: {
                /**
                 * 获取是否禁用添加选项卡视图项
                 * @this {TabView}
                 * @returns {Boolean} 是否禁用添加选项卡视图项
                 */
                get() {
                    return this.#disableAdd;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否禁用添加选项卡视图项
                     * @this {TabView}
                     * @param {Boolean} value 是否禁用添加选项卡视图项
                     */
                    function (value) {
                        this.#disableAdd = value;
                    }
                )
            }
        });

        this.#tabItems.OnChange.Bind(this.#CheckTabItems.bind(this));
    }

    /**
     * 注册CSS画布工作线程
     */
    static #RegisterCssPaintWorklet() {
        const blob = new Blob([
            `class TabItemBgPainter {
                static get inputProperties() {
                    return ["--color", "--radius", "--small"];
                }
            
                fillBg(ctx, x, y, w, h, r) {
                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.arcTo(x + w, y, x + w, y + h, r);
                    ctx.lineTo(x + w, y + h);
                    ctx.lineTo(x, y + h);
                    ctx.arcTo(x, y, x + w, y, r);
                    ctx.closePath();
                    ctx.fill();
                }
            
                /**
                 * 绘制
                 * @param {CanvasRenderingContext2D} ctx 2D上下文
                 * @param {Object} size 尺寸
                 * @param {Object} properties 属性
                 */
                paint(ctx, size, properties) {
                    const padding = 5;
                    const c = properties.get("--color");
                    const r = properties.get("--radius");
                    const s = properties.get("--small").length;
                    let l = 0;
                    let t = 0;
                    let w = size.width;
                    let h = size.height;
                    if (s) {
                        l = 1;
                        t = 0;
                        w -= 2;
                        h -= 1;
                    }
                    ctx.fillStyle = c;
                    this.fillBg(ctx, l + padding, t, w - padding * 2, h, r);
                    if (s) return;
                    ctx.beginPath();
                    ctx.moveTo(l + padding, t + h - padding);
                    ctx.quadraticCurveTo(l + padding, t + h, l, t + h);
                    ctx.lineTo(l + padding, t + h);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(l + w - padding, t + h - padding);
                    ctx.quadraticCurveTo(l + w - padding, t + h, l + w, t + h);
                    ctx.lineTo(l + w - padding, t + h);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            registerPaint("jyo-tab-view-item-bg", TabItemBgPainter);`
        ], { type: "text/javascript" });
        CSS?.paintWorklet?.addModule?.(URL.createObjectURL(blob));
    }

    /**
     * 组件加载时调用
     */
    async Load() {
        this.#tabViewEl = this.Root.querySelector(".tabView");
        this.#tabViewHeaderEl = this.Root.querySelector(".tabView .header");
        this.#tabItemsEl = this.#tabViewHeaderEl.querySelector(".tabItems");
        this.#btnArrowLeftEl = this.#tabViewHeaderEl.querySelector(".btnArrowLeft");
        this.#btnArrowRightEl = this.#tabViewHeaderEl.querySelector(".btnArrowRight");
        this.#btnAddEl = this.#tabViewHeaderEl.querySelector(".btnAdd");
        this.#contentEl = this.#tabViewEl.querySelector(".content");
    }

    /**
     * 组件更新数据时调用
     */
    async Update() {
        await this.WaitLoad();

        if (this.Parent instanceof Window && !this.Parent.HasHideTitleBar) {
            if (!this.#windowTitleBarEl) {
                this.#windowTitleBarEl = await this.Parent.GetTitleBar();
            }
            const titleBarHeight = this.#windowTitleBarEl.offsetHeight;
            this.#tabViewEl.style.top = `-${titleBarHeight}px`;
            this.#tabViewEl.style.height = `calc(100% + ${titleBarHeight}px)`;
            const functionAreaWidth = this.#windowTitleBarEl.FunctionAreaWidth;
            this.#tabViewHeaderEl.style.width = `calc(100% - ${(functionAreaWidth + functionAreaWidth / 5) | 0}px)`;
        } else {
            this.#tabViewEl.style.top = "0px";
            this.#tabViewEl.style.height = "100%";
            this.#tabViewHeaderEl.style.width = "100%";
        }

        this.#btnAddEl.style.display = this.#disableAdd ? "none" : "block";

        await this.UpdateAllSubComponent();

        globalThis.requestIdleCallback(() => {
            if (this.#tabItemsEl.scrollWidth - 1 > this.#tabItemsEl.clientWidth) {
                this.#btnArrowLeftEl.style.display = "block";
                this.#btnArrowRightEl.style.display = "block";
            } else {
                this.#btnArrowLeftEl.style.display = "none";
                this.#btnArrowRightEl.style.display = "none";
            }

            this.Debouncing(this.#CheckArrow, 300);
            globalThis.requestIdleCallback(() => this.ActiveItem?.click());
        });
    }

    /**
     * 检查选项卡视图项元素是否一致
     */
    async #CheckTabItems(sender, e) {
        await this.WaitLoad();

        if (e.type === "clear") {
            this.#tabItemEls.forEach(el => el.remove());
            this.#tabItemEls = [];
        } else if (e.type === "add") {
            const item = e.item;
            const tabItemEl = document.createElement("div");
            tabItemEl.classList.add("tabItem");
            tabItemEl.classList.add("active");
            if (!item.IconSource && !item.CanClose) {
                tabItemEl.classList.add("noIconAndClose");
            } else if (!item.IconSource) {
                tabItemEl.classList.add("noIcon");
            } else if (!item.CanClose) {
                tabItemEl.classList.add("noClose");
            }
            tabItemEl.dataset.onClick = "ClickTabItem";
            tabItemEl.Id = item.Id;
            tabItemEl.title = item.Header;
            tabItemEl.innerHTML = `
                ${item.IconSource ? '<img class="icon" style="--background: url(' + item.IconSource + ')" />' : ""}
                <div class="title">${item.Header}</div>
            `;
            if (item.CanClose) {
                tabItemEl.innerHTML += `
                    <div class="btn close" data-on-click="ClickCloseTabItem" title="关闭"></div>
                    <jyo-menu-flyout>
                        <jyo-menu-flyout-item text="关闭标签页" data-on-click="ClickCloseTabItemFlyout"></jyo-menu-flyout-item>
                    </jyo-menu-flyout>
                `;
                tabItemEl.querySelector("jyo-menu-flyout-item").Id = item.Id;
            }
            this.#tabItemsEl.appendChild(tabItemEl);
            this.#tabItemEls.push(tabItemEl);
            item.BindEl = tabItemEl;
            item.BindTabView = this;
            item.Content.BindId = item.Id;
            this.#contentEl.appendChild(item.Content);
            this.ClickTabItem({ Target: tabItemEl });
        } else if (e.type === "remove") {
            const item = e.item;
            const tabItemEl = this.#tabItemEls.find(el => el.Id === item.Id);
            if (tabItemEl) {
                if (
                    !(await this.CloseEventHandel(tabItemEl, () => {
                        tabItemEl.remove();
                        this.#tabItemEls.splice(this.#tabItemEls.indexOf(tabItemEl), 1);
                        this.#tabItemEls[this.#tabItemEls.length - 1]?.click();
                    }))
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 选项卡视图项滚动事件处理
     * @param {Event} e 事件参数
     */
    ScrollItems(e) {
        e.preventDefault();

        e.Target.scrollBy({ left: e.deltaY, behavior: "smooth" });
        this.Debouncing(this.#CheckArrow, 300);
    }

    /**
     * 系统移动事件处理
     * @param {Event} e 事件参数
     */
    SystemMoveHandle(e) {
        this.Parent?.MoveBegin?.(e);
    }

    /**
     * 点击最大化或还原
     */
    ClickMaxOrRestore() {
        if (this.Parent?.WindowState === Window.WindowState.Maximized) {
            this.Parent?.Restore?.();
        } else {
            this.Parent?.Maximize?.();
        }
    }

    /**
     * 点击选项卡视图项
     * @param {Event} e 事件参数
     */
    ClickTabItem(e) {
        const tabItems = this.#tabItemsEl.querySelectorAll(".tabItem");
        tabItems.forEach(el => {
            el.classList.remove("active");
            el.classList.remove("hideBar");
        });
        e.Target.classList.add("active");
        e.Target.previousElementSibling?.classList.add("hideBar");
        e.Target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        this.Debouncing(this.#CheckArrow, 300);

        const contents = Array.from(this.#contentEl.children);
        contents.forEach(el => {
            if (el.BindId === e.Target.Id) {
                el.style.display = "block";
            } else {
                el.style.display = "none";
            }
        });
    }

    /**
     * 关闭事件处理器
     * @param {HTMLElement} el 元素
     * @param {Function} fn 所需操作函数
     * @returns {Boolean} 是否已关闭
     */
    async CloseEventHandel(el, fn) {
        let obj = { target: el, cancel: false };
        await this.OnTabClose.Dispatch(this, obj);
        if (obj.cancel) return false;
        await fn?.apply(this);
        await this.OnTabClosed.Dispatch(this, obj);
        return true;
    }

    /**
     * 点击关闭选项卡视图项
     * @param {Event} e 事件参数
     */
    async ClickCloseTabItem(e) {
        if (!e.Target) return;
        e?.stopPropagation?.();
        const contents = Array.from(this.#contentEl.children);
        contents.forEach(el => {
            if (el.BindId === e.Target.parentElement.Id) {
                el.remove();
            }
        });
        for (let i = 0; i < this.#tabItemEls.length; i++) {
            const el = this.#tabItemEls[i];
            const item = this.#tabItems[i];
            if (!el || !item) continue;
            if (el.Id === e.Target.parentElement.Id) {
                if (
                    !(await this.CloseEventHandel(el, async () => {
                        await this.#tabItems.Remove(item);
                        await this.Update();
                    }))
                )
                    return;
                break;
            }
        }
    }

    /**
     * 通过弹出菜单关闭选项卡视图项
     * @param {Event} e 事件参数
     */
    ClickCloseTabItemFlyout(e) {
        this.ClickCloseTabItem({ Target: { parentElement: { Id: e.Target?.Id } } });
    }

    /**
     * 点击箭头按钮
     * @param {Event} e 事件参数
     */
    ClickArrow(e) {
        if (e.Target.classList.contains("disabled")) {
            return;
        }
        this.#tabItemsEl.scrollBy({ left: e.Target.dataset.move, behavior: "smooth" });
        this.Debouncing(this.#CheckArrow, 300);
    }

    /**
     * 点击添加选项卡视图项
     * @param {Event} e 事件参数
     */
    async ClickAdd(e) {
        await this.OnAddTab.Dispatch(this);
        this.Update();
    }

    /**
     * 检查箭头按钮状态
     */
    #CheckArrow() {
        this.#btnArrowLeftEl.classList.remove("disabled");
        this.#btnArrowRightEl.classList.remove("disabled");
        if (this.#tabItemsEl.scrollLeft === 0) {
            this.#btnArrowLeftEl.classList.add("disabled");
        }
        if (this.#tabItemsEl.scrollLeft + this.#tabItemsEl.clientWidth + 1 >= this.#tabItemsEl.scrollWidth) {
            this.#btnArrowRightEl.classList.add("disabled");
        }
    }

    static {
        globalThis.requestIdleCallback(() => {
            this.#RegisterCssPaintWorklet();
        });

        // 注册组件
        Register(this, import.meta.url);
    }
}

/**
 * 选项卡视图项组件
 * @extends Base
 * @class
 */
export class TabViewItem extends Base {
    // 唯一标识
    #id = Symbol(new Date().getTime().toString(36) + "-" + Math.random().toString(36).substr(2, 9));

    /**
     * 图标源
     * @type {String}
     */
    #iconSource = null;

    /**
     * 标题
     * @type {String}
     */
    #header = "未命名";

    /**
     * 是否可关闭
     * @type {Boolean}
     */
    #canClose = true;

    /**
     * 内容
     * @type {HTMLElement}
     */
    #content = document.createElement("jyo-page");

    /**
     * 绑定的选项卡
     * @type {TabView}
     */
    #bindTabView = null;

    /**
     * 绑定元素
     * @type {HTMLElement}
     */
    #bindEl = null;

    /**
     * 获取唯一标识
     * @returns {Symbol} 唯一标识
     */
    get Id() {
        return this.#id;
    }

    /**
     * 设置绑定元素
     * @param {HTMLElement} value 绑定元素
     */
    set BindEl(value) {
        this.#bindEl = value;
    }

    /**
     * 设置绑定的选项卡
     * @param {TabView} value 绑定的选项卡
     */
    set BindTabView(value) {
        this.#bindTabView = value;
    }

    constructor() {
        super();

        Base.DefineProperties(this, {
            IconSource: {
                /**
                 * 获取图标源
                 * @this {TabViewItem}
                 * @returns {String} 图标源
                 */
                get() {
                    return this.#iconSource;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置图标源
                     * @this {TabViewItem}
                     * @param {String} value 图标源
                     */
                    function (value) {
                        this.#iconSource = value;
                        if (this.#bindEl) {
                            this.#bindEl.querySelector(".icon").style.setProperty("--background", `url(${value})`);
                        }
                    }
                )
            },
            CanClose: {
                /**
                 * 获取是否可关闭
                 * @this {TabViewItem}
                 * @returns {Boolean} 是否可关闭
                 */
                get() {
                    return this.#canClose;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否可关闭
                     * @this {TabViewItem}
                     * @param {Boolean} value 是否可关闭
                     */
                    function (value) {
                        this.#canClose = value;
                        if (this.#bindEl) {
                            this.#bindEl.querySelector(".btn.close").style.display = value ? "block" : "none";
                        }
                    }
                )
            },
            Header: {
                /**
                 * 获取标题
                 * @this {TabViewItem}
                 * @returns {String} 标题
                 */
                get() {
                    return this.#header;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置标题
                     * @this {TabViewItem}
                     * @param {String} value 标题
                     */
                    function (value) {
                        this.#header = value;
                        if (this.#bindEl) {
                            this.#bindEl.title = value;
                            this.#bindEl.querySelector(".title").innerHTML = value;
                        }
                    }
                )
            },
            Content: {
                /**
                 * 获取内容
                 * @this {TabViewItem}
                 * @returns {HTMLElement} 内容
                 */
                get() {
                    return this.#content;
                },
                set: MethodOverload().Add(
                    [HTMLElement],
                    /**
                     * 设置内容
                     * @this {TabViewItem}
                     * @param {HTMLElement} value 内容
                     */
                    function (value) {
                        value.BindId = this.#id;
                        value.Id = Symbol();
                        this.#content?.parentElement?.replaceChild(value, this.#content);
                        this.#content = value;
                    }
                )
            }
        });
    }

    /**
     * 关闭选项卡
     */
    Close() {
        this.#bindTabView.ClickCloseTabItem({ Target: { parentElement: { Id: this.#bindEl.Id } } });
    }
}

/**
 * 选项卡视图项集合
 * @extends Collection
 * @class
 */
class TabViewCollection extends Collection {
    constructor() {
        super(TabViewItem);
    }
}
