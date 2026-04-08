import { config, fields, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: { name: 'Site' },
  },
  singletons: {
    site: singleton({
      label: 'Site',
      path: 'src/content/site/',
      format: { contentField: 'contact' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({
          label: 'Description',
          description: 'Shown on the page and in meta description.',
          multiline: true,
        }),
        logo: fields.image({
          label: 'Logo',
          directory: 'public/images/logo',
          publicPath: '/images/logo/',
        }),
        backgroundPicture: fields.image({
          label: 'Background picture',
          description: 'Full-screen background for the top of the homepage.',
          directory: 'public/images/site-background',
          publicPath: '/images/site-background/',
        }),
        pressText: fields.text({
          label: 'Press text',
          multiline: true,
        }),
        albumIframe: fields.text({
          label: 'Album iframe',
          description:
            'Paste an embed URL (e.g. Spotify/Bandcamp) or a full iframe snippet from the provider.',
          multiline: true,
        }),
        video: fields.object(
          {
            videoIframe: fields.text({
              label: 'Video iframe',
              description:
                'Paste a video embed URL or full iframe snippet (YouTube, Vimeo, etc.).',
              multiline: true,
            }),
            thumbnail: fields.image({
              label: 'Video thumbnail',
              description: 'Optional image shown above the video player.',
              directory: 'public/images/video',
              publicPath: '/images/video/',
            }),
          },
          { label: 'Video' },
        ),
        contact: fields.markdoc({
          label: 'Contact',
          description: 'Rich text for the contact section below the main content.',
        }),
      },
    }),
  },
});
