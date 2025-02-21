"use client" // client side rendering 
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { useAppSelector, useAppDispatch, useAppStore } from '@/app/GlobalRedux/hooks'
import { hideModal,showModaler } from '@/app/GlobalRedux/Features/modal/modalSlice';
import MyWorkbench from '../tools/workbench';
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaPlusCircle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { setDataset } from '@/app/GlobalRedux/Features/dataset/dataSlice';
import { setAccordion } from '@/app/GlobalRedux/Features/accordion/accordionSlice';
import { showsideoffCanvas, hidesideoffCanvas  } from '@/app/GlobalRedux/Features/sideoffcanvas/sideoffcanvasSlice';
import { setBounds  } from '@/app/GlobalRedux/Features/map/mapSlice';
import SideOffCanvas from '../tools/side_offcanvas';
import { showoffCanvas, hideoffCanvas  } from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice';

const ExploreModal = dynamic(() => import('@/components/tools/model'), {ssr: false})

const SideBar = () => {
    const _isMounted = useRef(true);

    const handleShowCanvas = () => {
      dispatch(showsideoffCanvas())
    };
    const isVisiblecanvas = useAppSelector((state) => state.sideoffcanvas.isVisible);

    //const [showModal, setShowModal] = useState(false);
    const isVisible = useAppSelector((state) => state.modal.isVisible);
    const dispatch = useAppDispatch();
    

    const handleShow = () => {
      dispatch(setAccordion(''))
      dispatch(setDataset([]))
      dispatch(showModaler());
      dispatch(hideoffCanvas());
      //setShowModal(true)
    };
    const handleClose = () => {
      dispatch(hideModal())
      //setShowModal(false)
    };

    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("1"); 
   // const [bounds, setBounds] = useState(null);
  
    // Fetch regions data from API
    useEffect(() => {
      // Example API URL - replace with your actual API endpoint
      fetch('https://dev-oceanportal.spc.int/middleware/api/country/?format=json')
        .then((response) => response.json())
        .then((data) => {
          setRegions(data); // Set regions data to state
          const savedRegion = localStorage.getItem('selectedRegion'); // Check localStorage for saved region
          if (savedRegion) {
            // Check if the saved region exists in the fetched data
            const regionExists = data.find((region) => region.id.toString() === savedRegion);
            if (regionExists) {
              setSelectedRegion(savedRegion); // Set the region from localStorage if valid
              // Set bounds based on the saved region
              dispatch(
                setBounds({
                  west: regionExists.west_bound_longitude,
                  east: regionExists.east_bound_longitude,
                  south: regionExists.south_bound_latitude,
                  north: regionExists.north_bound_latitude,
                })
              );
            }
          }
        })
        .catch((error) => console.error('Error fetching regions:', error));
    }, [dispatch]);
  
    // Handle region selection
    const handleRegionChange = (e) => {
      dispatch(hideoffCanvas());
      const regionId = e.target.value;
      setSelectedRegion(regionId);
      localStorage.setItem('selectedRegion', regionId);
  
      // Find the selected region by its id
      const region = regions.find((region) => region.id === parseInt(regionId));
  
      if (region) {
        // Set the bounds for the selected region
        dispatch(
          setBounds({
            west: region.west_bound_longitude,
            east: region.east_bound_longitude,
            south: region.south_bound_latitude,
            north: region.north_bound_latitude,
          })
        );
      } else {
        dispatch(setBounds(null)); // Reset bounds if no valid region is selected
      }
      e.target.blur();
    };
  

  
  
  return (
    <div style={{marginRight:'5px',marginLeft:'5px'}}>
        <Row  style={{paddingTop:'10px'}}>
        <Col md={12}>
        <select
        className="form-select rounded-pill w-100"
        aria-label="Select a region"
        value={selectedRegion}
        onChange={handleRegionChange}
      >
        <option value="">Select a region</option>
        {regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.long_name}
          </option>
        ))}
      </select>
        </Col>
        </Row>
        
      <Row style={{paddingTop:'10px'}}>
        <Col md={7}>
        <button type="button" className="btn btn-primary btn-sm rounded-pill w-100" style={{padding:'8px', marginLeft:'5px'}} onClick={handleShow}><IoIosAddCircleOutline size={20}/>&nbsp;Explore Map Data</button>
        </Col>
        <Col md={5} style={{marginRight:0}}>
          <Button variant="btn btn-info btn-sm rounded-pill" className="w-100"  style={{padding:'8px',color:'white'}}  onClick={handleShowCanvas} ><IoInformationCircleOutline size={20} />Info</Button>
        </Col>
      </Row>
      <Row style={{paddingTop:10,marginRight:-10,marginLeft:-8}}>
        <MyWorkbench/>
      </Row>
      <SideOffCanvas isVisible={isVisiblecanvas}/>
      <ExploreModal
       show={isVisible} 
       onClose={handleClose} 
       title="Data Catalogue" 
       bodyContent="This is the modal body content." 
       />
    </div>
  );
};

export default SideBar;
