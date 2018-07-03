const GraphicsBase = require("GraphicsBase");
const Actions = require("Actions");
const SceneConst = require("SceneConst");
let SingleSpriteGraphics = cc.Class({
    name: "SingleSpriteGraphics",
    extends: GraphicsBase,
    properties: {
        _bodySprite: {
            type: cc.SpriteFrame,
            serializable: false,
            default: null,
        },
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
                this._updateBodyGraphics();
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
    },
    ctor: function() {},

    addPart: function(type, spriteFrame) {
        if (this._parts == null) {
            this._parts = [];
        }
        this._parts.push({ type: type, spriteFrame: spriteFrame });

        if (type == SceneConst.BODY_TYPE || type == SceneConst.EFFECT_TYPE) {
            this._bodySprite = spriteFrame;
        }
        this._updateBodyGraphics();
    },
    _updateBodyGraphics: function() {
        if (this._bodySprite && this._bodyNode) {
            let sp = this._bodyNode.getComponent(cc.Sprite);
            if (!sp) {
                sp = this._bodyNode.addComponent(cc.Sprite);
            }
            sp.spriteFrame = this._bodySprite;
            this._isReady = true;
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
        this._bodySprite = null;
    }
});