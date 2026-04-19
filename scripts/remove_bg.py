#!/usr/bin/env python3
"""
Remove solid-color backgrounds from character images using flood-fill.
Outputs PNG with transparency.
"""
from PIL import Image
import sys
from pathlib import Path

def remove_background(img_path, tolerance=30):
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # Sample background color from all four corners and use the most common
    corners = [
        pixels[0, 0],
        pixels[w-1, 0],
        pixels[0, h-1],
        pixels[w-1, h-1],
    ]
    # Pick the corner color that appears most (simple majority)
    bg_color = max(set(c[:3] for c in corners), key=lambda c: corners.count(c + (255,)))

    def color_distance(c1, c2):
        return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5

    # Flood-fill from all four corners
    from collections import deque
    visited = [[False] * h for _ in range(w)]
    queue = deque()

    for sx, sy in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        if not visited[sx][sy]:
            queue.append((sx, sy))
            visited[sx][sy] = True

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        if color_distance((r, g, b), bg_color) < tolerance:
            pixels[x, y] = (r, g, b, 0)  # make transparent
            for nx, ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return img

ASSETS = Path(__file__).parent.parent / "public" / "assets"
for name in ["luigi.png", "jasmine.png"]:
    path = ASSETS / name
    if not path.exists():
        print(f"Skipping {name} — not found")
        continue
    print(f"Processing {name}...")
    result = remove_background(path)
    result.save(path)
    print(f"  Saved {name} with transparent background")

print("Done.")
