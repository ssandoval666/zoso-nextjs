import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const GOOGLE_DRIVE_FILE_ID = '1sLOwMpyxNvtV4fwUC0DDgGZrTvErpKTq';
const CLIENT_EMAIL = 'zosodesign@my-project-1543264584169.iam.gserviceaccount.com';
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDIJcaCtcCcpPQI\ns/wpKCZ0hZRvBHMihYnyfRZUjkVs8neeF5wmJ08HEsY3iiFsWOUadPxLmDCsaej2\n4Oq3Sk+2gJJOI+N3iuuhgfjYebul5VwZtD9Mhe1RyR/PNaVLYMquGig6ZtjTnnNs\n7pUdO4ZKkPu3qNZazkLesumJksvnEsaNmdnqKAkFHCdUpgNgyvS1KZF4v5spFWq3\n/32p1b8mEd8IhTrh/tohuYF3z94S13pA9skNK+PgTNVBNWh82jPZ6BK7T1QcOS+E\nIJX+JrBPGynk1X/+B9IZrvveY2Cxy0wAiVKVoEEiA4VsXnZ2F+ACkVnAdUh9HbyV\nQj54HVBvAgMBAAECggEABf7vtZG5UL5pgYTWz7egTORSWbyoSe2QABL6oyzVH2bo\ng3SeNmkxQMgX5qkKLrAMQpPxM1iLUlbxf8sMIDjz+2BadOHPwJCJiSYwhleoC4rv\nJkv6i3g41eoXCSku9JU6041jQCCkBTu3DH/dn4MQsLvE9q/Y2atZ+hVVBRlZmpuT\ntMsuX533TCfgPt1/CkoKyW0baaudiUP5z/i1UETMGFKFPKEK2/KeG/kx8GqsOcBm\ntXT1a8D3y7K2i+2NbZNmiu445HH1sYq16Vi9/YBBLw4kp+OthCOACeGbpqcyI7i2\nlmtPU6jtG/rXNNQfXEc+e7q2FBZZnHST3w7aInhtpQKBgQDtzW90WjZJjyydBZl7\nB25lGZb+rpr3O0XaFA3CulidgH9mnSUVH4T2o0nChExdEF4909L2A0cD5uZa9PDZ\nxZ+8Wn50vpS3FWqu6u/nzYMI/spQrJ8b8kLaHRnPzGSmH3hOePbpL+mnC+aOeW4p\nHs5n8QaZ/kfZD825jGIVXTTGFQKBgQDXdq2MzDTpSa8S7cvvc9VmJZ6/Ovs2tun1\nmOkMSl8AnaEUZtqJHsVnmI24t4gP6rm/GSvYrtr1ZvSCOG9pB0/V8ztgfDhb69qb\n3nykdQLoTNgGctUn/3v6UrbL1R8h4SPCy+XlavK64R1y6tZoVQfVlvKNvXQbuirf\nXhw7wulBcwKBgH2ozBd4wC0YuiNzXQoVADHuVsrX601vhdbaN/dJTyBTUX8g1QKX\neER4PrbKACxBRPt43oZfbvxR3DH+MvNwqZr3WtFID/+7EnfB7+nWwEJVmQUOYrl6\nx/bH3+bdg+YAxSr6YscQKXC7KibpZdvWyo1EYQ+ovcCmyDgfRYkyinuNAoGAf6S+\nEeBUJDRTtGoN29CKhpYY4n8lnfdkyOuKfI5+k5XOfJCmPH9vQP0eUGTiBVPwMGbQ\nE/EapDEW/yJB1j3PrRcIgRN2K/agrqByxNbRHx+PBtr2rlhrcROZWU3rwJ1pGxjC\nHFRscgu074Rx+qMNHhrrnM60v0xd47AUF89TckMCgYB2XjYrBhfU6GprKV273m+d\nOkbHR1GFDj2Le6WOVAyPIbL4I03y6MeMOOTP8P/HRT4kHZ882bU28zb7mLvr6Jkv\nQS0glbV8JzyuCqOgR87sL54PFfLxg/MDtd38L3sD/Wum69/41fqRT1aHBPcS4JlT\n0JVidxy/KPDj6hgdg8ETjg==\n-----END PRIVATE KEY-----\n';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'], // Permiso global necesario para editar archivos ajenos
});

const drive = google.drive({ version: 'v3', auth });

async function getProductsFromDrive() {
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