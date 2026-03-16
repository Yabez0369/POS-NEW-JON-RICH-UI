// ═══════════════════════════════════════════════════════════════
// SCSTix EPOS — CORE DATA, UTILITIES & SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

export { THEMES } from '@/lib/theme'
export { PRODUCT_IMAGES } from '@/lib/seed-data'

export const INITIAL_PRODUCTS = [
  {id:1,name:"Home Jersey 2024",sku:"JRS-HOME-24",category:"Jerseys",price:89.99,stock:45,emoji:"🔴",featured:true,description:"Official 2024 home kit jersey. Premium quality breathable fabric, moisture-wicking technology. Club crest embroidered on chest.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red/White"],material:"100% Polyester",fit:"Regular Fit",care:"Machine wash 30°C",brand:"SCSTix Official"},
  {id:2,name:"Away Jersey 2024",sku:"JRS-AWAY-24",category:"Jerseys",price:89.99,stock:32,emoji:"⚪",featured:true,description:"Official 2024 away kit jersey. Lightweight performance fabric with ventilation zones.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["White/Blue"],material:"100% Polyester",fit:"Slim Fit",care:"Machine wash 30°C",brand:"SCSTix Official"},
  {id:3,name:"Third Kit Jersey",sku:"JRS-THIRD-24",category:"Jerseys",price:84.99,stock:18,emoji:"🔵",featured:false,description:"Limited edition third kit. Bold design with contrast trim, limited run of 500 units.",discount:0,sizes:["S","M","L","XL","XXL"],colors:["Navy Blue"],material:"100% Polyester",fit:"Regular Fit",care:"Machine wash 30°C",brand:"SCSTix Official"},
  {id:4,name:"Training Jacket",sku:"TRN-JKT-24",category:"Training Wear",price:64.99,stock:27,emoji:"🧥",featured:true,description:"Lightweight training jacket with zip pockets. Wind-resistant shell, perfect for matchday warm-up.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red","Black"],material:"95% Polyester, 5% Elastane",fit:"Athletic Fit",care:"Machine wash 40°C",brand:"SCSTix Official"},
  {id:5,name:"Training Shorts",sku:"TRN-SHT-24",category:"Training Wear",price:34.99,stock:41,emoji:"🩳",featured:false,description:"Pro training shorts with elastic waistband and side pockets.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red","Black","White"],material:"100% Polyester",fit:"Regular Fit",care:"Machine wash 40°C",waist:"28-38 inches adjustable",brand:"SCSTix Official"},
  {id:6,name:"Football Scarf",sku:"ACC-SCARF-01",category:"Fan Accessories",price:19.99,stock:120,emoji:"🧣",featured:true,description:"Knitted team scarf, double-sided club colours. Official merchandise.",discount:0,sizes:["One Size"],colors:["Red/White"],material:"100% Acrylic",length:"150cm",width:"20cm",care:"Hand wash cold",brand:"SCSTix Official"},
  {id:7,name:"Team Cap",sku:"ACC-CAP-01",category:"Fan Accessories",price:24.99,stock:85,emoji:"🧢",featured:false,description:"Embroidered team cap with adjustable strap.",discount:0,sizes:["One Size (Adjustable)"],colors:["Red","Black","White"],material:"Cotton Twill",fit:"Structured 6-panel",care:"Spot clean only",brand:"SCSTix Official"},
  {id:8,name:"Fan Hoodie",sku:"ACC-HOOD-01",category:"Fan Accessories",price:54.99,stock:33,emoji:"👕",featured:true,description:"Premium fan hoodie with kangaroo pocket. Soft fleece lining, printed club crest.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red","Navy","Grey"],material:"80% Cotton, 20% Polyester",fit:"Relaxed Fit",care:"Machine wash 30°C",brand:"SCSTix Official"},
  {id:9,name:"Match Ball Official",sku:"EQP-BALL-01",category:"Football Equipment",price:129.99,stock:12,emoji:"⚽",featured:true,description:"FIFA approved match ball. Used in official league matches. Thermally bonded panels.",discount:10,sizes:["Size 5 (Official)"],colors:["White/Black/Red"],material:"Synthetic leather, Latex bladder",circumference:"68-70cm",weight:"410-450g",care:"Wipe clean only",brand:"SCSTix Pro"},
  {id:10,name:"Goalkeeper Gloves",sku:"EQP-GLV-01",category:"Football Equipment",price:44.99,stock:8,emoji:"🥅",featured:false,description:"Pro goalkeeper gloves with 4mm latex palm. Negative cut for superior grip.",discount:0,sizes:["6","7","8","9","10","11"],colors:["Red/Black","Black/Yellow"],material:"German Latex Palm, Neoprene back",cut:"Negative Cut",care:"Hand wash cold, air dry",brand:"SCSTix Pro"},
  {id:11,name:"Shin Guards Pro",sku:"EQP-SHIN-01",category:"Football Equipment",price:29.99,stock:55,emoji:"🛡️",featured:false,description:"Lightweight shin guards with ankle protection. Hard shell with foam backing.",discount:0,sizes:["XS (6-9yrs)","S (9-12yrs)","M (12-15yrs)","L (15+yrs)"],colors:["Black","Red/Black"],material:"Polypropylene shell, EVA foam",height:"Multiple (see sizes)",care:"Wipe clean",brand:"SCSTix Pro"},
  {id:12,name:"Signed Jersey",sku:"COL-SIG-CAP",category:"Collectibles",price:249.99,stock:3,emoji:"✍️",featured:true,description:"Signed by the club captain. Comes with certificate of authenticity and display frame. Limited edition.",discount:0,sizes:["L (Display Size)"],colors:["Red/White (Home)"],material:"Official match jersey with authentic signature",edition:"Limited — only 3 remaining",includes:"Certificate of Authenticity, Display Frame",care:"Keep away from direct sunlight",brand:"SCSTix Collectibles"},
  {id:13,name:"Stadium Print A3",sku:"COL-PRT-01",category:"Collectibles",price:39.99,stock:22,emoji:"🖼️",featured:false,description:"A3 art print of the stadium, hand-numbered. Ideal for framing.",discount:0,sizes:["A3 (297 x 420mm)"],colors:["Full Colour"],material:"Premium 250gsm matte art paper",edition:"Hand-numbered limited edition",includes:"Cardboard backing, protective sleeve",care:"Store flat, frame to preserve",brand:"SCSTix Collectibles"},
  {id:14,name:"Mini Trophy Replica",sku:"COL-TRP-01",category:"Collectibles",price:79.99,stock:9,emoji:"🏆",featured:true,description:"Die-cast trophy replica, 1:5 scale. Gold plated finish.",discount:0,sizes:["1:5 Scale (28cm tall)"],colors:["Gold"],material:"Zinc alloy, gold plated",weight:"850g",includes:"Display stand, dust cloth, gift box",care:"Dust regularly, avoid moisture",brand:"SCSTix Collectibles"},
];

