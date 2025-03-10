'use client';
import React, { useState, useEffect } from 'react';
import { Accordion, Spinner } from 'react-bootstrap';
import '@/components/css/accordion.css';
import { IoMdAddCircleOutline, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useAppSelector, useAppDispatch } from '@/app/GlobalRedux/hooks';
import { setDataset } from '@/app/GlobalRedux/Features/dataset/dataSlice';

const NestedAccordion = ({ data, openIds }) => {
  const dispatch = useAppDispatch();
  
  // State to track which contentItem is active
  const [activeItemId, setActiveItemId] = useState(null);

  // Handle item click and set the active item
  const handleClick = (contentItem) => {
    dispatch(setDataset(contentItem));  // Dispatch to global store
    setActiveItemId(contentItem.id);  // Set the clicked item as active
  };

  // Recursive function to determine which items should be open
  const getActiveKeys = (items, openIds) => {
    const activeKeys = [];
    if (openIds === '0') {
      activeKeys.push('0');
    } else {
      const findActiveKeys = (items, targetId) => {
        items.forEach((item) => {
          if (item.id === targetId) {
            activeKeys.push(item.id);
          }

          if (item.children && item.children.length > 0) {
            // Check if any child matches the targetId or if targetId is a child of this item
            if (item.children.some(child => child.id === targetId)) {
              activeKeys.push(item.id); // Open the parent item if it has the targetId as a child
              activeKeys.push(targetId); // Ensure the targetId itself is included
            } else {
              // Recursively find in children
              findActiveKeys(item.children, targetId);
            }
          }
        });
      };

      findActiveKeys(items, openIds);
    }

    return Array.from(new Set(activeKeys));
  };

  const findPathToRoot = (node, targetId) => {
    if (node.content && node.content.some(item => item.id === targetId)) {
      return [node.id, targetId];
    }
    
    if (node.children) {
      for (const child of node.children) {
        const result = findPathToRoot(child, targetId);
        if (result) {
          return [node.id, ...result];
        }
      }
    }
    
    return null;
  };

  const findIdsPath = (data, targetId) => {
    for (const rootNode of data) {
      const result = findPathToRoot(rootNode, targetId);
      if (result) {
        return result.reverse(); // Reverse to get the correct order
      }
    }
    return null;
  };

  let activeKeys = [];
  if (data.length !== 0) {
    if (openIds !== '') {
      activeKeys = findIdsPath(data, openIds);
    }
    if (activeKeys.length !== 0) {
      activeKeys.shift();  // Remove the root item if not necessary
      activeKeys = activeKeys.reverse(); // Reverse to ensure correct order
    }
  }

  const renderAccordionItems = (items) => {
    return items.map((item) => (
      <Accordion.Item eventKey={item.id} key={item.id} style={{ borderRadius: 0,padding:2,  borderRight: '1px solid #ccc',borderBottom: '1px solid #ccc' }}>
        <Accordion.Header
          onClick={(e) => e.currentTarget.blur()}
        >
          {item.display_title}
        </Accordion.Header>
        <Accordion.Body style={{ paddingLeft: 20, paddingRight: 0, backgroundColor: '#F8F8F8' }}>
          {item.content.map((contentItem) => (
            <div
              className={`flex-container ${activeItemId === contentItem.id ? 'active' : ''}`}
              key={contentItem.id}
              onClick={(e) => handleClick(contentItem)}
              style={{
                cursor: 'pointer',
                backgroundColor: activeItemId === contentItem.id ? '#d3f4ff' : 'transparent', // Change background color if active
                borderRadius: '4px', // Optional: for rounded corners
                padding: '2px',
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
            <Accordion flush defaultActiveKey={activeKeys}>
              {renderAccordionItems(item.children)}
            </Accordion>
          )}
        </Accordion.Body>
      </Accordion.Item>
    ));
  };

  return (
    <>
      {data.length === 0 ? (
        <Spinner animation="border" variant="primary" style={{ marginLeft: 150, marginTop: 50 }} />
      ) : (
        <Accordion flush defaultActiveKey={activeKeys}>
          {renderAccordionItems(data)}
        </Accordion>
      )}
    </>
  );
};

export default NestedAccordion;
