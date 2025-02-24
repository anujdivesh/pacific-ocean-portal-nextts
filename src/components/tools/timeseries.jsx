'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'chart.js/auto'; // Import Chart.js
import { useAppSelector } from '@/app/GlobalRedux/hooks';
import { Spinner } from 'react-bootstrap'; 

// Importing dynamic line chart component
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Define an array of fixed colors for the datasets
const fixedColors = [
  'rgb(255, 99, 132)', // Red for the first dataset
  'rgb(54, 162, 235)', // Blue for the second dataset
  'rgb(255, 206, 86)', // Yellow for the third dataset
  'rgb(75, 192, 192)', // Green for the fourth dataset
  'rgb(153, 102, 255)', // Purple for the fifth dataset
];

// Function to get the color based on the index
const getColorByIndex = (index) => {
  return fixedColors[index] || 'rgb(169, 169, 169)'; // Default to grey if more than 5 datasets
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

  const isCoordinatesValid = x !== null && y !== null && sizex !== null && sizey !== null && bbox !== null;

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

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseBody = await res.text();
      if (!responseBody) {
        throw new Error(`No data returned from the server.`);
      }

      const data = JSON.parse(responseBody);
      const times = data.domain.axes.t.values;
      const values = data.ranges[layer].values;

      const formattedTimes = times.map((time) => {
        const date = new Date(time);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      });

      setDataFn(formattedTimes, values, label);
    } catch (error) {
      console.log(`Error fetching ${label} data:`, error);
      setChartData({
        labels: [],
        datasets: [],
      }); // Clear chart data and show "No Data" message
    } finally {
      setIsLoading(false);
    }
  };

  const setChartDataFn = (times, values, label, index) => {
    setChartData((prevData) => {
      const color = getColorByIndex(index); // Get color based on the index
      const newDataset = {
        label,
        data: values,
        borderColor: color,
        backgroundColor: color,
        fill: false,
      };

      return {
        labels: times,
        datasets: prevData.datasets.filter((d) => d.label !== label).concat(newDataset),
      };
    });
  };

  useEffect(() => {
    if (isCoordinatesValid) {
      if (mapLayer.length > 0) {
        lastlayer.current = mapLayer.length - 1;
        const layerInformation = mapLayer[lastlayer.current]?.layer_information;

        if (layerInformation) {
          const { timeseries_variables, timeseries_variable_label, timeseries_url, timeIntervalStartOriginal, timeIntervalEnd, enable_chart_timeseries, url } = layerInformation;
          if (enable_chart_timeseries){
          const variables = timeseries_variables.split(',');
          const labels = timeseries_variable_label.split(',');
          const query_url = timeseries_url;
          const time_range = timeIntervalStartOriginal + "/" + timeIntervalEnd;
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
  }, [mapLayer, isCoordinatesValid, enabledChart]);

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
        datasetsConfig.forEach((dataset, index) => {
          if (selectedDatasets[dataset.key]) {
            fetchData(dataset.timerange, dataset.query_url, dataset.layer, dataset.label, (times, values, label) => {
              setChartDataFn(times, values, label, index); // Pass index for color
            });
          } else {
            setChartData((prevData) => ({
              ...prevData,
              datasets: prevData.datasets.filter((d) => d.label !== dataset.label),
            }));
          }
        });
      }
    }
  }, [selectedDatasets, datasetsConfig, x, y, isCoordinatesValid]);

  const handleCheckboxChange = (datasetKey) => {
    setSelectedDatasets((prevState) => ({
      ...prevState,
      [datasetKey]: !prevState[datasetKey],
    }));
  };

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

  if (!enabledChart) {
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

  if (isLoading) {
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
