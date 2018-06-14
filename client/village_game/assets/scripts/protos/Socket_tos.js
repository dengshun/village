let ByteArray = require("ByteArray");
let Socket_tos = cc.Class({
    properties: {
        _bytes: null,
        _codeId:0,
        codeId:{
            get:function(){
                return this._codeId;
            }
        }
    },
    ctor: function () {
        this._bytes = new ByteArray();
    },
    encode: function () {
        return this._bytes;
    },
    writeString: function (value) {
        this._bytes.writeUTF(value);
    },
    writeByte: function (value) {
        this._bytes.writeByte(value);
    },
    writeShort: function (value) {
        this._bytes.writeShort(value);
    },
    writeBoolean: function (value) {
        this._bytes.writeBoolean(value);
    },
    writeInt: function (value) {
        this._bytes.writeInt(value);
    },
    writeDouble: function (value) {
        this._bytes.writeDouble(value);
    },
    writeBytes: function (value) {
        value.position = 0;
        this._bytes.writeBytes(value);
    },
    toString(){
        return "[消息号："+this._codeId+"]";
    }

});
module.exports = Socket_tos;