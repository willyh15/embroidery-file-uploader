import unittest
import requests

BASE_URL = "http://localhost:5000"

class TestAPI(unittest.TestCase):
    def test_thread_estimation(self):
        response = requests.post(f"{BASE_URL}/estimate-thread-cost", json={"fileUrl": "test_design.pes"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("threadUsage", response.json())

    def test_stitch_smoothing(self):
        response = requests.post(f"{BASE_URL}/smooth-stitch-path", json={"fileUrl": "test_design.pes"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("smoothedFile", response.json())

if __name__ == "__main__":
    unittest.main()