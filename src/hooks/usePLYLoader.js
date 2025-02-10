import { useEffect, useState } from "react"
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader"
import { BufferGeometry } from "three"

export function usePLYLoader(url) {
  const [model, setModel] = useState(null)

  useEffect(() => {
    if (!url) return

    const loader = new PLYLoader()
    loader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals()
        setModel(geometry)
      },
      undefined,
      (error) => {
        console.error("Error loading PLY file:", error)
      }
    )

    return () => {
      if (model instanceof BufferGeometry) {
        model.dispose()
      }
    }
  }, [url])

  return model
}
