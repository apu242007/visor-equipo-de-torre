"""Carrier Service King SK-575: HUELLA (footprint) en planta de la envolvente operativa 18 × 4 m.
Marco: origen = boca de pozo, carrier hacia −X."""
import cadquery as cq
from lib.tk10 import Arbol, dato, export_glb, bbox

ID = "carrier_huella"
ESPESOR = 0.05  # m — solo para que la huella sea un sólido visible (no es una altura del equipo)
X_INICIO = -1.3  # m: el equipo termina a 1,3 m de la boca de pozo (rotulado en LAYOUT - TKR-10)
Y_CENTRO = -0.5  # m: medido del vector del PDF (C); el equipo queda ~0,5 m hacia el lado "oeste" del eje. Signo lateral PENDIENTE


def build(spec):
    c = spec["carrier"]
    A = Arbol()
    q = dict(largo=c["operatingLengthM"], ancho=c["widthM"], ejes=c["axles"], esp=ESPESOR)
    huella = A.op(
        "Base-Extruir huella",
        cq.Workplane("XY").center(X_INICIO - q["largo"] / 2, Y_CENTRO).rect(q["largo"], q["ancho"]).extrude(q["esp"]),
        "+",
    )
    return huella, A, q


def main(spec):
    huella, A, q = build(spec)
    meta = dict(
        id=ID, family="carrier", confidence="C", units="m", up="Y",
        frame="origen = boca de pozo; carrier hacia −X; posición según LAYOUT - TKR-10",
        scope="Solo huella en planta de la envolvente operativa. Sin ejes, cabina, tanques ni altura. No es as-built.",
        data=[
            dato("operatingLengthM", q["largo"], "m", "confirmed"),
            dato("widthM", q["ancho"], "m", "confirmed"),
            dato("axles", q["ejes"], "u", "confirmed", note="dato; no se modelan los ejes"),
            dato("x_inicio", X_INICIO, "m", "confirmed", note="1,3 m a la boca de pozo, rotulado en LAYOUT - TKR-10"),
            dato("y_centro", Y_CENTRO, "m", "pending", note="medido del vector del PDF (C), no acotado"),
        ],
        tree=A.filas,
    )
    return export_glb(ID, {"huella": (huella, "main", "#A72A32")}, meta), bbox(huella), q
