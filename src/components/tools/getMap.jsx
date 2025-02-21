import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/GlobalRedux/hooks';
import { Modal, Button } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap'; // Import Bootstrap Spinner
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons from react-icons

function DynamicImage({ height }) {
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const [images, setImages] = useState([]); // State to hold dynamic image URLs
  const [currentIndex, setCurrentIndex] = useState(0); // State to manage the current image index
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [loading, setLoading] = useState(true); // State to manage loading spinner visibility

  const imgHeight = height || 200; // Set default height to 200px if height is not provided

  function generateDateArray(start_date, end_date, stepHours) {
    const dateArray = [];
    let currentDate = new Date(start_date);
    const endDate = new Date(end_date);

    const stepMilliseconds = stepHours <= 24 ? stepHours * 60 * 60 * 1000 : 24 * stepHours * 60 * 60 * 1000;

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().slice(0, -5) + "Z");
      currentDate = new Date(currentDate.getTime() + stepMilliseconds); // Increment by the step
    }

    return dateArray;
  }
  const savedRegion = localStorage.getItem('selectedRegion');

  useEffect(() => {
    if (mapLayer.length > 0) {
      
      const layerInformation = mapLayer[mapLayer.length - 1]?.layer_information;
      const period = layerInformation.period;
      
      if (period === "PT6H" || period === "COMMA") {
        const start_date = layerInformation.timeIntervalStart;
        const end_date = layerInformation.timeIntervalEnd;
        const step = period === "PT6H" ? layerInformation.interval_step : 24; // Use interval step for PT6H or 24 for COMMA
        const result = generateDateArray(start_date, end_date, step);

        const dynamicImages = result.map((date) => 
          `https://opmmiddleware.gem.spc.int/cgi-bin/getMap.py?region=`+savedRegion+`&layer_map=`+layerInformation.id+`&units=null&coral=False&resolution=h&time=${date}`
        );
        
        setImages(dynamicImages); // Update the images array with the generated URLs
      }
      else if (period === "OPENDAP") {
        // If specific timestamps are provided
        const result_str = layerInformation.specific_timestemps;
        const result = result_str.split(",");
        const dynamicImages = result.map((date) => 
          `https://opmmiddleware.gem.spc.int/cgi-bin/getMap.py?region=`+savedRegion+`&layer_map=`+layerInformation.id+`&units=null&coral=False&resolution=h&time=${date}Z`
        );
        
        setImages(dynamicImages); // Update images with the specific timestamps
      }
    }
  }, [mapLayer,savedRegion]);

  // Functions to navigate between images
  const goToNext = () => {
    setLoading(true); // Set loading to true when navigating to the next image
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setLoading(true); // Set loading to true when navigating to the previous image
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Function to open the modal
  const openModal = () => setShowModal(true);

  // Function to close the modal
  const closeModal = () => setShowModal(false);

  // Handle image load event to hide the spinner
  const handleImageLoad = () => {
    setLoading(false); // Set loading to false once the image is loaded
  };

  // Function to handle dot click and set the current image index
  const handleDotClick = (index) => {
    setLoading(true); // Show the loading spinner when a dot is clicked
    setCurrentIndex(index); // Update the current index to the clicked dot's index
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: `${imgHeight}px`, overflow: 'hidden' }}>
      {/* Buttons on the Left */}
      <div style={{
        width: '250px', // Increase width to accommodate the buttons
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '10px',
        boxSizing: 'border-box',
      }}>
        {/* Buttons on the Same Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button
            onClick={goToPrevious}
            className="btn btn-primary" // Using Bootstrap btn-primary class
            style={{
              padding: '5px 15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flex: 1, // Ensure the button doesn't overflow
            }}
          >
            <FaChevronLeft style={{ marginRight: '8px' }} /> Previous
          </button>
          <button
            onClick={goToNext}
            className="btn btn-primary" // Using Bootstrap btn-primary class
            style={{
              padding: '5px 15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flex: 1, // Ensure the button doesn't overflow
            }}
          >
            Next <FaChevronRight style={{ marginLeft: '8px' }} />
          </button>
        </div>

        {/* Second Row of Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={openModal}
            className="btn btn-outline-success" // Button to open the modal
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
            className="btn btn-outline-warning" // Button to download the image
            style={{
              padding: '5px 15px',
              cursor: 'pointer',
              textDecoration: 'none', // Remove default link styling
              color: 'darkorange',
            }}
            onMouseOver={(e) => e.target.style.color = 'white'}  // Change color to white on hover
            onMouseOut={(e) => e.target.style.color = 'darkorange'} 
          >
            Download
          </a>
        </div>
      </div>

      {/* Vertical Divider */}
      <div style={{
        width: '2px',
        backgroundColor: 'lightgray',
        height: '100%',
      }}></div>

      {/* Image Display on the Right */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
          }}>
            <Spinner animation="border" role="status" variant="primary"/>
            <span style={{ marginLeft: '10px', fontSize: '18px' }}>Fetching map from api...</span>
          </div>
        )}
        <img
          src={images[currentIndex]}  // Display the image from the current index
          alt="Dynamic Image"
          onLoad={handleImageLoad}  // Trigger when the image is loaded
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Ensures the entire image is visible
            visibility: loading ? 'hidden' : 'visible', // Hide image while loading
          }}
        />
        {/* Dots indicating the images */}
        <div style={{
          position: 'absolute',
          bottom: '0px',  // Place dots at the bottom
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
        }}>
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => handleDotClick(index)}  // Set loading and update image when dot is clicked
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: currentIndex === index ? '#0275d8' : '#A9A9A9',
                cursor: 'pointer',
              }}
            ></div>
          ))}
        </div>
      </div>
        {/* Modal (Popup) */}
        <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview</Modal.Title>
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
