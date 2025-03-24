import React, { useState } from 'react';
import { signup, signupWithGoogle } from '../services/authService';

const SignupForm = ({ onSignupSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileData, setProfileData] = useState({ name: '', age: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const user = await signup(email, password, profileData);
            onSignupSuccess(user.uid);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');

        try {
            const user = await signupWithGoogle();
            onSignupSuccess(user.uid);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label>Email:</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>Password:</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>Name:</label>
                <input 
                    type="text" 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <div>
                <label>Age:</label>
                <input 
                    type="number" 
                    name="age" 
                    value={profileData.age} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sign Up</button>
            <button type="button" onClick={handleGoogleSignup}>Sign Up with Google</button>
        </form>
    );
};

export default SignupForm;
