const RpgScene = require("RpgScene");
const ByteArray = require("ByteArray");
const SceneConst = require("SceneConst");
cc.Class({
    extends: RpgScene,
    properties: {
        _touchStartPos: cc.Vec2,
        _lastMovePos: cc.Vec2,
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
    },
    _initScene() {
        this._super();
        let mapId = this._sceneData.map_id;
        cc.log(`maps/map_image/scene_${mapId}`);
        cc.loader.loadResDir(`maps/map_image/scene_${mapId}`, (completedCount, totalCount, item) => {
            cc.log("completedCount:" + completedCount + "||||" + "totalCount:" + totalCount + "||||" + item);
        }, (error, resource, urls) => {
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
    _touchStartHandler: function(event) {
        this._lastMovePos = this.node.convertToNodeSpaceAR(event.getLocation());
    },
    _touchMoveHandler: function(event) {
        let curr = this.node.convertToNodeSpaceAR(event.getLocation());
        let offsetX = curr.x - this._lastMovePos.x;
        let offsetY = curr.y - this._lastMovePos.y;
        this._lastMovePos = curr;
        let focusObject = this.map.focusObject;
        focusObject.setPos(focusObject.posX - offsetX, focusObject.posY + offsetY);
        cc.log(focusObject.posX + "====-----------=" + focusObject.posY);
        this._validateFocusPosition();
    },
    _touchEndHandler: function(event) {

    },
    _touchCancelHandler: function(event) {

    },
    _validateFocusPosition() {
        let visibleSize = cc.view.getVisibleSize();
        let leftVW = visibleSize.width / 2;
        let leftVH = visibleSize.height / 2;
        let focusObject = this.map.focusObject;
        if (focusObject.posX - leftVW < 0) {
            focusObject.posX = leftVW;
        }
        if (focusObject.posY - leftVH < 0) {
            focusObject.posY = leftVH;
        }
        if (focusObject.posY + leftVH > this.map.mapHeight) {
            focusObject.posY = this.map.mapHeight - leftVH;
        }
        if (focusObject.posX + leftVW > this.map.mapWidth) {
            focusObject.posX = this.map.mapWidth - leftVW;
        }
    }

});