import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router();

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username', 'email'],
    }
    ,
    {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'date'],
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'username', 'email'],
      }]
    }
  ]});
    res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.get('/api/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findOne({
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'email'],
      }
      ,
      {
        model: Bid,
        as: 'bids',
        attributes: ['id', 'price', 'date'],
        include: [{
          model: User,
          as: 'bidder',
          attributes: ['id', 'username', 'email'],
        }]
      }
    ],
      where: {
        id: productId
      }
    });
    res.status(200).json(product);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', (req, res) => {
  res.status(600).send()
})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
