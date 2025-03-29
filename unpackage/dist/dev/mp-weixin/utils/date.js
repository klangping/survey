"use strict";
function formatDate(timestamp) {
  if (!timestamp)
    return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
exports.formatDate = formatDate;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/date.js.map
