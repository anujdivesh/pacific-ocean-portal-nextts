"use client" // client side rendering 
import '@/components/css/modal.css'
import React, { useState,useEffect } from 'react';
import { Modal, Button,Row,Col, Accordion, AccordionItem, AccordionHeader, AccordionBody,Spinner } from 'react-bootstrap';
import MyAccordion from './accordion';
import SmallMap from '../map/small_map';
import AccordionMetadata from './accordion_metadata';
import { get_url } from '@/components/json/urls';

const ExploreModal = ({ show, onClose, title, bodyContent }) => {

  const [theme, setTheme] = useState([]);

  const [selectedId, setSelectedId] = useState(1); // Default to the "Data Catalogue" button
  const [data, setData] = useState(null); // State to store the fetched data
  const [loading, setLoading] = useState(false); // State for loading


  // Fetch data based on the selectedId
  const fetchData = async (id) => {
    setLoading(true); // Set loading to true while fetching
    try {
      let response;
      /*if (id === 1) {
        // Fetch data for non-root sectors
        response = await fetch(get_url('root_menu',1));
      } else {
        // Fetch data for the root menu
        response = await fetch(get_url('root_menu',2));
      }*/

      response = await fetch(get_url('root_menu',id));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result); // Update data state
    } catch (error) {
      console.error("Fetch error: ", error);
      setData([]);

    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  // useEffect to fetch data when selectedId changes
  useEffect(() => {
    fetchData(selectedId); // Trigger fetchData whenever selectedId changes

    const fetchSectors = async () => {
      try {
        const response = await fetch(get_url('theme'));
        const data = await response.json();
        setTheme(data);  // Set the sectors from the API
      } catch (error) {
        console.error('Error fetching sectors:', error);
      }
    };

    fetchSectors();
  }, [selectedId]);

  // Handle button click: Update selectedId
  const handleButtonClick = (id) => {
    setSelectedId(id); // Update selectedId to trigger data fetch
  };


    return (
      <Modal show={show} onHide={onClose} centered scrollable size='xl' className="custom-modal">
        <Modal.Header closeButton className="custom-header">
          <Modal.Title style={{fontSize:'18px'}}>   
          {theme.map(theme => (
        <button
          key={theme.id}
          className={`btn btn-sm rounded-pill ${selectedId === theme.id ? 'btn-primary' : 'btn-light'}`}
          style={{ padding: '8px', color: selectedId === theme.id ? 'white' : 'black', marginLeft: '4px' }}
          onClick={() => handleButtonClick(theme.id)}
        >
          &nbsp;{theme.name}&nbsp;
        </button>
      ))}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding:"0%",marginRight:"auto", marginLeft:"auto",width:'100%'}}>
        <Row className="g-0">
        <Col md={4} className="scrollable-column" style={{backgroundColor:'#F8F8F8'}}>
    
        {loading ? (
         <Spinner animation="border" variant="primary" style={{ margin: 170 }} />
      ) : (
        <MyAccordion className="scrollable-content" dataset={data} />
      )}
        </Col>
        <Col md={8} className="scrollable-column"> 
        <AccordionMetadata/>
        
        </Col>
      </Row>
        </Modal.Body>
        <Modal.Footer className="custom-header">
         <p style={{fontSize:'12px', color:'grey'}}>&copy; All Rights Reserved SPC </p>
        </Modal.Footer>
      </Modal>
    );
  };
  
  export default ExploreModal;
  