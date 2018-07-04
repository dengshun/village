const RpgGlobal = require("RpgGlobal");
const Square = cc.Class({
    name: "Square",
    properties: {
        /**0:是否可走，1:是否是透明区，.......,5:村庄区,6:野外区1,7:野外区2,8:野外区3,9:野外区4**/
        type: 0,
        /**是否可以行走**/
        isCanWalk: false,
        /**是否是透明区域**/
        isAlpha: false,
        /**是否 是村庄区**/
        isVill: false,
        /**是否 是野外区1**/
        isField1: false,
        /**是否 是野外区2**/
        isField2: false,
        /**是否 是野外区3**/
        isField3: false,
        /**是否 是野外区4**/
        isField4: false,
        x: 0,
        y: 0,
        key: {
            get: function() {
                return this.x + "|" + this.y;
            }
        }
    },
    __ctor__: function(x, y) {
        this.x = x;
        this.y = y;
    },
});
const ItemData = cc.Class({
    name: "ItemData",
    properties: {
        item_id: 0,
        x: 0,
        y: 0,
        layer: 0,
        depth: 0,
    }
});
const MapData = cc.Class({
    name: "MapData",
    properties: {
        map_id: 0,
        pixel_width: 0,
        pixel_height: 0,
        items: null,
        pixel_x: 0,
        pixel_y: 0,
        roadArray: null,
        _squaresHash: null,
        squares: {
            get: function() {
                return this._squaresHash;
            }
        }
    },
    ctor: function() {},
    resetSquaresHash: function() {
        this._squaresHash = {};
    },
    has: function(key) {
        if (this._squaresHash[key]) {
            return true;
        }
        return false;
    },
    put: function(value) {
        this._squaresHash[value.key] = value;
    },
    take: function(key) {
        return this._squaresHash[key];
    },
    remove: function(key) {
        delete this._squaresHash[key];
    },
    getSquaresByType: function(type) {
        let squares = [];
        for (let key in this._squaresHash) {
            let square = this._squaresHash[key];
            if (square.type == type) {
                squares.push(square);
            }
        }
        return squares
    },
    prasePro: function(x, y, pro) {
        let square = new Square(x, y);

        square.isCanWalk = (pro >> 15) == 1;
        square.isAlpha = ((pro >> 14) & 1) == 1;
        square.isVill = ((pro >> 10) & 1) == 1;
        square.isField1 = ((pro >> 9) & 1) == 1;
        square.isField2 = ((pro >> 8) & 1) == 1;
        square.isField3 = ((pro >> 7) & 1) == 1;
        square.isField4 = ((pro >> 6) & 1) == 1;
        /**0:是否可走，1:是否是透明区，.......,5:村庄区,6:野外区1,7:野外区2,8:野外区3,9:野外区4**/
        if (square.isVill) {
            square.type = 5;
        } else if (square.isField1) {
            square.type = 6;
        } else if (square.isField2) {
            square.type = 7;
        } else if (square.isField3) {
            square.type = 8;
        } else if (square.isField4) {
            square.type = 9;
        } else if (square.isCanWalk) {
            square.type = 0;
        } else {
            square.type = -1;
        }

        return square;
    },
    praseLayerpro(id, x, y, pro) {
        let itemData = new ItemData();
        itemData.x = x;
        itemData.y = y;
        itemData.item_id = id;
        itemData.layer = pro.readShort();
        itemData.depth = pro.readShort();
        return itemData;
    },
    resetRoad: function() {
        // 定义临时地图数据
        let h = Math.ceil(this.pixel_height / RpgGlobal.GRID_SIZE);
        let w = Math.ceil(this.pixel_width / RpgGlobal.GRID_SIZE);
        this.roadArray = new Array(h);
        for (let y = 0; y < h; y++) {
            this.roadArray[y] = new Array(w);
        }
    },
    updateRoadWalkable: function(x, y, walkable) {
        this.roadArray[y][x] = walkable ? 1 : 0;
    },
    uncode: function(bytes) {
        this.resetSquaresHash();
        let square;
        let itemData;
        let x;
        let y;
        let id_;
        let x_;
        let y_;
        this.items = [];
        bytes.position = 0;
        this.map_id = bytes.readShort();
        this.pixel_x = bytes.readShort();
        this.pixel_y = bytes.readShort();
        this.pixel_width = bytes.readShort();
        this.pixel_height = bytes.readShort();
        let len = bytes.readInt();
        this.resetRoad();
        let i;
        for (i = 0; i < len; i++) {
            x = bytes.readShort();
            y = bytes.readShort();
            square = this.prasePro(x, y, bytes.readUnsignedShort());
            if (square.isCanWalk) {
                this.roadArray[y][x] = 1;
            }
            this.put(square);
        }
        len = bytes.readShort();
        for (i = 0; i < len; i++) {
            id_ = bytes.readInt();
            x_ = bytes.readInt();
            y_ = bytes.readInt();
            itemData = this.praseLayerpro(id_, x_, y_, bytes);
            this.items.push(itemData);
        }
    }
});
module.exports = { MapData: MapData, ItemData: ItemData, Square: Square };