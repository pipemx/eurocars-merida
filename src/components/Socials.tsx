import { site } from "@/content/site";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./icons";
import { TrackedLink } from "./TrackedLink";

const items = [
  { label: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: site.social.facebook, Icon: FacebookIcon },
  { label: "TikTok", href: site.social.tiktok, Icon: TiktokIcon },
];

export function Socials({ location, className = "" }: { location: string; className?: string }) {
  return (
    <ul className={`flex items-center gap-6 ${className}`} aria-label="Redes sociales">
      {items.map(({ label, href, Icon }) => (
        <li key={label}>
          <TrackedLink
            href={href}
            event="social_click"
            eventParams={{ network: label, location }}
            aria-label={label}
            className="block text-bone/90 transition-colors hover:text-champagne"
          >
            <Icon className="h-[18px] w-[18px]" />
          </TrackedLink>
        </li>
      ))}
    </ul>
  );
}
