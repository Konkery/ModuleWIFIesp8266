try {
  let SSID = "test";
  let PSWD = "test";
  let wrt = require("Storage").readJSON("APs.json", true);
  wrt.push({ssid: SSID, pass: PSWD});
  let res = require("Storage").writeJSON("APs.json", wrt); 

} 
  catch(e) {
    console.log('Error!' + e);
}