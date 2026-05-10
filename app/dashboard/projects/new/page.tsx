'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function genCode(){
  const L='ABCDEFGHJKLMNPQRSTUVWXYZ'
  const r=(n:number)=>Array.from({length:n},()=>L[Math.floor(Math.random()*L.length)]).join('')
  return r(4)+'-'+r(3)+'-'+r(2)
}
function internalCode(code:string){
  const n=new Date(),p=(x:number)=>String(x).padStart(2,'0')
  return code+'-'+n.getFullYear()+p(n.getMonth()+1)+p(n.getDate())+'-'+p(n.getHours())+p(n.getMinutes())+p(n.getSeconds())
}

const UNITS=['KG','MT','LT','AM.Ton','LBS','Meters','Feet','Liters','Numbers','Pcs','Sets','Bags','Drums','Cartons']
const CURRENCIES=['USD','EUR','GBP','PKR','AED','CNY']
const PAYMENT_TERMS=['100% Advance','30% Advance 70% on BL','LC at Sight','LC 30 Days','Net 30 Days','Net 60 Days','DA 60 Days','DP at Sight']
const INCOTERMS=['CIF Karachi','FOB Origin','EXW Factory','DAP Karachi','DDP Karachi','CFR Karachi','FCA Origin']

// Input styles matching dashboard colors
const BI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #3b82f6',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const GI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #22c55e',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const OI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #f97316',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const AI:React.CSSProperties={width:'100%',background:'#ffffff',border:'2px solid #d97706',borderRadius:'6px',padding:'10px 13px',color:'#111827',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}
const LBL:React.CSSProperties={display:'block',fontSize:'12px',fontWeight:700,color:'#374151',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'0.07em'}
const F=({label,children}:{label:string;children:React.ReactNode})=><div><label style={LBL}>{label}</label>{children}</div>

