/**
 * @class
 * Класс ClassWSClient реализует логику работы WebSocket-клиена на Espruino.
 * Для работы класса требуется подключить модуль ModuleAppMath, где 
 * добавляется функция проверки на целочисленность.
 * 
 * Тип для хранения опций соединения
 * @typedef  {Object} ObjectWSOpts     - тип контейнер хранящий опции
 * @property {string} path             - путь на сервере
 * @property {number} port             - номер порта
 * @property {string} protocol         - тип протокола
 * @property {number} protocolVersion  - версия протокола
 * @property {string} origin           - родина клиента
 * @property {number} keepAlive        - время жизни клиента
 * @property {Object} headers          - хедеры (не обязательны)
 */
class ClassWSClient {
    /**
     * @constructor
     * @param {string} _host         - - IP-адрес или доменное имя хоста
     * @param {ObjectWSOpts} _opts   - - Опции соединения
     */
    constructor(_host,_opts) {
        //реализация паттерна синглтон
        /*if (this.Instance) {
            return this.Instance;
        } else {
            ClassWSClient.prototype.Instance = this;
        }*/

        this.name = 'ClassWSClient'; //переопределяем имя типа
        this.wsc = undefined;
        this.opts = _opts;
        this.ChangeHost(_host);
	}
    /**
     * @method
     * Метод смены хоста. Также используется для начальной инициализации
     * @param {string} _host  - IP-адрес или доменное имя хоста
     */
    ChangeHost(_host) {
        let WebSocket = require("ws");

        if (this.wsc != 'undefined') {
            this.CloseConnection();
        }
        this.wsc = new WebSocket(_host, this.opts);
        this.wsc.on('open', function() {
            console.log("Connected to server");
          });
    }
    /**
     * @method
     * Метод для закрытия текущего соединения
     */
    CloseConnection () {
        this.wsc.on('close', function() {
            console.log("Connection closed");
          });
    }
    /**
     * @method
     * Метод для переопределения опций соединения.
     * После смены требуется переустановить соединение с помощью
     * метода ChangeHost
     * @param {ObjectWSOpts} _opts     - Опции соединения
     */
    ChangeOptions (_opts) {
        this.opts = _opts;
    }
     /**
     * @method
     * Метод для вызова колбэка WebSocket-клиента.
     * Доступные колбэки:
     * open, close, message, handshake, ping, pong, rawData
     * @param {string} _cb     - Вызываемый колбэк
     * @returns {string} res   - Сообщение о результате работы колбэка
     */
    InvCallback (_cb) {
        let res;

        switch (_cb) {
            case 'open': {
                this.wsc.on('open', function() {
                    res = "Connected to server";                    
                  });
                  break;
                }
            case 'message': {
                this.wsc.on('message', function(msg) {
                    res = "MSG: " + msg;                    
                    });
                    break;
                }
            case 'close': {
                this.wsc.on('close', function() {
                    res = "Connection closed";                    
                    });
                    break;
                }
            case 'handshake': {
                this.wsc.on('handshake', function() {
                    res = "Handshake success!";                    
                    });
                    break;
                }
            case 'ping': {
                this.wsc.on('ping', function() {
                    res = "Got a ping!";                    
                    });
                    break;
                }
            case 'pong': {
                this.wsc.on('pong', function() {
                    res = "Got a pong!";                    
                    });
                    break;
                }
            case 'rawData': {
                this.wsc.on('rawData', function(msg) {
                    res = "Raw Data: " + msg;                    
                    });
                    break;
                }
            default: {
                res = "Unknown command!";
                break;
            }
        }
        return res;
    }
    /**
     * @method
     * Метод для отправки сообщения на текущий сервер.
     * @param {string} _msg    - Вызываемый колбэк
     * @returns {string} res   - Сообщение о результате работы
     */
    SendMessage (_msg) {
        this.wsc.send(_msg);
        return "Message sent!";
    }
}

exports = ClassWSClient;