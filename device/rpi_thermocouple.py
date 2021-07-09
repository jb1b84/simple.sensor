import time
import board
import digitalio
import adafruit_max31855

# Created from https://learn.adafruit.com/thermocouple/python-circuitpython

spi = board.SPI()
cs = digitalio.DigitalInOut(board.D5)
max31855 = adafruit_max31855.MAX31855(spi, cs)


def getserial():
    # Extract serial from cpuinfo file
    cpuserial = "0000000000000000"
    try:
        f = open('/proc/cpuinfo', 'r')
        for line in f:
            if line[0:6] == 'Serial':
                cpuserial = line[10:26]
        f.close()
    except:
        cpuserial = "ERROR000000000"

    return cpuserial


deviceId = getserial()

print('Starting up device: {}'.format(deviceId))

while True:
    tempC = max31855.temperature
    tempF = tempC * 9 / 5 + 32
    print('Temperature: {} degrees C'.format(tempF))
    time.sleep(2.0)
