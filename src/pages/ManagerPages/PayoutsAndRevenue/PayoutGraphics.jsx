import React from 'react'

export function PayPalIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.738a.77.77 0 0 1 .76-.64h6.425c3.21 0 5.485 1.487 5.076 4.707-.468 3.684-2.88 5.753-6.02 5.753H8.38l-1.304 7.78z"
        fill="#003087"
      />
      <path
        d="M19.167 7.805c-.468 3.684-2.88 5.753-6.02 5.753H10.34l-1.304 7.779h-4.04l.013-.078L7.076 8.54a.77.77 0 0 1 .76-.64h3.805c3.21 0 5.485 1.487 5.076 4.707"
        fill="#0079C1"
      />
      <path
        d="M8.38 13.558h2.808c3.14 0 5.552-2.069 6.02-5.753.376-2.96-1.52-4.47-4.43-4.675a6.45 6.45 0 0 0-1.634-.132H5.704a.77.77 0 0 0-.76.64L2.837 16.357a.641.641 0 0 0 .633.74h3.606l1.304-3.539z"
        fill="#00457C"
        opacity="0.15"
      />
    </svg>
  )
}

export function ChipGraphic() {
  return (
    <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-0.5 shadow-inner border border-amber-400/40 relative overflow-hidden shrink-0">
      <div className="w-full h-full border border-amber-600/30 rounded-[3px] grid grid-cols-2 grid-rows-2 gap-0.5 opacity-70">
        <div className="border-r border-b border-amber-700/30" />
        <div className="border-b border-amber-700/30" />
        <div className="border-r border-amber-700/30" />
        <div />
      </div>
    </div>
  )
}
