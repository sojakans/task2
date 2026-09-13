const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/', cartController.createOrGetCart);
router.get('/:cartId', cartController.getCart);
router.post('/:cartId/items', cartController.addItemToCart);
router.put('/:cartId/items/:productId', cartController.updateCartItem);
router.delete('/:cartId/items/:productId', cartController.removeCartItem);

module.exports = router;
