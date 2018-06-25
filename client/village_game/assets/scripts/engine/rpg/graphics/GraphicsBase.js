const GraphicsManager = require("GraphicsManager");
const SceneConst = require("SceneConst");
let GraphicsBase = cc.Class({
    name: "GraphicsBase",
    properties: {
        _loopPlayEnd: false, //非循环动画是否已经播放完成
        _bodyGraphicsDatas: null, //所有动作的数据
        _bodyGraphicsData: null, //当前动作数据
        _bodyFrameData: null, //当前帧数据
        _bodyAtlas: null,
        _bodyName: "",
        _parts: null,
        _nowAction: "stand",
        _hasDirection: false,
        _movieStoped: false,
        _timePassed: 0,
        _delay: 70,
        _completeListener: {
            type: Function,
            default: null,
            serializable: false,
        },
        _endListener: {
            type: Function,
            default: null,
            serializable: false,
        },
        _startListener: {
            type: Function,
            default: null,
            serializable: false,
        },
        _currentTimes: 0,
        _directionNum: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _speedRatio: {
            type: cc.Float,
            serializable: false,
            default: 1
        },
        _timePassed: {
            type: cc.Integer,
            serializable: false,
            default: 0
        },
        _currentFrame: {
            type: cc.Integer,
            serializable: false,
            default: 0
        },
        currentFrame: {
            set: function(value) {
                this._currentFrame = value;
            },
            get: function() {
                return this._currentFrame;
            },
            visible: false,
        },
        _totalFrame: {
            type: cc.Integer,
            serializable: false,
            default: 0
        },
        totalFrame: {
            get: function() {
                this._totalFrame;
            },
            visible: false
        },
        _loopTimes: {
            type: cc.Integer,
            serializable: false,
            default: -1
        },
        loopTimes: {
            get: function() {
                this._loopTimes;
            },
            visible: false
        },
        avatarHeight: {
            get: function() {
                if (this._bodyGraphicsDatas) {
                    return parseInt(this._bodyGraphicsDatas.avatarHeight);
                } else {
                    return 10;
                }
            },
            visible: false
        },
        _isReady: false,
        isReady: {
            get: function() {
                return this._isReady;
            },
            visible: false,
        },
    },
    ctor: function() {},
    setDirection: function(value) {
        this._directionNum = value;
    },
    setAction: function(value) {
        this._bodyGraphicsData = null;
        this._nowAction = value;
        this._totalFrame = 0;
        this._loopTimes = -1;
        this._loopPlayEnd = false;
        this._currentFrame = 0;
        this._currentTimes = 0;
        this._delay = 0;
        this._timePassed = 0;
        this._updateBodyGraphicsData();
    },
    addPart: function(type, id) {
        if (this._parts == null) {
            this._parts = [];
        }
        this._parts.push({ type: type, id: id });
        let gName = type + "_" + id;
        if (type == SceneConst.BODY_TYPE || type == SceneConst.EFFECT_TYPE) {
            this._bodyName = gName;
        }
        GraphicsManager.getInstance().load(gName);
    },
    render: function(dt, targetNodes) {
        this._updateBodyGraphicsData();
        let tmpPlayEnd = this._loopPlayEnd;
        let loopCount = 0;
        while (true) {
            loopCount++;
            let enterFrameOk = this._enterFrame(dt);
            if (!enterFrameOk) {
                break;
            } else {
                if (loopCount > 10) {
                    this._timePassed = 0;
                    break;
                }
            }

        }
        this._renderGraphicsBody(targetNodes[0]);
        if ((!tmpPlayEnd) && this._loopPlayEnd) {
            if (this._endListener) {
                this._endListener();
            }
        }
    },
    _updateBodyGraphicsData: function() {
        if (this._bodyName && this._bodyGraphicsData == null) {
            if (this._bodyGraphicsDatas == null) {
                this._bodyGraphicsDatas = GraphicsManager.getInstance().getData(this._bodyName);
                this._isReady = true;
                if (this._startListener) {
                    this._startListener();
                }
            }

            if (this._bodyGraphicsDatas) {
                this._bodyGraphicsData = this._getActionData(this._bodyGraphicsDatas.action, this._nowAction);
                this._hasDirection = this._bodyGraphicsData.dir.length > 1;

                this._totalFrame = this._bodyGraphicsData.frames;
                this._loopTimes = this._bodyGraphicsData.replay;
                this._updateDelay();
            }
        }
    },
    _renderGraphicsBody: function(target) {
        let directionNum = this._directionNum;
        let currentFrame = this._currentFrame;
        if (this._bodyGraphicsData) {
            this._bodyFrameData = null;
            let absDirectionNum;
            if (this._hasDirection) {
                absDirectionNum = directionNum > 0 ? directionNum : -directionNum;
            } else {
                directionNum = 0;
                absDirectionNum = 0;
            }
            let dirData = this._getDirFramsData(this._bodyGraphicsData.dir, absDirectionNum);
            if (dirData) {
                this._bodyFrameData = this._getFrameData(dirData, currentFrame);
                let spriteFrame;
                if (this._bodyFrameData) {
                    if (!this._bodyAtlas) {
                        this._bodyAtlas = GraphicsManager.getInstance().getSpriteAtlas(this._bodyName);
                    }
                    if (this._bodyAtlas) {
                        spriteFrame = this._bodyAtlas.getSpriteFrame(this._nowAction + "-" + absDirectionNum + "-" + this._bodyFrameData.linkage);
                    }
                }
                if (spriteFrame) {
                    target.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    if (directionNum < 0) {
                        target.scaleX = -1;
                    } else {
                        target.scaleX = 1;
                    }
                } else {}
            }
        }
        target.setPosition(this._tx(directionNum), this._ty(directionNum));
    },
    _enterFrame: function(dt) {
        let isOk = false;
        if (this.isReady &&
            this._totalFrame > 0 && (!this._loopPlayEnd) && (!this._movieStoped)) {
            this._timePassed += dt * 1000 * this._speedRatio;
            if (this._timePassed >= this._delay) {
                this._timePassed -= this._delay;
                if (this._currentFrame >= this._totalFrame - 1) {
                    this._currentTimes++;
                    if (this._loopTimes == -1 || this._currentTimes < this._loopTimes) {
                        this._currentFrame = 0;
                        isOk = true;
                    } else {
                        this._loopPlayEnd = true;
                    }
                    if (this._completeListener) {
                        this._completeListener();
                    }
                } else {
                    this._currentFrame++;
                    isOk = true;
                }
            }
        }
        if (isOk) {
            this._updateDelay();
        }
        return isOk;
    },
    _updateDelay: function() {
        let frameData = this.getBodyFrameData(this._directionNum, this._currentFrame);
        if (frameData) {
            this._delay = frameData.speed;
        } else {
            this._delay = 0;
        }
    },
    getBodyFrameData: function(directionNum, frame) {
        if (this._bodyGraphicsData) {
            let absDirectionNum;
            if (this._hasDirection) {
                absDirectionNum = directionNum > 0 ? directionNum : -directionNum;
            } else {
                directionNum = 0;
                absDirectionNum = 0;
            }
            let dirData = this._getDirFramsData(this._bodyGraphicsData.dir, absDirectionNum);
            return this._getFrameData(dirData, frame);
        } else {
            return null;
        }
    },
    _getFrameData: function(dirData, frame) {
        let frames = dirData.frame;
        for (let i = 0; i < frames.length; i++) {
            let frameData = frames[i];
            if (frameData.frame == frame) {
                return frameData;
            }
        }
        return null;
    },
    _getDirFramsData: function(dirs, directionNum) {
        for (let i = 0; i < dirs.length; i++) {
            let dirData = dirs[i];
            if (dirData.dir == directionNum) {
                return dirData;
            }
        }
        return null;
    },
    _getActionData: function(actionDatas, action) {
        for (let i = 0; i < actionDatas.length; i++) {
            let actionData = actionDatas[i];
            if (actionData.id == action) {
                return actionData;
            }
        }
        return null;
    },
    _getAvatarIdByType: function(type) {
        for (let i = 0; i < this._parts.length; i++) {
            let part = this._parts[i];
            if (part.type == type) {
                return part.id;
            }
        }
        return 0;
    },
    _tx: function(directionNum) {
        if (!this._hasDirection) {
            directionNum = 0;
        }
        let tx = 0;
        if (this._bodyFrameData) {
            if (directionNum >= 0) {
                tx = this._bodyFrameData.width / 2 - (this._bodyFrameData.tx - this._bodyFrameData.offsetX);
            } else {
                tx = (this._bodyFrameData.tx - this._bodyFrameData.offsetX) - this._bodyFrameData.width / 2;
            }
        }
        return tx;
    },
    _ty: function(directionNum) {
        let ty = 0;
        if (this._bodyFrameData) {
            ty = (this._bodyFrameData.ty - this._bodyFrameData.offsetY) - this._bodyFrameData.height / 2;
        }
        return ty;
    },

    setEndListener: function(value) {
        this._endListener = value;
    },
    setCompleteListener: function(value) {
        this._completeListener = value;
    },
    setStartListener: function(value) {
        this._startListener = value;
    },
    dispose: function() {
        this._bodyName = "";
        this._endListener = null;
        this._completeListener = null;
        this._startListener = null;
    }
});