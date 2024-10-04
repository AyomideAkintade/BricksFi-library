"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bufferToString;
function bufferToString(buffer, encoding = "utf-8") {
    return Buffer.from(buffer).toString(encoding).replace(/\0/g, '');
}
//# sourceMappingURL=bufferToString.js.map