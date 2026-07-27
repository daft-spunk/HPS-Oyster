/* @ds-bundle: {"format":3,"namespace":"HPSOysterDesignSystem_8df477","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"CREST_SRC","sourcePath":"components/core/CrestLogo.jsx"},{"name":"CrestLogo","sourcePath":"components/core/CrestLogo.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"IconChip","sourcePath":"components/core/IconChip.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"HPS_CREST_SRC","sourcePath":"components/core/OysterMark.jsx"},{"name":"OysterMark","sourcePath":"components/core/OysterMark.jsx"},{"name":"Pullquote","sourcePath":"components/core/Pullquote.jsx"},{"name":"Rule","sourcePath":"components/core/Rule.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"35207704fdec","components/core/Badge.jsx":"caa8135204b6","components/core/Button.jsx":"e37017e0f207","components/core/Card.jsx":"1af0822a82aa","components/core/Checkbox.jsx":"e271291a8557","components/core/CrestLogo.jsx":"aab2f2380ba2","components/core/Eyebrow.jsx":"c076ce967d48","components/core/IconChip.jsx":"9843c10a44d0","components/core/Input.jsx":"3b1914d4093c","components/core/OysterMark.jsx":"26f138e34685","components/core/Pullquote.jsx":"d718417d72e0","components/core/Rule.jsx":"4f7a9a9aea0f","components/core/Select.jsx":"49409fec60d2","components/core/Stat.jsx":"4f09c2305948","components/core/Switch.jsx":"80d6bd09c3ed","components/core/Tag.jsx":"263710324671","ui_kits/oyster_site/oyster-interactive.jsx":"9ab2c1677920","ui_kits/oyster_site/oyster-sections.jsx":"3ff576a7064d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HPSOysterDesignSystem_8df477 = window.HPSOysterDesignSystem_8df477 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Avatar — initials or image, circular. Used for members & portraits. */
function Avatar({
  name = "",
  src,
  size = "md",
  tone = "heritage",
  className = "",
  ...rest
}) {
  const sizes = {
    sm: 32,
    md: 44,
    lg: 60,
    xl: 84
  };
  const px = sizes[size] || sizes.md;
  const initials = name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const tones = {
    heritage: ["var(--heritage-100)", "var(--heritage-700)"],
    gold: ["var(--gold-100)", "var(--gold-700)"],
    garnet: ["var(--danger-50)", "var(--garnet-500)"],
    stone: ["var(--stone-200)", "var(--ink-700)"]
  };
  const [bg, fg] = tones[tone] || tones.heritage;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: px,
      height: px,
      borderRadius: "var(--radius-pill)",
      flex: "none",
      overflow: "hidden",
      background: bg,
      color: fg,
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-semibold)",
      fontSize: px * 0.36,
      boxShadow: "0 0 0 2px var(--white), var(--shadow-xs)"
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small label pill (e.g. "Est. 1923", "Founding Campus"). */
function Badge({
  children,
  tone = "heritage",
  solid = false,
  icon,
  className = "",
  ...rest
}) {
  const map = {
    heritage: ["var(--heritage-50)", "var(--heritage-700)", "var(--heritage-600)"],
    gold: ["var(--gold-100)", "var(--gold-700)", "var(--gold-500)"],
    garnet: ["var(--danger-50)", "var(--garnet-500)", "var(--garnet-500)"],
    success: ["var(--success-50)", "var(--success-500)", "var(--success-500)"],
    neutral: ["var(--stone-200)", "var(--ink-700)", "var(--ink-500)"]
  };
  const [soft, fg, strong] = map[tone] || map.heritage;
  const style = solid ? {
    background: strong,
    color: tone === "gold" ? "var(--heritage-900)" : "var(--white)"
  } : {
    background: soft,
    color: fg
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.45em",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-caption)",
      lineHeight: 1,
      padding: "5px 11px",
      letterSpacing: "0.04em",
      borderRadius: "var(--radius-sm)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true",
    style: {
      fontSize: "1.1em"
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.hps-btn{
  --_bg:var(--heritage-600); --_fg:var(--white); --_bd:transparent;
  display:inline-flex; align-items:center; justify-content:center; gap:.6em;
  font-family:var(--font-sans); font-weight:var(--fw-semibold); line-height:1;
  letter-spacing:0.02em; border:var(--border-width-strong) solid var(--_bd);
  background:var(--_bg); color:var(--_fg); border-radius:var(--radius-md);
  cursor:pointer; text-decoration:none; white-space:nowrap;
  transition:background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.hps-btn:focus-visible{ outline:none; box-shadow:var(--focus-ring); }
.hps-btn:active{ transform:translateY(0.5px); }
.hps-btn[disabled]{ opacity:.45; cursor:not-allowed; }
.hps-btn--sm{ font-size:var(--fs-caption); padding:9px 16px; }
.hps-btn--md{ font-size:var(--fs-body-sm); padding:12px 22px; }
.hps-btn--lg{ font-size:var(--fs-body); padding:15px 30px; }
.hps-btn--block{ display:flex; width:100%; }
.hps-btn--heritage{ --_bg:var(--heritage-600); }
.hps-btn--heritage:hover{ --_bg:var(--heritage-700); }
.hps-btn--gold{ --_bg:var(--gold-500); --_fg:var(--heritage-900); }
.hps-btn--gold:hover{ --_bg:var(--gold-600); --_fg:var(--white); }
.hps-btn--outline{ --_bg:transparent; --_fg:var(--heritage-700); --_bd:var(--heritage-300); }
.hps-btn--outline:hover{ --_bg:var(--heritage-50); --_bd:var(--heritage-500); }
.hps-btn--ghost{ --_bg:transparent; --_fg:var(--heritage-700); --_bd:transparent; }
.hps-btn--ghost:hover{ --_bg:var(--heritage-50); }
.hps-btn--onDark{ --_bg:transparent; --_fg:var(--white); --_bd:rgba(255,255,255,0.4); }
.hps-btn--onDark:hover{ --_bg:rgba(255,255,255,0.1); --_bd:var(--gold-400); --_fg:var(--gold-200); }
.hps-btn .ph, .hps-btn [class*="ph-"]{ font-size:1.2em; }
`;

/** HPS Society button. Variants: heritage (navy), gold, outline, ghost, onDark. */
function Button({
  children,
  variant = "heritage",
  size = "md",
  icon,
  iconRight,
  block = false,
  as = "button",
  className = "",
  ...rest
}) {
  useStyleOnce("hps-btn-css", CSS);
  const Tag = as;
  const cls = ["hps-btn", `hps-btn--${variant}`, `hps-btn--${size}`, block ? "hps-btn--block" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true"
  }) : null, children ? /*#__PURE__*/React.createElement("span", null, children) : null, iconRight ? /*#__PURE__*/React.createElement("i", {
    className: iconRight,
    "aria-hidden": "true"
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.hps-card{
  background:var(--surface-card); border-radius:var(--radius-card);
  border:1px solid var(--border-subtle); box-shadow:var(--shadow-xs);
  transition:transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  overflow:hidden;
}
.hps-card--pad{ padding:var(--space-6); }
.hps-card--flush{ box-shadow:var(--shadow-md); border-color:transparent; }
.hps-card--hover:hover{ transform:translateY(-2px); box-shadow:var(--shadow-md); border-color:var(--stone-300); }
.hps-card--gold{ border-top:3px solid var(--gold-500); }
.hps-card--heritage{ background:var(--surface-heritage); color:var(--text-on-heritage); border-color:transparent; }
.hps-card--deep{ background:var(--grad-midnight); color:var(--text-on-dark); border-color:transparent; }
`;

/** Paper surface card — the primary content container. */
function Card({
  children,
  pad = true,
  hover = false,
  tone = "default",
  className = "",
  ...rest
}) {
  useStyleOnce("hps-card-css", CSS);
  const cls = ["hps-card", pad ? "hps-card--pad" : "", hover ? "hps-card--hover" : "", tone === "flush" ? "hps-card--flush" : "", tone === "gold" ? "hps-card--gold" : "", tone === "heritage" ? "hps-card--heritage" : "", tone === "deep" ? "hps-card--deep" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Checkbox with label. Heritage navy fill when checked. */
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  className = "",
  ...rest
}) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const toggle = e => {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body)",
      color: "var(--text-body)",
      opacity: disabled ? 0.55 : 1
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: on,
    onChange: toggle,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 20,
      height: 20,
      borderRadius: "var(--radius-xs)",
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1.5px solid " + (on ? "var(--heritage-600)" : "var(--border-strong)"),
      background: on ? "var(--heritage-600)" : "var(--white)",
      color: "var(--white)",
      fontSize: 13,
      transition: "all var(--dur-fast) var(--ease-out)"
    }
  }, on ? /*#__PURE__*/React.createElement("i", {
    className: "ph ph-check",
    style: {
      fontWeight: 700
    }
  }) : null), label ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/CrestLogo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The official HPS Society crest (live asset). Replace `src` with a locally
   hosted copy for offline use. */
const CREST_SRC = "https://www.hpss.org.in/images/crest.png";

/**
 * Crest lockup: the official crest mark + the Society wordmark in display serif.
 * Variants: "color" (dark text), "onDark" (light text), "crestOnly", "stacked".
 */
function CrestLogo({
  variant = "color",
  layout = "horizontal",
  size = "md",
  src = CREST_SRC,
  showEst = true,
  className = "",
  ...rest
}) {
  const scale = {
    sm: 0.82,
    md: 1,
    lg: 1.4
  }[size] || 1;
  const onDark = variant === "onDark";
  const crestPx = 56 * scale;
  const wordColor = onDark ? "var(--white)" : "var(--heritage-800)";
  const subColor = onDark ? "var(--text-on-dark-mut)" : "var(--text-muted)";
  const stacked = layout === "stacked";
  const Crest = /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "The Hyderabad Public School Society crest",
    style: {
      width: crestPx,
      height: crestPx,
      objectFit: "contain",
      flex: "none",
      display: "block"
    }
  });
  if (variant === "crestOnly") {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: className
    }, rest), Crest);
  }
  const Word = /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: stacked ? "center" : "flex-start",
      lineHeight: 1.04,
      textAlign: stacked ? "center" : "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-semibold)",
      fontSize: 22 * scale,
      letterSpacing: "var(--ls-tight)",
      color: wordColor
    }
  }, "The Hyderabad Public School"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 10.5 * scale,
      marginTop: 5 * scale,
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: subColor
    }
  }, "Society", showEst ? " · Est. 1923" : ""));
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      flexDirection: stacked ? "column" : "row",
      alignItems: "center",
      gap: (stacked ? 12 : 14) * scale,
      ...rest.style
    }
  }, rest), Crest, Word);
}
Object.assign(__ds_scope, { CREST_SRC, CrestLogo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CrestLogo.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Tracked uppercase label that sits above headings — the brand's editorial kicker.
 * Pass `numeral={n}` to render the heraldic "— I —" section marker style.
 */
function Eyebrow({
  children,
  tone = "gold",
  numeral,
  rule = true,
  className = "",
  ...rest
}) {
  const color = {
    gold: "var(--gold-600)",
    heritage: "var(--heritage-600)",
    muted: "var(--text-muted)",
    onDark: "var(--gold-300)"
  }[tone] || "var(--gold-600)";
  if (numeral != null) {
    const r = typeof numeral === "number" ? ROMAN[numeral] || numeral : numeral;
    return /*#__PURE__*/React.createElement("span", _extends({
      className: className,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.7em",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-eyebrow)",
        letterSpacing: "var(--ls-label)",
        color,
        ...rest.style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 1,
        background: "currentColor",
        opacity: 0.7
      }
    }), r, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 1,
        background: "currentColor",
        opacity: 0.7
      }
    }));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75em",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-eyebrow)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      fontWeight: "var(--fw-semibold)",
      color,
      ...rest.style
    }
  }, rest), rule ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 1,
      background: "currentColor",
      opacity: 0.65
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/IconChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular icon medallion — restrained heritage treatment (Phosphor thin/regular). */
function IconChip({
  icon = "ph ph-shield-check",
  tone = "heritage",
  size = "md",
  className = "",
  ...rest
}) {
  const sizes = {
    sm: 38,
    md: 52,
    lg: 68
  };
  const px = sizes[size] || sizes.md;
  const tones = {
    heritage: {
      background: "var(--heritage-50)",
      color: "var(--heritage-600)",
      border: "1px solid var(--heritage-100)"
    },
    gold: {
      background: "var(--gold-100)",
      color: "var(--gold-700)",
      border: "1px solid var(--gold-200)"
    },
    fill: {
      background: "var(--heritage-600)",
      color: "var(--white)",
      border: "none"
    },
    goldFill: {
      background: "var(--gold-500)",
      color: "var(--heritage-900)",
      border: "none"
    },
    glass: {
      background: "rgba(255,255,255,0.10)",
      color: "var(--gold-300)",
      border: "1px solid rgba(255,255,255,0.30)",
      boxShadow: "var(--inset-top)"
    }
  };
  const t = tones[tone] || tones.heritage;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: px,
      height: px,
      borderRadius: "var(--radius-pill)",
      fontSize: px * 0.46,
      flex: "none",
      ...t
    }
  }, rest), /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true"
  }));
}
Object.assign(__ds_scope, { IconChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconChip.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.oy-field{ display:flex; flex-direction:column; gap:7px; font-family:var(--font-sans); }
.oy-field__label{ font-size:var(--fs-body-sm); font-weight:var(--fw-semibold); color:var(--text-strong); }
.oy-field__hint{ font-size:var(--fs-caption); color:var(--text-muted); }
.oy-field__err{ font-size:var(--fs-caption); color:var(--danger-500); }
.oy-input-wrap{ position:relative; display:flex; align-items:center; }
.oy-input-wrap > i{ position:absolute; left:13px; color:var(--text-muted); font-size:18px; pointer-events:none; }
.oy-input{
  width:100%; box-sizing:border-box; font-family:var(--font-sans); font-size:var(--fs-body);
  color:var(--text-strong); background:var(--white); border:1.5px solid var(--border-default);
  border-radius:var(--radius-md); padding:11px 14px; transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.oy-input--icon{ padding-left:40px; }
.oy-input::placeholder{ color:var(--ink-400); }
.oy-input:hover{ border-color:var(--border-strong); }
.oy-input:focus{ outline:none; border-color:var(--heritage-500); box-shadow:var(--focus-ring); }
.oy-input--err{ border-color:var(--danger-500); }
.oy-input:disabled{ background:var(--bg-subtle); color:var(--text-muted); cursor:not-allowed; }
`;

/** Text input with label, optional leading icon, hint and error. */
function Input({
  label,
  hint,
  error,
  icon,
  id,
  className = "",
  ...rest
}) {
  useStyleOnce("oy-input-css", CSS);
  const fid = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    className: "oy-field " + className
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "oy-field__label",
    htmlFor: fid
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "oy-input-wrap"
  }, icon ? /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true"
  }) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: ["oy-input", icon ? "oy-input--icon" : "", error ? "oy-input--err" : ""].filter(Boolean).join(" "),
    "aria-invalid": !!error
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    className: "oy-field__err"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "oy-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/OysterMark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The HPS crest (live asset) — Oyster is an HPS alumni initiative, so the
   program lockup is endorsed by the parent crest. */
const HPS_CREST_SRC = "https://www.hpss.org.in/images/crest.png";

/**
 * HPS Oyster program lockup: the HPS crest + "World is My Oyster" in display
 * serif, with the "Take Your First Dip" / alumni-initiative subline.
 * Variants: "color" (dark text) · "onDark" (light text). Layout: horizontal | stacked.
 */
function OysterMark({
  variant = "color",
  layout = "horizontal",
  size = "md",
  subline = "An HPS Alumni Initiative",
  crest = true,
  src = HPS_CREST_SRC,
  className = "",
  ...rest
}) {
  const scale = {
    sm: 0.82,
    md: 1,
    lg: 1.4
  }[size] || 1;
  const onDark = variant === "onDark";
  const crestPx = 52 * scale;
  const wordColor = onDark ? "var(--white)" : "var(--heritage-800)";
  const oysterColor = onDark ? "var(--gold-300)" : "var(--gold-600)";
  const subColor = onDark ? "var(--text-on-dark-mut)" : "var(--text-muted)";
  const stacked = layout === "stacked";
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      flexDirection: stacked ? "column" : "row",
      alignItems: "center",
      gap: (stacked ? 12 : 14) * scale,
      ...rest.style
    }
  }, rest), crest ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "The Hyderabad Public School crest",
    style: {
      width: crestPx,
      height: crestPx,
      objectFit: "contain",
      flex: "none",
      display: "block"
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: stacked ? "center" : "flex-start",
      lineHeight: 1.04,
      textAlign: stacked ? "center" : "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-semibold)",
      fontSize: 25 * scale,
      letterSpacing: "var(--ls-tight)",
      color: wordColor,
      whiteSpace: "nowrap"
    }
  }, "World is My ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: "italic",
      color: oysterColor
    }
  }, "Oyster")), subline ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 10 * scale,
      marginTop: 5 * scale,
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: subColor
    }
  }, subline) : null));
}
Object.assign(__ds_scope, { HPS_CREST_SRC, OysterMark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/OysterMark.jsx", error: String((e && e.message) || e) }); }

// components/core/Pullquote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Editorial pullquote in display-serif italic — for the vision / motto / mission. */
function Pullquote({
  children,
  cite,
  tone = "default",
  className = "",
  ...rest
}) {
  const onDark = tone === "onDark";
  return /*#__PURE__*/React.createElement("figure", _extends({
    className: className,
    style: {
      margin: 0,
      textAlign: "center",
      maxWidth: "30ch",
      ...rest.style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 64,
      lineHeight: 0.4,
      color: "var(--gold-500)",
      display: "block",
      height: 30
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontWeight: "var(--fw-medium)",
      fontSize: "var(--fs-h2)",
      lineHeight: 1.3,
      letterSpacing: "var(--ls-tight)",
      color: onDark ? "var(--white)" : "var(--heritage-800)"
    }
  }, children), cite ? /*#__PURE__*/React.createElement("figcaption", {
    style: {
      marginTop: 18,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-eyebrow)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: onDark ? "var(--gold-300)" : "var(--gold-600)"
    }
  }, cite) : null);
}
Object.assign(__ds_scope, { Pullquote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Pullquote.jsx", error: String((e && e.message) || e) }); }

// components/core/Rule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Ornamental rule — a centered gold hairline with an optional crest-eagle diamond. */
function Rule({
  tone = "gold",
  ornament = true,
  width = 220,
  className = "",
  ...rest
}) {
  const color = tone === "onDark" ? "var(--gold-400)" : tone === "muted" ? "var(--stone-300)" : "var(--gold-500)";
  const line = /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`
    }
  });
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      width,
      ...rest.style
    }
  }, rest), line, ornament ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 7,
      height: 7,
      transform: "rotate(45deg)",
      background: color,
      flex: "none",
      boxShadow: `0 0 0 3px color-mix(in oklab, ${color} 22%, transparent)`
    }
  }) : null, line);
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Rule.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.oy-select-wrap{ position:relative; display:flex; align-items:center; font-family:var(--font-sans); }
.oy-select-wrap > i.chev{ position:absolute; right:13px; color:var(--text-muted); font-size:18px; pointer-events:none; }
.oy-select{
  appearance:none; -webkit-appearance:none; width:100%; box-sizing:border-box;
  font-family:var(--font-sans); font-size:var(--fs-body); color:var(--text-strong);
  background:var(--white); border:1.5px solid var(--border-default); border-radius:var(--radius-md);
  padding:11px 40px 11px 14px; cursor:pointer; transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.oy-select:hover{ border-color:var(--border-strong); }
.oy-select:focus{ outline:none; border-color:var(--heritage-500); box-shadow:var(--focus-ring); }
.oy-select:disabled{ background:var(--bg-subtle); color:var(--text-muted); cursor:not-allowed; }
`;

/** Styled native select with a Phosphor chevron. */
function Select({
  label,
  hint,
  id,
  children,
  className = "",
  ...rest
}) {
  useStyleOnce("oy-select-css", CSS);
  const fid = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    className: "oy-field " + className,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      fontFamily: "var(--font-sans)"
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "oy-select-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    className: "oy-select"
  }, rest), children), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down chev",
    "aria-hidden": "true"
  })), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-muted)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Display-serif figure with a tracked label — for "Est. 1923", campus counts, etc. */
function Stat({
  value,
  label,
  tone = "heritage",
  align = "left",
  className = "",
  ...rest
}) {
  const color = {
    heritage: "var(--heritage-700)",
    gold: "var(--gold-600)",
    ink: "var(--ink-900)",
    onDark: "var(--white)"
  }[tone] || "var(--heritage-700)";
  const labelColor = tone === "onDark" ? "var(--text-on-dark-mut)" : "var(--text-muted)";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      textAlign: align
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-display-m)",
      lineHeight: 1,
      letterSpacing: "var(--ls-tight)",
      color
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-eyebrow)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: labelColor,
      marginTop: 10
    }
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Toggle switch. Heritage navy track when on. */
function Switch({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  className = "",
  ...rest
}) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const toggle = e => {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body)",
      color: "var(--text-body)",
      opacity: disabled ? 0.55 : 1
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: on,
    onChange: toggle,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 44,
      height: 26,
      borderRadius: "var(--radius-pill)",
      flex: "none",
      position: "relative",
      background: on ? "var(--heritage-600)" : "var(--ink-300)",
      transition: "background var(--dur-base) var(--ease-out)",
      boxShadow: "inset 0 1px 2px rgba(28,34,48,0.18)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: on ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: "var(--radius-pill)",
      background: "var(--white)",
      boxShadow: "var(--shadow-sm)",
      transition: "left var(--dur-base) var(--ease-out)"
    }
  })), label ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Selectable / removable chip (campus or category filter). */
function Tag({
  children,
  icon,
  selected = false,
  onRemove,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.45em",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-medium)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: 1,
      padding: "8px 14px",
      borderRadius: "var(--radius-sm)",
      cursor: rest.onClick ? "pointer" : "default",
      border: "1px solid " + (selected ? "var(--heritage-500)" : "var(--border-default)"),
      background: selected ? "var(--heritage-50)" : "var(--white)",
      color: selected ? "var(--heritage-700)" : "var(--text-body)",
      transition: "all var(--dur-fast) var(--ease-out)"
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("i", {
    className: icon,
    "aria-hidden": "true",
    style: {
      fontSize: "1.1em"
    }
  }) : null, children, onRemove ? /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    "aria-hidden": "true",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    style: {
      fontSize: "1em",
      opacity: 0.6,
      cursor: "pointer",
      marginLeft: 2
    }
  }) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// ui_kits/oyster_site/oyster-interactive.jsx
try { (() => {
/* HPS Oyster site — interactive parts (heritage-styled): CTA, FAQ accordion,
   interest modal, join toast, and the composing App. */

const {
  Button,
  Eyebrow,
  Tag,
  Input,
  Select,
  Checkbox,
  IconChip,
  Pullquote,
  Rule
} = window.HPSOysterDesignSystem_8df477;
function CTA({
  onInterest
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bg-subtle)",
      padding: "var(--section-pad-y) 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-md)",
      margin: "0 auto",
      background: "var(--grad-midnight)",
      borderRadius: "var(--radius-lg)",
      padding: "60px 40px",
      textAlign: "center",
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "onDark"
  }, "Join Us On This Adventure"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "26px 0"
    }
  }, /*#__PURE__*/React.createElement(Pullquote, {
    tone: "onDark",
    cite: "Take Your First Dip"
  }, "More than an internship \u2014 your chance to begin shaping your future.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: 1.7,
      color: "var(--text-on-dark-mut)",
      maxWidth: "52ch",
      margin: "0 auto 30px"
    }
  }, "Follow a day in the life of a mentor in your field of interest and see firsthand what your future career could look like."), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "lg",
    onClick: onInterest
  }, "Express Your Interest")));
}
const FAQS = [{
  q: "What is the purpose of the programme?",
  a: "To give students exposure to both futuristic and conventional career options through real, hands-on time with a professional — helping them make informed decisions about their academic and career paths."
}, {
  q: "Who is eligible to participate?",
  a: "Students from classes 9–12 at The Hyderabad Public School are eligible to participate."
}, {
  q: "How is the programme structured?",
  a: "Students shadow alumni at their workplace for a day — walking, talking and working alongside an industry professional from morning to evening to gain hands-on exposure."
}, {
  q: "What types of careers are covered?",
  a: "A wide range of futuristic career options alongside conventional paths, for a holistic understanding of different industries."
}, {
  q: "How are students assigned to internships?",
  a: "Students express interest in their top three preferred companies. The programme team matches students based on preferences and host-company availability."
}, {
  q: "How long is each internship?",
  a: "Each internship is a one-day shadowing experience — a focused look at a specific industry."
}, {
  q: "Will I receive a certificate?",
  a: "Yes — students who complete the programme receive a certificate of participation."
}];
function FAQItem({
  item,
  open,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "22px 4px",
      background: "none",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-h3)",
      color: "var(--heritage-800)"
    }
  }, item.q, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-plus",
    style: {
      fontSize: 18,
      color: "var(--gold-600)",
      flex: "none",
      transform: open ? "rotate(45deg)" : "none",
      transition: "transform var(--dur-base) var(--ease-out)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: open ? 240 : 0,
      overflow: "hidden",
      transition: "max-height var(--dur-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 4px 24px",
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: 1.7,
      color: "var(--text-body)",
      maxWidth: "70ch"
    }
  }, item.a)));
}
function FAQ() {
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    style: {
      background: "var(--bg-page)",
      padding: "var(--section-pad-y) 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-md)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Rule, {
    width: 140
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-display-m)",
      color: "var(--heritage-800)",
      margin: 0,
      letterSpacing: "var(--ls-tight)"
    }
  }, "Frequently Asked Questions")), /*#__PURE__*/React.createElement("div", null, FAQS.map((f, i) => /*#__PURE__*/React.createElement(FAQItem, {
    key: i,
    item: f,
    open: open === i,
    onToggle: () => setOpen(open === i ? -1 : i)
  })))));
}
const PICK = ["Startups", "Renewable Energy", "Food", "Aerospace", "Engineering", "Manufacturing", "Marketing", "Pharmaceuticals", "Accounting"];
function InterestModal({
  onClose
}) {
  const [picks, setPicks] = React.useState(["Aerospace", "Engineering"]);
  const [done, setDone] = React.useState(false);
  const toggle = p => setPicks(cur => cur.includes(p) ? cur.filter(x => x !== p) : cur.length < 3 ? [...cur, p] : cur);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1100,
      background: "rgba(12,19,31,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "min(560px, 100%)",
      maxHeight: "90vh",
      overflow: "auto",
      background: "var(--white)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xl)",
      borderTop: "3px solid var(--gold-500)",
      padding: 34
    }
  }, done ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "16px 8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    icon: "ph ph-check",
    tone: "gold",
    size: "lg"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-h1)",
      color: "var(--heritage-800)",
      margin: "16px 0 8px"
    }
  }, "You're on the list."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body-lg)",
      color: "var(--text-body)",
      margin: "0 0 26px"
    }
  }, "We'll match you with a host company and be in touch. Time to take your first dip."), /*#__PURE__*/React.createElement(Button, {
    variant: "heritage",
    onClick: onClose
  }, "Done")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Express Interest"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-h1)",
      color: "var(--heritage-800)",
      margin: "10px 0 0"
    }
  }, "Choose your top three streams")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 24,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x"
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--gold-600)",
      margin: "8px 0 16px"
    }
  }, picks.length, " of 3 selected"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 9,
      marginBottom: 26
    }
  }, PICK.map(p => /*#__PURE__*/React.createElement(Tag, {
    key: p,
    selected: picks.includes(p),
    onClick: () => toggle(p)
  }, p))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    placeholder: "Aarav Reddy",
    icon: "ph ph-user"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Grade"
  }, /*#__PURE__*/React.createElement("option", null, "Grade 9"), /*#__PURE__*/React.createElement("option", null, "Grade 10"), /*#__PURE__*/React.createElement("option", null, "Grade 11"), /*#__PURE__*/React.createElement("option", null, "Grade 12"))), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "you@hps.edu",
    icon: "ph ph-envelope-simple"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "18px 0 26px"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "I agree to the programme guidelines",
    defaultChecked: true
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "lg",
    block: true,
    onClick: () => picks.length && setDone(true)
  }, "Submit Interest"))));
}
function Toast({
  msg,
  onDone
}) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1200,
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "var(--heritage-900)",
      color: "var(--white)",
      padding: "13px 20px",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-xl)",
      border: "1px solid var(--heritage-700)",
      fontFamily: "var(--font-sans)",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-whatsapp-logo",
    style: {
      color: "var(--gold-300)",
      fontSize: 18
    }
  }), msg);
}
function App() {
  const {
    Masthead,
    Hero,
    Programme,
    Highlights,
    Streams,
    Why,
    Footer
  } = window.OySite;
  const [modal, setModal] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    id: "oy-scroll",
    style: {
      height: "100vh",
      overflowY: "auto",
      background: "var(--bg-page)"
    }
  }, /*#__PURE__*/React.createElement(Masthead, {
    onJoin: () => setToast(true)
  }), /*#__PURE__*/React.createElement(Hero, {
    onJoin: () => setToast(true),
    onInterest: () => setModal(true)
  }), /*#__PURE__*/React.createElement(Programme, null), /*#__PURE__*/React.createElement(Highlights, null), /*#__PURE__*/React.createElement(Streams, null), /*#__PURE__*/React.createElement(Why, null), /*#__PURE__*/React.createElement(CTA, {
    onInterest: () => setModal(true)
  }), /*#__PURE__*/React.createElement(FAQ, null), /*#__PURE__*/React.createElement(Footer, null), modal ? /*#__PURE__*/React.createElement(InterestModal, {
    onClose: () => setModal(false)
  }) : null, toast ? /*#__PURE__*/React.createElement(Toast, {
    msg: "Opening the Oyster WhatsApp community\u2026",
    onDone: () => setToast(false)
  }) : null);
}
window.OyApp = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/oyster_site/oyster-interactive.jsx", error: String((e && e.message) || e) }); }

// ui_kits/oyster_site/oyster-sections.jsx
try { (() => {
/* HPS Oyster — "World is My Oyster" / Take Your First Dip — marketing site,
   dressed in the inherited HPS Society heritage visual language
   (navy + gold + parchment, classical serif, roman numerals, gold rules).
   Composed from the design-system primitives. */

const {
  Button,
  Card,
  Eyebrow,
  Stat,
  Rule,
  Pullquote,
  IconChip,
  Badge
} = window.HPSOysterDesignSystem_8df477;
const CREST = "https://www.hpss.org.in/images/crest.png";

/* Local programme lockup (mirrors the OysterMark component; defined inline so
   the kit renders without depending on a just-added bundle export). */
function OysterMark({
  variant = "color",
  layout = "horizontal",
  size = "md",
  subline = "An HPS Alumni Initiative"
}) {
  const scale = {
    sm: 0.82,
    md: 1,
    lg: 1.4
  }[size] || 1;
  const onDark = variant === "onDark";
  const stacked = layout === "stacked";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: stacked ? "column" : "row",
      alignItems: "center",
      gap: (stacked ? 12 : 14) * scale
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: CREST,
    alt: "HPS crest",
    style: {
      width: 52 * scale,
      height: 52 * scale,
      objectFit: "contain",
      flex: "none",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: stacked ? "center" : "flex-start",
      lineHeight: 1.04,
      textAlign: stacked ? "center" : "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 25 * scale,
      letterSpacing: "var(--ls-tight)",
      color: onDark ? "var(--white)" : "var(--heritage-800)",
      whiteSpace: "nowrap"
    }
  }, "World is My ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: "italic",
      color: onDark ? "var(--gold-300)" : "var(--gold-600)"
    }
  }, "Oyster")), subline ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 10 * scale,
      marginTop: 5 * scale,
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: onDark ? "var(--text-on-dark-mut)" : "var(--text-muted)"
    }
  }, subline) : null));
}

/* ---------------- Masthead ---------------- */
function Masthead({
  onJoin
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const sc = document.querySelector("#oy-scroll");
    const fn = () => setScrolled((sc?.scrollTop || 0) > 12);
    sc?.addEventListener("scroll", fn);
    return () => sc?.removeEventListener("scroll", fn);
  }, []);
  const link = {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-body)",
    textDecoration: "none"
  };
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: scrolled ? "rgba(250,247,240,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      borderBottom: "1px solid " + (scrolled ? "var(--border-subtle)" : "transparent"),
      transition: "all var(--dur-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-lg)",
      margin: "0 auto",
      padding: "13px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(OysterMark, {
    size: "sm"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#programme",
    style: link
  }, "The Programme"), /*#__PURE__*/React.createElement("a", {
    href: "#streams",
    style: link
  }, "Streams"), /*#__PURE__*/React.createElement("a", {
    href: "#faq",
    style: link
  }, "FAQ"), /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "sm",
    onClick: onJoin
  }, "Join the Community"))));
}

/* ---------------- Hero ---------------- */
function Hero({
  onJoin,
  onInterest
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      background: "var(--grad-midnight)",
      color: "var(--text-on-dark)",
      padding: "64px 28px 84px",
      textAlign: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 860,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: CREST,
    alt: "HPS crest",
    style: {
      width: 84,
      height: 84,
      objectFit: "contain",
      margin: "0 auto 22px",
      display: "block",
      filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.4))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: "var(--gold-300)",
      marginBottom: 22
    }
  }, "An HPS Alumni Initiative"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "clamp(46px, 7vw, 86px)",
      lineHeight: 1.02,
      letterSpacing: "var(--ls-tight)",
      color: "var(--white)",
      margin: 0
    }
  }, "Take Your ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: "italic",
      color: "var(--gold-300)"
    }
  }, "First Dip")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontWeight: 500,
      fontSize: "clamp(20px, 2.6vw, 28px)",
      color: "var(--gold-300)",
      margin: "14px 0 0"
    }
  }, "\u2014 Shadow. Discover. Connect. \u2014"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: 1.7,
      color: "var(--text-on-dark-mut)",
      maxWidth: "56ch",
      margin: "22px auto 0"
    }
  }, "Ever wondered what it's like to walk in the shoes of a professional in your dream career? A one-day internship by HPS alumni \u2014 shadow a mentor and observe how an industry truly works."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      margin: "28px 0 30px"
    }
  }, /*#__PURE__*/React.createElement(Rule, {
    tone: "onDark",
    width: 190
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "gold",
    size: "lg",
    onClick: onInterest
  }, "Express Your Interest"), /*#__PURE__*/React.createElement(Button, {
    variant: "onDark",
    size: "lg",
    iconRight: "ph ph-arrow-right",
    onClick: onJoin
  }, "Join WhatsApp Community"))));
}

/* ---------------- I · The Programme (pillars) ---------------- */
const PILLARS = [{
  icon: "ph ph-handshake",
  title: "Industry Dive",
  body: "Spend an entire day with an industry professional — observing their routines, tasks, and the challenges they tackle. A front-row seat to the real-world action."
}, {
  icon: "ph ph-magnifying-glass",
  title: "Guidance Spectrum",
  body: "Startups, renewable energy, engineering, pharmaceuticals and more — mentors from a spectrum of fields, ready to guide you."
}, {
  icon: "ph ph-lightbulb",
  title: "Engaged Learning",
  body: "This isn't merely watching. Ask questions, join the discussions, and gain insights that only come from real-life experience."
}];
function Programme() {
  return /*#__PURE__*/React.createElement("section", {
    id: "programme",
    style: {
      background: "var(--bg-page)",
      padding: "var(--section-pad-y) 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-lg)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    numeral: 1
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-display-m)",
      color: "var(--heritage-800)",
      margin: "0 0 8px",
      letterSpacing: "var(--ls-tight)"
    }
  }, "What's In Store"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "var(--fs-h3)",
      color: "var(--gold-600)",
      margin: 0
    }
  }, "Three ways to dive in.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 24
    }
  }, PILLARS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    tone: "gold",
    hover: true
  }, /*#__PURE__*/React.createElement(IconChip, {
    icon: p.icon,
    tone: "gold",
    size: "lg"
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-h2)",
      color: "var(--heritage-800)",
      margin: "18px 0 8px"
    }
  }, p.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body)",
      lineHeight: 1.62,
      color: "var(--text-body)",
      margin: 0
    }
  }, p.body))))));
}

/* ---------------- Highlights (2024) ---------------- */
function Highlights() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--grad-midnight)",
      color: "var(--text-on-dark)",
      padding: "var(--section-pad-y) 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-md)",
      margin: "0 auto",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "onDark"
  }, "2024 \xB7 Inaugural Year")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-h1)",
      color: "var(--white)",
      margin: "0 0 16px",
      letterSpacing: "var(--ls-tight)"
    }
  }, "Our first year, in numbers"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body-lg)",
      lineHeight: 1.7,
      color: "var(--text-on-dark-mut)",
      maxWidth: "54ch",
      margin: "0 auto 44px"
    }
  }, "HPS Grade 9 & 10 Eagles shadowed alumni inside real workplaces \u2014 from kitchens to cockpits, clinics to coding floors \u2014 sparking bigger dreams in just one day."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 56,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "120",
    label: "Internships",
    tone: "onDark",
    align: "center"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "110",
    label: "Students",
    tone: "onDark",
    align: "center"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "25",
    label: "Host Companies",
    tone: "onDark",
    align: "center"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "11",
    label: "Career Streams",
    tone: "onDark",
    align: "center"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "onDark",
    iconRight: "ph ph-arrow-up-right"
  }, "View First Year Report"))));
}

/* ---------------- II · A Day in the Life (streams) ---------------- */
const STREAMS = [{
  icon: "ph ph-rocket-launch",
  name: "Startups",
  body: "Immerse yourself in innovation and entrepreneurship."
}, {
  icon: "ph ph-solar-panel",
  name: "Renewable Energy",
  body: "Discover the power of green technology and sustainability."
}, {
  icon: "ph ph-fork-knife",
  name: "Food Industry",
  body: "Taste the journey from farm to fork."
}, {
  icon: "ph ph-airplane-tilt",
  name: "Aerospace",
  body: "Soar high learning what it takes to explore the skies."
}, {
  icon: "ph ph-cpu",
  name: "Engineering",
  body: "Solve real-world problems with cutting-edge solutions."
}, {
  icon: "ph ph-warehouse",
  name: "Manufacturing",
  body: "See how products are brought to life, concept to market."
}, {
  icon: "ph ph-monitor",
  name: "Marketing",
  body: "Tell compelling brand stories with creativity."
}, {
  icon: "ph ph-first-aid-kit",
  name: "Pharmaceuticals",
  body: "Contribute to health through medicine and research."
}, {
  icon: "ph ph-chart-pie-slice",
  name: "Accounting",
  body: "Financial insight and guidance from a leading firm."
}];
function Streams() {
  return /*#__PURE__*/React.createElement("section", {
    id: "streams",
    style: {
      background: "var(--bg-subtle)",
      padding: "var(--section-pad-y) 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-lg)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    numeral: 2
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-display-m)",
      color: "var(--heritage-800)",
      margin: "0 0 8px",
      letterSpacing: "var(--ls-tight)"
    }
  }, "A Day in the Life"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "var(--fs-h3)",
      color: "var(--gold-600)",
      margin: 0
    }
  }, "Spend it with a professional in your field.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 18
    }
  }, STREAMS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    style: {
      display: "flex",
      gap: 16,
      padding: "20px 22px",
      background: "var(--white)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    icon: s.icon,
    tone: "heritage",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 19,
      color: "var(--heritage-800)"
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: 14.5,
      lineHeight: 1.5,
      color: "var(--text-muted)",
      marginTop: 3
    }
  }, s.body)))))));
}

/* ---------------- III · Why Embark ---------------- */
const WHY = [{
  icon: "ph ph-book-open-text",
  title: "Real-World Experience",
  body: "An authentic glimpse into a professional environment, beyond textbooks and theories."
}, {
  icon: "ph ph-medal",
  title: "Mentorship",
  body: "Connect with HPS alumni and industry professionals eager to share their knowledge."
}, {
  icon: "ph ph-compass",
  title: "Career Clarity",
  body: "Discover firsthand what excites you and where your passion lies."
}];
function Why() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bg-page)",
      padding: "var(--section-pad-y) 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-lg)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    numeral: 3
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-display-m)",
      color: "var(--heritage-800)",
      margin: 0,
      letterSpacing: "var(--ls-tight)"
    }
  }, "Why Embark on This Journey?")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 24
    }
  }, WHY.map(w => /*#__PURE__*/React.createElement(Card, {
    key: w.title,
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    icon: w.icon,
    tone: "gold",
    size: "lg"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--fs-h3)",
      color: "var(--heritage-800)",
      margin: "16px 0 8px"
    }
  }, w.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--fs-body)",
      lineHeight: 1.6,
      color: "var(--text-body)",
      margin: 0
    }
  }, w.body))))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--heritage-950)",
      color: "var(--text-on-dark-mut)",
      padding: "52px 28px 36px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-lg)",
      margin: "0 auto",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(OysterMark, {
    variant: "onDark",
    layout: "stacked",
    size: "md",
    subline: "A Hyderabad Public School Alumni Initiative"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      margin: "0 0 22px"
    }
  }, /*#__PURE__*/React.createElement(Rule, {
    tone: "onDark",
    width: 150
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 11,
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase",
      color: "var(--gold-300)",
      marginBottom: 18
    }
  }, "Soar \xB7 Lead \xB7 Serve"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      opacity: 0.7
    }
  }, "\xA9 2026 \xB7 HPS Oyster")));
}
window.OySite = {
  Masthead,
  Hero,
  Programme,
  Highlights,
  Streams,
  Why,
  Footer
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/oyster_site/oyster-sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.CREST_SRC = __ds_scope.CREST_SRC;

__ds_ns.CrestLogo = __ds_scope.CrestLogo;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.IconChip = __ds_scope.IconChip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.HPS_CREST_SRC = __ds_scope.HPS_CREST_SRC;

__ds_ns.OysterMark = __ds_scope.OysterMark;

__ds_ns.Pullquote = __ds_scope.Pullquote;

__ds_ns.Rule = __ds_scope.Rule;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tag = __ds_scope.Tag;

})();
