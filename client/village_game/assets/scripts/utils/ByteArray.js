let Endian = require("Endian");
let ByteArray = cc.Class({
    name:"ByteArray",
    properties: {
        buffer: {//ArrayBuffer
            get: function () {
                return this.data.buffer;
            },
            set: function (value) {
                this.data = new DataView(value);
            },
            type: ArrayBuffer,
        },
        dataView: {
            get: function () {
                return this.data;
            },
            set: function (value) {
                this.data = value;
                this._write_position = value.byteLength;
            },
            type: DataView,
        },
        bufferOffset: {
            get: function () {
                return this.data.byteOffset;
            }
        },
        position: {
            get: function () {
                return this._position;
            },
            set: function (value) {
                this._position = value;
                this._write_position = value > this._write_position ? value : this._write_position;
            }
        },
        length: {
            get: function () {
                return this._write_position;
            },
            set: function (value) {
                this._write_position = value;
                let tmp = new Uint8Array(new ArrayBuffer(value));
                let byteLength = this.data.buffer.byteLength;
                if (byteLength > value) {
                    this._position = value;
                }
                let length = Math.min(byteLength, value);
                tmp.set(new Uint8Array(this.data.buffer, 0, length));
                this.buffer = tmp.buffer;
            }
        },
        bytesAvailable: {
            get: function () {
                return this.data.byteLength - this._position;
            }
        },
        data: null,//DataView
        endian: "",
        EOF_byte: -1,
        EOF_code_point: -1,
        _BUFFER_EXT_SIZE: 0,
        _position: 0,
        _write_position: 0,
    },
    statics: {
        SIZE_OF_BOOLEAN: 1,
        SIZE_OF_INT8: 1,
        SIZE_OF_INT16: 2,
        SIZE_OF_INT32: 4,
        SIZE_OF_UINT8: 1,
        SIZE_OF_UINT16: 2,
        SIZE_OF_UINT32: 4,
        SIZE_OF_FLOAT32: 4,
        SIZE_OF_FLOAT64: 8,
    },
    ctor: function () {
        this._setArrayBuffer(new ArrayBuffer(this._BUFFER_EXT_SIZE));
        this.endian = Endian.BIG_ENDIAN;
    },
    _setArrayBuffer: function (buffer) {
        this._write_position = buffer.byteLength;
        this.data = new DataView(buffer);
        this._position = 0;
    },
    /**
     * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
     */
    readBoolean: function () {
        if (!this.validate(ByteArray.SIZE_OF_BOOLEAN)) return null;
        return this.data.getUint8(this.position++) != 0;
    },
    /**
     * 从字节流中读取带符号的字节 介于 -128 和 127 之间的整数
     */
    readByte: function () {
        if (!this.validate(ByteArray.SIZE_OF_INT8)) return null;
        return this.data.getInt8(this.position++);
    },
    /**
      * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
      * @param bytes 要将数据读入的 ByteArray 对象
      * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
      * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据N
      */
    readBytes: function (bytes, offset = 0, length = 0) {
        if (length == 0) {
            length = this.bytesAvailable;
        }
        else if (!this.validate(length)) {
            return null;
        }
        if (bytes) {
            bytes.validateBuffer(offset + length);
        }
        else {
            bytes = new ByteArray(new ArrayBuffer(offset + length));
        }
        //This method is expensive
        for (let i = 0; i < length; i++) {
            bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
        }
    },
    /**
      * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
      * @return 双精度（64 位）浮点数
      */
    readDouble: function () {
        if (!this.validate(ByteArray.SIZE_OF_FLOAT64)) return null;
        let value = this.data.getFloat64(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
        return value;
    },
    /**
      * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
      * @return 单精度（32 位）浮点数
      */
    readFloat: function () {
        if (!this.validate(ByteArray.SIZE_OF_FLOAT32)) return null;
        let value = this.data.getFloat32(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
        return value;
    },
    /**
     * 从字节流中读取一个带符号的 32 位整数
     * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
     */
    readInt: function () {
        if (!this.validate(ByteArray.SIZE_OF_INT32)) return null;
        let value = this.data.getInt32(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
        return value;
    },
    /**
     * 从字节流中读取一个带符号的 16 位整数
     * @return 介于 -32768 和 32767 之间的 16 位带符号整数
    */
    readShort: function () {
        if (!this.validate(ByteArray.SIZE_OF_INT16)) return null;
        let value = this.data.getInt16(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
        return value;
    },
    /**
    * 从字节流中读取无符号的字节
    * @return 介于 0 和 255 之间的 32 位无符号整数
    */
    readUnsignedByte: function () {
        if (!this.validate(ByteArray.SIZE_OF_UINT8)) return null;
        return this.data.getUint8(this.position++);
    },
    /**
    * 从字节流中读取一个无符号的 32 位整数
    * @return 介于 0 和 4294967295 之间的 32 位无符号整数
    */
    readUnsignedInt: function () {
        if (!this.validate(ByteArray.SIZE_OF_UINT32)) return null;
        let value = this.data.getUint32(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
        return value;
    },
    /**
     * 从字节流中读取一个无符号的 16 位整数
     * @return 介于 0 和 65535 之间的 16 位无符号整数
     */
    readUnsignedShort: function () {
        if (!this.validate(ByteArray.SIZE_OF_UINT16)) return null;

        let value = this.data.getUint16(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        return value;
    },
    /**
    * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
    * @return UTF-8 编码的字符串
    */
    readUTF: function () {  
        if (!this.validate(ByteArray.SIZE_OF_UINT16)) return null;

        let length = this.data.getUint16(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;

        if (length > 0) {
            return this.readUTFBytes(length);
        } else {
            return "";
        }
    },
    /**
     * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
     * @param length 指明 UTF-8 字节长度的无符号短整型数
     * @return 由指定长度的 UTF-8 字节组成的字符串
     */
    readUTFBytes: function (length) {
        if (!this.validate(length)) return null;
        let bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
        this.position += length;
        /*let bytes: Uint8Array = new Uint8Array(new ArrayBuffer(length));
         for (let i = 0; i < length; i++) {
         bytes[i] = this.data.getUint8(this.position++);
         }*/
        return this.decodeUTF8(bytes);
    },
    /**
     * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
     * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
     */
    writeBoolean: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);
        this.data.setUint8(this.position++, value ? 1 : 0);
    },
    /**
     * 在字节流中写入一个字节
     * 使用参数的低 8 位。忽略高 24 位
     * @param value 一个 32 位整数。低 8 位将被写入字节流
     */
    writeByte: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_INT8);
        this.data.setInt8(this.position++, value);
    },
    /**
     * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
     * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
     * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
     * @param bytes ByteArray 对象
     * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
     * @param length 一个无符号整数，表示在缓冲区中的写入范围
     */
    writeBytes: function (bytes, offset = 0, length = 0) {
        let writeLength;
        if (offset < 0) {
            return;
        }
        if (length < 0) {
            return;
        }
        else if (length == 0) {
            writeLength = bytes.length - offset;
        }
        else {
            writeLength = Math.min(bytes.length - offset, length);
        }
        if (writeLength > 0) {
            this.validateBuffer(writeLength);

            let tmp_data = new DataView(bytes.buffer);
            let length = writeLength;
            let BYTES_OF_UINT32 = 4;
            for (; length > BYTES_OF_UINT32; length -= BYTES_OF_UINT32) {
                this.data.setUint32(this._position, tmp_data.getUint32(offset));
                this.position += BYTES_OF_UINT32;
                offset += BYTES_OF_UINT32;
            }
            for (; length > 0; length--) {
                this.data.setUint8(this.position++, tmp_data.getUint8(offset++));
            }
        }
    },
    /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
     * @param value 双精度（64 位）浮点数
     */
    writeDouble: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);

        this.data.setFloat64(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
    },
    /**
     * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
     * @param value 单精度（32 位）浮点数
     */
    writeFloat: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);

        this.data.setFloat32(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
    },
    /**
     * 在字节流中写入一个带符号的 32 位整数
     * @param value 要写入字节流的整数
     */
    writeInt: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_INT32);

        this.data.setInt32(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
    },
    /**
     * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
     * @param value 32 位整数，该整数的低 16 位将被写入字节流
     */
    writeShort: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_INT16);

        this.data.setInt16(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
    },
    /**
     * 在字节流中写入一个无符号的 32 位整数
     * @param value 要写入字节流的无符号整数
     */
    writeUnsignedInt: function (value) {
        this.validateBuffer(ByteArray.SIZE_OF_UINT32);

        this.data.setUint32(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
    },
    /**
     * 在字节流中写入一个无符号的 16 位整数
     * @param value 要写入字节流的无符号整数
     */
    writeUnsignedShort:function(value) {
        this.validateBuffer(ByteArray.SIZE_OF_UINT16);

        this.data.setUint16(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
    },
    /**
     * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
     * @param value 要写入的字符串值
     */
    writeUTF: function (value) {
        let utf8bytes = this.encodeUTF8(value);
        let length = utf8bytes.length;

        this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);

        this.data.setUint16(this.position, length, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        this._writeUint8Array(utf8bytes, false);
    },
    /**
     * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
     * @param value 要写入的字符串值
     */
    writeUTFBytes: function (value) {
        this._writeUint8Array(this.encodeUTF8(value));
    },
    /**
     * @private
     * 将 Uint8Array 写入字节流
     * @param bytes 要写入的Uint8Array
     * @param validateBuffer
     */
    _writeUint8Array: function (bytes, validateBuffer = true) {
        if (validateBuffer) {
            this.validateBuffer(this.position + bytes.length);
        }

        for (let i = 0; i < bytes.length; i++) {
            this.data.setUint8(this.position++, bytes[i]);
        }
    },
    validate: function (len) {
        if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
            return true;
        } else {
            cc.error("ByteArray Error:遇到文件尾");
        }
    },
    validateBuffer: function (len, needReplace = false) {
        this._write_position = len > this._write_position ? len : this._write_position;
        len += this._position;
        if (this.data.byteLength < len || needReplace) {
            let tmp = new Uint8Array(new ArrayBuffer(len + this._BUFFER_EXT_SIZE));
            let length = Math.min(this.data.buffer.byteLength, len + this._BUFFER_EXT_SIZE);
            tmp.set(new Uint8Array(this.data.buffer, 0, length));
            this.buffer = tmp.buffer;
        }
    },
    decodeUTF8: function (data) {
        let fatal = false;
        let pos = 0;
        let result = "";
        let code_point;
        let utf8_code_point = 0;
        let utf8_bytes_needed = 0;
        let utf8_bytes_seen = 0;
        let utf8_lower_boundary = 0;

        while (data.length > pos) {

            let _byte = data[pos++];

            if (_byte == this.EOF_byte) {
                if (utf8_bytes_needed != 0) {
                    code_point = this.decoderError(fatal);
                } else {
                    code_point = this.EOF_code_point;
                }
            } else {

                if (utf8_bytes_needed == 0) {
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    } else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        } else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        } else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        } else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                } else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                } else {

                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

                    if (utf8_bytes_seen !== utf8_bytes_needed) {
                        code_point = null;
                    } else {

                        let cp = utf8_code_point;
                        let lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        } else {
                            code_point = this.decoderError(fatal, _byte);
                        }
                    }

                }
            }
            //Decode string
            if (code_point !== null && code_point !== this.EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0) result += String.fromCharCode(code_point);
                } else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }
        return result;
    },
    encodeUTF8: function (str) {
        let pos = 0;
        let codePoints = this.stringToCodePoints(str);
        let outputBytes = [];
        while (codePoints.length > pos) {
            let code_point = codePoints[pos++];

            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            } else {
                let count, offset;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                } else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                } else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
                }

                outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);

                while (count > 0) {
                    let temp = this.div(code_point, Math.pow(64, count - 1));
                    outputBytes.push(0x80 + (temp % 64));
                    count -= 1;
                }
            }
        }
        return new Uint8Array(outputBytes);
    },
    encoderError: function (code_point) {
        cc.error("ByteArray Error:EncodingError! The code point {0} could not be encoded.");
    },
    decoderError: function (fatal, opt_code_point = null) {
        if (fatal) {
            cc.error("ByteArray Error:DecodingError.");
        }
        return opt_code_point || 0xFFFD;
    },
    stringToCodePoints: function (string) {
        /** @type {Array.<number>} */
        let cps = [];
        // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
        let i = 0, n = string.length;
        while (i < string.length) {
            let c = string.charCodeAt(i);
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            } else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            } else { // (inRange(c, 0xD800, 0xDBFF))
                if (i == n - 1) {
                    cps.push(0xFFFD);
                } else {
                    let d = string.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        let a = c & 0x3FF;
                        let b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    } else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    },
    inRange: function (a, min, max) {
        return min <= a && a <= max;
    },
    div: function (n, d) {
        return Math.floor(n / d);
    },
    toString: function () {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    },
    clear: function () {
        this._setArrayBuffer(new ArrayBuffer(this._BUFFER_EXT_SIZE));
    },
});
module.exports=ByteArray;
