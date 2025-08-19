import os
import json
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')

class JSONEncoder(json.JSONEncoder):
    """
    Custom JSON encoder to handle MongoDB ObjectId and datetime objects
    """
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

class InventoryManager:
    def __init__(self, db_name='inventra'):
        """
        Initialize the inventory manager with MongoDB connection.
        
        Args:
            db_name (str): Name of the MongoDB database
        """
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[db_name]
        self.inventory_collection = self.db['inventory']
        self.recipes_collection = self.db['recipes']
        self.transactions_collection = self.db['transactions']
        
        # Create indexes for better performance
        self.inventory_collection.create_index('name', unique=True)
        self.recipes_collection.create_index('name', unique=True)
    
    def get_all_inventory(self):
        """
        Get all inventory items.
        
        Returns:
            list: List of inventory items
        """
        inventory = list(self.inventory_collection.find())
        return json.loads(JSONEncoder().encode(inventory))
    
    def add_inventory_item(self, name, quantity, unit, category='Other', threshold=10):
        """
        Add a new inventory item.
        
        Args:
            name (str): Name of the item
            quantity (float): Quantity of the item
            unit (str): Unit of measurement (e.g., g, kg, ml, l, piece)
            category (str): Category of the item
            threshold (float): Threshold for low stock alert
            
        Returns:
            dict: The added inventory item
        """
        # Check if item already exists
        existing_item = self.inventory_collection.find_one({'name': name})
        if existing_item:
            # Update quantity if item exists
            self.inventory_collection.update_one(
                {'_id': existing_item['_id']},
                {'$inc': {'quantity': quantity}}
            )
            updated_item = self.inventory_collection.find_one({'_id': existing_item['_id']})
            return json.loads(JSONEncoder().encode(updated_item))
        
        # Create new item if it doesn't exist
        new_item = {
            'name': name,
            'quantity': quantity,
            'unit': unit,
            'category': category,
            'threshold': threshold,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = self.inventory_collection.insert_one(new_item)
        new_item['_id'] = result.inserted_id
        
        # Record transaction
        self._record_transaction('add', name, quantity, unit, 'Initial stock')
        
        return json.loads(JSONEncoder().encode(new_item))
    
    def update_inventory_item(self, item_id, update_data):
        """
        Update an existing inventory item.
        
        Args:
            item_id (str): ID of the item to update
            update_data (dict): Data to update
            
        Returns:
            dict: The updated inventory item or None if not found
        """
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(item_id)
            
            # Add updated_at timestamp
            update_data['updated_at'] = datetime.now()
            
            # Update the item
            result = self.inventory_collection.update_one(
                {'_id': object_id},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                updated_item = self.inventory_collection.find_one({'_id': object_id})
                return json.loads(JSONEncoder().encode(updated_item))
            return None
        except Exception as e:
            print(f"Error updating inventory item: {e}")
            return None
    
    def delete_inventory_item(self, item_id):
        """
        Delete an inventory item.
        
        Args:
            item_id (str): ID of the item to delete
            
        Returns:
            bool: True if deleted successfully, False otherwise
        """
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(item_id)
            
            # Delete the item
            result = self.inventory_collection.delete_one({'_id': object_id})
            
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting inventory item: {e}")
            return False
    
    def update_inventory_from_detection(self, detection_results):
        """
        Update inventory based on detected food items.
        
        Args:
            detection_results (dict): Results from food detection
            
        Returns:
            dict: Inventory update results
        """
        if 'ingredients_needed' not in detection_results:
            return {'error': 'No ingredients found in detection results'}
        
        ingredients_needed = detection_results['ingredients_needed']
        update_results = []
        
        for ingredient in ingredients_needed:
            name = ingredient['name']
            quantity = ingredient['quantity']
            unit = ingredient['unit']
            
            # Check if ingredient exists in inventory
            inventory_item = self.inventory_collection.find_one({'name': name})
            
            if not inventory_item:
                # Add new ingredient to inventory with zero quantity
                self.add_inventory_item(name, 0, unit)
                inventory_item = self.inventory_collection.find_one({'name': name})
            
            # Calculate new quantity (subtract used ingredients)
            current_quantity = inventory_item['quantity']
            new_quantity = max(0, current_quantity - quantity)  # Prevent negative quantities
            
            # Update inventory
            self.inventory_collection.update_one(
                {'_id': inventory_item['_id']},
                {'$set': {
                    'quantity': new_quantity,
                    'updated_at': datetime.now()
                }}
            )
            
            # Record transaction
            self._record_transaction(
                'subtract', 
                name, 
                quantity, 
                unit, 
                f"Used in detected food: {', '.join([f'{food['name']} (x{food['count']})' for food in detection_results['detected_foods']])}"
            )
            
            # Add to update results
            update_results.append({
                'name': name,
                'previous_quantity': current_quantity,
                'used_quantity': quantity,
                'new_quantity': new_quantity,
                'unit': unit
            })
        
        return {
            'success': True,
            'updates': update_results
        }
    
    def get_all_recipes(self):
        """
        Get all recipes.
        
        Returns:
            list: List of recipes
        """
        recipes = list(self.recipes_collection.find())
        return json.loads(JSONEncoder().encode(recipes))
    
    def add_recipe(self, name, ingredients, instructions='', category='Other'):
        """
        Add a new recipe.
        
        Args:
            name (str): Name of the recipe
            ingredients (list): List of ingredients with name, quantity, and unit
            instructions (str): Cooking instructions
            category (str): Category of the recipe
            
        Returns:
            dict: The added recipe
        """
        # Check if recipe already exists
        existing_recipe = self.recipes_collection.find_one({'name': name})
        if existing_recipe:
            return json.loads(JSONEncoder().encode(existing_recipe))
        
        # Create new recipe
        new_recipe = {
            'name': name,
            'ingredients': ingredients,
            'instructions': instructions,
            'category': category,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = self.recipes_collection.insert_one(new_recipe)
        new_recipe['_id'] = result.inserted_id
        
        return json.loads(JSONEncoder().encode(new_recipe))
    
    def update_recipe(self, recipe_id, update_data):
        """
        Update an existing recipe.
        
        Args:
            recipe_id (str): ID of the recipe to update
            update_data (dict): Data to update
            
        Returns:
            dict: The updated recipe or None if not found
        """
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(recipe_id)
            
            # Add updated_at timestamp
            update_data['updated_at'] = datetime.now()
            
            # Update the recipe
            result = self.recipes_collection.update_one(
                {'_id': object_id},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                updated_recipe = self.recipes_collection.find_one({'_id': object_id})
                return json.loads(JSONEncoder().encode(updated_recipe))
            return None
        except Exception as e:
            print(f"Error updating recipe: {e}")
            return None
    
    def delete_recipe(self, recipe_id):
        """
        Delete a recipe.
        
        Args:
            recipe_id (str): ID of the recipe to delete
            
        Returns:
            bool: True if deleted successfully, False otherwise
        """
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(recipe_id)
            
            # Delete the recipe
            result = self.recipes_collection.delete_one({'_id': object_id})
            
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting recipe: {e}")
            return False
    
    def prepare_recipe(self, recipe_id):
        """
        Prepare a recipe and update inventory accordingly.
        
        Args:
            recipe_id (str): ID of the recipe to prepare
            
        Returns:
            dict: Result of the operation
        """
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(recipe_id)
            
            # Get the recipe
            recipe = self.recipes_collection.find_one({'_id': object_id})
            if not recipe:
                return {'success': False, 'message': 'Recipe not found'}
            
            # Check if all ingredients are available in sufficient quantities
            insufficient_ingredients = []
            for ingredient in recipe['ingredients']:
                inventory_item = self.inventory_collection.find_one({'name': ingredient['name']})
                
                if not inventory_item or inventory_item['quantity'] < ingredient['quantity']:
                    insufficient_ingredients.append({
                        'name': ingredient['name'],
                        'required': ingredient['quantity'],
                        'available': inventory_item['quantity'] if inventory_item else 0,
                        'unit': ingredient['unit']
                    })
            
            if insufficient_ingredients:
                return {
                    'success': False,
                    'message': 'Insufficient ingredients',
                    'insufficient_ingredients': insufficient_ingredients
                }
            
            # Update inventory by subtracting used ingredients
            inventory_updates = []
            for ingredient in recipe['ingredients']:
                inventory_item = self.inventory_collection.find_one({'name': ingredient['name']})
                
                # Calculate new quantity
                current_quantity = inventory_item['quantity']
                used_quantity = ingredient['quantity']
                new_quantity = current_quantity - used_quantity
                
                # Update inventory
                self.inventory_collection.update_one(
                    {'_id': inventory_item['_id']},
                    {'$set': {
                        'quantity': new_quantity,
                        'updated_at': datetime.now()
                    }}
                )
                
                # Record transaction
                self._record_transaction(
                    'subtract', 
                    ingredient['name'], 
                    used_quantity, 
                    ingredient['unit'], 
                    f"Used in recipe: {recipe['name']}"
                )
                
                # Add to update results
                inventory_updates.append({
                    'name': ingredient['name'],
                    'previous_quantity': current_quantity,
                    'used_quantity': used_quantity,
                    'new_quantity': new_quantity,
                    'unit': ingredient['unit']
                })
            
            return {
                'success': True,
                'message': f"Recipe '{recipe['name']}' prepared successfully",
                'inventory_updates': inventory_updates
            }
        except Exception as e:
            print(f"Error preparing recipe: {e}")
            return {'success': False, 'message': str(e)}
    
    def get_low_stock_items(self):
        """
        Get inventory items that are below their threshold.
        
        Returns:
            list: List of low stock items
        """
        low_stock_items = list(self.inventory_collection.find({
            '$expr': {'$lt': ['$quantity', '$threshold']}
        }))
        
        return json.loads(JSONEncoder().encode(low_stock_items))
    
    def _record_transaction(self, action, item_name, quantity, unit, description=''):
        """
        Record an inventory transaction.
        
        Args:
            action (str): Type of action (add, subtract, update)
            item_name (str): Name of the inventory item
            quantity (float): Quantity involved in the transaction
            unit (str): Unit of measurement
            description (str): Description of the transaction
        """
        transaction = {
            'action': action,
            'item_name': item_name,
            'quantity': quantity,
            'unit': unit,
            'description': description,
            'timestamp': datetime.now()
        }
        
        self.transactions_collection.insert_one(transaction)