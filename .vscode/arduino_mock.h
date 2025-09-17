#ifndef ARDUINO_MOCK_H
#define ARDUINO_MOCK_H
typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned int uint32_t;
typedef signed char int8_t;
typedef signed short int16_t;
typedef signed int int32_t;
typedef unsigned int size_t;

#define HIGH 0x1
#define LOW  0x0
#define INPUT 0x0
#define OUTPUT 0x1
#define INPUT_PULLUP 0x2

class HardwareSerial {
public:
    void begin(unsigned long baud);
    void println(const char* str);
    void println(const String& str);
    void println();
    void print(const char* str);
    void print(const String& str);
    void print(int val);
    void print(float val);
    void print(double val);
    size_t write(uint8_t val);
};

extern HardwareSerial Serial;

void pinMode(uint8_t pin, uint8_t mode);
void digitalWrite(uint8_t pin, uint8_t val);
int digitalRead(uint8_t pin);
int analogRead(uint8_t pin);
void analogWrite(uint8_t pin, int val);
unsigned long millis();
unsigned long micros();
void delay(unsigned long ms);
void delayMicroseconds(unsigned int us);
long map(long x, long in_min, long in_max, long out_min, long out_max);
float constrain(float x, float a, float b);
long constrain(long x, long a, long b);
int constrain(int x, int a, int b);

class String {
public:
    String();
    String(const char* str);
    String(int val);
    String(float val);
    String operator+(const String& str) const;
    String operator+(const char* str) const;
    String operator+(int val) const;
    String operator+(float val) const;
};

void setup();
void loop();

#endif // ARDUINO_MOCK_H
