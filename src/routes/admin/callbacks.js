const express = require('express');
const router = express.Router();
const CallbackRequest = require('../../models/CallbackRequest');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

// GET /api/v1/admin/callbacks
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerMobile: { $regex: search, $options: 'i' } },
      ];
    }

    const callbacks = await CallbackRequest.find(filter)
      .populate('puja', 'name slug')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, callbacks);
  })
);

// PUT /api/v1/admin/callbacks/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { status, adminNotes, recallDateTime } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (recallDateTime !== undefined) updates.recallDateTime = recallDateTime || null;

    const callback = await CallbackRequest.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('puja', 'name slug');

    if (!callback) return ApiResponse.error(res, 'Callback request not found', 404);

    return ApiResponse.success(res, callback, 'Callback request updated');
  })
);

module.exports = router;
