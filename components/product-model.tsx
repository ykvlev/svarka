"use client";
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
export default function Model({color}:{color:string}){
 const host=useRef<HTMLDivElement>(null),material=useRef<THREE.MeshStandardMaterial|null>(null);
 useEffect(()=>{material.current?.color.set(color==='gray'?'#9699a4':'#33343c');},[color]);
 useEffect(()=>{if(!host.current)return;const container=host.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{container.innerText='3D-просмотр недоступен. Фотографии изделия — ниже.';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x171721,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D-модель кантователя. Перетаскивайте для поворота.');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.01,100);camera.position.set(2.3,1.7,2.6);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.52,0);controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.35;controls.maxPolarAngle=1.48;controls.enableDamping=true;controls.autoRotate=!matchMedia('(prefers-reduced-motion: reduce)').matches;controls.autoRotateSpeed=.5;controls.addEventListener('start',()=>{controls.autoRotate=false;});
 scene.add(new THREE.HemisphereLight(0xffffff,0x404051,3));const light=new THREE.DirectionalLight(0xffffff,5);light.position.set(1,4,3);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);const rim=new THREE.DirectionalLight(0xb6c5ff,2);rim.position.set(-3,2,-2);scene.add(rim);
 const steel=new THREE.MeshStandardMaterial({color:color==='gray'?'#9699a4':'#33343c',metalness:.68,roughness:.35});material.current=steel;const black=new THREE.MeshStandardMaterial({color:0x191920,roughness:.75}),silver=new THREE.MeshStandardMaterial({color:0xcacbd1,metalness:.85,roughness:.23});const group=new THREE.Group();scene.add(group);
 const bar=(a:number[],b:number[],w=.036,mat=steel)=>{const start=new THREE.Vector3(a[0],a[1],a[2]),end=new THREE.Vector3(b[0],b[1],b[2]),dir=end.clone().sub(start);const m=new THREE.Mesh(new THREE.BoxGeometry(w,dir.length(),w),mat);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());m.castShadow=true;m.receiveShadow=true;group.add(m);return m;};
 const cylinder=(x:number,y:number,z:number,r:number,length:number,mat:THREE.MeshStandardMaterial)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,length,32),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;group.add(m);};
 for(const z of [-.19,.19]){bar([-.68,.07,z],[.68,.07,z]);bar([-.68,.10,z],[.32,.92,z]);}
 bar([-.68,.07,-.19],[-.68,.07,.19]);bar([.68,.07,-.26],[.68,.07,.26],.048);bar([.60,.09,0],[.60,1.27,0],.045);bar([-.68,.1,-.19],[-.68,.1,.19]);bar([.32,.92,-.27],[.32,.92,.27]);bar([-.19,.50,-.19],[-.19,.50,.19]);
 for(const z of [-.13,.13])bar([.16,.79,z],[.40,.79,z],.038);
 for(const z of [-.25,.25]){cylinder(.68,.075,z,.068,.035,black);cylinder(.68,.075,z+(z>0?.021:-.021),.038,.009,silver);cylinder(-.68,.10,z*.79,.025,.015,silver);}
 bar([.55,1.13,-.085],[.55,1.29,-.085],.02,black);bar([.55,1.13,.085],[.55,1.29,.085],.02,black);cylinder(.55,1.235,0,.073,.12,black);cylinder(.55,1.235,0,.05,.08,silver);cylinder(.55,1.235,.085,.02,.06,silver);bar([.55,1.235,.12],[.68,1.17,.12],.014,silver);bar([.68,1.17,.12],[.68,1.17,.22],.023,black);bar([.51,1.21,0],[.32,.95,0],.006,silver);const hook=new THREE.Mesh(new THREE.TorusGeometry(.025,.005,8,24,Math.PI*1.6),silver);hook.position.set(.32,.93,0);group.add(hook);
 const floorMat=new THREE.ShadowMaterial({opacity:.23});const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.001;floor.receiveShadow=true;scene.add(floor);
 const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(container);resize();let frame=0;const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});steel.dispose();black.dispose();silver.dispose();floorMat.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="model-stage" ref={host}/>;
}
