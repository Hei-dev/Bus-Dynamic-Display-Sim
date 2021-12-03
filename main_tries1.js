/*
    Copyrights belongs to the reapective owner
*/

const baseURL = "https://rt.data.gov.hk/v1/transport/citybus-nwfb"
const KMBbaseURL = "https://data.etabus.gov.hk/v1/transport/kmb"
var route = 13
var bound = "inbound"
var com = "NWFB"
var routeStopInfo = []
var routeStopEtaInfo = []
var orgRouteStopId = {}
var routeStopIds = []
var orgRouteStopIdKMB
var logs = document.getElementById("logs")
var instr = document.getElementById("instr")
document.getElementById("sellist").style.display = "none"

const crossHarbourNo = ["1","3","6","9","N"]
var isCrossHarbourRoute = false
var routeStopInfoKMB = []
var routeStopIdKMB = []

var numbersArr = [];
for(let i=0;i<=9;i++){
    numbersArr.push(String(i))
}
var letterArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
var distName = ["尖沙咀",
    "油麻地",
    "旺角",
    "深水埗",
    "長沙灣",
    "九龍塘",
    "紅磡",
    "土瓜灣",
    "觀塘",
    "九龍灣"
]
var distNameEn = [
    "TSIM SHA TSUI",
    "YAU MA TEI",
    "MONG KOK",
    "SHAM SHUI PO",
    "CHEUNG SHA WAN",
    "KOWLOON TONG",
    "HUNG HOM",
    "TO KWA WAN",
    "KWUN TONG",
    "KOWLOON BAY"
]


//console.log(checkCrossHarbor("650"))

//document.getElementById("en1").style.animation = "txtScroll 5s linear infinite"
//getRouteInfo(com,route,bound)

function initBtn(){
    document.getElementById("routeSel").style.display = "none"
    route = document.getElementById("routeid").value
    bound = document.getElementById("bound").value
    com = document.getElementById("Company").value
    instr.innerHTML  = "Please wait..."
    document.getElementById("stopimg1").src = "Stop_" + com + ".png"
    document.getElementById("stopimg2").src = "Stop_" + com + ".png"
    document.getElementById("stopimg3").src = "Stop_" + com + ".png"
    getRouteInfo(com,route,bound)
}

function isBoundMatching(databound,qbound){
    /*if(!invert){
        var boundcheck = invertBound(bound)
    }*/
    return ((databound=="O" && "outbound"==qbound)||(databound=="I" && "inbound"==qbound))
}

function DateToTime(datetime){
    return datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds()
}

function checkCrossHarbor(route){
    console.log(route[0])
    return (route.length==3 || route.length==4) && (crossHarbourNo.indexOf(route[0]) != 0)
}

async function getRouteInfo(com,route,bound){
    if(checkCrossHarbor(route)){
        isCrossHarbourRoute = true
        var fetchResKMB = await fetch(KMBbaseURL + "/route-stop/" + route + "/" + bound + "/" + 1)
        orgRouteStopIdKMB = JSON.parse(await fetchResKMB.text())
        console.log(orgRouteStopIdKMB)
        for(var i in orgRouteStopIdKMB.data){
            var stopsInfoKMB = orgRouteStopIdKMB.data[i]
            instr.innerHTML = "Loading extras... (" + i + "/" + orgRouteStopIdKMB.data.length + ")"
            routeStopIdKMB.push(stopsInfoKMB.stop)
            routeStopInfoKMB[stopsInfoKMB.stop] = await getStop(stopsInfoKMB.stop,isCrossHarbourRoute)
        }
        console.log(routeStopIdKMB)
    }
    
    if(com=="KMB"){
        var fetchRes = await fetch(KMBbaseURL + "/route-stop/" + route + "/" + bound + "/" + 1)
    }
    else{
        var fetchRes = await fetch(baseURL + "/route-stop/" + com + "/" + route + "/" + bound)
    }
    
    orgRouteStopId = JSON.parse(await fetchRes.text())
    console.log(orgRouteStopId)
    for(var i in orgRouteStopId.data){
        var stopsInfo = orgRouteStopId.data[i]
        logs.innerHTML += "Loading stop " + stopsInfo.stop + ": " + i + "/" + orgRouteStopId.data.length + "<br>"
        instr.innerHTML = "Please wait... (" + i + "/" + orgRouteStopId.data.length + ")"
        if(isCrossHarbourRoute){
            await getStopEta(com,stopsInfo.stop,route,bound)
        }
        else{
            await getStopEta(com,stopsInfo.stop,route,bound)
        }
        
        await getStop(stopsInfo.stop)
    }
    console.log(routeStopEtaInfo)
    console.log(routeStopInfo)
    for(var i in routeStopEtaInfo){
        try{ //Catch the "undefined"
            routeStopEtaInfo[i].name_tc = routeStopInfo[routeStopEtaInfo[i].stop][0]
            routeStopEtaInfo[i].name_en = routeStopInfo[routeStopEtaInfo[i].stop][1]
        }
        catch(err){
            routeStopEtaInfo[i].name_tc = routeStopInfoKMB[routeStopEtaInfo[i].stop][0]
            routeStopEtaInfo[i].name_en = routeStopInfoKMB[routeStopEtaInfo[i].stop][1]
        }
        
    }
    
    console.log(logs)
    for(var i in routeStopEtaInfo){
        let stopText = String(routeStopEtaInfo[i].seq + "." + routeStopEtaInfo[i].eta_seq + ": " + routeStopEtaInfo[i].name_tc + " - " + DateToTime(routeStopEtaInfo[i].ETA)) + "<br>"
        console.log(stopText)
        logs.innerHTML += stopText
        document.getElementById("stopetamenu").innerHTML += "<option value='" + routeStopEtaInfo[i].seq + "." + routeStopEtaInfo[i].eta_seq + "'>" + stopText + "</option>"
    }
    document.getElementById("sellist").style.display = "block"
    instr.innerHTML = "Select the aboarding stop"
    //console.log(logs)
}

