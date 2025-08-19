import React, { useState, useRef } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import Webcam from 'react-webcam';

// Icons
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';

// API services
import { detectFood } from '../services/api';

const Detection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset state when changing tabs
    setCapturedImage(null);
    setSelectedFile(null);
    setDetectionResults(null);
    setError(null);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setDetectionResults(null);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setDetectionResults(null);
    setError(null);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setDetectionResults(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const processDetection = async (imageSource) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      if (activeTab === 0) { // Webcam
        // Convert base64 to blob
        const blob = await fetch(imageSource).then(res => res.blob());
        formData.append('image', blob, 'webcam-capture.jpg');
      } else { // File upload
        formData.append('image', imageSource);
      }

      const response = await detectFood(formData);
      const results = response.detection_results;
      setDetectionResults(results);
      
      if (results.detections.length === 0) {
        setSnackbar({
          open: true,
          message: 'No food items detected in the image',
          severity: 'info'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Detected ${results.detections.length} food items!`,
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error during food detection:', err);
      setError('Failed to process the image. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error processing the image',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = () => {
    if (activeTab === 0 && capturedImage) {
      processDetection(capturedImage);
    } else if (activeTab === 1 && selectedFile) {
      processDetection(selectedFile);
    } else {
      setSnackbar({
        open: true,
        message: activeTab === 0 ? 'Please capture an image first' : 'Please select an image file first',
        severity: 'warning'
      });
    }
  };

  const handleUpdateInventory = () => {
    // This would typically call an API to update inventory based on detection results
    // For now, we'll just show a success message
    setSnackbar({
      open: true,
      message: 'Inventory updated successfully based on detected items',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Food Detection
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Webcam" icon={<PhotoCameraIcon />} iconPosition="start" />
          <Tab label="Upload Image" icon={<FileUploadIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            {activeTab === 0 ? (
              // Webcam Tab
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!capturedImage ? (
                  <Box className="webcam-container">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width="100%"
                      height="auto"
                      className="webcam"
                    />
                    <Button
                      variant="contained"
                      startIcon={<PhotoCameraIcon />}
                      onClick={captureImage}
                      sx={{ mt: 2 }}
                    >
                      Capture Image
                    </Button>
                  </Box>
                ) : (
                  <Box className="webcam-container">
                    <img 
                      src={capturedImage} 
                      alt="Captured" 
                      style={{ width: '100%', borderRadius: '8px' }} 
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={resetCapture}
                      >
                        Retake
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleDetect}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Detect Food'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              // File Upload Tab
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {!selectedFile ? (
                  <Box 
                    sx={{ 
                      border: '2px dashed #ccc', 
                      borderRadius: 2, 
                      p: 5, 
                      textAlign: 'center',
                      width: '100%',
                      cursor: 'pointer'
                    }}
                    onClick={triggerFileInput}
                  >
                    <FileUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Click to Upload Image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports: JPG, PNG, JPEG
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Selected" 
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} 
                      />
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      {selectedFile.name}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => setSelectedFile(null)}
                      >
                        Change Image
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleDetect}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Detect Food'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Detection Results
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            ) : detectionResults ? (
              <Box className="detection-results">
                {detectionResults.annotated_image_path && (
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <img 
                      src={`http://localhost:5000${detectionResults.annotated_image_path.replace(/^\./, '')}`} 
                      alt="Annotated" 
                      style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                    />
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Detected Foods
                        </Typography>
                        {detectionResults.detected_foods.length > 0 ? (
                          <List dense>
                            {detectionResults.detected_foods.map((food, index) => (
                              <React.Fragment key={index}>
                                <ListItem>
                                  <ListItemText 
                                    primary={food.name} 
                                    secondary={`${food.count} item(s)`} 
                                  />
                                </ListItem>
                                {index < detectionResults.detected_foods.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No food items detected
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Ingredients Needed
                        </Typography>
                        {detectionResults.ingredients_needed.length > 0 ? (
                          <List dense>
                            {detectionResults.ingredients_needed.map((ingredient, index) => (
                              <React.Fragment key={index}>
                                <ListItem>
                                  <ListItemText 
                                    primary={ingredient.name} 
                                    secondary={`${ingredient.quantity} ${ingredient.unit}`} 
                                  />
                                </ListItem>
                                {index < detectionResults.ingredients_needed.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No ingredients needed
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="Update inventory based on detected items">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateInventory}
                      disabled={!detectionResults.detected_foods.length}
                    >
                      Update Inventory
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Typography variant="body1" color="text.secondary">
                  {activeTab === 0 
                    ? 'Capture an image and click "Detect Food" to see results' 
                    : 'Upload an image and click "Detect Food" to see results'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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

export default Detection;