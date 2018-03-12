/**
 * Created by VULCAN on 2018/2/1.
 */

/**
 * 扩展函数，画线
 * @param start
 * @param end
 */
CanvasRenderingContext2D.prototype.drawLine = function (start,end) {
	this.moveTo(start.x,start.y);
	this.lineTo(end.x,end.y);
};

function GraphFunction(options) {

	var defaults = {
        width: 600,
        height: 400,
        backgroundColor: "white",//背景色
        animation: true,//是否显示动画
        xUnit: { //x轴单位
            pixel: 100,//一个单位有多少像素
            value: 1,//单位值
            mince: 1,//将一个单位细分为多少，值越大，精度越高，默认为1，即不细分
            showScale: function (value) { //显示刻度值的条件
                return true;
            },
            convert: function (value) {//单位转换
                return value;
            },
            parse: function (value) {//单位逆转换
                return value;
            },
            suffix: "",//单位后缀
        },
        yUnit: { //y轴单位
            pixel: 100,//一个单位有多少像素
            value: 1,//单位值
            mince: 1,
            showScale: function (value) { //显示刻度值的条件
                return true;
            },
            convert: function (value) {//单位转换
                return value;
            },
            parse: function (value) {//单位逆转换
                return value;
            },
            suffix: "",//单位后缀
        },
        showScale: true,//是否显示刻度
        scaleLen: 5,//刻度长度
        scaleFontSize: 12,//刻度字体大小
        coorTextColor: "black",//坐标轴字体颜色
        x0yFontSize: 18,
        color: "black",//函数图像颜色
        hCoorColor: "black",//横坐标颜色
        vCoorColor: "black",//纵坐标颜色
        coorLineWidth: 0.5,//坐标轴线宽
        coorArrowLen: 8,//坐标轴箭头长度
        showGrid: true,//是否显示网格
        gridColor: "gray",//网格颜色
        gridLineWidth: 0.2,//网格线宽，如果x、y坐标步长(step)大于1，那么步长之内的线宽为一半
        points: [],//要标记的点,格式:{x:x,y:y,showDotted:true|false,mark:'P'} 若不提供y,则系统自动根据函数计算y,默认显示虚线
        markPointLineWidth: 0.5,//描点的虚线线宽
        markPointRadius: 3,//描点 点的半径
        markPointColor: "brown",//描点颜色
        markPointFontSize: 14,
        centerX:null,//坐标轴中心点x坐标,坐标系为画布坐标系
        centerY:null,//坐标轴中心点y坐标,坐标系为画布坐标系
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

	options.xUnit = Object.assign({},defaults.xUnit,options.xUnit);
	options.yUnit = Object.assign({},defaults.yUnit,options.yUnit);
	var opts = Object.assign({},defaults,options);
	var canvas = opts.canvas;
	var isMouseDown = false;//记录鼠标是否按下
	if(!canvas||canvas.tagName.toLowerCase()!=="canvas") throw new Error("dom isn't canvas!");
    canvas.style.cursor = "pointer";

	var ctx = canvas.getContext("2d");
	//用来缓存坐标轴
	var coorCanvas = document.createElement("canvas");
	var coorCtx = coorCanvas.getContext("2d");

    //用来缓存函数曲线及标记点
    var funCanvas = document.createElement("canvas");
    var funCtx = funCanvas.getContext("2d");

    //拖拽坐标系相关
    var beginDrag = false;//标记是否要开始拖拽
    var isDrag = false;//标记是否正在拖拽
    var startOffset = null;//记录上一次拖拽的位置
    var cx = null;
    var cy = null;

    //坐标轴中心点的位置
    var centerPos = {x:0,y:0};

    /**
     * 设置坐标轴中心点的坐标，坐标系为画布坐标系
     * @param x
     * @param y
     */
    var setCenterPos = function (x,y) {
        centerPos.x = x;
        centerPos.y = y;
    };

    /**
     * 设置画布的宽高
     */
    var setCanvasWH = function () {
        canvas.width = opts.width;
        canvas.height = opts.height;
        canvas.style.width = opts.width+"px";
        canvas.style.height = opts.height+"px";
        coorCanvas.width = opts.width;
        coorCanvas.height = opts.height;
        funCanvas.width = opts.width;
        funCanvas.height = opts.height;

        //如果没有指定，默认将坐标轴的中心位置放到画布的中心
        var centerX = cx || opts.width*0.5;
        var centerY = cy || opts.height*0.5;
        if(opts.centerX!=null){
            centerX = opts.centerX;
        }
        if(opts.centerY!=null){
            centerY = opts.centerY;
        }
        setCenterPos(centerX,centerY);
    };

	/**
	 * 中心坐标转画布坐标
	 * @param x0
	 * @param y0
	 * @returns {{x: *, y: number}}
	 */
	var centerCoor2CanvasCoor = function (x0,y0) {
		var x = centerPos.x + x0;
		var y = -y0 + centerPos.y;
		return {x:x,y:y};
	};

	/**
	 * 像素转换为值
	 */
	var pixel2value = function (pixel,unit) {
		var unitValue = unit.value||1;
		return ((pixel/unit.pixel)*unitValue).toFixed(2)*1;
	};

	/**
	 * 值转换为像素
	 */
	var value2pixel = function (value,unit) {
		var unitValue = unit.value||1;
		return (value/unitValue)*unit.pixel;
	};

	/**
	 * 缓存坐标轴
	 */
	var cacheCoor = function (ctx) {
		//清除画布
		ctx.clearRect(0,0,opts.width,opts.height);
		ctx.save();
		ctx.fillStyle = opts.backgroundColor;
		ctx.fillRect(0,0,opts.width,opts.height);
		ctx.restore();

        var leftWidth = centerPos.x;//左半边的宽
        var rightWidth = opts.width - centerPos.x;//右半边的宽
        var xStart = -leftWidth;//x坐标轴开始处位置
        var xEnd = rightWidth;//x坐标轴结束处位置

        var aboveHeight = centerPos.y;//上半边的高
        var belowHeight = opts.height - centerPos.y;//下半边的高
        var yStart = aboveHeight;//y坐标轴开始处位置
        var yEnd = -belowHeight;//y坐标轴结束处位置

		var arrowLen = opts.coorArrowLen;
		var scaleLen = opts.scaleLen;
		var xUnit = opts.xUnit;
		var yUnit = opts.yUnit;
		var xUnitPixel = xUnit.pixel;
		var yUnitPixel = yUnit.pixel;
		var xUnitConvert = xUnit.convert;
		var yUnitConvert = yUnit.convert;
		var xUnitMince = xUnit.mince;
		var yUnitMince = yUnit.mince;
		var xUnitSuffix = xUnit.suffix;
		var yUnitSuffix = yUnit.suffix;

        var start = null,end = null;
		//已知箭头长度，算出箭头直角边的长度
		var rightAngle = arrowLen * Math.sin(Math.PI / 4);
		/*=========================画横坐标 begin===========================================*/
		ctx.beginPath();
		ctx.lineWidth = opts.coorLineWidth;
		ctx.fillStyle = opts.coorTextColor;
		ctx.save();
		ctx.strokeStyle = opts.hCoorColor;
		ctx.font = opts.scaleFontSize+"px 微软雅黑";

        //绘制横坐标轴时，横坐标的y坐标,刻度值及刻度线的y坐标也是这个
        var y = 0;
        //如果横坐标要超出屏幕上边了，就让它停在上边
        if(yStart-10<0){
            y = yStart-10;
            //如果横坐标要超出屏幕下边了，就让它停在下边
        }else if(yEnd+22>0){
            y = yEnd+22;
        }

		ctx.drawLine(centerCoor2CanvasCoor(xStart,y),centerCoor2CanvasCoor(xEnd,y));

		//画箭头
		start = centerCoor2CanvasCoor(xEnd,y);
		end = centerCoor2CanvasCoor(xEnd - rightAngle, y+rightAngle);
		ctx.drawLine(start,end);
		end = centerCoor2CanvasCoor(xEnd - rightAngle, y-rightAngle);
		ctx.drawLine(start,end);
		ctx.stroke();

		var scaleText = null;
		var textWidth = null;
		var textCoor = null;

        //画刻度
		if(opts.showScale&&xUnitPixel/xUnitMince>0){
		    //用来累加像素值，看是否超过了屏幕画布宽度
			var sum = 0;
            var unit = (xUnitPixel / xUnitMince);//单位元
            var count = Math.floor(leftWidth / unit);//小数部分需要抛弃
            //计算起点刻度
            var xStartScale = -count*unit;
			for(var i=xStartScale;sum<opts.width;i+=xUnitPixel/xUnitMince){
                if(i===0) continue;
                sum+=(xUnitPixel/xUnitMince);
                //画刻度线
                ctx.beginPath();
				ctx.drawLine(centerCoor2CanvasCoor(i,y),centerCoor2CanvasCoor(i,scaleLen+y));
				ctx.stroke();

				//显示刻度文本
                var value = pixel2value(i,xUnit);
                if(xUnit.showScale(xUnitConvert(value))){//如果要显示刻度值，才显示
                    scaleText = xUnitConvert(value)+xUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = centerCoor2CanvasCoor(i-textWidth*0.5,-opts.scaleFontSize+y);
					ctx.fillText(scaleText,textCoor.x,textCoor.y);
				}

                //画横坐标上的网格
                if(opts.showGrid){
                    ctx.save();
                    ctx.strokeStyle = opts.gridColor;
                    ctx.lineWidth = xUnit.showScale(xUnitConvert(value))?opts.gridLineWidth:opts.gridLineWidth*0.5;
                    ctx.beginPath();
                    ctx.drawLine(centerCoor2CanvasCoor(i,yStart),centerCoor2CanvasCoor(i,yEnd));
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
		ctx.font = opts.scaleFontSize+"px 微软雅黑";

        //绘制纵坐标轴时，纵坐标的x坐标,刻度值及刻度线的x坐标也是这个
        var x = 0;
        //如果纵坐标要超出屏幕左边了，就让它停在左边
        if(xStart+22>0){
            x = xStart+22;
        //如果纵坐标要超出屏幕右了，就让它停在右边
        }else if(xEnd-10<0){
            x = xEnd-10;
        }
		ctx.drawLine(centerCoor2CanvasCoor(x,yStart),centerCoor2CanvasCoor(x,yEnd));

		//画箭头
		start = centerCoor2CanvasCoor(x,yStart);
		end = centerCoor2CanvasCoor(x+rightAngle,yStart - rightAngle);
		ctx.drawLine(start,end);
		end = centerCoor2CanvasCoor(x-rightAngle,yStart - rightAngle);
		ctx.drawLine(start,end);
		ctx.stroke();

		//画刻度
		if(opts.showScale&&yUnitPixel/yUnitMince>0){
            var sum = 0;
            var unit = (yUnitPixel / yUnitMince);//单位元
            var count = Math.floor(belowHeight / unit);//小数部分需要抛弃
            //计算起点刻度
            var yStartScale = -count*unit;
			for(var i=yStartScale;sum<opts.height;i+=yUnitPixel/yUnitMince){
				if(i===0) continue;
				sum += (yUnitPixel/yUnitMince);
				ctx.beginPath();
				ctx.drawLine(centerCoor2CanvasCoor(x,i),centerCoor2CanvasCoor(scaleLen+x,i));
				ctx.stroke();

				//显示刻度文本
                var value = pixel2value(i,yUnit);
				if(yUnit.showScale(yUnitConvert(value))){
                    scaleText = yUnitConvert(value)+yUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = centerCoor2CanvasCoor(-textWidth-4+x,i-opts.scaleFontSize*0.5);
					ctx.fillText(scaleText,textCoor.x,textCoor.y);
				}

				//画纵坐标上的网格
				if(opts.showGrid){
					ctx.save();
					ctx.strokeStyle = opts.gridColor;
					ctx.lineWidth = yUnit.showScale(yUnitConvert(value))?opts.gridLineWidth:opts.gridLineWidth*0.5;
					ctx.beginPath();
                    ctx.drawLine(centerCoor2CanvasCoor(xStart,i),centerCoor2CanvasCoor(xEnd,i));
					ctx.stroke();
					ctx.restore();
				}
			}
		}

		ctx.restore();
		/*=========================画纵坐标 begin===========================================*/

		//画x0y这3个字符
		ctx.save();
		ctx.font = opts.x0yFontSize+"px 微软雅黑";
		scaleText = "x";
		textWidth=ctx.measureText(scaleText).width;
		textCoor = centerCoor2CanvasCoor(xEnd-textWidth*1.3,0-opts.x0yFontSize*1.2);
		ctx.fillText(scaleText,textCoor.x,textCoor.y);
		scaleText = "y";
		textWidth=ctx.measureText(scaleText).width;
		textCoor = centerCoor2CanvasCoor(0-textWidth*1.8,yStart-opts.x0yFontSize);
		ctx.fillText(scaleText,textCoor.x,textCoor.y);

		scaleText = "0";
		textCoor = centerCoor2CanvasCoor(5,0-opts.x0yFontSize*1.2);
		ctx.fillText(scaleText,textCoor.x,textCoor.y);
		ctx.restore();
	};

	/**
	 * 画坐标轴
	 */
	var drawCoor = function (refresh) {
	    if(refresh===undefined) refresh = false;
		if(refresh) cacheCoor(coorCtx);//更新缓存的坐标
		ctx.drawImage(coorCanvas,0,0,opts.width,opts.height);
	};

    /**
     * 缓存函数曲线
     * @param ctx
     * @param anim
     * @param clear
     * @param isParse
     */
	var cacheFun = function (ctx,anim,clear,isParse) {

	    if(anim===undefined) anim = false;
	    if(clear===undefined) clear = false;
	    if(isParse===undefined) isParse = false;
		if(clear){
			//清除画布
			ctx.clearRect(0,0,opts.width,opts.height);
		}

		var fun = opts.fun;
		//x坐标从0处开始，分别向正轴和负轴绘制函数图像
		var i = -centerPos.x;
		var sum = 0;

        var xUnitConvert = opts.xUnit.convert;
        var yUnitConvert = opts.yUnit.convert;

		/*根据x坐标绘制一小段线段*/
		var drawLine = function (x,xValue) {
			if(!opts.domain(xUnitConvert(xValue))) return;

            var y = value2pixel(fun(xValue),opts.yUnit);
            if(!opts.range(yUnitConvert(pixel2value(y,opts.yUnit)))) return;
			var start = centerCoor2CanvasCoor(x,y);
            if(sum<opts.width){
                var xValue = pixel2value(x+1,opts.xUnit);
				y = value2pixel(fun(xValue),opts.yUnit);
				var end = centerCoor2CanvasCoor(x+1,y);
				ctx.beginPath();
				ctx.drawLine(start,end);
				ctx.stroke();
			}
		};

		if(anim){
			var animation = function () {
				ctx.strokeStyle = opts.color;
				if(sum>opts.width) return;
                var xValue = pixel2value(i,opts.xUnit);
                while(!opts.domain(xUnitConvert(xValue))) {
                    i++;
                    sum++;
                    xValue = pixel2value(i,opts.xUnit);
                    if(sum>opts.width) {
                        return;
                    }
                }
				setTimeout(animation,0);
				drawLine(i,xValue);
				i++;
                sum++;
			};
			animation();
		}else{
			ctx.strokeStyle = opts.color;
			for(;sum<opts.width;i++){
                var xValue = pixel2value(i,opts.xUnit);
				drawLine(i,xValue);
				sum++;
            }
		}

		//标记点
        var points = opts.points||[];
        for(var j=0;j<points.length;j++){
            var p = points[j];
            if(isParse){
				var xUnitParse = opts.xUnit.parse;
				var yUnitParse = opts.yUnit.parse;
				p.x = xUnitParse(p.x);
				if(p.y) yUnitParse(p.y);
			}
			markPoint(ctx,p);
        }
	};

    /**
     * 画函数曲线
     */
    var drawFun = function (refresh,anim) {
        if(refresh===undefined) refresh = false;
        if(anim===undefined) anim = false;
        if(refresh) cacheFun(funCtx,anim,true);//更新缓存的坐标
        ctx.drawImage(funCanvas,0,0,opts.width,opts.height);
    };

    /**重新缓存坐标轴和函数曲线 */
    var reCache = function(){
        cacheCoor(coorCtx);
        cacheFun(funCtx,false,true);
    };

	var show = function () {
		drawCoor();
		cacheFun(ctx,opts.animation);
    };

	/**
	 * 标记点
	 */
	var markPoint = function (ctx,p) {
        var topMax = centerPos.y;//上边的边界
        var bottomMax = centerPos.y - opts.height;//下边的边界
        var rightMax = opts.width - centerPos.x;//右边的边界

        var xUnitConvert = opts.xUnit.convert;
        var yUnitConvert = opts.yUnit.convert;

        //若x不在定义域内，返回
        if (p.x === undefined||!opts.domain(xUnitConvert(p.x))) return;
        //先把坐标值转换为像素值
        var x = value2pixel(p.x, opts.xUnit);
        p.y = p.y || opts.fun(p.x).toFixed(2);
        //若y不在值域内，返回
        if (!opts.range(yUnitConvert(p.y))) return;

        if (p.y == 0) p.y = 0;//保留小数位后，如果y为0.00，就赋值为0
        if (p.y - Math.floor(p.y) == 0) p.y = Math.floor(p.y);//如果y的小数部分为0，那么就抛弃小数部分
        p.mark = p.mark || "P";
        var y = value2pixel(p.y, opts.yUnit);
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = opts.markPointColor;
        ctx.lineWidth = opts.markPointLineWidth;
        ctx.fillStyle = opts.markPointColor;
        ctx.font = opts.markPointFontSize + "px 微软雅黑";
        ctx.setLineDash([3, 3]);


        var coor = centerCoor2CanvasCoor(x, y);
        if (p.showDotted === undefined || p.showDotted !== false) {
            ctx.drawLine(centerCoor2CanvasCoor(0, y), coor);
            ctx.drawLine(centerCoor2CanvasCoor(x, 0), coor);
        }
        ctx.stroke();

        //y的值没有超出画布高度，才有必要花点
        if(y>bottomMax&&y<topMax){
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
        if(y>topMax - 20){
            autoY = topMax - 20;
        }
        if(y<bottomMax){
        	autoY = bottomMax;
		}
		var autoX = x;
        //若x坐标加上文本的宽度超出了边缘，那么重新调整x坐标
        if(x + coorTextWidth>rightMax-10){
        	autoX = rightMax - coorTextWidth-10;
		}
        var coor = centerCoor2CanvasCoor(autoX, autoY);
        ctx.fillText(coorText, coor.x + 5, coor.y - 5);
        ctx.restore();
	};

    /**
	 * 根据新的options重绘
     * @param options
     */
	this.invalidate = function (options) {
		opts = Object.assign({},opts,options);
		setCanvasWH();
		drawCoor(true);
		drawFun(true);
    };

	//打开拖拽坐标系
	this.openDrag = function (isOpen) {
	    if(isOpen===undefined) isOpen = true;
	    if(isOpen){
	        cx = centerPos.x;
	        cy = centerPos.y;
            canvas.style.cursor = "move";
        }else{
	        cx = null;
	        cy = null;
            canvas.style.cursor = "pointer";
        }
        beginDrag = isOpen;
    };

    /**
     * 设置样式主题
     */
	this.setTheme = function (theme) {
        switch (theme){
            case "light":
                opts = Object.assign({},opts,{
                    hCoorColor:"blue",
                    vCoorColor:"red",
                    gridColor:"green",
                    color:"purple",
                    coorTextColor:"black",
                    markPointColor:"brown",
                    backgroundColor:"white"
                });
                break;
            case "dark":
                opts = Object.assign({},opts,{
                    hCoorColor:"white",
                    vCoorColor:"white",
                    gridColor:"gray",
                    color:"white",
                    coorTextColor:"white",
                    markPointColor:"white",
                    backgroundColor:"#233"
                });
                break;
            default:
                opts = Object.assign({},opts,{
                    hCoorColor:"black",
                    vCoorColor:"black",
                    gridColor:"gray",
                    color:"black",
                    coorTextColor:"black",
                    markPointColor:"black",
                    backgroundColor:"white"
                });
                break;
        }
        reCache();
    };

    /**重新加载一段options来显示函数曲线 */
    this.reload = function(options){
        options.xUnit = Object.assign({},opts.xUnit,options.xUnit);
	    options.yUnit = Object.assign({},opts.yUnit,options.yUnit);
        opts = Object.assign({},opts,options);
        reCache();
    };

    /**
	 * 添加鼠标移动事件，然后根据鼠标的x坐标来描点
     */
	window.addEventListener("mousemove",function (e) {

        //开启了拖拽的话，就不标记点了
	    if (beginDrag===true){
            if(!isDrag) return;
            var xd = e.offsetX - startOffset.x;
            var yd = e.offsetY - startOffset.y;
            cx+=xd;
            cy+=yd;

            
            setCenterPos(cx,cy);
            drawCoor(true);
            drawFun(true);

            startOffset = {x:e.offsetX,y:e.offsetY};
	        return;
        }

		//若鼠标未按下，就不标记点！
		if(!isMouseDown) return;
		drawCoor();
		drawFun();
		//计算出x坐标
		var x = pixel2value(e.offsetX - centerPos.x,opts.xUnit);
		//标记点
		markPoint(ctx,{x:x});
    });

	window.addEventListener("mousedown",function (e) {

        drawCoor();
        drawFun();
        //开启了拖拽的话，就不标记点了
        if (beginDrag===true){
            isDrag = true;
            startOffset = {x:e.offsetX,y:e.offsetY};
            return;
        }

		isMouseDown = true;
        //计算出x坐标
        var x = pixel2value(e.offsetX - centerPos.x,opts.xUnit);
        //标记点
        markPoint(ctx,{x:x});
    });

	window.addEventListener("mouseup",function () {
	    isDrag = false;
		isMouseDown = false;
        drawCoor();
        drawFun();
    });
	setCanvasWH();
	cacheCoor(coorCtx);
    cacheFun(funCtx,false,false,true);
    show();
}