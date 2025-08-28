import { useState } from "react";
import toast from "react-hot-toast";
import MediaUpload from "../utils/medialUpload";
export default function Testing() {
    const [img, setimg] = useState(null);
    
    async function handleUpload () {

        const promisesArray = []
        for(let i = 0; i < img.length; i++) {
            const promise = MediaUpload(img[i]);
            promisesArray[i] = promise

        }
        const result = await Promise.all(promisesArray);
        console.log("All images uploaded successfully:", result);
        
        MediaUpload(img).then((url) => {

            const imgURL = url;
        }).catch((error) => {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
        });

    }
       
    return(
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
            <input type="file"
            multiple
            onChange={(e) => {
                const img = e.target.files;
                setimg(img)
            }} /> 
            <button 
            onClick={handleUpload}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Upload</button>
        </div>
    );      
}