function setAnimationText(){
    document.getElementById("tc1_").innerHTML = ""
    document.getElementById("tc1__").innerHTML = ""
    document.getElementById("en1_").innerHTML = ""
    document.getElementById("en1__").innerHTML = ""
    setElementAnimation(document.getElementById("tc1").innerHTML,"tc1","tc1_","tc1__",true)
    setElementAnimation(document.getElementById("en1").innerHTML,"en1","en1_","en1__",false)

    document.getElementById("tc2_").innerHTML = ""
    document.getElementById("tc2__").innerHTML = ""
    document.getElementById("en2_").innerHTML = ""
    document.getElementById("en2__").innerHTML = ""
    setElementAnimation(document.getElementById("tc2").innerHTML,"tc2","tc2_","tc2__",true)
    setElementAnimation(document.getElementById("en2").innerHTML,"en2","en2_","en2__",false)

    document.getElementById("tc3_").innerHTML = ""
    document.getElementById("tc3__").innerHTML = ""
    document.getElementById("en3_").innerHTML = ""
    document.getElementById("en3__").innerHTML = ""
    setElementAnimation(document.getElementById("tc3").innerHTML,"tc3","tc3_","tc3__",true)
    setElementAnimation(document.getElementById("en3").innerHTML,"en3","en3_","en3__",false)
}

function setElementAnimation(text,id,id2,spare_id,isChinese){    
    document.getElementById(id2).onanimationstart = function(_) {
        document.getElementById(id2).innerHTML = document.getElementById(id).innerHTML
    }
    document.getElementById(id2).innerHTML = ""
    document.getElementById(spare_id).innerHTML = ""
    //function updateContent(){
        var duration = getDuration(text , 0.5)
        var delay = 0
        document.getElementById(id).style.animation = "none";
        document.getElementById(id).offsetHeight;
        document.getElementById(id2).style.animation = "none";
        document.getElementById(id2).offsetHeight;
        document.getElementById(spare_id).style.animation = "none";
        document.getElementById(spare_id).offsetHeight;
        document.getElementById(spare_id).innerHTML = ""

        document.getElementById(id).innerHTML = text

        if(text.length<=12 && !isChinese){
            return
        }
        if(text.length<=5 && isChinese){
            return
        }
        //TODO FIX TEXT STILL SCROLLING
        console.log(text.length)

        if(duration>30){
            //document.getElementById(id).style.transform = "translateX(0%)"
            document.getElementById(spare_id).innerHTML = text
            console.log(document.getElementById(spare_id).innerHTML)
            document.getElementById(spare_id).style.animation = "scrolls2 " + duration + "s linear " +          0 + "s"
            console.log(document.getElementById(spare_id).style.transform)
            delay = 7
            document.getElementById(id).innerHTML = ""
            console.log(document.getElementById(id).innerHTML)
            setTimeout(function(){
                document.getElementById(id).innerHTML = text; console.log("febytw")
            },delay*1000)
        }

        console.log(delay)
        
        document.getElementById(id).style.animation = "scrolls " + duration + "s linear " +              delay + "s infinite"
        document.getElementById(id2).style.animation = "scrolls " + duration + "s linear " + String(duration/2 + delay) + "s infinite"
        document.getElementById(id2).innerHTML = ""
        console.log(document.getElementById(id).style.animation)
    //}

    document.getElementById(spare_id).onanimationend = function(){
        document.getElementById(spare_id).innerHTML = ""
    }
}