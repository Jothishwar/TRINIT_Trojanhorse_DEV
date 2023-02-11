// Request the calculated carbon footprint from the background.js file
chrome.runtime.sendMessage({ type: "calculateFootprint" }, function(response) {
  const carbonFootprint = response.carbonFootprint;
  if(carbonFootprint != null){
    document.getElementById("footprint").innerHTML = `Carbon Footprint: ${carbonFootprint.toFixed(2)} kg CO2`;
  }
});
