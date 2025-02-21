import os
import cv2
import numpy as np
from pyembroidery import EmbPattern, write_dst

def generate_training_data(image_folder, output_folder):
    for image_file in os.listdir(image_folder):
        img_path = os.path.join(image_folder, image_file)
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        pattern = EmbPattern()
        for contour in contours:
            for point in contour:
                pattern.add_stitch_absolute(0, point[0][0], point[0][1])

        pattern.end()
        output_path = os.path.join(output_folder, image_file.replace(".png", ".dst"))
        write_dst(pattern, output_path)

generate_training_data("training_images", "training_stitches")

import tensorflow as tf
from tensorflow import keras
import numpy as np

# Load training data
X_train = np.load("X_train.npy")  # Image inputs
y_train = np.load("y_train.npy")  # Corresponding stitch patterns

# Define Model
model = keras.Sequential([
    keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(128, 128, 1)),
    keras.layers.MaxPooling2D(2,2),
    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D(2,2),
    keras.layers.Flatten(),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(y_train.shape[1], activation='softmax')  # Predict stitch patterns
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train Model
model.fit(X_train, y_train, epochs=10, validation_split=0.2)

# Save Model
model.save("stitch_model.h5")