/*
    Copyrights belongs to the reapective owner
*/

/**Base URL for CTB bus route*/
const baseURL = "https://rt.data.gov.hk/v1/transport/citybus-nwfb"
/**Base URL for KMB bus route*/
const KMBbaseURL = "https://data.etabus.gov.hk/v1/transport/kmb"
/**Current Route Number*/
var route = 13
/**Current selected bound*/
var bound = "inbound"
/**Current seleted bus company*/
var com = "NWFB"
var routeStopInfo = []
var routeStopEtaInfo = []
var orgRouteStopId = {}
var routeStopIds = []
var orgRouteStopIdKMB
var logs = document.getElementById("logs")
var instr = document.getElementById("instr")
document.getElementById("sellist").style.display = "none"

var lastMinFetch = -255

const crossHarbourNo = ["1","3","6","9","N"]
var isCrossHarbourRoute = false
var routeStopInfoKMB = []
var routeStopIdKMB = []
var curseqKMB = ""

var numbersArr = [];
for(let i=0;i<=9;i++){
    numbersArr.push(String(i))
}
var letterArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
/**District names (in Chinese) that will be used to seperate street name and area name*/
const distName = ["尖沙咀",
    "油麻地",
    "旺角",
    "深水埗",
    "長沙灣",
    "九龍塘",
    "紅磡",
    "土瓜灣",
    "觀塘",
    "九龍灣",
    "新蒲崗"
]
/**District name (in English) that will be used to seperate street name and area name*/
const distNameEn = [
    "TSIM SHA TSUI",
    "YAU MA TEI",
    "MONG KOK",
    "SHAM SHUI PO",
    "CHEUNG SHA WAN",
    "KOWLOON TONG",
    "HUNG HOM",
    "TO KWA WAN",
    "KWUN TONG",
    "KOWLOON BAY",
    "SAN PO KONG"
]
const strName = "街道路里坊".split("")
const strNameEn = [
    "Street",
    "Road",
    "Avenue",
    "Lane",
    "Square"
]
const strExclude = [
    "紅磡南道",
    "HUNG HOM SOUTH ROAD",
    "巴士總站",
    "BUS TERMINUS"
]


//console.log(checkCrossHarbor("100"))

//document.getElementById("en1").style.animation = "txtScroll 5s linear infinite"
//getRouteInfo(com,route,bound)

function initBtn(){
    document.getElementById("routeSel").style.display = "none"
    document.getElementById("display").style.display = "block"
    route = document.getElementById("routeid").value
    bound = document.getElementById("bound").value
    com = document.getElementById("Company").value
    instr.innerHTML  = "Please wait..."
    document.getElementById("stopimg1").src = "img/Stop_" + com + ".png"
    document.getElementById("stopimg2").src = "img/Stop_" + com + ".png"
    document.getElementById("stopimg3").src = "img/Stop_" + com + ".png"
    document.getElementById("debug").innerHTML = route + "," + bound
    getRouteInfo(com,route,bound)
}

function isBoundMatching(databound,qbound,isCrossHarbouring){
    var boundcheck = qbound
    /*if(isCrossHarbouring && document.getElementById("rev").checked){
        boundcheck = invertBound(bound)
    }*/
    return ((databound=="O" && "outbound"==boundcheck)||(databound=="I" && "inbound"==boundcheck))
}

function DateToTime(datetime){
    //console.log(datetime)
    return datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds()
}

