const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const app = require('../app'); // Assuming the app file is named app.js
const User = require('../models/user'); // Assuming the user model file is named user.js
const bcrypt = require('bcrypt');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Authentication and Follow User', () => {
    let token; // Variable to store JWT token for authentication
    let current_user; // Variable to store the user object for testing
    let user2follow;

    before(async () => {
        // Create a new user for testing
        const hashedPassword = await bcrypt.hash('krishna', 10);
        const hashedPassword2 = await bcrypt.hash('radha', 10);
        current_user = new User({ email: 'k@gmail.com', password: hashedPassword });
        user2follow = new User({ email: 'r@gmail.com', password: hashedPassword2 });

       
        await current_user.save();
        await user2follow.save();

        //JWT token of current user
        token = jwt.sign({
            user: current_user
        }, process.env.SECRET , {expiresIn: '1h'});

    });


    after(async () => {
        // Remove the user created during testing
        await User.deleteOne({ email: 'test@example.com' });
    });



    //Authentication check
    it('should authenticate a user and return a JWT token', (done) => {
        chai.request('https://task-backend007.onrender.com')
            .post('/api/authenticate')
            .send({ email: 'test@example.com', password: 'testpassword' })
            .end((err, res) => {
                if (err) return done(err);
    
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                token = res.body.token; // Save the JWT token for further testing
    
                done();
            });
    });
    

    it('should return an error for invalid email format during authentication',  (done) => {
          chai.request('https://task-backend007.onrender.com')
            .post('/api/authenticate')
            .send({ email: 'invalidemail', password: 'testpassword' })
            .end((err, res) => {
                if (err) 
                console.log("hii")
    
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error');
                done();
            });

    });

    it('should return an error for wrong password during authentication',  (done) => {
        chai.request('https://task-backend007.onrender.com')
        .post('/api/authenticate')
        .send({ email: 'k@gmail.com', password: 'wrongpassword' })
        .end((err, res) => {
            if (err) 
            console.log("hii")

            expect(res).to.have.status(401);
            expect(res.body).to.have.property('error');
            done();
        });

  
    });

    it('should follow a user and update follower and following lists',  (done) => {
        chai.request('https://task-backend007.onrender.com')
            .post(`/api/follow/${user2follow._id}`)
            .set('Authorization', `Bearer ${token}`)// Set the JWT token in the header for authentication
            .end((err, res) => {
                if (err) 
                console.log("hii")
    
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('nModified'); // Assert that 'nModified' property exists
                expect(res.body.nModified).to.equal(1); //
        
                // Fetch the updated user from the database
                const updated_currentUser =  User.findById(user2follow._id);
                const updated_user2follow =  User.findById(req.user.user._id);
                console.log(req.user.user)
        
                expect(updated_user2follow).to.have.property('followers').that.includes(req.user.user._id);
                expect(updated_currentUser).to.have.property('following').that.includes(user2follow._id);
                done();
            });
            
    
    });

    // Add more test cases for edge cases and error scenarios as needed

});

