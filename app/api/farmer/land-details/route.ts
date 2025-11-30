import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { LandDetails } from '../../../../lib/models/LandDetails';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Fetch all land details for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const landDetails = await LandDetails.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: landDetails,
      count: landDetails.length 
    });
  } catch (error) {
    console.error('Error fetching land details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch land details' 
    }, { status: 500 });
  }
}

// POST - Create new land details with image upload
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    // Extract form fields
    const userId = formData.get('userId') as string;
    const centroidLatitude = parseFloat(formData.get('centroidLatitude') as string);
    const centroidLongitude = parseFloat(formData.get('centroidLongitude') as string);
    const sideLengths = JSON.parse(formData.get('sideLengths') as string);
    const vertices = JSON.parse(formData.get('vertices') as string);
    const geojson = formData.get('geojson') as string;
    const surveyNumber = formData.get('surveyNumber') as string;
    const extent = formData.get('extent') as string;
    const location = formData.get('location') as string;
    const taluk = formData.get('taluk') as string;
    const hobli = formData.get('hobli') as string;
    const village = formData.get('village') as string;
    const soilType = formData.get('soilType') as string;
    const cropType = formData.get('cropType') as string;
    
    const sketchImage = formData.get('sketchImage') as File;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Handle image upload
    let imageData = null;
    if (sketchImage && sketchImage.size > 0) {
      const bytes = await sketchImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'land-sketches');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}_${timestamp}_${sketchImage.name}`;
      const filepath = join(uploadsDir, filename);
      
      // Write file
      await writeFile(filepath, buffer);
      
      imageData = {
        filename: filename,
        originalName: sketchImage.name,
        path: `/uploads/land-sketches/${filename}`,
        size: sketchImage.size,
        mimeType: sketchImage.type,
        uploadedAt: new Date()
      };
    }

    // Calculate total area from vertices (simple polygon area calculation)
    let totalArea = 0;
    if (vertices && vertices.length >= 3) {
      // Using Shoelace formula for polygon area
      for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        totalArea += vertices[i].latitude * vertices[j].longitude;
        totalArea -= vertices[j].latitude * vertices[i].longitude;
      }
      totalArea = Math.abs(totalArea) / 2;
    }

    // Create land details record
    const landDetails = new LandDetails({
      userId,
      sketchImage: imageData,
      landData: {
        centroidLatitude,
        centroidLongitude,
        sideLengths,
        vertices,
        totalArea,
        geojson
      },
      rtcDetails: {
        surveyNumber,
        extent,
        location,
        taluk,
        hobli,
        village,
        soilType,
        cropType
      },
      processingStatus: 'completed',
      processedAt: new Date()
    });

    await landDetails.save();

    return NextResponse.json({ 
      success: true, 
      data: landDetails,
      message: 'Land details saved successfully' 
    });
  } catch (error) {
    console.error('Error saving land details:', error);
    return NextResponse.json({ 
      error: 'Failed to save land details' 
    }, { status: 500 });
  }
}

// PUT - Update existing land details
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, userId, ...updateData } = body;
    
    if (!id || !userId) {
      return NextResponse.json({ error: 'Land details ID and User ID are required' }, { status: 400 });
    }

    const landDetails = await LandDetails.findOneAndUpdate(
      { _id: id, userId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!landDetails) {
      return NextResponse.json({ error: 'Land details not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: landDetails,
      message: 'Land details updated successfully' 
    });
  } catch (error) {
    console.error('Error updating land details:', error);
    return NextResponse.json({ 
      error: 'Failed to update land details' 
    }, { status: 500 });
  }
}

// DELETE - Delete land details
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!id || !userId) {
      return NextResponse.json({ error: 'Land details ID and User ID are required' }, { status: 400 });
    }

    const landDetails = await LandDetails.findOneAndDelete({ _id: id, userId });

    if (!landDetails) {
      return NextResponse.json({ error: 'Land details not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Land details deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting land details:', error);
    return NextResponse.json({ 
      error: 'Failed to delete land details' 
    }, { status: 500 });
  }
}
