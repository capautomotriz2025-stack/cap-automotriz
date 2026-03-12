import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

// GET: devuelve el estado de la key (si está seteada en DB o solo en env, sin mostrar el valor completo)
export async function GET() {
  try {
    await connectDB();
    const setting = await Settings.findOne({ key: 'OPENAI_API_KEY' });

    const envKey = process.env.OPENAI_API_KEY || '';
    const dbKey = setting?.value || '';
    const activeKey = dbKey || envKey;

    return NextResponse.json({
      success: true,
      data: {
        source: dbKey ? 'database' : (envKey ? 'environment' : 'none'),
        maskedKey: activeKey
          ? activeKey.slice(0, 8) + '••••••••••••••••••••' + activeKey.slice(-4)
          : null,
        hasDbKey: !!dbKey,
        hasEnvKey: !!envKey,
        lastUpdated: setting?.updatedAt || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: guarda o actualiza la key en DB
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 20) {
      return NextResponse.json({ success: false, error: 'API Key inválida' }, { status: 400 });
    }

    await connectDB();
    await Settings.findOneAndUpdate(
      { key: 'OPENAI_API_KEY' },
      { key: 'OPENAI_API_KEY', value: apiKey.trim() },
      { upsert: true, new: true }
    );

    // Actualizar en memoria para que tome efecto de inmediato
    process.env.OPENAI_API_KEY = apiKey.trim();

    const masked = apiKey.slice(0, 8) + '••••••••••••••••••••' + apiKey.slice(-4);
    return NextResponse.json({ success: true, data: { maskedKey: masked, source: 'database' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: elimina la key de DB (vuelve a usar la del env)
export async function DELETE() {
  try {
    await connectDB();
    await Settings.deleteOne({ key: 'OPENAI_API_KEY' });

    return NextResponse.json({
      success: true,
      message: 'Key eliminada de la base de datos. Se usará la variable de entorno.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
