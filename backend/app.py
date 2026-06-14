import os
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from backend.config import Config
from backend.models import db, User, Scan
from backend.auth import auth_bp
from backend.scanner import VulnerabilityScanner
from backend.reporter import generate_pdf_report

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend integration
CORS(app, resources={r"/*": {"origins": "*"}})

db.init_app(app)
jwt = JWTManager(app)

# Register authentication routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Initialize DB on first run
with app.app_context():
    db.create_all()

@app.route('/api/scans', methods=['POST'])
@jwt_required()
def trigger_scan():
    identity = get_jwt_identity()
    user_id = int(identity)
    
    data = request.get_json() or {}
    target_url = data.get('target_url')
    
    if not target_url:
        return jsonify({'message': 'Target URL is required'}), 400
        
    # Initialize scanner
    scanner = VulnerabilityScanner(target_url)
    
    # Store initial pending scan record
    new_scan = Scan(
        user_id=user_id,
        target_url=target_url,
        status='Running'
    )
    db.session.add(new_scan)
    db.session.commit()
    
    # Run scan synchronous for ease of use in smaller setups
    try:
        results = scanner.perform_scan()
        if not results.get('success', True):
            new_scan.status = 'Failed'
            db.session.commit()
            return jsonify({'message': results.get('error', 'Scan failed to complete')}), 500
            
        new_scan.risk_score = results['risk_score']
        new_scan.risk_level = results['risk_level']
        new_scan.status = 'Completed'
        new_scan.results_json = json.dumps(results)
        db.session.commit()
        
        return jsonify(new_scan.to_dict()), 201
        
    except Exception as e:
        new_scan.status = 'Failed'
        db.session.commit()
        return jsonify({'message': f'Server encountered error during scan: {str(e)}'}), 500

@app.route('/api/scans', methods=['GET'])
@jwt_required()
def get_user_scans():
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    role = user.role if user else 'user'
    
    # If admin, fetch all scans, otherwise just user scans
    if role == 'admin':
        scans = Scan.query.order_by(Scan.created_at.desc()).all()
    else:
        scans = Scan.query.filter_by(user_id=user_id).order_by(Scan.created_at.desc()).all()
        
    return jsonify([scan.to_dict() for scan in scans]), 200

@app.route('/api/scans/<int:scan_id>', methods=['GET'])
@jwt_required()
def get_scan_details(scan_id):
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    role = user.role if user else 'user'
    
    scan = db.session.get(Scan, scan_id)
    if not scan:
        return jsonify({'message': 'Scan record not found'}), 404
        
    if role != 'admin' and scan.user_id != user_id:
        return jsonify({'message': 'Unauthorized to view this scan'}), 403
        
    return jsonify(scan.to_dict()), 200

@app.route('/api/scans/<int:scan_id>', methods=['DELETE'])
@jwt_required()
def delete_scan(scan_id):
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    role = user.role if user else 'user'
    
    scan = db.session.get(Scan, scan_id)
    if not scan:
        return jsonify({'message': 'Scan record not found'}), 404
        
    if role != 'admin' and scan.user_id != user_id:
        return jsonify({'message': 'Unauthorized to delete this scan'}), 403
        
    db.session.delete(scan)
    db.session.commit()
    return jsonify({'message': 'Scan record deleted successfully'}), 200

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    role = user.role if user else 'user'
    
    # Base query based on user authorization
    if role == 'admin':
        scans = Scan.query.all()
    else:
        scans = Scan.query.filter_by(user_id=user_id).all()
        
    total_scans = len(scans)
    
    critical = sum(1 for s in scans if s.risk_level == 'Critical' and s.status == 'Completed')
    high = sum(1 for s in scans if s.risk_level == 'High' and s.status == 'Completed')
    medium = sum(1 for s in scans if s.risk_level == 'Medium' and s.status == 'Completed')
    low = sum(1 for s in scans if s.risk_level == 'Low' and s.status == 'Completed')
    
    completed_scans = [s for s in scans if s.status == 'Completed']
    avg_score = int(sum(s.risk_score for s in completed_scans) / len(completed_scans)) if completed_scans else 0
    
    # Distribution for chart
    vuln_distribution = [
        {'name': 'Critical', 'value': critical},
        {'name': 'High', 'value': high},
        {'name': 'Medium', 'value': medium},
        {'name': 'Low', 'value': low}
    ]
    
    # Scan history trend (past 7 scans)
    recent_scans = sorted(completed_scans, key=lambda x: x.created_at)[-7:]
    history_trend = [{
        'date': s.created_at.strftime('%m-%d'),
        'score': s.risk_score,
        'url': s.target_url
    } for s in recent_scans]
    
    return jsonify({
        'total_scans': total_scans,
        'critical': critical,
        'high': high,
        'medium': medium,
        'low': low,
        'average_score': avg_score,
        'vulnerability_distribution': vuln_distribution,
        'history_trend': history_trend
    }), 200

@app.route('/api/scans/<int:scan_id>/report', methods=['GET'])
@jwt_required()
def download_pdf_report(scan_id):
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    role = user.role if user else 'user'
    
    scan = db.session.get(Scan, scan_id)
    if not scan:
        return jsonify({'message': 'Scan record not found'}), 404
        
    if role != 'admin' and scan.user_id != user_id:
        return jsonify({'message': 'Unauthorized to access report'}), 403
        
    if not scan.results_json:
        return jsonify({'message': 'Scan results not available'}), 400
        
    # Parse json data
    scan_data = json.loads(scan.results_json)
    
    # Generate pdf file
    pdf_filename = f"cybershield_report_{scan.id}.pdf"
    pdf_path = os.path.join(app.config['REPORTS_FOLDER'], pdf_filename)
    
    # Read custom queries for Student & Guide names
    student = request.args.get('student_name', 'MSc Candidate')
    guide = request.args.get('guide_name', 'MSc Project Committee')
    
    generate_pdf_report(scan_data, pdf_path, student_name=student, guide_name=guide)
    
    return send_from_directory(app.config['REPORTS_FOLDER'], pdf_filename, as_attachment=True)

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    if not user or user.role != 'admin':
        return jsonify({'message': 'Admin privilege required'}), 403
        
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@app.route('/api/admin/users/<int:target_user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(target_user_id):
    identity = get_jwt_identity()
    user_id = int(identity)
    user = db.session.get(User, user_id)
    if not user or user.role != 'admin':
        return jsonify({'message': 'Admin privilege required'}), 403
        
    if user_id == target_user_id:
        return jsonify({'message': 'You cannot delete yourself'}), 400
        
    user = db.session.get(User, target_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
