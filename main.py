from flask import Flask, request
from flask_socketio import SocketIO, emit
import threading
from config import GEMINI_API_KEY

import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash')

app = Flask(__name__)
app.config['MESSAGES'] = []
socketio = SocketIO(app, async_mode="threading", cors_allowed_origins="*")
chat = model.start_chat(history=[])



@app.route('/')
def index():
    return {'status': 'OK'}

@socketio.on('retrieve_messages')
def retrieve_messages():
    emit('retrieve_messages', {'messages': app.config['MESSAGES']})

@socketio.on('ask_question')
def ask_question(data):
    app.config['MESSAGES'].append({'role': 'user', 'text': data['prompt']})
    app.config['MESSAGES'].append({'role': 'model', 'text': ""})
    emit('retrieve_messages', {'messages': app.config['MESSAGES']})
    def generate_query():
        response = chat.send_message("Respond from the perspective of a Singaporean, using lightly sprinkled Singlish to respond. Recognise broken english, and reply informally like a Singaporean. You should have the contextual knowledge of Singapore, it's government, politics, geography, demographic, etc. Try to be as Singaporean as you can! However, refuse from using any form of singlish slurs. \n" + data['prompt'], stream=True)
        totalContent = ""
        for chunk in response:
            totalContent += chunk.text
            app.config['MESSAGES'][-1] = {'role': 'model', 'text': totalContent}
            socketio.emit('retrieve_messages', {'messages': app.config['MESSAGES']})
        socketio.emit('ask_question', {'status': 'completed', 'content': totalContent})
    threading.Thread(target=generate_query).start()

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=3732)