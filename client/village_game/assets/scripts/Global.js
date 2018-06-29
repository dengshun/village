module.exports = {
    buildingList: null,
    getBuildingModel(id) {
        for (let index in this.buildingList) {
            let model = this.buildingList[index];
            if (model.id == id) {
                return model;
            }
        }
        return null;
    },
    getUUID() {
        let uuid = cc.hj.Utils.createUID();
        return uuid;
    },
    setClipboard(str) {
        if (cc.sys.isNative && cc.sys.isMobile) {
            if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {

            }
        }
    },
}