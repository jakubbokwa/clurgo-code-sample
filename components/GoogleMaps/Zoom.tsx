// @ts-nocheck
import React from "react";

const Zoom = ({
  className,
  style,
  onClick,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick: () => void;
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        ...style,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <g clipPath="url(#clip0_1992_1583)">
        <path
          d="M10.5234 18C14.6656 18 18.0234 14.6421 18.0234 10.5C18.0234 6.35786 14.6656 3 10.5234 3C6.3813 3 3.02344 6.35786 3.02344 10.5C3.02344 14.6421 6.3813 18 10.5234 18Z"
          stroke="#231F20"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.8281 15.8047L21.0247 21.0012"
          stroke="#231F20"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1992_1583">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0.0234375)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Zoom;
