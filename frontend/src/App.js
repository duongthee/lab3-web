import "./App.css";

import React, { useState } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister/LoginRegister";

import { useAuth } from './lib/AuthContext';

const App = (props) => {
  const { user } = useAuth();
  const [photoUploadTrigger, setPhotoUploadTrigger] = useState(0);

  const triggerPhotoRefresh = () => {
    setPhotoUploadTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar onPhotoUpload={triggerPhotoRefresh} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            {/* Only show UserList if user is logged in */}
            {user ? (
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            ) : (
              <Paper className="main-grid-item">
                <Typography variant="h6">Please Login</Typography>
              </Paper>
            )}
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                {/* Protected routes */}
                {user ? (
                  <>
                    <Route path="/users/:userId" element={<UserDetail />} />
                    <Route path="/photos/:userId" element={<UserPhotos photoUploadTrigger={photoUploadTrigger} />} />
                    <Route path="/users" element={<UserList />} />
                    {/* Redirect to user detail after login (can be adjusted) */}
                    <Route
                      path="*"
                      element={<Navigate to={`/users/${user._id}`} replace />}
                    />
                  </>
                ) : (
                  /* Redirect to login if not logged in */
                  <Route path="*" element={<LoginRegister />} />
                )}
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Router>
  );
};

export default App;
