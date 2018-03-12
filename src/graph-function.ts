/**单位 */
interface Unit {
	pixel?: number //一个单位有多少像素
	value?: number //单位值
	mince?: number //将一个单位细分为多少，值越大，精度越高，默认为1，即不细分
	showScale?: (value: number) => boolean //显示刻度值的条件
	convert?: (value: number) => number //单位转换
	parse?: (value: number) => number //单位逆转换
	suffix?: string //单位后缀
}

interface Point {
	x: number
	y: number
}

interface MarkPoint{
	x: number
	y?: number
	showDotted?: boolean
	mark?: string
}

/**参数 */
interface Options {
	canvas?: HTMLCanvasElement
	width?: number
	height?: number
	backgroundColor?: string //背景色
	animation?: boolean //是否显示动画
	xUnit?: Unit //x轴单位
	yUnit?: Unit //y轴单位
	showScale?: boolean //是否显示刻度
	scaleLen?: number //刻度长度
	scaleFontSize?: number //刻度字体大小
	coorTextColor?: string //坐标轴字体颜色
	x0yFontSize?: number //x、原点、y的字体大小
	color?: string //函数图像颜色
	hCoorColor?: string //横坐标颜色
	vCoorColor?: string //纵坐标颜色
	coorLineWidth?: number //坐标轴线宽
	coorArrowLen?: number //坐标轴箭头长度
	showGrid?: boolean //是否显示网格
	gridColor?: string //网格颜色
	gridLineWidth?: number //网格线宽，如果x、y坐标步长(step)大于1，那么步长之内的线宽为一半
	points?: Array<MarkPoint> //要标记的点,格式:{x:x,y:y,showDotted:true|false,mark:'P'} 若不提供y,则系统自动根据函数计算y,默认显示虚线
	markPointLineWidth?: number //描点的虚线线宽
	markPointRadius?: number //描点 点的半径
	markPointColor?: string //描点颜色
	markPointFontSize?: number
	centerX?: number | null //坐标轴中心点x坐标,坐标系为画布坐标系
	centerY?: number | null //坐标轴中心点y坐标,坐标系为画布坐标系
	domain?: (x: number) => boolean //定义域，如果x!=0,函数返回x!=0即可
	range?: (y: number) => boolean //值域
	fun?: (x: number) => number //要绘制的函数
}

interface CanvasRenderingContext2D {
	drawLine(start: Point, end: Point): any
}

CanvasRenderingContext2D.prototype.drawLine = function (start: Point, end: Point) {
	this.moveTo(start.x, start.y);
	this.lineTo(end.x, end.y);
};

class GraphFunction {

