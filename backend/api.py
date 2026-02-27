from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Import modular services
from services.rafeeq import RafeeqService
from services.mujaz import MujazService

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Define Base Directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Initialize Services
# rafeeq_service = RafeeqService()
mujaz_service = MujazService()

# # --- RafeeQ (Conversational Doc) ---
# @app.route('/api/rafeeq/chat', methods=['POST'])
# def rafeeq_chat():
#     try:
#         data = request.json
#         if not data or 'message' not in data:
#             return jsonify({'error': 'No message provided'}), 400
            
#         response = rafeeq_service.chat(data.get('message'), data.get('context'))
#         return jsonify(response)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# --- Mujaz (Audio Summary) ---
@app.route('/api/mujaz/process', methods=['POST'])
def mujaz_process():
    try:
        # Check if a file was uploaded
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part in the request'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400

        # Create uploads directory if it doesn't exist
        uploads_dir = os.path.join(BASE_DIR, 'uploads')
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)

        # Save the file temporarily
        file_path = os.path.join(uploads_dir, file.filename)
        file.save(file_path)
            
        # Process the saved file
        response = mujaz_service.process_audio(file_path)
        return jsonify(response)
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

if __name__ == '__main__':
    # Running on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
