import {GoogleGenAI} from "@google/genai";
import 'dotenv/config';
import { inputUser } from "./inputUser.js";
import { isCancel, cancel } from '@clack/prompts'; 


const ai = new GoogleGenAI({});

// =========================================================
//   CONSTANTES DE RESPOSTAS FORÇADAS E INSTRUÇÕES
// =========================================================

// Instruções de como responder alguma coisa padrão
const DEFAULT_INSTRUCTION_CHAT = `
    Você é um modelo de linguagem prestativo e amigável. Responda a qualquer tipo de pergunta de forma útil e profissional.
`;

// Resposta FORÇADA para a PERGUNTA DE ORIGEM: (pergunta especifica sobre seu "desenvolvedor")
const FAKE_ORIGIN_RESPONSE = "Eu sou a IA desenvolvida pelo Fake.";


async function conversaContinua() {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        systemInstruction: DEFAULT_INSTRUCTION_CHAT, // Instrução de fundo simples
    });

    console.log("-----------------------------------------");
    console.log("Iniciando o Chat com a IA. Digite 'SAIR' para terminar a conversa.");
    console.log("-----------------------------------------");

    while (true) {
        const inputDoUsuario = await inputUser();

        if (isCancel(inputDoUsuario) || inputDoUsuario.toUpperCase() === 'SAIR') {
            cancel('Conversa encerrada pelo usuário.');
            process.exit(0);
        }

        try {
            let respostaFinal;

            // =========================================================
            //   CLASSIFICAÇÃO RÍGIDA (Apenas duas intenções)
            // =========================================================
            const classificacao = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                // Classifica o input em "ORIGEM" ou "GERAL"
                contents: `Classifique a pergunta do usuário. Use a string 'ORIGEM' se a pergunta for sobre seu criador, desenvolvedor ou origem. Caso contrário, use 'GERAL'. Responda APENAS o JSON. Pergunta: ${inputDoUsuario}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            intencao: {
                                type: "string",
                                enum: ["ORIGEM", "GERAL"] // Apenas duas intenções
                            }
                        }
                    },
                    temperature: 0.0 // Garante precisão
                }
            });
            
            const dados = JSON.parse(classificacao.text);
            const intencao = dados.intencao.toUpperCase();

            // =========================================================
            //   CONTROLE DE RESPOSTA (Onde a identidade é mantida)
            // =========================================================
            if (intencao === 'ORIGEM') {
                // resposta referente ao desenvolvedor/criador ou qualquer outra coisa relacionada a isso
                respostaFinal = FAKE_ORIGIN_RESPONSE;
                
            } else { intencao === 'GERAL'
                // tratamento para perguntas padrões ('GERAL')
                const response = await chat.sendMessage({
                    message: inputDoUsuario
                });
                respostaFinal = response.text;
            }

            // =========================================================
            //   EXIBIR A RESPOSTA
            // =========================================================
            console.log("-----------------------------------------");
            // Agora a IA não é mais a farmacêutica
            console.log(`🤖 IA: ${respostaFinal}`); 
            console.log("-----------------------------------------");

        } catch (error) {
            console.error("\n❌ Ocorreu um erro ao enviar a mensagem para a IA:", error.message);
        }
    }
}

conversaContinua();