import express from 'express'
import mongoose from 'mongoose' //used mongoose instead of mongodb module because i found this very good and easy to use during my research compared to monodb module
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



const app = express()
const port = process.env.PORT ||  3000
const DB_URI = 'mongodb+srv://piyusharma058:TLUU0V3g35WUDr0F@cordovaapi.2nx9rgp.mongodb.net/api-data?retryWrites=true&w=majority'
// import { MongoClient } from 'mongodb' 
app.use(express.json())
app.use(cors());

import Product from './models/model.js'
import ToBuyProduct from './models/tobuy.js'
//Connect to database using mongoose module

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8000'); // Replace with the correct origin of your Cordova app
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
mongoose.connect(DB_URI).then(()=> {
console.log('Successfully connected to MongoDB Atlas!');
  app.listen(port, () => {
    console.log(`Server app listening on port ${port}`)
  })
}).catch((error)=>{
console.log(error);
})

//post collection
app.post('/product', async(req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product)
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }

})

//post to buy list 
app.post('/tobuylist', async(req, res) => {
  try {
    const product = await ToBuyProduct.create(req.body);
    res.status(200).json(product)
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }

})

//get to buy list
app.get('/tobuylist',async (req, res) => {

try {
    const products = await ToBuyProduct.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
})
//get collection
app.get('/allproducts',async (req, res) => {

try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
})


//Delete collection
app.post('/empty-collection', async (req, res) => {
  try {
    await Product.deleteMany({});
    res.status(200).json({ message: 'Collection emptied successfully' });
  } catch (error) {
    console.error('Error emptying collection:', error);
    res.status(500).json({ message: 'Error emptying collection' });
  }
});

// Delete a product by ID
app.delete('/tobuylist/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await ToBuyProduct.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});



// Create a User model
const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
});


// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { name,email, password } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username email' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid  password' });
    }

    // Generate a JSON Web Token (JWT)
    const token = jwt.sign({ userId: user._id }, 'your-secret-key');

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});