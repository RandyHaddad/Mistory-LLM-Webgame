from flask import Flask, render_template, request, session, redirect, url_for
from dotenv import load_dotenv
from mysteries_data import mysteries
from openai_integration import omit_question, generate_response, evaluate_interpretation
import openai
import os
import re
import datetime

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'default_secret_key')

@app.route('/')
@app.route('/')
def home():
    return render_template('home.html')

def log_interaction(entry, cost):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("interaction_logs.txt", "a") as log_file:
        log_file.write(f"------\nTimestamp: {timestamp}\n{entry}\nCost: ${cost:.6f}\n------\n\n")

@app.route('/select_mystery')
def select_mystery():
    return render_template('select_mystery.html')

@app.route('/start_game', methods=['GET', 'POST'])
def start_game():
    if request.method == 'POST':
        difficulty = request.form['difficulty']
        session['selected_mystery'] = mysteries[difficulty]
        session['qa_history'] = []  # Initialize or reset the Q&A history
        session['guess_count'] = 0
        
    selected_mystery = session.get('selected_mystery')

    if 'qa_history' not in session:
        session['qa_history'] = []  # Initialize qa_history if not present

    if not selected_mystery:
        return "Invalid Access"

    # Render the game template whether it's a POST or GET request
    return render_template('start_game.html', game_title="MISTORI", mystery=selected_mystery)

def get_css_class_for_answer(answer):
    classes = {
        'YES': 'answer-yes',
        'NO': 'answer-no',
        'Irrelevant': 'answer-irrelevant',
        'Omitted': 'answer-omitted'
    }
    return classes.get(answer, 'answer-default')


@app.route('/ask_question', methods=['POST'])
def ask_question():
    question = request.form['question']
    selected_mystery = session.get('selected_mystery')
    if not selected_mystery:
        return "No mystery selected."
    
    # Check if yes-or-no question
    question_type, omit_cost = omit_question(question)
    response_cost = 0
    reasoning = ""
    response = ""
    no_response = True
    if "true" not in question_type.lower():
        response = "Omitted"
        no_response = False
    else:
        # Generate the response and split it
        response, response_cost = generate_response(question, selected_mystery)
        split_string = re.split('Response:|Response :', response)
        reasoning = split_string[0].strip() if len(split_string) > 1 else ""
        response = split_string[1].strip() if len(split_string) > 1 else response.strip()
        no_response = False

    # Accumulate the cost
    cost = omit_cost + response_cost  

    # Transform the response if it contains specific keywords
    if "please ask" in response.lower() or no_response or "omitted" in response.lower():
        response = "Omitted"
    elif "yes" in response.lower():
        response = "YES"
    elif "no" in response.lower():
        response = "NO"
    else:
        response = "Irrelevant"

    # Print reasoning to terminal
    print("Reasoning:", reasoning)

    # Get the current QA history from the session, or initialize if not present
    qa_history = session.get('qa_history', [])
    qa_history.append({
        'question': question, 
        'answer': response,
        'css_class': get_css_class_for_answer(response), 
        'reasoning': reasoning,
    })

    # Update the session
    session['qa_history'] = qa_history
    session['guess_count'] = session.get('guess_count', 0) + 1
    
    # Log the interaction with cost
    log_entry = f"Question: {question}, AI Response: {response}, AI Reasoning: {reasoning}"
    log_interaction(log_entry, cost)

    # Redirect back to the game page with updated session data
    return redirect(url_for('start_game'))

from flask import jsonify

@app.route('/check_answer', methods=['POST'])
def check_answer():
    interpretation = request.form['interpretation']
    selected_mystery = session.get('selected_mystery')
    if not selected_mystery:
        return jsonify({'error': "No mystery selected."}), 400

    # Call a function to evaluate the interpretation and split it
    accuracy, cost = evaluate_interpretation(interpretation, selected_mystery['solution'])
    split_string = re.split('Response:|Response :', accuracy)
    accuracy_reasoning = split_string[0].strip() if len(split_string) > 1 else ""
    accuracy_rating = split_string[1].strip() if len(split_string) > 1 else accuracy.strip()

    # Update the session with the interpretation and its accuracy rating
    session['interpretation'] = interpretation
    session['accuracy_rating'] = accuracy_rating
    session['accuracy_reasoning'] = accuracy_reasoning 

    # Log the interpretation check with cost
    log_entry = f"Interpretation: {interpretation}, AI Evaluation: {accuracy}"
    log_interaction(log_entry, cost)

    # Prepare the data to be returned
    response_data = {
        'accuracy_rating': accuracy_rating,
        'solution_image_url': selected_mystery.get('image_url', ''), # Assuming the mystery has an image URL
        'solution_text': selected_mystery.get('solution', ''),
        'reasoning': accuracy_reasoning
    }

    return jsonify(response_data)

@app.route('/reset_game')
def reset_game():
    session.pop('qa_history', None)  # Remove qa_history from session
    session['guess_count'] = 0       # Reset guess count
    # Add any other session variables that need resetting

    return redirect(url_for('start_game'))

if __name__ == '__main__':
    app.run(debug=True)