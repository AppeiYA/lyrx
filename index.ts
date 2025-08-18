import * as dotenv from 'dotenv';
dotenv.config();
import app from './src/app';


const PORT: string = process.env.PORT || "3000";

app.listen(PORT, ()=>{
    console.log("Server is running at http://localhost:"+ PORT + " .CTRL+C to terminate.");
    
})

