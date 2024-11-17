const bodyParser = require("body-parser");
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const authjwt = require('./middlewares/jwt');
const errorHandler = require('./middlewares/error_handler');
const authorizePostRequests = require('./middlewares/authorization');


const app = express();
const env = process.env;
const API = env.API_URL;
require('./helpers/cron_jobs');

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*',cors());
app.use(authjwt());
app.use(errorHandler);
app.use(authorizePostRequests);

const authRouter = require('./routes/auth_routes');
const usersRouter = require('./routes/users_routers');
const adminRouter = require('./routes/admin_routers');
const categoryRouter = require('./routes/categories_router');
const productsRouter = require('./routes/product_routers');

app.use(`${API}/`,authRouter);
app.use(`${API}/users`,usersRouter);
app.use(`${API}/admin`,adminRouter) ;
app.use(`${API}/categories`,categoryRouter);
app.use(`${API}/products`,productsRouter);
app.use('/public', express.static(__dirname + '/public'));


const PORT=env.PORT;
const HOSTNAME=env.HOSTNAME;

/// connect mongoose 
mongoose.connect(env.MONGODB_CONNECTION_STRING).then(()=>{
    console.log('Hi We Connected To MongoDB ');
}).catch((error)=>{
    console.error(error);
});

app.listen(
    PORT,HOSTNAME,()=>{
        console.log(`Server running at http://${HOSTNAME}:${PORT}`);
    }
);