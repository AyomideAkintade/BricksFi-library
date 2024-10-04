"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uuidToUint8Array;
function uuidToUint8Array(uuid) {
    const hexString = uuid.replace(/-/g, '');
    const byteArray = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return byteArray;
}
//# sourceMappingURL=uuidToUint8Array.js.map