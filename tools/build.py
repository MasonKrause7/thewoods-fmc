"""Assemble pages into dist/ for deployment."""

import shutil
from pathlib import Path

from includes import ROOT, render_html

DIST = ROOT / "dist"
COPY_DIRS = ("css", "js", "assets")
COPY_FILES = ("robots.txt", "sitemap.xml")


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for name in COPY_DIRS:
        shutil.copytree(ROOT / name, DIST / name)
    for name in COPY_FILES:
        shutil.copy2(ROOT / name, DIST / name)
    for page in sorted(ROOT.glob("*.html")):
        (DIST / page.name).write_text(render_html(page.read_text(), page.name))
        print(page.name)


if __name__ == "__main__":
    main()
