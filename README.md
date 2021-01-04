# CTIS 456 - Team2

## SmartQ: DATA SCIENCE ORIENTED SMART QMATIC SYSTEM

# Components of the System

## [Kiosk Subsystem](https://github.com/Kalmera74/SeniorProject/tree/master/Kiosk)

This subsystem provides an interface to the users to scan a QR code to get their queue number. When a user scans a QR code a new QR code will be displayed for the next user.

 This subsystem is consists of two parts. The first part is the brain of the system where all the communication with the WebService and necessary calculation takes place and provides an interface for the end-user. The brain of the system is written in Python3 on is being run on a Raspberry Pi B+. 

The second part is the slave arrays of Arduino Unos that are connected to the Raspberry Pi through I²C protocol. Its function is to let the master know it's time to iterate the queue and display the current queue number on the desk

## [WebService SubSystem](https://github.com/Kalmera74/SeniorProject/tree/master/WebService)

This subsystem provides a communication channel between all the other three subsystems. Its main job is to provide the data it gets from one subsystem to another subsystem. This subsystem is being developed in Node.js and Express to provide scalable, fast, and reliable services.

## [Mobile Subsystem](https://github.com/Kalmera74/SeniorProject/tree/master/Mobile)

This subsystem is what the end-users will use to interact with the system. With the mobile app, users can get a queue number, look at their and the organization's statistics, and forfeit their place in the queue. This subsystem is being developed in Flutter to utilize development time in the best way possible by using the philosophy of "write once use everywhere".


## [WebPortal Subsystem](https://github.com/Kalmera74/SeniorProject/tree/master/WebPortal)

This subsystem is for the use of the organization's administration. It provides various statistics about the organization and its customers so that the management could utilize the data in their favor. There are two types of users. One is the admin user that comes with the system. This user can invite new users and manage the Kiosk subsystem through the portal (eg. deactivating a desk). Another kind of user is the standard user. This user can only view statistics of the system and generate reports

## Demo

### [Product Video](https://drive.google.com/file/d/1Mv59_vSGfxJvBtjBOBG6XCEYtBJPp4Np/view?usp=sharing)

## User Manuels

### [Mobile Manuel](https://github.com/Kalmera74/SeniorProject/blob/master/Mobile/qrcode_scanner-master/UserManual/UserManual.pdf)

### [WebPortal Manuel](https://github.com/Kalmera74/SeniorProject/blob/master/WebPortal/WebPortal_ManualGuide.pdf)

# Poster
![smart qmatci poster](https://github.com/Kalmera74/SeniorProject/blob/master/Poster.jpg)
