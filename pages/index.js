// import styles from "../styles/Home.module.css";

import Head from "next/head";
import { getAllCollections, getProduct } from "nextjs-commerce-shopify";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Shopify } from "./_app";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Box,
  Cylinder,
  OrbitControls,
  Reflector,
  useGLTF,
  useTexture,
  Sphere,
  Plane,
} from "@react-three/drei";
import {
  Color,
  DoubleSide,
  MeshStandardMaterial,
  RepeatWrapping,
  sRGBEncoding,
  Vector2,
  Sphere as SphereMath,
} from "three";
import { HDREnv } from "../pages-code/HDREnv/HDREnv";

// import anime from "animejs/lib/anime.es.js";

// import { useControls } from "leva";

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
  let time = useRef({ value: 0 });
  useFrame((st, dt) => {
    time.current.value += dt;
  });
  return (
    <Sphere args={[900, 32, 32]} position-y={100}>
      <shaderMaterial
        side={DoubleSide}
        uniforms={{
          time: time.current,
          size: { value: new Vector2(size.width, size.height) },
        }}
        transparent={true}
        fragmentShader={
          /* glsl */ `

          uniform vec2 size;
          uniform float time;
          void main (void) {
            vec2 uv = gl_FragCoord.xy / size;

            float grad = 1.0 - uv.y;
            grad -= 0.25 * cos(time * 0.45);

            gl_FragColor = vec4(grad, 0.0, grad, 1.0);
          }
      `
        }
      ></shaderMaterial>
    </Sphere>
  );
}

// function Logo() {
//   let { SVGLoader } = require("three/examples/jsm/loaders/SVGLoader.js");

//   let { paths } = useLoader(SVGLoader, "/svg/nano-white-text.svg");
//   const shapes = useMemo(
//     () =>
//       paths.flatMap((p) =>
//         p.toShapes(true).map((shape) => ({
//           shape,
//           color: p.color,
//           fillOpacity: p.userData.style.fillOpacity,
//         }))
//       ),
//     [paths]
//   );

//   const ref = useRef();
//   useLayoutEffect(() => {
//     // const sphere = new Box3()
//     //   .setFromObject(ref.current)
//     //   .getBoundingSphere(new SphereMath());
//     // ref.current.position.set(-sphere.center.x, -sphere.center.y, 0);
//   }, [ref.current]);

//   return (
//     <group rotation-x={Math.PI} scale={0.01}>
//       <group ref={ref}>
//         {shapes.map((props, index) => (
//           <Cell
//             key={props.shape.uuid}
//             {...props}
//             text={index % 20 || `Cell ${index}`}
//           />
//         ))}
//       </group>
//     </group>
//   );

//   // return <group></group>;
// }

// function Cell({ color, shape, fillOpacity, text }) {
//   const [hovered, set] = useState(false);
//   let defaultCursor = "";
//   let hoveredCursor = "";
//   useEffect(
//     () =>
//       void (document.body.style.cursor = hovered
//         ? `url('${hoveredCursor}'), pointer`
//         : `url('${defaultCursor}'), auto`),
//     [hovered]
//   );
//   return (
//     <mesh onPointerOver={(e) => set(true)} onPointerOut={() => set(false)}>
//       <meshBasicMaterial
//         color={hovered ? "hotpink" : color}
//         opacity={fillOpacity}
//         depthWrite={true}
//         side={DoubleSide}
//         transparent
//       />
//       <shapeBufferGeometry args={[shape]} />
//       {/* {text && (
//         <Text
//           anchorX="center"
//           anchorY="center"
//           fontSize={6}
//           font="https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.15"
//           position={[shape.getPoint(0).x, shape.getPoint(0).y, 1]}
//         >
//           {text}
//         </Text>
//       )} */}
//     </mesh>
//   );
// }

//

