const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require ('dotenv/config');

const app = express();
const env = process.env;

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(cors);
app.options('*',cors()); 

const PORT=env.PORT;
const HOSTNAME=env.HOSTNAME;


app.listen(
    PORT,HOSTNAME,()=>{
        console.log(`Server running at http://${HOSTNAME}:${PORT}`);
        console.log(`Hello World`);
    }
);