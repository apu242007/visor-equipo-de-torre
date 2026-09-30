"""Mástil Service King SK104-330: ENVOLVENTE dimensional (no as-built).
Marco local: base centrada en el origen, eje del mástil = Z (CAD) / Y (glTF)."""
import cadquery as cq
from lib.tk10 import Arbol, dato, export_glb, bbox

ID = "mastil"

# Las alturas documentadas vienen de technical-spec.js; las secciones transversales NO están documentadas.
PENDIENTE = dict(sec_inf=(1.10, 1.10), sec_sup=(0.90, 0.90))  # (m) PLACEHOLDER de envolvente, pendiente de validar


def ecuaciones(spec):
    m = spec["mast"]
    q = dict(h_inf=m["lowerSectionM"], h_sup=m["upperSectionM"], h_tot=m["heightM"], **PENDIENTE)
    assert abs(q["h_inf"] + q["h_sup"] - q["h_tot"]) < 1e-6, "tramos no suman la altura documentada"
    assert q["sec_sup"][0] < q["sec_inf"][0] and q["sec_sup"][1] < q["sec_inf"][1], "tramo superior debe ser más chico (telescópico)"
    return q


def build(spec):
    q = ecuaciones(spec)
    A = Arbol()
    inf = A.op("Base-Extruir tramo inferior", cq.Workplane("XY").rect(*q["sec_inf"]).extrude(q["h_inf"]), "+")
    sup = cq.Workplane("XY").workplane(offset=q["h_inf"]).rect(*q["sec_sup"]).extrude(q["h_sup"])
    todo = A.op("Saliente tramo superior", inf.union(sup), "+")
    return dict(inf=inf, sup=sup, todo=todo), A, q


def main(spec):
    partes, A, q = build(spec)
    meta = dict(
        id=ID, family="mast", confidence="C", units="m", up="Y",
        frame="local: base centrada, eje del mástil = +Y; colocación en escena PENDIENTE",
        scope="Envolvente dimensional de dos tramos rectangulares macizos. Sin reticulado, corona, poleas ni interior. No es as-built.",
        data=[
            dato("heightM", q["h_tot"], "m", "confirmed"),
            dato("lowerSectionM", q["h_inf"], "m", "confirmed"),
            dato("upperSectionM", q["h_sup"], "m", "confirmed"),
            dato("sec_inf", list(q["sec_inf"]), "m", "pending", note="sección transversal no documentada (placeholder)"),
            dato("sec_sup", list(q["sec_sup"]), "m", "pending", note="sección transversal no documentada (placeholder)"),
        ],
        tree=A.filas,
    )
    parts = {"tramo_inf": (partes["inf"], "main", "#C8C2AE"), "tramo_sup": (partes["sup"], "light", "#DAD6C6")}
    return export_glb(ID, parts, meta), bbox(partes["todo"]), q
