const BaseController = require("BaseController");
const Actions = require("Actions");
const RpgGlobal = require("RpgGlobal");
const Utils = require("Utils");
cc.Class({
    extends: BaseController,
    properties: {
        _leftMovePath: null,
        _walkPathFragments: null,
        _lastTime: 0,
        _nowTime: 0,
        _totalTime: 0,
        _timePassed: 0,
        _touchPoint: cc.v2(0, 0),
        _isPaused: false,
        _touchStartTimer: 0,

    },
    ctor: function() {
        this._walkPathFragments = [];
    },
    unsetupListener: function() {
        RpgGlobal.scene.node.off(cc.Node.EventType.TOUCH_START, this._touchStartHandler, this);
        RpgGlobal.scene.node.off(cc.Node.EventType.TOUCH_END, this._touchHandler, this);
    },
    setupListener: function() {
        RpgGlobal.scene.node.on(cc.Node.EventType.TOUCH_START, this._touchStartHandler, this);
        RpgGlobal.scene.node.on(cc.Node.EventType.TOUCH_END, this._touchHandler, this);
    },
    _touchStartHandler: function() {
        this._touchStartTimer = new Date().getTime();
    },
    _touchHandler: function(evt) {
        let endTimer = new Date().getTime();
        if (endTimer - this._touchStartTimer <= 300) {
            if (evt.currentTarget == RpgGlobal.scene.node) {
                this.clearWalk();
                let local = RpgGlobal.scene.map.node.convertToNodeSpaceAR(evt.getLocation());
                let worldPos = RpgGlobal.scene.map.getWorldPosition(local.x, local.y);
                this.walkTo(worldPos.x, worldPos.y, true);
            }
        }
    },
    clearPath: function() {
        if (!this._me.isDeath) {
            if (this._me.action = Actions.Walk) {
                this._me.action = Actions.Stand;
            }
        }
        if (this._path) {
            this._path = null;
        }
        this._walkPathFragments.splice(0, this._walkPathFragments.length);
        this.clearWalk();
    },
    //走完所有路径后调用
    clearWalk: function() {
        this._callInWalk = null;
        this._callInWalkDist = 5;
        this._callAfterWalk = null;
        this._preTarget = null;
        this._nextTarget = null;
    },
    /**
     * 移动到某点,寻路
     * @param dx
     * @param dy
     * @param AStar是否需要寻路
     * @param callAfterWalk
     * @param callInWalk
     * @param callDist
     */
    walkTo: function(dx, dy, AStar = false, callAfterWalk = null, callInWalk = null, callInWalkDist = 5) {
        if (this._me.isDeath)
            return false;
        if (dx < 0) dx = 0;
        if (dy < 0) dy = 0;
        this._endPoint.x = dx;
        this._endPoint.y = dy;
        this._callInWalk = callInWalk;
        this._callAfterWalk = callAfterWalk;
        if (cc.pDistance(this._endPoint, this._me.pos) <= RpgGlobal.GRID_SIZE * 0.5) //距离很近，直接回调
        {
            this._me.faceToPoint(this._endPoint.x, this._endPoint.y);
            if (callInWalk != null) callInWalk.apply(null);
            setTimeout(this.walkFinished.bind(this), 1);
            return false;
        }
        this._callInWalkDist = callInWalkDist;

        let paths;
        if (AStar) {
            paths = this.getPath(this._me.pos, this._endPoint);
        } else {
            paths = [this._me.pos.clone(), this._endPoint];
        }
        this._walkPathFragments.splice(0, this._walkPathFragments.length);
        if (paths != null) {
            this.pathCutter(paths);
            this.walkNextPart();
            return true;
        } else {
            this._me.faceToPoint(this._endPoint.x, this._endPoint.y);
            if (callInWalk != null) callInWalk.apply(null);
            setTimeout(this.walkFinished.bind(this), 1);
            return false;
        }
    },
    isStatic: function() {
        if (!this._me) return false;
        if (this._me.isDeath) return true;
        return false;
    },
    calAction: function(dt) {
        if (this._isPaused || this.isStatic()) return;
        if (this._nextTarget != null) {
            this._timePassed += dt * 1000;
            if (this._timePassed > 0) {
                let speed = this._me.speed;
                let dx = this._nextTarget.x - this._me.posX;
                let dy = this._nextTarget.y - this._me.posY;
                let dis = cc.pDistance(this._me.pos, this._nextTarget);
                let angle = Number(Number(Math.atan2(dy, dx).toFixed(2)));
                let completeTime = (dis / speed) * 1000;
                if (this._timePassed >= completeTime)
                    this._timePassed = this._timePassed - completeTime;
                else {
                    completeTime = this._timePassed;
                    this._timePassed = 0;
                }
                let vs = speed / 1000 * completeTime;
                let xspeed = vs * Math.cos(angle);
                let yspeed = vs * Math.sin(angle);
                this.moveTo(Number(Number((this._me.posX + xspeed).toFixed(1))), Number(Number((this._me.posY + yspeed).toFixed(1))));
                dis = cc.pDistance(this._me.pos, this._nextTarget);
                if (this._callInWalk != null && cc.pDistance(this._me.pos, this._endPoint) <= this._callInWalkDist) { //走动到规定的范围内回调
                    this._callInWalk.call(null);
                }
                if (dis <= 1) {
                    // 走到新的位置点 更新区块坐标		
                    if (this._path.length > 0) {
                        this._preTarget = this._nextTarget;
                        this._nextTarget = this._path.shift();
                        if (this._nextTarget) {
                            this._me.directionNum = this.getDirectionByPoint(this._nextTarget.x, this._nextTarget.y);
                        }
                    } else {
                        this._me.setPos(this._nextTarget.x, this._nextTarget.y);
                        this.walkNextPart();
                    }
                }
                if (this._timePassed > 0) {
                    this.calAction(0);
                }
            }
        }
    },
    moveTo: function(nextX, nextY) {
        if (this._me.posX != nextX || this._me.posY != nextY) {
            this._me.setPos(nextX, nextY);
            if (this._me.action != Actions.Attack) {
                this._me.action = Actions.Walk;
            }
        }
    },
    walkNextPart: function() {
        this._timePassed = 0;
        this._nextTarget = null;
        let path_ = this._walkPathFragments.shift();
        if (path_ != null) {
            this._path = path_.slice();
            this._nextTarget = this._path.shift();
            if (this._nextTarget != null) {
                if (cc.pDistance(this._me.pos, this._nextTarget) <= 5) {
                    this._nextTarget = this._path.shift();
                }
                if (this._nextTarget != null) {
                    this._preTarget = this._me.pos;
                    if (this._me == RpgGlobal.scene.player) { //当前控制中的玩家才发数据//// 向服务器发送同步数据
                        this.tellServerMove(path_);
                    }
                    if (!this._isPaused) {
                        this._me.action = Actions.Walk;
                    }
                    this._me.directionNum = this.getDirectionByPoint(this._nextTarget.x, this._nextTarget.y);
                }
            } else {
                this.walkNextPart();
            }
        } else { //没有路径可走，走动结束
            this.walkFinished();
        }
    },
    pathCutter: function(array, size = 64, part = 320) {
        let paths = [];
        let len = array.length;
        if (len >= 2) {
            let start_point = array[0];
            let end_point;
            paths.push(cc.p(Math.round(start_point.x), Math.round(start_point.y)));
            for (let i = 0; i < len - 1; i++) {
                start_point = array[i];
                end_point = array[i + 1];
                let dis = cc.pDistance(start_point, end_point);
                let length = Math.ceil(dis / size);
                let num = size / dis;
                for (let j = 0; j <= length; j++) {
                    let pr = num * j;
                    let newPoint = Utils.interpolate(end_point, start_point, pr);
                    newPoint.x = Math.round(newPoint.x);
                    newPoint.y = Math.round(newPoint.y);
                    let lastPoint = paths[paths.length - 1];
                    if (newPoint.x != lastPoint.x || newPoint.y != lastPoint.y) { //和上一个点位置不同
                        paths.push(newPoint);
                    }
                    if (num * (j + 1) > 1) {
                        paths.push(cc.p(Math.round(end_point.x), Math.round(end_point.y)));
                        break
                    }
                }
            }
            len = paths.length;
            if (len > 1) {
                let dis_ = 0;
                let start_index = 0;
                let data;
                for (let k = 1; k < len; k++) {
                    dis_ += cc.pDistance(paths[k - 1], paths[k]);
                    if (Math.ceil(dis_) >= part || (k == len - 1 && Math.ceil(dis_) < part)) {
                        data = paths.slice(start_index, k + 1);
                        this._walkPathFragments.push(data);
                        dis_ = 0;
                        start_index = k;
                    }
                }
            }
        }
    },
    tellServerMove: function(path) {},
    walkFinished: function() {
        var _tmp = this._callAfterWalk;
        if (_tmp != null) {
            if (_tmp.length == 0)
                _tmp.apply(null);
            else
                _tmp.apply(null, [this._me]);
        }
        this._me.action = Actions.Stand;
    },
    pause: function() {
        this._isPaused = true;
        this._me.action = Actions.Stand;
    },
    restart: function() {
        this._isPaused = false;
        this._timePassed = 0;
    }

});