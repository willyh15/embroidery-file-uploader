import { useState, useEffect } from "react";

export default function DesignMarketplace() {
  const [designs, setDesigns] = useState([]);
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Fetch available designs on component mount
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("/api/get-designs");
        if (!response.ok) throw new Error("Failed to fetch designs");
        const data = await response.json();
        setDesigns(data.designs);
      } catch (error) {
        console.error("Error fetching designs:", error);
      }
    };

    fetchDesigns();
  }, []);

  // Fetch reviews for a specific design
  const fetchReviews = async (fileUrl) => {
    try {
      const response = await fetch(`/api/get-reviews?fileUrl=${fileUrl}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews((prev) => ({ ...prev, [fileUrl]: data.reviews }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Purchase a design
  const purchaseDesign = async (fileUrl) => {
    try {
      const response = await fetch("/api/purchase-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) throw new Error("Purchase failed");
      alert("Design purchased successfully!");
    } catch (error) {
      console.error("Error purchasing design:", error);
    }
  };

  // Submit a review for a design
  const submitReview = async (fileUrl) => {
    if (!reviewText.trim()) {
      alert("Review text cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/api/add-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, rating, review: reviewText.trim() }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      setReviewText("");
      fetchReviews(fileUrl);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Embroidery Design Marketplace</h2>

      <ul>
        {designs.length > 0 ? (
          designs.map((design, index) => (
            <li key={index} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
              <a href={design.fileUrl} target="_blank" rel="noopener noreferrer">{design.fileUrl}</a>
              <p>Price: <strong>${design.price}</strong></p>

              <button onClick={() => purchaseDesign(design.fileUrl)}>Buy Design</button>
              <button onClick={() => fetchReviews(design.fileUrl)}>View Reviews</button>

              {/* Display reviews if available */}
              {reviews[design.fileUrl] && (
                <ul style={{ marginTop: "10px" }}>
                  {reviews[design.fileUrl].map((r, i) => (
                    <li key={i} style={{ padding: "5px 0" }}>
                      <strong>{r.user}:</strong> ⭐{r.rating}/5 - {r.review}
                    </li>
                  ))}
                </ul>
              )}

              {/* Review Submission */}
              <div style={{ marginTop: "10px" }}>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{ width: "50px", marginRight: "10px" }}
                />
                <input
                  type="text"
                  placeholder="Write a review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ width: "250px", marginRight: "10px" }}
                />
                <button onClick={() => submitReview(design.fileUrl)}>Submit Review</button>
              </div>
            </li>
          ))
        ) : (
          <p>No designs available.</p>
        )}
      </ul>
    </div>
  );
}