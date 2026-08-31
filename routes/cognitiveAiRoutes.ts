import { Router } from "express";
import { postApiCognitiveAiVoiceTranscribe, postApiCognitiveAiVoiceSynthesize, postApiCognitiveAiVoiceParseCommand, postApiCognitiveAiVisionOcr, getApiCognitiveAiVisionKitchenStream, postApiCognitiveAiCreativeGenerateImage, postApiCognitiveAiDigitalTwinSimulate } from "../controllers/cognitiveAiController";

export const cognitiveAiRouter = Router();

cognitiveAiRouter.post("/voice/transcribe", postApiCognitiveAiVoiceTranscribe);
cognitiveAiRouter.post("/voice/synthesize", postApiCognitiveAiVoiceSynthesize);
cognitiveAiRouter.post("/voice/parse-command", postApiCognitiveAiVoiceParseCommand);
cognitiveAiRouter.post("/vision/ocr", postApiCognitiveAiVisionOcr);
cognitiveAiRouter.get("/vision/kitchen-stream", getApiCognitiveAiVisionKitchenStream);
cognitiveAiRouter.post("/creative/generate-image", postApiCognitiveAiCreativeGenerateImage);
cognitiveAiRouter.post("/digital-twin/simulate", postApiCognitiveAiDigitalTwinSimulate);
