/**
 * @file busController.js
 * @description Bus Controller mapping HTTP requests to BusService actions using standard response helpers.
 */

const busService = require('../service/busService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Create a new bus (Admin only)
 * @route   POST /api/v1/buses
 * @access  Private/Admin
 */
const createBus = asyncHandler(async (req, res) => {
  const bus = await busService.createBus(req.body, req.user._id);
  return successResponse(res, 'Bus created successfully', { bus }, 201);
});

/**
 * @desc    Get all buses (Admin only, supports pagination, searching, filtering, sorting)
 * @route   GET /api/v1/buses
 * @access  Private/Admin
 */
const getBuses = asyncHandler(async (req, res) => {
  const { page, limit, search, type, status, sortBy } = req.query;
  const result = await busService.getBuses({ page, limit, search, type, status, sortBy });
  
  return paginatedResponse(res, 'Buses retrieved successfully', 'buses', result.buses, result.pagination);
});

/**
 * @desc    Get bus details by ID (Admin only)
 * @route   GET /api/v1/buses/:id
 * @access  Private/Admin
 */
const getBus = asyncHandler(async (req, res) => {
  const bus = await busService.getBus(req.params.id);
  return successResponse(res, 'Bus details retrieved successfully', { bus });
});

/**
 * @desc    Update bus details by ID (Admin only)
 * @route   PUT /api/v1/buses/:id
 * @access  Private/Admin
 */
const updateBus = asyncHandler(async (req, res) => {
  const updatedBus = await busService.updateBus(req.params.id, req.body, req.user._id);
  return successResponse(res, 'Bus details updated successfully', { bus: updatedBus });
});

/**
 * @desc    Update bus status by ID (Admin only)
 * @route   PATCH /api/v1/buses/:id/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const updatedBus = await busService.updateBusStatus(req.params.id, req.body.status, req.user._id);
  return successResponse(res, `Bus status updated to ${req.body.status.toLowerCase()} successfully`, { bus: updatedBus });
});

/**
 * @desc    Soft-delete a bus by ID (Admin only)
 * @route   DELETE /api/v1/buses/:id
 * @access  Private/Admin
 */
const deleteBus = asyncHandler(async (req, res) => {
  await busService.deleteBus(req.params.id, req.user._id);
  return successResponse(res, 'Bus deleted successfully', null);
});

module.exports = {
  createBus,
  getBuses,
  getBus,
  updateBus,
  updateStatus,
  deleteBus
};
