const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const pujaItemController = require('../../controllers/admin/pujaItemController');
const validate = require('../../middleware/validate');

// ============ TEMPLATES ============

// GET /api/v1/admin/puja-items/templates
router.get('/templates', pujaItemController.getAllTemplates);

// GET /api/v1/admin/puja-items/templates/puja/:pujaId
router.get('/templates/puja/:pujaId', pujaItemController.getTemplatesByPuja);

// POST /api/v1/admin/puja-items/templates
router.post(
  '/templates',
  [
    body('puja').notEmpty().isMongoId(),
    body('templateName').notEmpty().trim().isLength({ max: 200 }),
    body('items').optional().isArray(),
    body('items.*.name').notEmpty().trim(),
    body('items.*.quantity').notEmpty().trim(),
    body('isDefault').optional().isBoolean(),
  ],
  validate,
  pujaItemController.createTemplate
);

// PUT /api/v1/admin/puja-items/templates/:id
router.put('/templates/:id', pujaItemController.updateTemplate);

// DELETE /api/v1/admin/puja-items/templates/:id
router.delete('/templates/:id', pujaItemController.deleteTemplate);

// ============ OVERRIDES ============

// GET /api/v1/admin/puja-items/overrides
router.get('/overrides', pujaItemController.getOverrides);

// POST /api/v1/admin/puja-items/overrides
router.post(
  '/overrides',
  [
    body('pujari').notEmpty().isMongoId(),
    body('puja').notEmpty().isMongoId(),
    body('itemTemplate').notEmpty().isMongoId(),
    body('overrideItems').optional().isArray(),
    body('overrideItems.*.name').notEmpty().trim(),
    body('overrideItems.*.action').isIn(['add', 'remove', 'modify']),
  ],
  validate,
  pujaItemController.createOverride
);

// PUT /api/v1/admin/puja-items/overrides/:id
router.put('/overrides/:id', pujaItemController.updateOverride);

// DELETE /api/v1/admin/puja-items/overrides/:id
router.delete('/overrides/:id', pujaItemController.deleteOverride);

module.exports = router;
