"""Shared page assembly. HTML files include partials with:

    <!-- @include partials/header.html -->

The current page's nav link gets aria-current when the page is rendered.
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INCLUDE = re.compile(r"^[ \t]*<!--\s*@include\s+([\w./-]+)\s*-->[ \t]*\n?", re.M)


def mark_current(html, page):
    if page == "visit.html":
        return html.replace(
            '<a class="btn btn--sm btn--primary" href="visit.html">',
            '<a class="btn btn--sm btn--primary" href="visit.html" aria-current="page">',
            1,
        )
    needle = f'<a href="{page}">'
    if page == "404.html":
        return html
    if needle not in html:
        raise SystemExit(f"No nav link for {page}")
    return html.replace(needle, f'<a href="{page}" aria-current="page">', 1)


def render_html(source, page):
    missing = []

    def repl(match):
        rel = match.group(1)
        path = (ROOT / rel).resolve()
        if not path.is_file() or ROOT not in path.parents:
            missing.append(rel)
            return match.group(0)
        text = path.read_text()
        if rel.endswith("header.html"):
            text = mark_current(text, page)
        return text if text.endswith("\n") else text + "\n"

    rendered = INCLUDE.sub(repl, source)
    if missing:
        raise SystemExit(f"Missing partials: {', '.join(missing)}")
    if "<!-- @include" in rendered:
        raise SystemExit(f"Unresolved include while rendering {page}")
    return rendered
