const GameObject = require("GameObject");
const Actions = require("Actions");
const AStarFinder = require("AStarFinder");
const Utils = require("Utils");
const RpgGlobal = require("RpgGlobal");
var MapTile = cc.Class({
    properties: {
        row: 0,
        col: 0,
        tileNode: cc.Node,
        tileImage: cc.Sprite,
        loaded: false,
    },
    create: function() {
        if (!this.tileNode) {
            this.tileNode = new cc.Node();
            this.tileImage = this.tileNode.addComponent(cc.Sprite);
        } else {
            this.tileImage.spriteFrame = null;
        }
    },
    load: function(url) {
        this.loaded = true;
        let self = this;
        cc.loader.loadRes(url, cc.SpriteFrame, function(err, sp) {
            if (!err) {
                self.tileImage.spriteFrame = sp;
            }
        });
    }
});
var RpgMap = cc.Class({
    extends: cc.Component,
    properties: {
        _sceneData: null,
        sceneData: {
            get: function() {
                return this._sceneData;
            },
            visible: false,
        },
        _mapWidth: 0,
        _mapHeight: 0,
        _tileWidth: 256,
        _tileHeight: 256,
        _mapId: 0,
        _focusObject: GameObject,
        _mapVisibleSize: cc.Size,
        _visibleRows: 1, //可视区域能显示的最大行数
        _visibleCols: 1, //可视区域能显示的最大列数
        _visibleGridRows: 1,
        _visibleGridCols: 1,
        _lastRenderPoint: cc.p(-1, -1),
        _lastRenderSize: cc.Size,
        _centerPoint: cc.p(0, 0), //地图中心点坐标
        centerPoint: {
            set: function(v) {
                this._centerPoint = v;
            },
            get: function() {
                return this._centerPoint;
            },
            visible: false,
        },
        _nowStartRow: 0,
        _nowStartCol: 0,
        _tiles: null,
        _visibleTiles: null,
        _loadingList: null,
        _AStar: AStarFinder,
        _cameraCullingView: {
            default: new cc.Rect(0, 0, 1, 1),
            serializable: false,
        },
        mapVisibleSize: {
            get: function() {
                return this._mapVisibleSize;
            },
            visible: false,
        },
        mapHeight: {
            get: function() {
                return this._mapHeight;
            },
            visible: false,
        },
        mapWidth: {
            get: function() {
                return this._mapWidth;
            },
            visible: false,
        },
        focusObject: {
            get: function() {
                return this._focusObject;
            },
            visible: false,
        },
        cameraCullingView: {
            get: function() {
                return this._cameraCullingView;
            },
            visible: false,
        },
        startX: {
            get: function() {
                let visibleSize = this._mapVisibleSize;
                let screen_startX = this._centerPoint.x - visibleSize.width / 2;
                screen_startX = Math.min(this._mapWidth - visibleSize.width, screen_startX);
                screen_startX = Math.max(0, screen_startX);
                return screen_startX;
            },
            visible: false,
        },
        startY: {
            get: function() {
                let visibleSize = this._mapVisibleSize;
                let screen_startY = this._centerPoint.y - visibleSize.height / 2;
                screen_startY = Math.min(this._mapHeight - visibleSize.height, screen_startY);
                screen_startY = Math.max(0, screen_startY);
                return screen_startY;
            },
            visible: false,
        },
        AStar: {
            get: function() {
                return this._AStar;
            },
            visible: false
        }
    },
    onLoad: function() {

    },
    setup: function(sceneData) {
        this._sceneData = sceneData;
        this._tiles = {};
        this._visibleTiles = [];
        this._loadingList = [];
        this._lastRenderPoint.x = -1;
        this._lastRenderPoint.y = -1;
        this._tileHeight = RpgGlobal.TILE_HIGHT;
        this._tileWidth = RpgGlobal.TILE_WIDTH;
        this._mapId = this._sceneData.map_id;
        this._mapWidth = this._sceneData.pixel_width;
        this._mapHeight = this._sceneData.pixel_height;
        this._mapVisibleSize = cc.Size.ZERO;
        this._lastRenderSize = cc.Size.ZERO;
        this.updateVisibleSize(cc.view.getVisibleSize().width, cc.view.getVisibleSize().height);
        if (this._AStar) {
            this._AStar.dispose();
        }
        this._AStar = new AStarFinder(this._sceneData.roadArray, 8, RpgGlobal.GRID_SIZE);

    },
    updateAStarGrid: function() {
        this._AStar.updateGrid(this._sceneData.roadArray);
    },
    follow: function(player) {
        this._focusObject = player;
        if (this._focusObject) {
            this._centerPoint.x = this._focusObject.posX;
            this._centerPoint.y = this._focusObject.posX;
        }
    },
    getFocusObjectPoint: function() {
        let speed = 90;
        let tar = null;
        let dis = cc.pDistance(this._focusObject.pos, this._centerPoint);
        let per = 0;
        if (dis >= speed + 1) {
            per = speed / dis;
            tar = Utils.interpolate(this._focusObject.pos, this._centerPoint, per);
        } else if (dis > 50 && this._focusObject.action == Actions.Stand) {
            speed = 6;
            per = (dis - speed) / dis;
            tar = Utils.interpolate(this._centerPoint, this._focusObject.pos, per);
        }
        // return this._focusObject.pos;
        return tar;
    },
    render: function() {
        // var newP = null;
        // if (this._focusObject) {
        //     newP = this.getFocusObjectPoint();
        // } else {
        //     newP = this._centerPoint;
        // }
        // if (newP == null) {
        //     return;
        // }
        if (this._focusObject) {
            let newP = this._focusObject.pos;
            if (newP) {
                this._centerPoint.x = newP.x;
                this._centerPoint.y = newP.y;
            }
        }
        if (this._lastRenderPoint.x == this._centerPoint.x && this._lastRenderPoint.y == this._centerPoint.y) {
            if (this._lastRenderSize.width == this._mapVisibleSize.width && this._lastRenderSize.height == this._mapVisibleSize.height) {
                return;
            }
        }
        this._lastRenderSize.width = this._mapVisibleSize.width;
        this._lastRenderSize.height = this._mapVisibleSize.height
        this._lastRenderPoint.x = this._centerPoint.x;
        this._lastRenderPoint.y = this._centerPoint.y;
        let startX_ = this.startX;
        let startY_ = this.startY;
        let visibleSize = this._mapVisibleSize;
        this._cameraCullingView.x = startX_;
        this._cameraCullingView.y = startY_;
        this._cameraCullingView.width = visibleSize.width;
        this._cameraCullingView.height = visibleSize.height;

        this._loadingList.splice(0, this._loadingList.length);
        let startRow = Math.floor(startY_ / this._tileHeight);
        let startCol = Math.floor(startX_ / this._tileWidth);
        let lastVisibleTiles = this._visibleTiles.splice(0, this._visibleTiles.length);

        this._nowStartRow = startRow;
        this._nowStartCol = startCol;

        let offsetX = -startX_ % this._tileWidth;
        let offsetY = -startY_ % this._tileHeight;
        let maxRow = Math.min(startRow + this._visibleRows + 1, Math.ceil(this._mapHeight / this._tileHeight));
        let maxCol = Math.min(startCol + this._visibleCols + 1, Math.ceil(this._mapWidth / this._tileWidth));
        for (let i = startRow - 1; i < maxRow; i++) {
            for (let j = startCol - 1; j < maxCol; j++) {
                let key = i + "_" + j;
                let tile = this._tiles[key];
                if (!tile) {
                    tile = new MapTile();
                    tile.row = i;
                    tile.col = j;
                    tile.create();
                    this._tiles[key] = tile;
                }
                if (!tile.loaded) {
                    this._loadingList.push(tile);
                }
                if (tile.tileNode.parent != this.node) {
                    this.node.addChild(tile.tileNode);
                }
                tile.tileNode.setPosition(this._getTileScreenPosition(offsetX + (j - startCol) * this._tileWidth + this._tileWidth / 2, offsetY + (i - startRow) * this._tileHeight + this._tileHeight / 2));
                this._visibleTiles.push(tile);
            }
        }

        let lastVisLen = lastVisibleTiles.length;
        let visLen = this._visibleTiles.length;
        for (let i = 0; i < lastVisLen; i++) {
            let found = false;
            let last = lastVisibleTiles[i];
            for (let j = 0; j < visLen; j++) {
                let current = this._visibleTiles[j];
                if (last.row == current.row && last.col == current.col) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.node.removeChild(last.tileNode);
            }
        }
    },
    _getTileScreenPosition: function(posX, posY) {
        let p = cc.v2(posX, posY);
        let visibleSize = this._mapVisibleSize;
        p.x = p.x - visibleSize.width / 2;
        p.y = visibleSize.height / 2 - p.y;
        return p;
    },
    getScreenPosition: function(posX, posY) {
        let visibleSize = this._mapVisibleSize;
        let p = new cc.v2(0, 0);
        p.x = posX - this.startX;
        p.y = posY - this.startY;
        p.x = p.x - visibleSize.width / 2;
        p.y = visibleSize.height / 2 - p.y;
        return p;
    },
    getWorldPosition: function(sx, sy) {
        let visibleSize = this._mapVisibleSize;
        let sx2 = sx + visibleSize.width / 2;
        let sy2 = visibleSize.height / 2 - sy;
        let p = new cc.v2(0, 0);
        p.x = this.startX + sx2;
        p.y = this.startY + sy2;
        return p;
    },
    gameLoop: function() {
        this.render();
        while (this._loadingList.length > 0) {
            let tile = this._loadingList.shift();
            let key = tile.col + "_" + tile.row;
            tile.load(`maps/map_image/scene_${this._mapId}/${key}`);
        }
    },
    drawGrid: function(g) {
        g.clear();
        let gridSize = RpgGlobal.GRID_SIZE;

        let startX_ = this.startX;
        let startY_ = this.startY;

        let startRow = Math.floor(startY_ / gridSize);
        let startCol = Math.floor(startX_ / gridSize);
        let offsetX = -startX_ % gridSize;
        let offsetY = -startY_ % gridSize;
        let maxRow = Math.min(startRow + this._visibleGridRows + 1, Math.ceil(this._mapHeight / gridSize));
        let maxCol = Math.min(startCol + this._visibleGridCols + 1, Math.ceil(this._mapWidth / gridSize));
        let exStartRow = Math.max(startRow - 1, 0);
        let exStartCol = Math.max(startCol - 1, 0);
        for (let i = exStartCol; i < maxCol; i++) {
            for (let j = exStartRow; j < maxRow; j++) {
                let key = i + "|" + j;
                let square = this._sceneData.take(key);
                if (square && square.isVill) {
                    if (this._sceneData.roadArray[j][i] == 0) {
                        continue;
                    }
                    let sx = offsetX + (i - startCol) * gridSize;
                    let sy = offsetY + (j - startRow) * gridSize;
                    let visibleSize = this._mapVisibleSize;
                    sy = visibleSize.height - sy;

                    var fillColor = new cc.Color(6, 142, 41, 190);
                    g.fillColor = fillColor;
                    var lineColor = new cc.Color(166, 10, 10, 255);
                    g.strokeColor = lineColor;
                    g.lineWidth = 2;
                    g.moveTo(sx, sy);
                    g.lineTo(sx + gridSize, sy);
                    g.lineTo(sx + gridSize, sy - gridSize);
                    g.lineTo(sx, sy - gridSize);
                    g.lineTo(sx, sy);
                    g.stroke();
                    g.fill();
                }

            }
        }


    },
    grid2WorldPostion: function(px, py) {
        let p = cc.v2(0, 0);
        p.x = px * RpgGlobal.GRID_SIZE + RpgGlobal.GRID_SIZE * 0.5;
        p.y = py * RpgGlobal.GRID_SIZE + RpgGlobal.GRID_SIZE * 0.5;
        return p;
    },
    isInAlphaArea: function(posX, posY) {
        let gridX = Math.floor(posX / RpgGlobal.GRID_SIZE);
        let gridY = Math.floor(posY / RpgGlobal.GRID_SIZE);
        let square = this._sceneData.take(gridX + "|" + gridY);
        if (square) {
            return square.isAlpha;
        } else {
            return false;
        }
    },
    updateVisibleSize: function(w, h) {
        this._mapVisibleSize.width = w;
        this._mapVisibleSize.height = h;
        this._visibleCols = Math.ceil(this._mapVisibleSize.width / this._tileWidth);
        this._visibleRows = Math.ceil(this._mapVisibleSize.height / this._tileHeight);
        this._visibleGridCols = Math.ceil(this._mapVisibleSize.width / RpgGlobal.GRID_SIZE);
        this._visibleGridRows = Math.ceil(this._mapVisibleSize.height / RpgGlobal.GRID_SIZE);
    }

});
module.exports = RpgMap;