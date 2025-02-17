import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function DynamicImage({ height }) {
  // Set default height to 200px if height is not provided
  const imgHeight = height || 200;

  // Image URLs
  const images = [
    "http://localhost:3000/oceanportal/sst.png",
    "http://localhost:3000/oceanportal/sst1.png",
    "http://localhost:3000/oceanportal/sst2.png",
    "http://localhost:3000/oceanportal/sst3.png",
    "http://localhost:3000/oceanportal/sst4.png"
  ];

  // State to manage the current image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modal state to manage the visibility
  const [showModal, setShowModal] = useState(false);

  // Functions to navigate between images
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Function to open the modal
  const openModal = () => setShowModal(true);

  // Function to close the modal
  const closeModal = () => setShowModal(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: `${imgHeight}px`, overflow: 'hidden' }}>
      {/* Centered Buttons on Top with margin */}
      <div
        style={{
          position: 'absolute',
          top: '10px',  // Distance from the top of the container
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center', // Center buttons
          gap: '20px', // Space between the buttons
          marginBottom: '10px', // Space between buttons and image
        }}
      >
        <button
          onClick={goToPrevious}
          className="btn btn-primary" // Using Bootstrap btn-primary class
          style={{
            padding: '5px 15px',
            cursor: 'pointer',
          }}
        >
          Previous
        </button>
        <button
          onClick={goToNext}
          className="btn btn-primary" // Using Bootstrap btn-primary class
          style={{
            padding: '5px 15px',
            cursor: 'pointer',
          }}
        >
          Next
        </button>
        <button
          onClick={openModal}
          className="btn btn-success" // Button to open the modal
          style={{
            padding: '5px 15px',
            cursor: 'pointer',
          }}
        >
          View in Popup
        </button>
        <a
          href={images[currentIndex]}  // Link to the image
          download={`image_${currentIndex}.png`} // Download filename
          className="btn btn-warning" // Button to download the image
          style={{
            padding: '5px 15px',
            cursor: 'pointer',
            textDecoration: 'none', // Remove default link styling
            color:'white'
          }}
        >
          Download
        </a>
      </div>
<br/><br/>
      {/* Image Display */}
      <img
        src={images[currentIndex]}  // Display the image from the current index
        alt="Dynamic Image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain', // Ensures the entire image is visible
        }}
      />

      {/* Modal (Popup) */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Image View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            src={images[currentIndex]} // Display the current image in the modal
            alt="Dynamic Image"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain', // Ensures the image fits within the modal
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          {/* Download Button inside Modal */}
          <a
            href={images[currentIndex]}  // Link to the image
            download={`image_${currentIndex}.png`} // Download filename
            className="btn btn-info" // Button to download the image
            style={{
              padding: '5px 15px',
              cursor: 'pointer',
              textDecoration: 'none', // Remove default link styling
            }}
          >
            Download
          </a>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DynamicImage;
