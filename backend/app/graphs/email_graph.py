"""LangGraph workflow for email generation."""

import os
from typing import TypedDict

from dotenv import load_dotenv
from groq import Groq
from langgraph.graph import END, START, StateGraph

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class State(TypedDict):
    """State passed between email-generation graph nodes."""

    topic: str
    tone: str
    length: str
    result: str


def build_prompt_node(state: State) -> dict:
    """Build the email-generation prompt from the user inputs."""
    topic = state.get("topic") or ""
    tone = state.get("tone") or ""
    length = state.get("length") or ""

    prompt = f"""Write a {tone} email about: {topic}

Length: {length}
Tone: {tone}

Generate:
1. Subject line (start with "Subject:")
2. Email body (professional format with greeting, body, closing)

Make it natural, clear, and actionable."""
    return {"result": prompt}


def generate_email_node(state: State) -> dict:
    """Generate the final email content using the Groq model."""
    prompt = state.get("result") or ""
    if not prompt:
        return {"result": "Unable to generate email content."}

    response = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert email writer. Write professional, clear, and effective emails.",
            },
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=1024,
        stream=False,
    )

    result = response.choices[0].message.content or ""
    return {"result": result}


def build_email_graph():
    """Build and return the compiled email-generation graph."""
    graph = StateGraph(State)

    graph.add_node("build_prompt_node", build_prompt_node)
    graph.add_node("generate_email_node", generate_email_node)

    graph.add_edge(START, "build_prompt_node")
    graph.add_edge("build_prompt_node", "generate_email_node")
    graph.add_edge("generate_email_node", END)

    return graph.compile()
