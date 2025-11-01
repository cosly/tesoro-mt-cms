import { getPayload } from 'payload'
import config from '@payload-config'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Script to make a user a super-admin
 * Usage: pnpm exec tsx scripts/make-super-admin.ts <email>
 */
async function makeSuperAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Please provide an email address')
    console.error('Usage: pnpm exec tsx scripts/make-super-admin.ts <email>')
    process.exit(1)
  }

  console.log(`Making ${email} a super-admin...`)

  try {
    const payload = await getPayload({ config: await config })

    // Find the user
    const { docs } = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    if (docs.length === 0) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    const user = docs[0]

    // Update user to be super-admin
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        isSuperAdmin: true,
      },
    })

    console.log(`✅ Successfully made ${email} a super-admin`)
    console.log(`User ID: ${user.id}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

makeSuperAdmin()
