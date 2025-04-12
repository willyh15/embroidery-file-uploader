// pages/api/vector-data.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) return NextResponse.json({ error: 'Missing fileUrl' }, { status: 400 });

    const svgName = fileUrl.split('/').pop().replace(/\.[^.]+$/, '.svg');
    const vectorEndpoint = `https://embroideryfiles.duckdns.org/vector/${svgName}`;
    const res = await fetch(vectorEndpoint);
    const svgText = await res.text();

    return NextResponse.json({ svg: svgText });
  } catch (err) {
    console.error('[vector-data error]', err);
    return NextResponse.json({ error: 'Failed to fetch vector data' }, { status: 500 });
  }
}
