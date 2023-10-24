const err = require('https://raw.githubusercontent.com/Konkery/ModuleAppError/main/js/module/ModuleAppError.min.js');
const NumIs = require('https://raw.githubusercontent.com/Konkery/ModuleAppMath/main/js/module/ModuleAppMath.min.js');
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

const bus_class = require('https://raw.githubusercontent.com/AlexGlgr/ModuleBaseUARTbus/fork-Alexander/js/module/ClassBaseUARTBus.min.js');
const wifi_class = require('https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassMiddleWIFIesp8266.min.js');

try {
  let busMain = new bus_class();
//  console.log(busMain);
  let bus = busMain.AddBus({rx:A0, tx:A6, baud:115200});
//  console.log(bus.IDbus);
  //console.log(Serial18);
  let wifi = new wifi_class(bus.IDbus);
//  let res = wifi.GetAPs();
//  console.log(res);
//  console.log(wifi);
  
}
catch(e) {
  console.log('Error!' + e.Message);
}