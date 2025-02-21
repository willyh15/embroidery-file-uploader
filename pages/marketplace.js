const [designs, setDesigns] = useState([]);

const fetchDesigns = async () => {
  const response = await fetch("/api/get-designs");
  const data = await response.json();
  setDesigns(data.designs);
};

useEffect(() => {
  fetchDesigns();
}, []);

<ul>
  {designs.map((design, index) => (
    <li key={index}>
      <a href={design.fileUrl} target="_blank">{design.fileUrl}</a>
      <p>Price: ${design.price}</p>
      <button onClick={() => purchaseDesign(design.fileUrl)}>Buy Design</button>
    </li>
  ))}
</ul>

const [reviews, setReviews] = useState({});
const [rating, setRating] = useState(5);
const [reviewText, setReviewText] = useState("");

const fetchReviews = async (fileUrl) => {
  const response = await fetch(`/api/get-reviews?fileUrl=${fileUrl}`);
  const data = await response.json();
  setReviews((prev) => ({ ...prev, [fileUrl]: data.reviews }));
};

const submitReview = async (fileUrl) => {
  await fetch("/api/add-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, rating, review: reviewText }),
  });

  setReviewText("");
  fetchReviews(fileUrl);
};

<ul>
  {designs.map((design, index) => (
    <li key={index}>
      <a href={design.fileUrl} target="_blank">{design.fileUrl}</a>
      <p>Price: ${design.price}</p>
      <button onClick={() => purchaseDesign(design.fileUrl)}>Buy Design</button>
      <button onClick={() => fetchReviews(design.fileUrl)}>View Reviews</button>

      <ul>
        {reviews[design.fileUrl]?.map((r, i) => (
          <li key={i}>{r.user}: ⭐{r.rating}/5 - {r.review}</li>
        ))}
      </ul>

      <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
      <input type="text" placeholder="Write a review" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
      <button onClick={() => submitReview(design.fileUrl)}>Submit Review</button>
    </li>
  ))}
</ul>