#!/usr/bin/env python3
"""
Safe cleanup script to delete all resources via the gateway API.

Usage:
  python clear_data.py --base-api http://localhost:8080/api [--yes]

By default the script does a dry-run and prints what would be deleted. Pass
`--yes` to actually perform deletions.

It will attempt to clear:
 - /api/signs
 - /api/quiz (questions)
 - /api/users (if DELETE supported)

Note: Some services may not implement DELETE endpoints; the script will report that.
"""

import argparse
import requests
import sys
from typing import List


def fetch_list(session: requests.Session, url: str):
    try:
        r = session.get(url, timeout=10)
        if r.status_code == 200:
            return r.json()
        else:
            print(f"  WARN: GET {url} returned {r.status_code}")
            return None
    except requests.RequestException as e:
        print(f"  ERROR: GET {url} failed: {e}")
        return None


def delete_item(session: requests.Session, url: str):
    try:
        r = session.delete(url, timeout=10)
        return r.status_code
    except requests.RequestException as e:
        print(f"  ERROR: DELETE {url} failed: {e}")
        return None


def ids_from_list(resource: str, items) -> List[int]:
    ids = []
    if not items:
        return ids
    for it in items:
        if isinstance(it, dict):
            if 'id' in it:
                ids.append(it['id'])
            else:
                # try nested id fields
                if resource == 'quiz' and 'question' in it and isinstance(it['question'], dict) and 'id' in it['question']:
                    ids.append(it['question']['id'])
        else:
            # unknown item type
            pass
    return ids


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-api', default='http://localhost:8080/api', help='Base gateway API URL')
    parser.add_argument('--yes', action='store_true', help='Actually perform deletions')
    args = parser.parse_args()

    session = requests.Session()

    resources = [ ('signs', '/signs'), ('quiz', '/quiz'), ('users', '/users') ]

    to_delete = []

    print('Dry run: listing resources to delete (pass --yes to execute)')

    for name, path in resources:
        url = args.base_api.rstrip('/') + path
        print(f'Checking {name} at {url}...')
        items = fetch_list(session, url)
        if items is None:
            print(f'  Could not list {name} (endpoint may be unavailable)')
            continue
        # items expected to be list
        if isinstance(items, dict):
            # some endpoints return object with nested list; try common keys
            for k in ('data', 'items', 'results', 'questions', 'signs', 'users'):
                if k in items and isinstance(items[k], list):
                    items = items[k]
                    break
        if not isinstance(items, list):
            print(f'  Unexpected response shape for {name}: {type(items)}')
            continue
        ids = ids_from_list(name, items)
        print(f'  Found {len(ids)} items to delete')
        for i in ids:
            to_delete.append((name, i, args.base_api.rstrip('/') + f'{path}/{i}'))

    if not to_delete:
        print('No deletions found. Exiting.')
        return

    print('\nSummary:')
    for name, i, url in to_delete:
        print(f'  {name} id={i} -> {url}')

    if not args.yes:
        print('\nDry run complete. Re-run with --yes to perform deletions.')
        return

    print('\nPerforming deletions...')
    for name, i, url in to_delete:
        print(f'Deleting {name} id={i}...')
        status = delete_item(session, url)
        if status is None:
            print('  Failed')
        else:
            print(f'  -> {status}')

    print('Done.')


if __name__ == "__main__":
    main()
