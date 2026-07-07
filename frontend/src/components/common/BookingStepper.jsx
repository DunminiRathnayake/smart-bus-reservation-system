import React from 'react';
import { Bus, Armchair, FileCheck, CreditCard, Ticket } from 'lucide-react';

/**
 * Progress stepper showing step updates during passenger booking.
 */
const BookingStepper = ({ currentStep = 1 }) => {
  const steps = [
    { label: 'Select Bus', icon: <Bus className="h-4 w-4 flex-shrink-0" /> },
    { label: 'Choose Seats', icon: <Armchair className="h-4 w-4 flex-shrink-0" /> },
    { label: 'Confirm Booking', icon: <FileCheck className="h-4 w-4 flex-shrink-0" /> },
    { label: 'Boarding Pass', icon: <Ticket className="h-4 w-4 flex-shrink-0" /> }
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-850 rounded-2xl p-4 flex justify-between items-center max-w-4xl mx-auto mb-6">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold hidden md:block ${
                  isActive ? 'text-emerald-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-grow h-[2px] mx-2 max-w-[20px] sm:max-w-[80px] rounded-full transition-all ${
                  isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BookingStepper;
