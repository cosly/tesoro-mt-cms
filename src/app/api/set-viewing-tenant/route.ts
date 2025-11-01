import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * API endpoint to set the viewing tenant for super-admins
 * This allows super-admins to filter their view to a specific tenant
 */
export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json()

    const cookieStore = await cookies()

    if (!tenantId || tenantId === 'all') {
      // Clear the viewing tenant cookie to show all tenants
      cookieStore.delete('viewing-tenant')
      return NextResponse.json({ success: true, viewingTenant: null })
    }

    // Set the viewing tenant cookie
    cookieStore.set('viewing-tenant', tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true, viewingTenant: tenantId })
  } catch (error) {
    console.error('Error setting viewing tenant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set viewing tenant' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to retrieve current viewing tenant
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const viewingTenant = cookieStore.get('viewing-tenant')

    return NextResponse.json({
      success: true,
      viewingTenant: viewingTenant?.value || null,
    })
  } catch (error) {
    console.error('Error getting viewing tenant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get viewing tenant' },
      { status: 500 }
    )
  }
}
