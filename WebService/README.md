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

> Seed data includes one admin,potral,mobile user can be found in db> seeds>user seed

## Start API Server

By default,

```bash
npm run start
```

By special configurations

```bash
node app.js --port 5050
```

Coding standarts
(https://github.com/airbnb/javascript=