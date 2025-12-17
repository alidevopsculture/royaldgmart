'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Inputfile } from '../component/inputfile';
import Image from 'next/image';
import { X } from 'lucide-react';

const imageMimeType = /image\/(png|jpg|jpeg)/i;

function ImageContainer({setFiles,ind,image}:{setFiles:Dispatch<SetStateAction<File[]>>,ind:number,image:File}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataURL, setFileDataURL] = useState<ArrayBuffer|string>('');

//   console.log(image)

  const changeHandler = (e: File|undefined) => {
    const file = e
    if (!file?.type.match(imageMimeType)) {
      alert("Image mime type is not valid");
      return;
    }
    if (file.size > 3 * 1024 * 1024) { // 3MB in bytes
      alert("Image size must be under 3MB");
      return;
    }
    setFile(file);
    setFiles(prev=>[...prev,file])
}
useEffect(() => {
    let fileReader: FileReader, isCancel = false;
    if (file) {
        fileReader = new FileReader();
    fileReader.onload = (e) => {
        const result = e?.target?.result
        if (result && !isCancel) {
            setFileDataURL(result)
        }
    }
    fileReader.readAsDataURL(file);
    }
    return () => {
        isCancel = true;
        if (fileReader && fileReader.readyState === 1) {
            fileReader.abort();
        }
    }

}, [file]);

    return (
    <div className=' w-full h-full relative'>
    {!fileDataURL || !image?
        <Inputfile accept={'.png, .jpg, .jpeg'}
        onFileChange={(e)=>changeHandler(e)}/>:
        <Image className=" w-full h-full object-cover" width={100} height={100} src={fileDataURL as string} alt={`Product-Image`}/>}

        {(fileDataURL && image) && <X 
        onClick={(e)=>{
            e.preventDefault()
            e.stopPropagation()
            console.log('Hello There')
            setFiles(prev=>prev.filter((_e,index)=>{
                // console.log(e)
                // console.log(JSON.stringify(e.name)!==JSON.stringify(file?.name))
                // return JSON.stringify(e.name)!==JSON.stringify(file?.name)
                console.log(index!==ind)
                return index!==ind
            }))
            // setFile(null)
            setFileDataURL('')
        }} size={20} className=' text-white p-1 rounded-full shadow-sm bg-black absolute top-0 right-0'/>}
    </div>
    );
}
export default ImageContainer;