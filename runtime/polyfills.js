function setTimeout(func, delay) {
    $.Schedule(delay, func);
    return func;
}

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
