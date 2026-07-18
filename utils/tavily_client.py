"""
Tavily Search Client
--------------------
Handles all communication with the Tavily Search API.
"""

import requests


class TavilyClient:

    BASE_URL = "https://api.tavily.com/search"

    def __init__(self, api_key: str):

        self.api_key = api_key

    # -------------------------------------
    # Search
    # -------------------------------------

    def search(self, query, mode="General"):

        payload = {

            "api_key": self.api_key,

            "query": query,

            "search_depth": self.get_depth(mode),

            "max_results": self.get_results(mode),

            "include_answer": False,

            "include_images": False,

            "include_raw_content": False

        }

        response = requests.post(

            self.BASE_URL,

            json=payload,

            timeout=30

        )

        response.raise_for_status()

        data = response.json()

        return {

            "query": query,

            "results": self.clean_results(

                data.get("results", [])

            )

        }

    # -------------------------------------
    # Clean Results
    # -------------------------------------

    def clean_results(self, results):

        cleaned = []

        for item in results:

            cleaned.append({

                "title": item.get("title", ""),

                "url": item.get("url", ""),

                "content": item.get("content", ""),

                "score": item.get("score", 0)

            })

        return cleaned

    # -------------------------------------
    # Research Depth
    # -------------------------------------

    def get_depth(self, mode):

        mapping = {

            "General": "basic",

            "Technical": "advanced",

            "Academic": "advanced",

            "Business": "advanced",

            "Latest News": "advanced"

        }

        return mapping.get(mode, "advanced")

    # -------------------------------------
    # Number of Results
    # -------------------------------------

    def get_results(self, mode):

        mapping = {

            "General": 5,

            "Technical": 8,

            "Academic": 8,

            "Business": 8,

            "Latest News": 10

        }

        return mapping.get(mode, 8)