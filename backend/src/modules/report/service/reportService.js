/**
 * @file reportService.js
 * @description Encapsulates all aggregation and reporting logic (Sprint 13). Read-only.
 */

const User = require('../../user/model/User');
const Bus = require('../../bus/model/Bus');
const Driver = require('../../driver/model/Driver');
const Route = require('../../route/model/Route');
const Schedule = require('../../schedule/model/Schedule');
const Booking = require('../../booking/model/Booking');
const Payment = require('../../payment/model/Payment');
const Ticket = require('../../ticket/model/Ticket');
const Seat = require('../../seat/model/Seat');
const Notification = require('../../notification/model/Notification');
const { getStartEndDates } = require('../utils/dateHelper');

class ReportService {
  /**
   * Retrieves summary statistics and active resource counts for the administrative dashboard.
   * 
   * @returns {Promise<Object>} Dashboard stats object.
   */
  async getDashboardStats() {
    // TODO: Introduce Redis caching here later to speed up dashboard loading.
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalBuses,
      activeBuses,
      totalDrivers,
      activeDrivers,
      totalRoutes,
      activeRoutes,
      todaySchedules,
      activeSchedules,
      todayBookings,
      totalTickets,
      totalNotifications,
      seatDistribution,
      bookingDistribution
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      Bus.countDocuments({ deletedAt: null }),
      Bus.countDocuments({ status: 'ACTIVE', deletedAt: null }),
      Driver.countDocuments({ deletedAt: null }),
      Driver.countDocuments({ status: 'ACTIVE', deletedAt: null }),
      Route.countDocuments({ deletedAt: null }),
      Route.countDocuments({ deletedAt: null }), // active routes placeholder
      Schedule.countDocuments({ travelDate: { $gte: todayStart, $lte: todayEnd }, deletedAt: null }),
      Schedule.countDocuments({ status: 'ACTIVE', deletedAt: null }),
      Booking.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd }, deletedAt: null }),
      Ticket.countDocuments({ deletedAt: null }),
      Notification.countDocuments({ deletedAt: null }),
      
      // Seat counts
      Seat.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]),

      // Bookings by status
      Booking.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    // Calculate today/monthly revenue
    const [todayRevRes, monthRevRes] = await Promise.all([
      Payment.aggregate([
        { $match: { paymentStatus: 'SUCCESS', paidAt: { $gte: todayStart, $lte: todayEnd }, deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
        { $project: { total: { $ifNull: ['$total', 0] }, _id: 0 } }
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: 'SUCCESS', paidAt: { $gte: monthStart, $lte: todayEnd }, deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
        { $project: { total: { $ifNull: ['$total', 0] }, _id: 0 } }
      ])
    ]);

    const todayRevenue = todayRevRes[0]?.total || 0;
    const monthlyRevenue = monthRevRes[0]?.total || 0;

    const availableSeats = seatDistribution.find(s => s.status === 'AVAILABLE')?.count || 0;
    const bookedSeats = seatDistribution.find(s => s.status === 'BOOKED')?.count || 0;

    const pendingBookings = bookingDistribution.find(b => b.status === 'PENDING')?.count || 0;
    const confirmedBookings = bookingDistribution.find(b => b.status === 'CONFIRMED')?.count || 0;
    const cancelledBookings = bookingDistribution.find(b => b.status === 'CANCELLED')?.count || 0;

    const summary = {
      totalUsers,
      totalBuses,
      activeBuses,
      totalDrivers,
      activeDrivers,
      totalRoutes,
      activeRoutes,
      todaySchedules,
      activeSchedules,
      todayBookings,
      todayRevenue,
      monthlyRevenue,
      totalTickets,
      totalNotifications,
      availableSeats,
      bookedSeats,
      pendingBookings,
      confirmedBookings,
      cancelledBookings
    };

    return {
      summary,
      chartData: {
        labels: ['Pending', 'Confirmed', 'Cancelled'],
        datasets: [
          {
            label: 'Bookings Distribution',
            data: [pendingBookings, confirmedBookings, cancelledBookings]
          }
        ]
      },
      filters: {}
    };
  }

  /**
   * Retrieves revenue report grouped by interval.
   * 
   * @param {string} range - Preset date range.
   * @param {string} startDate - Custom start date.
   * @param {string} endDate - Custom end date.
   * @returns {Promise<Object>} Formatted report object.
   */
  async getRevenueReport(range, startDate, endDate) {
    // TODO: Introduce Redis caching here later to speed up report compilation.
    
    const { startDate: start, endDate: end } = getStartEndDates(range, startDate, endDate);

    // Sum details from successful and refunded payments
    const [revStats, refundStats] = await Promise.all([
      Payment.aggregate([
        { $match: { paymentStatus: 'SUCCESS', paidAt: { $gte: start, $lte: end }, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            successfulPayments: { $sum: 1 }
          }
        },
        {
          $project: {
            totalRevenue: { $ifNull: ['$totalRevenue', 0] },
            successfulPayments: { $ifNull: ['$successfulPayments', 0] },
            _id: 0
          }
        }
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: 'REFUNDED', updatedAt: { $gte: start, $lte: end }, deletedAt: null } },
        { $group: { _id: null, totalRefund: { $sum: '$amount' } } },
        { $project: { totalRefund: { $ifNull: ['$totalRefund', 0] }, _id: 0 } }
      ])
    ]);

    const totalRevenue = revStats[0]?.totalRevenue || 0;
    const totalSuccessfulPayments = revStats[0]?.successfulPayments || 0;
    const refundAmount = refundStats[0]?.totalRefund || 0;
    const netRevenue = totalRevenue - refundAmount;

    // Calculate Average Booking Value (via Booking model)
    const avgBookingRes = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED', createdAt: { $gte: start, $lte: end }, deletedAt: null } },
      { $group: { _id: null, avgValue: { $avg: '$totalAmount' } } },
      { $project: { avgValue: { $ifNull: ['$avgValue', 0] }, _id: 0 } }
    ]);
    const averageBookingValue = avgBookingRes[0]?.avgValue || 0;

    // Build trend chart data
    let groupFormat = '%Y-%m-%d';
    if (range === 'today') {
      groupFormat = '%H:00';
    } else if (range === 'thisYear') {
      groupFormat = '%Y-%m';
    }

    const trends = await Payment.aggregate([
      { $match: { paymentStatus: 'SUCCESS', paidAt: { $gte: start, $lte: end }, deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$paidAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          label: '$_id',
          revenue: { $ifNull: ['$revenue', 0] },
          _id: 0
        }
      }
    ]);

    const labels = trends.map(t => t.label);
    const data = trends.map(t => t.revenue);

    return {
      summary: {
        totalRevenue,
        averageBookingValue,
        totalSuccessfulPayments,
        refundAmount,
        netRevenue
      },
      chartData: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data
          }
        ]
      },
      filters: { range, startDate: start, endDate: end }
    };
  }

  /**
   * Retrieves booking report statistics and trends.
   */
  async getBookingReport(range, startDate, endDate) {
    const { startDate: start, endDate: end } = getStartEndDates(range, startDate, endDate);

    const [stats, completedRes] = await Promise.all([
      Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            confirmed: {
              $sum: { $cond: [{ $eq: ['$bookingStatus', 'CONFIRMED'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$bookingStatus', 'CANCELLED'] }, 1, 0] }
            },
            totalSeats: { $sum: '$numberOfSeats' }
          }
        },
        {
          $project: {
            totalBookings: { $ifNull: ['$totalBookings', 0] },
            confirmed: { $ifNull: ['$confirmed', 0] },
            cancelled: { $ifNull: ['$cancelled', 0] },
            totalSeats: { $ifNull: ['$totalSeats', 0] },
            _id: 0
          }
        }
      ]),
      Booking.aggregate([
        { $match: { bookingStatus: 'CONFIRMED', createdAt: { $gte: start, $lte: end }, deletedAt: null } },
        { $lookup: { from: 'schedules', localField: 'scheduleId', foreignField: '_id', as: 'schedule' } },
        { $unwind: '$schedule' },
        { $match: { 'schedule.travelDate': { $lt: new Date() } } },
        { $count: 'count' }
      ])
    ]);

    const totalBookings = stats[0]?.totalBookings || 0;
    const confirmed = stats[0]?.confirmed || 0;
    const cancelled = stats[0]?.cancelled || 0;
    const totalSeats = stats[0]?.totalSeats || 0;
    const completed = completedRes[0]?.count || 0;

    const bookingSuccessRate = totalBookings > 0 ? (confirmed / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;
    const averageSeatsPerBooking = totalBookings > 0 ? totalSeats / totalBookings : 0;

    // Booking Trends
    const trends = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          label: '$_id',
          count: { $ifNull: ['$count', 0] },
          _id: 0
        }
      }
    ]);

    const labels = trends.map(t => t.label);
    const data = trends.map(t => t.count);

    return {
      summary: {
        totalBookings,
        confirmed,
        cancelled,
        completed,
        bookingSuccessRate,
        cancellationRate,
        averageSeatsPerBooking
      },
      chartData: {
        labels,
        datasets: [
          {
            label: 'Bookings Trend',
            data
          }
        ]
      },
      filters: { range, startDate: start, endDate: end }
    };
  }

  /**
   * Retrieves route statistics, popularity lists, and occupancies.
   */
  async getRouteReport() {
    const routeStats = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED', deletedAt: null } },
      { $lookup: { from: 'schedules', localField: 'scheduleId', foreignField: '_id', as: 'schedule' } },
      { $unwind: '$schedule' },
      { $lookup: { from: 'routes', localField: 'schedule.routeId', foreignField: '_id', as: 'route' } },
      { $unwind: '$route' },
      {
        $group: {
          _id: '$route._id',
          routeName: { $first: { $concat: ['$route.origin', ' - ', '$route.destination'] } },
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          seatsBooked: { $sum: '$numberOfSeats' }
        }
      },
      {
        $project: {
          routeName: 1,
          bookingsCount: { $ifNull: ['$bookingsCount', 0] },
          totalRevenue: { $ifNull: ['$totalRevenue', 0] },
          seatsBooked: { $ifNull: ['$seatsBooked', 0] },
          _id: 0
        }
      }
    ]);

    // Route occupancies
    const routeOccupancies = await Schedule.aggregate([
      { $match: { deletedAt: null } },
      { $lookup: { from: 'routes', localField: 'routeId', foreignField: '_id', as: 'route' } },
      { $unwind: '$route' },
      {
        $group: {
          _id: '$route._id',
          routeName: { $first: { $concat: ['$route.origin', ' - ', '$route.destination'] } },
          totalCapacity: { $sum: '$totalSeats' },
          seatsBooked: { $sum: '$bookedSeats' }
        }
      },
      {
        $project: {
          routeName: 1,
          occupancyRate: {
            $cond: [
              { $gt: ['$totalCapacity', 0] },
              { $multiply: [{ $divide: ['$seatsBooked', '$totalCapacity'] }, 100] },
              0
            ]
          },
          _id: 0
        }
      }
    ]);

    const sortedByBookings = [...routeStats].sort((a, b) => b.bookingsCount - a.bookingsCount);
    const sortedByRevenue = [...routeStats].sort((a, b) => b.totalRevenue - a.totalRevenue);

    const top5Popular = sortedByBookings.slice(0, 5);
    const top5Revenue = sortedByRevenue.slice(0, 5);
    const lowestPerforming = [...sortedByBookings].reverse().slice(0, 5);

    return {
      summary: {
        top5Popular,
        top5Revenue,
        lowestPerforming,
        occupancyRates: routeOccupancies
      },
      chartData: {
        labels: routeStats.map(r => r.routeName),
        datasets: [
          {
            label: 'Bookings',
            data: routeStats.map(r => r.bookingsCount)
          },
          {
            label: 'Revenue',
            data: routeStats.map(r => r.totalRevenue)
          }
        ]
      },
      filters: {}
    };
  }

  /**
   * Retrieves bus trip, revenue, and occupancy rate reports.
   */
  async getBusReport() {
    const busSchedules = await Schedule.aggregate([
      { $match: { deletedAt: null } },
      { $lookup: { from: 'buses', localField: 'busId', foreignField: '_id', as: 'bus' } },
      { $unwind: '$bus' },
      {
        $group: {
          _id: '$bus._id',
          busNumber: { $first: '$bus.busNumber' },
          tripsCount: { $sum: 1 },
          totalCapacity: { $sum: '$totalSeats' },
          seatsBooked: { $sum: '$bookedSeats' }
        }
      },
      {
        $project: {
          busNumber: 1,
          tripsCount: { $ifNull: ['$tripsCount', 0] },
          occupancyRate: {
            $cond: [
              { $gt: ['$totalCapacity', 0] },
              { $multiply: [{ $divide: ['$seatsBooked', '$totalCapacity'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    const busRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'CONFIRMED', deletedAt: null } },
      { $lookup: { from: 'schedules', localField: 'scheduleId', foreignField: '_id', as: 'schedule' } },
      { $unwind: '$schedule' },
      { $lookup: { from: 'buses', localField: 'schedule.busId', foreignField: '_id', as: 'bus' } },
      { $unwind: '$bus' },
      {
        $group: {
          _id: '$bus._id',
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          revenue: { $ifNull: ['$revenue', 0] }
        }
      }
    ]);

    // Merge revenue into schedule statistics
    const busStats = busSchedules.map((bus) => {
      const revenueRecord = busRevenue.find(r => r._id.toString() === bus._id.toString());
      return {
        busNumber: bus.busNumber,
        tripsCount: bus.tripsCount,
        occupancyPercentage: bus.occupancyRate,
        revenue: revenueRecord ? revenueRecord.revenue : 0
      };
    });

    return {
      summary: {
        busStats
      },
      chartData: {
        labels: busStats.map(b => b.busNumber),
        datasets: [
          {
            label: 'Trips Count',
            data: busStats.map(b => b.tripsCount)
          },
          {
            label: 'Occupancy Rate (%)',
            data: busStats.map(b => b.occupancyPercentage)
          }
        ]
      },
      filters: {}
    };
  }

  /**
   * Retrieves driver assignment stats.
   */
  async getDriverReport() {
    const driverStats = await Schedule.aggregate([
      { $match: { deletedAt: null } },
      { $lookup: { from: 'drivers', localField: 'driverId', foreignField: '_id', as: 'driver' } },
      { $unwind: '$driver' },
      {
        $group: {
          _id: '$driver._id',
          driverName: { $first: { $concat: ['$driver.firstName', ' ', '$driver.lastName'] } },
          totalSchedules: { $sum: 1 },
          completedSchedules: {
            $sum: {
              $cond: [{ $lt: ['$travelDate', new Date()] }, 1, 0]
            }
          },
          routeIds: { $addToSet: '$routeId' }
        }
      },
      {
        $project: {
          driverName: 1,
          scheduleCount: { $ifNull: ['$totalSchedules', 0] },
          tripsCompleted: { $ifNull: ['$completedSchedules', 0] },
          assignedRoutesCount: { $size: { $ifNull: ['$routeIds', []] } },
          _id: 0
        }
      }
    ]);

    return {
      summary: {
        driverStats
      },
      chartData: {
        labels: driverStats.map(d => d.driverName),
        datasets: [
          {
            label: 'Trips Completed',
            data: driverStats.map(d => d.tripsCompleted)
          }
        ]
      },
      filters: {}
    };
  }

  /**
   * Retrieves payment transaction reports.
   */
  async getPaymentReport(range, startDate, endDate) {
    const { startDate: start, endDate: end } = getStartEndDates(range, startDate, endDate);

    const paymentStats = await Payment.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, deletedAt: null } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: { $ifNull: ['$count', 0] },
          totalAmount: { $ifNull: ['$totalAmount', 0] },
          _id: 0
        }
      }
    ]);

    const successfulPayments = paymentStats.find(p => p.status === 'SUCCESS')?.count || 0;
    const refundedPayments = paymentStats.find(p => p.status === 'REFUNDED')?.count || 0;
    const failedPayments = paymentStats.find(p => p.status === 'FAILED')?.count || 0;

    const totalRevenue = paymentStats.find(p => p.status === 'SUCCESS')?.totalAmount || 0;
    const totalRefundedAmount = paymentStats.find(p => p.status === 'REFUNDED')?.totalAmount || 0;

    const totalPayments = successfulPayments + refundedPayments + failedPayments;
    const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const refundRate = totalPayments > 0 ? (refundedPayments / totalPayments) * 100 : 0;

    return {
      summary: {
        totalPayments,
        successfulPayments,
        refundedPayments,
        failedPayments,
        totalRevenue,
        totalRefundedAmount,
        paymentSuccessRate,
        refundRate
      },
      chartData: {
        labels: ['Successful', 'Refunded', 'Failed'],
        datasets: [
          {
            label: 'Transactions Count',
            data: [successfulPayments, refundedPayments, failedPayments]
          }
        ]
      },
      filters: { range, startDate: start, endDate: end }
    };
  }

  /**
   * Retrieves seat occupancy distribution reports.
   */
  async getSeatReport() {
    const seatStats = await Seat.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: { $ifNull: ['$count', 0] },
          _id: 0
        }
      }
    ]);

    const availableSeats = seatStats.find(s => s.status === 'AVAILABLE')?.count || 0;
    const bookedSeats = seatStats.find(s => s.status === 'BOOKED')?.count || 0;
    const blockedSeats = seatStats.find(s => s.status === 'BLOCKED')?.count || 0;
    const heldSeats = seatStats.find(s => s.status === 'HELD')?.count || 0;
    const totalSeats = availableSeats + bookedSeats + blockedSeats + heldSeats;

    return {
      summary: {
        totalSeats,
        availableSeats,
        bookedSeats,
        blockedSeats,
        heldSeats
      },
      chartData: {
        labels: ['Available', 'Booked', 'Blocked', 'Held'],
        datasets: [
          {
            label: 'Seats Distribution',
            data: [availableSeats, bookedSeats, blockedSeats, heldSeats]
          }
        ]
      },
      filters: {}
    };
  }

  /**
   * Retrieves system notification reports.
   */
  async getNotificationReport() {
    const notificationStats = await Notification.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$isRead',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          isRead: '$_id',
          count: { $ifNull: ['$count', 0] },
          _id: 0
        }
      }
    ]);

    const readNotifications = notificationStats.find(n => n.isRead === true)?.count || 0;
    const unreadNotifications = notificationStats.find(n => n.isRead === false)?.count || 0;
    const totalNotifications = readNotifications + unreadNotifications;

    return {
      summary: {
        totalNotifications,
        readNotifications,
        unreadNotifications
      },
      chartData: {
        labels: ['Read', 'Unread'],
        datasets: [
          {
            label: 'Notification Alert Read Statuses',
            data: [readNotifications, unreadNotifications]
          }
        ]
      },
      filters: {}
    };
  }
}

module.exports = new ReportService();