	private opts: Options = {
		width: 600,
		height: 400,
		backgroundColor: "white",//背景色
		animation: true,//是否显示动画
		xUnit: { //x轴单位
			pixel: 100,//一个单位有多少像素
			value: 1,//单位值
			mince: 1,//将一个单位细分为多少，值越大，精度越高，默认为1，即不细分
			showScale: value => true, //显示刻度值的条件
			convert: value => value, //单位转换
			parse: value => value, //单位逆转换
			suffix: "",//单位后缀
		},
		yUnit: { //y轴单位
			pixel: 100,//一个单位有多少像素
			value: 1,//单位值
			mince: 1,
			showScale: value => true, //显示刻度值的条件
			convert: value => value, //单位转换
			parse: value => value, //单位逆转换
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
		centerX: null,//坐标轴中心点x坐标,坐标系为画布坐标系
		centerY: null,//坐标轴中心点y坐标,坐标系为画布坐标系
		//定义域，如果x!=0,函数返回x!=0即可
		domain: function (x: number) {
			return true;
		},
		//值域
		range: function (y: number) {
			return true;
		},
		//要绘制的函数
		fun: function (x: number) {
			return x;
		}
	};


	private canvas: HTMLCanvasElement = null as any;
	private isMouseDown: boolean = false;//记录鼠标是否按下

	private ctx: CanvasRenderingContext2D = null as any;
	//用来缓存坐标轴
	private coorCanvas: HTMLCanvasElement = document.createElement("canvas");
	private coorCtx: CanvasRenderingContext2D = this.coorCanvas.getContext("2d") as CanvasRenderingContext2D;

	//用来缓存函数曲线及标记点
	private funCanvas = document.createElement("canvas");
	private funCtx = this.funCanvas.getContext("2d");

	//拖拽坐标系相关
	private beginDrag = false;//标记是否要开始拖拽
	private isDrag = false;//标记是否正在拖拽
	private startOffset:{x:number,y:number}|null = null;//记录上一次拖拽的位置
	private cx: number = null as any;
	private cy: number = null as any;

	//坐标轴中心点的位置
	private centerPos = { x: 0, y: 0 };

	constructor(options: Options) {
		options.xUnit = { ...this.opts.xUnit, ...options.xUnit };
		options.yUnit = { ...this.opts.yUnit, ...options.yUnit };
		this.opts = { ...this.opts, ...options };

		if (!options.canvas || !(options.canvas instanceof HTMLCanvasElement)) {
			throw new Error("options.canvas is not canvas!");
		}
		this.canvas = options.canvas;
		this.canvas.style.cursor = "pointer";
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

		this.eventListener();
		this.setCanvasWH();
		this.cacheCoor(this.coorCtx);
		this.cacheFun(this.funCtx as CanvasRenderingContext2D,false,false,true);
		this.show();
	}

	/** 设置坐标轴中心点的坐标，坐标系为画布坐标系 */
	private setCenterPos(x: number, y: number) {
		this.centerPos.x = x;
		this.centerPos.y = y;
	};

	/** 设置画布的宽高 */
	private setCanvasWH() {
		let { canvas, opts, coorCanvas, funCanvas, cx, cy } = this;
		if (!opts.width) throw new Error("opts.width is undefined!");
		if (!opts.height) throw new Error("opts.height is undefined!");

		canvas.width = opts.width;
		canvas.height = opts.height;
		canvas.style.width = opts.width + "px";
		canvas.style.height = opts.height + "px";
		coorCanvas.width = opts.width;
		coorCanvas.height = opts.height;
		funCanvas.width = opts.width;
		funCanvas.height = opts.height;

		//如果没有指定，默认将坐标轴的中心位置放到画布的中心
		let centerX = cx || (opts.width) * 0.5;
		let centerY = cy || (opts.height) * 0.5;
		if (opts.centerX != null) {
			centerX = opts.centerX;
		}
		if (opts.centerY != null) {
			centerY = opts.centerY;
		}
		this.setCenterPos(centerX, centerY);
	};

	/** 中心坐标转画布坐标 */
	private centerCoor2CanvasCoor(x0: number, y0: number): { x: number, y: number } {
		let { centerPos } = this;
		let x = centerPos.x + x0;
		let y = -y0 + centerPos.y;
		return { x: x, y: y };
	};

	/** 像素转换为值 */
	private static pixel2value(pixel: number, unit: Unit) {
		let unitValue = unit.value || 1;
		if (!unit.pixel) throw new Error("unit.pixel is undefined!");
		return ((pixel / unit.pixel) * unitValue).toFixed(2) as any * 1;
	};

	/** 值转换为像素 */
	private static value2pixel(value: number, unit: Unit) {
		let unitValue = unit.value || 1;
		if (!unit.pixel) throw new Error("unit.pixel is undefined!");
		return (value / unitValue) * unit.pixel;
	};

	/** 缓存坐标轴 */
	private cacheCoor(ctx: CanvasRenderingContext2D) {
		let { opts, centerPos } = this;

		if (!opts.width) throw new Error("opts.width is undefined!");
		if (!opts.height) throw new Error("opts.height is undefined!");
		if (!opts.scaleFontSize) throw new Error("opts.scaleFontSize is undefined!");
		if (!opts.gridLineWidth) throw new Error("opts.gridLineWidth is undefined!");
		if (!opts.x0yFontSize) throw new Error("opts.x0yFontSize is undefined!");

		//清除画布
		ctx.clearRect(0, 0, opts.width, opts.height);
		ctx.save();
		ctx.fillStyle = opts.backgroundColor as string;
		ctx.fillRect(0, 0, opts.width, opts.height);
		ctx.restore();

		let leftWidth = centerPos.x;//左半边的宽
		let rightWidth = opts.width - centerPos.x;//右半边的宽
		let xStart = -leftWidth;//x坐标轴开始处位置
		let xEnd = rightWidth;//x坐标轴结束处位置

		let aboveHeight = centerPos.y;//上半边的高
		let belowHeight = opts.height - centerPos.y;//下半边的高
		let yStart = aboveHeight;//y坐标轴开始处位置
		let yEnd = -belowHeight;//y坐标轴结束处位置

		let arrowLen = opts.coorArrowLen as number;
		let scaleLen = opts.scaleLen || 12;
		let xUnit = opts.xUnit as Unit;
		let yUnit = opts.yUnit as Unit;
		if (!xUnit.showScale) throw new Error("xUnit.showScale is undefined!");
		if (!yUnit.showScale) throw new Error("yUnit.showScale is undefined!");
		let xUnitPixel = xUnit.pixel;
		let yUnitPixel = yUnit.pixel;
		if (!xUnitPixel || !yUnitPixel) throw new Error("xUnit.pixel is undefined!");
		let xUnitConvert = xUnit.convert;
		let yUnitConvert = yUnit.convert;
		if (!xUnitConvert) throw new Error("xUnit.convert is undefined!");
		if (!yUnitConvert) throw new Error("yUnit.convert is undefined!");
		let xUnitMince = xUnit.mince;
		let yUnitMince = yUnit.mince;
		if (!xUnitMince || !yUnitMince) throw new Error("yUnit.mince is undefined!");
		let xUnitSuffix = xUnit.suffix;
		let yUnitSuffix = yUnit.suffix;
		if (!xUnitSuffix) throw new Error("xUnit.suffix is undefined!");
		if (!yUnitSuffix) throw new Error("yUnit.suffix is undefined!");

		let start = null, end = null;
		//已知箭头长度，算出箭头直角边的长度
		let rightAngle = arrowLen * Math.sin(Math.PI / 4);
		/*=========================画横坐标 begin===========================================*/
		ctx.beginPath();
		ctx.lineWidth = opts.coorLineWidth as number;
		ctx.fillStyle = opts.coorTextColor as string;
		ctx.save();
		ctx.strokeStyle = opts.hCoorColor as string;
		ctx.font = opts.scaleFontSize + "px 微软雅黑";

		//绘制横坐标轴时，横坐标的y坐标,刻度值及刻度线的y坐标也是这个
		let y = 0;
		//如果横坐标要超出屏幕上边了，就让它停在上边
		if (yStart - 10 < 0) {
			y = yStart - 10;
			//如果横坐标要超出屏幕下边了，就让它停在下边
		} else if (yEnd + 22 > 0) {
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

		let scaleText = null;
		let textWidth = null;
		let textCoor = null;

		//画刻度
		if (opts.showScale && xUnitPixel / xUnitMince > 0) {
			//用来累加像素值，看是否超过了屏幕画布宽度
			let sum = 0;
			let unit = (xUnitPixel / xUnitMince);//单位元
			let count = Math.floor(leftWidth / unit);//小数部分需要抛弃
			//计算起点刻度
			let xStartScale = -count * unit;
			for (let i = xStartScale; sum < opts.width; i += xUnitPixel / xUnitMince) {
				if (i === 0) continue;
				sum += (xUnitPixel / xUnitMince);
				//画刻度线
				ctx.beginPath();
				ctx.drawLine(this.centerCoor2CanvasCoor(i, y), this.centerCoor2CanvasCoor(i, scaleLen + y));
				ctx.stroke();

				//显示刻度文本
				let value = GraphFunction.pixel2value(i, xUnit);
				if (xUnit.showScale(xUnitConvert(value))) {//如果要显示刻度值，才显示
					scaleText = xUnitConvert(value) + xUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = this.centerCoor2CanvasCoor(i - textWidth * 0.5, -opts.scaleFontSize + y);
					ctx.fillText(scaleText, textCoor.x, textCoor.y);
				}

				//画横坐标上的网格
				if (opts.showGrid) {
					ctx.save();
					ctx.strokeStyle = opts.gridColor as string;
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
		ctx.strokeStyle = opts.vCoorColor as string;
		ctx.font = opts.scaleFontSize + "px 微软雅黑";

		//绘制纵坐标轴时，纵坐标的x坐标,刻度值及刻度线的x坐标也是这个
		let x = 0;
		//如果纵坐标要超出屏幕左边了，就让它停在左边
		if (xStart + 22 > 0) {
			x = xStart + 22;
			//如果纵坐标要超出屏幕右了，就让它停在右边
		} else if (xEnd - 10 < 0) {
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
			let sum = 0;
			let unit = (yUnitPixel / yUnitMince);//单位元
			let count = Math.floor(belowHeight / unit);//小数部分需要抛弃
			//计算起点刻度
			let yStartScale = -count * unit;
			for (let i = yStartScale; sum < opts.height; i += yUnitPixel / yUnitMince) {
				if (i === 0) continue;
				sum += (yUnitPixel / yUnitMince);
				ctx.beginPath();
				ctx.drawLine(this.centerCoor2CanvasCoor(x, i), this.centerCoor2CanvasCoor(scaleLen + x, i));
				ctx.stroke();

				//显示刻度文本
				let value = GraphFunction.pixel2value(i, yUnit);
				if (yUnit.showScale(yUnitConvert(value))) {
					scaleText = yUnitConvert(value) + yUnitSuffix;
					textWidth = ctx.measureText(scaleText).width;
					textCoor = this.centerCoor2CanvasCoor(-textWidth - 4 + x, i - opts.scaleFontSize * 0.5);
					ctx.fillText(scaleText, textCoor.x, textCoor.y);
				}

				//画纵坐标上的网格
				if (opts.showGrid) {
					ctx.save();
					ctx.strokeStyle = opts.gridColor as string;
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

	/** 画坐标轴 */
	private drawCoor(refresh: boolean = false) {
		let { coorCtx, ctx, coorCanvas, opts } = this;
		if (refresh) this.cacheCoor(coorCtx);//更新缓存的坐标
		ctx.drawImage(coorCanvas, 0, 0, opts.width as number, opts.height as number);
	};

	/**
     * 缓存函数曲线
     * @param ctx
     * @param anim
     * @param clear
     * @param isParse
     */
	private cacheFun(ctx:CanvasRenderingContext2D,anim = false,clear = false,isParse = false) {
		let {opts,centerPos} = this;
		if (!opts.width) throw new Error("opts.width is undefined!");
		if (!opts.height) throw new Error("opts.height is undefined!");
		if (!opts.xUnit) throw new Error("opts.xUnit is undefined!");
		if (!opts.yUnit) throw new Error("opts.yUnit is undefined!");
		if (!opts.domain) throw new Error("opts.domain is undefined!");
		if (!opts.fun) throw new Error("opts.fun is undefined!");
		if (!opts.range) throw new Error("opts.range is undefined!");

		if(clear){
			//清除画布
			ctx.clearRect(0,0,opts.width,opts.height);
		}

		let fun = opts.fun;
		let domain = opts.domain;
		let range = opts.range;
		//x坐标从0处开始，分别向正轴和负轴绘制函数图像
		let i = -centerPos.x;
		let sum = 0;

        let xUnitConvert = opts.xUnit.convert as any;
        let yUnitConvert = opts.yUnit.convert as any;

		/*根据x坐标绘制一小段线段*/
		let drawLine = (x:number,xValue:number)=>{
			if(!domain(xUnitConvert(xValue))) return;

            let y = GraphFunction.value2pixel(fun(xValue),opts.yUnit as Unit);
            if(!range(yUnitConvert(GraphFunction.pixel2value(y,opts.yUnit as Unit)))) return;
			let start = this.centerCoor2CanvasCoor(x,y);
            if(sum<(opts.width as number)){
                let xValue = GraphFunction.pixel2value(x+1,opts.xUnit as Unit);
				y = GraphFunction.value2pixel(fun(xValue),opts.yUnit as Unit);
				let end = this.centerCoor2CanvasCoor(x+1,y);
				ctx.beginPath();
				ctx.drawLine(start,end);
				ctx.stroke();
			}
		};

		if(anim){
			let animation = () => {
				ctx.strokeStyle = opts.color as string;
				if(sum>(opts.width as number)) return;
                let xValue = GraphFunction.pixel2value(i,opts.xUnit as Unit);
                while(!domain(xUnitConvert(xValue))) {
                    i++;
                    sum++;
                    xValue = GraphFunction.pixel2value(i,opts.xUnit as Unit);
                    if(sum>(opts.width as number)) {
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
			ctx.strokeStyle = opts.color as string;
			for(;sum<opts.width;i++){
                let xValue = GraphFunction.pixel2value(i,opts.xUnit);
				drawLine(i,xValue);
				sum++;
            }
		}

		//标记点
        let points = opts.points||[];
        for(let j=0;j<points.length;j++){
            let p = points[j];
            if(isParse){
				let xUnitParse = opts.xUnit.parse;
				let yUnitParse = opts.yUnit.parse;
				if(!xUnitParse) throw new Error("xUnit.parse is undefined!");
				if(!yUnitParse) throw new Error("yUnit.parse is undefined!");
				p.x = xUnitParse(p.x);
				if(p.y) yUnitParse(p.y);
			}
			this.markPoint(ctx,p);
        }
	};

    /**
     * 画函数曲线
     */
    private drawFun(refresh=false,anim=false) {
		let {funCtx,opts,ctx,funCanvas} = this;
        if(refresh) this.cacheFun(funCtx as CanvasRenderingContext2D,anim,true);//更新缓存的坐标
        ctx.drawImage(funCanvas,0,0,opts.width as number,opts.height as number);
	};
	
	/**重新缓存坐标轴和函数曲线 */
    private reCache(){
		let {coorCtx,funCtx} = this;
        this.cacheCoor(coorCtx);
        this.cacheFun(funCtx as CanvasRenderingContext2D,false,true);
    };

	private show() {
		this.drawCoor();
		this.cacheFun(this.ctx as CanvasRenderingContext2D,this.opts.animation);
    };

	/** 标记点 */
	private markPoint(ctx:CanvasRenderingContext2D,p:MarkPoint) {
		let {centerPos,opts} = this;
		if (!opts.width) throw new Error("opts.width is undefined!");
		if (!opts.height) throw new Error("opts.height is undefined!");
		if (!opts.xUnit) throw new Error("opts.xUnit is undefined!");
		if (!opts.yUnit) throw new Error("opts.yUnit is undefined!");
		if (!opts.domain) throw new Error("opts.domain is undefined!");
		if (!opts.fun) throw new Error("opts.fun is undefined!");
		if (!opts.range) throw new Error("opts.range is undefined!");

        let topMax = centerPos.y;//上边的边界
        let bottomMax = centerPos.y - opts.height;//下边的边界
        let rightMax = opts.width - centerPos.x;//右边的边界

        let xUnitConvert = opts.xUnit.convert as any;
        let yUnitConvert = opts.yUnit.convert as any;

        //若x不在定义域内，返回
        if (p.x === undefined||!opts.domain(xUnitConvert(p.x))) return;
        //先把坐标值转换为像素值
        let x = GraphFunction.value2pixel(p.x, opts.xUnit);
		p.y = p.y as any || opts.fun(p.x).toFixed(2);
        //若y不在值域内，返回
        if (!opts.range(yUnitConvert(p.y))) return;

        if (p.y == 0) p.y = 0;//保留小数位后，如果y为0.00，就赋值为0
        if (p.y as number - Math.floor(p.y as number) == 0) p.y = Math.floor(p.y as number);//如果y的小数部分为0，那么就抛弃小数部分
        p.mark = p.mark || "P";
        let y = GraphFunction.value2pixel(p.y as number, opts.yUnit);
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = opts.markPointColor as string;
        ctx.lineWidth = opts.markPointLineWidth as number;
        ctx.fillStyle = opts.markPointColor as string;
        ctx.font = opts.markPointFontSize + "px 微软雅黑";
        ctx.setLineDash([3, 3]);


        let coor = this.centerCoor2CanvasCoor(x, y);
        if (p.showDotted === undefined || p.showDotted !== false) {
            ctx.drawLine(this.centerCoor2CanvasCoor(0, y), coor);
            ctx.drawLine(this.centerCoor2CanvasCoor(x, 0), coor);
        }
        ctx.stroke();

        //y的值没有超出画布高度，才有必要花点
        if(y>bottomMax&&y<topMax){
			ctx.beginPath();
			ctx.arc(coor.x, coor.y, opts.markPointRadius as number, 0, 2 * Math.PI);
			ctx.fill();
		}

        let xText = xUnitConvert(p.x) + opts.xUnit.suffix;
        let yText = yUnitConvert(p.y) + opts.yUnit.suffix;
        let coorText = p.mark + "( " + xText + "，" + yText + " )";
        let coorTextWidth = ctx.measureText(coorText).width;
        let autoY = y;
        //若y超出了画布高度，那么要把显示的坐标信息的y坐标固定到画布边缘
        if(y>topMax - 20){
            autoY = topMax - 20;
        }
        if(y<bottomMax){
        	autoY = bottomMax;
		}
		let autoX = x;
        //若x坐标加上文本的宽度超出了边缘，那么重新调整x坐标
        if(x + coorTextWidth>rightMax-10){
        	autoX = rightMax - coorTextWidth-10;
		}
        coor = this.centerCoor2CanvasCoor(autoX, autoY);
        ctx.fillText(coorText, coor.x + 5, coor.y - 5);
        ctx.restore();
	};

	/**事件绑定 */
	private eventListener(){
		let {beginDrag,isDrag,startOffset,isMouseDown,centerPos,opts,ctx} = this;
		window.addEventListener("mousemove",e=>{

			//开启了拖拽的话，就不标记点了
			if (beginDrag===true){
				if(!isDrag) return;
				if(!startOffset) throw new Error("startOffset is undefined!");
				var xd = e.offsetX - startOffset.x;
				var yd = e.offsetY - startOffset.y;
				this.cx+=xd;
				this.cy+=yd;

				this.setCenterPos(this.cx,this.cy);
				this.drawCoor(true);
				this.drawFun(true);
	
				startOffset = {x:e.offsetX,y:e.offsetY};
				return;
			}
	
			//若鼠标未按下，就不标记点！
			if(!isMouseDown) return;
			this.drawCoor();
			this.drawFun();
			//计算出x坐标
			var x = GraphFunction.pixel2value(e.offsetX - centerPos.x,opts.xUnit as Unit);
			//标记点
			this.markPoint(ctx,{x:x});
		});
	
		window.addEventListener("mousedown",e=>{
	
			this.drawCoor();
			this.drawFun();
			//开启了拖拽的话，就不标记点了
			if (beginDrag===true){
				isDrag = true;
				startOffset = {x:e.offsetX,y:e.offsetY};
				return;
			}
	
			isMouseDown = true;
			//计算出x坐标
			var x = GraphFunction.pixel2value(e.offsetX - centerPos.x,this.opts.xUnit as Unit);
			//标记点
			this.markPoint(ctx,{x:x});
		});
	
		window.addEventListener("mouseup",e=>{
			isDrag = false;
			isMouseDown = false;
			this.drawCoor();
			this.drawFun();
		});
	}

	/** 根据新的options重绘 */
	public invalidate(options:Options) {
		options.xUnit = { ...this.opts.xUnit, ...options.xUnit };
		options.yUnit = { ...this.opts.yUnit, ...options.yUnit };
		this.opts = { ...this.opts, ...options };
		this.setCanvasWH();
		this.drawCoor(true);
		this.drawFun(true);
    };

	/** 打开拖拽坐标系*/
	public openDrag(isOpen=true) {
		let {centerPos,canvas} = this;
	    if(isOpen){
	        this.cx = centerPos.x;
	        this.cy = centerPos.y;
            canvas.style.cursor = "move";
        }else{
	        this.cx = null as any;
	        this.cy = null as any;
            canvas.style.cursor = "pointer";
        }
        this.beginDrag = isOpen;
	};
	
	/** 设置样式主题 */
	public setTheme(theme:"light"|"dark") {
		let {opts} = this;
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
        this.reCache();
    };

    /**重新加载一段options来显示函数曲线 */
    public reload(options:Options){
		let {opts} = this;
        options.xUnit = Object.assign({},opts.xUnit,options.xUnit);
	    options.yUnit = Object.assign({},opts.yUnit,options.yUnit);
        opts = Object.assign({},opts,options);
        this.reCache();
    };


}