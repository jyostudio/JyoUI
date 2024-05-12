import Base from "@JyoUI/Common/Base.js";
import MethodOverload from "@JyoUI/Common/MethodOverload.js";

/**
 * 内部存储类
 * @extends Base
 */
export default class InternalStorage extends Base {
    /**
     * 内部存储
     * @type {Storage}
     */
    static #storage = null;

    /**
     * 用户目录
     * @type {FileSystemDirectoryHandle}
     */
    static #userDirectory = null;

    /**
     * 获取用户目录
     * @returns {FileSystemDirectoryHandle} 用户目录
     */
    static get UserDirectory() {
        return InternalStorage.#userDirectory;
    }

    constructor() {
        super();

        if (new.target === InternalStorage) {
            throw new TypeError(`无法创建 InternalStorage 的实例，因为它是一个静态类。`);
        }
    }

    /**
     * 获取内部存储目录
     * @returns {Storage} 内部存储目录
     */
    static async #GetStorageDirectory() {
        const persistedResult = await Promise.all([navigator.storage?.persisted?.(), navigator.permissions.query({ name: "persistent-storage" })]).then(([persisted, permission]) => {
            if (persisted || permission.state !== "denied") {
                return true;
            }
            return false;
        });

        await navigator.storage?.persist?.();
        if (persistedResult) {
            return await navigator.storage.getDirectory();
        }

        return null;
    }

    static GetApplicationDirectory(...params) {
        InternalStorage.GetApplicationDirectory = MethodOverload().Add(
            [Object],
            /**
             * 获取应用目录
             * @param {Object} app 应用实例(但不强制要求是Application的子类)
             * @returns {FileSystemDirectoryHandle} 应用目录
             */
            function (app) {
                return new Promise(async (resolve, reject) => {
                    const storage = await InternalStorage.#storage;
                    if (storage) {
                        const directoryHandle = await storage.getDirectoryHandle(app.Meta.UUID, { create: true });
                        resolve(directoryHandle);
                    } else {
                        reject();
                    }
                });
            }
        );

        return InternalStorage.GetApplicationDirectory.call(this, ...params);
    }

    static {
        InternalStorage.#storage = InternalStorage.#GetStorageDirectory();
        InternalStorage.#userDirectory = new Promise(async (resolve, reject) => {
            const storage = await InternalStorage.#storage;
            if (storage) {
                const directoryHandle = await storage.getDirectoryHandle("user", { create: true });
                resolve(directoryHandle);
            } else {
                reject();
            }
        });
    }
}
