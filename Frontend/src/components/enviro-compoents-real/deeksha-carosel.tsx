'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps<T> {
  items: T[]
  currentIndex: number
  onIndexChange: (index: number) => void
  renderCard: (item: T, index: number, isCurrent: boolean) => React.ReactNode
}

export function InfiniteCarousel<T>({ items, currentIndex, onIndexChange, renderCard }: CarouselProps<T>) {
  
  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + items.length) % items.length
    onIndexChange(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % items.length
    onIndexChange(newIndex)
  }

  const getCardStyle = (itemIndex: number) => {
    let relativePosition = itemIndex - currentIndex
    
    // Handle wrap around
    if (relativePosition > items.length / 2) {
      relativePosition -= items.length
    } else if (relativePosition < -items.length / 2) {
      relativePosition += items.length
    }

    const distance = Math.abs(relativePosition)
    
    // Position based on distance from center
    if (distance === 0) {
  return { transform: 'translateX(0) scale(1)', zIndex: 30, filter: 'blur(0px)', opacity: 1 }
} else if (distance === 1) {
  return { transform: `translateX(${relativePosition > 0 ? '50px' : '-50px'}) scale(0.85)`, zIndex: 20, filter: 'blur(2px)', opacity: 0.6 }
} else if (distance === 2) {
  return { transform: `translateX(${relativePosition > 0 ? '50px' : '-50px'}) scale(0.7)`, zIndex: 10, filter: 'blur(4px)', opacity: 0.3 }
} else {
}

  }

  if (items.length === 0) {
    return <div className="flex items-center justify-center py-20 text-gray-600">No items available</div>
  }

  return (
    <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto px-24">
      {/* Previous Button */}
      <button onClick={goToPrevious} className="absolute left-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group">
        <ChevronLeft className="w-6 h-6 text-gray-900 group-hover:text-blue-600 transition-colors" />
      </button>

      {/* Cards Container */}
      <div className="relative w-full min-h-[600px] flex items-center justify-center py-8">
        {items.map((item, index) => (
          <div
            key={index}
            className="absolute w-full max-w-[1000px] transition-all duration-500 ease-out cursor-pointer"
            style={getCardStyle(index)}
            onClick={() => onIndexChange(index)}
          >
            {renderCard(item, index, index === currentIndex)}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button onClick={goToNext} className="absolute right-0 z-40 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group">
        <ChevronRight className="w-6 h-6 text-gray-900 group-hover:text-blue-600 transition-colors" />
      </button>
        
    </div>
  )
}

/*
    
      <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-blue-500 w-6' : 'bg-gray-400 hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
      
      pagination dots
      */