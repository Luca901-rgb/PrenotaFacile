import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Lazy load prisma only at runtime
const getPrisma = async () => {
  const { prisma } = await import('./prisma')
  return prisma
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null
          const email = (typeof credentials.email === 'string' ? credentials.email : String(credentials.email)).trim().toLowerCase()
          const password = typeof credentials.password === 'string' ? credentials.password : String(credentials.password)

          const prisma = await getPrisma()
          const business = await prisma.business.findFirst({
            where: {
              email: { equals: email, mode: 'insensitive' }
            }
          })

          if (!business) return null

          const isPasswordValid = await bcrypt.compare(password, business.password)
          if (!isPasswordValid) return null

          return {
            id: business.id,
            email: business.email,
            name: business.name,
          }
        } catch {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}