export default function NewProjectPage(){
  const router=useRouter()
  const [code,setCode]=useState('')
  const [companies,setCompanies]=useState<{company_id:string;company_name:string}[]>([])
  const [form,setForm]=useState({company_id:'',contact_name:'',contact_email:'',product_description:'',manufacturer:'',part_no:'',quantity:'',unit:'KG',currency:'USD',payment_terms:'100% Advance',incoterms:'CIF Karachi',source:'EMAIL',priority:'NORMAL',notes:''})
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')

  useEffect(()=>{
    setCode(genCode())
    supabase.from('companies').select('company_id,company_name').order('company_name').then(({data})=>{if(data)setCompanies(data)})
  },[])

  function handle(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>){
    setForm(f=>({...f,[e.target.name]:e.target.value}))
  }

  async function save(){
    setError('')
    if(!form.company_id||!form.product_description){setError('Company and Product Description are required.');return}
    setSaving(true)
    const ic=internalCode(code)
    const subject='Enquiry No. '+code+' | '+(form.manufacturer||'TBC')+' | '+form.product_description.substring(0,60)
    const{error:err}=await supabase.from('rfq_projects').insert({project_code:code,internal_code:ic,company_id:form.company_id,contact_name:form.contact_name,contact_email:form.contact_email.toLowerCase().trim(),subject,product_description:form.product_description,manufacturer:form.manufacturer,part_no:form.part_no,quantity:form.quantity?parseInt(form.quantity):null,currency:form.currency,source:form.source,priority:form.priority,notes:form.notes,status:'NEW'})
    setSaving(false)
    if(err){setError(err.message);return}
    setSuccess('Project created — '+code)
    setTimeout(()=>router.push('/dashboard/projects'),1500)
  }

  return(
    <div style={{padding:'32px',maxWidth:'780px',background:'#0f172a',minHeight:'100vh'}}>
      <button onClick={()=>router.back()} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'14px',marginBottom:'20px',padding:0}}>← Back to Projects</button>

      {/* Page Header — Amber */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'10px',padding:'20px 24px',marginBottom:'16px'}}>
        <div style={{fontSize:'11px',fontWeight:700,color:'#d97706',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'8px'}}>New Entry</div>
        <h1 style={{fontSize:'26px',fontWeight:700,color:'#111827',margin:'0 0 4px'}}>New Project</h1>
        <p style={{color:'#6b7280',fontSize:'14px',margin:0}}>Create a new RFQ project with auto-generated tracking code</p>
      </div>

      {/* Section 1: Project Code — BLUE (Projects color) */}
      <div style={{background:'#eff6ff',border:'2px solid #3b82f6',borderRadius:'10px',padding:'22px',marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#2563eb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #3b82f644',paddingBottom:'10px'}}>Project Code</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontFamily:'monospace',fontSize:'26px',fontWeight:700,color:'#111827',letterSpacing:'0.18em'}}>{code}</div>
            <div style={{fontSize:'12px',color:'#6b7280',marginTop:'4px'}}>Internal: {code?internalCode(code):'—'}</div>
          </div>
          <button onClick={()=>setCode(genCode())} style={{background:'#3b82f6',color:'#ffffff',border:'none',borderRadius:'6px',padding:'9px 18px',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>↻ New Code</button>
        </div>
        <div style={{marginTop:'16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <F label="Priority"><select name="priority" value={form.priority} onChange={handle} style={BI}><option value="NORMAL">Normal</option><option value="URGENT">Urgent</option><option value="LOW">Low</option></select></F>
          <F label="Source of RFQ"><select name="source" value={form.source} onChange={handle} style={BI}><option value="EMAIL">Email</option><option value="WHATSAPP">WhatsApp</option><option value="PHONE">Phone Call</option><option value="VERBAL">Verbal / Meeting</option><option value="CAMPAIGN">Campaign Lead</option></select></F>
        </div>
      </div>

      {/* Section 2: Customer & Source — GREEN (Companies color) */}
      <div style={{background:'#f0fdf4',border:'2px solid #22c55e',borderRadius:'10px',padding:'22px',marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#16a34a',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #22c55e44',paddingBottom:'10px'}}>Customer Details</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
          <F label="Company *"><select name="company_id" value={form.company_id} onChange={handle} style={GI}><option value="">— Select Company —</option>{companies.map(c=><option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}</select></F>
          <F label="Contact Person Name"><input name="contact_name" value={form.contact_name} onChange={handle} placeholder="Name of person who sent the RFQ" style={GI}/></F>
        </div>
        <F label="Contact Email"><input name="contact_email" value={form.contact_email} onChange={handle} placeholder="contact@company.com" style={GI}/></F>
      </div>

      {/* Section 3: Product Details — ORANGE (Products color) */}
      <div style={{background:'#fff7ed',border:'2px solid #f97316',borderRadius:'10px',padding:'22px',marginBottom:'16px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#ea580c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'18px',borderBottom:'2px solid #f9731644',paddingBottom:'10px'}}>Product Details</div>
        <F label="Product Description *"><input name="product_description" value={form.product_description} onChange={handle} placeholder="Full product name exactly as received from customer" style={OI}/></F>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',margin:'16px 0'}}>
          <F label="Manufacturer / Brand"><input name="manufacturer" value={form.manufacturer} onChange={handle} placeholder="e.g. Merck, Siemens, ABB" style={OI}/></F>
          <F label="Part / Catalogue Number"><input name="part_no" value={form.part_no} onChange={handle} placeholder="e.g. 1.06404.1000" style={OI}/></F>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'16px'}}>
          <F label="Quantity"><input name="quantity" value={form.quantity} onChange={handle} type="number" placeholder="50" style={OI}/></F>
          <F label="Unit"><select name="unit" value={form.unit} onChange={handle} style={OI}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></F>
          <F label="Currency"><select name="currency" value={form.currency} onChange={handle} style={OI}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></F>
          <F label="Payment Terms"><select name="payment_terms" value={form.payment_terms} onChange={handle} style={OI}>{PAYMENT_TERMS.map(p=><option key={p}>{p}</option>)}</select></F>
        </div>
        <div style={{marginTop:'16px'}}>
          <F label="Incoterms"><select name="incoterms" value={form.incoterms} onChange={handle} style={OI}>{INCOTERMS.map(i=><option key={i}>{i}</option>)}</select></F>
        </div>
      </div>

      {/* Section 4: Email Subject + Notes — AMBER */}
      <div style={{background:'#fffbeb',border:'2px solid #d97706',borderRadius:'10px',padding:'22px',marginBottom:'24px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'14px',borderBottom:'2px solid #d9770644',paddingBottom:'10px'}}>Auto Email Subject</div>
        <div style={{fontFamily:'monospace',fontSize:'13px',color:'#111827',background:'#ffffff',border:'2px solid #d97706',borderRadius:'6px',padding:'10px 14px',marginBottom:'16px'}}>
          Enquiry No. {code} | {form.manufacturer||'TBC'} | {form.product_description.substring(0,50)||'...'}
        </div>
        <F label="Internal Notes"><textarea name="notes" value={form.notes} onChange={handle} rows={3} placeholder="Any special requirements or internal notes..." style={{...AI,resize:'vertical' as const}}/></F>
      </div>

      <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
        <button onClick={save} disabled={saving} style={{background:'#60a5fa',color:'#111827',border:'none',borderRadius:'8px',padding:'12px 32px',fontSize:'15px',fontWeight:700,cursor:'pointer'}}>{saving?'Saving...':'Create Project'}</button>
        <button onClick={()=>router.back()} style={{background:'#e2e8f0',border:'none',color:'#374151',borderRadius:'8px',padding:'12px 24px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>Cancel</button>
        {error&&<span style={{color:'#dc2626',fontSize:'13px',fontWeight:600}}>{error}</span>}
        {success&&<span style={{color:'#16a34a',fontSize:'13px',fontWeight:600}}>{success}</span>}
      </div>
    </div>
  )
}
