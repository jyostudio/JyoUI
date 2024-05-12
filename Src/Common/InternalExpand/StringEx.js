import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import Collection from "@JyoUI/Common/Collection.js";
import StringComparison from "./StringComparison.js";
import StringSplitOptions from "./StringSplitOptions.js";

export default class StringEx extends String {
    static get Empty() {
        return new StringEx();
    }

    get Length() {
        return this.length;
    }

    Clone(...params) {
        StringEx.prototype.Clone = MethodOverload().Add([], function () {
            return new StringEx(this);
        });

        return StringEx.prototype.Clone.call(this, ...params);
    }

    static Compare(...params) {
        StringEx.Compare = MethodOverload()
            .Add([String, String], function (strA, strB) {
                return StringEx.Compare.call(this, strA, strB, false);
            })
            .Add([String, String, Boolean], function (strA, strB, ignoreCase) {
                return StringEx.Compare.call(this, strA, 0, strB, 0, Math.min(strA.length, strB.length), ignoreCase ? StringComparison.CurrentCultureIgnoreCase : StringComparison.CurrentCulture);
            })
            .Add([String, String, StringComparison], function (strA, strB, comparisonType) {
                return StringEx.Compare.call(this, strA, 0, strB, 0, Math.min(strA.length, strB.length), comparisonType);
            })
            .Add([String, Number, String, Number, Number], function (strA, indexA, strB, indexB, length) {
                return StringEx.Compare.call(this, strA, indexA, strB, indexB, length, StringComparison.CurrentCulture);
            })
            .Add([String, Number, String, Number, Number, Boolean], function (strA, indexA, strB, indexB, length, ignoreCase) {
                return StringEx.Compare.call(this, strA, indexA, strB, indexB, length, ignoreCase ? StringComparison.CurrentCultureIgnoreCase : StringComparison.CurrentCulture);
            })
            .Add([String, Number, String, Number, Number, StringComparison], function (strA, indexA, strB, indexB, length, comparisonType) {
                if (length < 0) {
                    throw new RangeError(`length 超出范围`);
                }

                if (indexA < 0 || strA.length - indexA < 0) {
                    throw new RangeError(`indexA 索引超出范围。 必须为非负数并且小于集合的大小。`);
                }

                if (indexB < 0 || strB.length - indexB < 0) {
                    throw new RangeError(`indexB 索引超出范围。 必须为非负数并且小于集合的大小。`);
                }

                if (length == 0 || (strA == strB && indexA == indexB)) {
                    return 0;
                }

                let lengthA = length;
                let lengthB = length;

                if (strA.length - indexA < lengthA) {
                    lengthA = strA.length - indexA;
                }

                if (strB.length - indexB < lengthB) {
                    lengthB = strB.length - indexB;
                }

                strA = strA.substring(indexA, indexA + lengthA);
                strB = strB.substring(indexB, indexB + lengthB);

                switch (comparisonType) {
                    case StringComparison.CurrentCulture:
                    case StringComparison.InvariantCulture:
                        return strA.localeCompare(strB);
                    case StringComparison.InvariantCultureIgnoreCase:
                    case StringComparison.CurrentCultureIgnoreCase:
                        return strA.toLowerCase().localeCompare(strB.toLowerCase());
                    case StringComparison.Ordinal:
                        return strA.localeCompare(strB, null, { numeric: true });
                    case StringComparison.OrdinalIgnoreCase:
                        return strA.toLowerCase().localeCompare(strB.toLowerCase(), [], { numeric: true });
                    default:
                        throw new EvalError(`comparisonType 目前不支持传入的字符串比较类型`);
                }
            });

        return StringEx.Compare.call(this, ...params);
    }

    static CompareOrdinal(...params) {
        StringEx.CompareOrdinal = MethodOverload()
            .Add([String, String], function (strA, strB) {
                return StringEx.CompareOrdinal.call(this, strA, 0, strB, 0, Math.min(strA.length, strB.length));
            })
            .Add([String, Number, String, Number, Number], function (strA, indexA, strB, indexB, length) {
                return this.Compare(strA, indexA, strB, indexB, length, StringComparison.Ordinal);
            });

        return StringEx.CompareOrdinal.call(this, ...params);
    }

