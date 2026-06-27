/**
 * @file ticketRepository.js
 * @description Encapsulates all database operations for the Ticket model, using MongoDB aggregation for join searches.
 */

const mongoose = require('mongoose');
const Ticket = require('../model/Ticket');

class TicketRepository {
  /**
   * Creates and saves a new Ticket document.
   * 
   * @param {Object} ticketData - The details of the ticket to create.
   * @returns {Promise<Object>} The saved ticket document.
   */
  async create(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      return await ticket.save();
    } catch (error) {
      throw new Error(`Database error in create ticket: ${error.message}`);
    }
  }

  /**
   * Finds a non-deleted ticket by its ID, fully populating Booking, Schedule, Route, Bus, and Seat details.
   * 
   * @param {string} id - The MongoDB ID of the ticket.
   * @returns {Promise<Object|null>} The populated ticket document.
   */
  async findById(id) {
    try {
      return await Ticket.findOne({ _id: id, deletedAt: null })
        .populate({
          path: 'bookingId',
          populate: [
            { path: 'userId' }
          ]
        })
        .populate({
          path: 'scheduleId',
          populate: [
            { path: 'busId' },
            { path: 'driverId' },
            { path: 'routeId' }
          ]
        })
        .populate('seatIds')
        .populate('validatedBy')
        .exec();
    } catch (error) {
      throw new Error(`Database error in findById ticket: ${error.message}`);
    }
  }

  /**
   * Finds a ticket associated with a specific booking.
   * 
   * @param {string} bookingId - The booking ID.
   * @returns {Promise<Object|null>} The ticket document.
   */
  async findByBooking(bookingId) {
    try {
      return await Ticket.findOne({ bookingId, deletedAt: null })
        .populate('scheduleId')
        .populate('seatIds')
        .exec();
    } catch (error) {
      throw new Error(`Database error in findByBooking ticket: ${error.message}`);
    }
  }

  /**
   * Finds tickets associated with a specific user.
   * 
   * @param {string} userId - The user ID.
   * @returns {Promise<Array<Object>>} Array of ticket documents.
   */
  async findByUser(userId) {
    try {
      return await Ticket.find({ userId, deletedAt: null })
        .populate('scheduleId')
        .populate('seatIds')
        .exec();
    } catch (error) {
      throw new Error(`Database error in findByUser ticket: ${error.message}`);
    }
  }

  /**
   * Finds all non-deleted tickets matching query criteria, supporting pagination, searching, filtering, and sorting.
   * Uses aggregation $lookup join with the bookings collection to search by bookingCode and passengerName.
   * 
   * @param {Object} options - Query options.
   * @param {number} [options.page=1] - Page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.search=''] - Search term matching ticketCode, bookingCode, or passengerName.
   * @param {string} [options.ticketStatus=''] - Filter by ticket status.
   * @param {string} [options.bookingId=''] - Filter by bookingId.
   * @param {string} [options.userId=''] - Filter by userId.
   * @param {string} [options.scheduleId=''] - Filter by scheduleId.
   * @param {string} [options.sortBy='-createdAt'] - Sorting parameter.
   * @returns {Promise<Object>} Object containing tickets list and pagination metadata.
   */
  async findAll({ page = 1, limit = 10, search = '', ticketStatus = '', bookingId = '', userId = '', scheduleId = '', sortBy = '-createdAt' }) {
    try {
      const matchStage = { deletedAt: null };

      // Filters
      if (ticketStatus) {
        matchStage.ticketStatus = ticketStatus;
      }
      if (bookingId) {
        matchStage.bookingId = new mongoose.Types.ObjectId(bookingId);
      }
      if (userId) {
        matchStage.userId = new mongoose.Types.ObjectId(userId);
      }
      if (scheduleId) {
        matchStage.scheduleId = new mongoose.Types.ObjectId(scheduleId);
      }

      // Pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      // Base aggregation pipeline
      const pipeline = [{ $match: matchStage }];

      // Join and match for searches (ticketCode, booking.bookingCode, or booking.passengerName)
      if (search) {
        pipeline.push({
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking'
          }
        });
        pipeline.push({ $unwind: '$booking' });

        const searchRegex = new RegExp(search, 'i');
        pipeline.push({
          $match: {
            $or: [
              { ticketCode: searchRegex },
              { 'booking.bookingCode': searchRegex },
              { 'booking.passengerName': searchRegex }
            ]
          }
        });
      }

      // Sorting
      let sortStage = {};
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
      pipeline.push({ $sort: sortStage });

      // Run count and query concurrently
      const [tickets, countResult] = await Promise.all([
        Ticket.aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: limitNum }
        ]).exec(),
        Ticket.countDocuments(matchStage)
      ]);

      // Populating the plain objects retrieved from aggregation
      const populatedTickets = await Ticket.populate(tickets, [
        { path: 'bookingId' },
        {
          path: 'scheduleId',
          populate: [
            { path: 'busId' },
            { path: 'driverId' },
            { path: 'routeId' }
          ]
        },
        { path: 'seatIds' }
      ]);

      const totalPages = Math.ceil(countResult / limitNum);

      return {
        tickets: populatedTickets,
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
      throw new Error(`Database error in findAll tickets: ${error.message}`);
    }
  }

  /**
   * Updates ticket details.
   * 
   * @param {string} id - The MongoDB ID of the ticket to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The populated updated ticket document, or null if not found.
   */
  async update(id, data) {
    try {
      return await Ticket.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      })
        .populate({
          path: 'bookingId',
          populate: [{ path: 'userId' }]
        })
        .populate({
          path: 'scheduleId',
          populate: [
            { path: 'busId' },
            { path: 'driverId' },
            { path: 'routeId' }
          ]
        })
        .populate('seatIds')
        .populate('validatedBy')
        .exec();
    } catch (error) {
      throw new Error(`Database error in update ticket: ${error.message}`);
    }
  }
}

module.exports = new TicketRepository();
