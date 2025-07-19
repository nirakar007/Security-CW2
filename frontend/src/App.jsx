import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="bg-gray-800 text-white min-h-screen">
        {/* A Navbar component will go here later */}
        <main className="container mx-auto p-4">
          <Routes>
            {/* Routes for pages will be defined here later */}
            <Route path="/" element={<h1 className="text-3xl">Welcome to SecureSend</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;