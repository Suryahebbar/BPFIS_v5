import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Seller } from '@/lib/models/supplier';
import { requireAuth } from '@/lib/supplier-auth-middleware';
import { uploadFile } from '@/lib/cloudinary';

// GET /api/supplier/documents - Get supplier documents (non-dynamic route)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;
    
    // Get supplier documents
    const seller = await Seller.findById(sellerId).select('documents').lean();
    
    if (!seller) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ documents: seller.documents || [] });
    
  } catch (error: any) {
    console.error('Error fetching supplier documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: error.status || 500 }
    );
  }
}

// POST /api/supplier/documents - Upload supplier documents (non-dynamic route)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate supplier
    const auth = await requireAuth(request);
    const sellerId = auth.sellerId;
    
    // Check if request is FormData (for file uploads) or JSON
    const contentType = request.headers.get('content-type') || '';
    let documentsUpdate: any = {};
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      console.log('Received FormData with entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }
      
      // Handle multiple document types from frontend
      const documentTypes = ['businessCertificate', 'tradeLicense', 'ownerIdProof', 'gstCertificate'];
      
      for (const docType of documentTypes) {
        const file = formData.get(docType) as File;
        if (file && file.size > 0) {
          console.log(`Processing ${docType}: ${file.name} (${file.size} bytes)`);
          
          try {
            // Try Cloudinary upload first
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadFile(buffer, 'documents', `supplier-${sellerId}-${docType}-${Date.now()}`);
            
            console.log(`Upload result for ${docType}:`, uploadResult);
            
            if (uploadResult.success && uploadResult.data) {
              // Store just the URL as per schema
              documentsUpdate[docType] = uploadResult.data.url;
              console.log(`Successfully stored ${docType} URL: ${uploadResult.data.url}`);
            } else {
              console.error(`Cloudinary upload failed for ${docType}:`, uploadResult.error);
              // For failed uploads, store null to indicate attempted but failed
              documentsUpdate[docType] = null;
            }
          } catch (uploadError) {
            console.error(`Upload error for ${docType}:`, uploadError);
            // For failed uploads, store null
            documentsUpdate[docType] = null;
          }
        }
      }
      
      if (Object.keys(documentsUpdate).length === 0) {
        return NextResponse.json(
          { error: 'No valid files were uploaded. Please select at least one file.' },
          { status: 400 }
        );
      }
      
      console.log('Documents update object:', documentsUpdate);
      
    } else {
      // Handle JSON request (for document status updates)
      const body = await request.json();
      if (body.documents) {
        documentsUpdate = body.documents;
      } else {
        return NextResponse.json(
          { error: 'Invalid request format. Expected FormData or documents object.' },
          { status: 400 }
        );
      }
    }
    
    // Update supplier documents - clear existing array and set new object structure
    const updateQuery: any = {
      $unset: { documents: 1 } // Remove the existing documents array
    };
    
    // Then set the new documents object
    for (const [docType, url] of Object.entries(documentsUpdate)) {
      updateQuery[`documents.${docType}`] = url;
    }
    
    console.log('MongoDB update query:', updateQuery);
    
    // First update to clear documents, then second update to set new structure
    await Seller.findByIdAndUpdate(sellerId, { $unset: { documents: 1 } });
    
    const updatedSupplier = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: { documents: documentsUpdate } },
      { new: true }
    ).select('documents').lean();
    
    if (!updatedSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    console.log('Updated supplier documents:', updatedSupplier.documents);
    
    // Count successful vs failed uploads
    const successfulUploads = Object.entries(updatedSupplier.documents).filter(([_, url]) => url !== null && url !== undefined && url !== '').length;
    const attemptedUploads = Object.keys(documentsUpdate).length;
    
    return NextResponse.json({ 
      message: `Documents processed successfully. ${successfulUploads} uploaded successfully.`,
      documents: updatedSupplier.documents,
      uploadSummary: {
        total: attemptedUploads,
        successful: successfulUploads,
        failed: attemptedUploads - successfulUploads
      }
    });
    
  } catch (error: any) {
    console.error('Error uploading supplier documents:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload documents',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
