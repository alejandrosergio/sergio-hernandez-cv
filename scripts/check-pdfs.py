"""Verifica los PDF con dos extractores, sin simular un ATS."""
import argparse
import json
import re
import unicodedata
from pathlib import Path
from pypdf import PdfReader
import pdfplumber

def norm(value):
    value = unicodedata.normalize("NFC", value or "")
    value = value.replace("\u2013", "-").replace("\u2014", "-").replace("\ufb01", "fi").replace("\ufb02", "fl")
    return re.sub(r"\s+", " ", value).strip()

def ordered(text, parts, label):
    cursor = 0
    for part in parts:
        found = text.find(norm(part), cursor)
        assert found >= 0, f"{label}: falta o se ha separado {part!r}"
        cursor = found + len(norm(part))

def verify_text(pages, case, method):
    joined = norm(" ".join(pages))
    label = case["filename"] + " / " + method
    ordered(joined, case["sections"], label + " secciones")
    for paragraph in case["profile"]:
        assert norm(paragraph) in joined, label + ": perfil alterado"
    assert norm(case["degree"]) in joined, label + ": ADSI incorrecto"
    assert not re.search(r"Alejandro.sTech|Próximamente|Coming soon", joined, re.I), label + ": marca provisional en papel"
    for index, job in enumerate(case["jobs"]):
        following = case["jobs"][index + 1]["company"] if index + 1 < len(case["jobs"]) else case["sections"][2]
        start = joined.index(job["company"])
        end = joined.index(following, start + len(job["company"]))
        block = joined[start:end]
        ordered(block, [job["company"], job["role"], job["period"], job["country"], job["duration"], *job["bullets"]], label + " " + job["company"])
        assert any(all(norm(part) in norm(page) for part in [job["company"], job["role"], job["period"], job["duration"], *job["bullets"]]) for page in pages), label + ": empleo dividido entre páginas"
    skills_start = joined.index(case["sections"][2])
    skills_end = joined.index(case["sections"][3], skills_start)
    skills = joined[skills_start:skills_end]
    for index, area in enumerate(case["skills"]):
        start = skills.index(area["title"])
        end = skills.index(case["skills"][index + 1]["title"], start + len(area["title"])) if index + 1 < len(case["skills"]) else len(skills)
        ordered(skills[start:end], [area["title"], *area["paragraphs"]], label + ": competencias intercaladas")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", default="tmp/pdfs/expected.json")
    parser.add_argument("--pdf-dir", default="output/pdf")
    args = parser.parse_args()
    cases = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    report = []
    for case in cases:
        path = Path(args.pdf_dir) / case["filename"]
        reader = PdfReader(path)
        assert len(reader.pages) == case["pages"], f"{path.name}: paginación inesperada ({len(reader.pages)})"
        pypdf_pages = [page.extract_text() or "" for page in reader.pages]
        assert all(len(norm(page)) > 100 for page in pypdf_pages), path.name + ": página vacía o casi vacía"
        verify_text(pypdf_pages, case, "pypdf")
        links = {str(annotation.get_object().get("/A", {}).get("/URI")) for page in reader.pages for annotation in page.get("/Annots", []) if annotation.get_object().get("/A", {}).get("/URI")}
        assert set(case["links"]).issubset(links), path.name + ": enlace perdido"
        with pdfplumber.open(path) as pdf:
            plumber_pages = [page.extract_text() or "" for page in pdf.pages]
            verify_text(plumber_pages, case, "pdfplumber")
            for page in pdf.pages:
                assert page.width > 590 and page.width < 600 and page.height > 840 and page.height < 845, path.name + ": no es A4"
                assert all(c["x0"] >= -0.5 and c["x1"] <= page.width + 0.5 and c["top"] >= -0.5 and c["bottom"] <= page.height + 0.5 for c in page.chars), path.name + ": texto fuera de página"
                assert all(c["size"] >= 8.99 for c in page.chars), path.name + ": texto menor que los metadatos previstos"
            if case["variant"] == "recruiter":
                assert all(not page.images for page in pdf.pages), path.name + ": fotografía en el resumido"
            # Las viñetas y el perfil se contrastan contra palabras con su tamaño real.
            words = [word for page in pdf.pages for word in page.extract_words(extra_attrs=["size"])]
            tokens = [norm(word["text"]) for word in words]
            for body in [*case["profile"], *(bullet for job in case["jobs"] for bullet in job["bullets"])]:
                prefix = norm(body).split()[:4]
                match = next((i for i in range(len(tokens)-len(prefix)+1) if tokens[i:i+len(prefix)] == prefix), None)
                assert match is not None, path.name + ": no se localiza cuerpo de texto"
                assert all(words[i]["size"] >= 9.99 for i in range(match, match+len(prefix))), path.name + ": cuerpo menor de 10 pt"
        # Guardar ambos resultados ayuda a auditar diferencias sin sustituir la revisión visual.
        stem = Path("tmp/pdfs") / path.stem
        stem.with_suffix(".pypdf.txt").write_text("\n\n".join(pypdf_pages), encoding="utf-8")
        stem.with_suffix(".pdfplumber.txt").write_text("\n\n".join(plumber_pages), encoding="utf-8")
        report.append({"file": path.name, "pages": len(reader.pages), "links": len(links), "extractors": ["pypdf", "pdfplumber"], "body_min_pt": 10})
    print(json.dumps(report, ensure_ascii=False, indent=2))
if __name__ == "__main__":
    main()
