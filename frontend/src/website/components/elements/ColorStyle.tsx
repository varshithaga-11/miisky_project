import { useState, useEffect } from "react";
import { FaPalette } from "react-icons/fa";

const COLOR_OPTIONS = [
  { name: "default", hex: "#F3A952" }, // blue
  { name: "pink", hex: "#FFC0CB" },
  { name: "violet", hex: "#7F00FF" },
  { name: "crimson", hex: "#DC143C" },
  { name: "orange", hex: "#00FF00" },
];

export default function SwitcherMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string>("default");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) {
      setActiveColor(saved);
      applyColor(saved);
    }
  }, []);

  const applyColor = (color: string) => {
    let linkEl = document.getElementById("theme-color") as HTMLLinkElement;

    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.id = "theme-color";
      document.head.appendChild(linkEl);
    }

    linkEl.href =
      color === "default" ? "" : `/assets/css/color/${color}.css`;

    setActiveColor(color);
    localStorage.setItem("themeColor", color);
  };

  return (
    <div className="color-style-plate p_relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="color-toggle-btn"
      >
        <FaPalette size={20} />
      </button>

      {/* Color plate */}
      {isOpen && (
        <div className="color-plate-box">
          <p className="">Choose Color</p>
          <div className="color-list">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.name}
                onClick={() => applyColor(c.name)}
                className={` ${
                  activeColor === c.name
                    ? "ring-2 ring-black"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
