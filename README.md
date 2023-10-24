<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ModuleWiFiEsp8266
<p align="center">
  <img src="./res/logo.png" width="400" title="hover text">
</p>

-----------------

# Лицензия
////

# Описание
<div style = "color: #555">

Модуль предназначен для реализации сервисных функций при установлении WiFi соединения с использованием чипа [Esp8266](https://github.com/Konkery/ModuleWiFiEsp8266/blob/main/res/0a-esp8266ex_datasheet_en.pdf). В текущей версии модуль поддерживает работу **только в режиме клиента**.  Модуль является неотъемлемой частью фреймворка EcoLite. Модуль автоматически проверяет присутствие в системе Espruino базовых модулей для работы с WiFi, что свидетельствует о встроеном в плату чипе и, если модули отсутствуют, автоматически подключает базовый модуль для работы с периферийным чипом, с которым модуль работает по Serial интерфейсу.  Для работы модуля необходим конфигурационный файл с именем APs.json, содержащий данные для подключения. Файл должен быть размещён во Flash памяти (в файловой системе). После сканирования модуль произведёт подключение к первой найденной сети, описанной в этом файле, что исключает необходимость изменений в коде каждый раз, когда необходимо новое подключение. Модуль реализует свой функционал через глобальный объект с именем wifi. 

Архитектурные решения:
- создаёт шину через глобальный объект [UARTbus](https://github.com/Konkery/ModuleBaseI2CBus/blob/main/README.md);
- реализует паттерн синглтон;
- работает в режиме клиента.
</div>

### Конструктор
<div style = "color: #555">

Конструктор принимает пины *_rx* и *_tx*, которые используются для работы с периферийным чипом. В случае присутствия на плате встроенного чипа передаваемые поля не будут использованы и их можно оставить пустыми. Для работы необходим конфигурационный файл, содержащий SSID и пароль сети, к которой необходимо подключится.

Пример файла конфигурационного файла APs.json:
```json
[
    {
        "ssid":"ssid1",
        "pass":"password1"
    },
    {
        "ssid":"ssid2",
        "pass":"password2"
    }
]
```
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Name</mark> - имя класса в строковом виде;
- <mark style="background-color: lightblue">_Wifi</mark> - объект базового класса, непосредственно работающего с чипом;
- <mark style="background-color: lightblue">_Bus</mark> - Serial шина для работы с периферийным чипом;
- <mark style="background-color: lightblue">_Ssid</mark> - ssid сети, к которой осуществляется подключение;
- <mark style="background-color: lightblue">_Scan</mark> - массив объектов сетей, найденных во время сканирования;
- <mark style="background-color: lightblue">_Ip</mark> - ip-адрес сети, к которой осуществляется подключениею.
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Init(_rx, _tx)</mark> - осуществляет соединение с wifi сетью, указанной в конфигурационном файле;
- <mark style="background-color: lightblue">InitBus(_rx, _tx)</mark> - создаёт новую Serial шину для работы с периферийным чипом.
Вызывается внутри метода *Init()*, если отсутствует встроенный модуль WiFi.
</div>

### Примеры
<div style = "color: #555; font-size: 16px">

Фрагмент кода для создание wifi. Предполагается, что все необходимые модули уже загружены в систему:
```js
//Подключение необходимых модулей
const ClassWifi = require('ClassWiFiEsp8266.min.js');
const ClassUARTBus = require ('ClassBaseUARTBus.min.js');

// Создание шины и объекта wifi
let UARTbus = new ClassUARTBus();
let wifi = new ClassWifi(B9, B10);

setTimeout(() => {
  console.log("Found networks:");
  console.log(wifi._Scan);
  console.log("Connected to:" + wifi._Ssid);
  console.log("IP:" + wifi._Ip);
}, 20000);
```
Вывод созданнного объекта в консоль:
<p align="left">
  <img src="./res/output.png" title="hover text">
</p>
</div>

# Зависимости
- [ClassBaseUARTBus](https://github.com/Konkery/ModuleBaseUARTbus/blob/main/README.md)
- [ModuleAppError](https://github.com/Konkery/ModuleAppError/blob/main/README.md)
- [ModuleAppMath](https://github.com/Konkery/ModuleAppMath/blob/main/README.md)
</div>
