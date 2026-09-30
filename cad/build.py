"""Genera los GLB de referencia y verifica sus cotas contra technical-spec.js.
Uso: python cad/build.py   (exit 1 si algo no cierra)."""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from lib.tk10 import load_spec, OUT  # noqa: E402
from components import mastil, piso_trabajo, carrier_huella  # noqa: E402

TOL = 1e-6
spec = load_spec()
fallas = []


def check(nombre, obtenido, esperado):
    ok = abs(obtenido - esperado) < TOL
    print("  [%s] %s: %.4f vs %.4f" % ("OK" if ok else "FALLA", nombre, obtenido, esperado))
    if not ok:
        fallas.append(nombre)


path, bb, q = mastil.main(spec)
print("mastil ->", path.name)
check("altura total", bb["z"], spec["mast"]["heightM"])
check("tramo inf + sup", q["h_inf"] + q["h_sup"], spec["mast"]["heightM"])

path, bb, q = piso_trabajo.main(spec)
print("piso_trabajo ->", path.name)
check("largo (x)", bb["x"], spec["workFloor"]["sizeM"][0])
check("ancho (y)", bb["y"], spec["workFloor"]["sizeM"][1])
check("cara superior = altura del modelo", bb["zmin"] + bb["z"], spec["workFloor"]["modelHeightM"])
for h in (spec["workFloor"]["minHeightM"], spec["workFloor"]["maxHeightM"]):  # configuraciones
    piso_trabajo.build(spec, h)
    print("  [OK] configuración h=%s m regenera" % h)
try:
    piso_trabajo.build(spec, spec["workFloor"]["maxHeightM"] + 0.5)
    fallas.append("rango no protegido")
except AssertionError:
    print("  [OK] altura fuera del rango documentado se rechaza")

path, bb, q = carrier_huella.main(spec)
print("carrier_huella ->", path.name)
check("largo operativo", bb["x"], spec["carrier"]["operatingLengthM"])
check("ancho", bb["y"], spec["carrier"]["widthM"])

check("carrier termina a 1,3 m de la boca", bb["xmin"] + bb["x"], -1.3)

from components import layout_tkr10  # noqa: E402

path, bb, m = layout_tkr10.main(spec)  # las ecuaciones asertan tamaños y cotas rotuladas (5 m, 3 m, 1,3 m)
print("layout_tkr10 ->", path.name, {k: [round(v, 2) for v in vals] for k, vals in m.items()})

import trimesh  # noqa: E402

for cid in ("mastil", "piso_trabajo", "carrier_huella", "layout_tkr10"):
    sc = trimesh.load(OUT / (cid + ".glb"))
    nombres = [n for n in sc.graph.nodes if n.startswith(cid)]
    ok = cid in nombres and len(nombres) > 1
    print("  [%s] %s.glb nodos: %s" % ("OK" if ok else "FALLA", cid, nombres))
    if not ok:
        fallas.append(cid + " nombres")

print("RESULTADO:", ("FALLAS " + str(fallas)) if fallas else "todo OK")
sys.exit(1 if fallas else 0)
