const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if(authHeader && authHeader.startsWith('Bearer')){
      const token = authHeader.split(' ')[1]
      const decodedToken = jwt.verify(token, 'SecretPrivateKey')
      const userId = decodedToken.userId
      req.auth = {userId: userId}
    }
    next()
  } catch (error) {
    console.log('error?', error)
    res.status(401).json({ error })
  }
}