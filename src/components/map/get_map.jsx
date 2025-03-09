"use client" // client side rendering 
import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Modal, Button,Row,Col, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import L from 'leaflet';
import { useAppSelector, useAppDispatch, useAppStore } from '@/app/GlobalRedux/hooks'
import '@/components/functions/L.TileLayer.BetterWMS';
import { setCenter, setZoom, setBounds,addLayer, removeLayer,setBaseMapLayer,setEEZEnable,setCoastlineEnable,setCityNameEnable } from '@/app/GlobalRedux/Features/map/mapSlice';
import addWMSTileLayer from '../functions/addWMSTileLayer';
import "leaflet-bing-layer";
import '@/components/css/legend.css';
import { get_url } from '@/components/json/urls';
import { showoffCanvas, hideoffCanvas  } from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice';

import { setCoordinates  } from '@/app/GlobalRedux/Features/coordinate/mapSlice';

const MapBox = () => {
    const mapRef = useRef();
    const isVisible = useAppSelector((state) => state.offcanvas.isVisible);

    const dispatch = useAppDispatch();
    const { center, zoom, bounds, maxBounds, layers, basemap, eezoverlay,enable_eez,enable_coastline,coastlineoverlay,citynamesoverlay,enable_citynames } = useAppSelector((state) => state.mapbox);
    const isBing = useRef(false); 
    const [selectedOption, setSelectedOption] = useState('opentopo'); 
    const [checkboxChecked, setCheckboxChecked] = useState(true);
    const [checkboxCheckedCoast, setCheckboxCheckedCoast] = useState(true);
    const [checkboxCheckedCity, setCheckboxCheckedCity] = useState(false);
    const [wmsLayer, setWmsLayer] = useState(null);
    const [wmsLayer2, setWmsLayer2] = useState(null);
    const [wmsLayer3, setWmsLayer3] = useState(null);
    const [showTime, setShowTime] = useState(false);
    const legendColorRef = useRef();
    const legendColorRef2 = useRef();
    const legendColorRef3 = useRef();
    const [wmsLayerGroup, setWmsLayerGroup] = useState(null); 
    const [wmsLayer2Details, setWmsLayer2Details] = useState(null);
;
    
    const handleShow = () => {
        dispatch(showoffCanvas());
    };

    const blueIcon = new L.Icon({
      iconUrl:  "/oceanportal/blue_marker.png", // URL for the blue marker icon
      iconSize: [25, 41], // Size of the icon
      iconAnchor: [12, 41], // Anchor point of the icon
      popupAnchor: [1, -34], // Popup anchor
      shadowUrl: '/oceanportal/shadow.png', // Shadow of the marker
      shadowSize: [41, 41], // Size of the shadow
    });
    
    // Function to fetch GeoJSON and plot blue markers
   // Function to fetch GeoJSON and plot blue markers
const fetchAndPlotGeoJSON = async (url) => {
  try {
    const response = await fetch(url);
    const geojsonData = await response.json();

    // Plot the GeoJSON data with blue markers and popups
    L.geoJSON(geojsonData, {
      pointToLayer: function (feature, latlng) {
        // Create a marker with a blue icon
        const marker = L.marker(latlng, { icon: blueIcon });

        // Check if the feature has a 'name' property for popup content (or any other property you need)
        const popupContent = `
          ${feature.properties.PORT_NAME || "No name provided"}
        `;

        // Add a popup to the marker
        marker.bindPopup(popupContent);

        // Attach a custom event handler to the popup's link
        marker.on('popupopen', () => {
          // When the popup opens, attach the event handler to the link
          const link = document.querySelector('.popup-link');
          if (link) {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              // Dispatch the action when the link is clicked
            });
          }
        });

        marker.on('click', () => {
          console.log('hello')
          // Log the 'PORT_NAME' property of the feature
          var station = feature.properties.AAC;
          var x = null;
          var y = null;
          var sizex = null;
          var sizey = null;
          var bbox = null;
          
          dispatch(setCoordinates({ x, y, sizex, sizey,bbox,station }));
          dispatch(showoffCanvas());

        });

        return marker; // Return the marker with the popup attached
      },
    }).addTo(mapRef.current); // Assuming mapRef.current is your Leaflet map reference
  } catch (error) {
    console.error('Error fetching GeoJSON data:', error);
  }
};



      useEffect(() => {
        mapRef.current = L.map('map', {
          center: center,
          zoom: zoom,
        });

        if(isBing.current){
          const defaultBasemapLayer = L.tileLayer.bing(basemap.url, {
            attribution: basemap.attribution,
          }).addTo(mapRef.current);
        }
        else{
        const defaultBasemapLayer = L.tileLayer(basemap.url, {
          attribution: basemap.attribution,
        }).addTo(mapRef.current);
      }

       //Legend Note
      legendColorRef2.current = L.control({ position: "bottomleft", id:22 });
      legendColorRef2.current.onAdd = function() {
          var div = L.DomUtil.create("div", "legend");
          div.innerHTML += "<img src='/oceanportal/north_arrow.png' alt='Legend' width='50px' height='60px'>";
          div.style.backgroundColor = "transparent";
          div.style.marginLeft = '-1px';
          //
         // div.style.width = '50px';
          
         return div;
        };
        legendColorRef2.current.addTo(mapRef.current);

        //Legend Note
      legendColorRef3.current = L.control({ position: "bottomright", id:23  });
      legendColorRef3.current.onAdd = function() {
          var div = L.DomUtil.create("div", "legend");
          div.innerHTML += "<img src='/oceanportal/COSPPacMap.png' alt='Legend' width='150px' height='120px'>";
          div.style.backgroundColor = "transparent";
          div.style.marginBottom = '-35px';
          div.style.marginRight = '-12px';
          //
         // div.style.width = '50px';
          
         return div;
        };
        legendColorRef3.current.addTo(mapRef.current);
      
      legendColorRef.current = L.control({ position: "topright", id:24 });
      legendColorRef.current.onAdd = function() {
        // Create a div container for the legend
        var div = L.DomUtil.create("div", "legend");
      
        // Add the heading
       // div.innerHTML += "<h4>Note</h4>";
      
        // Add radio buttons for different map options
        div.innerHTML += `
          <label>
            <input 
              type="radio" 
              name="option" 
              value="opentopo" 
              id="opentopo-radio" 
              ${selectedOption === 'opentopo' ? 'checked' : ''}
            /> OpenTopoMap
          </label><br/>
          <label>
            <input 
              type="radio" 
              name="option" 
              value="osm" 
              id="osm-radio" 
              ${selectedOption === 'osm' ? 'checked' : ''}
            /> OpenStreetMap
          </label><br/>
             <label>
            <input 
              type="radio" 
              name="option" 
              value="bing" 
              id="bing-radio" 
              ${selectedOption === 'bing' ? 'checked' : ''}
            /> Satellite
          </label>
       <hr style="margin-top: 5px; margin-bottom: 10px;" />
          <label>
          <input
            id="eez-check" 
            type="checkbox"
            ${checkboxChecked ? 'checked' : ''}
          /> Pacific EEZ
        </label>
        <br/>
        <label>
          <input
            id="coast-check" 
            type="checkbox"
            ${checkboxCheckedCoast ? 'checked' : ''}
          /> Pacific Coastline
        </label>
         <br/>
        <label>
          <input
            id="city-check" 
            type="checkbox"
            ${checkboxCheckedCity ? 'checked' : ''}
          /> City Names
        </label>

        `;
      
        // Add event listeners to the radio buttons
        const opentopoRadio = div.querySelector("#opentopo-radio");
        const osmRadio = div.querySelector("#osm-radio");
        const bingRadio = div.querySelector("#bing-radio");
        const eezCheck = div.querySelector("#eez-check");
        const coastCheck = div.querySelector("#coast-check");
        const citynameCheck = div.querySelector("#city-check");
      
        // Add event listeners to the radio buttons
        opentopoRadio.addEventListener("change", handleRadioChange);
        osmRadio.addEventListener("change", handleRadioChange);
        bingRadio.addEventListener("change", handleRadioChange);
        eezCheck.addEventListener("change", handleCheckboxChange);
        coastCheck.addEventListener("change", handleCheckboxChangeCoast);
        citynameCheck.addEventListener("change", handleCheckboxChangeCity);
        // Return the div to Leaflet
        return div;
      };
      
        legendColorRef.current.addTo(mapRef.current);
   
        
        mapRef.current.eachLayer((layer) => {
        if (layer._url !== 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png') {
          
          
        }
        else if (layer._url !== 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'){

        }
        else if(layer.options.bingMapsKey !== 'AnIOo4KUJfXXnHB2Sjk8T_zV-tI7FkXplU1efiiyTYrlogDKppodCvsY7-uhRe8P'){

        }
        else{
          //if(layer.layer_information.is_timeseries){
            setShowTime(false)
          //}
          mapRef.current.removeLayer(layer);
        }
      });
      
       //Add new layers from state

        if(layers.length === 0){
          setShowTime(false)
        }
  
        if (bounds) {
          // Use Leaflet's fitBounds method to update the map's bounds
          const newBounds = [
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ];
          mapRef.current.fitBounds(newBounds);
        }
        const layerGroup = L.layerGroup();
    layers.forEach(layer => {

      if(layer.layer_information.enabled){
        if(layer.layer_information.layer_type == "WMS"){
      
      if(!layer.layer_information.is_timeseries){
        /*
        var wmsLayer = L.tileLayer.betterWms(layer.layer_information.url, {
          layers: layer.layer_information.layer_name,
          format: 'image/png',
          transparent: true,
          opacity: 1,
          styles: layer.layer_information.style,
          colorscalerange: layer.layer_information.colormin+", "+layer.layer_information.colormax,
          abovemaxcolor: "extend",
          belowmincolor: "transparent",
          numcolorbands: 250,
          time: layer.layer_information.timeIntervalEnd,
      }).addTo(mapRef.current);
      */

        const wmsLayer = addWMSTileLayer(mapRef.current, layer.layer_information.url, {
          layers: layer.layer_information.layer_name,
          format: 'image/png',
          transparent: true,
          opacity: layer.layer_information.opacity,
          styles: layer.layer_information.style,
          colorscalerange: layer.layer_information.colormin+", "+layer.layer_information.colormax,
          //abovemaxcolor: layer.layer_information.abovemaxcolor,
          //belowmincolor: layer.layer_information.belowmincolor,
          numcolorbands: layer.layer_information.numcolorbands,
          time: layer.layer_information.timeIntervalEnd,
          logscale: layer.layer_information.logscale
        },handleShow);

        layerGroup.addLayer(wmsLayer);
        
    }
    else{
      if (layer.layer_information.is_composite) {
        var layername = layer.layer_information.layer_name.split(',');
        var stylname = layer.layer_information.style.split(',');
        const bbox = [-23.5, -176, -15.5, -173];
        const wmsLayer = addWMSTileLayer(mapRef.current, layer.layer_information.url, {
          layers: layername[0],
          format: 'image/png',
          transparent: true,
          opacity: layer.layer_information.opacity,
          styles: stylname[0],
          colorscalerange: layer.layer_information.colormin+", "+layer.layer_information.colormax,
          abovemaxcolor: layer.layer_information.abovemaxcolor,
          belowmincolor: layer.layer_information.belowmincolor,
          numcolorbands: layer.layer_information.numcolorbands,
          time: layer.layer_information.timeIntervalStart,
          logscale: layer.layer_information.logscale,
          //crs: L.CRS84,  // Define CRS as EPSG:4326
          //bbox: bbox,
        },handleShow);
        layerGroup.addLayer(wmsLayer);

        const wmsLayer2 = addWMSTileLayer(mapRef.current, layer.layer_information.url, {
          layers: layername[1],
          format: 'image/png',
          transparent: true,
          opacity: layer.layer_information.opacity,
          styles: stylname[1],
          time: layer.layer_information.timeIntervalStart,
          logscale: layer.layer_information.logscale,
          //crs: L.CRS84,  // Define CRS as EPSG:4326
          //bbox: bbox,
        },handleShow);

        // Add the second layer of the composite
        layerGroup.addLayer(wmsLayer2);
      }
      else{
        const wmsLayer = addWMSTileLayer(mapRef.current, layer.layer_information.url, {
          layers: layer.layer_information.layer_name,
          format: 'image/png',
          transparent: true,
          opacity: layer.layer_information.opacity,
          styles: layer.layer_information.style,
          colorscalerange: layer.layer_information.colormin+", "+layer.layer_information.colormax,
          abovemaxcolor: layer.layer_information.abovemaxcolor,
          belowmincolor: layer.layer_information.belowmincolor,
          numcolorbands: layer.layer_information.numcolorbands,
          time: layer.layer_information.timeIntervalStart,
          logscale: layer.layer_information.logscale,
        },handleShow);
        layerGroup.addLayer(wmsLayer);
      }
     

  }
  layerGroup.addTo(mapRef.current);
    setWmsLayerGroup(layerGroup); 
    //set Bounds
    if(layer.layer_information.zoomToLayer){
      if (bounds === null) {
      mapRef.current.fitBounds(L.latLngBounds([[layer.south_bound_latitude,
        layer.east_bound_longitude],[layer.north_bound_latitude, layer.west_bound_longitude]]));
     }
    }
    }
    else{
      //PLOT marker here
      var geojson_url =  layer.layer_information.url;
      fetchAndPlotGeoJSON(geojson_url);
    }
  }
    });

   
  
    

      const  handleMoveEnd = () => {
      const newCenter = mapRef.current.getCenter();
      const newZoom = mapRef.current.getZoom();
      dispatch(setCenter([newCenter.lat, newCenter.lng]));
      dispatch(setZoom(newZoom));
     };
  
      mapRef.current.on('moveend', handleMoveEnd);

      const fetchData = async () => {
        try {
          const resp = await fetch("https://opmgeoserver.gem.spc.int/geoserver/spc/wfs?service=WFS&version=1.1.0&request=GetFeature&typeNames=spc:pacific_eez3&outputFormat=application/json");
          const customData = await resp.json();
        //const customData = require('../shorelineDatasets/'+siteRef+'_shoreline_'+yearRef+'.json');
      var newWmsLayer = L.geoJson(customData, {
      }).addTo(mapRef.current);
      setWmsLayer(newWmsLayer);

        } catch (err) {
          console.log(err.message);
        } 
      };
/*
     if(enable_eez){
     const newWmsLayer = L.tileLayer.wms(eezoverlay.url, {
        layers: eezoverlay.layer, // Replace with your WMS layer name
        format: 'image/png',
        transparent: true,
      }).addTo(mapRef.current);
    //fetchData()

    }
    else{
      if (wmsLayer) {
        mapRef.current.removeLayer(wmsLayer);
        setWmsLayer(null);
      }
    }
    if(enable_coastline){
      const newWmsLayer2 = L.tileLayer.wms(coastlineoverlay.url, {
        layers: coastlineoverlay.layer, // Replace with your WMS layer name
        format: 'image/png',
        transparent: true,
      }).addTo(mapRef.current);
      setWmsLayer2(newWmsLayer2);
    }
    else{
      if (wmsLayer2) {
        mapRef.current.removeLayer(wmsLayer2);
        setWmsLayer2(null);
      }
    }
    if(enable_citynames){
      const newWmsLayer3 = L.tileLayer.wms(citynamesoverlay.url, {
        layers: citynamesoverlay.layer, // Replace with your WMS layer name
        format: 'image/png',
        transparent: true,
      }).addTo(mapRef.current);
      setWmsLayer3(newWmsLayer3);
    }
    else{
      if (wmsLayer3) {
        mapRef.current.removeLayer(wmsLayer3);
        setWmsLayer3(null);
      }
    }*/
      mapRef.current.on('click', (e) => {
        const lat = e.latlng.lat;  // Get the latitude (y)
        const lng = e.latlng.lng;  // Get the longitude (x)
        var p1 = mapRef.current.latLngToContainerPoint(e.latlng);
        var x = p1.x;
        var y = p1.y;
        var size = mapRef.current.getSize();
        var sizex = size.x;
        var sizey = size.y;
        var bbox = mapRef.current.getBounds().toBBoxString();
        var station = null;
        // Dispatch these values to the Redux store
        dispatch(setCoordinates({ x, y, sizex, sizey,bbox,station }));
      });
    

        return () => {
          mapRef.current.remove();
        };
      }, [dispatch,layers,basemap, bounds]);


      useEffect(() => {
        if (enable_eez) {
          const newWmsLayer = L.tileLayer.wms(eezoverlay.url, {
            layers: eezoverlay.layer, // Replace with your WMS layer name
            format: 'image/png',
            transparent: true,
          }).addTo(mapRef.current);
          setWmsLayer(newWmsLayer);
        } else {
          if (wmsLayer) {
            mapRef.current.removeLayer(wmsLayer);
            setWmsLayer(null);
          }
        }
        if(enable_coastline){
          const newWmsLayer2 = L.tileLayer.wms(coastlineoverlay.url, {
            layers: coastlineoverlay.layer, // Replace with your WMS layer name
            format: 'image/png',
            transparent: true,
          }).addTo(mapRef.current);
          setWmsLayer2(newWmsLayer2);
        }
        else{
          if (wmsLayer2) {
            mapRef.current.removeLayer(wmsLayer2);
            setWmsLayer2(null);
          }
        }
        if(enable_citynames){
          const newWmsLayer3 = L.tileLayer.wms(citynamesoverlay.url, {
            layers: citynamesoverlay.layer, // Replace with your WMS layer name
            format: 'image/png',
            transparent: true,
          }).addTo(mapRef.current);
          setWmsLayer3(newWmsLayer3);
        }
        else{
          if (wmsLayer3) {
            mapRef.current.removeLayer(wmsLayer3);
            setWmsLayer3(null);
          }
        }

      }, [layers,basemap,enable_eez,bounds,enable_citynames,enable_coastline]);

      const handleRadioChange = (event) => {
      //  console.log(event.target.value)

        if(event.target.value === "osm"){
          isBing.current = false
          dispatch(setBaseMapLayer({ url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution:'&copy; Pacific Community SPC' }));
        }
        else if(event.target.value === "bing"){
          isBing.current = true
          dispatch(setBaseMapLayer({ url: 'AnIOo4KUJfXXnHB2Sjk8T_zV-tI7FkXplU1efiiyTYrlogDKppodCvsY7-uhRe8P', attribution:'&copy; Pacific Community SPC' }));
        }
        else{
          isBing.current = false
          dispatch(setBaseMapLayer({ url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', attribution:'&copy; Pacific Community SPC' }));
        }
        setSelectedOption(event.target.value);
      };

      const handleCheckboxChange = (event) => {
        setCheckboxChecked(event.target.checked);
        const isChecked = event.target.checked;
      
       if (isChecked) {
        dispatch(setEEZEnable(true));
       
        } else {
          dispatch(setEEZEnable(false));
        }
      };

      const handleCheckboxChangeCoast = (event) => {
        setCheckboxCheckedCoast(event.target.checked);
        const isChecked = event.target.checked;
      
       if (isChecked) {
        dispatch(setCoastlineEnable(true));
       
        } else {
          dispatch(setCoastlineEnable(false));
        }
      };

      const handleCheckboxChangeCity = (event) => {
        setCheckboxCheckedCity(event.target.checked);
        const isChecked = event.target.checked;
      
       if (isChecked) {
        dispatch(setCityNameEnable(true));
       
        } else {
          dispatch(setCityNameEnable(false));
        }
      };


   

    
  return (
    <div>
     <div id="map" style={{Zindex: "auto",marginRight:-12, marginLeft:-12}}></div>
   
    </div>
  );
};

export default MapBox;
