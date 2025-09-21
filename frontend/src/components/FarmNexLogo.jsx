import React from 'react';

const FarmNexLogo = ({ 
  size = 40, 
  className = "", 
  showBackground = false, 
  color = "#16a34a" // Default green color
}) => {
  const viewBoxSize = 100;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
      >
        {showBackground && (
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="white"
            stroke={color}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
        )}
        
        {/* Simple leaf shape with curved stem */}
        <path
          d="M25,80 Q30,75 35,70 Q40,60 50,45 Q60,30 70,25 Q80,20 85,25 Q90,30 85,40 Q80,50 70,60 Q60,70 50,75 Q40,80 30,85 Q25,85 25,80 Z"
          fill={color}
          className="drop-shadow-sm"
        />
        
        {/* Curved stem */}
        <path
          d="M25,80 Q20,85 15,90"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Central vein */}
        <path
          d="M32,75 Q42,65 55,50 Q68,35 78,28"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default FarmNexLogo;