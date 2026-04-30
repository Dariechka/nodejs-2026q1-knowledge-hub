export const translateArticlePrompt = (
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
) => {
  const sourceContext = sourceLanguage
    ? `The original text is in ${sourceLanguage}.`
    : `Please detect the source language automatically.`;

  return `Translate the article below into ${targetLanguage}. ${sourceContext}

  Return your response as a valid JSON object only.
  
  JSON Schema:
  {
    "translatedText": "string",
    "detectedLanguage": "string (the name of the source language)"
  }

  ARTICLE CONTENT START:
  ${content}
  ARTICLE CONTENT END

  Remember: Only return the raw JSON object.`;
};
