
// Run this script to upload logo to Firebase
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../config/firebase";
import fs from "fs";

async function uploadLogo() {
  const storage = getStorage(app);
  const logoRef = ref(storage, "assets/logo.png");
  
  // Read the logo file
  const logoFile = fs.readFileSync("./public/images/logo.png");
  
  // Upload to Firebase
  await uploadBytes(logoRef, logoFile);
  const logoUrl = await getDownloadURL(logoRef);
  
  console.log("Logo uploaded successfully!");
  console.log("URL:", logoUrl);
  
  // You can save this URL to your Firebase database for easy access
  // Example: set(ref(database, 'settings/logo'), logoUrl);
}

uploadLogo().catch(console.error);