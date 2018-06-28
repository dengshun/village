const CharacterController = require("CharacterController");
const RpgGlobal = require("RpgGlobal");
cc.Class({
    extends: CharacterController,
    properties: {
        _joystick: {
            default: null,
            serializable: false,
        },
        joystick: {
            set: function(value) {
                this._joystick = value;
            },
            get: function() {
                return this._joystick;
            }
        },
        _controlling: {
            default: false,
            serializable: false,
        }
    },
    unsetupListener: function() {
        if (this._joystick) {
            this._joystick.node.off("control_start", this._startJoystickControlHandler, this);
            this._joystick.node.off("control_stop", this._stopJoystickControlHandler, this);
        } else {
            this._super();
        }
    },
    setupListener: function() {
        if (this._joystick) {
            this._joystick.node.on("control_start", this._startJoystickControlHandler, this);
            this._joystick.node.on("control_stop", this._stopJoystickControlHandler, this);
        } else {
            this._super();
        }
    },
    _startJoystickControlHandler: function(evt) {
        if (this._isPaused || this.isStatic()) return;
        this._controlling = true;
        if (this._nextTarget == null) {
            this._joystickControlMove();
        }
    },

    _stopJoystickControlHandler: function(evt) {
        this._controlling = false;
    },
    walkFinished: function() {
        this._super();
        if (this._controlling) {
            this._joystickControlMove();
        }
    },
    _joystickControlMove: function() {
        this.clearWalk();
        let targetPos = this._me.pos.clone();
        let angle = this._joystick.angle2;
        if (angle <= 10 && angle >= 350) {
            angle = 0;
        } else if (angle > 10 && angle < 80) {
            angle = 45;
        } else if (angle >= 80 && angle <= 100) {
            angle = 90;
        } else if (angle > 100 && angle < 170) {
            angle = 135;
        } else if (angle >= 170 && angle <= 190) {
            angle = 180;
        } else if (angle > 190 && angle < 260) {
            angle = 225;
        } else if (angle >= 260 && angle <= 280) {
            angle = 270;
        } else if (angle > 280 && angle < 350) {
            angle = 315;
        }
        var xDelta = Math.cos(Math.PI / 180 * angle) * 32;
        var yDelta = Math.sin(Math.PI / 180 * angle) * 32;
        targetPos.x = targetPos.x + xDelta;
        targetPos.y = targetPos.y + yDelta;
        let result = this.walkTo2(targetPos.x, targetPos.y, 70, true);
        if (!result) {
            this._controlling = false;
        }
    },
    /**
     * 移动到某点,寻路,控制每次寻路路径的总长度
     * @param dx
     * @param dy
     * @param AStar是否需要寻路
     * @param callAfterWalk
     * @param callInWalk
     * @param callDist
     */
    walkTo2: function(dx, dy, dist, AStar = false, callAfterWalk = null, callInWalk = null, callInWalkDist = 5) {
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
            let tmpDist = 0;
            let prePoint = null;
            let curPoint = null;
            for (let i = 0; i < this._walkPathFragments.length; i++) {
                let parts = this._walkPathFragments[i];
                let start = 0;
                if (prePoint == null) {
                    prePoint = parts[0];
                    start = 1;
                }
                for (let j = start; j < parts.length; j++) {
                    curPoint = parts[j];
                    tmpDist += cc.pDistance(prePoint, curPoint);
                    if (tmpDist >= dist) {
                        let newParts = j > 1 ? parts.slice(0, j) : parts.slice(0, j + 1);
                        this._walkPathFragments[i] = newParts;
                        break;
                    }
                }
                if (tmpDist >= dist) {
                    this._walkPathFragments = this._walkPathFragments.slice(0, i + 1);
                    break;
                }
            }
            this.walkNextPart();
            return true;
        } else {
            this._me.faceToPoint(this._endPoint.x, this._endPoint.y);
            if (callInWalk != null) callInWalk.apply(null);
            setTimeout(this.walkFinished.bind(this), 1);
            return false;
        }
    },

});