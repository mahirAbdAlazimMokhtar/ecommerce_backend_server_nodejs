const bodyParser = require("body-parser");
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const path = require("path");
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
require('dotenv/config');
const authjwt = require('./middlewares/jwt');
const errorHandler = require('./middlewares/error_handler');
const authorizePostRequests = require('./middlewares/authorization');


const app = express();
const env = process.env;
const API = env.API_URL;
const compression = require('compression');
app.use(compression());


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
const categoryRouter = require('./routes/categories_routers');
const productsRouter = require('./routes/product_routers');
const checkoutRouter = require('./routes/checkout_routers');
const ordersRouter = require('./routes/order_routers');

app.use(`${API}/`,authRouter);
app.use(`${API}/users`,usersRouter);
app.use(`${API}/admin`,adminRouter) ;
app.use(`${API}/categories`,categoryRouter);
app.use(`${API}/products`,productsRouter);
app.use(`${API}/orders`, ordersRouter);
app.use(`${API}/checkout`,checkoutRouter);
// السماح بعرض الصور بدون توثيق
app.use("/public/uploads", express.static(path.join(__dirname, "public/uploads")));


const PORT=env.PORT;
const HOSTNAME=env.HOSTNAME || '0.0.0.0';
require('./helpers/cron_jobs');

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