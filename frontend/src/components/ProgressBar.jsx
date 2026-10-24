import React from "react";

export default function ProgressBar({ currentStep, totalSteps, stepNames = [] }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-muted mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        {stepNames[currentStep - 1] && (
          <span className="text-mirror-blue font-bold">{stepNames[currentStep - 1]}</span>
        )}
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-mirror-blue to-lavender h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
