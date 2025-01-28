'use client';
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'chart.js/auto'; // Import Chart.js


const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
    ssr: false,
  });
  
function Timeseries({ height, data }) {
  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            x: {
              ticks: {
                display: true,
              },
            },
            y: {
              ticks: {
                display: true,
              },
            },
          },
        }}
        height={height} // Set chart height dynamically
      />
    </div>
  );
}

export default Timeseries;
