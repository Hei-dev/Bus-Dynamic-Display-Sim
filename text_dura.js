const full = "abcdeghknopqsuvxyz-".split("")
const half = "fjrt".split("")
const quarter = "il '()".split("")
const fullHalf = ["m","w"]
const Cfull = "ABCDEFGHKLMNOPQRSTUVXYZ".split("")
const Chalf = "IJ".toUpperCase().split("")
const CfullHalf = ["W"]

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