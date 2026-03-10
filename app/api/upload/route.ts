import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
};

async function extractText(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }
  } catch (e) {
    console.error('Error extrayendo texto del documento:', e);
  }
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Aceptar PDF y DOCX
    const isAllowed =
      file.type in ALLOWED_TYPES ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.doc');

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten archivos PDF o Word (.docx)' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'El archivo no puede ser mayor a 10 MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Extraer texto del documento
    const extractedText = await extractText(buffer, file.type, file.name);

    let fileUrl: string;
    const folder = fileType === 'job-descriptor' ? 'job-descriptors' : 'general';

    // Determinar content type para almacenamiento
    const contentType =
      file.type || (file.name.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf');

    // Si está en producción (Vercel), usar Blob Storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`☁️  Subiendo archivo a Vercel Blob: ${folder}/${fileName}`);
      const blob = await put(`${folder}/${fileName}`, buffer, {
        access: 'public',
        contentType,
      });
      fileUrl = blob.url;
      console.log('✅ Archivo subido a Blob:', fileUrl);
    } else {
      // En desarrollo local, guardar en /public/uploads
      console.log(`💾 Guardando archivo localmente: ${folder}/${fileName}`);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory already exists
      }
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${folder}/${fileName}`;
      console.log('✅ Archivo guardado localmente:', fileUrl);
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      extractedText,
    });
  } catch (error: any) {
    console.error('Error subiendo archivo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
