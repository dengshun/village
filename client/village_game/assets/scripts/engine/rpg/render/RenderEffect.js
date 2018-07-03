const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
const FramesGraphicsBase = require("FramesGraphicsBase");
let RenderEffect = cc.Class({
    name: "RenderEffect",
    extends: Render,
    render: function(dt, target) {
        let p = RpgGlobal.scene.map.getScreenPosition(target.posX, target.posY);
        target.node.setPosition(p.x >> 0, p.y >> 0);
        if (target.graphicsRes && (target.graphicsRes instanceof FramesGraphicsBase)) {
            target.graphicsRes.render(dt, [target.bodyNode]);
        }
    },
});
module.exports = RenderEffect;