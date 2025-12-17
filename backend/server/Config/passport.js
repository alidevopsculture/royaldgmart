const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../Models/UserModels')
require('dotenv').config();
const secret = process.env.ACCESS_TOKEN_SECRET;

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req && req.headers && req.headers.authorization) {
    // Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  return token;
};

const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = secret;

passport.use(
    new JwtStrategy(opts, (payload, done) => {

        if (!payload.user || !payload.user.id) {
            console.log('Invalid payload structure');
            return done(null, false);
        }

        User.findById(payload.user.id)
            .then(user => {
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => {
                return done(err, false);
            });
    })
);

module.exports = async app => {
    app.use(passport.initialize());
    console.log('Passport initialized');
};