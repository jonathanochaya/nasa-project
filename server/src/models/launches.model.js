const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: DEFAULT_FLIGHT_NUMBER,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true
};

saveLaunch(launch);

async function getLatestFlightNumber() {
    const launch = await launches
        .findOne()
        .sort('-flightNumber');

    if(!launch) return DEFAULT_FLIGHT_NUMBER;

    return launch.flightNumber;
}

async function getLaunches(skip, limit) {
    // return Array.from(launches.values());
    return await launches
        .find({}, {
            '_id': 0,
            '__v': 0
        })
        .skip(skip)
        .limit(limit)
        .sort({'flightNumber': 1});
}

async function saveLaunch(launch) {
    try { 
        await launches.findOneAndUpdate({
            flightNumber: launch.flightNumber
        }, launch, {
            upsert: true,
        });
    } catch (err) {
        console.error(`Couldn't save launch ${err}`);
    }
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    });

    if(!planet) {
        throw new Error('No matching planet found');
    }

    const latestFlightNumber = (await getLatestFlightNumber()+1);
    await saveLaunch(Object.assign(launch, {
        flightNumber: latestFlightNumber,
        customers: ['Zero to Mastery', 'NASA'],
        upcoming: true,
        success: true
    }));
}

async function abortLaunch(launchId) {
    const aborted = await launches.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    });

    return aborted.acknowledged === true && aborted.modifiedCount === 1;
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function findLaunchById(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
async function populateLaunchesDatabase() {
    const response = await axios.post(SPACEX_API_URL, {
        "query": {},
        "options": {
            "pagination": false,
            "populate": [
                {
                    "path": "rocket",
                    "select": {
                        "name": 1
                    }
                },
                {
                    "path": "payloads",
                    "select": {
                        "customers": 1
                    }
                }
            ]
        }
    });

    // check whether our request was successful
    if(response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs) {
        
        const customers = launchDoc['payloads'].flatMap((payload) => {
            return payload['customers']; 
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }

        console.log(`${ launch.flightNumber } ${launch.mission}`)
    
        // populate launches collection...
        await saveLaunch(launch);
    }
}


async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });

    if(!firstLaunch) {
        await populateLaunchesDatabase();
    } else {
        console.log('Launches data already exists!');
    }
}

module.exports = {
    getLaunches,
    scheduleNewLaunch,
    abortLaunch,
    findLaunchById,
    loadLaunchesData
}