import mongoose from "mongoose"
import dns from "dns"

dns.setServers([
  '8.8.8.8',        
  '8.8.4.4',        
  '1.1.1.1',        
  '1.0.0.1'         
]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully".bgGreen.black);
    console.log("Database Name:", mongoose.connection.name);
    // console.log("Host:", mongoose.connection.host);
    // console.log("Port:", mongoose.connection.port);
  } catch (error) {
    console.log("MongoDB Connection Failed".bgRed.white, error.message);
    process.exit(1);
  }
};

export default connectDB;

