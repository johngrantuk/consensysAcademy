import serial, time
from hydraApp.models import AntennaSettings, Setting
from antennaDebugPackets import processCriticalPacket
from Log import CriticalLog

def OpenSerialPort(SerialPort, Baud):
    antennaSerialPort = serial.Serial(port=SerialPort,\
                        baudrate=Baud,\
                        parity=serial.PARITY_NONE,\
                        stopbits=serial.STOPBITS_ONE,\
                        bytesize=serial.EIGHTBITS,\
                        timeout=2)

    return antennaSerialPort

def PointAtSat(AntennaSerialPortName, Baud, SatLocation, RxPolIsV, SatSkew):
    """
    Called by settingsApi when Manual Satellite selected on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":11," + SatLocation + "," + RxPolIsV + "," +  SatSkew + ",c\n"
    print("antennaSend.PointAtSat() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def SetManaulPeak(AntennaSerialPortName, Baud, IsManualPeak):
    """
    Called by settingsApi when Manual Pointing configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":23," + IsManualPeak + ",c\n"
    print("antennaSend.SetManaulPeak() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def SetManaulSearch(AntennaSerialPortName, Baud, IsManualSearch):
    """
    Called by settingsApi when Manual Pointing configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":22," + IsManualSearch + ",c\n"
    print("antennaSend.SetManaulSearch() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def PointToPosition(AntennaSerialPortName, Baud, Az, El, Pol):
    """
    Called by settingsApi when Manual Pointing configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":12," + El + "," + Az + "," + Pol + ",c\n"
    print("antennaSend.PointToPosition() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())

def SetTxMute(AntennaSerialPortName, Baud, IsTxMuted):
    """
    Called by settingsApi when Tx mute configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":32," + IsTxMuted + ",c\n"
    print("antennaSend.SetTxMute() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())

def SendPolOffset(AntennaSerialPortName, Baud, PolOffset):
    """
    Called by settingsApi when Manual Offsets configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":42," + PolOffset + ",c\n"
    print("antennaSend.SendPolOffset() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())

def SendAzOffset(AntennaSerialPortName, Baud, AzOffset):
    """
    Called by settingsApi when Manual Offsets configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":44," + AzOffset + ",c\n"
    print("antennaSend.SendAzOffset() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def SendHeading(CompassSerialPortName, Baud, Heading, IsManual):
    """
    Called by settingsApi when Manual Compass configured on GUI.
    """

    compassSerialPort = OpenSerialPort(CompassSerialPortName, Baud)

    if IsManual == "on":
        cmd = ":120,23," + Heading + ",1,\n"
        print("antennaSend.SendHeading() - Setting Heading. Writing CMD: " + cmd + " " + CompassSerialPortName)
        compassSerialPort.write(cmd.encode())
        time.sleep(1)
        cmd = ":120,22,1,1,\n"
        print("antennaSend.SendHeading() - Setting to Manual. Writing CMD: " + cmd + " " + CompassSerialPortName)
        compassSerialPort.write(cmd.encode())
    else:
        cmd = ":120,22,0,1,\n"
        print("antennaSend.SendHeading() - Setting to Auto. Writing CMD: " + cmd + " " + CompassSerialPortName)
        compassSerialPort.write(cmd.encode())

def SendGps(AntennaSerialPortName, Baud, GpsLat, GpsLng):
    """
    Called by settingsApi when Manual GPS configured on GUI.
    """

    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":45," + GpsLat + "," + GpsLng + ",c\n"
    print("antennaSend.SendGps() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())

def SetAutoGps(AntennaSerialPortName, Baud):
    """
    Called by settingsApi when Auto GPS configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":46,c\n"
    print("antennaSend.SetAutoGps() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def ErrorStop(antennaSerialPort=False):

    if antennaSerialPort:
        antennaSerialPort.write(":98,c\n".encode())                                                          # Reply with :98 to stop Teensy from sending message.
    else:
        print("antennaSend DEBUG: Write(\":98,cNL\")")


def SavedConfig(antennaSerialPort=False):
    """ Sends saved config to Arduino. Usually called on start-up."""
    settings = AntennaSettings.objects.all()[0]

    rxpolisv = "0"
    if settings.rxpol == "V":
        rxpolisv = "1"

    istxmuted = "0"
    if settings.istxmuted:
        istxmuted = "1"

    ismanualgps = "0"
    if settings.ismanualgps:
        ismanualgps = "1"

    if settings.satlong == 'Manual':
        satlong = '999'
    else:
        satlong = settings.satlong

    config = ":99," + settings.manualEl + "," + settings.manualAz + "," + settings.manualPol + "," + settings.poloffset + ",0," + settings.azoffset + "," + satlong + "," + rxpolisv + "," + istxmuted + "," + ismanualgps + "," + settings.manualgpslat + "," + settings.manualgpslng + ",c\n"

    print(config)
    try:
        if antennaSerialPort:
            antenna_settings = AntennaSettings.objects.all()[0]

            az_trim_db = Setting.objects.get(name='az_trim')
            SendAzTrim(antenna_settings.teensyPort, 115200, az_trim_db.value_str)
            time.sleep(1)
            el_trim_db = Setting.objects.get(name='el_trim')
            SendElTrim(antenna_settings.teensyPort, 115200, el_trim_db.value_str)
            time.sleep(1)
            antennaSerialPort.write(config.encode())                                                     # Reply with :98 to stop Teensy from sending message.

        else:
            print("antennaSend DEBUG: SavedConfig.Write: " + config)
    except:
        CriticalLog("antennaSend.py SavedConfig(): , Antenna Not Connected. Check Port Details.")


def ReInit(antennaSerialPort=False):
    if antennaSerialPort:
        antennaSerialPort.write(":500,c\n".encode())                                                          # Reply with :98 to stop Teensy from sending message.
    else:
        print("DEBUG (No Serial) - antennaSend ReInit: Write(\":500,c\")")


def Point(Satlong, Rxpol, Satskew, antennaSerialPort=False):

    if Rxpol == "V":
        pol = "1"
    else:
        pol = "0"

    if antennaSerialPort:
        cmd = ":11," + Satlong + "," + pol + "," + Satskew + ",c\n"
        print("antennaSend.Point(): " + cmd)
        antennaSerialPort.write(cmd.encode())                                                          # Reply with :98 to stop Teensy from sending message.
    else:
        print("antennaSend Point: Write(\":11," + Satlong + "," + pol + "," + Satskew + ",c\")")

def SendCommand(AntennaSerialPortName, Baud, Command):
    """
    Called by settingsApi from Advanced page.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = Command + ",\n"
    print("serial.SendCommand() - Writing CMD: " + cmd + " On: " + AntennaSerialPortName)
    antennaSerialPort.write(cmd.encode())

def GetAdvancedConfig(antennaSerialPort=False):
    if antennaSerialPort:
        antennaSerialPort.write(":220,c\n".encode())
        time.sleep(2)
        antennaSerialPort.write(":303,c\n".encode())                                                          # Reply with :98 to stop Teensy from sending message.
    else:
        print("DEBUG (No Serial) - GetAdvancedConfig(): Write(\":303,c\")")


def SendElTrim(AntennaSerialPortName, Baud, ElTrim):
    """
    Called by settingsApi when trim configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":207,54," + ElTrim + ",1,c\n"
    print("antennaSend.SendElTrim() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def SendAzTrim(AntennaSerialPortName, Baud, AzTrim):
    """
    Called by settingsApi when trim configured on GUI.
    """
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":207,63," + AzTrim + ",1,c\n"
    print("antennaSend.SendAzTrim() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())


def SetDebug(AntennaSerialPortName, Baud, IsOn, Rate):
    """Turn On/Off Debug."""
    antennaSerialPort = OpenSerialPort(AntennaSerialPortName, Baud)
    cmd = ":213," + IsOn + "," + Rate + ",c\n"
    print("antennaSend.SetDebug() - Writing CMD: " + cmd)
    antennaSerialPort.write(cmd.encode())
