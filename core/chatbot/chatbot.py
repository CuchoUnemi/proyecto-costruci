import random
import json
import os
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
import tensorflow as tf

# Inicializar lematizador
lemmatizer = WordNetLemmatizer()

# Cargar archivos necesarios
# Construye la ruta absoluta al archivo
base_dir = os.path.dirname(__file__)
json_path = os.path.join(base_dir, 'intents.json')

with open(json_path, 'r', encoding='utf-8') as file:
    intents = json.load(file)

words_path = os.path.join(base_dir, 'words.pkl')
classes_path = os.path.join(base_dir, 'classes.pkl')
model_path = os.path.join(base_dir, 'chatbot_model.h5')

words = pickle.load(open(words_path, 'rb'))
classes = pickle.load(open(classes_path, 'rb'))
model = tf.keras.models.load_model(model_path)

# Preprocesar entrada del usuario
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

# Crear bolsa de palabras
def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

# Predecir clase
def predict_class(sentence):
    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

# Obtener respuesta
def get_response(intents_list, intents_json):
    if len(intents_list) == 0:
        return "Lo siento, no entiendo tu pregunta."
    tag = intents_list[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if i["tag"] == tag:
            result = random.choice(i['responses'])
            return result

def chatbot_response(msg):
    intents_list = predict_class(msg)
    response = get_response(intents_list, intents)
    return response

# Interfaz de consola simple
if __name__ == "__main__":
    print("El chatbot está listo para conversar! (escribe 'salir' para terminar)")
    while True:
        message = input("Tú: ")
        if message.lower() == "salir":
            print("Chatbot: ¡Hasta luego!")
            break
        response = chatbot_response(message)
        print(f"Chatbot: {response}")
