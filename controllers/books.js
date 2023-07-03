const sharp = require('sharp')
const path = require('path')
const Book = require('../models/Book')
const fs = require('fs')

exports.createBook = async (req, res, next) => {
  console.log('body: ', req.body)
  const body = JSON.parse(req.body.book)
  const userId = req.auth.userId
  console.log(body)

  // const { title, author, year, genre, averageRating} = req.body.book
  
  
  const { buffer, originalname } = req.file
  const fileExt = path.extname(originalname)
  const fileName = originalname.replace(fileExt, '')
  
  const now = new Date()
  const currentYear = String(now.getFullYear())
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
  const currentDay = String(now.getDate()).padStart(2, '0')
  const timestamp = currentYear+currentMonth+currentDay+now.getTime().toString()
  const ref = `${timestamp}-${fileName}.webp`
  try {
    await sharp(buffer).webp({quality: 20}).toFile('images/' + ref)
    
    console.log('file path: ', ref)
    console.log('auth: ', req.headers.authorization)
    
    body.userId = userId
    body.ratings[0].userId = userId
    body.imageUrl = `${req.protocol}://${req.get('host')}/images/${ref}`
    // console.log(body.imageUrl)

    const newBook = new Book(body)
    await newBook.save()
    res.status(201).json({message: 'Livre enregistré'})
  } catch (error) {
    console.log('error', error)
    res.status(400),json({ error })
  }

}


exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find()
    res.status(200).json(books)
    
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.getBook = async (req, res, next) => {
  const { id } = req.params
  try {
    const book = await Book.findById(id)

    if(!book){
      return res.status(404).json({ error: "Book not found" })
    }

    return res.status(200).json(book)
  } catch (error) {
    return res.status(500).json({ error })
  }
}

exports.getBestRatings = async (req, res, next) => {
  try {
    const books = await (await Book.find().sort({'averageRating': 'desc'})).slice(0, 3)

    res.status(200).json(books)
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.deleteBook = async (req, res, next) => {
  const { id } = req.params
  const userId = req.auth.userId

  try {
    const book = await Book.findById(id)
    console.log(book.userId)
    console.log(userId)
    if (!book) {
      return res.status(404).json({message: 'book not found'})
    }
    
    if (book.userId != userId){
      return res.status(401).json({message: 'unauthorized'})
    }
    
    const filename = book.imageUrl.split('/images/')[1]
    await Book.deleteOne({_id: id})

    console.log('imageUrl: ', book.imageUrl)
    console.log('filename: ', filename)
    try {
      fs.unlinkSync(`images/${filename}`)
    } catch (error) {
      console.error(`Failed to delete file: ${error}`);
    }

    return res.status(200).json({message: 'livre supprimé'})
  } catch (error) {
    return res.status(500).json({ error })
  }
}

exports.updateBook = async (req, res, next) => {
  const { id } = req.params

  const body = req.file ? JSON.parse(req.body.book) : req.body
  
  try {
    const book = await Book.findById(id)
    if(!book){
      return res.status(404).json({message: 'book not found'})
    }

    const userId = req.auth.userId
    if(book.userId != userId){
      return res.status(401).json({message: 'unauthorized'})
    }
    
    delete body.userId
    if(req.file){
      const { buffer, originalname } = req.file
      const fileExt = path.extname(originalname)
      const fileName = originalname.replace(fileExt, '')
      
      const now = new Date()
      const currentYear = String(now.getFullYear())
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
      const currentDay = String(now.getDate()).padStart(2, '0')
      const timestamp = currentYear+currentMonth+currentDay+now.getTime().toString()
      const ref = `${timestamp}-${fileName}.webp`
      await sharp(buffer).webp({quality: 20}).toFile('images/' + ref)
      body.imageUrl = `${req.protocol}://${req.get('host')}/images/${ref}`
    }

    await Book.updateOne({_id: id}, body)
    res.status(200).json({message: 'livre modifié'})

  } catch (error) {
    return res.status(500).json({ error })
  }
  console.log(body)

}