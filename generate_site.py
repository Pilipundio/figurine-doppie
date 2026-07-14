import csv
import html
import re
import unicodedata
from pathlib import Path
from urllib.parse import quote

BASE_URL = "https://pilipundio.github.io/figurine-doppie"
CSV_FILE = Path("catalogo.csv")
OUTPUT_DIR = Path("collezioni")
SITEMAP_FILE = Path("sitemap.xml")

STATIC_PAGES = [
    "",
    "catalogo.html",
    "lotti.html",
    "richiedi.html",
    "come-funziona.html",
    "figurine-panini.html",
]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower())
    return slug.strip("-")


def read_catalog() -> dict[str, list[dict[str, str]]]:
    collections: dict[str, list[dict[str, str]]] = {}

    with CSV_FILE.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)

        for row in reader:
            collection = (row.get("Collezione") or "").strip()

            if not collection:
                continue

            collections.setdefault(collection, []).append(row)

    return collections


def build_rows(rows: list[dict[str, str]]) -> str:
    output = []

    for row in rows:
        output.append(
            f"""
            <tr>
                <td>{html.escape(row.get("Numero", ""))}</td>
                <td>{html.escape(row.get("Soggetto", ""))}</td>
                <td>{html.escape(row.get("Squadra", ""))}</td>
                <td>{html.escape(row.get("Tipologia", ""))}</td>
                <td>{html.escape(row.get("Condizione", ""))}</td>
                <td>{html.escape(row.get("Quantità", ""))}</td>
            </tr>
            """
        )

    return "".join(output)


def build_collection_page(
    collection: str,
    rows: list[dict[str, str]],
    slug: str,
) -> str:
    escaped_collection = html.escape(collection)

    publishers = sorted(
        {
            (row.get("Editore") or "").strip()
            for row in rows
            if (row.get("Editore") or "").strip()
        }
    )

    years = sorted(
        {
            (row.get("Anno") or "").strip()
            for row in rows
            if (row.get("Anno") or "").strip()
        }
    )

    publisher_text = ", ".join(publishers)
    year_text = ", ".join(years)

    canonical_url = f"{BASE_URL}/collezioni/{slug}.html"
    filtered_catalog_url = (
        f"{BASE_URL}/catalogo.html?collezione={quote(collection)}"
    )

    description = (
        f"Consulta le figurine e card disponibili della collezione "
        f"{collection}. Cerca numeri, soggetti e squadre presenti nel catalogo."
    )

    return f"""<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-Z7M62WP4X1"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-Z7M62WP4X1');
    </script>

    <title>{escaped_collection} | Figurine disponibili</title>

    <meta name="description" content="{html.escape(description)}">
    <meta name="theme-color" content="#FAFAF8">

    <meta property="og:title" content="{escaped_collection} | Figurine disponibili">
    <meta property="og:description" content="{html.escape(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{canonical_url}">
    <meta property="og:site_name" content="Figurine & Card">
    <meta property="og:locale" content="it_IT">

    <link rel="canonical" href="{canonical_url}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="../style.css">
</head>

<body>

<header>
    <h1>Figurine & Card</h1>
    <p>Catalogo online di figurine e card disponibili.</p>
</header>

<nav class="navbar">
    <a href="../index.html">🏠 Home</a>
    <a class="active" href="../catalogo.html">📖 Catalogo</a>
    <a href="../lotti.html">📦 Lotti</a>
    <a href="../richiedi.html">📝 Richiedi</a>
    <a href="https://www.vinted.it/member/61336852" target="_blank" rel="noopener">
        🛍️ Vinted
    </a>
    <a href="../come-funziona.html">ℹ️ Come funziona</a>
</nav>

<section class="hero">
    <h2>{escaped_collection}</h2>

    <p>
        Consulta le figurine e card disponibili di questa collezione.
    </p>
</section>

<main class="container">

    <div class="contentCard">
        <h2>Informazioni sulla collezione</h2>

        <p>
            <strong>Editore:</strong> {html.escape(publisher_text or "Non indicato")}<br>
            <strong>Anno:</strong> {html.escape(year_text or "Non indicato")}<br>
            <strong>Figurine diverse disponibili:</strong> {len(rows)}
        </p>

        <p>
            <a class="button" href="{filtered_catalog_url}">
                Cerca nel catalogo completo
            </a>
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Numero</th>
                <th>Soggetto</th>
                <th>Squadra</th>
                <th>Tipologia</th>
                <th>Condizione</th>
                <th>Quantità</th>
            </tr>
        </thead>

        <tbody>
            {build_rows(rows)}
        </tbody>
    </table>

</main>

<footer>
    © 2026 Miyz8 · Catalogo Figurine & Card
</footer>

</body>
</html>
"""


def generate_collection_pages(
    collections: dict[str, list[dict[str, str]]],
) -> list[str]:
    OUTPUT_DIR.mkdir(exist_ok=True)

    for old_page in OUTPUT_DIR.glob("*.html"):
        old_page.unlink()

    generated_urls = []

    for collection, rows in sorted(collections.items()):
        slug = slugify(collection)

        if not slug:
            continue

        output_file = OUTPUT_DIR / f"{slug}.html"
        output_file.write_text(
            build_collection_page(collection, rows, slug),
            encoding="utf-8",
        )

        generated_urls.append(
            f"{BASE_URL}/collezioni/{slug}.html"
        )

    return generated_urls


def generate_sitemap(collection_urls: list[str]) -> None:
    urls = []

    for page in STATIC_PAGES:
        if page:
            location = f"{BASE_URL}/{page}"
        else:
            location = f"{BASE_URL}/"

        urls.append(
            f"""  <url>
    <loc>{location}</loc>
  </url>"""
        )

    for location in collection_urls:
        urls.append(
            f"""  <url>
    <loc>{location}</loc>
  </url>"""
        )

    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
"""

    SITEMAP_FILE.write_text(sitemap, encoding="utf-8")


def main() -> None:
    if not CSV_FILE.exists():
        raise FileNotFoundError(f"File non trovato: {CSV_FILE}")

    collections = read_catalog()
    collection_urls = generate_collection_pages(collections)
    generate_sitemap(collection_urls)

    print(f"Generate {len(collection_urls)} pagine di collezione.")
    print("Sitemap aggiornata.")


if __name__ == "__main__":
    main()
