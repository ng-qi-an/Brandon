from flask import Flask, request
from flask_socketio import SocketIO, emit
import threading

import google.generativeai as genai

genai.configure(api_key="AIzaSyDpx6PIpxuz5fbKVxh50z3kCnVBVUEJEVE")

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
    def generate_query(socketID):
        response = chat.send_message(data['prompt'], stream=True)
        totalContent = ""
        for chunk in response:
            print(chunk.text)
            totalContent += chunk.text
            app.config['MESSAGES'][-1] = {'role': 'model', 'text': totalContent}
            socketio.emit('retrieve_messages', {'messages': app.config['MESSAGES']})
        socketio.emit('ask_question', {'status': 'completed', 'content': totalContent})
    threading.Thread(target=generate_query, args=[request.sid]).start()

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=3732)