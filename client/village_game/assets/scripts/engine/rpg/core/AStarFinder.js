let AStarFinder = cc.Class({
    name: "AStarFinder",
    properties: {
        /**寻路方式，8方向和4方向，有效值为8和4**/
        _workMode: 8,
        /**网格**/
        _grid: Grid,
        /**路径**/
        _path: Array,
        /**A***/
        _astar: AStar,
        /**格子大小**/
        _cellSize: 32,
        /**是否使用Floyd 算法寻找最短路径**/
        _isFloydPath: true,
        isFloydPath: {
            set: function(value) {
                this._isFloydPath = value;
            },
            get: function() {
                return this._isFloydPath;
            }
        }

    },
    __ctor__(mapdata, workMode = 8, cellSize = 32) {
        this._cellSize = cellSize;
        this._workMode = workMode;
        this.makeGrid(mapdata);
    },
    /**寻找离给定点最近的可以行走的点**/
    cycleCheck(xTo, yTo, level) {
        let _node = this._grid.getNode(xTo, yTo);
        if (!_node.walkable) {
            let _xEnd = xTo + level;
            let _yEnd = yTo + level;
            _xEnd = Math.min(this._grid.numCols - 1, _xEnd);
            _yEnd = Math.min(this._grid.numRows - 1, _yEnd);
            let _tmpNode;
            let _startX = xTo - level;
            if (_startX < 0) _startX = 0;
            let _startY = yTo - level;
            if (_startY < 0) _startY = 0;
            for (let _x = _startX; _x <= _xEnd; _x++) {
                for (let _y = _startY; _y <= _yEnd; _y++) {
                    if (this._workMode == 4 && _x != xTo && _y != yTo)
                        continue;
                    if (Math.abs(_x - xTo) == level || Math.abs(_y - yTo) == level) {
                        _tmpNode = this._grid.getNode(_x, _y);
                        if (_tmpNode && _tmpNode.walkable) {
                            return cc.p(_x, _y);
                        }
                    }
                }
            }
            if (level > 8)
                return cc.p(xTo, yTo);
            return this.cycleCheck(xTo, yTo, level + 1);
        }
        return cc.p(xTo, yTo);
    },
    setNode(xnow, ynow, xto, yto) {
        let _needReverse;
        if (xto >= xnow) {
            this._grid.setEndNode(xto, yto);
            this._grid.setStartNode(xnow, ynow);
        } else {
            _needReverse = true;
            this._grid.setEndNode(xnow, ynow);
            this._grid.setStartNode(xto, yto);
        }
        return _needReverse;
    },
    /**
     * 修正目标点
     * @param		xTo	目标点X(世界坐标)
     * @param		yTo	目标点Y(世界坐标)
     * **/
    reviseTargetPoint(xTo, yTo) {
        xTo = Math.floor(xTo / this._cellSize);
        yTo = Math.floor(yTo / this._cellSize);
        xTo = Math.min(xTo, this._grid.numCols - 1);
        yTo = Math.min(yTo, this._grid.numRows - 1);
        let _p = this.cycleCheck(xTo, yTo, 1);
        _p.x *= this._cellSize;
        _p.y *= this._cellSize;
        return _p;
    },
    /**
     * 
     * @param		xnow	当前坐标X(世界坐标)
     * @param		ynow	当前坐标Y(世界坐标)
     * @param		xpos	目标点X(世界坐标)
     * @param		ypos	目标点Y(世界坐标)
     */
    passTest(xFrom, yFrom, xTo, yTo) {
        xFrom = Math.floor(xFrom / this._cellSize);
        yFrom = Math.floor(yFrom / this._cellSize);
        xTo = Math.floor(xTo / this._cellSize);
        yTo = Math.floor(yTo / this._cellSize);
        xTo = Math.min(xTo, this._grid.numCols - 1);
        yTo = Math.min(yTo, this._grid.numRows - 1);
        this.setNode(xFrom, yFrom, xTo, yTo);
        return this._astar.findPath(true);
    },
    /**
     * @param		xnow	当前坐标X(世界坐标)
     * @param		ynow	当前坐标Y(世界坐标)
     * @param		xpos	目标点X(世界坐标)
     * @param		ypos	目标点Y(世界坐标)
     * @parm        revisePos 是否需要修正目标点
     */
    find(xFrom, yFrom, xTo, yTo) {
        let time = new Date().getTime();
        xFrom = Math.floor(xFrom / this._cellSize);
        yFrom = Math.floor(yFrom / this._cellSize);
        xTo = Math.floor(xTo / this._cellSize);
        yTo = Math.floor(yTo / this._cellSize);
        xTo = Math.min(xTo, this._grid.numCols - 1);
        yTo = Math.min(yTo, this._grid.numRows - 1);
        let tmpPoint = this.cycleCheck(xTo, yTo, 1);
        let needReverse = this.setNode(xFrom, yFrom, tmpPoint.x, tmpPoint.y);
        if (this._grid.startNode != null && this._grid.endNode != null && this._astar.findPath()) {
            if (this._isFloydPath) {
                this._astar.floyd();
                this._path = this._astar.floydPath;
            } else
                this._path = this._astar.path;
            if (needReverse)
                this._path.reverse();
            return this._path;
        }
        time = new Date().getTime() - time;
        cc.info("寻路消耗时间:" + time + "ms 找不到:" + "node Start:" + this._grid.startNode + "|node End:" + this._grid.endNode, false, this);
        return null;
    },
    makeGrid(data) {
        let rows = data.length;
        let cols = data[0].length;
        this._grid = new Grid(cols, rows);
        let px;
        let py;
        for (py = 0; py < rows; py++) {
            for (px = 0; px < cols; px++) {
                this._grid.setWalkable(px, py, data[py][px] > 0);
            }
        }
        if (this._workMode == 8)
            this._grid.calculateLinks(1);
        else if (this._workMode == 4)
            this._grid.calculateLinks(0);
        this._astar = new AStar(this._grid, this._workMode);
    },
    updateGrid(data) {
        let rows = data.length;
        let cols = data[0].length;
        this._grid = new Grid(cols, rows);
        let px;
        let py;
        for (py = 0; py < rows; py++) {
            for (px = 0; px < cols; px++) {
                this._grid.setWalkable(px, py, data[py][px] > 0);
            }
        }
        if (this._workMode == 8)
            this._grid.calculateLinks(1);
        else if (this._workMode == 4)
            this._grid.calculateLinks(0);

        this._astar.grid = this._grid;
    },
    getColor(node) {
        if (!node.walkable)
            return 0;
        if (node == this._grid.startNode)
            return 0xcccccc;
        else if (node == this._grid.endNode)
            return 0xcccccc;
        return 0xffffff;
    },
    dispose() {},
});

