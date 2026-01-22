/**
 * Simple Test Page to verify rendering
 */

import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
      <h1>Test Page - If you see this, React is working!</h1>
      <p>This is a simple test to verify the app is rendering.</p>
    </div>
  );
};

export default TestPage;
