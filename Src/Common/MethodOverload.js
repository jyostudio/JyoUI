/**
 * 返回提供方法重载的闭包方法。
 */
export default function () {
    let types = [];
    let methods = [];
    let noMatchMethod = null;

    /**
     * 执行兜底方法。
     * @param {...any} params - 参数。
     * @returns {any} - 方法返回值。
     */
    function RunOther(...params) {
        if (noMatchMethod) {
            return noMatchMethod.call(this, ...params);
        }

        // 异常校验
        try {
            throw new Error();
        } catch (e) {
            let stackList = e.stack.split("\n");
            let newText = "";
            let newStackText = "\n";
            let errorMethodName = "";

            for (let i = 0; i < 2; i++) {
                stackList.shift();
            }

            stackList.forEach((v, i, arr) => {
                const textList = v.trimStart().trimEnd().split(" ");
                let fullMethodName = textList.length === 3 ? textList[1] : "(anonymous)";
                let methodName = fullMethodName.split(".");
                methodName = methodName[methodName.length - 1];

                arr[i] = {
                    fullMethodName,
                    methodName,
                    link: textList.length === 3 ? textList[2] : textList[1]
                };

                if (i === 0) {
                    errorMethodName += arr[i].methodName;
                } else {
                    newStackText += arr[i].methodName;
                    newStackText += "\t" + arr[i].link;
                    newStackText += "\n";
                }
            });

            let hasEqualLength = false;
            let findTypes = null;
            for (let i = 0; i < types.length; i++) {
                if (types[i].length === params.length) {
                    hasEqualLength = true;
                    findTypes = types[i];
                    break;
                }
            }

            if (!hasEqualLength) {
                newText += `"${errorMethodName}"方法没有采用 ${params.length} 个参数的重载`;
                newText += newStackText;
                console.error(newText);
                throw "";
            }

            let isAdd = false;
            for (let i = 0; i < findTypes.length; i++) {
                if (!MatchType(params[i], findTypes[i])) {
                    if (Array.isArray(findTypes[i])) {
                        const list = [];
                        findTypes[i].forEach(v => {
                            list.push(`"${GetTypeName(v)}"`);
                        });
                        let lastTypeName = list.pop();

                        newText += (isAdd ? "\n" : "") + `参数${i + 1}:无法从"${GetTypeName(params[i])}"转换为${list.join("、")}或${lastTypeName}`;
                    } else {
                        newText += (isAdd ? "\n" : "") + `参数${i + 1}:无法从"${GetTypeName(params[i])}"转换为"${GetTypeName(findTypes[i])}"`;
                    }
                    isAdd = true;
                }
            }

            newText += newStackText;
            throw newText;
        }
    }

    /**
     * 执行方法。
     * 这句注释一定要与函数体用空函数隔开。
     * 否则所有智能提示均会失效。
     * @param {...any} params - 参数。
     * @returns {any} - 方法返回值。
     */
    /** */
    function MethodOverload(...params) {
        if (typeof this === "object" && this.IsDisposed) {
            throw new ReferenceError("ObjectDisposed_Generic");
        }

        if (!types.length) {
            return RunOther.call(this, ...params);
        }

        let matchTypesLengthArray = [];

        for (let i = 0; i < types.length; i++) {
            if (types[i].length === params.length) {
                matchTypesLengthArray.push(i);
            }
        }

        matchTypesLoop: for (let i = 0; i < matchTypesLengthArray.length; i++) {
            let typeList = types[matchTypesLengthArray[i]];

            for (let n = 0; n < params.length; n++) {
                if (!MatchType(params[n], typeList[n])) {
                    continue matchTypesLoop;
                }
            }

            return methods[matchTypesLengthArray[i]].call(this, ...params);
        }

        return RunOther.call(this, ...params);
    }

    /**
     * 添加重载方法。
     * @param {Array} typeArr - 预判类型数组。
     * @param {Function} method - 方法。
     * @returns {MethodOverload} - 重载方法。
     */
    MethodOverload.Add = function (typeArr, method) {
        if (!Array.isArray(typeArr)) {
            throw new TypeError("typeArr 必须是一个 Array。");
        }

        if (typeof method !== "function") {
            throw new TypeError("method 必须是一个 Function。");
        }

        for (let i = 0; i < typeArr.length; i++) {
            let typeObj = typeArr[i];
            let isArray = Array.isArray(typeObj);
            if (typeof typeObj !== "function" && !isArray && "*" !== typeObj) {
                throw new Error("预判类型必须是一个 Class 、 Array 或 *。");
            }

            if (isArray) {
                for (let n = 0; n < typeObj.length; n++) {
                    if (typeof typeObj[n] !== "function" && typeObj[n] !== null && "*" !== typeObj[n]) {
                        throw new Error("预判类型列举内容必须是一个 Class 、 null 或 *。");
                    }
                }
            }
        }

        types.push(typeArr);
        methods.push(method);

        return MethodOverload;
    };

    /**
     * 设置兜底函数。
     * @param {Function} method - 方法。
     * @returns {MethodOverload} - 重载方法。
     */
    MethodOverload.Other = function (method) {
        if (typeof method !== "function") {
            throw new TypeError("method 必须是一个 Function。");
        }

        noMatchMethod = method;

        return MethodOverload;
    };

    MethodOverload._types = types;
    MethodOverload._methods = methods;

    return MethodOverload;
}

/**
 * 匹配类型。
 * @param {any} param - 要判断的数据。
 * @param {any} type - 与之判断的类型。
 * @returns {Boolean} - 是否匹配成功。
 */
function MatchType(param, type) {
    if (Array.isArray(type)) {
        for (let i = 0; i < type.length; i++) {
            if (MatchType(param, type[i])) {
                return true;
            }
        }
        return false;
    }

    if (typeof type !== "function") {
        if (type === "*" || (type === null && param === null) || type === typeof param) {
            return true;
        }
    } else {
        switch (typeof param) {
            case "function":
            case "object":
                break;
            default:
                param = Object(param);
                break;
        }

        if (param !== null && param["#isCollection"]) {
            return param.GetType() === type["#internalType"] || (typeof type["#internalType"] === "undefined" && param?.toString?.() === "[object Collection]");
        }

        if (param instanceof type || param === type) {
            return true;
        }
    }

    return false;
}

/**
 * 获取类型名称
 * @param {Object} param 参数对象
 * @returns {String} 类型名称
 */
function GetTypeName(param) {
    if (param === null) {
        return "null";
    }

    if (param === "*") {
        return "任意值";
    }

    switch (typeof param) {
        case "number":
            return "Number";
        case "string":
            return "String";
        case "bigint":
            return "BigInt";
        case "boolean":
            return "Boolean";
        case "symbol":
            return "Symbol";
        case "undefined":
            return "未定义";
        case "function":
            if ((param.name || param.constructor.name) === "anonymous") {
                return "匿名方法";
            }
            break;
    }

    if (param["#isCollection"] || param["#internalType"]) {
        const type = param["#internalType"] || param.GetType();
        return `${param?.name || param?.constructor?.name}<${type?.name || type?.constructor?.name}>`;
    }

    return param.name || param.constructor.name;
}
