const request = require('supertest');
const app = require('../../app');
const { 
    connectMongo, 
    disconnectMongo 
} = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await connectMongo();
    });

    describe('test GET /launches', () => {
        test('it should respond with 200 success', async () => {
            const response = await request(app)
                .get('/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });
    
    describe('test POST /launches', () => {
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 4, 2028',
        };
    
        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        };
    
        const launchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'zoot',
        };

        test('it should respond with 201 created', async () => {
            const completeLaunchData = {
                mission: 'USS Enterprise',
                rocket: 'NCC 1701-D',
                target: 'Kepler-62 f',
                launchDate: 'January 4, 2028'
            }
    
            const response = await request(app)
                .post('/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
        
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });
    
        test('it should catch missing required properties', () => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
        
            expect(response.body).toStrictEqual({
                error: 'Missing required launch property',
            });
        });
    
        test('it should also catch invalid dates', () => {
            const response = await request(app)
                .post('/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
        
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date',
            });
        });
    });

    afterAll(async () => {
        await disconnectMongo();
    });
});