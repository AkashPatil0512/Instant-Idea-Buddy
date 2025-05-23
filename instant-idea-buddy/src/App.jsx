import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import your CSS file

function App() {
  // State for user input
  const [userInput, setUserInput] = useState('');

  // States for AI generated content
  const [generatedIdea, setGeneratedIdea] = useState('');
  const [encouragementPhrase, setEncouragementPhrase] = useState('');

  // UI control states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // !!! DANGER: Your API Key Here (FOR LEARNING AND LOCAL DEVELOPMENT ONLY) !!!
  // Replace 'YOUR_GEMINI_API_KEY' with your actual API key from Google AI Studio.
  // Example endpoint for gemini-pro model:
  const GEMINI_API_KEY = 'AIzaSyB-tLMgRS1GkxKKAx1kMWqkII_sLCwQ_X8';
  const GEMINI_API_ENDPOINT ='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const getIdea = async () => {
    // Basic validation
    if (!userInput.trim()) {
      setError("Please enter a question or dilemma to get an idea!");
      return;
    }

    // Reset states before new API call
    setIsLoading(true);
    setError(null);
    setGeneratedIdea('');
    setEncouragementPhrase('');

    try {
      // Craft the prompt for the Gemini AI
      const prompt = `Given the following request: '${userInput}', provide:
      1. One concise, creative idea or suggestion.
      2. One short, encouraging phrase to go along with the idea.
      Format your response as: Idea: [Idea Text] and Encouragement: [Encouragement Phrase]`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8, // Adjust for more creativity
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150, // Keep response concise
        },
      };

      // Make the API call to Gemini
      const response = await axios.post(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, requestBody);

      // Check for successful response from Gemini
      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const rawText = response.data.candidates[0].content.parts[0].text;

        // Simple parsing of the AI's formatted response
        const ideaMatch = rawText.match(/Idea: (.*?)(\n|$)/i);
        const encouragementMatch = rawText.match(/Encouragement: (.*?)(\n|$)/i);

        setGeneratedIdea(ideaMatch ? ideaMatch[1].trim() : 'No clear idea generated.');
        setEncouragementPhrase(encouragementMatch ? encouragementMatch[1].trim() : '');

      } else {
        setError("No idea generated. Please try again.");
      }

    } catch (err) {
      console.error("Error getting idea:", err);
      if (err.response) {
        setError(`API Error: ${err.response.status} - ${err.response.data?.error?.message || 'Something went wrong on the server.'}`);
      } else if (err.request) {
        setError("Network Error: No response received from API. Check your internet connection or API endpoint.");
      } else {
        setError(`Request Setup Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💡 Instant Idea Buddy 💡</h1>
        <p>Type any question, dilemma, or topic, and I'll give you a quick idea!</p>
      </header>

      <main className="App-main">
        <div className="input-section">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., 'What to cook for dinner?', 'Weekend activity idea?'"
          />
          <button onClick={getIdea} disabled={isLoading}>
            {isLoading ? 'Brainstorming...' : 'Get Idea!'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {(generatedIdea || encouragementPhrase) && (
          <div className="results-section">
            <h2>Your Idea:</h2>
            <p className="generated-idea">{generatedIdea}</p>
            {encouragementPhrase && (
              <p className="encouragement">"{encouragementPhrase}"</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
