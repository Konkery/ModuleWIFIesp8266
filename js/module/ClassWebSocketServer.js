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
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(page);
        }

        function wsHandler(ws) {
            ws.on('message', () => {
              console.log('Contact');
              console.log(ws);
            });
            ws.on('close', () => {
              console.log('Closed');
            });
        }

        console.log("Wubbalubba2");        
        this.server = require('ws').createServer(pageHandler);
        this.server.listen(8080);
        console.log('Starting server');
        this.server.on('websocket', wsHandler);
        /*this.server = require('ws').createServer((req, res) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('');
        });
        //if (this.port == undefined) this.port = 8000;
        this.server.listen(this.port);
        console.log('Listen to ' + this.port);
        this.server.on("websocket", req => {
            console.log(req);
            const connection = req.accept('', req.origin);
            connection.key = req.headers['sec-websocket-key']; //#### 
            this.clients.push(connection);        
            
            console.log('Connected ' + connection.remoteAdress);
            connection.on('message', message => {
                const dataName = message.type + 'Data';
                const data = message[dataName];

                this.proxy.Receive(data, connection.key); //####
            });
            connection.on('close', (rCode, desc) => {
                let index = this.clients.indexOf(connection);
                this.clients.splice(index,1);
                this.proxy.RemoveSub(connection.key);
                console.log('Disconnected ' + connection.remoteAddress);
            });
        });*/
    }
    /**
     * @method
     * Вызовом этого метода WSS получает данные и список ключей, по которому определяюся клиенты, 
     * коим необходимо отправить данные. 
     * @param {String} data 
     * @param {[String]} keys 
     */
    Notify(data, keys) {
        this.clients.filter(client => keys.includes(client.key)).forEach(client => {
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