/**
 * Gets the stop information and *STORES* the JSON data into the array `routeStopInfo`
 * @param {String} stop the stop ID
 *
 */
async function getStop(stop,isCrossHarbouring){
    if(com=="KMB"||isCrossHarbouring){
        var bURL = KMBbaseURL
    }
    else{
        var bURL = baseURL
    }
    let fetchRes = await fetch(bURL + "/stop/" + stop)
    var orgStopList = JSON.parse(await fetchRes.text())
    let orgStopData = orgStopList.data;
    let nametc = orgStopData.name_tc
    let nameen = orgStopData.name_en
    if(isCrossHarbouring){
        return [stringProcess(nametc,false),stringProcess(nameen,true)]
    }
    routeStopInfo[stop] = [stringProcess(nametc,false),stringProcess(nameen,true)]
    routeStopIds.push(stop)
}
function stringProcess(strname,isEn){
    let strfin = strname;
    if(strname.indexOf(",")!=-1){ //CTB/NWFB, check street name
        strfin = strfin.substr(0,strname.indexOf(","))
    }
    
    if((strname[strname.length-1]==")")&&(strname[strname.length-2] in numbersArr)){ //KMB, check platform code
        strfin = strfin.substr(0,strname.indexOf("("))
        console.log(strfin)
    }
    return strfin
}

/**
 * Gets the ETA of the stop and *STORE* it to the array `routeStopEtaInfo`
 * @param {String} com The company name
 * @param {String} stop The stop ID
 * @param {String} route The Route ID
 * @param {String} qbound The route direction
 * @param {String} stopKMB Optional: the stop ID in KMB format
 */
async function getStopEta(com,stop,route,qbound,stopKMB){
    console.log(qbound)
    if(com=="KMB"){
        var fetchRes = await fetch(KMBbaseURL + "/eta/" + stop + "/" + route + "/1")
        console.log(KMBbaseURL + "/eta/" + stop + "/" + route + "/1")
    }
    else{
        var fetchRes = await fetch(baseURL + "/eta/" + com + "/" + stop + "/" + route)
    }
    var orgEta = JSON.parse(await fetchRes.text())
    let orgEtaData = orgEta.data
    //console.log(orgEta)
    if(orgEta.data.length==0) {
        console.log("No matching")
        return
    };
    for(var j in orgEta.data){
        if(isBoundMatching(orgEtaData[j].dir,qbound)){
            if(orgEtaData[j].rmk_en == "KMB Cycle"){
                console.log("KMB Cycle for seq" + orgEtaData[j].seq + "." + orgEtaData[j].eta_seq)
                await getStopEta("KMB",routeStopIdKMB[orgEtaData[j].seq],route,/*invertBound(bound)*/bound)
                //console.log(routeStopEtaInfo)
            }
            else{
                routeStopEtaInfo.push({
                "co" : com,
                "stop" : stop,
                "eta_seq" : orgEtaData[j].eta_seq,
                "seq" : orgEtaData[j].seq,
                "ETA" : new Date(orgEtaData[j].eta)
            })
            console.log(routeStopEtaInfo)
            }
        }
        else{
            console.log("Wrong Bound")
        }
        //console.log(Date.parse(orgEtaData[j].eta))
    }
    
}

/**
 * Returns the invert of the bound. Used for Cross-company routes.
 * @param {String} bound the direction of the bus 
 * @returns the inverted direction
 */
