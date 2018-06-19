const RpgGlobal = require("RpgGlobal");
var Square = cc.Class({
    properties: {
        /**0:是否可走，1：是否是安全区，2：是否是摆摊区，3:是否是透明区，4:是否不可以跳,5：野外安全区,6：多倍经验1区,7：多倍经验2区，.......,15:特殊类型格子**/
        /**是否可以行走**/
        isCanWalk: false,
        /**是否是摆摊区**/
        isSell: false,
        /**是否是安全区域**/
        isSafe: false,
        /**是否是透明区域**/
        isAlpha: false,
        /**是否是禁止跳跃区域**/
        isBanJump: false,
        /**特殊格子**/
        isSpecial: false,
        /**是否 是野外安全区**/
        isField: false,
        /**多倍经验区域1**/
        isMultiExp1: false,
        /**多倍经验区域2**/
        isMultiExp2: false,
        x:0,
        y:0,
        key:{
            get:function(){
                return this.x+"|"+this.y;
            }
        }
    },
    __ctor__:function(x,y){
        this.x=x;
        this.y=y;
    },
});
var ItemData = cc.Class({
    item_id: 0,
    x: 0,
    y: 0,
    layer: 0,
    depth: 0,
});
var SquareMapData=cc.Class({
    properties: {
        map_id: 0,
        pixel_width: 0,
        pixel_height: 0,
        items: null,
        pixel_x: 0,
        pixel_y: 0,
        roadArray: null,
        _squaresHash: null,
    },
    ctor: function () {
    },
    resetSquaresHash: function () {
        this._squaresHash = {};
    },
    has: function (key) {
        if (this._squaresHash[key]) {
            return true;
        }
        return false;
    },
    put: function (value) {
        this._squaresHash[value.key] = value;
    },
    take: function (key) {
        return this._squaresHash[key];
    },
    remove: function (key) {
        delete this._squaresHash[key];
    },
    prasePro: function (x, y, pro) {
        let square = new Square(x,y);
        square.isCanWalk = (pro >> 15) == 1;
        square.isSafe = ((pro >> 14) & 1) == 1;
        square.isSell = ((pro >> 13) & 1) == 1;
        square.isAlpha = ((pro >> 12) & 1) == 1;
        square.isBanJump = ((pro >> 11) & 1) == 1;
        square.isField = ((pro >> 10) & 1) == 1;
        square.isMultiExp1 = ((pro >> 9) & 1) == 1;
        square.isMultiExp2 = ((pro >> 8) & 1) == 1;
        square.isSpecial = (pro & 1) == 1;

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
    resetRoad: function () {
        // 定义临时地图数据
        let h = Math.ceil(this.pixel_height / RpgGlobal.GRID_SIZE);
        let w = Math.ceil(this.pixel_width / RpgGlobal.GRID_SIZE);
        this.roadArray = new Array(h);
        for (let y = 0; y < h; y++) {
            this.roadArray[y] = new Array(w);
        }
    },
    updateRoadWalkable: function (x, y, walkable) {
        this.roadArray[y][x] = walkable ? 1 : 0;
    },
    uncode: function (bytes) {
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
            if (square.isCanWalk){
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
SquareMapData.ItemData=ItemData;
SquareMapData.Square=Square;
module.exports=SquareMapData;