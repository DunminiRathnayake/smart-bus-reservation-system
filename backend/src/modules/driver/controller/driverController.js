/**
 * @file driverController.js
 * @description Driver Controller mapping HTTP requests to DriverService actions using standard response helpers.
 */

const driverService = require('../service/driverService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Create a new driver (Admin only)
 * @route   POST /api/v1/drivers
 * @access  Private/Admin
 */
const createDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.createDriver(req.body, req.user._id);
  return successResponse(res, 'Driver created successfully', { driver }, 201);
});

/**
 * @desc    Get all drivers (Admin only, supports pagination, searching, filtering, sorting)
 * @route   GET /api/v1/drivers
 * @access  Private/Admin
 */
const getDrivers = asyncHandler(async (req, res) => {
  const { page, limit, search, status, gender, sortBy } = req.query;
  const result = await driverService.getDrivers({ page, limit, search, status, gender, sortBy });
  
  return paginatedResponse(res, 'Drivers retrieved successfully', 'drivers', result.drivers, result.pagination);
});

/**
 * @desc    Get driver details by ID (Admin only)
 * @route   GET /api/v1/drivers/:id
 * @access  Private/Admin
 */
const getDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.getDriver(req.params.id);
  return successResponse(res, 'Driver details retrieved successfully', { driver });
});

/**
 * @desc    Update driver details by ID (Admin only)
 * @route   PUT /api/v1/drivers/:id
 * @access  Private/Admin
 */
const updateDriver = asyncHandler(async (req, res) => {
  const updatedDriver = await driverService.updateDriver(req.params.id, req.body, req.user._id);
  return successResponse(res, 'Driver details updated successfully', { driver: updatedDriver });
});

/**
 * @desc    Update driver status by ID (Admin only)
 * @route   PATCH /api/v1/drivers/:id/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const updatedDriver = await driverService.updateDriverStatus(req.params.id, req.body.status, req.user._id);
  return successResponse(res, `Driver status updated to ${req.body.status.toLowerCase()} successfully`, { driver: updatedDriver });
});

/**
 * @desc    Soft-delete a driver by ID (Admin only)
 * @route   DELETE /api/v1/drivers/:id
 * @access  Private/Admin
 */
const deleteDriver = asyncHandler(async (req, res) => {
  await driverService.deleteDriver(req.params.id, req.user._id);
  return successResponse(res, 'Driver deleted successfully', null);
});

module.exports = {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  updateStatus,
  deleteDriver
};
