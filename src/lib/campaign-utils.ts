export function renderCampaignContent(content: string): string {
    if (!content) return "";

    // 1. Handle newlines (convert \n to <br />)
    let rendered = content.replace(/\n/g, "<br />");

    // 2. Handle CTA tags: <cta text="..." link="...">
    // We'll use a regex to find and replace them with styled anchor tags
    const ctaRegex = /<cta\s+text="([^"]+)"\s+link="([^"]+)"\s*>/g;

    rendered = rendered.replace(ctaRegex, (match, text, link) => {
        return `
            <a href="${link}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0;">
                ${text}
            </a>
        `;
    });

    return rendered;
}
