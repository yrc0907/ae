/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { exchangeCodeForAccessToken, getAccountDetails, getAurinkoToken } from "@/lib/aurinko"
import { db } from "@/server/db"
import { auth } from "@clerk/nextjs/server"
import {waitUntil} from '@vercel/functions'
import axios from "axios"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const params = req.nextUrl.searchParams
 
  // console.log(params)
  const code = params.get('code');
  // console.log(code)
  // console.log(`https://api.aurinko.io/v1/auth/token/${code}`)
  
  const token = await exchangeCodeForAccessToken(code as string)
  // console.log(token)
  // console.log(token)
  //   const token = await getAurinkoToken(code as string)
  if (!token) return NextResponse.json({ error: "Failed to fetch token" }, { status: 400 });
  const accountDetails = await getAccountDetails(token.accessToken)
  await db.account.upsert({
      where: { id: token.accountId.toString() },
      create: {
          id: token.accountId.toString(),
          userId,
          accessToken: token.accessToken,
          emailAddress: accountDetails.email,
          name: accountDetails.name
      },
      update: {
        accessToken: token.accessToken,
      }
  })

  // trigger initial sync endpoint
  waitUntil(

    axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, { accountId: token.accountId.toString(), userId }).then((res) => {
        // console.log(res.data)
    }).catch((err) => {
        // console.log(err.response.data)
    })
)


  return NextResponse.redirect(new URL('/mail', req.url))
}