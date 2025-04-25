import { NextResponse } from 'next/server';
import { ref, update, get, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const product = await request.json();
    
    // Get the existing product first
    const productRef = ref(database, `products/${id}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product
    await update(ref(database), {
      [`products/${id}`]: product
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if product exists
    const productRef = ref(database, `products/${id}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await remove(productRef);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
