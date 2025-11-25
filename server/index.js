import "dotenv/config";
import { createServer } from 'http'; // <-- THÊM: Import createServer
import app from "./src/app.js";
import connectDB from "./config/database.js";
import connectCloudinary from "./config/cloudinary.js";
import { initializeSocketIO } from './src/socket/index.js';


const PORT = process.env.PORT;

// Tạo HTTP server từ Express app
const httpServer = createServer(app);


initializeSocketIO(httpServer, app);

const start = async () => {
  await connectDB();                
  await connectCloudinary(); 
    console.log("Cloudinary configuration loaded.");
  
  httpServer.listen(PORT, () => { 
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

start();