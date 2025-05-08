// Entry point aplikasi
import dotenv from "dotenv";
import app from "./src/app.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});
