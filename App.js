const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const Routess=require('./routes/routes')
require('dotenv').config();


// Middle wares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use("/api",Routess)
app.get("/",(req,res)=>{
    res.send("App is up and running!!")
})
mongoose.connect( process.env.DATABASE , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
}).then(() => {
    console.log('DB IS CONNECTED');
});


app.listen(3002, () => {
    console.log(`jebhdhbkd ${3002}`);
})