    static Concat(...params) {
        StringEx.Concat = MethodOverload()
            .Add([Array], function (args) {
                let result = "";
                for (let i = 0; i < args.length; i++) {
                    result += (args[i] && (args[i].ToString || args[i].toString)()) || "";
                }
                return new StringEx(result);
            })
            .Add([Object], function (arg0) {
                return StringEx.Concat.call(this, [arg0]);
            })
            .Add([Object, Object], function (arg0, arg1) {
                return StringEx.Concat.call(this, [arg0, arg1]);
            })
            .Add([Object, Object, Object], function (arg0, arg1, arg2) {
                return StringEx.Concat.call(this, [arg0, arg1, arg2]);
            })
            .Add([Object, Object, Object, Object], function (arg0, arg1, arg2, arg3) {
                return StringEx.Concat.call(this, [arg0, arg1, arg2, arg3]);
            });

        return StringEx.Concat.call(this, ...params);
    }

    static Copy(...params) {
        StringEx.Copy = MethodOverload().Add([String], function (str) {
            let result = "";
            for (let i = 0; i < str.length; i++) {
                result[i] = str[i];
            }
            return new StringEx(result);
        });

        return StringEx.Copy.call(this, ...params);
    }

    static Intern(...params) {
        StringEx.Intern = MethodOverload().Add([String], function (str) {
            return new StringEx(str);
        });

        return StringEx.Intern.call(this, ...params);
    }

    static IsInterned(...params) {
        StringEx.IsInterned = MethodOverload().Add([String], function (str) {
            return str;
        });

        return StringEx.IsInterned.call(this, ...params);
    }

    static IsNullOrEmpty(...params) {
        StringEx.IsNullOrEmpty = MethodOverload().Add([String], function (value) {
            return value == "";
        });

        return StringEx.IsNullOrEmpty.call(this, ...params);
    }

    static IsNullOrWhiteSpace(...params) {
        StringEx.IsNullOrWhiteSpace = MethodOverload().Add([String], function (value) {
            return value.Trim() == "";
        });

        return StringEx.IsNullOrWhiteSpace.call(this, ...params);
    }

    static Join(...params) {
        StringEx.Join = MethodOverload()
            .Add([String, Array, Number, Number], function (separator, values, startIndex, count) {
                let result = "";
                for (let i = startIndex; i < startIndex + count; i++) {
                    result += ((values[i] && (values[i].ToString || values[i].toString)()) || "") + (i != startIndex + count - 1 ? separator : "");
                }
                return new StringEx(result);
            })
            .Add([String, Array], function (separator, values) {
                return StringEx.Join.call(this, separator, values, 0, values.length);
            });

        return StringEx.Join.call(this, ...params);
    }

    static Format(...params) {
        StringEx.Format = MethodOverload()
            .Add([String, Object], function (format, arg0) {
                return StringEx.Format.call(this, [arg0]);
            })
            .Add([String, Object, Object], function (format, arg0, arg1) {
                return StringEx.Format.call(this, [arg0, arg1]);
            })
            .Add([String, Object, Object, Object], function (format, arg0, arg1, arg2) {
                return StringEx.Format.call(this, [arg0, arg1, arg2]);
            })
            .Add([String, Array], function (format, args) {
                for (var i = 0; i < args.length; i++) {
                    let reg = new RegExp("\\{" + i + "\\}", "g");
                    format = format.replace(reg, args[i + 1]);
                }
                return new StringEx(format);
            });

        return StringEx.Format.call(this, ...params);
    }

    CompareTo(...params) {
        StringEx.prototype.CompareTo = MethodOverload()
            .Add([String], function (strB) {
                return StringEx.Compare(this, strB);
            })
            .Add([Object], function (value) {
                return StringEx.Compare(this, String(value));
            });

        return StringEx.prototype.CompareTo.call(this, ...params);
    }

    Contains(...params) {
        StringEx.prototype.Contains = MethodOverload().Add([String], function (value) {
            return this.indexOf(value) >= 0;
        });

        return StringEx.prototype.Contains.call(this, ...params);
    }

    CopyTo(...params) {
        StringEx.prototype.CopyTo = MethodOverload().Add([Number, Array, Number, Number], function (sourceIndex, destination, destinationIndex, count) {
            for (let i = 0; i < count; i++) {
                destination[destinationIndex + i] = this[sourceIndex + i];
            }
        });

        return StringEx.prototype.CopyTo.call(this, ...params);
    }

