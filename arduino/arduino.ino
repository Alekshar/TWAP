/*
  Authors : Alexandre Bailleul, Gatien Teniere, Ranim Marrakchi, Benjamin Delahais

  

 */

// Variables declarations

const int light = A0;  // Analog input pin that the light sensor is plugged
const int temp = A1;  // Analog input pin that the potentiometer simulates temperature sensor
const int humid = A2;  // Analog input pin that the potentiometer simulates humidity sensor


void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600);
}

void loop() {

  //Conversion of value
  //Temperature
  temp = map(temp, 0, 1023, -15, 50);
  //Humidity
  hum = map(hum, 0, 1023, 0, 100);
  
  Serial.print(analogRead(light));
  Serial.print(",");
  Serial.print(analogRead(temp));
  Serial.print(",");
  Serial.println(analogRead(humid));

  delay(100);
}
