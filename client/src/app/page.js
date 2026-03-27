"use client"
import ChatContainer from '@/components/ChatContainer'
import RightSidebar from '@/components/RightSidebar'
import Sidebar from '@/components/Sidebar'
import React, { useState } from 'react'

const Page = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);

    return (
        <div className="h-screen w-screen flex bg-gradient-to-b from-black via-zinc-900 to-black overflow-hidden font-outfit">
            <div className="h-full w-full text-[#e9edef] flex overflow-hidden ">
                
                <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[30%] lg:w-[25%] h-full overflow-hidden border-r border-[#313d45]`}>
                    <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                </div>

                {selectedUser ? (
                    <div className="flex flex-1 h-full overflow-hidden bg-gradient-to-b from-black via-zinc-900 to-black ">
                        <div className="flex-1 h-full flex flex-col overflow-hidden">
                            <ChatContainer 
                                selectedUser={selectedUser} 
                                setSelectedUser={setSelectedUser}
                                messages={messages} 
                                setMessages={setMessages} 
                            />
                        </div>
                        
                        <div className="hidden lg:flex w-[350px] h-full overflow-hidden border-l border-[#313d45]">
                            <RightSidebar 
                                selectedUser={selectedUser} 
                                messages={messages} 
                            />
                        </div>
                    </div>
                ) :""
                }
            </div>
        </div>
    )
}

export default Page;