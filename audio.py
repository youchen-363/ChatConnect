from flask import Flask, render_template, request, jsonify
import pyttsx3
import os

app = Flask(__name__)

# Initialize pyttsx3 once to get voices
engine = pyttsx3.init()
voices = engine.getProperty('voices')

@app.route('/')
def index():
    # Pass available voices to frontend
    voice_list = [{"id": i, "name": v.name} for i, v in enumerate(voices)]
    return render_template('audio.html', voices=voice_list)

@app.route('/sing', methods=['POST'])
def sing():
    data = request.json
    message = data.get('message', '')
    rate = int(data.get('rate', 200))
    volume = float(data.get('volume', 1.0))
    voice_index = int(data.get('voice_index', 0))

    engine = pyttsx3.init()
    engine.setProperty('rate', rate)
    engine.setProperty('volume', volume)

    if 0 <= voice_index < len(voices):
        engine.setProperty('voice', voices[voice_index].id)

    engine.say(message)
    engine.runAndWait()

    return jsonify({"status": "success", "message": "Message spoken!"})

if __name__ == '__main__':
    app.run(debug=True)
