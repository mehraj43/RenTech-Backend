const express = require('express');
const connectToMongo = require('./db');
const auth = require('./Routers/auth');
const productDetail = require('./Routers/productDetail');
const requestProduct = require('./Routers/requestProduct');
const reportedProduct = require('./Routers/reportedProduct');
const notifyData = require('./Routers/notifyData');
var cors = require('cors');

connectToMongo();
const app = express();
const port = 8500;

var corsOptions = {
  origin: 'http://localhost:3000',
};
app.use(cors(corsOptions));

app.use(express.json()); // To get a data in json formate

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', auth);
app.use('/api/productDetail', productDetail);
app.use('/api/requestProduct', requestProduct);
app.use('/api/reportProduct', reportedProduct);
app.use('/api/notifyUS', notifyData);

app.listen(port, () => {
  console.log(`App listen to the port - ${port}`);
});
