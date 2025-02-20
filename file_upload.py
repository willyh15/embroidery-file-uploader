import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "/secure/uploads"
ALLOWED_EXTENSIONS = {"pes", "dst", "exp", "jpg", "png"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/upload-file", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({"message": "File uploaded successfully"})
    
    return jsonify({"error": "Invalid file type"}), 400