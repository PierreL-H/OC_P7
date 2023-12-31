const express = require('express')
const path = require('path')
const app = express()
const dbUrl = require('./configs/db.config')

const userRoutes = require('./routes/users')
const bookRoutes = require('./routes/books')

const mongoose = require('mongoose')
mongoose.connect(dbUrl,
{ useNewUrlParser: true,
    useUnifiedTopology: true})
    .then(()=> {console.log('database connection successful')})
    .catch(()=> {console.log('database connection failed')})

const PORT = 4000


app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/auth', userRoutes)
app.use('/api/books', bookRoutes)

app.use('/images', express.static(path.join(__dirname, 'images')))


app.listen(PORT, () => {
  console.log('listening on: ', PORT)
})