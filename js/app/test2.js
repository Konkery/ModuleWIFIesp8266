try {
    let WS = require("https://raw.githubusercontent.com/AlexGlgr/ModuleMiddleWIFIesp8266/fork-Alexander/js/module/ClassWebSocketClient.min.js");
    let opts = {
        path: '/',
        port: 8080,
        protocol : "echo-protocol",
        protocolVersion: 13,
        origin: 'Espruino',
        keepAlive: 60,
        headers:{ some:'header', 'ultimate-question':42 }
        };
    let socket = new WS ("www.google.com",opts);
    socket.InvCallBack('ping');
}
catch (e) {
    console.log('Error!');
}