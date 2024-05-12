import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Basic, { Register } from "@JyoUI/Components/Basic/Basic.js";
import Enum from "@JyoUI/Common/Enum.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";
import Collection from "@JyoUI/Common/Collection.js";
import CheckBox from "@JyoUI/Components/CheckBox/CheckBox.js";

/**
 * 定义指定 TreeView 实例的选择行为的常量
 * @extends Enum
 * @enum
 */
export class TreeViewSelectionMode extends Enum {
    static #none = new TreeViewSelectionMode(0, "None");

    static #single = new TreeViewSelectionMode(1, "Single");

    static #multiple = new TreeViewSelectionMode(2, "Multiple");

    /**
     * 用户无法选择项
     * @type {TreeViewSelectionMode}
     */
    static get None() {
        return this.#none;
    }

    /**
     * 用户可以选择单个项
     * @type {TreeViewSelectionMode}
     */
    static get Single() {
        return this.#single;
    }

    /**
     * 用户可以选择多个项
     * @type {TreeViewSelectionMode}
     */
    static get Multiple() {
        return this.#multiple;
    }
}

/**
 * 树形组件
 * @extends Basic
 * @class
 */
export default class TreeView extends Basic {
    /**
     * 指示是否可以将视图中的项作为数据有效负载拖动
     * @type {Boolean}
     */
    #canDragItems = true;

    /**
     * 用于生成 TreeView 内容的对象源
     * @type {Array?}
     */
    #itemsSource = null;

    /**
     * TreeView 实例的选择行为
     * @type {TreeViewSelectionMode}
     */
    #selectionMode = TreeViewSelectionMode.Single;

    /**
     * 在折叠树中的项时发生
     * @type {EventHandle}
     */
    #onCollapsed = new EventHandle(this.AbortController);

    /**
     * 在结束涉及视图中的某个项的拖动操作时发生
     * @type {EventHandle}
     */
    #onDragItemsCompleted = new EventHandle(this.AbortController);

    /**
     * 在开始涉及视图中的某个项的拖动操作时发生
     * @type {EventHandle}
     */
    #onDragItemsStarting = new EventHandle(this.AbortController);

    /**
     * 在树中的项开始展开时发生
     * @type {EventHandle}
     */
    #onExpanding = new EventHandle(this.AbortController);

    /**
     * 调用树中的项时发生
     * @type {EventHandle}
     */
    #onItemInvoked = new EventHandle(this.AbortController);

    /**
     * 当前选择的项发生更改时发生
     * @type {EventHandle}
     */
    #onSelectionChanged = new EventHandle(this.AbortController);

    /**
     * 获取 TreeView 中当前选定的项的集合
     * @returns {Set<TreeViewItem>} TreeView 中当前选定的项的集合
     */
    get SelectedItems() {
        return this.Where(item => item instanceof TreeViewItem && item.IsSelected);
    }

    /**
     * 获取在折叠树中的项时发生的事件
     * @returns {EventHandle} 在折叠树中的项时发生的事件
     */
    get OnCollapsed() {
        return this.#onCollapsed;
    }

    /**
     * 获取在结束涉及视图中的某个项的拖动操作时发生的事件
     * @returns {EventHandle} 在结束涉及视图中的某个项的拖动操作时发生的事件
     */
    get OnDragItemsCompleted() {
        return this.#onDragItemsCompleted;
    }

    /**
     * 获取在开始涉及视图中的某个项的拖动操作时发生的事件
     * @returns {EventHandle} 在开始涉及视图中的某个项的拖动操作时发生的事件
     */
    get OnDragItemsStarting() {
        return this.#onDragItemsStarting;
    }

    /**
     * 获取在树中的项开始展开时发生的事件
     * @returns {EventHandle} 在树中的项开始展开时发生的事件
     */
    get OnExpanding() {
        return this.#onExpanding;
    }

    /**
     * 获取调用树中的项时发生的事件
     * @returns {EventHandle} 调用树中的项时发生的事件
     */
    get OnItemInvoked() {
        return this.#onItemInvoked;
    }

    /**
     * 获取当前选择的项发生更改时发生的事件
     * @returns {EventHandle} 当前选择的项发生更改时发生的事件
     */
    get OnSelectionChanged() {
        return this.#onSelectionChanged;
    }

