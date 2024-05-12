(function (g) {
    g.requestIdleCallback = g.requestIdleCallback ?? g.requestAnimationFrame;
})(window.globalThis = window.globalThis ?? window ?? global);