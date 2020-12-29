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

### Write Kiosk API's url to each json file inside the config folder

### Change related connection areas used while creating postgresql, index js and config file

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

> Seed data includes 
>one admin user(Username : admin, Password : admin),
>one portal user(username: 'portaluser',password: '5555'),
>one mobile user (nationID: 12312,password: '123456') 

## Start API Server

By default,

```bash
npm run start
```

By special configurations

```bash
node app.js --port 5050
```

## Used coding standarts for Web Service
   (https://github.com/airbnb/javascript)