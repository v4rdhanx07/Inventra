import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// API services
import { getInventory, getLowStockItems, getRecipes } from '../services/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [inventoryData, lowStockData, recipesData] = await Promise.all([
          getInventory(),
          getLowStockItems(),
          getRecipes()
        ]);
        
        setInventory(inventoryData);
        setLowStockItems(lowStockData);
        setRecipes(recipesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for inventory chart
  const chartData = {
    labels: inventory.slice(0, 10).map(item => item.name),
    datasets: [
      {
        label: 'Current Quantity',
        data: inventory.slice(0, 10).map(item => item.quantity),
        backgroundColor: 'rgba(63, 81, 181, 0.6)',
        borderColor: 'rgba(63, 81, 181, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Inventory Levels',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Inventory Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Inventory Summary" />
            <CardContent>
              <Typography variant="h3" align="center" color="primary">
                {inventory.length}
              </Typography>
              <Typography variant="subtitle1" align="center">
                Total Items in Inventory
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/inventory')}
                >
                  View Inventory
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alert */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Low Stock Alert" 
              sx={{ 
                backgroundColor: lowStockItems.length > 0 ? 'rgba(244, 67, 54, 0.1)' : 'inherit',
                color: lowStockItems.length > 0 ? 'error.main' : 'inherit'
              }}
            />
            <CardContent>
              <Typography variant="h3" align="center" color={lowStockItems.length > 0 ? "error" : "primary"}>
                {lowStockItems.length}
              </Typography>
              <Typography variant="subtitle1" align="center">
                Items Low in Stock
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color={lowStockItems.length > 0 ? "error" : "primary"}
                  fullWidth
                  onClick={() => navigate('/inventory')}
                  disabled={lowStockItems.length === 0}
                >
                  View Low Stock Items
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recipes */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Recipes" />
            <CardContent>
              <Typography variant="h3" align="center" color="primary">
                {recipes.length}
              </Typography>
              <Typography variant="subtitle1" align="center">
                Available Recipes
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/recipes')}
                >
                  Manage Recipes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Levels
            </Typography>
            {inventory.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                No inventory data available to display
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Low Stock Items List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            {lowStockItems.length > 0 ? (
              <List>
                {lowStockItems.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <ListItemText 
                        primary={item.name} 
                        secondary={`${item.quantity} ${item.unit} remaining (Min: ${item.minQuantity})`} 
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                No low stock items - Inventory levels are good!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => navigate('/detection')}
                >
                  Detect Food Items
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/inventory')}
                >
                  Update Inventory
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/recipes')}
                >
                  Prepare Recipe
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;