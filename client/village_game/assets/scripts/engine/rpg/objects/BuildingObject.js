const CharacterBase = require("CharacterBase");
cc.Class({
    extends: CharacterBase,
    properties: {
        _footNode: {
            type: cc.Node,
            serializable: false,
            default: null,
        },
        footNode: {
            get: function() {
                return this._footNode;
            },
            visible: false,
            type: cc.Node,
        },
        _footArea: {
            default: null,
            serializable: false,
        },
        footArea: {
            set: function(value) {
                this._footArea = value;
            },
            get: function() {
                return this._footArea;
            },
            visible: false,
        },
        _footVisible: {
            serializable: false,
            default: false,
        },
        footVisible: {
            set: function(value) {
                this._footVisible = value;
                if (this._footNode) {
                    this._showOrHideFoot();
                }
            },
            get: function() {
                return this._footVisible;
            },
            visible: false,
        }
    },
    onLoad: function() {
        this._super();
        this._footNode = cc.find("foot", this.node);
        this._showOrHideFoot();
    },
    _showOrHideFoot: function() {
        let g = this._footNode.getComponent(cc.Graphics);
        g.clear();
        if (this._footVisible) {
            this._footNode.active = true;
            var fillColor = new cc.Color(255, 0, 0, 190);
            g.fillColor = fillColor;
            var lineColor = new cc.Color(166, 10, 10, 255);
            g.strokeColor = lineColor;
            g.lineWidth = 2;
            g.moveTo(this._footArea.x, this._footArea.y);
            g.lineTo(this._footArea.x + this._footArea.width, this._footArea.y);
            g.lineTo(this._footArea.x + this._footArea.width, this._footArea.y - this._footArea.height);
            g.lineTo(this._footArea.x, this._footArea.y - this._footArea.height);
            g.lineTo(this._footArea.x, this._footArea.y);
            g.stroke();
            g.fill();
        } else {
            this._footNode.active = false;
        }
    },
});