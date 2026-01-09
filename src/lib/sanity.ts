import { createClient } from '@sanity/client';

export const sanityClient = createClient({
    projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || 'your_project_id',
    dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
    useCdn: true, // set to `false` to bypass the edge cache
    apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
});

// Helper to build image URL
// import imageUrlBuilder from '@sanity/image-url'
// const builder = imageUrlBuilder(sanityClient)
// export const urlFor = (source) => builder.image(source)
