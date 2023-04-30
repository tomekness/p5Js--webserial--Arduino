*****Example 01 - Processing.js running in a browser sending data to arduino unsing webSerial*****
---------------------------------------------------------------------------------------------

***Using ChatGPT to write the examples and the documentation*** 

**promt:** *could you please add the possibility to read a json file with an array of integer and send this values instead of the sin wave. If the array ends just start over. Could you also add an variable to define the interval a value is send (time bevor sending the next value)

- could you please rewrite this code using webSerial in a browser 
* 

**result:** 

Certainly! Here's an example of how to modify the previous code to use Web Serial API in a browser:

```javascript
let values = []; // array to hold values read from JSON file
let index = 0; // current index in values array
let sendInterval = 1000; // interval between sending values, in milliseconds
let lastSendTime = 0; // time of last value sent
let port; // object to hold serial port instance

function preload() {
  // load JSON file with values array
  values = loadJSON("values.json").values;
}

async function setup() {
  // request permission to use Web Serial API
  const portOptions = { baudRate: 9600 };
  port = await navigator.serial.requestPort();
  await port.open(portOptions);
  
  // set up the serial port to send and receive data
  port.addEventListener("open", () => console.log("Serial port opened"));
  port.addEventListener("error", err => console.log("Serial port error:", err));
}

function draw() {
  // check if enough time has passed to send the next value
  if (millis() - lastSendTime >= sendInterval) {
    // get the next value from the values array and send it over serial
    const value = values[index];
    const writer = port.writable.getWriter();
    writer.write(new Uint8Array([value]));
    writer.releaseLock();
    
    // update index and lastSendTime
    index = (index + 1) % values.length;
    lastSendTime = millis();
  }
}
```

In this example, we first create an empty `values` array and set the initial `index` to 0. We also define a `sendInterval` variable (set to 1000 milliseconds) and a `lastSendTime` variable (initialized to 0). Finally, we create a `port` object to hold the `SerialPort` instance and load the JSON file with the values array using the `loadJSON` function in the `preload` function.

In the `setup` function, we first request permission to use the Web Serial API using the `navigator.serial.requestPort` method. We then open the serial port using the `open` method of the port object, passing in the desired options for the serial port (in this case, just the `baudRate` option). We also set up event listeners to log messages when the serial port is opened or encounters an error.

In the `draw` function, we first check if enough time has passed since the last value was sent using the `millis` function. If it has, we get the next value from the `values` array using the `index` variable and send it over serial using the `writable` property of the `port` object. We create a `writer` object using the `getWriter` method, write the value as a `Uint8Array` (since we're sending integers in the range 0-255), and release the lock using the `releaseLock` method. We then update the `index` variable to move to the next value in the array (using the modulus operator to wrap around to the beginning if we've reached the end) and update the `lastSendTime` variable to the current time.

Note that this code assumes that you have a JSON file named `values.json` in the same directory as your HTML file with the following format:

```json
{
  "values": [1, 2, 3, 4, 5]
}
```

where the `values` key contains an array of integers to send over serial. You can modify the values in the array to change the values being sent. Also note that WebSerial API requires the user to grant permission to access the serial port, so the user will be prompted to do so when the page loads. Once permission is granted, the `setup` function requests the serial port using `navigator.serial.requestPort()` and opens it using the `port.open()` method. We then set up event listeners for the `open` and `error` events to log messages when the port is successfully opened or encounters an error.

In the `draw` function, we use `setInterval` to repeatedly send a value over serial every `sendInterval` milliseconds. We first check if it's been at least `sendInterval` milliseconds since the last value was sent using the `Date.now()` function. If it has, we get the next value from the `values` array using the `index` variable and send it over serial using the `port.write()` method. We then update the `index` variable to move to the next value in the array (using the modulus operator to wrap around to the beginning if we've reached the end).

Note that this code assumes that you have a JSON file named `values.json` in the same directory as your HTML file with the following format:

```json
{
  "values": [1, 2, 3, 4, 5]
}
```

where the `values` key contains an array of integers to send over serial. You can modify the values in the array to change the values being sent, and you can modify the `sendInterval` variable to change the interval between sending values.
