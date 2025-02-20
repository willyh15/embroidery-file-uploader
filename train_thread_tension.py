import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Sample training data (Fabric Type, Stitch Density, Recommended Tension)
training_data = [
    ("cotton", 1.2, 3.0),
    ("denim", 1.5, 4.5),
    ("silk", 0.8, 2.0),
    ("polyester", 1.0, 3.5),
]

X = np.array([[item[1]] for item in training_data])  # Stitch density
y = np.array([item[2] for item in training_data])  # Tension setting

fabric_types = [item[0] for item in training_data]
fabric_encoder = LabelEncoder()
fabric_encoded = fabric_encoder.fit_transform(fabric_types)

X = np.hstack((X, fabric_encoded.reshape(-1, 1)))

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(32, activation="relu", input_shape=(2,)),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(1, activation="linear"),
])

model.compile(optimizer="adam", loss="mse", metrics=["mae"])
model.fit(X_train, y_train, epochs=15, validation_data=(X_test, y_test))

model.save("thread_tension_model.h5")
np.save("fabric_encoder_classes.npy", fabric_encoder.classes_)