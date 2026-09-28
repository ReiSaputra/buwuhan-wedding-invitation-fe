import { useState } from "react";
import { Eye, ArrowRight } from "lucide-react";
import type { TemplateSlug } from "@/templates/template-registry";

interface TemplateItem {
  slug: TemplateSlug;
  name: string;
  category: "wedding" | "traditional" | "modern" | "syukuran";
  categoryLabel: string;
  description: string;
  image: string;
  palette: string[];
}

interface LandingTemplatesProps {
  onSelectTemplateDemo: (slug: TemplateSlug) => void;
}

export function LandingTemplates({ onSelectTemplateDemo }: LandingTemplatesProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const templates: TemplateItem[] = [
    {
      slug: "royal-floral",
      name: "Royal Floral",
      category: "wedding",
      categoryLabel: "Pernikahan Elegan",
      description: "Nuansa krem hangat dengan sentuhan emas dan daun sage yang anggun.",
      image: "/images/hero_wedding_couple.jpg",
      palette: ["#FAF7F2", "#526B5D", "#C59B27", "#1F2937"],
    },
    {
      slug: "javanese-classic",
      name: "Javanese Classic",
      category: "traditional",
      categoryLabel: "Adat & Tradisional",
      description: "Nuansa gelap dengan aksen emas yang cocok untuk pernikahan adat Jawa.",
      image: "/images/theme_classic.jpg",
      palette: ["#0F172A", "#C59B27", "#E0C264", "#FFFFFF"],
    },
    {
      slug: "modern-minimalist",
      name: "Modern Minimalist",
      category: "modern",
      categoryLabel: "Modern & Minimalis",
      description: "Gaya clean serba putih dan monokrom dengan tipografi berspasi lebar.",
      image: "/images/theme_modern.jpg",
      palette: ["#FFFFFF", "#0F172A", "#64748B", "#F1F5F9"],
    },
    {
      slug: "khitanan-ceria-blue",
      name: "Khitanan Ceria Blue",
      category: "syukuran",
      categoryLabel: "Syukuran & Acara",
      description: "Tema biru cerah yang ramah anak untuk tasyakuran khitanan.",
      image: "/images/hero_wedding_couple.jpg",
      palette: ["#EFF6FF", "#0284C7", "#38BDF8", "#1E3A8A"],
    },
    {
      slug: "rasulan-syukuran-gold",
      name: "Rasulan Syukuran Gold",
      category: "syukuran",
      categoryLabel: "Syukuran & Acara",
      description: "Warna cokelat keemasan hangat untuk syukuran nikah dan tasyakuran keluarga.",
      image: "/images/theme_classic.jpg",
      palette: ["#FFFBEB", "#B45309", "#78350F", "#451A03"],
    },
    {
      slug: "aqiqah-lembut-mint",
      name: "Aqiqah Lembut Mint",
      category: "syukuran",
      categoryLabel: "Syukuran & Acara",
      description: "Warna hijau mint lembut dan putih bersih untuk tasyakuran kelahiran buah hati.",
      image: "/images/theme_modern.jpg",
      palette: ["#ECFDF5", "#059669", "#34D399", "#064E3B"],
    },
  ];

  const filteredTemplates =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const categories = [
    { id: "all", label: "Semua Tema" },
    { id: "wedding", label: "Pernikahan Elegan" },
    { id: "traditional", label: "Adat Tradisional" },
    { id: "modern", label: "Modern Minimalis" },
    { id: "syukuran", label: "Khitanan & Syukuran" },
  ];

  return (
    <section id="template" className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-2">
              Pilihan Tema Desain
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl">
              Tiap tema sudah disesuaikan agar responsif di HP dan laptop. Foto, teks, musik, dan form kehadiran bisa Anda atur sendiri.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.slug}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-16/10 overflow-hidden bg-slate-100 group">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Color Palette Dots */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-xs p-1 rounded-full">
                  {template.palette.map((color, cIdx) => (
                    <span
                      key={cIdx}
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onSelectTemplateDemo(template.slug)}
                    className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Contoh Undangan</span>
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-primary mb-1">
                    {template.categoryLabel}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1.5">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Action Link */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Siap pakai</span>
                  <button
                    type="button"
                    onClick={() => onSelectTemplateDemo(template.slug)}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Coba Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
