const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const pujaController = require('../../controllers/admin/pujaController');
const validate = require('../../middleware/validate');

// GET /api/v1/admin/pujas
router.get('/', pujaController.getAllPujas);

// GET /api/v1/admin/pujas/:id
router.get('/:id', pujaController.getPujaById);

// POST /api/v1/admin/pujas
router.post(
  '/',
  [
    body('name').notEmpty().trim().isLength({ max: 100 }).withMessage('Puja name is required (max 100 chars)'),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('shortDescription').notEmpty().isLength({ max: 150 }),
    body('category').notEmpty().isIn(['general', 'devotional', 'shanti', 'health', 'homam', 'muhurat', 'other']),
    body('pujaType').optional().isIn(['bookable', 'coming_soon']),
    body('duration').notEmpty().isString(),
    body('durationMinutes').notEmpty().isInt({ min: 1 }),
    body('basePrice').notEmpty().isFloat({ min: 0 }),
    body('whatsIncluded').optional().isArray(),
    body('requiresItems').optional().isIn(['yes', 'optional', 'no']),
    body('displayOrder').optional().isInt({ min: 0 }),
  ],
  validate,
  pujaController.createPuja
);

// PUT /api/v1/admin/pujas/:id
router.put('/:id', pujaController.updatePuja);

// DELETE /api/v1/admin/pujas/:id
router.delete('/:id', pujaController.deletePuja);

module.exports = router;
