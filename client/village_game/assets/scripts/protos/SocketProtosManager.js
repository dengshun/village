let SocketProtosManager = cc.Class({
    name: "SocketProtosManager",
    statics: {
        _instance: null,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new SocketProtosManager();
            }
            return this._instance;
        }
    },
    properties: {
        _protos: null,
    },
    init: function() {
        this._protos = [];
        //tos

        //toc
    },
    registerClassAlias: function(codeId, refClass) {
        this._protos.push({ codeId: String(codeId), refClass: refClass });
    },
    getProtoObjectByAlias: function(codeId) {
        let len = this._protos.length;
        for (let i = 0; i < len; i++) {
            let protoObj = this._protos[i];
            if (protoObj.codeId == codeId) {
                return new protoObj.refClass();
            }
        }
        return null;
    }
});
module.exports = SocketProtosManager;