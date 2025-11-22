"use client"

import React from 'react'

interface LearningCardProps {
  title: string
  description: string
  onStartLearning?: () => void
  className?: string
}

export function LearningCard({ 
  title, 
  description, 
  onStartLearning, 
  className = "" 
}: LearningCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button 
        onClick={onStartLearning}
        className="text-blue-600 font-medium hover:text-blue-700"
      >
        Start Learning →
      </button>
    </div>
  )
}

