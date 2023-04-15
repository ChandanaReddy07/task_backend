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
    let invalid_id;
    let invalid_token;

    before(async () => {
        // Create a new user for testing
        const hashedPassword = await bcrypt.hash('krishna', 10);
        const hashedPassword2 = await bcrypt.hash('radha', 10);
        current_user = new User({ email: 'k@gmail.com', password: hashedPassword });
        user2follow = new User({ email: 'r@gmail.com', password: hashedPassword2 });

        //invalids 
        invalid_id="6437a195cf78ed8ddc7e6f21";
        invalid_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY0MzdhMzEwMjVkMzg2MzYxNWFkMzg1NyIsInBhc3N3b3JkIjoiJDJiJDEwJFVrZDZUWWhsenlGWWVqSEIyN3RFc094a2xtUXoyalBUNmxqTEp0Q0ltMDV0Rk5GcVdnWmtHIiwiZW1haWwiOiJyQGdtYWlsLmNvbSIsImZvbGxvd2VycyI6W10sImZvbGxvd2luZyI6W10sImNyZWF0ZWRBdCI6IjIwMjMtMDQtMTNUMDY6Mzc6MDQuMzI3WiIsInVwZGF0ZWRBdCI6IjIwMjMtMDQtMTNUMDY6Mzc6MDQuMzI3WiIsIl9fdiI6MH0sImlhdCI6MTY4MTU1NDE4NywiZXhwIjoxNjgxNTU3Nzg3fQ.ZnCbynMzD2XCfskDuBHM_Xsq8IBQ4MmINyPW845TeSI"

       
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
    // it('should authenticate a user and return a JWT token', (done) => {
    //     chai.request('https://task-backend007.onrender.com')
    //         .post('/api/authenticate')
    //         .send({ email: 'test@example.com', password: 'testpassword' })
    //         .end((err, res) => {
    //             if (err) return done(err);
    
    //             expect(res).to.have.status(200);
    //             expect(res.body).to.have.property('token');
    //             token = res.body.token; // Save the JWT token for further testing
    
    //             done();
    //         });
    // });
    

    // it('should return an error for invalid email format during authentication',  (done) => {
    //       chai.request('https://task-backend007.onrender.com')
    //         .post('/api/authenticate')
    //         .send({ email: 'invalidemail', password: 'testpassword' })
    //         .end((err, res) => {
    //             if (err) 
    //             console.log("hii")
    
    //             expect(res).to.have.status(400);
    //             expect(res.body).to.have.property('error');
    //             done();
    //         });

    // });

    // it('should return an error for wrong password during authentication',  (done) => {
    //     chai.request('https://task-backend007.onrender.com')
    //     .post('/api/authenticate')
    //     .send({ email: 'k@gmail.com', password: 'wrongpassword' })
    //     .end((err, res) => {
    //         if (err) 
    //         console.log("hii")

    //         expect(res).to.have.status(401);
    //         expect(res.body).to.have.property('error');
    //         done();
    //     });

  
    // });

    // it('should follow a user and update follower and following lists', (done) => {
    //     chai.request('https://task-backend007.onrender.com')
    //       .post(`/api/follow/${user2follow._id}`)
    //       .set('Authorization', `Bearer ${token}`) // Set the JWT token in the header for authentication
    //       .end(async (err, res) => {
    //         if (err) {
    //           console.log("Error:", err);
    //           return done(err); // Call done with the error to signal the test failure
    //         }
      
    //         expect(res).to.have.status(200);
    //         // Fetch the updated user from the database
    //         const updated_currentUser = await User.findById(current_user._id);
    //         const updated_user2follow = await User.findById(user2follow._id);
      
    //         expect(updated_user2follow).to.have.property('followers').that.includes(current_user._id);
    //         expect(updated_currentUser).to.have.property('following').that.includes(user2follow._id);
    //         done(); // Call done to signal the end of the test
    //       });
    //   });

    //   it('should return an error for following an invalid user', (done) => {
    //     chai.request('https://task-backend007.onrender.com')
    //         .post(`/api/follow/${invalid_id}`) // Replace with an invalid user ID
    //         .set('Authorization', 'Bearer ' + token) // Replace token with a valid JWT token
    //         .end((err, res) => {
    //             if (err) done(err);
    //             expect(res).to.have.status(404);
    //             expect(res.body).to.have.property('error');
    //             // Add additional assertions as needed
    //             done();
    //         });
    // });


    // Test for unfollowing a user
describe('POST /api/unfollow/:id', () => {
    it('should unfollow a user', (done) => {
        chai.request("https://task-backend007.onrender.com")
            .post(`/api/unfollow/${user2follow}`) // Replace :id with valid user ID
            .set('Authorization', 'Bearer ' + token) // Replace token with a valid JWT token
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should return an error for unfollowing an invalid user', (done) => {
        chai.request("https://task-backend007.onrender.com")
            .post(`/api/unfollow/${invalid_id}`) // Replace with an invalid user ID
            .set('Authorization', 'Bearer ' + token) // Replace token with a valid JWT token
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('error');
                
                done();
            });
    });
})
    

      

    // Add more test cases for edge cases and error scenarios as needed

});