let AStar = cc.Class({
    properties: {
        _open: BinaryHeap,
        _grid: Grid,
        grid: {
            set: function(value) {
                this._grid = value;
            },
            get: function() {
                return this._grid;
            }
        },
        _endNode: ANode,
        _startNode: ANode,
        _path: Array,
        _floydPath: Array,
        _heuristic: Function, //估计公式
        _straightCost: 1.0, //直线代价
        _diagCost: 0, //对角线代价
        _turnPenalty: 1, //转弯代价
        _nowversion: 1,
        /**寻路方式，8方向和4方向，有效值为8和4**/
        _workMode: 8,
        path: {
            get: function() {
                return this._path;
            }
        },
        floydPath: {
            get: function() {
                return this._floydPath;
            }
        },
        _twoOneTwoZero: 0,
    },
    __ctor__(grid, workMode = 8) {
        this._grid = grid;
        this._workMode = workMode;
        this._heuristic = this.diagonal;
        this._diagCost = Math.SQRT2;
        this._twoOneTwoZero = 2 * Math.cos(Math.PI / 3);
    },
    justMin(x, y) {
        return x.f < y.f;
    },
    findPath(testFind = false) {
        this._endNode = this._grid.endNode;
        this._nowversion++;
        this._startNode = this._grid.startNode;
        this._open = new BinaryHeap(this.justMin);
        this._startNode.g = 0;
        return this.search(testFind);
    },
    floyd() {
        if (this.path == null)
            return;
        this._floydPath = this.path.concat();
        let i;
        let len;
        len = this._floydPath.length;
        if (len > 2) //合并同一条线上的点
        {
            //遍历路径数组中全部路径节点，合并在同一直线上的路径节点
            //假设有1,2,3,三点，若2与1的横、纵坐标差值分别与3与2的横、纵坐标差值相等则
            //判断此三点共线，此时可以删除中间点2
            let vector = new ANode(0, 0); //上一步方向
            let tempVector = new ANode(0, 0); //当前步方向
            let tempVectorWill = new ANode(0, 0); //下一步的走向
            let directionChanged;
            this.floydVector(vector, this._floydPath[len - 1], this._floydPath[len - 2]);
            for (i = this._floydPath.length - 3; i >= 0; i--) {
                this.floydVector(tempVector, this._floydPath[i + 1], this._floydPath[i]);
                if (i >= 1)
                    this.floydVector(tempVectorWill, this._floydPath[i], this._floydPath[i - 1]);
                if ((vector.x == tempVector.x && vector.y == tempVector.y) && directionChanged == false &&
                    (tempVectorWill.x == tempVector.x && tempVectorWill.y == tempVector.y)) //刚刚改变方向的点不合并,后面会合并成135度角
                {
                    this._floydPath.splice(i + 1, 1);
                } else {
                    if (vector.x == tempVector.x && vector.y == tempVector.y)
                        directionChanged = !directionChanged;
                    else {
                        directionChanged = true;
                        vector.x = tempVector.x;
                        vector.y = tempVector.y;
                    }
                }
            }
        }
        //移除多余点，走斜线
        if (this._workMode == 8) //8个方向才能走斜线
        {
            len = this._floydPath.length;
            for (i = len - 1; i >= 0; i--) {
                for (let j = 0; j <= i - 2; j++) {
                    if (this.floydCrossAble2(this._floydPath[i], this._floydPath[j])) {
                        for (let k = i - 1; k > j; k--) {
                            this._floydPath.splice(k, 1);
                        }
                        i = j + 1;
                        len = this._floydPath.length;
                        break;
                    }
                }
            }
        }
    },
    //只走等腰直角三角形,或沿X，或沿Y
    floydCrossAble2(n1, n2) {
        let _dValueX = n2.x - n1.x;
        let _dValueY = n2.y - n1.y;
        _dValueX = _dValueX < 0 ? -_dValueX : _dValueX;
        _dValueY = _dValueY < 0 ? -_dValueY : _dValueY;
        if (n1.x != n2.x && n1.y != n2.y && _dValueX != _dValueY) {
            return false;
        }
        let ps = this.bresenhamNodes(cc.p(n1.x, n1.y), cc.p(n2.x, n2.y));
        for (let i = ps.length - 2; i > 0; i--) {
            if (!this._grid.getNode(ps[i].x, ps[i].y).walkable) {
                return false;
            }
        }
        return true;
    },
    floydCrossAble(n1, n2) {
        let ps = this.bresenhamNodes(cc.p(n1.x, n1.y), cc.p(n2.x, n2.y));
        for (let i = ps.length - 2; i > 0; i--) {
            if (!this._grid.getNode(ps[i].x, ps[i].y).walkable) {
                return false;
            }
        }
        return true;
    },
    bresenhamNodes(p1, p2) {
        let steep = Math.abs(p2.y - p1.y) > Math.abs(p2.x - p1.x);
        if (steep) {
            let temp = p1.x;
            p1.x = p1.y;
            p1.y = temp;
            temp = p2.x;
            p2.x = p2.y;
            p2.y = temp;
        }
        let stepX = p2.x > p1.x ? 1 : (p2.x < p1.x ? -1 : 0);
        let stepY = p2.y > p1.y ? 1 : (p2.y < p1.y ? -1 : 0);
        let deltay = (p2.y - p1.y) / Math.abs(p2.x - p1.x);
        let ret = [];
        let nowX = p1.x + stepX;
        let nowY = p1.y + deltay;
        if (steep) {
            ret.push(cc.p(p1.y, p1.x));
        } else {
            ret.push(cc.p(p1.x, p1.y));
        }
        while (nowX != p2.x) {
            let fy = Math.floor(nowY)
            let cy = Math.ceil(nowY);
            if (steep) {
                ret.push(cc.p(fy, nowX));
            } else {
                ret.push(cc.p(nowX, fy));
            }
            if (fy != cy) {
                if (steep) {
                    ret.push(cc.p(cy, nowX));
                } else {
                    ret.push(cc.p(nowX, cy));
                }
            }
            nowX += stepX;
            nowY += deltay;
        }
        if (steep) {
            ret.push(cc.p(p2.y, p2.x));
        } else {
            ret.push(cc.p(p2.x, p2.y));
        }
        return ret;
    },
    floydVector(target, n1, n2) {
        target.x = n1.x - n2.x;
        target.y = n1.y - n2.y;
    },
    search(testFind = false) {
        let node = this._startNode;
        node.version = this._nowversion;
        while (node != this._endNode) {
            let len = node.links.length;
            for (let i = 0; i < len; i++) {
                let link = node.links[i];
                let test = link.node;
                let cost = link.cost;
                let g = node.g + cost; //起点到当前点的耗费
                let h = this._heuristic(test); //当前点到终点的耗费
                let c = 0;
                if (!testFind) {
                    c = this.redirection(node, test); //改变方向耗费
                }
                g = g + c; //走当前点的总耗费
                let f = g + h;
                if (test.version == this._nowversion) {
                    if (test.f > f) {
                        test.f = f;
                        test.g = g;
                        test.h = h;
                        test.parent = node;
                    }
                } else {
                    test.f = f;
                    test.g = g;
                    test.h = h;
                    test.parent = node;
                    this._open.ins(test);
                    test.version = this._nowversion;
                }
            }
            if (this._open.a.length == 1)
                return false;
            node = this._open.pop();
        }
        if (!testFind)
            this.buildPath();
        return true;
    },
    buildPath() {
        this._path = [];
        let node = this._endNode;
        this._path.push(node);
        while (node != this._startNode) {
            node = node.parent;
            this._path.unshift(node);
        }
    },
    //改变方向成本
    redirection(node, test) {
        let cost = 0;
        if (node.parent) {
            let dx1 = node.x - node.parent.x;
            let dy1 = node.y - node.parent.y;
            let dx2 = test.x - node.x;
            let dy2 = test.y - node.y;

            if (dx1 != dx2 && dy1 != dy2)
                cost = 2;
            else if (dx1 != dx2 || dy1 != dy2)
                cost = 1;
        }
        return cost * this._turnPenalty;
    },
    //曼哈顿估价法
    manhattan(node) {
        return Math.abs(node.x - this._endNode.x) + Math.abs(node.y - this._endNode.y);
    },
    //曼哈顿估价法
    manhattan2(node) {
        let dx = Math.abs(node.x - this._endNode.x);
        let dy = Math.abs(node.y - this._endNode.y);
        return dx + dy + Math.abs(dx - dy) / 1000;
    },
    //几何估价法-距离启发函数
    euclidian(node) {
        let dx = node.x - this._endNode.x;
        let dy = node.y - this._endNode.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    chineseCheckersEuclidian2(node) {
        let y = node.y / this._twoOneTwoZero;
        let x = node.x + node.y / 2;
        let dx = x - this._endNode.x - this._endNode.y / 2;
        let dy = y - this._endNode.y / this._twoOneTwoZero;
        return sqrt(dx * dx + dy * dy);
    },
    sqrt(x) {
        return Math.sqrt(x);
    },
    //几何估价法
    euclidian2(node) {
        let dx = node.x - this._endNode.x;
        let dy = node.y - this._endNode.y;
        return dx * dx + dy * dy;
    },
    //对角线估价法
    diagonal(node) {
        let dx = Math.abs(node.x - this._endNode.x);
        let dy = Math.abs(node.y - this._endNode.y);
        let diag = Math.min(dx, dy);
        let straight = dx + dy;
        return this._diagCost * diag + this._straightCost * (straight - 2 * diag);
    }
});

let BinaryHeap = cc.Class({
    properties: {
        a: null,
        justMinFun: Function,
    },
    __ctor__(justMinFun = null) {
        this.a = [-1];
        if (justMinFun) {
            this.justMinFun = justMinFun;
        } else {
            this.justMinFun = function(x, y) {
                return x < y;
            }
        }
    },
    ins(value) {
        let p = this.a.length;
        this.a[p] = value;
        let pp = p >> 1;
        while (p > 1 && this.justMinFun(this.a[p], this.a[pp])) {
            let temp = this.a[p];
            this.a[p] = this.a[pp];
            this.a[pp] = temp;
            p = pp;
            pp = p >> 1;
        }
    },
    pop() {
        let min = this.a[1];
        this.a[1] = this.a[this.a.length - 1];
        this.a.pop();
        let p = 1;
        let l = this.a.length;
        let sp1 = p << 1;
        let sp2 = sp1 + 1;
        while (sp1 < l) {
            let minp;
            if (sp2 < l) {
                minp = this.justMinFun(this.a[sp2], this.a[sp1]) ? sp2 : sp1;
            } else {
                minp = sp1;
            }
            if (this.justMinFun(this.a[minp], this.a[p])) {
                let temp = this.a[p];
                this.a[p] = this.a[minp];
                this.a[minp] = temp;
                p = minp;
                sp1 = p << 1;
                sp2 = sp1 + 1;
            } else {
                break;
            }
        }
        return min;
    }
});

let Grid = cc.Class({
    properties: {
        _startNode: ANode,
        _endNode: ANode,
        _nodes: Array,
        _numCols: 0,
        _numRows: 0,
        _type: 0,
        _straightCost: 1.0,
        _diagCost: 0,
        endNode: {
            get: function() {
                return this._endNode;
            }
        },
        numCols: {
            get: function() {
                return this._numCols;
            }
        },
        numRows: {
            get: function() {
                return this._numRows;
            }
        },
        startNode: {
            get: function() {
                return this._startNode;
            }
        }
    },
    __ctor__(numCols, numRows) {
        this._numCols = numCols;
        this._numRows = numRows;
        this._diagCost = Math.SQRT2;
        this._nodes = new Array();
        for (let i = 0; i < this._numCols; i++) {
            this._nodes[i] = new Array();
            for (let j = 0; j < this._numRows; j++) {
                this._nodes[i][j] = new ANode(i, j);
            }
        }
    },
    /**
     * @param   type    0:四方向 1:八方向 
     */
    calculateLinks(type = 1) {
        this._type = type;
        for (let i = 0; i < this._numCols; i++) {
            for (let j = 0; j < this._numRows; j++) {
                this.initNodeLink(this._nodes[i][j], type);
            }
        }
    },
    getType() {
        return this._type;
    },
    /**
     * @param   node
     * @param   type   0:四方向 1:八方向 
     * 	 */
    initNodeLink(node, type = 1) {
        let startX = Math.max(0, node.x - 1);
        let endX = Math.min(this.numCols - 1, node.x + 1);
        let startY = Math.max(0, node.y - 1);
        let endY = Math.min(this.numRows - 1, node.y + 1);
        node.links = [];
        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                let test = this.getNode(i, j);
                if (test == node || !test.walkable)
                    continue;
                if (i != node.x && j != node.y) {
                    let test2 = this.getNode(node.x, j);
                    if (!test2.walkable)
                        continue;
                    test2 = this.getNode(i, node.y);
                    if (!test2.walkable)
                        continue;
                }
                let cost = this._straightCost;
                if (!((node.x == test.x) || (node.y == test.y))) {
                    if (type == 0)
                        continue;
                    else
                        cost = this._diagCost;
                }
                node.links.push(new Link(test, cost));
            }
        }
    },
    getNode(x, y) {
        return this._nodes[x][y];
    },
    setEndNode(x, y) {
        this._endNode = this._nodes[x][y];
    },
    setStartNode(x, y) {
        this._startNode = this._nodes[x][y];
    },
    setWalkable(x, y, value) {
        this._nodes[x][y].walkable = value;
    }
});

let Link = cc.Class({
    properties: {
        node: ANode,
        cost: Number,
    },
    __ctor__(node, cost) {
        this.node = node;
        this.cost = cost;
    }
});

let ANode = cc.Class({
    properties: {
        x: 0,
        y: 0,
        f: Number,
        g: Number,
        h: Number,
        walkable: true,
        parent: ANode,
        //costMultiplier:Number = 1.0,
        version: 1,
        links: Array,
    },
    __ctor__(x, y) {
        this.x = x;
        this.y = y;
    },
    toString: function() {
        return "(" + this.x + "," + this.y + ")"
    }
});

module.exports = AStarFinder;