// TODO: Remove when Supabase Auth is wired
export const INITIAL_USERS = [
  {id:1,name:"Alex Rivera",email:"admin@fanstore.com",password:"admin123",role:"admin",avatar:"AR",phone:"07700900001",active:true,joinDate:"2023-01-01",loyaltyPoints:0,tier:"N/A"},
  {id:2,name:"Sam Chen",email:"manager@fanstore.com",password:"mgr123",role:"manager",avatar:"SC",phone:"07700900002",active:true,joinDate:"2023-01-15",loyaltyPoints:0,tier:"N/A"},
  {id:3,name:"Jordan Lee",email:"cashier@fanstore.com",password:"cash123",role:"cashier",counter:"Counter 1",avatar:"JL",phone:"07700900003",active:true,joinDate:"2023-03-01",loyaltyPoints:0,tier:"N/A"},
  {id:4,name:"Morgan Blake",email:"cashier2@fanstore.com",password:"cash456",role:"cashier",counter:"Counter 2",avatar:"MB",phone:"07700900004",active:true,joinDate:"2023-04-01",loyaltyPoints:0,tier:"N/A"},
  {id:5,name:"Taylor Smith",email:"customer@fanstore.com",password:"cust123",role:"customer",avatar:"TS",phone:"07700900005",active:true,joinDate:"2023-06-01",loyaltyPoints:320,tier:"Silver",pointsExpiry:"2025-06-01",totalSpent:1240},
  {id:6,name:"Chris Johnson",email:"chris@email.com",password:"cust456",role:"customer",avatar:"CJ",phone:"07700900006",active:true,joinDate:"2023-09-01",loyaltyPoints:45,tier:"Bronze",pointsExpiry:"2025-09-01",totalSpent:180},
  {id:7,name:"Alex Murphy",email:"staff1@fanstore.com",password:"staff123",role:"staff",avatar:"AM",phone:"07700900007",active:true,joinDate:"2024-01-01",counter:"Counter 1",loyaltyPoints:0,tier:"N/A"},
  {id:8,name:"Jamie Davis",email:"staff2@fanstore.com",password:"staff456",role:"staff",avatar:"JD",phone:"07700900008",active:true,joinDate:"2024-02-01",counter:"Counter 2",loyaltyPoints:0,tier:"N/A"},
];

