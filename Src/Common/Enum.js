import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";

export default class Enum extends Base {
    #value = null;

    #description = "";

    static #_constructor = function (...params) {
        Enum.#_constructor = MethodOverload()
            .Add([], function () {})
            .Add([Enum], function (value) {
                this.#value = value.#value;
            })
            .Add(["*"], function (value) {
                this.#value = value;
            })
            .Add([Enum, String], function (value, description) {
                this.#value = value.#value;
                this.#description = description;
            })
            .Add(["*", String], function (value, description) {
                this.#value = value;
                this.#description = description;
            });

        return Enum.#_constructor.call(this, ...params);
    };

    constructor(...params) {
        super();

        return Enum.#_constructor.call(this, ...params);
    }

    [Symbol.iterator] = function* () {
        yield this.#value;
    };

    static GetAllEnum(...params) {
        Enum.GetAllEnum = MethodOverload().Add([], function () {
            let list = [];
            let allNames = Object.getOwnPropertyNames(this);

            for (let i = 0; i < allNames.length; i++) {
                if ("prototype" === allNames[i]) {
                    continue;
                }

                let p = this[allNames[i]];
                if ("object" === typeof p && p instanceof Enum) {
                    list.push(p);
                }
            }

            return list;
        });

        return Enum.GetAllEnum.call(this, ...params);
    }

    static GetEnumByValue(...params) {
        Enum.GetEnumByValue = MethodOverload()
            .Add([Number], function (value) {
                let allEnum = this.GetAllEnum();
                for (let i = 0; i < allEnum.length; i++) {
                    if (allEnum[i].ToNumber() === value) {
                        return allEnum[i];
                    }
                }

                return new this(value);
            })
            .Add([String], function (value) {
                let allEnum = this.GetAllEnum();
                for (let i = 0; i < allEnum.length; i++) {
                    if (allEnum[i].ToString() === value) {
                        return allEnum[i];
                    }
                }

                return new this(value);
            })
            .Add([Boolean], function (value) {
                let allEnum = this.GetAllEnum();
                for (let i = 0; i < allEnum.length; i++) {
                    if (allEnum[i].ToBoolean() === value) {
                        return allEnum[i];
                    }
                }

                return new this(value);
            })
            .Add([Enum], function (value) {
                return this.GetEnumByValue(value.ToNumber());
            })
            .Add([Object], function (value) {
                let allEnum = this.GetAllEnum();
                for (let i = 0; i < allEnum.length; i++) {
                    if (allEnum[i].ToObject() === value) {
                        return allEnum[i];
                    }
                }

                return new this(value);
            });

        return Enum.GetEnumByValue.call(this, ...params);
    }

    static GetEnumByDescription(...params) {
        Enum.GetEnumByDescription = MethodOverload().Add([String], function (value) {
            let allEnum = this.GetAllEnum();
            for (let i = 0; i < allEnum.length; i++) {
                if (allEnum[i].GetDescription() === value) {
                    return allEnum[i];
                }
            }

            return new this(void 0, value);
        });

        return Enum.GetEnumByDescription.call(this, ...params);
    }

    valueOf() {
        return this.#value;
    }

    ToNumber() {
        return parseFloat(this.#value);
    }

    ToString() {
        return "" + (this.#value || "");
    }

    ToBoolean() {
        return !!this.#value;
    }

    ToObject() {
        return Object(this.#value);
    }

    GetDescription() {
        return this.#description;
    }
}
