
import { HashRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Architecture from './pages/Architecture';
import Frontend from './pages/Frontend';
import Backend from './pages/Backend';
import Contact from './pages/Contact';

export default function App() {
  return (
    <HashRouter>
      <Toaster position="top-center" richColors theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/frontend" element={<Frontend />} />
        <Route path="/backend" element={<Backend />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}
