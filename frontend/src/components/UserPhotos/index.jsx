import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Link as MuiLink,
  TextField,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import fetchModel from "../../lib/fetchModelData";
import { useAuth } from '../../lib/AuthContext';

import "./styles.css";

/**
 * UserPhotos – hiển thị toàn bộ ảnh + comment của một user
 * Ảnh nằm trong src/images/ => dùng require để Webpack đóng gói
 */
function UserPhotos({ photoUploadTrigger }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});
  const { user: loggedInUser } = useAuth();

  const fetchPhotos = async () => {
    try {
      const photosData = await fetchModel(`/api/photo/photosOfUser/${userId}`);
      console.log('Fetched photos data:', photosData);
      setPhotos(photosData);
      const initialCommentText = {};
      photosData.forEach(photo => { initialCommentText[photo._id] = ''; });
      setNewCommentText(initialCommentText);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError('Failed to load photos');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
           const userData = await fetchModel(`/api/user/${userId}`);
           setUser(userData);
        }
        fetchPhotos();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      }
    };
    fetchData();
  }, [userId, user, photoUploadTrigger]);

  const handleCommentChange = (photoId, text) => {
    setNewCommentText(prevState => ({ ...prevState, [photoId]: text }));
  };

  const handleAddComment = async (photoId) => {
    const comment = newCommentText[photoId].trim();
    if (!comment) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`/api/comment/commentsOfPhoto/${photoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment }),
      });

      if (response.ok) {
        console.log('Comment added successfully');
        setNewCommentText(prevState => ({ ...prevState, [photoId]: '' }));
        fetchPhotos();
      } else {
        const errorData = await response.json();
        console.error('Error adding comment:', errorData.error);
        alert(`Failed to add comment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('An error occurred while adding the comment.');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(`/api/photo/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Photo deleted successfully');
        // Trigger photo list refresh
        fetchPhotos();
      } else {
        const errorData = await response.json();
        console.error('Error deleting photo:', errorData.error);
        alert(`Failed to delete photo: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('An error occurred during photo deletion.');
    }
  };

  if (error) {
    return <Typography>{error}</Typography>;
  }

  if (!user || !photos) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Photos of {user.first_name} {user.last_name}
      </Typography>

      <Grid container spacing={2}>
        {photos.length > 0 ? (
          photos.map((photo) => {
            // Construct the image URL using the backend address and /images prefix
            const imgSrc = `http://localhost:8081/images/${photo.file_name}`;

            return (
              <Grid item key={photo._id} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={imgSrc}
                    alt={photo.file_name}
                  />

                  <CardHeader
                    title={format(new Date(photo.date_time), "PPpp")}
                    sx={{
                      py: 1,
                      "& .MuiCardHeader-content": { overflow: "hidden" },
                    }}
                  />

                  <CardContent sx={{ pt: 0 }}>
                    {photo.comments?.length ? (
                      photo.comments.map((c) => (
                        <Typography variant="body2" key={c._id} sx={{ mb: 1 }}>
                          {c.user ? (
                            <MuiLink
                              component={RouterLink}
                              to={`/users/${c.user._id}`}
                              underline="hover"
                            >
                              <strong>
                                {c.user.first_name} {c.user.last_name}
                              </strong>
                            </MuiLink>
                          ) : (
                            <strong>Unknown User</strong>
                          )}
                          : {c.comment}
                          <br />
                          <small>{format(new Date(c.date_time), "PPpp")}</small>
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No comments yet.
                      </Typography>
                    )}

                    {loggedInUser && (
                      <div className="add-comment-section">
                        <input
                          type="text"
                          placeholder="Add a comment"
                          value={newCommentText[photo._id] || ''}
                          onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                          style={{ marginTop: 8, marginBottom: 8, width: '70%' }}
                        />
                        <button
                          onClick={() => handleAddComment(photo._id)}
                          disabled={!newCommentText[photo._id] || newCommentText[photo._id].trim() === ''}
                          style={{ 
                            marginLeft: 8,
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            backgroundColor: '#e0e0e0',
                            color: '#424242',
                            border: '1px solid #bdbdbd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d0d0d0'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                        >
                          Add Comment
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Typography variant="body1" color="textSecondary">
            No photos available for this user.
          </Typography>
        )}
      </Grid>
    </div>
  );
}

export default UserPhotos;
