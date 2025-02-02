import requests
import speech_recognition as sr

recognizer = sr.Recognizer()

def listen_for_command():
    with sr.Microphone() as source:
        print("Listening for command...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio)
        print(f"Command recognized: {command}")

        if 'add task' in command.lower():
            send_task_to_node(command)

        elif 'delete task' in command.lower():
            send_task_to_node(command)

        else: print("Command not recognized for adding or deleting tasks.")
    except sr.UnknownValueError:
        print("Could not understand the command.")
    except sr.RequestError:
        print("Request error with speech recognition.")


def send_task_to_node(command):
    url = 'http://localhost:3000/voice-command'
    payload = {'command' : command}
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        print("Command processed successfully")
    else: print("Failed to process command")

while True:
    listen_for_command()