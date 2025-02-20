from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from pyembroidery import EmbPattern, EmbThread, write_dst
from concurrent.futures import ThreadPoolExecutor
from flask_caching import Cache
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns
import cv2
import numpy as np
from PIL import Image

def align_multi_hoop_designs(image_paths, overlap=10):
    images = [Image.open(path) for path in image_paths]
    total_width = sum(img.width for img in images) - (len(images) - 1) * overlap
    aligned_image = Image.new("RGB", (total_width, images[0].height), "white")

    x_offset = 0
    for img in images:
        aligned_image.paste(img, (x_offset, 0))
        x_offset += img.width - overlap

    aligned_path = "/tmp/multi_hoop_aligned.png"
    aligned_image.save(aligned_path)

    return aligned_path

@app.route("/align-multi-hoop", methods=["POST"])
def align_multi_hoop():
    data = request.json
    if "fileUrls" not in data:
        return jsonify({"error": "Missing file URLs"}), 400

    aligned_path = align_multi_hoop_designs(data["fileUrls"])

    return jsonify({"alignedFile": aligned_path})

def smooth_stitch_path(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    blurred = cv2.GaussianBlur(img, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    return edges

@app.route("/smooth-stitch-path", methods=["POST"])
def smooth_stitch():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    edges = smooth_stitch_path(data["fileUrl"])

    return jsonify({"smoothedFile": edges})

def generate_stitch_density_heatmap(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    heatmap, _ = np.histogram(img, bins=50)

    plt.figure(figsize=(8, 6))
    sns.heatmap(np.reshape(heatmap, (10, 5)), cmap="coolwarm", annot=False)
    heatmap_path = image_path.replace(".png", "_heatmap.png")
    plt.savefig(heatmap_path)

    return heatmap_path

@app.route("/stitch-heatmap", methods=["POST"])
def stitch_heatmap():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    heatmap_path = generate_stitch_density_heatmap(data["fileUrl"])

    return jsonify({"heatmapFile": heatmap_path})

def recommend_underlay_stitch(fabric_type, density):
    recommendations = {
        "cotton": "Zigzag Underlay",
        "denim": "Edge Walk Underlay",
        "silk": "Mesh Underlay",
        "polyester": "Fill Underlay",
    }
    
    return recommendations.get(fabric_type, "Standard Underlay")

@app.route("/recommend-underlay", methods=["POST"])
def recommend_underlay():
    data = request.json
    if "fabricType" not in data or "density" not in data:
        return jsonify({"error": "Missing parameters"}), 400

    recommended_underlay = recommend_underlay_stitch(data["fabricType"], data["density"])

    return jsonify({"underlaySuggestion": recommended_underlay})


def refine_multi_hoop_alignment(image_paths, overlap=10):
    images = [Image.open(path) for path in image_paths]
    total_width = sum(img.width for img in images) - (len(images) - 1) * overlap

    aligned_image = Image.new("RGB", (total_width, images[0].height), "white")

    x_offset = 0
    for img in images:
        aligned_image.paste(img, (x_offset, 0))
        draw = ImageDraw.Draw(aligned_image)
        draw.rectangle([(x_offset + overlap // 2, 10), (x_offset + overlap // 2 + 5, 50)], fill="red")  # Registration marks
        x_offset += img.width - overlap

    refined_path = "/tmp/multi_hoop_refined.png"
    aligned_image.save(refined_path)

    return refined_path
def optimize_stitch_path(embroidery_file):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    G = nx.DiGraph()
    for i, stitch in enumerate(pattern.stitches[:-1]):
        x1, y1, _ = stitch
        x2, y2, _ = pattern.stitches[i + 1]
        G.add_edge(i, i + 1, weight=((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5)

    optimized_path = list(nx.shortest_path(G, source=0, target=len(pattern.stitches) - 1))
    
    return optimized_path

@app.route("/optimize-stitch-flow", methods=["POST"])
def optimize_stitch_flow():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    optimized_flow = optimize_stitch_path(data["fileUrl"])

    return jsonify({"optimizedFlow": optimized_flow})

def estimate_thread_usage(embroidery_file):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    total_length = sum(
        ((pattern.stitches[i][0] - pattern.stitches[i - 1][0]) ** 2 +
         (pattern.stitches[i][1] - pattern.stitches[i - 1][1]) ** 2) ** 0.5
        for i in range(1, len(pattern.stitches))
    )

    estimated_usage = total_length / 1000  # Convert to meters
    return estimated_usage

@app.route("/estimate-thread-usage", methods=["POST"])
def estimate_thread():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    thread_usage = estimate_thread_usage(data["fileUrl"])

    return jsonify({"threadUsage": thread_usage})

def optimize_hoop_placement(image_path, hoop_width, hoop_height):
    img = Image.open(image_path)

    aspect_ratio = img.width / img.height
    hoop_ratio = hoop_width / hoop_height

    if aspect_ratio > hoop_ratio:
        new_width = hoop_width
        new_height = int(hoop_width / aspect_ratio)
    else:
        new_height = hoop_height
        new_width = int(hoop_height * aspect_ratio)

    optimized_img = img.resize((new_width, new_height), Image.ANTIALIAS)
    optimized_path = image_path.replace(".png", "_optimized_hoop.png")
    optimized_img.save(optimized_path)

    return optimized_path

@app.route("/optimize-hoop-placement", methods=["POST"])
def optimize_hoop():
    data = request.json
    if "fileUrl" not in data or "hoopSize" not in data:
        return jsonify({"error": "Missing file URL or hoop size"}), 400

    optimized_path = optimize_hoop_placement(data["fileUrl"], data["hoopSize"]["width"], data["hoopSize"]["height"])

    return jsonify({"optimizedFile": optimized_path})

def blend_thread_colors(image_path):
    img = Image.open(image_path).convert("RGBA")
    blended_img = img.filter(ImageFilter.GaussianBlur(radius=2))  # Softens color transitions
    blended_path = image_path.replace(".png", "_blended.png")
    blended_img.save(blended_path)

    return blended_path

@app.route("/blend-thread-colors", methods=["POST"])
def blend_colors():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    blended_path = blend_thread_colors(data["fileUrl"])

    return jsonify({"blendedFile": blended_path})

def minimize_jump_stitches(embroidery_file):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    optimized_stitches = []
    for stitch in pattern.stitches:
        if len(optimized_stitches) == 0 or ((stitch[0] - optimized_stitches[-1][0]) ** 2 +
                                            (stitch[1] - optimized_stitches[-1][1]) ** 2) ** 0.5 > 2:
            optimized_stitches.append(stitch)

    return optimized_stitches

@app.route("/minimize-jumps", methods=["POST"])
def minimize_jumps():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    optimized_stitches = minimize_jump_stitches(data["fileUrl"])

    return jsonify({"optimizedJumps": optimized_stitches})

def compensate_fabric_stretch(image_path, stretch_factor):
    img = Image.open(image_path)
    compensated_img = img.resize((int(img.width * stretch_factor), int(img.height * stretch_factor)), Image.ANTIALIAS)
    compensated_path = image_path.replace(".png", "_stretch_compensated.png")
    compensated_img.save(compensated_path)

    return compensated_path

@app.route("/compensate-stretch", methods=["POST"])
def compensate_stretch():
    data = request.json
    if "fileUrl" not in data or "stretchFactor" not in data:
        return jsonify({"error": "Missing parameters"}), 400

    compensated_path = compensate_fabric_stretch(data["fileUrl"], data["stretchFactor"])

    return jsonify({"compensatedFile": compensated_path})

def refine_multi_hoop_alignment(image_paths, hoop_width, hoop_height, overlap=10):
    images = [Image.open(path) for path in image_paths]
    total_width = sum(img.width for img in images) - (len(images) - 1) * overlap

    aligned_image = Image.new("RGB", (total_width, images[0].height), "white")

    x_offset = 0
    for img in images:
        aligned_image.paste(img, (x_offset, 0))

        # Auto-adjust alignment
        shift_x = (hoop_width - img.width) // 2
        shift_y = (hoop_height - img.height) // 2

        draw = ImageDraw.Draw(aligned_image)
        draw.rectangle([(x_offset + shift_x, shift_y), (x_offset + shift_x + 5, shift_y + 40)], fill="red")  

        x_offset += img.width - overlap

    refined_path = "/tmp/multi_hoop_refined.png"
    aligned_image.save(refined_path)

    return refined_path

def refine_stitch_path(embroidery_file):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    refined_stitches = []
    for i, stitch in enumerate(pattern.stitches[:-1]):
        x1, y1, command1 = stitch
        x2, y2, command2 = pattern.stitches[i + 1]

        if command1 == command2:  
            weight = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
            if weight < 5:  
                continue  

        refined_stitches.append(stitch)

    return refined_stitches

@app.route("/refine-stitch-flow", methods=["POST"])
def refine_stitch():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    refined_flow = refine_stitch_path(data["fileUrl"])

    return jsonify({"refinedFlow": refined_flow})

def estimate_thread_cost(embroidery_file, thread_price_per_meter=0.02):
    pattern = EmbPattern()
    pattern.load(embroidery_file)

    total_length = sum(
        ((pattern.stitches[i][0] - pattern.stitches[i - 1][0]) ** 2 +
         (pattern.stitches[i][1] - pattern.stitches[i - 1][1]) ** 2) ** 0.5
        for i in range(1, len(pattern.stitches))
    )

    estimated_usage = total_length / 1000  
    estimated_cost = estimated_usage * thread_price_per_meter  

    return estimated_usage, estimated_cost

@app.route("/estimate-thread-cost", methods=["POST"])
def estimate_cost():
    data = request.json
    if "fileUrl" not in data:
        return jsonify({"error": "Missing file URL"}), 400

    usage, cost = estimate_thread_cost(data["fileUrl"])

    return jsonify({"threadUsage": usage, "estimatedCost": cost})

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