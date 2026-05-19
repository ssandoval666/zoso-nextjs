import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const GOOGLE_DRIVE_FILE_ID = process.env.GOOGLE_DRIVE_FILE_ID || '';
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || '';
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || '';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'], // Permiso global necesario para editar archivos ajenos
});

const drive = google.drive({ version: 'v3', auth });

export async function getProductsFromDrive() {
  if (!GOOGLE_DRIVE_FILE_ID) {
    console.error('⚠️ ID de Google Drive no configurado.');
    return [];
  }
  try {
    const res = await drive.files.get({
      fileId: GOOGLE_DRIVE_FILE_ID,
      alt: 'media'
    });
    let data = res.data;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    return Array.isArray(data) ? data : [];
  } catch (e: any) {
    console.error('❌ Error al obtener JSON desde Google Drive:', e.message || e);
    return [];
  }
}

async function updateDriveFile(content: any) {
  try {
    await drive.files.update({
      fileId: GOOGLE_DRIVE_FILE_ID,
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(content, null, 2),
      },
    });
  } catch (error: any) {
    console.error("❌ Error de Google Drive API:", error.message);
    throw error;
  }
}

export async function GET(req: Request) {
  try {
    if (!GOOGLE_DRIVE_FILE_ID) {
      return NextResponse.json({ error: 'ID de Google Drive no configurado' }, { status: 500 });
    }
    console.log('📦 Obteniendo productos desde Google Drive');
    const products = await getProductsFromDrive();
    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ Error en GET de productos:', error);
    return NextResponse.json({ error: 'Error al cargar los productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!GOOGLE_DRIVE_FILE_ID) {
      return NextResponse.json({ error: 'ID de Google Drive no configurado' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    let name: string | null = null;
    let price: string | null = null;
    let description: string | null = null;
    let imagePaths: string[] = [];

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      name = formData.get('name') as string | null;
      price = formData.get('price') as string | null;
      description = formData.get('description') as string | null;
      const files = formData.getAll('images') as File[];
      for (const file of files) {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const mimeType = file.type || 'image/jpeg';
          imagePaths.push(`data:${mimeType};base64,${buffer.toString('base64')}`);
        }
      }
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (Array.isArray(body)) {
        await updateDriveFile(body);
        return NextResponse.json(body, { status: 200 });
      }
      name = body.name;
      price = body.price;
      description = body.description;
      if (Array.isArray(body.images)) imagePaths = body.images;
      else if (Array.isArray(body.imagePaths)) imagePaths = body.imagePaths;
    } else {
      return NextResponse.json({ error: 'Content-Type no soportado. Usa multipart/form-data o application/json.' }, { status: 415 });
    }

    if (!name || !price) {
      return NextResponse.json({ error: 'Faltan datos requeridos (name, price).' }, { status: 400 });
    }

    const priceVal = price === 'Consultar' ? 'Consultar' : Number(price);
    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || '',
      price: priceVal,
      imagePaths
    };

    const products = await getProductsFromDrive();
    products.push(newProduct);
    await updateDriveFile(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST:', error.message);
    return NextResponse.json({ error: 'Error interno: ' + error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!GOOGLE_DRIVE_FILE_ID) {
      return NextResponse.json({ error: 'ID de Google Drive no configurado' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    let id: string | null = null;
    let name: string | null = null;
    let price: string | null = null;
    let description: string | null = null;
    let existingImages: string[] = [];
    let newImagePaths: string[] = [];

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      id = formData.get('id') as string | null;
      name = formData.get('name') as string | null;
      price = formData.get('price') as string | null;
      description = formData.get('description') as string | null;
      existingImages = formData.getAll('existingImages') as string[];
      const files = formData.getAll('images') as File[];

      if (files && files.length > 0) {
        for (const file of files) {
          if (file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const mimeType = file.type || 'image/jpeg';
            newImagePaths.push(`data:${mimeType};base64,${buffer.toString('base64')}`);
          }
        }
      }
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (Array.isArray(body)) {
        await updateDriveFile(body);
        return NextResponse.json(body, { status: 200 });
      }
      id = body.id;
      name = body.name;
      price = body.price;
      description = body.description;
      if (Array.isArray(body.existingImages)) existingImages = body.existingImages;
      if (Array.isArray(body.images)) newImagePaths = body.images;
      else if (Array.isArray(body.imagePaths)) newImagePaths = body.imagePaths;
    } else {
      return NextResponse.json({ error: 'Content-Type no soportado.' }, { status: 415 });
    }

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'Faltan datos requeridos (id, name, price).' }, { status: 400 });
    }

    let products = await getProductsFromDrive();
    const productIndex = products.findIndex((p: any) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }

    let finalImagePaths: string[] = existingImages ? [...existingImages] : [];
    finalImagePaths = finalImagePaths.concat(newImagePaths);

    const priceVal = price === 'Consultar' ? 'Consultar' : Number(price);
    products[productIndex] = { ...products[productIndex], name, description: description || '', price: priceVal, imagePaths: finalImagePaths };
    
    if (products[productIndex].imagePath) {
      delete products[productIndex].imagePath;
    }
    
    await updateDriveFile(products);
    
    return NextResponse.json(products[productIndex], { status: 200 });
  } catch (error: any) {
    console.error('Error en PUT:', error.message);
    return NextResponse.json({ error: 'Error interno: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!GOOGLE_DRIVE_FILE_ID) {
      return NextResponse.json({ error: 'ID de Google Drive no configurado' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });

    let products = await getProductsFromDrive();
    const productExists = products.some((p: any) => p.id === id);

    if (productExists) {
      products = products.filter((p: any) => p.id !== id);
      await updateDriveFile(products);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en DELETE:', error.message);
    return NextResponse.json({ error: 'Error interno: ' + error.message }, { status: 500 });
  }
}