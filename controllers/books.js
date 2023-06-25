const sharp = require('sharp')
const path = require('path')
const Book = require('../models/Book')

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