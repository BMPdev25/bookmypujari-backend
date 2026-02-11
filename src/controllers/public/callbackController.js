const CallbackRequest = require('../../models/CallbackRequest');
const Puja = require('../../models/Puja');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * POST /api/v1/public/callbacks
 * Submit a callback request for muhurat pujas
 */
exports.createCallbackRequest = asyncHandler(async (req, res) => {
  const { pujaId, customerName, customerMobile, preferredCallTime, message } = req.body;

  // Verify puja exists
  const puja = await Puja.findById(pujaId);
  if (!puja || !puja.isActive) {
    return ApiResponse.error(res, 'Puja not found or inactive', 404);
  }

  const callbackRequest = await CallbackRequest.create({
    puja: pujaId,
    customerName,
    customerMobile,
    preferredCallTime: preferredCallTime || 'Morning (9-12)',
    message: message || '',
  });

  return ApiResponse.created(
    res,
    {
      id: callbackRequest._id,
      pujaName: puja.name,
      status: callbackRequest.status,
    },
    'Callback request submitted successfully. Our team will reach out to you soon.'
  );
});
