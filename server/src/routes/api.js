const { Router } = require('express');

const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

api = Router();

api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter)

module.exports = api;