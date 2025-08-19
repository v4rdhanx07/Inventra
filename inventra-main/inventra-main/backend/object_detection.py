import os
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image

class FoodDetector:
    def __init__(self, model_path='best.pt'):
        """
        Initialize the food detector with a YOLOv8 model.
        
        Args:
            model_path (str): Path to the YOLOv8 model file
        """
        self.model_path = model_path
        self.model = YOLO(model_path)
        
        # Define the mapping of class indices to food names
        # This should match the classes your model was trained on
        self.class_names = {
            0: 'burger',
            1: 'chicken nuggest',
            2: 'dessert',
            3: 'drink',
            4: 'fride chicken',
            5: 'fries',
            6: 'ice',
            7: 'other',
            8: 'pasta',
            9: 'pizza',
            10: 'sandwich',
            11: 'shawarma'
        }
        
        # Define the ingredients for each food item
        # This maps detected foods to their ingredient requirements
        self.food_ingredients = {
            'burger': [
                {'name': 'beef patty', 'quantity': 1, 'unit': 'piece'},
                {'name': 'burger bun', 'quantity': 1, 'unit': 'piece'},
                {'name': 'lettuce', 'quantity': 20, 'unit': 'g'},
                {'name': 'tomato', 'quantity': 30, 'unit': 'g'},
                {'name': 'cheese', 'quantity': 20, 'unit': 'g'},
                {'name': 'onion', 'quantity': 15, 'unit': 'g'}
            ],
            'chicken nuggest': [
                {'name': 'chicken', 'quantity': 100, 'unit': 'g'},
                {'name': 'breadcrumbs', 'quantity': 30, 'unit': 'g'},
                {'name': 'oil', 'quantity': 20, 'unit': 'ml'},
                {'name': 'spices', 'quantity': 5, 'unit': 'g'}
            ],
            'dessert': [
                {'name': 'flour', 'quantity': 100, 'unit': 'g'},
                {'name': 'sugar', 'quantity': 50, 'unit': 'g'},
                {'name': 'butter', 'quantity': 30, 'unit': 'g'},
                {'name': 'eggs', 'quantity': 1, 'unit': 'piece'}
            ],
            'drink': [
                {'name': 'water', 'quantity': 200, 'unit': 'ml'},
                {'name': 'syrup', 'quantity': 20, 'unit': 'ml'},
                {'name': 'ice', 'quantity': 50, 'unit': 'g'}
            ],
            'fride chicken': [
                {'name': 'chicken', 'quantity': 150, 'unit': 'g'},
                {'name': 'flour', 'quantity': 50, 'unit': 'g'},
                {'name': 'oil', 'quantity': 100, 'unit': 'ml'},
                {'name': 'spices', 'quantity': 10, 'unit': 'g'}
            ],
            'fries': [
                {'name': 'potatoes', 'quantity': 150, 'unit': 'g'},
                {'name': 'oil', 'quantity': 30, 'unit': 'ml'},
                {'name': 'salt', 'quantity': 2, 'unit': 'g'}
            ],
            'ice': [
                {'name': 'water', 'quantity': 100, 'unit': 'ml'}
            ],
            'other': [
                {'name': 'miscellaneous', 'quantity': 100, 'unit': 'g'}
            ],
            'pasta': [
                {'name': 'pasta', 'quantity': 100, 'unit': 'g'},
                {'name': 'tomato sauce', 'quantity': 80, 'unit': 'ml'},
                {'name': 'cheese', 'quantity': 20, 'unit': 'g'}
            ],
            'pizza': [
                {'name': 'pizza dough', 'quantity': 1, 'unit': 'piece'},
                {'name': 'tomato sauce', 'quantity': 50, 'unit': 'ml'},
                {'name': 'cheese', 'quantity': 100, 'unit': 'g'},
                {'name': 'pepperoni', 'quantity': 50, 'unit': 'g'}
            ],
            'sandwich': [
                {'name': 'bread', 'quantity': 2, 'unit': 'slice'},
                {'name': 'ham', 'quantity': 30, 'unit': 'g'},
                {'name': 'cheese', 'quantity': 20, 'unit': 'g'},
                {'name': 'lettuce', 'quantity': 10, 'unit': 'g'},
                {'name': 'tomato', 'quantity': 20, 'unit': 'g'}
            ],
            'shawarma': [
                {'name': 'pita bread', 'quantity': 1, 'unit': 'piece'},
                {'name': 'chicken', 'quantity': 100, 'unit': 'g'},
                {'name': 'garlic sauce', 'quantity': 20, 'unit': 'ml'},
                {'name': 'vegetables', 'quantity': 50, 'unit': 'g'}
            ]
        }
    
    def detect(self, image_path):
        """
        Detect food items in an image.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            dict: Detection results with food items and their ingredients
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Perform detection using YOLOv8
        results = self.model(image_path)
        
        # Process detection results
        detections = []
        detected_foods = {}
        
        for result in results:
            boxes = result.boxes.cpu().numpy()
            
            for box in boxes:
                # Get class ID, confidence score, and bounding box
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].astype(int)
                
                # Get food name from class ID
                food_name = self.class_names.get(class_id, f"Unknown-{class_id}")
                
                # Add to detections list
                detections.append({
                    'food_name': food_name,
                    'confidence': confidence,
                    'bbox': [int(x1), int(y1), int(x2), int(y2)]
                })
                
                # Count occurrences of each food type
                if food_name in detected_foods:
                    detected_foods[food_name] += 1
                else:
                    detected_foods[food_name] = 1
        
        # Calculate ingredients needed based on detected foods
        ingredients_needed = []
        for food_name, count in detected_foods.items():
            if food_name in self.food_ingredients:
                for ingredient in self.food_ingredients[food_name]:
                    # Scale ingredient quantity by the count of detected food items
                    scaled_ingredient = {
                        'name': ingredient['name'],
                        'quantity': ingredient['quantity'] * count,
                        'unit': ingredient['unit']
                    }
                    ingredients_needed.append(scaled_ingredient)
        
        # Combine ingredients with the same name
        combined_ingredients = {}
        for ingredient in ingredients_needed:
            name = ingredient['name']
            if name in combined_ingredients:
                combined_ingredients[name]['quantity'] += ingredient['quantity']
            else:
                combined_ingredients[name] = ingredient.copy()
        
        # Convert back to list
        final_ingredients = list(combined_ingredients.values())
        
        # Create annotated image
        annotated_image_path = self._create_annotated_image(image_path, detections)
        
        return {
            'detections': detections,
            'detected_foods': [{'name': k, 'count': v} for k, v in detected_foods.items()],
            'ingredients_needed': final_ingredients,
            'annotated_image_path': annotated_image_path
        }
    
    def _create_annotated_image(self, image_path, detections):
        """
        Create an annotated image with bounding boxes and labels.
        
        Args:
            image_path (str): Path to the original image
            detections (list): List of detection results
            
        Returns:
            str: Path to the annotated image
        """
        # Read the image
        image = cv2.imread(image_path)
        
        # Draw bounding boxes and labels
        for detection in detections:
            x1, y1, x2, y2 = detection['bbox']
            food_name = detection['food_name']
            confidence = detection['confidence']
            
            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Prepare label text
            label = f"{food_name}: {confidence:.2f}"
            
            # Draw label background
            text_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(image, (x1, y1 - text_size[1] - 5), (x1 + text_size[0], y1), (0, 255, 0), -1)
            
            # Draw label text
            cv2.putText(image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
        
        # Save the annotated image
        output_dir = 'static/annotated'
        os.makedirs(output_dir, exist_ok=True)
        
        base_filename = os.path.basename(image_path)
        annotated_filename = f"annotated_{base_filename}"
        annotated_path = os.path.join(output_dir, annotated_filename)
        
        cv2.imwrite(annotated_path, image)
        
        return annotated_path