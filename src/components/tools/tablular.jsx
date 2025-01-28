// src/components/Tabular.jsx
import React from 'react';

// Function to generate random values for the table (e.g., wind speed, wave height, etc.)
const generateRandomData = (labels, dateCount) => {
  const data = [];
  const randomRange = [0, 10, 20, 30, 40]; // Values range for demonstration

  labels.forEach((label) => {
    const rowData = [];
    for (let i = 0; i < dateCount; i++) {
      // Generate a random value for each date
      rowData.push(randomRange[Math.floor(Math.random() * randomRange.length)]);
    }
    data.push({ label, values: rowData });
  });

  return data;
};

// Function to calculate the gradient color for wind speed (background) with opacity
const getWindSpeedBackgroundColor = (value, min, max) => {
  // Normalize the value to a 0-1 range
  const normalized = (value - min) / (max - min);
  
  // Calculate the red and green channels based on the normalized value
  const green = Math.min(255, Math.floor((1 - normalized) * 255));
  const red = Math.min(255, Math.floor(normalized * 255));

  // Return the color in rgba format for background with opacity of 0.5
  return `rgba(${red}, ${green}, 0, 0.5)`; // Alpha set to 0.5 for 50% opacity
};

// Tabular component with specific column and row formatting
function Tabular({ labels, dateCount = 24 }) { // Default to 24 columns (for 24 hours)
  const data = generateRandomData(labels, dateCount);

  // Get the wind speed row
  const windSpeedRow = data.find(row => row.label === "Wind Speed");
  const minWindSpeed = Math.min(...windSpeedRow.values);
  const maxWindSpeed = Math.max(...windSpeedRow.values);

  // Generate the date headers (e.g., "Tue\n28th\n12hr")
  const generateDateHeaders = () => {
    const dateHeaders = [];
    for (let i = 0; i < dateCount; i++) {
      const date = new Date();
      date.setHours(date.getHours() + i); // Increment hour by one for each date
      const day = date.toLocaleString('en-US', { weekday: 'short' });
      const month = date.getDate();
      const hour = date.getHours();
      // Format date to split it across lines
      dateHeaders.push(`${day}\n${month}th\n${hour}hr`);
    }
    return dateHeaders;
  };

  const dateHeaders = generateDateHeaders();

  return (
    <div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse', // Ensures no space between borders of adjacent cells
          textAlign: 'center', // Center align all content in cells
          fontSize:14
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: '200px', // Fixed width for the first column (label column)
                textAlign: 'center',
                fontWeight: 'bold',
                padding: '0', // Remove padding
                backgroundColor: '#d3d3d3', // Grey background for the first column header
                border: '1px solid white', // White border
              }}
            >
              Parameter
            </th>
            {dateHeaders.map((header, index) => (
              <th
                key={index}
                style={{
                  width: '50px', // Slim column width (adjusted to remove extra space)
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap', // Allows line breaks in text
                  wordWrap: 'break-word', // Ensures content wraps to the next line
                  padding: '0', // Remove padding
                  backgroundColor: '#d3d3d3', // Grey background for date header cells
                  border: '1px solid white', // White border for headers
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td
                style={{
                  width: '200px', // Fixed width for the first column
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '0', // Remove padding
                  backgroundColor: '#d3d3d3', // Grey background for the first column in rows
                  border: '1px solid white', // White border
                }}
              >
                {row.label}
              </td>
              {row.values.map((value, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    width: '50px', // Slim column width (adjusted to remove extra space)
                    textAlign: 'center',
                    padding: '0', // Remove padding
                    backgroundColor: 'transparent', // Keep values with transparent background
                    border: '1px solid white', // White border for data cells
                    backgroundColor: row.label === "Wind Speed" ? getWindSpeedBackgroundColor(value, minWindSpeed, maxWindSpeed) : 'transparent', // Apply gradient background to wind speed cells with opacity
                  }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tabular;
