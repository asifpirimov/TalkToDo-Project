import speech_recognition as sr

recognizer = sr.Recognizer()

def listen_for_command():
    with sr.Microphone() as source:
        print("Listening for command...")
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio)
        print(f"Command recognized: {command}")

    except sr.UnknownValueError:
        print("Could not understand the command.")
    except sr.RequestError:
        print("Request error with speech recognition.")

while True:
    listen_for_command()