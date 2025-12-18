import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { FarmerOrder } from '@/lib/models/FarmerOrder'
import mongoose from 'mongoose'

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const { orderId } = resolvedParams

    await connectDB()

    // Debug: List all orders for this user
    const allUserOrders = await FarmerOrder.find({ 
      $or: [{ userId }, { user: userId }]
    }).lean()

    const orderIds = allUserOrders.map(o => ({ _id: o._id, orderNumber: o.orderNumber }))
    
    // Find the specific order
    const order = allUserOrders.find(o => {
      const orderIdStr = o._id.toString()
      const matches = orderIdStr === orderId
      console.log(`Comparing: "${orderIdStr}" with "${orderId}" -> ${matches}`)
      return matches
    })

    return NextResponse.json({ 
      debug: {
        searchingFor: { orderId, userId },
        foundOrderIds: orderIds,
        foundOrder: order ? 'YES' : 'NO',
        orderDetails: order || null
      }
    })
  } catch (err) {
    console.error('Debug API error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
