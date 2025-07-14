import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { exec } from 'child_process';

// Create __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the output directory for compiled C++ executables
const outputPath = path.join(__dirname, "outputs");


if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = async (filePath,inputFile) => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.exe`); 

    return new Promise((resolve, reject) => {
        const command = `g++ "${filePath}" -o "${outPath}" && "${outPath}" < "${inputFile}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject({ error: error.message, stderr });
            }
            if (stderr) {
                console.warn("Program stderr output:", stderr); 
            }
            resolve(stdout);
        });
    });
};

export default executeCpp;
