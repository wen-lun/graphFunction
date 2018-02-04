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
        xUnit:{
            pixel:100,
            value:Math.PI,
            mince:4,
            step:3,
            convert:value=>(value/Math.PI).toFixed(2),
            suffix:"π",
        },
        yUnit:{
            pixel:200,
            mince:3,
            value:1,
        },
        fun:x=>Math.sin(x),
        domain:x=>x>0.5
    });
    window.addEventListener("resize",function () { //监听浏览器尺寸变化
        w = window.innerWidth;
        h = window.innerHeight-3;
        gf.invalidate({width:w,height:h});
    });
})();

