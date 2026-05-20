"""
Content processing tools — PDF extraction and URL scraping.
These are registered as ADK FunctionTools for the Content Parser agent.
"""
import httpx
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
import io


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract all text content from a PDF file.

    Args:
        pdf_bytes: Raw bytes of the PDF file.

    Returns:
        Extracted text content from all pages.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
        full_text = "\n\n".join(pages)
        if not full_text.strip():
            return "[PDF contained no extractable text — may be image-based]"
        return full_text[:8000]  # Cap to avoid token overflow
    except Exception as e:
        return f"[PDF extraction failed: {str(e)}]"


async def fetch_url_content(url: str) -> str:
    """
    Fetch and extract readable text content from a URL.

    Args:
        url: The web URL to fetch content from.

    Returns:
        Extracted text content from the web page.
    """
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(url, headers={
                "User-Agent": "AetherFlow/1.0 (Content Analyzer)"
            })
            resp.raise_for_status()
        
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Remove script/style elements
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        
        text = soup.get_text(separator="\n", strip=True)
        # Clean up excessive whitespace
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        clean = "\n".join(lines)
        return clean[:8000]  # Cap
    except Exception as e:
        return f"[URL fetch failed: {str(e)}]"
