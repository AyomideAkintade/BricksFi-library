"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uint8ArrayToUUID;
function uint8ArrayToUUID(uint8Array) {
    if (!(uint8Array instanceof Uint8Array) || uint8Array.length !== 16) {
        throw new Error("Input must be a Uint8Array of length 16");
    }
    const hexString = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    return (hexString.substring(0, 8) + '-' +
        hexString.substring(8, 12) + '-' +
        hexString.substring(12, 16) + '-' +
        hexString.substring(16, 20) + '-' +
        hexString.substring(20));
}
//# sourceMappingURL=uint8ArrayToUUID.js.map