try {
    Serial3.setup(115200);
    let SSID = '';
    let PSWD = '';
    //https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js
    
    let wifi = require("https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js").setup(Serial3, function (errs) {
      wifi.connect(SSID, PSWD, function(err) {
      print('Connected');
        require('http').get('http://amperka.ru', function(res) {
        var response = '';
        res.on('data', function(d) { response += d; });
        res.on('close', function() { print(response); });
      });
      });
     wifi.getIP(function(errs, ip) {
      if (errs) print('error on reset:', errs);
      console.log(ip);
    });
      wifi.getAPs(function(err, aps) { console.log(aps); });
  });
  }
  catch(e) {
    console.log('Error!');
  }