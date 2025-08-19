import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inventory API calls
export const getInventory = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data.inventory;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const addInventoryItem = async (item) => {
  try {
    const response = await api.post('/inventory', item);
    return response.data;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (id, item) => {
  try {
    const response = await api.put(`/inventory/${id}`, item);
    return response.data;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

export const getLowStockItems = async () => {
  try {
    const response = await api.get('/low-stock');
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

// Recipe API calls
export const getRecipes = async () => {
  try {
    const response = await api.get('/recipes');
    return response.data.recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

export const getRecipe = async (id) => {
  try {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

export const addRecipe = async (recipe) => {
  try {
    const response = await api.post('/recipes', recipe);
    return response.data;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (id, recipe) => {
  try {
    const response = await api.put(`/recipes/${id}`, recipe);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const prepareRecipe = async (id) => {
  try {
    const response = await api.post(`/recipes/${id}/prepare`);
    return response.data;
  } catch (error) {
    console.error('Error preparing recipe:', error);
    throw error;
  }
};

// Food Detection API calls
export const detectFood = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/detect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error detecting food:', error);
    throw error;
  }
};

export default {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getRecipes,
  getRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  prepareRecipe,
  detectFood,
};