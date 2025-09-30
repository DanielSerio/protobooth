import { NextRequest, NextResponse } from 'next/server';
import { handleFileRead, handleFileWrite, handleFileExists } from '@/api/file-handler';

interface RouteParams {
  params: {
    filename: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const projectRoot = process.cwd();
    const content = await handleFileRead(params.filename, projectRoot);
    return new NextResponse(content, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 404 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { content } = await request.json();
    const projectRoot = process.cwd();
    await handleFileWrite(params.filename, content, projectRoot);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const projectRoot = process.cwd();
    const exists = await handleFileExists(params.filename, projectRoot);
    return new NextResponse(null, { status: exists ? 200 : 404 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}