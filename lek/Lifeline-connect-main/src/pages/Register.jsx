import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initiateRegister, verifyAndCompleteAuth } from '../auth';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('register'); // register | otp
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(null); // The actual OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        weight: '',
        bloodGroup: '',
        city: '',
        agreement: false
    });
    const [otpInput, setOtpInput] = useState('');

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const sentOtp = await initiateRegister(formData);
            setOtpSent(sentOtp);
            setStep('otp');
            // Assuming initiateRegister throws if user exists
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
            await verifyAndCompleteAuth(formData.email, formData);
            alert("Registration Successful!");
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
                    <h2>{step === 'register' ? 'Join LifeLine Connect' : 'Verify Email'}</h2>
                    <p>{step === 'register' ? 'Create an account to start saving lives.' : `We sent a code to ${formData.email}`}</p>
                </div>

                {step === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" className="form-control" placeholder="John Doe" required onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" className="form-control" placeholder="john@example.com" required onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" className="form-control" placeholder="+91 9876543210" required onChange={handleChange} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="age">Age</label>
                                <input type="number" id="age" className="form-control" min="18" placeholder="Age" required onChange={handleChange} />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="weight">Weight (kg)</label>
                                <input type="number" id="weight" className="form-control" min="45" placeholder="Weight" required onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="bloodGroup">Blood Group</label>
                            <select id="bloodGroup" className="form-control" required onChange={handleChange} defaultValue="">
                                <option value="" disabled>Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City (Kerala)</label>
                            <select id="city" className="form-control" required onChange={handleChange} defaultValue="">
                                <option value="" disabled>Select City</option>
                                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                <option value="Kollam">Kollam</option>
                                <option value="Pathanamthitta">Pathanamthitta</option>
                                <option value="Alappuzha">Alappuzha</option>
                                <option value="Kottayam">Kottayam</option>
                                <option value="Idukki">Idukki</option>
                                <option value="Ernakulam">Ernakulam</option>
                                <option value="Thrissur">Thrissur</option>
                                <option value="Palakkad">Palakkad</option>
                                <option value="Malappuram">Malappuram</option>
                                <option value="Kozhikode">Kozhikode</option>
                                <option value="Wayanad">Wayanad</option>
                                <option value="Kannur">Kannur</option>
                                <option value="Kasaragod">Kasaragod</option>
                            </select>
                        </div>

                        <div className="checkbox-group">
                            <input type="checkbox" id="agreement" required onChange={handleChange} />
                            <label htmlFor="agreement">I agree to the <a href="#">Terms and Conditions</a></label>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Register'}
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
                            {loading ? 'Verifying...' : 'Verify & Complete'}
                        </button>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>Didn't receive code? <a href="#" onClick={() => alert("Resend logic here")}>Resend</a></p>
                    </div>
                )}

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
