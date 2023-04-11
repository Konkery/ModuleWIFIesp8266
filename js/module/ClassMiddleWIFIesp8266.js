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
 * Методы аутентификации следующие: open, wep, wpa_psk, wpa2_psk, wpa_wpa2_psk
 */
class ClassEsp8266 {
    /**
     * @constructor
     * @param {Object} _Bus   - - объект класса UARTBus
     */
    constructor() {
        this.name = 'ClassEsp8266'; //переопределяем имя типа
        this.wifi = require('https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassBaseWIFIesp8266.min.js').setup(_Bus, callback);
	}
    /**
     * @method
     * Создаёт новое подключение к уже
     * существующей WiFi-сети
     * @param {string} _ssid  - SSID сети
     * @param {string} _pass  - пароль сети
     */
    Connect(_ssid, _pass) {
        this.wifi.connect(_ssid, _pass, function(err) {
            print('Connected');
            // Выполняем запрос - для проверки
            require('http').get('http://amperka.ru', function(res) {
              var response = '';
              res.on('data', function(d) { response += d; });
              res.on('close', function() { print(response); });
            });
          });
    }
    /**
     * @method
     * Возвращает IP адрес, полученный модулем от
     * точки доступа при подключении
     * @returns {string} _ip   -ip адрес
     */
    GetIP() {
        let _ip;
        this.wifi.getIP(function (err, ipAdress) {
            _ip = ipAdress;
        });
        return _ip;
    }
    /**
     * @method
     * Возвращает информацию о найденных точках доступа
     * @returns {ObjectAP} _aps  -найденные точки доступа
     */
    GetAPs() {
        let _aps;
        this.wifi.getAPs(function (err, aps) {
            _aps = aps;
        });
        return _aps;
    }
    /**
     * @method
     * Возвращает версию прошивки модуля
     * @returns {string} _ver  -Версия прошивки
     */
    GetVersion() {
        let _ver;
        wifi.getVersion(function(err, version) {
            // Debug
            _ver = version;
          });
        return _ver;
    }
    /**
     * @method
     * Создаёт WiFi-сеть. Модуль начинает работать в
     * режиме точки доступа
     * @param {string}  _ssid - ssid создаваемой сети
     * @param {string}  _pass - пароль создаваемой сети
     * @param {number}  _chan - номер радиоканала
     * @param {string}  _enc  - метод аутентификации
     */
    CreateAP(_ssid, _pass, _chan, _enc) {
        this.wifi.createAP(_ssid, _pass, _chan, _enc, function(err) {
            print('AP created');
        });
    }
    /**
     * @method
     * Возвращает список подключенных устройств
     * в виде массива объектов. Каждый объект содержит
     * поля IP и Mac-адрессов
     * @returns {ObjectDevice} _devs -подключенные устройства
     */
    GetConnectedDevices() {
        let _devs;
        this.wifi.getConnectedDevices (function (err, devices) {
            _devs = devices;
        });
        return _devs;
    }
}

exports = ClassEsp8266;