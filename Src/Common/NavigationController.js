import Basic from "@JyoUI/Components/Basic/Basic.js";
import Page from "@JyoUI/Components/Page/Page.js";
import Base from "@JyoUI/Common/Base.js";
import ExtendInterfaces from "@JyoUI/Common/ExtendInterfaces.js";
import Interface from "@JyoUI/Common/Interface.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";

/**
 * 导航控制器类
 * @class
 */
export default class NavigationController extends Base {
    #root = null;

    #history = [];

    #currentIndex = -1;

    get CanGoBack() {
        return this.#currentIndex > 0;
    }

    get CanGoForward() {
        return this.#currentIndex < this.#history.length - 1;
    }

    get CurrentPage() {
        return this.#history[this.#currentIndex]?.sourcePage || null;
    }

    static #_constructor = function (...params) {
        NavigationController.#_constructor = MethodOverload().Add(
            [HTMLElement],
            /**
             * 导航控制器类构造函数
             * @constructor
             * @this {NavigationController}
             * @param {HTMLElement} root 导航控制器根元素
             * @returns {NavigationController} 导航控制器类实例
             */
            function (root) {
                this.#root = root;
            }
        );

        return NavigationController.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        super();

        return NavigationController.#_constructor.call(this, ...params);
    }

    #ChangePage(current, next, transitionInfoOverride) {
        if (!transitionInfoOverride) {
            transitionInfoOverride = new EntranceNavigationTransitionInfo();
        }

        if (Basic.PowerSavingMode) {
            transitionInfoOverride = new SuppressNavigationTransitionInfo();
        }

        if (current) {
            transitionInfoOverride.Hide(current.sourcePage);
        }

        if (next) {
            if (!current) next.sourcePage.style.display = "block";
            else transitionInfoOverride.Show(next.sourcePage);
        }
    }

    GoForward(...params) {
        NavigationController.prototype.GoForward = MethodOverload()
            .Add([], function () {
                return this.GoForward(null);
            })
            .Add([[INavigationTransitionInfo, null]], function (transitionInfoOverride) {
                if (this.#currentIndex >= this.#history.length - 1) {
                    return;
                }

                let pages = [this.#history[this.#currentIndex], this.#history[++this.#currentIndex]];
                return this.#ChangePage(...pages, transitionInfoOverride);
            });

        return NavigationController.prototype.GoForward.call(this, ...params);
    }

    GoBack(...params) {
        NavigationController.prototype.GoBack = MethodOverload()
            .Add([], function () {
                return this.GoBack(null);
            })
            .Add([[INavigationTransitionInfo, null]], function (transitionInfoOverride) {
                if (this.#currentIndex <= 0) {
                    return;
                }

                let pages = [this.#history[this.#currentIndex], this.#history[--this.#currentIndex]];
                return this.#ChangePage(...pages, transitionInfoOverride);
            });

        return NavigationController.prototype.GoBack.call(this, ...params);
    }

    Navigate(...params) {
        NavigationController.prototype.Navigate = MethodOverload()
            .Add([String], function (tagName) {
                return this.Navigate(tagName, {}, new EntranceNavigationTransitionInfo());
            })
            .Add([HTMLElement], function (sourcePage) {
                return this.Navigate(sourcePage, {}, new EntranceNavigationTransitionInfo());
            })
            .Add([String, [Object, null]], function (tagName, parameter) {
                return this.Navigate(tagName, parameter, new EntranceNavigationTransitionInfo());
            })
            .Add([Page, [Object, null]], function (sourcePage, parameter) {
                return this.Navigate(sourcePage, parameter, new EntranceNavigationTransitionInfo());
            })
            .Add([String, [Object, null], [INavigationTransitionInfo, null]], function (tagName, parameter, transitionInfoOverride) {
                let sourcePage = document.createElement(tagName);
                sourcePage.HasNew = true;
                return this.Navigate(sourcePage, parameter, transitionInfoOverride);
            })
            .Add([Page, [Object, null], [INavigationTransitionInfo, null]], function (sourcePage, parameter, transitionInfoOverride) {
                if (this.#currentIndex < this.#history.length - 1) {
                    this.#history.splice(this.#currentIndex + 1);
                }

                if (!sourcePage.HasNew) {
                    sourcePage = sourcePage.cloneNode(true);
                }
                sourcePage.Params = parameter || {};
                sourcePage.NavigationController = this;
                this.#root.appendChild(sourcePage);

                this.#history.push({
                    sourcePage,
                    transitionInfoOverride: transitionInfoOverride || new EntranceNavigationTransitionInfo()
                });
                return this.GoForward(transitionInfoOverride);
            })
            .Add(["*", [Object, null], [INavigationTransitionInfo, null]], function (sourcePage, parameter, transitionInfoOverride) {
                sourcePage.addEventListener("load", () => {
                    this.Navigate(sourcePage, parameter, transitionInfoOverride);
                });
            });

        return NavigationController.prototype.Navigate.call(this, ...params);
    }
}

export class INavigationTransitionInfo extends Interface {
    Show(...params) {
        INavigationTransitionInfo.prototype.Show = MethodOverload().Add([HTMLElement], function (page) {
            throw new ReferenceError("NotImplementedException");
        });

        return INavigationTransitionInfo.prototype.Show.call(this, ...params);
    }

