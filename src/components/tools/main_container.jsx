"use client";
import '@/components/css/map.css'
import MapBox from "../map/get_map";
import React, { useEffect } from 'react';
import '@/components/css/app.css'
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
