import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params
  const user = await User.findByPk(userId, {
    include: [{
      model: Product,
      as: 'products',
      attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate']
    }, {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price', 'date'],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name']
      }]
    }]
  })
  if (user) { res.status(200).json(user) } else {
    res.status(404).json({
      error: 'User not found'
    })
  }
})
export default router
