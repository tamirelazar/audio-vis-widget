import { Suspense } from 'react';
import { useRoutes, Navigate, Route, Routes } from 'react-router-dom';
import EnhancedColorVisualizer from './components/EnhancedColorVisualizer'; // Import the visualizer

function App() {
  const element = useRoutes([
    // Redirect from the root path to /audio-vis
    { path: '/', element: <Navigate to="/audio-vis" replace /> },
    // Route for the audio visualizer
    { path: '/audio-vis', element: <EnhancedColorVisualizer /> },
    // ... other routes you might have
  ]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {element}
    </Suspense>
  );
}

export default App;