function checkCrossHarbor(route){
    console.log(crossHarbourNo.indexOf(route[0]))
    return (route.length==3 || route.length==4) && (crossHarbourNo.indexOf(route[0]) != -1)
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
/**
 * Process the Stop Name to make it sounds more like a real stop name
 * @param {String} strname 
 * @param {Boolean} isEn 
 * @returns The processed string
 */
function stringProcess(strname,isEn){
    let strfin = strname;
    if(strname.indexOf(",")!=-1){ //CTB/NWFB, check street name
        strfin = strfin.substring(0,strname.indexOf(","))
    }
    
    if((strname[strname.length-1]==")")&&(strname[strname.length-2] in numbersArr)){ //KMB, check platform code
        strfin = strfin.substring(0,strname.indexOf("("))
        console.log(strfin)
    }
    if(isEn && com=="KMB"){
        for(i in distNameEn){
            for(j in strNameEn){
                if(checkDistrictStreet(strfin,distNameEn[i],strNameEn[j])){
                    if(strfin.indexOf(strNameEn[j])>strfin.indexOf(distNameEn[i])){
                        strfin = strfin.substring(strfin.indexOf(distNameEn[i])+distNameEn[i].length+1,strfin.length)
                    }
                    else{
                        strfin = strfin.substring(0,strfin.indexOf(distNameEn[i]-1))
                    }
                }
                console.log(strfin)
            }
        }
    }
    else{
        for(i in distName){
            for(j in strName){
                if(checkDistrictStreet(strfin,distName[i],strName[j])){
                    strfin = strfin.substring(strfin.indexOf(distName[i])+distName[i].length,strfin.length)
                    //console.log(strname + ":" + strname.indexOf(distName[i])+distName[i].length + strfin)
                }
            }
        }
    }
        
    return strfin.replace("巴士總站","").replace("BUS TERMINUS","")
}
function checkDistrictStreet(stopname,dist,street){
    return (stopname.indexOf(dist)!= -1)
        && (stopname.indexOf(street) != -1)
        && (stopname.indexOf(dist)+dist.length!=stopname.indexOf(street)
        && (strExclude.some(_strEle => stopname.includes(_strEle))==-1))
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
        if(isBoundMatching(orgEtaData[j].dir,qbound,false)){
            routeStopEtaInfo.push({
                "co" : com,
                "stop" : stop,
                "eta_seq" : orgEtaData[j].eta_seq,
                "seq" : orgEtaData[j].seq,
                "ETA" : new Date(orgEtaData[j].eta)
            })
            console.log()
        }
        else{
            console.log("Wrong Bound")
        }
        //console.log(Date.parse(orgEtaData[j].eta))
    }
    
}

