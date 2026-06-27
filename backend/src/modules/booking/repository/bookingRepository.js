/**
 * @file bookingRepository.js
 * @description Encapsulates all database operations for the Booking model, using MongoDB aggregation for sorting populated travelDates.
 */

const mongoose = require('mongoose');
const Booking = require('../model/Booking');

class BookingRepository {
  /**
   * Creates and saves a new Booking document.
   * 
   * @param {Object} bookingData - The details of the booking to create.
   * @returns {Promise<Object>} The saved booking document.
   */
  async create(bookingData) {
    try {
      const booking = new Booking(bookingData);
      return await booking.save();
    } catch (error) {
      throw new Error(`Database error in create booking: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted booking by its ID.
   * 
   * @param {string} id - The MongoDB ID of the booking.
   * @returns {Promise<Object|null>} The booking document populated with Schedule and Seats details.
   */
  async findById(id) {
    try {
      return await Booking.findOne({ _id: id, deletedAt: null })
        .populate({
          path: 'scheduleId',
          populate: [
            { path: 'busId' },
            { path: 'driverId' },
            { path: 'routeId' }
          ]
        })
        .populate('seatIds')
        .exec();
    } catch (error) {
      throw new Error(`Database error in findById booking: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted bookings matching query criteria, supporting pagination, searching, filtering, and sorting.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching bookingCode, passengerName, or passengerPhone.
   * @param {string} [options.bookingStatus=''] - Filter by booking status.
   * @param {string} [options.paymentStatus=''] - Filter by payment status.
   * @param {string} [options.scheduleId=''] - Filter by scheduleId.
   * @param {string} [options.userId=''] - Filter by userId.
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing bookings list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', bookingStatus = '', paymentStatus = '', scheduleId = '', userId = '', sortBy = '-createdAt' }) {
    try {
      const matchStage = { deletedAt: null };

      // 1. Text Search (matches bookingCode, passengerName, or passengerPhone)
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        matchStage.$or = [
          { bookingCode: searchRegex },
          { passengerName: searchRegex },
          { passengerPhone: searchRegex }
        ];
      }

      // 2. Filters
      if (bookingStatus) {
        matchStage.bookingStatus = bookingStatus;
      }
      if (paymentStatus) {
        matchStage.paymentStatus = paymentStatus;
      }
      if (scheduleId) {
        matchStage.scheduleId = new mongoose.Types.ObjectId(scheduleId);
      }
      if (userId) {
        matchStage.userId = new mongoose.Types.ObjectId(userId);
      }

      // 3. Pagination limits
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // 4. Base aggregation pipeline
      const pipeline = [{ $match: matchStage }];

      // 5. Sorting
      let sortStage = {};
      if (sortBy === 'travelDate' || sortBy === '-travelDate') {
        // Join with schedules collection to sort by populated travelDate
        pipeline.push({
          $lookup: {
            from: 'schedules',
            localField: 'scheduleId',
            foreignField: '_id',
            as: 'schedule'
          }
        });
        pipeline.push({ $unwind: '$schedule' });
        const sortOrder = sortBy.startsWith('-') ? -1 : 1;
        sortStage = { 'schedule.travelDate': sortOrder };
      } else {
        let sortField = 'createdAt';
        let sortOrder = -1;
        if (sortBy) {
          if (sortBy.startsWith('-')) {
            sortField = sortBy.substring(1);
            sortOrder = -1;
          } else {
            sortField = sortBy;
            sortOrder = 1;
          }
        }
        sortStage = { [sortField]: sortOrder };
      }

      pipeline.push({ $sort: sortStage });

      // 6. Concurrently execute query and count countDocuments
      const [bookings, countResult] = await Promise.all([
        Booking.aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: limitNum }
        ]).exec(),
        Booking.countDocuments(matchStage)
      ]);

      // Populating the aggregated plain documents
      const populatedBookings = await Booking.populate(bookings, [
        { path: 'scheduleId' },
        { path: 'seatIds' }
      ]);

      const totalPages = Math.ceil(countResult / limitNum);

      return {
        bookings: populatedBookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: countResult,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrevious: pageNum > 1
        }
      };
    } catch (error) {
      throw new Error(`Database error in findAll bookings: ${error.message}`);
    }
  }

  /**
   * Updates booking details.
   * 
   * @param {string} id - The MongoDB ID of the booking to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated booking document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Booking.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      })
        .populate('scheduleId')
        .populate('seatIds')
        .exec();
    } catch (error) {
      throw new Error(`Database error in update booking: ${error.message}`);
    }
  }

  /**
   * Checks if an active booking exists with the specified bookingCode.
   * 
   * @param {string} bookingCode - The booking code to check.
   * @returns {Promise<boolean>} True if match exists, false otherwise.
   */
  async exists(bookingCode) {
    try {
      const result = await Booking.exists({ bookingCode, deletedAt: null });
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists booking: ${error.message}`);
    }
  }

  /**
   * Checks if another active booking exists with a duplicate field value, excluding a specific ID.
   * 
   * @param {string} field - The field to check.
   * @param {string} value - The candidate value.
   * @param {string} id - The ID of the booking to exclude.
   * @returns {Promise<boolean>} True if duplicate exists, false otherwise.
   */
  async existsExcludeId(field, value, id) {
    try {
      const query = {
        _id: { $ne: id },
        deletedAt: null,
        [field]: value
      };
      const result = await Booking.exists(query);
      return !!result;
    } catch (error) {
      throw new Error(`Database error in existsExcludeId booking: ${error.message}`);
    }
  }
}

module.exports = new BookingRepository();
