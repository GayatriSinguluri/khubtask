import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css/animate.min.css';
import { FaUser, FaLock } from 'react-icons/fa';
import './LoginPage.css'; // Import the CSS file

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });

            const { access_token, username: returnedUsername } = response.data;

            localStorage.setItem('token', access_token);
            setSuccess(`Welcome, ${returnedUsername}!`);
            setError('');
            window.location.href = '/notes';
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'An error occurred');
            setSuccess('');
        }
    };

    return (
        <div className="container animate__animated animate__fadeIn">
            <div className="card shadow-lg">
                <div className="card-body">
                    <h2 className="card-title">Log In</h2>
                    {error && <p className="text-danger">{error}</p>}
                    {success && <p className="text-success">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">
                                <FaUser /> Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <FaLock /> Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-control"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Log In</button>
                    </form>
                    <p className="mt-3">
                        Don't have an account? <a href="/register">Register here</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
