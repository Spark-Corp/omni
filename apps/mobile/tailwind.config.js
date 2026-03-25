import config from '@omni/app/tailwind.config'

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./node_modules/@omni/app/**/*.{js,ts,jsx,tsx}'
	],
	...config
}
