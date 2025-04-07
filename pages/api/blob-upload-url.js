// pages/api/blob-upload-url.js
import { getSignedUrl } from '@vercel/blob';
import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  const { filename } = req.body;
  const { url } = await getSignedUrl({
    access: 'public', // or 'private'
    token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    pathname: `converted/${filename}`,
  });

  res.status(200).json({ url });
}