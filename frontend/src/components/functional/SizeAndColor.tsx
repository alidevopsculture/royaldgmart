'use client'

import { Plus } from "lucide-react"
import { useState,Dispatch,SetStateAction } from "react"
import { ModalForColorAndPrice } from "../component/modalforcolorandprice"
import { SizersAndColorsType } from "../component/createproduct"

interface SizeAndColorProps{
    setSizesAndColors:Dispatch<SetStateAction<SizersAndColorsType[]>>
    setSelectedSizes:Dispatch<SetStateAction<string[]>>
    selectedSizes:string[]
    sizesAndColors:SizersAndColorsType[]
}

export default function SizeAndColor({setSizesAndColors,setSelectedSizes,selectedSizes,sizesAndColors}:SizeAndColorProps ){
    const [selectSizes,setSelectSizes]=useState(['XS','S','M','L','XL'])
    return(
        <>
            <div className=" flex flex-wrap justify-center items-center gap-2">
                {selectSizes.map((size,ind)=>{
                return(
                    // <button type="button" 
                    // onClick={()=>{
                    //     setShowColorPriceModal(!showColorPriceModal)
                    // //   if(availableSizes.includes(size)){
                    // //     setAvailableSizes((prev)=>prev.filter(presentSize=>size!==presentSize))
                    // //   }else{
                    // //     setAvailableSizes([...availableSizes,size])
                    // //   }
                    // }} className={` w-20 text-center 
                    // ${selectSizes.includes(size)?'bg-gradient-to-r to-red-300 from-red-400':'bg-gray-100'}  rounded-full px-3 py-2 shadow-sm transition-all`} key={size}>
                    // {size}
                    // </button>
                    <ModalForColorAndPrice key={size} 
                    setSizesAndColors={setSizesAndColors} 
                    defaultColorsAndPrices={sizesAndColors[ind]?.colors}
                    size={size} selectedSizes={selectedSizes} setSelectedSizes={setSelectedSizes}
                    />
                )
                })}
                <Plus onClick={()=>{
                console.log('In the click')
                const lastItem=parseInt(selectSizes[selectSizes.length-1].replace('XL','')==''?
                '1':selectSizes[selectSizes.length-1].replace('XL',''))
                console.log(lastItem)
                setSelectSizes([...selectSizes,`${lastItem+1}XL`])
                }} size={30} className=" cursor-pointer p-2 rounded-full shadow-sm bg-black text-white"/>
            </div>
            
            
        </>
    )
}