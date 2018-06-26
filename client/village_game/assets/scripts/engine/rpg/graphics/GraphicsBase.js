let GraphicsBase = cc.Class({
    name: "GraphicsBase",
    properties: {
        avatarHeight: {
            get: function() {
                return 10;
            },
            visible: false,
        },
        isReady: {
            get: function() {
                return false;
            },
            visible: false,
        },
        bodyNode: {
            set: function(value) {

            },
            get: function() {
                return null;
            },
            visible: false,
            override: true,
        },
    },
    setDirection: function(value) {},
    setAction: function(value) {},
    render: function(dt, targetNodes) {},
    setEndListener: function(value) {},
    setCompleteListener: function(value) {},
    setStartListener: function(value) {},
    dispose: function() {}
});