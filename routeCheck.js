document.getElementById("display").style.display = "none"
function checkRoute(route){
    var found = false
    for(var i in routeList){
        if(routeList[i].routeNameC==route){
            alert("Route found: " + routeList[i].routeNameC + "\n" + routeList[i].locStartNameE + "-" + routeList[i].locEndNameE + "\n"
                + "Fare: $" + routeList[i].fullFare + "\n" + "Journey Time: " + routeList[i].journeyTime)
            found = true
        }
    }
    if(!found){
        alert("Route not found")
    }
}