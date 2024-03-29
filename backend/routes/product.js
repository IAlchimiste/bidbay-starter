import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Bid,
        as: 'bids',
        attributes: ['id', 'price', 'date'],
        include: [{
          model: User,
          as: 'bidder',
          attributes: ['id', 'username', 'email']
        }]
      }
      ]
    })
    res.status(200).json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.get('/api/products/:productId', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Bid,
        as: 'bids',
        attributes: ['id', 'price', 'date'],
        include: [{
          model: User,
          as: 'bidder',
          attributes: ['id', 'username', 'email']
        }]
      }]
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body
    const userId = req.user.id

    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' })
    }
    const product = await Product.create({
      name,
      description,
      category,
      originalPrice,
      pictureUrl,
      endDate,
      sellerId: userId
    })

    console.log(product)

    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue lors de la création du produit.' })
  }
})


router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
