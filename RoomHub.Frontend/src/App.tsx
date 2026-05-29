import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import RoomDetail from './pages/RoomDetail';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'browse' | 'detail'>('home');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-grow">
        {currentPage === 'home' ? (
          <Home setCurrentPage={setCurrentPage} setSelectedRoomId={setSelectedRoomId} />
        ) : currentPage === 'browse' ? (
          <Browse setCurrentPage={setCurrentPage} setSelectedRoomId={setSelectedRoomId} />
        ) : (
          <RoomDetail 
            selectedRoomId={selectedRoomId} 
            setCurrentPage={setCurrentPage} 
            setSelectedRoomId={setSelectedRoomId} 
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default App;
