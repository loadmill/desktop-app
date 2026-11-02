#!/usr/bin/env python3
"""Builds the markdown links for the mac PR comment from the CircleCI artifacts API response.

Reads the JSON of GET /api/v2/project/.../<job>/artifacts from stdin and prints one line of
markdown links, separated by literal "\\n\\n" so the line can be embedded in a JSON string.
Artifacts are picked by file name, not by position. Exits non-zero if any is missing.
"""
import json
import re
import sys

# (label, file name pattern), in the order they are listed in the comment
EXPECTED = [
    ("🍏 .dmg (Apple Silicon, arm64)", re.compile(r"-arm64\.dmg$")),
    ("🍏 .dmg (Intel, x64)", re.compile(r"-x64\.dmg$")),
    ("🤐 .zip (Apple Silicon, arm64)", re.compile(r"-darwin-arm64-.*\.zip$")),
    ("🤐 .zip (Intel, x64)", re.compile(r"-darwin-x64-.*\.zip$")),
]


def build_links(response):
    items = response["items"]
    lines = []
    missing = []
    for index, (label, pattern) in enumerate(EXPECTED, start=1):
        matches = [item for item in items if pattern.search(item["path"].rsplit("/", 1)[-1])]
        if len(matches) != 1:
            missing.append(f"{label}: expected 1 match, found {len(matches)}")
            continue
        lines.append(f"### {index}. [{label}]({matches[0]['url']})")
    if missing:
        raise SystemExit("Mac artifacts not found as expected:\n" + "\n".join(missing))
    return "\\n\\n".join(lines)


if __name__ == "__main__":
    print(build_links(json.load(sys.stdin)))
