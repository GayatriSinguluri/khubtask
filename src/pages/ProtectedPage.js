import React from 'react';

const ProtectedPage = () => {
    // Handle logout
    const handleLogout = () => {
        // Remove the token from local storage
        localStorage.removeItem('token');
        // Redirect to the login page
        window.location.href = '/login';
    };

    return (
        <div style={{ margin: '0 auto', maxWidth: '600px', padding: '1em', textAlign: 'center' }}>
            <h2>Protected Page</h2>
            <p>You are viewing a protected page. Only logged-in users can see this content.</p>
            <button onClick={handleLogout} style={{ padding: '0.5em 1em', cursor: 'pointer' }}>
                Log Out
            </button>
            <br />
            <a href="/notes" style={{ display: 'block', marginTop: '1em', color: 'blue', textDecoration: 'underline' }}>
                Go to Notes Page
            </a>
        </div>
    );
};

export default ProtectedPage;
