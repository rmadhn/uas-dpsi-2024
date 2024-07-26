const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { authenticate } = require('../middleware/auth');

// Route to create a new product
router.post('/', authenticate, async (req, res) => {
    try {
        const { productName, supplierID, categoryID, unit, price } = req.body;
        const product = await Product.create({ productName, supplierID, categoryID, unit, price });
        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            res.status(400).json({ message: 'Foreign key constraint error: Category ID or Supplier ID not found' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

const { Op } = require('sequelize');

router.get('/', authenticate, async (req, res) => {
    let { page = 1, limit = 10 } = req.query; // Default page 1 and limit 10 per page

    // Validate and parse limit to ensure it's a number
    limit = parseInt(limit, 10);

    try {
        const offset = (page - 1) * limit;

        const { count, rows: products } = await Product.findAndCountAll({
            offset,
            limit,
        });

        if (products.length === 0) {
            return res.status(404).json({ message: 'Products not found' });
        }

        const totalPages = Math.ceil(count / limit);

        const response = {
            totalCount: count,
            totalPages,
            currentPage: page,
            products,
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});


// Route to get a product by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to update a product by ID
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, supplierID, categoryID, unit, price } = req.body;
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');
        product.productName = productName;
        product.supplierID = supplierID;
        product.categoryID = categoryID;
        product.unit = unit;
        product.price = price;
        await product.save();
        res.json(product);
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            res.status(400).json({ message: 'Foreign key constraint error: Category ID or Supplier ID not found' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Route to delete a product by ID
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');
        await product.destroy();
        res.sendStatus(204);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
