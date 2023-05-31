if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require("express")
const app = express()
const expressLayouts = require('express-ejs-layouts')
//bodyparser will help deal with data
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')

// set the express framework settings
app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
//use bodyparser
app.use(bodyParser.urlencoded({limit:'10mb', extended: false}))

//connect to mongo db
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser : true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open',() => console.log('successfully connected to mongoose!'))

app.use('/',indexRouter)
// 'authors' means the prepending of the url, which is related to the first '/' in the router
app.use('/authors', authorRouter)

app.listen(process.env.PORT || 3000)