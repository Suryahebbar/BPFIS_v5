import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { FarmerOrder } from '@/lib/models/FarmerOrder'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')

    await connectDB()

    const allUserOrders = await FarmerOrder.find({ 
      $or: [{ userId }, { user: userId }]
    }).lean()

    const order = allUserOrders.find(o => {
      const orderIdStr = o._id.toString()
      const matches = orderIdStr === orderId
      return {
        orderIdStr,
        searchingFor: orderId,
        matches
      }
    })

    return NextResponse.json({ 
      test: {
        userId,
        orderId,
        totalOrders: allUserOrders.length,
        comparisons: allUserOrders.map(o => ({
          orderIdStr: o._id.toString(),
          searchingFor: orderId,
          matches: o._id.toString() === orderId
        }))
      }
    })
  } catch (err) {
    console.error('Test API error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