    /**
     * 树形组件构造函数
     * @constructor
     * @returns {TreeView} 树形组件实例
     */
    constructor() {
        // 调用基类构造函数
        super();

        this.DefineProperties({
            CanDragItems: {
                /**
                 * 获取指示是否可以将视图中的项作为数据有效负载拖动
                 * @this {TreeView}
                 * @returns {Boolean} 指示是否可以将视图中的项作为数据有效负载拖动
                 */
                get() {
                    return this.#canDragItems;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置指示是否可以将视图中的项作为数据有效负载拖动
                     * @this {TreeView}
                     * @param {Boolean} value 指示是否可以将视图中的项作为数据有效负载拖动
                     */
                    function (value) {
                        this.#canDragItems = value;

                        // TODO: 实现拖拽功能
                    }
                )
            },
            ItemsSource: {
                /**
                 * 获取用于生成 TreeView 内容的对象源
                 * @this {TreeView}
                 * @returns {Array?} 用于生成 TreeView 内容的对象源
                 */
                get() {
                    return this.#itemsSource;
                },
                set: MethodOverload().Add(
                    [Array],
                    /**
                     * 设置用于生成 TreeView 内容的对象源
                     * @this {TreeView}
                     * @param {Array?} value 用于生成 TreeView 内容的对象源
                     */
                    function (value) {
                        this.#itemsSource = value;

                        this.Root.innerHTML = "";
                        value.forEach(item => {
                            let itemEl = document.createElement("tree-view-item");
                            itemEl.Content = item;
                            this.Root.appendChild(itemEl);
                        });
                    }
                )
            },
            SelectedItem: {
                /**
                 * 获取 TreeView 中当前选定的项
                 * @this {TreeView}
                 * @returns {Object?} TreeView 中当前选定的项
                 */
                get() {
                    return this.Where(item => item instanceof TreeViewItem && item.IsSelected)?.[0] || null;
                },
                set: MethodOverload().Add(
                    [[Object, null]],
                    /**
                     * 设置 TreeView 中当前选定的项
                     * @this {TreeView}
                     * @param {Object?} value TreeView 中当前选定的项
                     */
                    function (value) {
                        let oldItem = this.Where(item => item instanceof TreeViewItem && item.IsSelected)?.[0];
                        if (value) value.IsSelected = true;
                        if (oldItem !== value && oldItem) oldItem.IsSelected = false;
                        this.OnSelectionChanged.Dispatch(this, value, oldItem);
                    }
                )
            },
            SelectionMode: {
                /**
                 * 获取 TreeView 实例的选择行为
                 * @this {TreeView}
                 * @returns {TreeViewSelectionMode} TreeView 实例的选择行为
                 */
                get() {
                    return this.#selectionMode;
                },
                set: MethodOverload()
                    .Add(
                        [String],
                        /**
                         * 设置 TreeView 实例的选择行为
                         * @this {TreeView}
                         * @param {String} value TreeView 实例的选择行为
                         */
                        function (value) {
                            this.SelectionMode = TreeViewSelectionMode.GetEnumByDescription(value);
                        }
                    )
                    .Add(
                        [TreeViewSelectionMode],
                        /**
                         * 设置 TreeView 实例的选择行为
                         * @this {TreeView}
                         * @param {TreeViewSelectionMode} value TreeView 实例的选择行为
                         */
                        function (value) {
                            this.#selectionMode = value;
                            this.SelectedItem = null;

                            switch (value) {
                                case TreeViewSelectionMode.None:
                                    this.Where(item => item instanceof TreeViewItem).forEach(item => {
                                        item.IsSelected = false;
                                    });
                                    break;
                                case TreeViewSelectionMode.Single:
                                    this.SelectedItems.forEach((item, index) => {
                                        if (index > 0) item.IsSelected = false;
                                    });
                                    break;
                            }
                        }
                    )
            }
        });
    }

    Collapse(...params) {
        TreeView.prototype.Collapse = MethodOverload().Add(
            [TreeViewItem],
            /**
             * 折叠树中的指定项
             * @this {TreeView}
             * @param {TreeViewItem} item 要折叠的项
             */
            function (item) {
                item.IsExpanded = false;
                this.OnExpanding.Dispatch(this, item);
            }
        );

        return TreeView.prototype.Collapse.call(this, ...params);
    }

