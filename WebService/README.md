# Queue System API

Basic Queue API System by using PostgreSQL

## Get Started

### Requirements

- NodeJS Version v12.18.3
- NPM Version v6.14.4

For checking:

- [ ] `node -v`
- [ ] `npm -v`

### Before launch program, install node modules

```bash
npm install
```

### Write Kiosk API's url to each json file inside the config folder and senqr function inside qr service

### Change related connection areas used while creating postgresql index js and config file

### Set Environment

Environments:

- test : for testing
- dev : for development

`Default : dev`

```bash
npm run start
```

### Migrate

Create all tables

```bash
npm run migrate
```

or

Create all tables with seed data

```bash
npm run migrate:seed
```

> Seed data includes;
>one admin user (Username : admin, Password : admin)
>one portal user(Username : portaluser , Password : 5555 )
>one mobile user(nationID : 12312, password: '123456')
 
### Test

Install jest module

```bash
npm i g jest
```

Test All System

```bash
npm run test
```

You should see these after testing:

```bash
Test Suites: 11 passed, 11 total
Tests:       78 passed, 78 total
```

## Start API Server

By default,

```bash
npm run start
```

By special configurations

```bash
node app.js --port 5050
```

## Note: 

To get an authentication use below path

```bash
/auth/ ( use any root inside auth_service file )
```
To send request one of the endpoints use below path 

```bash
/api/ (mobile/portal/(or nothing that represents this is a admin user))
```

Coding standarts
(https://github.com/airbnb/javascript=