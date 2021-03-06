const BaseStuff = require("BaseStuff");
cc.Class({
    extends: BaseStuff,
    properties: {
        _label: {
            type: cc.Label,
            serializable: false,
            default: null,
        },
        _text: {
            default: "",
            serializable: false,
        },
        _textColor: {
            serializable: false,
            default: new cc.Color(255, 255, 255)
        },
        textColor: {
            set: function(value) {
                this._textColor = value;
            },
            get: function() {
                return this._textColor;
            },
            visible: false
        },
        text: {
            set: function(value) {
                this._text = value;
                if (this._label) {
                    this._label.string = value;
                }
            },
            get: function() {
                return this._text;
            },
            visible: false
        }
    },
    onLoad: function() {
        this._super();
        cc.info("onlo ad.....................title" + this._text);
        this._label = this.node.getComponent(cc.Label);
        this.node.color = this._textColor;
        this._label.string = this._text;
    },
    renew: function(...args) {
        if (this._disposed) {
            this._super();
            this._text = "";
            this._label.string = "";
        }
    },
});