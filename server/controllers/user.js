const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { googleAuth } = require('../helpers/auth');
const randomstring = require("randomstring");

module.exports = {
  findAll: function(req, res, next) {
    User
      .find()
      .then(function(users) {
        res.status(200).json(users);
      })
      .catch(next);
  },
  findOne: function(req, res, next) {
    User
      .findById(params.id)
      .then(function(user) {
        if(user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({
            warning: 'No data is found by given ID.'
          });
        }
      })
      .catch(next);
  },
  register: function({ body }, res, next) {
    User
      .create({...body})
      .then(function(user) {
        res.status(201).json(user);
      })
      .catch(next);
  },
  signInLocal: function({ body }, res, next) {
    User
      .findOne({
        $or:[
          {'username': body.username },
          {'email': body.username },
        ] 
      })
      .then(function(user) {
        if(!user) {
          res.status(400).json({
            warning: 'Username/Password is wrong.'
          })
        } else {
          if(!bcrypt.compareSync(body.password, user.password)) {
            res.status(400).json({
              warning: 'Username/Password is wrong.'
            })
          } else {
            const { email, fullname } = user
            const token = jwt.sign({ 
              id: _id, email, fullname
            }, JWT_SECRET);

            res.status(200).json({ email, fullname, token })
          }
        }
      })
      .catch(next)
  },
  signInGoogle: function({ body }, res, next) {
    let ticket = null
    googleAuth(body.id_token)
    .then(function(ticket) {
      const { name, email, picture } = ticket.getPayload();
      User
        .findOne({ email })
        .then(function(user) {
          if(!user) {
            let newUser = new User({
              fullname: name,
              username: name,
              password: randomstring.generate(8), 
              email: email,
              via: 'google'
            })
            newUser
              .save()
              .then(function(user) {
                const token = jwt.sign({ id: user._id, email, fullname:name }, JWT_SECRET);

                res.status(200).json({ email, fullname:name, picture, token });
              })
          } else {
            const token = jwt.sign({ id: user._id, email, fullname:name}, JWT_SECRET);
  
            res.status(200).json({ email, fullname:name, picture, token });
          } 
        })
        .catch(next)
    })
    .catch(next)
  },

}