const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
const FrameGraphicsBase = require("FrameGraphicsBase");
let RenderEffect = cc.Class({
    name: "RenderEffect",
    extends: Render,
    render: function(dt, target) {
        let p = RpgGlobal.scene.map.getScreenPosition(target.posX, target.posY);
        target.node.setPosition(p.x >> 0, p.y >> 0);
        if (target.graphicsRes && (target.graphicsRes instanceof FrameGraphicsBase)) {
            target.graphicsRes.render(dt, [target.bodyNode]);
        }
    },
});
module.exports = RenderEffect;