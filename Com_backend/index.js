import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import generatefile from './generatefile.js';
import executeCpp from './executeCpp.js';
import generateInputFile from './generateInputFile.js';
dotenv.config();



const app= express();

app.use(cors({
    origin: "http://localhost:5173", // allow your frontend
    methods: ["GET", "POST"],
    credentials: true
}));
// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.post("/run", async (req, res) => {
    const {language="cpp",code,input}=req.body;
    if(code==undefined || code.trim() === ""){
        return res.status(400).json({success: false, message: "Code is required"});
    }
    try {
        const filePath=generatefile(language, code);
        const inputFile=generateInputFile(input);
        const output= await executeCpp(filePath , inputFile);
        res.json({ output });
        
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
        
    }
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});