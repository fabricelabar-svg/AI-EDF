import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Verb, ExampleSentence } from '../types';

interface ExampleSentenceGeneratorProps {
    verb: Verb;
    theme: 'light' | 'dark';
}

const ExampleSentenceGenerator: React.FC<ExampleSentenceGeneratorProps> = ({ verb, theme }) => {
  const [examples, setExamples] = useState<ExampleSentence[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const fetchExamples = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip or other parent events
    if (isLoading) return;
    setIsLoading(true);
    setExamples(null);
    setError(null);

    const prompt = `You are a helpful language assistant. For the Dutch verb "${verb.nl.infinitive}" (French: "${verb.fr}"), generate two simple and distinct example sentences for a beginner. One sentence should use the prétérit form (e.g., from "${verb.nl.preterite}") and the other should use the participe passé form ("${verb.nl.participle}"). For each sentence, provide the French translation. Ensure the sentences are practical and easy to understand.`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            nl_sentence: { type: Type.STRING, description: "The example sentence in Dutch." },
            fr_sentence: { type: Type.STRING, description: "The French translation of the sentence." },
          },
          required: ["nl_sentence", "fr_sentence"],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });
        
        const resultText = response.text.trim();
        const resultJson: ExampleSentence[] = JSON.parse(resultText);
        setExamples(resultJson);

    } catch (err) {
      console.error("Error fetching examples from Gemini API:", err);
      setError("Désolé, impossible de générer des exemples pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const themeClasses = {
    light: {
        spinner: "border-slate-500",
        error: "text-red-600 bg-red-100",
        container: "p-4 bg-slate-100 rounded-lg border border-slate-200",
        title: "font-bold text-slate-800 mb-2",
        exampleNl: "font-semibold text-slate-800",
        exampleFr: "text-slate-600 italic",
        buttonContainer: "text-center",
        button: "bg-slate-200 text-slate-700 hover:bg-slate-300",
    },
    dark: {
        spinner: "border-white",
        error: "text-yellow-300 bg-black/30",
        container: "", // no extra container on dark theme
        title: "",
        exampleNl: "font-semibold text-white",
        exampleFr: "text-slate-200 italic",
        buttonContainer: "",
        button: "bg-white/90 text-orange-700 hover:bg-white",
    }
  };

  const currentTheme = themeClasses[theme];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-4" onClick={e => e.stopPropagation()}>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${currentTheme.spinner}`}></div>
      </div>
    );
  }

  if (error) {
    return <p className={`mt-4 text-sm p-2 rounded text-center ${currentTheme.error}`} onClick={e => e.stopPropagation()}>{error}</p>;
  }

  if (examples) {
    return (
      <div className={`mt-4 text-left w-full space-y-3 ${currentTheme.container}`} onClick={e => e.stopPropagation()}>
        {theme === 'light' && <h4 className={currentTheme.title}>Exemples d'utilisation :</h4>}
        {examples.map((ex, index) => (
          <div key={index} className={theme === 'dark' ? 'p-3 bg-black/20 rounded-lg' : ''}>
            <p className={currentTheme.exampleNl}>🇳🇱 {ex.nl_sentence}</p>
            <p className={currentTheme.exampleFr}>🇫🇷 {ex.fr_sentence}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={currentTheme.buttonContainer} onClick={e => e.stopPropagation()}>
      <button
        onClick={fetchExamples}
        className={`mt-4 font-bold py-2 px-5 rounded-full transition-transform duration-200 hover:scale-105 shadow-sm text-sm ${currentTheme.button}`}
      >
        Voir des exemples ✨
      </button>
    </div>
  );
};

export default ExampleSentenceGenerator;
