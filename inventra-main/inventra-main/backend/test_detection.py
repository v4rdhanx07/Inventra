import os
import argparse
from object_detection import FoodDetector

def test_detection(image_path):
    """
    Test the food detection functionality.
    
    Args:
        image_path (str): Path to the test image
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return
    
    print(f"Testing food detection on image: {image_path}")
    
    # Initialize the food detector
    detector = FoodDetector(model_path='best.pt')
    
    # Perform detection
    try:
        results = detector.detect(image_path)
        
        # Print detection results
        print("\nDetection Results:")
        print("-" * 50)
        
        if not results['detections']:
            print("No food items detected in the image.")
        else:
            print(f"Detected {len(results['detections'])} food items:")
            for i, detection in enumerate(results['detections'], 1):
                print(f"  {i}. {detection['food_name']} (Confidence: {detection['confidence']:.2f})")
        
        print("\nDetected Foods Summary:")
        print("-" * 50)
        for food in results['detected_foods']:
            print(f"  {food['name']}: {food['count']} item(s)")
        
        print("\nIngredients Needed:")
        print("-" * 50)
        for ingredient in results['ingredients_needed']:
            print(f"  {ingredient['name']}: {ingredient['quantity']} {ingredient['unit']}")
        
        print("\nAnnotated image saved to:", results['annotated_image_path'])
        
    except Exception as e:
        print(f"Error during detection: {e}")

def main():
    parser = argparse.ArgumentParser(description='Test food detection using YOLOv8 model')
    parser.add_argument('--image', type=str, required=True, help='Path to the test image')
    args = parser.parse_args()
    
    test_detection(args.image)

if __name__ == '__main__':
    main()