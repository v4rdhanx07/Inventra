import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json

# Import custom modules
from object_detection import FoodDetector
from inventory_manager import InventoryManager

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Initialize modules
food_detector = FoodDetector(model_path='best.pt')
inventory_manager = InventoryManager()

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Inventra API is running'})

@app.route('/api/detect', methods=['POST'])
def detect_food():
    # Check if image file is present in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Check if file is allowed
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Perform detection
        try:
            detection_results = food_detector.detect(filepath)
            
            # Update inventory based on detected items
            inventory_updates = inventory_manager.update_inventory_from_detection(detection_results)
            
            # Return detection results and inventory updates
            return jsonify({
                'detection_results': detection_results,
                'inventory_updates': inventory_updates
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        inventory = inventory_manager.get_all_inventory()
        return jsonify({'inventory': inventory})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory', methods=['POST'])
def add_inventory_item():
    try:
        data = request.json
        if not data or 'name' not in data or 'quantity' not in data or 'unit' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = inventory_manager.add_inventory_item(
            name=data['name'],
            quantity=data['quantity'],
            unit=data['unit'],
            category=data.get('category', 'Other'),
            threshold=data.get('threshold', 10)
        )
        
        return jsonify({'message': 'Inventory item added successfully', 'item': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/<item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No update data provided'}), 400
        
        result = inventory_manager.update_inventory_item(item_id, data)
        if result:
            return jsonify({'message': 'Inventory item updated successfully', 'item': result})
        else:
            return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/<item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    try:
        result = inventory_manager.delete_inventory_item(item_id)
        if result:
            return jsonify({'message': 'Inventory item deleted successfully'})
        else:
            return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        recipes = inventory_manager.get_all_recipes()
        return jsonify({'recipes': recipes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes', methods=['POST'])
def add_recipe():
    try:
        data = request.json
        if not data or 'name' not in data or 'ingredients' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = inventory_manager.add_recipe(
            name=data['name'],
            ingredients=data['ingredients'],
            instructions=data.get('instructions', ''),
            category=data.get('category', 'Other')
        )
        
        return jsonify({'message': 'Recipe added successfully', 'recipe': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No update data provided'}), 400
        
        result = inventory_manager.update_recipe(recipe_id, data)
        if result:
            return jsonify({'message': 'Recipe updated successfully', 'recipe': result})
        else:
            return jsonify({'error': 'Recipe not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    try:
        result = inventory_manager.delete_recipe(recipe_id)
        if result:
            return jsonify({'message': 'Recipe deleted successfully'})
        else:
            return jsonify({'error': 'Recipe not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/prepare-recipe/<recipe_id>', methods=['POST'])
def prepare_recipe(recipe_id):
    try:
        result = inventory_manager.prepare_recipe(recipe_id)
        if result['success']:
            return jsonify({
                'message': 'Recipe prepared successfully', 
                'inventory_updates': result['inventory_updates']
            })
        else:
            return jsonify({'error': result['message']}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/low-stock', methods=['GET'])
def get_low_stock_items():
    try:
        low_stock_items = inventory_manager.get_low_stock_items()
        return jsonify({'low_stock_items': low_stock_items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)