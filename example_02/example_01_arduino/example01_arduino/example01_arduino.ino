int ledPin = 9;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    int brightness = Serial.parseInt();
    analogWrite(ledPin, brightness);
  }
}
