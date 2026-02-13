import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initiateLogin, verifyAndCompleteAuth } from '../auth';

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('login'); // login | otp
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(null);
    const [otpInput, setOtpInput] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sentOtp = await initiateLogin(email);
            setOtpSent(sentOtp);
            setStep('otp');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        if (otpInput !== otpSent) {
            alert("Invalid OTP. Please try again.");
            setLoading(false);
            return;
        }

        try {
            await verifyAndCompleteAuth(email);
            navigate('/dashboard');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>{step === 'login' ? 'Welcome Back' : 'Verify Login'}</h2>
                    <p>{step === 'login' ? 'Login to your account.' : `Enter the code sent to ${email}`}</p>
                </div>

                {step === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="john@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Checking...' : 'Login'}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP sent to your email</label>
                            <input
                                type="text"
                                id="otp"
                                className="form-control"
                                placeholder="123456"
                                maxLength="6"
                                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem' }}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                            />
                        </div>
                        <button type="button" onClick={handleVerify} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </div>
                )}

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
