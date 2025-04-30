# SKÅDIS Panel Generator

This web-based tool generates customizable SKÅDIS-compatible pegboards designed for 3D printing.

> Built with [Three.js](https://threejs.org), [Tailwind CSS](https://tailwindcss.com), and love ❤️

---

## 🧱 What It Does

This project allows you to configure and preview an IKEA SKÅDIS-like board with the correct hole spacing and mounting pattern, export it as an STL file, and print it yourself.

### Features:
- ⚙️ Adjustable board size (`width`, `height`)
- 🔲 Configurable cut grid (`cutX`, `cutY`)
- 🌙 Supports dark mode
- 💾 One-click STL export
- 🧠 Intelligent placement of holes in a staggered SKÅDIS pattern
- 🪚 Automatic clearance handling near panel cuts (optional)

---

## 🖼 Live Demo

🔗 [View the generator](https://idlerus.github.io/skadis-generator/)

---

## 📦 Technologies Used

- [Three.js](https://threejs.org/) – 3D rendering
- [three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) – boolean geometry operations
- [Tailwind CSS](https://tailwindcss.com/) – modern responsive styling
- [STLExporter](https://threejs.org/docs/#examples/en/exporters/STLExporter) – for exporting printable files

---

## 🚀 How to Use

1. Open the [generator page](https://your-username.github.io/your-repo/)
2. Adjust parameters: width, height, number of cuts.
3. Toggle `Avoid cuts` if you want to skip placing holes too close to grid divisions.
4. Click **Generate** to preview the panel.
5. Click **Download STL** to export the 3D model for printing.

---

## 🖨 Print Tips

- Recommended layer height: **0.2 mm**
- Material: **PETG** or **PLA**
- Infill: **30–50%**
- Wall count: **3+**
- Bed size: theoretically none, but going less than ~40x50 is single hole

---

## 📁 Local Development

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run dev
```
Then open on http://localhost:5173

## 📜 License

MIT c 2025 Lukáš Voborský

## 🙌 Acknowledgments

Inspired by IKEA's SKÅDIS system.
This is an open-source community project and not affiliated with IKEA.
