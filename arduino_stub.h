// Arduino stub header for VS Code IntelliSense
// This file provides definitions to help IntelliSense understand Arduino code

#ifndef ARDUINO_STUB_H
#define ARDUINO_STUB_H

// Arduino version and architecture
#define ARDUINO 10819
#define ARDUINO_AVR_UNO
#define ARDUINO_ARCH_AVR
#define __AVR_ATmega328P__
#define F_CPU 16000000L

// Basic Arduino types
typedef unsigned char uint8_t;
typedef unsigned int uint16_t;
typedef unsigned long uint32_t;
typedef bool boolean;
typedef uint8_t byte;

// Pin definitions for Arduino Uno
#define PIN_A0   (14)
#define PIN_A1   (15)
#define PIN_A2   (16)
#define PIN_A3   (17)
#define PIN_A4   (18)
#define PIN_A5   (19)

static const uint8_t A0 = PIN_A0;
static const uint8_t A1 = PIN_A1;
static const uint8_t A2 = PIN_A2;
static const uint8_t A3 = PIN_A3;
static const uint8_t A4 = PIN_A4;
static const uint8_t A5 = PIN_A5;

// Digital pin constants
#define HIGH 0x1
#define LOW  0x0
#define INPUT 0x0
#define OUTPUT 0x1
#define INPUT_PULLUP 0x2

// Arduino functions
void pinMode(uint8_t pin, uint8_t mode);
void digitalWrite(uint8_t pin, uint8_t val);
int digitalRead(uint8_t pin);
int analogRead(uint8_t pin);
void analogWrite(uint8_t pin, int val);
void delay(unsigned long ms);
unsigned long millis(void);

// Serial communication
class HardwareSerial {
public:
    void begin(long speed);
    void print(const char* str);
    void print(int val);
    void println(const char* str);
    void println(int val);
    void println();
};

extern HardwareSerial Serial;

// Math functions
long map(long value, long fromLow, long fromHigh, long toLow, long toHigh);

#endif // ARDUINO_STUB_H