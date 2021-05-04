// import styles from "../styles/Home.module.css";

import Head from "next/head";
import { getAllCollections } from "nextjs-commerce-shopify";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Shopify } from "./_app";
import { Canvas, useFrame, useGraph, useThree } from "@react-three/fiber";
import {
  Box,
  CameraShake,
  Cylinder,
  OrbitControls,
  Sphere,
  Reflector,
  TorusKnot,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { BackSide, Color, DoubleSide, RepeatWrapping, Vector2 } from "three";
import { HDREnv } from "../pages-code/HDREnv/HDREnv";

// import { getProduct } from "nextjs-commerce-shopify";

export function CollectionsOfProducts() {
  //
  let [collection, setCollection] = useState([]);

  //
  useEffect(async () => {
    let myCollectionData = await getAllCollections({
      domain: Shopify.domain,
      token: Shopify.token,
    });

    // collections = collections.filter((e) => e.handle === "supernano");
    // console.log(collections);
    //

    // const myproduct = await getProduct({
    //   domain: Shopify.domain,
    //   token: Shopify.token,
    //   handle: "supernano-unicorn-test",
    // });

    setCollection(myCollectionData);
  });

  return (
    <div className="p-3">
      {/*  */}
      {collection.map((c) => {
        return (
          <div className="p-2 m-2 text-sm" key={c.id}>
            {c.handle}
          </div>
        );
      })}
    </div>
  );
}

function RotateY({ children, speed = 1 }) {
  let ref = useRef();

  useFrame((st, dt) => {
    ref.current.rotation.y += dt * speed;
  });

  return <group ref={ref}>{children}</group>;
}

const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if (depth < cameraOffset) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = (camera.fov * Math.PI) / 180;

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera);
  return height * camera.aspect;
};

function BGPlane() {
  let { camera, size } = useThree();
  // let h = visibleHeightAtZDepth(800, camera);
  // let w = visibleWidthAtZDepth(800, camera);

  return (
    <Sphere args={[900, 32, 32]} position-y={100}>
      <shaderMaterial
        side={BackSide}
        uniforms={{
          size: { value: new Vector2(size.width, size.height) },
        }}
        transparent={true}
        fragmentShader={
          /* glsl */ `

          uniform vec2 size;
          void main (void) {
            vec2 uv = gl_FragCoord.xy / size;

            float grad = 1.0 - uv.y;
            grad -= 0.25;

            gl_FragColor = vec4(grad, 0.0, grad, 1.0);
          }
      `
        }
      ></shaderMaterial>
    </Sphere>
  );
}

function ReflectorScene({ mixBlur, depthScale, distortion, normalScale }) {
  const shop = useTexture("/textures/shop.png");
  const distortionMap = useTexture("/textures/dist_map.jpg");
  const orbitCtrls = useRef(null);
  const roughness = useTexture("/textures/roughness_floor.jpg");
  const normal = useTexture("/textures/NORM.jpg");
  const _normalScale = useMemo(() => new Vector2(normalScale || 0), [
    normalScale,
  ]);

  const { scene, camera } = useThree();
  useEffect(() => {
    camera.position.x = 0;
    camera.position.y = 1.3;
    camera.position.z = 5;
    scene.background = new Color("#000000");
  }, []);

  useEffect(() => {
    distortionMap.wrapS = distortionMap.wrapT = RepeatWrapping;
    distortionMap.repeat.set(4, 4);
  }, [distortionMap]);

  useFrame(({ clock }) => {
    let time = clock.getElapsedTime();
    camera.position.x += Math.sin(time) * 0.0025;
    camera.position.y += Math.sin(time) * Math.cos(time) * 0.0025;
    camera.position.z += Math.cos(time) * 0.0025;

    if (orbitCtrls.current) {
      orbitCtrls.current.target.y = 1.3;
    }

    // $box.current.position.y += Math.sin(clock.getElapsedTime()) / 25;
    // $box.current.rotation.y = clock.getElapsedTime() / 2;
  });

  let aspect = 1126 / 583;

  return (
    <>
      <Reflector
        resolution={1024}
        args={[10, 10]}
        mirror={0.99}
        mixBlur={mixBlur || 0}
        mixStrength={1}
        rotation={[Math.PI * -0.5, 0, 0]}
        minDepthThreshold={0.8}
        maxDepthThreshold={1.2}
        depthScale={depthScale || 0}
        depthToBlurRatioBias={0.2}
        debug={0}
        distortion={distortion || 0}
        distortionMap={distortionMap}
      >
        {(Material, props) => (
          <Material
            metalness={0.1}
            roughnessMap={roughness}
            // normalMap={normal}
            roughness={0.8}
            // normalMap={normal}
            // normalScale={_normalScale}
            {...props}
            side={DoubleSide}
          />
        )}
      </Reflector>

      <BGPlane></BGPlane>

      <gridHelper
        position-y={-0.1}
        args={[100, 100, "#00ffff", "#00ffff"]}
      ></gridHelper>

      <Box
        args={[10, 10 / aspect, 0.2]}
        position={[0, 10 / aspect / 2 + 0.05, -3]}
      >
        <meshStandardMaterial map={shop} />
      </Box>

      <Cylinder args={[0.5, 0.5, 2, 32]} position={[0, 1.3, 0]}>
        <meshStandardMaterial metalness={1} roughness={0.5} color="#bababa" />
      </Cylinder>

      <RotateY speed={1.5}>
        <pointLight
          distance={100}
          decay={2}
          position={[-2, 1.3, 0]}
          color={"#ff00ff"}
        >
          <Sphere args={[0.05, 24, 32]}>
            <meshStandardMaterial
              metalness={1}
              roughness={0.0}
              color={"#ff00ff"}
            ></meshStandardMaterial>
          </Sphere>
        </pointLight>

        <pointLight
          distance={100}
          decay={2}
          position={[2, 1.3, 0]}
          color={"#00ffff"}
        >
          <Sphere args={[0.05, 24, 32]}>
            <meshStandardMaterial
              metalness={1}
              roughness={0.0}
              color={"#00ffff"}
            ></meshStandardMaterial>
          </Sphere>
        </pointLight>
      </RotateY>

      <spotLight
        intensity={1}
        position={[10, 6, 10]}
        penumbra={1}
        angle={0.3}
      />

      <OrbitControls ref={orbitCtrls}></OrbitControls>
    </>
  );
}

export default function Home() {
  return (
    <div className="h-full w-full">
      <Head>
        <title>Supernano</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Canvas>
        <Suspense fallback={null}>
          <ReflectorScene
            mixBlur={5}
            depthScale={1}
            distortion={0.005}
            normalScale={1}
          ></ReflectorScene>
        </Suspense>

        <HDREnv></HDREnv>

        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        {/* <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} /> */}
      </Canvas>

      {/* <CollectionsOfProducts></CollectionsOfProducts> */}

      {/* <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer> */}
    </div>
  );
}
