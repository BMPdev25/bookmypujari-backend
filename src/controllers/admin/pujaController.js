const Puja = require('../../models/Puja');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * GET /api/v1/admin/pujas
 */
exports.getAllPujas = asyncHandler(async (req, res) => {
  const { category, type, active, search } = req.query;
  const filter = {};

  if (category && category !== 'all') filter.category = category;
  if (type && type !== 'all') filter.pujaType = type;
  if (active !== undefined) filter.isActive = active === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
  }

  const pujas = await Puja.find(filter).sort({ displayOrder: 1, createdAt: -1 });

  return ApiResponse.success(res, pujas, 'Pujas fetched successfully');
});

/**
 * GET /api/v1/admin/pujas/:id
 */
exports.getPujaById = asyncHandler(async (req, res) => {
  const puja = await Puja.findById(req.params.id);
  if (!puja) return ApiResponse.error(res, 'Puja not found', 404);
  return ApiResponse.success(res, puja);
});

/**
 * POST /api/v1/admin/pujas
 */
exports.createPuja = asyncHandler(async (req, res) => {
  const {
    name, description, shortDescription, category, pujaType,
    duration, durationMinutes, basePrice, whatsIncluded,
    requiresItems, imageUrl, displayOrder,
  } = req.body;

  // Generate slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check for duplicate slug
  const existingSlug = await Puja.findOne({ slug });
  if (existingSlug) {
    return ApiResponse.error(res, 'A puja with a similar name already exists', 409);
  }

  const puja = await Puja.create({
    name, slug, description, shortDescription, category,
    pujaType: pujaType || 'bookable',
    duration, durationMinutes, basePrice,
    whatsIncluded: whatsIncluded || [],
    requiresItems: requiresItems || 'optional',
    imageUrl: imageUrl || '',
    displayOrder: displayOrder || 0,
  });

  return ApiResponse.created(res, puja, 'Puja created successfully');
});

/**
 * PUT /api/v1/admin/pujas/:id
 */
exports.updatePuja = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'description', 'shortDescription', 'category', 'pujaType',
    'duration', 'durationMinutes', 'basePrice', 'whatsIncluded',
    'requiresItems', 'imageUrl', 'isActive', 'displayOrder',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Re-generate slug if name changed
  if (updates.name) {
    updates.slug = updates.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  const puja = await Puja.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!puja) return ApiResponse.error(res, 'Puja not found', 404);

  return ApiResponse.success(res, puja, 'Puja updated successfully');
});

/**
 * DELETE /api/v1/admin/pujas/:id (soft delete)
 */
exports.deletePuja = asyncHandler(async (req, res) => {
  const puja = await Puja.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!puja) return ApiResponse.error(res, 'Puja not found', 404);

  return ApiResponse.success(res, null, 'Puja deactivated successfully');
});
