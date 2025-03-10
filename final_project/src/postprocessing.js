import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { Vector2 } from 'three'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'

export function postprocessing(scene, camera, renderer) {
	//effect composer composes our effects
	const composer = new EffectComposer(renderer)
	composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	composer.setSize(window.innerWidth, window.innerHeight)

	const renderPass = new RenderPass(scene, camera)
	composer.addPass(renderPass)

	const bloomPass = new UnrealBloomPass()
	bloomPass.strength = 0.1
	composer.addPass(bloomPass)

	const pixelPass = new RenderPixelatedPass(6, scene, camera)
	pixelPass.pixelSize = 12
	pixelPass.normalEdgeStrength = 2
	pixelPass.enabled = false
	composer.addPass(pixelPass)

	const afterPass = new AfterimagePass()
	afterPass.uniforms.damp.value = 0.99
	afterPass.enabled = false
	composer.addPass(afterPass)

	const glitchPass = new GlitchPass()
	glitchPass.enabled = false
	composer.addPass(glitchPass)

	const bokehPass = new BokehPass(scene, camera, {
		focus: 1.0,
		aperture: 0.025,
		maxblur: 0.01,
		width: window.innerWidth,
		height: window.innerHeight
	})
	bokehPass.enabled = false
	composer.addPass(bokehPass)

	// const outlinePass = new OutlinePass(
	// 	new Vector2(window.innerWidth, window.innerHeight),
	// 	scene,
	// 	camera
	// )
	// composer.addPass(outlinePass)

	return {
		composer: composer,
		bloom: bloomPass,
		glitch: glitchPass,
		pixel: pixelPass,
		afterimage: afterPass,
		dof: bokehPass
	}
}
