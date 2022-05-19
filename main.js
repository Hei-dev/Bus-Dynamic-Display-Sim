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
var routeStopEtaInfoKMB;
var curseqKMB = ""

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
    "九龍灣",
    "新蒲崗"
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
    "KOWLOON BAY",
    "SAN PO KONG"
]
var strName = "街道路里坊".split("")
var strNameEn = [
    "Street",
    "Road",
    "Avenue",
    "Lane",
    "Square"
]
var strExclude = [
    "紅磡南道",
    "HUNG HOM SOUTH ROAD"
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

    isCrossHarbourRoute = document.getElementById("joint").checked

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
                    console.log(strname + ":" + strname.indexOf(distName[i])+distName[i].length + strfin)
                }
            }
        }
    }
        
    return strfin
}
function checkDistrictStreet(stopname,dist,street){
    return (stopname.indexOf(dist)!= -1)
        && (stopname.indexOf(street) != -1)
        && (stopname.indexOf(dist)+dist.length!=stopname.indexOf(street)
        && (strExclude.indexOf(stopname)==-1))
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
    //console.log((baseURL + "/eta/" + com + "/" + stop + "/" + route))
    if(com=="KMB"){
        var fetchRes = await fetch(KMBbaseURL + "/eta/" + stop + "/" + route + "/1")
        console.log(KMBbaseURL + "/eta/" + stop + "/" + route + "/1")
    }
    else{
        var fetchRes = await fetch(baseURL + "/eta/" + com + "/" + stop + "/" + route)
    }
    var orgEta = JSON.parse(await fetchRes.text())
    let orgEtaData = orgEta.data
    console.log(orgEtaData)
    if(orgEta.data.length==0) {
        console.log("No matching")
        return
    };
    var dataCount = 0
    for(var j in orgEta.data){
        if(isBoundMatching(orgEtaData[j].dir,qbound,false)){
            dataCount++
            routeStopEtaInfo.push({
                "co" : com,
                "stop" : stop,
                "eta_seq" : orgEtaData[j].eta_seq,
                "seq" : orgEtaData[j].seq,
                "ETA" : new Date(orgEtaData[j].eta)
            })
        }
        else{
            console.log("Wrong Bound")
        }
        //console.log(Date.parse(orgEtaData[j].eta))
    }
    if(dataCount<3){
        for(var _=(dataCount+1);_<3;_++){
            routeStopEtaInfo.push({
                "co" : com,
                "stop" : stop,
                "eta_seq" : _+1,
                "seq" : orgEtaData[j].seq,
                "ETA" : new Date(NaN)
            })
        }
    }
    
}

// INITALIZE / GET DATA
async function getRouteInfo(com,route,bound){
    //Get a list of stop ids
    if(com=="KMB"){
        var fetchRes = await fetch(KMBbaseURL + "/route-stop/" + route + "/" + bound + "/" + 1)
    }
    else{
        var fetchRes = await fetch(baseURL + "/route-stop/" + com + "/" + route + "/" + bound)
        if(isCrossHarbourRoute){
            var fetchResKMB = await fetch(KMBbaseURL + "/route-stop/" + route + "/" + bound + "/" + 1)
            orgRouteStopIdKMB = JSON.parse(await fetchResKMB.text())
        }
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
    
    //Joint-operated route get route data
    //Moving routeStopInfo to a temp array for the KMB data
    if(isCrossHarbourRoute){
        var t_routeStopEtaInfo = routeStopEtaInfo
        var t_routeStopIds = routeStopIds
        routeStopIds = []
        routeStopEtaInfo = []
        routeStopInfo = []
        console.log(t_routeStopEtaInfo)

        for(var i in orgRouteStopIdKMB.data){
            var stopsInfo = orgRouteStopIdKMB.data[i]
            logs.innerHTML += "Loading KMB Cycle " + stopsInfo.stop + ": " + i + "/" + orgRouteStopIdKMB.data.length + "<br>"
            instr.innerHTML = "Please wait... (" + i + "/" + orgRouteStopIdKMB.data.length + ")"
            await getStopEta("KMB",stopsInfo.stop,route,invertBound(bound))
            //console.log(routeStopEtaInfo)
            await getStop(stopsInfo.stop,true)
            
        }
        for(var i in routeStopEtaInfo){
            console.log(routeStopInfo) //TODO Check routeStopInfo so that this will not return undefined
            routeStopEtaInfo[i].name_tc = routeStopInfo[routeStopEtaInfo[i].stop][0]
            routeStopEtaInfo[i].name_en = routeStopInfo[routeStopEtaInfo[i].stop][1]
        }

        console.log(routeStopEtaInfo)

        routeStopEtaInfoKMB = routeStopEtaInfo
        routeStopEtaInfo = t_routeStopEtaInfo
        routeStopIdKMB = routeStopIds
        routeStopIds = t_routeStopIds
    }

    console.log(logs)
    //String for the dropdown menu
    for(var i in routeStopEtaInfo){
        console.log((await routeStopEtaInfo[i].ETA).getMinutes())
        if(isNaN((await routeStopEtaInfo[i].ETA).getMinutes())){
            routeStopEtaInfo[i] = routeStopEtaInfoKMB[i]
            console.log(i)
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

var lastTimeLeft = -1;


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
    console.log(urlFetch)
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
    lastTimeLeft = new Date(curstop_json.ETA).getTime() - new Date().getTime()
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
    
    let timeleft = (new Date(curstop_json.ETA).getTime() - milsecs)
    if(timeleft<0 || (timeleft-lastTimeLeft)>=240000){
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
            document.getElementById("tc3").innerHTML = "&nbsp"
            document.getElementById("en3").innerHTML = "&nbsp"
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
        let chilen = document.getElementById("tc1").innerHTML.length
        if(chilen>=6){
            document.querySelector(':root').style.setProperty("--len",String((chilen*12*-1)) + "vw")
            //console.log(String((chilen*12*-1)) + "vw")
            console.log(getComputedStyle(document.querySelector(':root')).getPropertyValue('--len'))
            document.getElementById("tc1").style.animationName = "txtScroll"
            document.getElementById("tc1").style.animationDuration = document.getElementById("tc1").innerHTML.length/0.75 + "s"
            document.getElementById("tc1").style.animationTimingFunction = "linear"
            document.getElementById("tc1").style.animationIterationCount = "infinite"
        }
        else{
            document.getElementById("tc1").style.animationName = ""
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