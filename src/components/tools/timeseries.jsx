'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'chart.js/auto'; // Import Chart.js

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

function Timeseries({ height }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  }); // Initialize chartData with empty arrays
  const [selectedDatasets, setSelectedDatasets] = useState({
    waveHeight: true,  // Wave height is checked by default
    peakPeriod: false, // Peak period is unchecked by default
  });

  // General fetch function for data
  const fetchData = async (layer, label, setDataFn) => {
    try {
      const res = await fetch(`https://dev-oceanportal.spc.int/thredds/wms/POP/model/regional/bom/forecast/hourly/wavewatch3/latest.nc?REQUEST=GetTimeseries&LAYERS=${layer}&QUERY_LAYERS=${layer}&BBOX=-25.3944,-149.76,334.6056,138.24&SRS=CRS:84&FEATURE_COUNT=5&HEIGHT=600&WIDTH=750&X=535&Y=353&STYLES=default/default&VERSION=1.1.1&TIME=2025-01-30T00:00:00.000Z/2025-02-06T00:00:00.000Z&INFO_FORMAT=text/json`);
      const data = await res.json();

      const times = data.domain.axes.t.values;
      const values = data.ranges[layer].values;

      // Format times as strings for the chart labels
      const formattedTimes = times.map((time) => {
        const date = new Date(time);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      });

      // Call the state update function with the new data
      setDataFn(formattedTimes, values, label);
    } catch (error) {
      console.error(`Error fetching ${label} data:`, error);
    }
  };

  // Set the chart data dynamically
  const setChartDataFn = (times, values, label) => {
    setChartData((prevData) => {
      const newDataset = {
        label,
        data: values,
        borderColor: label === 'Significant Wave Height (m)' ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)',
        backgroundColor: label === 'Significant Wave Height (m)' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)',
        fill: label === 'Significant Wave Height (m)',
        borderDash: label === 'Peak Wave Period (s)' ? [5, 5] : [],
      };

      // Add or update the datasets based on the checkbox state
      return {
        labels: times,
        datasets: prevData.datasets.filter(d => d.label !== label).concat(newDataset), // Ensure no duplicates
      };
    });
  };

  // Fetch initial Wave Height data
  useEffect(() => {
    if (selectedDatasets.waveHeight) {
      fetchData('sig_wav_ht', 'Significant Wave Height (m)', setChartDataFn);
    } else {
      // Remove Wave Height data from the chart when unchecked
      setChartData((prevData) => ({
        ...prevData,
        datasets: prevData.datasets.filter((dataset) => dataset.label !== 'Significant Wave Height (m)'),
      }));
    }
  }, [selectedDatasets.waveHeight]);

  // Fetch Peak Period data if checked
  useEffect(() => {
    if (selectedDatasets.peakPeriod) {
      fetchData('pk_wav_per', 'Peak Wave Period (s)', setChartDataFn);
    } else {
      // Remove Peak Period data from the chart when unchecked
      setChartData((prevData) => ({
        ...prevData,
        datasets: prevData.datasets.filter((dataset) => dataset.label !== 'Peak Wave Period (s)'),
      }));
    }
  }, [selectedDatasets.peakPeriod]);

  // Handle checkbox changes
  const handleCheckboxChange = (dataset) => {
    setSelectedDatasets((prevState) => {
      const newState = { ...prevState, [dataset]: !prevState[dataset] };
      return newState;
    });
  };

  if (!chartData.labels.length) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', height: `${height}px` }}>
      {/* Checkbox List */}
      <div style={{ marginRight: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ fontSize: '13px', marginBottom: '0px' }}>
          <input
            type="checkbox"
            checked={selectedDatasets.waveHeight}
            onChange={() => handleCheckboxChange('waveHeight')}
            style={{ marginRight: '5px' }}
          />
          Wave Height
        </label>
        <label style={{ fontSize: '13px', marginBottom: '0px' }}>
          <input
            type="checkbox"
            checked={selectedDatasets.peakPeriod}
            onChange={() => handleCheckboxChange('peakPeriod')}
            style={{ marginRight: '5px' }}
          />
          Peak Period
        </label>
      </div>

      {/* Vertical Divider */}
      <div style={{
        width: '1px',
        backgroundColor: '#ccc', // Light gray color for the divider
        margin: '0 20px', // Adds space between the checkbox and the chart
      }}></div>

      {/* Line Chart */}
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