function Bottle() {
  const ref = useRef();
  const [bottle, setBottle] = useState(false);
  const [hovering, setHover] = useState(false);
  const fresnel = useRef(new MeshStandardMaterial());
  let { OBJLoader } = require("three/examples/jsm/loaders/OBJLoader");
  const bottleRaw = useLoader(OBJLoader, "/obj/bottle_cap_assembly.obj");
  const objBottle = useMemo(() => {
    let res = bottleRaw.clone();
    res.traverse((item) => {
      if (item && item.isMesh) {
        if (item.name === "1") {
          //
          item.material = new MeshStandardMaterial({
            roughness: 0.5,
            metalness: 0.3,
            color: new Color("#A0A7C0").offsetHSL(0, 0, 0.1),
          });
        }

        if (item.name === "3") {
          // cap
          item.material = new MeshStandardMaterial({
            roughness: 0.5,
            metalness: 0.3,
            color: new Color("#A0A7C0"),
          });
        }

        if (item.name === "5") {
          // cap ring
          item.material = new MeshStandardMaterial({
            roughness: 0.5,
            metalness: 0.3,
            color: new Color("#A0A7C0").offsetHSL(0, 0, 0.2),
          });
        }
      }
    });
    return res;
  }, [bottleRaw]);

  const supernanoHoles = useTexture(
    "/textures/supernano-label-loklok3d-alpha-v4.png"
  );
  const supernanoWhite = useTexture(
    "/textures/supernano-label-loklok3d-white.png"
  );
  const nanowhite = useTexture("/svg/nano-white-text.svg");

  const time = useRef({ value: 0 });
  const useControls = require("leva").useControls;
  // const params = useControls({
  //   threshold: 0.9,
  // });

  useFrame((st, dt) => {
    time.current.value += dt;
  });
  useEffect(() => {
    supernanoHoles.encoding = sRGBEncoding;
    supernanoWhite.encoding = sRGBEncoding;
    //
    fresnel.current.needsUpdate = true;
    //
    fresnel.current.onBeforeCompile = (node) => {
      node.uniforms.time = time.current;
      node.uniforms.mask = { value: supernanoHoles };
      node.uniforms.label = { value: supernanoWhite };
      node.vertexShader = node.vertexShader.replace(
        `#include <clipping_planes_pars_vertex>`,
        `#include <clipping_planes_pars_vertex>


        // varying vec2 vUv;
        #ifdef USE_MAP
        #else
        varying vec2 vUv;
        #endif
      `
      );
      node.vertexShader = node.vertexShader.replace(
        `#include <fog_vertex>`,
        `
        #include <fog_vertex>
        vUv = uv;
      `
      );

      node.fragmentShader = node.fragmentShader.replace(
        `#include <clipping_planes_pars_fragment>`,
        /* glsl */ `
        #include <clipping_planes_pars_fragment>

        uniform float time;
        #ifdef USE_MAP
        #else
        varying vec2 vUv;
        #endif

        uniform sampler2D label;
        uniform sampler2D mask;

        const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

        float noise( in vec2 p ) {
          return sin(p.x)*sin(p.y);
        }

        float fbm4( vec2 p ) {
            float f = 0.0;
            f += 0.5000 * noise( p ); p = m * p * 2.02;
            f += 0.2500 * noise( p ); p = m * p * 2.03;
            f += 0.1250 * noise( p ); p = m * p * 2.01;
            f += 0.0625 * noise( p );
            return f / 0.9375;
        }

        float fbm6( vec2 p ) {
            float f = 0.0;
            f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
            f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
            f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
            f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
            f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
            f += 0.015625*(0.5 + 0.5 * noise( p ));
            return f/0.96875;
        }

        float pattern (vec2 p) {
          float vout = fbm4( p + vViewPosition.x + fbm6(  p + fbm4( p + vViewPosition.x )) );
          return abs(vout);
        }

      `
      );

      node.fragmentShader = node.fragmentShader.replace(
        `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
        /* glsl */ `
        vec3 rainbow = vec3(
           pattern(vUv.xx * 15.0123 + -2.7 * cos(5.0 * vViewPosition.x)),
           pattern(vUv.xx * 15.0123 +  0.0 * cos(5.0 * vViewPosition.x)),
           pattern(vUv.xx * 15.0123 +  2.7 * cos(5.0 * vViewPosition.x))
        );
        vec4 labelColor4 = texture2D(label, vUv.xy);
        vec3 labelColor = labelColor4.rgb;
        float labelAlpha = labelColor4.a;

        vec4 maskColor4 = texture2D(mask, vUv.xy);
        vec3 maskColor = maskColor4.rgb;
        float maskAlpha = maskColor4.a;
        float avgC = (labelColor.r + labelColor.g + labelColor.b) / 3.0;

        vec3 outColor = vec3(0.0);

        float mixer = 1.0 - maskAlpha;
        if (mixer <= 0.1) {
          mixer = 0.1;
        }

        outColor = mix(labelColor, labelColor * rainbow, mixer);

        // vec3 rainbowColor = outgoingLight * rainbow * 2.0;
        // vec3 outColor = vec3(1.0);
        // outColor.rgb = mix(maskColor, maskColor * rainbowColor, 0.5);
        // if (maskAlpha <= 0.5) {
        //   outColor.rgb = rainbowColor * maskAlpha;
        // }

        // darken
        if (avgC <= 0.5) {
          outColor.r = pow(outColor.r, 1.5);
          outColor.g = pow(outColor.g, 1.5);
          outColor.b = pow(outColor.b, 1.5);
        }

        gl_FragColor = vec4( outColor, 1.0 );
      `
      );
    };

    fresnel.current.customProgramCacheKey = () => `_${Math.random()}`;
    fresnel.current.needsUpdate = true;
  });

  useEffect(async () => {
    const myprod = await getProduct({
      domain: Shopify.domain,
      token: Shopify.token,
      handle: "supernano-unicorn-test",
    });
    console.log(myprod);
    setBottle(myprod);
  }, []);
  let shaking = false;
  useFrame((st, dt) => {
    if (shaking) {
      if (ref.current) {
        ref.current.time = ref.current.time || 0;
        ref.current.time += dt;
        let time = ref.current.time * 35.0;
        ref.current.rotation.x = Math.sin(time) * 0.075;
        ref.current.rotation.y = Math.sin(time) * 0.075;
        ref.current.rotation.z = Math.sin(time) * 0.075;
      }
    } else {
      if (ref.current) {
        ref.current.rotation.x *= 0.5;
        ref.current.rotation.y *= 0.5;
        ref.current.rotation.z *= 0.5;
      }
    }
  });

  const pourGroup = useRef();
  let shakeEngine = useRef();

  let pourAnimation = () => {
    let anime = require("animejs/lib/anime.es.js").default;
    console.log(objBottle);
    let cap = objBottle.getObjectByName("3");

    cap.rotation.set(0, 0, 0);
    cap.position.set(0, 0, 0);
    cap.material.opacity = 1;
    pourGroup.current.position.set(0, 0, 0);
    pourGroup.current.rotation.set(0, 0, 0);

    shaking = true;

    Promise.resolve()
      .then(() => {
        return anime({
          duration: 1000,
        }).finished;
      })
      .then(() => {
        shaking = false;
        return anime({
          duration: 500,
        }).finished;
      })
      .then(() => {
        //
        anime({
          targets: [cap.rotation],
          y: 50,
          duration: 8000,
        });

        anime({
          targets: [cap.material],
          opacity: 0.0,
          duration: 8000,
        });

        anime({
          targets: [cap.position],
          y: 10.1,
          duration: 4000,
        });

        cap.material.transparent = true;

        return anime({
          duration: 1000,
        }).finished;
      })
      .then(() => {
        anime({
          targets: [pourGroup.current.position],
          y: 5,
          x: 0.5,
          duration: 8000,
        });
        anime({
          targets: [pourGroup.current.rotation],
          z: Math.PI * 0.6,
          duration: 8000,
        });

        return anime({
          duration: 4000,
        }).finished;
      })
      .then(() => {
        //
        window.dispatchEvent(new CustomEvent("pours-engine-oil"));

        return anime({
          duration: 1000,
        }).finished;
      })
      .then(() => {
        // put bottle down
        anime({
          targets: [pourGroup.current.position],
          y: 0,
          x: 0.0,
          duration: 4000,
          easing: "easeInOutQuad",
        });
        anime({
          targets: [pourGroup.current.rotation],
          z: 0,
          duration: 4000,
          easing: "easeInOutQuad",
        });

        // shake
        anime({
          targets: [shakeEngine.current.rotation],
          x: 0.02,
          y: 0.02,
          z: 0.02,
          duration: 8000,
          easing: function (el, i, total) {
            return function (t) {
              return Math.random() * Math.pow(Math.sin(t * (i + 1)), total);
            };
          },
        }).finished.then(() => {
          anime({
            targets: [shakeEngine.current.rotation],
            x: 0.02,
            y: 0.02,
            z: 0.02,
            duration: 8000,
            easing: function (el, i, total) {
              return function (t) {
                return Math.random() * Math.pow(Math.sin(t * (i + 1)), total);
              };
            },
          });
        });

        return anime({
          duration: 4000,
        }).finished;
      })
      .then(() => {
        anime({
          targets: [cap.rotation],
          y: 0,
          duration: 8000,
        });

        anime({
          targets: [cap.material],
          opacity: 1.0,
          duration: 8000,
        });

        anime({
          targets: [cap.position],
          y: 0.0,
          duration: 4000,
        });

        return anime({
          duration: 500,
        }).finished;
      })
      .then(() => {
        //
      });
  };

  return (
    <group>
      <group ref={shakeEngine}>
        <group position-x={-2}>
          <EngineModel></EngineModel>
        </group>
      </group>

      <group scale={5} position-y={2.5}>
        {/* title */}
        <Plane position-y={0.3} args={[0.5, 0.5 / (876.87 / 424.816)]}>
          <meshStandardMaterial
            transparent={true}
            map={nanowhite}
            side={DoubleSide}
            metalness={0.5}
            roughness={0.3}
          ></meshStandardMaterial>
        </Plane>
      </group>

      <group ref={pourGroup}>
        <group ref={ref}>
          <RotateY speed={1}>
            <Cylinder
              args={[0.45, 0.45, 1.8, 32, 1, true]}
              position={[0, 1.35, 0]}
              rotation-y={Math.PI * 0.5}
              onPointerEnter={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerLeave={() => {
                document.body.style.cursor = "";
              }}
              onPointerUp={() => {
                // if (bottle) {
                //   window.location.assign(bottle.onlineStoreUrl);
                // }
                pourAnimation();
              }}
            >
              <meshStandardMaterial
                side={DoubleSide}
                transparent={true}
                metalness={0.9}
                roughness={0.2}
                ref={fresnel}
              />
            </Cylinder>

            <group position={[0, 0.3, 0]}>
              <primitive scale={0.025} object={objBottle}></primitive>
            </group>
          </RotateY>
        </group>
      </group>

      {/* <RotateY speed={1.5}>
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
      </RotateY> */}
    </group>
  );
}

function EngineModel() {
  let { nodes } = useGLTF("/glb/engine-5.glb");
  // let rustNormal = useTexture("/textures/Metal_Rusted_001_NRM.jpg");
  // let rustMetalic = useTexture("/textures/Metal_006_Metallic.jpg");
  let out = useMemo(() => {
    let cloned = nodes.Scene.clone();
    cloned.traverse((item) => {
      // item.
      //
      if (item && item.material) {
        item.geometry.computeVertexNormals();
        item.material = new MeshStandardMaterial({
          //
          // normalMap: rustNormal,
          metalness: 1.0,
          roughness: 0.1,
        });

        console.log(item.position.y);
      }
    });
    return cloned;
  }, [nodes.Scene]);

  return (
    <group position-y={1.3} position-x={-0.5}>
      <primitive
        rotation-y={Math.PI * 0.75}
        scale={0.03}
        object={out}
      ></primitive>
    </group>
  );
}

function ReflectorScene({ mixBlur, depthScale, distortion, normalScale }) {
  const shop = useTexture("/textures/shop.png");
  const distortionMap = useTexture("/textures/dist_map.jpg");
  const orbitCtrls = useRef(null);
  const roughness = useTexture("/textures/roughness_floor.jpg");
  const normal = useTexture("/textures/NORM.jpg");
  const _normalScale = useMemo(
    () => new Vector2(normalScale || 0),
    [normalScale]
  );

  const { scene, camera } = useThree();
  useEffect(() => {
    camera.position.x = 0;
    camera.position.y = 3.3;
    camera.position.z = 5.5;
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
        args={[20, 20]}
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
        args={[20, 20 / aspect, 0.2]}
        position={[0, 20 / aspect / 2 + 0.05, -5]}
      >
        <meshStandardMaterial metalness={1} roughness={0.2} map={shop} />
      </Box>

      <group position-x={2}>
        <Bottle></Bottle>
      </group>

      {/* <Logo></Logo> */}

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

        {/* <ambientLight /> */}
        {/* <pointLight position={[10, 10, 10]} /> */}

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
