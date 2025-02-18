import React from 'react'
import { FaChartLine, FaPlus, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ConnectButton } from './ConnectButton'

function Profile() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7E6] to-[#FFEDCC] flex flex-col items-center justify-center p-8">
      {/* Header with Wallet Connection */}
      <div className="w-full max-w-3xl mb-16">
        <div className="flex flex-col items-center mb-4">
          <h1 
            onClick={() => navigate('/')}
            className="text-3xl font-bold text-[#FF9900] cursor-pointer hover:text-[#CC7A00] transition-colors mb-4"
          >
            MoveScan
          </h1>
          <div className="bg-[#FFB84D] rounded-2xl p-2">
            <ConnectButton />
          </div>
        </div>
        <div className="h-px bg-[#FFB84D]/60 w-full mt-4"></div>
      </div>

      {/* Stats Boxes */}
      <div className="w-full max-w-3xl mb-8">
        <div className="grid grid-cols-3 bg-white/80 rounded-2xl overflow-hidden border-2 border-[#FFB84D]">
          <div className="p-4 text-center border-r border-[#FFB84D]/60">
            <h3 className="text-sm font-semibold text-[#664400] mb-1">Total Bets</h3>
            <p className="text-2xl font-bold text-[#CC7A00]">8</p>
          </div>
          
          <div className="p-4 text-center border-r border-[#FFB84D]/60">
            <h3 className="text-sm font-semibold text-[#664400] mb-1">Win Percentage</h3>
            <p className="text-2xl font-bold text-[#CC7A00]">78%</p>
          </div>
          
          <div className="p-4 text-center">
            <h3 className="text-sm font-semibold text-[#664400] mb-1">Active Bets</h3>
            <p className="text-2xl font-bold text-[#CC7A00]">5</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="w-full max-w-3xl mb-16">
        <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#FFB84D]">
          <h2 className="text-2xl font-bold text-[#FF9900] mb-4 text-center">Recent Activities</h2>
          <div className="text-[#664400] space-y-4">
            <div className="border-b border-[#FFB84D]/60 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Placed 0.5 FLOW</p>
                  <p className="text-sm text-[#805500]">"Will I win flow track"</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#805500]">2 hours ago</p>
                  <p className="text-sm font-medium text-green-600">WON</p>
                </div>
              </div>
            </div>

            <div className="border-b border-[#FFB84D]/60 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Placed 1.2 FLOW</p>
                  <p className="text-sm text-[#805500]">"Will FLOW become leading green chain"</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#805500]">5 hours ago</p>
                  <p className="text-sm font-medium text-green-600">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default Profile
