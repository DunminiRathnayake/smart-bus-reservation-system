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
  const [seatGenders, setSeatGenders] = useState({});
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [activeSeatForGender, setActiveSeatForGender] = useState(null);

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

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats((prev) => prev.filter((num) => num !== seat.seatNumber));
      setSeatGenders((prev) => {
        const copy = { ...prev };
        delete copy[seat.seatNumber];
        return copy;
      });
    } else {
      setActiveSeatForGender(seat);
      setGenderModalOpen(true);
    }
  };

  const handleGenderSelect = (gender) => {
    if (activeSeatForGender) {
      setSelectedSeats((prev) => [...prev, activeSeatForGender.seatNumber]);
      setSeatGenders((prev) => ({
        ...prev,
        [activeSeatForGender.seatNumber]: gender
      }));
    }
    setGenderModalOpen(false);
    setActiveSeatForGender(null);
  };

  // Group seats by numeric row value
  const getSeatingRows = () => {
    const rows = {};
    seats.forEach((seat) => {
      const rowNum = seat.row;
      if (!rows[rowNum]) rows[rowNum] = [];
      rows[rowNum].push(seat);
    });

    const colOrder = { 'A': 1, 'B': 2, 'E': 3, 'C': 4, 'D': 5 };
    Object.keys(rows).forEach((rowNum) => {
      rows[rowNum].sort((a, b) => colOrder[a.column] - colOrder[b.column]);
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
                {Object.keys(rows).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map((rowName) => {
                  const rowSeats = rows[rowName];
                  const isBackRow = rowSeats.length === 5;

                  const getSeatStyles = (seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isAvailable = seat.status === 'AVAILABLE';
                    const isBooked = seat.status === 'BOOKED';

                    // Available seat style matching screenshot: black box with thin border and blue highlight at the bottom
                    let stateStyles = 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500 hover:text-white border-b-blue-500 border-b-2';
                    
                    // Specific design requirement: seats 1, 2, 3, 4 are purple "Reserved" in screenshot
                    const isPurpleReserved = ['1', '2', '3', '4'].includes(seat.seatNumber);
                    if (isPurpleReserved && isAvailable && !isSelected) {
                      stateStyles = 'border border-purple-500 bg-purple-950/80 text-purple-200 hover:border-purple-400 hover:text-white';
                    }

                    if (isSelected) {
                      const selectedGender = seatGenders[seat.seatNumber];
                      if (selectedGender === 'FEMALE') {
                        stateStyles = 'border border-pink-500 bg-pink-500 text-white font-black shadow-lg shadow-pink-500/20';
                      } else if (selectedGender === 'MALE') {
                        stateStyles = 'border border-blue-600 bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20';
                      } else {
                        stateStyles = 'border border-emerald-500 bg-emerald-500 text-slate-950 font-black';
                      }
                    } else if (isBooked) {
                      const isFemale = seat.gender === 'FEMALE' || seat.passengerId?.gender === 'FEMALE';
                      stateStyles = isFemale
                        ? 'border border-pink-500 bg-pink-500/15 text-pink-400 cursor-not-allowed opacity-75'
                        : 'border border-blue-500 bg-blue-500/15 text-blue-400 cursor-not-allowed opacity-75';
                    } else if (seat.status === 'HELD') {
                      stateStyles = 'border border-purple-500 bg-purple-500/15 text-purple-400 cursor-not-allowed opacity-75';
                    } else if (!isAvailable) {
                      stateStyles = 'border border-slate-800 bg-slate-900/40 text-slate-700 cursor-not-allowed opacity-40';
                    }
                    return stateStyles;
                  };

                  return (
                    <div key={rowName} className="flex justify-between items-center gap-4">
                      {isBackRow ? (
                        /* Back row has 5 seats with no center aisle */
                        <div className="flex gap-2.5 justify-center w-full">
                          {rowSeats.map((seat) => {
                            const isAvailable = seat.status === 'AVAILABLE';
                            const isSelected = selectedSeats.includes(seat.seatNumber);
                            const stateStyles = getSeatStyles(seat);

                            return (
                              <button
                                key={seat._id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={!isAvailable && !isSelected}
                                className={`h-11 w-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${stateStyles}`}
                                title={`Seat ${seat.seatNumber} (${seat.status})`}
                              >
                                <span className="text-xs">{seat.seatNumber}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Regular row has 4 seats divided by a center aisle */
                        <>
                          {/* Left Corridor Group (Columns A & B) */}
                          <div className="flex gap-3">
                            {rowSeats.slice(0, 2).map((seat) => {
                              const isAvailable = seat.status === 'AVAILABLE';
                              const isSelected = selectedSeats.includes(seat.seatNumber);
                              const stateStyles = getSeatStyles(seat);

                              return (
                                <button
                                  key={seat._id}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={!isAvailable && !isSelected}
                                  className={`h-11 w-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${stateStyles}`}
                                  title={`Seat ${seat.seatNumber} (${seat.status})`}
                                >
                                  <span className="text-xs">{seat.seatNumber}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Corridor Space */}
                          <div className="w-8 text-[8px] font-bold text-slate-700 text-center uppercase tracking-widest">
                            Aisle
                          </div>

                          {/* Right Corridor Group (Columns C & D) */}
                          <div className="flex gap-3">
                            {rowSeats.slice(2, 4).map((seat) => {
                              const isAvailable = seat.status === 'AVAILABLE';
                              const isSelected = selectedSeats.includes(seat.seatNumber);
                              const stateStyles = getSeatStyles(seat);

                              return (
                                <button
                                  key={seat._id}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={!isAvailable && !isSelected}
                                  className={`h-11 w-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${stateStyles}`}
                                  title={`Seat ${seat.seatNumber} (${seat.status})`}
                                >
                                  <span className="text-xs">{seat.seatNumber}</span>
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

              const gendersList = selectedSeats.map(sNum => seatGenders[sNum] || 'MALE');

              if (!user) {
                addToast('Please sign in as a passenger to confirm your seat booking.', 'info');
                navigate('/login', {
                  state: {
                    redirectTo: `/schedules/${scheduleId}/book?seats=${selectedSeats.join(',')}&seatIds=${ids.join(',')}&genders=${gendersList.join(',')}`
                  }
                });
                return;
              }

              navigate(`/schedules/${scheduleId}/book?seats=${selectedSeats.join(',')}&seatIds=${ids.join(',')}&genders=${gendersList.join(',')}`);
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

      {/* Gender Selection Modal */}
      {genderModalOpen && activeSeatForGender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-6 overflow-hidden animate-zoom-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-4 relative z-10">
              <h3 className="text-lg font-bold text-slate-200">Select Passenger Gender</h3>
              <p className="text-xs text-slate-450">
                Please select the gender for booking Seat <span className="font-extrabold text-emerald-400 text-sm font-mono">{activeSeatForGender.seatNumber}</span>.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleGenderSelect('MALE')}
                  className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 active:scale-95"
                >
                  <span className="text-xl">👨</span>
                  <span>Male</span>
                </button>
                <button
                  onClick={() => handleGenderSelect('FEMALE')}
                  className="py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-500/10 active:scale-95"
                >
                  <span className="text-xl">👩</span>
                  <span>Female</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setGenderModalOpen(false);
                  setActiveSeatForGender(null);
                }}
                className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
