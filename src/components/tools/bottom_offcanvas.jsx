'use client';
import React, { useState, useRef } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { hideoffCanvas } from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice';
import { useAppDispatch } from '@/app/GlobalRedux/hooks';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { Button } from 'react-bootstrap'; // Import Button component for the close button
import dynamic from 'next/dynamic';
import 'chart.js/auto';
import Timeseries from './timeseries'; 
import Tabular from './tablular'; 
import DynamicImage from './getMap'; // Import the new DynamicImage component


function BottomOffCanvas({ isVisible }) {

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Dataset',
        data: [65, 59, 80, 81, 56],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };


  const dispatch = useAppDispatch();

  // State to manage offcanvas height and selected tab
  const [height, setHeight] = useState(300); // initial height of 300px
  const [selectedTab, setSelectedTab] = useState('tab4'); // initially select the first tab
  const draggingRef = useRef(false);  // to track dragging state
  const startYRef = useRef(0);  // starting Y position for dragging
  const startHeightRef = useRef(0);  // starting height for resizing

  const handleClose = () => {
    dispatch(hideoffCanvas());
  };

  // Mouse move handler to adjust the height
  const handleMouseMove = (e) => {
    if (draggingRef.current) {
      const deltaY = e.clientY - startYRef.current; // calculate how much the mouse has moved

      // Update the height (shrinking it as the mouse moves up)
      const newHeight = startHeightRef.current - deltaY;

      // Prevent the offcanvas from going too small (min height: 100px)
      if (newHeight > 100) {
        setHeight(newHeight);
      }
    }
  };

  // Mouse up handler to stop resizing
  const handleMouseUp = () => {
    draggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Mouse down handler to start resizing
  const handleMouseDown = (e) => {
    draggingRef.current = true;
    startYRef.current = e.clientY; // get the starting Y position
    startHeightRef.current = height; // get the starting height
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Offcanvas
      show={isVisible}
      onHide={handleClose}
      placement="bottom"
      className="offcanvas-bottom"
      backdrop={false}
      scroll={true}
      style={{
        position: 'fixed',
        bottom: '0', // Position at the bottom of the page
        left: '0',
        right: '0',
        height: `${height}px`, // dynamic height
      }}
    >
      {/* Resize handle at the top */}
      <div
  style={{
    height: '8px', // Height of the drag handle
    backgroundColor: '#ccc', // Light grey background
    cursor: 'ns-resize', // Indicates that it's for vertical resizing
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
  onMouseDown={handleMouseDown}
>
  <div
    style={{
      width: '40px', // Width of the drag icon (can adjust)
      height: '4px', // Height of the icon
      backgroundColor: '#888', // Darker gray for the icon
      borderRadius: '4px', // Rounded edges for a smooth look
    }}
  ></div>
</div>


      {/* Close button at the top */}
      <Button
        variant="link"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          fontSize: '1.5rem',
          padding: '0',
          paddingRight:'10px'
        }}
      >
        <span>&times;</span> {/* Close icon */}
      </Button>

      {/* Tabs inside Offcanvas (no header) */}
      <Offcanvas.Body style={{ paddingTop: '3',borderRadius:0 }}>
        <Tabs
  activeKey={selectedTab}
  onSelect={(k) => setSelectedTab(k)} // Set the selected tab
  id="offcanvas-tabs"
  className="mb-3 custom-tabs"
>

  
  <Tab eventKey="tab1" title="Tabular">
    <div>
    <Tabular
                labels={['Wind Speed', 'Wave Direction', 'Wave Height']}
                dateCount={24} // for 5 dates
              />
    </div>
  </Tab>
  <Tab eventKey="tab4" title="Timeseries">
  <Timeseries height={height - 100} data={data} /> {/* Subtracting space for header */}
            
</Tab>

  <Tab eventKey="tab2" title="Get Map">
    <div>
    <DynamicImage height={height - 100} />
    </div>
  </Tab>
  <Tab eventKey="tab3" title="Download ">
    <div>
      <h5>Content for Tab 3</h5>
      <p>This is the content inside the third tab.</p>
    </div>
  </Tab>
<Tab eventKey="tab5" title="Custom ">
    <div>
      <h5>Content for Tab 3</h5>
      <p>This is the content inside the third tab.</p>
    </div>
  </Tab>
</Tabs>

      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default BottomOffCanvas;
