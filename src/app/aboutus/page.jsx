'use client';
import React from 'react';
import { Container } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from 'react-bootstrap/Navbar';

const Aboutus = () => {
  const pathname = usePathname();
  return (
    <>
      {/* Full-width grey banner */}
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
          <h1>About Us</h1>
        </div>
      </div>
<br/>
      {/* Content section */}
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <p>
              The Pacific Ocean Portal is an online tool developed and maintained by the Climate and Oceans Support Program in the Pacific (COSPPac) and supported by the Australian and New Zealand Governments. The ocean portal provides access to historical, near real-time, and future ocean conditions, serving a wide array of ocean stakeholders across the Pacific region.
            </p>
            <br />
            <p>
              While the development of the Pacific Ocean Portal has been significantly supported by COSPPac, the Pacific Community extends its gratitude to the various data providers whose contributions have been instrumental in enabling access to their datasets through this platform. The collaboration with these data providers and projects ensures the delivery of oceanographic information for the region.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Aboutus;
