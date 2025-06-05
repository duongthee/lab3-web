import React, { useState } from 'react';
import './LoginRegister.css';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginRegister() {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage('');
    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login_name: loginName, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        // Store the token in the user data
        const userData = {
          ...data,
          token: data.token // Make sure the token is included
        };
        login(userData); // Pass the user data with token to the login function
        navigate(`/users/${data._id}`);
      } else {
        console.error('Login failed:', data.error);
        setMessage(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Error during login.');
    }
  };

  const handleRegister = async () => {
    console.log('handleRegister called');
    setMessage('');
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    // Basic client-side validation (backend also validates)
    if (!loginName || !password || !first_name || !last_name) {
        setMessage('Please fill in all required fields (Login Name, Password, First Name, Last Name).');
        return;
    }

    console.log('Attempting to register user with data:', { loginName, first_name, last_name, location, description, occupation }); // Log data being sent, including all fields

    try {
      console.log('Sending POST request to /api/user'); // Indicate the fetch call is about to happen
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            login_name: loginName, 
            password: password, 
            first_name: first_name, 
            last_name: last_name, 
            location: location, 
            description: description, 
            occupation: occupation 
        }),
      });

      console.log('Registration API response status:', response.status); // Log response status
      const data = await response.json();
      console.log('Registration API response data:', data); // Log response data

      if (response.ok) {
        console.log('Registration successful:', data);
        // Display success message using alert for now
        alert('Registration successful! You can now log in.');
        setMessage('Registration successful! You can now log in.'); // Keep message for display in component
        // Optionally clear the form fields
        setLoginName('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setLocation('');
        setDescription('');
        setOccupation('');
        setIsLogin(true); // Switch back to login view
      } else {
        console.error('Registration failed:', data.error);
        // Display failure message using alert for now
        alert(`Registration failed: ${data.error}`);
        setMessage(`Registration failed: ${data.error}`); // Keep message for display in component
      }
    } catch (error) {
      console.error('Error during registration:', error);
      // Display error message using alert for now
      alert('An error occurred during registration.');
      setMessage('Error during registration.'); // Keep message for display in component
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('handleSubmit called');
    if (isLogin) {
      handleLogin();
    } else {
      console.log('Calling handleRegister');
      handleRegister();
    }
  };

  return (
    <div className="login-register-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginName">Login Name:</label>
          <input
            type="text"
            id="loginName"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        {!isLogin && (
          <>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="occupation">Occupation:</label>
              <input
                type="text"
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      {message && <p className="message">{message}</p>}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
}

export default LoginRegister; 