import React from 'react';

export const Grid = ({}: GridProps): JSX.Element => (
  <>
    <div
      style={ {
        display: 'grid',
        gridTemplateRows: '1fr 1fr auto',
        height: '100%',
      } }
    >
      <div
        style={ {
          backgroundColor: 'red',
          height: '100px',
          position: 'sticky',
          top: 0,
        } }
      >
        <p>First row</p>
      </div>
      <div
        style={ {
          backgroundColor: 'green',
          height: '100px',
          position: 'sticky',
          top: '100px',
        } }
      >
        <p>Second row</p>
      </div>
      <div
        style={ {
          backgroundColor: 'blue',
          overflow: 'auto',
        } }
      >
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        <p>Third row</p>
        {/* this is enough rows */}
      </div>
    </div>
  </>
);

export type GridProps = {};
