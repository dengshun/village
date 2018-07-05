module.exports = {
    host: "192.168.88.99",
    port: 8910,
    // host: "182.254.172.163",
    // port: 8903,
    PlatformType: cc.Enum({
        UNKNOW: 0, //当前帐号未绑定平台
        WEIXIN: 1, //微信
        QQ: 2, //QQ
    }),
    Sex: cc.Enum({
        male: 1, //男
        female: 2 //女
    }),
    SceneObjectType: cc.Enum({
        GROUND: 0, //地面
        PLAYER: 1, //玩家
        ITEM: 2 //物品
    }),
    BuildingType: cc.Enum({
        HOSPITAL: 1, //医院
        TRAINROOM: 2, //训练房
        EQUIPROOM: 3, //装备房
    }),
    SceneObjectZOrder: cc.Enum({
        ZORDER_ITEM: -100,
        ZORDER_PLAYER: 0,
        ZORDER_MAINPLAYER: 100
    }),
    LayerZOrder: cc.Enum({
        LAYER_ZORDER_TIP: 100,
    }),
    Setting: cc.Enum({
        MUSIC_SWITCH: 1, //音乐开关
    }),
    CAMERA_SPEED_Y: 2, //像素/帧
    MAP_WIDTH: 3000, //地图宽度,
    MAP_HEIGHT: 9000, //地图高度
    RESOLUTION_WIDTH: 1334, // 设计分辨率
    RESOLUTION_HEIGHT: 750, // 设计分辨率
    NAME_POOL: {
        boy: {
            firstname: "司马,欧阳,端木,上官,独孤,夏侯,尉迟,赫连,皇甫,公孙,慕容,长孙,宇文,司徒,轩辕,百里,呼延,令狐,诸葛,南宫,东方,西门,李,徐,王,张,刘,陈,杨,赵,黄,周,胡,林,梁,宋,郑,唐,冯,董,程,曹,袁,许,沈,曾,彭,吕,蒋,蔡,魏,叶,杜,夏,汪,田,方,石,熊,白,秦,江,蔡,孟,龙,万,段,雷,武,乔,洪,鲁,葛,柳,岳,梅,辛,耿,关,苗,童,项,裴,鲍,霍,甘,景,包,柯,阮,邓,华,滕,穆,燕,敖,冷,卓,花,蓝,楚,荆",
            middlename: "峰,不,近,小,千,万,百,一,求,笑,双,凌,伯,仲,叔,震,飞,顺,晓,昌,霸,冲,志,留,九,子,大,立,小,云,文,安,博,才,光,弘,华,清,灿,俊,凯,乐,良,明,健,辉,天,星,永,玉,英,真,修,义,雪,嘉,成,傲,欣,逸,飘,凌,青,火,森,杰,思,智,辰,元,夕,苍,劲,炀,阳,巨,潇,紫,邪,尘",
            lastname: "败,悔,南,宝,仞,刀,斐,德,云,天,仁,岳,宵,忌,爵,权,敏,阳,狂,冠,康,平,帅,香,刚,强,凡,邦,福,歌,国,和,康,澜,民,宁,然,顺,晏,宜,怡,易,志,雄,佑,斌,河,元,墨,松,林,之,竹,宇,轩,荣,哲,风,霜,山,炎,罡,盛,睿,达,洪,武,耀,磊,寒,冰,潇,痕,岚,空"
        },
        girl: {
            firstname: "马,欧阳,端木,上官,独孤,夏侯,尉迟,赫连,皇甫,公孙,慕容,长孙,宇文,司徒,轩辕,百里,呼延,令狐,诸葛,南宫,东方,西门,李,徐,王,张,刘,陈,杨,赵,黄,周,胡,林,梁,宋,郑,唐,冯,董,程,曹,袁,许,沈,曾,彭,吕,蒋,蔡,魏,叶,杜,夏,汪,田,方,石,熊,白,秦,江,蔡,孟,龙,万,段,雷,武,乔,洪,鲁,葛,柳,岳,梅,辛,耿,关,苗,童,项,裴,鲍,霍,甘,景,包,柯,阮,邓,华,滕,穆,燕,敖,冷,卓,花,蓝,楚,荆",
            middlename: "思,冰,夜,痴,依,小,香,绿,向,映,含,曼,春,醉,之,新,雨,天,如,若,涵,亦,采,冬,安,芷,绮,雅,飞,又,寒,忆,晓,乐,笑,妙,元,碧,翠,初,怀,幻,慕,秋,语,觅,幼,灵,傲,冷,沛,念,寻,水,紫,易,惜,诗,青,雁,盼,尔,以,雪,夏,凝,丹,迎,问,宛,梦,怜,听,巧,凡,静",
            lastname: "烟,琴,蓝,梦,丹,柳,冬,萍,菱,寒,阳,霜,白,丝,南,真,露,云,芙,筠,容,香,荷,风,儿,雪,巧,蕾,芹,柔,灵,卉,夏,岚,蓉,萱,珍,彤,蕊,曼,凡,兰,晴,珊,易,青,春,玉,瑶,文,双,竹,凝,桃,菡,绿,枫,梅,旋,山,松,之,亦,蝶,莲,柏,波,安,天,薇,海,翠,槐,秋,雁,夜"
        }
    },
}