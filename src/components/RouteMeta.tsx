import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

/**
 * P2-23: per-route <title>, description and robots. Pages can still render
 * their own <Helmet> (e.g. ExperienceDetail); the deeper one wins.
 */
const SITE = "Endebeto";
const DEFAULT_DESCRIPTION =
  "Book authentic Ethiopian experiences hosted by locals — coffee ceremonies, food, culture and more.";

type Meta = { title: string; description?: string; noindex?: boolean };

const RULES: Array<[RegExp, Meta]> = [
  [/^\/$/, { title: `${SITE} — Authentic Ethiopian Experiences` }],
  [/^\/experiences\/?$/, { title: `Experiences · ${SITE}`, description: "Browse local experiences across Ethiopia." }],
  [/^\/experiences\/[^/]+/, { title: `Experience · ${SITE}` }],
  [/^\/become-host/, { title: `Become a host · ${SITE}`, description: "Share your culture and earn by hosting experiences on Endebeto." }],
  [/^\/about/, { title: `About · ${SITE}` }],
  [/^\/safety/, { title: `Safety · ${SITE}` }],
  [/^\/terms/, { title: `Terms · ${SITE}` }],
  [/^\/privacy/, { title: `Privacy · ${SITE}` }],
  [/^\/login/, { title: `Log in · ${SITE}`, noindex: true }],
  [/^\/signup/, { title: `Sign up · ${SITE}`, noindex: true }],
  [/^\/(forgot-password|reset-password|verify-email|oauth-success)/, { title: SITE, noindex: true }],
  [/^\/my-bookings/, { title: `My bookings · ${SITE}`, noindex: true }],
  [/^\/profile/, { title: `Profile · ${SITE}`, noindex: true }],
  [/^\/(host|host-dashboard)(\/|$)/, { title: `Host · ${SITE}`, noindex: true }],
  [/^\/admin/, { title: `Admin · ${SITE}`, noindex: true }],
];

export function metaForPath(pathname: string): Meta {
  const hit = RULES.find(([re]) => re.test(pathname));
  return hit ? hit[1] : { title: SITE, noindex: true };
}

export function RouteMeta() {
  const { pathname } = useLocation();
  const meta = metaForPath(pathname);
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description ?? DEFAULT_DESCRIPTION} />
      {meta.noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