    Hide(...params) {
        INavigationTransitionInfo.prototype.Hide = MethodOverload().Add([HTMLElement], function (page) {
            throw new ReferenceError("NotImplementedException");
        });

        return INavigationTransitionInfo.prototype.Hide.call(this, ...params);
    }
}

export const EntranceNavigationTransitionInfo = ExtendInterfaces(
    class A {
        #goBack = false;

        Show(...params) {
            A.prototype.Show = MethodOverload().Add([HTMLElement], function (page) {
                clearTimeout(page.navigationTransitionInfoProcessTimer);
                page.style.cssText = `
                display: block;
                transition: all 0.3s ease-in-out;
                opacity: 0;
                transform: translateY(${this.#goBack ? "-" : ""}20%);
            `;
                requestAnimationFrame(() => {
                    page.style.cssText += `
                    opacity: 1;
                    transform: translateY(0);
                `;
                });
                this.#goBack = !this.#goBack;
            });

            return A.prototype.Show.call(this, ...params);
        }

        Hide(...params) {
            A.prototype.Hide = MethodOverload().Add([HTMLElement], function (page) {
                page.style.cssText += `
                opacity: 0;
                transform: translateY(-20%);
            `;
                page.navigationTransitionInfoProcessTimer = setTimeout(() => {
                    page.style.cssText += `
                    display: none;
                `;
                }, 300);
            });

            return A.prototype.Hide.call(this, ...params);
        }
    },
    INavigationTransitionInfo
);

export const DrillInNavigationTransitionInfo = ExtendInterfaces(
    class A {
        #goBack = false;

        Show(...params) {
            A.prototype.Show = MethodOverload().Add([HTMLElement], function (page) {
                clearTimeout(page.navigationTransitionInfoProcessTimer);
                page.style.cssText = `
                display: block;
                transition: all 0.3s ease-in-out;
                opacity: 0;
                transform: scale(${this.#goBack ? "1.2" : "0.8"});
            `;
                requestAnimationFrame(() => {
                    page.style.cssText += `
                    opacity: 1;
                    transform: scale(1);
                `;
                });
                this.#goBack = !this.#goBack;
            });

            return A.prototype.Show.call(this, ...params);
        }

        Hide(...params) {
            A.prototype.Hide = MethodOverload().Add([HTMLElement], function (page) {
                page.style.cssText += `
                opacity: 0;
                transform: scale(1.2);
            `;
                page.navigationTransitionInfoProcessTimer = setTimeout(() => {
                    page.style.cssText += `
                    display: none;
                `;
                }, 300);
            });

            return A.prototype.Hide.call(this, ...params);
        }
    },
    INavigationTransitionInfo
);

export const SuppressNavigationTransitionInfo = ExtendInterfaces(
    class A {
        Show(...params) {
            A.prototype.Show = MethodOverload().Add([HTMLElement], function (page) {
                clearTimeout(page.navigationTransitionInfoProcessTimer);
                page.style.cssText = `display: block;`;
            });

            return A.prototype.Show.call(this, ...params);
        }

        Hide(...params) {
            A.prototype.Hide = MethodOverload().Add([HTMLElement], function (page) {
                page.style.cssText += `display: none;`;
            });

            return A.prototype.Hide.call(this, ...params);
        }
    },
    INavigationTransitionInfo
);

export const SlideNavigationTransitionInfo = ExtendInterfaces(
    class A {
        #goBack = false;

        #from = SlideNavigationTransitionInfo.#fromRight;

        static #fromRight = Symbol();

        static #fromLeft = Symbol();

        static get FromRight() {
            return this.#fromRight;
        }

        static get FromLeft() {
            return this.#fromLeft;
        }

        get Effect() {
            return this.#from;
        }

        set Effect(value) {
            this.#from = value;
        }

        Show(...params) {
            A.prototype.Show = MethodOverload().Add([HTMLElement], function (page) {
                clearTimeout(page.navigationTransitionInfoProcessTimer);
                let value = 0;
                if (this.#from === SlideNavigationTransitionInfo.#fromRight) {
                    value = this.#goBack ? "-100%" : "100%";
                } else {
                    value = this.#goBack ? "100%" : "-100%";
                }
                page.style.cssText = `
                display: block;
                transition: all 0.3s ease-in-out;
                transform: translateX(${value});
            `;
                requestAnimationFrame(() => {
                    page.style.cssText += `
                    transform: translateX(0);
                `;
                });
                this.#goBack = !this.#goBack;
            });

            return A.prototype.Show.call(this, ...params);
        }

        Hide(...params) {
            A.prototype.Hide = MethodOverload().Add([HTMLElement], function (page) {
                let value = 0;
                if (this.#from === SlideNavigationTransitionInfo.#fromRight) {
                    value = "-100%";
                } else {
                    value = "100%";
                }
                page.style.cssText += `
                transform: translateX(${value});
            `;
                page.navigationTransitionInfoProcessTimer = setTimeout(() => {
                    page.style.cssText += `
                    display: none;
                `;
                }, 300);
            });

            return A.prototype.Hide.call(this, ...params);
        }
    },
    INavigationTransitionInfo
);
