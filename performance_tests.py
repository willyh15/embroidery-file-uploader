import time
import requests

BASE_URL = "http://localhost:5000"

def test_stitch_optimization():
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/optimize-stitch-flow", json={"fileUrl": "test_design.pes"})
    elapsed_time = time.time() - start_time

    if response.status_code == 200:
        print(f"Stitch optimization completed in {elapsed_time:.2f} seconds")
    else:
        print("Test failed")

test_stitch_optimization()