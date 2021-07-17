import time
from datetime import datetime
import requests
import board
import digitalio
import adafruit_max31855

# Created from https://learn.adafruit.com/thermocouple/python-circuitpython

"""
TODO:
    * mock board specific stuff for local dev
    * logging
    * env file with ability to change endpoint
    * draw schemas from something more elegant
"""

spi = board.SPI()
cs = digitalio.DigitalInOut(board.D5)
max31855 = adafruit_max31855.MAX31855(spi, cs)


def get_serial():
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


device_id = get_serial()

print('Starting up device: {}'.format(device_id))


def get_temp():
    tempC = max31855.temperature
    return tempC * 9 / 5 + 32


def get_session_data():
    username = input("Username: \n")
    label = input("Session label: \n")

    return username, label


def format_reading(reading, device_time, reading_type="temperature", reading_label="internal temp", unit_of_measure="F"):
    return {
        "type": reading_type,
        "label": reading_label,
        "reading": str(reading),
        "UoM": unit_of_measure,
        "recorded_at": device_time
    }


def send_readings(readings, username, session_label, device_id="na"):
    # move to env
    endpoint = "https://us-central1-simple-sensor.cloudfunctions.net/event"
    device_time = datetime.now().strftime("%c")

    formatted_readings = [format_reading(
        reading, device_time) for reading in readings]

    payload = {
        "schema": "streaming_sensor",
        "version": "0.1",
        "device_time": device_time,
        "username": username,
        "device_name": device_id,
        "readings": formatted_readings,
        "session": {
            "label": session_label
        }
    }

    print("Sending readings... \n")
    r = requests.post(endpoint, data=payload)
    print("Status: {} \n Response: {} \n".format(r.status_code, r.text))


def main_loop():
    username, session_label = get_session_data()
    print('Now collecting data for user {} and session {}'.format(
        username, session_label))

    while True:
        tempF = get_temp()
        send_readings([tempF], username, session_label)

        time.sleep(5.0)


if __name__ == "__main__":
    main_loop()