    EndsWith(...params) {
        StringEx.prototype.EndsWith = MethodOverload().Add([String], function (value) {
            return this.indexOf(value) >= this.length - value.length;
        });

        return StringEx.prototype.EndsWith.call(this, ...params);
    }

    IndexOf(...params) {
        StringEx.prototype.IndexOf = MethodOverload()
            .Add([String], function (value) {
                return this.indexOf(value);
            })
            .Add([String, Number], function (value, startIndex) {
                return this.indexOf(value, startIndex);
            })
            .Add([String, Number, Number], function (value, startIndex, count) {
                return this.indexOf(value, startIndex, count);
            })
            .Add([String, StringComparison], function (value, comparisonType) {
                return StringEx.prototype.IndexOf.call(this, value, 0, this.length, comparisonType);
            })
            .Add([String, Number, StringComparison], function (value, startIndex, comparisonType) {
                return StringEx.prototype.IndexOf.call(this, value, startIndex, this.length - startIndex, comparisonType);
            })
            .Add([String, Number, Number, StringComparison], function (value, startIndex, count, comparisonType) {
                startIndex = Math.max(0, startIndex);
                if (startIndex != 0 || count != this.length) {
                    value = this.substring(startIndex, startIndex + count);
                }

                switch (comparisonType) {
                    case StringComparison.CurrentCulture:
                    case StringComparison.InvariantCulture:
                    case StringComparison.Ordinal:
                        return this.indexOf(value);
                    case StringComparison.CurrentCultureIgnoreCase:
                    case StringComparison.InvariantCultureIgnoreCase:
                    case StringComparison.OrdinalIgnoreCase:
                        return this.toLowerCase().indexOf(value.toLowerCase());
                    default:
                        throw new EvalError(`comparisonType 目前不支持传入的字符串比较类型`);
                }
            });

        return StringEx.prototype.IndexOf.call(this, ...params);
    }

    LastIndexOf(...params) {
        StringEx.prototype.IndexOf = MethodOverload()
            .Add([String], function (value) {
                return this.lastIndexOf(value);
            })
            .Add([String, Number], function (value, startIndex) {
                return this.lastIndexOf(value, startIndex);
            })
            .Add([String, Number, Number], function (value, startIndex, count) {
                return this.lastIndexOf(value, startIndex, count);
            })
            .Add([String, StringComparison], function (value, comparisonType) {
                return StringEx.prototype.LastIndexOf.call(this, value, 0, this.length, comparisonType);
            })
            .Add([String, Number, StringComparison], function (value, startIndex, comparisonType) {
                return StringEx.prototype.LastIndexOf.call(this, value, startIndex, this.length - startIndex, comparisonType);
            })
            .Add([String, Number, Number, StringComparison], function (value, startIndex, count, comparisonType) {
                startIndex = Math.max(0, startIndex);
                if (startIndex != 0 || count != this.length) {
                    value = this.substring(startIndex, startIndex + count);
                }

                switch (comparisonType) {
                    case StringComparison.CurrentCulture:
                    case StringComparison.InvariantCulture:
                    case StringComparison.Ordinal:
                        return this.lastIndexOf(value);
                    case StringComparison.CurrentCultureIgnoreCase:
                    case StringComparison.InvariantCultureIgnoreCase:
                    case StringComparison.OrdinalIgnoreCase:
                        return this.toLowerCase().lastIndexOf(value.toLowerCase());
                    default:
                        throw new EvalError(`comparisonType 目前不支持传入的字符串比较类型`);
                }
            });

        return StringEx.prototype.LastIndexOf.call(this, ...params);
    }

    IndexOfAny(...params) {
        StringEx.prototype.IndexOfAny = MethodOverload()
            .Add([[Array, Collection]], function (anyOf) {
                return StringEx.prototype.IndexOfAny.call(this, anyOf, 0, -1);
            })
            .Add([[Array, Collection], Number], function (anyOf, startIndex) {
                return StringEx.prototype.IndexOfAny.call(this, anyOf, startIndex, -1);
            })
            .Add([[Array, Collection], Number, Number], function (anyOf, startIndex, count) {
                startIndex = Math.max(0, isNaN(startIndex) ? 0 : startIndex);

                if (this == "") {
                    return -1;
                }

                count = isNaN(count) ? -1 : count >= 0 ? count : -1;
                let l = this.length;
                let endIndex;
                if (count < 0 || count > l - startIndex) {
                    endIndex = l;
                } else {
                    endIndex = startIndex + count;
                }

                if (!anyOf.length) {
                    return -1;
                }

                let subStr = this.substring(startIndex, endIndex);
                let list = [];

                for (let j = 0; j < anyOf.length; j++) {
                    let any = anyOf[j];
                    let index = subStr.indexOf("" + any);
                    if (index > -1) {
                        list.push(index);
                    }
                }

                if (list.length) {
                    return list.sort()[0] + startIndex;
                }

                return -1;
            });

        return StringEx.prototype.IndexOfAny.call(this, ...params);
    }

