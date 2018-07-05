const BaseStuff = require("BaseStuff");
cc.Class({
    extends: BaseStuff,
    properties: {
        _bg: {
            type: cc.Node,
            default: null,
            serializable: false,
        },
        _arrow: {
            type: cc.Node,
            default: null,
            serializable: false,
        },
        _textComp: {
            type: cc.RichText,
            serializable: false,
            default: null,
        },
        _text: {
            default: "",
            serializable: false,
        },
        text: {
            set: function(value) {
                this._text = value;
                this._updateView();
            },
            get: function() {
                return this._text;
            },
            visible: false
        },
        _duration: {
            default: 3,
            serializable: false,
        },
        duration: {
            set: function(value) {
                this._duration = value;
            },
            get: function() {
                return this._duration;
            },
            visible: false,
        }
    },
    onLoad: function() {
        this._super();
        this._bg = cc.find("bg", this.node);
        this._arrow = cc.find("arrow", this.node);
        this._textComp = cc.find("text", this.node).getComponent(cc.RichText);
        this._updateView();
    },
    _updateView: function() {
        if (this._textComp) {
            this._textComp.string = this._text;
            // this.scheduleOnce(function() {
            this._validateSize();
            // })
            this.scheduleOnce(() => {
                if (this.owner) {
                    this.owner.removeStuff(this);
                    cc.log("removestfuf@@@@@@@@@@@@@@@@@@@@@@@@@@");
                }
            }, this._duration);
        }
    },
    _validateSize: function() {
        this._bg.height = this._textComp.node.height + 20;
        this._bg.width = this._textComp.node.width + 20;
    },
    renew: function(...args) {
        if (this._disposed) {
            this._super();
            this._text = "";
            this._textComp.string = "";
        }
    },
});