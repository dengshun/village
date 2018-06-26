//p1(cc.Vec2)线段起点，p2(cc.Vec2)线段起点,r:圆的半径（圆的中心在对应坐标系的中心）。判断直线是否与玩家圆形身体有交点
let lineIsIntersectBody = function(p1, p2, rad) {
    let E = p1;
    let L = p2;
    let C = cc.p(0, 0);
    let r = rad;
    let d = L.sub(E);
    let f = E.sub(C);
    let a = d.dot(d);
    let b = 2 * f.dot(d);
    let c = f.dot(f) - r * r;
    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        // no intersection
        return false;
    } else {
        // ray didn't totally miss sphere,
        // so there is a solution to
        // the equation.

        discriminant = Math.sqrt(discriminant);

        // either solution may be on or off the ray so need to test both
        // t1 is always the smaller value, because BOTH discriminant and
        // a are nonnegative.
        let t1 = (-b - discriminant) / (2 * a);
        let t2 = (-b + discriminant) / (2 * a);

        // 3x HIT cases:
        //          -o->             --|-->  |            |  --|->
        // Impale(t1 hit,t2 hit), Poke(t1 hit,t2>1), ExitWound(t1<0, t2 hit), 

        // 3x MISS cases:
        //       ->  o                     o ->              | -> |
        // FallShort (t1>1,t2>1), Past (t1<0,t2<0), CompletelyInside(t1<0, t2>1)

        if (t1 >= 0 && t1 <= 1) {
            // t1 is the intersection, and it's closer than t2
            // (since t1 uses -b - discriminant)
            // Impale, Poke
            return true;
        }

        // here t1 didn't intersect so we are either started
        // inside the sphere or completely past it
        if (t2 >= 0 && t2 <= 1) {
            // ExitWound
            return true;
        }

        // no intn: FallShort, Past, CompletelyInside
        return false;
    }
};
let pointInPolygon = function(p, poly) {
    let x = p.x,
        y = p.y;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let xi = poly[i].x,
            yi = poly[i].y;
        let xj = poly[j].x,
            yj = poly[j].y;

        let intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
let scientificToNumber = function(num) {
    let str = num.toString();
    let reg = /^(\d+)(e)([\-]?\d+)$/;
    let arr, len,
        zero = '';

    /*6e7或6e+7 都会自动转换数值*/
    if (!reg.test(str)) {
        return num;
    } else {
        /*6e-7 需要手动转换*/
        arr = reg.exec(str);
        len = Math.abs(arr[3]) - 1;
        for (let i = 0; i < len; i++) {
            zero += '0';
        }

        return '0.' + zero + arr[1];
    }
};
let interpolate = function(p1, p2, f) {
    let f1 = 1 - f;
    return cc.p(p1.x * f + p2.x * f1, p1.y * f + p2.y * f1);
};
let randomInRange = function(from, to) {
    return Math.floor(Math.random() * (to - from)) + from;
};
let ALPHA_CHAR_CODES = [48, 49, 50, 51, 52, 53, 54,
    55, 56, 57, 65, 66, 67, 68, 69, 70
];
let createUID = function() {
    let uid = new Array(36);
    let index = 0;

    let i;
    let j;

    for (i = 0; i < 8; i++) {
        uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() * 16)];
    }

    for (i = 0; i < 3; i++) {
        uid[index++] = 45; // charCode for "-"

        for (j = 0; j < 4; j++) {
            uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() * 16)];
        }
    }

    uid[index++] = 45; // charCode for "-"
    let time = new Date().getTime();
    let timeString = ("0000000" + time.toString(16).toUpperCase()).substr(-8);

    for (i = 0; i < 8; i++) {
        uid[index++] = timeString.charCodeAt(i);
    }

    for (i = 0; i < 4; i++) {
        uid[index++] = ALPHA_CHAR_CODES[Math.floor(Math.random() * 16)];
    }

    return String.fromCharCode.apply(null, uid);
};
const NUM_MINUTE = 60;
const NUM_HOUR = 3600;
const NUM_DAY = 86400;
/**
 *
 * @param millisecond: 要格式化的豪秒数,如果小于0，就等于0
 * @param formatStr:格式为：“#d天#h时#i分#s秒”，
 * 		d,h,i,s为了性能只用小写且前面加#，单位可自己定义即“天时分秒”可以是除#号外的其它字符，
 * 		可自定义只显示#h时#i分或#i分#s秒
 * @return ：计时器，还剩多长时间，用于需要多少天或小时之类的时间间隔
 * @useExample：
 * 				formatDataStr=TimeFormater.countTimeFormatter(1000*61*60*24*36, '#d天#h小时#sSecond');
 * 输出结果formatDataStr=36天14小时00Second
 * 
 */
