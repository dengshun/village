const GraphicsBase = require("GraphicsBase");
const GraphicsManager = require("GraphicsManager");
const SceneConst = require("SceneConst");
let CharacterGraphics = cc.Class({
    name: "CharacterGraphics",
    extends: GraphicsBase,
    properties: {
        _weaponGraphicsDatas: null, //所有动作的数据
        _weaponGraphicsData: null, //当前动作数据
        _weaponFrameData: null, //当前帧数据
        _weaponAtlas: null,
        _weaponName: "",
    },
    setAction: function(value) {
        this._super();
        this._weaponGraphicsData = null;
        this._updateWeaponGraphicsData();
    },
    addPart: function(type, id) {
        this._super(type, id);
        if (type == SceneConst.WEAPON_TYPE) {
            this._weaponName = type + "_" + id;;
        }
    },
    render: function(dt, targetNodes) {
        this._super(dt, targetNodes);
        if (targetNodes.length > 1) {
            this._updateWeaponGraphicsData();
            this._renderGraphicsWeapon(targetNodes[1]);
        }
    },
    _updateWeaponGraphicsData: function() {
        if (this._weaponName && this._weaponGraphicsData == null) {
            if (this._weaponGraphicsDatas == null) {
                this._weaponGraphicsDatas = GraphicsManager.getInstance().getData(this._weaponName);
            }
            if (this._weaponGraphicsDatas) {
                this._weaponGraphicsData = this._getActionData(this._weaponGraphicsDatas.action, this._nowAction);
            }
        }
    },
    _renderGraphicsWeapon: function(target) {
        if (this._weaponName) {
            let directionNum = this.directionNum;
            let currentFrame = this.currentFrame;
            if (this._weaponGraphicsData) {
                this._weaponFrameData = null;
                let absDirectionNum;
                if (this._hasDirection) {
                    absDirectionNum = directionNum > 0 ? directionNum : -directionNum;
                } else {
                    directionNum = 0;
                    absDirectionNum = 0;
                }
                let dirData = this._getDirFramsData(this._weaponGraphicsData.dir, absDirectionNum);
                if (dirData) {
                    this._weaponFrameData = this._getFrameData(dirData, currentFrame);
                    let spriteFrame;
                    if (this._weaponFrameData) {
                        if (!this._weaponAtlas) {
                            this._weaponAtlas = GraphicsManager.getInstance().getSpriteAtlas(this._weaponName);
                        }
                        if (this._weaponAtlas) {
                            spriteFrame = this._weaponAtlas.getSpriteFrame(this._nowAction + "-" + absDirectionNum + "-" + this._weaponFrameData.linkage);
                        }
                    }
                    if (spriteFrame) {
                        target.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        if (directionNum < 0) {
                            target.scaleX = -1;
                        } else {
                            target.scaleX = 1;
                        }
                    }
                }
            }
            target.setPosition(this._weaponTx(directionNum), this._weaponTy(directionNum));
        }
    },
    _weaponTx: function(directionNum) {
        if (!this._hasDirection) {
            directionNum = 0;
        }
        let tx = 0;
        if (this._weaponFrameData) {
            if (directionNum >= 0) {
                tx = this._weaponFrameData.width / 2 - (this._weaponFrameData.tx - this._weaponFrameData.offsetX);
            } else {
                tx = (this._weaponFrameData.tx - this._weaponFrameData.offsetX) - this._weaponFrameData.width / 2;
            }
        }
        return tx;
    },
    _weaponTy: function(directionNum) {
        let ty = 0;
        if (this._weaponFrameData) {
            ty = (this._weaponFrameData.ty - this._weaponFrameData.offsetY) - this._weaponFrameData.height / 2;
        }
        return ty;
    },
    dispose: function() {
        this._super();
        this._weaponName = "";
    }
});