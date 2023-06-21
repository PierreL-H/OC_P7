const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {
  console.log("signup route");
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email,
      password: hash,
    });
    await newUser.save();
    res.status(201).json({ message: "Inscription réussie" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Paire email/password incorrecte" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Paire email/password incorrecte" });
    }

    res.status(200).json({ 
      userId: user._id,
      token: jwt.sign({userId: user._id},
        'SecretPrivateKey',
        {expiresIn: '24h'})  
      });
  } catch (error) {
    res.status(500).json({ error })
  }
};
