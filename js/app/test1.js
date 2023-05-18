try {
    Serial3.setup(115200);
    let SSID = '';
    let PSWD = '';
    
    let wifi = require("https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js").setup(Serial3, function (err) {
        if (err) {
            console.log('Module connection error! ' + err)
        }     
    });

    wifi.getAPs(function(err, aps) {
        if (err) {
            console.log('Error looking for APs: ' + err)
        }
        else {
            console.log(aps);
        }
    });
  }
  catch(e) {
    console.log('Error!');
  }