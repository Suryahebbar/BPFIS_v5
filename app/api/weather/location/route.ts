import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    console.log('Getting location for coordinates:', lat, lon);

    // Reverse Geocoding → Convert coordinates to location name (using format=jsonv2)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    console.log('Requesting URL:', url);
    
    const res = await fetch(url);
    const data = await res.json();
    
    console.log('Nominatim response:', data);

    const location = {
      display: data.display_name || "Unknown Location",
      city: data.address?.city || data.address?.town || data.address?.village || "Unknown City",
      state: data.address?.state || "Unknown State",
      country: data.address?.country || "Unknown Country"
    };

    console.log('Final location:', location);

    return NextResponse.json(location);

  } catch (error) {
    console.error('Error getting location:', error);
    return NextResponse.json({ error: 'Failed to get location' }, { status: 500 });
  }
}
