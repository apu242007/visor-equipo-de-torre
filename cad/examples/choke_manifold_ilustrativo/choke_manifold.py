"""Choke manifold ILUSTRATIVO reconstruido de imagen (OIP (3).webp). Unidades = px de imagen (escala PENDIENTE)."""
import cadquery as cq, csv, os, sys
V = cq.Vector

# ===== PARAMETROS (px de imagen; K mm/px PENDIENTE) =====
P = dict(
    K=1.0,               # mm/px: PENDIENTE (sin cota real en la imagen)
    YB=470.0,            # fila de la imagen del borde inferior del skid
    skid=(104, 218, 342, 470), skid_t=11.0,   # x0,py0,x1,py1 ; espesor
    z_ax=42.0,           # eje de tuberia sobre Z=0 (APROXIMADO, de la vista frontal)
    r_pipe=5.5, blk=34.0, r_wheel=16.0, r_fl=11.0, L_gate=32.0,
    x_hdr=320.0, x_lv=116.0,                   # cabezal derecho / vertical izquierdo
    lines=dict(A=243.0, B=302.0, C=371.0, D=445.0),  # py de cada linea
    x_5way=186.0, z_gauge=140.0,
)
def Y(py): return P["YB"] - py

def ecuaciones(p):
    q = dict(p)
    x0, y0, x1, y1 = q["skid"]
    assert x0 < q["x_lv"] < q["x_hdr"] < x1 and y0 < min(q["lines"].values()) and max(q["lines"].values()) < y1
    return q
P = ecuaciones(P)
Z0 = P["z_ax"]

def cyl(r, h, p, d): return cq.Workplane(obj=cq.Solid.makeCylinder(r, h, V(*p), V(*d)))
def box(cx, cy, cz, lx, ly, lz):
    return cq.Workplane("XY").box(lx, ly, lz).translate((cx, cy, cz))
def pipe(x1, py1, x2, py2, r=None):
    r = r or P["r_pipe"]; a = V(x1, Y(py1), Z0); b = V(x2, Y(py2), Z0)
    return cq.Workplane(obj=cq.Solid.makeCylinder(r, (b - a).Length, a, (b - a).normalized()))
def flange(x, py, axis):
    d = (1, 0, 0) if axis == "x" else (0, 1, 0)
    c = (x - 2, Y(py), Z0) if axis == "x" else (x, Y(py) - 2, Z0)
    return cyl(P["r_fl"], 4, c, d)
def gate_valve(cx, py, axis="x"):
    L = P["L_gate"]; cy = Y(py)
    body = box(cx, cy, Z0, L, 26, 40) if axis == "x" else box(cx, cy, Z0, 26, L, 40)
    bon = cyl(7, 30, (cx, cy, Z0), (0, 0, 1))
    stem = cyl(1.8, 42, (cx, cy, Z0), (0, 0, 1))
    wheel = cyl(P["r_wheel"], 3, (cx, cy, Z0 + 30), (0, 0, 1))
    fl = [flange(cx - L/2, py, axis), flange(cx + L/2 - 2, py, axis)] if axis == "x" else []
    r = body.union(bon).union(stem).union(wheel)
    for f in fl: r = r.union(f)
    return r
def block(cx, py, s=None, h=None):
    s = s or P["blk"]; h = h or s
    return box(cx, Y(py), Z0, s, s, h)
def choke(x0, x1, py, w=24, h=30):
    return box((x0 + x1)/2, Y(py), Z0, x1 - x0, w, h).union(flange(x0 - 1, py, "x"))

# ===== PIEZAS =====
skid_x0, skid_y0, skid_x1, skid_y1 = P["skid"]
skid = box((skid_x0+skid_x1)/2, (Y(skid_y0)+Y(skid_y1))/2, P["skid_t"]/2, skid_x1-skid_x0, skid_y1-skid_y0, P["skid_t"])
L = P["lines"]; xh = P["x_hdr"]; xl = P["x_lv"]
posts = [box(x, Y(skid_y0) - 8, P["skid_t"] + 55, 15, 4, 110) for x in (152.0, 297.0)]   # APROXIMADO en Y

