import openai
from typing import Dict
from llama_index.agent.openai import OpenAIAgent
from llama_index.tools.tavily_research.base import TavilyToolSpec
from llama_index.llms.openai import OpenAI
from python.util import get_api_key


@get_api_key()
def tavily_tool(api_key: Dict[str, str]):
    tavily_tool = TavilyToolSpec(api_key=api_key["TAVILY"])

    tavily_tool_list = tavily_tool.to_tool_list()

    for tool in tavily_tool_list:
        print(tool.metadata.name)

@get_api_key()
def create_agent(api_key: Dict[str, str]):
    openai.api_key = api_key['OPENAI']
    tavily_tool = TavilyToolSpec(api_key=api_key["TAVILY"])

    tavily_tool_list = tavily_tool.to_tool_list()
    llm = OpenAI(temperature=0, model='gpt-4-0613')
    return OpenAIAgent.from_tools(tavily_tool_list, llm=llm, verbose=True)

if __name__ == "__main__":
    agent = create_agent()
    print(agent.chat("give a summary of last earnings call's transcript of Nvidia"))
