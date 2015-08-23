/***

Notes from Femto.io
===================

Avoid using String(), as it takes up large amounts of storage, causing the sketch to 
grow beyond the max flash size of an ATMega32u4

***/

//   ..... Adafruit nRF8001 libary ....
/*********************************************************************
This is an example for our nRF8001 Bluetooth Low Energy Breakout

  Pick one up today in the adafruit shop!
  ------> http://www.adafruit.com/products/1697

Adafruit invests time and resources providing this open source code, 
please support Adafruit and open-source hardware by purchasing 
products from Adafruit!

Written by Kevin Townsend/KTOWN  for Adafruit Industries.
MIT license, check LICENSE for more information
All text above, and the splash screen below must be included in any redistribution
*********************************************************************/

/**  ..... FreeIMU library ....
 * Example program for using the FreeIMU connected to an Arduino Leonardo.
 * The program reads sensor data from the FreeIMU, computes the yaw, pitch
 * and roll using the FreeIMU library sensor fusion and use them to move the
 * mouse cursor. The mouse is emulated by the Arduino Leonardo using the Mouse
 * library.
 * 
 * Originally authored by Fabio Varesano 
*/



#include <HMC58X3.h>
#include <MS561101BA.h>
#include <I2Cdev.h>
#include <MPU60X0.h>
#include <EEPROM.h>

//#define DEBUG
#include "DebugUtils.h"
//#include "IMUduino.h"
#include "FreeIMU.h"
#include <Wire.h>
#include <SPI.h>

// Adafruit nRF8001 Library
#include "Adafruit_BLE_UART.h"

// Connect CLK/MISO/MOSI to hardware SPI
// e.g. On UNO & compatible: CLK = 13, MISO = 12, MOSI = 11
//      On Leo & compatible: CLK = 15, MISO = 14, MOSI = 16
#define ADAFRUITBLE_REQ 10
#define ADAFRUITBLE_RDY 7     // This should be an interrupt pin, on Uno thats #2 or #3. IMUduino uses D7
#define ADAFRUITBLE_RST 9

Adafruit_BLE_UART BTLEserial = Adafruit_BLE_UART(ADAFRUITBLE_REQ, ADAFRUITBLE_RDY, ADAFRUITBLE_RST);

aci_evt_opcode_t laststatus = ACI_EVT_DISCONNECTED;
aci_evt_opcode_t status = laststatus;

int values[11];
char chrData[17]; // Yaw (5 bytes), Pitch (5 bytes), Roll (5 bytes) ...delimeter is a pipe '|'
char sendbuffersize;
    
// Set the FreeIMU object
FreeIMU my3IMU = FreeIMU();


void setup() {
  
  Serial.begin(115200);
  
  while(!Serial); // Comment this out if you don't want to open up the Serial Monitor to start initialization
  
  Wire.begin();
  
  Serial.println(F("IMUduino Temperature/Altitude"));
  
  // Initialize the IMU components.
  Serial.println(F("...Initializing IMU"));
  my3IMU.init(true);
  // Initialize the BLE component.
  Serial.println(F("...Initializing BTLE"));
  BTLEserial.begin();
  Serial.println(F("...Ok! Starting main loop."));
}


void loop() {
  
  btleLoop();
  if (status == ACI_EVT_CONNECTED) {
    
    
    my3IMU.getRawValues(values);
    
    
    btleWriteTempAlt(
      values[9], // Temperature
      values[10] // Pressure (Altitude relative to sea level)
    );
  }
}

/**************************************************************************/
/*!
    Constantly checks for new events on the nRF8001
*/
/**************************************************************************/

void btleLoop() {
  // Tell the nRF8001 to do whatever it should be working on.
  BTLEserial.pollACI();

  // Ask what is our current status
  status = BTLEserial.getState();
  // If the status changed....
  if (status != laststatus) {
    // print it out!
    if (status == ACI_EVT_DEVICE_STARTED) {
        Serial.println(F("* Advertising started"));
    }
    if (status == ACI_EVT_CONNECTED) {
        Serial.println(F("* Connected!"));
    }
    if (status == ACI_EVT_DISCONNECTED) {
        Serial.println(F("* Disconnected or advertising timed out"));
    }
    // OK set the last status change to this one
    laststatus = status;
  }

  if (status == ACI_EVT_CONNECTED) {
    // Lets see if there's any data for us!
    if (BTLEserial.available()) {
      Serial.print("* "); 
      Serial.print(BTLEserial.available()); 
      Serial.println(F(" bytes available from BTLE"));
    }
    // OK while we still have something to read, get a character and print it out
    while (BTLEserial.available()) {
      char c = BTLEserial.read();
      Serial.print(c);
    }
  }
}

void btleWriteTempAlt(int temp, int alt) {
  itoa(temp, &chrData[0], 10); // 10 is decimal, 16 is hex base
  itoa(alt, &chrData[6], 10);
  //dtostrf(Z, 1, 0, &chrData[11]);
  chrData[5] = '|';

  sendbuffersize = min(20, sizeof(chrData));

  BTLEserial.write((byte*) chrData, sendbuffersize);
}
