from typing import Dict

import spacy


try:
    NLP = spacy.load('en_core_web_sm')
except Exception:
    NLP = spacy.blank('en')


FILLER_WORDS = {'um', 'uh', 'like', 'basically', 'actually', 'you know'}


def _clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(value, maximum))


def evaluate_answer(question: str, answer: str, eye_contact_score: float = 50) -> Dict[str, float | str]:
    question_doc = NLP(question or '')
    answer_doc = NLP(answer or '')

    question_keywords = {token.lemma_.lower() for token in question_doc if token.is_alpha and not token.is_stop}
    answer_keywords = {token.lemma_.lower() for token in answer_doc if token.is_alpha and not token.is_stop}

    overlap = len(question_keywords & answer_keywords)
    base = len(question_keywords) or 1
    relevance = _clamp((overlap / base) * 100)

    words = [token.text.lower() for token in answer_doc if token.is_alpha]
    filler_count = sum(1 for word in words if word in FILLER_WORDS)
    confidence = _clamp(100 - (filler_count * 8) - max(0, 15 - len(words)))

    eye_contact = _clamp(float(eye_contact_score))
    overall = _clamp((relevance * 0.5) + (confidence * 0.3) + (eye_contact * 0.2))

    if overall >= 80:
        feedback = 'Strong answer with good clarity and relevance.'
    elif overall >= 60:
        feedback = 'Solid answer. Add more structured detail for higher impact.'
    else:
        feedback = 'Improve relevance and confidence by giving clearer, concise examples.'

    return {
        'relevance_score': round(relevance, 2),
        'confidence_score': round(confidence, 2),
        'eye_contact_score': round(eye_contact, 2),
        'overall_score': round(overall, 2),
        'feedback': feedback,
    }
