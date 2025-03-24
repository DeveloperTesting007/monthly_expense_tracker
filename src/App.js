import React, { useState } from 'react';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';

const App = () => {
    const [userId, setUserId] = useState(null);

    const handleSignupSuccess = (userId) => {
        setUserId(userId);
    };

    return (
        <div className="App">
            <h1>Monthly Expense Tracker</h1>
            {!userId ? (
                <SignupForm onSignupSuccess={handleSignupSuccess} />
            ) : (
                <Dashboard userId={userId} />
            )}
            {/* ...existing code... */}
        </div>
    );
};

export default App;