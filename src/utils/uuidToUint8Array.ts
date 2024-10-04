import { UUID } from "crypto";

export default function uuidToUint8Array(uuid: UUID) {
    const hexString = uuid.replace(/-/g, '');
    const byteArray = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }

    return byteArray;
}