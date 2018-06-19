const RpgGlobal = require("RpgGlobal");
const Direction=require("Direction");
cc.Class({
    properties: {
        _me:null,
        me: {
            set: function (value) {
                this._me = value;
            },
            get: function () {
                return this._me;
            },
            visible:false,
        },
        _path: null,
        _callInWalk: null,
        _callInWalkDist: 5,
        _callAfterWalk: null,
        _endPoint: cc.v2(0, 0),
        _preTarget: null,
        _nextTarget:null,

    },
    moveTo: function (nextX, nextY) {
    },
    walkFinished: function () {
    },
    clearPath: function () {
    },
    calAction: function () {
    },
    walkTo: function (dx, dy, AStar = false, callAfterWalk = null, callInWalk = null, callInWalkDist = 5) {
    },
    walkInPath: function (path, callAfterWalk = null, callInWalk = null, callInWalkDist = 5) {
    },
    getPath: function (from, to) {
        let paths = [];
        let map = RpgGlobal.scene.map;
        // 检查目标点是否可移动
        if (map.AStar == null) {
            paths.push(from.clone());
            paths.push(to.clone());
        }
        else {
            // 得出路径
            let nodeArr = map.AStar.find(from.x, from.y, to.x, to.y);
            if (nodeArr == null || nodeArr.length < 2)
                return null;
            else {
                let node;
                paths.push(from.clone());
                let len = nodeArr.length;
                for (let i = 1; i < len; i++) {
                    node = nodeArr[i];
                    let p = map.grid2WorldPostion(node.x, node.y).clone();
                    paths.push(p);
                }
            }
        }
        return paths;
    },
    getDirectionByPoint: function (dx, dy) {
        var dir = Direction.Up;
        var x1;
        var y1;
        x1 = this._me.posX - dx;
        y1 = this._me.posY - dy;
        var ang = Math.ceil((Math.atan2(y1, x1) * 180) / Math.PI);
        if (ang >= -15 && ang < 15) {
            dir =  Direction.Left;//6-8;
        }
        else if (ang >= 15 && ang < 75) {
            dir =  Direction.LeftUp;//7-8;
        }
        else if (ang >= 75 && ang < 105) {
            dir =  Direction.Up;//0;
        }
        else if (ang >= 105 && ang < 170) {
            dir =  Direction.RightUp;//1;
        }
        else if (ang >= 170 || ang < -170) {
            dir =  Direction.Right;//2;
        }
        else if (ang >= -75 && ang < -15) {
            dir =  Direction.LeftDown;// 5-8;
        }
        else if (ang >= -105 && ang < -75) {
            dir =  Direction.Down;//4;
        }
        else if (ang >= -170 && ang < -105) {
            dir =  Direction.RightDown;//3;
        }
        return dir;
    }

});