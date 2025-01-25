'use client'
import React from 'react'
import EmailEditor from './email-editor'
import useThreads from '@/hooks/use-thread'
import { api, RouterOutputs } from '@/trpc/react'
import { toast } from 'sonner'

const ReplyBox = () => {
const {threadId,accountId} = useThreads()

const {data:replyDetails} = api.account.getReplyDetails.useQuery({
    threadId:threadId ?? '',
    accountId:accountId
})
if(!replyDetails) return null

return <Component replyDetails={replyDetails} />
}

const Component = ({replyDetails}:{replyDetails:NonNullable<RouterOutputs['account']['getReplyDetails']>}) => {
        const {accountId,threadId} = useThreads()

    const [subject, setSubject] = React.useState(replyDetails.subject.startsWith('Re:') ? replyDetails.subject : `Re: ${replyDetails.subject}`);

    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address, value: to.address })) || [])
    const [ccValues, setCcValues] = React.useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })) || [])
    
        React.useEffect(() => {
        if (!replyDetails || !threadId) return;

        if (!replyDetails.subject.startsWith('Re:')) {
            setSubject(`Re: ${replyDetails.subject}`)
        } else {
            setSubject(replyDetails.subject)
        }
        setToValues(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
        setCcValues(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

    }, [replyDetails, threadId])
    
    const sendEmail = api.account.sendEmail.useMutation()

    const handleSend = async (value: string) => {
        if (!replyDetails) return;
        sendEmail.mutate({
            accountId,
            threadId: threadId ?? undefined,
            body: value,
            subject,
            from: replyDetails.from,
            to: replyDetails.to.map(to => ({ name: to.name ?? to.address, address: to.address })),
            cc: replyDetails.cc.map(cc => ({ name: cc.name ?? cc.address, address: cc.address })),
            replyTo: replyDetails.from,
            inReplyTo: replyDetails.id,
        }, {
            onSuccess: () => {
                toast.success("Email sent")
                // editor?.commands.clearContent()
            },
            onError: (e) => {
                toast.error('Error sending email')
            }
        })
    }


    return (
        <EmailEditor
            subject={subject}
            toValues={toValues}
            ccValues={ccValues}

            setSubject={setSubject}
            setToValues={setToValues}
            setCcValues={setCcValues}
            to={replyDetails.to.map(to => to.address)}

            isSending={sendEmail.isPending}
            handleSend={handleSend}
        />
    )
}

export default ReplyBox