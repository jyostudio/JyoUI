import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";
import Collection from "@JyoUI/Common/Collection.js";
import Enum from "@JyoUI/Common/Enum.js";
import themeManager from "@JyoUI/Common/ThemeManager.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";
import "@JyoUI/Components/Styles/Acrylic/Acrylic.js";

/**
 * 更新标志
 * @enum
 */
class UpdateFlag extends Enum {
    static #none = new UpdateFlag(0);

    static #items = new UpdateFlag(1);

    static #dom = new UpdateFlag(2);

    static #all = new UpdateFlag(3);

    /**
     * 无
     * @returns {UpdateFlag}
     */
    static get None() {
        return this.#none;
    }

    /**
     * 集合
     * @returns {UpdateFlag}
     */
    static get Items() {
        return this.#items;
    }

    /**
     * DOM元素
     * @returns {UpdateFlag}
     */
    static get DOM() {
        return this.#dom;
    }

    /**
     * 全部
     * @returns {UpdateFlag}
     */
    static get All() {
        return this.#all;
    }
}

// #region 菜单

export default class MenuFlyout extends Basic {
    /**
     * 正在显示的菜单列表
     * @type {MenuFlyout[]}
     */
    static #showingMenuFlyouts = [];

    /**
     * 层级
     * @type {Number}
     */
    #layer = 0;

    /**
     * 目标
     * @type {HTMLElement?}
     */
    #target = null;

    /**
     * 是否显示
     * @type {Boolean}
     */
    #showing = false;

    /**
     * 是否为子菜单
     * @type {Boolean}
     */
    #isSubMenu = false;

    /**
     * 子项集合
     * @type {Collection<MenuFlyoutItemElement>}
     */
    #items = null;

    // 跳过更新标志
    #skipUpdateFlag = UpdateFlag.None;

    /**
     * 绑定事件
     * @type {Function?}
     */
    #bindEvent = null;

    /**
     * 菜单显示事件
     * @type {EventHandle}
     */
    #onShow = new EventHandle(this.AbortController);

    /**
     * 菜单隐藏事件
     * @type {EventHandle}
     */
    #onHide = new EventHandle(this.AbortController);

    constructor() {
        super();

        this.DefineProperties({
            IsShow: {
                /**
                 * 获取是否显示
                 * @this {MenuFlyout}
                 * @returns {Boolean} 是否显示
                 */
                get() {
                    return this.#showing;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否显示
                     * @this {MenuFlyout}
                     * @param {Boolean} value 是否显示
                     */
                    function (value) {
                        this.#showing = value;
                        this.Root.host.style.display = value ? "block" : "none";
                    }
                )
            },
            IsSubMenu: {
                /**
                 * 获取是否为子菜单
                 * @this {MenuFlyout}
                 * @returns {Boolean} 是否为子菜单
                 */
                get() {
                    return this.#isSubMenu;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否为子菜单
                     * @this {MenuFlyout}
                     * @param {Boolean} value 是否为子菜单
                     */
                    function (value) {
                        this.#isSubMenu = value;
                    }
                )
            },
            Target: {
                /**
                 * 获取目标
                 * @this {MenuFlyout}
                 * @returns {HTMLElement} 目标
                 */
                get() {
                    return this.#target;
                },
                set: MethodOverload().Add(
                    [[HTMLElement, null]],
                    /**
                     * 设置目标
                     * @this {MenuFlyout}
                     * @param {HTMLElement} value 目标
                     */
                    function (value) {
                        this.#target = value;
                    }
                )
            },
            Layer: {
                /**
                 * 获取层级
                 * @this {MenuFlyout}
                 * @returns {Nubmer} 层级
                 */
                get() {
                    return this.#layer;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置层级
                     * @this {MenuFlyout}
                     * @param {Number} value 层级
                     */
                    function (value) {
                        this.#layer = value;
                    }
                )
            },
            OnShow: {
                /**
                 * 获取菜单显示事件
                 * @this {MenuFlyout}
                 * @returns {EventHandle} 菜单显示事件
                 */
                get() {
                    return this.#onShow;
                },
                set: MethodOverload().Add(
                    [EventHandle],
                    /**
                     * 设置菜单显示事件
                     * @this {MenuFlyout}
                     * @param {EventHandle} value 菜单显示事件
                     */
                    function (value) {
                        this.#onShow = value;
                    }
                )
            },
            OnHide: {
                /**
                 * 获取菜单隐藏事件
                 * @this {MenuFlyout}
                 * @returns {EventHandle} 菜单隐藏事件
                 */
                get() {
                    return this.#onHide;
                },
                set: MethodOverload().Add(
                    [EventHandle],
                    /**
                     * 设置菜单隐藏事件
                     * @this {MenuFlyout}
                     * @param {EventHandle} value 菜单隐藏事件
                     */
                    function (value) {
                        this.#onHide = value;
                    }
                )
            }
        });
    }

