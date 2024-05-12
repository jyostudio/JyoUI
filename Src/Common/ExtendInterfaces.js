import { RegisterSubType } from "@JyoUI/Common/Interface.js";

function mix(target, ...mixins) {
    for (let mixin of mixins) {
        copyProperties(true, target, mixin, target.name, mixin.name);
        copyProperties(false, target.prototype, mixin.prototype, target.name, mixin.name);
    }
}

function copyProperties(isStatic, target, source, name, name1) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== "constructor" && key !== "prototype" && key !== "name") {
            if (!(key in target)) {
                try {
                    if (isStatic) {
                        throw new SyntaxError(`'${name}' 未实现接口静态成员 '${name1}.${key}'。`);
                    } else {
                        throw new SyntaxError(`'${name}.prototype' 未实现接口成员 '${name1}.prototype.${key}'。`);
                    }
                } catch (ex) {
                    let stackList = ex.stack.split("\n");
                    let newText = ex.message;
                    for (let i = 0; i < 4; i++) {
                        stackList.shift();
                    }
                    newText += "\n" + stackList.join("\n");
                    throw newText;
                }
            }
        }
    }
}

/**
 * 指定一个类进行接口的继承
 * @param {T} target 类
 * @param {Array<Interface>} interfaces 要继承的接口
 */
export default function (namedClass, ...interfaces) {
    mix(namedClass, ...interfaces);

    interfaces.forEach(v => RegisterSubType(v, namedClass));

    return namedClass;
}
