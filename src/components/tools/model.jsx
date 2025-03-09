import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Spinner } from 'react-bootstrap';
import MyAccordion from './accordion';
import AccordionMetadata from './accordion_metadata';
import { get_url } from '@/components/json/urls';
import { useAppSelector } from "@/app/GlobalRedux/hooks";

const ExploreModal = ({ show, onClose, title, bodyContent }) => {
  const [theme, setTheme] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // No theme selected by default
  const [data, setData] = useState(null); // Single state to store both the tailored and theme-based data
  const [loading, setLoading] = useState(false); // State for loading
  const [userId, setUserId] = useState(null); // State to store the userId (token)
  const [showTailoredContent, setShowTailoredContent] = useState(false); // Tailored content shown by default if logged in

  const countryId = useAppSelector((state) => state.auth.country);

  // Fetch data based on the selectedId (theme-based data)
  const fetchData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(get_url('root_menu', id));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Fetch error: ", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch session to get the userId
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/oceanportal/api/session");
        const data = await response.json();
        setUserId(data.userId); // Set userId when the session is fetched
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };
    fetchSession();
  }, [countryId]);

  // Fetch tailored menu data using the userId as the bearer token
  const fetchTailoredMenu = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`https://dev-oceanportal.spc.int/middleware/api/tailored_menu/?country_id=4&format=json`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch tailored menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch theme data when the modal loads
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch(get_url('theme'));
        const data = await response.json();
        setTheme(data);
      } catch (error) {
        console.error('Error fetching themes:', error);
      }
    };

    fetchThemes();
  }, []);

  // When the userId is updated, ensure that "Tailored" is the only active button
  useEffect(() => {
    if (userId) {
      setShowTailoredContent(true); // Show tailored content by default
      setSelectedId(null); // Deselect any theme button
      fetchTailoredMenu(); // Fetch tailored data for the user
    }
  }, [userId]);

  // Handle Tailored button click
  const handleTailoredClick = () => {
    setShowTailoredContent(true); // Show tailored content
    setSelectedId(null); // Deselect any theme button
    fetchTailoredMenu(); // Fetch tailored menu data
  };

  // Handle theme button click
  const handleThemeClick = (id) => {
    setSelectedId(id); // Set the selected theme ID
    setShowTailoredContent(false); // Switch to theme-based content
    fetchData(id); // Fetch the data for the selected theme
  };

  // Set default selectedId to first theme if no tailored data or userId
  useEffect(() => {
    if (!userId && theme.length > 0 && selectedId === null) {
      setSelectedId(theme[0].id); // Set the first theme as selected by default
      fetchData(theme[0].id); // Fetch data for the first theme
    }
  }, [theme, userId, selectedId]);

  return (
    <Modal show={show} onHide={onClose} centered scrollable size="xl">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '18px' }}>
          {/* Show the "Tailored" button only if the user is logged in */}
          {userId && (
            <button
              className={`btn btn-sm rounded-pill ${showTailoredContent ? 'btn-danger' : 'btn-light'}`}
              style={{ padding: '8px', color: showTailoredContent ? 'white' : 'black', marginLeft: '4px' }}
              onClick={handleTailoredClick} // Handle Tailored button click
            >
              &nbsp;Tailored Products&nbsp;
            </button>
          )}

          {/* Render the theme buttons */}
          {theme.map((themeItem) => (
            <button
              key={themeItem.id}
              className={`btn btn-sm rounded-pill ${selectedId === themeItem.id ? 'btn-primary' : 'btn-light'}`}
              style={{ padding: '8px', color: selectedId === themeItem.id ? 'white' : 'black', marginLeft: '4px' }}
              onClick={() => handleThemeClick(themeItem.id)} // Handle theme button click
            >
              &nbsp;{themeItem.name}&nbsp;
            </button>
          ))}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "0%", marginRight: "auto", marginLeft: "auto", width: '100%' }}>
        <Row className="g-0">
          <Col md={4} className="scrollable-column" style={{ backgroundColor: '#F8F8F8' }}>
            {loading ? (
              <Spinner animation="border" variant="primary" style={{ margin: 170 }} />
            ) : (
              <MyAccordion className="scrollable-content" dataset={data} />
            )}
          </Col>
          <Col md={8} className="scrollable-column">
            <AccordionMetadata />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="custom-header">
        <p style={{ fontSize: '12px', color: 'grey' }}>&copy; All Rights Reserved SPC </p>
      </Modal.Footer>
    </Modal>
  );
};

export default ExploreModal;
