import time

from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    send_file
)

from config import Config

from utils.tavily_client import TavilyClient
from utils.groq_client import GroqResearch
from utils.pdf_generator import generate_pdf

from utils.helpers import (
    format_sources,
    report_statistics
)

app = Flask(__name__)

app.config.from_object(Config)

tavily = TavilyClient(app.config["TAVILY_API_KEY"])
groq = GroqResearch(app.config["GROQ_API_KEY"])


# ======================================================
# Home
# ======================================================

@app.route("/")
def home():
    return render_template("index.html")


# ======================================================
# Research API
# ======================================================

@app.route("/research", methods=["POST"])
def research():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error": "No JSON data received."

            }), 400

        query = data.get("query", "").strip()

        mode = data.get("mode", "General")

        if not query:

            return jsonify({

                "error": "Query is required."

            }), 400

        start = time.time()

        search = tavily.search(query, mode)

        report = groq.generate_report(

            search["results"],

            mode

        )

        sources = format_sources(

            search["results"]

        )

        stats = report_statistics(

            report,

            sources

        )

        end = round(

            time.time() - start,

            2

        )

        return jsonify({

            "success": True,

            "query": query,

            "mode": mode,

            "time": end,

            "report": report,

            "sources": sources,

            "stats": stats

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ======================================================
# PDF Download
# ======================================================

@app.route("/download/pdf", methods=["POST"])
def download_pdf():

    try:

        data = request.get_json()

        pdf = generate_pdf(

            data["query"],

            data["mode"],

            data["report"],

            data["sources"]

        )

        return send_file(

            pdf,

            as_attachment=True,

            download_name="research_report.pdf",

            mimetype="application/pdf"

        )

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500


# ======================================================
# TXT Download
# ======================================================

@app.route("/download/txt", methods=["POST"])
def download_txt():

    try:

        data = request.get_json()

        text = f"""
AI Research Assistant

====================================

Query:
{data['query']}

Mode:
{data['mode']}

====================================

{data['report']}
"""

        from io import BytesIO

        buffer = BytesIO()

        buffer.write(text.encode("utf-8"))

        buffer.seek(0)

        return send_file(

            buffer,

            as_attachment=True,

            download_name="research_report.txt",

            mimetype="text/plain"

        )

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500


# ======================================================
# Run App
# ======================================================

if __name__ == "__main__":

    app.run(

        debug=True,

        host="0.0.0.0",

        port=5000

    )