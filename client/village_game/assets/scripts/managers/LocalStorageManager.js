let LocalStorageManager = {
    getItem: function (propName) {
        let useDataStr = cc.sys.localStorage.getItem("wftgame_dan"); //从本地读取数据
        let useData = JSON.parse(useDataStr); //将string转换成json
        if (useData) {
            if (useData[propName] !== undefined) {
                return useData[propName];
            } else {
                return null;
            }
        }
        else {
            return null;
        }
    },
    setItem: function (propName, value) {
        let useDataStr = cc.sys.localStorage.getItem("wftgame_dan"); //从本地读取数据
        let useData = JSON.parse(useDataStr); //将string转换成json
        if (!useData) {
            useData = {};
        }
        useData[propName] = value;
        cc.sys.localStorage.setItem("wftgame_dan", JSON.stringify(useData)); //将数据存储在本地
    },
    removeItem: function (propName) {
        let useDataStr = cc.sys.localStorage.getItem("wftgame_dan"); //从本地读取数据
        let useData = JSON.parse(useDataStr); //将string转换成json
        if (useData && useData.hasOwnProperty(propName)) {
            delete useData[propName];
            cc.sys.localStorage.setItem("wftgame_dan", JSON.stringify(useData)); //将数据存储在本地
        }
    },
    saveSetting: function (id, value) {
        if (cc.hj.Global.account) {
            let itemKey="setting_"+cc.hj.Global.account.uid;
            let setting = this.getItem(itemKey);
            if (setting) {
            } else {
                setting = {};
            }
            setting[String(id)] = value;
            this.setItem(itemKey, setting);
        }
    },
    getSetting: function (id) {
        if (cc.hj.Global.account) {
            let setting = this.getItem("setting_"+cc.hj.Global.account.uid);
            if (setting&&setting.hasOwnProperty(String(id))) {
                return setting[String(id)];
            } else {
            }
        }
        return null;
    }
}
module.exports = LocalStorageManager;