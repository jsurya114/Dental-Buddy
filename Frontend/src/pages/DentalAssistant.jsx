import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Info } from "lucide-react";


const DentalAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState(null);
    const [cxMissing, setCxMissing] = useState(false);

    // Get CX ID from Vite Environment Variables
    const cx = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
    const recognitionRef = useRef(null);

    useEffect(() => {
        // 1. Check for CX ID
        if (!cx) {
            setCxMissing(true);
            return;
        }

        // 2. Inject Google CSE Script dynamically
        const scriptId = "google-cse-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.src = `https://cse.google.com/cse.js?cx=${cx}`;
            script.id = scriptId;
            script.async = true;
            document.body.appendChild(script);
        }

        // 3. Setup Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                fillAndSearch(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Voice Error:", event.error);
                setVoiceError("Voice recognition failed. Please try typing.");
                setIsListening(false);
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }

        // Cleanup script on unmount (optional, but good for SPA)
        return () => {
          
        };
    }, [cx]);

 
    const fillAndSearch = (text) => {
        if (!text) return;

     
        const input = document.querySelector("input.gsc-input");
        const btn = document.querySelector("button.gsc-search-button");

        if (input) {
            input.value = text;
            // React/Google script might need an 'input' event to detect change
            input.dispatchEvent(new Event('input', { bubbles: true }));

            if (btn) {
                // Trigger search
                setTimeout(() => btn.click(), 100);
            } else {
                // Fallback: hit enter on input
                input.focus();
                // Simulating enter key is hard securely, but usually button click works
            }
        } else {
            console.warn("Google Search Input not found in DOM yet.");
            setVoiceError("Search box not ready. Please try again.");
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice search not supported in this browser.");
            return;
        }
        setVoiceError(null);
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    if (cxMissing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl max-w-md">
                    <h2 className="text-xl font-bold text-amber-800 mb-2">Configuration Required</h2>
                    <p className="text-amber-700 mb-4">
                        Please add your Google Search Engine ID (CX) to the <code>Frontend/.env</code> file.
                    </p>
                    <code className="bg-white px-3 py-1 rounded border border-amber-200 text-sm block mb-4">
                        VITE_GOOGLE_SEARCH_ENGINE_ID=your_id_here
                    </code>
                    <p className="text-sm text-amber-600">
                        Top Tip: You can get this ID from <a href="https://programmablesearchengine.google.com/" target="_blank" className="underline">pse.google.com</a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto min-h-[80vh] flex flex-col p-4">

            {/* Header */}
            <div className="flex flex-col items-center mb-8 mt-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dental Assistant</h1>
                <p className="text-gray-500">Powered by Google Search</p>
            </div>

            {/* Voice Control - Floating or Centered */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={toggleListening}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-md transition-all ${isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                        }`}
                >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span className="font-medium">
                        {isListening ? "Listening..." : "Tap to Speak"}
                    </span>
                </button>
            </div>

            {voiceError && (
                <p className="text-center text-red-500 mb-4 text-sm">{voiceError}</p>
            )}

            {/* Google CSE Container */}
            <div className="cse-wrapper min-h-[400px]">
                {/* 
                   The div below is where Google injects the search box and results.
                   We use 'data-gname' to potentially target it if we have multiple.
                */}
                <div className="gcse-search" data-gname="dental-search"></div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
                <div className="inline-flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Search results are provided by Google. Not medical advice.</span>
                </div>
            </div>

            {/* Custom Styles for CSE (Optional overrides) */}
            <style jsx>{`
                .cse-wrapper .gsc-control-cse {
                    padding: 0;
                    border: none;
                    background: transparent;
                }
                .cse-wrapper .gsc-search-button-v2 {
                    background-color: #4F46E5 !important; /* Indigo-600 */
                    border-radius: 50px;
                    border: none;
                    padding: 10px 20px;
                }
                .cse-wrapper input.gsc-input {
                    padding: 10px 14px !important;
                    background: #fff !important;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default DentalAssistant;