pipes = [
    pipe(xh, 232, xh, 450),                                   # cabezal derecho
    pipe(xl, 257, xl, 440),                                   # vertical izquierdo (spool)
    pipe(140, L["A"], 200, L["A"]), pipe(235, L["A"], xh, L["A"]),
    pipe(235, L["B"], xh, L["B"]),
    pipe(xl, L["C"], 172, L["C"]), pipe(200, L["C"], xh, L["C"]),
    pipe(xl, 440, 150, L["D"]), pipe(230, L["D"], xh, L["D"]),
    pipe(xl, 330, xl, 407), pipe(P["x_5way"], 330, P["x_5way"], 407),
    pipe(xh + 17, L["A"], 395, L["A"]), pipe(xh + 17, L["C"], 395, L["C"]), pipe(xh + 17, L["D"], 395, L["D"]),
]
valves = [
    gate_valve(218, L["A"]), gate_valve(222, L["B"]),
    gate_valve(220, L["C"]), gate_valve(274, L["C"]),
    gate_valve(362, L["A"]), gate_valve(362, L["C"]), gate_valve(362, L["D"]),
    gate_valve(xl, 330, "y"), gate_valve(xl, 407, "y"),
    gate_valve(P["x_5way"], 330, "y"), gate_valve(P["x_5way"], 407, "y"),
]
chokes = [choke(98, 140, L["A"]), choke(152, 208, L["B"], 24, 28), choke(150, 230, L["D"], 24, 30)]
blocks = [block(xh, L[k], 36) for k in "ABCD"] + [block(118, L["C"], 24), block(P["x_5way"], L["C"], 22)]
gauge = (cyl(7, P["z_gauge"] - Z0, (P["x_5way"], Y(L["C"]), Z0), (0, 0, 1))
         .union(cyl(4, 14, (P["x_5way"], Y(L["C"]), P["z_gauge"]), (0, 0, 1))))

grupos = [("skid", [skid] + posts, "gray"), ("tuberia", pipes, "steelblue"),
          ("valvulas", valves, "gold"), ("chokes", chokes, "lightgray"),
          ("bloques", blocks + [gauge], "royalblue")]

# ===== VERIFICACION =====
sol = []
for n, ws, c in grupos:
    for i, w in enumerate(ws):
        v = w.val(); assert v.isValid(), f"{n}[{i}] invalido"; sol.append((n, i, v))
comp = cq.Compound.makeCompound([v for _, _, v in sol])
bb = comp.BoundingBox()
print("piezas", len(sol), "| bbox px X %.0f Y %.0f Z %.0f" % (bb.xlen, bb.ylen, bb.zlen))

# ===== EXPORT =====
os.makedirs("out", exist_ok=True)
ens = cq.Assembly(name="choke_manifold")
for n, ws, c in grupos:
    ens.add(cq.Workplane(obj=cq.Compound.makeCompound([w.val() for w in ws])), name=n, color=cq.Color(c))
ens.export("out/choke_manifold.step"); ens.export("out/choke_manifold.glb")
cq.exporters.export(cq.Workplane(obj=comp), "out/choke_manifold.stl", tolerance=0.05, angularTolerance=0.2)
cq.exporters.export(cq.Workplane(obj=comp), "out/planta.svg", opt={"projectionDir": (0, 0, 1), "showHidden": False})
cq.exporters.export(cq.Workplane(obj=comp), "out/iso.svg", opt={"projectionDir": (1, -1, 1), "showHidden": False})
with open("out/bom.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["Grupo", "Cant"])
    for n, ws, c in grupos: w.writerow([n, len(ws)])
print("OK export")
