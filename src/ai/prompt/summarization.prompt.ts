export const createSummarizeArticlePrompt = (
  content: string,
  length: string,
) => `
  Summarize article. Summary should be ${length}.
  
  ARTICLE CONTENT START
  ${content}
  ARTICLE CONTENT END

  Make no mistakes!!
`;
