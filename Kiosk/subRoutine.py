import requests
import smbus


# Uncomment when on Raspberry PI
#bus=smbus.SMBus(1)


# Could get the address from the arduino that send the iterate request instead of main.py

# def readIC2():
#         while(True):
#                 b=bus.read_byte_data(80,0)
#                 if(b is not None):
#                         res = requests.get('http://localhosr:5000/iteratequeue').json
#                         bus.write_byte_data(res["address"],0,res["qnumber"])


while(True):
        file = open("testfile.txt","r+") 
        res = file.read() 
        if(res == "Hi\n"):
                res = requests.get('http://127.0.0.1:5000/iteratequeue')
                print(res.json()["qnumber"])
                file.write("No")