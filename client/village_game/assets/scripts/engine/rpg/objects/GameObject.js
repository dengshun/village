const GraphicsBase = require("GraphicsBase");
const Render = require("Render");
const BaseController = require("BaseController");
const CharacterController = require("CharacterController");
const Direction = require("Direction");
const SceneConst = require("SceneConst");
const BaseStuff = require("BaseStuff");
let STUFF_GAP = 0;
cc.Class({
    extends: cc.Component,
    properties: {
        id: 0,
        data: {
            serializable: false,
            default: null,
            visible: false,
        },
        layer: {
            serializable: false,
            default: SceneConst.MIDDLE_LAYER,
            visible: false,
        },
        _posX: 0,
        _posY: 0,
        _directionNum: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _type: "",
        _bodyNode: {
            type: cc.Node,
            serializable: false,
            default: null,
        },
        _graphics: GraphicsBase,
        _render: Render,
        _disposed: {
            serializable: false,
            default: false,
        },
        _graphicsIsDirty: true,
        disposed: {
            set: function(value) {
                this._disposed = value;
            },
            get: function() {
                return this._disposed;
            },
            visible: false,
        },
        bodyNode: {
            get: function() {
                return this._bodyNode;
            },
            visible: false,
            type: cc.Node,
        },
        render: {
            set: function(value) {
                this._render = value;
            },
            get: function() {
                return this._render;
            },
            type: Render,
            visible: false
        },
        posX: {
            set: function(value) {
                this._posX = value;
            },
            get: function() {
                return this._posX;
            },
            visible: false
        },
        posY: {
            set: function(value) {
                this._posY = value;
                this._zOrder = this._posY;
            },
            get: function() {
                return this._posY;
            },
            visible: false
        },
        pos: {
            get: function() {
                return cc.p(this._posX, this._posY);
            },
            visible: false
        },
        directionNum: {
            set: function(value) {
                this._directionNum = value;
            },
            get: function() {
                return this._directionNum;
            },
            visible: false
        },
        type: {
            set: function(value) {
                this._type = value;
            },
            get: function() {
                return this._type;
            },
            visible: false
        },
        graphicsRes: {
            set: function(value) {
                this._graphics = value;
                this._graphicsIsDirty = true;
            },
            get: function() {
                return this._graphics;
            },
            type: GraphicsBase,
            visible: false,
        },
        _controller: {
            type: BaseController,
            serializable: false,
            default: null,
        },
        controller: {
            get: function(value) {
                return this._controller;
            },
            visible: false,
        },
        _speed: {
            type: cc.Integer,
            serializable: false,
            default: 200,
        },
        speed: {
            set: function(value) {
                this._speed = value;
            },
            get: function() {
                return this._speed;
            },
            visible: false
        },
        _zOrder: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _zOrderF: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _zOrderFixed: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        zOrder: {
            get: function() {
                return this._zOrder + this._zOrderF + this._zOrderFixed;
            },
            visible: false
        },
        zOrderFixed: {
            set: function(value) {
                this._zOrderFixed = value;
            },
            get: function() {
                return this._zOrderFixed;
            },
            visible: false
        },
        zOrderF: {
            set: function(value) {
                this._zOrderF = value;
            },
            get: function() {
                return this._zOrderF;
            },
            visible: false
        },
        _autoCulling: {
            serializable: false,
            default: true,
        },
        autoCulling: {
            set: function(value) {
                this._autoCulling = value;
            },
            get: function() {
                return this._autoCulling;
            },
            visible: false
        },
        _inCamera: {
            serializable: false,
            default: false,
        },
        inCamera: {
            set: function(value) {
                this._inCamera = value;
            },
            get: function() {
                return this._inCamera;
            },
            visible: false
        },
        _isAutoReturn: {
            serializable: false,
            default: true,
        },
        isAutoReturn: {
            set: function(value) {
                this._isAutoReturn = value;
            },
            get: function() {
                return this._isAutoReturn;
            },
            visible: false
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
        this._bodyNode = cc.find("body", this.node);
    },
    renew: function(...args) {
        if (this._disposed) {
            this._disposed = false;
            this.node.opacity = 255;
            this._bodyNode.opacity = 255;
            this._graphics = null;
            this._render = null;
            this._graphicsIsDirty = true;
            this._type = "";
            this.id = 0;
            this.data = null;
            this._posX = 0;
            this._posY = 0;
            this._disposed = false;
            this._zOrderFixed = 0;
            this._zOrderF = 0;
            this._zOrder = 0;
            this.layer = SceneConst.MIDDLE_LAYER;
            this._autoCulling = true;
            this._directionNum = 0;
        }
    },
    changeController: function(ctrl) {
        if (this._controller) {
            if (this._controller instanceof CharacterController) {
                this._controller.unsetupListener();
            }
        }
        this._controller = ctrl;
        if (ctrl) {
            ctrl.me = this;
            if (ctrl instanceof CharacterController) {
                ctrl.setupListener();
            }
        }
    },
    renderLoop: function(dt) {
        if (!this._disposed) {
            if (this._graphicsIsDirty && this._graphics && this._graphics.isReady) {
                this._graphicsIsDirty = false;
                this._updateGraphicsData();
            }
            if (this._render) {
                this._renderHandler(dt);
            }
        }
    },
    _renderHandler: function(dt) {
        this._render.render(this);

        this.flyStuffs();
    },
    _updateGraphicsData: function() {

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
    setPos: function(x, y) {
        this._posX = x;
        this._posY = y;
        this._zOrder = this._posY;
    },
    /**朝向某点**/
    faceToPoint: function(dx, dy) {
        this.directionNum = this.getDirectionByPoint(dx, dy);
    },
    /**根据角度值修改角色的方向*/
    getDirectionByPoint: function(dx, dy) {
        let dir = Direction.Up;
        let x1 = this._posX - dx;
        let y1 = this._posY - dy;
        let ang = (Math.atan2(y1, x1) * 180) / Math.PI;
        if (ang >= -15 && ang < 15) {
            dir = Direction.Left; //6-8;
        } else if (ang >= 15 && ang < 75) {
            dir = Direction.LeftUp; // 7-8;
        } else if (ang >= 75 && ang < 105) {
            dir = Direction.Up; // 0;
        } else if (ang >= 105 && ang < 170) {
            dir = Direction.RightUp; //1;
        } else if (ang >= 170 || ang < -170) {
            dir = Direction.Right; //2;
        } else if (ang >= -75 && ang < -15) {
            dir = Direction.LeftDown; // 5-8;
        } else if (ang >= -105 && ang < -75) {
            dir = Direction.Down; // 4;
        } else if (ang >= -170 && ang < -105) {
            dir = Direction.RightDown; //3;
        }
        return dir;
    },
    dispose: function() {
        this._disposed = true;
        this._graphics = null;
        this.removeStuffsFromParent();
        if (this._stuffList) {
            this._stuffList.splice(0, this._stuffList.length);
        }
        if (this._controller) {
            this.changeController(null);
        }
    }
});