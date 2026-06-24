import { MapPin, MessageCircle, Phone } from "lucide-react";

export default function QuickActions({ shop }) {
  const actions = [
    {
      show: Boolean(shop?.phone),
      href: `tel:${shop?.phone}`,
      title: "Gọi quán",
      desc: shop?.phone,
      icon: Phone,
    },
    {
      show: Boolean(shop?.googleMapUrl),
      href: shop?.googleMapUrl,
      title: "Chỉ đường",
      desc: "Google Maps",
      icon: MapPin,
    },
    {
      show: Boolean(shop?.zaloUrl),
      href: shop?.zaloUrl,
      title: "Nhắn Zalo",
      desc: "Tư vấn nhanh",
      icon: MessageCircle,
    },
  ].filter((item) => item.show);

  if (actions.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
      <div className="grid gap-2 rounded-[26px] border border-[#dbe0ad] bg-white/92 p-2 shadow-[0_20px_60px_rgba(41,79,49,0.10)] backdrop-blur-xl sm:grid-cols-3 sm:p-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.title}
              href={action.href}
              target={action.href?.startsWith("http") ? "_blank" : undefined}
              rel={action.href?.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-3 rounded-[22px] bg-[#f7f8ec] p-3 transition hover:bg-[#e7eac3]"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#294f31] text-white shadow-sm">
                <Icon size={20} className="text-white" />
              </div>

              <div className="min-w-0">
                <p className="font-black text-[#294f31]">{action.title}</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-[#647343]">
                  {action.desc}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
