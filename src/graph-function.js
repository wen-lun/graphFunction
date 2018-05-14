"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
CanvasRenderingContext2D.prototype.drawLine = function (start, end) {
    this.moveTo(start.x, start.y);
    this.lineTo(end.x, end.y);
};
var GraphFunction = /** @class */ (function () {
    function GraphFunction(options) {
        this.opts = {
            width: 600,
            height: 400,
            backgroundColor: "white",
            animation: true,
            xUnit: {
                pixel: 100,
                value: 1,
                mince: 1,
                showScale: function (value) { return true; },
                convert: function (value) { return value; },
                parse: function (value) { return value; },
                suffix: "",
            },
            yUnit: {
                pixel: 100,
                value: 1,
                mince: 1,
                showScale: function (value) { return true; },
                convert: function (value) { return value; },
                parse: function (value) { return value; },
                suffix: "",
            },
            showScale: true,
            scaleLen: 5,
            scaleFontSize: 12,
            coorTextColor: "black",
            x0yFontSize: 18,
            color: "black",
            hCoorColor: "black",
            vCoorColor: "black",
            coorLineWidth: 0.5,
            coorArrowLen: 8,
            showGrid: true,
            gridColor: "gray",
            gridLineWidth: 0.2,
            points: [],
            markPointLineWidth: 0.5,
            markPointRadius: 3,
            markPointColor: "brown",
            markPointFontSize: 14,
            centerX: null,
            centerY: null,
            //定义域，如果x!=0,函数返回x!=0即可
            domain: function (x) {
                return true;
            },
            //值域
            range: function (y) {
                return true;
            },
            //要绘制的函数
            fun: function (x) {
                return x;
            }
        };
        this.canvas = null;
        this.isMouseDown = false; //记录鼠标是否按下
        this.ctx = null;
        //用来缓存坐标轴
        this.coorCanvas = document.createElement("canvas");
        this.coorCtx = this.coorCanvas.getContext("2d");
        //用来缓存函数曲线及标记点
        this.funCanvas = document.createElement("canvas");
        this.funCtx = this.funCanvas.getContext("2d");
        //拖拽坐标系相关
        this.beginDrag = false; //标记是否要开始拖拽
        this.isDrag = false; //标记是否正在拖拽
        this.startOffset = null; //记录上一次拖拽的位置
        this.cx = null;
        this.cy = null;
        //坐标轴中心点的位置
        this.centerPos = { x: 0, y: 0 };
        options.xUnit = __assign({}, this.opts.xUnit, options.xUnit);
        options.yUnit = __assign({}, this.opts.yUnit, options.yUnit);
        this.opts = __assign({}, this.opts, options);
        if (!options.canvas || !(options.canvas instanceof HTMLCanvasElement)) {
            throw new Error("options.canvas is not canvas!");
        }
        this.canvas = options.canvas;
        this.canvas.style.cursor = "pointer";
        this.ctx = this.canvas.getContext("2d");
        this.eventListener();
        this.setCanvasWH();
        this.cacheCoor(this.coorCtx);
        this.cacheFun(this.funCtx, false, false, true);
        this.show();
    }
    /** 设置坐标轴中心点的坐标，坐标系为画布坐标系 */
    GraphFunction.prototype.setCenterPos = function (x, y) {
        this.centerPos.x = x;
        this.centerPos.y = y;
    };
    ;
    /** 设置画布的宽高 */
    GraphFunction.prototype.setCanvasWH = function () {
        var _a = this, canvas = _a.canvas, opts = _a.opts, coorCanvas = _a.coorCanvas, funCanvas = _a.funCanvas, cx = _a.cx, cy = _a.cy;
        if (!opts.width)
            throw new Error("opts.width is undefined!");
        if (!opts.height)
            throw new Error("opts.height is undefined!");
        canvas.width = opts.width;
        canvas.height = opts.height;
        canvas.style.width = opts.width + "px";
        canvas.style.height = opts.height + "px";
        coorCanvas.width = opts.width;
        coorCanvas.height = opts.height;
        funCanvas.width = opts.width;
        funCanvas.height = opts.height;
        //如果没有指定，默认将坐标轴的中心位置放到画布的中心
        var centerX = cx || (opts.width) * 0.5;
        var centerY = cy || (opts.height) * 0.5;
        if (opts.centerX != null) {
            centerX = opts.centerX;
        }
        if (opts.centerY != null) {
            centerY = opts.centerY;
        }
        this.setCenterPos(centerX, centerY);
    };
    ;
    /** 中心坐标转画布坐标 */
    GraphFunction.prototype.centerCoor2CanvasCoor = function (x0, y0) {
        var centerPos = this.centerPos;
        var x = centerPos.x + x0;
        var y = -y0 + centerPos.y;
        return { x: x, y: y };
    };
    ;
    /** 像素转换为值 */
    GraphFunction.pixel2value = function (pixel, unit) {
        var unitValue = unit.value || 1;
        if (!unit.pixel)
            throw new Error("unit.pixel is undefined!");
        return ((pixel / unit.pixel) * unitValue) * 1;
    };
    ;
    /** 值转换为像素 */
    GraphFunction.value2pixel = function (value, unit) {
        var unitValue = unit.value || 1;
        if (!unit.pixel)
            throw new Error("unit.pixel is undefined!");
        return (value / unitValue) * unit.pixel;
    };
    ;
    /** 缓存坐标轴 */
    GraphFunction.prototype.cacheCoor = function (ctx) {
        var _a = this, opts = _a.opts, centerPos = _a.centerPos;
        if (!opts.width)
            throw new Error("opts.width is undefined!");
        if (!opts.height)
            throw new Error("opts.height is undefined!");
        if (!opts.scaleFontSize)
            throw new Error("opts.scaleFontSize is undefined!");
        if (!opts.gridLineWidth)
            throw new Error("opts.gridLineWidth is undefined!");
        if (!opts.x0yFontSize)
            throw new Error("opts.x0yFontSize is undefined!");
        //清除画布
        ctx.clearRect(0, 0, opts.width, opts.height);
        ctx.save();
        ctx.fillStyle = opts.backgroundColor;
        ctx.fillRect(0, 0, opts.width, opts.height);
        ctx.restore();
        var leftWidth = centerPos.x; //左半边的宽
        var rightWidth = opts.width - centerPos.x; //右半边的宽
        var xStart = -leftWidth; //x坐标轴开始处位置
        var xEnd = rightWidth; //x坐标轴结束处位置
        var aboveHeight = centerPos.y; //上半边的高
        var belowHeight = opts.height - centerPos.y; //下半边的高
        var yStart = aboveHeight; //y坐标轴开始处位置
        var yEnd = -belowHeight; //y坐标轴结束处位置
        var arrowLen = opts.coorArrowLen;
        var scaleLen = opts.scaleLen || 12;
        var xUnit = opts.xUnit;
        var yUnit = opts.yUnit;
        if (!xUnit.showScale)
            throw new Error("xUnit.showScale is undefined!");
        if (!yUnit.showScale)
            throw new Error("yUnit.showScale is undefined!");
        var xUnitPixel = xUnit.pixel;
        var yUnitPixel = yUnit.pixel;
        if (!xUnitPixel || !yUnitPixel)
            throw new Error("xUnit.pixel is undefined!");
        var xUnitConvert = xUnit.convert;
        var yUnitConvert = yUnit.convert;
        if (!xUnitConvert)
            throw new Error("xUnit.convert is undefined!");
        if (!yUnitConvert)
            throw new Error("yUnit.convert is undefined!");
        var xUnitMince = xUnit.mince;
        var yUnitMince = yUnit.mince;
        if (!xUnitMince || !yUnitMince)
            throw new Error("yUnit.mince is undefined!");
        var xUnitSuffix = xUnit.suffix;
        var yUnitSuffix = yUnit.suffix;
        if (xUnitSuffix == undefined)
            throw new Error("xUnit.suffix is undefined!");
        if (yUnitSuffix == undefined)
            throw new Error("yUnit.suffix is undefined!");
        var start = null, end = null;
        //已知箭头长度，算出箭头直角边的长度
        var rightAngle = arrowLen * Math.sin(Math.PI / 4);
        /*=========================画横坐标 begin===========================================*/
        ctx.beginPath();
        ctx.lineWidth = opts.coorLineWidth;
        ctx.fillStyle = opts.coorTextColor;
        ctx.save();
        ctx.strokeStyle = opts.hCoorColor;
        ctx.font = opts.scaleFontSize + "px 微软雅黑";
        //绘制横坐标轴时，横坐标的y坐标,刻度值及刻度线的y坐标也是这个
        var y = 0;
        //如果横坐标要超出屏幕上边了，就让它停在上边
        if (yStart - 10 < 0) {
            y = yStart - 10;
            //如果横坐标要超出屏幕下边了，就让它停在下边
        }
        else if (yEnd + 22 > 0) {
            y = yEnd + 22;
        }
        ctx.drawLine(this.centerCoor2CanvasCoor(xStart, y), this.centerCoor2CanvasCoor(xEnd, y));
        //画箭头
        start = this.centerCoor2CanvasCoor(xEnd, y);
        end = this.centerCoor2CanvasCoor(xEnd - rightAngle, y + rightAngle);
        ctx.drawLine(start, end);
        end = this.centerCoor2CanvasCoor(xEnd - rightAngle, y - rightAngle);
        ctx.drawLine(start, end);
        ctx.stroke();
        var scaleText = null;
        var textWidth = null;
        var textCoor = null;
        //画刻度
        if (opts.showScale && xUnitPixel / xUnitMince > 0) {
            //用来累加像素值，看是否超过了屏幕画布宽度
            var sum = 0;
            var unit = (xUnitPixel / xUnitMince); //单位元
            var count = Math.floor(leftWidth / unit); //小数部分需要抛弃
            //计算起点刻度
            var xStartScale = -count * unit;
            for (var i = xStartScale; sum < opts.width; i += xUnitPixel / xUnitMince) {
                if (i === 0)
                    continue;
                sum += (xUnitPixel / xUnitMince);
                //画刻度线
                ctx.beginPath();
                ctx.drawLine(this.centerCoor2CanvasCoor(i, y), this.centerCoor2CanvasCoor(i, scaleLen + y));
                ctx.stroke();
                //显示刻度文本
                var value = GraphFunction.pixel2value(i, xUnit);
                if (xUnit.showScale(xUnitConvert(value))) { //如果要显示刻度值，才显示
                    scaleText = xUnitConvert(value) + xUnitSuffix;
                    textWidth = ctx.measureText(scaleText).width;
                    textCoor = this.centerCoor2CanvasCoor(i - textWidth * 0.5, -opts.scaleFontSize + y);
                    ctx.fillText(scaleText, textCoor.x, textCoor.y);
                }
                //画横坐标上的网格
                if (opts.showGrid) {
                    ctx.save();
                    ctx.strokeStyle = opts.gridColor;
                    ctx.lineWidth = xUnit.showScale(xUnitConvert(value)) ? opts.gridLineWidth : opts.gridLineWidth * 0.5;
                    ctx.beginPath();
                    ctx.drawLine(this.centerCoor2CanvasCoor(i, yStart), this.centerCoor2CanvasCoor(i, yEnd));
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        ctx.restore();
        /*=========================画横坐标 end===========================================*/
        /*=========================画纵坐标 begin===========================================*/
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = opts.vCoorColor;
        ctx.font = opts.scaleFontSize + "px 微软雅黑";
        //绘制纵坐标轴时，纵坐标的x坐标,刻度值及刻度线的x坐标也是这个
        var x = 0;
        //如果纵坐标要超出屏幕左边了，就让它停在左边
        if (xStart + 22 > 0) {
            x = xStart + 22;
            //如果纵坐标要超出屏幕右了，就让它停在右边
        }
        else if (xEnd - 10 < 0) {
            x = xEnd - 10;
        }
        ctx.drawLine(this.centerCoor2CanvasCoor(x, yStart), this.centerCoor2CanvasCoor(x, yEnd));
        //画箭头
        start = this.centerCoor2CanvasCoor(x, yStart);
        end = this.centerCoor2CanvasCoor(x + rightAngle, yStart - rightAngle);
        ctx.drawLine(start, end);
        end = this.centerCoor2CanvasCoor(x - rightAngle, yStart - rightAngle);
        ctx.drawLine(start, end);
        ctx.stroke();
        //画刻度
        if (opts.showScale && yUnitPixel / yUnitMince > 0) {
            var sum = 0;
            var unit = (yUnitPixel / yUnitMince); //单位元
            var count = Math.floor(belowHeight / unit); //小数部分需要抛弃
            //计算起点刻度
            var yStartScale = -count * unit;
            for (var i = yStartScale; sum < opts.height; i += yUnitPixel / yUnitMince) {
                if (i === 0)
                    continue;
                sum += (yUnitPixel / yUnitMince);
                ctx.beginPath();
                ctx.drawLine(this.centerCoor2CanvasCoor(x, i), this.centerCoor2CanvasCoor(scaleLen + x, i));
                ctx.stroke();
                //显示刻度文本
                var value = GraphFunction.pixel2value(i, yUnit);
                if (yUnit.showScale(yUnitConvert(value))) {
                    scaleText = yUnitConvert(value) + yUnitSuffix;
                    textWidth = ctx.measureText(scaleText).width;
                    textCoor = this.centerCoor2CanvasCoor(-textWidth - 4 + x, i - opts.scaleFontSize * 0.5);
                    ctx.fillText(scaleText, textCoor.x, textCoor.y);
                }
                //画纵坐标上的网格
                if (opts.showGrid) {
                    ctx.save();
                    ctx.strokeStyle = opts.gridColor;
                    ctx.lineWidth = yUnit.showScale(yUnitConvert(value)) ? opts.gridLineWidth : opts.gridLineWidth * 0.5;
                    ctx.beginPath();
                    ctx.drawLine(this.centerCoor2CanvasCoor(xStart, i), this.centerCoor2CanvasCoor(xEnd, i));
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        ctx.restore();
        /*=========================画纵坐标 begin===========================================*/
        //画x0y这3个字符
        ctx.save();
        ctx.font = opts.x0yFontSize + "px 微软雅黑";
        scaleText = "x";
        textWidth = ctx.measureText(scaleText).width;
        textCoor = this.centerCoor2CanvasCoor(xEnd - textWidth * 1.3, 0 - opts.x0yFontSize * 1.2);
        ctx.fillText(scaleText, textCoor.x, textCoor.y);
        scaleText = "y";
        textWidth = ctx.measureText(scaleText).width;
        textCoor = this.centerCoor2CanvasCoor(0 - textWidth * 1.8, yStart - opts.x0yFontSize);
        ctx.fillText(scaleText, textCoor.x, textCoor.y);
        scaleText = "0";
        textCoor = this.centerCoor2CanvasCoor(5, 0 - opts.x0yFontSize * 1.2);
        ctx.fillText(scaleText, textCoor.x, textCoor.y);
        ctx.restore();
    };
    ;
    /** 画坐标轴 */
    GraphFunction.prototype.drawCoor = function (refresh) {
        if (refresh === void 0) { refresh = false; }
        var _a = this, coorCtx = _a.coorCtx, ctx = _a.ctx, coorCanvas = _a.coorCanvas, opts = _a.opts;
        if (refresh)
            this.cacheCoor(coorCtx); //更新缓存的坐标
        ctx.drawImage(coorCanvas, 0, 0, opts.width, opts.height);
    };
    ;
    /**
     * 缓存函数曲线
     * @param ctx
     * @param anim
     * @param clear
     * @param isParse
     */
    GraphFunction.prototype.cacheFun = function (ctx, anim, clear, isParse) {
        var _this = this;
        if (anim === void 0) { anim = false; }
        if (clear === void 0) { clear = false; }
        if (isParse === void 0) { isParse = false; }
        var _a = this, opts = _a.opts, centerPos = _a.centerPos;
        if (!opts.width)
            throw new Error("opts.width is undefined!");
        if (!opts.height)
            throw new Error("opts.height is undefined!");
        if (!opts.xUnit)
            throw new Error("opts.xUnit is undefined!");
        if (!opts.yUnit)
            throw new Error("opts.yUnit is undefined!");
        if (!opts.domain)
            throw new Error("opts.domain is undefined!");
        if (!opts.fun)
            throw new Error("opts.fun is undefined!");
        if (!opts.range)
            throw new Error("opts.range is undefined!");
        if (clear) {
            //清除画布
            ctx.clearRect(0, 0, opts.width, opts.height);
        }
        var fun = opts.fun;
        var domain = opts.domain;
        var range = opts.range;
        //x坐标从0处开始，分别向正轴和负轴绘制函数图像
        var i = -centerPos.x;
        var sum = 0;
        var xUnitConvert = opts.xUnit.convert;
        var yUnitConvert = opts.yUnit.convert;
        /*根据x坐标绘制一小段线段*/
        var drawLine = function (x, xValue) {
            if (!domain(xUnitConvert(xValue)))
                return;
            var y = GraphFunction.value2pixel(fun(xValue), opts.yUnit);
            if (!range(yUnitConvert(GraphFunction.pixel2value(y, opts.yUnit))))
                return;
            var start = _this.centerCoor2CanvasCoor(x, y);
            if (sum < opts.width) {
                var xValue_1 = GraphFunction.pixel2value(x + 1, opts.xUnit);
                y = GraphFunction.value2pixel(fun(xValue_1), opts.yUnit);
                var end = _this.centerCoor2CanvasCoor(x + 1, y);
                ctx.beginPath();
                ctx.drawLine(start, end);
                ctx.stroke();
            }
        };
        if (anim) {
            var animation_1 = function () {
                ctx.strokeStyle = opts.color;
                if (sum > opts.width)
                    return;
                var xValue = GraphFunction.pixel2value(i, opts.xUnit);
                while (!domain(xUnitConvert(xValue))) {
                    i++;
                    sum++;
                    xValue = GraphFunction.pixel2value(i, opts.xUnit);
                    if (sum > opts.width) {
                        return;
                    }
                }
                setTimeout(animation_1, 0);
                drawLine(i, xValue);
                i++;
                sum++;
            };
            animation_1();
        }
        else {
            ctx.strokeStyle = opts.color;
            for (; sum < opts.width; i++) {
                var xValue = GraphFunction.pixel2value(i, opts.xUnit);
                drawLine(i, xValue);
                sum++;
            }
        }
        //标记点
        var points = opts.points || [];
        for (var j = 0; j < points.length; j++) {
            var p = points[j];
            if (isParse) {
                var xUnitParse = opts.xUnit.parse;
                var yUnitParse = opts.yUnit.parse;
                if (!xUnitParse)
                    throw new Error("xUnit.parse is undefined!");
                if (!yUnitParse)
                    throw new Error("yUnit.parse is undefined!");
                p.x = xUnitParse(p.x);
                if (p.y)
                    yUnitParse(p.y);
            }
            this.markPoint(ctx, p);
        }
    };
    ;
    /**
     * 画函数曲线
     */
    GraphFunction.prototype.drawFun = function (refresh, anim) {
        if (refresh === void 0) { refresh = false; }
        if (anim === void 0) { anim = false; }
        var _a = this, funCtx = _a.funCtx, opts = _a.opts, ctx = _a.ctx, funCanvas = _a.funCanvas;
        if (refresh)
            this.cacheFun(funCtx, anim, true); //更新缓存的坐标
        ctx.drawImage(funCanvas, 0, 0, opts.width, opts.height);
    };
    ;
    /**重新缓存坐标轴和函数曲线 */
    GraphFunction.prototype.reCache = function () {
        var _a = this, coorCtx = _a.coorCtx, funCtx = _a.funCtx;
        this.cacheCoor(coorCtx);
        this.cacheFun(funCtx, false, true);
    };
    ;
    GraphFunction.prototype.show = function () {
        this.drawCoor();
        this.cacheFun(this.ctx, this.opts.animation);
    };
    ;
    /** 标记点 */
    GraphFunction.prototype.markPoint = function (ctx, p) {
        var _a = this, centerPos = _a.centerPos, opts = _a.opts;
        if (!opts.width)
            throw new Error("opts.width is undefined!");
        if (!opts.height)
            throw new Error("opts.height is undefined!");
        if (!opts.xUnit)
            throw new Error("opts.xUnit is undefined!");
        if (!opts.yUnit)
            throw new Error("opts.yUnit is undefined!");
        if (!opts.domain)
            throw new Error("opts.domain is undefined!");
        if (!opts.fun)
            throw new Error("opts.fun is undefined!");
        if (!opts.range)
            throw new Error("opts.range is undefined!");
        var topMax = centerPos.y; //上边的边界
        var bottomMax = centerPos.y - opts.height; //下边的边界
        var rightMax = opts.width - centerPos.x; //右边的边界
        var xUnitConvert = opts.xUnit.convert;
        var yUnitConvert = opts.yUnit.convert;
        //若x不在定义域内，返回
        if (p.x === undefined || !opts.domain(xUnitConvert(p.x)))
            return;
        //先把坐标值转换为像素值
        var x = GraphFunction.value2pixel(p.x, opts.xUnit);
        p.y = p.y || opts.fun(p.x).toFixed(2);
        //若y不在值域内，返回
        if (!opts.range(yUnitConvert(p.y)))
            return;
        if (p.y == 0)
            p.y = 0; //保留小数位后，如果y为0.00，就赋值为0
        if (p.y - Math.floor(p.y) == 0)
            p.y = Math.floor(p.y); //如果y的小数部分为0，那么就抛弃小数部分
        p.mark = p.mark || "P";
        var y = GraphFunction.value2pixel(p.y, opts.yUnit);
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = opts.markPointColor;
        ctx.lineWidth = opts.markPointLineWidth;
        ctx.fillStyle = opts.markPointColor;
        ctx.font = opts.markPointFontSize + "px 微软雅黑";
        ctx.setLineDash([3, 3]);
        var coor = this.centerCoor2CanvasCoor(x, y);
        if (p.showDotted === undefined || p.showDotted !== false) {
            ctx.drawLine(this.centerCoor2CanvasCoor(0, y), coor);
            ctx.drawLine(this.centerCoor2CanvasCoor(x, 0), coor);
        }
        ctx.stroke();
        //y的值没有超出画布高度，才有必要花点
        if (y > bottomMax && y < topMax) {
            ctx.beginPath();
            ctx.arc(coor.x, coor.y, opts.markPointRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
        var xText = xUnitConvert(p.x) + opts.xUnit.suffix;
        var yText = yUnitConvert(p.y) + opts.yUnit.suffix;
        var coorText = p.mark + "( " + xText + "，" + yText + " )";
        var coorTextWidth = ctx.measureText(coorText).width;
        var autoY = y;
        //若y超出了画布高度，那么要把显示的坐标信息的y坐标固定到画布边缘
        if (y > topMax - 20) {
            autoY = topMax - 20;
        }
        if (y < bottomMax) {
            autoY = bottomMax;
        }
        var autoX = x;
        //若x坐标加上文本的宽度超出了边缘，那么重新调整x坐标
        if (x + coorTextWidth > rightMax - 10) {
            autoX = rightMax - coorTextWidth - 10;
        }
        coor = this.centerCoor2CanvasCoor(autoX, autoY);
        ctx.fillText(coorText, coor.x + 5, coor.y - 5);
        ctx.restore();
    };
    ;
    /**事件绑定 */
    GraphFunction.prototype.eventListener = function () {
        var _this = this;
        var _a = this, beginDrag = _a.beginDrag, isDrag = _a.isDrag, startOffset = _a.startOffset, isMouseDown = _a.isMouseDown, centerPos = _a.centerPos, opts = _a.opts, ctx = _a.ctx;
        window.addEventListener("mousemove", function (e) {
            //开启了拖拽的话，就不标记点了
            if (beginDrag === true) {
                if (!isDrag)
                    return;
                if (!startOffset)
                    throw new Error("startOffset is undefined!");
                var xd = e.offsetX - startOffset.x;
                var yd = e.offsetY - startOffset.y;
                _this.cx += xd;
                _this.cy += yd;
                _this.setCenterPos(_this.cx, _this.cy);
                _this.drawCoor(true);
                _this.drawFun(true);
                startOffset = { x: e.offsetX, y: e.offsetY };
                return;
            }
            //若鼠标未按下，就不标记点！
            if (!isMouseDown)
                return;
            _this.drawCoor();
            _this.drawFun();
            //计算出x坐标
            var x = GraphFunction.pixel2value(e.offsetX - centerPos.x, opts.xUnit);
            //标记点
            _this.markPoint(ctx, { x: x });
        });
        window.addEventListener("mousedown", function (e) {
            _this.drawCoor();
            _this.drawFun();
            //开启了拖拽的话，就不标记点了
            if (beginDrag === true) {
                isDrag = true;
                startOffset = { x: e.offsetX, y: e.offsetY };
                return;
            }
            isMouseDown = true;
            //计算出x坐标
            var x = GraphFunction.pixel2value(e.offsetX - centerPos.x, _this.opts.xUnit);
            //标记点
            _this.markPoint(ctx, { x: x });
        });
        window.addEventListener("mouseup", function (e) {
            isDrag = false;
            isMouseDown = false;
            _this.drawCoor();
            _this.drawFun();
        });
    };
    /** 根据新的options重绘 */
    GraphFunction.prototype.invalidate = function (options) {
        options.xUnit = __assign({}, this.opts.xUnit, options.xUnit);
        options.yUnit = __assign({}, this.opts.yUnit, options.yUnit);
        this.opts = __assign({}, this.opts, options);
        this.setCanvasWH();
        this.drawCoor(true);
        this.drawFun(true);
    };
    ;
    /** 打开拖拽坐标系*/
    GraphFunction.prototype.openDrag = function (isOpen) {
        if (isOpen === void 0) { isOpen = true; }
        var _a = this, centerPos = _a.centerPos, canvas = _a.canvas;
        if (isOpen) {
            this.cx = centerPos.x;
            this.cy = centerPos.y;
            canvas.style.cursor = "move";
        }
        else {
            this.cx = null;
            this.cy = null;
            canvas.style.cursor = "pointer";
        }
        this.beginDrag = isOpen;
    };
    ;
    /** 设置样式主题 */
    GraphFunction.prototype.setTheme = function (theme) {
        var opts = this.opts;
        switch (theme) {
            case "light":
                opts = Object.assign({}, opts, {
                    hCoorColor: "blue",
                    vCoorColor: "red",
                    gridColor: "green",
                    color: "purple",
                    coorTextColor: "black",
                    markPointColor: "brown",
                    backgroundColor: "white"
                });
                break;
            case "dark":
                opts = Object.assign({}, opts, {
                    hCoorColor: "white",
                    vCoorColor: "white",
                    gridColor: "gray",
                    color: "white",
                    coorTextColor: "white",
                    markPointColor: "white",
                    backgroundColor: "#233"
                });
                break;
            default:
                opts = Object.assign({}, opts, {
                    hCoorColor: "black",
                    vCoorColor: "black",
                    gridColor: "gray",
                    color: "black",
                    coorTextColor: "black",
                    markPointColor: "black",
                    backgroundColor: "white"
                });
                break;
        }
        this.reCache();
    };
    ;
    /**重新加载一段options来显示函数曲线 */
    GraphFunction.prototype.reload = function (options) {
        var opts = this.opts;
        options.xUnit = Object.assign({}, opts.xUnit, options.xUnit);
        options.yUnit = Object.assign({}, opts.yUnit, options.yUnit);
        opts = Object.assign({}, opts, options);
        this.reCache();
    };
    ;
    return GraphFunction;
}());
