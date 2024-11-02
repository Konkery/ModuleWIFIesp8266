const MSG_WIFI_CONNECTED = 'Connected! IP: ';


/**
 * @class
 * Модуль обеспечивает работу платформы с чипом ESP8266,
 * обеспечивающим WiFi-соединение
 */
class ClassWifi {
    /**
     * @constructor
     */
    constructor () {
        //Синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassWifi.prototype.Instance = this;
        }
        this._Name = 'Network';
        this._Core;
        this._Ssid;
        this._Scan;
        this._Ip;
        this._mDNS = '';
    }
    /**
     * @method
     * Запускает колбэк на подключение к доступным известным сетям
     * @param {Object} nc
     * @param {Object} bus
     */
    Init(nc, bus, callback) {
        if (bus) {
            // console.log(nc);//ClassBaseWIFIe
            this._Core = require('Esp8266.min.js').setup(bus, (err) => {
                if (err) {
                    Logger.Log(this._Name, Logger.LogLevel.ERROR, err);
                    callback(false);
                }
                else {
                    Logger.Log(this._Name, Logger.LogLevel.INFO, 'Using ESP8266.');
                    esp = 'esp8266';
                    this.MainSequence(nc, esp, callback);
                }
            });
        }
        else {
            this._Core = require('Wifi');
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'Found build-in library.');
            esp = 'esp32';
            this.MainSequence(nc, esp, callback);
        }
    }
    /**
     * @method
     * Основной цикл подключения к точке доступа
     * @param {Object} nc           - объект с информацией о подключении
     * @param {String} esp          - имя чипа Wifi
     * @param {Function} callback   - функция возврата 
     */
    MainSequence (nc, esp, callback) {
        this.GetAPCreds(nc, (pass) => {
            this.Connect(pass, (res) => {
                this.SetStatic(nc, () => {
                    this.SetMDNS(nc, esp, () => {
                        this.SetNTP(nc, esp, () => {
                                callback(res);
                        });
                    });
                });
            });
        });
    }
    /**
     * @method
     * @description
     * Возвращает SSID и пароль точки доступа,
     * к которой происходит подключение
     * @param {Object} nc           - объект с информацией о подключении
     * @param {Function} callback   - функция, возвращающая пароль 
     */
    GetAPCreds(nc, callback) {
        if (nc.scan == 1) {
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'Scanning the net. . .');
            this._Core.scan((scn) => {
                this._Scan = scn;
                let pass = this.GetNetPassword(this._Scan);
                callback(pass);
            })
        }
        else {
            this._Ssid = nc.accpoints[0].ssid;
            let pass = nc.accpoints[0].pass;
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'Net scan skipped.');
            callback(pass);
        }
    }
    /**
     * @method
     * Устанавливает соединение с выбранной точкой доступа
     * @param {String} pass         - пароль к точке доступа 
     * @param {Function} callback   - функция возврата 
     */
    Connect(pass, callback) {
        Logger.Log(this._Name, Logger.LogLevel.INFO, `Got credentials. Attempting establish connection to ${this._Ssid}.`);
        this._Core.connect(this._Ssid, { password : pass }, (err) => {
            if (err) {
                Logger.Log(this._Name, Logger.LogLevel.ERROR, `Conncetion failed!`);
                callback(false);
            }
            else {
                this._Core.getIP((err, info) => {
                    if (err) {
                        Logger.Log(this._Name, Logger.LogLevel.ERROR, `Cannot get proveded IP`);
                        callback(false);
                    }
                    else {
                        this._Ip = info.ip;
                        Logger.Log(this._Name, Logger.LogLevel.INFO, MSG_WIFI_CONNECTED + this._Ip);
                        callback(true);
                    }
                });
            }
        });
    }
    /**
     * @method
     * Устанавливает статический IP, если выбрана соответствующая опция
     * @param {Object} nc           - объект с информацией о подключении
     * @param {Function} callback   - функция возврата 
     */
    SetStatic(nc, callback) {
        if (nc.usestatic == 1) {
            let settings = {ip: nc.staticconf.ip, gw: nc.staticconf.gw, netmask: nc.staticconf.nm};
            this._Core.setIP (settings, (err) => {
                if (err) {
                    Logger.Log(this._Name, Logger.LogLevel.ERROR, `Failed to set static IP address`);
                }
                else {
                    Logger.Log(this._Name, Logger.LogLevel.INFO, `Static IP set to ${nc.staticconf.ip}`);
                }
                callback();
            });
        }
        else {
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'Static IP setup skipped!');
            callback();
        }
    }
    /**
     * @method
     * Устанавливает mDNS имя узла, если выбрана соответствующая опция
     * @param {Object} nc           - объект с информацией о подключении
     * @param {String} esp          - имя чипа Wifi
     * @param {Function} callback   - функция возврата 
     */
    SetMDNS(nc, esp, callback) {
        if ((typeof nc.mdns.hostname !== 'undefined') && 
            (nc.mdns.hostname != this._mDNS)) {
            if (esp == 'esp8266') {
                this._Core.setMDNS(nc.mdns.hostname, nc.mdns.serviceType, nc.mdns.port, (err) => {
                    if (err) {
                        Logger.Log(this._Name, Logger.LogLevel.ERROR, `Failed to set MDNS name!`);
                    }
                    else {
                        this._mDNS = nc.mdns.hostname;
                        Logger.Log(this._Name, Logger.LogLevel.INFO, `MDNS name: ${nc.mdns.hostname}.local`);
                    }
                    callback();
                });
            }
            else if (esp == 'esp32') {
                this._Core.setHostname(nc.mdns.hostname, () => {
                    this._mDNS = nc.mdns.hostname;
                    Logger.Log(this._Name, Logger.LogLevel.INFO, `MDNS name: ${nc.mdns.hostname}.local`);
                    callback();
                });
            }
            else {
                Logger.Log(this._Name, Logger.LogLevel.WARN, 'Unknown WiFi chip!');
                callback();
            }
        }
        else {
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'MDNS setup skipped!');
            callback();
        }
    }
    /**
     * @method
     * Устанавливает адрес NTP сервера для синхронизации времени
     * @param {Object} nc           - объект с информацией о подключении
     * @param {String} esp          - имя чипа Wifi
     * @param {Function} callback   - функция возврата 
     */
    SetNTP(nc, esp, callback) {
        if (typeof nc.ntp.hostname !== 'undefined') {
            if (esp == 'esp8266') {
                this.SetNTPESP8266(nc.ntp.hostname, nc.ntp.port, () => {
                    E.setTimeZone(nc.ntp.timezone);
                    callback();
                });
            }
            else if (esp == 'esp32') {
                this.SetNTPESP32(nc.ntp.hostname, nc.ntp.timezone);
                E.setTimeZone(nc.ntp.timezone);
                Logger.Log(this._Name, Logger.LogLevel.INFO, 'NTP: Time updated!');
                callback();
            }
        }
        else {
            callback();
        }
    }
    /**
     * @method
     * Находит соответствие между найденными сетями с теми, что описаны в объекте aps
     * @param {Object}      _aps
     * @returns {String}    pass
     */
    GetNetPassword(_aps) {
        let found = this._Scan.map(a => a.ssid);
        let pass;
        found.forEach(fName => {
            _aps.forEach(sName => {
                if (fName == sName.ssid) {
                    this._Ssid = sName.ssid;
                    pass = sName.pass;
                }                               
            });
        });
        return pass;
    }
    SetNTPESP32(_host, _tz) {
        this._Core.setSNTP(_host, _tz.toString());
    }
    /**
     * @method
     * Возвращает время с ntp сервера
     * @param {String}      _host
     * @returns {Number}    time
     */
    SetNTPESP8266(_host, _port, callback) {
        this._Core.setUDP(_host, _port);

        const socket = require('dgram').createSocket('udp4');

        socket.on('error', (err) => {
            Logger.Log(this._Name, Logger.LogLevel.ERROR, `NTP error: ${err.message}!`);
            callback();
        });

        socket.on('message', (msg, rinfo) => {
            let buffer = E.toArrayBuffer(msg);
            const dv = new DataView(buffer);
            const timestamp = this.NTPtoMsecs(dv, 40);
            setTime(timestamp / 1000);
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'NTP: Time updated!');
            callback();
        });
        
        socket.on('close', () => {
            Logger.Log(this._Name, Logger.LogLevel.INFO, 'NTP socket closed!');
        });

        let message = new Uint8Array(48);
        message[0] = (0 << 6) + (3 << 3) + (3 << 0);
        for (let i = 1; i < 48; i++)
            message[i] = 0;

        socket.send(E.toString(message), _port, _host, (err, bytes) => {
        if (err || bytes !== 48) {
                Logger.Log(this._Name, Logger.LogLevel.ERROR, 'Cannot send NTP request!');
                callback();
            }
        });
    }
    NTPtoMsecs(dv, offset) {
        let seconds = dv.getUint32(offset);
        let fraction = dv.getUint32(offset + 4);
        return (seconds - 2208988800 + (fraction / Math.pow(2, 32))) * 1000;
    }
    UDPHost(_host, _port) {
        if (esp == 'esp8266') {
            this._Core.setUDP(_host, _port);
        }
    }
}

exports = ClassWifi;