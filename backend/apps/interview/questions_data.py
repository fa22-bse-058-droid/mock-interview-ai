QUESTIONS_BY_ROLE = {
    'frontend': [
        'Explain the virtual DOM and why it matters in React.',
        'How do you optimize performance in a React app?',
        'What are hooks and why are they useful?',
    ],
    'backend': [
        'Explain REST principles and when to use them.',
        'How would you design authentication for an API?',
        'How do you improve database query performance?',
    ],
    'general': [
        'Tell me about yourself.',
        'Describe a challenging project you worked on.',
        'How do you handle constructive feedback?',
    ],
}


def get_questions_for_role(role: str):
    role_key = (role or 'general').strip().lower()
    return QUESTIONS_BY_ROLE.get(role_key, QUESTIONS_BY_ROLE['general'])
