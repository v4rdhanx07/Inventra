import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')

def init_database():
    """
    Initialize the MongoDB database with sample data.
    """
    client = MongoClient(MONGO_URI)
    db = client['inventra']
    
    # Clear existing collections
    db.inventory.drop()
    db.recipes.drop()
    db.transactions.drop()
    
    # Create sample inventory items
    inventory_items = [
        {
            'name': 'beef patty',
            'quantity': 50,
            'unit': 'piece',
            'category': 'Meat',
            'threshold': 10
        },
        {
            'name': 'burger bun',
            'quantity': 60,
            'unit': 'piece',
            'category': 'Bread',
            'threshold': 15
        },
        {
            'name': 'lettuce',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Vegetable',
            'threshold': 200
        },
        {
            'name': 'tomato',
            'quantity': 2000,
            'unit': 'g',
            'category': 'Vegetable',
            'threshold': 300
        },
        {
            'name': 'cheese',
            'quantity': 1500,
            'unit': 'g',
            'category': 'Dairy',
            'threshold': 250
        },
        {
            'name': 'onion',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Vegetable',
            'threshold': 200
        },
        {
            'name': 'pizza dough',
            'quantity': 30,
            'unit': 'piece',
            'category': 'Bread',
            'threshold': 10
        },
        {
            'name': 'tomato sauce',
            'quantity': 2000,
            'unit': 'ml',
            'category': 'Sauce',
            'threshold': 500
        },
        {
            'name': 'pepperoni',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Meat',
            'threshold': 200
        },
        {
            'name': 'bread',
            'quantity': 100,
            'unit': 'slice',
            'category': 'Bread',
            'threshold': 20
        },
        {
            'name': 'ham',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Meat',
            'threshold': 200
        },
        {
            'name': 'potatoes',
            'quantity': 5000,
            'unit': 'g',
            'category': 'Vegetable',
            'threshold': 1000
        },
        {
            'name': 'oil',
            'quantity': 3000,
            'unit': 'ml',
            'category': 'Condiment',
            'threshold': 500
        },
        {
            'name': 'salt',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Spice',
            'threshold': 200
        },
        {
            'name': 'pasta',
            'quantity': 3000,
            'unit': 'g',
            'category': 'Grain',
            'threshold': 500
        },
        {
            'name': 'water',
            'quantity': 10000,
            'unit': 'ml',
            'category': 'Liquid',
            'threshold': 2000
        },
        {
            'name': 'chicken',
            'quantity': 3000,
            'unit': 'g',
            'category': 'Meat',
            'threshold': 500
        },
        {
            'name': 'spices',
            'quantity': 500,
            'unit': 'g',
            'category': 'Spice',
            'threshold': 100
        },
        {
            'name': 'breadcrumbs',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Bread',
            'threshold': 200
        },
        {
            'name': 'flour',
            'quantity': 2000,
            'unit': 'g',
            'category': 'Baking',
            'threshold': 500
        },
        {
            'name': 'sugar',
            'quantity': 1500,
            'unit': 'g',
            'category': 'Baking',
            'threshold': 300
        },
        {
            'name': 'butter',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Dairy',
            'threshold': 200
        },
        {
            'name': 'eggs',
            'quantity': 24,
            'unit': 'piece',
            'category': 'Dairy',
            'threshold': 6
        },
        {
            'name': 'syrup',
            'quantity': 1000,
            'unit': 'ml',
            'category': 'Condiment',
            'threshold': 200
        },
        {
            'name': 'ice',
            'quantity': 2000,
            'unit': 'g',
            'category': 'Frozen',
            'threshold': 500
        },
        {
            'name': 'pita bread',
            'quantity': 30,
            'unit': 'piece',
            'category': 'Bread',
            'threshold': 10
        },
        {
            'name': 'garlic sauce',
            'quantity': 500,
            'unit': 'ml',
            'category': 'Sauce',
            'threshold': 100
        },
        {
            'name': 'vegetables',
            'quantity': 2000,
            'unit': 'g',
            'category': 'Vegetable',
            'threshold': 400
        },
        {
            'name': 'miscellaneous',
            'quantity': 1000,
            'unit': 'g',
            'category': 'Other',
            'threshold': 200
        }
    ]
    
    # Insert inventory items
    db.inventory.insert_many(inventory_items)
    print(f"Inserted {len(inventory_items)} inventory items")
    
    # Create sample recipes
    recipes = [
        {
            'name': 'Classic Burger',
            'ingredients': [
                {'name': 'beef patty', 'quantity': 1, 'unit': 'piece'},
                {'name': 'burger bun', 'quantity': 1, 'unit': 'piece'},
                {'name': 'lettuce', 'quantity': 20, 'unit': 'g'},
                {'name': 'tomato', 'quantity': 30, 'unit': 'g'},
                {'name': 'cheese', 'quantity': 20, 'unit': 'g'},
                {'name': 'onion', 'quantity': 15, 'unit': 'g'}
            ],
            'instructions': 'Grill the beef patty, toast the bun, and assemble the burger with all ingredients.',
            'category': 'Burger'
        },
        {
            'name': 'Pepperoni Pizza',
            'ingredients': [
                {'name': 'pizza dough', 'quantity': 1, 'unit': 'piece'},
                {'name': 'tomato sauce', 'quantity': 50, 'unit': 'ml'},
                {'name': 'cheese', 'quantity': 100, 'unit': 'g'},
                {'name': 'pepperoni', 'quantity': 50, 'unit': 'g'}
            ],
            'instructions': 'Roll out the dough, spread tomato sauce, sprinkle cheese, add pepperoni, and bake at 450°F for 12-15 minutes.',
            'category': 'Pizza'
        },
        {
            'name': 'Ham and Cheese Sandwich',
            'ingredients': [
                {'name': 'bread', 'quantity': 2, 'unit': 'slice'},
                {'name': 'ham', 'quantity': 30, 'unit': 'g'},
                {'name': 'cheese', 'quantity': 20, 'unit': 'g'},
                {'name': 'lettuce', 'quantity': 10, 'unit': 'g'},
                {'name': 'tomato', 'quantity': 20, 'unit': 'g'}
            ],
            'instructions': 'Layer ham, cheese, lettuce, and tomato between bread slices.',
            'category': 'Sandwich'
        },
        {
            'name': 'Chicken Nuggets',
            'ingredients': [
                {'name': 'chicken', 'quantity': 100, 'unit': 'g'},
                {'name': 'breadcrumbs', 'quantity': 30, 'unit': 'g'},
                {'name': 'oil', 'quantity': 20, 'unit': 'ml'},
                {'name': 'spices', 'quantity': 5, 'unit': 'g'}
            ],
            'instructions': 'Cut chicken into nugget-sized pieces, coat with breadcrumbs and spices, and fry in oil until golden brown.',
            'category': 'Chicken'
        },
        {
            'name': 'Chocolate Cake',
            'ingredients': [
                {'name': 'flour', 'quantity': 100, 'unit': 'g'},
                {'name': 'sugar', 'quantity': 50, 'unit': 'g'},
                {'name': 'butter', 'quantity': 30, 'unit': 'g'},
                {'name': 'eggs', 'quantity': 1, 'unit': 'piece'}
            ],
            'instructions': 'Mix all ingredients, pour into a cake pan, and bake at 350°F for 30 minutes.',
            'category': 'Dessert'
        },
        {
            'name': 'Fruit Smoothie',
            'ingredients': [
                {'name': 'water', 'quantity': 200, 'unit': 'ml'},
                {'name': 'syrup', 'quantity': 20, 'unit': 'ml'},
                {'name': 'ice', 'quantity': 50, 'unit': 'g'}
            ],
            'instructions': 'Blend all ingredients until smooth.',
            'category': 'Drink'
        },
        {
            'name': 'Fried Chicken',
            'ingredients': [
                {'name': 'chicken', 'quantity': 150, 'unit': 'g'},
                {'name': 'flour', 'quantity': 50, 'unit': 'g'},
                {'name': 'oil', 'quantity': 100, 'unit': 'ml'},
                {'name': 'spices', 'quantity': 10, 'unit': 'g'}
            ],
            'instructions': 'Coat chicken pieces in flour and spices, then fry in hot oil until golden and crispy.',
            'category': 'Chicken'
        },
        {
            'name': 'French Fries',
            'ingredients': [
                {'name': 'potatoes', 'quantity': 150, 'unit': 'g'},
                {'name': 'oil', 'quantity': 30, 'unit': 'ml'},
                {'name': 'salt', 'quantity': 2, 'unit': 'g'}
            ],
            'instructions': 'Cut potatoes into strips, fry in hot oil, and season with salt.',
            'category': 'Side'
        },
        {
            'name': 'Chicken Shawarma',
            'ingredients': [
                {'name': 'pita bread', 'quantity': 1, 'unit': 'piece'},
                {'name': 'chicken', 'quantity': 100, 'unit': 'g'},
                {'name': 'garlic sauce', 'quantity': 20, 'unit': 'ml'},
                {'name': 'vegetables', 'quantity': 50, 'unit': 'g'}
            ],
            'instructions': 'Cook marinated chicken, warm pita bread, and assemble with garlic sauce and vegetables.',
            'category': 'Sandwich'
        },
        {
            'name': 'Pasta with Tomato Sauce',
            'ingredients': [
                {'name': 'pasta', 'quantity': 100, 'unit': 'g'},
                {'name': 'tomato sauce', 'quantity': 80, 'unit': 'ml'},
                {'name': 'cheese', 'quantity': 20, 'unit': 'g'}
            ],
            'instructions': 'Cook pasta according to package instructions, heat tomato sauce, combine, and top with cheese.',
            'category': 'Pasta'
        }
    ]
    
    # Insert recipes
    db.recipes.insert_many(recipes)
    print(f"Inserted {len(recipes)} recipes")
    
    print("Database initialization complete!")

if __name__ == '__main__':
    init_database()