function invertBound(bound){
    if(bound=="inbound"){
        return "outbound"
    }
    else{
        return "inbound"
    }
}

function fullscreen(){
    if (document.documentElement.requestFullscreen){
      document.documentElement.requestFullscreen();
    }
    else if (document.documentElement.webkitRequestFullscreen){
      document.documentElement.webkitRequestFullscreen();
    }
    else if (document.documentElement.msRequestFullscreen){
      document.documentElement.msRequestFullscreen();
    }
}

/////////////////LOOPS / MAIN PART////////////////////
var secs = 0
var curstop_json = {}
var curstop_id


/**
 * Gets the ETA of the stop and *RETURNS* the JSON generated
 * @param {String} com The company name
 * @param {String} stop The stop ID
 * @param {String} route The Route ID
 */
 async function getStopEtaJSON(com,stop,route){
    if(com=="KMB"){
        var urlFetch = KMBbaseURL + "/eta/" + stop + "/" + route + "/1"
    }
    else{
        var urlFetch = (baseURL + "/eta/" + com + "/" + stop + "/" + route)
    }
    console.log(urlFetch)
    let fetchRes = await fetch(urlFetch)
    var orgEta = JSON.parse(await fetchRes.text())
    let orgEtaData = await orgEta.data
    let returnVal = {}
    //console.log(orgEta)
    if(orgEtaData.length==0) return null;
    for(var j in orgEta.data){
        if(isBoundMatching(orgEtaData[j].dir)){
            returnVal = {"co" : com,"stop" : stop,"eta_seq" : await orgEtaData[j].eta_seq,"seq" : await orgEtaData[j].seq,"ETA" : new Date(await orgEtaData[j].eta),}
            returnVal.name_en = routeStopInfo[stop][1]
            returnVal.name_tc = routeStopInfo[stop][0]
            console.log(returnVal)
            curstop_id = stop
            break
        }
        else{
            console.log("not matching")
        }
        //console.log(Date.parse(orgEtaData[j].eta))
    }
    //await setDisplay()
    console.log(returnVal)
    return returnVal
    
}



function prepareForLoop(){
    curstop_json = routeStopEtaInfo[document.getElementById("stopetamenu").selectedIndex]
    curstop_id = curstop_json.stop
    document.getElementById("sellist").style.display = "none"
    console.log("starting")
    document.getElementById("instr").style.display = "none"
    setTxtDisplay()
    stopSelect()
}

var type = 0
function stopSelect(){
    secs++
    console.log(curstop_json)
    
    let h = new Date().getHours()
    let m = new Date().getMinutes()
    let s = new Date().getSeconds()
    let milsecs = new Date().getTime()
    //Compare time for now and ETA
    if(secs%60==0){
        let pmise = getStopEtaJSON(com,curstop_id,route)
        pmise.then(function(value){
            curstop_json = value
            if(value!=null){
                setTxtDisplay()
            }
        })
        
    }
    console.log((new Date(curstop_json.ETA).getTime() - milsecs))
    let timeleft = (new Date(curstop_json.ETA).getTime() - milsecs)
    if(timeleft<0){
        let pmise = getStopEtaJSON(com,routeStopIds[routeStopIds.indexOf(curstop_id)+1],route)
        pmise.then(function(value){
            curstop_json = value
            if(value!=null){
                setTxtDisplay()
                setImgDisplay()
            }
        })
    }

    document.getElementById("minLeft").innerHTML = Math.ceil(timeleft/1000/60) + "<br>min"

    console.log(secs)
    if(secs%20==0){
        type++
        //console.log(type)
        if(type>3){
            type=0
        }
        switchInfo(type)
    }
    
    //setTxtDisplay()
    //switchInfo(secs)
    setImgDisplay(timeleft,(new Date(curstop_json.ETA).getMinutes()))
    setTimeout(stopSelect,1000)


}


function switchInfo(type){
    //console.log(type)
    if(type==0){
        setTxtDisplay()
    }
    else if(type==1){
        setTxtDisplay()
    }
    else if(type==2){
        setDesDisplay()
    }
}


function setTextSize(text,isEn){
    if(!isEn){
        if(text.length >= 8){
            if(text.length >= 11){
                return (text.length/5) + "vw"
            }
            else{
                return (text.length/2) + "vw"
            }
            
        }
    }
    else{
        console.log(text.length)
        if(text.length >= 17){
            return (text.length/5) + "vw"
        }
    }
}

