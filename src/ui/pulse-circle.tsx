import React from 'react';

export const PulseCircle: React.FC<PulseCircleProps> = (): JSX.Element => {
  return (
    <div
      className='green-pulse'
      style={ { marginLeft: 16 } }
    >
      <p></p>
    </div>
  );
};

export type PulseCircleProps = {};
