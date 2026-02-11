const Puja = require('../../models/Puja');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * GET /api/v1/public/pujas
 * List all active pujas with optional filtering
 */
exports.getAllPujas = asyncHandler(async (req, res) => {
  const { category, type, search } = req.query;

  const filter = { isActive: true };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (type && type !== 'all') {
    filter.pujaType = type;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
  }

  const pujas = await Puja.find(filter)
    .select('-basePrice -__v')
    .sort({ displayOrder: 1, createdAt: -1 });

  return ApiResponse.success(res, pujas, 'Pujas fetched successfully');
});

/**
 * GET /api/v1/public/pujas/:slug
 * Get single puja by slug
 */
exports.getPujaBySlug = asyncHandler(async (req, res) => {
  const puja = await Puja.findOne({
    slug: req.params.slug,
    isActive: true,
  }).select('-basePrice -__v');

  if (!puja) {
    return ApiResponse.error(res, 'Puja not found', 404);
  }

  return ApiResponse.success(res, puja, 'Puja fetched successfully');
});
