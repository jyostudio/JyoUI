import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";
import MenuFlyout from "@JyoUI/Components/MenuFlyout/MenuFlyout.js";
import "@JyoUI/Components/Styles/Acrylic/Acrylic.js";

export default class MenuBar extends Basic {
    /**
     * 正在显示的项
     * @type {MenuBarItem}
     */
    #showingItem = null;

    constructor() {
        super();

        this.DefineProperties({
            ShowingItem: {
                /**
                 * 获取正在显示的项
                 * @this {MenuBar}
                 * @returns {MenuBarItem}
                 */
                get() {
                    return this.#showingItem;
                },
                set: MethodOverload().Add(
                    [[MenuBarItem, null]],
                    /**
                     * 设置正在显示的项
                     * @this {MenuBar}
                     * @param {MenuBarItem} value 正在显示的项
                     */
                    function (value) {
                        if (!value && this.#showingItem?.BindMenuBarItemElement) {
                            this.#showingItem.BindMenuBarItemElement.IsActive = false;
                        } else if (value?.BindMenuBarItemElement) {
                            value.BindMenuBarItemElement.IsActive = true;
                        }
                        this.#showingItem = value;
                    }
                )
            }
        });
    }

    static {
        Register(this, import.meta.url, {
            template: `<div><slot></slot></div>`,
            style: true
        });
    }
}

class MenuBarItemElement extends Basic {
    /**
     * 绑定的菜单项元素
     * @type {MenuBarItem?}
     */
    #bindMenuBarItem = null;

    /**
     * 框架元素
     * @type {HTMLElement?}
     */
    #frameEl = null;

    /**
     * 标题元素
     * @type {HTMLElement?}
     */
    #titleEl = null;

    /**
     * 是否激活
     * @type {Boolean}
     */
    #isActive = false;

    constructor() {
        super();

        this.DefineProperties({
            BindMenuBarItem: {
                set: MethodOverload().Add(
                    [MenuBarItem],
                    /**
                     * 设置绑定的菜单项元素
                     * @param {MenuBarItem} value 菜单项元素
                     */
                    function (value) {
                        this.#bindMenuBarItem = value;
                    }
                )
            },
            IsActive: {
                /**
                 * 获取是否激活
                 * @this {MenuBarItemElement}
                 * @returns {Boolean} 是否激活
                 */
                get() {
                    return this.#isActive;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置是否激活
                     * @this {MenuBarItemElement}
                     * @param {Boolean} value 是否激活
                     */
                    function (value) {
                        this.#isActive = value;
                        if (value) {
                            this.#frameEl.classList.add("active");
                        } else {
                            this.#frameEl.classList.remove("active");
                        }
                    }
                )
            },
            Text: {
                /**
                 * 获取文本
                 * @this {MenuFlyoutItemElement}
                 * @returns {String} 文本
                 */
                get() {
                    return this.#titleEl?.innerText || "";
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置文本
                     * @this {MenuFlyoutItemElement}
                     * @param {String} value 文本
                     */
                    function (value) {
                        if (!this.#titleEl) return;
                        this.#titleEl.innerText = value;
                        Basic.SetPropertyValueById(this.Id, "Text", value);
                    }
                )
            }
        });
    }

    Load() {
        this.#frameEl = this.Root.querySelector(".frame");
        this.#titleEl = this.Root.querySelector(".title");

        this.addEventListener("click", e => {
            if (this.Parent.ShowingItem === this.#bindMenuBarItem || this.IsActive) {
                return;
            }
            if (this.#bindMenuBarItem) {
                const rect = this.getBoundingClientRect();
                this.#bindMenuBarItem.Show(rect.x, rect.y + rect.height);
                this.Parent.ShowingItem = this.#bindMenuBarItem;
            }
        });

        this.addEventListener("pointerenter", e => {
            if (!this.Parent.ShowingItem || this.Parent.ShowingItem === this.#bindMenuBarItem) return;
            MenuFlyout.Hide();
            this.click();
        });
    }

    static {
        Register(this, import.meta.url, {
            template: `<div class="frame"><div class="title"></div></div>`,
            style: true
        });
    }
}

export class MenuBarItem extends MenuFlyout {
    /**
     * 绑定的菜单栏项显示元素
     * @type {MenuBarItemElement?}
     */
    #bindMenuBarItemElement = null;

    /**
     * 父菜单栏
     * @type {MenuBar?}
     */
    #parent = null;

    constructor() {
        super();

        this.DefineProperties({
            BindMenuBarItemElement: {
                /**
                 * 获取绑定的菜单栏项显示元素
                 * @this {MenuBarItem}
                 * @returns {MenuBarItemElement}
                 */
                get() {
                    return this.#bindMenuBarItemElement;
                },
                set: MethodOverload().Add(
                    [MenuBarItemElement],
                    /**
                     * 设置绑定的菜单栏项显示元素
                     * @this {MenuBarItem}
                     * @param {MenuBarItemElement} value 菜单栏项显示元素
                     */
                    function (value) {
                        this.#bindMenuBarItemElement = value;
                    }
                )
            }
        });
    }

    Load() {
        super.Load();

        if (this.IsShow) return;

        let parent = this.parentElement;
        while (parent && parent?.tagName !== MenuBar.ComponentTagName) {
            parent = parent.parentElement;
        }
        this.#parent = parent;
        if (!parent) return;

        this.#bindMenuBarItemElement = document.createElement(MenuBarItemElement.ComponentTagName);
        this.#bindMenuBarItemElement.BindMenuBarItem = this;
        this.#bindMenuBarItemElement.ForceParent = parent;
        this.parentElement.insertAdjacentElement("beforebegin", this.#bindMenuBarItemElement);

        this.OnShow.Bind(() => {
            this.#bindMenuBarItemElement.style.setProperty("pointer-events", "none");
        });

        this.OnHide.Bind(() => {
            this.#parent.ShowingItem = null;
            this.#bindMenuBarItemElement.style.removeProperty("pointer-events");
        });
    }

    async Update() {
        await super.Update();

        if (this.IsShow) return;

        if (this.#bindMenuBarItemElement) {
            await this.WaitLoad();
            const attrs = this.attributes;
            for (let i = 0; i < attrs.length; i++) {
                if (attrs[i].name === "style") continue;
                this.#bindMenuBarItemElement.setAttribute(attrs[i].name, attrs[i].value);
            }
        }
    }

    static {
        Register(this, import.meta.url, {
            template: new URL("../MenuFlyout/MenuFlyout.html", import.meta.url),
            style: new URL("../MenuFlyout/MenuFlyout.css", import.meta.url)
        });
    }
}
