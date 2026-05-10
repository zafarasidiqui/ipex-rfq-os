'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const COUNTRIES: Record<string,string> = {PK:'Pakistan',DE:'Germany',US:'United States',GB:'United Kingdom',AE:'UAE',CN:'China',IN:'India',SA:'Saudi Arabia',TR:'Turkey',IT:'Italy',FR:'France',NL:'Netherlands',CH:'Switzerland',JP:'Japan',KR:'South Korea'}
const IATA: Record<string,string> = {PK:'KHI',DE:'FRA',US:'JFK',GB:'LHR',AE:'DXB',CN:'PEK',IN:'BOM',SA:'RUH',TR:'IST',IT:'MXP',FR:'CDG',NL:'AMS',CH:'ZRH',JP:'NRT',KR:'ICN'}

function genID(country:string,iata:string,postal:string,name:string){
  const co=name.toUpperCase().replace(/[^A-Z]/g,'').substring(0,7).padEnd(7,'X')
  return country+iata+postal+co
}

export default function NewCompanyPage(){
  const router=useRouter()
  const [form,setForm]=useState({company_name:'',country:'PK',iata:'KHI',postal_code:'',city:'',address:'',phone:'',email:'',website:'',type:'CUSTOMER',industry:'',notes:''})
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')

  const cid=form.company_name&&form.postal_code?genID(form.country,form.iata,form.postal_code,form.company_name):'— fill name & postal code —'

  function handle(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>){
    const{name,value}=e.target
    if(name==='country') setForm(f=>({...f,country:value,iata:IATA[value]||''}))
    else setForm(f=>({...f,[name]:value}))
  }

  async function save(){
    setError('')
    if(!form.company_name||!form.postal_code||!form.city){setError('Company Name, Postal Code and City are required.');return}
    setSaving(true)
    const company_id=genID(form.country,form.iata,form.postal_code,form.company_name)
    const{error:err}=await supabase.from('companies').upsert({company_id,company_name:form.company_name,country:form.country,iata_code:form.iata,postal_code:form.postal_code,city:form.city,address:form.address,phone:form.phone,email:form.email.toLowerCase().trim(),website:form.website,type:form.type,industry:form.industry,notes:form.notes,status:'ACTIVE'},{onConflict:'company_id'})
    setSaving(false)
    if(err){setError(err.message);return}
    setSuccess('Saved — '+company_id)
    setTimeout(()=>router.push('/dashboard/companies'),1500)
  }

  const GI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #22c55e',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
  const AI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #e8a93a',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
  const LBL:React.CSSProperties={display:'block',fontSize:'12px',fontWeight:700,color:'#374151',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'0.07em'}
  const F=({label,children}:{label:string;children:React.ReactNode})=><div><label style={LBL}>{label}</label>{children}</div>

  return(
    <div style={{padding:'32px',maxWidth:'780px',background:'#0f172a',minHeight:'100vh'}}>
      <button onClick={()=>router.back()} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'14px',marginBottom:'20px',padding:0}}>← Back to Companies</button>

      {/* Page Header — Amber (Pending Approval color) */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'10px',padding:'20px 24px',marginBottom:'16px'}}>
        <div style={{fontSize:'11px',fontWeight:700,color:'#d97706',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'8px'}}>New Entry</div>
        <h1 style={{fontSize:'26px',fontWeight:700,color:'#111827',margin:'0 0 4px'}}>New Company</h1>
        <p style={{color:'#6b7280',fontSize:'14px',margin:0}}>Add a customer, supplier or both to the universal database</p>
      </div>

      {/* Company ID — Amber */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'8px',padding:'16px 20px',marginBottom:'16px'}}>
        <div style={{fontSize:'11px',color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px',fontWeight:700}}>Auto-Generated Company ID</div>
        <div style={{fontFamily:'monospace',fontSize:'22px',fontWeight:700,color:'#111827',letterSpacing:'0.12em'}}>{cid}</div>
        <div style={{fontSize:'12px',color:'#6b7280',marginTop:'6px'}}>Country + IATA + Postal + Company Name · Permanent & unique forever</div>
      </div>

      {/* Section 1: Company Identity — GREEN (Companies color) */}
      <div style={{background:'#f0fdf4',border:'2px solid #22c55e',borderRadius:'10px',padding:'22px',marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#16a34a',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #22c55e44',paddingBottom:'10px'}}>Company Identity</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
          <F label="Company Name *"><input name="company_name" value={form.company_name} onChange={handle} placeholder="Abbott Laboratories Pakistan" style={GI}/></F>
          <F label="Company Type"><select name="type" value={form.type} onChange={handle} style={GI}><option value="CUSTOMER">Customer</option><option value="SUPPLIER">Supplier</option><option value="BOTH">Both — Customer & Supplier</option></select></F>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',marginBottom:'16px'}}>
          <F label="Country"><select name="country" value={form.country} onChange={handle} style={GI}>{Object.entries(COUNTRIES).map(([c,n])=><option key={c} value={c}>{c} — {n}</option>)}</select></F>
          <F label="IATA Airport Code"><input name="iata" value={form.iata} onChange={handle} maxLength={3} style={{...GI,textTransform:'uppercase'}} placeholder="KHI"/></F>
          <F label="Postal Code *"><input name="postal_code" value={form.postal_code} onChange={handle} placeholder="75400" style={GI}/></F>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <F label="City *"><input name="city" value={form.city} onChange={handle} placeholder="Karachi" style={GI}/></F>
          <F label="Industry Sector"><input name="industry" value={form.industry} onChange={handle} placeholder="Pharmaceuticals, Chemicals..." style={GI}/></F>
        </div>
      </div>

      {/* Section 2: Contact Details — AMBER (Pending Approval color) */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'10px',padding:'22px',marginBottom:'24px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #d9770644',paddingBottom:'10px'}}>Contact Details</div>
        <F label="Street Address"><input name="address" value={form.address} onChange={handle} placeholder="Building, Street, Area" style={AI}/></F>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',margin:'16px 0'}}>
          <F label="Email Address"><input name="email" value={form.email} onChange={handle} placeholder="info@company.com" style={AI}/></F>
          <F label="Phone Number"><input name="phone" value={form.phone} onChange={handle} placeholder="+92-21-..." style={AI}/></F>
          <F label="Website"><input name="website" value={form.website} onChange={handle} placeholder="www.company.com" style={AI}/></F>
        </div>
        <F label="Internal Notes"><textarea name="notes" value={form.notes} onChange={handle} rows={3} style={{...AI,resize:'vertical' as const}}/></F>
      </div>

      <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
        <button onClick={save} disabled={saving} style={{background:'#4ade80',color:'#111827',border:'none',borderRadius:'8px',padding:'12px 32px',fontSize:'15px',fontWeight:700,cursor:'pointer'}}>{saving?'Saving...':'Save Company'}</button>
        <button onClick={()=>router.back()} style={{background:'#e2e8f0',border:'none',color:'#374151',borderRadius:'8px',padding:'12px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>Cancel</button>
        {error&&<span style={{color:'#dc2626',fontSize:'13px',fontWeight:600}}>{error}</span>}
        {success&&<span style={{color:'#16a34a',fontSize:'13px',fontWeight:600}}>{success}</span>}
      </div>
    </div>
  )
}
