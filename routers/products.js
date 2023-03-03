const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router()
const { Product } = require('../models/porduct')
const { Category } = require('../models/category');
const { json } = require('body-parser');

const FILE_TYOP_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValidFile = FILE_TYOP_MAP[file.mimetype]
        let uploadError = new Error('invalid img type')

        if (isValidFile) uploadError = null
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {

        const fileName = file.originalname.replace(' ', '-')
        const extension = FILE_TYOP_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
    const productList = await Product.find().populate('category')
    if (!productList) res.status(500).json({ success: false })
    res.send(productList)
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) res.status(500).json({ success: false })
    res.send(product)
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments()

    if (!productCount) res.status(500).json({ success: false })
    res.send({
        productCount: productCount
    })
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const prodacts = await Product.find({ isFeatured: true }).limit(+count)

    if (!prodacts) res.status(500), json({ success: false })
    res.send(prodacts)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request')

    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        availability: req.body.availability,
        image: `${basePath}${fileName}`,
        category: req.body.category,
        isFeatured: req.body.isFeatured

    })
    product = await product.save()
    if (!product) return res.status(500).send('The prodact cannot be created')
    res.send(product)
})

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) res.status(400).send('Invalid Product Id')

    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            availability: req.body.availability,
            img: req.body.img,
            image: req.body.image,
            category: req.body.category,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )
    if (!product) return res.status(404).send('The product cannot be updated')
    res.send(product)
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) return res.status(200).json({ success: true, message: 'the product is deleted' })
        else return res.status(404).json({ success: false, message: 'product is not found' })
    })
})

router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 8), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

    if (!product) return res.status(404).send('The product cannot be updated')
    res.send(product)
})
module.exports = router