export const INITIAL_ORDERS = [
  {id:"ORD-0001",customerId:5,customerName:"Taylor Smith",cashierId:3,cashierName:"Jordan Lee",items:[{productId:1,name:"Home Jersey 2024",qty:1,price:89.99,discount:0},{productId:6,name:"Football Scarf",qty:2,price:19.99,discount:0}],subtotal:129.97,tax:25.99,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:155.96,payment:"Card",cardLast4:"4242",date:"2024-01-15 10:23",counter:"Counter 1",status:"completed",orderType:"in-store",loyaltyEarned:155,loyaltyUsed:0},
  {id:"ORD-0002",customerId:6,customerName:"Chris Johnson",cashierId:4,cashierName:"Morgan Blake",items:[{productId:9,name:"Match Ball Official",qty:1,price:129.99,discount:0}],subtotal:129.99,tax:26.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:155.99,payment:"Cash",cashGiven:160,cashChange:4.01,date:"2024-01-15 11:45",counter:"Counter 2",status:"completed",orderType:"in-store",loyaltyEarned:155,loyaltyUsed:0},
  {id:"ORD-0003",customerId:null,customerName:"Walk-in",cashierId:3,cashierName:"Jordan Lee",items:[{productId:4,name:"Training Jacket",qty:1,price:64.99,discount:0},{productId:7,name:"Team Cap",qty:1,price:24.99,discount:0}],subtotal:89.98,tax:18.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:107.98,payment:"Card",cardLast4:"1234",date:"2024-01-15 13:12",counter:"Counter 1",status:"completed",orderType:"in-store",loyaltyEarned:0,loyaltyUsed:0},
  {id:"ORD-0004",customerId:5,customerName:"Taylor Smith",cashierId:3,cashierName:"Jordan Lee",items:[{productId:12,name:"Signed Jersey",qty:1,price:249.99,discount:0}],subtotal:249.99,tax:50.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:5.99,total:305.98,payment:"QR",date:"2024-01-14 14:05",counter:"Counter 1",status:"completed",orderType:"delivery",deliveryAddress:"123 Stadium Road, London",deliveryStatus:"delivered",loyaltyEarned:305,loyaltyUsed:0},
  {id:"ORD-0005",customerId:5,customerName:"Taylor Smith",cashierId:4,cashierName:"Morgan Blake",items:[{productId:2,name:"Away Jersey 2024",qty:2,price:89.99,discount:0},{productId:8,name:"Fan Hoodie",qty:1,price:54.99,discount:0}],subtotal:234.97,tax:47.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:281.97,payment:"Cash",cashGiven:300,cashChange:18.03,date:"2024-01-14 09:30",counter:"Counter 2",status:"completed",orderType:"in-store",loyaltyEarned:281,loyaltyUsed:0},
  {id:"ORD-0006",customerId:6,customerName:"Chris Johnson",cashierId:3,cashierName:"Jordan Lee",items:[{productId:10,name:"Goalkeeper Gloves",qty:1,price:44.99,discount:0},{productId:11,name:"Shin Guards Pro",qty:2,price:29.99,discount:0}],subtotal:104.97,tax:21.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:125.97,payment:"Card",cardLast4:"9999",date:"2024-01-13 11:20",counter:"Counter 1",status:"refunded",orderType:"in-store",loyaltyEarned:0,loyaltyUsed:0},
  {id:"ORD-0007",customerId:5,customerName:"Taylor Smith",cashierId:null,cashierName:"Online",items:[{productId:1,name:"Home Jersey 2024",qty:1,price:89.99,discount:0},{productId:6,name:"Football Scarf",qty:1,price:19.99,discount:0}],subtotal:109.98,tax:22.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:3.99,total:135.97,payment:"Online",date:"2024-01-16 09:10",counter:"Online",status:"preparing",orderType:"delivery",deliveryAddress:"45 King Street, London, E1 7PQ",deliveryZone:"London Zone 1",deliveryStatus:"pending",loyaltyEarned:135,loyaltyUsed:0,trackingStage:1},
  {id:"ORD-0008",customerId:6,customerName:"Chris Johnson",cashierId:null,cashierName:"Online",items:[{productId:7,name:"Team Cap",qty:2,price:24.99,discount:0},{productId:8,name:"Fan Hoodie",qty:1,price:54.99,discount:0}],subtotal:104.97,tax:21.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:125.97,payment:"Online",date:"2024-01-16 11:30",counter:"Online",status:"preparing",orderType:"pickup",loyaltyEarned:125,loyaltyUsed:0,trackingStage:1},
  {id:"ORD-0009",customerId:5,customerName:"Taylor Smith",cashierId:null,cashierName:"Online",items:[{productId:12,name:"Signed Jersey",qty:1,price:249.99,discount:15}],subtotal:212.49,tax:42.50,discountAmt:37.50,loyaltyDiscount:0,deliveryCharge:5.99,total:260.98,payment:"Online",date:"2024-01-16 14:00",counter:"Online",status:"completed",orderType:"delivery",deliveryAddress:"78 Stadium Rd, London EC1A 2BB",deliveryZone:"London Zone 1",deliveryStatus:"delivered",loyaltyEarned:260,loyaltyUsed:0,trackingStage:3},
];