    static Hide(...params) {
        MenuFlyout.Hide = MethodOverload().Add(
            [],
            /**
             * 隐藏当前显示的菜单
             */
            function () {
                MenuFlyout.#showingMenuFlyouts.forEach(el => {
                    el.OnHide.Dispatch();
                    el.remove();
                });
                MenuFlyout.#showingMenuFlyouts.length = 0;
            }
        );

        return MenuFlyout.Hide.call(this, ...params);
    }

    static KeepToLayer(...params) {
        MenuFlyout.KeepToLayer = MethodOverload().Add(
            [Number],
            /**
             * 保持显示到指定层级
             * @param {Number} layer 层级
             */
            function (layer) {
                MenuFlyout.#showingMenuFlyouts.forEach(el => {
                    if (el.Layer > layer) {
                        el.remove();
                    }
                });
            }
        );

        return MenuFlyout.KeepToLayer.call(this, ...params);
    }

    /**
     * 筛选出菜单项元素列表
     * @returns {MenuFlyoutItemElement[]} 菜单项元素列表
     */
    #FilterItems() {
        let items = [...this.children];
        let list = [];
        for (let i = 0; i < items.length; i++) {
            switch (items[i]?.tagName) {
                case MenuFlyoutItemElement.ComponentTagName:
                case MenuFlyoutSeparatorElement.ComponentTagName:
                case MenuFlyoutSubItemElement.ComponentTagName:
                case RadioMenuFlyoutItemElement.ComponentTagName:
                case ToggleMenuFlyoutItemElement.ComponentTagName:
                    list.push(items[i]);
                    break;
            }
        }
        return list;
    }

    /**
     * 更新集合
     */
    #UpdateItems() {
        if (this.#skipUpdateFlag & UpdateFlag.Items) {
            return;
        }
        this.#skipUpdateFlag |= UpdateFlag.Items;

        this.#FilterItems().forEach(el => el.remove());

        for (let i = 0; i < this.#items.Count; i++) {
            this.appendChild(this.#items[i]);
        }
        this.#skipUpdateFlag &= ~UpdateFlag.Items;
    }

    /**
     * 更新DOM元素
     */
    #UpdateDom() {
        if ((this.#skipUpdateFlag & UpdateFlag.DOM) == UpdateFlag.DOM) {
            return;
        }
        this.#skipUpdateFlag |= UpdateFlag.Items;
        this.#items.Clear();

        this.#items.AddRange(this.#FilterItems());

        this.#skipUpdateFlag &= ~UpdateFlag.Items;
    }

    async Load() {
        await super.Load();

        if (!this.#showing) {
            if (this.constructor === MenuFlyout) {
                this.#bindEvent = e => {
                    if (this.IsDisposed) return;
                    e.preventDefault();
                    e.stopPropagation();
                    this.Target = this.Target ?? this.parentElement;
                    this.Show(e.clientX, e.clientY);
                };
                this.parentElement?.addEventListener("contextmenu", this.#bindEvent);
            }
            this.Root.host.style.display = "none";
        }
        this.addEventListener("contextmenu", e => e.preventDefault());
        this.#items = new Collection(HTMLElement);
        this.OnDOMChange.Bind(this.#UpdateDom.bind(this));
        this.#items.OnChange.Bind(this.#UpdateItems.bind(this));

        this.#UpdateDom();
    }

    async Update() {
        await super.Update();
        await this.WaitLoad();

        this.QueryComponent(".acrylic")
            .then(el => {
                el.TintColor = themeManager.PrimaryColor;
                el.Deactivate = false;
            })
            .catch(() => {});
    }

    async Unload() {
        await super.Unload();

        this.parentElement?.removeEventListener("contextmenu", this.#bindEvent);

        this.#items?.OnChange.Clear();
        this.#items?.Clear();
    }

    Show(...params) {
        MenuFlyout.prototype.Show = MethodOverload().Add(
            [Number, Number],
            /**
             * 将当前菜单展示到屏幕上的某个位置
             * @param {Number} x 屏幕上的X坐标
             * @param {Number} y 屏幕上的Y坐标
             */
            function (x, y) {
                if (!this.IsSubMenu) this.Hide();
                const clone = this.Copy();
                clone.IsShow = true;
                clone.ForceParent = this.Parent;
                clone.Target = this.Target;
                clone.style.cssText = `left: -${globalThis.screen.width}px; top: -${globalThis.screen.height}px;`;
                this.Root.querySelectorAll("*").forEach(el => {
                    el.Target = this.Target;
                });
                document.body.appendChild(clone);
                globalThis.requestIdleCallback(() => {
                    if (this.IsSubMenu) {
                        let parent = this.parentElement;
                        const BIND_LIST = [MenuFlyout.ComponentTagName, "JYO-MENU-BAR-ITEM"];
                        while (parent && !BIND_LIST.includes(parent?.tagName)) {
                            parent = parent.parentElement;
                        }
                        if (!parent) return;
                        const parentRect = parent.getBoundingClientRect();
                        const rect = clone.getBoundingClientRect();
                        if (x + rect.width > document.body.clientWidth) {
                            x = parentRect.x - rect.width;
                        }
                        if (y > document.body.clientHeight - rect.height) {
                            y = document.body.clientHeight - rect.height;
                        }
                    } else {
                        const rect = clone.getBoundingClientRect();
                        if (x > document.body.clientWidth - rect.width) {
                            x = document.body.clientWidth - rect.width;
                        }
                        if (y > document.body.clientHeight - rect.height) {
                            y = document.body.clientHeight - rect.height;
                        }
                    }
                    clone.style.cssText = `left: ${x}px; top: ${y}px;`;
                    requestAnimationFrame(() => {
                        clone.style.cssText += `opacity:1`;
                    });
                });
                MenuFlyout.#showingMenuFlyouts.push(clone);
                this.OnShow.Dispatch();
                return clone;
            }
        );

        return MenuFlyout.prototype.Show.call(this, ...params);
    }

    Hide(...params) {
        MenuFlyout.prototype.Hide = MethodOverload().Add(
            [],
            /**
             * 隐藏当前菜单
             */
            function () {
                if (MenuFlyout.#showingMenuFlyouts.find(el => el === this)) {
                    MenuFlyout.Hide();
                }
            }
        );

        return MenuFlyout.prototype.Hide.call(this, ...params);
    }

    static {
        Register(this, import.meta.url, {
            template: true,
            style: true
        });

        document.body.addEventListener("pointerdown", function (e) {
            let target = e.target;
            const BIND_LIST = [MenuFlyout.ComponentTagName, "JYO-MENU-BAR-ITEM"];
            while (target) {
                if (BIND_LIST.includes(target?.tagName)) {
                    return;
                }
                target = target.parentElement;
            }
            MenuFlyout.Hide();
        });
    }
}

// #endregion

// #region 菜单项

class MenuFlyoutItemElement extends Basic {
    /**
     * 文本元素
     * @type {HTMLElement}
     */
    #textEl = null;

    /**
     * 图标元素
     * @type {HTMLElement}
     */
    #iconEl = null;

    /**
     * 更多元素
     * @type {HTMLElement}
     */
    #moreEl = null;

    /**
     * 绑定的弹出菜单元素
     * @type {MenuFlyout?}
     */
    #bindMenuFlyout = null;

    /**
     * 图标
     * @type {String}
     */
    #icon = "";

    /**
     * 文本
     * @type {String}
     */
    #text = "";

    /**
     * 是否禁用
     * @type {Boolean}
     */
    #disabled = false;

    /**
     * 父级
     * @type {HTMLElement?}
     */
    #parent = null;

    /**
     * 保持显示计时器
     * @type {Number?}
     */
    #keepTimer = null;

    /**
     * 获取绑定的弹出菜单元素
     * @returns {MenuFlyout?} 弹出菜单元素
     */
    get BindMenuFlyout() {
        return this.#bindMenuFlyout;
    }

    constructor() {
        super();

        this.DefineProperties({
            Text: {
                /**
                 * 获取文本
                 * @this {MenuFlyoutItemElement}
                 * @returns {String} 文本
                 */
                get() {
                    return this.#text;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置文本
                     * @this {MenuFlyoutItemElement}
                     * @param {String} value 文本
                     */
                    function (value) {
                        this.#text = value;
                        if (!this.#textEl) return;
                        this.#textEl.innerText = value;
                        Basic.SetPropertyValueById(this.Id, "Text", value);
                    }
                )
            },
            Icon: {
                /**
                 * 获取图标
                 * @this {MenuFlyoutItemElement}
                 * @returns {String} 图标
                 */
                get() {
                    return this.#icon;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置图标
                     * @this {MenuFlyoutItemElement}
                     * @param {String} value 图标
                     */
                    function (value) {
                        if (value) {
                            if (!/https?:\/\//.test(value)) {
                                value = Basic.GetAbsolutePath(this.#parent?.Root?.host?.baseURI, value);
                            }
                            this.#iconEl?.style?.setProperty?.("--background-image", `url(${value})`);
                            this.#iconEl?.style?.setProperty?.("visibility", `visible`);
                        } else {
                            this.#iconEl?.style?.setProperty?.("--background-image", ``);
                            this.#iconEl?.style?.setProperty?.("visibility", `hidden`);
                        }
                        Basic.SetPropertyValueById(this.Id, "Icon", value);
                        this.parentElement?.UpdateAllSubComponent?.();
                        this.#icon = value;
                    }
                )
            },
            Disabled: {
                /**
                 * 获取是否禁用
                 * @this {MenuFlyoutItemElement}
                 * @returns {Boolean} 是否禁用
                 */
                get() {
                    return this.#disabled;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否禁用
                     * @this {MenuFlyoutItemElement}
                     * @param {Boolean} value 是否禁用
                     */
                    value => {
                        if (value) {
                            this.style.setProperty("pointer-events", "none");
                            this.style.setProperty("opacity", "0.5");
                        } else {
                            this.style.removeProperty("pointer-events");
                            this.style.removeProperty("opacity");
                        }
                        this.#disabled = value;
                    }
                )
            }
        });
    }

    Load() {
        super.Load();

        this.#textEl = this.Root.querySelector(".text");
        this.#iconEl = this.Root.querySelector(".icon");
        this.#moreEl = this.Root.querySelector(".more");

        let target = null;
        let parent = this.Parent;
        const BIND_LIST = [MenuFlyout.ComponentTagName, "JYO-MENU-BAR-ITEM"];
        while (parent && (BIND_LIST.includes(parent?.tagName) || parent?.tagName === MenuFlyoutItemElement.ComponentTagName)) {
            if (!target && BIND_LIST.includes(parent?.tagName)) {
                target = parent.Target;
                this.#bindMenuFlyout = parent;
            }
            parent = parent.Parent;
        }
        this.#parent = parent;

        this.Icon = this.Icon;

        this.addEventListener("click", e => {
            MenuFlyout.Hide();
        });

        this.addEventListener("pointerleave", e => {
            if (this.#keepTimer) {
                clearTimeout(this.#keepTimer);
                this.#keepTimer = null;
            }
        });

        this.addEventListener("pointerenter", e => {
            this.#keepTimer = setTimeout(async () => {
                if (this instanceof MenuFlyoutSubItemElement) {
                    this.click();
                    MenuFlyout.KeepToLayer(this.#bindMenuFlyout.Layer + 1);
                } else if (this.#bindMenuFlyout) {
                    MenuFlyout.KeepToLayer(this.#bindMenuFlyout.Layer);
                }
            }, 400);
        });
    }

    Update() {
        super.Update();

        this.#iconEl?.style?.setProperty?.(
            "display",
            this.parentElement?.Where?.(el => {
                if (el.Icon || el?.tagName === RadioMenuFlyoutItemElement.ComponentTagName || el.tagName === ToggleMenuFlyoutItemElement.ComponentTagName) {
                    return true;
                }
            }).length
                ? "inline-block"
                : "none"
        );
        this.#moreEl?.style?.setProperty?.("display", this.parentElement?.Where?.(el => el.tagName === MenuFlyoutSubItemElement.ComponentTagName).length ? "inline-block" : "none");
    }

    static {
        Register(this, import.meta.url, {
            name: "menu-flyout-item",
            template: true,
            style: true
        });
    }
}

export class MenuFlyoutItem {
    constructor() {
        return document.createElement("jyo-menu-flyout-item");
    }
}

// #endregion

// #region 子菜单项

class MenuFlyoutSubItemElement extends MenuFlyoutItemElement {
    static #icon = Basic.GetAbsolutePath(import.meta.url, "./Images/More.png");

    /**
     * 更多元素
     * @type {HTMLElement}
     */
    #moreEl = null;

    /**
     * 子菜单
     * @type {MenuFlyout?}
     */
    #subMenuFlyout = null;

    /**
     * 是否正在显示子菜单
     * @type {Boolean}
     */
    #isShowingSubMenu = false;

    Load() {
        super.Load();
        this.#moreEl = this.Root.querySelector(".more");
        this.#moreEl.style.setProperty("--background-image", `url(${MenuFlyoutSubItemElement.#icon})`);

        this.addEventListener(
            "contextmenu",
            e => {
                e.preventDefault();
                e.stopPropagation();
            },
            true
        );

        this.addEventListener(
            "click",
            async e => {
                e.stopPropagation();
                if (this.#isShowingSubMenu || !this.#subMenuFlyout) return;
                this.#isShowingSubMenu = true;
                const rect = this.getBoundingClientRect();
                const subMenu = this.#subMenuFlyout.Show(rect.x + rect.width, rect.y);
                subMenu.Layer = this.BindMenuFlyout.Layer + 1;
                const oldSubMenuUnload = subMenu.Unload;
                subMenu.Unload = (...params) => {
                    this.#isShowingSubMenu = false;
                    oldSubMenuUnload.call(subMenu, ...params);
                };
            },
            true
        );
    }

    async Update() {
        await this.WaitLoad();

        if (!this.#subMenuFlyout) {
            this.#subMenuFlyout = this.Where(el => el.tagName === MenuFlyout.ComponentTagName)?.[0];
            if (this.#subMenuFlyout) {
                this.#subMenuFlyout.IsSubMenu = true;
                this.#subMenuFlyout.Target = this.BindMenuFlyout;
            }
        }

        this.#moreEl?.style?.setProperty?.("opacity", this.#subMenuFlyout ? 1 : 0.2);
    }

    static {
        Register(this, import.meta.url, {
            name: "menu-flyout-sub-item",
            template: new URL("./MenuFlyoutItemElement.html", import.meta.url),
            style: new URL("./MenuFlyoutItemElement.css", import.meta.url)
        });
    }
}

export class MenuFlyoutSubItem extends MenuFlyoutItem {
    constructor() {
        return document.createElement("jyo-menu-flyout-sub-item");
    }
}

// #endregion

// #region 分隔符

class MenuFlyoutSeparatorElement extends MenuFlyoutItemElement {
    Load() {}

    Update() {}

    static {
        Register(this, import.meta.url, {
            name: "menu-flyout-separator",
            template: "<div class='frame'></div>",
            style: true
        });
    }
}

export class MenuFlyoutSeparator extends MenuFlyoutItem {
    constructor() {
        return document.createElement("jyo-menu-flyout-separator");
    }
}

// #endregion

// #region 切换菜单项

class ToggleMenuFlyoutItemElement extends MenuFlyoutItemElement {
    static #checkedIcon = Basic.GetAbsolutePath(import.meta.url, "./Images/ToggleChecked.png");

    constructor() {
        super();

        this.DefineProperties({
            IsChecked: {
                /**
                 * 获取是否选中
                 * @this {ToggleMenuFlyoutItemElement}
                 * @returns {Boolean} 是否选中
                 */
                get() {
                    return this.Icon === ToggleMenuFlyoutItemElement.#checkedIcon;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否选中
                     * @this {ToggleMenuFlyoutItemElement}
                     * @param {Boolean} value 是否选中
                     */
                    value => {
                        this.Icon = value ? ToggleMenuFlyoutItemElement.#checkedIcon : "";
                        this.Root.host.setAttribute("is-checked", value);
                        Basic.SetPropertyValueById(this.Id, "IsChecked", value);
                    }
                )
            }
        });
    }

    Load() {
        super.Load();
        this.addEventListener(
            "click",
            e => {
                this.IsChecked = !this.IsChecked;
            },
            true
        );
    }

    static {
        Register(this, import.meta.url, {
            name: "toggle-menu-flyout-item",
            template: new URL("./MenuFlyoutItemElement.html", import.meta.url),
            style: new URL("./MenuFlyoutItemElement.css", import.meta.url)
        });
    }
}

export class ToggleMenuFlyoutItem extends MenuFlyoutItem {
    constructor() {
        return document.createElement("jyo-toggle-menu-flyout-item");
    }
}

// #endregion

// #region 单选菜单项

class RadioMenuFlyoutItemElement extends MenuFlyoutItemElement {
    static #checkedIcon = Basic.GetAbsolutePath(import.meta.url, "./Images/RadioChecked.png");

    #groupName = "default";

    constructor() {
        super();

        this.DefineProperties({
            IsChecked: {
                /**
                 * 获取是否选中
                 * @this {RadioMenuFlyoutItemElement}
                 * @returns {Boolean} 是否选中
                 */
                get() {
                    return this.Icon === RadioMenuFlyoutItemElement.#checkedIcon;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否选中
                     * @this {RadioMenuFlyoutItemElement}
                     * @param {Boolean} value 是否选中
                     */
                    value => {
                        if (value === this.IsChecked) return;

                        if (value) {
                            let parent = this.Parent;
                            const BIND_LIST = [MenuFlyout.ComponentTagName, "JYO-MENU-BAR-ITEM"];
                            while (parent && !BIND_LIST.includes(parent.tagName)) {
                                parent = parent.Parent;
                            }
                            if (!parent) return;

                            const group = this.#groupName;
                            parent
                                .Where(el => el.tagName === RadioMenuFlyoutItemElement.ComponentTagName && el.GroupName === group && el.parentElement === this.parentElement)
                                .forEach(el => {
                                    el.IsChecked = false;
                                });
                        }

                        this.Icon = value ? RadioMenuFlyoutItemElement.#checkedIcon : "";
                        this.Root.host.setAttribute("is-checked", value);
                        Basic.SetPropertyValueById(this.Id, "IsChecked", value);
                    }
                )
            },
            GroupName: {
                /**
                 * 获取组名
                 * @this {RadioMenuFlyoutItemElement}
                 * @returns {String} 组名
                 */
                get() {
                    return this.#groupName;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置组名
                     * @this {RadioMenuFlyoutItemElement}
                     * @param {String} value 组名
                     */
                    value => {
                        if (value === this.#groupName) return;
                        this.#groupName = value;
                        this.Debouncing(this.Update.bind(this));
                    }
                )
            }
        });
    }

    Load() {
        super.Load();
        this.addEventListener(
            "click",
            e => {
                this.IsChecked = true;
            },
            true
        );
    }

    static {
        Register(this, import.meta.url, {
            name: "radio-menu-flyout-item",
            template: new URL("./MenuFlyoutItemElement.html", import.meta.url),
            style: new URL("./MenuFlyoutItemElement.css", import.meta.url)
        });
    }
}

export class RadioMenuFlyoutItem extends MenuFlyoutItem {
    constructor() {
        return document.createElement("jyo-radio-menu-flyout-item");
    }
}

// #endregion
