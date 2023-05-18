try {
    Serial3.setup(115200);
    let SSID = '';
    let PSWD = '';
    
    let wifi = require("https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js").setup(Serial3, function (err) {
        if (err) {
            console.log('Module connection error! ' + err)
        }
      Scan();
      //let scan = setInterval(() => Scan(), 5000);
    });

     //
     function Scan() {
        wifi.getAPs(function(err, aps) {
          if (err) {
              console.log('Error looking for APs: ' + err)
          }
          else {
              let res = aps.map(a => a.ssid)
              console.log(res);
          }
        });
   
  }
  }
  catch(e) {
    console.log('Error!');
  }