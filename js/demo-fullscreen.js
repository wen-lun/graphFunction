/**
 * Created by VULCAN on 2018/2/4.
 */

(function () {
    var w = window.innerWidth;
    var h = window.innerHeight-3;
    var gf = new GraphFunction({
        canvas:document.getElementById("canvas"),
        width:w,
        height:h,
        animation:true,
        xUnit:{
            pixel:100,
            value:Math.PI,
            mince:4,
            showScale:value=>value%1==0,//只有当刻度的值能整除1才显示
            convert:value=>(value/Math.PI).toFixed(2),
            parse:value=>value*Math.PI,
            suffix:"π",
        },
        yUnit:{
            pixel:200,
            mince:2,
            showScale:value=>value%1==0,//只有当刻度的值能整除1才显示
            value:1,
        },
        points:[{x:2}],
        fun:x=>Math.sin(x),
        // domain:x=>x>0.5
    });
    window.addEventListener("resize",function () { //监听浏览器尺寸变化
        w = window.innerWidth;
        h = window.innerHeight-3;
        gf.invalidate({width:w,height:h});
    });
})();

