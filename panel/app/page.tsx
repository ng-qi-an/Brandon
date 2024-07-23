'use client';

import { useContext, useEffect, useRef, useState } from "react"
import { MainContext } from "./layout"
import { Input } from "@/components/ui/input";
import MarkdownPreview from '@uiw/react-markdown-preview';

export default function Home(){
  const ctx = useContext(MainContext)
  const [messages, setMessages] = useState([])
  const [responding, setResponding] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  useEffect(()=>{
    ctx.socket.on("retrieve_messages", (data:any)=>{
      setMessages(data.messages)
    })
    ctx.socket.on("ask_question", (data:any)=>{
      if (data.status == "completed"){
        setResponding(false)
      }
    })
    ctx.socket.emit('retrieve_messages')
  }, [])
  useEffect(()=>{
    dialogRef.current!.scrollTo(0, dialogRef.current!.scrollHeight + 70)
  }, [messages])
  useEffect(()=>{
    if (responding == false){

      inputRef.current!.value = ""
      inputRef.current!.focus()
    }
  }, [responding])
  return <div className="flex flex-col w-full h-screen items-center bg-[#f7f7f7] py-4">
    <div ref={dialogRef} className="w-full max-w-[1000px] bg-white flex flex-col h-full rounded-xl overflow-auto">
      <div className="w-full flex flex-col border-b border-zinc-200 sticky top-0 py-4 px-8 bg-white">
        <h1 className="text-xl font-semibold">Brandon</h1>
        <p>A chatbot with <b>heavily</b> infused 🇸🇬 Singlish</p>
      </div>
      {messages.map((message:any, index)=>{
        return <div key={index} className="w-full px-8 py-4 my-1">
          <p className="px-4 py-2 bg-zinc-100 rounded-xl mb-4 w-max font-bold">{message.role == 'user' ? "You" : "🇸🇬 Brandon"}</p>
          <MarkdownPreview 
            wrapperElement={{
              "data-color-mode": "light"
            }} 
            className="ml-4"
            source={message.text}
          />
        </div>
      })}
      <div className="min-h-[100px]"/>
      <form onSubmit={(e)=>{
        ctx.socket.emit("ask_question", {prompt: inputRef.current!.value})
        setResponding(true)
        e.preventDefault()
      }} className="w-full max-w-[1000px] fixed bottom-4 flex items-center py-4 px-8">
        <Input ref={inputRef} disabled={responding} placeholder="Enter a prompt..." className="h-[55px] px-6 text-[16px] rounded-xl" />
      </form>
    </div>
  </div>
}