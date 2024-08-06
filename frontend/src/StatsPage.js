import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, Typography, Box, LinearProgress } from '@mui/material';

// Function to fetch system details from the server
const fetchSystemDetails = async () => {
  try {
    const response = await axios.get('http://raspberrypi.local:3000/stats');
    return response.data;
    
  } catch (error) {
    console.error('Error fetching system details:', error);
    return null;
  }
};



// Home Component
const Home = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [cpuInfo, setCpuInfo] = useState(null);

  useEffect(() => {
    fetch('http://raspberrypi.local:3000/cpuinfo')
      .then(response => response.json())
      .then(data => {
        setCpuInfo(data);
        
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSystemDetails();
      setSystemInfo(data);
    };

    // Fetch data initially
    fetchData();
//a
    // Fetch data every second
    const intervalId = setInterval(fetchData, 1000);
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);


  if (!systemInfo && !cpuInfo) {
    return <Typography>Loading...</Typography>;
  }
    
  const { os = {}, cpuTemp, cpuUsage = [], memoryUsage = {} } = systemInfo;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <Typography variant="h3" gutterBottom style={{ marginBottom: '24px' }}>
        Raspberry Pi
      </Typography>

      <Card style={{ width: '100%', maxWidth: '600px' }}>
        <CardHeader title="System Information" />
        <CardContent>
        {cpuInfo && <Box marginBottom={2}>
            {[
              ["Manufacturer", cpuInfo.manufacturer],
              ["Brand", cpuInfo.brand],
              ["Vendor", cpuInfo.vendor],
              ["Family", cpuInfo.family],
              ["Model", cpuInfo.model],
              ["Performance Cores", cpuInfo.performanceCores],
              ["Efficiency Cores", cpuInfo.efficiencyCores],
              ["CPU Temperature", `${cpuTemp ? cpuTemp.toFixed(1) : 'N/A'}°C`],
            ].map(([label, value]) => (
              <Box key={label} display="flex" justifyContent="space-between" marginBottom={1}>
                <Typography variant="body1" color="textSecondary">
                  {label}:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
     }

          <Box marginBottom={2}>
            <Typography variant="h6" gutterBottom>
              CPU Usage
            </Typography>
            {cpuUsage.map((usage, index) => (
              <Box key={index} marginBottom={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Core {index}
                  </Typography>
                  <Typography variant="body2">
                    {usage}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={parseFloat(usage)} style={{ height: '8px', borderRadius: '4px' }} />
              </Box>
            ))}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Memory Usage
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="textSecondary">
                Used
              </Typography>
              <Typography variant="body2">
                {memoryUsage.used?.toFixed(2)} / {memoryUsage.total?.toFixed(2)} GB
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(memoryUsage.used / memoryUsage.total) * 100}
              style={{ height: '8px', borderRadius: '4px' }}
            />
          </Box>
        </CardContent>
      </Card>

    </main>
  );
};

export default Home;
