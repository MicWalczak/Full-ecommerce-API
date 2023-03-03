PORT = 3000
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const authJwt = require('./helpers/jwt')


const app = express()


//middleware
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(morgan('tiny'))
app.use(authJwt)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') return res.status(500).json({ message: 'The user is not authorized' })
    if (err.name === 'ValidationError') return res.status(401).json({ message: err })
    return res.status(500).json(err)
})


const categoryRoutes = require('./routers/category')
const productsRoutes = require('./routers/products')
const usersRoutes = require('./routers/users')
const ordersRoutes = require('./routers/orders');

const api = process.env.API_URL

app.use(`${api}/categories`, categoryRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)


mongoose.connect(process.env.CONNECTION_STRING, { dbName: 'Shop' })
    .then(() => console.log('Database Connection is ready...'))
    .catch((err) => console.log(err))

app.get('/home',(req,res)=>{
    res.render('../front-end/index')
})

app.listen(PORT, function () {
    console.log("Server started on port " + PORT);
});