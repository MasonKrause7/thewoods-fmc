"""Export web-sized copies of the photos in assets/photos into assets/photos/web.

Usage:  python3 tools/optimize_photos.py

Each source photo is rotated upright (phone photos store rotation in EXIF),
then saved at 1200px and 2400px on the long edge as progressive JPEGs.
Add new photos to NAMES to give them a readable file name; anything not
listed keeps its original name.
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "photos"
OUT = SRC / "web"
SIZES = (1200, 2400)
QUALITY = 78

NAMES = {
    "20261101_100834": "congregation",
    "20261101_100919": "worship-leader",
    "20261101_100927": "worship-band-wide",
    "20261101_100937": "worship-team",
    "20261101_101000": "worship-praise",
    "20261101_101006": "guitars-cross",
    "20261101_101049": "worship-band",
    "20261101_102424": "pastor-sanctuary",
    "20261101_102526": "pastor-preaching",
    "20261101_102812": "pastor-teaching",
    "20261101_102814": "pastor-teaching-2",
    "20261101_102851": "sound-booth",
    "470858530_612901571299210_6765702893040033524_n": "church-building",
    "475991943_609268375146342_1187231633562537095_n": "carnival-treats",
    "476164906_609268488479664_6027034638163266456_n": "family-photo-booth",
    "476193396_609269515146228_2225422041720122199_n": "carnival-hall",
    "476422455_609268395146340_1742490064626417126_n": "carnival-volunteers",
    "516689343_723543210385524_1917573226992277982_n": "kids-lunch",
    "517577109_723543220385523_7639853102106456060_n": "kids-group",
    "517691684_723543183718860_8919971543345532951_n": "kids-lawn",
    "518067446_723543077052204_1471887593384089850_n": "fellowship-lunch",
    "518139972_723543260385519_4016443014077682545_n": "kids-balloons",
    "518220592_723543140385531_89057007124399907_n": "kids-science",
    "518365478_723543240385521_6517226495670636962_n": "kids-activity",
}


def export(path: Path) -> None:
    slug = NAMES.get(path.stem, path.stem)
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        for size in SIZES:
            if size != SIZES[0] and max(im.size) <= SIZES[0]:
                continue
            copy = im.copy()
            copy.thumbnail((size, size), Image.LANCZOS)
            dest = OUT / f"{slug}-{size}.jpg"
            copy.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            print(f"{dest.relative_to(ROOT)}  {copy.width}x{copy.height}  {dest.stat().st_size // 1024} KB")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for path in sorted(SRC.glob("*.jpg")):
        export(path)


if __name__ == "__main__":
    main()
