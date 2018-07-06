const RpgScene = require("RpgScene");
const ByteArray = require("ByteArray");
const SceneConst = require("SceneConst");
cc.Class({
    extends: RpgScene,
    properties: {
        _touchStartPoints: [],
        _scalePoints: null,
        _scaleStartDist: 0,
        _nodeScale: 1.0,
        _maxNodeScale: 3.0,
        _minNodeScale: 0.5,
        characterHash: {
            serializable: false,
            visible: false,
            default: {},
        },
        sceneReadyCallBack: {
            type: Function,
            serializable: false,
            default: null,
            visible: false,
        },
        progressCallBack: {
            type: Function,
            serializable: false,
            default: null,
            visible: false,
        },
    },
    onLoad() {
        this._super();
        this._nodeScale = 1.0;
        this._maxNodeScale = 3.0;
        this._minNodeScale = 0.5;
    },
    _initScene() {
        this._super();
        let mapId = this._sceneData.map_id;
        cc.loader.loadResDir(`maps/map_image/scene_${mapId}`, (completedCount, totalCount, item) => {}, (error, resource, urls) => {
            if (this.sceneReadyCallBack) {
                this.sceneReadyCallBack();
            }
            this._setupListener();
        });
    },
    _setupListener() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartHandler, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveHandler, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEndHandler, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelHandler, this);
    },
    //拖动操作。
    _touchStartHandler(evt) {
        this._touchStartPoints.push({ id: evt.getID(), p: cc.v2(evt.getLocationX(), evt.getLocationY()), pLast: null, pUpdated: false });
        //cc.info(`evt start id=====:${this._touchStartPoints[this._touchStartPoints.length-1]["id"]}=========posx:${this._touchStartPoints[this._touchStartPoints.length-1]["p"]["x"]}=====posx:${this._touchStartPoints[this._touchStartPoints.length-1]["p"]["y"]}`);
        this._updateScalePoints();
    },
    _touchMoveHandler(evt) {
        let eId = evt.getID();
        let touchPoint = this._getPointByEventId(eId);
        let lastP = cc.v2(touchPoint.p);
        let lastLastP = cc.v2(touchPoint.pLast);
        touchPoint.pLast = lastP;
        let curr = cc.v2(evt.getLocationX(), evt.getLocationY());
        touchPoint.p = curr;
        touchPoint.pUpdated = true;

        let pLen = this._touchStartPoints.length;
        if (pLen > 0) {
            if (pLen <= 1) {
                let lastPNode = this.node.convertToNodeSpaceAR(lastP);
                let currNode = this.node.convertToNodeSpaceAR(curr);
                let dist = cc.pDistance(currNode, lastPNode);
                if (dist < 12) {
                    touchPoint.pLast = lastLastP;
                    touchPoint.p = lastP;
                    touchPoint.pUpdated = false;
                    return;
                }
                let offsetX = currNode.x - lastPNode.x;
                let offsetY = currNode.y - lastPNode.y;
                let angle = Number(Number(Math.atan2(offsetY, offsetX).toFixed(2)));
                let xspeed = dist * Math.cos(angle);
                let yspeed = dist * Math.sin(angle);
                let centerPoint = this.map.centerPoint;
                centerPoint.x = centerPoint.x - xspeed;
                centerPoint.y = centerPoint.y + yspeed;
                this._validateFocusPosition();
            } else {
                if (this._scalePoints) {
                    let p1 = this._scalePoints[0];
                    let p2 = this._scalePoints[1];
                    if (p1.pUpdated && p2.pUpdated) {
                        let pDist = cc.pDistance(p1.p, p2.p);
                        let pLastDist = cc.pDistance(p1.pLast, p2.pLast);
                        let ratio = (pDist - pLastDist) / this._scaleStartDist;
                        this._nodeScale = this._nodeScale * (1.0 + ratio);
                        if (this._nodeScale > this._maxNodeScale) {
                            this._nodeScale = this._maxNodeScale;
                        } else if (this._nodeScale < this._minNodeScale) {
                            this._nodeScale = this._minNodeScale;
                        }
                        this.sceneScale = this._nodeScale;
                        this._nodeScale = this.sceneScale;
                    }
                }
            }
        }
        if (this._checkAllPointsUpdated()) {
            for (let j = 0; j < this._touchStartPoints.length; j++) {
                let p = this._touchStartPoints[j];
                p.pUpdated = false;
            }
        }
    },
    _updateScalePoints() {
        let len = this._touchStartPoints.length;
        if (len > 1) {
            let rp1 = null;
            let rp2 = null;
            let maxDist = -1;
            for (let i = 0; i < len; i++) {
                let p1 = this._touchStartPoints[i];
                for (let j = 0; j < len; j++) {
                    let p2 = this._touchStartPoints[j];
                    if (p1 != p2) {
                        let dist = cc.pDistance(p1.p, p2.p);
                        if (dist > maxDist) {
                            maxDist = dist;
                            rp1 = p1;
                            rp2 = p2;
                        }
                    }
                }
            }
            this._scalePoints = [rp1, rp2];
            this._scaleStartDist = cc.pDistance(rp1.p, rp2.p);
        } else {
            this._scalePoints = null;
        }
    },
    _touchEndHandler: function(evt) {
        this._removeMovePointById(evt.getID());
        this._updateScalePoints();
    },
    _touchCancelHandler: function(evt) {
        this._removeMovePointById(evt.getID());
        this._updateScalePoints();
    },
    _removeMovePointById(eId) {
        if (this._touchStartPoints) {
            for (let i = 0; i < this._touchStartPoints.length; i++) {
                if (this._touchStartPoints[i].id == eId) {
                    this._touchStartPoints.splice(i, 1);
                    break;
                }
            }
        }
    },
    _getPointByEventId(eId) {
        for (let i = 0; i < this._touchStartPoints.length; i++) {
            let p = this._touchStartPoints[i];
            if (p.id == eId) {
                return p;
            }
        }
    },
    _checkAllPointsUpdated() {
        let updated = true;
        for (let i = 0; i < this._touchStartPoints.length; i++) {
            let p = this._touchStartPoints[i];
            if (!p.pUpdated) {
                updated = false;
                break;
            }
        }
        return updated;
    },
    _validateFocusPosition() {
        let visibleSize = this.map.mapVisibleSize;
        let leftVW = visibleSize.width / 2;
        let leftVH = visibleSize.height / 2;
        let centerPoint = this.map.centerPoint;
        if (centerPoint.x - leftVW < 0) {
            centerPoint.x = leftVW;
        }
        if (centerPoint.y - leftVH < 0) {
            centerPoint.y = leftVH;
        }
        if (centerPoint.y + leftVH > this.map.mapHeight) {
            centerPoint.y = this.map.mapHeight - leftVH;
        }
        if (centerPoint.x + leftVW > this.map.mapWidth) {
            centerPoint.x = this.map.mapWidth - leftVW;
        }
    }

});