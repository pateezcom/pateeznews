
export class AsyncLocalStorage {
    disable() { }
    getStore() {
        return undefined;
    }
    run(store, callback, ...args) {
        return callback(...args);
    }
    enterWith(store) { }
    exit(callback, ...args) {
        if (callback) {
            return callback(...args);
        }
    }
}

export default {
    AsyncLocalStorage
};
