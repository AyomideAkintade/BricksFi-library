export default function bufferToString(buffer, encoding = "utf-8"){
    return Buffer.from(buffer).toString(encoding as BufferEncoding).replace(/\0/g, '');
}