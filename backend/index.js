// Import required modules
const express = require('express');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const cors = require('cors');
const si = require('systeminformation');

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;
app.use(cors())

// Promisify exec for async use
const execAsync = promisify(exec);

// Function to get CPU usage
function getCpuUsage() {
  const cpus = os.cpus();
  return cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const usage = 100 - (100 * cpu.times.idle) / total;
    return usage.toFixed(1);
  });
}

// Function to get CPU temperature
async function getCpuTemp() {
  const { stdout } = await execAsync('vcgencmd measure_temp');
  // Assuming temperature is in Celsius
  return parseFloat(stdout.replace('temp=', '').replace("'C", ""));
}

// Function to convert bytes to GB
function bytesToGB(bytes) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

// Function to get system details
async function getSystemDetails() {
  // Get CPU usage
  const cpuUsage = getCpuUsage();

  // Get memory info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const cpuTemp = await getCpuTemp();

  return {
    cpuTemp,
    cpuUsage,
    memoryUsage: {
      total: parseFloat(bytesToGB(totalMem)),
      used: parseFloat(bytesToGB(usedMem)),
      free: parseFloat(bytesToGB(freeMem)),
    },
  };
}

// Endpoint to get stats details
app.get('/stats', async (req, res) => {
  try {
    const systemDetails = await getSystemDetails();
    res.send(systemDetails);
  } catch (error) {
    console.error('Error fetching system details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//cpu info
app.get('/cpuinfo', async(req,res) => {
  try {
    const cpu = await si.cpu();
    res.json(cpu);
  } catch (error) {
    console.error('Error fetching CPU details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
