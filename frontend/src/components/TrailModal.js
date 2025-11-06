import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrailModal = ({ isOpen, onClose, trailId }) => {
    const [trail, setTrail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && trailId) {
            setLoading(true);
            axios.get(`/api/trails/${trailId}`)
                .then(response => {
                    setTrail(response.data.trail);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching trail details:', error);
                    setLoading(false);
                });
        }
    }, [isOpen, trailId]);

    if (!isOpen) return null;

    // Difficulty color mapping
    const getDifficultyColor = (difficulty) => {
        const colors = {
            1: '#28a745',
            2: '#ffc107',
            3: '#fd7e14',
            4: '#dc3545',
        };
        return colors[difficulty] || '#28a745';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-in',
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.3s ease-out',
            }} onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose} 
                    style={{ 
                        float: 'right',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        fontSize: '18px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        color: '#666',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e0e0e0';
                        e.currentTarget.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.color = '#666';
                    }}
                >
                    ×
                </button>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Loading trail details...</p>
                    </div>
                ) : trail ? (
                    <div>
                        <h2 style={{ 
                            color: '#2c5f2d', 
                            marginTop: '0',
                            fontSize: '28px',
                            marginBottom: '20px'
                        }}>
                            {trail.name}
                        </h2>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '20px',
                        }}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>📍 Location</p>
                                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                                    {trail.location}
                                </p>
                            </div>
                            
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>⚡ Difficulty</p>
                                <p style={{ 
                                    margin: '4px 0 0 0', 
                                    fontWeight: 'bold', 
                                    fontSize: '16px',
                                    color: getDifficultyColor(trail.difficulty)
                                }}>
                                    {trail.difficulty_text}
                                </p>
                            </div>
                            
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>🥾 Length</p>
                                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                                    {trail.length_miles} miles
                                </p>
                            </div>
                            
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                            }}>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>⛰️ Elevation Gain</p>
                                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                                    {trail.elevation_gain_ft} feet
                                </p>
                            </div>
                        </div>
                        
                        <div style={{
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#f0f7f0',
                            borderRadius: '8px',
                            borderLeft: '4px solid #2c5f2d',
                        }}>
                            <h3 style={{ marginTop: 0, color: '#2c5f2d', fontSize: '18px' }}>
                                Description
                            </h3>
                            <p style={{ margin: 0, lineHeight: '1.6', color: '#333' }}>
                                {trail.description}
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{ color: '#2c5f2d', fontSize: '18px', marginBottom: '12px' }}>
                                🎒 What to Bring
                            </h3>
                            <ul style={{
                                listStyleType: 'none',
                                padding: 0,
                                margin: 0,
                            }}>
                                {trail.necessity_list && trail.necessity_list.map((item, index) => (
                                    <li key={index} style={{
                                        padding: '8px 12px',
                                        marginBottom: '6px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                        <span style={{ 
                                            marginRight: '10px',
                                            color: '#28a745',
                                            fontWeight: 'bold',
                                        }}>
                                            ✓
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#dc3545' }}>Error loading trail details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrailModal;
