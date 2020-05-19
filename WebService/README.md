# Queue System API

Basic Queue API System by using Sqlite3 

## Get Started

### Requirements
- NodeJS Version v12.6.2
- NPM Version v6.14.4

For checking:
- [ ] `node -v` 
- [ ] `npm -v` 


### Before launch program, install node modules
```
npm install
```

### Write Kiosk API's url to each json file inside the config folder

### Set Environment
Environments:
- test : for testing
- dev : for development

`Default : dev`

```
node app.js --env test/dev
```

### Migrate
Create all tables by using config file on Sqlite3

```
node app.js --migrate
```

### Test

Test Routes
```
npm run test-routes
```
Test Services
```
npm run test-service
```

## Start API Server

By default,
```
npm run start
```
By special configurations
```
node app.js --port 5050
```
For details :  `node app.js --help`

## Documentation

Swagger doc will be generated, when start the server on  `/api-docs/`.

For example : `http://localhost:5000/api-docs/`



