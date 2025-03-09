'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/GlobalRedux/hooks';
import { Spinner } from 'react-bootstrap'; // Import Spinner from react-bootstrap

function Download({ height }) {
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const lastlayer = useRef('');
 
  // Effect to handle coordinate updates and API requests only when valid coordinates are present
  useEffect(() => {
      let url_map = mapLayer[mapLayer.length - 1]?.layer_information.url;
     // if (url_map){
      var newurl = url_map.replace('wms','dodsC')+ ".html";
      lastlayer.current = newurl;
    //  }

    
  }, [mapLayer]);

  

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: `${height}px`, padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
    <div style={{ marginBottom: '10px' }}>
      <p style={{ fontSize: '15px', margin: 0, color: '#333' }}>
        <strong>Dataset Name:</strong> {mapLayer[mapLayer.length - 1]?.layer_information.layer_title}
      </p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <p style={{ fontSize: '15px', margin: 0, color: '#333', marginRight: '10px' }}>
        <strong>OpenDAP Connector:</strong>
      </p>
      <input
        type="text"
        value={lastlayer.current}
        disabled
        style={{
          padding: '5px 10px',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#e9e9e9',  // Lighter gray for better contrast
          color: '#333',  // Darker font color for better visibility
          width: '80%'
        }}
      />
    </div>
     {/* Logos Section */}
     
  </div>
  <div style={{ display: 'flex', marginTop: '20px' }}>
  <img
    src="/oceanportal/python.jpg" // Replace with actual URL or path to your first logo
    alt="Logo 1"
    style={{
        marginTop:'-10px',
      width: '120px', // Adjust size as needed
      height: '55px',
      marginRight: '10px' // Optional: if you want some spacing between the logos
    }}
  />
  <img
    src="/oceanportal/xarray.png" // Replace with actual URL or path to your second logo
    alt="Logo 2"
    style={{
      width: '120px', // Adjust size as needed
      height: '30px',
    }}
  />
    <img
    src="/oceanportal/unidata.png" // Replace with actual URL or path to your second logo
    alt="Logo 3"
    style={{
      width: '120px', // Adjust size as needed
      height: '30px',
    }}
  />
</div>
</>
  
  
  
  );
}

export default Download;
