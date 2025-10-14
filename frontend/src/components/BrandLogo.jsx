import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

/**
 * BrandLogo
 * Reusable FarmNex logo: a mint rounded tile with a green leaf.
 * Props:
 * - size: number (px) – tile size; default 32
 * - showText: boolean – optionally render “FarmNex” text to the right
 * - textClassName: string – classes for text
 * - className: string – wrapper classes
 */
const BrandLogo = ({ size = 32, showText = false, textClassName = 'text-brand font-bold', className = '' }) => {
  const tileStyle = { width: size, height: size, minWidth: size, minHeight: size };
  const iconSize = Math.max(12, Math.round(size * 0.55));
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className="rounded-lg bg-brand-light flex items-center justify-center shadow-sm"
        style={tileStyle}
        aria-label="FarmNex logo"
      >
        <FontAwesomeIcon icon={faLeaf} style={{ fontSize: iconSize, lineHeight: 1 }} className="text-brand" />
      </div>
      {showText && (
        <span className={`ml-2 ${textClassName}`}>FarmNex</span>
      )}
    </div>
  );
};

export default BrandLogo;
