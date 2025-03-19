"use client";
import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppSelector } from '@/app/GlobalRedux/hooks';
import '@/components/css/legendlibrary.css';
import "leaflet-bing-layer";

const Library = () => {
    const { center, zoom, bounds, maxBounds, layers, eezoverlay, enable_eez, enable_coastline, coastlineoverlay, citynamesoverlay, enable_citynames } = useAppSelector((state) => state.mapbox);
    const mapRef = useRef();
    const legendColorRef = useRef();
    const legendColorRef2 = useRef();
    const isBing = useRef(false);
    const [wmsLayer, setWmsLayer] = useState(null);
    const [wmsLayer2, setWmsLayer2] = useState(null);
    const [basemap, setBasemap] = useState({ url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; Pacific Community SPC' });
    const [selectedOption, setSelectedOption] = useState('opentopo');
    const [eez, setEEZ] = useState(true);
    const [checkboxChecked, setCheckboxChecked] = useState(true);
    const [geojsonLayer, setGeojsonLayer] = useState(null); // State to track the GeoJSON layer

    const blueIcon = new L.Icon({
        iconUrl: "/blue_marker.png", // URL for the blue marker icon
        iconSize: [25, 41], // Size of the icon
        iconAnchor: [12, 41], // Anchor point of the icon
        popupAnchor: [1, -34], // Popup anchor
        shadowUrl: '/shadow.png', // Shadow of the marker
        shadowSize: [41, 41], // Size of the shadow
    });

    const handleCheckboxChange = (event) => {
        setCheckboxChecked(event.target.checked);
        const isChecked = event.target.checked;

        if (isChecked) {
            setEEZ(true);
        } else {
            setEEZ(false);
        }
    };

    const handleRadioChange = (event) => {
        if (event.target.value === "osm") {
            isBing.current = false;
            setBasemap({ url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; Pacific Community SPC' });
        } else if (event.target.value === "bing") {
            isBing.current = true;
            setBasemap({ url: 'AnIOo4KUJfXXnHB2Sjk8T_zV-tI7FkXplU1efiiyTYrlogDKppodCvsY7-uhRe8P', attribution: '&copy; Pacific Community SPC' });
        } else {
            isBing.current = false;
            setBasemap({ url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', attribution: '&copy; Pacific Community SPC' });
        }
        setSelectedOption(event.target.value);
    };

    const fetchAndPlotGeoJSON = async (url) => {
        try {
            // Remove existing GeoJSON layer if it exists
            if (geojsonLayer) {
                mapRef.current.removeLayer(geojsonLayer);
                setGeojsonLayer(null);
            }

            // Fetch the GeoJSON data
            const response = await fetch(url);
            const geojsonData = await response.json();

            // Normalize longitude values to the range [-180, 180]
            const normalizeLongitude = (lon) => {
                while (lon > 180) lon -= 360;
                while (lon < -180) lon += 360;
                return lon;
            };

            // Process the GeoJSON data to handle points near the dateline
            const processGeoJSON = (geojson) => {
                return {
                    ...geojson,
                    features: geojson.features.map(feature => {
                        const geometry = feature.geometry;
                        if (geometry.type === 'Point') {
                            const [lon, lat] = geometry.coordinates;
                            const normalizedLon = normalizeLongitude(lon);

                            // If the point is near the dateline, create a duplicate on the other side
                            if (Math.abs(normalizedLon) > 150) { // Adjusted threshold
                                return [
                                    {
                                        ...feature,
                                        geometry: {
                                            ...geometry,
                                            coordinates: [normalizedLon, lat],
                                        },
                                    },
                                    {
                                        ...feature,
                                        geometry: {
                                            ...geometry,
                                            coordinates: [normalizedLon + 360, lat],
                                        },
                                    },
                                ];
                            }

                            return {
                                ...feature,
                                geometry: {
                                    ...geometry,
                                    coordinates: [normalizedLon, lat],
                                },
                            };
                        }
                        return feature;
                    }).flat(), // Flatten the array in case of duplicated points
                };
            };

            // Process the GeoJSON data
            const processedGeoJSON = processGeoJSON(geojsonData);

            // Plot the processed GeoJSON data with blue markers and popups
            const newGeojsonLayer = L.geoJSON(processedGeoJSON, {
                id : "tide_gugage",
                pointToLayer: function (feature, latlng) {
                    // Create a marker with a blue icon
                    const marker = L.marker(latlng, { icon: blueIcon });

                    // Check if the feature has a 'name' property for popup content
                    const popupContent = `
                        ${feature.properties.station_na || "No name provided"}
                    `;

                    // Add a popup to the marker
                    marker.bindPopup(popupContent);

                    // Attach a custom event handler to the popup's link
                    marker.on('popupopen', () => {
                        const link = document.querySelector('.popup-link');
                        if (link) {
                            link.addEventListener('click', (e) => {
                                e.preventDefault();
                                // Dispatch the action when the link is clicked
                            });
                        }
                    });

                    marker.on('click', () => {
                        console.log('hello');
                        // Log the 'PORT_NAME' property of the feature
                        var station = feature.properties.AAC;
                        var x = null;
                        var y = null;
                        var sizex = null;
                        var sizey = null;
                        var bbox = null;
                    });

                    return marker; // Return the marker with the popup attached
                },
            });

            // Add the GeoJSON layer to the map
            newGeojsonLayer.addTo(mapRef.current);

            // Store the new GeoJSON layer in state
            setGeojsonLayer(newGeojsonLayer);

        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
        }
    };

    useEffect(() => {
        mapRef.current = L.map('map', {
            center: [-8, 179.3053],
            zoom: 4,
        });
        if (mapRef.current) {
            if (isBing.current) {
                const defaultBasemapLayer = L.tileLayer.bing(basemap.url, {
                    attribution: basemap.attribution,
                }).addTo(mapRef.current);
            } else {
                const defaultBasemapLayer = L.tileLayer(basemap.url, {
                    attribution: basemap.attribution,
                }).addTo(mapRef.current);
            }

            legendColorRef.current = L.control({ position: "topright", id: 24 });
            legendColorRef.current.onAdd = function () {
                // Create a div container for the legend
                var div = L.DomUtil.create("div", "legend");

                // Apply styles for the larger div with white background and pill-shaped edges
                div.style.backgroundColor = "white";
                div.style.padding = "25px";
                div.style.marginTop = "40px";
                div.style.marginRight = "40px";
                div.style.borderRadius = "30px"; // Pill-shaped edges
                div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)"; // Optional: Add a shadow for better visibility
                div.style.width = "400px"; // Set a fixed width

                // Add a title
                var title = L.DomUtil.create("h3", "legend-title", div);
                title.innerHTML = "Library";
                title.style.marginTop = "0"; // Remove default margin for h3
                title.style.textAlign = "center"; // Center-align the title

                // Add a dropdown list
                var dropdownContainer = L.DomUtil.create("div", "dropdown-container", div);
                dropdownContainer.classList.add("d-flex", "align-items-center", "mb-4"); // Bootstrap flexbox classes
                dropdownContainer.style.paddingTop = "10px";

                // Add a label to the left of the dropdown
                var label = L.DomUtil.create("label", "form-label me-2", dropdownContainer); // Bootstrap label classes
                label.innerHTML = "Document Type:";
                label.style.minWidth = "120px"; // Set a minimum width for the label to ensure all text fits in one line
                label.style.fontSize = "15px";
                label.style.paddingTop = "5px";

                // Create the dropdown
                var dropdown = L.DomUtil.create("select", "form-select", dropdownContainer); // Bootstrap form-select class
                dropdown.classList.add("w-100"); // Make the dropdown take up the remaining width

                // Add options to the dropdown
                var options = [
                    { id: 1, text: "-- Select --" },
                    { id: 2, text: "Tide Calendar" },
                    { id: 3, text: "Wave Climate Report" },
                    { id: 4, text: "Research Papers" },
                ];

                // Add options to the dropdown
                options.forEach(function (option) {
                    var opt = L.DomUtil.create("option", "", dropdown);
                    opt.value = option.id; // Set the value to the ID
                    opt.innerHTML = option.text; // Set the display text
                });

                // Add a button at the bottom
                var buttonContainer = L.DomUtil.create("div", "d-flex justify-content-end", div); // Bootstrap flexbox classes for right alignment

                // Add a smaller search button to the right
                var button = L.DomUtil.create("button", "btn btn-primary rounded-pill", buttonContainer); // Bootstrap button classes
                button.innerHTML = "&nbsp;Search&nbsp;";
                button.type = "button"; // Ensure the button type is set (optional)

                // Add an event listener to the button (optional)
                button.addEventListener("click", function () {
                    var selectedId = dropdown.value; // Get the selected ID
                    var selectedText = dropdown.options[dropdown.selectedIndex].text; // Get the selected text

                    if (selectedId == 2) {
                        mapRef.current.eachLayer(function (layer) {
                            const layername = layer.options.id;
                            //console.log(layername);
                            if(layername === "tide_gugage"){
                                mapRef.current.removeLayer(layer);
                            }
                         });
                        const url = "https://opmgeoserver.gem.spc.int/geoserver/spc/wfs?service=WFS&version=1.1.0&request=GetFeature&typeNames=spc:pacific_tide_guage&outputFormat=application/json&srsName=epsg:4326";
                        console.log(url);
                        // Fetch and plot the GeoJSON layer
                        fetchAndPlotGeoJSON(url);
                    } 
                    else if (selectedId == 3) {
                        mapRef.current.eachLayer(function (layer) {
                            const layername = layer.options.id;
                            //console.log(layername);
                            if(layername === "tide_gugage"){
                                mapRef.current.removeLayer(layer);
                            }
                         });
                        const url = "https://opmgeoserver.gem.spc.int/geoserver/spc/wfs?service=WFS&version=1.1.0&request=GetFeature&typeNames=spc:pacific_wave_climate_report&outputFormat=application/json&srsName=epsg:4326";
                        console.log(url);
                        // Fetch and plot the GeoJSON layer
                        fetchAndPlotGeoJSON(url);
                    }
                    else {
                        if (geojsonLayer) {
                            // Remove the layer from the map if it's already added
                            mapRef.current.removeLayer(geojsonLayer);
                            setGeojsonLayer(null); // Reset the state
                        }
                        mapRef.current.eachLayer(function (layer) {
                            const layername = layer.options.id;
                            //console.log(layername);
                            if(layername === "tide_gugage"){
                                mapRef.current.removeLayer(layer);
                            }
                         });
                         
                    }
                });

                L.DomEvent.disableClickPropagation(div);
                return div;
            };
            legendColorRef.current.addTo(mapRef.current);

            //
            legendColorRef2.current = L.control({ position: "bottomright", id: 24 });
            legendColorRef2.current.onAdd = function () {
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
                `;

                // Add event listeners to the radio buttons
                const opentopoRadio = div.querySelector("#opentopo-radio");
                const osmRadio = div.querySelector("#osm-radio");
                const bingRadio = div.querySelector("#bing-radio");
                const eezCheck = div.querySelector("#eez-check");

                // Add event listeners to the radio buttons
                opentopoRadio.addEventListener("change", handleRadioChange);
                osmRadio.addEventListener("change", handleRadioChange);
                bingRadio.addEventListener("change", handleRadioChange);
                eezCheck.addEventListener("change", handleCheckboxChange);
                // Return the div to Leaflet
                L.DomEvent.disableClickPropagation(div);
                return div;
            };
            legendColorRef2.current.addTo(mapRef.current);
        }
        if (eez) {
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

        return () => {
            mapRef.current.remove();
        };
    }, [basemap, eez]);

    return (
        <>
            <div>
                <div id="map" style={{ Zindex: "auto", marginRight: -12, marginLeft: -12 }}></div>
            </div>
        </>
    )
}

export default Library;