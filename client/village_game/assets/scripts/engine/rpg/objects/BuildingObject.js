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
    },
    onLoad: function() {
        this._super();
        this._footNode = cc.find("foot", this.node);
    },
    showFoot: function(rect) {

    },
    hideFoot: function() {

    }
});