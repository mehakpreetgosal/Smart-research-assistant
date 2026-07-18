from groq import Groq
from utils.prompts import get_prompt


class GroqResearch:

    def __init__(self, api_key):

        self.client = Groq(api_key=api_key)

    def _build_context(self, search_results):

        context = []

        for i, result in enumerate(search_results, start=1):

            title = result.get("title", "")

            content = result.get("content", "")

            url = result.get("url", "")

            context.append(
f"""
Source {i}

Title:
{title}

URL:
{url}

Content:
{content}

---------------------------------------------------
"""
            )

        return "\n".join(context)

    def generate_report(self, search_results, mode="General"):

        context = self._build_context(search_results)

        system_prompt = get_prompt(mode)
        
        response = self.client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            temperature=0.2,

            max_tokens=4096,

            messages=[

                {
                    "role":"system",
                    "content":system_prompt
                },

                {
                    "role":"user",
                    "content":context
                }

            ]

        )

        return response.choices[0].message.content