chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var eventName = request.event;
  switch (eventName) {
    case "total_bytes":      
      /* Update stats users (co2, etc) */
      var idTab = sender.tab.id;

      var siteStats = getScore(request.bytes);
      var newData = {};
      newData[sender.tab.id] = siteStats;
      chrome.storage.local.set(newData, function (){});

      chrome.storage.local.get("user_statistics", function (retrieved_data) {  
        if(retrieved_data && retrieved_data.user_statistics) {
          var userStats = retrieved_data.user_statistics;
          userStats.bytes.value += request.bytes;
          userStats.co2.value += siteStats.co2.value;
          userStats.co2Renew.value += siteStats.co2Renew.value;
          userStats.energy.value += siteStats.energy.value;
          userStats.pagesDisplayed += 1;

          /* Save stats in storage */
          chrome.storage.local.set({user_statistics: userStats}, function (){});
          chrome.runtime.sendMessage({
            event: "show_total_stats", 
            statistics: {
              user: userStats, 
              tab: siteStats
            }
          });
        }
        else {
          var userStats = {
            bytes: {unit: "b", value: 0},
            co2: {unit: "g", value: 0},
            co2Renew: {unit: "g", value: 0},
            energy: {unit: "kWh", value: 0},
            pagesDisplayed: 0
          };

          userStats.bytes.value += request.bytes;
          userStats.co2.value += siteStats.co2.value;
          userStats.co2Renew.value += siteStats.co2Renew.value;
          userStats.energy.value += siteStats.energy.value;
          userStats.pagesDisplayed += 1;

          /* Save stats in storage */
          chrome.storage.local.set({user_statistics: userStats}, function (){});
          chrome.runtime.sendMessage({
            event: "show_total_stats", 
            statistics: {
              user: userStats, 
              tab: siteStats
            }
          });
        }
      });
      
      const details = {
        color: siteStats.color,
        tabId: parseInt(sender.tab.id)
      }
      chrome.action.setBadgeBackgroundColor(
        details
      )
      chrome.action.setBadgeText({
        text: siteStats.note,
        tabId: parseInt(sender.tab.id)
      });

    break;
    case "request_show_total_stats":      
      var idTab = request.id;
      chrome.storage.local.get("user_statistics", function (retrieved_data) {  
        if(retrieved_data && retrieved_data.user_statistics) {
          chrome.storage.local.get(idTab, function (sites_data) {  
            if(sites_data && sites_data[idTab]) {
              //Check ads && ads options
              chrome.runtime.sendMessage({
                event: "show_total_stats", 
                statistics: {
                  user: retrieved_data.user_statistics, 
                  tab: sites_data[idTab]
                }
              });
            }
          });
        }
      });      
    break;    
    default:
      return true;
  }
});

function energyConsumptionV2(bytes) {
  return bytes * (1.805 / 1073741824);
}

function getCo2GridV2(energy) {
  return energy * 475;
}

function getCo2RenewableV2(energy) {
  return ((energy * 0.1008) * 33.4) + ((energy * 0.8992) * 475);
}

/* This function needs to be split */
function getScore(totalBytes) {
  var energy = energyConsumptionV2(totalBytes);
  var co2 = getCo2GridV2(energy);
  var co2Renew = getCo2RenewableV2(energy);
  var note = 0;
  var color = "gray";

  if(co2 < 0.2) {
    note = "A+";
    color = "#20A432";
  }
  else if(co2 < 0.5) { 
    note = "A";
    color = "#20A432";
  }
  else if(co2 < 1.0) {
    note = "B";
    color = "#64E076";
  }
  else if(co2 < 1.5) {
    note = "C";
    color = "#E9E348";
  }
  else if(co2 < 2.0) {
    note = "D";
    color = "#ED902E";
  }
  else if(co2 < 2.5) {
    note = "E";
    color = "#D93625";
  }
  else {
    note = "F";
    color = "#D93625";
  }

  // Calculate here cursor position

  var cursorPosition = 0;

  if(co2 < 2.51){
    cursorPosition = parseFloat((co2 / 2.5) *100).toFixed(2);
  } else {
    cursorPosition = 98.5;
  }

  var cursorSection = null;

  if(co2 < 0.5){
    cursorSection = "green";
  }
  if(co2 >= 0.5 && co2 < 1){
    cursorSection = "light-green";
  }
  if(co2 >= 1 && co2 < 1.5){
    cursorSection = "yellow";
  }
  if(co2 >= 1.5 && co2 < 2){
    cursorSection = "orange";
  }
  if(co2 >= 2){
    cursorSection = "red";
  }

  // End of calculate cursor position
  var co2Arr = {unit: "g", value: co2};

  var co2RenewArr = {unit: "g", value: co2Renew};

  return {
    co2: co2Arr,
    co2Renew: co2RenewArr,
    energy: {unit: "kWh", value: energy},
    note: note,
    color: color,
    cursorPosition: cursorPosition,
    cursorSection: cursorSection
  }
}