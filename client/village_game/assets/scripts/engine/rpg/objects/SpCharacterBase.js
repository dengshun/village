const GameObject = require("GameObject");
const Actions = require("Actions");
const GraphicsBase = require("GraphicsBase");
const RpgGlobal = require("RpgGlobal");
const BaseStuff = require("BaseStuff");
cc.Class({
    extends: GraphicsBase,
    properties: {
        isDeath: {
            default: false,
            visible: false
        },
        _playEndCall: Function,
        _isAutoChangeAction: true,
        _action: {
            serializable: false,
            default: "stand",
        },
        alphaCheck: {
            serializable: false,
            visible: false,
            default: false,
        },
        action: {
            set: function(value) {
                if (this._action != value) {
                    this._action = value;
                    this._actionChangedHandler();
                }
            },
            get: function() {
                return this._action;
            },
            visible: false,
        },
        isAutoChangeAction: {
            set: function(value) {
                this._isAutoChangeAction = value;
            },
            get: function() {
                return this._isAutoChangeAction;
            },
            visible: false,
        },
        graphicsRes: {
            set: function(value) {
                this._graphics = value;
                this._graphics.nowAction = this._action;
                this._graphicsIsDirty = true;
            },
            get: function() {
                return this._graphics;
            },
            override: true,
            type: GraphicsBase,
            visible: false,
        },
        _title: {
            type: BaseStuff,
            serializable: false,
            default: null,
        },
        title: {
            set: function(value) {
                if (this._title) {
                    this.removeStuff(this._title);
                }
                this._title = value;
                this.addStuff(value);
            },
            get: function() {
                return this._title;
            },
            visible: false
        },
        _hpBar: {
            type: BaseStuff,
            serializable: false,
            default: null,
        },
        hpBar: {
            set: function(value) {
                if (this._hpBar) {
                    this.removeStuff(this._hpBar);
                }
                this._hpBar = value;
                this.addStuff(value);
            },
            get: function() {
                return this._hpBar;
            },
            visible: false
        },
        currentBlood: {
            get: function() {
                return this._hpBar ? this._hpBar.currentBlood : this._currentBlood;
            },
            visible: false,
        },
        maxBlood: {
            get: function() {
                return this._hpBar ? this._hpBar.maxBlood : this._maxBlood;
            },
            visible: false,
        },
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
    },
    onLoad: function() {
        this._super();
    },
    renew: function(...args) {
        if (this._disposed) {
            this._super();
            this._playEndCall = null;
            this._action = Actions.Stand;
            this._isAutoChangeAction = true;
            this.isDeath = false;
        }
    },
    _actionChangedHandler: function() {
        if (this._action == Actions.Death) {
            this.isDeath = true;
        } else {
            this.isDeath = false;
        }
        if (this._graphics) {
            this._graphics.nowAction = this._action;
            if ((!this._graphicsIsDirty) && this._graphics.isReady) {
                this._updateGraphicsData();
            }
        }
    },
    _updateGraphicsData: function() {
        this._super();
        this._autoChangeStuffOffSet();
    },
    _loopPlayEndHandler: function() {
        if (this._playEndCall) {
            let tmp = this._playEndCall;
            this._playEndCall = null;
            if (tmp.length > 0) {
                tmp(this);
            } else {
                tmp();
            }
        }
        if (this._isAutoChangeAction) {
            this._autoChangeAction();
        }
    },
    _renderHandler: function(dt) {
        this._super(dt);
        if (this.alphaCheck && this._bodyNode) {
            this._autoChangeAlpha();
        }
    },
    _autoChangeAction: function() {
        if (this._action != Actions.Death) {
            this.action = Actions.Stand;
        }
    },
    _autoChangeAlpha: function() {
        let alpha = RpgGlobal.scene.map.isInAlphaArea(this._posX, this._posY) ? 127 : 255;
        this._bodyNode.opacity = alpha;
    },
    _autoChangeStuffOffSet: function() {
        if (this._action == Actions.Death) {
            this._stuffOffSetYNow = 30;
        } else {
            if (this._explicitStuffOffsetY != null) {
                this._stuffOffSetYNow = this._explicitStuffOffsetY;
            } else {
                if (this._graphics && this._graphics.isReady) {
                    this._stuffOffSetYNow = this._graphics.avatarHeight;
                } else {
                    this._stuffOffSetYNow = 50;
                }
            }
        }
    },
    play: function(actionStr, playEndCall = null) {
        this.action = actionStr;
        this._playEndCall = playEndCall;
    },
    setBlood: function(current, max) {
        this._currentBlood = current;
        if (max) {
            this._maxBlood = max;
        }
        if (this._hpBar) {
            this._hpBar.setBlood(current, max);
        }
    }
});