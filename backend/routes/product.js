import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  const products = await Product.findAll({
    attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate'],
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'date']
    }]
  })

  res.status(200).json(products)
})

router.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params

  const product = await Product.findByPk(productId, {
    attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate'],
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'date'],
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'username']
      }]
    }]
  })

  if (!product) {
    res.status(404).json({
      error: 'Product not found'
    })
  } else {
    res.status(200).json(product)
  }
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', authMiddleware, async (req, res) => {
  const { name, description, pictureUrl, category, originalPrice, endDate } = req.body

  try {
    const product = await Product.create({
      name,
      description,
      pictureUrl,
      category,
      originalPrice,
      endDate,
      sellerId: req.user.id
    })

    res.status(201).json(product)
  } catch (e) {
    res.status(400).json({
      error: 'Invalid or missing fields',
      details: getDetails(e)
    })
  }
})

router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params
  const { name, description, pictureUrl, category, originalPrice, endDate } = req.body

  const product = await Product.findByPk(productId)

  if (!product) {
    res.status(404).json({
      error: 'Product not found'
    })
    return
  }

  if (product.sellerId != req.user.id && !req.user.admin) {
    res.status(403).json({
      error: 'User not granted'
    })
    return
  }

  try {
    const updatedProduct = await product.update({
      name,
      description,
      pictureUrl,
      category,
      originalPrice,
      endDate
    })

    const response = updatedProduct.toJSON()
    delete response.createdAt
    delete response.updatedAt

    res.status(200).json(response)
  } catch (e) {
    res.status(400).json({
      error: 'Invalid or missing fields',
      details: getDetails(e)
    })
  }
})

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params

  const product = await Product.findByPk(productId)

  if (!product) {
    res.status(404).json({
      error: 'Product not found'
    })
    return
  }

  if (product.sellerId != req.user.id && !req.user.admin) {
    res.status(403).json({
      error: 'User not granted'
    })
    return
  }

  await product.destroy()

  res.status(204).json()
})

export default router
