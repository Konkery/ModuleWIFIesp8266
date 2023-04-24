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
     * @param {Object} _Bus   - - объект класса UARTBus
     */
    constructor(_Bus) {
        //реализация паттерна синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassEsp8266WiFi.prototype.Instance = this;
        }

        this.name = 'ClassEsp8266WiFi'; //переопределяем имя типа
        this.wifi = undefined;
        this.ecode = 12;
        this.Init(_Bus);
	}
    /**
     * Метод начальной инициализации выкидывает ошибку, определенную в базовом классе,
     * если не удалось установить соединение
     * @param {Object} _Bus   - - объект класса UARTBus
     */
    Init(_Bus)
    {
        let req = 'https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js';
        //print(_Bus);
        print('Hey4');
        let wf = require(req).setup(_Bus, function(emsg) {
            if (emsg) {
                print('Hey3');
                throw new err (emsg, this.ecode);
            }
            print('Hey2');
        });
        print('Hey');
        this.wifi = wf;
    }
    /**
     * @method
     * Создаёт новое подключение к уже
     * существующей WiFi-сети
     * @param {string} _ssid    - SSID сети
     * @param {string} _pass    - пароль сети
     * @returns {string} _scs   - сообщение об успехе
     */
    Connect(_ssid, _pass) {
        let _scs = 'Conncetion successful';
        this.wifi.connect(_ssid, _pass, function(emsg) {
            if (emsg) {
                throw new err (emsg, this.ecode);
            }
          });
          return _scs;
    }
    // отладить возвращаемое значение, выкинуть мусор
    /**
     * @method
     * Возвращает IP адрес, полученный модулем от
     * точки доступа при подключении
     * @returns {string} _ip   -ip адрес
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