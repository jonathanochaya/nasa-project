const { 
    getLaunches,
    scheduleNewLaunch,
    abortLaunch,
    findLaunchById
} = require('../../models/launches.model');

const {
    getPagination
} = require('../../services/query');

async function httpGetLaunches(req, res)  {
    const { skip, limit} = getPagination(req.query);
    const launches = await getLaunches(skip, limit); 
    
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    // handle post data here
    const launch = req.body;

    if(!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
        return res.status(400).json({
            error: 'Missing required launch property'
        })
    }

    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date'
        });
    }

    await scheduleNewLaunch(launch);

    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    if(await findLaunchById(launchId)) {
        const aborted = await abortLaunch(launchId);

        if(!aborted) {
            return res.status(400).json({
                error: 'Launch not aborted',
            });
        }

        res.status(200).json({
            ok: aborted
        });
    } else {
        res.status(404).json({
            error: 'Launch not found'
        });
    }
}

module.exports = {
    httpGetLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}