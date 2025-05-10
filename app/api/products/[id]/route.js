import { database } from '@/config/firebase';
import { get, ref, update } from 'firebase/database';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const product = await request.json();

    // Get the existing product first
    const productRef = ref(database, `public/products/${id}`);
    const snapshot = await get(productRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product
    await update(ref(database), {
      [`public/products/${id}`]: product
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
    console.log(`API: Attempting to delete product with ID: ${id}`);

    // Check if product exists
    const productRef = ref(database, `public/products/${id}`);
    console.log(`API: Product reference path: ${productRef.toString()}`);

    const snapshot = await get(productRef);

    if (!snapshot.exists()) {
      console.log(`API: Product not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log(`API: Product found, proceeding with deletion`);
    console.log(`API: Product data:`, snapshot.val());

    // Delete the product by setting it to null
    await set(productRef, null);
    console.log(`API: Product successfully deleted by setting to null`);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    console.error('Error details:', error.code, error.message);
    return NextResponse.json(
      { error: `Failed to delete product: ${error.message}` },
      { status: 500 }
    );
  }
}
