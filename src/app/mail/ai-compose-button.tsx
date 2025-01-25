/* eslint-disable @typescript-eslint/no-floating-promises */
/*eslint-disable*/
'use client'
// import TurndownService from 'turndown'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import React from 'react'
// import { generateEmail } from "./action"
// import { readStreamableValue } from "ai/rsc"
import { Bot } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
// import { turndown } from '@/lib/turndown'
import useThreads from '@/hooks/use-thread'
import { generateEmail } from "./actions"
import { readStreamableValue } from "ai/rsc"
import { turndown } from "@/lib/turndown"

type Props = {
    onGenerate: (token: string) => void
    isComposing?: boolean
}

const AIComposeButton = (props: Props) => {
    const [prompt, setPrompt] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const { account, threads,threadId } = useThreads()
    const thread = threads?.find(t => t.id === threadId)


    const aiGenerate = async () => {
        let context = ''

        if (!props.isComposing) {
            for(const email of thread?.emails ?? []) {
                const content = `
                    Subject: ${email.subject}
                    From: ${email.from}
                    Sent:${new Date(email.sentAt).toLocaleString()}
                    Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? '')}
                `

                context += content
            }
            
        }

        context +=`
            My name is: ${account?.name} and my email is: ${account?.emailAddress}
        `
        // console.log("context", context)
        const {output} = await generateEmail(context, prompt)
        for await (const token of readStreamableValue(output)) {
            if(token){
                console.log("here is ai token" , token)
                props.onGenerate(token)
            }
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)} size='icon' variant={'outline'}>
                    <Bot className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Smart Compose</DialogTitle>
                    <DialogDescription>
                        AI will compose an email based on the context of your previous emails.
                    </DialogDescription>
                    <div className="h-2"></div>
                    <Textarea
                        placeholder="What would you like to compose?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="h-2"></div>
                    <Button  onClick={
                        ()=>{
                            setOpen(false)
                            setPrompt('')
                            aiGenerate()
                        }

                    }>Generate</Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default AIComposeButton