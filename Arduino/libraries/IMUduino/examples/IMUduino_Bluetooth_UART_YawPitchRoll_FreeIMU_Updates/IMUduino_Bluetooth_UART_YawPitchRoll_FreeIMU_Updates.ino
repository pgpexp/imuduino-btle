#include <StandardCplusplus.h>
#include <FilteringScheme.h>
#include <MovingAvarageFilter.h>
#include <AP_Math_freeimu.h>

/**
 * This example sketch uses the 
 * femtoduino/FreeIMU-Updates library ('barebones' branch)
 **/

#include <HMC58X3.h>
#include <MS561101BA.h>
#include <I2Cdev.h>
#include <MPU60X0.h>

#include <EEPROM.h>

#include <FreeIMU.h>
#include <Wire.h>
#include <SPI.h>

// Adafruit nRF8001 Library
#include <Adafruit_BLE_UART.h>
Adafruit_BLE_UART BTLEserial = Adafruit_BLE_UART(10, 7, 9); // REQ, RDY, RST

float ypr[3];
char chrData[15]; // Yaw (5 bytes), Pitch (5 bytes), Roll (5 bytes) ...delimeter is a pipe '|'

// Set the FreeIMU object
FreeIMU my3IMU = FreeIMU();


void setup() {
  Wire.begin();

  my3IMU.init(true);
  BTLEserial.begin();  
}

void loop() {
  BTLEserial.pollACI();

  if (ACI_EVT_CONNECTED == BTLEserial.getState()) {
    
    my3IMU.getYawPitchRoll(ypr);

    dtostrf(ypr[0], 1, 1, &chrData[0]);
    dtostrf(ypr[1], 1, 1, &chrData[5]);
    dtostrf(ypr[2], 1, 1, &chrData[10]);
  
    BTLEserial.write((byte*)chrData, 15);
  }
}