    Expand(...params) {
        TreeView.prototype.Expand = MethodOverload().Add(
            [TreeViewItem],
            /**
             * 展开树中的指定项
             * @this {TreeView}
             * @param {TreeViewItem} item 要展开的项
             */
            function (item) {
                item.IsExpanded = true;
                this.OnCollapsed.Dispatch(this, item);
            }
        );

        return TreeView.prototype.Expand.call(this, ...params);
    }

    SelectAll(...params) {
        TreeView.prototype.SelectAll = MethodOverload().Add(
            [],
            /**
             * 选择树中的所有项
             * @this {TreeView}
             */
            function () {
                if (this.SelectionMode !== TreeViewSelectionMode.Multiple) return;
                this.Where(item => item instanceof TreeViewItem).forEach(item => {
                    item.IsSelected = true;
                });
                this.OnSelectionChanged.Dispatch(this, this.SelectedItems);
            }
        );

        return TreeView.prototype.SelectAll.call(this, ...params);
    }

    static {
        // 注册组件
        Register(this, import.meta.url,{
            template:`<div class="treeView"><slot></slot></div>`,
            style:true
        });
    }
}

export class TreeViewItem extends Basic {
    /**
     * 项的元素
     * @type {HTMLElement?}
     */
    #treeViewItemEl = null;

    /**
     * 项的背景元素
     * @type {HTMLElement?}
     */
    #backgroundEl = null;

    /**
     * 项的复选框元素
     * @type {CheckBox?}
     */
    #checkboxEl = null;

    /**
     * 项的箭头元素
     * @type {HTMLElement?}
     */
    #arrowEl = null;

    /**
     * 项的图像元素
     * @type {HTMLElement?}
     */
    #imageEl = null;

    /**
     * 项的内容元素
     * @type {HTMLElement?}
     */
    #contentEl = null;

    /**
     * 项的子项的元素
     * @type {HTMLElement?}
     */
    #subItemsEl = null;

    /**
     * 项的子项的插槽元素
     * @type {HTMLElement?}
     */
    #subItemsSlotEl = null;

    /**
     * 项的内容
     * @type {String}
     */
    #content = null;

    /**
     * 指示项是否已展开
     * @type {Boolean}
     */
    #isExpanded = false;

    /**
     * 项的根项
     * @type {TreeView?}
     */
    #rootParent = null;

    /**
     * 项的树
     * @type {TreeView?}
     */
    #parentTreeView = null;

    /**
     * 项的父项
     * @type {TreeView | TreeViewItem | null}
     */
    #parent = null;

    /**
     * 项的图像
     * @type {String?}
     */
    #image = null;

    /**
     * 项的图像透明度
     * @type {Number}
     */
    #imageOpacity = 1;

    /**
     * 指示是否已初始化
     * @type {Boolean}
     */
    #hasInit = false;

    /**
     * 获取项的子项的集合
     * @returns {Collection<TreeViewItem>} 项的子项的集合
     */
    get Children() {
        let list = [];
        const slotContent = this.#subItemsSlotEl?.assignedElements?.();
        if (slotContent) {
            for (let item of slotContent) {
                if (item instanceof TreeViewItem) {
                    list.push(item);
                }
            }
        }
        return list;
    }

    /**
     * 获取当前项与树的根项的距离
     * @returns {Number} 当前项与树的根项的距离
     */
    get Depth() {
        let depth = 0;
        let parent = this.Parent;
        while (parent && parent instanceof TreeViewItem) {
            depth++;
            parent = parent.Parent;
        }
        return depth;
    }

    /**
     * 获取当前项是否具有子项
     * @returns {Boolean} 当前项是否具有子项
     */
    get HasChildren() {
        return !!this.Children.length;
    }

