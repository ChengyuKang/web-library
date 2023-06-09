const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const fs = require('fs')

const path = require('path')
const multer = require('multer')
const uploadPath = path.join('public',Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/png','image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req,file,callback) =>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})


// all books
// the '/' means the url, which will render to the books/index.ejs  
router.get('/',async (req,res)=>{
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title',new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    try {
        const books = await query.exec()
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

// new books
router.get('/new',async (req,res)=>{
    try {
        const book = new Book()
        const authors = await Author.find({})
        res.render('books/new', {
            book : book,
            authors: authors
        })
    } catch (error) {
        res.render('/',{
            errorMessage: 'Error creating new book'
        })
    }
    
})

// show book
router.get('/:id', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        console.log(book.title)
        console.log(book.author)
        res.render('books/show',{
            book : book
        })
    } catch {
        res.redirect('/')
    }
})

//delete book
router.delete('/:id',async (req,res) =>{
    let book
    try {
        book = await Book.findById(req.params.id)
        book.deleteOne()
        res.send('delete done')
    } catch (error) {
        if (book==null) {
            res.redirect('/')
        } else {
            console.log(err)
            res.redirect(`/books/${book.id}`)
        }
    }
})

//edit book
router.get('/:id/edit', async (req,res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        const authors = await Author.find({})
        res.render('books/edit',{
            book: book,
            authors: authors
        })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

// edit book put
router.put('/:id', upload.single('cover'), async (req,res) =>{
    let book
    const fileName = req.file !=null ? req.file.filename: null
    console.log(fileName)
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title,
        book.description = req.body.description,
        book.author = req.body.author,
        book.pageCount = req.body.pageCount,
        book.publishDate = new Date(req.body.publishDate)
        console.log(book.coverImageName)
        if ( fileName != null && fileName !== '') {
            console.log('222')
            if(book.coverImageName != null){
                removeBookCover(book.coverImageName)
            }
            book.coverImageName = fileName
        }
        
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        console.error(error)
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        const authors= await Author.find({})
        res.render('books/new',{
            book: book,
            authors: authors,
            errorMessage: 'Error updating Book'
        })
    }
})

// create book
router.post('/',upload.single('cover'),async (req,res)=>{
    const fileName = req.file !=null ? req.file.filename: null
    console.log(fileName)
    const book = new Book({
        title : req.body.title,
        description: req.body.description,
        author: req.body.author,
        pageCount: req.body.pageCount,
        publishDate: new Date(req.body.publishDate),
        coverImageName: fileName
    })
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch (error) {
        console.error(error)
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        const authors= await Author.find({})
        res.render('books/new',{
            book: book,
            authors: authors,
            errorMessage: 'Error creating Book'
        })
    }
})

function removeBookCover(filename){
    fs.unlink(path.join(uploadPath, filename), err =>{
        if(err) console.error(err)
    })
}

module.exports = router