import React, { useState } from 'react'
// import { ConnectButton } from './ConnectButton'
import { FaChartLine, FaPlus, FaUser, FaRobot, FaPaperPlane, FaTimes, FaShoppingCart, FaCheck } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { GoogleGenerativeAI } from "@google/generative-ai"
// import { publicClient } from '../config'
import { wagmiAbi } from '../abi'
import ConnectButton from './ConnectButton'
import mockData from '../data/mockQuestions.json'

function LiveBet() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([
    { text: "Hi! I'm looking for help with predictions.", isBot: false }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const yesOpacity = useTransform(x, [-200, 0, 100], [0, 0, 1])
  const noOpacity = useTransform(x, [-100, 0, 200], [1, 0, 0])
  const controls = useAnimation()

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const handleDragEnd = async (_, info) => {
    const swipeThreshold = 100

    if (Math.abs(info.offset.x) > swipeThreshold) {
      await controls.start({
        x: info.offset.x > 0 ? 1000 : -1000,
        transition: { duration: 0.3 },
      })

      if (info.offset.x > 0) {
        navigate('/buy-bet')
        return
      }

      if (currentIndex >= mockData.questions.length - 1) {
        navigate('/profile')
        return
      }

      setCurrentIndex(prev => prev + 1)
      x.set(0)
      y.set(0)
      controls.set({ x: 0, y: 0 })
    } else {
      controls.start({
        x: 0,
        y: 0,
        transition: { type: "spring", duration: 0.5 },
      })
    }
  }

  const currentQuestion = mockData.questions[currentIndex]

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input
    setMessages(prev => [...prev, { text: userMessage, isBot: false }])
    setInput('')
    setIsLoading(true)

    try {
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      })

      const prompt = `You are Eliza, a knowledgeable prediction market and cryptocurrency assistant. 
                     Previous context: ${messages.map(m => m.text).join('\n')}
                     User question: ${userMessage}
                     Please provide a helpful response:`

      const result = await chat.sendMessage([prompt])
      const response = await result.response
      const botResponse = response.text()

      setMessages(prev => [...prev, { text: botResponse, isBot: true }])
    } catch (error) {
      console.error('Gemini API Error:', error)
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm experiencing a technical issue. Please try asking your question again.", 
        isBot: true 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleElizaClick = () => {
    console.log('Opening chat...')
    setShowChat(prev => {
      console.log('Setting showChat to:', !prev)
      return !prev
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7E6] to-[#FFEDCC] flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="w-full max-w-3xl mb-16">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold text-[#FF9900] mb-4">PrediMove</h1>
          <ConnectButton />
        </div>
        <div className="h-px bg-[#FFB84D]/60 w-full mt-4"></div>
      </div>

      {/* Swipeable Card */}
      <div className="w-full max-w-xl mb-8 relative z-20">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, y, rotate }}
          onDragEnd={handleDragEnd}
          className="bg-gradient-to-br from-[#FF9900]/80 to-[#CC7A00]/80 rounded-2xl p-8 cursor-grab active:cursor-grabbing shadow-xl"
        >
          {/* Question Number */}
          <div className="text-white/70 text-sm mb-4">
            Question {currentIndex + 1} of {mockData.questions.length}
          </div>

          {/* Question */}
          <div className="min-h-[100px] flex items-center justify-center">
            <h3 className="text-xl font-bold text-white text-center">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={() => handleDragEnd(null, { offset: { x: -150 } })}
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all transform hover:scale-105 active:scale-95"
            >
              <FaTimes className="text-white text-2xl" />
            </button>
            <button 
              onClick={() => navigate('/buy-bet')}
              className="bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all transform hover:scale-105 active:scale-95"
            >
              <FaCheck className="text-white text-2xl" />
            </button>
          </div>
        </motion.div>

        {/* Swipe Indicators */}
        <motion.div 
          style={{ opacity: noOpacity }} 
          className="absolute top-1/2 left-4 -translate-y-1/2"
        >
          <div className="bg-red-500/80 text-white rounded-full p-4">
            <FaTimes size={32} />
          </div>
        </motion.div>
        <motion.div 
          style={{ opacity: yesOpacity }} 
          className="absolute top-1/2 right-4 -translate-y-1/2"
        >
          <div className="bg-green-500/80 text-white rounded-full p-4">
            <FaCheck size={32} />
          </div>
        </motion.div>
      </div>

      {/* Eliza AI Button */}
      <div className="w-full max-w-xl mb-16 flex justify-center z-20">
        <button
          onClick={handleElizaClick}
          className="bg-gradient-to-r from-[#FF9900] to-[#CC7A00] text-[#664400] px-6 py-2 rounded-xl text-sm font-medium hover:from-[#CC7A00] hover:to-[#FF9900] transition-colors"
        >
          Ask Eliza AI
        </button>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#FFF7E6] rounded-2xl w-full max-w-xl relative">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#FF9900] to-[#CC7A00] p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaRobot className="text-[#664400] text-2xl" />
                <h2 className="text-lg font-bold text-[#664400]">Eliza AI powered by Polymarket</h2>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="text-[#664400] hover:text-[#FFB84D] transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.isBot
                        ? 'bg-white text-[#664400] rounded-tl-none border border-[#FFB84D]'
                        : 'bg-[#FF9900] text-[#664400] rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-[#664400] rounded-2xl rounded-tl-none px-4 py-2 border border-[#FFB84D]">
                    Typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-[#FFB84D]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-[#FFB84D] focus:outline-none focus:border-[#FF9900] text-[#664400]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-[#FF9900] text-[#664400] p-3 rounded-xl transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#CC7A00]'
                  }`}
                  disabled={isLoading}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Icons */}
      <div className="w-full max-w-3xl">
        <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#FFB84D] flex justify-between items-center px-16">
          <button 
            onClick={() => navigate('/live-bets')}
            className="flex flex-col items-center gap-2 text-[#664400]"
          >
            <FaChartLine size={32} />
            <span className="text-sm">Live Bets</span>
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="bg-[#FF9900] hover:bg-[#CC7A00] text-white p-5 rounded-full transition-colors border-2 border-[#FFB84D]"
          >
            <FaPlus size={36} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 text-[#664400]"
          >
            <FaUser size={32} />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveBet