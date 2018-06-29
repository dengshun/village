const GraphicsBase = require("GraphicsBase");
const Actions = require("Actions");
let SpriteGraphics = cc.Class({
    name: "SpriteGraphics",
    extends: GraphicsBase,
    properties: {
        _bodyName: "",
        _nowAction: "stand",
        _parts: null,
        _bodyNode: {
            type: cc.Node,
            serializable: false,
            default: null,
        },
        bodyNode: {
            set: function(value) {
                this._bodyNode = value;
            },
            get: function() {
                return this._bodyNode;
            },
            visible: false,
            override: true,
        },
        _isReady: false,
        isReady: {
            get: function() {
                return this._isReady;
            },
            visible: false,
            override: true,
        },
        _directionNum: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _avatarHeight_: {
            type: cc.Integer,
            default: 80,
            serializable: false,
        },
        avatarHeight: {
            get: function() {
                return this._avatarHeight_;
            },
            set: function(v) {
                this._avatarHeight_ = v;
            },
            visible: false,
            override: true,
        },
        _spriteAtlas: {
            type: cc.SpriteAtlas,
            default: null,
            serializable: false
        },
        spriteAtlas: {
            set: function(value) {
                this._spriteAtlas = value;
            },
            get: function() {
                return this._spriteAtlas;
            },
            visible: false,
        }
    },
    ctor: function() {},

    addPart: function(type, id) {
        if (this._parts == null) {
            this._parts = [];
        }
        this._parts.push({ type: type, id: id });
        let gName = id;
        if (type == SceneConst.BODY_TYPE || type == SceneConst.EFFECT_TYPE) {
            this._bodyName = gName;
        }
        this._updateBodyGraphics();
    },
    _updateBodyGraphics: function() {
        if (this._bodyName && this._bodyNode && this._spriteAtlas) {
            let sf = this._spriteAtlas.getSpriteFrame(this._bodyName);
            if (sf) {
                let sp = this._bodyNode.getComponent(cc.Sprite);
                if (!sp) {
                    sp = target.addComponent(cc.Sprite);
                }
                sp.spriteFrame = sf;
                this._isReady = true;
            }
        }
    },
    setDirection: function(value) {
        this._directionNum = value;
    },
    setAction: function(value) {
        if (value != this._nowAction) {
            this._nowAction = value;
        }
    },
    render: function(dt, targetNodes) {

    },
    dispose: function() {
        this._bodyNode = null;
        this._parts = null;
    }
});