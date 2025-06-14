from flask import Flask, render_template, request, jsonify
import pyttsx3

app = Flask(__name__)

@app.route('/')
def index():
    # Use a temporary engine to get voices
    temp_engine = pyttsx3.init()
    voices = temp_engine.getProperty('voices')
    voice_list = [{"id": i, "name": v.name} for i, v in enumerate(voices)]
    return render_template('audio.html', voices=voice_list)

@app.route('/sing', methods=['POST'])
def sing():
    try:
        data = request.json
        message = data.get('message', '')
        rate = int(data.get('rate', 200))
        volume = float(data.get('volume', 1.0))
        voice_index = int(data.get('voice_index', 0))

        # ✅ Fresh engine every time
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')

        if 0 <= voice_index < len(voices):
            engine.setProperty('voice', voices[voice_index].id)

        engine.setProperty('rate', rate)
        engine.setProperty('volume', volume)

        engine.say(message)
        engine.runAndWait()
        engine.stop()  # ✅ Ensures clean shutdown

        return jsonify({"status": "success", "message": message})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
