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
        this.proxy = new ProxyWS(this);
        this.port = 8080;
        this.clients = [];
        this.Init();
	}
    /**
     * @method
     * Метод создания вебсокет-сервера
     */
    Init() {
        let page = '<html><body>404 - Not supported format</body></html>';

        function pageHandler (req, res) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(page);
        }

        function wsHandler(ws) {
            ws.on('open', () => {
                console.log('Connected '+ ws.key.hashed);
                this.clients.push(ws);
                console.log(ws);
              });
            ws.on('message', (message) => {
                const dataName = message.type + 'Data';
                const data = message[dataName];
                console.log('Receiving message');
                this.proxy.Receive(data, ws.key.hashed);
            });
            ws.on('close', () => {
                let index = this.clients.indexOf(ws);
                this.clients.splice(index,1);
                this.proxy.RemoveSub(ws.key.hashed);
                console.log('Disconnected ' + ws.key.hashed);
                console.log('Closed');
            });
        }

        this.server = require('ws').createServer(pageHandler);
        this.server.listen(8080);
        console.log('Starting server');
        this.server.on('websocket', wsHandler);
    }
    /**
     * @method
     * Вызовом этого метода WSS получает данные и список ключей, по которому определяюся клиенты, 
     * коим необходимо отправить данные. 
     * @param {String} data 
     * @param {[String]} keys 
     */
    Notify(data, keys) {
        this.clients.filter(client => keys.includes(client.key.hashed)).forEach(client => {
            client.send(data);
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