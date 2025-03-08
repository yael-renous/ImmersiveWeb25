import { LumaSplatsThree } from '@lumaai/luma-web'

export const addGussianSplat = async (url) => {
    try {
        const splat = new LumaSplatsThree({
            // source: 'https://lumalabs.ai/capture/ca9ea966-ca24-4ec1-ab0f-af665cb546ff',
            source: url,
            // controls the particle entrance animation
            // particleRevealEnabled: true,
            loadingAnimationEnabled: false,
            // Optional: Add transition settings
            fadeInDuration: 1.0, // seconds
        })

        // Wait for initialization
        return splat
    } catch (error) {
        console.error('Error creating Gaussian Splat:', error)
        return null
    }
}