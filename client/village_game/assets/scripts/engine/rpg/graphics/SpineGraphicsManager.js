const RpgGlobal = require("RpgGlobal");
let SpineGraphicsManager = cc.Class({
    statics: {
        _instance: null,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new SpineGraphicsManager();
            }
            return this._instance;
        }
    },
    properties: {
        _loadQueue: null,
        _spDict: null,
        _currentLoading: null,
    },
    ctor: function() {
        this._loadQueue = [];
        this._spDict = {};
    },
    load: function(gName, complete) {
        if (!this.hasGraphics(gName)) {
            let found = null;
            for (let index in this._loadQueue) {
                if (this._loadQueue[index].gName == gName) {
                    found = this._loadQueue[index];
                    break;
                }
            }
            if (!found) {
                if (this._currentLoading && this._currentLoading.gName == gName) {
                    found = this._currentLoading;
                }
            }
            if (found) {
                found.completes.push(complete);
            } else {
                this._loadQueue.push({ gName: gName, completes: [complete] });
            }

            if (!this._currentLoading && this._loadQueue.length > 0) {
                this._loadNext();
            }
        } else {
            complete();
        }
    },
    _loadNext: function() {
        let self = this;
        this._currentLoading = this._loadQueue.shift();
        if (this._currentLoading) {
            this._loadSPData();
        }
    },
    _loadSPData: function() {
        let self = this;
        let pathPrefix = RpgGlobal.avatarPath;
        let path = `${pathPrefix}/sp/${this._currentLoading.gName}`;
        let pHandler = function(completedCount, totalCount, item) {}
        let cHandler = function(error, resource) {
            if (!error) {
                self._spDict[self._currentLoading.gName] = cc.loader.getRes(path, sp.SkeletonData);
                self._currentLoading.completes.forEach(function(complete) {
                    complete();
                });
            }
            self._currentLoading.completes = null;
            self._loadNext();
        }
        cc.loader.loadRes(path, sp.SkeletonData, pHandler, cHandler);
    },
    hasGraphics: function(gName) {
        return this._spDict[gName] !== undefined;
    },
    getData: function(gName) {
        let data = this._spDict[gName];
        if (data) {
            return data;
        }
        return null;
    },
});