// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setTimeout(func, delay) {
    $.Schedule(delay, func);
    return func;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearTimeout(id) {
    $.CancelScheduled(id);
}

const console = {};

(() => {
    const METHODS = [
        "log",
        "info",
        "warn",
        "error",
        "group",
        "groupCollapsed",
        "groupEnd",
    ];

    for (const method of METHODS) {
        console[method] = (...args) => {
            $.Msg(`[${method}] `, ...args);
        };
    }
})();
