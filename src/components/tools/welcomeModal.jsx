"use client";
import React, { useEffect, useState } from 'react';
import { Modal, Button,Form } from 'react-bootstrap';
import '@/components/css/welcomemodal.css';

const WelcomeModal = () => {
  const [show, setShow] = useState(false);
  const [timesShown, setTimesShown] = useState(0);
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    const storedCount = localStorage.getItem('modalShownCount');

    
    if (storedCount) {
      const count = parseInt(storedCount, 10);
      setTimesShown(count);

      // Show the modal only if it has been shown less than 500 times
      if (count < 500) {
        setShow(true); // Show the modal if count is less than 500
      } 
    } else {
      // Initialize count to 0 for the first visit
      localStorage.setItem('modalShownCount', '0');
      setTimesShown(0);
      setShow(true); // Show the modal for the first time
    }
  }, []); // Runs when the component is mounted

  const handleClose = () => {
    const newCount = timesShown + 1;
    setTimesShown(newCount);
    localStorage.setItem('modalShownCount', newCount.toString());

    // If the count reaches 500, stop showing the modal
    if (newCount >= 500) {
      console.log('Modal count reached 500, stopping modal display');
      setShow(false); // Hide modal after 500
    } else {
      setShow(false); // Otherwise, just close it
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    e.target.blur();
    setIsChecked(!checked);
    if (!checked) {
      // Set modal count to 100
      localStorage.setItem("modalShownCount", 500);
      setTimesShown(500);
      setShow(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      <Modal.Header closeButton style={{backgroundColor:'#3f51b5', color:'white'}} closeVariant="white">
       {/* <Modal.Title style={{ color: 'white' }}>Halo olaketa! Talitali fiefia! Talofa Koutou! Afio mai! Bula! </Modal.Title>
       */}
       <Modal.Title style={{ color: 'white' }}>Halo olaketa! </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <h4 className="text-center" style={{ marginTop: '-15px', color: 'grey' }}>Welcome to Pacific Ocean Portal!</h4>
        

        {/* Countries Supported Section */}

        <p style={{  color: 'grey',fontSize:14 }}>Countries supported:</p>
        <div className="logos d-flex flex-wrap justify-content-center" style={{ gap: '1px', maxWidth: '100%' }}>
          <img className="img-fluid" src="/oceanportal/flags/CK.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/FM.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/FJ.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/KI.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/MH.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/NR.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/NU.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/PW.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/PNG.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/WS.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/SB.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/TO.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/TV.jpg" alt="supported-services" width="10%" height="10%" />
          <img className="img-fluid" src="/oceanportal/flags/VU.jpg" alt="supported-services" width="10%" height="10%" />
        </div>

        {/* Developed & Funded By Section */}
        <p style={{  color: 'grey',fontSize:14 }}>Developed & Funded by:</p>
        <div className="logos d-flex flex-wrap justify-content-center">
          <img className="img-fluid" src="/oceanportal/logos/cos2.png" alt="supported-services" width="15%" height="15%" />
          <img className="img-fluid" src="/oceanportal/logos/aus_govt.png" alt="supported-services" width="15%" height="15%" />
          <img className="img-fluid" src="/oceanportal/logos/spx.png" alt="supported-services" width="15%" height="15%" />
          <img className="img-fluid" src="/oceanportal/logos/au2.png" alt="supported-services" width="15%" height="15%" />
        </div>

        <br />
        <p style={{  color: 'grey',fontSize:13  }} className="text-center">Contact us: cosppac@spc.int</p>
       
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center">
      {/* Checkbox on the left */}
      <Form.Group controlId="setModalCount" className="mb-0 d-flex align-items-center">
  {/* Checkbox */}
  <Form.Check
    type="checkbox"
    checked={isChecked}
    onChange={handleCheckboxChange}
    style={{ marginRight: "8px", borderRadius:"0" }} // Add space between checkbox and text
  />
  {/* Label */}
  <Form.Label style={{ fontSize: 13, color: "grey", marginBottom: 0 }}>
    Show at start-up
  </Form.Label>
</Form.Group>
      {/* Close button on the right */}
      <Button
        variant="secondary"
        onClick={handleClose}
        size="sm"
        style={{ borderRadius: "0", padding: "5px 10px" }}
        aria-label="Close welcome modal"
      >
        Close
      </Button>
    </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
