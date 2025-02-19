export default async function handler(req, res) {
  const hoopSizes = [
    { name: "Small", width: 100, height: 100 },  // 4x4 inches
    { name: "Medium", width: 130, height: 180 }, // 5x7 inches
    { name: "Large", width: 160, height: 260 },  // 6x10 inches
    { name: "Extra Large", width: 200, height: 300 }, // 8x12 inches
  ];

  return res.status(200).json({ hoopSizes });
};