async function setTxtDisplay(){
    if(curstop_json!=undefined){
        //console.log(curstop_json.stop)
        //console.log(routeStopInfo)
        var txtDisplay = []
        var txtDisplayEn = []
        txtDisplay.push(document.getElementById("tc1"))
        txtDisplayEn.push(document.getElementById("en1"))
        txtDisplay.push(document.getElementById("tc2"))
        txtDisplayEn.push(document.getElementById("en2"))
        txtDisplay.push(document.getElementById("tc3"))
        txtDisplayEn.push(document.getElementById("en3"))

        document.getElementById("stopimg2").src = "Stop_" + com + ".png"
        document.getElementById("stopimg3").src = "Stop_" + com + ".png"

        document.getElementById("tc1").innerHTML = routeStopInfo[curstop_json.stop][0]
        document.getElementById("en1").innerHTML = routeStopInfo[curstop_json.stop][1]
        if(routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][0]!=undefined){
            document.getElementById("tc2").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][0]
            document.getElementById("en2").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][1]
        }
        if(routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+2]][0]!=undefined){
            document.getElementById("tc3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+2]][0]
            document.getElementById("en3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+2]][1]
        }

        /*
        for(let i in txtDisplay){ // TODO seperate top and bottom text && MAke it into a new function
            if(txtDisplay[i].innerHTML.length>=8){
                txtDisplay[i].style.animationName = "txtScroll"
                txtDisplay[i].style.animationDuration = txtDisplay[i].innerHTML.length/1.5 + "s"
                txtDisplay[i].style.animationTimingFunction = "linear"
                txtDisplay[i].style.animationIterationCount = "infinite"
            }
            else{
                txtDisplay[i].style.animationName = ""
            }
        }
        for(let i in txtDisplayEn){ // TODO seperate top and bottom text
            let totUpper = txtDisplayEn[i].innerHTML.length - txtDisplayEn[i].innerHTML.replace(/[A-Z]/g, '').length;
            let totLower = txtDisplayEn[i].innerHTML.length - totUpper
            let tot = ((totLower/2)+totUpper)
            console.log(tot)
            if(tot>=13){
                txtDisplayEn[i].style.animationName = "txtScroll"
                txtDisplayEn[i].style.animationDuration = txtDisplayEn[i].innerHTML.length/2 + "s"
                txtDisplayEn[i].style.animationTimingFunction = "linear"
                txtDisplayEn[i].style.animationIterationCount = "infinite"
            }
            else{
                txtDisplayEn[i].style.animationName = ""
            }
            console.log(txtDisplayEn[0])
        }
        */
        if(document.getElementById("tc1").innerHTML.length>=8){
            document.getElementById("tc1").style.animationName = "txtScroll"
            document.getElementById("tc1").style.animationDuration = document.getElementById("tc1").innerHTML.length/1.25 + "s"
            document.getElementById("tc1").style.animationTimingFunction = "linear"
            document.getElementById("tc1").style.animationIterationCount = "infinite"
        }
        else{
            document.getElementById("tc1").style.animationName = ""
        }

        let totUpper = document.getElementById("en1").innerHTML.length - document.getElementById("en1").innerHTML.replace(/[A-Z]/g, '').length;
        let totLower = document.getElementById("en1").innerHTML.length - totUpper
        let tot = ((totLower/2)+totUpper)
        console.log(tot)
        if(tot>=13){
            document.getElementById("en1").style.animationName = "txtScroll"
            document.getElementById("en1").style.animationDuration = document.getElementById("en1").innerHTML.length/2.5 + "s"
            document.getElementById("en1").style.animationTimingFunction = "linear"
            document.getElementById("en1").style.animationIterationCount = "infinite"
        }
        else{
            document.getElementById("en1").style.animationName = ""
        }
        //console.log(txtDisplayEn[0])
    }
    
}

function setImgDisplay(secs, etamin, light){
    let stopimg = document.getElementById("stopimg1")
    //console.log(eatmin)
    //console.log(new Date().getMinutes())
    if(etamin==new Date().getMinutes()){
        if(stopimg.getAttribute("src")=="Stop_"+com+"_arr.png"){
            stopimg.src = "Stop_"+com+"_arr2.png"
        }
        else{
            stopimg.src = "Stop_"+com+"_arr.png"
        }
        
    }
    else{
        //console.log("Not Same")
        if(stopimg.getAttribute("src")=="Stop_"+com+".png"){
            stopimg.src = "Stop_"+com+"_light.png"
        }
        else{
            stopimg.src = "Stop_"+com+".png"
        }
        
    }
}

function setDesDisplay(){
    document.getElementById("tc2").innerHTML = "前往"
    document.getElementById("en2").innerHTML = "Towards"
    
    document.getElementById("tc3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.length-1]][0]
    document.getElementById("en3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.length-1]][1]

    document.getElementById("stopimg2").src = "Stop_" + com + "_skip.png"
    document.getElementById("stopimg3").src = "Stop_" + com + "_ter.png"
}