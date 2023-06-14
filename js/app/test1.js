const wifi_class = require('https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassMiddleWIFIesp8266.min.js');
const UARTBus = require ('https://raw.githubusercontent.com/AlexGlgr/ModuleBaseUARTbus/fork-Alexander/js/module/ClassBaseUARTBus.min.js');
try {
  let SSID = '';
  let PSWD = '';

  let wifi = new wifi_class(B9, B10);

}
  catch(e) {
    console.log('Error!' + e);
}