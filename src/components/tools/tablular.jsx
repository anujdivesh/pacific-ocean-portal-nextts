'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/GlobalRedux/hooks';
import { Spinner } from 'react-bootstrap'; // Import Spinner from react-bootstrap

function Tabular({ height }) {
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const [data, setData] = useState([]);
  const lastlayer = useRef(0);
  const [selectedDatasets, setSelectedDatasets] = useState({});
  const [datasetsConfig, setDatasetsConfig] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
const [enabledTable, setEnabledTable] = useState(false);
  const { x, y, sizex, sizey, bbox } = useAppSelector((state) => state.coordinate.coordinates);
  const isCoordinatesValid = x !== null && y !== null && sizex !== null && sizey !== null && bbox !== null;

  // General fetch function for data
  const fetchData = async (time, url, layer, label, setDataFn) => {
    setLoading(true); // Set loading to true before fetching
    const urlWithParams = url
      .replace('${layer}', layer)
      .replace('${layer2}', layer)
      .replace('${x}', x)
      .replace('${y}', y)
      .replace('${bbox}', bbox)
      .replace('${sizex}', sizex)
      .replace('${time}', time)
      .replace('${sizey}', sizey);

    try {
      const res = await fetch(urlWithParams);

      // Check if the response is not OK, log and return early without processing further
      if (!res.ok) {
        setDataFn([], [], label); // Handle the case where data is not available
        return;
      }

      const responseText = await res.text();
      try {
        const data = JSON.parse(responseText); // Try parsing JSON only if the response is not empty

        // Ensure the data is in the expected format before accessing it
        if (data && data.domain && data.domain.axes && data.domain.axes.t && data.domain.axes.t.values) {
          const times = data.domain.axes.t.values;
          const values = data.ranges[layer]?.values || []; // In case there's no range data

          const formattedTimes = times.map((time) => {
            const date = new Date(time);
            const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
            const formattedHour = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            return { date: formattedDate, hour: formattedHour };
          });

          setDataFn(formattedTimes, values, label);
        } else {
          setDataFn([], [], label); // No valid data, so clear the data
        }
      } catch (jsonError) {
        setDataFn([], [], label); // If JSON parsing fails, clear the data
      }
    } catch (error) {
      setDataFn([], [], label); // On error, ensure no data is set, prevents crash
    } finally {
      setLoading(false); // Set loading to false once fetching is done
    }
  };

  const setTableData = (times, values, label) => {
    setData((prevData) => {
      const newData = { label, values, times };
      return [...prevData.filter((item) => item.label !== label), newData];
    });
  };

  // Effect to handle coordinate updates and API requests only when valid coordinates are present
  useEffect(() => {
    if (isCoordinatesValid) {
      if (mapLayer.length > 0) {
        lastlayer.current = mapLayer.length - 1;
        const layerInformation = mapLayer[mapLayer.length - 1]?.layer_information;

        if (layerInformation) {
          const { table_variables,enable_chart_table, table_variable_label, table_url, timeIntervalStartOriginal, timeIntervalEnd, url } = layerInformation;
          if(enable_chart_table){
          const variables = table_variables.split(',');
          const labels = table_variable_label.split(',');
          const query_url = table_url;
          const time_range = timeIntervalStartOriginal + "/" + timeIntervalEnd;
          setEnabledTable(enable_chart_table)

          const newDatasetsConfig = variables.map((variable, index) => ({
            key: variable,
            label: labels[index],
            layer: variable,
            query_url: url + "?" + query_url,
            timerange: time_range
          }));

          setDatasetsConfig(newDatasetsConfig);

          const newSelectedDatasets = variables.reduce((acc, variable, index) => {
            acc[variable] = index === 0;
            return acc;
          }, {});

          setSelectedDatasets(newSelectedDatasets);
        }
        }
      }
    }
  }, [mapLayer, isCoordinatesValid]);

  // Fetch data based on selected datasets only if coordinates are valid
  useEffect(() => {
    if (isCoordinatesValid) {
      datasetsConfig.forEach((dataset) => {
        if (selectedDatasets[dataset.key]) {
          fetchData(dataset.timerange, dataset.query_url, dataset.layer, dataset.label, setTableData);
        } else {
          setData((prevData) => prevData.filter((item) => item.label !== dataset.label));
        }
      });
    }
  }, [selectedDatasets, datasetsConfig, x, y, isCoordinatesValid]);

  const handleCheckboxChange = (datasetKey) => {
    setSelectedDatasets((prevState) => ({
      ...prevState,
      [datasetKey]: !prevState[datasetKey],
    }));
  };

  // Early return if coordinates are invalid
  if (!isCoordinatesValid) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
      }}>
      
      <p style={{ fontSize: 16, color: '#333' }}>Click on map to retrieve data.</p>
      </div>

    );
  }

  if (!enabledTable) {
    return (

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
      }}>
      
      <p style={{ fontSize: 16, color: '#333' }}> This Feature is disabled.</p>
      </div>
     
    );
  }
  

  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: `${height}px`,
    fontSize: '20px',
    color: '#007bff',
    fontWeight: 'bold',
  };

  // Show spinner when loading
  if (loading) {
    return (
      <div style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             zIndex: 2,
             display: 'flex',
             alignItems: 'center',
           }}>
             <Spinner animation="border" role="status" variant="primary"/>
                        <span style={{ marginLeft: '10px', fontSize: '18px' }}>Fetching data from api...</span>
           </div>
    );
  }

  // **Important**: Ensure no table renders if there's no data
 /* if (data.length === 0) {
    return (
      <div style={{ display: 'flex', height: `${height}px`, justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: 16, color: '#333' }}>No data available</p>
      </div>
    );
  }*/

  return (
    <div style={{ display: 'flex', height: `${height}px` }}>
      <div>
    
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: 14,
            border: '1px solid #000', // Adding border to the entire table
          }}
          className="table table-bordered"
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  backgroundColor: '#1769aa', // Blue color for header
                  color: 'white', // White font color
                  border: '1px solid #000', // Border for header cells
                }}
              >
                Parameter
              </th>
              {data[0]?.times?.map((time, idx) => (
                <th
                  key={idx}
                  style={{
                    width: '100px',
                    textAlign: 'center',
                    backgroundColor: '#1769aa', // Blue color for header
                    color: 'white', // White font color
                    border: '1px solid #000', // Border for header cells
                  }}
                >
                  {time.date}<br />{time.hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datasetsConfig.map((dataset) => (
              <tr key={dataset.key}>
                <td
                  style={{
                    //fontWeight: 'bold',
                    textAlign: 'left',
                    padding: '5px 10px', // Added padding for left and right
                    //backgroundColor: '#1769aa', // Blue color for cell
                    //color: 'white', // White font color
                    border: '1px solid #000', // Border for cells
                    whiteSpace: 'nowrap', // Prevent text from wrapping
                    overflow: 'hidden', // Hide overflowing text
                    textOverflow: 'ellipsis', // Show ellipsis for overflowing text
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDatasets[dataset.key]}
                    onChange={() => handleCheckboxChange(dataset.key)}
                  />
                  &nbsp;&nbsp;
                  {dataset.label}
                </td>
                {data
                  .filter((row) => row.label === dataset.label)
                  .map((row) =>
                    row.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          textAlign: 'center',
                          padding: '0',
                          border: '1px solid #000', // Border for data cells
                        }}
                      >
                        {value}
                      </td>
                    ))
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tabular;
