let translations = {
  "fr": {
    "title": "CO2 émis par la page web",
    "carbonLevel": {
      "low": "Empreinte carbone très faible",
      "weak": "Empreinte carbone faible",
      "moderate": "Empreinte carbone modérée",
      "high": "Empreinte carbone élevée",
      "veryhigh": "Empreinte carbone très élevée",
    },
    "subtitle": "Informations sur la session",
    "sub_pages_title": "Pages visitées",
    "sub_Co2_title": "CO2 émis",
    "sub_coal_title": "Équivalent charbon",
    "madewith": "Réalisé avec",
    "madewithby": "par"
  },
  "us": {
    "title": "CO<sub>2</sub> emission of the web page",
    "carbonLevel": {
      "low": "Very low carbon footprint",
      "weak": "Low carbon footprint",
      "moderate": "Moderate carbon footprint",
      "high": "High carbon footprint",
      "veryhigh": "Very high carbon footprint",
    },
    "subtitle": "Session informations",
    "sub_pages_title": "No. of Pages",
    "sub_Co2_title": "Total emission",
    "sub_coal_title": "Coal equivalent",
    "madewith": "Made with",
    "madewithby": "by"
  }
}

let current_lang = navigator.language || navigator.userLanguage;
current_lang = (current_lang == 'fr-FR') ? 'fr' : 'us';

function displayTotalStats(stats) {
  if(stats && stats.co2) {
    var displayValCo2 = Math.round((parseFloat(stats.co2.value) + Number.EPSILON) * 100) / 100;
    var unit = 'g';
    if(displayValCo2 > 1000000)
    {
      displayValCo2 = (displayValCo2 / 1000 / 1000).toFixed(2);
      unit = 'T';
    }
    else if(displayValCo2 > 1000)
    {
      displayValCo2 = (displayValCo2 / 1000).toFixed(2);
      unit = 'kg';
    }

    document.querySelector('#total-co2 p').textContent = displayValCo2 + ' ' + unit;
  }
  if(stats && stats.energy) {
    const valCoal = parseFloat(stats.energy.value) * 1000 * 1000 / 2460;
    var displayValCoal = Math.round((parseFloat(valCoal) + Number.EPSILON) * 100) / 100;
    var unit = 'g';
    if(displayValCoal > 1000000) 
    {
      displayValCoal = (displayValCoal / 1000 / 1000).toFixed(2);
      unit = 'T';
    }
    else if(displayValCoal > 1000) 
    {
      displayValCoal = (displayValCoal / 1000).toFixed(2);
      unit = 'kg';
    }
    document.querySelector('#total-coal p').textContent = displayValCoal + ' ' + unit;
  }
  if(stats) {
    document.querySelector('#total-pages p').textContent = stats.pagesDisplayed;
  }
}

function displayStats(stats) {
  if(stats && stats.co2) {
    const displayVal = Math.round((parseFloat(stats.co2.value) + Number.EPSILON) * 100) / 100;
    document.querySelector('#co2 span').textContent = displayVal + ' ' + stats.co2.unit;
  }

  document.querySelector('.cursor').style.cssText += 'margin-left:'+stats.cursorPosition+'%';
  document.querySelector('.cursor').classList.add(stats.cursorSection);
  document.querySelector('#co2').classList.add(stats.cursorSection);

  if(stats.cursorSection === "green"){
    document.querySelector('.result p .message').textContent = translations[current_lang].carbonLevel.low;
  }
  if(stats.cursorSection === "light-green"){
    document.querySelector('.result p .message').textContent = translations[current_lang].carbonLevel.weak;
  }
  if(stats.cursorSection === "yellow"){
    document.querySelector('.result p .message').textContent = translations[current_lang].carbonLevel.moderate;
  }
  if(stats.cursorSection === "orange"){
    document.querySelector('.result p .message').textContent = translations[current_lang].carbonLevel.high;
  }  
  if(stats.cursorSection === "red"){
    document.querySelector('.result p .message').textContent = translations[current_lang].carbonLevel.veryhigh;
  }
}

function initPopup() {
  document.querySelector('h1').innerHTML = translations[current_lang].title;
  document.querySelector('h2').innerHTML = translations[current_lang].subtitle;
  document.querySelector('#total-pages h3').innerHTML = translations[current_lang].sub_pages_title;
  document.querySelector('#total-co2 h3').innerHTML = translations[current_lang].sub_Co2_title;
  document.querySelector('#total-coal h3').innerHTML = translations[current_lang].sub_coal_title;
}

function initEvents() {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch(request.event) {
      case "show_total_stats":
        displayTotalStats(request.statistics.user);
        displayStats(request.statistics.tab);
      break;
    }
  });
}


document.addEventListener('DOMContentLoaded', function () {
  initPopup();
  initEvents();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabArray) {
    chrome.runtime.sendMessage({
      event: "request_show_total_stats",
      id: tabArray[0].id.toString()
    });
  });  
});