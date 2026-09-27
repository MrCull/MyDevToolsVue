<script setup lang="ts">
import { computed, ref } from 'vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ResultRow from './ui/ResultRow.vue'
import ToolLayout from './ui/ToolLayout.vue'
import CopyButton from './ui/CopyButton.vue'

interface Color { r: number; g: number; b: number; a: number }
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
const hueToRgb = (p: number, q: number, raw: number) => { let t = raw; if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p+(q-p)*6*t; if (t < 1/2) return q; if (t < 2/3) return p+(q-p)*(2/3-t)*6; return p }
const hslToRgb = (h: number, s: number, l: number): [number,number,number] => {
  h = ((h % 360) + 360) % 360 / 360; s = clamp(s); l = clamp(l)
  if (!s) return [l*255,l*255,l*255]
  const q = l < .5 ? l*(1+s) : l+s-l*s, p=2*l-q
  return [hueToRgb(p,q,h+1/3)*255,hueToRgb(p,q,h)*255,hueToRgb(p,q,h-1/3)*255]
}
const linearToSrgb = (value: number) => 255 * (value <= .0031308 ? 12.92*value : 1.055*Math.pow(value,1/2.4)-.055)
const oklchToRgb = (l: number, c: number, h: number): [number,number,number] => {
  const rad=h*Math.PI/180, a=c*Math.cos(rad), b=c*Math.sin(rad)
  const l1=Math.pow(l+.3963377774*a+.2158037573*b,3), m1=Math.pow(l-.1055613458*a-.0638541728*b,3), s1=Math.pow(l-.0894841775*a-1.291485548*b,3)
  return [linearToSrgb(4.0767416621*l1-3.3077115913*m1+.2309699292*s1),linearToSrgb(-1.2684380046*l1+2.6097574011*m1-.3413193965*s1),linearToSrgb(-.0041960863*l1-.7034186147*m1+1.707614701*s1)].map(v=>clamp(v,0,255)) as [number,number,number]
}
const parseColor = (input: string): Color | null => {
  const value=input.trim().toLowerCase(); let match
  if ((match=value.match(/^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i))) {
    let hex=match[1]; if(hex.length<5) hex=[...hex].map(char=>char+char).join(''); if(hex.length===6) hex+='ff'
    return {r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16),a:parseInt(hex.slice(6,8),16)/255}
  }
  if ((match=value.match(/^rgba?\(\s*([+-]?[\d.]+)%?\s*[, ]\s*([+-]?[\d.]+)%?\s*[, ]\s*([+-]?[\d.]+)%?(?:\s*[,/]\s*([\d.]+)%?)?\s*\)$/))) {
    const channelTokens=value.slice(value.indexOf('(')+1,value.lastIndexOf(')')).split(/[,/\s]+/).filter(Boolean).slice(0,3)
    const percent=channelTokens.every(token => token.endsWith('%')), values=[+match[1],+match[2],+match[3]]
    const alpha=match[4]===undefined?1:+match[4]/(value.match(/[,/]\s*[\d.]+%\s*\)$/)?100:1)
    if(values.some(Number.isNaN)||Number.isNaN(alpha)) return null
    return {r:clamp(values[0]*(percent?2.55:1),0,255),g:clamp(values[1]*(percent?2.55:1),0,255),b:clamp(values[2]*(percent?2.55:1),0,255),a:clamp(alpha)}
  }
  if ((match=value.match(/^hsla?\(\s*([+-]?[\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%(?:\s*[,/]\s*([\d.]+)%?)?\s*\)$/))) {
    const rgb=hslToRgb(+match[1],+match[2]/100,+match[3]/100), alpha=match[4]===undefined?1:+match[4]/(value.match(/[,/]\s*[\d.]+%\s*\)$/)?100:1)
    return {r:rgb[0],g:rgb[1],b:rgb[2],a:clamp(alpha)}
  }
  if ((match=value.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([+-]?[\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+)%?)?\s*\)$/))) {
    const l=+match[1]/(+match[1]<=1?1:100), rgb=oklchToRgb(l,+match[2],+match[3]), alpha=match[4]===undefined?1:+match[4]/(value.match(/\/\s*[\d.]+%/)?100:1)
    return {r:rgb[0],g:rgb[1],b:rgb[2],a:clamp(alpha)}
  }
  return null
}
const channelHex=(value:number)=>Math.round(clamp(value,0,255)).toString(16).padStart(2,'0')
const hex=(c:Color, alpha=true)=>`#${channelHex(c.r)}${channelHex(c.g)}${channelHex(c.b)}${alpha&&c.a<.999?channelHex(c.a*255):''}`
const rgb=(c:Color)=>`${c.a<.999?'rgba':'rgb'}(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}${c.a<.999?`, ${+c.a.toFixed(3)}`:''})`
const rgbToHsl=(c:Color) => { const r=c.r/255,g=c.g/255,b=c.b/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2; let h=0; if(d) h=max===r?60*(((g-b)/d)%6):max===g?60*((b-r)/d+2):60*((r-g)/d+4); if(h<0)h+=360; return [h,d?d/(1-Math.abs(2*l-1)):0,l] }
const hsl=(c:Color)=>{const [h,s,l]=rgbToHsl(c);return `${c.a<.999?'hsla':'hsl'}(${+h.toFixed(1)}, ${+(s*100).toFixed(1)}%, ${+(l*100).toFixed(1)}%${c.a<.999?`, ${+c.a.toFixed(3)}`:''})`}
const srgbLinear=(v:number)=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}
const oklch=(c:Color)=>{const r=srgbLinear(c.r),g=srgbLinear(c.g),b=srgbLinear(c.b),l0=.4122214708*r+.5363325363*g+.0514459929*b,m0=.2119034982*r+.6806995451*g+.1073969566*b,s0=.0883024619*r+.2817188376*g+.6299787005*b,l=Math.cbrt(l0),m=Math.cbrt(m0),s=Math.cbrt(s0),L=.2104542553*l+.793617785*m-.0040720468*s,a=1.9779984951*l-2.428592205*m+.4505937099*s,b2=.0259040371*l+.7827717662*m-.808675766*s,C=Math.sqrt(a*a+b2*b2),H=(Math.atan2(b2,a)*180/Math.PI+360)%360;return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}${c.a<.999?` / ${+c.a.toFixed(3)}`:''})`}
const composite=(c:Color,bg:Color):Color=>({r:c.r*c.a+bg.r*(1-c.a),g:c.g*c.a+bg.g*(1-c.a),b:c.b*c.a+bg.b*(1-c.a),a:1})
const luminance=(c:Color)=>.2126*srgbLinear(c.r)+.7152*srgbLinear(c.g)+.0722*srgbLinear(c.b)

const value=ref('#ff0000'), picker=ref('#ff0000'), foreground=ref('#000000'), background=ref('#ffffff')
const color=computed(()=>parseColor(value.value)), fg=computed(()=>parseColor(foreground.value)), bg=computed(()=>parseColor(background.value))
const contrast=computed(()=>{if(!fg.value||!bg.value)return null;const base=composite(bg.value,{r:255,g:255,b:255,a:1}),front=composite(fg.value,base),a=luminance(front),b=luminance(base);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)})
const pick=(event:Event)=>{const next=(event.target as HTMLInputElement).value;picker.value=next;const alpha=color.value?.a??1;value.value=next+(alpha<.999?channelHex(alpha*255):'')}
const swap=()=>{const old=foreground.value;foreground.value=background.value;background.value=old}
</script>

<template><ToolLayout variant="split">
  <Panel title="Color converter">
    <div class="picker-row"><input v-model="picker" type="color" data-test-id="color-picker" aria-label="Color picker" @input="pick"><FormField label="Color" for-id="color-input"><input id="color-input" v-model="value" class="field field--mono" data-test-id="color-input"></FormField></div>
    <div v-if="color" class="swatch" :style="{backgroundColor:rgb(color)}" data-test-id="color-swatch"><span>Alpha {{ Math.round(color.a*100) }}%</span></div>
    <div v-if="color" class="results"><ResultRow :value="hex(color)" data-test-id="color-hex"><CopyButton :text="hex(color)" /></ResultRow><ResultRow :value="rgb(color)" data-test-id="color-rgb"><CopyButton :text="rgb(color)" /></ResultRow><ResultRow :value="hsl(color)" data-test-id="color-hsl"><CopyButton :text="hsl(color)" /></ResultRow><ResultRow :value="oklch(color)" data-test-id="color-oklch"><CopyButton :text="oklch(color)" /></ResultRow></div>
    <div v-else class="alert" data-test-id="color-error">Enter a valid HEX, RGB, HSL, or OKLCH color.</div>
  </Panel>
  <Panel title="Contrast checker">
    <div class="contrast-inputs"><FormField label="Foreground" for-id="contrast-fg"><input id="contrast-fg" v-model="foreground" class="field field--mono" data-test-id="contrast-fg"></FormField><button class="btn" type="button" data-test-id="contrast-swap" @click="swap">Swap</button><FormField label="Background" for-id="contrast-bg"><input id="contrast-bg" v-model="background" class="field field--mono" data-test-id="contrast-bg"></FormField></div>
    <template v-if="fg && bg && contrast"><div class="preview" :style="{color:rgb(fg),backgroundColor:rgb(bg)}"><strong>Large sample text</strong><span>Normal sample text for readability</span></div><ResultRow :value="`${contrast.toFixed(2)}:1`" data-test-id="contrast-ratio" /><div class="badges"><span v-for="item in ([['aa-normal','AA normal',4.5],['aa-large','AA large',3],['aaa-normal','AAA normal',7],['aaa-large','AAA large',4.5]] as const)" :key="item[0]" class="badge" :class="contrast>=item[2]?'pass':'fail'" :data-test-id="`contrast-${item[0]}`">{{ item[1] }}: {{ contrast>=item[2]?'Pass':'Fail' }}</span></div></template>
    <EmptyState v-else>Enter valid foreground and background colors</EmptyState>
  </Panel>
</ToolLayout></template>

<style scoped>
.picker-row{align-items:end;display:grid;gap:var(--space-3);grid-template-columns:64px 1fr}.picker-row input[type=color]{background:var(--bg-field);border:1px solid var(--line);border-radius:var(--radius-sm);height:40px;padding:3px;width:64px}.swatch{align-items:end;border:1px solid var(--line);border-radius:var(--radius-md);display:flex;height:130px;margin:var(--space-4) 0;padding:var(--space-2)}.swatch span{background:var(--bg-pane);border-radius:var(--radius-sm);color:var(--fg);font-size:var(--text-xs);padding:var(--space-1) var(--space-2)}.results{display:grid;gap:var(--space-2)}.contrast-inputs{align-items:end;display:grid;gap:var(--space-2);grid-template-columns:1fr auto 1fr}.preview{border:1px solid var(--line);border-radius:var(--radius-md);display:grid;gap:var(--space-3);margin:var(--space-4) 0;padding:var(--space-5);font-family:var(--font-body)}.preview strong{font-size:1.5rem}.badges{display:grid;gap:var(--space-2);grid-template-columns:repeat(2,1fr);margin-top:var(--space-3)}.badge{border:1px solid currentColor;border-radius:var(--radius-full);font:700 var(--text-xs)/1 var(--font-ui);padding:var(--space-2);text-align:center}.pass{color:var(--accent)}.fail{color:var(--danger)}
@media(max-width:800px){.contrast-inputs{grid-template-columns:1fr}.badges{grid-template-columns:1fr 1fr}}
</style>
