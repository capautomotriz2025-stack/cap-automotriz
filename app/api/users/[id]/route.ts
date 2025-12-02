import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import User from '@/models/User';

// PUT - Actualizar usuario (solo superadmins)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, email, password, role, active } = body;

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Se hashea automáticamente
    if (role) user.role = role;
    if (typeof active === 'boolean') user.active = active;

    await user.save();

    // Retornar sin password
    const userResponse: any = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en PUT /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario (solo superadmins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar superadmins predefinidos
    const protectedEmails = ['luciano.mastran@gmail.com', 'gerencia@cap.hn'];
    if (protectedEmails.includes(user.email)) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar este superadmin' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error en DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

