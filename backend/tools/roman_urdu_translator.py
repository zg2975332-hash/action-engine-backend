"""
Roman Urdu to English Translation Utility
Translates common Roman Urdu phrases to English before agent processing
"""

# Roman Urdu to English mapping
ROMAN_URDU_MAPPINGS = {
    # Verbs - Decline/Decrease
    "gir gaya": "declined",
    "gir gayi": "declined",
    "gir gaye": "declined",
    "kam ho gaya": "decreased",
    "kam ho gayi": "decreased",
    "kam ho gaye": "decreased",
    "neeche aa gaya": "dropped",
    "neeche aa gayi": "dropped",
    
    # Verbs - Increase
    "barh gaya": "increased",
    "barh gayi": "increased",
    "barh gaye": "increased",
    "zyada ho gaya": "increased",
    "zyada ho gayi": "increased",
    "upar aa gaya": "went up",
    "upar aa gayi": "went up",
    
    # Request phrases
    "mujhe": "I want to analyze",
    "mujhy": "I want to analyze",
    "dekhni hai": "show me",
    "dekhna hai": "show me",
    "batao": "tell me",
    "batain": "tell me",
    "dikhao": "show",
    
    # Question words
    "kitna": "how much",
    "kitni": "how much",
    "kitne": "how many",
    "kya": "what",
    "kab": "when",
    "kahan": "where",
    "kyun": "why",
    "kaise": "how",
    
    # Common nouns
    "sales": "sales",
    "report": "report",
    "petrol": "fuel",
    "price": "price",
    "qeemat": "price",
    "daam": "price",
    
    # Cities
    "lahore": "Lahore",
    "karachi": "Karachi",
    "islamabad": "Islamabad",
    
    # Conjunctions
    "aur": "and",
    "ya": "or",
    "lekin": "but",
    "magar": "but",
    
    # Common phrases
    "ki wajah se": "because of",
    "ke baad": "after",
    "se pehle": "before",
    "ke sath": "with",
}


def translate_roman_urdu_to_english(text: str) -> str:
    """
    Translate Roman Urdu text to English using word/phrase mapping.
    
    Args:
        text: Input text in Roman Urdu
        
    Returns:
        Translated English text
    """
    if not text or not isinstance(text, str):
        return text
    
    translated = text.lower()
    
    # Sort mappings by length (longest first) to handle multi-word phrases
    sorted_mappings = sorted(ROMAN_URDU_MAPPINGS.items(), key=lambda x: len(x[0]), reverse=True)
    
    # Replace each Roman Urdu phrase with English equivalent
    for urdu_phrase, english_phrase in sorted_mappings:
        translated = translated.replace(urdu_phrase.lower(), english_phrase)
    
    return translated


def is_roman_urdu_detected(text: str) -> bool:
    """
    Detect if text contains Roman Urdu words.
    
    Args:
        text: Input text
        
    Returns:
        True if Roman Urdu detected, False otherwise
    """
    if not text or not isinstance(text, str):
        return False
    
    text_lower = text.lower()
    
    # Check for common Roman Urdu indicators
    urdu_indicators = [
        "mujhe", "mujhy", "dekhni", "dekhna", "batao", "batain",
        "gir gaya", "gir gayi", "barh gaya", "barh gayi",
        "kitna", "kitni", "kitne", "kya hai", "kyun"
    ]
    
    return any(indicator in text_lower for indicator in urdu_indicators)
