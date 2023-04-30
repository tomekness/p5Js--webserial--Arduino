// create a global variable to hold the serial port
let serial;

// define the port options
const options = { baudRate: 9600 };

// initialize the serial connection
async function connect() {
  // request access to the serial port
  const port = await navigator.serial.requestPort();

  // open the serial port
  await port.open(options);

  // create a text decoder to decode incoming data
  const decoder = new TextDecoderStream();

  // pipe the incoming data from the serial port to the text decoder
  port.readable.pipeTo(decoder.writable);

  // create a text encoder to encode outgoing data
  const encoder = new TextEncoderStream();

  // pipe the outgoing data from the text encoder to the serial port
  encoder.readable.pipeTo(port.writable);

  // assign the text encoder to the global variable for later use
  serial = encoder.writable;
}

// call the connect function to initialize the serial connection
connect();

// create a variable to hold the time
let time = 0;

// create a variable to hold the amplitude of the sine wave
const amplitude = 127;

// create a variable to hold the frequency of the sine wave
const frequency = 5;

// define the draw function to run continuously
function draw() {
  // calculate the value of the sine wave at the current time
  const value = Math.sin(time * frequency) * amplitude + amplitude;

  // map the value to a range of 0 to 255 for the LED brightness
  const brightness = Math.floor(map(value, 0, 255, 0, 255));

  // send the brightness value to the Arduino over the serial port
  serial.write(`${brightness}\n`);

  // increment the time variable for the next iteration
  time += 0.01;
}

// define the map function to map a value from one range to another
function map(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}