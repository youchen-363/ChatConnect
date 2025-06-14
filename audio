import pyttsx3

def list_voices(engine):
    voices = engine.getProperty('voices')
    print("Available voices:")
    for index, voice in enumerate(voices):
        print(f"{index}: {voice.name} ({voice.languages})")
    return voices

def sing_message(message, rate, volume, voice_index):
    # Initialize the TTS engine
    engine = pyttsx3.init()

    # Set user-defined rate and volume
    engine.setProperty('rate', rate)
    engine.setProperty('volume', volume)

    # Get and set the selected voice
    voices = engine.getProperty('voices')
    if 0 <= voice_index < len(voices):
        engine.setProperty('voice', voices[voice_index].id)
    else:
        print("Invalid voice index. Using default voice.")

    # Speak the message
    engine.say(message)
    engine.runAndWait()

if __name__ == "__main__":
    message = input("Enter the message you want to sing: ")

    # Get rate input
    try:
        rate = int(input("Enter speech rate (e.g., 150 is normal): "))
    except ValueError:
        print("Invalid input. Using default rate 200.")
        rate = 200

    # Get volume input
    try:
        volume = float(input("Enter volume (0.0 to 1.0): "))
        if not 0.0 <= volume <= 1.0:
            raise ValueError
    except ValueError:
        print("Invalid input. Using default volume 1.0.")
        volume = 1.0

    # Initialize engine to list voices
    engine = pyttsx3.init()
    voices = list_voices(engine)

    try:
        voice_index = int(input("Enter voice index number from the list above: "))
    except ValueError:
        print("Invalid input. Using default voice.")
        voice_index = 0

    print(message)
    sing_message(message, rate, volume, voice_index)
