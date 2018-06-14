let Socket_toc=cc.Class({
    properties: {
        _codeId: 0,
        codeId: {
            get: function () {
                return this._codeId;
            }
        }
    },
    decode:function(byte){

    },
    toString(){
        return "[消息号："+this._codeId+"]";
    }
});
module.exports = Socket_toc;