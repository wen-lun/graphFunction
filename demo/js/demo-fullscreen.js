"use strict";
/**
 * Created by VULCAN on 2018/2/4.
 */
(function () {
    var w = window.innerWidth;
    var h = window.innerHeight - 3;
    var gf = new GraphFunction({
        canvas: document.getElementById("canvas"),
        width: w,
        height: h,
        animation: false,
        xUnit: {
            pixel: 50,
            value: 1,
            mince: 5,
            showScale: function (value) { return value % 1 == 0; },
            convert: function (value) { return value; },
            parse: function (value) { return value; },
            suffix: "",
        },
        yUnit: {
            pixel: 50,
            mince: 5,
            showScale: function (value) { return value % 1 == 0; },
            value: 1,
        },
        fun: function (x) { return x; },
    });
    //描点 or 拖拽
    document.getElementById("mode").addEventListener("change", function () {
        gf.openDrag(this.value == "1");
    });
    //样式
    document.getElementById("theme").addEventListener("change", function () {
        gf.setTheme(this.value);
    });
    //函数选择
    document.getElementById("fun").addEventListener("change", function () {
        var opts = {};
        switch (this.value * 1) {
            case 0:
                opts = {
                    xUnit: {
                        pixel: 50,
                        value: 1,
                        mince: 5,
                        showScale: function (value) { return value % 1 == 0; },
                        convert: function (value) { return value; },
                        parse: function (value) { return value; },
                        suffix: "",
                    },
                    yUnit: {
                        pixel: 50,
                        mince: 5,
                        showScale: function (value) { return value % 1 == 0; },
                        value: 1,
                    },
                    fun: function (x) { return x; },
                    domain: function (x) { return true; }
                };
                break;
            case 1:
                opts = {
                    xUnit: {
                        pixel: 50,
                        value: 1,
                        mince: 5,
                        showScale: function (value) { return value % 1 == 0; },
                        convert: function (value) { return value; },
                        parse: function (value) { return value; },
                        suffix: "",
                    },
                    yUnit: {
                        pixel: 50,
                        mince: 5,
                        showScale: function (value) { return value % 1 == 0; },
                        value: 1,
                    },
                    fun: function (x) { return x * x; },
                    domain: function (x) { return true; }
                };
                break;
            case 2:
                opts = {
                    xUnit: {
                        pixel: 50,
                        value: 1,
                        mince: 5,
                        showScale: function (value) { return value % 1 == 0; },
                        convert: function (value) { return value; },
                        parse: function (value) { return value; },
                        suffix: "",
                    },
                    yUnit: {
                        pixel: 50,
                        mince: 5,
                        showScale: function (value) { return value % 1 == 0; },
                        value: 1,
                    },
                    fun: function (x) { return 1 / x; },
                    domain: function (x) { return x != 0; }
                };
                break;
            case 3:
                opts = {
                    xUnit: {
                        pixel: 100,
                        value: Math.PI,
                        mince: 4,
                        showScale: function (value) { return value % 1 == 0; },
                        convert: function (value) { return (value / Math.PI).toFixed(2); },
                        parse: function (value) { return value * Math.PI; },
                        suffix: "π",
                    },
                    yUnit: {
                        pixel: 200,
                        mince: 2,
                        showScale: function (value) { return value % 1 == 0; },
                        value: 1,
                    },
                    fun: function (x) { return Math.sin(x); },
                    domain: function (x) { return true; }
                };
                break;
            case 4:
                opts = {
                    xUnit: {
                        pixel: 100,
                        value: Math.PI,
                        mince: 4,
                        showScale: function (value) { return value % 1 == 0; },
                        convert: function (value) { return (value / Math.PI).toFixed(2); },
                        parse: function (value) { return value * Math.PI; },
                        suffix: "π",
                    },
                    yUnit: {
                        pixel: 200,
                        mince: 2,
                        showScale: function (value) { return value % 1 == 0; },
                        value: 1,
                    },
                    fun: function (x) { return Math.cos(x); },
                    domain: function (x) { return true; }
                };
                break;
        }
        gf.reload(opts);
    });
    window.addEventListener("resize", function () {
        w = window.innerWidth;
        h = window.innerHeight - 3;
        gf.invalidate({ width: w, height: h });
    });
})();
