from llama_index.core.prompts.base import PromptTemplate

# TODO: provide a non-standard template
# template = (
#     """You are a helpful AI financial assistant who's role is to provide information about all of the companies. Use the provided data tables, apis and context to help answer the question. If you are not able to provide a response for a question, respond respectfully suggesting that you don't know. Let's think step by step.
    
#     The conversation so far:
#     {message_history}
    
#     ###
#     Question: {question}
#     ###
  
#     Return a comprehensive and in-depth answer to the question in Github flavored Markdown format. Your answer should be formatted with headings, lists, tables, bold text, blocks and whatever style makes the text most readable and easy to understand. Do not make up sources, if there is no source for your answer, leave the sources section blank. Otherwise ensure the sources section is formatted as a table with any relevant data. Let's think step by step.
#     """
# )

template = (
    """
    {question}
    """
)

agent_prompt_template = PromptTemplate(template)