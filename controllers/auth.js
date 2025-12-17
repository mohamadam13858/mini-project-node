const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const sendEmail = require('../util/mailer')
const { validationResult } = require('express-validator'); // خط ۴ اصلاح شد

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              sendEmail(
                user.email,
                'خوش آمدی دوباره! 👋',
                'لاگین موفقیت‌آمیز بود. خوشحالیم که برگشتی!',
                '<h2>لاگین موفقیت‌آمیز!</h2><p>خوشحالیم که دوباره برگشتی 😊</p>'
              );
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    });
  }
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found!')
        res.redirect('/reset')
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save()
    }).then(result => {
      sendEmail(
        req.body.email,
        'تغییر رمز عبور',
        'در خواست تغییر رمز عبور ',
        `<p> روی این کلیک کنید <a href="http://localhost:3000/reset/${token}" > mohamad <a/> <p/> `
      );
    }).catch(err => console.log(err))
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
    let message = req.flash('error')
    if (message.length > 0) {
      message = message[0]
    } else {
      message = null
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'NewPassword',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  }).catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser;
  User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId }).then(user => {
    resetUser = user
    return bcrypt.hash(newPassword, 12)
  }).then(hashedPassword => {
     resetUser.password = hashedPassword 
     resetUser.resetToken = undefined 
     resetUser.resetTokenExpiration = undefined
     return resetUser.save()
  }).then(result => {
    res.redirect('/login')
  }).catch(err => console.log(err))
}