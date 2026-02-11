const Pujari = require('../../models/Pujari');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * GET /api/v1/admin/pujaris
 */
exports.getAllPujaris = asyncHandler(async (req, res) => {
  const { active, city, search } = req.query;
  const filter = {};

  if (active !== undefined) filter.isActive = active === 'true';
  if (city) filter['serviceAreas.city'] = { $regex: city, $options: 'i' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  const pujaris = await Pujari.find(filter)
    .populate('supportedPujas', 'name slug')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, pujaris);
});

/**
 * GET /api/v1/admin/pujaris/:id
 */
exports.getPujariById = asyncHandler(async (req, res) => {
  const pujari = await Pujari.findById(req.params.id)
    .populate('supportedPujas', 'name slug category');

  if (!pujari) return ApiResponse.error(res, 'Pujari not found', 404);

  return ApiResponse.success(res, pujari);
});

/**
 * POST /api/v1/admin/pujaris
 */
exports.createPujari = asyncHandler(async (req, res) => {
  const {
    name, mobile, email, experience, languages,
    supportedPujas, serviceAreas, notes,
  } = req.body;

  const pujari = await Pujari.create({
    name, mobile, email, experience,
    languages: languages || ['Hindi', 'Sanskrit'],
    supportedPujas: supportedPujas || [],
    serviceAreas: serviceAreas || [],
    notes: notes || '',
  });

  return ApiResponse.created(res, pujari, 'Pujari added successfully');
});

/**
 * PUT /api/v1/admin/pujaris/:id
 */
exports.updatePujari = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'mobile', 'email', 'experience', 'languages',
    'supportedPujas', 'serviceAreas', 'isActive', 'notes',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const pujari = await Pujari.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('supportedPujas', 'name slug');

  if (!pujari) return ApiResponse.error(res, 'Pujari not found', 404);

  return ApiResponse.success(res, pujari, 'Pujari updated successfully');
});

/**
 * DELETE /api/v1/admin/pujaris/:id (soft delete)
 */
exports.deletePujari = asyncHandler(async (req, res) => {
  const pujari = await Pujari.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!pujari) return ApiResponse.error(res, 'Pujari not found', 404);

  return ApiResponse.success(res, null, 'Pujari deactivated successfully');
});
