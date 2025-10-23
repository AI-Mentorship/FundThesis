import React from 'react'
import PageLayout from '@/components/PageLayout'

export default function EnviroPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">EnviroThesis</h1>
        <p className="text-xl text-gray-600 mb-8">
          Invest in a sustainable future with ESG-focused opportunities
        </p>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What is ESG Investing?</h3>
            <p className="text-gray-600">
              ESG investing considers Environmental, Social, and Governance factors alongside 
              financial returns. These investments aim to generate positive social and environmental 
              impact while delivering competitive returns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-green-600 font-bold text-3xl mb-2">E</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Environmental</h3>
              <p className="text-gray-600">
                Climate change, carbon emissions, renewable energy, waste management, and conservation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-blue-600 font-bold text-3xl mb-2">S</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social</h3>
              <p className="text-gray-600">
                Labor standards, human rights, diversity and inclusion, community relations, and health.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-purple-600 font-bold text-3xl mb-2">G</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Governance</h3>
              <p className="text-gray-600">
                Corporate ethics, board structure, executive compensation, transparency, and accountability.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top ESG Stocks</h3>
            <p className="text-gray-600">
              Discover companies leading the way in sustainable business practices and 
              environmental responsibility. Our AI analyzes ESG ratings and performance metrics 
              to identify the best sustainable investment opportunities.
            </p>
          </div>
        </div>
      </main>
     
    </div>
  )
}