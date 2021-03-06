const GraphicsBase = require("GraphicsBase");
const Render = require("Render");
const BaseController = require("BaseController");
const CharacterController = require("CharacterController");
const Direction = require("Direction");
const SceneConst = require("SceneConst");
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
        _type: "",
        _bodyNode: {
            type: cc.Node,
            serializable: false,
            default: null,
        },
        _disposed: {
            serializable: false,
            default: false,
        },
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
        posX: {
            set: function(value) {
                if (this._posX != value) {
                    this._posX = value;
                }
            },
            get: function() {
                return this._posX;
            },
            visible: false
        },
        posY: {
            set: function(value) {
                if (this._posY != value) {
                    this._posY = value;
                }
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
        type: {
            set: function(value) {
                this._type = value;
            },
            get: function() {
                return this._type;
            },
            visible: false
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
                return this._posY + this._zOrderF + this._zOrderFixed;
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
        _directionNum: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        directionNum: {
            set: function(value) {
                this._directionNum = value;
                if (this._graphics) {
                    this._graphics.setDirection(this.directionNum);
                }
            },
            get: function() {
                return this._directionNum;
            },
            visible: false
        },
        _graphics: GraphicsBase,
        graphicsRes: {
            set: function(value) {
                this._graphics = value;
                this._graphics.setDirection(this.directionNum);
            },
            get: function() {
                return this._graphics;
            },
            type: GraphicsBase,
            visible: false,
        },
        _render: Render,
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
        _objectVisible: {
            default: true,
            serializable: false,
        },
        objectVisible: {
            set: function(value) {
                this._objectVisible = value;
                this._updateObjectVisible();
            },
            get: function() {
                return this._objectVisible;
            },
            visible: false,
        },
    },
    onLoad: function() {
        this._bodyNode = cc.find("body", this.node);
        if (this._graphics) {
            this._graphics.bodyNode = this._bodyNode;
        }
        this._updateObjectVisible();
    },
    renew: function(...args) {
        if (this._disposed) {
            this._disposed = false;
            this.node.opacity = 255;
            this.node.setScale(1.0);
            this._bodyNode.opacity = 255;
            this._render = null;
            this._graphics = null;
            this._type = "";
            this.id = 0;
            this.data = null;
            this._posX = 0;
            this._posY = 0;
            this._disposed = false;
            this._zOrderFixed = 0;
            this._zOrderF = 0;
            this.layer = SceneConst.MIDDLE_LAYER;
            this._autoCulling = true;
            this._directionNum = 0;
            this.objectVisible = true;
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
            this._renderHandler(dt);
        }
    },
    _renderHandler: function(dt) {
        if (this._render) {
            this._render.render(dt, this);
        }
    },
    _updateObjectVisible: function() {
        if (this.node) {
            this.node.active = this._objectVisible;
        }
    },
    setPos: function(x, y) {
        this._posX = x;
        this._posY = y;
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
        let sf = this._bodyNode.getComponent(cc.Sprite);
        if (sf) {
            sf.destroy();
        }
        let spk = this._bodyNode.getComponent(sp.Skeleton);
        if (spk) {
            spk.destroy();
        }
        if (this._graphics) {
            this._graphics.dispose();
            this._graphics = null;
        }
        if (this._controller) {
            this.changeController(null);
        }
    }
});