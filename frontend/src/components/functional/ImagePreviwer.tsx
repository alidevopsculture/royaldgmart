'use client'

import { useState } from "react"

interface ImagePreviwerProps{
    images:string[]
}

export default function ImagePreviwer({images}:ImagePreviwerProps ){
    const [displayImg,setDisplayImg]=useState(images[0])

    return(
        <div className="md:grid gap-4 flex flex-col w-full">
        <img
          // src="/placeholder.svg"
          src={displayImg}
          alt="Product Image"
          width={600}
          height={900}
          className="aspect-[3/4] object-contain border w-full rounded-lg overflow-hidden bg-gray-50"
        />
        <div className="flex gap-4 items-start">
          {
            images.map((image,ind)=>{
              return(
              <button key={image} onClick={()=>setDisplayImg(image)} className="border hover:border-primary rounded-lg overflow-hidden transition-colors">
                <img
                  // src="/placeholder.svg"
                  src={image}
                  alt="Preview thumbnail"
                  width={100}
                  height={100}
                  className="aspect-square object-contain bg-gray-50"
                />
                <span className="sr-only">View Image 1</span>
              </button>
              )
            })
          }
          {/* <button className="border hover:border-primary rounded-lg overflow-hidden transition-colors">
            <img
              src="/placeholder.svg"
              alt="Preview thumbnail"
              width={100}
              height={100}
              className="aspect-square object-cover"
            />
            <span className="sr-only">View Image 2</span>
          </button>
          <button className="border hover:border-primary rounded-lg overflow-hidden transition-colors">
            <img
              src="/placeholder.svg"
              alt="Preview thumbnail"
              width={100}
              height={100}
              className="aspect-square object-cover"
            />
            <span className="sr-only">View Image 3</span>
          </button>
          <button className="border hover:border-primary rounded-lg overflow-hidden transition-colors">
            <img
              src="/placeholder.svg"
              alt="Preview thumbnail"
              width={100}
              height={100}
              className="aspect-square object-cover"
            />
            <span className="sr-only">View Image 4</span>
          </button> */}
        </div>
      </div>
    )
}