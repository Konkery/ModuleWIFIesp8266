var at;
var socks = [];
var sockData = ['', '', '', '', ''];
var MAXSOCKETS = 5;
var ENCR_FLAGS = ['open', 'wep', 'wpa_psk', 'wpa2_psk', 'wpa_wpa2_psk'];

let mdnsAdr;
let mdnsPrt;

function udpToIPAndPort(data) {
  return {
    ip : data.charCodeAt(0)+"."+data.charCodeAt(1)+"."+data.charCodeAt(2)+"."+data.charCodeAt(3),
    port : data.charCodeAt(5)<<8 | data.charCodeAt(4),
    len : data.charCodeAt(7)<<8 | data.charCodeAt(6) // length of data
  };
}

var netCallbacks = {
  create: function(host, port, type) {
    // Create a socket and return its index, host is a string, port is an integer.
    // If host isn't defined, create a server socket
    if (type == 2) {//UDP socket
      let sckt = 0;
      while (socks[sckt]!==undefined) sckt++; // find free socket
      if (sckt>=MAXSOCKETS) return -7; // SOCKET_ERR_MAX_SOCK
      sockData[sckt] = "";
      let cmd = `AT+CIPSTART=${sckt},"UDP","${mdnsAdr}",${mdnsPrt},${mdnsPrt},2\r\n`;
      socks[sckt] = "UDP";
      sockUDP[sckt] = true;
      at.cmd(cmd,10000,function cb(d) {
        //console.log("CIPSTART "+JSON.stringify(d));
        if (d=="ALREADY CONNECTED") return cb; // we're expecting an ERROR too
        // x,CONNECT should have been received between times. If it hasn't appeared, it's an error.
        if (d!="OK") socks[sckt] = -6; // SOCKET_ERR_NOT_FOUND
      });
    }
    else {
    var sckt;
    var self = this;
    if (host === undefined) {
      sckt = MAXSOCKETS;
      socks[sckt] = 'Wait';
      sockData[sckt] = '';
      at.cmd('AT+CIPSERVER=1,' + port + '\r\n', 10000, function(d) {
        if (d === 'OK') {
          socks[sckt] = true;
        } else {
          socks[sckt] = undefined;
          // setTimeout(function() {
          //   throw new Error('CIPSERVER failed ('+(d?d:'Timeout')+')');
          // }, 0);
          self.emit('err', 'CIPSERVER failed (' + (d ? d : 'Timeout') + ')');
        }
      });
      return MAXSOCKETS;
      } else {
        sckt = 0;
        while (socks[sckt] !== undefined) {
          sckt++; // find free socket
        }
        if (sckt >= MAXSOCKETS) {
          // throw new Error('No free sockets');
          self.emit('err', 'No free sockets');
          return null;
        }
        socks[sckt] = 'Wait';
        sockData[sckt] = '';
        at.cmd(
          'AT+CIPSTART=' +
            sckt +
            ',"TCP",' +
            JSON.stringify(host) +
            ',' +
            port +
            '\r\n',
          10000,
          function cb(d) {
            if (d === sckt + ',CONNECT') {
              socks[sckt] = true;
              return cb;
            }
            if (d === 'OK') {
              at.registerLine(sckt + ',CLOSED', function() {
                at.unregisterLine(sckt + ',CLOSED');
                socks[sckt] = undefined;
              });
            } else {
              socks[sckt] = undefined;
              // setTimeout(function() {
              //  throw new Error('CIPSTART failed ('+(d?d:'Timeout')+')');
              // }, 0);
              self.emit('err', 'CIPSTART failed (' + (d ? d : 'Timeout') + ')');
            }
          }
        );
      }
    }
    console.log(socks[sckt]);
    return sckt;
  },
  // Close the socket. returns nothing
  close: function(sckt) {
    if (socks[sckt] === 'Wait') {
      socks[sckt] = 'WaitClose';
    } else if (socks[sckt] !== undefined) {
      // socket may already have been closed (eg. received 0,CLOSE)
      // we need to a different command if we're closing a server
      at.cmd(
        (sckt === MAXSOCKETS ? 'AT+CIPSERVER=0' : 'AT+CIPCLOSE=' + sckt) +
          '\r\n',
        1000,
        function() {
          socks[sckt] = undefined;
        }
      );
    }
  },
  // Accept the connection on the server socket. Returns socket number or -1 if no connection
  accept: function() {
    for (var i = 0; i < MAXSOCKETS; i++) {
      if (sockData[i] && socks[i] === undefined) {
        socks[i] = true;
        return i;
      }
    }
    return -1;
  },
  // Receive data. Returns a string (even if empty).
  // If non-string returned, socket is then closed
  recv: function(sckt, maxLen) {

    console.log('Recv', socks[sckt]);
    if (sockData[sckt]) {
      var r;
      if (sockData[sckt].length > maxLen) {
        r = sockData[sckt].substr(0,maxLen);
        sockData[sckt] = sockData[sckt].substr(maxLen);
      } else {
        r = sockData[sckt];
        sockData[sckt] = "";
        if (socks[sckt]=="DataClose")
          socks[sckt] = undefined;
      }
      return r;
    }
    if (socks[sckt]<0) return socks[sckt]; // report an error
    if (!socks[sckt]) return -1; // close it
    return "";
    /*if (at.isBusy() || socks[sckt] === 'Wait') {
      return '';
    }
    if (sockData[sckt]) {
      var r;
      if (sockData[sckt].length > maxLen) {
        r = sockData[sckt].substr(0, maxLen);
        sockData[sckt] = sockData[sckt].substr(maxLen);
      } else {
        r = sockData[sckt];
        sockData[sckt] = '';
      }
      return r;
    }
    if (!socks[sckt]) {
      return -1; // close it
    }
    return '';*/
  },
  // Send data. Returns the number of bytes sent - 0 is ok.
  // Less than 0
  send: function(sckt, data) {
    if (socks[sckt] === 'UDP') {
      let d = udpToIPAndPort(data);
      let extra = ',"'+d.ip+'",'+d.port;
      data = data.substr(8,d.len);
      let returnVal = 8+d.len;

      console.log(d);

      at.cmd(`AT+CIPSEND=${sckt},${data.length+extra}\r\n`, 2000, function cb(d) {
        //console.log("SEND "+JSON.stringify(d));
        if (d=="OK") {
          at.register('> ', function(l) {
            at.unregister('> ');
            at.write(data);
            return l.substr(2);
          });
        } else if (d=="Recv "+data.length+" bytes" || d=="busy s...") {
          console.log(d);
          // all good, we expect this
          // Not sure why we get "busy s..." in this case (2 sends one after the other) but it all seems ok.
        } else if (d=="SEND OK") {
          // we're ready for more data now
          if (socks[sckt]=="WaitClose") netCallbacks.close(sckt);
          console.log(d);
          socks[sckt]=true;
          return;
        } else {
          console.log(d);
          socks[sckt]=undefined; // uh-oh. Error. If undefined it was probably a timeout
          at.unregister('> ');
          return;
        }
        return cb;
      });
      // if we obey the above, we shouldn't get the 'busy p...' prompt
      socks[sckt]="Wait"; // wait for data to be sent
      return returnVal;
    } else {
      if (at.isBusy() || socks[sckt] === 'Wait') {
        return 0;
      }
      if (!socks[sckt]) {
        return -1; // error - close it
      }
      // console.log('Send',sckt,data);
      var cmd = 'AT+CIPSEND=' + sckt + ',' + data.length + '\r\n';
      at.cmd(cmd, 10000, function cb(d) {
        if (d === 'OK') {
          at.register('> ', function() {
            at.unregister('> ');
            at.write(data);
            return '';
          });
          return cb;
        } else if (d === 'Recv ' + data.length + ' bytes') {
          // all good, we expect this
          return cb;
        } else if (d === 'SEND OK') {
          // we're ready for more data now
          if (socks[sckt] === 'WaitClose') {
            netCallbacks.close(sckt);
          }
          socks[sckt] = true;
        } else {
          socks[sckt] = undefined; // uh-oh. Error.
          at.unregister('> ');
        }
      });
      // if we obey the above, we shouldn't get the 'busy p...' prompt
      socks[sckt] = 'Wait'; // wait for data to be sent
      return data.length;
    }
  }
};

