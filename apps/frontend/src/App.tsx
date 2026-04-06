import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@www/components/userPanel/dashboard/Dashboard";
import FileViewerPage from "@www/components/userPanel/knowledgeBase/FileViewerPage";
import PageLayout from "@www/components/userPanel/knowledgeBase/PageLayout";
import SearchPage from "@www/components/userPanel/search/SearchPage";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/page-layout/:id" element={<PageLayout />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/file/:fileId" element={<FileViewerPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
