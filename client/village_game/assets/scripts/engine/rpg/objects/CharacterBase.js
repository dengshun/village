const GameObject = require("GameObject");
const Actions = require("Actions");
const GraphicsBase = require("GraphicsBase");
const RpgGlobal = require("RpgGlobal");
const BaseStuff = require("BaseStuff");
let STUFF_GAP = 0;
cc.Class({
    extends: GameObject,
    properties: {
        isDeath: {
            default: false,
            visible: false
        },
        _playEndCall: Function,
        alphaCheck: {
            serializable: false,
            visible: false,
            default: false,
        },
        _action: {
            serializable: false,
            default: "stand",
        },
        action: {
            set: function(value) {
                if (this._action != value) {
                    this._action = value;
                    if (this._action == Actions.Death) {
                        this.isDeath = true;
                    } else {
                        this.isDeath = false;
                    }
                    if (this._graphics) {
                        this._graphics.setAction(this._action);
                    }
                }
            },
            get: function() {
                return this._action;
            },
            visible: false,
        },
        _isAutoChangeAction: true,
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
                this._graphics.setAction(this._action);
                this._graphics.setDirection(this.directionNum);
                this._graphics.setStartListener(this._movieStartListener.bind(this));
                this._graphics.setEndListener(this._movieEndListener.bind(this));
                this._graphics.setCompleteListener(this._movieCompleteListener.bind(this));
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
        _stuffList: {
            serializable: false,
            default: null,
        },
        stuffList: {
            get: function() {
                return this._stuffList;
            },
            visible: false,
        },
        _stuffOffSetYNow: {
            serializable: false,
            default: 50,
        },
        _explicitStuffOffsetY: {
            serializable: false,
            default: null,
        },
        stuffOffSetY: {
            set: function(value) {
                this._explicitStuffOffsetY = value;
                this._stuffOffSetYNow = value;
            },
            get: function() {
                return this._stuffOffSetYNow;
            },
            visible: false,
        }
    },
    onLoad: function() {
        this._super();
    },
    renew: function(...args) {
        if (this._disposed) {
            this._super(...args);
            this._playEndCall = null;
            this._action = Actions.Stand;
            this._isAutoChangeAction = true;
            this.isDeath = false;
        }
    },
    _renderHandler: function(dt) {
        this._super(dt);
        this.flyStuffs();
        if (this.alphaCheck && this._bodyNode) {
            this._autoChangeAlpha();
        }
    },
    _autoChangeAction: function() {
        if (this._action != Actions.Death && this._action != Actions.Walk) {
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
                if (this.graphicsRes && this.graphicsRes.isReady) {
                    this._stuffOffSetYNow = this.graphicsRes.avatarHeight;
                } else {
                    this._stuffOffSetYNow = 50;
                }
            }
        }
    },
    _movieStartListener: function() {
        this._autoChangeStuffOffSet();
    },
    _movieEndListener: function() {
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
    _movieCompleteListener: function() {

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
    },
    addStuff: function(stuff) {
        if (this._stuffList == null) {
            this._stuffList = [];
        }
        let oldStuff = this.getStuffByType(stuff.type);
        if (oldStuff) {
            this.removeStuff(oldStuff);
        }
        this._stuffList.push(stuff);
        if (this.node.parent) {
            this.node.parent.addChild(stuff.node);
        }
    },
    getStuffByType: function(type) {
        let len = this._stuffList.length;
        for (let i = 0; i < len; i++) {
            let stuff = this._stuffList[i];
            if (stuff.type == type) {
                return stuff;
            }
        }
        return null;
    },
    removeStuff: function(stuff) {
        if (this._stuffList) {
            let index = this._stuffList.indexOf(stuff);
            if (index >= 0) {
                this._stuffList.splice(index, 1);
                if (stuff.node.parent) {
                    stuf.node.removeFromParent();
                }
            }
        }
    },
    addStuffsToParent: function() {
        if (this._stuffList && this.node.parent) {
            let self = this;
            this._stuffList.forEach(function(stuf) {
                self.node.parent.addChild(stuf.node);
            });
        }
    },
    removeStuffsFromParent: function() {
        if (this._stuffList) {
            this._stuffList.forEach(function(stuf) {
                if (stuf.node.parent) {
                    stuf.node.removeFromParent();
                }
            });
        }
    },
    flyStuffs: function() {
        if (this._stuffList != null) {
            let hTotalW;
            this._stuffList.forEach(function(stuff) {
                if (stuff.layout == BaseStuff.Layout.LAYOUT_HEAD_HORIZONTAL) {
                    hTotalW += stuff.width;
                }
            });
            let lastX = hTotalW >> 1;
            let lastY = this.stuffOffSetY;
            let len = this._stuffList.length;
            let pos = cc.v2(0, 0);
            for (let i = 0; i < len; i++) {
                let stuff = this._stuffList[i];
                if (stuff.layout == BaseStuff.Layout.LAYOUT_HEAD_VERTICAL) {
                    pos.x = stuff.offsetX;
                    pos.y = lastY + (stuff.node.height >> 1);
                    lastY = pos.y + (stuff.node.height >> 1) + STUFF_GAP;
                } else if (stuff.layout == BaseStuff.Layout.LAYOUT_HEAD_HORIZONTAL) {
                    pos.x = lastX + (stuff.node.width >> 1);
                    pos.y = this.stuffOffSetY + (stuff.node.height >> 1) + stuff.offsetY;
                    lastX = pos.x + (stuff.node.width >> 1) + STUFF_GAP;
                } else if (stuff.layout == BaseStuff.Layout.LAYOUT_FOOT_ABSOLUTE) {
                    pos.x = stuff.offsetX;
                    pos.y = stuff.offsetY;
                } else if (stuff.layout == BaseStuff.Layout.LAYOUT_HEAD_ABSOLUTE) {
                    pos.x = stuff.offsetX;
                    pos.y = this.stuffOffSetY + (stuff.node.height >> 1) + stuff.offsetY;
                }
                stuff.node.setPosition(this.node.x + pos.x, +this.node.y + pos.y);
            }
        }
    },
    dispose: function() {
        this._super();
        this.removeStuffsFromParent();
        if (this._stuffList) {
            this._stuffList.splice(0, this._stuffList.length);
        }
    }
});