"""
main.py — Flask API Server
───────────────────────────
Entry point for the backend API.
Run with: python main.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# --- Service imports ---
from services.miqyas import RiskModelService as MiqyasService
from services.tamkeen import TamkeenService
from services.rafeeq import RafeeqService
from services.mudaqqiq import MudaqqiqService
from services.mujaz import MujazService
from services.dashboard import DashboardService

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

# --- Initialize services ---
miqyas_service   = MiqyasService(model_dir=MODEL_DIR)
tamkeen_service  = TamkeenService()
rafeeq_service   = RafeeqService()
mudaqqiq_service = MudaqqiqService()
mujaz_service    = MujazService()
dashboard_service = DashboardService()


# ── Dashboard ──────────────────────────────────────────────
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    return jsonify(dashboard_service.get_stats())


# ── Miqyas Credit (Risk Model) ─────────────────────────────
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    try:
        return jsonify(miqyas_service.predict(data))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Tamkeen (RMs Assistant) ────────────────────────────────
@app.route('/api/tamkeen/analyze', methods=['POST'])
def tamkeen_analyze():
    data = request.json or {}
    return jsonify(tamkeen_service.analyze_contract(data))


# ── RafeeQ (Conversational Doc) ───────────────────────────
@app.route('/api/rafeeq/chat', methods=['POST'])
def rafeeq_chat():
    data = request.json or {}
    return jsonify(rafeeq_service.chat(data.get('message'), data.get('context')))


# ── MudaQQiQ (Audit) ──────────────────────────────────────
@app.route('/api/mudaqqiq/verify', methods=['POST'])
def mudaqqiq_verify():
    data = request.json or {}
    return jsonify(mudaqqiq_service.verify_document(data.get('document_id')))


# ── Mujaz (Audio Summary) ─────────────────────────────────
@app.route('/api/mujaz/process', methods=['POST'])
def mujaz_process():
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({'status': 'error', 'error': 'No file provided'}), 400
    try:
        file = request.files['file']
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        file.save(file_path)
        return jsonify(mujaz_service.process_audio(file_path))
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500


# ── Health check ───────────────────────────────────────────
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'status': 'online'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
