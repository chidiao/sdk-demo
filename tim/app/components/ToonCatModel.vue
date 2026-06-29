<template>
  <div ref="container" class="toon-cat-model w-full aspect-square bg-transparent"></div>
</template>

<script setup lang="ts">
import {
  AmbientLight,
  AnimationMixer,
  Box3,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  Scene,
  Timer,
  Vector3,
  WebGLRenderer
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref<HTMLDivElement>()
const timer = new Timer()

let renderer: WebGLRenderer
let camera: PerspectiveCamera
let scene: Scene
let controls: OrbitControls
let mixer: AnimationMixer | undefined
let animationId = 0

function fitModel(model: Group) {
  const box = new Box3().setFromObject(model)
  const size = box.getSize(new Vector3())
  const maxSize = Math.max(size.x, size.y, size.z)

  model.scale.setScalar(2.6 / maxSize)

  const scaledBox = new Box3().setFromObject(model)
  const center = scaledBox.getCenter(new Vector3())
  const scaledSize = scaledBox.getSize(new Vector3())

  model.position.sub(center)

  const distance = Math.max(scaledSize.x, scaledSize.y) / (2 * Math.tan((camera.fov * Math.PI) / 360))
  camera.position.set(0, 0, distance * 1.7)
  camera.near = distance / 100
  camera.far = distance * 100
  camera.updateProjectionMatrix()

  controls.target.set(0, 0, 0)
  controls.update()
}

function resize() {
  const el = container.value
  if (!el) return

  camera.aspect = el.clientWidth / el.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(el.clientWidth, el.clientHeight)
}

function animate() {
  timer.update()
  mixer?.update(timer.getDelta())
  controls.update()
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  const el = container.value
  if (!el) return

  scene = new Scene()
  camera = new PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100)

  renderer = new WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  el.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableZoom = false

  scene.add(new AmbientLight(0xffffff, 2))

  const light = new DirectionalLight(0xffffff, 2)
  light.position.set(2, 4, 3)
  scene.add(light)

  new GLTFLoader().load('/3d/toon_cat_free.glb', (gltf) => {
    const model = gltf.scene
    scene.add(model)
    fitModel(model)

    console.log(gltf.animations)
    const clip = gltf.animations.find((item) => item.name == 'Scene') ?? gltf.animations[0]
    if (clip) {
      mixer = new AnimationMixer(model)
      mixer.clipAction(clip).play()
    }
  })

  resize()
  window.addEventListener('resize', resize)
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  controls?.dispose()
  renderer?.dispose()
})
</script>

<style scoped>
.toon-cat-model {
  background: transparent;
}

.toon-cat-model :deep(canvas) {
  display: block;
}
</style>
