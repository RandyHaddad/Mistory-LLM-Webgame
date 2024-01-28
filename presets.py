import re  # Make sure to import the regex module at the beginning of your file

def load_list(file_path):
    with open(file_path, 'r') as file:
        list = eval(file.read())  # Use eval to convert the string list to a Python list
    return list

insults = load_list('insult_list.txt')
spam = load_list('spam_list.txt')

def getPreset(question, mystery_id):
    # Convert the question to lowercase for consistent comparison
    question_lower = question.lower()
    
    # Remove punctuation for spam check
    question_no_punctuation = re.sub(r'[^\w\s]', '', question_lower)
    
    # Check if the question is too short.
    if len(question.split()) < 2:
        return "Short"
    
    # Check for at least four letters in the question.
    if len(re.findall(r'[a-zA-Z]', question)) < 4:
        return "Not Enough Letters"
    
    # Check if too many numbers (more than half of the question)
    if len(re.findall(r'\d', question)) > 4:
        return "Too Many Numbers"
    
    # Check if too many consecutive characters are the same (more than 3)
    if re.search(r'(.)\1{4,}', question_lower):
        return "Too Many Consecutive Characters"

    # Check for insults
    for insult in insults:
        if (question_no_punctuation.startswith(insult + ' ') or
            (' ' + insult + ' ') in question_no_punctuation or
            question_no_punctuation.endswith(' ' + insult) or
            question_no_punctuation == insult):
            return "Insult"

    # Check for spam.
    if question_no_punctuation in spam:
        return "Spam"

    return "proceed"  # Return "proceed" if none of the checks above result in an early return
