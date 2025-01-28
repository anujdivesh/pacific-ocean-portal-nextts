'use client';
import React, { useState } from 'react';
import { Accordion, Spinner, Card } from 'react-bootstrap';
import '@/components/css/accordion.css';  // Make sure this is the correct path
import { IoMdAddCircleOutline, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/app/GlobalRedux/hooks';
import { setDataset } from '@/app/GlobalRedux/Features/dataset/dataSlice';

const NestedAccordion = ({ data, openIds }) => {
  const dispatch = useAppDispatch();
  
  // State to track the active item (contentItem) and activeKey for accordion
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeKey, setActiveKey] = useState(null); // Control which accordion is open

  // Handle item click and set the active item
  const handleClick = (contentItem) => {
    dispatch(setDataset(contentItem));  // Dispatch to global store
    setActiveItemId(contentItem.id);  // Set the clicked item as active
  };

  // Custom toggle for accordion header
  function CustomToggle({ children, eventKey }) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Make sure header text and arrow are spaced out
          alignItems: 'center',
          padding: '1px 2px',  // Padding for space around text and icon
          cursor: 'pointer',
          fontSize: '14px', // Optional: Add background for contrast
          borderRadius: '10px', // Make sure the header has sharp edges
          marginBottom: '5px',  // Margin between items
        }}
        onClick={() => setActiveKey(activeKey === eventKey ? null : eventKey)} // Toggle open/close
      >
        <span>{children}</span>
        <span>{activeKey === eventKey ? <FiChevronUp style={{ fontSize: '20px' }}/> : <FiChevronDown style={{ fontSize: '20px' }}/>}</span> {/* Show up/down arrow */}
      </div>
    );
  }

  // Recursive function to render items
  const renderAccordionItems = (items) => {
    return items.map((item) => (
      <Accordion.Item eventKey={item.id} key={item.id} style={{ borderRadius: 0,margin:0 }}>
        <Card style={{ borderRadius: 0,margin:0 }}>
          {/* Use Card.Header for the accordion header */}
          <Card.Header 
            style={{
              borderRadius: 0,
              backgroundColor: activeKey === item.id ? '#E7F1FF' : 'transparent', // Blue tint when open
              color: activeKey === item.id ? '#0D6EFD' : 'black',
              transition: 'background-color 0.3s ease', // Smooth transition for background color
            }}
          >
            <CustomToggle eventKey={item.id}>
              {item.display_title}
            </CustomToggle>
          </Card.Header>

          <Accordion.Collapse eventKey={item.id}>
            <Card.Body style={{ paddingLeft: 20, paddingRight: 5, paddingTop:2,paddingBottom:2, backgroundColor: '#F8F8F8', borderRadius: 0 }}>
              {item.content.map((contentItem) => (
                <div
                  className={`flex-container ${activeItemId === contentItem.id ? 'active' : ''}`}
                  key={contentItem.id}
                  onClick={() => handleClick(contentItem)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: activeItemId === contentItem.id ? '#d3f4ff' : 'transparent', // Highlight if active
                    borderRadius: '0px',
                    padding: '2px',
                    fontSize: 13
                  }}
                >
                  <div className="item">{contentItem.name}</div>
                  <div className="item">
                    {activeItemId === contentItem.id ? (
                      <IoMdCheckmarkCircleOutline size={22} style={{ cursor: 'pointer', color: 'green' }} />
                    ) : (
                      <IoMdAddCircleOutline size={22} style={{ cursor: 'pointer' }} />
                    )}
                  </div>
                </div>
              ))}
              {item.children && item.children.length > 0 && (
                <Accordion flush activeKey={activeKey}>
                  {renderAccordionItems(item.children)}
                </Accordion>
              )}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion.Item>
    ));
  };

  return (
    <>
      {data.length === 0 ? (
        <Spinner animation="border" variant="primary" style={{ marginLeft: 150, marginTop: 50 }} />
      ) : (
        <Accordion
          flush
          activeKey={activeKey}  // Set activeKey to control which item is expanded
          onSelect={(key) => setActiveKey(key)}  // Update activeKey on accordion selection
        >
          {renderAccordionItems(data)}
        </Accordion>
      )}
    </>
  );
};

export default NestedAccordion;
