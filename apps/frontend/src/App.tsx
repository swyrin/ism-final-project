import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthPage from "@www/components/auth/AuthPage";
import RequireAuth from "@www/components/auth/RequireAuth";
import ProfilePage from "@www/components/profile/ProfilePage";
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
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/page-layout/:id"
            element={
              <RequireAuth>
                <PageLayout />
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <SearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/file/:fileId"
            element={
              <RequireAuth>
                <FileViewerPage />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
