/**
 * Created by VULCAN on 2018/2/3.
 */

//正弦函数图像
new GraphFunction({
    canvas: document.getElementById("canvas1"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,//表示一个单位有100个像素,默认值100
        value: Math.PI,//表示一个单位的值为一个π,默认为1
        showScale:value=>value%0.5==0, //显示刻度值的条件
        mince:4,//将一个单位细分为4份，值越大，精度越高，默认为1，即不细分
        convert:value=>(value/Math.PI).toFixed(2),//转换单位显示的格式，这里将单位转换为 π的倍数 的格式
        parse:value=>value*Math.PI,//单位逆转换,作用是在标记点时，转换单位
        suffix:"π"//单位后缀
    },
    yUnit: {
        pixel: 200,
        mince:12,
        showScale:value=>value%0.25==0,
        value:1,
    },
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [ {x: 1,showDotted: false}],
    color: "purple",//函数曲线颜色，默认黑色
    vCoorColor: "red",//纵坐标颜色，默认黑色
    hCoorColor: "blue",//横坐标颜色，默认黑色
    fun: x => Math.sin(x),//要绘制的函数表达式：y = sin(x)，默认函数为y = x
    domain:x=>x>-2,//定义域
    range:y=>y>=-0.9&&y<0.9//值域
});

//余弦函数图像
new GraphFunction({
    canvas: document.getElementById("canvas2"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,//表示一个单位有100个像素,默认值100
        value: Math.PI,//表示一个单位的值为一个π,默认为1
        showScale:value=>value%0.5==0,
        mince:4,//将一个单位细分为4份，值越大，精度越高，默认为1，即不细分
        convert:value=>(value/Math.PI).toFixed(2),//转换单位显示的格式，这里将单位转换为 π的倍数 的格式
        parse:value=>value*Math.PI,//单位逆转换,作用是在标记点时，转换单位
        suffix:"π"
    },
    yUnit: {
        pixel: 200,
        mince:12,
        showScale:value=>value%0.25==0,
        value:1,
    },
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{x: 1, mark: 'P1'}],
    color: "purple",//函数曲线颜色，默认黑色
    vCoorColor: "red",//纵坐标颜色，默认黑色
    hCoorColor: "blue",//横坐标颜色，默认黑色
    fun: x => Math.cos(x),//要绘制的函数表达式：y = cos(x)，默认函数为y = x
});

//反比例函数图像
new GraphFunction({
    canvas: document.getElementById("canvas3"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,//表示每50/10 = 5像素为一个单位，值越小，刻度越精细
        value: 1,//表示一个单位的值为1/10 = 0.1
        mince:4,
        showScale:value=>value%0.5==0,
    },
    yUnit: {
        pixel: 100,//表示每50/10 = 5像素为一个单位，值越小，刻度越精细
        value: 1,//表示一个单位的值为1/10 = 0.1
        mince:4,
        showScale:value=>value%0.5==0,
    },
    color: "white",//函数曲线颜色，默认黑色
    vCoorColor: "#ddd",//纵坐标颜色，默认黑色
    hCoorColor: "#ddd",//横坐标颜色，默认黑色
    backgroundColor: "#233",//背景色，默认白色
    coorTextColor: "white",//坐标轴的字体颜色
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{x: 1}, {x: 0.5}, {x: 2.5}, {x: -1}, {x: -0.5, showDotted: false}, {x: -3, y: -4}],
    markPointColor: "white",//标记点的颜色，包括虚线、原点及点坐标的文本颜色，默认棕色
    fun: x => 1 / x,//要绘制的函数表达式：y = 1/x ，默认函数为y = x
    domain: x => x !== 0,//要绘制函数的定义域
});

//二次函数图像
new GraphFunction({
    canvas: document.getElementById("canvas4"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: 1,
        mince:5,
        showScale:value=>value%0.5==0,
    },
    yUnit: {
        pixel: 50,
        value: 1,
        mince:5,
        showScale:value=>value%0.5==0,
    },
    color: "brown",//函数曲线颜色，默认黑色
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{x: 0}, {x:2}, {x: -1}, {x: -0.5, showDotted: false}, {x: -3, y: -4}],
    fun: x => x * x,//要绘制的函数表达式，默认函数为y = x
});

//指数函数图像
new GraphFunction({
    canvas: document.getElementById("canvas5"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: 1,
        mince:10,
        showScale:value=>value%0.5==0,
    },
    yUnit: {
        pixel: 50,
        value: 1,
        mince:10,
        showScale:value=>value%0.5==0,
    },
    color: "brown",//函数曲线颜色，默认黑色
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{x:-1},{x: 0},{x:2},{x:1.5}],
    fun: x => Math.pow(2,x),//要绘制的函数表达式：y=2^x，默认函数为y = x
});

//对数函数图像
new GraphFunction({
    canvas: document.getElementById("canvas6"),
    width: 600,
    height: 500,
    xStep: 1 / 50,//横坐标表示每50个像素为1
    yStep: 100,//纵坐标表示每50个像素为一个单位1
    xUnit: {
        pixel: 100,
        value: 1,
        mince:10,
        showScale:value=>value%0.5==0,
    },
    yUnit: {
        pixel: 100,
        value: 1,
        mince:10,
        showScale:value=>value%0.5==0,
    },
    color: "brown",//函数曲线颜色，默认黑色
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{x:1},{x: 0},{x:2},{x:1.5}],
    fun: x => Math.log2(x),//要绘制的函数表达式(如果底数为0.5,运用换底公式：y = Math.log(x)/Math.log(0.5))
    domain:x=>x>0
});