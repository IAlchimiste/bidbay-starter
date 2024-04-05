import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{
        model: Product,
        as: 'products'
      }, {
        model: Bid,
        as: 'bids',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' })
  }
})

export default router
