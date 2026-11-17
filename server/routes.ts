import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeVerseImage } from "./gemini";
import { analyzeVerseRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze verse endpoint
  app.post("/api/analyze-verse", async (req, res) => {
    try {
      // Check for Gemini API key
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Configuration error", 
          message: "Gemini API key is not configured. Please add your API key to continue." 
        });
      }

      // Validate request body
      const validatedData = analyzeVerseRequestSchema.parse(req.body);
      
      // Check if image data exists
      if (!validatedData.imageBase64 || validatedData.imageBase64.trim().length === 0) {
        return res.status(400).json({ 
          error: "Invalid input", 
          message: "Please provide a valid image to analyze." 
        });
      }
      
      const analysis = await analyzeVerseImage(validatedData.imageBase64);
      
      // Add timestamp
      const result = {
        ...analysis,
        timestamp: new Date().toISOString(),
      };
      
      res.json(result);
    } catch (error: any) {
      console.error("Error in analyze-verse endpoint:", error);
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "Please upload a valid image of a Quranic verse." 
        });
      }
      
      // Handle Gemini API errors
      if (error.message?.includes('Gemini')) {
        return res.status(500).json({ 
          error: "AI service error", 
          message: "Unable to analyze the verse at this time. Please try again later." 
        });
      }
      
      // Generic error
      res.status(500).json({ 
        error: "Analysis failed", 
        message: "We couldn't analyze this verse. Please ensure the image is clear and try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
