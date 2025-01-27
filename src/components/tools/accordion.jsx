import Accordion from 'react-bootstrap/Accordion';
import React, { useState,useEffect } from 'react';
import { CiFolderOn } from "react-icons/ci";
import { FaRegFolderOpen } from "react-icons/fa";
import NestedAccordion from './nested_accordion';
import { useAppSelector, useAppDispatch, useAppStore } from '@/app/GlobalRedux/hooks'
import { get_url } from '@/components/json/urls';
function MyAccordion({dataset}) {
    const accordion_val = useAppSelector((state) => state.accordion.value);

    useEffect(() => {
        // This will run when the dataset changes
        console.log("Dataset updated:", dataset);
      }, [dataset]); // The effect runs whenever `dataset` changes
    
   
   // Check if the dataset is empty or undefined
   if (!dataset || dataset.length === 0) {
    return (
      <div>
        <p style={{padding:120}}>No dataset found.</p>
      </div>
    );
  } else {
    return (
      <div>
        {/* If dataset exists, render NestedAccordion */}
        <NestedAccordion data={dataset} openIds={accordion_val} />
      </div>
    );
  }

}

export default MyAccordion;