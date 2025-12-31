'use client'

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImagePreviwerProps{
    images:string[]
}

export default function ImagePreviwer({images}:ImagePreviwerProps ){
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    const minSwipeDistance = 50

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToImage = (index: number) => {
        setCurrentIndex(index)
    }

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance
        if (isLeftSwipe) nextImage()
        if (isRightSwipe) prevImage()
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'ArrowRight') nextImage()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
            </div>
        )
    }

    return(
        <div className="md:grid gap-4 flex flex-col w-full">
            {/* Main Image with Navigation */}
            <div className="relative group">
                <div 
                    className="aspect-[3/4] object-contain border w-full rounded-lg overflow-hidden bg-gray-50 relative"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`Product Image ${currentIndex + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                        }}
                    />
                    
                    {/* Navigation Buttons - Only show if more than 1 image */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                                onClick={prevImage}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                                onClick={nextImage}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    
                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
                
                {/* Dots Indicator */}
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 mt-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-2 sm:gap-4 items-start overflow-x-auto pb-2">
                {images.map((image, index) => (
                    <button 
                        key={index} 
                        onClick={() => goToImage(index)} 
                        className={`border hover:border-primary rounded-lg overflow-hidden transition-all flex-shrink-0 ${
                            index === currentIndex ? 'border-primary ring-2 ring-primary/20' : ''
                        }`}
                    >
                        <img
                            src={image}
                            alt={`Preview thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                            className="aspect-square object-contain bg-gray-50 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                            }}
                        />
                        <span className="sr-only">View Image {index + 1}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}