/**
 * @class
 * Класс ClassEsp8266 реализует логику работы WiFi-модуля на чипе Esp8266.
 * Для работы класса требуется подключить модуль ModuleAppMath, где 
 * добавляется функция проверки на целочисленность, а так-же базовый класс.
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
class ClassWiFiEsp8266 {
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
            ClassWiFiEsp8266.prototype.Instance = this;
        }

        this._Name = 'ClassEsp8266WiFi'; //переопределяем имя типа
        this._Wifi = undefined;
        this._Bus = undefined;
        this._Ssid = undefined;
        this._Scan = undefined;
        this._Ip = undefined;
        this.Init(_rx, _tx);
	}
    /**
     * @method
     * Инициализирует шину для работы с вай-фай модулем
     * @param {Object} _rx      - порт rx шины UART, обязательное поле
     * @param {Object} _tx      - порт tx шины UART, обязательное поле
     */
    InitBus(_rx, _tx) {
        if (_rx && _tx) {
            let opt = {rx: _rx, tx: _tx, baud: 115200};
            this._Bus = UARTbus.AddBus(opt);
        }
    }
    /**
     * @method
     * Сканирует окружение на наличие точек доступа и выбирает
     * из знакомых к какой подключится, и осуществляет подключение
     * @param {Object} _rx      - порт rx шины UART, нужен для запуска шины
     * @param {Object} _tx      - порт tx шины UART, нужен для запуска шины
     */
    Init(nc, bus, callback) {
        if (process.env.MODULES.includes("Wifi")) {
            this._Wifi = require("Wifi");
            let pass;
            this._Wifi.scan((aps) => {
                this._Scan = aps;
                let s = require("Storage");
                if (!(s.list().includes("APs.json"))) {
                    throw "No JSON file found!";
                }
                let found = aps.map(a => a.ssid);
                let wrt = s.readJSON("APs.json", true);

                found.forEach(fName => {
                    wrt.forEach(sName => {
                        if (fName == sName.ssid) {
                            this._Ssid = sName.ssid;
                            pass = sName.pass;
                        }                               
                    });
                });
                this._Wifi.connect(this._Ssid, { password : pass }, (err) => {
                    if (err) {
                        throw err;
                    }
                    this._Wifi.getIP((err, info) => {
                        if (err) {
                            throw err;
                        }
                        this._Ip = info.ip;            
                    });
                });
            });
        }
        else {
            //this.InitBus(_rx, _tx);
            let pass;
            PrimarySerial.setup(115200);
            this._Wifi = require("ClassBaseWIFIesp8266.min.js").setup(PrimarySerial, ((err) => {
                if (err) {
                    throw err;                    
                }
                this._Wifi.getAPs((err, aps) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        this._Scan = aps;
                        let s = require("Storage");
                        if (!(s.list().includes("APs.json"))) {
                            throw "No JSON file found!";
                        }
                        let found = aps.map(a => a.ssid);
                        let wrt = s.readJSON("APs.json", true);

                        found.forEach(fName => {
                            wrt.forEach(sName => {
                                if (fName == sName.ssid) {
                                    this._Ssid = sName.ssid;
                                    pass = sName.pass;
                                }                               
                            });
                        });
                        this._Wifi.connect (this._Ssid, pass, ((err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                this._Wifi.getIP((emsg, ipAdress) => {
                                    if (emsg) {
                                        throw err;
                                    }
                                    this._Ip = ipAdress;
                                    callback();
                                });
                            }
                        }));
                    }
                });                
            }));
        }            
    }
}

exports = ClassWiFiEsp8266;