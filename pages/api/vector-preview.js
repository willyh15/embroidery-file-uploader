// pages/api/vector-preview.js

import { promisify } from 'util';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const execFileAsync = promisify(execFile);
const PNG_TO_SVG_SCRIPT = "/root/PNGToSVG/python/pngtosvg.py";

export const config = {
  api: {
    bodyParser: true,
    responseLimit: '8mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: 'Missing fileUrl' });
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vector-preview-'));
  const fileExt = path.extname(fileUrl).toLowerCase();
  const inputPath = path.join(tempDir, `input${fileExt}`);
  const outputPath = path.join(tempDir, 'preview.svg');

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Failed to download file');

    const buffer = await response.buffer();
    fs.writeFileSync(inputPath, buffer);

    const convertArgs = [inputPath, outputPath];
    const { stdout, stderr } = await execFileAsync("python3", [PNG_TO_SVG_SCRIPT, ...convertArgs]);

    const svgContent = fs.readFileSync(outputPath, 'utf-8');
    res.status(200).json({ vectorSvgData: svgContent });
  } catch (error) {
    console.error("Vector preview error:", error);
    res.status(500).json({ error: error.message || 'Vector preview failed' });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
