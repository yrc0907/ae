"use client"


import { getAurinkoAuthUrl } from "@/lib/aurinko"
import { Button } from "./ui/button"

const LinkAccountButton =() => {
  return (
    <Button
      onClick={ async() => {
        // TODO: Implement link account functionality
        const authUrl = await getAurinkoAuthUrl('Office365')
        console.log(authUrl)
        window.location.href = authUrl
      }}
    >
      Link Account
    </Button>
  )
}
export default LinkAccountButton