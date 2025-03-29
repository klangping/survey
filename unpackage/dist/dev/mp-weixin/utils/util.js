"use strict";
function debounce(fn, delay = 500, immediate = false) {
  let timer = null;
  return function(...args) {
    if (timer)
      clearTimeout(timer);
    if (immediate && !timer) {
      fn.apply(this, args);
    }
    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(this, args);
      }
      timer = null;
    }, delay);
  };
}
exports.debounce = debounce;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/util.js.map
