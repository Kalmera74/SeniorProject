#include <Wire.h>
#include <TM1637Display.h>

#define CLK 2
#define DIO 3
#define ADDRSS 0x08

// Create display object of type TM1637Display:
TM1637Display display = TM1637Display(CLK, DIO);

byte i2c_rcv;

int button = 6;
int buttonVal;
int wireRed;

void setup()
{
  display.clear();
  delay(1000);

  Serial.begin(9600);

  Wire.begin(ADDRSS);
  Wire.onReceive(dataRcv);
  Wire.onRequest(dataRqst);

  pinMode(button, INPUT); // sets the digital pin 7 as input

  i2c_rcv = 255;
}

void loop()
{
  display.setBrightness(7);

  buttonVal = digitalRead(button); // read the input pin

  if (buttonVal)
  {
    dataRqst();
  }
}

void dispTest(int num)
{
  display.showNumberDec(num);
}

void dataRcv(int numBytes)
{
  while (Wire.available())
  {
    i2c_rcv = Wire.read();
  }
  display.showNumberDec(i2c_rcv);
}

void dataRqst()
{
  Wire.write("k");
}
