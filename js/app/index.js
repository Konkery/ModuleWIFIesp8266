const err = require('https://raw.githubusercontent.com/Konkery/ModuleAppError/main/js/module/ModuleAppError.min.js');
const NumIs = require('https://raw.githubusercontent.com/Konkery/ModuleAppMath/main/js/module/ModuleAppMath.min.js');
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

const bus_class = require('https://raw.githubusercontent.com/AlexGlgr/ModuleBaseUARTbus/fork-Alexander/js/module/ClassBaseUARTBus.min.js');
const wifi_class = require('https://github.com/AlexGlgr/ModuleMiddleWIFIesp8266/blob/fork-Alexander/js/module/ClassMiddleWIFIesp8266.min.js');

try {
  let bus = new bus_class(A0, A6, 115200);
  console.log(bus);
  let wifi = new wifi_class(bus);

  //wifi.netCallBack();
  //wifi.create('www.google.com', 80);
  
}
catch(e) {
  console.log('Error!');
}