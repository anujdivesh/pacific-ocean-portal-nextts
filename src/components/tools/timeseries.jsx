'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'chart.js/auto'; // Import Chart.js
import { useAppSelector } from '@/app/GlobalRedux/hooks';

// Importing dynamic line chart component
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Random color generator function
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256); // Red
  const g = Math.floor(Math.random() * 256); // Green
  const b = Math.floor(Math.random() * 256); // Blue
  return `rgb(${r}, ${g}, ${b}, 0.8)`;
};

function Timeseries({ height }) {
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const lastlayer = useRef(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [selectedDatasets, setSelectedDatasets] = useState({});
  const [datasetsConfig, setDatasetsConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  const { x, y, sizex, sizey, bbox } = useAppSelector((state) => state.coordinate.coordinates);
  const [enabledChart, setEnabledChart] = useState(false);

  // Check if coordinates are valid (not null)
  const isCoordinatesValid = x !== null && y !== null && sizex !== null && sizey !== null && bbox !== null;

  // General fetch function for data
  const fetchData = async (time, url, layer, label, setDataFn) => {
    try {
      setIsLoading(true); // Set loading to true when fetching data
      const urlWithParams = url
        .replace('${layer}', layer)
        .replace('${layer2}', layer)
        .replace('${x}', x)
        .replace('${y}', y)
        .replace('${bbox}', bbox)
        .replace('${sizex}', sizex)
        .replace('${time}', time)
        .replace('${sizey}', sizey);

      const res = await fetch(urlWithParams);

      // Check if the response is ok and not empty
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check if the response body is empty
      const responseBody = await res.text();
      if (!responseBody) {
        throw new Error(`No data returned from the server.`);
      }

      // Parse the JSON response
      const data = JSON.parse(responseBody);

      const times = data.domain.axes.t.values;
      const values = data.ranges[layer].values;

      const formattedTimes = times.map((time) => {
        const date = new Date(time);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      });

      setDataFn(formattedTimes, values, label);
    } catch (error) {
      console.log(`Error fetching ${label} data:`, error); // Log error but don't throw it
      setChartData({
        labels: [],
        datasets: [],
      }); // Clear chart data and show "No Data" message
    } finally {
      setIsLoading(false); // Set loading to false once fetching is done
    }
  };

  const setChartDataFn = (times, values, label) => {
    setChartData((prevData) => {
      var color = getRandomColor();
      const newDataset = {
        label,
        data: values,
        borderColor: color,
        backgroundColor: color,
        fill: true,
      };

      return {
        labels: times,
        datasets: prevData.datasets.filter((d) => d.label !== label).concat(newDataset),
      };
    });
  };

  // Effect to handle coordinate updates and API requests only when valid coordinates are present
  useEffect(() => {
    if (isCoordinatesValid) {
      if (mapLayer.length > 0) {
        lastlayer.current = mapLayer.length - 1;
        const layerInformation = mapLayer[lastlayer.current]?.layer_information;

        if (layerInformation) {
          const { timeseries_variables, timeseries_variable_label, timeseries_url, timeIntervalStart, timeIntervalEnd, enable_chart_timeseries, url } = layerInformation;
          if (enable_chart_timeseries){
          const variables = timeseries_variables.split(',');
          const labels = timeseries_variable_label.split(',');
          const query_url = timeseries_url;
          const time_range = timeIntervalStart + "/" + timeIntervalEnd;
          const enable_chart = enable_chart_timeseries;
          setEnabledChart(enable_chart);

          const newDatasetsConfig = variables.map((variable, index) => ({
            key: variable,
            label: labels[index],
            layer: variable,
            query_url: url + "?" + query_url,
            timerange: time_range,
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
  }, [mapLayer, isCoordinatesValid, enabledChart]); // Trigger when coordinates or mapLayer changes

  // Effect to fetch data based on selected datasets only if coordinates are valid
  useEffect(() => {
    if (isCoordinatesValid) {
      const selectedDatasetKeys = Object.keys(selectedDatasets);
      const anySelected = selectedDatasetKeys.some((key) => selectedDatasets[key]);

      if (!anySelected) {
        setChartData({
          labels: [],
          datasets: [],
        });
      } else {
        datasetsConfig.forEach((dataset) => {
          if (selectedDatasets[dataset.key]) {
            fetchData(dataset.timerange, dataset.query_url, dataset.layer, dataset.label, setChartDataFn);
          } else {
            setChartData((prevData) => ({
              ...prevData,
              datasets: prevData.datasets.filter((d) => d.label !== dataset.label),
            }));
          }
        });
      }
    }
  }, [selectedDatasets, datasetsConfig, x, y, isCoordinatesValid]); // Add coordinates check to dependencies

  const handleCheckboxChange = (datasetKey) => {
    setSelectedDatasets((prevState) => ({
      ...prevState,
      [datasetKey]: !prevState[datasetKey],
    }));
  };

  // Early return if coordinates are invalid
  if (!isCoordinatesValid) {
    return (
      <div style={{ display: 'flex', height: `${height}px`, justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: 16, color: '#333' }}>
          Click on map to view the timeseries
        </p>
      </div>
    );
  }

  if (!enabledChart) {
    return (
      <div style={{ display: 'flex', height: `${height}px`, justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: 16, color: '#333' }}>
          This Feature is disabled.
        </p>
      </div>
    );
  }

  // Spinner style (you can customize this)
  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: `${height}px`,
    fontSize: '20px',
    color: '#007bff',
    fontWeight: 'bold',
  };

  // Check if no data is available
 /* if (chartData.datasets.length === 0 && !isLoading) {
    return (
      <div style={{ display: 'flex', height: `${height}px`, justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: 16, color: '#333' }}>No data available</p>
      </div>
    );
  }
*/
  // Show spinner when loading
  if (isLoading) {
    return (
      <div style={spinnerStyle}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: `${height}px` }}>
      <div style={{ marginRight: '20px', display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 12 }}>
          DS: {mapLayer[lastlayer.current]?.layer_information?.layer_title}
        </p>
        {datasetsConfig.map((dataset) => (
          <label key={dataset.key} style={{ fontSize: '13px', marginBottom: '0px' }}>
            <input
              type="checkbox"
              checked={selectedDatasets[dataset.key]}
              onChange={() => handleCheckboxChange(dataset.key)}
              style={{ marginRight: '5px' }}
            />
            {dataset.label}
          </label>
        ))}
      </div>

      <div
        style={{
          width: '1px',
          backgroundColor: '#ccc',
          margin: '0 20px',
        }}
      ></div>

      <div style={{ flex: 1, position: 'relative' }}>
        <Line
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              x: {
                ticks: {
                  display: true,
                  maxRotation: 45,
                  autoSkip: true,
                },
              },
              y: {
                ticks: {
                  display: true,
                },
              },
            },
          }}
          height={height}
        />
      </div>
    </div>
  );
}

export default Timeseries;