    LastIndexOfAny(...params) {
        StringEx.prototype.LastIndexOfAny = MethodOverload()
            .Add([[Array, Collection]], function (anyOf) {
                return StringEx.prototype.LastIndexOfAny.call(this, anyOf, 0, -1);
            })
            .Add([[Array, Collection], Number], function (anyOf, startIndex) {
                return StringEx.prototype.LastIndexOfAny.call(this, anyOf, startIndex, -1);
            })
            .Add([[Array, Collection], Number, Number], function (anyOf, startIndex, count) {
                startIndex = Math.max(0, isNaN(startIndex) ? 0 : startIndex);

                if (this == null || this == "") {
                    return -1;
                }

                count = isNaN(count) ? -1 : count >= 0 ? count : -1;
                let l = this.length;
                let endIndex;
                if (count < 0 || count > l - startIndex) {
                    endIndex = l;
                } else {
                    endIndex = startIndex + count;
                }

                if (!anyOf.length) {
                    return -1;
                }

                let subStr = this.substring(startIndex, endIndex);
                let list = [];

                for (let j = 0; j < anyOf.length; j++) {
                    let any = anyOf[j];
                    let index = subStr.lastIndexOf("" + any);
                    if (index > -1) {
                        list.push(index);
                    }
                }

                if (list.length) {
                    return list.sort((a, b) => (a > b ? -1 : 1))[0] + startIndex;
                }

                return -1;
            });

        return StringEx.prototype.LastIndexOfAny.call(this, ...params);
    }

    Insert(...params) {
        StringEx.prototype.Insert = MethodOverload().Add([Number, String], function (startIndex, value) {
            if (startIndex < 0 || startIndex > this.length) {
                throw new RangeError("startIndex");
            }

            return new StringEx(this.substring(0, startIndex) + value + this.substring(startIndex));
        });

        return StringEx.prototype.Insert.call(this, ...params);
    }

    PadLeft(...params) {
        StringEx.prototype.PadLeft = MethodOverload()
            .Add([Number], function (totalWidth) {
                return StringEx.prototype.PadLeft.call(this, totalWidth, " ");
            })
            .Add([Number, String], function (totalWidth, paddingChar) {
                if (totalWidth < 0) {
                    throw new RangeError("totalWidth");
                }

                if (paddingChar.length != 1) {
                    throw new Error("paddingChar");
                }

                if (this.length >= totalWidth) {
                    return new StringEx(this);
                }

                return new StringEx(this.padStart(totalWidth, paddingChar));
            });

        return StringEx.prototype.PadLeft.call(this, ...params);
    }

    PadRight(...params) {
        StringEx.prototype.PadRight = MethodOverload()
            .Add([Number], function (totalWidth) {
                return StringEx.prototype.PadRight.call(this, totalWidth, " ");
            })
            .Add([Number, String], function (totalWidth, paddingChar) {
                if (totalWidth < 0) {
                    throw new RangeError("totalWidth");
                }

                if (paddingChar.length != 1) {
                    throw new Error("paddingChar");
                }

                if (this.length >= totalWidth) {
                    return new StringEx(this);
                }

                return new StringEx(this.padEnd(totalWidth, paddingChar));
            });

        return StringEx.prototype.PadRight.call(this, ...params);
    }

    Remove(...params) {
        StringEx.prototype.Remove = MethodOverload()
            .Add([Number], function (startIndex) {
                return StringEx.prototype.Remove.call(this, startIndex, this.length - startIndex);
            })
            .Add([Number, Number], function (startIndex, count) {
                if (startIndex < 0 || startIndex > this.length) {
                    throw new RangeError("startIndex");
                }

                if (count < 0 || startIndex + count > this.length) {
                    throw new RangeError("count");
                }

                return new StringEx(this.substring(0, startIndex) + this.substring(startIndex + count));
            });

        return StringEx.prototype.Remove.call(this, ...params);
    }

