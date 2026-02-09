import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Force dynamic rendering to avoid build-time database connection
export const dynamic = 'force-dynamic'
