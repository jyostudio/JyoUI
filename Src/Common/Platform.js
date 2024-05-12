import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";
import themeManager from "@JyoUI/Common/ThemeManager.js";

export default class Platform extends Base {
    static GetCPUArchitecture(...params) {
        Platform.GetCPUArchitecture = MethodOverload().Add([], async function () {
            if (!navigator?.userAgentData?.getHighEntropyValues) {
                /**
                 * 不支持 CPU 特性检测时，尝试用 GPU 推断
                 */
                const gpuInfo = await this.GetGPUInfo();
                if (["Qualcomm", "Apple"].includes(gpuInfo.vendor)) {
                    return "ARM64";
                } else if (["NVDIA", "AMD", "ATI", "Intel"].includes(gpuInfo.vendor)) {
                    return "x86_64";
                }

                return "Unknown";
            }

            const ua = await navigator?.userAgentData?.getHighEntropyValues(["architecture", "bitness"]);

            if (ua.architecture === "x86") {
                if (ua.bitness === "64") {
                    return "x86_64";
                } else if (ua.bitness === "32") {
                    return "x86";
                }
            } else if (ua.architecture === "arm") {
                return "ARM" + ua.bitness;
            } else {
                return "Unknown";
            }
        });

        return Platform.GetCPUArchitecture.apply(this, ...params);
    }

    static GetGPUInfo(...params) {
        let canvas = null;
        let gl = null;
        Platform.GetGPUInfo = MethodOverload().Add([], async function () {
            const result = {
                vendor: "Unknown",
                adapter: "Unknown",
                renderer: "Unknown"
            };
            if (!canvas) {
                canvas = document.createElement("canvas");
                gl = canvas.getContext("webgl");
                gl.drawingBufferColorSpace = themeManager.SupportP3 ? "display-p3" : "srgb";
            }
            if (!gl) {
                return result;
            }

            function removeSomechars(str) {
                return str
                    .replace("Inc.", "")
                    .replace(/\(TM\)/gi, "")
                    .replace(/\(R\)/gi, "")
                    .replace(/ +/g, " ")
                    .replace(/\(0x.*?\)/gi, "")
                    .replace(/ +/g, " ")
                    .trimStart()
                    .trimEnd();
            }

            try {
                let debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
                if (!debugInfo) {
                    result.renderer = gl.getParameter(gl.RENDERER);
                } else {
                    result.vendor = removeSomechars(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    result.renderer = removeSomechars(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
                if (result.renderer.indexOf("ANGLE") === 0) {
                    let subInfo = /ANGLE\s?\((.*?)\)/i.exec(result.renderer);
                    subInfo = subInfo[1].split(",");
                    result.vendor = removeSomechars(subInfo[0]);
                    for (let l = ["Metal", "OpenGL", "Direct3D", "Vulkan"], i = 0; i < l.length; i++) {
                        if (subInfo[1].indexOf(l[i]) >= 0) {
                            result.renderer = l[i];
                            break;
                        }
                    }
                    if (subInfo[1].indexOf(":") >= 0) {
                        result.adapter = removeSomechars(subInfo[1].split(":")[1]);
                    } else {
                        result.adapter = subInfo[1];
                        result.adapter = result.adapter.split("Direct3D")[0].split("(")[0].trim();
                    }
                    if (result.adapter.indexOf("Qualcomm") === 0 || result.adapter.indexOf("Adreno") === 0) {
                        result.vendor = "Qualcomm";
                        if (result.adapter.indexOf("Qualcomm") < 0) {
                            result.adapter = "Qualcomm " + result.adapter;
                        }
                    }
                } else if (result.renderer.indexOf("Apple") === 0) {
                    result.vendor = "Apple";
                    result.adapter = result.renderer;
                    result.renderer = "Metal";
                } else if (result.renderer.indexOf("Radeon") === 0) {
                    result.vendor = "AMD";
                    result.adapter = result.renderer;
                    result.renderer = "Unknown";
                }
            } finally {
                return result;
            }
        });

        return Platform.GetGPUInfo.apply(this, ...params);
    }
}
