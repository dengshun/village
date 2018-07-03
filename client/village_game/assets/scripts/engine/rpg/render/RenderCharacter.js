const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
const FramesGraphicsBase = require("FramesGraphicsBase");
let RenderCharacter = cc.Class({
    name: "RenderCharacter",
    extends: Render,
    render: function(dt, target) {
        let p = RpgGlobal.scene.map.getScreenPosition(target.posX, target.posY);
        target.node.setPosition(p.x >> 0, p.y >> 0);
        if (target.graphicsRes instanceof FramesGraphicsBase) {
            let nodes = [];
            if (target.bodyNode) {
                nodes.push(target.bodyNode);
            }
            if (target.weaponNode) {
                nodes.push(target.weaponNode);
            }
            target.graphicsRes.render(dt, nodes);
        } else {

        }
    },
});
module.exports = RenderCharacter;