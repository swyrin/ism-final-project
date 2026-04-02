// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/userPanel/dashboard/Dashboard';  // Import Dashboard
import PageLayout from './components/userPanel/knowledgeBase/PageLayout';  // Import PageLayout
import SearchPage from './components/userPanel/search/SearchPage';
import FileViewerPage from './components/userPanel/knowledgeBase/FileViewerPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Điều hướng tới Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Điều hướng tới trang PageLayout cho mỗi tài liệu */}
        <Route path="/page-layout/:id" element={<PageLayout />} />

        {/* Search page route */}
        <Route path="/search" element={<SearchPage />} />

        {/* File viewer route */}
        <Route path="/file/:fileId" element={<FileViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;