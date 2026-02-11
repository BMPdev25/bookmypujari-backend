const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const pujaController = require('../../controllers/public/pujaController');
const validate = require('../../middleware/validate');

// GET /api/v1/public/pujas - List all active pujas
router.get(
  '/',
  [
    query('category').optional().isString().trim(),
    query('type').optional().isIn(['bookable', 'coming_soon', 'all']),
    query('search').optional().isString().trim().isLength({ max: 100 }),
  ],
  validate,
  pujaController.getAllPujas
);

// GET /api/v1/public/pujas/:slug - Get puja by slug
router.get('/:slug', pujaController.getPujaBySlug);

module.exports = router;
