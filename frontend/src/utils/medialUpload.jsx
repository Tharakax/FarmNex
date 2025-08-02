import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";


export default function MediaUpload(file) {
    const supabase = createClient("https://ombvnpeoietugpxelugs.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYnZucGVvaWV0dWdweGVsdWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODM2ODYsImV4cCI6MjA2NzU1OTY4Nn0.mv9NsqrC2tckMmHa2w0X8Vg0fGtjsQXYYbMG1LRy9K4")

    const promise = new Promise(
        (resolve,reject) =>{
            if(file == null){
                reject("No file selected");
            }
            const timeStamp = new Date().getTime();
            const newFileName = `${timeStamp}-${file.name}`;

            supabase.storage.from('cropcartimages').upload(`public/${newFileName}`, file, {
                cacheControl: '3600',
                upsert: false
        }).then(
            () => {
                const url = supabase.storage.from('cropcartimages').getPublicUrl(`public/${newFileName}`).data.publicUrl;
                resolve(url);
            }
        ).catch((error) => {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
            reject("error uploading image");
        });
    

})
    return promise;
}
    