import express from 'express'
import { Product} from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'



const router = express.Router();

router.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll()
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des produits.' })
  }
})

router.get('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

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
