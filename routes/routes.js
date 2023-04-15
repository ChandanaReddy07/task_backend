const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Function to verify JWT token
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET , (err, decoded) => {
            if (err) {
                reject(err)
            } else {
                resolve(decoded);
            }
        });
    });
};

// Middleware to verify JWT token and get user details
const authenticate = async (req, res, next) => {
    try {

        const token = req.headers.authorization;

        if (! token) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        // Verify the JWT token
        const decoded = await verifyToken(token.split(" ")[1]);

        // Set the user details in the request object
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({error: 'Invalid token'});
    }
};


// Authentication
router.post('/authenticate', async (req, res) => {
    const {email, password} = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({error: 'Invalid email address'});
    }

    // Find the user by email
    var user = await User.findOne({email});
    if (! user) {
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({email, password: hashedPassword});

        await user.save();
    } else { // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (! match) {
            return res.status(401).json({error: 'Wrong password'});
        }
    }

    var token = jwt.sign({
        user: user
    }, process.env.SECRET , {expiresIn: '1h'});

    // Return the JWT token in the response
    res.status(200).json({token, user: {
            email
        }});
});


// Follow a user
router.post('/follow/:id', authenticate, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.user._id);
        
        const userToFollow = await User.findById(req.params.id);

  
        if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

        if (! userToFollow) {
            return res.status(404).json({error: 'User not found'});
        }
       
        const updatedUser = await User.findOneAndUpdate({
            _id: req.params.id
        }, {
            $push: {
                followers: currentUser._id
            }
        }, {new: true});
        const updatedUser1 = await User.findOneAndUpdate({
            _id: currentUser._id
        }, {
            $push: {
                following: req.params.id
            }
        }, {new: true});



        res.status(200).json({"message":"succesfully followed","you":updatedUser1 , "userTofollow": updatedUser});
    } catch (err) {
        res.status(500).json({error: 'Failed to follow user'});
    }
});

// Unfollow a user
router.post('/unfollow/:id', authenticate, async (req, res) => {
    try {
        const currentUser = req.user.user;
        const userToUnfollow = await User.findById(req.params.id);
        if (! userToUnfollow) {
            return res.status(404).json({error: 'User not found'});
        }
        console.log(currentUser)
              if (!currentUser.following.includes(req.params.id)) {
            return res.status(400).json({ error: 'You are not following this user' });
          }
        const updatedUser = await User.findOneAndUpdate({
            _id: req.params.id
        }, {
            $pull: {
                followers: currentUser._id
            }
        }, {new: true});
        const updatedUser1 = await User.findOneAndUpdate({
            _id: currentUser._id
        }, {
            $pull: {
                following: req.params.id
            }
        }, {new: true});
        // console.log(updatedUser)
        // console.log(updatedUser1)

        res.status(200).json({"message":"succesfully unfollowed","you":updatedUser1 , "userToUnfollow": updatedUser});
    } catch (err) {
        res.status(500).json({error: 'Failed to unfollow user'});
    }
});

// Get user profile
router.get('/user', authenticate, async (req, res) => {
    try {
        const currentUser = req.user.user;
        const user = await User.findById(currentUser._id).populate('following', '_id username').populate('followers', '_id username');
        const {_id, username, following, followers} = user;
        res.status(200).json({_id, username, following, followers});
    } catch (err) {
        res.status(500).json({error: 'Failed to get user profile'});
    }
});

// Add a new post
router.post('/posts', authenticate, async (req, res) => {
    try {
        const currentUser = req.user.user;
        const {title, description} = req.body;
        // Create a new Date object representing the current date and time
        const currentDate = new Date();

        // Get the individual components of the current date and time
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth() + 1; // Month is zero-based, so add 1
        const day = currentDate.getUTCDate();
        const hours = currentDate.getUTCHours();
        const minutes = currentDate.getUTCMinutes();
        const seconds = currentDate.getUTCSeconds();

        // Format the components into a string representing the createdTime in UTC
        const createdTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;

        console.log(createdTime); // Example output: "2023-04-11 12:34:56 UTC"

        const post = new Post({user: currentUser._id, title, description, createdTime});
        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({error: 'Failed to create post'});
    }
});

// Delete a post
router.delete('/posts/:id', authenticate, async (req, res) => {
    try {
        const currentUser = req.user.user;
        const post = await Post.findById(req.params.id);
        if (! post) {
            return res.status(404).json({error: 'Post not found'});
        }

        if (post.user.toString() !== currentUser._id.toString()) {
            return res.status(403).json({error: 'Unauthorized'});
        }
        const result = await post.deleteOne({_id: req.params.id});

        if (result) 
            res.status(200).json({message: 'Post deleted successfully'});
        


    } catch (err) {
        res.status(500).json({error: 'Failed to delete post'});
    }
});

// Like a post
router.post('/like/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    const currentUser = req.user.user;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (! post) {
        return res.status(404).json({error: 'Post not found'});
    }
    // Check if the user has already liked the post
    const alreadyLiked = post.likes.includes(currentUser._id);
    if (alreadyLiked) {
        return res.status(400).json({error: 'Post already liked by the user'});
    }
    // Add the user to the post's likes array
    const ass = await Post.updateOne({
        _id: post._id
    }, {
        $addToSet: {
            likes: currentUser._id
        }
    });

    // console.log(ass)
    res.sendStatus(200).json({message: "Liked successfully"});
});

// // Endpoint for unliking a post
router.post('/unlike/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    const currentUser = req.user.user;

    const post = await Post.findById(postId);
    if (! post) {
        return res.status(404).json({error: 'Post not found'});
    }
    // Check if the user has liked the post
    const alreadyLiked = post.likes.includes(currentUser._id);
    if (! alreadyLiked) {
        return res.status(400).json({error: 'Post is not liked by the user'});
    }
    // Remove the user from the post's likes array
    const ass = await Post.updateOne({
        _id: post._id
    }, {
        $pull: {
            likes: currentUser._id
        }
    });


    res.sendStatus(200).json({message: "Unliked successfully"});
});

// Endpoint for adding a comment to a post
router.post('/comment/:id', authenticate, async (req, res) => {

    const comment = req.body.comment

    const post = await Post.findById(req.params.id);
    if (! post) {
        return res.status(404).json({error: 'Post not found'});
    }
    // Create a new comment
    const newComment = new Comment({comment, user: req.user.user._id});
    // Save the comment to the database
    await newComment.save();
    // Add the comment to the post's comments array

    const ass = await Post.updateOne({
        _id: post._id
    }, {
        $push: {
            comments: newComment._id
        }
    });
    // Save the updated post
    await post.save();
    // Return the comment ID in the response
    res.status(200).json({commentId: newComment._id, post: post});
});

// // Endpoint for fetching all posts created by authenticated user
router.get('/all_posts', authenticate, async (req, res) => { // const { email } = req.user.user;

    try { // Fetch all posts created by the authenticated user, sorted by post time
        const posts = await Post.find({user: req.user.user._id}).sort({created_at: -1});

        // Map the posts to the requested fields
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            desc: post.desc,
            created_at: post.created_at,
            comments: post.comments,
            likes: post.likes.length
        }));

        // Return the formatted posts in the response
        res.status(200).json(formattedPosts);

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
