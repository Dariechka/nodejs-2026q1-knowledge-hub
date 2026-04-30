import type { Task } from '../dto/analyze-article-dto';

export const analyzation = (content: string, task: Task) => `
  Perform a technical ${task.toUpperCase()} of the article content provided below.
  
  You must return your response as a valid JSON object ONLY. 
  Do not include markdown backticks or any text other than the JSON.

  JSON Schema:
  {
    "analysis": "A detailed narrative summary of your findings",
    "suggestions": ["An array of specific, actionable improvement points"],
    "severity": "Must be one of: 'info', 'warning', or 'error' based on the findings"
  }

  ARTICLE CONTENT START
  ${content}
  ARTICLE CONTENT END

  Make no mistakes!!
`;
