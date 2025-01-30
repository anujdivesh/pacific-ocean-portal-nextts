import React from 'react';

function DynamicImage({ height }) {
  // Set default height to 200px if height is not provided
  const imgHeight = height || 200;

  return (
    <div style={{ width: '100%', height: `${imgHeight}px`, overflow: 'hidden' }}>
      <img
        src="/oceanportal/sst.png"  // Image path
        alt="Ocean Portal SST"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain', // Ensures the entire image is visible
        }}
      />
    </div>
  );
}

export default DynamicImage;
