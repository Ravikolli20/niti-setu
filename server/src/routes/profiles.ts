// server/src/routes/profiles.ts
import { Router, Request, Response } from "express";
import { getProfilesCollection } from "../db.js";

const router = Router();

/**
 * GET /api/profiles/:id
 * Fetch a saved farmer profile by its unique ID.
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const col = await getProfilesCollection();
    const profile = await col.findOne({ profileId: req.params.id });
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * POST /api/profiles
 * Create or update a farmer profile.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { profileId, data } = req.body;
    
    if (!profileId || !data) {
      return res.status(400).json({ error: "Missing identity or data" });
    }
    
    const col = await getProfilesCollection();
    const result = await col.findOneAndUpdate(
      { profileId },
      { 
        $set: { 
          data, 
          updatedAt: new Date().toISOString() 
        } 
      },
      { upsert: true, returnDocument: "after" }
    );
    
    res.json(result);
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
