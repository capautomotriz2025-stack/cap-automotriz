import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import User from '@/models/User';

// GET - Obtener todos los usuarios (solo superadmins)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    await connectDB();

    if (!isMongoDBAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Base de datos no disponible' },
        { status: 503 }
      );
    }

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Error en GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario (solo superadmins)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    await connectDB();

    if (!isMongoDBAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Base de datos no disponible' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password, // Se hashea automáticamente en el pre-save hook
      role: role || 'user',
      active: true,
    });

    // Retornar sin password
    const userResponse: any = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { success: true, data: userResponse, message: 'Usuario creado exitosamente' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