let countTimeFormatter = function(millisecond, formatStr, keepZero, fillZero) {
    formatStr = formatStr || "#h:#i:#s";
    keepZero = keepZero === undefined ? true : keepZero;
    fillZero = fillZero === undefined ? true : fillZero;

    let liveData = Math.floor(millisecond > 0 ? millisecond / 1000 : 0);
    let lowerStr = formatStr;

    /*当前时间单位  */
    let iSecond = lowerStr.indexOf('#s');
    let iMinute = lowerStr.indexOf('#i');
    let iHour = lowerStr.indexOf('#h');
    let iDay = lowerStr.indexOf('#d');

    /*当前时间  */
    let liveDay = Math.floor(liveData / NUM_DAY);
    if (iDay >= 0)
        liveData -= liveDay * NUM_DAY;
    let liveHour = Math.floor(liveData / NUM_HOUR);
    if (iHour >= 0)
        liveData -= liveHour * NUM_HOUR;
    let liveMinute = Math.floor(liveData / NUM_MINUTE);
    if (iMinute >= 0)
        liveData -= liveMinute * NUM_MINUTE;
    let liveSecond = liveData;
    liveData *= 1000;
    let liveMilliSecond = liveData;
    /*当前时间字符串  */
    let sSecond = "";
    let sMinute = "";
    let sHour = "";
    let sDay = "";
    if (iDay >= 0) {
        if (fillZero)
            sDay = liveDay < 10 ? '0' : '';

        if (iHour < 0 && iMinute < 0 && iSecond < 0 && liveHour > 0 && liveDay <= 0) {
            sDay += '1';
        } else {
            sDay += liveDay;
        }
        if ((sDay != "00" && sDay != "0") || keepZero)
            lowerStr = lowerStr.replace('#d', sDay);
        else {
            lowerStr = lowerStr.substr(lowerStr.indexOf("#h"));
            sDay = "";
        }
    }
    if (iHour >= 0) {
        if (fillZero)
            sHour = liveHour < 10 ? '0' : '';
        if (iMinute < 0 && liveHour <= 0 && liveMinute > 0) {
            sHour += '1';
        } else {
            sHour += liveHour;
        }
        if ((sHour != "00" && sHour != "0") || keepZero || sDay != "")
            lowerStr = lowerStr.replace('#h', sHour);
        else {
            lowerStr = lowerStr.substr(lowerStr.indexOf("#i"));
            sHour = "";
        }
    }
    if (iMinute >= 0) {
        if (fillZero)
            sMinute = liveMinute < 10 ? '0' : '';
        if (iSecond < 0 && liveMinute <= 0 && liveSecond > 0) {
            sMinute += '1';
        } else {
            sMinute += liveMinute;
        }
        if ((sMinute != "00" && sMinute != "0") || keepZero || sHour != "")
            lowerStr = lowerStr.replace('#i', sMinute);
        else
            lowerStr = lowerStr.substr(lowerStr.indexOf("#s"));
    }
    if (iSecond >= 0) {
        if (fillZero)
            sSecond = liveSecond < 10 ? '0' : '';
        if (iMinute < 0 && liveSecond <= 0 && liveMilliSecond > 0) {
            sSecond += '1';
        } else {
            sSecond += liveSecond;
        }
        lowerStr = lowerStr.replace('#s', sSecond);
    }
    return lowerStr;
};
let countStringLength = function(str) {
    let strLen = str.length;
    let charLen = 0;
    for (let i = 0; i < strLen; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode > 255) {
            charLen += 2;
        } else {
            charLen += 1;
        }
    }
    return charlen;
};
let substr = function(str, length, truncationSign) {
    if (truncationSign == undefined) {
        truncationSign = "..."
    }
    let strLen = str.length;
    let result = "";
    let curLen = 0;
    for (let i = 0; i < strLen; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode > 255) {
            curLen += 2;
        } else {
            curLen += 1;
        }
        result += str[i];
        if (curLen >= length) {
            break;
        }
    }
    if (result.length != strLen) {
        result += truncationSign
    }
    return result;
};
let trimString = function trimStr(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
let easeOut = function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
};

module.exports = { lineIsIntersectBody: lineIsIntersectBody, scientificToNumber: scientificToNumber, interpolate: interpolate, randomInRange: randomInRange, createUID: createUID, pointInPolygon: pointInPolygon, countTimeFormatter: countTimeFormatter, substr: substr, countStringLength: countStringLength, trimString: trimString, easeOut: easeOut };