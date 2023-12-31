from openai import OpenAI

def omit_question(question):
    system_message = {
        'role': 'system',
        'content': (
            "You must determine if the message is a yes-or-no question without considering punctuation and grammar. Answer by 'True' or 'False', and nothing else."
        )
    }
    # User's question
    user_message = {
        'role': 'user',
        'content': question
    }
    # Making the API request
    client = OpenAI()
    model='gpt-3.5-turbo-1106'
    response = client.chat.completions.create(
        model = model,
        messages=[system_message, user_message],
        temperature=0,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    cost = openai_api_calculate_cost(response.usage, model='gpt-3.5-turbo-1106')
    # Ensure response format is correct
    if response and response.choices and response.choices[0].message:
        # Extracting and returning the response
        return response.choices[0].message.content.strip(), cost
    else:
        return "An error occurred while generating the response."

def openai_api_calculate_cost(usage,model="gpt-4-1106-preview"):
    pricing = {
        'gpt-3.5-turbo-1106': {
            'prompt': 0.001,
            'completion': 0.002,
        },
        'gpt-4-1106-preview': {
            'prompt': 0.01,
            'completion': 0.03,
        },
        'gpt-4': {
            'prompt': 0.03,
            'completion': 0.06,
        }
    }

    try:
        model_pricing = pricing[model]
    except KeyError:
        raise ValueError("Invalid model specified")

    prompt_cost = usage.prompt_tokens * model_pricing['prompt'] / 1000
    completion_cost = usage.completion_tokens * model_pricing['completion'] / 1000

    total_cost = prompt_cost + completion_cost
    total_cost = round(total_cost, 10)

    print(f"\nTokens used:  {usage.prompt_tokens:,} prompt + {usage.completion_tokens:,} completion = {usage.total_tokens:,} tokens")
    print(f"Total cost for {model}: ${total_cost:.7f}\n")

    return total_cost

def generate_response(question, mystery):
    # System message that sets the context and rules of the game
    system_message = {
        'role': 'system',
        'content': (
            "You are an AI helping to narrate a 'Dark Stories' game. Answer yes-or-no questions based on the following information." 
            "There are two sections, 'Reasoning' and 'Response'. In the 'Response' section, respond only with 'Yes', 'No', 'Irrelevant/Ambiguous', 'Please ask a yes-or-no question'. " 
            "You must NEVER respond with anything else, not even hello. " 
            "In the 'Reasoning' section, ALWAYS provide a justification for your answer."
            "Your answer should ALWAYS follow the following format, even when there's an error: 'Reasoning : ... /n Response : ...'"
            f"Description given to the player: {mystery['description']}"
            f"Solution that your answer depends on (EVERY WORD IS VERY IMPORTANT): {mystery['solution']}"
        )
    }

    print(system_message)

    # User's question
    user_message = {
        'role': 'user',
        'content': question
    }

    # Making the API request
    client = OpenAI()
    model='gpt-3.5-turbo-1106'
    #model="gpt-4-1106-preview"
    response = client.chat.completions.create(
        model = model,
        messages=[system_message, user_message],
        temperature=0.7,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    cost = openai_api_calculate_cost(response.usage, model=model)
    # Ensure response format is correct
    if response and response.choices and response.choices[0].message:
        # Extracting and returning the response
        return response.choices[0].message.content.strip(), cost
    else:
        return "An error occurred while generating the response."

def evaluate_interpretation(interpretation, solution):

    system_message = {
        'role': 'system',
        'content': (
        "Rate the accuracy of the interpretation compared to the solution on a scale of 0 to 100:\n"
        ""
        f"Actual Solution: {solution}"
        "Your answer should ALWAYS follow the following format, even when there's an error: 'Reasoning : ... /n Response : ...'. The response must always be a number."
        )
    }

    user_message = {
        'role': 'user',
        'content': f"Interpretation: {interpretation}\n"
    }

    client = OpenAI()
    model='gpt-3.5-turbo-1106'
    #model="gpt-4-1106-preview"
    response = client.chat.completions.create(
        model=model,
        messages=[system_message, user_message],
        temperature=0,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    cost = openai_api_calculate_cost(response.usage, model=model)
    # Ensure response format is correct
    if response and response.choices and response.choices[0].message:
        # Extracting and returning the response
        return response.choices[0].message.content.strip(), cost
    else:
        return "An error occurred while generating the response."
