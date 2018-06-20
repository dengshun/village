var CustomSocket = require("CustomSocket");
var BaseModule = require("BaseModule");
cc.Class({
    extends: BaseModule,
    properties: {
        _lineSocket: CustomSocket,
        _sceneSocket: CustomSocket,
        _protosManager: null,
    },
    onLoad: function () {
        this._super();
    },
    messageHandler: function (message) {
        switch (message.actionType) {
            case cc.hj.InternalOrders.SEND_MSG_TO_SERVER:
                this.sendData(message.body);
                break;
            case cc.hj.InternalOrders.SEND_MSG_TO_SERVER2:
                this.sendData2(message.body);
                break;
            case cc.hj.InternalOrders.INIT_SCENE_SOCKET:
                var ip = message.body.ip;
                var port = message.body.port;
                this.init2(ip, port);
                break;
            case cc.hj.InternalOrders.CLOSE_SCENE_SOCKET:
                this._closeSceneSocket();
                break;
        }
    },
    init: function (host, port) {
        this._protosManager = cc.hj.protoMgr;
        this._lineSocket = new CustomSocket();
        this._lineSocket.addCallBacks(this._onConnect, this._onClose, this._onSocketData, this._onError, this);
        this._lineSocket.connect(host, port);
    },
    init2: function (host, port) {
        if (host == this._lineSocket.host && port == this._lineSocket.port) {
            this._sceneSocket = this._lineSocket;
            this._onSceneConnect();
        } else {
            if (this._sceneSocket == null) {
                this._sceneSocket = new CustomSocket();
            }
            this._sceneSocket.addCallBacks(this._onSceneConnect, this._onSceneClose, this._onSceneSocketData, this._onSceneError, this);
            this._sceneSocket.connect(host, port);
        }
    },
    _closeSceneSocket: function () {
        if (this._sceneSocket != null && this._lineSocket != this._sceneSocket) {
            this._sceneSocket.close();
            cc.hj.Global.sceneConnected = false;
        }
    },
    _onConnect: function () {
        cc.hj.Global.connected = true;
        this.sendToModules(cc.hj.InternalOrders.SOCKET_CONNECTED, [cc.hj.ModuleConst.LOGIN_MODULE]);
    },
    _onSceneConnect: function () {
        cc.hj.Global.sceneConnected = true;
        this.sendToModules(cc.hj.InternalOrders.SCENE_SOCKET_CONNECTED, [cc.hj.ModuleConst.MAINVIEW_MODULE]);
    },
    _onClose: function () {
        cc.hj.Global.connected = false;
        if(this._lineSocket == this._sceneSocket){
            cc.hj.Global.sceneConnected = false;
        }
    },
    _onSceneClose: function () {
        cc.hj.Global.sceneConnected = false;
    },
    _onError: function () {
        cc.hj.Global.connected = false;
        if(this._lineSocket == this._sceneSocket){
            cc.hj.Global.sceneConnected = false;
        }
    },
    _onSceneError: function () {
        cc.hj.Global.sceneConnected = false;
    },
    _onSocketData: function () {
        while (this._lineSocket.messageArray.length > 0) {
            var arr = this._lineSocket.messageArray.shift();
            var code = String(arr[0]);
            var byte = arr[1];
            this._receivedMsg(code, byte);
        }
    },
    _onSceneSocketData: function () {
        while (this._sceneSocket.messageArray.length > 0) {
            var arr = this._sceneSocket.messageArray.shift();
            var code = String(arr[0]);
            var byte = arr[1];
            this._receivedMsg(code, byte);
        }
    },
    _receivedMsg: function (code, byte) {
        var vo = this._protosManager.getProtoObjectByAlias(code);
        if (vo) {
            if (code != cc.hj.ServiceOrders.ORDER_TOC_10028 && code != cc.hj.ServiceOrders.ORDER_TOC_20003) {
                cc.info('【消息号 ' + code + '】收到消息!!');
            }
            vo.decode(byte);
            byte.clear();

            var modules = cc.hj.moduleMgr.hash;
            modules.forEach(function (module) {
                if (module.orders.indexOf(code) >= 0) {
                    this.sendToModules(code, [module.moduleId], vo);
                }
            }, this);
        }
        else {
            cc.info('【消息号 ' + code + '】对应的vo不存在!!');
        }
    },
    sendData: function (data) {
        cc.info('发送请求：' + data.codeId);
        this._lineSocket.doSend(data.codeId, data.encode());
    },
    sendData2: function (data) {
        cc.info('场景发送请求：' + data.codeId);
        this._sceneSocket.doSend(data.codeId, data.encode());
    }
});
