import React from 'react';
import GameEngine from './components/GameEngine';

function App() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <GameEngine />
    </div>
  );
}

export default App;