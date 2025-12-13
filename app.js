const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose')

const User = require('./models/user')

const errorController = require('./controllers/error');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('693d2ab1ed6b731a49c2f3b2')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)

app.use(errorController.get404);



mongoose.connect('mongodb+srv://mh711748_db_user:13851358@cluster0.kozx12z.mongodb.net/shop?appName=Cluster0').then(result => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: 'Mohamad',
                email: 'mh711748@gmail.com',
                cart: {
                    items: []
                }
            })
            user.save()
        }
    })

    app.listen(3000)
}).catch(err => console.log(err))