async function getRouteInfo(com,route,bound){
    if(checkCrossHarbor(route)){
        isCrossHarbourRoute = true
        if(document.getElementById("rev").checked){
            bound = invertBound(bound)
        }
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
        await getStopEta(com,stopsInfo.stop,route,bound)
        await getStop(stopsInfo.stop)
    }
    console.log(routeStopEtaInfo)
    console.log(routeStopInfo)
    for(var i in routeStopEtaInfo){
        routeStopEtaInfo[i].name_tc = routeStopInfo[routeStopEtaInfo[i].stop][0]
        routeStopEtaInfo[i].name_en = routeStopInfo[routeStopEtaInfo[i].stop][1]
        
    }
    
    console.log(logs)
    for(var i in routeStopEtaInfo){
        console.log(routeStopEtaInfo[i].ETA.getMinutes())
        if(isNaN(routeStopEtaInfo[i].ETA.getMinutes())){
            instr.innerHTML = "Loading extras..."
            curseqKMB = routeStopEtaInfo[i].seq - 1
            routeStopEtaInfo[i] = await getStopEtaJSON("KMB",routeStopIdKMB[routeStopEtaInfo[i].seq - 1],route,bound,true)
            //console.log(routeStopEtaInfo[i])
        }
        let stopText = String(await routeStopEtaInfo[i].seq + "." + await routeStopEtaInfo[i].eta_seq + ": " + await routeStopEtaInfo[i].name_tc + " - " + DateToTime(await routeStopEtaInfo[i].ETA)) + " - " + await routeStopEtaInfo[i].co + "<br>"
        console.log(stopText)
        logs.innerHTML += stopText
        document.getElementById("stopetamenu").innerHTML += "<option value='" + routeStopEtaInfo[i].seq + "." + routeStopEtaInfo[i].eta_seq + "'>" + stopText + "</option>"
    }
    document.getElementById("sellist").style.display = "block"
    instr.innerHTML = "Select the aboarding stop"
    //console.log(logs)
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
 async function getStopEtaJSON(com,stop,route,qbound,isCrossHarbouring){
    if(com=="KMB"){
        var urlFetch = KMBbaseURL + "/eta/" + stop + "/" + route + "/1"
    }
    else{
        var urlFetch = (baseURL + "/eta/" + com + "/" + stop + "/" + route)
    }
    let fetchRes = await fetch(urlFetch)
    var orgEta = JSON.parse(await fetchRes.text())
    let orgEtaData = await orgEta.data
    let returnVal = {}
    console.log(orgEta)
    if(orgEtaData.length==0) return null;
    for(var j in orgEtaData){
        console.log(orgEtaData[j].dir + "," + qbound)
        if(isBoundMatching(orgEtaData[j].dir,qbound,isCrossHarbouring)){
            console.log(orgEtaData[j])
            returnVal = {"co" : com,"stop" : stop,"eta_seq" : await orgEtaData[j].eta_seq,"seq" : await orgEtaData[j].seq,"ETA" : new Date(await orgEtaData[j].eta),}
            if(isCrossHarbourRoute){
                returnVal.name_en = routeStopInfoKMB[stop][1]
                returnVal.name_tc = routeStopInfoKMB[stop][0]
            }
            else{
                returnVal.name_en = routeStopInfo[stop][1]
                returnVal.name_tc = routeStopInfo[stop][0]
            }
                
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

/**
 * Get a list of ETA at a stop and RETURNS it
 */
async function getAtStopETA(com,stop){
    if(com=="KMB"){
        var urlFetch = KMBbaseURL + "/stop-eta/" + stop
    }
    else{
        var urlFetch = ("https://rt.data.gov.hk/v1/transport/batch/stop-eta/" + com + "/" + stop)
    }

    let fetchRes = await fetch(urlFetch)
    var orgEta = JSON.parse(await fetchRes.text())
    let orgEtaData = await orgEta.data
    if(orgEtaData.length==0) return null;
    return {
        "route" : orgEtaData.route,
        "dest_tc" : orgEtaData.dest_tc //TODO implement KMB
    }
}


function prepareForLoop(){
    curstop_json = routeStopEtaInfo[document.getElementById("stopetamenu").selectedIndex]
    if(curstop_json.co=="KMB"){
        com = "KMB"
        
    }
    if(isCrossHarbourRoute){
        routeStopInfo = routeStopInfoKMB
        routeStopIds = routeStopIdKMB
    }
    curstop_id = curstop_json.stop
    console.log(curstop_json)
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
        let pmise = getStopEtaJSON(com,curstop_json.stop,route,bound)
        pmise.then(function(value){
            curstop_json = value
            if(value!=null){
                setTxtDisplay()
            }
        })
        
    }
    console.log((new Date(curstop_json.ETA).getTime() - milsecs))
    let timeleft = (new Date(curstop_json.ETA).getTime() - milsecs)
    lastMinFetch = -255?timeleft:lastMinFetch
    if(timeleft<0 || (timeleft-lastMinFetch<=-5)){
        let pmise = getStopEtaJSON(com,routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1],route,bound)
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
    if(routeStopIds.indexOf(curstop_json.stop)+1!=routeStopIds.length){
        setTimeout(stopSelect,1000)
    }
    else{
        document.getElementById("tc2").innerHTML = "已到達巴士總站"
        document.getElementById("en2").innerHTML = "Bus Terminal Reached"
        document.getElementById("tc3").innerHTML = "多謝乘搭"
        document.getElementById("en3").innerHTML = "Thank you for travelling"
    }
    


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

        document.getElementById("stopimg2").src = "img/Stop_" + com + ".png"
        document.getElementById("stopimg3").src = "img/Stop_" + com + ".png"

        document.getElementById("tc1").innerHTML = routeStopInfo[curstop_json.stop][0]
        document.getElementById("en1").innerHTML = routeStopInfo[curstop_json.stop][1]
        if(routeStopIds.indexOf(curstop_json.stop)+1==routeStopIds.length){
            document.getElementById("stopimg1").src = "img/Stop_" + com + "_ter.png"
            document.getElementById("stopimg2").style.display = "none"
            document.getElementById("stopimg3").style.display = "none"
            document.getElementById("tc2").innerHTML = ""
            document.getElementById("en2").innerHTML = ""
            document.getElementById("tc3").innerHTML = ""
            document.getElementById("en3").innerHTML = ""
            console.log("bfgsgufy")
            
        }
        else if(routeStopIds.indexOf(curstop_json.stop)+2==routeStopIds.length){
            document.getElementById("stopimg2").src = "img/Stop_" + com + "_ter.png"
            document.getElementById("stopimg3").style.display = "none"
            document.getElementById("tc2").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][0]
            document.getElementById("en2").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][1]
            document.getElementById("tc3").innerHTML = " "
            document.getElementById("en3").innerHTML = " "
        }
        else{
            document.getElementById("tc2").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][0]
            document.getElementById("en2").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+1]][1]
            document.getElementById("tc3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+2]][0]
            document.getElementById("en3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.indexOf(curstop_json.stop)+2]][1]
            if(routeStopIds.indexOf(curstop_json.stop)+3==routeStopIds.length){
                document.getElementById("stopimg3").src = "img/Stop_" + com + "_ter.png"
            }
        }

        //Determine Chinese text animation length
        let chilen = document.getElementById("tc1").innerHTML.length
        if(chilen>=6){
            //document.getElementById("tc1_").style.transform = "translateX(-100vw);"
            document.getElementById("tc1_").innerHTML = document.getElementById("tc1").innerHTML
            animate("tc1","txtScroll",chilen,"--len",String((chilen*12*-1)) + "vw",0)
            document.querySelector(':root').style.setProperty("--start2",chilen/12+"vw")
            animate("tc1_","txtScroll2",chilen,"--len2",String((chilen*12*-1)*2) + "vw",chilen/2)
        }
        else{
            document.getElementById("tc1").style.animationName = ""
            document.getElementById("tc1_").style.animationName = ""
        }
        
        if(com=="KMB"){
            let totUpper = document.getElementById("en1").innerHTML.length - document.getElementById("en1").innerHTML.replace(/[A-Z]/g, '').length;
            let totLower = document.getElementById("en1").innerHTML.length - totUpper
            let tot = ((totLower/2)+totUpper)
            console.log(tot)
            if(tot>=13){
                document.querySelector(':root').style.setProperty("--lenen",String(tot*12*-1) + "vw")
                document.getElementById("en1").style.animationName = "txtScrollEn"
                document.getElementById("en1").style.animationDuration = document.getElementById("en1").innerHTML.length/2.5 + "s"
                document.getElementById("en1").style.animationTimingFunction = "linear"
                document.getElementById("en1").style.animationIterationCount = "infinite"
            }
            else{
                document.getElementById("en1").style.animationName = ""
            }
        }
        else{
            let totSpace = document.getElementById("en1").innerHTML.length - document.getElementById("en1").innerHTML.replace(/ /g, '').length;
            let totLetter = document.getElementById("en1").innerHTML.length - totSpace
            let tot = ((totSpace/2)+totLetter)
            console.log("Text total: " + tot)
            if(tot>=13){
                document.querySelector(':root').style.setProperty("--lenen",String(tot*8*-1) + "vw")
                document.getElementById("en1").style.animationName = "txtScrollEn"
                document.getElementById("en1").style.animationDuration = document.getElementById("en1").innerHTML.length/2.5 + "s"
                document.getElementById("en1").style.animationTimingFunction = "linear"
                document.getElementById("en1").style.animationIterationCount = "infinite"
            }
            else{
                document.getElementById("en1").style.animationName = ""
            }
        }
        /**/

        
        //console.log(txtDisplayEn[0])
    }
    
}

