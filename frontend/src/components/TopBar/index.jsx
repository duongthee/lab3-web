import React, { useEffect, useState, useRef } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import { useAuth } from '../../lib/AuthContext';

function TopBar({ onPhotoUpload }) {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTitle = async () => {
      if (location.pathname.startsWith("/users/")) {
        const userId = location.pathname.split("/")[2];
        try {
          const userDetail = await fetchModel(`/api/user/${userId}`);
          if (isMounted && userDetail) {
            setTitle(`${userDetail.first_name} ${userDetail.last_name}`);
          }
        } catch {
          if (isMounted) setTitle("");
        }
      } else if (location.pathname.startsWith("/photos/")) {
        const userId = location.pathname.split("/")[2];
        try {
          const userDetail = await fetchModel(`/api/user/${userId}`);
          if (isMounted && userDetail) {
            setTitle(`Photos of ${userDetail.first_name} ${userDetail.last_name}`);
          }
        } catch {
          if (isMounted) setTitle("");
        }
      } else if (location.pathname === "/users") {
        setTitle("User List");
      } else {
        setTitle("");
      }
    };
    // Only fetch title if user is logged in
    if (user) {
      fetchTitle();
    }

    return () => { isMounted = false; };
  }, [location, user]); // Added user as a dependency

  const handleLogout = async () => {
    try {
      await fetch('/admin/logout', { method: 'POST' });
      logout(); // Update context state
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('/api/photo/photos/new', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Photo uploaded successfully');
        if (user && location.pathname === `/photos/${user._id}`) {
          onPhotoUpload();
        }
      } else {
        const errorData = await response.json();
        console.error('Error uploading photo:', errorData.error);
        alert(`Failed to upload photo: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('An error occurred during photo upload.');
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          Mai Thế Dương
        </Typography>
        <Typography variant="h6" color="inherit" style={{ marginLeft: "auto" }}>
          {user ? `Hi ${user.first_name}` : "Please Login"}
        </Typography>
        {user && (
          <>
            <Button color="inherit" onClick={handleAddPhotoClick} style={{ marginLeft: "10px" }}>
              Add Photo
            </Button>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
            <Button color="inherit" onClick={handleLogout} style={{ marginLeft: "10px" }}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
