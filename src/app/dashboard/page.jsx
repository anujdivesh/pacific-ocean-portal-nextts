'use client';
import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import '@/components/css/card.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/app/GlobalRedux/hooks'

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pathname = usePathname();
    const token = useAppSelector((state) => state.auth.token);
    // Replace with your actual Bearer token
    //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxNjYxNjY0LCJpYXQiOjE3NDE1NzUyNjQsImp0aSI6IjhhMWQ3YzNhYjZlMTRiMWM5ZDg4NzQ3YzRkYmQ0ZTQzIiwidXNlcl9pZCI6M30.QNgybs_mWgogVOawlAHxYt5GL5lPNn-LPEGpnZUv1vE'; 

    useEffect(() => {
        // Fetch data from API when the component mounts

        
        const fetchProjects = async () => {
            try {
                const accountResponse = await fetch("https://dev-oceanportal.spc.int/middleware/api/account/", {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  const accountData = await accountResponse.json();
                  let countryId = "";
                  
                      if (Array.isArray(accountData) && accountData.length > 0) {
                         countryId = accountData[0].country.id;
                      }

                  
                const response = await fetch('https://dev-oceanportal.spc.int/middleware/api/dashboard/?country_id='+countryId+'&format=json', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                setProjects(data); // Set the fetched data
                setLoading(false); // Set loading state to false when data is fetched
            } catch (err) {
                setError(err.message); // Handle errors
                setLoading(false);
            }
        };

        fetchProjects();
    }, [token]); // Empty dependency array to run once when component mounts

    if (loading) {
        return <div>Loading...</div>; // Show loading text or spinner while fetching
    }

    if (error) {
        return <div>Error: {error}</div>; // Show error message if there's an error
    }

    return (
        <main id="bodyWrapper">
            <div id="mapWrapper">
                <div id="map33">
                    <div className="sign-in__wrapper">
                        <Container>
                        <div style={{
        backgroundColor: '#f8f9fa',
        width: '100vw', // Use viewport width to ensure full width
        marginLeft: '-50vw', // Offset to account for default body padding/margin
        left: '50%', // Center the div
        position: 'relative', // Ensure proper positioning
        padding: '40px 0', // Add more padding to make it taller
        textAlign: 'center', // Center the text horizontally
        display: 'flex', // Use flexbox to center vertically
        justifyContent: 'center', // Horizontally center the content
        alignItems: 'center' // Vertically center the content
      }}>
        <div style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h1>Dashboard Collections</h1>
        </div>
      </div>

                            <div className="row">
                                {projects.map(card => (
                                    <div key={card.id} className="col-sm-4 col-md-3 mb-4" style={{ paddingTop: 20 }}>
                                        {/* Card Wrapper */}
                                        <div className="card h-90">
                                            <div className="card-img-container">
                                                <img
                                                    src={card.display_image_url}
                                                    className="card-img-top"
                                                    alt={card.display_title}
                                                    style={{
                                                        objectFit: "cover", // Ensures the image fits the top without stretching
                                                        height: "180px", // Fixes the height of the image to 200px
                                                    }}
                                                />
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {card.display_title}
                                                </h5>
                                                <p className="card-text">
                                                    <strong>Maintainer:</strong> {card.maintainer} <br />
                                                    <strong>Country:</strong> {card.country.long_name} ({card.country.short_name})
                                                </p>
                                                {/* Link Button */}
                                                <Link href={card.access_url} passHref>
                                                    <Button variant="primary" className="mt-auto" style={{ borderRadius: 0 }} >
                                                        <FaEye style={{ marginRight: '5px', marginBottom: '1px' }} />
                                                        Explore Dashboard
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
