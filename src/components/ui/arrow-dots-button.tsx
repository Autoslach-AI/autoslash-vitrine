import React from 'react';

interface ArrowDotsButtonProps {
  text?: string;
  className?: string;
}

export const ArrowDotsButton: React.FC<ArrowDotsButtonProps> = ({ text = "Détails", className = "" }) => {
  // Function to generate dot elements for the icons
  const renderDots = () => {
    const dotValues = [2, 1, 0, 1, 2];
    return dotValues.map((value, index) => (
      <span 
        key={`dot-${index}`} 
        className="button05_dot"
        style={{ '--index': value } as React.CSSProperties} 
      ></span>
    ));
  };

  // Function to generate icon elements with dots
  const renderIcons = () => {
    return [3, 2, 1, 0].map((indexParent) => (
      <span 
        key={`icon-${indexParent}`} 
        className="button05_icon"
        style={{ '--index-parent': indexParent } as React.CSSProperties} 
      >
        {renderDots()}
      </span>
    ));
  };

  return (
    <div className={`button05_wrapper ${className}`}>
      <span className="button05_bg"></span>
      <span 
        data-text={text} 
        className="button05_inner"
      >
        <span className="button05_text">{text}</span>
        <span className="button05_icon-wrap">
          {renderIcons()}
        </span>
      </span>
    </div>
  );
};
