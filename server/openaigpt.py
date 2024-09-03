from flask import Blueprint, request, jsonify
from openai import OpenAI
import os

chatgpt_bp= Blueprint('chatgpt', __name__)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY",""))

@chatgpt_bp.route('/chatgpt', methods=['POST'])
def chatgpt():
    data = request.json
    message = data.get('message')

    if not message:
        return jsonify({'error': 'No message provided'}),400
    
    try:
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'user', 'content': message}
            ]
        )

        chatgpt_response = response.choices[0].message['content'].strip()
        return jsonify({'message': chatgpt_response}), 200
    except Exception as e:
        # 捕获其他所有错误
        print(f"General Error: {str(e)}")
        return jsonify({'error': str(e)}), 500