const PujaItemTemplate = require('../../models/PujaItemTemplate');
const PujariItemOverride = require('../../models/PujariItemOverride');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

// ============ TEMPLATES ============

/**
 * GET /api/v1/admin/puja-items/templates
 */
exports.getAllTemplates = asyncHandler(async (req, res) => {
  const { pujaId } = req.query;
  const filter = {};
  if (pujaId) filter.puja = pujaId;

  const templates = await PujaItemTemplate.find(filter)
    .populate('puja', 'name slug')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, templates);
});

/**
 * GET /api/v1/admin/puja-items/templates/puja/:pujaId
 */
exports.getTemplatesByPuja = asyncHandler(async (req, res) => {
  const templates = await PujaItemTemplate.find({ puja: req.params.pujaId })
    .populate('puja', 'name slug');

  return ApiResponse.success(res, templates);
});

/**
 * POST /api/v1/admin/puja-items/templates
 */
exports.createTemplate = asyncHandler(async (req, res) => {
  const { puja, templateName, items, isDefault } = req.body;

  // If setting as default, unset other defaults for same puja
  if (isDefault) {
    await PujaItemTemplate.updateMany(
      { puja, isDefault: true },
      { isDefault: false }
    );
  }

  const template = await PujaItemTemplate.create({
    puja,
    templateName,
    items: items || [],
    isDefault: isDefault || false,
  });

  await template.populate('puja', 'name slug');

  return ApiResponse.created(res, template, 'Item template created successfully');
});

/**
 * PUT /api/v1/admin/puja-items/templates/:id
 */
exports.updateTemplate = asyncHandler(async (req, res) => {
  const { templateName, items, isDefault } = req.body;

  const template = await PujaItemTemplate.findById(req.params.id);
  if (!template) return ApiResponse.error(res, 'Template not found', 404);

  if (isDefault && !template.isDefault) {
    await PujaItemTemplate.updateMany(
      { puja: template.puja, isDefault: true },
      { isDefault: false }
    );
  }

  if (templateName) template.templateName = templateName;
  if (items) template.items = items;
  if (isDefault !== undefined) template.isDefault = isDefault;

  await template.save();
  await template.populate('puja', 'name slug');

  return ApiResponse.success(res, template, 'Template updated successfully');
});

/**
 * DELETE /api/v1/admin/puja-items/templates/:id
 */
exports.deleteTemplate = asyncHandler(async (req, res) => {
  const template = await PujaItemTemplate.findByIdAndDelete(req.params.id);
  if (!template) return ApiResponse.error(res, 'Template not found', 404);

  // Also delete related overrides
  await PujariItemOverride.deleteMany({ itemTemplate: req.params.id });

  return ApiResponse.success(res, null, 'Template deleted successfully');
});

// ============ OVERRIDES ============

/**
 * GET /api/v1/admin/puja-items/overrides
 */
exports.getOverrides = asyncHandler(async (req, res) => {
  const { pujariId, pujaId } = req.query;
  const filter = {};
  if (pujariId) filter.pujari = pujariId;
  if (pujaId) filter.puja = pujaId;

  const overrides = await PujariItemOverride.find(filter)
    .populate('pujari', 'name')
    .populate('puja', 'name slug')
    .populate('itemTemplate', 'templateName')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, overrides);
});

/**
 * POST /api/v1/admin/puja-items/overrides
 */
exports.createOverride = asyncHandler(async (req, res) => {
  const { pujari, puja, itemTemplate, overrideItems, notes } = req.body;

  const override = await PujariItemOverride.create({
    pujari,
    puja,
    itemTemplate,
    overrideItems: overrideItems || [],
    notes: notes || '',
  });

  await override.populate('pujari', 'name');
  await override.populate('puja', 'name slug');
  await override.populate('itemTemplate', 'templateName');

  return ApiResponse.created(res, override, 'Override created successfully');
});

/**
 * PUT /api/v1/admin/puja-items/overrides/:id
 */
exports.updateOverride = asyncHandler(async (req, res) => {
  const { overrideItems, notes } = req.body;

  const override = await PujariItemOverride.findByIdAndUpdate(
    req.params.id,
    { overrideItems, notes },
    { new: true, runValidators: true }
  )
    .populate('pujari', 'name')
    .populate('puja', 'name slug')
    .populate('itemTemplate', 'templateName');

  if (!override) return ApiResponse.error(res, 'Override not found', 404);

  return ApiResponse.success(res, override, 'Override updated successfully');
});

/**
 * DELETE /api/v1/admin/puja-items/overrides/:id
 */
exports.deleteOverride = asyncHandler(async (req, res) => {
  const override = await PujariItemOverride.findByIdAndDelete(req.params.id);
  if (!override) return ApiResponse.error(res, 'Override not found', 404);
  return ApiResponse.success(res, null, 'Override deleted successfully');
});
