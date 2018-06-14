module.exports = {
    getUUID: function() {
        let uuid = cc.hj.Utils.createUID();
        return uuid;
    },
    setClipboard: function(str) {
        if (cc.sys.isNative && cc.sys.isMobile) {
            if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {

            }
        }
    },
}