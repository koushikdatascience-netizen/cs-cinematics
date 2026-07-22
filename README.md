# CS Cinematics Static Site

This is a static one-page CS Cinematics site. It uses plain HTML, CSS and vanilla JavaScript, so it can be deployed directly to Cloudflare Pages free tier with no build command.

## Cloudinary media

Open `script.js` and replace the empty values in `CLOUDINARY_ASSETS`:

```js
const CLOUDINARY_ASSETS = {
  hero: "https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/path/hero.jpg",
  showreel: "https://res.cloudinary.com/YOUR_CLOUD/video/upload/f_auto,q_auto/path/showreel.mp4",
  showreelPoster: "https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/path/showreel-poster.jpg",
  projectOne: "https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto/path/project-1.jpg"
};
```

Empty values use temporary visual placeholders. For launch, replace them with real stills/video exports from your work. This is the main difference between a polished mockup and a real portfolio.

Recommended Cloudinary assets:

- `hero`: dark theater or strongest cinematic background still
- `showreel`: compressed MP4 showreel
- `showreelPoster`: poster frame for the showreel
- `projectOne` through `projectEight`: real project thumbnails/stills

For link previews, replace `social-preview.svg` with a real 1200x630 preview image or update the `og:image` and `twitter:image` tags in `index.html` to a Cloudinary URL.

## Stack

- `index.html`
- `style.css`
- `script.js`
- No framework
- No package install
- No build step

## Cloudflare Pages deploy

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, create a project from that repo.
3. Use these settings:
   - Framework preset: `None`
   - Build command: leave empty
   - Build output directory: `/`
4. Deploy.

## Important note about the Lovable URL

The URL `https://preview--cs-cinematics-digital.lovable.app/#contact` redirects to Lovable's auth bridge as an internal project. To make this pixel-identical to the Lovable version, open that preview in a signed-in browser session or share screenshots/assets from Lovable.
