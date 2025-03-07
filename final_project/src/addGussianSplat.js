import { LumaSplatsThree } from '@lumaai/luma-web'



export const addGussianSplat = (url) => {
    const splat = new LumaSplatsThree({
        // source: 'https://lumalabs.ai/capture/ca9ea966-ca24-4ec1-ab0f-af665cb546ff',
        source: url,
        // controls the particle entrance animation
        // particleRevealEnabled: true,
        loadingAnimationEnabled: false,
    })
    return splat;
}