    Replace(...params) {
        StringEx.prototype.Replace = MethodOverload().Add([String, String], function (oldValue, newValue) {
            if (StringEx.IsNullOrEmpty(oldValue)) {
                throw new Error("oldValue 不能为空");
            }

            return new StringEx(this.replaceAll(oldValue, newValue));
        });

        return StringEx.prototype.Replace.call(this, ...params);
    }

    Split(...params) {
        StringEx.prototype.Split = MethodOverload()
            .Add([Array], function (separator) {
                return StringEx.prototype.Split.call(this, separator, Number.MAX_SAFE_INTEGER, StringSplitOptions.None);
            })
            .Add([Array, Number], function (separator, count) {
                return StringEx.prototype.Split.call(this, separator, count, StringSplitOptions.None);
            })
            .Add([Array, Number, [StringSplitOptions, Number]], function (separator, count, options) {
                if (StringEx.IsNullOrEmpty(this) || count <= 0) {
                    return [];
                }

                let str = this;
                let tempChar = separator[0];

                for (let i = 1; i < separator.length; i++) {
                    str = str.split(separator[i]).join(tempChar);
                }

                str = str.split(tempChar);

                if (str.length > count) {
                    str.length = count;
                }

                if ((options & StringSplitOptions.TrimEntries) == StringSplitOptions.TrimEntries) {
                    for (let i = 0; i < str.length; i++) {
                        str[i] = str[i].replace(/\s+/g, "");
                    }
                }

                if ((options & StringSplitOptions.RemoveEmptyEntries) == StringSplitOptions.RemoveEmptyEntries) {
                    for (let i = str.length; i--; ) {
                        if (!str[i]) {
                            str.splice(i, 1);
                        }
                    }
                }

                return str.map(v => new StringEx(v));
            });

        return StringEx.prototype.Split.call(this, ...params);
    }

    StartsWith(...params) {
        StringEx.prototype.StartsWith = MethodOverload()
            .Add([String], function (value) {
                return StringEx.prototype.StartsWith.call(this, value, StringComparison.CurrentCulture);
            })
            .Add([String, StringComparison], function (value, comparisonType) {
                switch (comparisonType) {
                    case StringComparison.CurrentCulture:
                    case StringComparison.Ordinal:
                    case StringComparison.InvariantCulture:
                        return new RegExp("^" + value).test(this);
                    case StringComparison.CurrentCultureIgnoreCase:
                    case StringComparison.OrdinalIgnoreCase:
                    case StringComparison.InvariantCultureIgnoreCase:
                        return new RegExp("^" + value, "i").test(this);
                    default:
                        throw new EvalError(`comparisonType 目前不支持传入的字符串比较类型`);
                }
            });

        return StringEx.prototype.StartsWith.call(this, ...params);
    }

    Substring(...params) {
        StringEx.prototype.Substring = MethodOverload()
            .Add([Number], function (startIndex) {
                return StringEx.prototype.Substring.call(this, startIndex, this.length - startIndex);
            })
            .Add([Number, Number], function (startIndex, length) {
                if (startIndex < 0 || startIndex > this.length) {
                    throw new RangeError("startIndex");
                }

                if (length < 0 || startIndex + length > this.length) {
                    throw new RangeError("length");
                }

                return new StringEx(this.substring(startIndex, startIndex + length));
            });

        return StringEx.prototype.Substring.call(this, ...params);
    }

    ToCharArray(...params) {
        StringEx.prototype.ToCharArray = MethodOverload()
            .Add([], function () {
                return this.split("");
            })
            .Add([Number, Number], function (startIndex, length) {
                if (startIndex < 0 || startIndex > this.length) {
                    throw new RangeError("startIndex");
                }

                if (length < 0 || startIndex + length > this.length) {
                    throw new RangeError("length");
                }

                return this.substring(startIndex, startIndex + length).split("");
            });

        return StringEx.prototype.ToCharArray.call(this, ...params);
    }

    ToLower(...params) {
        StringEx.prototype.ToLower = MethodOverload().Add([], function () {
            return new StringEx(this.toLowerCase());
        });

        return StringEx.prototype.ToLower.call(this, ...params);
    }

