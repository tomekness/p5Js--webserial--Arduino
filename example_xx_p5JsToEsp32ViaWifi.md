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
