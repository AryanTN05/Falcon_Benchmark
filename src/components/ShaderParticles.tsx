'use client';

import { useEffect, useRef, useState } from 'react';

const vertexShader = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fragmentShader = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_mouse;
uniform float u_mouseActive;

float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 hash22(vec2 p){return vec2(hash21(p),hash21(p+17.0));}

void main(){
  float aspect=u_res.x/u_res.y;
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 auv=vec2(uv.x*aspect,uv.y);
  vec2 mouse=vec2(u_mouse.x*aspect,u_mouse.y);

  float density=15.0;
  vec2 guv=auv*density;
  vec3 col=vec3(0.0);
  float alpha=0.0;

  for(int oy=-1;oy<=1;oy++){
    for(int ox=-1;ox<=1;ox++){
      vec2 cellId=floor(guv)+vec2(float(ox),float(oy));
      vec2 rnd=hash22(cellId);
      float speed=0.002+rnd.x*0.004;
      float phase=fract(rnd.y+u_t*speed);
      vec2 jitter=hash22(cellId+9.1)-0.5;
      vec2 center=cellId+0.5+jitter*0.75;
      center.y+=(phase-0.5)*0.95;
      vec2 centerUv=center/density;

      // A shared, position-driven sway (rather than per-particle random motion) so
      // neighboring specks drift together like light moving across flowing water.
      centerUv.x+=sin(u_t*0.05+centerUv.y*7.0+rnd.y*6.28)*0.014;

      vec2 toCenter=centerUv-mouse;
      float d=length(toCenter);
      float radius=0.1;
      float falloff=(1.0-smoothstep(0.0,radius,d))*u_mouseActive;
      centerUv+=normalize(toCenter+1e-5)*falloff*0.002;

      float dist=length(auv-centerUv);
      float coreSize=mix(0.0016,0.0038,hash21(cellId+3.7));
      float core=exp(-pow(dist/coreSize,2.0)*3.2);
      float shimmer=sin(u_t*0.06+centerUv.x*9.0+centerUv.y*5.0+rnd.y*6.28);
      float twinkle=0.6+0.4*shimmer;
      float bright=mix(0.55,1.0,twinkle);
      vec3 particleColor=mix(vec3(0.95,0.72,0.42),vec3(1.0,0.97,0.9),twinkle*0.4);
      col+=particleColor*core*bright;
      alpha+=core*bright;
    }
  }

  // A shooting star every cycle, spaced one second apart.
  float shootPeriod=16.0;
  float cycleIndex=floor(u_t/shootPeriod);
  float cycleT=fract(u_t/shootPeriod);
  {
    vec2 seed2=hash22(vec2(cycleIndex,33.3));
    float duration=0.7;
    float startAt=seed2.x*0.1;
    float p=(cycleT*shootPeriod-startAt)/duration;
    if(p>=0.0&&p<=1.0){
      vec2 start=vec2(mix(0.1,0.9,seed2.y)*aspect,mix(0.85,1.05,hash21(vec2(cycleIndex,5.5))));
      float dirSign=seed2.y<0.5?-1.0:1.0;
      vec2 dir=normalize(vec2(dirSign*0.75,-0.55));
      float travel=0.6;
      vec2 head=start+dir*p*travel;
      vec2 v=auv-head;
      float along=-dot(v,dir);
      float tailLen=0.16;
      if(along>-0.01&&along<tailLen){
        vec2 perpVec=v+dir*along;
        float perp=length(perpVec);
        float thickness=0.0016;
        float glow=exp(-pow(perp/thickness,2.0));
        float taper=pow(clamp(1.0-along/tailLen,0.0,1.0),1.6);
        float edgeFade=smoothstep(0.0,0.08,p)*smoothstep(1.0,0.9,p);
        float starBright=glow*taper*edgeFade;
        col+=vec3(1.0,0.98,0.92)*starBright*1.3;
        alpha+=starBright*1.1;
      }
    }
  }

  gl_FragColor=vec4(col,clamp(alpha,0.0,1.0));
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create particle shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Particle shader error.');
  return shader;
}

/** Ambient dust drifting over the hero stage; drifts away from the pointer and brightens near it. */
export function ShaderParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setWebgl(false); return; }

    let visible = true;
    let frame = 0;
    let disposed = false;
    let mouseActive = 0;
    let mouseTarget = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let mouseTargetX = 0.5;
    let mouseTargetY = 0.5;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame && !disposed) frame = requestAnimationFrame(draw);
    }, { rootMargin: '160px' });
    observer.observe(canvas);

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) { setWebgl(false); observer.disconnect(); return; }

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    try {
      program = gl.createProgram();
      if (!program) throw new Error('Unable to create particle program.');
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Unable to link particle program.');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'p');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    } catch {
      setWebgl(false);
      observer.disconnect();
      return;
    }

    const timeUniform = gl.getUniformLocation(program, 'u_t');
    const resolutionUniform = gl.getUniformLocation(program, 'u_res');
    const mouseUniform = gl.getUniformLocation(program, 'u_mouse');
    const mouseActiveUniform = gl.getUniformLocation(program, 'u_mouseActive');

    // Listen on the window, not the canvas: the header, hero text, and chat card all sit
    // visually on top of the canvas and would otherwise swallow pointer events before they
    // reach it, making hover only register in the empty margins.
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseTargetX = (event.clientX - rect.left) / rect.width;
      mouseTargetY = 1 - (event.clientY - rect.top) / rect.height;
      mouseTarget = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom ? 1 : 0;
    };
    const onLeave = () => { mouseTarget = 0; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    function draw(now: number) {
      frame = 0;
      if (disposed || !gl || !canvas || !visible || document.hidden) return;
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      mouseActive += (mouseTarget - mouseActive) * (mouseTarget > mouseActive ? 0.08 : 0.05);
      mouseX += (mouseTargetX - mouseX) * 0.12;
      mouseY += (mouseTargetY - mouseY) * 0.12;

      gl.uniform1f(timeUniform, now / 1000);
      gl.uniform2f(resolutionUniform, width, height);
      gl.uniform2f(mouseUniform, mouseX, mouseY);
      gl.uniform1f(mouseActiveUniform, mouseActive);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    const visibility = () => { if (!document.hidden && visible && !frame) frame = requestAnimationFrame(draw); };
    document.addEventListener('visibilitychange', visibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  if (!webgl) return null;
  return <canvas ref={canvasRef} className="stage-particles" aria-hidden="true" />;
}
