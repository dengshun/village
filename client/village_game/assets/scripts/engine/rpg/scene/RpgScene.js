const RpgMap = require("RpgMap");
const RpgGlobal = require("RpgGlobal");
const ByteArray = require("ByteArray");
const GameObject = require("GameObject");
const CharacterBase = require("CharacterBase");
const MovieObject = require("MovieObject");
const RenderCharacter = require("RenderCharacter");
const RenderNCharacter = require("RenderNCharacter");
const RenderEffect = require("RenderEffect");
const CharacterGraphics = require("CharacterGraphics");
const GraphicsBase = require("GraphicsBase");
const SceneConst = require("SceneConst");
const CharacterController = require("CharacterController");
const SquareMapData = require("SquareMapData");
const GameObjectFactory = require("GameObjectFactory");
cc.Class({
    extends: cc.Component,
    properties: {
        _running: {
            default: false,
            serializable: false,
        },
        _mapLayerNode: {
            default: null,
            type: cc.Node,
            serializable: false,
        },
        _objectsLayerNode: {
            default: null,
            type: cc.Node,
            serializable: false,
        },
        _map: {
            default: null,
            type: RpgMap,
            serializable: false,
        },
        map: {
            get: function() {
                return this._map;
            },
            visible: false
        },
        _sceneData: {
            default: null,
            serializable: false,
        },
        _mainPlayer: {
            default: null,
            serializable: false,
        },
        mainPlayer: {
            get: function() {
                return this._mainPlayer;
            },
            visible: false
        },
        _mainPlayerController: {
            default: null,
            serializable: false,
        },
        mainPlayerController: {
            set: function(value) {
                this._mainPlayerController = value;
            },
            get: function() {
                return this._mainPlayerController
            },
            visible: false,
        },
        _renderChar: {
            default: null,
            serializable: false,
            type: RenderCharacter,
        },
        _renderNChar: {
            default: null,
            serializable: false,
            type: RenderNCharacter,
        },
        _renderEffect: {
            default: null,
            serializable: false,
            type: RenderEffect,
        },
        renderChar: {
            set: function(value) {
                this._renderChar = value;
            },
            get: function() {
                if (this._renderChar == null) {
                    this._renderChar = new RenderCharacter();
                }
                return this._renderChar;
            },
            visible: false,
        },
        renderNChar: {
            set: function(value) {
                this._renderNChar = value;
            },
            get: function() {
                if (this._renderNChar == null) {
                    this._renderNChar = new RenderNCharacter();
                }
                return this._renderNChar;
            },
            visible: false,
        },
        renderEffect: {
            set: function(value) {
                this._renderEffect = value;
            },
            get: function() {
                if (this._renderEffect == null) {
                    this._renderEffect = new RenderEffect();
                }
                return this._renderEffect;
            },
            visible: false,
        },
        _objects: {
            default: null,
            serializable: false,
        },
        //最底层的特效渲染列表
        _renderList0: {
            default: null,
            serializable: false,
        },
        //中间层渲染列表
        _renderList1: {
            default: null,
            serializable: false,
        },
        //醉顶层渲染列表
        _renderList2: {
            default: null,
            serializable: false,
        },
    },
    onLoad: function() {
        RpgGlobal.scene = this;
        this._mapLayerNode = cc.find("mapLayer", this.node);
        this._objectsLayerNode = cc.find("objectsLayer", this.node);
        this._map = this._mapLayerNode.getComponent("RpgMap");
        this._objects = [];
        this._renderList0 = [];
        this._renderList1 = [];
        this._renderList2 = [];
    },
    _createMainPlayer: function() {
        if (!this._mainPlayer) {
            this._mainPlayer = GameObjectFactory.getInstance().getObject(SceneConst.CHAR).getComponent("CharacterObject");
        }
        this._mainPlayer.render = this.renderChar;
        this._mainPlayer.posX = 3482;
        this._mainPlayer.posY = 892;
        this._mainPlayer.directionNum = 3;
        this._mainPlayer.alphaCheck = true;
        let graphicsR = new CharacterGraphics();
        graphicsR.addPart(SceneConst.BODY_TYPE, 100001);
        graphicsR.addPart(SceneConst.WEAPON_TYPE, 200001);
        this._mainPlayer.graphicsRes = graphicsR;
        this._mainPlayer.inCamera = true;
        this._mainPlayer.autoCulling = false;
        if (this._mainPlayerController == null) {
            this._mainPlayerController = new CharacterController();
        }
        this._mainPlayer.changeController(this._mainPlayerController);
        this.addObject(this._mainPlayer);
    },
    changeScene: function(id) {
        let rawData = null;
        let byte = new ByteArray();
        if (!this._sceneData) {
            this._sceneData = new SquareMapData();
            RpgGlobal.sceneData = this._sceneData;
        }
        let self = this;
        if (cc.sys.isNative) {
            let fileData = jsb.fileUtils.getDataFromFile(cc.url.raw(`resources/${RpgGlobal.mapPath}/map_data/scene_${id}.dat`));
            rawData = new Uint8Array(fileData);
            byte._writeUint8Array(rawData);
            byte.position = 0;
            self._sceneData.uncode(byte);
            self._initScene();
        } else {
            cc.loader.loadRes(`${RpgGlobal.mapPath}/map_data/scene_${id}`, null, function(err, data) {
                rawData = byte.encodeUTF8(data);
                byte._writeUint8Array(rawData);
                byte.position = 0;
                self._sceneData.uncode(byte);
                self._initScene();
            });
        }
    },

    _initScene: function() {
        this._createMainPlayer();
        this.play();
    },
    play: function() {
        this._running = true;
        this._map.setup(this._sceneData);
        this._map.follow(this._mainPlayer);
    },
    addObject: function(obj, layer = SceneConst.MIDDLE_LAYER) {
        if (this._objects.indexOf(obj) == -1) {
            this._objects.push(obj);
            obj.layer = layer;
            if (this._map.cameraCullingView.contains(obj.pos) || obj.autoCulling == false) {
                this._pushRenderList(obj);
            }
        }
    },
    removeObject: function(obj) {
        let index = this._objects.indexOf(obj);
        if (index >= 0) {
            this._objects.splice(index, 1);
            this._pullRenderList(obj);
            if (obj.isAutoReturn) {
                this.returnObject(obj);
            }
        }
    },
    returnObject: function(obj) {
        let stuffList = obj.stuffList;
        if (stuffList) {
            stuffList.forEach(function(stuff) {
                GameObjectFactory.getInstance().returnObject(stuff);
            });
        }
        GameObjectFactory.getInstance().returnObject(obj);
    },
    _pushRenderList: function(obj) {
        let list = this._getListByLayer(obj.layer);
        let index = list.indexOf(obj);
        if (index == -1) {
            list.push(obj);
            obj.inCamera = true;
            this._objectsLayerNode.addChild(obj.node);
            obj.addStuffsToParent();
            let p = this._map.getScreenPosition(obj.posX, obj.posY);
            obj.node.setPosition(p.x, p.y);
        }
    },
    _pullRenderList: function(obj) {
        let list = this._getListByLayer(obj.layer);
        let index = list.indexOf(obj);
        if (index >= 0) {
            if (obj.node.parent) {
                this._objectsLayerNode.removeChild(obj.node);
                obj.removeStuffsFromParent();
            }
            list.splice(index, 1);
            obj.inCamera = false;
        }
    },
    _getListByLayer: function(layer) {
        if (layer == SceneConst.MIDDLE_LAYER) {
            return this._renderList1;
        } else if (layer == SceneConst.TOP_LAYER) {
            return this._renderList2;
        } else if (layer == SceneConst.BOTTOM_LAYER) {
            return this._renderList0;
        }
        return this._renderList1;
    },
    _updateZOrderF: function(list, step) {
        if (list && list.length > 0) {
            let deepList = [];
            list.forEach(function(obj) {
                obj.zOrderF = 0;
                while (deepList.indexOf(obj.zOrder) >= 0) {
                    obj.zOrderF++;
                }
                let objZOrder = obj.zOrder;
                deepList.push(objZOrder);
            }, this);
        }
    },
    _sortFunction(a, b) {
        if (a.zOrder > b.zOrder) return 1;
        else if (a.zOrder < b.zOrder) return -1;
        else return 0;
    },
    getAroundObjects: function(type = "", pos = null, radius = -1) {
        if (pos == null) {
            pos = this._mainPlayer.pos;
        }
        let result = [];
        let self = this;
        this._renderList1.forEach(function(obj) {
            if (obj != self._mainPlayer) {
                if ((!(obj instanceof CharacterBase)) || obj.isDeath == false) {
                    if ((type == "" || obj.type == type) && (radius == -1 || cc.pDistance(obj.pos, pos) <= radius)) {
                        result.push(obj);
                    }
                }
            }
        });
        return result;
    },
    getNearestObject: function(type = "", pos = null, radius = -1, exclude = null) {
        if (pos == null) {
            pos = this._mainPlayer.pos;
        }
        let minDist = 999999;
        let result = null;
        let len = this._renderList1.length;
        for (let i = 0; i < len; i++) {
            let obj = this._renderList1[i];
            if (obj != this._mainPlayer && obj.type == type && obj != exclude) {
                if ((!(obj instanceof CharacterBase)) || obj.isDeath == false) {
                    let dist = cc.pDistance(pos, obj.pos);
                    if ((radius == -1 || dist <= radius) && dist < minDist) {
                        result = obj;
                        minDist = dist;
                    }
                }
            }
        }
        return result;
    },
    createEffect: function(effectId, pos = null, layer = SceneConst.TOP_LAYER, faceTo = null) {
        let effect = GameObjectFactory.getInstance().getObject(SceneConst.EFFECT).getComponent("EffectObject");
        let graphicsR = new GraphicsBase();
        graphicsR.addPart(SceneConst.EFFECT_TYPE, effectId);
        effect.graphicsRes = graphicsR;
        effect.isAutoReturn = true;
        effect.scene = this;
        effect.autoCulling = false;
        effect.render = this.renderEffect;
        if (pos) {
            effect.setPos(pos.x, pos.y)
        }
        if (faceTo) {
            effect.faceToPoint(faceTo.x, faceTo.y);
        }
        this.addObject(effect, layer);
        return effect;
    },
    update: function(dt) {
        if (this._running) {
            this._map.gameLoop();
            this._mainPlayer.controller.calAction(dt);
            this._updateZOrderF(this._renderList0);
            this._updateZOrderF(this._renderList1);
            this._renderList0.sort(this._sortFunction);
            this._renderList1.sort(this._sortFunction);
            let allList = this._renderList0.concat(this._renderList1, this._renderList2);
            let zOrder = -1;
            allList.forEach(function(obj) {
                let curZOrder = obj.node.getLocalZOrder();
                zOrder++;
                if (curZOrder != zOrder) {
                    obj.node.setLocalZOrder(zOrder);
                    let stuffList = obj.stuffList;
                    if (stuffList) {
                        stuffList.forEach(function(stuff) {
                            zOrder++;
                            let stuffCurZOrder = stuff.node.getLocalZOrder();
                            if (stuffCurZOrder != zOrder) {
                                stuff.node.setLocalZOrder(zOrder);
                            }
                        });
                    }
                }
                obj.renderLoop(dt);
            }, this);
        }
    }
});