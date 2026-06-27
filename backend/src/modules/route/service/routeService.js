/**
 * @file routeService.js
 * @description Encapsulates all business logic for Route Management (Sprint 6).
 */

const routeRepository = require('../repository/routeRepository');
const RouteStatus = require('../../../constants/routeStatus');

class RouteService {
  /**
   * Helper function validating that all stops have unique order values,
   * and sorting stops in ascending order by their order values.
   * 
   * @private
   * @param {Array} stops - List of stops objects.
   * @returns {Array} Sorted list of stops.
   */
  _validateAndSortStops(stops) {
    if (!stops || stops.length === 0) return [];

    const orders = stops.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      const error = new Error('Stops must have unique order values');
      error.statusCode = 400;
      throw error;
    }

    // Clone and sort the stops in ascending order by 'order'
    return [...stops].sort((a, b) => a.order - b.order);
  }

  /**
   * Creates a new route.
   * 
   * @param {Object} routeData - The details of the route to create.
   * @param {string} createdById - The admin creating the route.
   * @returns {Promise<Object>} The saved route document.
   */
  async createRoute(routeData, createdById) {
    const { routeCode, origin, destination, distance, estimatedDuration, baseFare, farePerKm, stops } = routeData;

    // 1. Validation: Origin and destination must not be identical
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      const error = new Error('Origin and destination cannot be the same');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Numeric boundary constraints
    if (distance <= 0 || estimatedDuration <= 0 || baseFare <= 0 || farePerKm <= 0) {
      const error = new Error('Distance, estimated duration, base fare, and fare per km must be greater than zero');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validation: Unique check for routeCode
    const duplicateExists = await routeRepository.exists(routeCode);
    if (duplicateExists) {
      const error = new Error('Route code is already in use by an active route');
      error.statusCode = 400;
      throw error;
    }

    // 4. Validation & sorting of stop objects
    const sortedStops = this._validateAndSortStops(stops);

    const payload = {
      ...routeData,
      stops: sortedStops,
      createdBy: createdById
    };

    return await routeRepository.create(payload);
  }

  /**
   * Retrieves a route by ID.
   * 
   * @param {string} id - The route ID.
   * @returns {Promise<Object>} The route document.
   */
  async getRoute(id) {
    const route = await routeRepository.findById(id);
    if (!route) {
      const error = new Error('Route not found');
      error.statusCode = 404;
      throw error;
    }
    return route;
  }

  /**
   * Retrieves all routes matching search/filters.
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering, and sorting parameters.
   * @returns {Promise<Object>} List of routes and pagination details.
   */
  async getRoutes(queryOptions) {
    return await routeRepository.findAll(queryOptions);
  }

  /**
   * Updates route details.
   * 
   * @param {string} id - The route ID.
   * @param {Object} updateData - Data to update.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated route document.
   */
  async updateRoute(id, updateData, updatedById) {
    const route = await routeRepository.findById(id);
    if (!route) {
      const error = new Error('Route not found');
      error.statusCode = 404;
      throw error;
    }

    // 1. Validation: Origin vs Destination check
    const origin = updateData.origin !== undefined ? updateData.origin : route.origin;
    const destination = updateData.destination !== undefined ? updateData.destination : route.destination;
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      const error = new Error('Origin and destination cannot be the same');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validation: Numeric constraints if provided
    if (updateData.distance !== undefined && updateData.distance <= 0) {
      const error = new Error('Distance must be greater than zero');
      error.statusCode = 400;
      throw error;
    }
    if (updateData.estimatedDuration !== undefined && updateData.estimatedDuration <= 0) {
      const error = new Error('Estimated duration must be greater than zero');
      error.statusCode = 400;
      throw error;
    }
    if (updateData.baseFare !== undefined && updateData.baseFare <= 0) {
      const error = new Error('Base fare must be greater than zero');
      error.statusCode = 400;
      throw error;
    }
    if (updateData.farePerKm !== undefined && updateData.farePerKm <= 0) {
      const error = new Error('Fare per km must be greater than zero');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validation: Unique routeCode excluding current ID
    if (updateData.routeCode) {
      const duplicateExists = await routeRepository.existsExcludeId('routeCode', updateData.routeCode, id);
      if (duplicateExists) {
        const error = new Error('Route code is already in use by another active route');
        error.statusCode = 400;
        throw error;
      }
    }

    // 4. Validation & sorting of stop objects if provided
    let sortedStops = route.stops;
    if (updateData.stops !== undefined) {
      sortedStops = this._validateAndSortStops(updateData.stops);
    }

    const payload = {
      ...updateData,
      stops: sortedStops,
      updatedBy: updatedById
    };

    return await routeRepository.update(id, payload);
  }

  /**
   * Updates route status.
   * 
   * @param {string} id - The route ID.
   * @param {string} status - New route status.
   * @param {string} updatedById - The admin performing the status update.
   * @returns {Promise<Object>} The updated route document.
   */
  async updateRouteStatus(id, status, updatedById) {
    const route = await routeRepository.findById(id);
    if (!route) {
      const error = new Error('Route not found');
      error.statusCode = 404;
      throw error;
    }

    return await routeRepository.update(id, { status, updatedBy: updatedById });
  }

  /**
   * Soft-deletes a route.
   * 
   * @param {string} id - The route ID.
   * @param {string} deletedById - The admin performing the delete.
   * @returns {Promise<Object>} The soft-deleted route document.
   */
  async deleteRoute(id, deletedById) {
    const route = await routeRepository.findById(id);
    if (!route) {
      const error = new Error('Route not found');
      error.statusCode = 404;
      throw error;
    }

    // Prevent deleting a Route if it has future schedules
    const scheduleRepository = require('../../schedule/repository/scheduleRepository');
    const hasFutureSchedules = await scheduleRepository.hasFutureSchedulesForRoute(id);
    if (hasFutureSchedules) {
      const error = new Error('Cannot delete route as it has active future schedules assigned');
      error.statusCode = 400;
      throw error;
    }

    return await routeRepository.update(id, {
      status: RouteStatus.INACTIVE,
      deletedAt: new Date(),
      deletedBy: deletedById
    });
  }

  /**
   * Helper function checking if a route is available.
   * 
   * @param {string} routeId - The route ID to inspect.
   * @returns {Promise<boolean>} True if route is ACTIVE, false otherwise.
   */
  async isRouteAvailable(routeId) {
    const route = await routeRepository.findById(routeId);
    if (!route) return false;
    return route.status === RouteStatus.ACTIVE;
  }
}

module.exports = new RouteService();
