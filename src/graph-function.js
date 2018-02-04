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
		width:600,
		height:400,
		backgroundColor:"white",//背景色
		animation:true,//是否显示动画
		xUnit:{ //x轴单位
			pixel:100,//一个单位有多少像素
			value:1,//单位值
			mince:1,//将一个单位细分为多少，值越大，精度越高，默认为1，即不细分
			step:1,//步长，多少步显示一次单位值
            convert:function (value) {//单位转换
				return value;
            },
            parse:function (value) {//单位逆转换
				return value;
            },
			suffix:"",//单位后缀
		},
		yUnit:{ //y轴单位
			pixel:100,//一个单位有多少像素
			value:1,//单位值
            mince:1,
			step:1,//步长，多少步才显示单位
            convert:function (value) {//单位转换
                return value;
            },
            parse:function (value) {//单位逆转换
                return value;
            },
            suffix:"",//单位后缀
		},
		showScale:true,//是否显示刻度
		scaleLen:5,//刻度长度
		scaleFontSize:12,//刻度字体大小
		coorTextColor:"black",//坐标轴字体颜色
		x0yFontSize:18,
		color:"black",//函数图像颜色
		hCoorColor:"black",//横坐标颜色
		vCoorColor:"black",//纵坐标颜色
		coorLineWidth:0.5,//坐标轴线宽
		coorArrowLen:8,//坐标轴箭头长度
		showGrid:true,//是否显示网格
		gridColor:"gray",//网格颜色
		gridLineWidth:0.2,//网格线宽，如果x、y坐标步长(step)大于1，那么步长之内的线宽为一半
		points:[],//要标记的点,格式:{x:x,y:y,showDotted:true|false,mark:'P'} 若不提供y,则系统自动根据函数计算y,默认显示虚线
		markPointLineWidth:0.5,//描点的虚线线宽
		markPointRadius:3,//描点 点的半径
		markPointColor:"brown",//描点颜色
		markPointFontSize:14,
		//定义域，如果x!=0,函数返回x!=0即可
		domain:function (x) {
			return true;
		},
		//值域
		range:function (y) {
			return true;
		},
		//要绘制的函数
		fun:function (x) {
			return x;
		}
	};

	options.xUnit = Object.assign({},defaults.xUnit,options.xUnit);
	options.yUnit = Object.assign({},defaults.yUnit,options.yUnit);
	var opts = Object.assign({},defaults,options);
	var canvas = opts.canvas;
	var isMouseDown = false;//记录鼠标是否按下
	if(!canvas||canvas.tagName.toLowerCase()!=="canvas") throw new Error("dom isn't canvas!");

	var ctx = canvas.getContext("2d");
	//用来缓存坐标轴
	var coorCanvas = document.createElement("canvas");
	var coorCtx = coorCanvas.getContext("2d");

    //用来缓存函数曲线及标记点
    var funCanvas = document.createElement("canvas");
    var funCtx = funCanvas.getContext("2d");

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
    };

	/**
	 * 画布中心坐标转画布坐标
	 * @param x0
	 * @param y0
	 * @returns {{x: *, y: number}}
	 */
	var centerCoor2CanvasCoor = function (x0,y0) {
		var x = opts.width*0.5 + x0;
		var y = -y0 + opts.height*0.5;
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

		var widthHalf = opts.width*0.5;
		var heightHalf = opts.height*0.5;
		var arrowLen = opts.coorArrowLen;
		var scaleLen = opts.scaleLen;
		var xUnit = opts.xUnit;
		var yUnit = opts.yUnit;
		var xUnitPixel = xUnit.pixel;
		var yUnitPixel = yUnit.pixel;
		var xUnitStep = xUnit.step||1;
		var yUnitStep = yUnit.step||1;
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
		ctx.drawLine(centerCoor2CanvasCoor(-widthHalf,0),centerCoor2CanvasCoor(widthHalf,0));

		//画箭头
		start = centerCoor2CanvasCoor(widthHalf,0);
		end = centerCoor2CanvasCoor(widthHalf - rightAngle, rightAngle);
		ctx.drawLine(start,end);
		end = centerCoor2CanvasCoor(widthHalf - rightAngle, -rightAngle);
		ctx.drawLine(start,end);
		ctx.stroke();

		//画x0y这3个字符
		var scaleText = null;
		var textWidth = null;
		var textCoor = null;

		//画刻度
		if(opts.showScale&&xUnitPixel/xUnitMince>0){
			var scale=1;
			for(var i=0;i<widthHalf;i+=xUnitPixel/xUnitMince){
				if(i===0) continue;
				ctx.beginPath();
				//正轴方向
				ctx.drawLine(centerCoor2CanvasCoor(i,0),centerCoor2CanvasCoor(i,scaleLen));

				//负轴方向
				ctx.drawLine(centerCoor2CanvasCoor(-i,0),centerCoor2CanvasCoor(-i,scaleLen));
				ctx.stroke();

				//显示刻度文本
				if(scale%xUnitStep===0){
					//正轴方向
					var value = pixel2value(i,xUnit);
					scaleText = xUnitConvert(value)+xUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = centerCoor2CanvasCoor(i-textWidth*0.5,-opts.scaleFontSize);
					ctx.fillText(scaleText,textCoor.x,textCoor.y);

					//负轴方向
                    scaleText = xUnitConvert(-value)+xUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = centerCoor2CanvasCoor(-(i+textWidth*0.5),-opts.scaleFontSize);
					ctx.fillText(scaleText,textCoor.x,textCoor.y);
				}

                //画横坐标上的网格
                if(opts.showGrid){
                    ctx.save();
                    ctx.strokeStyle = opts.gridColor;
                    ctx.lineWidth = scale%xUnitStep===0?opts.gridLineWidth:opts.gridLineWidth*0.5;
                    ctx.beginPath();
                    ctx.drawLine(centerCoor2CanvasCoor(i,heightHalf),centerCoor2CanvasCoor(i,-heightHalf));
                    ctx.drawLine(centerCoor2CanvasCoor(-i,heightHalf),centerCoor2CanvasCoor(-i,-heightHalf));
                    ctx.stroke();
                    ctx.restore();
                }
				scale++;
			}
		}


		ctx.restore();
		/*=========================画横坐标 end===========================================*/



		/*=========================画纵坐标 begin===========================================*/
		ctx.beginPath();
		ctx.save();
		ctx.strokeStyle = opts.vCoorColor;
		ctx.font = opts.scaleFontSize+"px 微软雅黑";
		ctx.drawLine(centerCoor2CanvasCoor(0,heightHalf),centerCoor2CanvasCoor(0,-heightHalf));

		//画箭头
		start = centerCoor2CanvasCoor(0,heightHalf);
		end = centerCoor2CanvasCoor(rightAngle,heightHalf - rightAngle);
		ctx.drawLine(start,end);
		end = centerCoor2CanvasCoor(-rightAngle,heightHalf - rightAngle);
		ctx.drawLine(start,end);
		ctx.stroke();

		//画刻度
		if(opts.showScale&&yUnitPixel/yUnitMince>0){
			var scale = 1;
			for(var i=0;i<heightHalf;i+=yUnitPixel/yUnitMince){
				if(i===0) continue;
				ctx.beginPath();
				//正轴方向
				ctx.drawLine(centerCoor2CanvasCoor(0,i),centerCoor2CanvasCoor(scaleLen,i));
				//负轴方向
				ctx.drawLine(centerCoor2CanvasCoor(0,-i),centerCoor2CanvasCoor(scaleLen,-i));
				ctx.stroke();

				//显示刻度文本
				if(scale%yUnitStep===0){
					//正轴方向
                    var value = pixel2value(i,yUnit);
                    scaleText = yUnitConvert(value)+yUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = centerCoor2CanvasCoor(-textWidth-4,i-opts.scaleFontSize*0.5);
					ctx.fillText(scaleText,textCoor.x,textCoor.y);

					//负轴方向
                    scaleText = yUnitConvert(-value)+yUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = centerCoor2CanvasCoor(-textWidth-4,-(i+opts.scaleFontSize*0.5));
					ctx.fillText(scaleText,textCoor.x,textCoor.y);
				}

				//画纵坐标上的网格
				if(opts.showGrid){
					ctx.save();
					ctx.strokeStyle = opts.gridColor;
					ctx.lineWidth = scale%yUnitStep===0?opts.gridLineWidth:opts.gridLineWidth*0.5;
					ctx.beginPath();
                    ctx.drawLine(centerCoor2CanvasCoor(-widthHalf,i),centerCoor2CanvasCoor(widthHalf,i));
                    ctx.drawLine(centerCoor2CanvasCoor(-widthHalf,-i),centerCoor2CanvasCoor(widthHalf,-i));
					ctx.stroke();
					ctx.restore();
				}
				scale++;
			}
		}

		ctx.restore();
		/*=========================画纵坐标 begin===========================================*/

		//画x0y这3个字符
		ctx.save();
		ctx.font = opts.x0yFontSize+"px 微软雅黑";
		scaleText = "x";
		textWidth=ctx.measureText(scaleText).width;
		textCoor = centerCoor2CanvasCoor(widthHalf-textWidth*1.3,0-opts.x0yFontSize*1.2);
		ctx.fillText(scaleText,textCoor.x,textCoor.y);
		scaleText = "y";
		textWidth=ctx.measureText(scaleText).width;
		textCoor = centerCoor2CanvasCoor(0-textWidth*1.8,heightHalf-opts.x0yFontSize);
		ctx.fillText(scaleText,textCoor.x,textCoor.y);

		scaleText = "0";
		textCoor = centerCoor2CanvasCoor(5,0-opts.x0yFontSize*1.2);
		ctx.fillText(scaleText,textCoor.x,textCoor.y);
		ctx.restore();
	};

	/**
	 * 画坐标轴
	 */
	var drawCoor = function (refresh=false) {
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
	var cacheFun = function (ctx,anim=false,clear = false,isParse = false) {

		if(clear){
			//清除画布
			ctx.clearRect(0,0,opts.width,opts.height);
		}

		var fun = opts.fun;
		//x坐标从0处开始，分别向正轴和负轴绘制函数图像
		var i = 0;

        var xUnitConvert = opts.xUnit.convert;
        var yUnitConvert = opts.yUnit.convert;

		/*根据x坐标绘制一小段线段*/
		var drawLine = function (x) {
			var xValue = pixel2value(x,opts.xUnit);
			if(!opts.domain(xUnitConvert(xValue))) return;

            var y = value2pixel(fun(xValue),opts.yUnit);
            if(!opts.range(yUnitConvert(pixel2value(y,opts.yUnit)))) return;
			var start = centerCoor2CanvasCoor(x,y);
            if(i<opts.width*0.5){
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
				if(i>=opts.width*0.5) return;
				setTimeout(animation,0);
				//画x正轴部分
				drawLine(i);
				//画x负轴部分
				drawLine(-i);
				i++;
			};
			animation();
		}else{
			ctx.strokeStyle = opts.color;
			for(;i<opts.width*0.5;i++){
				//画x正轴部分
				drawLine(i);
				//画x负轴部分
				drawLine(-i);
			}
		}

		//标记点
        var points = opts.points||[];
        for(var i=0;i<points.length;i++){
            var p = points[i];
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
    var drawFun = function (refresh=false,anim=false) {
        if(refresh) cacheFun(funCtx,anim,true);//更新缓存的坐标
        ctx.drawImage(funCanvas,0,0,opts.width,opts.height);
    };

	var show = function () {
		drawCoor();
		cacheFun(ctx,opts.animation);
    };

	/**
	 * 标记点
	 */
	var markPoint = function (ctx,p) {
		var heightHalf = opts.height*0.5;
		var widthHalf = opts.width*0.5;

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
        if(y>-heightHalf||y<heightHalf){
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
        if(y>heightHalf - 20){
            autoY = heightHalf - 20;
        }
        if(y<-heightHalf){
        	autoY = -heightHalf;
		}
		var autoX = x;
        //若x坐标加上文本的宽度超出了边缘，那么重新调整x坐标
        if(x + coorTextWidth>widthHalf-10){
        	autoX = widthHalf - coorTextWidth-10;
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

    /**
	 * 添加鼠标移动事件，然后根据鼠标的x坐标来描点
     */
	canvas.addEventListener("mousemove",function (e) {
		//若鼠标未按下，就不标记点！
		if(!isMouseDown) return;
		drawCoor();
		drawFun();
		//计算出x坐标
		var x = pixel2value(e.offsetX - opts.width*0.5,opts.xUnit);
		//标记点
		markPoint(ctx,{x:x});
    });
	canvas.addEventListener("mousedown",function (e) {
		isMouseDown = true;
        drawCoor();
        drawFun();
        //计算出x坐标
        var x = pixel2value(e.offsetX - opts.width*0.5,opts.xUnit);
        //标记点
        markPoint(ctx,{x:x});
    });
	canvas.addEventListener("mouseup",function () {
		isMouseDown = false;
        drawCoor();
        drawFun();
    });
	setCanvasWH();
	cacheCoor(coorCtx);
    cacheFun(funCtx,false,false,true);
    show();
}