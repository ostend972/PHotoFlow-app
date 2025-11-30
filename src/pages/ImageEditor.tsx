

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  Upload,
  X,
  Wand2,
  Download,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { api } from '../lib/api';

export function ImageEditor() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      api.logDebug('Image Upload', `Selected ${file.name} (${file.size} bytes)`, 'AI Studio');
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;

    setLoading(true);
    setError(null);
    api.logDebug('AI Generation Start', `Prompt: "${prompt}"`, 'AI Studio');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await fileToBase64(image);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: image.type,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const imgUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            setResultUrl(imgUrl);
            foundImage = true;
            api.logDebug('AI Generation Success', 'Image generated successfully', 'AI Studio');
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error("Aucune image générée. Essayez de reformuler.");
      }

    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Erreur de génération.";
      setError(msg);
      api.logDebug('AI Generation Error', msg, 'AI Studio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full pt-4 h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">Studio IA</h2>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary mt-2">Retouche & Transformation</p>
          </div>
          <div className="text-xs text-text-secondary border border-border px-3 py-1 rounded-full bg-white">
            Powered by Gemini 2.5
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
            {/* Input Section */}
            <div className="flex flex-col gap-6 h-full min-h-[400px]">
                <div className="flex-1 bg-white rounded-sm border border-border overflow-hidden relative group h-full">
                    {previewUrl ? (
                        <>
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={() => {
                                    setImage(null);
                                    setPreviewUrl(null);
                                    setResultUrl(null);
                                    setPrompt('');
                                    api.logDebug('Clear', 'Reset editor', 'AI Studio');
                                }} className="bg-white/90 backdrop-blur border border-gray-200 text-black p-2 rounded-full hover:bg-black hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="w-full h-full flex items-center justify-center p-8 bg-gray-50/30">
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-sm" />
                            </div>
                        </>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all gap-6 p-8"
                        >
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-black border border-border group-hover:scale-110 transition-transform duration-300">
                                <Upload size={24} strokeWidth={1} />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-medium text-black tracking-wide uppercase text-sm">Importer une image</p>
                                <p className="text-xs text-text-secondary">JPG, PNG • Max 10MB</p>
                            </div>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="bg-white p-6 rounded-sm border border-border flex flex-col sm:flex-row gap-4 items-center shrink-0">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Décrivez les modifications souhaitées..."
                        className="w-full sm:flex-1 bg-transparent border-b border-gray-200 py-2 focus:border-black outline-none transition-colors text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !image || !prompt}
                        className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                        Générer
                    </button>
                </div>
            </div>

            {/* Output Section */}
            <div className="h-full min-h-[400px]">
                 <div className="bg-white rounded-sm border border-border overflow-hidden h-full flex flex-col relative">
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
                        <span className="text-xs font-medium uppercase tracking-widest text-text-secondary bg-white/80 backdrop-blur px-2 py-1 rounded-sm">Résultat</span>
                        {resultUrl && (
                            <a 
                                href={resultUrl} 
                                download="retouche-ia.png"
                                className="pointer-events-auto bg-black text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
                                onClick={() => api.logDebug('Download', 'Downloading result image', 'AI Studio')}
                            >
                                <Download size={12} /> Télécharger
                            </a>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/30">
                        {loading ? (
                             <div className="flex flex-col items-center justify-center gap-4">
                                 <div className="w-12 h-12 border-2 border-border border-t-black rounded-full animate-spin"></div>
                                 <p className="text-xs font-medium uppercase tracking-widest text-text-secondary animate-pulse">Traitement en cours</p>
                             </div>
                        ) : resultUrl ? (
                            <img src={resultUrl} alt="Result" className="max-w-full max-h-full object-contain shadow-sm" />
                        ) : error ? (
                             <div className="text-center max-w-xs">
                                 <div className="w-12 h-12 border border-danger text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X size={20} />
                                 </div>
                                 <p className="text-sm font-medium text-danger">{error}</p>
                             </div>
                        ) : (
                            <div className="text-center text-gray-300">
                                <ImageIcon size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
                                <p className="text-xs font-medium uppercase tracking-widest">En attente de génération</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
}