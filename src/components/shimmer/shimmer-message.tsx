import React, { FC } from "react";

interface ShimmerMessageProps {
  isAI: boolean; // Differentiate between AI and User messages
  width: string; // Width of the shimmer message
  height: string; // Height of the shimmer message
}

const ShimmerMessage: FC<ShimmerMessageProps> = ({ isAI, width, height }) => {
  return (
    <div
      className={`flex ${
        isAI ? "justify-start" : "justify-end"
      } w-full animate-pulse`}
    >
      <div
        className={`bg-gray-200 rounded-lg`}
        style={{
          width,
          height,
        }}
      />
    </div>
  );
};

export default ShimmerMessage;
