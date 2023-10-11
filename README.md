# ModuleMiddleWIFIesp8266
<p align="center">
  <img src="./res/logo.png" width="400" title="hover text">
</p>

-----------------

# Лицензия
////

# Описание
<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px; color: #555">

Модуль предназначен для реализации логики WiFi соединения с использованием чипа [Esp8266](https://github.com/AlexGlgr/ModuleMeteoLPS25HB/blob/fork-Alexander/res/LPS331AP_STMicroelectronics.pdf). Модуль динамически создаваёт и добавляет в контейнер новый объект I2C шины и предоставляет прикладным классам экземпляры объектов, а также хранит информацию о том - занята данная, конкретная шина или нет. Модуль хранит экземпляры предопределенных в Espruino I2C шин (I2C1, I2C2, I2C3), а также создает soft шины I2C. При создании возвращается объект типа I2C шина. Модуль является неотъемлемой частью фреймворка EcoLite. Модуль работает в режиме синглтон. Для корректной работы фреймворка необходимо создать глобальный объект с именем I2Cbus. Модуль имеет следующие архитектурные решения фреймворка EcoLite:
- при проверке валидности данных использует ошибку класса [Error](https://github.com/Konkery/ModuleAppError/blob/main/README.md);
- при проверке переменной на целочисленное использует класс [NumIs](https://github.com/Konkery/ModuleAppMath/blob/main/README.md).

### **Конструктор**
Конструктор не принимает никаких значений, и при создании объекта класса произойдёт разовое занесение в массив существующих в системе шин. Массив содержит объекты с двумя полями: непосредственно объект шины и идентификатор *true/false* об её использовании в системе. Пример объекта массива:
```js
this._I2CBus[] = {
    IDBus: I2C{};
    Used: true;
}
```

### **Поля**
- <mark style="background-color: lightblue">_I2Cbus</mark> - массив-контейнер с I2C шинами;
- <mark style="background-color: lightblue">_pattern</mark> - строка-ключ, для всех объектов шин;
- <mark style="background-color: lightblue">_indexBus</mark> - индекс софтверной шины. Начальный - 10, конкатенацией с полем _pattern составляет имя нового объекта-шины.

### **Методы**
- <mark style="background-color: lightblue">Init()</mark> - заносит в массив-контейнер существующие в системе I2C шины, запускается в конструкторе;
- <mark style="background-color: lightblue">AddBus(_opts)</mark> - создаёт новую софтверную шину и заносит её в массив-контейнер.
Принимает объект *_opts*, содержащий пины и битрейт создаваемой шины. Метод проводит проверку валидности данных. Пример объектра *_opts*:
```js
let _opts = {
    sda: B7;
    sdl: B6;
    bitrate: 115200;
}
```
Метод возвращает объект, содержащий имя шины и объект I2C. Пример:
```js
return {
    NameBus: 'I2C10';
    IDBus: I2C{};
}
```

### **Примеры**
Фрагмент кода для создание софтверной шины. Предполагается, что все необходимые модули уже загружены в систему:
```js
//Подключение необходимых модулей
const ClassI2CBus = require('ClassBaseI2CBus.min');
const err = require('ModuleAppError.min');
const NumIs = require('ModuleAppMath.min');
     NumIs.is(); //добавить функцию проверки целочисленных чисел в Number

//Создание I2C шины
let I2Cbus = new ClassI2CBus();
let bus = I2Cbus.AddBus({sda: P5, scl: P4, bitrate: 100000}).IDbus;

console.log(I2Cbus);
```
Вывод созданнного объекта в консоль:
<p align="left">
  <img src="./res/output.png" title="hover text">
</p>
</div>
