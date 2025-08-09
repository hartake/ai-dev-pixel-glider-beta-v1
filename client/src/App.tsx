import { useEffect } from "react";

// Simple redirect component since we're using a Canvas-based game
function App() {
  useEffect(() => {
    // Redirect to the Canvas game
    window.location.href = '/';
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #FFE4B5 100%)',
      fontFamily: 'Press Start 2P, monospace',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ marginBottom: '1rem', textShadow: '2px 2px 0px #333' }}>
          🪶 Pixel Glider
        </h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          Loading Canvas Game...
        </p>
      </div>
    </div>
  );
}

export default App;
