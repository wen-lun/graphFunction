"use strict";
//正弦函数图像
new GraphFunction({
    canvas: document.getElementById("canvas1"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: Math.PI,
        showScale: function (value) { return value % 0.5 == 0; },
        mince: 4,
        convert: function (value) { return (value / Math.PI).toFixed(2); },
        parse: function (value) { return value * Math.PI; },
        suffix: "π" //单位后缀
    },
    yUnit: {
        pixel: 200,
        mince: 12,
        showScale: function (value) { return value % 0.25 == 0; },
        value: 1,
    },
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{ x: 1, showDotted: false }],
    color: "purple",
    vCoorColor: "red",
    hCoorColor: "blue",
    fun: function (x) { return Math.sin(x); },
    domain: function (x) { return x > -2; },
    range: function (y) { return y >= -0.9 && y < 0.9; } //值域
});
//余弦函数图像
new GraphFunction({
    canvas: document.getElementById("canvas2"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: Math.PI,
        showScale: function (value) { return value % 0.5 == 0; },
        mince: 4,
        convert: function (value) { return (value / Math.PI).toFixed(2); },
        parse: function (value) { return value * Math.PI; },
        suffix: "π"
    },
    yUnit: {
        pixel: 200,
        mince: 12,
        showScale: function (value) { return value % 0.25 == 0; },
        value: 1,
    },
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{ x: 1, mark: 'P1' }],
    color: "purple",
    vCoorColor: "red",
    hCoorColor: "blue",
    fun: function (x) { return Math.cos(x); },
});
//反比例函数图像
new GraphFunction({
    canvas: document.getElementById("canvas3"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: 1,
        mince: 4,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    yUnit: {
        pixel: 100,
        value: 1,
        mince: 4,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    color: "white",
    vCoorColor: "#ddd",
    hCoorColor: "#ddd",
    backgroundColor: "#233",
    coorTextColor: "white",
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{ x: 1 }, { x: 0.5 }, { x: 2.5 }, { x: -1 }, { x: -0.5, showDotted: false }, { x: -3, y: -4 }],
    markPointColor: "white",
    fun: function (x) { return 1 / x; },
    domain: function (x) { return x !== 0; },
});
//二次函数图像
new GraphFunction({
    canvas: document.getElementById("canvas4"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: 1,
        mince: 5,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    yUnit: {
        pixel: 50,
        value: 1,
        mince: 5,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    color: "brown",
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{ x: 0 }, { x: 2 }, { x: -1 }, { x: -0.5, showDotted: false }, { x: -3, y: -4 }],
    fun: function (x) { return x * x; },
});
//指数函数图像
new GraphFunction({
    canvas: document.getElementById("canvas5"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: 1,
        mince: 10,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    yUnit: {
        pixel: 50,
        value: 1,
        mince: 10,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    color: "brown",
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{ x: -1 }, { x: 0 }, { x: 2 }, { x: 1.5 }],
    fun: function (x) { return Math.pow(2, x); },
});
//对数函数图像
new GraphFunction({
    canvas: document.getElementById("canvas6"),
    width: 600,
    height: 500,
    xUnit: {
        pixel: 100,
        value: 1,
        mince: 10,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    yUnit: {
        pixel: 100,
        value: 1,
        mince: 10,
        showScale: function (value) { return value % 0.5 == 0; },
    },
    color: "brown",
    //标记点,若不指定y,那么y系统自动根据函数计算，默认显示虚线，默认点符号为“P”
    points: [{ x: 1 }, { x: 0 }, { x: 2 }, { x: 1.5 }],
    fun: function (x) { return Math.log2(x); },
    domain: function (x) { return x > 0; }
});
