import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

// Create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirInputs = path.join(__dirname, "inputs");

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = (input) => {
    const jobId= uuid();
    const inputFilename = `${jobId}.txt`;
    const inputFilePath = path.join(dirInputs, inputFilename);
    fs.writeFileSync(inputFilePath, input);
    return inputFilePath;
   
}

export default generateInputFile;
