let AssetsManager = cc.Class({
    statics: {
        _instance: null,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new AssetsManager();
            }
            return this._instance;
        }
    },
    properties: {
        _gameAtlas: cc.SpriteAtlas,
        _assetLoadedHash: null,
        _preLoadAssets: null,
        _prefabCache: null,
        _loadQueue: null,
        _loadingAssets: null,
        _loadingIndex: null,

        _gameAssets: null,
    },
    init: function() {
        this._loadQueue = [];
        this._assetLoadedHash = {};

        this._preLoadAssets = [
            { url: cc.hj.R.fab.sceneLoading, type: cc.Prefab },
            { url: cc.hj.R.fab.characterObject, type: cc.Prefab },
            { url: cc.hj.R.fab.ncharacterObject, type: cc.Prefab },
            { url: cc.hj.R.fab.bounceFont, type: cc.Prefab },
            { url: cc.hj.R.fab.effectObject, type: cc.Prefab },
            { url: cc.hj.R.fab.bloodBar, type: cc.Prefab },
            { url: cc.hj.R.fab.titleStuff, type: cc.Prefab },
        ];
    },
    getPrefab: function(url) {
        if (this._prefabCache == null) {
            this._prefabCache = {};
        }
        let prefab = this._prefabCache[url];
        if (!prefab) {
            prefab = cc.loader.getRes(url, cc.Prefab);
            this._prefabCache[url] = prefab;
        }
        return prefab;
    },

    _getNotLoadedAssets: function(assets) {
        let noLoaded = [];
        for (let index in assets) {
            let assetObj = assets[index];
            let loaded = this._assetLoadedHash[assetObj.url] === 1;
            if (!loaded) {
                if (!cc.loader.getRes(assetObj.url)) {
                    noLoaded.push(assetObj);
                } else {
                    this._assetLoadedHash[assetObj.url] = 1;
                }
            }
        }
        return noLoaded;
    },
    loadPreLoadAssets: function(progress, complete) {
        this._startLoad(this._preLoadAssets, progress, complete);
    },
    loadAssets: function(assets, progress, complete) {
        this._startLoad(assets, progress, complete);
    },
    _startLoad: function(assets, progress, complete) {
        let notLoaded = this._getNotLoadedAssets(assets);
        if (notLoaded.length > 0) {
            this._loadQueue.push({ assets: notLoaded, progress: (progress || null), complete: (complete || null) });
            if (this._loadingAssets == null) {
                this._startGroupLoad();
            }
        } else {
            if (assets) {
                complete(assets.length, assets.length);
            } else {
                complete(0, 0);
            }
        }
    },
    _startGroupLoad: function() {
        this._loadingAssets = this._loadQueue.shift();
        if (this._loadingAssets) {
            this._loadingIndex = 1;
            this._loadItem();
        }
    },
    _loadItem: function() {
        let self = this;
        let totalLen = this._loadingAssets.assets.length;
        let progressCall = this._loadingAssets.progress;
        let completeCall = this._loadingAssets.complete;
        if (this._loadingIndex <= totalLen) {
            let curItem = this._loadingAssets.assets[this._loadingIndex - 1];
            let pHandler = function(completedCount, totalCount, item) {
                if (progressCall) {
                    progressCall(completedCount, totalCount, self._loadingIndex, totalLen);
                }
            }
            let cHandler = function(error, resource) {
                self._loadingIndex++;
                self._loadItem();
            }
            cc.loader.loadRes(curItem.url, curItem.type, pHandler, cHandler);
        } else {
            completeCall(Math.min(self._loadingIndex, totalLen), totalLen);
            this._loadingAssets = null;
            this._startGroupLoad();
        }
    },
});