    constructor() {
        super();

        this.DefineProperties({
            Content: {
                /**
                 * 获取项的内容
                 * @this {TreeViewItem}
                 * @returns {String} 项的内容
                 */
                get() {
                    return this.#content;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置项的内容
                     * @this {TreeViewItem}
                     * @param {String} value 项的内容
                     */
                    function (value) {
                        this.#content = value;
                        this.Debouncing(this.Update);
                    }
                )
            },
            IsExpanded: {
                /**
                 * 获取指示项是否已展开
                 * @this {TreeViewItem}
                 * @returns {Boolean} 指示项是否已展开
                 */
                get() {
                    return this.#isExpanded;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置指示项是否已展开
                     * @this {TreeViewItem}
                     * @param {Boolean} value 指示项是否已展开
                     */
                    function (value) {
                        this.#isExpanded = value;
                        this.#treeViewItemEl.classList[value ? "add" : "remove"]("isExpanded");
                        this.#subItemsEl.style.display = value ? "block" : "none";
                        this.Debouncing(this.Update);
                    }
                )
            },
            IsSelected: {
                /**
                 * 获取指示项是否已选择
                 * @this {TreeViewItem}
                 * @returns {Boolean} 指示项是否已选择
                 */
                get() {
                    if (!this.#checkboxEl) return false;
                    return this.#checkboxEl.IsChecked === true;
                },
                set: MethodOverload().Add(
                    [Boolean],
                    /**
                     * 设置指示项是否已选择
                     * @this {TreeViewItem}
                     * @param {Boolean} value 指示项是否已选择
                     */
                    function (value) {
                        this.#checkboxEl && (this.#checkboxEl.IsChecked = value);
                        this.Debouncing(this.Update);
                    }
                )
            },
            Parent: {
                /**
                 * 获取项的父项
                 * @this {TreeViewItem}
                 * @returns {TreeView | TreeViewItem | null} 项的父项
                 */
                get() {
                    return this.#parent;
                },
                set: MethodOverload().Add(
                    [[TreeView, TreeViewItem, null]],
                    /**
                     * 设置项的父项
                     * @this {TreeViewItem}
                     * @param {TreeView | TreeViewItem | null} value 项的父项
                     */
                    function (value) {
                        this.#parent = value;
                        this.Debouncing(this.Update);
                    }
                )
            },
            Image: {
                /**
                 * 获取项的图像
                 * @this {TreeViewItem}
                 * @returns {String?} 项的图像
                 */
                get() {
                    return this.#image;
                },
                set: MethodOverload().Add(
                    [[String, null]],
                    /**
                     * 设置项的图像
                     * @this {TreeViewItem}
                     * @param {String?} value 项的图像
                     */
                    function (value) {
                        this.#image = value;
                        this.Debouncing(this.Update);
                    }
                )
            },
            ImageOpacity: {
                /**
                 * 获取项的图像透明度
                 * @this {TreeViewItem}
                 * @returns {Number} 项的图像透明度
                 */
                get() {
                    return this.#imageOpacity;
                },
                set: MethodOverload().Add(
                    [Number],
                    /**
                     * 设置项的图像透明度
                     * @this {TreeViewItem}
                     * @param {Number} value 项的图像透明度
                     */
                    function (value) {
                        this.#imageOpacity = value;
                        this.Debouncing(this.Update);
                    }
                )
            }
        });
    }

    async Load() {
        await super.Load();

        this.#rootParent = this;
        while (this.#rootParent.Parent) {
            this.#rootParent = this.#rootParent.Parent;
            if (this.#rootParent && this.#rootParent instanceof TreeView) {
                this.#parentTreeView = this.#rootParent;
                break;
            }
        }

        this.#treeViewItemEl = this.Root.querySelector(".treeViewItem");
        this.#backgroundEl = this.Root.querySelector(".background");
        this.#checkboxEl = await this.QueryComponent(".checkbox");
        this.#arrowEl = this.Root.querySelector(".arrow");
        this.#imageEl = this.Root.querySelector(".image");
        this.#contentEl = this.Root.querySelector(".content");
        this.#subItemsEl = this.Root.querySelector(".subItems");
        this.#subItemsSlotEl = this.Root.querySelector("#subItemsSlot");

        this.#hasInit = true;

        this.Debouncing(this.Update);
    }

    async Update() {
        if (!this.#hasInit) return;
        await super.Update();

        this.#treeViewItemEl.classList[this.HasChildren ? "add" : "remove"]("hasChildren");
        this.#checkboxEl.IsThreeState = this.HasChildren;
        this.#backgroundEl.style.cssText += `left:calc(${-this.Depth * 14}px - 10px);width:calc(100% + ${this.Depth * 2 * 14}px + 20px);`;
        this.#imageEl.style.display = this.Image ? "inline-block" : "none";
        this.#imageEl.style.backgroundImage = this.Image ? `url(${this.Image})` : "none";
        this.#imageEl.style.opacity = this.ImageOpacity;
        this.#contentEl.textContent = this.Content;

        switch (this.#parentTreeView.SelectionMode) {
            case TreeViewSelectionMode.None:
                this.#checkboxEl.style.display = "none";
                break;
            case TreeViewSelectionMode.Single:
                this.#checkboxEl.style.display = "none";
                break;
            case TreeViewSelectionMode.Multiple:
                this.#checkboxEl.style.display = "inline-block";
                break;
        }

        if ((this.IsSelected && this.#checkboxEl.IsChecked === true) || this.#rootParent.SelectedItem === this) {
            this.#treeViewItemEl.classList.add("selected");
        } else {
            this.#treeViewItemEl.classList.remove("selected");
        }

        if (this.#parentTreeView.SelectionMode === TreeViewSelectionMode.Single) {
            this.#treeViewItemEl.classList.add("single");
        } else {
            this.#treeViewItemEl.classList.remove("single");
        }
    }

    ClickCheckbox(...params) {
        /**
         * 递归选择所有子项
         * @param {TreeViewItem} item 项
         * @param {Boolean} selected 是否选择
         */
        function selectAllChildren(item, selected) {
            for (let child of item.Children) {
                child.IsSelected = selected;
                selectAllChildren(child, selected);
            }
        }

        TreeViewItem.prototype.ClickCheckbox = MethodOverload().Add(
            [Event],
            /**
             * 单击复选框
             * @this {TreeViewItem}
             * @param {Event} e 事件参数
             */
            function (e) {
                e.stopPropagation();

                if (this.#checkboxEl.IsChecked === null) {
                    this.#checkboxEl.IsChecked = false;
                }

                selectAllChildren(this, this.#checkboxEl.IsChecked);

                let parent = this.Parent;
                while (parent && parent instanceof TreeViewItem) {
                    let count = 0;
                    let hasHalf = false;

                    for (let item of parent.Children) {
                        if (item.IsSelected) {
                            count++;
                        }
                        if (item.#checkboxEl.IsChecked === null) {
                            hasHalf = true;
                        }
                    }

                    if (hasHalf) {
                        parent.#checkboxEl.IsChecked = null;
                    } else if (count === 0) {
                        parent.#checkboxEl.IsChecked = false;
                    } else if (count === parent.Children.length) {
                        parent.#checkboxEl.IsChecked = true;
                    } else {
                        parent.#checkboxEl.IsChecked = null;
                    }

                    parent = parent.Parent;
                }
            }
        );

        return TreeViewItem.prototype.ClickCheckbox.call(this, ...params);
    }

    ClickItem(...params) {
        TreeViewItem.prototype.ClickItem = MethodOverload().Add(
            [Event],
            /**
             * 单击项
             * @this {TreeViewItem}
             * @param {Event} e 事件参数
             */
            function (e) {
                if (this.#parentTreeView.SelectionMode === TreeViewSelectionMode.Multiple) return;
                if (this.#parentTreeView.SelectionMode === TreeViewSelectionMode.None) {
                    this.#rootParent.SelectedItem = null;
                    return;
                }
                this.#rootParent.SelectedItem = this;

                this.#parentTreeView.OnItemInvoked.Dispatch(this, this);
            }
        );

        return TreeViewItem.prototype.ClickItem.call(this, ...params);
    }

    ClickExpandOrCollapse(...params) {
        TreeViewItem.prototype.ClickExpandOrCollapse = MethodOverload().Add(
            [Event],
            /**
             * 单击展开
             * @this {TreeViewItem}
             * @param {Event} e 事件参数
             */
            function (e) {
                this.#parentTreeView[this.IsExpanded ? "Collapse" : "Expand"](this);
            }
        );

        return TreeViewItem.prototype.ClickExpandOrCollapse.call(this, ...params);
    }

    static {
        // 注册组件
        Register(this, import.meta.url);
    }
}