function setImgDisplay(secs, etamin, light){
    let stopimg = document.getElementById("stopimg1")
    //console.log(eatmin)
    //console.log(new Date().getMinutes())
    if(etamin==new Date().getMinutes()){
        if(stopimg.getAttribute("src")=="img/Stop_"+com+"_arr.png"){
            stopimg.src = "img/Stop_"+com+"_arr2.png"
        }
        else{
            stopimg.src = "img/Stop_"+com+"_arr.png"
        }
        
    }
    else if(routeStopIds.indexOf(curstop_json.stop)+1==routeStopIds.length){
        /*if(stopimg.getAttribute("src")=="img/Stop_"+com+"_arr.png"){
            stopimg.src = "img/Stop_"+com+"_arr2.png"
        }
        else{
            stopimg.src = "img/Stop_"+com+"_arr.png"
        }*/
        
    }
    else{
        //console.log("Not Same")
        if(stopimg.getAttribute("src")=="img/Stop_"+com+".png"){
            stopimg.src = "img/Stop_"+com+"_light.png"
        }
        else{
            stopimg.src = "img/Stop_"+com+".png"
        }
        
    }
}

function setDesDisplay(){
    document.getElementById("tc2").innerHTML = "前往"
    document.getElementById("en2").innerHTML = "Towards"
    
    document.getElementById("tc3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.length-1]][0]
    document.getElementById("en3").innerHTML = routeStopInfo[routeStopIds[routeStopIds.length-1]][1]

    document.getElementById("stopimg2").src = "img/Stop_" + com + "_skip.png"
    document.getElementById("stopimg3").src = "img/Stop_" + com + "_ter.png"
}