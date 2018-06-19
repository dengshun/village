const CharacterBase=require("CharacterBase");
cc.Class({
    extends:CharacterBase,
    properties:{
        _weaponNode:{
            type: cc.Node,
            serializable: false,
            default: null,
        },
        weaponNode: {
            get: function () {
                return this._weaponNode;
            },
            visible: false,
            type: cc.Node,
        },
    },
    onLoad: function () {
        this._super();
        this._weaponNode=cc.find("weapon",this.node);
    },

});