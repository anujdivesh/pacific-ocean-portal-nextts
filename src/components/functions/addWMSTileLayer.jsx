import L from 'leaflet';
import $ from 'jquery';


/**
 * Adds a WMS tile layer to a Leaflet map.
 *
 * @param {L.Map} map - The Leaflet map instance to which the WMS layer will be added.
 * @param {string} url - The URL of the WMS service.
 * @param {Object} [options] - Optional parameters for the WMS layer.
 * @param {string} [options.layers] - The layers to request from the WMS service.
 * @param {string} [options.format='image/png'] - The format of the image requested from the WMS service.
 * @param {boolean} [options.transparent=true] - Whether the WMS layer is transparent.
 * @param {Object} [options.params] - Additional parameters to include in the WMS request.
 * @param {function} handleShow 
 */



const addWMSTileLayer = (map, url, options = {}, handleShow) => {

    // Set default options
    const defaultOptions = {
        layers: '',
        format: 'image/png',
        transparent: true,
        ...options.params,
    };

    // Create the WMS tile layer
    const wmsLayer = L.tileLayer.wms(url, {
        layers: defaultOptions.layers,
        format: defaultOptions.format,
        transparent: defaultOptions.transparent,
        ...options,
    });

    // Add the layer to the map
   // wmsLayer.addTo(map);

    //reload broken tiles
    const RETRY_LIMIT = 3; // Maximum number of retry attempts
    const RETRY_DELAY = 3000; 

    const handleTileError = (event) => {
        const tile = event.tile;
        checkUrlExists(tile.src)
            .then(exists => {
                if (exists) {
                    retryTile(tile, tile.src, 1); // Start retrying
                }
            })
            .catch(err => {
                console.error('Error checking tile URL:');
            });
    };

    const checkUrlExists = (url) => {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    resolve(xhr.status >= 200 && xhr.status < 300);
                }
            };
            xhr.send();
        });
    };

    const retryTile = (tile, src, attempt) => {
        if (attempt <= RETRY_LIMIT) {
            setTimeout(() => {
                tile.src = ''; // Clear src to trigger a reload
                tile.src = src; // Reset src to reload the tile
                retryTile(tile, src, attempt + 1); // Schedule next retry
            }, RETRY_DELAY);
        } 
    };

    wmsLayer.on('tileerror', handleTileError);

    // Feature info on click event
    map.on('click', function (evt) {
        const latlng = evt.latlng;
        getFeatureInfo(latlng, url, wmsLayer, map);
    });

    // Function to retrieve GetFeatureInfo from WMS
    const getFeatureInfo = (latlng, url, wmsLayer, map) => {
        const point = map.latLngToContainerPoint(latlng, map.getZoom());
        const size = map.getSize();
        
        // Construct the GetFeatureInfo URL
        const params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:4326',
            styles: wmsLayer.options.styles,
            transparent: wmsLayer.options.transparent,
            version: wmsLayer.options.version || '1.1.1',
            format: wmsLayer.options.format,
            bbox: map.getBounds().toBBoxString(),
            height: Math.round(size.y),
            width: Math.round(size.x),
            layers: wmsLayer.options.layers,
            query_layers: wmsLayer.options.layers,
            info_format: 'text/html',
        };

        params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);
        params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);

        const featureInfoUrl = url + L.Util.getParamString(params, url, true);

        // Perform the AJAX request to get the feature info
        $.ajax({
            url: featureInfoUrl,
            success: function (data) {
                const doc = (new DOMParser()).parseFromString(data, "text/html");
                if (doc.body.innerHTML.trim().length > 0) {
                    showFeatureInfoPopup(doc.body.innerHTML, latlng, map);
                } else {
                    alert('No feature information available for this location.');
                }
            },
            error: function () {
                alert('Error retrieving feature info.');
            }
        });
    };
/*
    // Function to show the feature info in a popup
    const showFeatureInfoPopup = (content, latlng, map) => {
        const el = document.createElement('html');
        el.innerHTML = content;

        // Example: assuming the feature info is in a table and extracting the text
        const p = el.getElementsByTagName('td');
        let featureInfo = "No Data";
        if (p.length > 5) {
            featureInfo = p[5] ? p[5].textContent.trim() : "No Data";
        }

        // Create the popup content
        //const popupContent = `<p>${featureInfo}</p><p>Timeseries View</p>`;

        /*const popupContent = `
  <p>${featureInfo}</p>
  <p>Timeseries View</p>
  <a href="javascript:void(0);" onclick="handleShow()">Open Timeseries</a>
`;

const popupContent = `
<p>${featureInfo}</p>
<p>Timeseries View</p>
<a href="javascript:void(0);" onclick="handleShow">Open Timeseries</a>
`;

        // Show the popup
        L.popup({ maxWidth: 800 })
            .setLatLng(latlng)
            .setContent(popupContent)
            .openOn(map);
    };*/

    // Function to show the feature info in a popup
const showFeatureInfoPopup = (content, latlng, map) => {
    const el = document.createElement('html');
    el.innerHTML = content;

    // Example: assuming the feature info is in a table and extracting the text
    const p = el.getElementsByTagName('td');
    let featureInfo = "No Data";
    if (p.length > 5) {
        featureInfo = p[5] ? p[5].textContent.trim() : "No Data";
    }

    // Create popup content with a dynamic click handler for 'handleShow'
    const popupContent = `
    <p>Value: ${featureInfo}</p>
    <a href="javascript:void(0);" class="open-timeseries-link" style="display: block; margin-top: -10;">GetTimeseries</a>
`;


    // Show the popup
    const popup = L.popup({ maxWidth: 800 })
        .setLatLng(latlng)
        .setContent(popupContent)
        .openOn(map);

    // Attach event listener to the link inside the popup
    const link = popup._contentNode.querySelector('.open-timeseries-link');
    if (link) {
        link.addEventListener('click', () => {
            handleShow(); // This will now trigger the handleShow function
        });
    }
};

    return wmsLayer; // Return the layer instance
};

    /*
    const handleTileError = (event) => {
      console.log('Force reloading tiles.')
      const tile = event.tile;
      const currentSrc = tile.src;
      retryTile(tile, currentSrc, 1); // Start retrying with the first attempt
    };

    const retryTile = (tile, src, attempt) => {
      if (attempt <= RETRY_LIMIT) {
        setTimeout(() => {
          tile.src = ''; // Clear the src to trigger a retry
          tile.src = src; // Set the src again to reload the tile
          retryTile(tile, src, attempt + 1); // Schedule the next retry attempt
        }, RETRY_DELAY);
      }
    };

    wmsLayer.on('tileerror', handleTileError);
    
    return wmsLayer; // Return the layer instance if needed
};
*/

export default addWMSTileLayer;