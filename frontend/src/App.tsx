import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

import MainPage from './pages/MainPage';
import BookDetailsPage from './pages/BookDetailsPage';
import BookCreatePage from './pages/BookCreatePage';
import BookEditPage from './pages/BookEditPage';

function App() {
  return (
    <Router>
      <div className="container mx-auto pt-4">
        <Routes>
          <Route path={'/'} element={<MainPage/>} />
          <Route path={'/book/:id'} element={<BookDetailsPage />} />
          <Route path={'/book/add'} element={<BookCreatePage />} /> 
          <Route path={'/book/edit/:id'} element={<BookEditPage />} />  
        </Routes>
      </div>
    </Router>
  );
}

export default App;
