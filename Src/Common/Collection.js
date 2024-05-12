import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Base from "@JyoUI/Common/Base.js";
import EventHandle from "@JyoUI/Common/EventHandle.js";

const PROXYS_CACHE = new WeakMap();

export default class Collection extends Base {
    get Count() {
        return this.#list.length;
    }

    get length() {
        return this.Count;
    }

    get IsDisposed() {
        return this.#isDisposed;
    }

    get IsReadOnly() {
        return false;
    }

    #isDisposed = false;

    #list = [];

    #type = null;

    #proxy = null;

    #readOnlyProxy = null;

    #findByString = "";

    #findHandler = null;

    #setHandler = null;

    #maxCount = Number.MAX_SAFE_INTEGER;

    #onChange = new EventHandle();

    real = this;

    get ["#isCollection"]() {
        return true;
    }

    get OnChange() {
        return this.#onChange;
    }

    static #_constructor = function (...params) {
        Collection.#_constructor = MethodOverload()
            .Add([Function], function (type) {
                return Collection.#_constructor.call(this, type, []);
            })
            .Add([Function, Number], function (type, count) {
                let collection = [];

                this.#maxCount = count;

                return Collection.#_constructor.call(this, type, collection);
            })
            .Add([Function, [Array, Collection]], function (type, collection) {
                this.#type = type;

                this.#proxy = new Proxy(this, {
                    get(obj, prop) {
                        if (obj.IsDisposed) {
                            throw new ReferenceError("ObjectDisposed_Generic");
                        }

                        let list = obj.#list;

                        if (obj.#findHandler) {
                            let found = obj.#findHandler(list, prop);
                            if (found) {
                                return found;
                            }
                        }

                        if (typeof prop == "symbol") {
                            return obj[prop];
                        } else if (/^[0-9]*$/.test(prop)) {
                            if (prop < 0 || prop >= this.Count) {
                                throw new RangeError();
                            }

                            return list[prop];
                        } else {
                            let byString = obj.#findByString;
                            if (byString) {
                                for (let i = 0; i < list.length; i++) {
                                    if (list[i] !== null && prop === list[i][byString]) {
                                        let result = list[i];

                                        if (typeof obj.Get === "function") {
                                            return obj.Get(obj, prop, list, i) || result;
                                        }

                                        return result;
                                    }
                                }
                            }

                            return obj[prop];
                        }
                    },
                    set(obj, prop, value) {
                        if (obj.IsDisposed) {
                            throw new ReferenceError("ObjectDisposed_Generic");
                        }

                        let type = obj.#type;

                        let list = obj.#list;

                        if (obj.#setHandler) {
                            let isOk = obj.#setHandler(list, prop, value);
                            if (isOk) {
                                return true;
                            }
                        }

                        if (/^[0-9]*$/.test(prop)) {
                            let num = parseInt(prop, 10);

                            if (num < 0 || num > obj.#maxCount) {
                                throw new RangeError("ArgumentOutOfRange_Index");
                            }

                            let val = Object(value);
                            if (typeof val === "function" && type === Function) {
                            } else if (value !== null && (typeof val !== "object" || !(val instanceof type))) {
                                throw new TypeError("值的类型必须是：" + type.name);
                            }

                            list[prop] = value;

                            if (typeof obj.Set === "function") {
                                obj.Set(obj, prop, value, list);
                            }
                        } else {
                            let byString = obj.#findByString;
                            if (byString) {
                                for (let i = 0; i < list.length; i++) {
                                    if (prop === list[i][byString]) {
                                        list[i] = value;
                                        return true;
                                    }
                                }
                            }

                            obj[prop] = value;
                        }

                        return true;
                    }
                });

                for (let i = 0; i < collection.length; i++) {
                    this.Add(collection[i]);
                }

