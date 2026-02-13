
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [willingToDonate, setWillingToDonate] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [donorSearchQuery, setDonorSearchQuery] = useState("");
    const [requests, setRequests] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [donors, setDonors] = useState([]);

    useEffect(() => {
        const checkUser = async () => {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                try {
                    // 1. Fetch User Data
                    const docRef = doc(db, "users", userEmail);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser(userData);
                        setWillingToDonate(userData.willingToDonate || false);
                    }

                    // 2. Fetch Recent Requests (Active)
                    const q = query(
                        collection(db, "requests"),
                        where("status", "==", "active")
                    );
                    const querySnapshot = await getDocs(q);
                    const reqs = [];
                    querySnapshot.forEach((doc) => {
                        reqs.push({ id: doc.id, ...doc.data() });
                    });
                    setRequests(reqs);

                    // 3. Fetch My Requests
                    const myQ = query(
                        collection(db, "requests"),
                        where("userEmail", "==", userEmail)
                    );
                    const myQuerySnapshot = await getDocs(myQ);
                    const myReqs = [];
                    myQuerySnapshot.forEach((doc) => {
                        myReqs.push({ id: doc.id, ...doc.data() });
                    });
                    setMyRequests(myReqs);

                    // 4. Fetch Willing Donors
                    const donorsQ = query(
                        collection(db, "users"),
                        where("willingToDonate", "==", true)
                    );
                    const donorsSnapshot = await getDocs(donorsQ);
                    const donorList = [];
                    donorsSnapshot.forEach((doc) => {
                        donorList.push({ id: doc.id, ...doc.data() });
                    });
                    setDonors(donorList);

                } catch (e) {
                    console.error("Error fetching data", e);
                }
                setLoading(false);
            } else {
                navigate('/login');
            }
        };

        checkUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    const handleToggleDonate = async (e) => {
        const newValue = e.target.checked;
        setWillingToDonate(newValue);

        if (user) {
            try {
                const userEmail = localStorage.getItem('userEmail');
                const docRef = doc(db, "users", userEmail);
                await updateDoc(docRef, {
                    willingToDonate: newValue
                });
                // Refresh donors list locally if user toggles themselves
                if (newValue) {
                    setDonors(prev => {
                        // Avoid duplicates if user is somehow already there
                        if (prev.some(d => d.id === userEmail)) return prev;
                        return [...prev, { ...user, id: userEmail, willingToDonate: true }];
                    });
                } else {
                    setDonors(prev => prev.filter(d => d.id !== userEmail));
                }
                console.log("Database updated successfully: willingToDonate =", newValue);
            } catch (error) {
                console.error("Error updating status:", error);
                alert("Failed to update status. Please try again.");
                setWillingToDonate(!newValue);
            }
        }
    };

    const handleDeleteRequest = async (id) => {
        if (window.confirm("Are you sure you want to delete this request?")) {
            try {
                await deleteDoc(doc(db, "requests", id));
                setMyRequests(prev => prev.filter(req => req.id !== id));
                setRequests(prev => prev.filter(req => req.id !== id));
                alert("Request deleted successfully.");
            } catch (error) {
                console.error("Error deleting request:", error);
                alert("Failed to delete request.");
            }
        }
    };

    const handleEditRequest = (request) => {
        navigate('/request-blood', { state: { isEditMode: true, request } });
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    // Filter requests
    const filteredRequests = requests.filter(req =>
        req.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter donors
    const filteredDonors = donors.filter(d =>
        (d.city || "").toLowerCase().includes(donorSearchQuery.toLowerCase()) ||
        (d.bloodGroup || "").toLowerCase().includes(donorSearchQuery.toLowerCase()) ||
        (d.name || "").toLowerCase().includes(donorSearchQuery.toLowerCase())
    );

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <Link to="/" className="logo">
                    <i className="fa-solid fa-heart-pulse"></i>
                    LifeLine<span>Connect</span>
                </Link>
                <div className="nav-links">
                    <span style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>{user ? user.name : 'Welcome'}</span>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-container">
                <div className="welcome-banner">
                    <h1>Welcome back{user ? `, ${user.name} ` : ''}!</h1>
                    <p>Thank you for being part of our life-saving community.</p>
                </div>

                {/* My Requests Section */}
                {myRequests.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Your Active Requests</h2>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {myRequests.map(req => (
                                <div key={req.id} className="card" style={{ padding: '1.5rem', borderColor: '#e63946', position: 'relative', background: '#fff5f5' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ background: '#d62839', color: 'white', padding: '0.2rem 0.8rem', borderRadius: '20px', fontWeight: 'bold' }}>
                                            {req.bloodGroup} Needed
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#555', background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                            {req.status?.toUpperCase()}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{req.hospitalName}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                        <i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i> {req.city}
                                    </p>

                                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <div>
                                                <strong style={{ display: 'block', color: '#666', fontSize: '0.8rem' }}>Patient</strong>
                                                {req.patientName}
                                            </div>
                                            <div>
                                                <strong style={{ display: 'block', color: '#666', fontSize: '0.8rem' }}>Units</strong>
                                                {req.units}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEditRequest(req)}
                                            className="btn"
                                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', background: '#fff', border: '1px solid #ccc', color: '#333' }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRequest(req.id)}
                                            className="btn"
                                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', background: '#fff', border: '1px solid #e63946', color: '#e63946' }}
                                        >
                                            <i className="fa-solid fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="action-row">
                    <Link to="/request-blood" className="btn btn-primary">
                        <i className="fa-solid fa-plus-circle"></i> Request Blood
                    </Link>

                    <div className="toggle-container">
                        <span>Willing to Donate Now</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={willingToDonate}
                                onChange={handleToggleDonate}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa-solid fa-droplet"></i>
                        </div>
                        <div className="stat-info">
                            <h3>Your Blood Group</h3>
                            <p>{user ? user.bloodGroup : '--'}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div className="stat-info">
                            <h3>Location</h3>
                            <p>{user ? user.city : '--'}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa-solid fa-hand-holding-heart"></i>
                        </div>
                        <div className="stat-info">
                            <h3>Donations</h3>
                            <p>0</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

                    {/* Left Column: Recent Requests */}
                    <div className="requests-section">
                        <h2 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>Recent Requests</h2>
                        <div className="search-container" style={{ marginBottom: '1rem' }}>
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {filteredRequests.length === 0 ? (
                            <p style={{ color: '#666' }}>No active blood requests found.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {filteredRequests.map(req => (
                                    <div key={req.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid #e63946' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{req.hospitalName}</h4>
                                            <span style={{ background: '#ffebeb', color: '#d62839', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {req.bloodGroup}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.8rem', display: 'grid', gap: '0.3rem' }}>
                                            <div><i className="fa-solid fa-location-dot" style={{ width: '20px' }}></i> {req.city}</div>
                                            <div><i className="fa-solid fa-user-injured" style={{ width: '20px' }}></i> Patient: <strong>{req.patientName}</strong></div>
                                            <div><i className="fa-solid fa-droplet" style={{ width: '20px' }}></i> Units: <strong>{req.units}</strong></div>
                                            {req.purpose && (
                                                <div style={{ background: '#f9f9f9', padding: '0.5rem', borderRadius: '4px', marginTop: '0.3rem' }}>
                                                    <strong>Reason:</strong> {req.purpose}
                                                </div>
                                            )}
                                        </div>

                                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem', background: '#fff0f0', borderRadius: '4px', textAlign: 'center' }}>
                                            <i className="fa-solid fa-phone"></i> <strong>{req.contactPhone}</strong>
                                        </p>

                                        <a href={`tel:${req.contactPhone}`} className="btn btn-secondary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.9rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                                            <i className="fa-solid fa-phone"></i> Call Now
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Key Donors */}
                    <div className="donors-section">
                        <h2 style={{ marginBottom: '1rem', color: '#2ecc71' }}>Willing Donors</h2>
                        <div className="search-container" style={{ marginBottom: '1rem' }}>
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search donors..."
                                value={donorSearchQuery}
                                onChange={(e) => setDonorSearchQuery(e.target.value)}
                            />
                        </div>

                        {filteredDonors.length === 0 ? (
                            <p style={{ color: '#666' }}>No willing donors found at the moment.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {filteredDonors.map(donor => (
                                    <div key={donor.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid #2ecc71', background: donor.email === user?.email ? '#f0fff4' : 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                                                {donor.name} {donor.email === user?.email && <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>(You)</span>}
                                            </h4>
                                            <span style={{ background: '#e8f8f5', color: '#2ecc71', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {donor.bloodGroup}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                            <i className="fa-solid fa-location-dot"></i> {donor.city || 'Unknown City'}
                                        </p>

                                        <div style={{ marginTop: '0.8rem', fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>
                                            <i className="fa-solid fa-phone" style={{ color: '#2ecc71', marginRight: '5px' }}></i>
                                            {donor.phone || 'No Phone'}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                                            <a href={`mailto:${donor.email}`} className="btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.9rem', textAlign: 'center', background: '#f8f9fa', color: '#333', border: '1px solid #ddd', textDecoration: 'none', borderRadius: '4px' }}>
                                                <i className="fa-solid fa-envelope"></i> Email
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </>
    );
}

export default Dashboard;
