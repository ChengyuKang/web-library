const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const { render } = require('ejs')

// all authors
// the '/' means the url, which will render to the authors/index.ejs  
router.get('/',async (req,res)=>{
    let searchOptions = {}
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {  
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors : authors, 
            searchOptions: req.query
        })
    } catch (error) {
        res.render('/')
    }
    
})

// new authors
router.get('/new',(req,res)=>{
    res.render('authors/new', {author: new Author()})
})

// create authors
router.post('/',async (req,res)=>{
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()
        // res.redirect(`authors/${newAuthor.id}`)
        res.redirect(`authors`)
    } catch (error) {
        res.render('authors/new',{
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
    // author.save((err,newAuthor) =>{
    //     if(err){res.render('authors/new',{
    //         author: author,
    //         errorMessage: 'Error creating Author'
    //     })
    //     } else{
    //     // res.redirect(`authors/${newAuthor.id}`)
    //     res.redirect(`authors`)
    //     }
    // })
})


router.get('/:id',async (req,res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/show',{
            author: author,
            booksByAuthor: books
        })
    } catch(err) {
        console.log(err)
        res.redirect('/')
    }
})

// edit author
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
    } catch (error) {
        res.redirect('/authors')
    }
    
})

router.put('/:id',async (req,res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch (error) {
        if (author==null) {
            res.redirect('/')
        } else {
            res.render('authors/edit',{
                author :author,
                errorMessage: 'error updating author'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.deleteOne()
        // res.redirect('/authors')
        res.send('ll')
    } catch {
        if (author==null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router