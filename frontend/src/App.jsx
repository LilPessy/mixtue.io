import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MixerRoom from './pages/MixerRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/mixer/:roomId" element={<MixerRoom />} />
        
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;