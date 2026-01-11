'use client';

import type { InputFieldsProps } from './types';

export default function InputFields({
  inputs,
  currentValues,
  onValueChange,
}: InputFieldsProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-5">
      {inputs.map((input) => (
        <div key={input.key}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              {input.label}
              {input.tooltip && (
                <span className="group relative cursor-help">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {input.tooltip}
                  </span>
                </span>
              )}
            </label>
            <span className="text-sm font-semibold text-sky-600">
              {currentValues[input.key]} {input.unit}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={currentValues[input.key]}
              onChange={(e) => onValueChange(input.key, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-sky-500"
            />
            <input
              type="number"
              min={input.min}
              max={input.max}
              step={input.step}
              value={currentValues[input.key]}
              onChange={(e) => onValueChange(input.key, parseFloat(e.target.value) || input.min)}
              className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
