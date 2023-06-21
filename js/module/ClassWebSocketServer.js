/**
 * @class
 * Класс реализует функционал WebSocket-сервера на Espruino
 * 
 */
class ClassWSServer {
    /**
     * @constructor
     */
    constructor() {
        //реализация паттерна синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassWSServer.prototype.Instance = this;
        }

        this.name = 'ClassWSServer'; //переопределяем имя типа
        this.server = undefined;
        this.proxy = undefined;
        this.port = undefined;
        this.clients = [];
        this.Init();
	}
    /**
     * @method
     * Метод создания вебсокет-сервера
     */
    Init() {
        this.server = require('ws').createServer((req, res) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('');
        });
        if (this.port == undefined) this.port = 8000;
        this.server.listen(this.port, () => {
            console.log('Listen to port ' + this.port);
        });
        this.server.on('request', req => {
            const connection = req.accept('', req.origin);
            this.clients.push(connection);        
            
            console.log('Connected ' + connection.remoteAdress);
            connection.on('message', message => {
                const dataName = message.type + 'Data';
                const data = message[dataName];
                let type = this.proxy.defType();
                console.log('Recieved: ' + data);
                // TODO: организовать отправку пакета прокси как клиенту сервера
                // Организовать рассылку сообщений клиентам (только нужному типу (или нескольким?) и не самому себе)
                this.clients.forEach(client => {
                    if (connection !== client) {
                        client.send(data);
                    }
                });
            });
            connection.on('close', (rCode, desc) => {
                let index = this.clients.indexOf(connection);
                this.clients.splice(index,1);
                console.log('Disconnected ' + connection.remoteAddress);
            });
        });
    }
     /**
     * @method
     * Метод для вызова колбэка WebSocket.
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
}

exports = ClassWSServer;