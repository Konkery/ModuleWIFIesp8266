/**
 * @class
 * Класс ClassEsp8266 реализует логику работы WiFi-модуля на чипе Esp8266.
 * Для работы класса требуется подключить модуль ModuleAppMath, где 
 * добавляется функция проверки на целочисленность, а так-же базовый класс,
 * разработанный Amperka
 * 
 * Тип для возвращения списка подключенных устройств
 * @typedef  {Object} ObjectDevice     - тип контейнер хранящий подключенные устройства
 * @property {string} ip               - Ip-адрес устройства
 * @property {string} mac              - Mac-адрес устройства
 * 
 * Тип для возвращения списка точек доступа, которые смог обнаружить модуль
 * @typedef  {Object} ObjectAP         - тип контейнер хранящий обнаруженные сети
 * @property {string} ip               - Ip-адрес сети
 * @property {string} enc              - метод аутентификации
 * @property {number} signal           - уровень сигнала в децибелах
 * @property {string} mac              - Mac-адрес устройства точки доступа
 * 
 * Тип для хранения опций при передаче сообщений по HTTP
 * @typedef  {Object} ObjectHTTPOpts   - тип контейнер хранящий опции
 * @property {string} host             - адрес хоста
 * @property {number} port             - номер порта (не обязателен, по-умолчанию -- 80)
 * @property {string} path             - путь на сервере
 * @property {string} method           - тип запроса (GET, POST...)
 * @property {string} protocol         - тип протокола (не обязателен)
 * @property {Object} headers          - хедеры (не обязательны)
 * 
 * Методы аутентификации следующие: open, wep, wpa_psk, wpa2_psk, wpa_wpa2_psk
 */
class ClassEsp8266WiFi {
    /**
     * @constructor
     * @param {Object} _rx      - порт rx шины UART, обязательное поле
     * @param {Object} _tx      - порт tx шины UART, обязательное поле
     */// удалить, потом добавить в конфигурацию. Основа - ESP32
    constructor(_rx, _tx) {
        //реализация паттерна синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassEsp8266WiFi.prototype.Instance = this;
        }

