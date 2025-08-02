import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export default function JWTauth(req,res,next){

    const header = req.header("Authorization")
    if(header != null){
        const token = header.replace("Bearer ","")
        jwt.verify(token,process.env.JWT_key,(err,decoded)=>{
            if(decoded != null){
                console.log(decoded)
                req.user = decoded
            }
        })
        
//comment
    }
    next()
}