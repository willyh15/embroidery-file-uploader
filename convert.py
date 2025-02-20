from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from pyembroidery import EmbPattern, EmbThread, write_dst
from concurrent.futures import ThreadPoolExecutor
from flask_caching import Cache

def detect_embroidery_errors(embroidery_file):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    errors = []
    for i, stitch in enumerate(pattern.stitches[:-1]):
        x1, y1, command1 = stitch
        x2, y2, command2 = pattern.stitches[i + 1]

        if abs(x2 - x1) > 50 or abs(y2 - y1) > 50:
            errors.append(f"Jump stitch detected at stitch {i}")

        if command1 == command2 and abs(x2 - x1) < 1 and abs(y2 - y1) < 1:
            errors.append(f"Overlapping stitches at stitch {i}")

    return errors

@app.route("/detect-errors", methods=["POST"])
def detect_errors():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    errors = detect_embroidery_errors(data["fileUrl"])

    return jsonify({"errors": errors})


def predict_thread_breaks(embroidery_file):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    breakpoints = []
    for i, stitch in enumerate(pattern.stitches[:-1]):
        x1, y1, command1 = stitch
        x2, y2, command2 = pattern.stitches[i + 1]

        tension_factor = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5  
        if tension_factor > 30:  
            breakpoints.append(f"Potential thread break at stitch {i}")

    return breakpoints

@app.route("/predict-thread-breaks", methods=["POST"])
def predict_breaks():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    breaks = predict_thread_breaks(data["fileUrl"])

    return jsonify({"breakpoints": breaks})

def correct_fabric_distortion(image_path, stretch_factor):
    img = Image.open(image_path)
    corrected_img = img.resize((int(img.width * stretch_factor), int(img.height * stretch_factor)), Image.ANTIALIAS)
    corrected_path = image_path.replace(".png", "_distortion_corrected.png")
    corrected_img.save(corrected_path)

    return corrected_path

@app.route("/correct-distortion", methods=["POST"])
def correct_distortion():
    data = request.json
    if "fileUrl" not in data or "stretchFactor" not in data:
        return jsonify({"error": "Missing parameters"}), 400

    corrected_path = correct_fabric_distortion(data["fileUrl"], data["stretchFactor"])

    return jsonify({"correctedFile": corrected_path})

cache = Cache(config={"CACHE_TYPE": "simple"})
cache.init_app(app)

@app.route("/estimate-thread-cost", methods=["POST"])
@cache.cached(timeout=600, query_string=True)
def estimate_cost():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    usage, cost = estimate_thread_cost(data["fileUrl"])
    return jsonify({"threadUsage": usage, "estimatedCost": cost})
executor = ThreadPoolExecutor(max_workers=4)

@app.route("/optimize-stitch-flow", methods=["POST"])
def optimize_stitch_async():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    future = executor.submit(optimize_stitch_path, data["fileUrl"])
    return jsonify({"message": "Optimization started"})
app = Flask(__name__)

def image_to_embroidery(image_path, output_path, format="dst", density=1.0, scale=1.0):
    img = Image.open(image_path).convert("L")
    img = img.resize((int(img.width * scale), int(img.height * scale)))

    img_array = np.array(img)
    pattern = EmbPattern()

    for y, row in enumerate(img_array):
        for x, pixel in enumerate(row):
            if pixel < 128:
                for _ in range(int(density)):  # Increase stitch density
                    pattern.add_stitch_absolute(0, x, y)  

    pattern.end()

    if format == "dst":
        write_dst(pattern, output_path)
    elif format == "pes":
        write_pes(pattern, output_path)
    elif format == "exp":
        write_exp(pattern, output_path)
    elif format == "jef":
        write_jef(pattern, output_path)
    elif format == "xxx":
        write_xxx(pattern, output_path)

    return output_path

@app.route("/convert", methods=["POST"])
def convert_image():
    if "file" not in request.files or "format" not in request.form:
        return jsonify({"error": "Missing file or format"}), 400

    file = request.files["file"]
    format = request.form["format"]

    file_path = f"/tmp/{file.filename}"
    output_path = f"/tmp/{file.filename}.{format}"

    file.save(file_path)
    converted_path = image_to_embroidery(file_path, output_path, format)

    if not converted_path:
        return jsonify({"error": "Invalid format"}), 400

    return jsonify({"converted_file": converted_path})

if __name__ == "__main__":
    app.run(debug=True)

app = Flask(__name__)

def image_to_dst(image_path, output_path):
    img = Image.open(image_path).convert("L")  # Convert to grayscale
    img_array = np.array(img)

    pattern = EmbPattern()

    for y, row in enumerate(img_array):
        for x, pixel in enumerate(row):
            if pixel < 128:  # Convert dark pixels to stitches
                pattern.add_stitch_absolute(0, x, y)  

    pattern.end()
    write_dst(pattern, output_path)

@app.route("/convert", methods=["POST"])
def convert_to_dst():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    file_path = f"/tmp/{file.filename}"
    output_path = f"/tmp/{file.filename}.dst"
    
    file.save(file_path)
    image_to_dst(file_path, output_path)
    
    return jsonify({"converted_file": output_path})

if __name__ == "__main__":
    app.run(debug=True)