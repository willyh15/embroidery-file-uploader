from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from pyembroidery import EmbPattern, EmbThread, write_dst

from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from pyembroidery import EmbPattern, EmbThread, write_dst, write_pes, write_exp, write_jef, write_xxx

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