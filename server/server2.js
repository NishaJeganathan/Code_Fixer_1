// Importing necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit"); // Added rate limiting
require("dotenv").config();

// Initializing Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Setting up rate limiter to limit requests (100 per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Using Hugging face API configuration
const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-1.3B"; // Replace with the actual model name
const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN; // Your Hugging Face API token

// POST route for code analysis
app.post("/analyze-code", async (req, res) => {
  // Extracting code and language from request body
  const { code, language } = req.body;

  // Input validation
  if (!code || !language) {
    return res.status(400).json({
      error: "Both Code and programming language are required for analysis.",
    });
  }

  // Defining the dynamic prompt for OpenAI API based on the provided language
  const prompt = `
    You are a security expert. Analyze the following ${language} code for vulnerabilities and suggest fixes:
    
    Code:
    ${code}
    
    Vulnerabilities:
  `;

  try {
    // Sending the prompt to OpenAI API
    const response = await axios.post(HUGGING_FACE_API_URL, {
        inputs: prompt,
      }, {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}`, // Set the authorization header with your token
        },
      });
  
      // Extracting the vulnerabilities and suggestions from Hugging Face response
      const vulnerabilities = response.data[0]?.generated_text?.trim() || "No response generated.";

    // Sending a structured response with vulnerabilities and fixes
    res.json({
      vulnerabilities: {
        issues: vulnerabilities, // The analysis from OpenAI
        fixes: "Please review the suggestions provided by the expert above.", // Placeholder for fixes
      },
    });
  } catch (error) {
    // Error handling for API issues or request failures
    console.error("Error interacting with OpenAI API", error.response?.data || error.message);
    res.status(500).json({ error: "Error analyzing code. Please try again later:" + (error.response?.data || error.message) });
  }
});

// Default route for the server
app.get("/", (req, res) => {
    //console.log(process.env.OPENAI_API_KEY);
  res.send("Welcome to the Code Security Analyzer API!");
});

// Starting the server on PORT from environment variables or default to 5000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(process.env.HUGGING_FACE_API_TOKEN);
  console.log(`Server running on port ${PORT}`);
});