                return this.#proxy;
            })
            .Add([Function, [Array, Collection], Number], function (type, collection, count) {
                if (collection.length > count) {
                    throw new RangeError();
                }

                this.#maxCount = count;

                return Collection.#_constructor.call(this, type, collection);
            });

        return Collection.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        super();

        const res = Collection.#_constructor.call(this, ...params);

        Base.DefineProperties(this, {
            FindByString: {
                /**
                 * 获取查找字符串
                 * @this {Collection}
                 * @returns {String}
                 */
                get() {
                    return this.#findByString;
                },
                set: MethodOverload().Add(
                    [String],
                    /**
                     * 设置查找字符串
                     * @this {Collection}
                     * @param {String} value
                     */
                    function (value) {
                        this.#findByString = value;
                    }
                )
            },
            FindHandler: {
                /**
                 * 获取查找处理程序
                 * @this {Collection}
                 * @returns {Function}
                 */
                get() {
                    return this.#findHandler;
                },
                set: MethodOverload().Add(
                    [Function],
                    /**
                     * 设置查找处理程序
                     * @this {Collection}
                     * @param {Function} value
                     */
                    function (value) {
                        this.#findHandler = value;
                    }
                )
            },
            SetHandler: {
                /**
                 * 获取设置处理程序
                 * @this {Collection}
                 * @returns {Function}
                 */
                get() {
                    return this.#setHandler;
                },
                set: MethodOverload().Add(
                    [Function],
                    /**
                     * 设置设置处理程序
                     * @this {Collection}
                     * @param {Function} value
                     */
                    function (value) {
                        this.#setHandler = value;
                    }
                )
            }
        });

        return res;
    }

    [Symbol.iterator] = function* () {
        for (let i = 0; i < this.real.#list.length; i++) {
            yield this.real.#list[i];
        }
    };

    static T(...params) {
        Collection.T = MethodOverload().Add(["*"], function (type) {
            let proxy = PROXYS_CACHE.get(type);
            !proxy &&
                PROXYS_CACHE.set(
                    type,
                    (proxy = new Proxy(Collection, {
                        get: function (target, prop) {
                            if (prop === "#internalType") {
                                return type;
                            }
                            return target[prop];
                        }
                    }))
                );
            return proxy;
        });

        return Collection.T.call(this, ...params);
    }

    GetType(...params) {
        Collection.prototype.GetType = MethodOverload().Add([], function () {
            return this.real.#type;
        });

        return Collection.prototype.GetType.call(this, ...params);
    }

    Add(...params) {
        Collection.prototype.Add = MethodOverload().Add([["*", null]], function (item) {
            if (this.Count + 1 > this.real.#maxCount) {
                throw new RangeError();
            }
            this.real.#proxy[this.real.#list.length] = item;
            this.OnChange.Dispatch(this, { type: "add", item, index: this.Count - 1 });
        });

        return Collection.prototype.Add.call(this, ...params);
    }

    AddRange(...params) {
        Collection.prototype.AddRange = MethodOverload().Add([[Array, Collection]], function (collection) {
            if (this.Count + collection.length > this.real.#maxCount) {
                throw new RangeError();
            }

            for (let i = 0; i < collection.length; i++) {
                this.real.Add(collection[i]);
            }
        });

        return Collection.prototype.AddRange.call(this, ...params);
    }

    Insert(...params) {
        Collection.prototype.Insert = MethodOverload().Add([Number, ["*", null]], function (index, item) {
            if (this.Count + 1 > this.real.#maxCount) {
                throw new RangeError();
            }
            this.real.#list.splice(index, 0, null);
            this.real.#proxy[index] = item;
            this.OnChange.Dispatch(this, { type: "add", item, index });
        });

        return Collection.prototype.Insert.call(this, ...params);
    }

    InsertRange(...params) {
        Collection.prototype.AddRange = MethodOverload().Add([Number, [Array, Collection]], function (index, collection) {
            if (this.Count + collection.length > this.real.#maxCount) {
                throw new RangeError();
            }

            for (let i = 0; i < collection.length; i++) {
                this.real.Insert(index + i, collection[i]);
            }
        });

        return Collection.prototype.AddRange.call(this, ...params);
    }

    AsReadOnly(...params) {
        Collection.prototype.AsReadOnly = MethodOverload().Add([], function () {
            let readOnlyProxy = this.real.#readOnlyProxy;
            if (readOnlyProxy) {
                return readOnlyProxy;
            }

            this.real.#readOnlyProxy = new Proxy(this.real.#proxy, {
                get(obj, prop) {
                    if (prop === "IsReadOnly") {
                        return true;
                    }

                    return obj[prop];
                },
                set(obj, prop, value) {
                    throw new ReferenceError("NotSupported_ReadOnlyCollection");
                }
            });

            return this.real.#readOnlyProxy;
        });

        return Collection.prototype.AsReadOnly.call(this, ...params);
    }

    Clear(...params) {
        Collection.prototype.Clear = MethodOverload().Add([], function () {
            const list = this.real.#list;
            for (let i = list.length; i--; ) {
                this.RemoveAt(i);
            }

            this.OnChange.Dispatch(this, { type: "clear" });
        });

        return Collection.prototype.Clear.call(this, ...params);
    }

    Clone(...params) {
        Collection.prototype.Clone = MethodOverload().Add([], function () {
            let newCollection = new Collection(this.GetType());
            for (let i = 0; i < this.Count; i++) {
                newCollection.Add(this[i]);
            }
            return newCollection;
        });

        return Collection.prototype.Clone.call(this, ...params);
    }

    Contains(...params) {
        Collection.prototype.Contains = MethodOverload().Add(["*"], function (item) {
            let list = this.real.#list;
            for (let len = list.length; len--; ) {
                if (list[len] === item.length) {
                    return true;
                }
            }

            return false;
        });

        return Collection.prototype.Contains.call(this, ...params);
    }

    CopyTo(...params) {
        Collection.prototype.CopyTo = MethodOverload().Add([Array, Number], function (array, arrayIndex) {
            let list = this.real.#list;
            for (let i = 0; i < list.length; i++) {
                array[arrayIndex + i] = list[i];
            }
        });

        return Collection.prototype.CopyTo.call(this, ...params);
    }

    IndexOf(...params) {
        Collection.prototype.IndexOf = MethodOverload().Add(["*"], function (item) {
            let list = this.real.#list;
            for (let len = list.length; len--; ) {
                if (list[len] === item) {
                    return len;
                }
            }

            return -1;
        });

        return Collection.prototype.IndexOf.call(this, ...params);
    }

    Remove(...params) {
        Collection.prototype.Remove = MethodOverload().Add(["*"], function (item) {
            let list = this.real.#list;
            for (let len = list.length; len--; ) {
                if (list[len] === item) {
                    return this.RemoveAt(len);
                }
            }

            return false;
        });

        return Collection.prototype.Remove.call(this, ...params);
    }

    RemoveAt(...params) {
        Collection.prototype.RemoveAt = MethodOverload().Add([Number], async function (index) {
            let list = this.real.#list;
            if (index > list.length) {
                throw new RangeError();
            }

            const item = list[index];

            let result = await this.OnChange.Dispatch(this, { type: "remove", item, index });
            for (let i = 0; i < result.length; i++) {
                if (typeof result === "boolean" && !result) return false;
            }

            list.splice(index, 1);
            return true;
        });

        return Collection.prototype.RemoveAt.call(this, ...params);
    }

    Dispose(...params) {
        Collection.prototype.Dispose = MethodOverload().Add([], function () {
            let real = this.real;

            real.#isDisposed = true;
            real.#type = null;
            real.#proxy = null;
            real.#readOnlyProxy = null;
            real.#findByString = null;
            real.#list = null;
            real.#onChange.Clear();
            real.#onChange = null;

            return true;
        });

        return Collection.prototype.Dispose.call(this, ...params);
    }

    ToString(...params) {
        Collection.prototype.ToString = MethodOverload().Add([], function () {
            return JSON.stringify(this.real.#list);
        });

        return Collection.prototype.ToString.call(this, ...params);
    }

    ToArray(...params) {
        Collection.prototype.ToArray = MethodOverload().Add([], function () {
            let list = [];

            for (let i = 0; i < this.real.#list.length; i++) {
                list.push(this.real.#list[i]);
            }

            return list;
        });

        return Collection.prototype.ToArray.call(this, ...params);
    }
}