export const INITIAL_RETURNS = [
  {id:"RET-001",orderId:"ORD-0006",customerId:6,customerName:"Chris Johnson",productId:10,productName:"Goalkeeper Gloves",qty:1,reason:"Wrong size",status:"approved",refundAmount:44.99,date:"2024-01-16 09:00",type:"full"},
  {id:"RET-002",orderId:"ORD-0001",customerId:5,customerName:"Taylor Smith",productId:6,productName:"Football Scarf",qty:1,reason:"Damaged item",status:"pending",refundAmount:19.99,date:"2024-01-16 14:30",type:"partial"},
];

export const INITIAL_BANNERS = [
  {id:1,title:"Match Day Special!",subtitle:"20% off all Jerseys today only",cta:"Shop Now",color:"#dc2626",grad:"linear-gradient(135deg,#dc2626,#7f1d1d)",emoji:"⚽",active:true,offerType:"category",offerTarget:"Jerseys",offerDiscount:20,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600"},
  {id:2,title:"New Season Arrivals",subtitle:"2024 kits now in stock",cta:"Explore",color:"#2563eb",grad:"linear-gradient(135deg,#2563eb,#1e3a8a)",emoji:"🆕",active:true,offerType:"none",offerTarget:"",offerDiscount:0,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1600"},
  {id:3,title:"Loyalty Rewards",subtitle:"Earn & redeem points every visit",cta:"Join Now",color:"#16a34a",grad:"linear-gradient(135deg,#16a34a,#14532d)",emoji:"🏆",active:false,offerType:"none",offerTarget:"",offerDiscount:0,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1600"},
  {id:4,title:"Collectibles Sale",subtitle:"15% off signed memorabilia",cta:"Shop",color:"#7c3aed",grad:"linear-gradient(135deg,#7c3aed,#4c1d95)",emoji:"✍️",active:true,offerType:"category",offerTarget:"Collectibles",offerDiscount:15,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/918778/pexels-photo-918778.jpeg?auto=compress&cs=tinysrgb&w=1600"},
];

export const INITIAL_COUPONS = [
  {id:1,code:"FANDAY10",description:"10% off everything",type:"percent",value:10,minOrder:0,maxUses:100,uses:23,active:true,expiry:"2026-12-31"},
  {id:2,code:"WELCOME20",description:"£20 off for new customers",type:"fixed",value:20,minOrder:50,maxUses:50,uses:12,active:true,expiry:"2026-12-31"},
  {id:3,code:"FREESHIP",description:"Free delivery",type:"delivery",value:100,minOrder:30,maxUses:200,uses:67,active:true,expiry:"2026-12-31"},
];

export const INITIAL_COUNTERS = [
  {id:"c1",name:"Counter 1",location:"Main Entrance",active:true},
  {id:"c2",name:"Counter 2",location:"East Wing",active:true},
  {id:"c3",name:"Counter 3",location:"VIP Section",active:false},
];

export const INITIAL_SETTINGS = {
  storeName:"SCSTix EPOS",
  storeAddress:"Venue Address, London, EC1A 1BB",
  storePhone:"020 7946 0800",
  storeEmail:"hello@scstix.com",
  currency:"GBP",sym:"£",
  vatRate:20,
  loyaltyRate:1,loyaltyValue:0.01,
  receiptFooter:"Thank you for your purchase! Come back soon.",
  allowReturns:true,returnDays:30,
  deliveryZones:[
    {zone:"London Zone 1",charge:3.99,days:1},
    {zone:"London Zone 2",charge:5.99,days:2},
    {zone:"UK Nationwide",charge:9.99,days:3},
  ],
  selfServiceEnabled:false,
};

export const INITIAL_PARKED = [];

export const CATEGORIES = ["All","Jerseys","Training Wear","Fan Accessories","Football Equipment","Collectibles"];

export const TIER_CONFIG = {
  Bronze:{min:0,max:499,color:"#cd7f32",bg:"#2a1a0a",label:"Bronze",icon:"🥉"},
  Silver:{min:500,max:1499,color:"#9ca3af",bg:"#1a1f2a",label:"Silver",icon:"🥈"},
  Gold:{min:1500,max:Infinity,color:"#f59e0b",bg:"#2a1e00",label:"Gold",icon:"🥇"},
};

export const getTier = (spent) => {
  if(spent>=1500) return "Gold";
  if(spent>=500) return "Silver";
  return "Bronze";
};

export const fmt = (n,sym="£")=>`${sym}${Number(n||0).toFixed(2)}`;
export const ts = ()=>new Date().toLocaleString("en-GB",{hour12:false}).replace(",","");
export const genId=(p)=>`${p}-${String(Math.floor(Math.random()*9000)+1000)}`;
export const isBannerActive=(b)=>{
  const now=new Date();
  const s=new Date(b.startDate); const e=new Date(b.endDate);
  return b.active && now>=s && now<=e;
};

// ─── NOTIFICATION ────────────────────────────────────────────────────────────
let _notif=null;
export const notify=(msg,type="info",duration=4000)=>_notif&&_notif(msg,type,duration);

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

export const NotificationCenter=({t})=>{
  const [ns,setNs]=useState([]);
  useEffect(()=>{
    _notif=(msg,type,dur=4000)=>{
      const id=Date.now()+Math.random();
      setNs(n=>[{id,msg,type},...n.slice(0,5)]);
      setTimeout(()=>setNs(n=>n.filter(x=>x.id!==id)),dur);
    };
  },[]);
  const cfg={success:[t.green,t.greenBg,t.greenBorder,"✓"],error:[t.red,t.redBg,t.redBorder,"✕"],warning:[t.yellow,t.yellowBg,t.yellowBorder,"⚠"],info:[t.blue,t.blueBg,t.blueBorder,"ℹ"]};
  return(
    <div style={{position:"fixed",top:60,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:320,pointerEvents:"none"}}>
      {ns.map(n=>{const[c,bg,bdr,ic]=cfg[n.type]||cfg.info; return(
        <div key={n.id} style={{background:bg,border:`1px solid ${bdr}`,borderLeft:`4px solid ${c}`,borderRadius:10,padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"slideInRight 0.25s ease",pointerEvents:"auto"}}>
          <span style={{color:c,fontWeight:900,fontSize:13,flexShrink:0}}>{ic}</span>
          <span style={{fontSize:13,color:t.text,fontWeight:500,flex:1,lineHeight:1.4}}>{n.msg}</span>
          <button onClick={()=>setNs(x=>x.filter(i=>i.id!==n.id))} style={{background:"none",border:"none",color:t.text3,cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>✕</button>
        </div>
      );})}
    </div>
  );
};

export { Btn, Input, Select, Toggle, Badge, Card, StatCard, Modal, Table, ProductCard } from '@/components/ui'

export const Sidebar=({user,activeSection,setActiveSection,onLogout,t})=>{
  if (!user) return null;
  const theme=t;
  const navByRole={
    admin:[{key:"dashboard",l:"Dashboard",i:"📊"},{key:"analytics",l:"Analytics",i:"📈"},{key:"customers",l:"Customers",i:"👥"},{key:"users",l:"All Users",i:"🔑"},{key:"staff",l:"Staff Mgmt",i:"👥"},{key:"audit",l:"Audit Logs",i:"📋"},{key:"banners",l:"Banners",i:"🖼️"},{key:"coupons",l:"Coupons",i:"🎟️"},{key:"zreport",l:"Z-Report",i:"📑"},{key:"settings",l:"Settings",i:"⚙️"}],
    manager:[{key:"dashboard",l:"Dashboard",i:"📊"},{key:"staffdash",l:"Staff Dashboard",i:"🖥️"},{key:"pickup",l:"Pickup Orders",i:"📦"},{key:"products",l:"Products",i:"🏷️"},{key:"inventory",l:"Inventory",i:"📦"},{key:"staff",l:"Staff Mgmt",i:"👥"},{key:"cashiers",l:"Cashier Mgmt",i:"🛒"},{key:"counters",l:"Counters",i:"🏪"},{key:"returns",l:"Returns",i:"↩️"},{key:"reports",l:"Reports",i:"📈"}],
    cashier:[{key:"pos",l:"POS Terminal",i:"🛒"},{key:"orders",l:"My Orders",i:"🧾"},{key:"pickup",l:"Pickup Orders",i:"📦"},{key:"hardware",l:"Hardware",i:"🖨️"},{key:"profile",l:"Profile",i:"👤"}],
    staff:[{key:"staffdash",l:"Order Queue",i:"📋"},{key:"pickup",l:"Pickup Verify",i:"📦"},{key:"profile",l:"Profile",i:"👤"}],
    customer:[{key:"shop",l:"Shop",i:"🛍️"},{key:"history",l:"My Orders",i:"📜"},{key:"tracking",l:"Track Orders",i:"📍"},{key:"returns",l:"Returns",i:"↩️"},{key:"profile",l:"Profile",i:"👤"}],
  };
  const role = user.role || "customer";
  const nav = navByRole[role] || [];
  const rc={admin:theme.red,manager:theme.yellow,cashier:theme.green,customer:theme.blue,staff:theme.teal};
  const col=rc[role] || theme.accent;
  const tierC={Bronze:"#cd7f32",Silver:"#9ca3af",Gold:"#f59e0b"};
  return(
    <div style={{width:"100%",height:"100%",background:theme.sidebar,borderRight:`1px solid ${theme.border}`,display:"flex",flexDirection:"column",boxShadow:theme.shadowMd}}>
      <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${theme.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff",flexShrink:0}}>S</div>
          <div><div style={{fontSize:13,fontWeight:900,color:theme.text,letterSpacing:-0.3}}>SCSTix</div><div style={{fontSize:10,color:theme.text4,fontWeight:600}}>EPOS v1.0</div></div>
        </div>
      </div>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${theme.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:38,height:38,background:col+"20",border:`2px solid ${col}50`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:col,flexShrink:0}}>{user.avatar}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:800,color:theme.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:col,textTransform:"capitalize",fontWeight:700}}>{user.role}</div>
          </div>
        </div>
        {user.role==="customer"&&(
          <div style={{marginTop:8,display:"flex",gap:6}}>
            <div style={{flex:1,background:tierC[user.tier]+"20",border:`1px solid ${tierC[user.tier]}40`,borderRadius:7,padding:"4px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:theme.text3,fontWeight:700}}>TIER</div>
              <div style={{fontSize:11,fontWeight:900,color:tierC[user.tier]}}>{user.tier==="Gold"?"🥇":user.tier==="Silver"?"🥈":"🥉"} {user.tier}</div>
            </div>
            <div style={{flex:1,background:theme.yellowBg,border:`1px solid ${theme.yellowBorder}`,borderRadius:7,padding:"4px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:theme.text3,fontWeight:700}}>POINTS</div>
              <div style={{fontSize:11,fontWeight:900,color:theme.yellow}}>⭐{user.loyaltyPoints||0}</div>
            </div>
          </div>
        )}
        {user.counter&&<div style={{marginTop:6,fontSize:10,color:theme.text3,background:theme.bg3,padding:"3px 8px",borderRadius:6,display:"inline-block"}}>📍{user.counter}</div>}
      </div>
      <nav style={{flex:1,padding:"8px 8px",overflowY:"auto"}}>
        {nav.map(item=>(
          <button key={item.key} onClick={()=>setActiveSection(item.key)}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:9,border:activeSection===item.key?`1px solid ${col}35`:"1px solid transparent",background:activeSection===item.key?col+"15":"transparent",color:activeSection===item.key?col:theme.text3,cursor:"pointer",marginBottom:2,textAlign:"left",fontWeight:activeSection===item.key?800:500,fontSize:12,transition:"all 0.12s",fontFamily:"inherit"}}>
            <span style={{fontSize:14}}>{item.i}</span>{item.l}
          </button>
        ))}
      </nav>
      <div style={{padding:"8px 8px",borderTop:`1px solid ${theme.border}`}}>
        <button onClick={()=>setActiveSection("profile")} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:9,border:"none",background:"transparent",color:theme.text3,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit",marginBottom:4}}>
          👤 My Profile
        </button>
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:9,border:"none",background:"transparent",color:theme.red,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};
