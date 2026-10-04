// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://emmberkat.github.io',
	base: '/field-guide',
	// No images to optimize, so skip sharp and its native binaries.
	image: { service: passthroughImageService() },
	integrations: [
		starlight({
			title: "Emma's Field Guide",
			description: 'Software opinions, earned the hard way.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/Emmberkat/field-guide' },
			],
			editLink: {
				baseUrl: 'https://github.com/Emmberkat/field-guide/edit/main/',
			},
			sidebar: [
				{
					label: 'Design',
					items: [{ autogenerate: { directory: 'design' } }],
				},
				{
					label: 'Testing',
					items: [{ autogenerate: { directory: 'testing' } }],
				},
			],
		}),
	],
});
