#include <Wire.h>

#define SLAVE 0x08 // get this from slavve when it sends the iteration request
byte i2c_rcv;
int dummyQueNum = 1;

void setup()
{

  Wire.begin();
  i2c_rcv = 255;
}

void loop()
{

  byte res;
  while (Wire.available())
  {
    byte req = Wire.read();
    res = req;
  }
  Serial.write("s");
    Serial.write(res);
  if (res == 'k'){
    send(dummyQueNum++, SLAVE);

  }
    

}

void send(byte data, int slave)
{
  Wire.beginTransmission(slave);
  Wire.write(data);
  Wire.endTransmission();
}
