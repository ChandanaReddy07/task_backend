const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const Routess=require('./routes/routes')


// Middle wares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


app.use("/api",Routess)

mongoose.connect("mongodb+srv://taskB:taskB@cluster0.wbduphi.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,    
}).then(() => {
    console.log('DB IS CONNECTED');
});




app.listen(3002, () => {
    console.log(`jebhdhbkd ${3002}`);
})
