/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/await-thenable */
"use client"
import React, { useState } from 'react'
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Text from "@tiptap/extension-text";
import EditorMenuBar from './editor-menubar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { boolean, string } from 'zod';
import TagInput from './tag-input';
import { Input } from '@/components/ui/input';
import AIComposeButton from './ai-compose-button';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';

// 定义一个名为EmailEditor的函数组件
type EmailEditorProps = {
  toValues: { label: string, value: string }[];
  ccValues: { label: string, value: string }[];

  subject: string;
  setSubject?: (subject: string) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;

  setToValues: (value: { label: string, value: string }[]) => void;
  setCcValues: (value: { label: string, value: string }[]) => void;

  defaultToolbarExpand?: boolean;
}
const EmailEditor = ({ toValues, ccValues, subject, setSubject,to, handleSend, isSending, setCcValues, setToValues, defaultToolbarExpand }: EmailEditorProps) => {
  const [value, setValue] = React.useState<string>('');

  const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpand ?? false);

  const [token, setToken] = useState<string>('')
  const onGenerate = (token: string) => {
    editor?.commands.insertContent(token)
  }

  const aiGenerate = async(value: string) => {
    const {output} = await generate(value)
    for await (const token of readStreamableValue(output)) {
      if(token) {
        setToken(token)
      }
    }
  }

  React.useEffect(() => {
    editor?.commands?.insertContent(token)
  }, [token])
  
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Mod-j": () => {
          aiGenerate(this.editor.getText());
          // return true;
          // 使用 "Mod-j" 以支持跨平台的快捷键
          console.log('Mod-j')
          return true;
        },
      };
    },
  });

  // 返回一个div元素，里面没有任何内容
  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, customText],
    editorProps: {
      attributes: {
        placeholder: "Write your email here..."
      }
    },
    onUpdate: ({ editor, transaction }) => {
      setValue(editor.getHTML())
    }
  });

  React.useEffect(() => {
    editor?.commands?.insertContent(token)
  }, [editor,token])
  
  if (!editor) {
    return null;
  }
  return (
    <div>
      <div className="flex p-4 py-2 border-b">
        {editor && <EditorMenuBar editor={editor} />}
      </div>

      <div className="p-4 pb-0 space-y-2">
                {expanded && (
                    <>
                        <TagInput placeholder="Add tags" label="To" onChange={setToValues} value={toValues}/>
                        <TagInput placeholder="Add tags" label="Cc" onChange={setCcValues} value={ccValues}/>
                        <Input id="subject" className="w-full" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                    </>
                )}
                <div className="flex items-center gap-2">
                    <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                        <span className="text-green-600 font-medium">
                            Draft{' '}
                        </span>
                        <span>
                            to {to.join(',')}
                        </span>
                    </div>
                    <AIComposeButton
                        isComposing={defaultToolbarExpand}
                        onGenerate={onGenerate}
                    />
                </div>
            </div>

      <div className='prose w-full px-4'>
        <EditorContent editor={editor} value={value} />
      </div>

      <Separator />
      <div className="py-3 px-4 flex items-center justify-between">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Cmd + M
          </kbd>{" "}
          for AI autocomplete
        </span>
        <Button onClick={ async() => {
          editor?.commands.clearContent();
          await handleSend(value);
        }} disabled={isSending}>
          Send
        </Button>
      </div>
    </div>
  )
}

export default EmailEditor
