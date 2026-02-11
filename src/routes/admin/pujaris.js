const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const pujariController = require('../../controllers/admin/pujariController');
const validate = require('../../middleware/validate');

// GET /api/v1/admin/pujaris
router.get('/', pujariController.getAllPujaris);

// GET /api/v1/admin/pujaris/:id
router.get('/:id', pujariController.getPujariById);

// POST /api/v1/admin/pujaris
router.post(
  '/',
  [
    body('name').notEmpty().trim().isLength({ max: 100 }).withMessage('Name is required'),
    body('mobile')
      .notEmpty()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid 10-digit Indian mobile required'),
    body('email').optional().isEmail().normalizeEmail(),
    body('experience').optional().isString(),
    body('languages').optional().isArray(),
    body('supportedPujas').optional().isArray(),
    body('serviceAreas').optional().isArray(),
  ],
  validate,
  pujariController.createPujari
);

// PUT /api/v1/admin/pujaris/:id
router.put('/:id', pujariController.updatePujari);

// DELETE /api/v1/admin/pujaris/:id
router.delete('/:id', pujariController.deletePujari);

module.exports = router;
