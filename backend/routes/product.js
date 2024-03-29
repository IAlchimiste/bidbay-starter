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
    })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(200).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)
router.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body
    const userId = req.user.id

    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({
        error: 'Invalid or missing fields',
        details: 'Some details about the error...' // Ajoutez des détails sur l'erreur ici
      })
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

    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred while creating the product.' })
  }
})

router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.productId } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    // Update the product here
    const updatedProduct = await product.update(req.body)
    res.status(200).json(updatedProduct)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.productId } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    if (product.sellerId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await product.destroy()
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/api/products/:productId/bids', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.productId } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    // Check if the request body is valid
    if (!req.body.amount) {
      return res.status(400).json({ error: 'Missing or invalid fields' })
    }
    const bid = await Bid.create({
      productId: req.params.productId,
      userId: req.user.id,
      amount: req.body.amount
    })
    res.status(201).json(bid)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
