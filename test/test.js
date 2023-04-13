const request = require('supertest');
const app = require('../app'); // Your Express app
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const chai = require('chai');
const expect = chai.expect;

describe('Authentication Endpoints', () => {
    let user;
    let token;

    before(async () => {
        // Create a test user
        const hashedPassword = await bcrypt.hash('krishna', 10);
        user = new User({email: 'k@gmail.com', password: hashedPassword});
        await user.save();

        // Generate JWT token for the test user
        token = jwt.sign({user}, process.env.SECRET, {expiresIn: '1h'});
    });

    after(async () => {
        // Delete the test user
        await User.deleteOne({_id: user._id});
    });

    describe('POST /authenticate', () => {
        it('should authenticate a user with valid email and password', async () => {
            const response = await request(app)
                .post('/authenticate')
                .send({email: 'k@gmail.com', password: 'krishna'})
                .expect(200);
            expect(response.body).to.have.property('token');
            expect(response.body.token).to.be.a('string');
        });

        it('should return 401 Unauthorized with invalid password', async () => {
            const response = await request(app)
                .post('/authenticate')
                .send({email: 'k@gmail.com', password: 'wrongpassword'})
                .expect(401);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Wrong password');
        });

        it('should return 400 Bad Request with missing email or password', async () => {
            const response = await request(app)
                .post('/authenticate')
                .send({})
                .expect(400);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Email and password are required');
        });
    });

    describe('GET /user', () => {
        it('should return profile data for authenticated user', async () => {
            const response = await request(app)
                .get('/user')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).to.have.property('email');
            expect(response.body.email).to.equal('test@example.com');
        });

        it('should return 401 Unauthorized for unauthenticated user', async () => {
            const response = await request(app)
                .get('/user')
                .expect(401);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.equal('Unauthorized');
        });
    });
});
