const BaseStuff = require("BaseStuff");
cc.Class({
    extends: BaseStuff,
    properties: {
        _currentBlood: {
            type: cc.Integer,
            serializable: false,
            default: 100,
        },
        _maxBlood: {
            type: cc.Integer,
            serializable: false,
            default: 100,
        },
        currentBlood: {
            get: function () {
                return this._currentBlood;
            },
            visible: false,
        },
        maxBlood: {
            get: function () {
                return this._maxBlood;
            },
            visible: false,
        },
        _bloodBar: {
            type: cc.Node,
            serializable: false,
            default: null,
        },
    },
    onLoad: function(){
        this._bloodBar = cc.find("bar", this.node);
        this._updateProgress();
    },
    setBlood: function (current, max) {
        this._currentBlood = current;
        if (max) {
            this._maxBlood = max;
        }
        this._updateProgress();
    },
    _updateProgress:function(){
        if(this._bloodBar){
            let per = this._currentBlood / this._maxBlood;
            this._bloodBar.width = this.node.width * per;
        }
    },
    renew: function (...args) {
        if(this._disposed){
           this._super();
           this._currentBlood=100;
           this._maxBlood=100;
        }
    },
});