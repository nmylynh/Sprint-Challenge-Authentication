const axios = require('axios');
const userDB = require('../models/auth-model');
const bcrypt = require('bcryptjs');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const register = async (req, res) => {
  try {
      let newUser = req.body;

      const hash = bcrypt.hashSync(newUser.password, 14);
      newUser.password = hash;

      const savedUser = await userDB.register(newUser); 
      res.status(201).json(savedUser);
  } catch(err) {
      res.status(500).json({success: false, err});
  }
}

const login = async (req, res) => {
  try {
      const { username, password } = req.body;
      let token = null;

      const user = await userDB.login(username);

      user && bcrypt.compareSync(password, user.password)
      ? (token = generateToken(user),
        res.status(200).json({ message: `Welcome ${user.username}!`, token }))
      : res.status(401).json({ message: 'Invalid credentials.' });
  } catch(err) {
      res.status(500).json({ success: false, err })
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
