#!/usr/bin/env python3
"""
Import script for road signs and quiz questions.

Usage:
  python import.py --base-api http://localhost:8080/api --assets-dir frontend/src/assets

It reads JSON files from `assets/data/road-signs.json` and `assets/data/quiz-questions.json`,
assigns `imageUrl` when matching image files under `frontend/src/assets/signs/...`, and
POSTs/PUTs data to the gateway endpoints:
  - /api/signs
  - /api/quiz

The script checks for existing entries by `code` (signs) and by question text (quiz) to decide
whether to create (POST) or update (PUT).
"""

import argparse
import json
import os
import re
import time
from typing import Dict, List, Optional

import requests


CATEGORY_FOLDER = {
    'WARNING': 'warning',
    'PROHIBITION': 'prohibittion',
    'MANDATORY': 'mandatory',
    'INFORMATION': 'information',
    'PRIORITY': 'information'
}


def code_to_filename(code: str) -> str:
    # Turn code like 'A-1' or 'A-18a' into 'a1.png' or 'a18a.png'
    name = re.sub(r'[^0-9A-Za-z]', '', code).lower()
    return f"{name}.png"


def find_image_for_sign(sign: Dict, assets_dir: str) -> Optional[str]:
    cat = sign.get('category')
    folder = CATEGORY_FOLDER.get(cat)
    if not folder:
        return None
    filename = code_to_filename(sign.get('code', ''))
    path = os.path.join(assets_dir, 'signs', folder, filename)
    if os.path.exists(path):
        return f"/assets/signs/{folder}/{filename}"
    return None


def load_json(path: str) -> Dict:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def upsert_signs(base_api: str, assets_dir: str, signs_json_path: str):
    data = load_json(signs_json_path)
    signs = data.get('signs', [])
    session = requests.Session()

    for s in signs:
        code = s.get('code')
        payload = {
            'code': code,
            'name': s.get('name'),
            'description': s.get('description'),
            'category': s.get('category'),
            'imageUrl': s.get('imageUrl'),
            'kidFriendlyDescription': s.get('kidFriendlyDescription')
        }

        # try to find an image if not present
        if not payload['imageUrl']:
            img = find_image_for_sign(s, assets_dir)
            if img:
                payload['imageUrl'] = img

        print(f"Processing sign {code}...")

        # check existing by code
        try:
            r = session.get(f"{base_api}/signs/code/{code}")
        except requests.RequestException as e:
            print(f"  ERROR contacting API: {e}")
            continue

        if r.status_code == 200:
            existing = r.json()
            sid = existing.get('id')
            if sid:
                print(f"  Exists (id={sid}), updating...")
                try:
                    up = session.put(f"{base_api}/signs/{sid}", json=payload)
                    print(f"    -> {up.status_code}")
                except requests.RequestException as e:
                    print(f"    ERROR updating: {e}")
        else:
            print("  Creating...")
            try:
                p = session.post(f"{base_api}/signs", json=payload)
                print(f"    -> {p.status_code}")
            except requests.RequestException as e:
                print(f"    ERROR creating: {e}")

        time.sleep(0.1)


def extract_code_from_text(text: str) -> Optional[str]:
    # match patterns like 'B-1', 'A-18a', 'C-13'
    m = re.search(r"\b([A-Z]-\d+[A-Za-z0-9]*)\b", text)
    return m.group(1) if m else None


def upsert_quiz(base_api: str, assets_dir: str, quiz_json_path: str, signs_lookup: Dict[str, Dict]):
    data = load_json(quiz_json_path)
    questions = data.get('questions', [])
    session = requests.Session()

    # fetch existing questions to detect updates
    try:
        r = session.get(f"{base_api}/quiz")
        existing = r.json() if r.status_code == 200 else []
    except requests.RequestException:
        existing = []

    existing_map = { (q.get('questionText') or q.get('question') or '').strip().lower(): q for q in existing }

    for q in questions:
        text = q.get('question') or q.get('questionText') or ''
        payload = {
            'questionText': text,
            'imageUrl': q.get('imageUrl'),
            'answers': []
        }

        # try to find code inside question text and map to sign image
        if not payload['imageUrl']:
            code = extract_code_from_text(text)
            if code and code in signs_lookup:
                payload['imageUrl'] = signs_lookup[code].get('imageUrl')

        for a in q.get('answers', []):
            payload['answers'].append({'answerText': a.get('text'), 'isCorrect': bool(a.get('correct'))})

        key = text.strip().lower()
        if key in existing_map:
            qid = existing_map[key].get('id')
            if qid:
                print(f"Updating question id={qid}")
                try:
                    up = session.put(f"{base_api}/quiz/{qid}", json=payload)
                    print(f"  -> {up.status_code}")
                except requests.RequestException as e:
                    print(f"  ERROR updating question: {e}")
                time.sleep(0.05)
                continue

        print(f"Creating question: {text[:60]}...")
        try:
            p = session.post(f"{base_api}/quiz", json=payload)
            print(f"  -> {p.status_code}")
        except requests.RequestException as e:
            print(f"  ERROR creating question: {e}")
        time.sleep(0.05)


def build_signs_lookup(signs_json_path: str, assets_dir: str) -> Dict[str, Dict]:
    data = load_json(signs_json_path)
    lookup = {}
    for s in data.get('signs', []):
        code = s.get('code')
        img = s.get('imageUrl') or find_image_for_sign(s, assets_dir)
        entry = dict(s)
        entry['imageUrl'] = img
        lookup[code] = entry
    return lookup


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-api', default='http://localhost:8080/api', help='Base gateway API URL (default: http://localhost:8080/api)')
    parser.add_argument('--assets-dir', default='../frontend/src/assets', help='Path to frontend assets directory')
    parser.add_argument('--signs-json', default='../assets/data/road-signs.json', help='Path to signs JSON')
    parser.add_argument('--quiz-json', default='../assets/data/quiz-questions.json', help='Path to quiz JSON')
    args = parser.parse_args()

    # resolve paths relative to script dir and repo root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, '..'))

    def resolve(p: str) -> str:
        if os.path.isabs(p):
            return p
        p1 = os.path.abspath(os.path.join(script_dir, p))
        if os.path.exists(p1):
            return p1
        p2 = os.path.abspath(os.path.join(repo_root, p))
        return p2

    args.assets_dir = resolve(args.assets_dir)
    args.signs_json = resolve(args.signs_json)
    args.quiz_json = resolve(args.quiz_json)

    print('Building signs lookup...')
    signs_lookup = build_signs_lookup(args.signs_json, args.assets_dir)

    print('Uploading signs...')
    upsert_signs(args.base_api, args.assets_dir, args.signs_json)

    print('Uploading quiz questions...')
    upsert_quiz(args.base_api, args.assets_dir, args.quiz_json, signs_lookup)


if __name__ == '__main__':
    main()