    ToLowerInvariant(...params) {
        StringEx.prototype.ToLowerInvariant = MethodOverload().Add([], function () {
            return new StringEx(this.toLowerCase());
        });

        return StringEx.prototype.ToLowerInvariant.call(this, ...params);
    }

    ToUpper(...params) {
        StringEx.prototype.ToUpper = MethodOverload().Add([], function () {
            return new StringEx(this.toUpperCase());
        });

        return StringEx.prototype.ToUpper.call(this, ...params);
    }

    ToUpperInvariant(...params) {
        StringEx.prototype.ToUpperInvariant = MethodOverload().Add([], function () {
            return new StringEx(this.toUpperCase());
        });

        return StringEx.prototype.ToUpperInvariant.call(this, ...params);
    }

    Trim(...params) {
        StringEx.prototype.Trim = MethodOverload()
            .Add([], function () {
                return this.TrimStart().TrimEnd();
            })
            .Add([[Array, null]], function (trimChars) {
                return this.TrimStart(trimChars).TrimEnd(trimChars);
            });

        return StringEx.prototype.Trim.call(this, ...params);
    }

    TrimEnd(...params) {
        StringEx.prototype.TrimEnd = MethodOverload()
            .Add([], function () {
                return StringEx.prototype.TrimEnd.call(this, null);
            })
            .Add([[Array, null]], function (trimChars) {
                trimChars = trimChars || [" "];
                let deleteNum = 0;

                loopFor: for (let i = this.length; i--; ) {
                    for (let j = 0; j < trimChars.length; j++) {
                        if (this[i] == trimChars[j]) {
                            deleteNum++;
                            continue loopFor;
                        }
                    }
                    break;
                }

                return this.Remove(this.length - deleteNum, deleteNum);
            });

        return StringEx.prototype.TrimEnd.call(this, ...params);
    }

    TrimStart(...params) {
        StringEx.prototype.TrimStart = MethodOverload()
            .Add([], function () {
                return StringEx.prototype.TrimStart.call(this, null);
            })
            .Add([[Array, null]], function (trimChars) {
                trimChars = trimChars || [" "];
                let deleteNum = 0;

                loopFor: for (let i = 0; i < this.length; i++) {
                    for (let j = 0; j < trimChars.length; j++) {
                        if (this[i] == trimChars[j]) {
                            deleteNum++;
                            continue loopFor;
                        }
                    }
                    break;
                }

                return this.Remove(0, deleteNum);
            });

        return StringEx.prototype.TrimStart.call(this, ...params);
    }

    ToCamelCase(...params) {
        StringEx.prototype.ToCamelCase = MethodOverload().Add([], function () {
            return this.replace(/([A-Z])/g, " $1").replace(/^[A-Z]/, s => s.toLowerCase());
        });

        return StringEx.prototype.ToCamelCase.call(this, ...params);
    }

    ToPascalCase(...params) {
        StringEx.prototype.ToPascalCase = MethodOverload().Add([], function () {
            return this.replace(/([A-Z])/g, " $1")
                .replace(/^[A-Z]/, s => s.toUpperCase())
                .replace(/^[a-z]/, function (item) {
                    return item.toUpperCase();
                })
                .replace(/\-(\w)/g, function (item, $1) {
                    return $1.toUpperCase();
                });
        });

        return StringEx.prototype.ToPascalCase.call(this, ...params);
    }

    ToKebabCase(...params) {
        StringEx.prototype.ToKebabCase = MethodOverload().Add([], function () {
            return this.replace(/([A-Z])/g, "-$1").replace(/^[A-Z]/, s => s.toLowerCase());
        });

        return StringEx.prototype.ToKebabCase.call(this, ...params);
    }

    ToSnakeCase(...params) {
        StringEx.prototype.ToSnakeCase = MethodOverload().Add([], function () {
            return this.replace(/([A-Z])/g, "_$1").replace(/^[A-Z]/, s => s.toLowerCase());
        });

        return StringEx.prototype.ToSnakeCase.call(this, ...params);
    }

    GetHashCode(...params) {
        StringEx.prototype.GetHashCode = MethodOverload().Add([], function () {
            let hash = 0;
            if (this.length == 0) return hash;
            for (let i = 0; i < this.length; i++) {
                let char = this.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash = hash & hash;
            }
            return hash;
        });

        return StringEx.prototype.GetHashCode.call(this, ...params);
    }
}
