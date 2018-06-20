var ByteArray = require("ByteArray");
var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
var CustomSocket = cc.Class({
    name: "CustomSocket",
    statics: {
        ////
        MESSAGE_HEAD: 5120,
        //缓冲区最大长度
        BUFFER_MAX_LENGTH: 100000,
        //包头长度		
        PACKAGE_HEAD_LEN: 8,
    },
    properties: {
        _onConnect: null,
        _onClose: null,
        _onSocketData: null,
        _onError: null,
        _thisObject: null,
        messageArray: [],
        //ip
        _host: "",
        host:{
            get:function(){
                return this._host;
            }
        },
        //端口
        _port: 0,
        port:{
            get:function(){
                return this._port;
            }
        },
        //接受数据的缓冲区；
        _bufferByteArray: null,
        //websocket
        _webSocket: null,
        _connecting: false,
        _connected: false,
        _bytesWrite: false,
        _readByte: null,
        _writeByte: null,
    },
    ctor: function () {
        this._bufferByteArray = new ByteArray();
        this._readByte = new ByteArray();
        this._writeByte = new ByteArray();
    },
    addCallBacks: function (onConnect, onClose, onSocketData, onError, thisObject) {
        this._onConnect = onConnect;
        this._onClose = onClose;
        this._onSocketData = onSocketData;
        this._onError = onError;
        this._thisObject = thisObject;
    },
    connect: function (host, port) {
        if (!this._connecting && !this._connected) {
            if (cc.sys.isBrowser) {
                if (!window["WebSocket"]) {
                    cc.error("不支持WebSocket");
                    return;
                }
            }
            this._connecting = true;
            this._host = host;
            this._port = port;
            if (host) {
                var url = "ws://" + host + ":" + port + "/ws";
                this._webSocket = new WebSocket(url);
                this._webSocket.binaryType = "arraybuffer";
                this._bindEvent();
            }
        }
    },
    _bindEvent: function () {
        var self = this;
        this._webSocket.onopen = function (evt) {
            cc.info("webSocket was opened.");
            self._connected = true;
            self._connecting = false;
            if (self._onConnect != null) {
                self._onConnect.call(self._thisObject);
            }
        };

        this._webSocket.onmessage = function (evt) {
            cc.info("webSocket received message.");
            self._readByte._writeUint8Array(new Uint8Array(evt.data));
            self._socketDataHandler();
        };

        this._webSocket.onerror = function (evt) {
            cc.info("webSocket Error was fired");
            self._connecting = false;
            if (self._onError != null) {
                self._onError.call(self._thisObject);
            }
        };

        this._webSocket.onclose = function (evt) {
            cc.info("websocket instance closed.");
            self._connected = false;
            self._webSocket = null;
            if (self._onClose != null) {
                self._onClose.call(self._thisObject);
            }
        };
    },
    close: function () {
        if (this._connected) {
            this._webSocket.close();
        }
    },
    /** 接收服务器传来的数据*/
    _socketDataHandler: function () {
        // //将数据写入缓冲区
        // this.readBytes(this._bufferByteArray);
        // //读取缓冲区数据
        // this._readSocketData();
        this._readSocketData2();
    },
    _readSocketData2: function () {
        this._readByte.position = 0;
        var msgLen = this._readByte.length;
        //消息ID
        var msgID = this._readByte.readShort();
        var dataBuf = new ByteArray();
        var contentLen = msgLen - 2;
        if (contentLen > 0) {
            this._readByte.readBytes(dataBuf, 0, contentLen);
        }
        this.messageArray.push([msgID, dataBuf]);
        this._readByte.clear();
        if (this._onSocketData != null) {
            this._onSocketData.call(this._thisObject);
        }
    },
    // /** 读取缓冲区数据*/
    // _readSocketData: function () {
    //     var bufferPosition;//记录当前缓冲区的指针；
    //     var msgLen;//得到该数据包的包体长度
    //     var headLen = CustomSocket.PACKAGE_HEAD_LEN;
    //     var msgID;

    //     //保证消息长度大于包头总长度
    //     while (this._bufferByteArray.bytesAvailable >= headLen) {
    //         bufferPosition = this._bufferByteArray.position;
    //         //消息头MESSAGE_HEAD
    //         var head = "";
    //         head += this._bufferByteArray.readByte().toString();
    //         head += this._bufferByteArray.readByte().toString();
    //         head += this._bufferByteArray.readByte().toString();
    //         head += this._bufferByteArray.readByte().toString();
    //         //包体长度
    //         msgLen = this._bufferByteArray.readInt();
    //         if (msgLen > this._bufferByteArray.bytesAvailable) {
    //             //长度不够，还原指针等待缓冲区下一次读取
    //             this._bufferByteArray.position = bufferPosition;
    //             return;
    //         }
    //         else {
    //             //消息ID
    //             msgID = this._bufferByteArray.readShort();
    //             var dataBuf = new ByteArray();
    //             var contentLen = msgLen - 2;
    //             if (contentLen > 0)
    //                 this._bufferByteArray.readBytes(dataBuf, 0, contentLen);
    //             this.messageArray.push([msgID, dataBuf]);
    //         }
    //     }
    //     if (this._bufferByteArray.bytesAvailable == 0) {
    //         this._bufferByteArray.clear();
    //     }
    //     if (this.messageArray.length > 0) {
    //         if (this._onSocketData != null)
    //             this._onSocketData.call(this._thisObject);
    //     }
    // },
    doSend: function (msgID, byteData) {
        byteData.position = 0;
        var bytes = new ByteArray;
        //消息头
        // bytes.writeByte(5);
        // bytes.writeByte(1);
        // bytes.writeByte(2);
        // bytes.writeByte(0);
        // bytes.writeInt(byteData.length + 2);
        //消息ID
        bytes.writeShort(msgID);
        bytes.writeBytes(byteData);
        bytes.position = 0;
        this.writeBytes(bytes, 0, bytes.bytesAvailable);
    },
    /**
     * 从套接字读取 length 参数指定的数据字节数。从 offset 所表示的位置开始，将这些字节读入指定的字节数组
     * @param bytes 要将数据读入的 ByteArray 对象
     * @param offset 数据读取的偏移量应从该字节数组中开始
     * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
     */
    readBytes: function (bytes, offset = 0, length = 0) {
        this._readByte.position = 0;
        this._readByte.readBytes(bytes, offset, length);
        this._readByte.clear();
    },
    /**
     * 从指定的字节数组写入一系列字节。写入操作从 offset 指定的位置开始。
     * 如果省略了 length 参数，则默认长度 0 将导致该方法从 offset 开始写入整个缓冲区。
     * 如果还省略了 offset 参数，则写入整个缓冲区。
     * @param bytes 要从中读取数据的 ByteArray 对象
     * @param offset ByteArray 对象中从零开始的偏移量，应由此开始执行数据写入
     * @param length 要写入的字节数。默认值 0 导致从 offset 参数指定的值开始写入整个缓冲区
     */
    writeBytes: function (bytes, offset = 0, length = 0) {
        if (!this._connected) {
            cc.error("请先连接WebSocket");
            return;
        }
        this._bytesWrite = true;
        this._writeByte.writeBytes(bytes, offset, length);
        this.flush();
    },
    flush: function () {
        if (!this._connected) {
            cc.error("请先连接WebSocket");
            return;
        }
        if (this._bytesWrite) {
            this._webSocket.send(this._writeByte.buffer);
            this._bytesWrite = false;
            this._writeByte.clear();
        }
    }
});
module.exports = CustomSocket;