const emissionFactor = 0.00505; // kg CO2 per MB of data transferred
let totalBytes = 10000000;

// Listen for web request events
chrome.webRequest.onCompleted.addListener(
  function(details) {
    totalBytes += details.totalBytes;
  },
  { urls: ["*://*/*"] }
);

// Send the calculated carbon footprint to the popup.html file
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "calculateFootprint") {
    const carbonFootprint = totalBytes * emissionFactor / 1048576;
    sendResponse({ carbonFootprint });
  }
});
