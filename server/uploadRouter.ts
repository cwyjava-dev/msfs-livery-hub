import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Upload screenshot
router.post("/upload-screenshot", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const ext = req.file.originalname.split(".").pop() || "jpg";
    const key = `screenshots/${nanoid()}.${ext}`;
    
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({ url, key });
  } catch (error) {
    console.error("Screenshot upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Upload livery file
router.post("/upload-livery", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const ext = req.file.originalname.split(".").pop() || "zip";
    const key = `liveries/${nanoid()}.${ext}`;
    
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({ url, key });
  } catch (error) {
    console.error("Livery upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
