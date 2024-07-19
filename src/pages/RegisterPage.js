import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css/animate.min.css';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import './RegisterPage.css'; // Import the CSS file

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/register', {
                username,
                email,
                password
            });

            setSuccess('Registration Successful! You can now log in.');
            setError('');
            setUsername('');
            setEmail('');
            setPassword('');
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'An error occurred');
            setSuccess('');
        }
    };

    return (
        <div className="container mt-5 animate__animated animate__fadeIn">
            <div className="card shadow-lg">
                <div className="card-body">
                    <h2 className="card-title">Register</h2>
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
                                minLength={4}
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <FaEnvelope /> Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                minLength={8}
                                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                className="form-control"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Register</button>
                    </form>
                    <p className="mt-3">
                        Already have an account? <a href="/login">Log in here</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
