import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Tooltip
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WarningIcon from '@mui/icons-material/Warning';

// API services
import { getRecipes, addRecipe, updateRecipe, deleteRecipe, prepareRecipe, getInventory } from '../services/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPrepareDialog, setOpenPrepareDialog] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'g'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesData, inventoryData] = await Promise.all([
        getRecipes(),
        getInventory()
      ]);
      setRecipes(recipesData);
      setInventory(inventoryData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (recipe = null) => {
    if (recipe) {
      setCurrentRecipe(recipe);
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        ingredients: [...recipe.ingredients]
      });
    } else {
      setCurrentRecipe(null);
      setFormData({
        name: '',
        description: '',
        ingredients: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentIngredient({
      name: '',
      quantity: '',
      unit: 'g'
    });
  };

  const handleOpenDeleteDialog = (recipe) => {
    setCurrentRecipe(recipe);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenPrepareDialog = (recipe) => {
    setCurrentRecipe(recipe);
    setOpenPrepareDialog(true);
  };

  const handleClosePrepareDialog = () => {
    setOpenPrepareDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setCurrentIngredient({
      ...currentIngredient,
      [name]: name === 'quantity' ? parseFloat(value) || '' : value
    });
  };

  const handleAddIngredient = () => {
    // Validate ingredient
    if (!currentIngredient.name || currentIngredient.quantity === '' || !currentIngredient.unit) {
      setSnackbar({
        open: true,
        message: 'Please fill all ingredient fields',
        severity: 'error'
      });
      return;
    }

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ...currentIngredient }]
    });

    // Reset current ingredient
    setCurrentIngredient({
      name: '',
      quantity: '',
      unit: 'g'
    });
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name || formData.ingredients.length === 0) {
        setSnackbar({
          open: true,
          message: 'Please provide a name and at least one ingredient',
          severity: 'error'
        });
        return;
      }

      if (currentRecipe) {
        // Update existing recipe
        await updateRecipe(currentRecipe._id, formData);
        setSnackbar({
          open: true,
          message: 'Recipe updated successfully',
          severity: 'success'
        });
      } else {
        // Add new recipe
        await addRecipe(formData);
        setSnackbar({
          open: true,
          message: 'Recipe added successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchData();
    } catch (err) {
      console.error('Error saving recipe:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save recipe',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(currentRecipe._id);
      setSnackbar({
        open: true,
        message: 'Recipe deleted successfully',
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchData();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete recipe',
        severity: 'error'
      });
    }
  };

  const handlePrepare = async () => {
    try {
      await prepareRecipe(currentRecipe._id);
      setSnackbar({
        open: true,
        message: `Recipe "${currentRecipe.name}" prepared successfully! Inventory updated.`,
        severity: 'success'
      });
      handleClosePrepareDialog();
      fetchData();
    } catch (err) {
      console.error('Error preparing recipe:', err);
      setSnackbar({
        open: true,
        message: 'Failed to prepare recipe. Check if you have enough ingredients.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const checkIngredientAvailability = (recipe) => {
    if (!inventory.length) return { available: false, missingIngredients: [] };
    
    const missingIngredients = [];
    
    for (const recipeIngredient of recipe.ingredients) {
      const inventoryItem = inventory.find(item => 
        item.name.toLowerCase() === recipeIngredient.name.toLowerCase() && 
        item.unit === recipeIngredient.unit
      );
      
      if (!inventoryItem || inventoryItem.quantity < recipeIngredient.quantity) {
        missingIngredients.push({
          name: recipeIngredient.name,
          required: recipeIngredient.quantity,
          available: inventoryItem ? inventoryItem.quantity : 0,
          unit: recipeIngredient.unit
        });
      }
    }
    
    return {
      available: missingIngredients.length === 0,
      missingIngredients
    };
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Recipe Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Recipe
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {recipes.length > 0 ? (
          recipes.map((recipe) => {
            const availability = checkIngredientAvailability(recipe);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card className="recipe-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" component="div">
                        {recipe.name}
                      </Typography>
                      {availability.available ? (
                        <Chip label="Can Prepare" color="success" size="small" />
                      ) : (
                        <Tooltip title="Missing ingredients">
                          <Chip icon={<WarningIcon />} label="Insufficient Ingredients" color="error" size="small" />
                        </Tooltip>
                      )}
                    </Box>
                    
                    {recipe.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {recipe.description}
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                      Ingredients:
                    </Typography>
                    <List dense>
                      {recipe.ingredients.map((ingredient, index) => {
                        const inventoryItem = inventory.find(item => 
                          item.name.toLowerCase() === ingredient.name.toLowerCase() && 
                          item.unit === ingredient.unit
                        );
                        
                        const isAvailable = inventoryItem && inventoryItem.quantity >= ingredient.quantity;
                        
                        return (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemText 
                                primary={
                                  <Typography variant="body2">
                                    {ingredient.name}
                                    {!isAvailable && (
                                      <Chip 
                                        size="small" 
                                        label="Low" 
                                        color="error" 
                                        sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} 
                                      />
                                    )}
                                  </Typography>
                                }
                                secondary={`${ingredient.quantity} ${ingredient.unit}`} 
                              />
                            </ListItem>
                            {index < recipe.ingredients.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<RestaurantIcon />}
                      onClick={() => handleOpenPrepareDialog(recipe)}
                      disabled={!availability.available}
                      color="primary"
                      variant="contained"
                    >
                      Prepare
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small" onClick={() => handleOpenDialog(recipe)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDeleteDialog(recipe)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              No recipes found. Add your first recipe to get started!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Recipe Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentRecipe ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Recipe Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Ingredients
              </Typography>
              <Divider />
            </Grid>
            
            {/* Current ingredients list */}
            <Grid item xs={12}>
              {formData.ingredients.length > 0 ? (
                <List>
                  {formData.ingredients.map((ingredient, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemoveIngredient(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={ingredient.name} 
                        secondary={`${ingredient.quantity} ${ingredient.unit}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                  No ingredients added yet. Add ingredients below.
                </Typography>
              )}
            </Grid>
            
            {/* Add new ingredient form */}
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel id="ingredient-select-label">Ingredient</InputLabel>
                <Select
                  labelId="ingredient-select-label"
                  name="name"
                  value={currentIngredient.name}
                  onChange={handleIngredientChange}
                  input={<OutlinedInput label="Ingredient" />}
                >
                  {inventory.map((item) => (
                    <MenuItem key={item._id} value={item.name}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={currentIngredient.quantity}
                onChange={handleIngredientChange}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel id="unit-select-label">Unit</InputLabel>
                <Select
                  labelId="unit-select-label"
                  name="unit"
                  value={currentIngredient.unit}
                  onChange={handleIngredientChange}
                  input={<OutlinedInput label="Unit" />}
                >
                  {['kg', 'g', 'l', 'ml', 'pcs', 'tbsp', 'tsp', 'cup'].map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                variant="outlined" 
                onClick={handleAddIngredient} 
                fullWidth 
                sx={{ height: '100%' }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentRecipe ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the recipe "{currentRecipe?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prepare Recipe Confirmation Dialog */}
      <Dialog open={openPrepareDialog} onClose={handleClosePrepareDialog}>
        <DialogTitle>Prepare Recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to prepare "{currentRecipe?.name}"? This will deduct the required ingredients from your inventory.
          </DialogContentText>
          
          {currentRecipe && (
            <List sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Required Ingredients:</Typography>
              {currentRecipe.ingredients.map((ingredient, index) => (
                <ListItem key={index} dense>
                  <ListItemText 
                    primary={`${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`} 
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrepareDialog}>Cancel</Button>
          <Button onClick={handlePrepare} color="primary" variant="contained">
            Prepare
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Recipes;