// Handle +IPD input data from ESP8266
function ipdHandler(line) {
  console.log('Handler called');
  var colon = line.indexOf(':');
  if (colon < 0) {
    return line; // not enough data here at the moment
  }
  var parms = line.substring(5, colon).split(',');
  parms[1] = 0 | parms[1];
  var len = line.length - (colon + 1);
  var sckt = parms[0];
  if (sockUDP[sckt]) {
    var ip = (parms[2]||"0.0.0.0").split(".").map(function(x){return 0|x;});
    var p = 0|parms[3]; // port
    sockData[sckt] += String.fromCharCode(ip[0],ip[1],ip[2],ip[3],p&255,p>>8,len&255,len>>8);
  }
  if (len >= parms[1]) {
    // we have everything
    sockData[parms[0]] += line.substr(colon + 1, parms[1]);
    return line.substr(colon + parms[1] + 1); // return anything else
  } else {
    // still some to get
    /*sockData[parms[0]] += line.substr(colon + 1, len);
    return '+IPD,' + parms[0] + ',' + (parms[1] - len) + ':'; // return IPD so we get called next time*/
    sockData[sckt] += line.substr(colon+1,len);
    at.getData(parms[1]-len, function(data) { sockData[sckt] += data; });
    return "";
  }
}

function sckOpen(ln) {
  var sckt = ln[0];
  //console.log("SCKOPEN", JSON.stringify(ln),"current",JSON.stringify(socks[sckt]));
  if (socks[sckt]===undefined && socks[MAXSOCKETS]) {
    // if we have a server and the socket randomly opens, it's a new connection
    socks[sckt] = "Accept";
  } else if (socks[sckt]=="Wait") {
    // everything's good - we're connected
    socks[sckt] = true;
  } else {
    // Otherwise we had an error - timeout? but it's now open. Close it.
    at.cmd('AT+CIPCLOSE='+sckt+'\r\n',1000, function() {
      socks[sckt] = undefined;
    });
  }
}

