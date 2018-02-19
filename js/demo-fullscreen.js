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
            showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
            convert: value => value,
            parse: value => value,
            suffix: "",
        },
        yUnit: {
            pixel: 50,
            mince: 5,
            showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
            value: 1,
        },
        fun: x => x,
    });

    //描点 or 拖拽
    document.getElementById("mode").addEventListener("change", function () {
        gf.openDrag(this.value == 1);
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
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        convert: value => value,
                        parse: value => value,
                        suffix: "",
                    },
                    yUnit: {
                        pixel: 50,
                        mince: 5,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        value: 1,
                    },
                    fun: x => x,
                    domain:x=>true
                }
                break;
            case 1:
                opts = {
                    xUnit: {
                        pixel: 50,
                        value: 1,
                        mince: 5,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        convert: value => value,
                        parse: value => value,
                        suffix: "",
                    },
                    yUnit: {
                        pixel: 50,
                        mince: 5,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        value: 1,
                    },
                    fun: x => x*x,
                    domain:x=>true
                }
                break;
            case 2:
                opts = {
                    xUnit: {
                        pixel: 50,
                        value: 1,
                        mince: 5,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        convert: value => value,
                        parse: value => value,
                        suffix: "",
                    },
                    yUnit: {
                        pixel: 50,
                        mince: 5,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        value: 1,
                    },
                    fun: x => 1/x,
                    domain:x=>x!=0
                }
                break;
            case 3:
                opts = {
                    xUnit: {
                        pixel: 100,
                        value: Math.PI,
                        mince: 4,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        convert: value => (value / Math.PI).toFixed(2),
                        parse: value => value * Math.PI,
                        suffix: "π",
                    },
                    yUnit: {
                        pixel: 200,
                        mince: 2,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        value: 1,
                    },
                    fun: x => Math.sin(x),
                    domain:x=>true
                }
                break;
            case 4:
                opts = {
                    xUnit: {
                        pixel: 100,
                        value: Math.PI,
                        mince: 4,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        convert: value => (value / Math.PI).toFixed(2),
                        parse: value => value * Math.PI,
                        suffix: "π",
                    },
                    yUnit: {
                        pixel: 200,
                        mince: 2,
                        showScale: value => value % 1 == 0,//只有当刻度的值能整除1才显示
                        value: 1,
                    },
                    fun: x => Math.cos(x),
                    domain:x=>true
                }
                break;
        }
        gf.reload(opts);
    });

    window.addEventListener("resize", function () { //监听浏览器尺寸变化
        w = window.innerWidth;
        h = window.innerHeight - 3;
        gf.invalidate({ width: w, height: h });
    });
})();

