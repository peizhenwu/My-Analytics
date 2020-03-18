var reporter = {};
reporter.staticData = {};
reporter.performanceData = {};

window.addEventListener('load', getSessionCookie);
window.addEventListener('load', collectData);
window.addEventListener('beforeunload', updateStorage);
window.addEventListener('unload', sendAnalytics);

function getSessionCookie() {
  var xhr = new XMLHttpRequest();
  var url = "https://us-central1-my-analytics-3ed6f.cloudfunctions.net/sessionize";
  xhr.open('GET', url , true);
  xhr.withCredentials = true;
  xhr.send();
}

function collectData(){
  collectStaticData();
  collectPerformanceData();
}

function sendAnalytics(){
  let url = "https://us-central1-my-analytics-3ed6f.cloudfunctions.net/collect";
  let keys = Object.keys(localStorage);
  for(var i=0;i<keys.length;i++){
    let key = keys[i];
    let analyticsData = localStorage.getItem(key);
    let result = navigator.sendBeacon(url,`${key}%%${analyticsData}`);
  }
  localStorage.clear();
}

function collectStaticData(){
  let parser = new UAParser();
  let ua = parser.getResult();
  console.log(ua);
  reporter.staticData.userAgent = ua.browser.name;
  reporter.staticData.OS = ua.os.name;
  reporter.staticData.language = window.navigator.language;
  reporter.staticData.connectionType = window.navigator.connection.effectiveType;
}
function collectPerformanceData(){
  setTimeout(function(){
      reporter.performanceData.total = performance.timing.loadEventEnd - performance.timing.navigationStart;
      reporter.performanceData.dom = performance.timing.domContentLoadedEventEnd - performance.timing.domLoading
  }, 0);
}

function updateStorage(){
  let id = Date.now();
  reporter.performanceData.visit = Date.now() - performance.timing.loadEventEnd;
  localStorage.setItem(id, JSON.stringify(reporter));
  console.log(reporter);
}
