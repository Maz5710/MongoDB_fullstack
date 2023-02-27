const express = require('express'); // includes express into backend
const app = express(); // variable of app to us express method
const cors = require('cors'); // bring in CORS
const bodyParser = require('body-parser') // include BodyParser 
const mongoose = require('mongoose') // import mongoose
const bcrypt = require('bcryptjs');
const config = require('./config.json'); // get config
const Product = require('./models/product');
const User = require('./models/user');

const port = 8080; // set the port number for our local server

app.use((req, res, next) => {
    console.log(`${req.method} request ${req.url}`);
    next();
})

app.use(bodyParser.json()); // calling Body Parser method
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cors()); // calling cors method with express

app.get('/', (req, res) => res.send("Hello from the backend"));// Sent to backend on req

// Setup Mongoose Connection to MongoDB
mongoose.connect(`mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@cluster0.${config.MONGO_CLUSTER_NAME}.mongodb.net/${config.MONGO_DBNAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('DB Connected'))
.catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
})

app.listen(port, () => console.log(`My fullstack app is listening on port ${port}`))// sent to nodemon - checking server

// ------- PRODUCT END POINTS -----------

// Get All Products from the Database
app.get('/allProductsFromDB', (req, res) => {
    Product.find().then(result => {
        res.send(result)
    })
})

// Post Method to CREATE a product
app.post('/addProduct', (req, res) => {
    const dbProduct = new Product({
      _id: new mongoose.Types.ObjectId,
      name: req.body.name,
      price: req.body.price,
      image_url: req.body.image_url,
      user_id: req.body.user_id
    });
    //save to the database and notify the user
    dbProduct.save().then(result => {
      res.send(result);
    }).catch(err => res.send(err));
})

// Edit/ UPDATE using 'PATCH' http method
app.patch('/updateProduct/:id', (req, res) => {
    const idParam = req.params.id;
    Product.findById(idParam, (err, product) => {
        const updatedProduct = {
            name: req.body.name,
            price: req.body.price,
            image_url: req.body.image_url 
        }
        Product.updateOne({
            _id: idParam
        }, updatedProduct).
        then(result => {
            res.send(result);
        }).catch(err => res.send(err))
    })
})

app.delete('/deleteProduct/:id', (req,res) => {
    const idParam = req.params.id;
    Product.findOne({
        _id: idParam
    }, (err, product) => {
        if (product) {
            Product.deleteOne({
                _id: idParam
            }, err => {
                console.log('deleted on backend request');
            });
        } else {
            alert('not found');
        }
    }).catch(err => res.send(err));
}); // Delete

// ----------------------- USER END POINTS -----------------------

// REGISTER USER
app.post('/registerUSer', (req,res) => {
    User.findOne({
        username: req.body.username,
    }, (err, userExists) => {
        if (userExists) {
            res.send('username already taken');
        } else {
            const hash = bcrypt.hashSync(req.body.password);
            const user = new User({
                _id: new mongoose.Types.ObjectId,
                username: req.body.username,
                password: hash,
                email: req.body.email
            });
            user.save()
                .then(result => {
                    console.log(user, result);
                    res.send(result);
                }).catch(err => {
                    res.send(err)
                });
        }//else
    })// findone
}); // end of register

//Login User
app.post('/loginUser', ( req, res)=>{
    User.findOne({username:req.body.username},(err,userResult)=>{
      if (userResult){
        if (bcrypt.compareSync(req.body.password, userResult.password)){
          res.send(userResult);
        } else {
          res.send('not authorized');
        }// inner if
      } else {
        res.send('user not found. Please register');
      }//outer if
    });//find one ends
  });//end of post for login



