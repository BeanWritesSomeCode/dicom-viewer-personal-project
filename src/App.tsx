import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import StudyBrowser from './pages/StudyBrowser';
import './components/styles.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<StudyBrowser />} />
        <Route path="/viewer" element={<MainPage />} />
      </Routes>
    </>
  );
}

export default App;
