import { useEffect } from "react";

export function Seo({
  title,
  description,
  robots,
}: {
  title: string;
  description?: string;
  robots?: string;
}) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const tag = document.querySelector('meta[name="description"]');
      tag?.setAttribute("content", description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle?.setAttribute("content", title);
    if (robots) {
      let tag = document.querySelector('meta[name="robots"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "robots");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", robots);
    }
  }, [title, description, robots]);
  return null;
}
