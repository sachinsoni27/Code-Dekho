import React from 'react';

const Grid = ({ activeCell, visitedCells }) => {
  const size = 4;

  return (
    <div className="grid-board">
      <div className="grid-container" style={{
        display: 'grid',
        gridTemplateColumns: `40px repeat(${size}, 40px)`,
        gridTemplateRows: `30px repeat(${size}, 40px)`,
        gap: '2px',
        justifyContent: 'center'
      }}>
        {/* Top-left corner empty cell */}
        <div></div>
        {/* Column headers */}
        {Array.from({length: size}, (_, i) => (
          <div key={`col-${i}`} className="col-label">{i}</div>
        ))}

        {/* Grid rows with row labels */}
        {Array.from({length: size}, (_, row) => (
          <React.Fragment key={`row-${row}`}>
            <div className="row-label">{row}</div>
            {Array.from({length: size}, (_, col) => {
              const isActive = activeCell && activeCell.row === row && activeCell.col === col;
              const isVisited = visitedCells.some(cell => cell.row === row && cell.col === col);
              return (
                <div
                  key={`${row}-${col}`}
                  className={`grid-cell ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}`}
                >
                  {row},{col}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* SVG path overlay */}
      {visitedCells.length > 1 && (
        <svg className="grid-path" style={{
          position: 'absolute', top: '30px', left: '42px',
          width: `${size * 42}px`, height: `${size * 42}px`,
          pointerEvents: 'none'
        }}>
          <polyline
            points={visitedCells.map(cell => `${cell.col * 42 + 20},${cell.row * 42 + 20}`).join(' ')}
            fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.6"
          />
          {visitedCells.map((cell, index) => (
            <circle key={index} cx={cell.col * 42 + 20} cy={cell.row * 42 + 20} r="4" fill="#22c55e" />
          ))}
        </svg>
      )}
    </div>
  );
};

export default Grid;