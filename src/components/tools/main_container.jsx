"use client";
import '@/components/css/map.css'
import MapBox from "../map/get_map";
import SideBar from "../sidebar/sidebar";
import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '@/components/css/app.css'
import { useAppSelector, useAppDispatch, useAppStore } from '@/app/GlobalRedux/hooks';
import WelcomeModal from './welcomeModal'; 


export default function MainContainer() {

return (
  <>
   <WelcomeModal />
 <MapBox/>
  </>
);
}
