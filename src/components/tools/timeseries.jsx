'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'chart.js/auto'; // Import Chart.js

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

function Timeseries({ height }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Query the first layer (sig_wav_ht)
        const res1 = await fetch('https://dev-oceanportal.spc.int/thredds/wms/POP/model/regional/bom/forecast/hourly/wavewatch3/latest.nc?REQUEST=GetTimeseries&LAYERS=sig_wav_ht&QUERY_LAYERS=sig_wav_ht&BBOX=-25.3944,-149.76,334.6056,138.24&SRS=CRS:84&FEATURE_COUNT=5&HEIGHT=600&WIDTH=750&X=535&Y=353&STYLES=default/default&VERSION=1.1.1&TIME=2025-01-30T00:00:00.000Z/2025-02-06T00:00:00.000Z&INFO_FORMAT=text/json');
        const data1 = await res1.json();

        // Query the second layer (pk_wav_per)
        const res2 = await fetch('https://dev-oceanportal.spc.int/thredds/wms/POP/model/regional/bom/forecast/hourly/wavewatch3/latest.nc?REQUEST=GetTimeseries&LAYERS=pk_wav_per&QUERY_LAYERS=pk_wav_per&BBOX=-25.3944,-149.76,334.6056,138.24&SRS=CRS:84&FEATURE_COUNT=5&HEIGHT=600&WIDTH=750&X=535&Y=353&STYLES=default/default&VERSION=1.1.1&TIME=2025-01-30T00:00:00.000Z/2025-02-06T00:00:00.000Z&INFO_FORMAT=text/json');
        const data2 = await res2.json();

        // Extract times and significant wave heights (sig_wav_ht) from the first dataset
        const times = data1.domain.axes.t.values;
        const sigWaveHeights = data1.ranges.sig_wav_ht.values;

        // Extract peak wave period (pk_wav_per) from the second dataset
        const pkWavePeriods = data2.ranges.pk_wav_per.values;

        // Format times as strings for the chart labels
        const formattedTimes = times.map((time) => {
          const date = new Date(time);
          return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        });

        // Set the data for the chart with two datasets
        setChartData({
          labels: formattedTimes,
          datasets: [
            {
              label: 'Significant Wave Height (m)',
              data: sigWaveHeights,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
            {
              label: 'Peak Wave Period (s)',
              data: pkWavePeriods,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: false, // Don't fill this one
              borderDash: [5, 5], // Dashed line for differentiation
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Line
        data={chartData}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            x: {
              ticks: {
                display: true,
                maxRotation: 45, // Rotate labels for readability
                autoSkip: true, // Skip some labels for better display
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
  );
}

export default Timeseries;
