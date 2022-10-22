const full = "abcdeghknopqsuvxyz-".split("")
const half = "fjrt".split("")
const quarter = "il '()".split("")
const fullHalf = ["m","w"]
const Cfull = "ABCDEFGHKLMNOPQRSTUVXYZ".split("")
const Chalf = "IJ".toUpperCase().split("")
const CfullHalf = ["W"]

var scrollInterval
var scrollIntervalen
var scrollIntervalen2
var isAlreadyLooping = false;
var isAlreadyLoopingen = false;

function getDuration(str,multiplyer){
    var duration = 0
    for(ichar of str){
        if(full.indexOf(ichar)!=-1){
            duration += 1
        }
        else if(half.indexOf(ichar)!=-1){
            duration += 0.5
        }
        else if(quarter.indexOf(ichar)!=-1){
            duration += 0.25
        }
        else if(Cfull.indexOf(ichar)!=-1){
            duration += 1
        }
        else if(Chalf.indexOf(ichar)!=-1){
            duration += 0.5
        }
        else{
            duration += 1.5
        }
    }
    return duration * multiplyer
}

function animate(ele,aName,aDura,aWidVarName,aWid,aDelay) {
    document.querySelector(':root').style.setProperty(aWidVarName,aWid)

    document.getElementById(ele).style.animationName = aName
    document.getElementById(ele).style.animationDuration = aDura + "s"
    document.getElementById(ele).style.animationTimingFunction = "linear"
    document.getElementById(ele).style.animationIterationCount = "infinite"
    document.getElementById(ele).style.animationDelay = aDelay + "s"
}

function animate_API_CHI(txtLen){
    //console.log("vfatgyeushzdi")
    if(!isAlreadyLooping){
        const tc1 = document.getElementById("tc1").innerHTML
        document.getElementById("tc1_").innerHTML = ""
        isAlreadyLooping = true
        document.getElementById("tc1").innerHTML = ""
        scrollInterval = setInterval(function(){
            document.getElementById("tc1").innerHTML = curStopName[0]
                document.getElementById("tc1").animate(
                    [{ transform: "translateX(" + (txtLen+1) + "em)" }, { transform: "translateX(-" + (txtLen*1.5) + "em)" }], //2
                    {
                        duration: txtLen*1000,
                        easing: "linear",
                    }
                )
                setTimeout(function(){
                    document.getElementById("tc1_").innerHTML = curStopName[0]
                    document.getElementById("tc1_").animate(
                        [{ transform: "translateX(" + (1) + "em)" }, { transform: "translateX(-" + (txtLen*2.5) + "em)" }], //3
                        {
                            duration: txtLen*1000,
                            easing: "linear",
                        }
                    )
                },txtLen*1000/2)
                //console.log("dsbhufehudzfvkhilu")
        },txtLen*1000)
    }
}
function animate_API_ENG(txtLen,mply){
    if(!isAlreadyLoopingen){
        const en1 = document.getElementById("en1").innerHTML
        document.getElementById("en1").innerHTML = ""
        document.getElementById("en1_").innerHTML = ""
        isAlreadyLoopingen = true
        scrollIntervalen = setInterval(function(){
            console.log(txtLen + " DURA")
                document.getElementById("en1").innerHTML = curStopName[1]
                document.getElementById("en1").animate(
                    [{ transform: "translateX(" + (txtLen+1) + "em)" }, { transform: "translateX(-" + (txtLen*1) + "em)" }], //2
                    {
                        duration: txtLen*1000/mply,
                        easing: "linear",
                    }
                )
        },txtLen*1000/mply)
        setTimeout(function(){
            scrollIntervalen2 = setInterval(function(){
                document.getElementById("en1_").innerHTML = curStopName[1]
                document.getElementById("en1_").animate(
                    [{ transform: "translateX(" + (1) + "em)" }, { transform: "translateX(-" + (txtLen*2) + "em)" }], //3
                    {
                        duration: txtLen*1000/mply,
                        easing: "linear",
                    }
                )
            },txtLen*1000/mply)
        },txtLen*1000+(txtLen*1000/mply/1.5))
        
    }
}

function animante_API_stop_CHI(){
    clearInterval(scrollInterval)
    isAlreadyLooping = false;
}
function animante_API_stop_ENG(){
    clearInterval(scrollIntervalen)
    clearInterval(scrollIntervalen2)
    isAlreadyLoopingen = false;
}

document.getElementById("tc1").onanimationiteration = function(){
    console.log("sbfhjsbefdbhjsdfb")
}