const express = require('express')
const router = express.Router()
const Book = require('../models/book')

router.get('/',async (req,res)=>{
    let books
    let query = Book.find()
    query = query.sort({createdAt :'desc'}).limit(10)
    try {
        books = await query.exec()
        res.render('index',{
            books: books
        })
    } catch (error) {
        books = []
    }
    
})

module.exports = router