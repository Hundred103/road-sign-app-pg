import requests
import json

API_URL = "http://localhost:8080/api/quiz/quiz-questions"  # Gateway route for quiz-service
JSON_PATH = "../assets/data/quiz-questions.json"      # Path to your JSON file

def upsert_question(question):
    qid = question.get("id")
    # Prepare the payload for the API (remove id for POST/PUT body if needed)
    payload = {
        "id": qid,
        "questionText": question["question"],
        "imageUrl": question.get("imageUrl"),
        "questionType": question.get("questionType", "SINGLE_CHOICE"),
        "points": question.get("points", 1),
        "answers": [
            {
                "id": ans["id"],
                "answerText": ans["text"],
                "correct": ans["correct"]
            } for ans in question["answers"]
        ]
    }
    # Try to update (PUT), if not found, create (POST)
    put_resp = requests.put(f"{API_URL}/{qid}", json=payload)
    if put_resp.status_code == 404:
        post_resp = requests.post(API_URL, json=payload)
        if post_resp.ok:
            print(f"Created question {qid}")
        else:
            print(f"Failed to create question {qid}: {post_resp.text}")
    elif put_resp.ok:
        print(f"Updated question {qid}")
    else:
        print(f"Failed to upsert question {qid}: {put_resp.text}")

def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        data = json.load(f)
    for question in data["questions"]:
        if question.get("id") == 1:
            upsert_question(question)

if __name__ == "__main__":
    main()