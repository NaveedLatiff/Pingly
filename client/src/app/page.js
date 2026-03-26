"use client"
import ChatContainer from '@/components/ChatContainer'
import RightSidebar from '@/components/RightSidebar'
import Sidebar from '@/components/Sidebar'
import React, { useState } from 'react'

const Page = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);

    return (
        <div className="h-screen w-screen flex bg-[#0b141a] overflow-hidden">
            <div className="h-full w-full text-[#e9edef] flex overflow-hidden bg-[#222e35]">
                
                <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[30%] lg:w-[25%] h-full overflow-hidden border-r border-[#313d45]`}>
                    <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                </div>

                {selectedUser ? (
                    <div className="flex flex-1 h-full overflow-hidden bg-[#0b141a]">
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
                ) : (
                    <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center bg-[#222e35] relative">
                        <div className="text-center space-y-6 z-10 px-6">
                            <div className="flex justify-center">
                                <div className="p-8 rounded-full bg-[#202c33]">
                                    <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#8696a0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-3xl font-light text-[#e9edef]">QuickChat Web</h1>
                            <p className="text-[#8696a0] max-w-sm mx-auto text-[14px] leading-relaxed">
                                Send and receive messages without keeping your phone online.<br/>
                                Use QuickChat on up to 4 linked devices and 1 phone at the same time.
                            </p>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-[6px] bg-[#00a884] opacity-80" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page;