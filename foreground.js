
function getTotalBytes() {
  var resources = window.performance.getEntriesByType("resource");

  //let ram = parseInt(window.performance.memory.usedJSHeapSize) / 1024 / 1024;

  let bytes = 0;
  let i;
  
  for(i = 0; i < resources.length; ++i) {
    if(resources[i].decodedBodySize) {
      if(resources[i].transferSize == 0){
          bytes += resources[i].encodedBodySize;
      } else{
          bytes += resources[i].transferSize;
      }
    }    
  }
  i = null;

  var pagebytes = document.querySelector('html').innerHTML.length;
  //var kbytes = pagebytes / 1024;

  const totalBytes = pagebytes + bytes;
  return totalBytes;
  
}


window.onload = function(e){ 
  var totalBytes = getTotalBytes();
  chrome.runtime.sendMessage({
    event: "total_bytes", bytes: totalBytes
  });
}