function sckClosed(ln) {
  //console.log("CLOSED", JSON.stringify(ln));
  socks[ln[0]] = sockData[ln[0]]!="" ? "DataClose" : undefined;
}

var ESP8266 = {
  ipdHandler: ipdHandler,
  debug: function() {
    return {
      socks: socks,
      sockData: sockData
    };
  },
  // initialise the ESP8266
  init: function(callback) {
    at.cmd('ATE0\r\n', 1000, function cb(d) {
      // turn off echo
      if (d === 'ATE0') {
        return cb;
      }
      if (d === 'OK') {
        at.cmd('AT+CIPMUX=1\r\n', 1000, function(d) {
          // turn on multiple sockets
          if (d !== 'OK') {
            callback('CIPMUX failed: ' + (d ? d : 'Timeout'));
          } else {
            callback(null);
          }
        });
      } else {
        callback('ATE0 failed: ' + (d ? d : 'Timeout'));
      }
    });
  },
  reset: function(callback) {
    at.cmd('\r\nAT+RST\r\n', 10000, function cb(d) {
      // console.log('>>>>>'+JSON.stringify(d));
      // 'ready' for 0.25, 'Ready.' for 0.50
      if (d === 'ready' || d === 'Ready.') {
        setTimeout(function() {
          ESP8266.init(callback);
        }, 1000);
      } else if (d === 'jump to run user1 @ 1000') {
        setTimeout(function() {
          ESP8266.init(callback);
        }, 5000);
      } else {
        if (d === undefined) {
          callback('No "ready" after AT+RST');
        } else {
          return cb;
        }
      }
    });
  },
  getVersion: function(callback) {
    at.cmd('AT+GMR\r\n', 1000, function(d) {
      // works ok, but we could get more data
      callback(null, d);
    });
  },
  connect: function(ssid, key, callback) {
    at.cmd('AT+CWMODE=1\r\n', 1000, function(cwm) {
      if (cwm !== 'no change' && cwm !== 'OK') {
        callback('CWMODE failed: ' + (cwm ? cwm : 'Timeout'));
      } else {
        at.cmd(
          'AT+CWJAP=' +
            JSON.stringify(ssid) +
            ',' +
            JSON.stringify(key) +
            '\r\n',
          20000,
          function cb(d) {
            if (
              [
                'WIFI DISCONNECT',
                'WIFI CONNECTED',
                'WIFI GOT IP',
                '+CWJAP:1'
              ].indexOf(d) >= 0
            ) {
              return cb;
            }

            if (d !== 'OK') {
              setTimeout(
                callback,
                0,
                'WiFi connect failed: ' + (d ? d : 'Timeout')
              );
            } else {
              setTimeout(callback, 0, null);
            }
          }
        );
      }
    });
  },
  getAPs: function(callback) {
    var aps = [];
    at.cmdReg(
      'AT+CWLAP\r\n',
      5000,
      '+CWLAP:',
      function(d) {
        var ap = d.slice(8, -1).split(',');
        aps.push({
          ssid: JSON.parse(ap[1]),
          enc: ENCR_FLAGS[ap[0]],
          signal: parseInt(ap[2]),
          mac: JSON.parse(ap[3])
        });
      },
      function() {
        callback(null, aps);
      }
    );
  },
  getConnectedAP: function(callback) {
    var con;
    at.cmdReg(
      'AT+CWJAP?\r\n',
      1000,
      '+CWJAP:',
      function(d) {
        con = JSON.parse(d.slice(7));
      },
      function() {
        callback(null, con);
      }
    );
  },
  createAP: function(ssid, key, channel, enc, callback) {
    at.cmd('AT+CWMODE=2\r\n', 1000, function(cwm) {
      if (cwm !== 'no change' && cwm !== 'OK' && cwm !== 'WIFI DISCONNECT') {
        callback('CWMODE failed: ' + (cwm ? cwm : 'Timeout'));
      }
      var encn = enc ? ENCR_FLAGS.indexOf(enc) : 0;
      if (encn < 0) {
        callback('Encryption type ' + enc + ' not known - ' + ENCR_FLAGS);
      } else {
        at.cmd(
          'AT+CWSAP=' +
            JSON.stringify(ssid) +
            ',' +
            JSON.stringify(key) +
            ',' +
            channel +
            ',' +
            encn +
            '\r\n',
          5000,
          function(cwm) {
            if (cwm !== 'OK') {
              callback('CWSAP failed: ' + (cwm ? cwm : 'Timeout'));
            } else {
              callback(null);
            }
          }
        );
      }
    });
  },
  getConnectedDevices: function(callback) {
    var devs = [];
    this.at.cmd('AT+CWLIF\r\n', 1000, function r(d) {
      if (d === 'OK') {
        callback(null, devs);
      } else if (d === undefined || d === 'ERROR') {
        callback('Error');
      } else {
        var e = d.split(',');
        devs.push({ ip: e[0], mac: e[1] });
        return r;
      }
    });
  },
  getIP: function(callback) {
    var ip;
    at.cmdReg(
      'AT+CIFSR\r\n',
      1000,
      '+CIFSR',
      function(d) {
        if (!ip && d.indexOf(',') >= 0) {
          ip = JSON.parse(d.slice(d.indexOf(',') + 1));
        }
      },
      function(d) {
        if (d !== 'OK') {
          callback('CIFSR failed: ' + d);
        } else {
          callback(null, ip);
        }
      }
    );
  },
  setIP: function(settings, callback) {
    var cmd, timeout;
    if (typeof settings!="object" || !settings.ip) {
      cmd = "AT+CWDHCP_CUR=1,1\r\n";
      timeout = 20000;
    } else {
      var args = [JSON.stringify(settings.ip)];
      if (settings.gw) {
        args.push(JSON.stringify(settings.gw));
        args.push(JSON.stringify(settings.netmask||"255.255.255.0"));
      }
      cmd = "AT+CIPSTA_CUR="+args.join(",")+"\r\n";
      timeout = 3000;
    }
    at.cmd(cmd, timeout, function(d) {
      if (d=="OK") callback(null);
      else return callback("setIP failed: "+(d?d:"Timeout"));
    });
  },
  setMDNS: function(hostname, serviceType, port, callback) {
    //at.cmd("AT+MDNS=1,\"espressif\",\"_printer\",35,\"my_instance\",\"_tcp\",2,\"product\",\"my_printer\",\"firmware_version\",\"AT-V3.4.1.0\"\r\n", 500, function(d) {
    at.cmd("AT+MDNS=1,\""+ hostname + "\",\""+ serviceType + "\"," + port +"\r\n",500,function(d) {
      callback(d=="OK"?null:d);
    });
  },
  setSNTP: function(hostname, port) {
    mdnsAdr = hostname;
    mdnsPrt = port;
  }
};


exports.setup = function(usart, connectedCallback) {
  if (typeof usart === 'function') {
    connectedCallback = usart;
    usart = PrimarySerial;
    usart.setup(115200);
  }

  ESP8266.at =  at = require('AT').connect(usart);
  require('NetworkJS').create(netCallbacks);

  netCallbacks.on('err', function(e) {
    ESP8266.emit('err', e);
  });

  at.register('+IPD', ipdHandler);
  at.registerLine("0,CONNECT", sckOpen);
  at.registerLine("1,CONNECT", sckOpen);
  at.registerLine("2,CONNECT", sckOpen);
  at.registerLine("3,CONNECT", sckOpen);
  at.registerLine("4,CONNECT", sckOpen);
  at.registerLine("0,CLOSED", sckClosed);
  at.registerLine("1,CLOSED", sckClosed);
  at.registerLine("2,CLOSED", sckClosed);
  at.registerLine("3,CLOSED", sckClosed);
  at.registerLine("4,CLOSED", sckClosed);

  ESP8266.reset(connectedCallback);

  return ESP8266;
};
