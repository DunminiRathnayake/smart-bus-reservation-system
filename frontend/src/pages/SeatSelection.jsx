import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import seatService from '../services/seatService';
import scheduleService from '../services/scheduleService';
import bookingService from '../services/bookingService';
import BookingStepper from '../components/common/BookingStepper';
import BookingSidebar from '../components/common/BookingSidebar';
import PageLoader from '../components/common/PageLoader';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Armchair, ChevronRight, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

/**
 * Seat Selection page rendering layout maps, color-coded status indices,
 * and summaries sidebars.
 */
const SeatSelection = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const fetchSeatsData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [scheduleRes, seatsRes] = await Promise.all([
        scheduleService.getSchedule(scheduleId),
        seatService.getSeats(scheduleId)
      ]);

      if (scheduleRes.success && seatsRes.success) {
        setSchedule(scheduleRes.data.schedule);
        setSeats(seatsRes.data.seats || []);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to load seating configurations:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatsData();
  }, [scheduleId]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') {
      addToast(`Seat ${seat.seatNumber} is currently ${seat.status.toLowerCase()}.`, 'warning');
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((num) => num !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  // Group seats by row prefix (e.g. "A", "B") to lay them out dynamically in a bus grid
  const getSeatingRows = () => {
    const rows = {};
    seats.forEach((seat) => {
      const rowName = seat.seatNumber.charAt(0);
      if (!rows[rowName]) rows[rowName] = [];
      rows[rowName].push(seat);
    });

    // Sort seats numerically within each row (e.g. A1, A2, A3)
    Object.keys(rows).forEach((rowName) => {
      rows[rowName].sort((a, b) => {
        const numA = parseInt(a.seatNumber.substring(1), 10);
        const numB = parseInt(b.seatNumber.substring(1), 10);
        return numA - numB;
      });
    });

    return rows;
  };

  if (loading) return <PageLoader message="Constructing bus seat layout..." />;

  if (error || !schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Seat Configurations Unreachable</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Seating maps cannot be generated at this moment.
        </p>
        <button
          onClick={fetchSeatsData}
          className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const rows = getSeatingRows();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <Link
          to={`/schedules/${scheduleId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Schedule Details
        </Link>
      </div>

      <BookingStepper currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Seat Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-slate-850 pb-4 relative z-10">
            <h3 className="text-base font-bold text-slate-200">Select Seating Arrangement</h3>
            <button
              onClick={fetchSeatsData}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-250 transition-colors"
              title="Refresh seats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Seat Status Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl relative z-10 text-[10px] sm:text-xs">
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-lg border border-slate-700 bg-slate-900/10 text-slate-400 flex items-center justify-center font-bold">
                <Armchair className="h-3 w-3" />
              </div>
              <span className="text-slate-405">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-lg border border-emerald-500 bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Armchair className="h-3 w-3" />
              </div>
              <span className="text-slate-405">Selected by You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-lg border border-blue-500 bg-blue-500/15 text-blue-405 flex items-center justify-center font-bold">
                <Armchair className="h-3 w-3" />
              </div>
              <span className="text-slate-405">Booked by Gents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-lg border border-pink-500 bg-pink-500/15 text-pink-405 flex items-center justify-center font-bold">
                <Armchair className="h-3 w-3" />
              </div>
              <span className="text-slate-405">Booked by Ladies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-lg border border-purple-500 bg-purple-500/15 text-purple-405 flex items-center justify-center font-bold">
                <Armchair className="h-3 w-3" />
              </div>
              <span className="text-slate-450">Reserved Seats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4.5 w-4.5 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-700 flex items-center justify-center font-bold">
                <Armchair className="h-3 w-3" />
              </div>
              <span className="text-slate-450">Unavailable</span>
            </div>
          </div>

          {/* Seating Layout Map Grid */}
          <div className="relative z-10 py-6 max-w-sm mx-auto bg-slate-950 border border-slate-850 rounded-3xl shadow-inner flex flex-col items-center">
            {/* Steering Wheel Indicator */}
            <div className="w-full max-w-[200px] border-b border-slate-850 pb-4 mb-6 flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-wider">
              <span>DRIVER SEAT</span>
              <div className="h-6 w-6 border border-slate-800 rounded-full flex items-center justify-center">⚙️</div>
            </div>

            {/* Seating rows list */}
            {Object.keys(rows).length > 0 ? (
              <div className="space-y-4 px-6 w-full">
                {Object.keys(rows).sort().map((rowName) => {
                  const rowSeats = rows[rowName];
                  const isBackRow = rowSeats.length === 5;

                  return (
                    <div key={rowName} className="flex justify-between items-center gap-4">
                      {isBackRow ? (
                        /* Back row has 5 seats with no center aisle */
                        <div className="flex gap-2.5 justify-center w-full">
                          {rowSeats.map((seat) => {
                            const isSelected = selectedSeats.includes(seat.seatNumber);
                            const isAvailable = seat.status === 'AVAILABLE';
                            const isBooked = seat.status === 'BOOKED';

                            let stateStyles = 'border-slate-700 bg-slate-900/10 text-slate-400 hover:border-slate-500 hover:text-slate-200';
                            if (isSelected) {
                              stateStyles = 'border-emerald-500 bg-emerald-500 text-slate-950';
                            } else if (isBooked) {
                              const isFemale = seat.passengerId?.gender === 'FEMALE';
                              stateStyles = isFemale
                                ? 'border-pink-500 bg-pink-500/15 text-pink-400 cursor-not-allowed'
                                : 'border-blue-500 bg-blue-500/15 text-blue-400 cursor-not-allowed';
                            } else if (seat.status === 'HELD') {
                              stateStyles = 'border-purple-500 bg-purple-500/15 text-purple-400 cursor-not-allowed';
                            } else if (!isAvailable) {
                              stateStyles = 'border-slate-800 bg-slate-900/40 text-slate-700 cursor-not-allowed opacity-40';
                            }

                            return (
                              <button
                                key={seat._id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={!isAvailable && !isSelected}
                                className={`h-11 w-11 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all ${stateStyles}`}
                                title={`Seat ${seat.seatNumber} (${seat.status})`}
                              >
                                <Armchair className="h-4 w-4" />
                                <span className="text-[8px] mt-0.5">{seat.seatNumber}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Regular row has 4 seats divided by a center aisle */
                        <>
                          {/* Left Corridor Group (1 & 2) */}
                          <div className="flex gap-3">
                            {rowSeats.slice(0, 2).map((seat) => {
                              const isSelected = selectedSeats.includes(seat.seatNumber);
                              const isAvailable = seat.status === 'AVAILABLE';
                              const isBooked = seat.status === 'BOOKED';

                              let stateStyles = 'border-slate-700 bg-slate-900/10 text-slate-400 hover:border-slate-500 hover:text-slate-200';
                              if (isSelected) {
                                stateStyles = 'border-emerald-500 bg-emerald-500 text-slate-950';
                              } else if (isBooked) {
                                const isFemale = seat.passengerId?.gender === 'FEMALE';
                                stateStyles = isFemale
                                  ? 'border-pink-500 bg-pink-500/15 text-pink-400 cursor-not-allowed'
                                  : 'border-blue-500 bg-blue-500/15 text-blue-400 cursor-not-allowed';
                              } else if (seat.status === 'HELD') {
                                stateStyles = 'border-purple-500 bg-purple-500/15 text-purple-400 cursor-not-allowed';
                              } else if (!isAvailable) {
                                stateStyles = 'border-slate-800 bg-slate-900/40 text-slate-700 cursor-not-allowed opacity-40';
                              }

                              return (
                                <button
                                  key={seat._id}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={!isAvailable && !isSelected}
                                  className={`h-11 w-11 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all ${stateStyles}`}
                                  title={`Seat ${seat.seatNumber} (${seat.status})`}
                                >
                                  <Armchair className="h-4 w-4" />
                                  <span className="text-[8px] mt-0.5">{seat.seatNumber}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Corridor Space */}
                          <div className="w-8 text-[8px] font-bold text-slate-700 text-center uppercase tracking-widest">
                            Aisle
                          </div>

                          {/* Right Corridor Group (3 & 4) */}
                          <div className="flex gap-3">
                            {rowSeats.slice(2, 4).map((seat) => {
                              const isSelected = selectedSeats.includes(seat.seatNumber);
                              const isAvailable = seat.status === 'AVAILABLE';
                              const isBooked = seat.status === 'BOOKED';

                              let stateStyles = 'border-slate-700 bg-slate-900/10 text-slate-400 hover:border-slate-500 hover:text-slate-200';
                              if (isSelected) {
                                stateStyles = 'border-emerald-500 bg-emerald-500 text-slate-950';
                              } else if (isBooked) {
                                const isFemale = seat.passengerId?.gender === 'FEMALE';
                                stateStyles = isFemale
                                  ? 'border-pink-500 bg-pink-500/15 text-pink-400 cursor-not-allowed'
                                  : 'border-blue-500 bg-blue-500/15 text-blue-400 cursor-not-allowed';
                              } else if (seat.status === 'HELD') {
                                stateStyles = 'border-purple-500 bg-purple-500/15 text-purple-400 cursor-not-allowed';
                              } else if (!isAvailable) {
                                stateStyles = 'border-slate-800 bg-slate-900/40 text-slate-700 cursor-not-allowed opacity-40';
                              }

                              return (
                                <button
                                  key={seat._id}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={!isAvailable && !isSelected}
                                  className={`h-11 w-11 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all ${stateStyles}`}
                                  title={`Seat ${seat.seatNumber} (${seat.status})`}
                                >
                                  <Armchair className="h-4 w-4" />
                                  <span className="text-[8px] mt-0.5">{seat.seatNumber}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-8">
                No active seat records mapped to this departure.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Booking summary sidebar */}
        <div className="space-y-6">
          <BookingSidebar schedule={schedule} selectedSeats={selectedSeats} />

          {/* Continue Action */}
          <button
            onClick={async () => {
              if (selectedSeats.length === 0) {
                addToast('Please select at least one seat to continue.', 'warning');
                return;
              }
              const ids = seats
                .filter((s) => selectedSeats.includes(s.seatNumber))
                .map((s) => s._id);

              if (!user) {
                addToast('Please sign in as a passenger to confirm your seat booking.', 'info');
                navigate('/login', {
                  state: {
                    redirectTo: `/schedules/${scheduleId}/book?seats=${selectedSeats.join(',')}&seatIds=${ids.join(',')}`
                  }
                });
                return;
              }

              navigate(`/schedules/${scheduleId}/book?seats=${selectedSeats.join(',')}&seatIds=${ids.join(',')}`);
            }}
            disabled={selectedSeats.length === 0 || isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> Confirming...
              </>
            ) : (
              <>
                Confirm Seats & Book <ChevronRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
