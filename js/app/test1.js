const wifi_class = require('https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassMiddleWIFIesp8266.min.js');
try {
  Serial3.setup(115200);
  let SSID = '';
  let PSWD = '';
    
  let wifi = new wifi_class(Serial3);  

} 
  catch(e) {
    console.log('Error!' + e);
}