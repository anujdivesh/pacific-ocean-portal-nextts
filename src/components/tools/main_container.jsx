"use client";
import MapBox from "../map/get_map";
import React, { useEffect } from 'react';
import WelcomeModal from './welcomeModal'; 


export default function MainContainer() {

  useEffect(() => {

    localStorage.setItem('selectedRegion', 1);
  }, []);

return (
  <>
   <WelcomeModal />
 <MapBox/>
  </>
);
}
