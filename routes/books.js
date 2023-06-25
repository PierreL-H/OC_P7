const express = require('express')
const router = express.Router()
const booksCtrl = require('../controllers/books')
const upload = require('../middlewares/multer-config')
const auth = require('../middlewares/auth')

router.get('/', booksCtrl.getAllBooks)
// router.get('/bestratings', booksCtrl.getBestRatings)
router.post('/', auth, upload.single('image') ,booksCtrl.createBook)
// router.get('/:id', booksCtrl.getBook)
// router.put('/:id', booksCtrl.updateBook)
// router.delete('/:id', booksCtrl.deleteBook)
// router.post('/:id/ratings', booksCtrl.addRating)

module.exports = router