        this.name = 'ClassEsp8266WiFi'; //переопределяем имя типа
        this.wifi = undefined;
        this.ssid = undefined;
        this.pass = undefined;
        //this.InitBus(_rx, _tx);
        this.ScanForAPs();
        this.Connect();
	}
    /**
     * @method
     * Инициализирует шину для работы с вай-фай модулем
     * @param {Object} _rx      - порт rx шины UART, обязательное поле
     * @param {Object} _tx      - порт tx шины UART, обязательное поле
     */
    InitBus(_rx, _tx) {
        let bus_class = new UARTBus();
        let opt = {rx: _rx, tx: _tx, baud: 115200};
        this.bus = bus_class.AddBus(opt);
    }
    /**
     * @method
     * Сканирует окружение на наличие точек доступа и выбирает
     * из знакомых к какой подключится
     */
    ScanForAPs() {
        // функции те-жеб реквайр другой - как определить модуль, на котором мы работаем?
        let wifi;
        Serial3.setup(115200);
        if (true) {
            wifi = require("https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js").setup(Serial3, function (err) {
                if (err) {
                    console.log('Module connection error! ' + err)
                }
                wifi.getAPs(function(err, aps) {
                    if (err) {
                        console.log('Error looking for APs: ' + err)
                    }
                    else {
                        let found = aps.map(a => a.ssid);
                        let wrt = require("Storage").readJSON("APs.json", true);
                        console.log (found);

                        found.forEach(fName => {
                            wrt.forEach(sName => {
                                if (fName == sName.ssid) {
                                    this.ssid = sName.ssid;
                                    this.pass = sName.pass;
                                    return;
                                }
                               
                            })
                        })
                    }
                });
            })
        }
        else {
            wifi = require("wifi").setup(function (err) {
                if (err) {
                    console.log('Module connection error! ' + err)
                }
                wifi.getAPs(function(err, aps) {
                    if (err) {
                        console.log('Error looking for APs: ' + err)
                    }
                    else {
                        let found = aps.map(a => a.ssid);
                        let wrt = require("Storage").readJSON("APs.json", true);
                        let i = 0;
                        let j = 0;
                        
                        for (i; i < wrt.length; i++) {
                            for (j; j < found.length; j++) {
                                if (found[j] == wrt[i].ssid) {
                                    this.ssid = wrt[i].ssid;
                                    this.pass = wrt[i].pass;
                                    break;
                                }
                            }
                        }
                    }
                });
            })
        }
    }
    /**
     * @method
     * Создаёт новое подключение к уже
     * существующей WiFi-сети
     */
    Connect() {
        let wifi = require("https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js").setup(Serial3, function (err) {
            if (err) {
                console.log('Module connection error! ' + err);
            }
            wifi.connect (this.ssid, this.pass, function (err) {
                if (err) {
                    console.log(this.ssid + " " +  this.pass + '\nConnection failed! ' + err);
                }
                else {
                    console.log('Connected to ' + this.ssid);
                    // Бип! - добавить метод на писк бипера
                    wifi.getIP(function (emsg, ipAdress) {
                        if (emsg) {
                            throw new err (emsg, this.ecode);
                        }
                        console.log("IP: " + ipAdress);
                    });
                    //this.wifi = wifi;
                    //this.AddToList();
                }
            })            
        });
       
    }
    /**
     * @method
     * Метод добавляет текущее подключение в конфигурационный файл,
     * если сети там ещё нет
     */
    AddToList() {
        let i = 0;
        let flag = false;
        let wrt = require("Storage").readJSON("APs.json", true);
        for (i; i < wrt.length; i++) {
            if (this.ssid == wrt[i].ssid) {
                flag = true;
                break;
                }
            }
        if (!flag) {
            wrt.push({ssid: this.ssid, pass: this.pass});
            require("Storage").writeJSON("APs.json", wrt); 
        }
    }
    /**
     * @method
     * Возвращает IP адрес, полученный модулем от
     * точки доступа при подключении
     * @returns {Object} _ip   -ip адрес
     */
    GetIP() {
        let _ip;
        this.wifi.getIP(function (emsg, ipAdress) {
            if (emsg) {
                throw new err (emsg, this.ecode);
            }
            _ip = ipAdress;
        });
        return _ip;
    }
    /**
     * @method
     * Возвращает информацию о найденных точках доступа
     * @returns {ObjectAP} _aps  - найденные точки доступа
     */
    GetAPs() {
        let _aps;
        this.wifi.getAPs(function (emsg, aps) {
            if (emsg) {
                throw new err (emsg, this.ecode);
            }
            _aps = aps;
        });
        console.log(_aps);
        return _aps;
    }
    /**
     * @method
     * Возвращает версию прошивки модуля
     * @returns {string} _ver  - версия прошивки
     */
    GetVersion() {
        let _ver;
        this.wifi.getVersion(function(emsg, version) {
            if (emsg) {
                throw new err (emsg, this.ecode);
            }
            _ver = version;
          });
        return _ver;
    }
    // проверить какой ip
    /**
     * @method
     * Создаёт WiFi-сеть. Модуль начинает работать в
     * режиме точки доступа
     * @param {string}  _ssid - ssid создаваемой сети
     * @param {string}  _pass - пароль создаваемой сети
     * @param {number}  _chan - номер радиоканала
     * @param {string}  _enc  - метод аутентификации
     * @returns {string} _res - сообщение о создании сети
     */
    CreateAP(_ssid, _pass, _chan, _enc) {
        let _res = 'AP created';
        this.wifi.createAP(_ssid, _pass, _chan, _enc, function(emsg) {
            if (emsg) {
                throw new err (emsg, this.ecode);
            }
        });
        return _res;
    }
    /**
     * @method
     * Возвращает список подключенных устройств
     * в виде массива объектов. Каждый объект содержит
     * поля IP и Mac-адрессов
     * @returns {ObjectDevice} _devs - подключенные устройства
     */
    GetConnectedDevices() {
        let _devs;
        this.wifi.getConnectedDevices (function (emsg, devices) {
            if (emsg) {
                throw new err (emsg, this.ecode);
            }
            _devs = devices;
        });
        return _devs;
    }
}

exports = ClassEsp8266WiFi;