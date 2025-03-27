import { put } from '@vercel/blob';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const config = {
  runtime: 'edge',
};

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
      });
    }

    const token = await getToken({ req });
    const username = token?.username || 'guest';

    const formData = await req.formData();
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files uploaded' }), {
        status: 400,
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const originalName = file.name || 'file';
      const ext = originalName.slice(originalName.lastIndexOf('.')).toLowerCase();
      const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.pes', '.dst'];
      if (!allowed.includes(ext)) {
        return new Response(JSON.stringify({ error: `File type ${ext} not allowed` }), {
          status: 400,
        });
      }

      const folder = ext === '.pes' || ext === '.dst' ? 'embroidery' : 'images';
      const uuid = uuidv4();
      const blobName = `${username}/${folder}/${uuid}${ext}`;

      // Send status update: Uploading started
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: blobName,
          status: 'Uploading started',
          stage: 'uploading',
        }),
      });

      // Manually track progress
      const buffer = await file.arrayBuffer();
      const total = buffer.byteLength;
      const CHUNK_SIZE = 256 * 1024; // 256KB chunks
      const blobChunks = [];
      for (let offset = 0; offset < total; offset += CHUNK_SIZE) {
        blobChunks.push(buffer.slice(offset, offset + CHUNK_SIZE));
      }

      let uploaded = 0;
      const uploadBlob = new Blob(blobChunks);

      const blob = await put(blobName, uploadBlob, {
        access: 'public',
        token: BLOB_TOKEN,
      });

      uploaded = total;
      const percent = Math.round((uploaded / total) * 100);

      // Send status update: Uploading completed
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: blob.url,
          status: 'Uploading completed',
          stage: 'done',
        }),
      });

      uploadedFiles.push({ url: blob.url });

      if (process.env.NODE_ENV === 'development') {
        console.log('Uploaded to Vercel Blob:', blobName);
      }
    }

    return new Response(JSON.stringify({ urls: uploadedFiles }), { status: 200 });
  } catch (err) {
    console.error('Edge Upload Error:', err);

    // Send status update: Uploading error
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileUrl: 'unknown', // Adjust as needed
        status: 'Uploading failed',
        stage: 'error',
      }),
    });

    return new Response(
      JSON.stringify({ error: 'Upload failed', details: err.message }),
      { status: 500 }
    );
  }
}