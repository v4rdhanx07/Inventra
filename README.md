# INVENTRA - Smart Inventory Management System

## Overview
INVENTRA is a real-time inventory management system designed to track food resources by detecting prepared food items and automatically updating ingredient inventory levels. The system uses computer vision (YOLOv8) to identify food items and manages inventory through a modern web interface.

## Features

- **Real-time Food Detection**: Identify food items using YOLOv8 object detection model
- **Automatic Inventory Updates**: Reduce ingredient quantities based on detected food items
- **Recipe Management**: Create and manage recipes with required ingredients
- **Low Stock Alerts**: Get notified when ingredients are running low
- **Responsive UI**: Modern interface that works on desktop and mobile devices

## Technology Stack

### Backend
- **Python**: Core programming language
- **Flask**: Web framework for API endpoints
- **MongoDB**: Database for inventory and recipe storage
- **YOLOv8**: Object detection model for food identification
- **OpenCV**: Image processing library
- **PyTorch**: Deep learning framework

### Frontend
- **React.js**: UI library for building the interface
- **Material-UI**: Component library for consistent design
- **Chart.js**: Data visualization
- **Axios**: HTTP client for API requests
- **React Webcam**: For capturing images from camera

## Setup Instructions

### Prerequisites
- Python 3.8+ with pip
- Node.js 14+ with npm
- MongoDB
- CUDA-compatible GPU (recommended for faster detection)

### Backend
1. Navigate to `backend/`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Configure the environment variables in `.env` file.
4. Ensure MongoDB is running on `localhost:27017`.
5. Initialize the database with sample data (optional): `python init_db.py`.
6. Run the Flask server: `python app.py`.

### Frontend
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Start the React app: `npm start`.
4. The application will be available at `http://localhost:3000`.

### MongoDB
- Install and run MongoDB locally or use a cloud instance.
- Update the MongoDB connection string in `.env` file if needed.

## Usage

### Food Detection
1. Navigate to the "Food Detection" page.
2. Use your webcam or upload an image of food items.
3. Click "Detect Food" to identify the food items in the image.
4. View the detected items and required ingredients.
5. Click "Update Inventory" to adjust inventory levels based on detected items.

### Inventory Management
1. Navigate to the "Inventory" page.
2. Add, edit, or delete inventory items.
3. Monitor stock levels and view low stock alerts.

### Recipe Management
1. Navigate to the "Recipes" page.
2. Create new recipes with required ingredients.
3. Prepare recipes to automatically update inventory levels.

## Customizing the Model

The system uses a pre-trained YOLOv8 model for food detection. If you want to train the model on your own food dataset:

1. Prepare your labeled dataset in YOLOv8 format.
2. Follow the training process in `backend/notebook.ipynb`.
3. Replace the `best.pt` file with your newly trained model.

## Notes
- Customize the food classes and ingredient mappings in `object_detection.py` for your specific needs.
- Ensure your MongoDB server is running before starting the backend.
- The system requires an image source (webcam or uploaded images) for detection.
- For optimal performance, use good lighting conditions when capturing food images.
