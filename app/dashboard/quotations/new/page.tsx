'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MARGIN_STEPS=[50,40,30,20,10]
const CURRENCIES=['USD','EUR','GBP','PKR','AED','CNY']
const PAYMENT_TERMS=['100% Advance','30% Advance 70% on BL','LC at Sight','LC 30 Days','Net 30 Days','Net 60 Days','DA 60 Days','DP at Sight']
const INCOTERMS=['CIF Karachi','FOB Origin','EXW Factory','DAP Karachi','DDP Karachi','CFR Karachi','FCA Origin']

const BI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #3b82f6',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const OI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #f97316',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const AI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #d97706',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const LBL:React.CSSProperties={display:'block',fontSize:'12px',fontWeight:700,color:'#374151',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'0.07em'}
const F=({label,children}:{label:string;children:React.ReactNode})=><div><label style={LBL}>{label}</label>{children}</div>

interface Project{project_code:string;product_description:string;manufacturer:string;company_id:string;companies?:{company_name:string};margin_step?:number}
interface FX{currency:string;rate_pkr:number;rate_date:string}

export default function NewQuotationPage(){
  const router=useRouter()
  const [projects,setProjects]=useState<Project[]>([])
  const [fx,setFx]=useState<FX[]>([])
  const [form,setForm]=useState({project_code:'',unit_price:'',currency:'USD',quantity:'1',validity_days:'30',payment_terms:'100% Advance',delivery_days:'',incoterms:'CIF Karachi',notes:''})
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')

  useEffect(()=>{
    supabase.from('rfq_projects').select('project_code,product_description,manufacturer,company_id,companies(company_name),margin_step').in('status',['NEW','IN_PROGRESS','QUOTED']).order('created_at',{ascending:false}).then(({data})=>{if(data)setProjects(data as unknown as Project[])})
    supabase.from('fx_rates').select('currency,rate_pkr,rate_date').then(({data})=>{if(data)setFx(data)})
  },[])

  const proj=projects.find(p=>p.project_code===form.project_code)
  const mStep=proj?.margin_step??0
  const mPct=MARGIN_STEPS[Math.min(mStep,4)]
  const fxRate=fx.find(r=>r.currency===form.currency)
  const up=parseFloat(form.unit_price)||0
  const qty=parseInt(form.quantity)||1
  const totalF=up*qty
  const totalPKR=fxRate?totalF*fxRate.rate_pkr:0
  const sellPKR=totalPKR*(1+mPct/100)

  function handle(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>){
    setForm(f=>({...f,[e.target.name]:e.target.value}))
  }

  async function save(){
    setError('')
    if(!form.project_code||!form.unit_price){setError('Project and Unit Price are required.');return}
    setSaving(true)
    const qd=new Date().toISOString().split('T')[0]
    const{error:err}=await supabase.from('quotations').insert({project_code:form.project_code,company_id:proj?.company_id,quote_date:qd,fx_date_frozen:fxRate?.rate_date||qd,currency:form.currency,fx_rate_pkr:fxRate?.rate_pkr||null,unit_price:up,quantity:qty,total_foreign:totalF,total_pkr:totalPKR,margin_pct:mPct,margin_amount_pkr:totalPKR*(mPct/100),selling_price_pkr:sellPKR,validity_days:parseInt(form.validity_days),payment_terms:form.payment_terms,delivery_days:form.delivery_days?parseInt(form.delivery_days):null,incoterms:form.incoterms,notes:form.notes,status:'DRAFT'})
    setSaving(false)
    if(err){setError(err.message);return}
    setSuccess('Quotation saved as DRAFT')
    setTimeout(()=>router.push('/dashboard/quotations'),1500)
  }

  return(
    <div style={{padding:'32px',maxWidth:'780px',background:'#0f172a',minHeight:'100vh'}}>
      <button onClick={()=>router.back()} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'14px',marginBottom:'20px',padding:0}}>← Back to Quotations</button>

      {/* Page Header — Amber */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'10px',padding:'20px 24px',marginBottom:'16px'}}>
        <div style={{fontSize:'11px',fontWeight:700,color:'#d97706',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'8px'}}>New Entry</div>
        <h1 style={{fontSize:'26px',fontWeight:700,color:'#111827',margin:'0 0 4px'}}>New Quotation</h1>
        <p style={{color:'#6b7280',fontSize:'14px',margin:0}}>FX rates frozen at today — margin engine auto-calculates selling price</p>
      </div>

      {/* Section 1: Select Project — BLUE */}
      <div style={{background:'#eff6ff',border:'2px solid #3b82f6',borderRadius:'10px',padding:'22px',marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#2563eb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #3b82f644',paddingBottom:'10px'}}>Select Project</div>
        <F label="Project *"><select name="project_code" value={form.project_code} onChange={handle} style={BI}><option value="">— Select Open Project —</option>{projects.map(p=><option key={p.project_code} value={p.project_code}>{p.project_code} | {(p.companies as any)?.company_name||p.company_id} | {p.product_description?.substring(0,40)}</option>)}</select></F>
        {proj&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginTop:'16px',background:'#ffffff',border:'2px solid #3b82f6',borderRadius:'8px',padding:'14px'}}>
            <div><div style={{fontSize:'11px',color:'#6b7280',marginBottom:'4px',fontWeight:700,textTransform:'uppercase'}}>Project</div><div style={{fontFamily:'monospace',fontSize:'14px',color:'#1d4ed8',fontWeight:700}}>{proj.project_code}</div></div>
            <div><div style={{fontSize:'11px',color:'#6b7280',marginBottom:'4px',fontWeight:700,textTransform:'uppercase'}}>Manufacturer</div><div style={{fontSize:'14px',color:'#111827'}}>{proj.manufacturer||'—'}</div></div>
            <div><div style={{fontSize:'11px',color:'#6b7280',marginBottom:'4px',fontWeight:700,textTransform:'uppercase'}}>Product</div><div style={{fontSize:'14px',color:'#111827'}}>{proj.product_description?.substring(0,40)||'—'}</div></div>
          </div>
        )}
      </div>

      {/* Section 2: Pricing — ORANGE (Products color) */}
      <div style={{background:'#fff7ed',border:'2px solid #f97316',borderRadius:'10px',padding:'22px',marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#ea580c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #f9731644',paddingBottom:'10px'}}>Pricing</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',marginBottom:'20px'}}>
          <F label="Unit Price *"><input name="unit_price" value={form.unit_price} onChange={handle} placeholder="0.00" type="number" step="0.01" style={OI}/></F>
          <F label="Currency"><select name="currency" value={form.currency} onChange={handle} style={OI}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></F>
          <F label="Quantity"><input name="quantity" value={form.quantity} onChange={handle} type="number" style={OI}/></F>
        </div>

        {/* Margin Engine */}
        <div style={{background:'#ffffff',border:'2px solid #f97316',borderRadius:'8px',padding:'16px'}}>
          <div style={{fontSize:'12px',color:'#ea580c',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'12px',fontWeight:700}}>Margin Engine — Step {mStep+1}/5 — {mPct}% margin applied</div>
          <div style={{display:'flex',gap:'6px',marginBottom:'16px'}}>
            {MARGIN_STEPS.map((p,i)=>(
              <div key={i} style={{flex:1,padding:'8px',borderRadius:'6px',textAlign:'center' as const,fontSize:'14px',fontWeight:700,background:i===mStep?'#f97316':'#f1f5f9',color:i===mStep?'#ffffff':i<mStep?'#dc2626':'#9ca3af',border:'2px solid '+(i===mStep?'#f97316':'#e5e7eb')}}>{p}%</div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
            {[
              {label:'Total ('+form.currency+')',value:totalF?totalF.toLocaleString('en-US',{minimumFractionDigits:2}):'—'},
              {label:'FX Rate (PKR)',value:fxRate?fxRate.rate_pkr.toFixed(2):'Not in DB'},
              {label:'Cost (PKR)',value:totalPKR?'PKR '+Math.round(totalPKR).toLocaleString():'—'},
              {label:'Sell Price +'+mPct+'%',value:sellPKR?'PKR '+Math.round(sellPKR).toLocaleString():'—',highlight:true},
            ].map((cell,i)=>(
              <div key={i} style={{background:cell.highlight?'#fff7ed':'#f9fafb',border:'2px solid '+(cell.highlight?'#f97316':'#e5e7eb'),borderRadius:'6px',padding:'10px'}}>
                <div style={{fontSize:'11px',color:'#6b7280',marginBottom:'4px',fontWeight:700,textTransform:'uppercase'}}>{cell.label}</div>
                <div style={{fontFamily:'monospace',fontSize:'13px',fontWeight:700,color:cell.highlight?'#ea580c':'#111827'}}>{cell.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Trade Terms — AMBER */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'10px',padding:'22px',marginBottom:'24px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #d9770644',paddingBottom:'10px'}}>Trade Terms</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'16px',marginBottom:'16px'}}>
          <F label="Validity (Days)"><input name="validity_days" value={form.validity_days} onChange={handle} type="number" style={AI}/></F>
          <F label="Payment Terms"><select name="payment_terms" value={form.payment_terms} onChange={handle} style={AI}>{PAYMENT_TERMS.map(p=><option key={p}>{p}</option>)}</select></F>
          <F label="Delivery (Days)"><input name="delivery_days" value={form.delivery_days} onChange={handle} type="number" placeholder="45" style={AI}/></F>
          <F label="Incoterms"><select name="incoterms" value={form.incoterms} onChange={handle} style={AI}>{INCOTERMS.map(i=><option key={i}>{i}</option>)}</select></F>
        </div>
        <F label="Notes"><textarea name="notes" value={form.notes} onChange={handle} rows={3} style={{...AI,resize:'vertical' as const}}/></F>
      </div>

      <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
        <button onClick={save} disabled={saving} style={{background:'#e8a93a',color:'#111827',border:'none',borderRadius:'8px',padding:'12px 32px',fontSize:'15px',fontWeight:700,cursor:'pointer'}}>{saving?'Saving...':'Save Draft Quotation'}</button>
        <button onClick={()=>router.back()} style={{background:'#e2e8f0',border:'none',color:'#374151',borderRadius:'8px',padding:'12px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>Cancel</button>
        {error&&<span style={{color:'#dc2626',fontSize:'13px',fontWeight:600}}>{error}</span>}
        {success&&<span style={{color:'#16a34a',fontSize:'13px',fontWeight:600}}>{success}</span>}
      </div>
    </div>
  )
}
