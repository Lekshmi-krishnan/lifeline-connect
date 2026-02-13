import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const RequestBlood = () => {
    const location = useLocation();
    const isEditMode = location.state?.isEditMode || false;
    const existingRequest = location.state?.request || null;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        patientName: existingRequest?.patientName || '',
        bloodGroup: existingRequest?.bloodGroup || '',
        units: existingRequest?.units || '',
        hospitalName: existingRequest?.hospitalName || '',
        city: existingRequest?.city || '',
        purpose: existingRequest?.purpose || '',
        contactPhone: existingRequest?.contactPhone || '',
        legalVerified: existingRequest?.legalVerified || false
    });

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode && existingRequest?.id) {
                const docRef = doc(db, "requests", existingRequest.id);
                await updateDoc(docRef, {
                    ...formData,
                    // Keep original createdAt and userEmail
                });
                alert("Blood Request Updated Successfully!");
            } else {
                await addDoc(collection(db, "requests"), {
                    ...formData,
                    status: 'active',
                    createdAt: serverTimestamp(),
                    userEmail: localStorage.getItem('userEmail') // Link to creator
                });
                alert("Blood Request Submitted Successfully!");
            }
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving request:", error);
            alert("Failed to save request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ paddingTop: '100px', minHeight: '100vh', alignItems: 'flex-start' }}>
            {/* Navbar reusing existing styles by structure or component if extracted. 
                For now, simple back link or just the form container centered. 
            */}
            <nav className="navbar">
                <Link to="/dashboard" className="logo">
                    <i className="fa-solid fa-heart-pulse"></i>
                    LifeLine<span>Connect</span>
                </Link>
                <div className="nav-links">
                    <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="auth-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="auth-header">
                    <h2>{isEditMode ? 'Update Request' : 'Request Blood'}</h2>
                    <p>{isEditMode ? 'Modify the details below.' : 'Provide details to find a donor immediately.'}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Left Column */}
                        <div>
                            <div className="form-group">
                                <label htmlFor="patientName">Patient Name</label>
                                <input type="text" id="patientName" className="form-control" required onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bloodGroup">Blood Group Needed</label>
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
                                <label htmlFor="units">Units Needed</label>
                                <input type="number" id="units" className="form-control" min="1" required onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="purpose">Purpose / Diagnosis</label>
                                <input type="text" id="purpose" className="form-control" placeholder="e.g. Surgery, Accident, Dengue" required onChange={handleChange} />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div className="form-group">
                                <label htmlFor="hospitalName">Hospital Name</label>
                                <input type="text" id="hospitalName" className="form-control" required onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">City (Hospital Location)</label>
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

                            <div className="form-group">
                                <label htmlFor="contactPhone">Contact Person Phone</label>
                                <input type="tel" id="contactPhone" className="form-control" placeholder="+91..." required onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem', border: '1px solid #ffeba7', padding: '1rem', borderRadius: '8px', background: '#fffcf5' }}>
                        <label style={{ fontWeight: 'bold', color: '#d97706' }}>Legal Verification</label>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>
                            By checking this box, I confirm that this is a genuine medical requirement and I serve as the point of contact.
                        </p>
                        <div className="checkbox-group" style={{ marginBottom: 0 }}>
                            <input type="checkbox" id="legalVerified" required onChange={handleChange} />
                            <label htmlFor="legalVerified" style={{ fontWeight: 600 }}>I verify the details are accurate.</label>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Request' : 'Post Request')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RequestBlood;
