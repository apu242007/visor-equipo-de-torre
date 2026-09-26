/*
 * 60-ui-controls.js — ajustes de interfaz del visor V2.
 *  1. Elimina el cartel de modo inferior (#v2-hud: "EXPLORAR · Inspección libre…").
 *  2. Botón "Ocultar opciones" / "Mostrar opciones" en la cabecera: oculta las barras de botones
 *     (Vista, Despiece, Etiquetas, Zonas de riesgo, Reset, la fila Inspección y la barra de modos) para dejar la escena libre.
 *  3. La card "Referencia del conjunto" (#cad-inspector) se oculta deslizándose hacia la derecha con su propia
 *     pestaña (chevron), sin depender de "Ocultar opciones".
 * No toca el estado del visor: solo CSS + botones. Sin persistencia (el iframe corre en origen opaco).
 */
window.__rigExt.onPost(() => {
  const style = document.createElement('style')
  style.id = 'ui-controls-style'
  style.textContent = `
    #v2-hud{display:none!important}
    body.opts-hidden header .group,
    body.opts-hidden #cadbar,
    body.opts-hidden #v2-modebar{display:none!important}
    #cad-inspector{transition:transform .3s cubic-bezier(.16,1,.3,1)}
    #cad-inspector.collapsed{transform:translateX(calc(100% + 14px))}
    #cad-inspector.collapsed > :not(#inspector-toggle){visibility:hidden;transition:visibility 0s .3s}
    #inspector-toggle{position:absolute;left:-38px;top:0;width:30px;height:30px;display:grid;place-items:center;
      padding:0;border-radius:8px;background:rgba(20,27,38,.95);border:1px solid #303B4B;color:#DDBB65;cursor:pointer}
    #inspector-toggle:hover{background:rgba(40,52,70,.98)}
    #inspector-toggle:focus-visible{outline:none;box-shadow:0 0 0 2px #05060A,0 0 0 4px rgba(139,92,246,.7)}
    #inspector-toggle svg{width:15px;height:15px;transition:transform .3s}
    #cad-inspector.collapsed #inspector-toggle svg{transform:rotate(180deg)}
    #opts-toggle{margin-left:auto;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 11px;
      border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);
      color:inherit;font:inherit;font-size:13px;cursor:pointer;flex:none}
    #opts-toggle:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}
    #opts-toggle:focus-visible{outline:none;box-shadow:0 0 0 2px #05060A,0 0 0 4px rgba(139,92,246,.7)}
    #opts-toggle svg{width:15px;height:15px;flex:none;transition:transform .2s}
    body.opts-hidden #opts-toggle svg{transform:rotate(180deg)}
  `
  document.head.appendChild(style)

  const card = document.getElementById('cad-inspector')
  if (card) {
    const tab = document.createElement('button')
    tab.id = 'inspector-toggle'
    tab.type = 'button'
    tab.setAttribute('aria-controls', 'cad-inspector')
    tab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
    const setCollapsed = (collapsed) => {
      card.classList.toggle('collapsed', collapsed)
      tab.setAttribute('aria-expanded', String(!collapsed))
      const name = collapsed ? 'Mostrar referencia del conjunto' : 'Ocultar referencia del conjunto'
      tab.setAttribute('aria-label', name)
      tab.title = name
    }
    tab.addEventListener('click', () => setCollapsed(!card.classList.contains('collapsed')))
    card.appendChild(tab)
    setCollapsed(false)
  }

  const header = document.querySelector('header')
  if (!header) return

  const btn = document.createElement('button')
  btn.id = 'opts-toggle'
  btn.type = 'button'
  btn.setAttribute('aria-controls', 'cadbar')
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg><span></span>'
  const label = btn.querySelector('span')

  const apply = (hidden) => {
    document.body.classList.toggle('opts-hidden', hidden)
    btn.setAttribute('aria-expanded', String(!hidden))
    label.textContent = hidden ? 'Mostrar opciones' : 'Ocultar opciones'
    // El escenario cambia de alto: el visor recalcula el tamaño del canvas con 'resize'.
    window.dispatchEvent(new Event('resize'))
  }
  btn.addEventListener('click', () => apply(!document.body.classList.contains('opts-hidden')))
  header.appendChild(btn)
  apply(false)
})
