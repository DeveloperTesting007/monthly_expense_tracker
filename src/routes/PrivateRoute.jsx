import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
    const { currentUser, forceLogout } = useAuth();

    useEffect(() => {
        const checkTokenExpiry = async () => {
            if (currentUser) {
                try {
                    const token = await currentUser.getIdTokenResult();
                    const expirationTime = new Date(token.expirationTime).getTime();
                    const now = new Date().getTime();

                    if (expirationTime <= now) {
                        await forceLogout();
                    }
                } catch (error) {
                    console.error('Token check error:', error);
                    await forceLogout();
                }
            }
        };

        checkTokenExpiry();
    }, [currentUser, forceLogout]);

    return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;