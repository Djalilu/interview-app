
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { Message, LanguageCode, Question, Answer } from "../types";
import { LANGUAGES } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

const startChat = async (company: string, jobRole: string, companyUrl: string, language: LanguageCode): Promise<{ chat: Chat; firstQuestion: string; }> => {
    const languageName = LANGUAGES[language];
    
    const systemInstruction = `You are a senior hiring manager at ${company} with 10 years of experience, interviewing a candidate for the ${jobRole} position. First, analyze the content of the provided company URL (${companyUrl}) to understand the company's core values, mission, recent news, and product lineup. You must embody the company's characteristics, which you've learned from the URL, in your persona. You prefer to ask deep, probing questions that connect a candidate's skills and problem-solving abilities to the company's actual business. Your tone should be professional but approachable. All your questions and responses must be in ${languageName}. Start the interview now with your first question, and do not add any conversational filler before it. Just ask the question.`;

    try {
        const chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const response = await chat.sendMessage({ message: "Start the interview." });
        const firstQuestion = response.text;
        
        if (!firstQuestion) {
            throw new Error("AI did not provide an initial question.");
        }

        return { chat, firstQuestion };
    } catch (error) {
        console.error("Error starting chat with Gemini:", error);
        throw new Error("Failed to start the interview session.");
    }
};

const getNarrativeFeedback = async (messages: Message[], company: string, jobRole: string, language: LanguageCode): Promise<string> => {
    const languageName = LANGUAGES[language];
    const conversationHistory = messages.map(msg => `${msg.sender === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`).join('\n\n');

    const prompt = `The interview is now over. Based on the entire conversation below, write a feedback report for the candidate. The interview was for a ${jobRole} role at ${company}. The report must be written in ${languageName} in a professional and encouraging tone. It must include the following sections, using these exact headings: "Overall Assessment", "Key Strengths", and "Areas for Improvement". For strengths and improvements, you must refer to specific examples from our conversation. Do not use any markdown formatting like bolding or italics. Just return the plain text report.

<CONVERSATION_HISTORY>
${conversationHistory}
</CONVERSATION_HISTORY>
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const feedbackText = response.text;
        if (!feedbackText) {
            throw new Error("AI did not provide feedback.");
        }

        return feedbackText;
    } catch (error) {
        console.error("Error fetching narrative feedback from Gemini:", error);
        throw new Error("Failed to generate feedback report.");
    }
};

const getInterviewQuestions = async (jobRole: string, language: LanguageCode): Promise<Question[]> => {
    const languageName = LANGUAGES[language];
    const prompt = `Generate a list of 5 diverse interview questions for a '${jobRole}' position. The questions should cover categories like Behavioral, Technical, and Situational. Provide the response in ${languageName}. Each question must have a unique string id you generate (e.g., "q1").`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            description: "List of interview questions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: {
                                        type: Type.STRING,
                                        description: 'A unique identifier for the question (e.g., "q1").'
                                    },
                                    text: {
                                        type: Type.STRING,
                                        description: "The text of the interview question."
                                    },
                                    category: {
                                        type: Type.STRING,
                                        description: 'The category of the question (e.g., "Behavioral", "Technical", "Situational").'
                                    }
                                },
                                required: ['id', 'text', 'category']
                            }
                        }
                    },
                    required: ['questions']
                }
            }
        });

        const result = JSON.parse(response.text);
        if (result && Array.isArray(result.questions)) {
             return result.questions;
        }
        console.error("AI response did not match expected format. Response:", response.text);
        throw new Error("AI response did not match expected format.");

    } catch (error) {
        console.error("Error fetching interview questions from Gemini:", error);
        throw new Error("Failed to generate interview questions.");
    }
};

const getOverallFeedback = async (answers: Answer[], jobRole: string, language: LanguageCode): Promise<string> => {
    const languageName = LANGUAGES[language];
    const formattedAnswers = answers.map(a => `Question: ${a.questionText}\nAnswer: ${a.answerText}`).join('\n\n---\n\n');
    
    const prompt = `The interview is now over. Based on the candidate's answers below, write a feedback report. The interview was for a ${jobRole} role. The report must be written in ${languageName} in a professional and encouraging tone. It must include the following sections, using these exact headings: "Overall Assessment", "Key Strengths", and "Areas for Improvement". For strengths and improvements, you must refer to specific examples from the provided answers. Do not use any markdown formatting like bolding or italics. Just return the plain text report.

<CANDIDATE_ANSWERS>
${formattedAnswers}
</CANDIDATE_ANSWERS>
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        const feedbackText = response.text;
        if (!feedbackText) {
            throw new Error("AI did not provide feedback.");
        }

        return feedbackText;
    } catch (error) {
        console.error("Error fetching overall feedback from Gemini:", error);
        throw new Error("Failed to generate feedback report.");
    }
};


export const geminiService = {
    startChat,
    getNarrativeFeedback,
    getInterviewQuestions,
    getOverallFeedback,
};
