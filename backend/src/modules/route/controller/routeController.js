/**
 * @file routeController.js
 * @description Route Controller mapping HTTP requests to RouteService actions using standard response helpers.
 */

const routeService = require('../service/routeService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Create a new route (Admin only)
 * @route   POST /api/v1/routes
 * @access  Private/Admin
 */
const createRoute = asyncHandler(async (req, res) => {
  const route = await routeService.createRoute(req.body, req.user._id);
  return successResponse(res, 'Route created successfully', { route }, 201);
});

/**
 * @desc    Get all routes (Admin only, supports pagination, searching, filtering, sorting)
 * @route   GET /api/v1/routes
 * @access  Private/Admin
 */
const getRoutes = asyncHandler(async (req, res) => {
  const { page, limit, search, status, type, sortBy } = req.query;
  const result = await routeService.getRoutes({ page, limit, search, status, type, sortBy });
  
  return paginatedResponse(res, 'Routes retrieved successfully', 'routes', result.routes, result.pagination);
});

/**
 * @desc    Get route details by ID (Admin only)
 * @route   GET /api/v1/routes/:id
 * @access  Private/Admin
 */
const getRoute = asyncHandler(async (req, res) => {
  const route = await routeService.getRoute(req.params.id);
  return successResponse(res, 'Route details retrieved successfully', { route });
});

/**
 * @desc    Update route details by ID (Admin only)
 * @route   PUT /api/v1/routes/:id
 * @access  Private/Admin
 */
const updateRoute = asyncHandler(async (req, res) => {
  const updatedRoute = await routeService.updateRoute(req.params.id, req.body, req.user._id);
  return successResponse(res, 'Route details updated successfully', { route: updatedRoute });
});

/**
 * @desc    Update route status by ID (Admin only)
 * @route   PATCH /api/v1/routes/:id/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const updatedRoute = await routeService.updateRouteStatus(req.params.id, req.body.status, req.user._id);
  return successResponse(res, `Route status updated to ${req.body.status.toLowerCase()} successfully`, { route: updatedRoute });
});

/**
 * @desc    Soft-delete a route by ID (Admin only)
 * @route   DELETE /api/v1/routes/:id
 * @access  Private/Admin
 */
const deleteRoute = asyncHandler(async (req, res) => {
  await routeService.deleteRoute(req.params.id, req.user._id);
  return successResponse(res, 'Route deleted successfully', null);
});

module.exports = {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  updateStatus,
  deleteRoute
};
