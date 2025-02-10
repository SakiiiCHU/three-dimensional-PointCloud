"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { Box3, Vector3, BufferGeometry, Float32BufferAttribute, PointsMaterial } from "three"
import { usePLYLoader } from "../hooks/usePLYLoader"

export function CenteredModelPLY({ url, position = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef()
  const plyModel = usePLYLoader(url)
  const { scene } = useThree()

  useEffect(() => {
    if (groupRef.current && plyModel) {
      const box = new Box3().setFromObject(groupRef.current)
      const center = box.getCenter(new Vector3())
      groupRef.current.position.sub(center)
      groupRef.current.scale.setScalar(scale)
      groupRef.current.position.add(new Vector3(...position))
    }
  }, [plyModel, position, scale])

  useEffect(() => {
    if (plyModel) {
      const adjustSceneScale = () => {
        const box = new Box3().setFromObject(scene)
        const size = box.getSize(new Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        scene.scale.setScalar(10 / maxDim)
      }
      adjustSceneScale()
    }
    return () => {
      scene.scale.set(1, 1, 1)
    }
  }, [scene, plyModel])

  if (!plyModel) return null

  const vertices = plyModel.attributes.position.array || []
  const colors = plyModel.attributes.color ? plyModel.attributes.color.array : []

  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3))
  if (colors.length > 0) {
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
  }

  return (
    <group ref={groupRef}>
      <points
        geometry={geometry}
        material={new PointsMaterial({ size: 0.005, vertexColors: !!colors.length })}
      />
    </group>
  )
}
