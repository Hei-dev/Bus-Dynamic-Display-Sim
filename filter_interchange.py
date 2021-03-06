import json

js = open("JSON_BUS.json","r", encoding="utf-8")
data = json.loads(js.read())
routeIdList = []
js.close()
print("Loading data...")
#dict_keys
# 'routeId' - route order
# 'companyCode' - company
# 'district' - the district
# 'routeNameC', 'routeNameS', 'routeNameE' - route ID
# 'routeType' - Route type
# 'serviceMode'
# 'specialType'
# 'journeyTime'
# 'locStartNameC'
# 'locStartNameS'
# 'locStartNameE'
# 'locEndNameC'
# 'locEndNameS'
# 'locEndNameE'
# 'fullFare'
# 'lastUpdateDate'
# 'rstop'
inp = ""
while inp=="":
    inp = input("Selection:\n1.Extract all routes ID\n2.Check for Interchange\n3. Check for stop contain words\n")
#print(data[0]["rstop"])
if inp == "1":
    for idat in data:
        routeIdList.append(idat["routeNameC"])
    routeIdList.sort()
    #print(routeIdList)
    js = open("data/allroutes.js","w")
    js.write("var allRouteIds = " + str(routeIdList))
    js.close()
if inp == "2":
    stopname = input("Stop name in Eng: ")
    for idat in data:
        #print(idat["rstop"])
        for jdat in idat["rstop"][0]["features"]:
            #print(jdat["properties"]["stopNameE"])
            if stopname.lower() in jdat["properties"]["stopNameE"].lower():
                routeIdList.append(idat["routeNameC"])
    routeIdList.sort()
    #print(routeIdList)
    js = open("data/routeStopList/" + stopname + ".json","w")
    js.write("" + str(routeIdList))
    js.close()
if inp == "3":
    dist = input("Keyword to find: ")
    for idat in data:
        #print(idat["rstop"])
        for jdat in idat["rstop"][0]["features"]:
            #print(jdat["properties"]["stopNameE"])
            if dist in jdat["properties"]["stopNameC"]:
                routeIdList.append(jdat["properties"]["stopNameC"])
    js = open("data/" + dist + ".js","w",encoding="utf-8")
    js.write("var Excludes = " + str(set(routeIdList)))
    js.close()