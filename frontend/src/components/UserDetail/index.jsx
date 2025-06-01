import React, { useEffect, useState } from "react";
import { Typography, Button } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchModel(`/api/user/${userId}`);
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('User not found');
      }
    };
    fetchUser();
  }, [userId]);

  if (error) {
    return <Typography>{error}</Typography>;
  }

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography>Location: {user.location}</Typography>
      <Typography>Description: {user.description}</Typography>
      <Typography>Occupation: {user.occupation}</Typography>
      <Button
        component={Link}
        to={`/photos/${userId}`}
        variant="contained"
        color="primary"
        style={{ marginTop: "10px" }}
      >
        View Photos
      </Button>
    </div>
  );
}

export default UserDetail;
