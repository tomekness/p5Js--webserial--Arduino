*****Example 01 - Processing.js running in a browser sending data to arduino unsing webSerial*****
---------------------------------------------------------------------------------------------

***Using ChatGPT to write the examples and the documentation*** 

**promt:** *could you write an example on how to send data from a p5.js sketch to an esp32 via wifi using the arduino IDE. the values should be a sin wave. the esp32 should dim an LED. can you wrap the p5.js code with html and some debung feedback* 

**result:** 

Sure! Here's an example that uses a p5.js sketch to generate a sinusoidal wave and sends the data to an ESP32 via WiFi using the Arduino IDE. The ESP32 uses the data to control the brightness of an LED connected to one of its PWM pins.

First, you'll need to set up the ESP32 board in the Arduino IDE and connect it to your WiFi network. Here's a guide that can help you with that: https://randomnerdtutorials.com/getting-started-with-esp32/

Once you have the ESP32 set up, you can use the following code to receive data over WiFi and control the LED:

```cpp
#include <WiFi.h>

const char* ssid = "your-ssid";
const char* password = "your-password";

const int ledPin = 5;
int ledBrightness = 0;

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  server.begin();
  Serial.println("Server started.");
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    String request = client.readStringUntil('\r');
    Serial.println(request);
    client.flush();

    int pos = request.indexOf("value=");
    if (pos != -1) {
      int value = request.substring(pos + 6).toInt();
      ledBrightness = map(value, 0, 255, 0, 1023);
      analogWrite(ledPin, ledBrightness);
    }

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();
    client.println("<!DOCTYPE HTML>");
    client.println("<html>");
    client.println("<head><title>ESP32 LED Control</title></head>");
    client.println("<body>");
    client.print("<p>LED Brightness: ");
    client.print(ledBrightness);
    client.println("</p>");
    client.println("</body>");
    client.println("</html>");
  }
}
```

This code sets up a WiFi server on port 80 and waits for incoming connections. When a client connects and sends an HTTP request, the server reads the request and extracts the value parameter from the URL. It then maps the value to the range 0-1023 (the range of the PWM output on the ESP32) and sets the LED brightness accordingly. Finally, the server sends an HTTP response back to the client with a simple HTML page displaying the current brightness.

Now, here's an example p5.js sketch that generates a sinusoidal wave and sends the data to the ESP32 over WiFi. everything wrapped in an example HTML file that includes the p5.js code and adds some debug feedback:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ESP32 LED Control</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
  </head>
  <body>
    <div id="debug"></div>
    <script>
      let currentValue = 0;
      let sineWave = [];

      function setup() {
        createCanvas(400, 200);
        for (let i = 0; i < width; i++) {
          sineWave[i] = sin(map(i, 0, width, 0, TWO_PI));
        }
        connectToServer();
      }

      function draw() {
        background(255);
        stroke(0);
        noFill();
        beginShape();
        for (let i = 0; i < width; i++) {
          let x = i;
          let y = map(sineWave[i], -1, 1, height, 0);
          vertex(x, y);
        }
        endShape();

        let index = round(map(currentValue, -1, 1, 0, width - 1));
        let value = round(map(currentValue, -1, 1, 0, 255));
        stroke(255, 0, 0);
        fill(255, 0, 0);
        ellipse(index, map(sineWave[index], -1, 1, height, 0), 10, 10);
        debug('Current value: ' + value);
        sendValue(value);
        
        currentValue += 0.01;
        if (currentValue > 1) {
          currentValue = -1;
        }
      }

      function connectToServer() {
        debug('Connecting to server...');
        // Change the IP address to match your ESP32's IP address
        fetch('http://192.168.1.123/').then(function(response) {
          debug('Connected to server');
        }).catch(function(error) {
          debug('Failed to connect to server');
          setTimeout(connectToServer, 1000);
        });
      }

      function sendValue(value) {
        fetch('/set-value?value=' + value).then(function(response) {
          // Uncomment the next line to see the server response in the console
          // response.text().then(console.log);
        }).catch(function(error) {
          debug('Failed to send value');
        });
      }

      function debug(message) {
        let debugElement = document.getElementById('debug');
        debugElement.innerHTML += message + '<br>';
      }
    </script>
  </body>
</html>
```

This HTML file includes the p5.js code in a `<script>` tag and adds a `<div>` element for displaying debug messages. The `connectToServer()` function uses the `fetch()` API to send a GET request to the ESP32's IP address and displays a debug message indicating whether the connection was successful. The `sendValue()` function sends the LED brightness value to the server using a GET request to the `/set-value` URL, and displays a debug message indicating whether the request was successful. The `debug()` function adds a message to the debug `<div>` element. 

Make sure to replace the IP address in the `connectToServer()` function with the IP address of your ESP32.

Certainly! Here's an example Arduino sketch that runs on an ESP8266 NodeMCU board and receives brightness values from the p5.js sketch over WiFi to control the onboard LED:

```arduino
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>

// Replace with your network credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// Create an instance of the server
ESP8266WebServer server(80);

int ledPin = LED_BUILTIN;
int brightness = 0;

void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  Serial.begin(115200);

  // Connect to Wi-Fi network
  WiFi.begin(ssid, password);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.print(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected successfully");

  // Start the server
  server.on("/set-value", [](){
    if (server.args() > 0) {
      int value = server.arg("value").toInt();
      if (value >= 0 && value <= 255) {
        brightness = value;
        analogWrite(ledPin, brightness);
        server.send(200, "text/plain", "OK");
      } else {
        server.send(400, "text/plain", "Invalid value");
      }
    } else {
      server.send(400, "text/plain", "No value specified");
    }
  });
  server.begin();
  Serial.println("Server started");
}

void loop() {
  server.handleClient();
}
```

This Arduino sketch sets up a web server using the ESP8266WebServer library and listens for incoming requests on port 80. The `setup()` function initializes the onboard LED and connects to the WiFi network specified in the `ssid` and `password` variables. The `loop()` function calls the `server.handleClient()` method to process incoming requests.

When the p5.js sketch sends a brightness value to the `/set-value` URL, the server calls the specified handler function, which extracts the brightness value from the request parameters and sets the brightness of the LED using the `analogWrite()` function. If the brightness value is out of range or not specified, the server sends an appropriate error response.

To run this sketch on your ESP8266 NodeMCU board, open the Arduino IDE, select "ESP8266" as the board type, and upload the sketch to the board. Make sure to replace the `ssid` and `password` variables with your WiFi network credentials. Once the sketch is uploaded, the board should connect to your WiFi network and start listening for incoming requests. You can then open the p5.js sketch in a web browser and adjust the brightness of the onboard LED by moving the mouse over the sine wave.