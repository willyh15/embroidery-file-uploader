from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from pyembroidery import EmbPattern, EmbThread, write_dst

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