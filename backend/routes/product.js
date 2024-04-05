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

router.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body

    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate'] })
    }

    if (isNaN(originalPrice) || originalPrice <= 0) {
      return res.status(400).json({ error: 'Le prix original doit être un nombre positif', details: ['originalPrice'] })
    }

    const newProduct = await Product.create({
      name,
      description,
      category,
      originalPrice,
      pictureUrl,
      endDate,
      sellerId: req.user.id
    })

    res.status(201).json(newProduct)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de l\'ajout du produit' })
  }
})

export default router
