const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/auth');
const userRoutes = require('./modules/users');
const categoryRoutes = require('./modules/categories');
const productRoutes = require('./modules/products');
const stockRoutes = require('./modules/stocks');
const transactionRoutes = require('./modules/transactions');
const reportRoutes = require('./modules/reports');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/stocks', stockRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
